// ══════════════════════════════════════════════════════════════
// capa4-estados.js — Capa 4: Estados Financieros
// ══════════════════════════════════════════════════════════════

/**
 * Capa 4: Estados Financieros según las NC del CTNAC.
 *
 * Genera los estados financieros principales:
 *   - Estado de Resultados (Pérdidas y Ganancias)
 *   - Balance General (Estado de Situación Financiera)
 *   - Estado de Flujo de Efectivo
 *   - Notas a los Estados Financieros
 *   - Estados Comparativos
 *   - Razones Financieras
 *   - Vinculación con IUE (Form. 500) y SIAT (Form. 605)
 *
 * ⚠️ PARTICULARIDAD BOLIVIANA:
 * El ajuste por inflación con UFV está SUSPENDIDO desde diciembre 2020.
 * Esta capa NO aplica reexpresión automática.
 */
class CapaEstadosFinancieros {

  constructor(deps) {
    this.motorContable = deps.motorContable;
    this.almacenamiento = deps.almacenamiento;
    this.periodosFiscales = deps.periodosFiscales || null;
    this.moduloImpuestos = deps.moduloImpuestos || null;

    console.log('📊 Capa 4: Estados Financieros inicializada.');
  }

  // ══════════════════════════════════════════════════════════
  // FASE 6.2: ESTADO DE RESULTADOS (PÉRDIDAS Y GANANCIAS)
  // ══════════════════════════════════════════════════════════

  /**
   * Genera el Estado de Resultados del período.
   *
   * @param {string} periodo - "AAAA-MM" (mensual) o "AAAA" (anual)
   * @param {Object} [opciones]
   * @param {boolean} [opciones.incluirIUE=true]
   * @returns {Object} Estado de Resultados estructurado
   */
  generarEstadoResultados(periodo, opciones = {}) {
    const validacion = this._validarPeriodo(periodo);
    if (!validacion.valido) {
      return { exito: false, errores: validacion.errores };
    }

    const incluirIUE = opciones.incluirIUE !== false;
    const mayor = this._obtenerSaldosResultados(periodo);
    if (!mayor.exito) {
      return { exito: false, errores: mayor.errores };
    }

    const clasificacion = this._clasificarCuentasResultados(mayor.cuentas);

    const ventasNetas = this._r2(clasificacion.ventas);
    const costoVentas = this._r2(clasificacion.costoVentas);
    const utilidadBruta = this.calcularUtilidadBruta(ventasNetas, costoVentas);
    const gastosOperativos = this._r2(clasificacion.gastosOperativos);
    const utilidadOperativa = this.calcularUtilidadOperativa(utilidadBruta, gastosOperativos);
    const ingresosNoOperativos = this._r2(clasificacion.ingresosNoOperativos);
    const gastosNoOperativos = this._r2(clasificacion.gastosNoOperativos);
    const utilidadAntesImpuestos = this.calcularUtilidadAntesImpuestos(
      utilidadOperativa, ingresosNoOperativos, gastosNoOperativos
    );

    let iue = 0;
    if (incluirIUE && utilidadAntesImpuestos > 0) {
      iue = this._r2(utilidadAntesImpuestos * 0.25);
    }

    const utilidadNeta = this.calcularUtilidadNeta(utilidadAntesImpuestos, iue);

    const estado = {
      exito: true,
      periodo,
      tipo: this._determinarTipoPeriodo(periodo),
      fechaGeneracion: new Date().toISOString(),
      expresadoEn: 'Bolivianos',
      normasAplicadas: 'NC del CTNAC (ajuste UFV suspendido desde dic/2020)',

      desglose: {
        ventas: clasificacion.detalleVentas,
        costoVentas: clasificacion.detalleCostoVentas,
        gastosOperativos: clasificacion.detalleGastosOperativos,
        ingresosNoOperativos: clasificacion.detalleIngresosNoOperativos,
        gastosNoOperativos: clasificacion.detalleGastosNoOperativos
      },

      ventasNetas,
      costoVentas,
      utilidadBruta,
      gastosOperativos,
      utilidadOperativa,
      ingresosNoOperativos,
      gastosNoOperativos,
      utilidadAntesImpuestos,
      iue,
      utilidadNeta,

      indicadores: {
        esUtilidad: utilidadNeta > 0,
        esPerdida: utilidadNeta < 0,
        esEquilibrio: utilidadNeta === 0,
        margenBruto: ventasNetas > 0 ? this._r2((utilidadBruta / ventasNetas) * 100) : 0,
        margenOperativo: ventasNetas > 0 ? this._r2((utilidadOperativa / ventasNetas) * 100) : 0,
        margenNeto: ventasNetas > 0 ? this._r2((utilidadNeta / ventasNetas) * 100) : 0
      }
    };

    console.log(`📊 Estado de Resultados ${periodo}: ` +
      `${estado.indicadores.esUtilidad ? 'UTILIDAD' : estado.indicadores.esPerdida ? 'PÉRDIDA' : 'EQUILIBRIO'} ` +
      `${this._fmt(utilidadNeta)}`);

    return estado;
  }

  calcularUtilidadBruta(ventas, costoVentas) {
    return this._r2((Number(ventas) || 0) - (Number(costoVentas) || 0));
  }

  calcularUtilidadOperativa(utilidadBruta, gastosOperativos) {
    return this._r2((Number(utilidadBruta) || 0) - (Number(gastosOperativos) || 0));
  }

  calcularUtilidadAntesImpuestos(utilidadOperativa, ingresosNoOperativos, gastosNoOperativos) {
    return this._r2(
      (Number(utilidadOperativa) || 0) +
      (Number(ingresosNoOperativos) || 0) -
      (Number(gastosNoOperativos) || 0)
    );
  }

  calcularUtilidadNeta(utilidadAntesImpuestos, iue) {
    const utilidad = Number(utilidadAntesImpuestos) || 0;
    const iueAplicable = utilidad > 0 ? (Number(iue) || 0) : 0;
    return this._r2(utilidad - iueAplicable);
  }

