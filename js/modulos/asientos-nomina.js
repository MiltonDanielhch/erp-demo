// ══════════════════════════════════════════════════════════════
// asientos-nomina.js — Asientos contables de nómina
// ══════════════════════════════════════════════════════════════

/**
 * Módulo de Asientos Contables de Nómina.
 *
 * Conecta el Módulo 4 (Nómina) con el Motor Contable (Módulo 3).
 * Genera los asientos consolidados de la planilla mensual que
 * se contabilizan en el Libro Diario.
 *
 * Cuentas del plan boliviano utilizadas:
 *
 * GASTOS (Debe):
 *   5.2.01 Sueldos y Salarios
 *   5.2.04 Bono de Antigüedad
 *   5.2.05 Gasto de Aguinaldo
 *   5.2.07 Gasto de Indemnización
 *   5.2.09 Aportes Patronales
 *
 * PASIVOS (Haber):
 *   2.1.08 Nómina por Pagar (neto a pagar)
 *   2.1.09 Aportes Laborales por Pagar (AFP 10%)
 *   2.1.06 RC-IVA por Pagar
 *   2.1.10 Aportes Patronales por Pagar
 *
 * ACTIVOS (Haber, al pagar):
 *   1.1.02 Bancos
 */
class ModuloAsientosNomina {

  constructor(deps) {
    this.almacenamiento = deps.almacenamiento;
    this.moduloNomina = deps.moduloNomina;
    this.moduloProvisiones = deps.moduloProvisiones;
    this.moduloBonoAntiguedad = deps.moduloBonoAntiguedad;
    this.moduloLiquidaciones = deps.moduloLiquidaciones;
    this.catalogoEmpleados = deps.catalogoEmpleados;
    this.motorContable = deps.motorContable;

    // Cuentas del plan contable
    this.CUENTAS = {
      // Gastos (deben)
      SUELDOS_SALARIOS: '5.2.01',
      BONO_ANTIGUEDAD: '5.2.04',
      GASTO_AGUINALDO: '5.2.05',
      GASTO_INDEMNIZACION: '5.2.07',
      APORTES_PATRONALES: '5.2.09',

      // Pasivos (haber)
      NOMINA_POR_PAGAR: '2.1.08',
      APORTES_LABORALES_POR_PAGAR: '2.1.09',
      RC_IVA_POR_PAGAR: '2.1.06',
      APORTES_PATRONALES_POR_PAGAR: '2.1.10',

      // Activos (haber al pagar)
      BANCOS: '1.1.02'
    };

    // Verificar cuentas en el plan
    this._verificarCuentas();

    console.log('📒 Módulo de Asientos de Nómina inicializado.');
  }

  _verificarCuentas() {
    if (!window.PlanCuentasUtilidades) return;
    const faltantes = [];
    Object.values(this.CUENTAS).forEach(codigo => {
      if (!window.PlanCuentasUtilidades.obtenerCuenta(codigo)) {
        faltantes.push(codigo);
      }
    });
    if (faltantes.length > 0) {
      console.warn(`⚠️ Cuentas faltantes en plan: ${faltantes.join(', ')}`);
    }
  }

  // ══════════════════════════════════════════════════════════
  // GENERACIÓN DE ASIENTOS MENSUALES
  // ══════════════════════════════════════════════════════════

