// ══════════════════════════════════════════════════════════════
// ordenes-trabajo.js — Módulo 8.6: Costeo por Órdenes de Trabajo
// ══════════════════════════════════════════════════════════════

/**
 * Costeo por Órdenes de Trabajo (Job Order Costing)
 *
 * Para empresas que fabrican productos personalizados o por lotes.
 * Cada orden acumula:
 *   - Materia Prima (MP) consumida del inventario
 *   - Mano de Obra Directa (MOD)
 *   - Costos Indirectos de Fabricación (CIF) aplicados
 *
 * Al cerrar la orden:
 *   - Calcula costo total y costo unitario
 *   - Ingresa productos al inventario de PT (Productos Terminados)
 *   - Genera asiento contable de transferencia
 */
class OrdenesTrabajo {

  constructor(deps = {}) {
    this.almacenamiento = deps.almacenamiento || null;
    this.inventarioCapas = deps.inventarioCapas || null;
    this.costosCIF = deps.costosCIF || null;
    this.motorContable = deps.motorContable || null;

    this.KEY_ORDENES = 'erp_costos_ordenes_trabajo';
    this.KEY_CORRELATIVO = 'erp_costos_ot_correlativo';

    console.log('🛠️ Módulo Órdenes de Trabajo inicializado');
  }

  // ══════════════════════════════════════════════════════════
  // CRUD DE ÓRDENES
  // ══════════════════════════════════════════════════════════

  /**
   * Crea una nueva orden de trabajo.
   *
   * @param {Object} datos
   * @returns {Object}
   */
  crearOrden(datos = {}) {
    if (!datos.productoId) {
      return { exito: false, errores: ['ID de producto requerido'] };
    }
    if (!datos.cantidadPlaneada || datos.cantidadPlaneada <= 0) {
      return { exito: false, errores: ['Cantidad planeada debe ser mayor a 0'] };
    }

    const numero = this._siguienteNumero();
    const orden = {
      id: 'ot-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 6),
      numero: `OT-${new Date().getFullYear()}-${numero}`,
      cliente: datos.cliente || '',
      productoId: datos.productoId,
      productoNombre: datos.productoNombre || '',
      descripcion: datos.descripcion || '',
      fechaInicio: datos.fechaInicio || new Date().toISOString().split('T')[0],
      fechaFin: null,
      estado: 'ABIERTA',
      cantidadPlaneada: Number(datos.cantidadPlaneada) || 0,
      cantidadProducida: 0,
      centroCostoId: datos.centroCostoId || null,
      costos: {
        materiaPrima: 0,
        manoDeObra: 0,
        cifAplicado: 0,
        totalCosto: 0,
        costoUnitario: 0
      },
      detalleMateriales: [],
      detalleMO: [],
      detalleCIF: [],
      creadoEn: new Date().toISOString(),
      historial: [{
        fecha: new Date().toISOString(),
        accion: 'CREACION',
        descripcion: `Orden creada para ${datos.cantidadPlaneada} unidades`
      }]
    };

    const ordenes = this._leerOrdenes();
    ordenes.push(orden);
    this._guardarOrdenes(ordenes);

    console.log(`🛠️ Orden creada: ${orden.numero} | ${orden.cantidadPlaneada}u de ${orden.productoId}`);
    return { exito: true, orden };
  }

  /**
   * Obtiene todas las órdenes.
   */
  obtenerTodas(filtros = {}) {
    const ordenes = this._leerOrdenes();
    let resultado = ordenes;

    if (filtros.estado) {
      resultado = resultado.filter(o => o.estado === filtros.estado);
    }
    if (filtros.productoId) {
      resultado = resultado.filter(o => o.productoId === filtros.productoId);
    }

    return resultado;
  }

  /**
   * Obtiene una orden por ID.
   */
  obtenerPorId(ordenId) {
    const ordenes = this._leerOrdenes();
    return ordenes.find(o => o.id === ordenId) || null;
  }

  // ══════════════════════════════════════════════════════════
  // AGREGAR MATERIALES Y MANO DE OBRA
  // ══════════════════════════════════════════════════════════

