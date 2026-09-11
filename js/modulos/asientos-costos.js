// ══════════════════════════════════════════════════════════════
// asientos-costos.js — Módulo 8.11: Asientos Contables de Costos
// ══════════════════════════════════════════════════════════════

/**
 * Generación de Asientos Contables del Sistema de Costos
 *
 * Genera los asientos estándar del ciclo de costos:
 *   - Compra de Materia Prima
 *   - Salida de MP a Producción
 *   - Mano de Obra Directa
 *   - Aplicación de CIF
 *   - Productos Terminados
 *   - Venta y Costo
 *   - Variación CIF (sub/sobreabsorción)
 *
 * Todos los asientos se envían al Motor Contable (Módulo 3).
 */
class AsientosCostos {

  constructor(deps = {}) {
    this.almacenamiento = deps.almacenamiento || null;
    this.motorContable = deps.motorContable || null;
    this.KEY_ASIENTOS = 'erp_costos_asientos_generados';

    console.log('📒 Módulo Asientos de Costos inicializado');
  }

  // ══════════════════════════════════════════════════════════
  // ASIENTOS ESTÁNDAR DEL CICLO DE COSTOS
  // ══════════════════════════════════════════════════════════

  /**
   * Genera asiento de compra de Materia Prima.
   *
   *   Debe:  1.1.06.01 Inventario MP
   *   Debe:  1.1.08 IVA Crédito Fiscal (13%)
   *   Haber: 2.1.01 Cuentas por Pagar (o Bancos)
   */
  generarAsientoCompraMP(documentoCompra = {}) {
    const neto = Number(documentoCompra.neto || documentoCompra.subtotal || 0);
    const iva = Number(documentoCompra.iva || neto * 0.13);
    const total = this._r2(neto + iva);
    const fecha = documentoCompra.fecha || new Date().toISOString().split('T')[0];

    const lineas = [
      { cuentaCodigo: '1.1.06.01', cuentaNombre: 'Inventario Materia Prima', debe: neto, haber: 0 },
      { cuentaCodigo: '1.1.08', cuentaNombre: 'IVA Crédito Fiscal', debe: iva, haber: 0 },
      { cuentaCodigo: '2.1.01', cuentaNombre: 'Cuentas por Pagar', debe: 0, haber: total }
    ];

    return this._generarYRegistrar({
      fecha,
      concepto: `Compra MP - ${documentoCompra.documento || 'S/D'}`,
      lineas,
      tipo: 'COMPRA_MP',
      referencia: documentoCompra.documento || ''
    });
  }

  /**
   * Genera asiento de salida de MP a producción.
   *
   *   Debe:  1.1.06.02 Inventario PEP
   *   Haber: 1.1.06.01 Inventario MP
   */
  generarAsientoSalidaMP(ordenId, materiales = []) {
    const total = this._r2(materiales.reduce((s, m) => s + (m.costoTotal || 0), 0));
    const fecha = new Date().toISOString().split('T')[0];

    if (total <= 0) {
      return { exito: false, errores: ['Sin materiales para transferir'] };
    }

    const lineas = [
      { cuentaCodigo: '1.1.06.02', cuentaNombre: 'Inventario Productos en Proceso', debe: total, haber: 0 },
      { cuentaCodigo: '1.1.06.01', cuentaNombre: 'Inventario Materia Prima', debe: 0, haber: total }
    ];

    return this._generarYRegistrar({
      fecha,
      concepto: `Salida MP a Producción - ${ordenId}`,
      lineas,
      tipo: 'SALIDA_MP',
      referencia: ordenId
    });
  }