  /**
   * Genera TODOS los asientos de nómina de un período.
   *
   * Genera 4 asientos consolidados:
   * 1. Asiento de planilla (sueldos + descuentos + neto)
   * 2. Asiento de bono de antigüedad (provisión mensual)
   * 3. Asiento de aguinaldo (provisión mensual)
   * 4. Asiento de indemnización (provisión mensual)
   * 5. Asiento de aportes patronales
   *
   * @param {string} periodo - Formato "AAAA-MM"
   * @param {Object} [datosExtras] - Datos extras por empleado
   * @returns {Object}
   */
  generarAsientosMensuales(periodo, datosExtras = {}) {
    // 1. Calcular la planilla mensual
    const nomina = this.moduloNomina.calcularNominaMensual(periodo, datosExtras);
    if (!nomina.exito) {
      return { exito: false, errores: nomina.errores };
    }

    const asientos = [];
    const resumen = {
      periodo,
      cantidadEmpleados: nomina.cantidadEmpleados,
      asientosGenerados: 0,
      asientosFallidos: 0,
      totales: { ...nomina.totales }
    };

    // 1. Asiento de planilla (sueldos, descuentos, neto)
    const asientoPlanilla = this._generarAsientoPlanilla(nomina);
    if (asientoPlanilla.exito) {
      asientos.push(asientoPlanilla.asiento);
      resumen.asientosGenerados++;
    } else {
      resumen.asientosFallidos++;
    }

    // 2. Asiento de bono de antigüedad
    const asientoBono = this.moduloBonoAntiguedad.generarAsientoProvisionMensual(periodo);
    if (asientoBono.exito) {
      asientos.push(asientoBono.asiento);
      resumen.asientosGenerados++;
    } else if (!asientoBono.errores?.[0]?.includes('Ningún empleado')) {
      resumen.asientosFallidos++;
    }

    // 3. Asiento de aguinaldo (Navidad + posible segundo)
    const asientoAguinaldo = this.moduloProvisiones.generarAsientoProvisionMensual(periodo);
    if (asientoAguinaldo.exito) {
      asientos.push(...asientoAguinaldo.asientos);
      resumen.asientosGenerados += asientoAguinaldo.asientosGenerados;
    }

    // 4. Asiento de indemnización
    const asientoIndemnizacion = this.moduloLiquidaciones.generarAsientoProvisionMensual(periodo);
    if (asientoIndemnizacion.exito) {
      asientos.push(asientoIndemnizacion.asiento);
      resumen.asientosGenerados++;
    } else if (!asientoIndemnizacion.errores?.[0]?.includes('Ningún empleado')) {
      resumen.asientosFallidos++;
    }

    // 5. Asiento de aportes patronales
    const asientoPatronales = this._generarAsientoAportesPatronales(nomina);
    if (asientoPatronales.exito) {
      asientos.push(asientoPatronales.asiento);
      resumen.asientosGenerados++;
    }

    console.log(`📒 Nómina ${periodo}: ${resumen.asientosGenerados} asientos generados`);

    return {
      exito: true,
      periodo,
      resumen,
      asientos,
      totales: nomina.totales
    };
  }

  // ══════════════════════════════════════════════════════════
  // ASIENTO DE PLANILLA (principal)
  // ══════════════════════════════════════════════════════════

  /**
   * Genera el asiento principal de planilla.
   *
   * Asiento:
   *   5.2.01 Sueldos y Salarios            Bs X  (Debe, total devengado)
   *       2.1.08 Nómina por Pagar                  Bs X  (Haber, neto)
   *       2.1.09 Aportes Laborales por Pagar       Bs X  (Haber, AFP 10%)
   *       2.1.06 RC-IVA por Pagar                  Bs X  (Haber)
   *
   * @private
   */
  _generarAsientoPlanilla(nomina) {
    let totalDevengado = 0;
    let totalAporteAFP = 0;
    let totalRCIVA = 0;
    let totalNeto = 0;

    nomina.planilla.forEach(linea => {
      totalDevengado += linea.devengados.totalDevengado;
      totalAporteAFP += linea.deducciones.aporteAFP;
      totalRCIVA += linea.deducciones.rcIVA.aPagar;
      totalNeto += linea.neto;
    });

    totalDevengado = this._r2(totalDevengado);
    totalAporteAFP = this._r2(totalAporteAFP);
    totalRCIVA = this._r2(totalRCIVA);
    totalNeto = this._r2(totalNeto);

    const lineas = [
      // DEBE: Sueldos y Salarios (total devengado)
      {
        cuentaCodigo: this.CUENTAS.SUELDOS_SALARIOS,
        cuentaNombre: 'Sueldos y Salarios',
        debe: totalDevengado,
        haber: 0
      },
      // HABER: Nómina por Pagar (neto)
      {
        cuentaCodigo: this.CUENTAS.NOMINA_POR_PAGAR,
        cuentaNombre: 'Nómina por Pagar',
        debe: 0,
        haber: totalNeto
      },
      // HABER: Aportes Laborales por Pagar (AFP 10%)
      {
        cuentaCodigo: this.CUENTAS.APORTES_LABORALES_POR_PAGAR,
        cuentaNombre: 'Aportes Laborales por Pagar',
        debe: 0,
        haber: totalAporteAFP
      }
    ];

    // Agregar RC-IVA solo si hay monto a pagar
    if (totalRCIVA > 0) {
      lineas.push({
        cuentaCodigo: this.CUENTAS.RC_IVA_POR_PAGAR,
        cuentaNombre: 'RC-IVA por Pagar',
        debe: 0,
        haber: totalRCIVA
      });
    }

    const resultado = this.motorContable.crearAsientoManual({
      fecha: this._ultimoDiaDelMes(nomina.periodo),
      concepto: `Planilla de sueldos ${nomina.periodo} — ${nomina.cantidadEmpleados} empleados`,
      lineas
    });

    return resultado;
  }

