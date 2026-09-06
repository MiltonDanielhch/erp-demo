// ══════════════════════════════════════════════════════════════
// capa1-documentos.js — ERP Contable Bolivia
// Capa 1: Documentos Fuente (Registro y Validación)
// ══════════════════════════════════════════════════════════════

/**
 * Capa 1: Documentos Fuente
 *
 * Responsabilidades:
 * - Recibir documentos fuente de los usuarios
 * - Validar que cumplan con los requisitos legales bolivianos
 * - Persistir documentos válidos en localStorage
 * - Gestionar estados del documento (PENDIENTE → VALIDADO → PROCESADO)
 * - Proporcionar consultas y filtros
 *
 * Esta capa es el "portero" del ERP. Si un documento no pasa
 * por aquí validado, no puede generar asientos contables.
 *
 * @class CapaDocumentos
 */
class CapaDocumentos {

  /**
   * Constructor de la Capa 1.
   *
   * @param {Object} almacenamiento - Instancia de AlmacenamientoLocal
   *   Se pasa como parámetro (inyección de dependencias) en lugar de
   *   buscar window.almacenamiento, para evitar problemas de orden
   *   de inicialización.
   */
  constructor(almacenamiento) {
    if (!almacenamiento) {
      throw new Error('CapaDocumentos requiere una instancia de AlmacenamientoLocal');
    }

    this.almacenamiento = almacenamiento;
    this.nombreColeccion = 'documentos';

    console.log('📄 Capa 1 (Documentos Fuente) inicializada.');
  }

  // ════════════════════════════════════════════════════════════
  // REGISTRO DE DOCUMENTOS
  // ════════════════════════════════════════════════════════════

  /**
   * Registra un nuevo documento fuente en el sistema.
   *
   * Flujo:
   * 1. Validar campos requeridos
   * 2. Validar reglas de negocio (NIT, CUF, fechas, duplicados)
   * 3. Calcular campos automáticos (período contable, IVA, IT)
   * 4. Asignar estado PENDIENTE
   * 5. Guardar en localStorage
   *
   * @param {Object} datos - Datos del documento
   * @returns {Object} { exito: boolean, mensaje: string, documento: object, errores: array }
   */
  registrarDocumento(datos) {
    console.log('📄 Registrando documento:', datos.tipo, datos.numero);

    try {
      // 1. Validar que el tipo de documento exista
      if (!TiposDocumentoUtilidades.tipoExiste(datos.tipo)) {
        return {
          exito: false,
          mensaje: `Tipo de documento inválido: ${datos.tipo}`,
          documento: null,
          errores: ['Tipo de documento no reconocido']
        };
      }

      // 2. Validar campos requeridos
      const validacionCampos = CamposDocumentoUtilidades.validarCamposRequeridos(datos.tipo, datos);
      if (!validacionCampos.valido) {
        return {
          exito: false,
          mensaje: 'Faltan campos requeridos',
          documento: null,
          errores: validacionCampos.errores
        };
      }

      // 3. Validar reglas de negocio
      const validacionNegocio = this.validarDocumento(datos);
      if (!validacionNegocio.valido) {
        return {
          exito: false,
          mensaje: 'Documento no cumple reglas de negocio',
          documento: null,
          errores: validacionNegocio.errores
        };
      }

      // 4. Preparar documento con campos automáticos
      const documento = this._prepararDocumento(datos);

      // 5. Guardar en localStorage
      const documentoGuardado = this.almacenamiento.guardar(this.nombreColeccion, documento);

      if (!documentoGuardado) {
        return {
          exito: false,
          mensaje: 'Error al guardar el documento',
          documento: null,
          errores: ['No se pudo persistir el documento']
        };
      }

      // 6. Disparar evento de documento registrado
      this._dispararEvento('documento-registrado', documentoGuardado);

      console.log('✅ Documento registrado:', documentoGuardado.id);

      return {
        exito: true,
        mensaje: 'Documento registrado exitosamente',
        documento: documentoGuardado,
        errores: []
      };

    } catch (error) {
      console.error('❌ Error al registrar documento:', error);
      return {
        exito: false,
        mensaje: `Error inesperado: ${error.message}`,
        documento: null,
        errores: [error.message]
      };
    }
  }