  /**
   * Agrega material (MP) a una orden.
   *
   * @param {string} ordenId
   * @param {string} materialId - ID del producto material
   * @param {number} cantidad
   * @param {Object} [opciones] - costoUnitario, documento
   * @returns {Object}
   */
  agregarMaterial(ordenId, materialId, cantidad, opciones = {}) {
    const ordenes = this._leerOrdenes();
    const orden = ordenes.find(o => o.id === ordenId);

    if (!orden) {
      return { exito: false, errores: ['Orden no encontrada'] };
    }

    if (orden.estado === 'TERMINADA' || orden.estado === 'CANCELADA') {
      return { exito: false, errores: [`Orden en estado ${orden.estado}, no se puede modificar`] };
    }

    const cantidadNum = Number(cantidad) || 0;
    if (cantidadNum <= 0) {
      return { exito: false, errores: ['Cantidad debe ser mayor a 0'] };
    }

    // Obtener costo del material desde inventario por capas
    let costoUnitario = Number(opciones.costoUnitario) || 0;
    let metodoUsado = 'MANUAL';
    let detalleConsumo = null;

    if (this.inventarioCapas && !opciones.costoUnitario) {
      const costoResult = this.inventarioCapas.calcularCostoVenta(materialId, cantidadNum);
      if (costoResult.exito) {
        costoUnitario = this._r2(costoResult.costoTotal / cantidadNum);
        metodoUsado = costoResult.metodo || 'PROMEDIO';
        detalleConsumo = costoResult.detalleConsumo;
      } else {
        return { exito: false, errores: [`No se pudo calcular costo: ${costoResult.errores.join(', ')}`] };
      }
    }

    const costoTotal = this._r2(cantidadNum * costoUnitario);

    // Registrar material en la orden
    const detalleMaterial = {
      id: 'mat-' + Date.now().toString(36),
      materialId,
      cantidad: cantidadNum,
      costoUnitario,
      costoTotal,
      metodoUsado,
      fecha: new Date().toISOString().split('T')[0],
      detalleConsumo
    };

    orden.detalleMateriales.push(detalleMaterial);
    orden.costos.materiaPrima = this._r2(orden.costos.materiaPrima + costoTotal);

    // Consumir del inventario (si hay módulo de capas)
    let inventarioConsumido = false;
    if (this.inventarioCapas && !opciones.noConsumirInventario) {
      const consumo = this.inventarioCapas.consumirCapas(materialId, cantidadNum);
      inventarioConsumido = consumo.exito;
    }

    this._recalcularCostos(orden);
    this._agregarHistorial(orden, 'AGREGAR_MATERIAL',
      `Material ${materialId}: ${cantidadNum}u × Bs ${costoUnitario} = Bs ${costoTotal}`);

    this._guardarOrdenes(ordenes);

    console.log(`📦 Material agregado a ${orden.numero}: ${materialId} | ${cantidadNum}u → Bs ${costoTotal}`);
    return {
      exito: true,
      orden,
      detalleMaterial,
      inventarioConsumido,
      metodoUsado
    };
  }

  /**
   * Agrega mano de obra directa (MOD) a una orden.
   *
   * @param {string} ordenId
   * @param {Object} datosMO - { horas, costoHora, empleadoId, descripcion }
   * @returns {Object}
   */
  agregarManoDeObra(ordenId, datosMO = {}) {
    const ordenes = this._leerOrdenes();
    const orden = ordenes.find(o => o.id === ordenId);

    if (!orden) {
      return { exito: false, errores: ['Orden no encontrada'] };
    }

    if (orden.estado === 'TERMINADA' || orden.estado === 'CANCELADA') {
      return { exito: false, errores: [`Orden en estado ${orden.estado}`] };
    }

    const horas = Number(datosMO.horas) || 0;
    const costoHora = Number(datosMO.costoHora) || 0;

    if (horas <= 0) {
      return { exito: false, errores: ['Horas debe ser mayor a 0'] };
    }
    if (costoHora < 0) {
      return { exito: false, errores: ['Costo hora no puede ser negativo'] };
    }

    const costoTotal = this._r2(horas * costoHora);

    const detalleMO = {
      id: 'mo-' + Date.now().toString(36),
      empleadoId: datosMO.empleadoId || '',
      empleadoNombre: datosMO.empleadoNombre || '',
      horas,
      costoHora,
      costoTotal,
      descripcion: datosMO.descripcion || '',
      fecha: datosMO.fecha || new Date().toISOString().split('T')[0]
    };

    orden.detalleMO.push(detalleMO);
    orden.costos.manoDeObra = this._r2(orden.costos.manoDeObra + costoTotal);

    this._recalcularCostos(orden);
    this._agregarHistorial(orden, 'AGREGAR_MOD',
      `MOD: ${horas}h × Bs ${costoHora} = Bs ${costoTotal}`);

    this._guardarOrdenes(ordenes);

    console.log(`👷 MOD agregada a ${orden.numero}: ${horas}h × Bs ${costoHora} = Bs ${costoTotal}`);
    return { exito: true, orden, detalleMO };
  }