  /**
   * Genera asiento de Mano de Obra Directa.
   *
   *   Debe:  1.1.06.02 Inventario PEP
   *   Haber: 2.1.08 Nómina por Pagar
   */
  generarAsientoMOD(ordenId, horas, costoHora) {
    const total = this._r2((Number(horas) || 0) * (Number(costoHora) || 0));
    const fecha = new Date().toISOString().split('T')[0];

    if (total <= 0) {
      return { exito: false, errores: ['Total MOD debe ser mayor a 0'] };
    }

    const lineas = [
      { cuentaCodigo: '1.1.06.02', cuentaNombre: 'Inventario Productos en Proceso', debe: total, haber: 0 },
      { cuentaCodigo: '2.1.08', cuentaNombre: 'Nómina por Pagar', debe: 0, haber: total }
    ];

    return this._generarYRegistrar({
      fecha,
      concepto: `MOD - ${ordenId} (${horas}h × Bs ${costoHora})`,
      lineas,
      tipo: 'MANO_OBRA_DIRECTA',
      referencia: ordenId
    });
  }

  /**
   * Genera asiento de aplicación de CIF.
   *
   *   Debe:  1.1.06.02 Inventario PEP
   *   Haber: 4.1.99 CIF Aplicado
   */
  generarAsientoCIFAplicado(ordenId, monto) {
    const montoNum = this._r2(Number(monto) || 0);
    const fecha = new Date().toISOString().split('T')[0];

    if (montoNum <= 0) {
      return { exito: false, errores: ['Monto CIF debe ser mayor a 0'] };
    }

    const lineas = [
      { cuentaCodigo: '1.1.06.02', cuentaNombre: 'Inventario Productos en Proceso', debe: montoNum, haber: 0 },
      { cuentaCodigo: '4.1.99', cuentaNombre: 'CIF Aplicado', debe: 0, haber: montoNum }
    ];

    return this._generarYRegistrar({
      fecha,
      concepto: `CIF Aplicado - ${ordenId}`,
      lineas,
      tipo: 'CIF_APLICADO',
      referencia: ordenId
    });
  }

  /**
   * Genera asiento de transferencia a Productos Terminados.
   *
   *   Debe:  1.1.06.03 Inventario PT
   *   Haber: 1.1.06.02 Inventario PEP
   */
  generarAsientoProductoTerminado(ordenId, costoTotal) {
    const costo = this._r2(Number(costoTotal) || 0);
    const fecha = new Date().toISOString().split('T')[0];

    if (costo <= 0) {
      return { exito: false, errores: ['Costo total debe ser mayor a 0'] };
    }

    const lineas = [
      { cuentaCodigo: '1.1.06.03', cuentaNombre: 'Inventario Productos Terminados', debe: costo, haber: 0 },
      { cuentaCodigo: '1.1.06.02', cuentaNombre: 'Inventario Productos en Proceso', debe: 0, haber: costo }
    ];

    return this._generarYRegistrar({
      fecha,
      concepto: `Productos Terminados - ${ordenId}`,
      lineas,
      tipo: 'PRODUCTO_TERMINADO',
      referencia: ordenId
    });
  }

  /**
   * Genera asiento de venta y costo.
   *
   *   Debe:  5.1.01 Costo de Ventas
   *   Haber: 1.1.06.03 Inventario PT
   */
  generarAsientoVentaCosto(documentoVenta, costoVenta) {
    const costo = this._r2(Number(costoVenta) || 0);
    const fecha = documentoVenta.fecha || new Date().toISOString().split('T')[0];

    if (costo <= 0) {
      return { exito: false, errores: ['Costo de venta debe ser mayor a 0'] };
    }

    const lineas = [
      { cuentaCodigo: '5.1.01', cuentaNombre: 'Costo de Ventas', debe: costo, haber: 0 },
      { cuentaCodigo: '1.1.06.03', cuentaNombre: 'Inventario Productos Terminados', debe: 0, haber: costo }
    ];

    return this._generarYRegistrar({
      fecha,
      concepto: `Costo de Venta - ${documentoVenta.documento || documentoVenta.id || 'S/D'}`,
      lineas,
      tipo: 'VENTA_COSTO',
      referencia: documentoVenta.documento || documentoVenta.id || ''
    });
  }