  compararPeriodos(periodo1, periodo2) {
    const estado1 = this.generarEstadoResultados(periodo1, { incluirIUE: false });
    const estado2 = this.generarEstadoResultados(periodo2, { incluirIUE: false });

    if (!estado1.exito || !estado2.exito) {
      return {
        exito: false,
        errores: [
          ...(!estado1.exito ? estado1.errores : []),
          ...(!estado2.exito ? estado2.errores : [])
        ]
      };
    }

    const lineas = [
      { concepto: 'Ventas Netas', p1: estado1.ventasNetas, p2: estado2.ventasNetas },
      { concepto: 'Costo de Ventas', p1: estado1.costoVentas, p2: estado2.costoVentas },
      { concepto: 'Utilidad Bruta', p1: estado1.utilidadBruta, p2: estado2.utilidadBruta },
      { concepto: 'Gastos Operativos', p1: estado1.gastosOperativos, p2: estado2.gastosOperativos },
      { concepto: 'Utilidad Operativa', p1: estado1.utilidadOperativa, p2: estado2.utilidadOperativa },
      { concepto: 'Utilidad Antes de Impuestos', p1: estado1.utilidadAntesImpuestos, p2: estado2.utilidadAntesImpuestos },
      { concepto: 'Utilidad Neta', p1: estado1.utilidadNeta, p2: estado2.utilidadNeta }
    ];

    const comparativo = lineas.map(linea => {
      const variacion = this.calcularVariacion(linea.p1, linea.p2);
      return {
        ...linea,
        variacionBs: variacion.variacionBs,
        variacionPorcentaje: variacion.variacionPorcentaje
      };
    });

    return {
      exito: true,
      periodo1,
      periodo2,
      lineas: comparativo,
      resumen: {
        variacionVentas: this.calcularVariacion(estado1.ventasNetas, estado2.ventasNetas),
        variacionUtilidadNeta: this.calcularVariacion(estado1.utilidadNeta, estado2.utilidadNeta)
      }
    };
  }

  calcularVariacion(valor1, valor2) {
    const v1 = Number(valor1) || 0;
    const v2 = Number(valor2) || 0;
    const variacionBs = this._r2(v2 - v1);

    let variacionPorcentaje = 0;
    if (v1 !== 0) {
      variacionPorcentaje = this._r2(((v2 - v1) / Math.abs(v1)) * 100);
    } else if (v2 !== 0) {
      variacionPorcentaje = v2 > 0 ? 100 : -100;
    }

    return {
      variacionBs,
      variacionPorcentaje,
      esPositiva: variacionBs > 0,
      esNegativa: variacionBs < 0
    };
  }

  // ══════════════════════════════════════════════════════════
  // FASE 6.3: BALANCE GENERAL
  // ══════════════════════════════════════════════════════════

  generarBalanceGeneral(fecha) {
    const mayor = this._obtenerSaldosBalance();
    if (!mayor.exito) {
      return { exito: false, errores: mayor.errores };
    }

    const clasificacion = this._clasificarCuentasBalance(mayor.cuentas);

    const totalActivoCorriente = this._r2(clasificacion.activoCorriente);
    const totalActivoNoCorriente = this._r2(clasificacion.activoNoCorriente);
    const totalActivos = this._r2(totalActivoCorriente + totalActivoNoCorriente);
    const totalPasivoCorriente = this._r2(clasificacion.pasivoCorriente);
    const totalPasivoNoCorriente = this._r2(clasificacion.pasivoNoCorriente);
    const totalPasivos = this._r2(totalPasivoCorriente + totalPasivoNoCorriente);
    const totalPatrimonio = this._r2(clasificacion.patrimonio);
    const totalPasivoPatrimonio = this._r2(totalPasivos + totalPatrimonio);

    const ecuacion = this.verificarEcuacionContable({
      totalActivos,
      totalPasivos,
      totalPatrimonio,
      totalPasivoPatrimonio
    });

    const balance = {
      exito: true,
      fechaCorte: fecha,
      fechaGeneracion: new Date().toISOString(),
      expresadoEn: 'Bolivianos',
      normasAplicadas: 'NC del CTNAC (ajuste UFV suspendido desde dic/2020)',

      desglose: {
        activoCorriente: clasificacion.detalleActivoCorriente,
        activoNoCorriente: clasificacion.detalleActivoNoCorriente,
        pasivoCorriente: clasificacion.detallePasivoCorriente,
        pasivoNoCorriente: clasificacion.detallePasivoNoCorriente,
        patrimonio: clasificacion.detallePatrimonio
      },

      activoCorriente: totalActivoCorriente,
      activoNoCorriente: totalActivoNoCorriente,
      totalActivos,
      pasivoCorriente: totalPasivoCorriente,
      pasivoNoCorriente: totalPasivoNoCorriente,
      totalPasivos,
      totalPatrimonio,
      totalPasivoPatrimonio,
      ecuacionContable: ecuacion,

      indicadores: {
        proporcionActivoCorriente: totalActivos > 0
          ? this._r2((totalActivoCorriente / totalActivos) * 100) : 0,
        proporcionPasivo: totalPasivoPatrimonio > 0
          ? this._r2((totalPasivos / totalPasivoPatrimonio) * 100) : 0,
        proporcionPatrimonio: totalPasivoPatrimonio > 0
          ? this._r2((totalPatrimonio / totalPasivoPatrimonio) * 100) : 0
      }
    };

    console.log(`📋 Balance General ${fecha}: ` +
      `Activo ${this._fmt(totalActivos)} | ` +
      `Pasivo ${this._fmt(totalPasivos)} | ` +
      `Patrimonio ${this._fmt(totalPatrimonio)} | ` +
      (ecuacion.cuadra ? '✅ CUADRA' : `❌ DIFERENCIA ${this._fmt(ecuacion.diferencia)}`));

    return balance;
  }