  /**
   * Aplica CIF a una orden.
   *
   * @param {string} ordenId
   * @param {string} centroId
   * @param {number} cantidadBase - horas MOD, horas máquina, etc.
   * @returns {Object}
   */
  aplicarCIF(ordenId, centroId, cantidadBase) {
    const ordenes = this._leerOrdenes();
    const orden = ordenes.find(o => o.id === ordenId);

    if (!orden) {
      return { exito: false, errores: ['Orden no encontrada'] };
    }

    if (orden.estado === 'TERMINADA' || orden.estado === 'CANCELADA') {
      return { exito: false, errores: [`Orden en estado ${orden.estado}`] };
    }

    if (!this.costosCIF) {
      return { exito: false, errores: ['Módulo Costos CIF no disponible'] };
    }

    const aplicacion = this.costosCIF.aplicarCIF(centroId, {
      ordenId,
      cantidadBase,
      fecha: new Date().toISOString().split('T')[0]
    });

    if (!aplicacion.exito) return aplicacion;

    orden.detalleCIF.push({
      id: aplicacion.aplicacion.id,
      centroId,
      cantidadBase,
      tasa: aplicacion.tasa,
      cifAplicado: aplicacion.cifAplicado,
      fecha: new Date().toISOString().split('T')[0]
    });

    orden.costos.cifAplicado = this._r2(orden.costos.cifAplicado + aplicacion.cifAplicado);

    this._recalcularCostos(orden);
    this._agregarHistorial(orden, 'APLICAR_CIF',
      `CIF aplicado: ${cantidadBase} × Bs ${aplicacion.tasa} = Bs ${aplicacion.cifAplicado}`);

    this._guardarOrdenes(ordenes);

    console.log(`🏭 CIF aplicado a ${orden.numero}: Bs ${aplicacion.cifAplicado}`);
    return { exito: true, orden, aplicacion };
  }

  // ══════════════════════════════════════════════════════════
  // CIERRE DE ORDEN
  // ══════════════════════════════════════════════════════════

  /**
   * Cierra una orden de trabajo (marca como TERMINADA).
   *
   * Calcula:
   *   - Costo total acumulado (MP + MOD + CIF)
   *   - Costo unitario
   *   - Genera asiento contable de transferencia a PT
   *
   * @param {string} ordenId
   * @param {Object} [datosCierre]
   * @returns {Object}
   */
  cerrarOrden(ordenId, datosCierre = {}) {
    const ordenes = this._leerOrdenes();
    const orden = ordenes.find(o => o.id === ordenId);

    if (!orden) {
      return { exito: false, errores: ['Orden no encontrada'] };
    }

    if (orden.estado === 'TERMINADA') {
      return { exito: false, errores: ['Orden ya está cerrada'] };
    }

    if (orden.estado === 'CANCELADA') {
      return { exito: false, errores: ['Orden cancelada, no se puede cerrar'] };
    }

    const cantidadProducida = Number(datosCierre.cantidadProducida) || orden.cantidadPlaneada;
    const costoTotal = orden.costos.totalCosto;
    const costoUnitario = cantidadProducida > 0 ? this._r2(costoTotal / cantidadProducida) : 0;

    // Actualizar estado
    orden.estado = 'TERMINADA';
    orden.fechaFin = datosCierre.fechaFin || new Date().toISOString().split('T')[0];
    orden.cantidadProducida = cantidadProducida;
    orden.costos.costoUnitario = costoUnitario;

    // Ingresar al inventario de productos terminados
    let inventarioIngresado = false;
    if (this.inventarioCapas && !datosCierre.noIngresarInventario) {
      const ingreso = this.inventarioCapas.agregarCapa(orden.productoId, {
        cantidad: cantidadProducida,
        costoUnitario,
        fecha: orden.fechaFin,
        documentoOrigen: orden.numero,
        metodo: 'PROMEDIO'
      });
      inventarioIngresado = ingreso.exito;
    }

    // Generar asiento contable de transferencia
    const asiento = this._generarAsientoCierre(orden, costoTotal);

    this._agregarHistorial(orden, 'CIERRE_ORDEN',
      `Orden cerrada. ${cantidadProducida}u producidas a Bs ${costoUnitario}/u. Total: Bs ${costoTotal}`);

    this._guardarOrdenes(ordenes);

    console.log(`✅ Orden cerrada: ${orden.numero} | ${cantidadProducida}u × Bs ${costoUnitario} = Bs ${costoTotal}`);
    return {
      exito: true,
      orden,
      costoTotal,
      costoUnitario,
      cantidadProducida,
      inventarioIngresado,
      asiento
    };
  }