  /**
   * Genera asiento de variación de CIF.
   *
   * Subabsorción:
   *   Debe:  5.1.01 Costo de Ventas
   *   Haber: 5.1.99 Variación CIF
   *
   * Sobreabsorción:
   *   Debe:  5.1.99 Variación CIF
   *   Haber: 5.1.01 Costo de Ventas
   */
  generarAsientoVariacionCIF(centroId, periodo, variacion) {
    const variacionNum = this._r2(Number(variacion) || 0);
    if (variacionNum === 0) {
      return { exito: false, errores: ['Sin variación que registrar'] };
    }

    const fecha = `${periodo || new Date().toISOString().split('T')[0].slice(0, 7)}-${new Date().getDate().toString().padStart(2, '0')}`;
    const absVariacion = Math.abs(variacionNum);

    const lineas = variacionNum > 0
      ? [
          { cuentaCodigo: '5.1.01', cuentaNombre: 'Costo de Ventas', debe: absVariacion, haber: 0 },
          { cuentaCodigo: '5.1.99', cuentaNombre: 'Variación CIF (Subabsorción)', debe: 0, haber: absVariacion }
        ]
      : [
          { cuentaCodigo: '5.1.99', cuentaNombre: 'Variación CIF (Sobreabsorción)', debe: absVariacion, haber: 0 },
          { cuentaCodigo: '5.1.01', cuentaNombre: 'Costo de Ventas', debe: 0, haber: absVariacion }
        ];

    return this._generarYRegistrar({
      fecha,
      concepto: `Variación CIF ${variacionNum > 0 ? 'Subabsorción' : 'Sobreabsorción'} - ${centroId}`,
      lineas,
      tipo: 'VARIACION_CIF',
      referencia: centroId,
      variacion: variacionNum
    });
  }

  // ══════════════════════════════════════════════════════════
  // CICLO COMPLETO
  // ══════════════════════════════════════════════════════════

  /**
   * Genera todos los asientos de un ciclo de producción completo.
   */
  generarCicloProduccionCompleto(datos = {}) {
    const resultados = {
      compraMP: null,
      salidaMP: null,
      manoObra: null,
      cifAplicado: null,
      productoTerminado: null
    };

    // 1. Compra MP
    if (datos.compraMP) {
      resultados.compraMP = this.generarAsientoCompraMP(datos.compraMP);
    }

    // 2. Salida MP a producción
    if (datos.ordenId && datos.materiales) {
      resultados.salidaMP = this.generarAsientoSalidaMP(datos.ordenId, datos.materiales);
    }

    // 3. Mano de obra directa
    if (datos.ordenId && datos.horas && datos.costoHora) {
      resultados.manoObra = this.generarAsientoMOD(datos.ordenId, datos.horas, datos.costoHora);
    }

    // 4. Aplicación CIF
    if (datos.ordenId && datos.cifMonto) {
      resultados.cifAplicado = this.generarAsientoCIFAplicado(datos.ordenId, datos.cifMonto);
    }

    // 5. Producto terminado
    if (datos.ordenId && datos.costoTotalProduccion) {
      resultados.productoTerminado = this.generarAsientoProductoTerminado(
        datos.ordenId,
        datos.costoTotalProduccion
      );
    }

    const exitosos = Object.values(resultados).filter(r => r && r.exito).length;
    const total = Object.values(resultados).filter(r => r !== null).length;

    console.log(`🔄 Ciclo de producción: ${exitosos}/${total} asientos generados`);

    return {
      exito: exitosos > 0,
      resultados,
      exitosos,
      total
    };
  }

  // ══════════════════════════════════════════════════════════
  // CONSULTAS
  // ══════════════════════════════════════════════════════════

  /**
   * Obtiene todos los asientos de costos generados.
   */
  obtenerTodos(filtros = {}) {
    const asientos = this._leerAsientos();
    let resultado = asientos;

    if (filtros.tipo) {
      resultado = resultado.filter(a => a.tipo === filtros.tipo);
    }
    if (filtros.periodo) {
      resultado = resultado.filter(a => a.fecha.startsWith(filtros.periodo));
    }
    if (filtros.referencia) {
      resultado = resultado.filter(a => a.referencia === filtros.referencia);
    }

    return resultado;
  }