  // ══════════════════════════════════════════════════════════
  // ASIENTO DE APORTES PATRONALES
  // ══════════════════════════════════════════════════════════

  /**
   * Genera el asiento de aportes patronales (costo empresa).
   *
   * Asiento:
   *   5.2.09 Aportes Patronales            Bs X  (Debe)
   *       2.1.10 Aportes Patronales por Pagar      Bs X  (Haber)
   *
   * @private
   */
  _generarAsientoAportesPatronales(nomina) {
    const totalPatronal = this._r2(nomina.totales.aportesPatronales);

    if (totalPatronal <= 0) {
      return { exito: false, errores: ['No hay aportes patronales que registrar'] };
    }

    const resultado = this.motorContable.crearAsientoManual({
      fecha: this._ultimoDiaDelMes(nomina.periodo),
      concepto: `Aportes patronales ${nomina.periodo} — costo empleador (~26%)`,
      lineas: [
        {
          cuentaCodigo: this.CUENTAS.APORTES_PATRONALES,
          cuentaNombre: 'Aportes Patronales',
          debe: totalPatronal,
          haber: 0
        },
        {
          cuentaCodigo: this.CUENTAS.APORTES_PATRONALES_POR_PAGAR,
          cuentaNombre: 'Aportes Patronales por Pagar',
          debe: 0,
          haber: totalPatronal
        }
      ]
    });

    return resultado;
  }

  // ══════════════════════════════════════════════════════════
  // ASIENTO DE PAGO DE NÓMINA
  // ══════════════════════════════════════════════════════════

  /**
   * Genera el asiento de pago de nómina (cuando tesorería paga).
   *
   * Asiento:
   *   2.1.08 Nómina por Pagar              Bs X  (Debe)
   *       1.1.02 Bancos                            Bs X  (Haber)
   *
   * @param {string} periodo
   * @param {number} monto - Monto a pagar (neto)
   * @returns {Object}
   */
  generarAsientoPagoNomina(periodo, monto = null) {
    // Si no se especifica monto, usar el neto del período
    if (monto === null) {
      const nomina = this.moduloNomina.calcularNominaMensual(periodo);
      if (!nomina.exito) {
        return { exito: false, errores: nomina.errores };
      }
      monto = nomina.totales.neto;
    }

    const resultado = this.motorContable.crearAsientoManual({
      fecha: new Date().toISOString().split('T')[0],
      concepto: `Pago de nómina ${periodo} — ${this._fmt(monto)}`,
      lineas: [
        {
          cuentaCodigo: this.CUENTAS.NOMINA_POR_PAGAR,
          cuentaNombre: 'Nómina por Pagar',
          debe: monto,
          haber: 0
        },
        {
          cuentaCodigo: this.CUENTAS.BANCOS,
          cuentaNombre: 'Bancos',
          debe: 0,
          haber: monto
        }
      ]
    });

    return resultado;
  }

  /**
   * Genera el asiento de pago de aportes patronales.
   *
   * Asiento:
   *   2.1.10 Aportes Patronales por Pagar  Bs X  (Debe)
   *       1.1.02 Bancos                            Bs X  (Haber)
   *
   * @param {string} periodo
   * @param {number} monto
   * @returns {Object}
   */
  generarAsientoPagoAportesPatronales(periodo, monto = null) {
    if (monto === null) {
      const nomina = this.moduloNomina.calcularNominaMensual(periodo);
      if (!nomina.exito) {
        return { exito: false, errores: nomina.errores };
      }
      monto = nomina.totales.aportesPatronales;
    }

    const resultado = this.motorContable.crearAsientoManual({
      fecha: new Date().toISOString().split('T')[0],
      concepto: `Pago aportes patronales ${periodo}`,
      lineas: [
        {
          cuentaCodigo: this.CUENTAS.APORTES_PATRONALES_POR_PAGAR,
          cuentaNombre: 'Aportes Patronales por Pagar',
          debe: monto,
          haber: 0
        },
        {
          cuentaCodigo: this.CUENTAS.BANCOS,
          cuentaNombre: 'Bancos',
          debe: 0,
          haber: monto
        }
      ]
    });

    return resultado;
  }

  // ══════════════════════════════════════════════════════════
  // UTILIDADES PRIVADAS
  // ══════════════════════════════════════════════════════════

  _ultimoDiaDelMes(periodo) {
    const [anio, mes] = periodo.split('-').map(Number);
    const ultimoDia = new Date(anio, mes, 0).getDate();
    return `${periodo}-${String(ultimoDia).padStart(2, '0')}`;
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

window.ModuloAsientosNomina = ModuloAsientosNomina;