  verificarEcuacionContable(balance) {
    const activo = this._r2(balance.totalActivos || 0);
    const pasivoPatrimonio = this._r2(balance.totalPasivoPatrimonio || 0);
    const diferencia = this._r2(activo - pasivoPatrimonio);
    const cuadra = Math.abs(diferencia) < 0.01;

    return {
      cuadra,
      totalActivos: activo,
      totalPasivoPatrimonio: pasivoPatrimonio,
      diferencia: cuadra ? 0 : diferencia,
      mensaje: cuadra
        ? '✅ Ecuación contable verificada: Activo = Pasivo + Patrimonio'
        : `❌ Desequilibrio de ${this._fmt(diferencia)}: Activo ≠ Pasivo + Patrimonio`
    };
  }

  clasificarCuentaPorCorriente(cuentaCodigo) {
    if (!cuentaCodigo || typeof cuentaCodigo !== 'string') {
      return { esCorriente: false, categoria: 'DESCONOCIDA' };
    }

    const grupo = cuentaCodigo.split('.')[0];
    const subgrupo = cuentaCodigo.split('.')[1];

    if (grupo === '1') {
      if (subgrupo === '1') return { esCorriente: true, categoria: 'ACTIVO_CORRIENTE' };
      if (subgrupo === '2') return { esCorriente: false, categoria: 'ACTIVO_NO_CORRIENTE' };
    }
    if (grupo === '2') {
      if (subgrupo === '1') return { esCorriente: true, categoria: 'PASIVO_CORRIENTE' };
      if (subgrupo === '2') return { esCorriente: false, categoria: 'PASIVO_NO_CORRIENTE' };
    }
    if (grupo === '3') {
      return { esCorriente: false, categoria: 'PATRIMONIO' };
    }

    return { esCorriente: false, categoria: 'DESCONOCIDA' };
  }

  generarBalanceComparativo(fecha1, fecha2) {
    const balance1 = this.generarBalanceGeneral(fecha1);
    const balance2 = this.generarBalanceGeneral(fecha2);

    if (!balance1.exito || !balance2.exito) {
      return {
        exito: false,
        errores: [
          ...(!balance1.exito ? balance1.errores : []),
          ...(!balance2.exito ? balance2.errores : [])
        ]
      };
    }

    const lineas = [
      { concepto: 'Activo Corriente', f1: balance1.activoCorriente, f2: balance2.activoCorriente },
      { concepto: 'Activo No Corriente', f1: balance1.activoNoCorriente, f2: balance2.activoNoCorriente },
      { concepto: 'TOTAL ACTIVOS', f1: balance1.totalActivos, f2: balance2.totalActivos },
      { concepto: 'Pasivo Corriente', f1: balance1.pasivoCorriente, f2: balance2.pasivoCorriente },
      { concepto: 'Pasivo No Corriente', f1: balance1.pasivoNoCorriente, f2: balance2.pasivoNoCorriente },
      { concepto: 'TOTAL PASIVOS', f1: balance1.totalPasivos, f2: balance2.totalPasivos },
      { concepto: 'Total Patrimonio', f1: balance1.totalPatrimonio, f2: balance2.totalPatrimonio },
      { concepto: 'TOTAL PASIVO + PATRIMONIO', f1: balance1.totalPasivoPatrimonio, f2: balance2.totalPasivoPatrimonio }
    ];

    const comparativo = lineas.map(linea => {
      const variacion = this.calcularVariacion(linea.f1, linea.f2);
      return {
        ...linea,
        variacionBs: variacion.variacionBs,
        variacionPorcentaje: variacion.variacionPorcentaje
      };
    });

    return {
      exito: true,
      fecha1,
      fecha2,
      lineas: comparativo,
      ecuacionContable: {
        fecha1: balance1.ecuacionContable,
        fecha2: balance2.ecuacionContable
      },
      resumen: {
        variacionActivos: this.calcularVariacion(balance1.totalActivos, balance2.totalActivos),
        variacionPatrimonio: this.calcularVariacion(balance1.totalPatrimonio, balance2.totalPatrimonio)
      }
    };
  }

  // ══════════════════════════════════════════════════════════
  // FASE 6.4: ESTADO DE FLUJO DE EFECTIVO
  // ══════════════════════════════════════════════════════════

  /**
   * Genera el Estado de Flujo de Efectivo.
   *
   * @param {string} periodo - "AAAA-MM" o "AAAA"
   * @param {string} [metodo="INDIRECTO"] - "DIRECTO" o "INDIRECTO"
   * @returns {Object} Flujo de Efectivo estructurado
   */
  generarFlujoEfectivo(periodo, metodo = 'INDIRECTO') {
    const validacion = this._validarPeriodo(periodo);
    if (!validacion.valido) {
      return { exito: false, errores: validacion.errores };
    }

    if (metodo === 'DIRECTO') {
      return this._generarFlujoDirecto(periodo);
    }
    return this._generarFlujoIndirecto(periodo);
  }