  /**
   * Obtiene resumen de asientos por tipo.
   */
  obtenerResumenPorTipo(periodo) {
    const asientos = this.obtenerTodos({ periodo });
    const tipos = {};

    asientos.forEach(a => {
      if (!tipos[a.tipo]) {
        tipos[a.tipo] = { cantidad: 0, totalDebe: 0, totalHaber: 0 };
      }
      tipos[a.tipo].cantidad++;
      tipos[a.tipo].totalDebe += a.lineas.reduce((s, l) => s + (l.debe || 0), 0);
      tipos[a.tipo].totalHaber += a.lineas.reduce((s, l) => s + (l.haber || 0), 0);
    });

    return {
      periodo: periodo || 'ACUMULADO',
      totalAsientos: asientos.length,
      porTipo: tipos
    };
  }

  // ══════════════════════════════════════════════════════════
  // UTILIDADES PRIVADAS
  // ══════════════════════════════════════════════════════════

  _generarYRegistrar(datosAsiento) {
    const validacion = this._validarAsiento(datosAsiento);
    if (!validacion.valido) {
      return { exito: false, errores: validacion.errores };
    }

    let asientoContable = null;
    let asientoId = 'asc-' + Date.now().toString(36);

    if (this.motorContable && typeof this.motorContable.crearAsientoManual === 'function') {
      try {
        asientoContable = this.motorContable.crearAsientoManual({
          fecha: datosAsiento.fecha,
          concepto: datosAsiento.concepto,
          lineas: datosAsiento.lineas
        });
        if (asientoContable && asientoContable.id) {
          asientoId = asientoContable.id;
        }
      } catch (e) {
        console.warn('⚠️ No se pudo integrar con Motor Contable:', e.message);
      }
    }

    const registro = {
      id: asientoId,
      fecha: datosAsiento.fecha,
      concepto: datosAsiento.concepto,
      tipo: datosAsiento.tipo,
      referencia: datosAsiento.referencia || '',
      lineas: datosAsiento.lineas,
      totalDebe: this._r2(datosAsiento.lineas.reduce((s, l) => s + (l.debe || 0), 0)),
      totalHaber: this._r2(datosAsiento.lineas.reduce((s, l) => s + (l.haber || 0), 0)),
      integradoMotorContable: asientoContable !== null,
      fechaGeneracion: new Date().toISOString()
    };

    if (datosAsiento.variacion !== undefined) {
      registro.variacion = datosAsiento.variacion;
    }

    const asientos = this._leerAsientos();
    asientos.push(registro);
    this._guardarAsientos(asientos);

    console.log(`📒 Asiento registrado: ${registro.tipo} | ${registro.concepto} | Bs ${registro.totalDebe}`);
    return {
      exito: true,
      asiento: registro,
      integradoMotorContable: asientoContable !== null
    };
  }

  _validarAsiento(asiento) {
    const errores = [];

    if (!asiento.fecha) errores.push('Fecha requerida');
    if (!asiento.concepto) errores.push('Concepto requerido');
    if (!Array.isArray(asiento.lineas) || asiento.lineas.length < 2) {
      errores.push('Mínimo 2 líneas en el asiento');
    }

    const totalDebe = asiento.lineas.reduce((s, l) => s + (l.debe || 0), 0);
    const totalHaber = asiento.lineas.reduce((s, l) => s + (l.haber || 0), 0);

    if (Math.abs(totalDebe - totalHaber) > 0.01) {
      errores.push(`Asiento descuadrado: Debe ${totalDebe} ≠ Haber ${totalHaber}`);
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  _leerAsientos() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY_ASIENTOS) || '[]');
    } catch (e) {
      return [];
    }
  }

  _guardarAsientos(asientos) {
    localStorage.setItem(this.KEY_ASIENTOS, JSON.stringify(asientos));
  }

  _r2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }
}

window.AsientosCostosClase = AsientosCostos;