  /**
   * Prepara el documento con campos automáticos.
   * @param {Object} datos - Datos originales del documento
   * @returns {Object} Documento completo con campos calculados
   * @private
   */
  _prepararDocumento(datos) {
    const documento = { ...datos };

    // Generar ID único
    if (!documento.id) {
      documento.id = this._generarId();
    }

    // Asignar estado inicial
    documento.estado = ESTADOS_DOCUMENTO.PENDIENTE.codigo;

    // Calcular período contable desde fechaEmision
    if (documento.fechaEmision) {
      documento.periodoContable = Utilidades.obtenerPeriodoContable(documento.fechaEmision);
    }

    // Timestamps de auditoría
    documento.fechaRegistro = new Date().toISOString();
    documento.creadoEn = new Date().toISOString();
    documento.creadoPor = 'sistema'; // TODO: obtener del usuario autenticado

    // Calcular campos automáticos según el tipo
    this._calcularCamposAutomaticos(documento);

    // Historial de cambios
    documento.historial = [
      {
        fecha: new Date().toISOString(),
        estadoAnterior: null,
        estadoNuevo: ESTADOS_DOCUMENTO.PENDIENTE.codigo,
        usuario: 'sistema',
        motivo: 'Registro inicial'
      }
    ];

    return documento;
  }

  /**
   * Calcula campos automáticos según el tipo de documento.
   * @param {Object} documento - Documento a completar
   * @private
   */
  _calcularCamposAutomaticos(documento) {
    const tipo = documento.tipo;

    // Facturas (compra y venta): calcular IVA
    if (tipo === 'FACTURA_COMPRA' || tipo === 'FACTURA_VENTA' ||
        tipo === 'NOTA_CREDITO_RECIBIDA' || tipo === 'NOTA_DEBITO_RECIBIDA' ||
        tipo === 'NOTA_CREDITO_EMITIDA' || tipo === 'NOTA_DEBITO_EMITIDA' ||
        tipo === 'FACTURA_GASTOS_PERSONALES') {

      if (documento.montoTotal && !documento.montoNeto) {
        documento.montoNeto = Utilidades.extraerNetoDeTotal(documento.montoTotal);
      }
      if (documento.montoTotal && !documento.montoIVA) {
        documento.montoIVA = Utilidades.calcularIVADeTotal(documento.montoTotal);
      }
    }

    // Facturas de venta: calcular IT
    if (tipo === 'FACTURA_VENTA' || tipo === 'NOTA_CREDITO_EMITIDA' || tipo === 'NOTA_DEBITO_EMITIDA') {
      if (documento.montoTotal && !documento.montoIT) {
        documento.montoIT = Utilidades.calcularIT(documento.montoTotal);
      }
    }

    // Comprobante de retención: calcular monto retenido
    if (tipo === 'COMPROBANTE_RETENCION') {
      if (documento.baseImponible && documento.porcentajeRetencion && !documento.montoRetenido) {
        documento.montoRetenido = Utilidades.redondear(
          documento.baseImponible * (documento.porcentajeRetencion / 100)
        );
      }
    }

    // Acta de activo fijo: calcular depreciación mensual
    if (tipo === 'ACTA_COMPRA_ACTIVO') {
      if (documento.montoTotal && documento.vidaUtilMeses && !documento.depreciacionMensual) {
        const valorResidual = documento.valorResidual || 0;
        documento.depreciacionMensual = Utilidades.redondear(
          (documento.montoTotal - valorResidual) / documento.vidaUtilMeses
        );
      }
    }
  }

  // ════════════════════════════════════════════════════════════
  // VALIDACIONES
  // ════════════════════════════════════════════════════════════