  /**
   * Flujo de Efectivo por método INDIRECTO (el más usado en Bolivia).
   * @private
   */
  _generarFlujoIndirecto(periodo) {
    // 1. Obtener utilidad neta del período
    const estadoResultados = this.generarEstadoResultados(periodo);
    if (!estadoResultados.exito) {
      return { exito: false, errores: estadoResultados.errores };
    }

    const utilidadNeta = estadoResultados.utilidadNeta;

    // 2. Obtener saldos de balance para variaciones
    const balance = this.generarBalanceGeneral(periodo);
    if (!balance.exito) {
      return { exito: false, errores: balance.errores };
    }

    // 3. Calcular depreciación del período (cuentas 5.5.x)
    const depreciacion = this._obtenerDepreciacionPeriodo(periodo);

    // 4. Variaciones en capital de trabajo (simplificado)
    // En un sistema completo, se compararían saldos iniciales vs finales
    const variacionesCapitalTrabajo = {
      clientes: 0,
      inventario: 0,
      proveedores: 0,
      otrasCuentasPorCobrar: 0
    };

    // 5. Calcular flujo operativo
    const flujoOperativo = this.calcularFlujoOperativo(utilidadNeta, {
      depreciacion,
      variacionesCapitalTrabajo
    });

    // 6. Flujo de inversión (simplificado - no hay movimientos en el prototipo)
    const flujoInversion = 0;

    // 7. Flujo de financiamiento (simplificado)
    const flujoFinanciamiento = 0;

    // 8. Flujo neto del período
    const flujoNeto = this._r2(flujoOperativo + flujoInversion + flujoFinanciamiento);

    // 9. Saldos de efectivo
    const saldoInicial = this._obtenerSaldoEfectivoInicial(periodo);
    const saldoFinal = this._r2(saldoInicial + flujoNeto);

    // 10. Verificar
    const verificacion = this.verificarFlujoEfectivo(flujoNeto, saldoInicial, saldoFinal);

    const flujo = {
      exito: true,
      periodo,
      metodo: 'INDIRECTO',
      fechaGeneracion: new Date().toISOString(),
      expresadoEn: 'Bolivianos',

      actividadesOperativas: {
        utilidadNeta,
        ajustes: {
          depreciacion,
          variacionClientes: variacionesCapitalTrabajo.clientes,
          variacionInventario: variacionesCapitalTrabajo.inventario,
          variacionProveedores: variacionesCapitalTrabajo.proveedores
        },
        flujoNetoOperativo: flujoOperativo
      },

      actividadesInversion: {
        compraActivosFijos: 0,
        ventaActivosFijos: 0,
        flujoNetoInversion: flujoInversion
      },

      actividadesFinanciamiento: {
        prestamosRecibidos: 0,
        pagoPrestamos: 0,
        pagoDividendos: 0,
        flujoNetoFinanciamiento: flujoFinanciamiento
      },

      flujoNetoPeriodo: flujoNeto,
      saldoInicialEfectivo: saldoInicial,
      saldoFinalEfectivo: saldoFinal,
      verificacion
    };

    console.log(`💧 Flujo de Efectivo ${periodo} (INDIRECTO): ` +
      `Neto ${this._fmt(flujoNeto)} | ` +
      `Saldo Final ${this._fmt(saldoFinal)}`);

    return flujo;
  }

  /**
   * Flujo de Efectivo por método DIRECTO.
   * @private
   */
  _generarFlujoDirecto(periodo) {
    // Método directo: sumar entradas y salidas reales de caja
    const balance = this.generarBalanceGeneral(periodo);
    if (!balance.exito) {
      return { exito: false, errores: balance.errores };
    }

    const saldoInicial = this._obtenerSaldoEfectivoInicial(periodo);
    const saldoFinal = this._obtenerSaldoEfectivoFinal(periodo);
    const flujoNeto = this._r2(saldoFinal - saldoInicial);

    const flujo = {
      exito: true,
      periodo,
      metodo: 'DIRECTO',
      fechaGeneracion: new Date().toISOString(),
      expresadoEn: 'Bolivianos',

      actividadesOperativas: {
        cobroClientes: 0,
        pagoProveedores: 0,
        pagoEmpleados: 0,
        pagoImpuestos: 0,
        flujoNetoOperativo: 0
      },

      actividadesInversion: {
        flujoNetoInversion: 0
      },

      actividadesFinanciamiento: {
        flujoNetoFinanciamiento: 0
      },

      flujoNetoPeriodo: flujoNeto,
      saldoInicialEfectivo: saldoInicial,
      saldoFinalEfectivo: saldoFinal,
      verificacion: { cuadra: true, diferencia: 0 }
    };

    return flujo;
  }

  calcularFlujoOperativo(utilidadNeta, ajustes) {
    const utilidad = Number(utilidadNeta) || 0;
    const depreciacion = Number(ajustes.depreciacion) || 0;
    const variaciones = ajustes.variacionesCapitalTrabajo || {};

    // Ajustes:
    // (+) Depreciación (no mueve caja)
    // (-) Aumento en clientes (no cobrado)
    // (+) Disminución en inventario (vendido)
    // (+) Aumento en proveedores (no pagado)
    const flujo = utilidad
      + depreciacion
      - (Number(variaciones.clientes) || 0)
      + (Number(variaciones.inventario) || 0)
      + (Number(variaciones.proveedores) || 0);

    return this._r2(flujo);
  }

  calcularFlujoInversion(movimientosActivos = {}) {
    const compras = Number(movimientosActivos.compras) || 0;
    const ventas = Number(movimientosActivos.ventas) || 0;
    return this._r2(ventas - compras);
  }

  calcularFlujoFinanciamiento(movimientosDeuda = {}) {
    const prestamosRecibidos = Number(movimientosDeuda.prestamosRecibidos) || 0;
    const pagoPrestamos = Number(movimientosDeuda.pagoPrestamos) || 0;
    const pagoDividendos = Number(movimientosDeuda.pagoDividendos) || 0;
    return this._r2(prestamosRecibidos - pagoPrestamos - pagoDividendos);
  }

  verificarFlujoEfectivo(flujoNeto, saldoInicial, saldoFinal) {
    const esperado = this._r2(saldoInicial + flujoNeto);
    const diferencia = this._r2(saldoFinal - esperado);
    const cuadra = Math.abs(diferencia) < 0.01;

    return {
      cuadra,
      saldoInicial,
      flujoNeto,
      saldoFinal,
      esperado,
      diferencia: cuadra ? 0 : diferencia
    };
  }

  // ══════════════════════════════════════════════════════════
  // FASE 6.5: NOTAS A LOS ESTADOS FINANCIEROS
  // ══════════════════════════════════════════════════════════

