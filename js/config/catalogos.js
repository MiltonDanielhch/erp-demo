// ══════════════════════════════════════════════════════════════
// catalogos.js — ERP Contable Bolivia
// Catálogos maestros: Clientes, Proveedores, Productos
// ══════════════════════════════════════════════════════════════

/**
 * Catálogos Maestros del ERP
 *
 * Responsabilidades:
 * - Gestionar la información de referencia (clientes, proveedores, productos)
 * - Validar datos antes de persistir
 * - Mantener consistencia con el resto del sistema
 * - Servir como base para Compras, Ventas e Inventario
 *
 * Arquitectura:
 * - Cada clase usa window.almacenamiento (inyección implícita)
 * - Validaciones bolivianas (NIT módulo 11, régimen tributario)
 * - Eventos para notificar cambios al resto del sistema
 */

// ══════════════════════════════════════════════════════════════
// CONSTANTES Y ENUMS
// ══════════════════════════════════════════════════════════════

const ESTADOS_CATALOGO = {
  ACTIVO: 'ACTIVO',
  INACTIVO: 'INACTIVO',
  BLOQUEADO: 'BLOQUEADO'
};

const REGIMENES_TRIBUTARIOS = {
  REGIMEN_GENERAL: {
    codigo: 'REGIMEN_GENERAL',
    nombre: 'Régimen General',
    descripcion: 'Contribuyentes con ingresos superiores a Bs 385,770 al año',
    abreviatura: 'RG'
  },
  REGIMEN_SIMPLIFICADO: {
    codigo: 'REGIMEN_SIMPLIFICADO',
    nombre: 'Régimen Simplificado (RTS)',
    descripcion: 'Comerciantes minoristas con ingresos menores',
    abreviatura: 'RTS'
  },
  REGIMEN_AGRARIO: {
    codigo: 'REGIMEN_AGRARIO',
    nombre: 'Régimen Agropecuario Unificado (RAU)',
    descripcion: 'Productores agropecuarios',
    abreviatura: 'RAU'
  },
  REGIMEN_TRIBUTARIO_SIMPLIFICADO: {
    codigo: 'REGIMEN_TRIBUTARIO_SIMPLIFICADO',
    nombre: 'Sistema Tributario Integrado (STI)',
    descripcion: 'Empresas integradas',
    abreviatura: 'STI'
  }
};

const CONDICIONES_PAGO = {
  CONTADO: { codigo: 'CONTADO', nombre: 'Contado', dias: 0 },
  CREDITO_15: { codigo: 'CREDITO_15', nombre: 'Crédito 15 días', dias: 15 },
  CREDITO_30: { codigo: 'CREDITO_30', nombre: 'Crédito 30 días', dias: 30 },
  CREDITO_60: { codigo: 'CREDITO_60', nombre: 'Crédito 60 días', dias: 60 },
  CREDITO_90: { codigo: 'CREDITO_90', nombre: 'Crédito 90 días', dias: 90 }
};

const UNIDADES_MEDIDA = {
  UNIDAD: 'UNIDAD',
  KILOGRAMO: 'KILOGRAMO',
  GRAMO: 'GRAMO',
  LITRO: 'LITRO',
  MILILITRO: 'MILILITRO',
  METRO: 'METRO',
  METRO_CUADRADO: 'METRO_CUADRADO',
  CAJA: 'CAJA',
  PAQUETE: 'PAQUETE'
};

const CATEGORIAS_PRODUCTO = {
  TECNOLOGIA: 'TECNOLOGIA',
  ALIMENTOS: 'ALIMENTOS',
  BEBIDAS: 'BEBIDAS',
  LIMPIEZA: 'LIMPIEZA',
  PAPELERIA: 'PAPELERIA',
  ROPA: 'ROPA',
  HERRAMIENTAS: 'HERRAMIENTAS',
  SERVICIOS: 'SERVICIOS',
  OTROS: 'OTROS'
};

// ══════════════════════════════════════════════════════════════
// CLASE BASE (compartida por los 3 catálogos)
// ══════════════════════════════════════════════════════════════

class CatalogoBase {
  constructor(nombreColeccion, nombreSingular) {
    this.nombreColeccion = nombreColeccion;
    this.nombreSingular = nombreSingular;

    if (!window.almacenamiento) {
      throw new Error(`${nombreSingular}: window.almacenamiento no está disponible`);
    }
  }