  /**
   * Valida un documento contra reglas de negocio.
   * @param {Object} datos - Datos del documento
   * @returns {Object} { valido: boolean, errores: array }
   */
  validarDocumento(datos) {
    const errores = [];
    const tipo = datos.tipo;
    const configTipo = TiposDocumentoUtilidades.obtenerTipo(tipo);

    // Validación 1: NIT (si el tipo lo requiere)
    if (configTipo.requiereNIT) {
      const nit = datos.nitProveedor || datos.nitCliente || datos.nitRecibidoDe || datos.nitPagadoA;
      if (nit) {
        const validacionNIT = Validadores.validarNIT(nit);
        if (!validacionNIT.valido) {
          errores.push(...validacionNIT.errores);
        }
      }
    }

    // Validación 2: CUF (si el tipo lo requiere)
    if (configTipo.requiereCUF && datos.cuf) {
      const validacionCUF = Validadores.validarCUF(datos.cuf);
      if (!validacionCUF.valido) {
        errores.push(...validacionCUF.errores);
      }

      // Validar que el CUF no esté duplicado
      if (validacionCUF.valido) {
        const duplicado = this._buscarPorCUF(datos.cuf);
        if (duplicado) {
          errores.push(`CUF duplicado: ya existe un documento con CUF ${datos.cuf} (ID: ${duplicado.id})`);
        }
      }
    }

    // Validación 3: Fecha de emisión no futura
    if (datos.fechaEmision) {
      const validacionFecha = Validadores.validarFechaNoFutura(datos.fechaEmision);
      if (!validacionFecha.valido) {
        errores.push(...validacionFecha.errores);
      }
    }

    // Validación 4: Monto positivo
    if (datos.montoTotal !== undefined && datos.montoTotal !== null) {
      const validacionMonto = Validadores.validarMonto(datos.montoTotal);
      if (!validacionMonto.valido) {
        errores.push(...validacionMonto.errores);
      }
    }

    // Validación 5: Notas de crédito/débito requieren factura origen
    if (configTipo.requiereFacturaOrigen && datos.facturaOrigenId) {
      const facturaOrigen = this.obtenerDocumentoPorId(datos.facturaOrigenId);
      if (!facturaOrigen) {
        errores.push(`Factura origen no encontrada: ${datos.facturaOrigenId}`);
      }
    }

    // Validación 6: Productos (si el tipo los requiere)
    if (configTipo.requiereProductos && datos.productos) {
      if (!Array.isArray(datos.productos) || datos.productos.length === 0) {
        errores.push('El documento debe tener al menos un producto');
      }
      datos.productos.forEach((prod, idx) => {
        if (!prod.cantidad || prod.cantidad <= 0) {
          errores.push(`Producto ${idx + 1}: cantidad debe ser mayor a 0`);
        }
      });
    }

    // Validación 7: Coherencia de montos (IVA calculado vs declarado)
    if (datos.montoTotal && datos.montoIVA) {
      const ivaCalculado = Utilidades.calcularIVADeTotal(datos.montoTotal);
      const diferencia = Math.abs(ivaCalculado - datos.montoIVA);
      if (diferencia > 0.01) {
        errores.push(
          `IVA incoherente: calculado ${ivaCalculado.toFixed(2)}, ` +
          `declarado ${datos.montoIVA.toFixed(2)}, diferencia ${diferencia.toFixed(2)}`
        );
      }
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  /**
   * Busca un documento por su CUF.
   * @param {string} cuf - CUF a buscar
   * @returns {Object|null} Documento encontrado o null
   * @private
   */
  _buscarPorCUF(cuf) {
    const documentos = this.almacenamiento.obtener(this.nombreColeccion);
    return documentos.find(doc => doc.cuf === cuf) || null;
  }

  // ════════════════════════════════════════════════════════════
  // CONSULTAS
  // ════════════════════════════════════════════════════════════

  /**
   * Obtiene documentos con filtros opcionales.
   * @param {Object} filtros - Filtros de búsqueda
   * @param {string} [filtros.tipo] - Tipo de documento
   * @param {string} [filtros.estado] - Estado del documento
   * @param {string} [filtros.periodoContable] - Período contable (AAAA-MM)
   * @param {string} [filtros.nitContraparte] - NIT de proveedor/cliente
   * @returns {Array} Documentos filtrados y ordenados
   */
  obtenerDocumentos(filtros = {}) {
    let documentos = this.almacenamiento.obtener(this.nombreColeccion);

    // Aplicar filtros
    if (filtros.tipo) {
      documentos = documentos.filter(doc => doc.tipo === filtros.tipo);
    }

    if (filtros.estado) {
      documentos = documentos.filter(doc => doc.estado === filtros.estado);
    }

    if (filtros.periodoContable) {
      documentos = documentos.filter(doc => doc.periodoContable === filtros.periodoContable);
    }

    if (filtros.nitContraparte) {
      documentos = documentos.filter(doc =>
        doc.nitProveedor === filtros.nitContraparte ||
        doc.nitCliente === filtros.nitContraparte ||
        doc.nitRecibidoDe === filtros.nitContraparte ||
        doc.nitPagadoA === filtros.nitContraparte
      );
    }

    // Ordenar por fechaRegistro descendente (más recientes primero)
    documentos.sort((a, b) => {
      const fechaA = new Date(a.fechaRegistro || a.creadoEn);
      const fechaB = new Date(b.fechaRegistro || b.creadoEn);
      return fechaB - fechaA;
    });

    return documentos;
  }

  /**
   * Obtiene un documento por su ID.
   * @param {string} id - ID del documento
   * @returns {Object|null} Documento o null si no existe
   */
  obtenerDocumentoPorId(id) {
    return this.almacenamiento.obtenerPorId(this.nombreColeccion, id);
  }

  /**
   * Obtiene documentos por número.
   * @param {string} numero - Número del documento
   * @returns {Array} Documentos con ese número
   */
  obtenerDocumentosPorNumero(numero) {
    return this.almacenamiento.buscar(this.nombreColeccion, doc => doc.numero === numero);
  }

  /**
   * Obtiene estadísticas de documentos.
   * @param {string} [periodoContable] - Período opcional
   * @returns {Object} Estadísticas
   */
  obtenerEstadisticas(periodoContable = null) {
    const documentos = periodoContable
      ? this.obtenerDocumentos({ periodoContable })
      : this.obtenerDocumentos();

    const estadisticas = {
      total: documentos.length,
      porTipo: {},
      porEstado: {},
      montoTotal: 0,
      montoIVA: 0,
      montoIT: 0
    };

    documentos.forEach(doc => {
      // Por tipo
      if (!estadisticas.porTipo[doc.tipo]) {
        estadisticas.porTipo[doc.tipo] = 0;
      }
      estadisticas.porTipo[doc.tipo]++;

      // Por estado
      if (!estadisticas.porEstado[doc.estado]) {
        estadisticas.porEstado[doc.estado] = 0;
      }
      estadisticas.porEstado[doc.estado]++;

      // Totales
      estadisticas.montoTotal += doc.montoTotal || 0;
      estadisticas.montoIVA += doc.montoIVA || 0;
      estadisticas.montoIT += doc.montoIT || 0;
    });

    return estadisticas;
  }

  // ════════════════════════════════════════════════════════════
  // GESTIÓN DE ESTADOS
  // ════════════════════════════════════════════════════════════

  /**
   * Cambia el estado de un documento.
   * @param {string} id - ID del documento
   * @param {string} nuevoEstado - Nuevo estado (código de ESTADOS_DOCUMENTO)
   * @param {string} motivo - Motivo del cambio
   * @returns {Object} { exito: boolean, mensaje: string, documento: object }
   */
  cambiarEstado(id, nuevoEstado, motivo = '') {
    const documento = this.obtenerDocumentoPorId(id);
    if (!documento) {
      return {
        exito: false,
        mensaje: `Documento no encontrado: ${id}`,
        documento: null
      };
    }

    // Validar que el nuevo estado sea válido
    if (!ESTADOS_DOCUMENTO[nuevoEstado]) {
      return {
        exito: false,
        mensaje: `Estado inválido: ${nuevoEstado}`,
        documento: null
      };
    }

    // Validar transición de estado
    const estadoAnterior = documento.estado;
    const transicionValida = this._validarTransicionEstado(estadoAnterior, nuevoEstado);
    if (!transicionValida.valida) {
      return {
        exito: false,
        mensaje: transicionValida.mensaje,
        documento: null
      };
    }

    // Actualizar documento
    const documentoActualizado = {
      ...documento,
      estado: nuevoEstado,
      actualizadoEn: new Date().toISOString(),
      actualizadoPor: 'sistema' // TODO: obtener del usuario autenticado
    };

    // Agregar al historial
    documentoActualizado.historial = documento.historial || [];
    documentoActualizado.historial.push({
      fecha: new Date().toISOString(),
      estadoAnterior,
      estadoNuevo: nuevoEstado,
      usuario: 'sistema',
      motivo
    });

    // Guardar cambios
    const resultado = this.almacenamiento.actualizar(this.nombreColeccion, id, documentoActualizado);

    if (!resultado) {
      return {
        exito: false,
        mensaje: 'Error al actualizar el documento',
        documento: null
      };
    }

    // Disparar evento
    this._dispararEvento('documento-estado-cambiado', {
      documento: documentoActualizado,
      estadoAnterior,
      estadoNuevo: nuevoEstado
    });

    console.log(`✅ Estado cambiado: ${estadoAnterior} → ${nuevoEstado} (doc ${id})`);

    return {
      exito: true,
      mensaje: `Estado actualizado a ${nuevoEstado}`,
      documento: documentoActualizado
    };
  }

  /**
   * Valida si una transición de estado es válida.
   * @param {string} estadoAnterior - Estado actual
   * @param {string} estadoNuevo - Estado destino
   * @returns {Object} { valida: boolean, mensaje: string }
   * @private
   */
  _validarTransicionEstado(estadoAnterior, estadoNuevo) {
    const transicionesValidas = {
      'PENDIENTE': ['VALIDADO', 'RECHAZADO'],
      'RECHAZADO': ['PENDIENTE'],
      'VALIDADO': ['PROCESADO', 'ANULADO'],
      'PROCESADO': ['ANULADO'],
      'ANULADO': [] // Estado final
    };

    const destinosPermitidos = transicionesValidas[estadoAnterior] || [];
    const valida = destinosPermitidos.includes(estadoNuevo);

    return {
      valida,
      mensaje: valida
        ? 'Transición válida'
        : `No se puede cambiar de ${estadoAnterior} a ${estadoNuevo}. ` +
          `Destinos permitidos: ${destinosPermitidos.join(', ') || 'ninguno'}`
    };
  }

  /**
   * Valida un documento pendiente y lo marca como VALIDADO o RECHAZADO.
   * @param {string} id - ID del documento
   * @returns {Object} Resultado de la validación
   */
  validarYActualizarEstado(id) {
    const documento = this.obtenerDocumentoPorId(id);
    if (!documento) {
      return {
        exito: false,
        mensaje: `Documento no encontrado: ${id}`,
        documento: null
      };
    }

    if (documento.estado !== ESTADOS_DOCUMENTO.PENDIENTE.codigo) {
      return {
        exito: false,
        mensaje: `El documento no está en estado PENDIENTE (está en ${documento.estado})`,
        documento: null
      };
    }

    // Validar el documento
    const validacion = this.validarDocumento(documento);
    const nuevoEstado = validacion.valido
      ? ESTADOS_DOCUMENTO.VALIDADO.codigo
      : ESTADOS_DOCUMENTO.RECHAZADO.codigo;

    const motivo = validacion.valido
      ? 'Validación automática exitosa'
      : `Validación fallida: ${validacion.errores.join('; ')}`;

    return this.cambiarEstado(id, nuevoEstado, motivo);
  }

  // ════════════════════════════════════════════════════════════
  // UTILIDADES INTERNAS
  // ════════════════════════════════════════════════════════════

  /**
   * Genera un ID único para el documento.
   * @returns {string} ID único
   * @private
   */
  _generarId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback para navegadores antiguos
    return `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Dispara un evento personalizado.
   * @param {string} nombreEvento - Nombre del evento
   * @param {Object} datos - Datos del evento
   * @private
   */
  _dispararEvento(nombreEvento, datos) {
    const evento = new CustomEvent(`erp:${nombreEvento}`, { detail: datos });
    window.dispatchEvent(evento);
  }

  // ════════════════════════════════════════════════════════════
  // MÉTODOS DE ADMINISTRACIÓN
  // ════════════════════════════════════════════════════════════

  /**
   * Elimina un documento (solo si está en estado PENDIENTE o RECHAZADO).
   * @param {string} id - ID del documento
   * @returns {Object} { exito: boolean, mensaje: string }
   */
  eliminarDocumento(id) {
    const documento = this.obtenerDocumentoPorId(id);
    if (!documento) {
      return {
        exito: false,
        mensaje: `Documento no encontrado: ${id}`
      };
    }

    // Solo permitir eliminar documentos PENDIENTES o RECHAZADOS
    if (documento.estado !== ESTADOS_DOCUMENTO.PENDIENTE.codigo &&
        documento.estado !== ESTADOS_DOCUMENTO.RECHAZADO.codigo) {
      return {
        exito: false,
        mensaje: `No se puede eliminar un documento en estado ${documento.estado}. ` +
                 `Solo se pueden eliminar documentos PENDIENTES o RECHAZADOS.`
      };
    }

    const eliminado = this.almacenamiento.eliminar(this.nombreColeccion, id);

    if (eliminado) {
      this._dispararEvento('documento-eliminado', { id, documento });
      return {
        exito: true,
        mensaje: 'Documento eliminado correctamente'
      };
    }

    return {
      exito: false,
      mensaje: 'Error al eliminar el documento'
    };
  }

  /**
   * Cuenta documentos por tipo y estado.
   * @returns {Object} Conteos
   */
  contarDocumentos() {
    const documentos = this.almacenamiento.obtener(this.nombreColeccion);

    return {
      total: documentos.length,
      pendientes: documentos.filter(d => d.estado === 'PENDIENTE').length,
      validados: documentos.filter(d => d.estado === 'VALIDADO').length,
      rechazados: documentos.filter(d => d.estado === 'RECHAZADO').length,
      procesados: documentos.filter(d => d.estado === 'PROCESADO').length,
      anulados: documentos.filter(d => d.estado === 'ANULADO').length
    };
  }
}
