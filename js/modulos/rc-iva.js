// ══════════════════════════════════════════════════════════════
// rc-iva.js — RC-IVA con facturas de gastos personales
// ══════════════════════════════════════════════════════════════

/**
 * Módulo de RC-IVA Boliviano.
 *
 * En Bolivia los empleados NO pagan impuesto a la renta personal.
 * En su lugar pagan el RC-IVA (13% del total ganado), pero pueden
 * compensarlo presentando facturas de gastos personales.
 *
 * IVA de una factura = monto × 0.13 / 1.13
 * (extraer el IVA de un monto que ya lo incluye)
 *
 * RC-IVA a pagar = max(0, RC-IVA teórico − IVA facturas)
 *
 * Si las facturas cubren el 100% del RC-IVA → el empleado paga 0.
 */
class ModuloRCIVA {

  constructor(deps) {
    this.almacenamiento = deps.almacenamiento;
    this.catalogoEmpleados = deps.catalogoEmpleados;
    this.COLLECCION = 'facturas_rc_iva';

    // Porcentaje del RC-IVA
    this.PORCENTAJE_RC_IVA = 0.13;

    // Asegurar colección existente
    if (!this.almacenamiento.obtener(this.COLLECCION)) {
      this.almacenamiento.guardar(this.COLLECCION, []);
    }

    console.log('🧾 Módulo de RC-IVA inicializado.');
  }

  // ══════════════════════════════════════════════════════════
  // REGISTRO DE FACTURAS
  // ══════════════════════════════════════════════════════════

  /**
   * Registra una factura de gastos personales para un empleado.
   *
   * @param {Object} datos
   * @param {string} datos.empleadoId - ID del empleado
   * @param {string} datos.numeroFactura - Número de factura
   * @param {string} datos.nitEmisor - NIT del emisor
   * @param {string} datos.cuf - CUF (Código Único de Factura)
   * @param {number} datos.monto - Monto total con IVA incluido
   * @param {string} datos.fecha - Fecha de la factura (YYYY-MM-DD)
   * @param {string} [datos.descripcion] - Descripción del gasto
   * @returns {Object} { exito, factura, errores }
   */
  registrarFactura(datos) {
    const validacion = this.validarFactura(datos);
    if (!validacion.valido) {
      return { exito: false, factura: null, errores: validacion.errores };
    }

    const monto = Number(datos.monto);
    const iva = this._r2(monto * 0.13 / 1.13);

    const factura = {
      id: this._generarId(),
      empleadoId: datos.empleadoId,
      numeroFactura: datos.numeroFactura.trim(),
      nitEmisor: datos.nitEmisor.trim(),
      cuf: datos.cuf.trim(),
      monto,
      iva,
      fecha: datos.fecha,
      descripcion: datos.descripcion || '',
      periodo: datos.fecha.slice(0, 7),
      creadaEn: new Date().toISOString()
    };

    this.almacenamiento.guardar(this.COLLECCION, factura);
    console.log(`🧾 Factura registrada: ${factura.numeroFactura} — IVA ${this._fmt(iva)}`);

    return { exito: true, factura, errores: [] };
  }

  /**
   * Valida los datos de una factura.
   * @param {Object} datos
   * @returns {Object} { valido, errores }
   */
  validarFactura(datos) {
    const errores = [];

    if (!datos.empleadoId) {
      errores.push('El ID del empleado es obligatorio');
    } else {
      const emp = this.catalogoEmpleados.obtenerPorId(datos.empleadoId);
      if (!emp) errores.push('Empleado no encontrado');
    }

    if (!datos.numeroFactura || !datos.numeroFactura.trim()) {
      errores.push('El número de factura es obligatorio');
    }

    if (!datos.nitEmisor || !datos.nitEmisor.trim()) {
      errores.push('El NIT del emisor es obligatorio');
    }

    if (!datos.cuf || !datos.cuf.trim()) {
      errores.push('El CUF es obligatorio');
    } else if (datos.cuf.length < 10) {
      errores.push('El CUF debe tener al menos 10 caracteres');
    }

    const monto = Number(datos.monto);
    if (isNaN(monto) || monto <= 0) {
      errores.push('El monto debe ser un número positivo');
    }

    if (!datos.fecha) {
      errores.push('La fecha es obligatoria');
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha)) {
      errores.push('La fecha debe estar en formato YYYY-MM-DD');
    }