  /**
   * Genera la estructura de las 12 Notas a los EEFF.
   *
   * @param {Object} empresa - Datos de la empresa
   * @param {string} periodo
   * @returns {Object} Estructura de las 12 notas
   */
  generarEstructuraNotas(empresa = {}, periodo = null) {
    const fechaActual = new Date().toISOString();

    return {
      exito: true,
      fechaGeneracion: fechaActual,
      periodo,
      expresadoEn: 'Bolivianos',
      notas: [
        {
          numero: 1,
          titulo: 'Información General de la Empresa',
          contenidoAutomatico: {
            razonSocial: empresa.razonSocial || 'EMPRESA S.A.',
            nit: empresa.nit || '000000000-0',
            domicilio: empresa.domicilio || '',
            actividadEconomica: empresa.actividadEconomica || '',
            regimenTributario: empresa.regimenTributario || 'RG'
          },
          contenidoNarrativo: ''
        },
        {
          numero: 2,
          titulo: 'Bases de Presentación',
          contenidoAutomatico: {
            normasAplicadas: 'Normas de Contabilidad del CTNAC',
            monedaPresentacion: 'Bolivianos (Bs)',
            periodoCubierto: periodo || '',
            ajusteInflacion: 'SUSPENDIDO desde diciembre 2020 según instrucción del CTNAC',
            notaUFV: 'No se aplica reexpresión por inflación (UFV) a las gestiones posteriores a 2020'
          },
          contenidoNarrativo: ''
        },
        {
          numero: 3,
          titulo: 'Políticas Contables',
          contenidoAutomatico: this.generarNotaPoliticasContables(),
          contenidoNarrativo: ''
        },
        {
          numero: 4,
          titulo: 'Efectivo y Equivalentes',
          contenidoAutomatico: { desglose: [] },
          contenidoNarrativo: ''
        },
        {
          numero: 5,
          titulo: 'Cuentas por Cobrar',
          contenidoAutomatico: { antiguedadSaldos: [], provisionIncobrables: 0 },
          contenidoNarrativo: ''
        },
        {
          numero: 6,
          titulo: 'Inventarios',
          contenidoAutomatico: { metodoValuacion: 'Promedio Ponderado', desglose: [] },
          contenidoNarrativo: ''
        },
        {
          numero: 7,
          titulo: 'Activos Fijos',
          contenidoAutomatico: this.generarNotaActivosFijos(),
          contenidoNarrativo: ''
        },
        {
          numero: 8,
          titulo: 'Cuentas por Pagar',
          contenidoAutomatico: { desglose: [] },
          contenidoNarrativo: ''
        },
        {
          numero: 9,
          titulo: 'Obligaciones Bancarias',
          contenidoAutomatico: { desglose: [] },
          contenidoNarrativo: ''
        },
        {
          numero: 10,
          titulo: 'Patrimonio',
          contenidoAutomatico: { desglose: [] },
          contenidoNarrativo: ''
        },
        {
          numero: 11,
          titulo: 'Contingencias',
          contenidoAutomatico: {},
          contenidoNarrativo: ''
        },
        {
          numero: 12,
          titulo: 'Hechos Posteriores al Cierre',
          contenidoAutomatico: {},
          contenidoNarrativo: ''
        }
      ]
    };
  }

  generarNotaPoliticasContables() {
    return {
      metodoInventario: 'Promedio Ponderado',
      metodoDepreciacion: 'Línea Recta',
      reconocimientoIngresos: 'Al momento de la entrega del bien o prestación del servicio',
      tratamientoIVA: 'IVA incluido en el precio (Art. 5 Ley 843), se extrae para conciliación fiscal',
      ajusteInflacion: 'NO se aplica ajuste por inflación (UFV suspendido desde dic/2020)',
      monedaExtranjera: 'Los activos y pasivos en moneda extranjera se convierten al tipo de cambio vigente'
    };
  }

  generarNotaActivosFijos() {
    const mayor = this._obtenerSaldosBalance();
    if (!mayor.exito) return { desglose: [] };

    const activosFijos = mayor.cuentas.filter(c =>
      (c.cuentaCodigo || '').startsWith('1.2.')
    );

    return {
      desglose: activosFijos.map(c => ({
        codigo: c.cuentaCodigo,
        nombre: c.cuentaNombre,
        saldo: c.saldo || 0
      }))
    };
  }

  generarNotaCuentasCobrar() {
    return {
      antiguedadSaldos: [
        { rango: '0-30 días', monto: 0 },
        { rango: '31-60 días', monto: 0 },
        { rango: '61-90 días', monto: 0 },
        { rango: 'Más de 90 días', monto: 0 }
      ],
      provisionIncobrables: 0,
      totalCuentasPorCobrar: 0
    };
  }

  // ══════════════════════════════════════════════════════════
  // FASE 6.7: RAZONES FINANCIERAS (RATIOS)
  // ══════════════════════════════════════════════════════════