  /**
   * Cancela una orden.
   */
  cancelarOrden(ordenId, motivo = '') {
    const ordenes = this._leerOrdenes();
    const orden = ordenes.find(o => o.id === ordenId);

    if (!orden) {
      return { exito: false, errores: ['Orden no encontrada'] };
    }

    orden.estado = 'CANCELADA';
    orden.fechaFin = new Date().toISOString().split('T')[0];
    this._agregarHistorial(orden, 'CANCELACION', `Motivo: ${motivo || 'No especificado'}`);

    this._guardarOrdenes(ordenes);

    console.log(`❌ Orden cancelada: ${orden.numero}`);
    return { exito: true, orden };
  }

  /**
   * Genera asiento de cierre de orden.
   * @private
   */
  _generarAsientoCierre(orden, costoTotal) {
    if (!this.motorContable || typeof this.motorContable.crearAsientoManual !== 'function') {
      return {
        generado: false,
        razon: 'Motor Contable no disponible',
        detalle: [
          { cuenta: '1.1.06.03 Inventario PT', debe: costoTotal, haber: 0 },
          { cuenta: '1.1.06.02 Inventario PEP', debe: 0, haber: costoTotal }
        ]
      };
    }

    try {
      const asiento = this.motorContable.crearAsientoManual({
        fecha: orden.fechaFin,
        concepto: `Transferencia a PT - ${orden.numero}`,
        lineas: [
          {
            cuentaCodigo: '1.1.06.03',
            cuentaNombre: 'Inventario Productos Terminados',
            debe: costoTotal,
            haber: 0
          },
          {
            cuentaCodigo: '1.1.06.02',
            cuentaNombre: 'Inventario Productos en Proceso',
            debe: 0,
            haber: costoTotal
          }
        ]
      });

      return {
        generado: true,
        asientoId: asiento?.id || null,
        detalle: [
          { cuenta: '1.1.06.03 Inventario PT', debe: costoTotal, haber: 0 },
          { cuenta: '1.1.06.02 Inventario PEP', debe: 0, haber: costoTotal }
        ]
      };
    } catch (e) {
      return {
        generado: false,
        razon: e.message,
        detalle: []
      };
    }
  }

  // ══════════════════════════════════════════════════════════
  // REPORTES
  // ══════════════════════════════════════════════════════════

  /**
   * Obtiene resumen de órdenes por estado.
   */
  obtenerResumenPorEstado() {
    const ordenes = this._leerOrdenes();
    return {
      ABIERTA: ordenes.filter(o => o.estado === 'ABIERTA').length,
      EN_PROCESO: ordenes.filter(o => o.estado === 'EN_PROCESO').length,
      TERMINADA: ordenes.filter(o => o.estado === 'TERMINADA').length,
      CANCELADA: ordenes.filter(o => o.estado === 'CANCELADA').length,
      total: ordenes.length,
      costoTotalAcumulado: this._r2(ordenes
        .filter(o => o.estado === 'TERMINADA')
        .reduce((s, o) => s + o.costos.totalCosto, 0))
    };
  }

  // ══════════════════════════════════════════════════════════
  // UTILIDADES PRIVADAS
  // ══════════════════════════════════════════════════════════

  _siguienteNumero() {
    const correlativo = Number(localStorage.getItem(this.KEY_CORRELATIVO) || '0');
    const nuevo = correlativo + 1;
    localStorage.setItem(this.KEY_CORRELATIVO, String(nuevo));
    return String(nuevo).padStart(4, '0');
  }

  _recalcularCostos(orden) {
    orden.costos.totalCosto = this._r2(
      orden.costos.materiaPrima +
      orden.costos.manoDeObra +
      orden.costos.cifAplicado
    );
    if (orden.cantidadPlaneada > 0) {
      orden.costos.costoUnitario = this._r2(orden.costos.totalCosto / orden.cantidadPlaneada);
    }
  }

  _agregarHistorial(orden, accion, descripcion) {
    orden.historial.push({
      fecha: new Date().toISOString(),
      accion,
      descripcion
    });
  }

  _leerOrdenes() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY_ORDENES) || '[]');
    } catch (e) {
      return [];
    }
  }

  _guardarOrdenes(ordenes) {
    localStorage.setItem(this.KEY_ORDENES, JSON.stringify(ordenes));
  }

  _r2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }
}

window.OrdenesTrabajoClase = OrdenesTrabajo;