    return { valido: errores.length === 0, errores };
  }

  // ══════════════════════════════════════════════════════════
  // CONSULTAS
  // ══════════════════════════════════════════════════════════

  /**
   * Obtiene todas las facturas de un empleado.
   * @param {string} empleadoId
   * @param {string} [periodo] - Filtrar por período (YYYY-MM)
   * @returns {Array}
   */
  obtenerFacturasPorEmpleado(empleadoId, periodo = null) {
    let facturas = this.almacenamiento.obtener(this.COLLECCION) || [];
    facturas = facturas.filter(f => f.empleadoId === empleadoId);

    if (periodo) {
      facturas = facturas.filter(f => f.periodo === periodo);
    }

    return facturas.sort((a, b) => b.fecha.localeCompare(a.fecha));
  }

  /**
   * Obtiene el total de IVA acumulado de las facturas de un empleado en un período.
   * @param {string} empleadoId
   * @param {string} periodo
   * @returns {number}
   */
  obtenerIVAAcumulado(empleadoId, periodo) {
    const facturas = this.obtenerFacturasPorEmpleado(empleadoId, periodo);
    return this._r2(facturas.reduce((sum, f) => sum + f.iva, 0));
  }

  /**
   * Calcula el RC-IVA a pagar de un empleado después de compensar con facturas.
   *
   * @param {string} empleadoId
   * @param {number} totalDevengado
   * @param {string} periodo
   * @returns {Object} { rcIVATeorico, ivaFacturas, compensado, aPagar }
   */
  calcularRCIVAPagar(empleadoId, totalDevengado, periodo) {
    const rcIVATeorico = this._r2(totalDevengado * this.PORCENTAJE_RC_IVA);
    const ivaFacturas = this.obtenerIVAAcumulado(empleadoId, periodo);
    const compensado = this._r2(Math.min(rcIVATeorico, ivaFacturas));
    const aPagar = this._r2(Math.max(0, rcIVATeorico - ivaFacturas));

    return {
      rcIVATeorico,
      ivaFacturas,
      compensado,
      aPagar,
      porcentajeCompensado: rcIVATeorico > 0 ? this._r2(compensado / rcIVATeorico * 100) : 0
    };
  }

  /**
   * Obtiene un resumen del RC-IVA de todos los empleados activos en un período.
   * @param {string} periodo
   * @returns {Object} { empleados, totales }
   */
  obtenerResumenPeriodo(periodo) {
    const empleados = this.catalogoEmpleados.obtenerActivos();
    const resumen = [];
    const totales = {
      rcIVATeorico: 0,
      ivaFacturas: 0,
      compensado: 0,
      aPagar: 0
    };

    empleados.forEach(emp => {
      const planillas = this.almacenamiento.obtener('planillas_nomina') || [];
      const planilla = planillas.find(p => p.periodo === periodo);
      let totalDevengado = 0;

      if (planilla) {
        const linea = planilla.planilla.find(l => l.empleadoId === emp.id);
        if (linea) totalDevengado = linea.devengados.totalDevengado;
      }

      const rc = this.calcularRCIVAPagar(emp.id, totalDevengado, periodo);
      const facturas = this.obtenerFacturasPorEmpleado(emp.id, periodo);

      resumen.push({
        empleadoId: emp.id,
        empleadoNombre: `${emp.nombres} ${emp.apellidos}`,
        empleadoCI: emp.ci,
        totalDevengado,
        rcIVATeorico: rc.rcIVATeorico,
        cantidadFacturas: facturas.length,
        ivaFacturas: rc.ivaFacturas,
        compensado: rc.compensado,
        aPagar: rc.aPagar,
        porcentajeCompensado: rc.porcentajeCompensado
      });

      totales.rcIVATeorico += rc.rcIVATeorico;
      totales.ivaFacturas += rc.ivaFacturas;
      totales.compensado += rc.compensado;
      totales.aPagar += rc.aPagar;
    });

    Object.keys(totales).forEach(k => { totales[k] = this._r2(totales[k]); });

    return {
      periodo,
      cantidadEmpleados: resumen.length,
      resumen,
      totales
    };
  }

  /**
   * Elimina una factura.
   * @param {string} facturaId
   * @returns {Object}
   */
  eliminarFactura(facturaId) {
    const facturas = this.almacenamiento.obtener(this.COLLECCION) || [];
    const factura = facturas.find(f => f.id === facturaId);

    if (!factura) {
      return { exito: false, errores: ['Factura no encontrada'] };
    }

    this.almacenamiento.eliminar(this.COLLECCION, facturaId);
    console.log(`🗑️ Factura eliminada: ${factura.numeroFactura}`);

    return { exito: true, factura };
  }

  /**
   * Reinicia las facturas de un período (al inicio de un nuevo mes).
   * Las facturas del mes anterior no se arrastran.
   * @param {string} empleadoId
   * @param {string} periodo
   * @returns {Object}
   */
  resetearFacturasPeriodo(empleadoId, periodo) {
    const facturas = this.obtenerFacturasPorEmpleado(empleadoId, periodo);
    let eliminadas = 0;

    facturas.forEach(f => {
      this.almacenamiento.eliminar(this.COLLECCION, f.id);
      eliminadas++;
    });

    return { exito: true, eliminadas };
  }

  // ══════════════════════════════════════════════════════════
  // UTILIDADES PRIVADAS
  // ══════════════════════════════════════════════════════════

  _generarId() {
    return 'rc-' + Date.now().toString(36) + '-' +
           Math.random().toString(36).substr(2, 9);
  }

  _r2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }

  _fmt(n) {
    return (window.utilidades && window.utilidades.formatearBs)
      ? window.utilidades.formatearBs(n)
      : `Bs ${n.toFixed(2)}`;
  }
}

window.ModuloRCIVA = ModuloRCIVA;