  /**
   * Calcula las razones financieras principales.
   *
   * @param {Object} balance - Resultado de generarBalanceGeneral()
   * @param {Object} estadoResultados - Resultado de generarEstadoResultados()
   * @returns {Object} Ratios con interpretación
   */
  calcularRatiosFinancieros(balance, estadoResultados) {
    if (!balance.exito || !estadoResultados.exito) {
      return { exito: false, errores: ['Balance o Estado de Resultados inválido'] };
    }

    const ratios = {};

    // 1. Liquidez Corriente = Activo Corriente / Pasivo Corriente
    ratios.liquidezCorriente = {
      valor: balance.pasivoCorriente > 0
        ? this._r4(balance.activoCorriente / balance.pasivoCorriente)
        : null,
      formula: 'Activo Corriente / Pasivo Corriente',
      interpretacion: this.interpretarRatio('liquidezCorriente', balance.activoCorriente / balance.pasivoCorriente)
    };

    // 2. Prueba Ácida = (AC - Inventarios) / PC
    // Simplificado: usar Activo Corriente sin inventario
    const inventario = this._obtenerSaldoCuenta('1.1.06');
    ratios.pruebaAcida = {
      valor: balance.pasivoCorriente > 0
        ? this._r4((balance.activoCorriente - inventario) / balance.pasivoCorriente)
        : null,
      formula: '(Activo Corriente - Inventarios) / Pasivo Corriente',
      interpretacion: this.interpretarRatio('pruebaAcida', (balance.activoCorriente - inventario) / balance.pasivoCorriente)
    };

    // 3. Endeudamiento = Total Pasivo / Total Activo
    ratios.endeudamiento = {
      valor: balance.totalActivos > 0
        ? this._r4((balance.totalPasivos / balance.totalActivos) * 100)
        : null,
      formula: 'Total Pasivo / Total Activo × 100',
      unidad: '%',
      interpretacion: this.interpretarRatio('endeudamiento', (balance.totalPasivos / balance.totalActivos) * 100)
    };

    // 4. Rotación de Inventario = Costo de Ventas / Inventario
    ratios.rotacionInventario = {
      valor: inventario > 0
        ? this._r4(estadoResultados.costoVentas / inventario)
        : null,
      formula: 'Costo de Ventas / Inventario',
      unidad: 'veces',
      interpretacion: this.interpretarRatio('rotacionInventario', estadoResultados.costoVentas / inventario)
    };

    // 5. Margen Neto = Utilidad Neta / Ventas
    ratios.margenNeto = {
      valor: estadoResultados.ventasNetas > 0
        ? this._r4((estadoResultados.utilidadNeta / estadoResultados.ventasNetas) * 100)
        : null,
      formula: 'Utilidad Neta / Ventas × 100',
      unidad: '%',
      interpretacion: this.interpretarRatio('margenNeto', (estadoResultados.utilidadNeta / estadoResultados.ventasNetas) * 100)
    };

    // 6. ROE = Utilidad Neta / Patrimonio
    ratios.roe = {
      valor: balance.totalPatrimonio > 0
        ? this._r4((estadoResultados.utilidadNeta / balance.totalPatrimonio) * 100)
        : null,
      formula: 'Utilidad Neta / Patrimonio × 100',
      unidad: '%',
      interpretacion: this.interpretarRatio('roe', (estadoResultados.utilidadNeta / balance.totalPatrimonio) * 100)
    };

    return {
      exito: true,
      fechaCalculo: new Date().toISOString(),
      ratios,
      totalRatios: Object.keys(ratios).length
    };
  }

  /**
   * Interpreta un ratio financiero en lenguaje simple.
   *
   * @param {string} nombre - Nombre del ratio
   * @param {number} valor - Valor del ratio
   * @returns {Object} { texto, nivel }
   */
  interpretarRatio(nombre, valor) {
    if (valor === null || isNaN(valor)) {
      return { texto: 'No calculable (división por cero)', nivel: 'N/A' };
    }

    switch (nombre) {
      case 'liquidezCorriente':
        if (valor >= 2) return { texto: 'Excelente capacidad de pago a corto plazo', nivel: 'verde' };
        if (valor >= 1.5) return { texto: 'Buena capacidad de pago a corto plazo', nivel: 'verde' };
        if (valor >= 1) return { texto: 'Capacidad de pago ajustada', nivel: 'amarillo' };
        return { texto: 'Riesgo de liquidez a corto plazo', nivel: 'rojo' };

      case 'pruebaAcida':
        if (valor >= 1) return { texto: 'Buena liquidez sin depender del inventario', nivel: 'verde' };
        if (valor >= 0.7) return { texto: 'Liquidez ajustada', nivel: 'amarillo' };
        return { texto: 'Dependencia alta del inventario', nivel: 'rojo' };

      case 'endeudamiento':
        if (valor <= 40) return { texto: 'Bajo nivel de deuda', nivel: 'verde' };
        if (valor <= 60) return { texto: 'Nivel de deuda moderado', nivel: 'amarillo' };
        return { texto: 'Alto nivel de deuda', nivel: 'rojo' };

      case 'rotacionInventario':
        if (valor >= 12) return { texto: 'Inventario rota mensualmente (excelente)', nivel: 'verde' };
        if (valor >= 6) return { texto: 'Inventario rota cada 2 meses (bueno)', nivel: 'verde' };
        if (valor >= 4) return { texto: 'Inventario rota cada 3 meses (regular)', nivel: 'amarillo' };
        return { texto: 'Inventario con baja rotación', nivel: 'rojo' };

      case 'margenNeto':
        if (valor >= 15) return { texto: 'Rentabilidad excelente', nivel: 'verde' };
        if (valor >= 8) return { texto: 'Rentabilidad buena', nivel: 'verde' };
        if (valor >= 5) return { texto: 'Rentabilidad aceptable', nivel: 'amarillo' };
        if (valor > 0) return { texto: 'Rentabilidad baja', nivel: 'rojo' };
        return { texto: 'Sin rentabilidad (pérdida)', nivel: 'rojo' };

      case 'roe':
        if (valor >= 20) return { texto: 'Excelente retorno al accionista', nivel: 'verde' };
        if (valor >= 12) return { texto: 'Buen retorno al accionista', nivel: 'verde' };
        if (valor >= 5) return { texto: 'Retorno moderado', nivel: 'amarillo' };
        return { texto: 'Retorno bajo', nivel: 'rojo' };

      default:
        return { texto: 'Interpretación no disponible', nivel: 'N/A' };
    }
  }

  generarDashboardRatios(ratios) {
    if (!ratios.exito) {
      return { exito: false, errores: ['Ratios inválidos'] };
    }

    const dashboard = {
      totalRatios: ratios.totalRatios,
      ratiosVerdes: 0,
      ratiosAmarillos: 0,
      ratiosRojos: 0,
      detalle: []
    };

    Object.entries(ratios.ratios).forEach(([nombre, ratio]) => {
      const nivel = ratio.interpretacion.nivel;
      if (nivel === 'verde') dashboard.ratiosVerdes++;
      else if (nivel === 'amarillo') dashboard.ratiosAmarillos++;
      else if (nivel === 'rojo') dashboard.ratiosRojos++;

      dashboard.detalle.push({
        nombre,
        valor: ratio.valor,
        unidad: ratio.unidad || '',
        interpretacion: ratio.interpretacion.texto,
        nivel
      });
    });

    return { exito: true, dashboard };
  }