  /**
   * Genera un ID único.
   * @returns {string}
   */
  _generarId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `${this.nombreSingular}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Dispara un evento del sistema.
   * @param {string} nombreEvento
   * @param {Object} datos
   */
  _dispararEvento(nombreEvento, datos) {
    const evento = new CustomEvent(`erp:${nombreEvento}`, { detail: datos });
    window.dispatchEvent(evento);
  }

  /**
   * Obtiene todos los registros del catálogo.
   * @returns {Array}
   */
  obtenerTodos() {
    return window.almacenamiento.obtener(this.nombreColeccion);
  }

  /**
   * Obtiene un registro por su ID.
   * @param {string} id
   * @returns {Object|null}
   */
  obtenerPorId(id) {
    return window.almacenamiento.obtenerPorId(this.nombreColeccion, id);
  }

  /**
   * Busca registros según un criterio.
   * @param {Function} criterio - Función que devuelve true para registros que coinciden
   * @returns {Array}
   */
  buscar(criterio) {
    return window.almacenamiento.buscar(this.nombreColeccion, criterio);
  }

  /**
   * Cuenta registros en el catálogo.
   * @returns {number}
   */
  contar() {
    return this.obtenerTodos().length;
  }

  /**
   * Lista solo los registros activos.
   * @returns {Array}
   */
  obtenerActivos() {
    return this.buscar(r => r.estado === ESTADOS_CATALOGO.ACTIVO);
  }

  /**
   * Desactiva un registro (soft delete).
   * 
   * En un ERP contable NO se borran datos físicamente.
   * Se marcan como INACTIVOS para mantener trazabilidad y
   * cumplir con requisitos de auditoría del SIN.
   * 
   * El registro sigue en localStorage pero:
   * - No aparece en búsquedas por defecto
   * - No se puede usar en nuevos documentos
   * - Los documentos históricos siguen vinculados
   * 
   * @param {string} id - ID del registro
   * @param {string} motivo - Motivo de la desactivación
   * @returns {Object} { exito, mensaje }
   */
  eliminar(id, motivo = 'Desactivación manual') {
    const registro = this.obtenerPorId(id);
    if (!registro) {
      return { 
        exito: false, 
        mensaje: `${this.nombreSingular} no encontrado: ${id}` 
      };
    }

    if (registro.estado === ESTADOS_CATALOGO.INACTIVO) {
      return { 
        exito: false, 
        mensaje: `${this.nombreSingular} ya está inactivo` 
      };
    }

    // Validaciones específicas por tipo de catálogo
    const validacion = this._validarEliminacion(registro);
    if (!validacion.valido) {
      return { exito: false, mensaje: validacion.mensaje };
    }

    // Soft delete: marcar como INACTIVO
    const actualizado = window.almacenamiento.actualizar(
      this.nombreColeccion, 
      id, 
      {
        ...registro,
        estado: ESTADOS_CATALOGO.INACTIVO,
        fechaDesactivacion: new Date().toISOString(),
        motivoDesactivacion: motivo,
        actualizadoEn: new Date().toISOString()
      }
    );

    if (actualizado) {
      this._dispararEvento(
        `${this.nombreSingular.toLowerCase()}-desactivado`, 
        { id, motivo }
      );
      console.log(`🚫 ${this.nombreSingular} desactivado (soft delete): ${id}`);
      return { 
        exito: true, 
        mensaje: `${this.nombreSingular} desactivado correctamente` 
      };
    }

    return { exito: false, mensaje: 'Error al desactivar' };
  }

  /**
   * Elimina físicamente un registro (hard delete).
   * 
   * ⚠️ ADVERTENCIA: Solo usar en casos excepcionales (ej: datos de prueba).
   * En un ERP en producción, esto rompe la trazabilidad y puede
   * generar problemas en auditorías del SIN.
   * 
   * @param {string} id
   * @returns {Object}
   */
  eliminarDefinitivamente(id) {
    const registro = this.obtenerPorId(id);
    if (!registro) {
      return { exito: false, mensaje: `${this.nombreSingular} no encontrado: ${id}` };
    }

    const eliminado = window.almacenamiento.eliminar(this.nombreColeccion, id);
    if (eliminado) {
      this._dispararEvento(
        `${this.nombreSingular.toLowerCase()}-eliminado-definitivamente`, 
        { id }
      );
      console.log(`🗑️ ${this.nombreSingular} ELIMINADO DEFINITIVAMENTE: ${id}`);
      return { exito: true, mensaje: `${this.nombreSingular} eliminado del sistema` };
    }

    return { exito: false, mensaje: 'Error al eliminar definitivamente' };
  }

  /**
   * Reactiva un registro previamente desactivado.
   * @param {string} id
   * @returns {Object}
   */
  reactivar(id) {
    const registro = this.obtenerPorId(id);
    if (!registro) {
      return { exito: false, mensaje: `${this.nombreSingular} no encontrado: ${id}` };
    }

    if (registro.estado === ESTADOS_CATALOGO.ACTIVO) {
      return { exito: false, mensaje: `${this.nombreSingular} ya está activo` };
    }

    const actualizado = window.almacenamiento.actualizar(
      this.nombreColeccion,
      id,
      {
        ...registro,
        estado: ESTADOS_CATALOGO.ACTIVO,
        fechaReactivacion: new Date().toISOString(),
        actualizadoEn: new Date().toISOString()
      }
    );

    if (actualizado) {
      this._dispararEvento(
        `${this.nombreSingular.toLowerCase()}-reactivado`,
        { id }
      );
      console.log(`✅ ${this.nombreSingular} reactivado: ${id}`);
      return { exito: true, mensaje: `${this.nombreSingular} reactivado correctamente` };
    }

    return { exito: false, mensaje: 'Error al reactivar' };
  }

  /**
   * Lista todos los registros incluyendo los inactivos.
   * Por defecto, `obtenerTodos()` ya devuelve todos, pero este
   * método es explícito sobre la intención.
   * @returns {Array}
   */
  obtenerTodosIncluyendoInactivos() {
    return this.obtenerTodos();
  }

  /**
   * Lista solo los registros inactivos.
   * @returns {Array}
   */
  obtenerInactivos() {
    return this.buscar(r => r.estado === ESTADOS_CATALOGO.INACTIVO);
  }

  /**
   * Validación específica antes de eliminar (soft delete).
   * Las clases hijas pueden sobrescribir este método.
   * @param {Object} registro
   * @returns {Object} { valido, mensaje }
   * @protected
   */
  _validarEliminacion(registro) {
    return { valido: true, mensaje: '' };
  }
}

// ══════════════════════════════════════════════════════════════
// CLASE: CATÁLOGO DE CLIENTES
// ══════════════════════════════════════════════════════════════

/**
 * Gestiona el catálogo de clientes.
 * Los clientes son las empresas/personas a las que les vendemos.
 */
class CatalogoClientes extends CatalogoBase {
  constructor() {
    super('clientes', 'Cliente');
  }

  /**
   * Registra un nuevo cliente.
   * @param {Object} datos
   * @returns {Object} { exito, mensaje, cliente, errores }
   */
  registrar(datos) {
    console.log('👤 Registrando cliente:', datos.razonSocial);

    // Validaciones
    const validacion = this._validarDatos(datos);
    if (!validacion.valido) {
      return {
        exito: false,
        mensaje: 'Datos inválidos',
        cliente: null,
        errores: validacion.errores
      };
    }

    // Verificar que el NIT no esté duplicado
    if (datos.nit) {
      const existente = this.buscarPorNIT(datos.nit);
      if (existente) {
        return {
          exito: false,
          mensaje: `Ya existe un cliente con NIT ${datos.nit}: ${existente.razonSocial}`,
          cliente: null,
          errores: [`NIT duplicado: ${datos.nit}`]
        };
      }
    }

    // Construir cliente
    const cliente = {
      id: this._generarId(),
      nit: datos.nit || null,
      razonSocial: datos.razonSocial.trim(),
      telefono: datos.telefono || '',
      email: datos.email || '',
      direccion: datos.direccion || '',
      limiteCredito: parseFloat(datos.limiteCredito) || 0,
      saldoActual: 0,
      estado: datos.estado || ESTADOS_CATALOGO.ACTIVO,
      regimenTributario: datos.regimenTributario || 'REGIMEN_GENERAL',
      observaciones: datos.observaciones || '',
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString()
    };

    const guardado = window.almacenamiento.guardar(this.nombreColeccion, cliente);
    if (!guardado) {
      return { exito: false, mensaje: 'Error al guardar', cliente: null, errores: [] };
    }

    this._dispararEvento('cliente-registrado', cliente);
    console.log(`✅ Cliente registrado: ${cliente.id} — ${cliente.razonSocial}`);

    return {
      exito: true,
      mensaje: 'Cliente registrado exitosamente',
      cliente: guardado,
      errores: []
    };
  }

  /**
   * Actualiza un cliente existente.
   * @param {string} id
   * @param {Object} cambios
   * @returns {Object} { exito, mensaje, cliente, errores }
   */
  actualizar(id, cambios) {
    const cliente = this.obtenerPorId(id);
    if (!cliente) {
      return { exito: false, mensaje: `Cliente no encontrado: ${id}`, cliente: null, errores: [] };
    }

    // Si cambia el NIT, verificar que no esté duplicado
    if (cambios.nit && cambios.nit !== cliente.nit) {
      const existente = this.buscarPorNIT(cambios.nit);
      if (existente && existente.id !== id) {
        return {
          exito: false,
          mensaje: `Ya existe un cliente con NIT ${cambios.nit}`,
          cliente: null,
          errores: [`NIT duplicado: ${cambios.nit}`]
        };
      }
    }

    const clienteActualizado = {
      ...cliente,
      ...cambios,
      actualizadoEn: new Date().toISOString()
    };

    const actualizado = window.almacenamiento.actualizar(this.nombreColeccion, id, clienteActualizado);
    if (!actualizado) {
      return { exito: false, mensaje: 'Error al actualizar', cliente: null, errores: [] };
    }

    this._dispararEvento('cliente-actualizado', clienteActualizado);
    console.log(`✏️ Cliente actualizado: ${id}`);

    return { exito: true, mensaje: 'Cliente actualizado', cliente: clienteActualizado, errores: [] };
  }

  /**
   * Actualiza el saldo del cliente (cuando compra o paga).
   * @param {string} id
   * @param {number} delta - Monto a sumar (positivo = debe más, negativo = pagó)
   * @returns {Object}
   */
  actualizarSaldo(id, delta) {
    const cliente = this.obtenerPorId(id);
    if (!cliente) {
      return { exito: false, mensaje: `Cliente no encontrado: ${id}` };
    }

    const nuevoSaldo = (cliente.saldoActual || 0) + delta;

    // Validar que no exceda el límite de crédito
    if (nuevoSaldo > cliente.limiteCredito && cliente.limiteCredito > 0) {
      return {
        exito: false,
        mensaje: `El cliente excedería su límite de crédito. ` +
                 `Saldo: ${cliente.saldoActual}, ` +
                 `Operación: ${delta}, ` +
                 `Nuevo saldo: ${nuevoSaldo}, ` +
                 `Límite: ${cliente.limiteCredito}`
      };
    }

    // No permitir saldo negativo
    if (nuevoSaldo < 0) {
      return {
        exito: false,
        mensaje: `El saldo no puede ser negativo. Saldo actual: ${cliente.saldoActual}, Pago: ${Math.abs(delta)}`
      };
    }

    return this.actualizar(id, { saldoActual: nuevoSaldo });
  }

  /**
   * Busca un cliente por su NIT.
   * @param {string} nit
   * @returns {Object|null}
   */
  buscarPorNIT(nit) {
    const limpio = nit.replace(/[-\s.]/g, '');
    const resultados = this.buscar(c => {
      if (!c.nit) return false;
      if (c.estado === ESTADOS_CATALOGO.INACTIVO) return false;
      return c.nit.replace(/[-\s.]/g, '') === limpio;
    });
    return resultados.length > 0 ? resultados[0] : null;
  }

  /**
   * Busca clientes por razón social (búsqueda parcial).
   * @param {string} texto
   * @returns {Array}
   */
  buscarPorNombre(texto) {
    const busqueda = texto.toLowerCase().trim();
    return this.buscar(c =>
      c.estado !== ESTADOS_CATALOGO.INACTIVO &&
      c.razonSocial.toLowerCase().includes(busqueda)
    );
  }

  /**
   * Valida los datos de un cliente.
   * @param {Object} datos
   * @returns {Object} { valido, errores }
   * @private
   */
  _validarDatos(datos) {
    const errores = [];

    if (!datos.razonSocial || datos.razonSocial.trim().length === 0) {
      errores.push('La razón social es requerida');
    }

    if (datos.nit) {
      const validacionNIT = window.validadores.validarNIT(datos.nit);
      if (!validacionNIT.valido) {
        errores.push(...validacionNIT.errores);
      }
    }

    if (datos.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
      errores.push('Email inválido');
    }

    if (datos.limiteCredito && parseFloat(datos.limiteCredito) < 0) {
      errores.push('El límite de crédito no puede ser negativo');
    }

    return { valido: errores.length === 0, errores };
  }

  /**
   * Valida que no se pueda desactivar un cliente con saldo pendiente.
   * @override
   */
  _validarEliminacion(cliente) {
    if (cliente.saldoActual && cliente.saldoActual > 0) {
      return {
        valido: false,
        mensaje: `No se puede desactivar el cliente: tiene saldo pendiente de Bs ${cliente.saldoActual}`
      };
    }
    return { valido: true, mensaje: '' };
  }
}

// ══════════════════════════════════════════════════════════════
// CLASE: CATÁLOGO DE PROVEEDORES
// ══════════════════════════════════════════════════════════════

/**
 * Gestiona el catálogo de proveedores.
 * Los proveedores son las empresas/personas a las que les compramos.
 */
class CatalogoProveedores extends CatalogoBase {
  constructor() {
    super('proveedores', 'Proveedor');
  }

  /**
   * Registra un nuevo proveedor.
   * @param {Object} datos
   * @returns {Object} { exito, mensaje, proveedor, errores }
   */
  registrar(datos) {
    console.log('🏭 Registrando proveedor:', datos.razonSocial);

    const validacion = this._validarDatos(datos);
    if (!validacion.valido) {
      return {
        exito: false,
        mensaje: 'Datos inválidos',
        proveedor: null,
        errores: validacion.errores
      };
    }

    // Verificar NIT duplicado
    if (datos.nit) {
      const existente = this.buscarPorNIT(datos.nit);
      if (existente) {
        return {
          exito: false,
          mensaje: `Ya existe un proveedor con NIT ${datos.nit}: ${existente.razonSocial}`,
          proveedor: null,
          errores: [`NIT duplicado: ${datos.nit}`]
        };
      }
    }

    const proveedor = {
      id: this._generarId(),
      nit: datos.nit || null,
      razonSocial: datos.razonSocial.trim(),
      telefono: datos.telefono || '',
      email: datos.email || '',
      direccion: datos.direccion || '',
      contacto: datos.contacto || '',
      condicionesPago: datos.condicionesPago || 'CONTADO',
      saldoPorPagar: 0,
      estado: datos.estado || ESTADOS_CATALOGO.ACTIVO,
      regimenTributario: datos.regimenTributario || 'REGIMEN_GENERAL',
      esAgenteRetencion: datos.esAgenteRetencion === true,
      observaciones: datos.observaciones || '',
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString()
    };

    const guardado = window.almacenamiento.guardar(this.nombreColeccion, proveedor);
    if (!guardado) {
      return { exito: false, mensaje: 'Error al guardar', proveedor: null, errores: [] };
    }

    this._dispararEvento('proveedor-registrado', proveedor);
    console.log(`✅ Proveedor registrado: ${proveedor.id} — ${proveedor.razonSocial}`);

    return {
      exito: true,
      mensaje: 'Proveedor registrado exitosamente',
      proveedor: guardado,
      errores: []
    };
  }

  /**
   * Actualiza un proveedor existente.
   * @param {string} id
   * @param {Object} cambios
   * @returns {Object}
   */
  actualizar(id, cambios) {
    const proveedor = this.obtenerPorId(id);
    if (!proveedor) {
      return { exito: false, mensaje: `Proveedor no encontrado: ${id}`, proveedor: null, errores: [] };
    }

    if (cambios.nit && cambios.nit !== proveedor.nit) {
      const existente = this.buscarPorNIT(cambios.nit);
      if (existente && existente.id !== id) {
        return {
          exito: false,
          mensaje: `Ya existe un proveedor con NIT ${cambios.nit}`,
          proveedor: null,
          errores: [`NIT duplicado: ${cambios.nit}`]
        };
      }
    }

    const proveedorActualizado = {
      ...proveedor,
      ...cambios,
      actualizadoEn: new Date().toISOString()
    };

    const actualizado = window.almacenamiento.actualizar(this.nombreColeccion, id, proveedorActualizado);
    if (!actualizado) {
      return { exito: false, mensaje: 'Error al actualizar', proveedor: null, errores: [] };
    }

    this._dispararEvento('proveedor-actualizado', proveedorActualizado);
    console.log(`✏️ Proveedor actualizado: ${id}`);

    return { exito: true, mensaje: 'Proveedor actualizado', proveedor: proveedorActualizado, errores: [] };
  }

  /**
   * Actualiza el saldo por pagar al proveedor.
   * @param {string} id
   * @param {number} delta - Positivo = debemos más, negativo = pagamos
   * @returns {Object}
   */
  actualizarSaldo(id, delta) {
    const proveedor = this.obtenerPorId(id);
    if (!proveedor) {
      return { exito: false, mensaje: `Proveedor no encontrado: ${id}` };
    }

    const nuevoSaldo = (proveedor.saldoPorPagar || 0) + delta;

    if (nuevoSaldo < 0) {
      return {
        exito: false,
        mensaje: `El saldo no puede ser negativo. Saldo actual: ${proveedor.saldoPorPagar}, Pago: ${Math.abs(delta)}`
      };
    }

    return this.actualizar(id, { saldoPorPagar: nuevoSaldo });
  }

  /**
   * Busca un proveedor por su NIT.
   * @param {string} nit
   * @returns {Object|null}
   */
  buscarPorNIT(nit) {
    const limpio = nit.replace(/[-\s.]/g, '');
    const resultados = this.buscar(p => {
      if (!p.nit) return false;
      if (p.estado === ESTADOS_CATALOGO.INACTIVO) return false;
      return p.nit.replace(/[-\s.]/g, '') === limpio;
    });
    return resultados.length > 0 ? resultados[0] : null;
  }

  /**
   * Busca proveedores por razón social.
   * @param {string} texto
   * @returns {Array}
   */
  buscarPorNombre(texto) {
    const busqueda = texto.toLowerCase().trim();
    return this.buscar(p =>
      p.estado !== ESTADOS_CATALOGO.INACTIVO &&
      p.razonSocial.toLowerCase().includes(busqueda)
    );
  }

  /**
   * Lista proveedores que son agentes de retención.
   * @returns {Array}
   */
  obtenerAgentesRetencion() {
    return this.buscar(p => p.esAgenteRetencion === true);
  }

  /**
   * Valida datos del proveedor.
   * @param {Object} datos
   * @returns {Object} { valido, errores }
   * @private
   */
  _validarDatos(datos) {
    const errores = [];

    if (!datos.razonSocial || datos.razonSocial.trim().length === 0) {
      errores.push('La razón social es requerida');
    }

    if (datos.nit) {
      const validacionNIT = window.validadores.validarNIT(datos.nit);
      if (!validacionNIT.valido) {
        errores.push(...validacionNIT.errores);
      }
    }

    if (datos.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
      errores.push('Email inválido');
    }

    if (datos.condicionesPago && !CONDICIONES_PAGO[datos.condicionesPago]) {
      errores.push(`Condición de pago inválida: ${datos.condicionesPago}`);
    }

    return { valido: errores.length === 0, errores };
  }

  /**
   * Valida que no se pueda desactivar un proveedor con deudas pendientes.
   * @override
   */
  _validarEliminacion(proveedor) {
    if (proveedor.saldoPorPagar && proveedor.saldoPorPagar > 0) {
      return {
        valido: false,
        mensaje: `No se puede desactivar el proveedor: hay Bs ${proveedor.saldoPorPagar} pendientes de pago`
      };
    }
    return { valido: true, mensaje: '' };
  }
}

// ══════════════════════════════════════════════════════════════
// CLASE: CATÁLOGO DE PRODUCTOS
// ══════════════════════════════════════════════════════════════

/**
 * Gestiona el catálogo de productos.
 * Los productos son la mercadería que compramos y vendemos.
 */
class CatalogoProductos extends CatalogoBase {
  constructor() {
    super('productos', 'Producto');
  }

  /**
   * Registra un nuevo producto.
   * @param {Object} datos
   * @returns {Object} { exito, mensaje, producto, errores }
   */
  registrar(datos) {
    console.log('📦 Registrando producto:', datos.nombre);

    const validacion = this._validarDatos(datos);
    if (!validacion.valido) {
      return {
        exito: false,
        mensaje: 'Datos inválidos',
        producto: null,
        errores: validacion.errores
      };
    }

    // Verificar código duplicado
    if (datos.codigo) {
      const existente = this.buscarPorCodigo(datos.codigo);
      if (existente) {
        return {
          exito: false,
          mensaje: `Ya existe un producto con código ${datos.codigo}: ${existente.nombre}`,
          producto: null,
          errores: [`Código duplicado: ${datos.codigo}`]
        };
      }
    }

    const producto = {
      id: this._generarId(),
      codigo: (datos.codigo || '').trim().toUpperCase(),
      nombre: datos.nombre.trim(),
      descripcion: datos.descripcion || '',
      categoria: datos.categoria || 'OTROS',
      unidadMedida: datos.unidadMedida || 'UNIDAD',
      precioVenta: parseFloat(datos.precioVenta) || 0,
      costoUltimo: parseFloat(datos.costoUltimo) || 0,
      stockActual: parseInt(datos.stockActual, 10) || 0,
      stockMinimo: parseInt(datos.stockMinimo, 10) || 0,
      almacen: datos.almacen || 'ALMACEN_CENTRAL',
      activo: datos.activo !== false,
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString()
    };

    const guardado = window.almacenamiento.guardar(this.nombreColeccion, producto);
    if (!guardado) {
      return { exito: false, mensaje: 'Error al guardar', producto: null, errores: [] };
    }

    this._dispararEvento('producto-registrado', producto);
    console.log(`✅ Producto registrado: ${producto.id} — ${producto.nombre}`);

    return {
      exito: true,
      mensaje: 'Producto registrado exitosamente',
      producto: guardado,
      errores: []
    };
  }

  /**
   * Actualiza un producto existente.
   * @param {string} id
   * @param {Object} cambios
   * @returns {Object}
   */
  actualizar(id, cambios) {
    const producto = this.obtenerPorId(id);
    if (!producto) {
      return { exito: false, mensaje: `Producto no encontrado: ${id}`, producto: null, errores: [] };
    }

    if (cambios.codigo && cambios.codigo !== producto.codigo) {
      const existente = this.buscarPorCodigo(cambios.codigo);
      if (existente && existente.id !== id) {
        return {
          exito: false,
          mensaje: `Ya existe un producto con código ${cambios.codigo}`,
          producto: null,
          errores: [`Código duplicado: ${cambios.codigo}`]
        };
      }
    }

    const productoActualizado = {
      ...producto,
      ...cambios,
      actualizadoEn: new Date().toISOString()
    };

    const actualizado = window.almacenamiento.actualizar(this.nombreColeccion, id, productoActualizado);
    if (!actualizado) {
      return { exito: false, mensaje: 'Error al actualizar', producto: null, errores: [] };
    }

    this._dispararEvento('producto-actualizado', productoActualizado);
    console.log(`✏️ Producto actualizado: ${id}`);

    return { exito: true, mensaje: 'Producto actualizado', producto: productoActualizado, errores: [] };
  }

  /**
   * Actualiza el stock del producto.
   * @param {string} id
   * @param {number} delta - Positivo = entrada, negativo = salida
   * @param {string} motivo - Motivo del movimiento
   * @returns {Object}
   */
  actualizarStock(id, delta, motivo = '') {
    const producto = this.obtenerPorId(id);
    if (!producto) {
      return { exito: false, mensaje: `Producto no encontrado: ${id}` };
    }

    const nuevoStock = (producto.stockActual || 0) + delta;

    if (nuevoStock < 0) {
      return {
        exito: false,
        mensaje: `Stock insuficiente. Stock actual: ${producto.stockActual}, Salida solicitada: ${Math.abs(delta)}`
      };
    }

    const cambios = { stockActual: nuevoStock };

    // Si es una compra (entrada con costo), actualizar costo último
    if (delta > 0 && motivo === 'COMPRA') {
      // El costo se pasa como parámetro adicional si se quiere actualizar
    }

    const resultado = this.actualizar(id, cambios);

    if (resultado.exito) {
      this._dispararEvento('producto-stock-actualizado', {
        productoId: id,
        delta,
        stockAnterior: producto.stockActual,
        stockNuevo: nuevoStock,
        motivo
      });

      // Alerta de stock mínimo
      if (nuevoStock <= producto.stockMinimo) {
        console.warn(`⚠️ Stock bajo: ${producto.nombre} tiene ${nuevoStock} unidades (mínimo: ${producto.stockMinimo})`);
      }
    }

    return resultado;
  }

  /**
   * Actualiza el costo último del producto (después de una compra).
   * @param {string} id
   * @param {number} nuevoCosto
   * @returns {Object}
   */
  actualizarCostoUltimo(id, nuevoCosto) {
    if (nuevoCosto < 0) {
      return { exito: false, mensaje: 'El costo no puede ser negativo' };
    }
    return this.actualizar(id, { costoUltimo: parseFloat(nuevoCosto) });
  }

  /**
   * Busca un producto por su código.
   * @param {string} codigo
   * @returns {Object|null}
   */
  buscarPorCodigo(codigo) {
    const busqueda = codigo.trim().toUpperCase();
    const resultados = this.buscar(p =>
      p.estado !== ESTADOS_CATALOGO.INACTIVO &&
      p.codigo && p.codigo.toUpperCase() === busqueda
    );
    return resultados.length > 0 ? resultados[0] : null;
  }

  /**
   * Busca productos por nombre (búsqueda parcial).
   * @param {string} texto
   * @returns {Array}
   */
  buscarPorNombre(texto) {
    const busqueda = texto.toLowerCase().trim();
    return this.buscar(p =>
      p.estado !== ESTADOS_CATALOGO.INACTIVO &&
      (p.nombre.toLowerCase().includes(busqueda) ||
       (p.descripcion && p.descripcion.toLowerCase().includes(busqueda)))
    );
  }

  /**
   * Lista productos con stock bajo (por debajo del mínimo).
   * @returns {Array}
   */
  obtenerStockBajo() {
    return this.buscar(p =>
      p.stockActual <= p.stockMinimo && p.activo
    );
  }

  /**
   * Lista productos sin stock (stockActual = 0).
   * @returns {Array}
   */
  obtenerSinStock() {
    return this.buscar(p => p.stockActual === 0 && p.activo);
  }

  /**
   * Valida que haya stock suficiente para una venta.
   * @param {string} id
   * @param {number} cantidad
   * @returns {Object} { suficiente, stockActual, faltante }
   */
  validarStockSuficiente(id, cantidad) {
    const producto = this.obtenerPorId(id);
    if (!producto) {
      return { suficiente: false, mensaje: 'Producto no encontrado', stockActual: 0, faltante: cantidad };
    }

    const suficiente = producto.stockActual >= cantidad;
    return {
      suficiente,
      stockActual: producto.stockActual,
      faltante: suficiente ? 0 : cantidad - producto.stockActual,
      mensaje: suficiente
        ? 'Stock suficiente'
        : `Stock insuficiente: hay ${producto.stockActual}, se requieren ${cantidad}`
    };
  }

  /**
   * Obtiene el valor total del inventario (stock × costo).
   * @returns {number}
   */
  obtenerValorInventario() {
    return this.obtenerTodos()
      .filter(p => p.activo)
      .reduce((total, p) => total + (p.stockActual * p.costoUltimo), 0);
  }

  /**
   * Valida datos del producto.
   * @param {Object} datos
   * @returns {Object} { valido, errores }
   * @private
   */
  _validarDatos(datos) {
    const errores = [];

    if (!datos.nombre || datos.nombre.trim().length === 0) {
      errores.push('El nombre del producto es requerido');
    }

    if (datos.codigo && datos.codigo.trim().length === 0) {
      errores.push('El código no puede estar vacío si se proporciona');
    }

    if (datos.precioVenta !== undefined && parseFloat(datos.precioVenta) < 0) {
      errores.push('El precio de venta no puede ser negativo');
    }

    if (datos.costoUltimo !== undefined && parseFloat(datos.costoUltimo) < 0) {
      errores.push('El costo no puede ser negativo');
    }

    if (datos.stockActual !== undefined && parseInt(datos.stockActual, 10) < 0) {
      errores.push('El stock no puede ser negativo');
    }

    if (datos.stockMinimo !== undefined && parseInt(datos.stockMinimo, 10) < 0) {
      errores.push('El stock mínimo no puede ser negativo');
    }

    if (datos.unidadMedida && !UNIDADES_MEDIDA[datos.unidadMedida]) {
      errores.push(`Unidad de medida inválida: ${datos.unidadMedida}`);
    }

    return { valido: errores.length === 0, errores };
  }

  /**
   * Valida que no se pueda desactivar un producto con stock positivo.
   * @override
   */
  _validarEliminacion(producto) {
    if (producto.stockActual && producto.stockActual > 0) {
      return {
        valido: false,
        mensaje: `No se puede desactivar el producto: tiene ${producto.stockActual} unidades en stock. Debe agotarse el inventario primero.`
      };
    }
    return { valido: true, mensaje: '' };
  }
}