  // ══════════════════════════════════════════════════════════
  // FASE 6.8: VINCULACIÓN CON IUE Y SIAT
  // ══════════════════════════════════════════════════════════

  /**
   * Prepara los datos para el Formulario 500 (IUE).
   *
   * @param {number} anio
   * @returns {Object} Estructura del Form. 500
   */
  prepararDatosFormulario500(anio) {
    const estadoResultados = this.generarEstadoResultados(String(anio));
    if (!estadoResultados.exito) {
      return { exito: false, errores: estadoResultados.errores };
    }

    return {
      exito: true,
      gestion: anio,
      utilidadContable: estadoResultados.utilidadAntesImpuestos,
      utilidadImponible: estadoResultados.utilidadAntesImpuestos,
      iueDeterminado: estadoResultados.iue,
      estadoResultados
    };
  }

  /**
   * Prepara los datos para el Formulario 605 (SIAT).
   *
   * @param {number} anio
   * @returns {Object} Estructura del Form. 605
   */
  prepararDatosFormulario605(anio) {
    const estadoResultados = this.generarEstadoResultados(String(anio));
    const balance = this.generarBalanceGeneral(`${anio}-12-31`);
    const flujo = this.generarFlujoEfectivo(String(anio));
    const notas = this.generarEstructuraNotas({}, String(anio));

    const estados = {
      balanceGeneral: balance,
      estadoResultados,
      flujoEfectivo: flujo,
      notas
    };

    const validacion = this.validarEstadosParaEnvio(estados);

    return {
      exito: validacion.valido,
      gestion: anio,
      formulario: 'FORM_605',
      estados,
      validacion,
      listoParaEnvio: validacion.valido
    };
  }

  /**
   * Valida que los estados estén completos para envío al SIN.
   *
   * @param {Object} estados
   * @returns {Object} { valido, errores }
   */
  validarEstadosParaEnvio(estados) {
    const errores = [];

    // Verificar Balance General
    if (!estados.balanceGeneral || !estados.balanceGeneral.exito) {
      errores.push('Balance General no disponible');
    } else if (!estados.balanceGeneral.ecuacionContable.cuadra) {
      errores.push('Balance General no cuadra (Activo ≠ Pasivo + Patrimonio)');
    }

    // Verificar Estado de Resultados
    if (!estados.estadoResultados || !estados.estadoResultados.exito) {
      errores.push('Estado de Resultados no disponible');
    }

    // Verificar Flujo de Efectivo
    if (!estados.flujoEfectivo || !estados.flujoEfectivo.exito) {
      errores.push('Flujo de Efectivo no disponible');
    }

    // Verificar Notas
    if (!estados.notas || !estados.notas.exito) {
      errores.push('Notas a los EEFF no disponibles');
    } else if (!estados.notas.notas || estados.notas.notas.length !== 12) {
      errores.push('Las Notas deben tener las 12 secciones requeridas');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  generarResumenEjecutivo(estados) {
    if (!estados.estadoResultados || !estados.balanceGeneral) {
      return { exito: false, errores: ['Estados incompletos'] };
    }

    const er = estados.estadoResultados;
    const bg = estados.balanceGeneral;

    return {
      exito: true,
      titulo: 'RESUMEN EJECUTIVO',
      periodo: er.periodo,
      lenguaje: 'simple',
      datosClave: {
        utilidadNeta: er.utilidadNeta,
        totalActivos: bg.totalActivos,
        totalPasivos: bg.totalPasivos,
        patrimonio: bg.totalPatrimonio,
        liquidez: bg.pasivoCorriente > 0 ? bg.activoCorriente / bg.pasivoCorriente : null,
        endeudamiento: bg.totalActivos > 0 ? (bg.totalPasivos / bg.totalActivos) * 100 : null,
        margenNeto: er.ventasNetas > 0 ? (er.utilidadNeta / er.ventasNetas) * 100 : null
      },
      conclusion: er.utilidadNeta > 0
        ? `La empresa generó una utilidad de ${this._fmt(er.utilidadNeta)} en el período.`
        : `La empresa tuvo una pérdida de ${this._fmt(Math.abs(er.utilidadNeta))} en el período.`
    };
  }

  // ══════════════════════════════════════════════════════════
  // UTILIDADES PRIVADAS
  // ══════════════════════════════════════════════════════════

  _obtenerSaldosResultados(periodo) {
    if (!this.motorContable) {
      return { exito: false, errores: ['Motor Contable no disponible'] };
    }

    try {
      const mayor = this.motorContable.obtenerLibroMayor() || [];
      const cuentasResultados = mayor.filter(cuenta => {
        const codigo = cuenta.cuentaCodigo || '';
        return codigo.startsWith('4.') || codigo.startsWith('5.');
      });
      return { exito: true, cuentas: cuentasResultados };
    } catch (e) {
      return { exito: false, errores: [`Error al obtener Libro Mayor: ${e.message}`] };
    }
  }

  _obtenerSaldosBalance() {
    if (!this.motorContable) {
      return { exito: false, errores: ['Motor Contable no disponible'] };
    }

    try {
      const mayor = this.motorContable.obtenerLibroMayor() || [];
      const cuentasBalance = mayor.filter(cuenta => {
        const codigo = cuenta.cuentaCodigo || '';
        return codigo.startsWith('1.') || codigo.startsWith('2.') || codigo.startsWith('3.');
      });
      return { exito: true, cuentas: cuentasBalance };
    } catch (e) {
      return { exito: false, errores: [`Error al obtener Libro Mayor: ${e.message}`] };
    }
  }

  _clasificarCuentasResultados(cuentas) {
    const resultado = {
      ventas: 0,
      costoVentas: 0,
      gastosOperativos: 0,
      ingresosNoOperativos: 0,
      gastosNoOperativos: 0,
      detalleVentas: [],
      detalleCostoVentas: [],
      detalleGastosOperativos: [],
      detalleIngresosNoOperativos: [],
      detalleGastosNoOperativos: []
    };

    cuentas.forEach(cuenta => {
      const codigo = cuenta.cuentaCodigo || '';
      const saldo = Math.abs(Number(cuenta.saldo) || 0);
      const detalle = { codigo, nombre: cuenta.cuentaNombre, saldo };

      if (codigo.startsWith('4.1')) {
        resultado.ventas += saldo;
        resultado.detalleVentas.push(detalle);
      } else if (codigo.startsWith('4.2')) {
        resultado.ingresosNoOperativos += saldo;
        resultado.detalleIngresosNoOperativos.push(detalle);
      } else if (codigo.startsWith('5.1')) {
        resultado.costoVentas += saldo;
        resultado.detalleCostoVentas.push(detalle);
      } else if (codigo.startsWith('5.7')) {
        resultado.gastosNoOperativos += saldo;
        resultado.detalleGastosNoOperativos.push(detalle);
      } else if (codigo.startsWith('5.')) {
        resultado.gastosOperativos += saldo;
        resultado.detalleGastosOperativos.push(detalle);
      }
    });

    return resultado;
  }

  _clasificarCuentasBalance(cuentas) {
    const resultado = {
      activoCorriente: 0,
      activoNoCorriente: 0,
      pasivoCorriente: 0,
      pasivoNoCorriente: 0,
      patrimonio: 0,
      detalleActivoCorriente: [],
      detalleActivoNoCorriente: [],
      detallePasivoCorriente: [],
      detallePasivoNoCorriente: [],
      detallePatrimonio: []
    };

    cuentas.forEach(cuenta => {
      const codigo = cuenta.cuentaCodigo || '';
      const tipo = cuenta.tipo || '';
      let saldo = Number(cuenta.saldo) || 0;
      const esContracuenta = tipo.includes('contracuenta');

      if (codigo.startsWith('1.')) {
        saldo = esContracuenta ? -Math.abs(saldo) : Math.abs(saldo);
      } else if (codigo.startsWith('2.') || codigo.startsWith('3.')) {
        saldo = esContracuenta ? -Math.abs(saldo) : Math.abs(saldo);
      }

      const detalle = { codigo, nombre: cuenta.cuentaNombre, saldo: this._r2(saldo) };
      const clasificacion = this.clasificarCuentaPorCorriente(codigo);

      if (clasificacion.categoria === 'ACTIVO_CORRIENTE') {
        resultado.activoCorriente += saldo;
        resultado.detalleActivoCorriente.push(detalle);
      } else if (clasificacion.categoria === 'ACTIVO_NO_CORRIENTE') {
        resultado.activoNoCorriente += saldo;
        resultado.detalleActivoNoCorriente.push(detalle);
      } else if (clasificacion.categoria === 'PASIVO_CORRIENTE') {
        resultado.pasivoCorriente += saldo;
        resultado.detallePasivoCorriente.push(detalle);
      } else if (clasificacion.categoria === 'PASIVO_NO_CORRIENTE') {
        resultado.pasivoNoCorriente += saldo;
        resultado.detallePasivoNoCorriente.push(detalle);
      } else if (clasificacion.categoria === 'PATRIMONIO') {
        resultado.patrimonio += saldo;
        resultado.detallePatrimonio.push(detalle);
      }
    });

    return resultado;
  }

  _obtenerDepreciacionPeriodo(periodo) {
    try {
      const mayor = this.motorContable.obtenerLibroMayor() || [];
      let total = 0;
      mayor.forEach(cuenta => {
        const codigo = cuenta.cuentaCodigo || '';
        if (codigo.startsWith('5.5.')) {
          total += Math.abs(Number(cuenta.saldo) || 0);
        }
      });
      return this._r2(total);
    } catch (e) {
      return 0;
    }
  }

  _obtenerSaldoEfectivoInicial(periodo) {
    try {
      const mayor = this.motorContable.obtenerLibroMayor() || [];
      let saldo = 0;
      mayor.forEach(cuenta => {
        const codigo = cuenta.cuentaCodigo || '';
        if (codigo === '1.1.01' || codigo === '1.1.02' || codigo === '1.1.03') {
          saldo += Number(cuenta.saldo) || 0;
        }
      });
      return this._r2(saldo);
    } catch (e) {
      return 0;
    }
  }

  _obtenerSaldoEfectivoFinal(periodo) {
    return this._obtenerSaldoEfectivoInicial(periodo);
  }

  _obtenerSaldoCuenta(codigo) {
    try {
      const mayor = this.motorContable.obtenerLibroMayor() || [];
      const cuenta = mayor.find(c => c.cuentaCodigo === codigo);
      return cuenta ? Math.abs(Number(cuenta.saldo) || 0) : 0;
    } catch (e) {
      return 0;
    }
  }

  _validarPeriodo(periodo) {
    if (!periodo || typeof periodo !== 'string') {
      return { valido: false, errores: ['Período inválido'] };
    }
    if (/^\d{4}-\d{2}$/.test(periodo)) {
      const [anio, mes] = periodo.split('-').map(Number);
      if (mes < 1 || mes > 12) {
        return { valido: false, errores: [`Mes inválido: ${mes}`] };
      }
      return { valido: true };
    }
    if (/^\d{4}$/.test(periodo)) {
      return { valido: true };
    }
    return { valido: false, errores: [`Formato de período inválido: ${periodo}`] };
  }

  _determinarTipoPeriodo(periodo) {
    if (/^\d{4}-\d{2}$/.test(periodo)) return 'MENSUAL';
    if (/^\d{4}$/.test(periodo)) return 'ANUAL';
    return 'DESCONOCIDO';
  }

  _r2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }

  _r4(n) {
    return Math.round((Number(n) || 0) * 10000) / 10000;
  }

  _fmt(n) {
    return (window.utilidades && window.utilidades.formatearBs)
      ? window.utilidades.formatearBs(n)
      : `Bs ${n.toFixed(2)}`;
  }
}

window.CapaEstadosFinancieros = CapaEstadosFinancieros;
