// ══════════════════════════════════════════════════════════════
// nomina.js — Módulo de Nómina (Cálculo mensual boliviano)
// ══════════════════════════════════════════════════════════════

/**
 * Módulo de Nómina Boliviana.
 *
 * Calcula la planilla mensual de sueldos aplicando:
 * - Ley General del Trabajo (horas extras, bono antigüedad)
 * - Ley 065 de Pensiones (aportes laborales y patronales)
 * - Ley 843 (RC-IVA compensable con facturas)
 *
 * Porcentajes de ley vigentes 2026:
 *
 * Aporte laboral (descuento al empleado):
 *   - AFP/Gestora Pública:    10.00%
 *   - Aporte solidario:        0.50%
 *   - Comisión Gestora:        0.50%
 *   ─────────────────────────────────
 *   Total:                    12.71% (simplificado a 10% según roadmap)
 *
 * RC-IVA: 13% compensable con facturas de gastos personales.
 *
 * Aportes patronales (paga la empresa):
 *   - Salud (CNS/Gestora):    10.00%
 *   - AFP/Gestora LP:         10.00%
 *   - Riesgo laboral:          2.00%
 *   - Aporte solidario:        2.00%
 *   - Vivienda:                2.00%
 *   ─────────────────────────────────
 *   Total:                    ~16.71% del devengado
 */
class ModuloNomina {

  constructor(deps) {
    this.almacenamiento = deps.almacenamiento;
    this.catalogoEmpleados = deps.catalogoEmpleados;
    this.COLLECCION = 'planillas_nomina';

    // Porcentajes de ley boliviana (configurables vía window.BOLIVIA)
    this.PORCENTAJES = {
      // Deducciones al empleado
      APORTE_LABORAL_AFP: 0.10,          // 10% - Ley 065
      APORTE_LABORAL_SOLIDARIO: 0.005,   // 0.5%
      COMISION_GESTORA: 0.005,           // 0.5%
      RC_IVA: 0.13,                      // 13% - Ley 843

      // Aportes patronales
      PATRONAL_SALUD: 0.10,              // 10%
      PATRONAL_AFP: 0.10,                // 10%
      PATRONAL_RIESGO_LABORAL: 0.02,     // 2% (por defecto)
      PATRONAL_SOLIDARIO: 0.02,          // 2%
      PATRONAL_VIVIENDA: 0.02            // 2%
    };

    // Recargos de horas extras (LGT)
    this.RECARGOS_HORAS_EXTRAS = {
      DIURNAS: 1.00,     // 100% recargo → pago doble
      NOCTURNAS: 2.00,   // 200% recargo → pago triple
      FERIADOS: 3.00     // 300% recargo → pago cuádruple
    };

    // Asegurar colección existente
    if (!this.almacenamiento.obtener(this.COLLECCION)) {
      this.almacenamiento.guardar(this.COLLECCION, []);
    }

    console.log('💼 Módulo de Nómina inicializado.');
  }

  // ══════════════════════════════════════════════════════════
  // CÁLCULO MENSUAL PRINCIPAL
  // ══════════════════════════════════════════════════════════

  /**
   * Calcula la planilla mensual de nómina para todos los empleados activos.
   *
   * @param {string} periodo - Formato "AAAA-MM"
   * @param {Object} [datosExtras] - Datos adicionales por empleado
   *        { empId: { horasExtrasDiurnas, horasExtrasNocturnas, horasFeriado,
   *                   comisiones, bonificaciones, facturasRCIVA } }
   * @returns {Object} { exito, periodo, planilla, totales, cantidadEmpleados }
   */
  calcularNominaMensual(periodo, datosExtras = {}) {
    if (!periodo || !/^\d{4}-\d{2}$/.test(periodo)) {
      return { exito: false, errores: ['Período inválido. Use formato AAAA-MM'] };
    }

    const empleados = this.catalogoEmpleados.obtenerActivos();
    if (empleados.length === 0) {
      return { exito: false, errores: ['No hay empleados activos para calcular nómina'] };
    }

    const planilla = [];
    const totales = {
      devengados: 0, deducciones: 0, neto: 0,
      aportesPatronales: 0, costoEmpresa: 0,
      rcIVACompensado: 0
    };

    empleados.forEach(emp => {
      const extras = datosExtras[emp.id] || {};

      const devengados = this.calcularDevengados(emp, extras);
      const deducciones = this.calcularDeducciones(emp, devengados.totalDevengado, extras.facturasRCIVA || []);
      const neto = this.calcularNetoAPagar(devengados.totalDevengado, deducciones.totalDeducciones);
      const aportes = this.calcularAportesPatronales(emp, devengados.totalDevengado);
      const costoEmpresa = this._r2(devengados.totalDevengado + aportes.totalPatronal);

      const linea = {
        empleadoId: emp.id,
        empleadoNombre: `${emp.nombres} ${emp.apellidos}`,
        empleadoCI: emp.ci,
        cargo: emp.cargo,
        departamento: emp.departamento,
        salarioBase: emp.salarioBase,
        devengados,
        deducciones,
        neto,
        aportesPatronales: aportes,
        costoEmpresa
      };

      planilla.push(linea);

      totales.devengados += devengados.totalDevengado;
      totales.deducciones += deducciones.totalDeducciones;
      totales.neto += neto;
      totales.aportesPatronales += aportes.totalPatronal;
      totales.costoEmpresa += costoEmpresa;
      totales.rcIVACompensado += deducciones.rcIVA.compensado;
    });

    // Redondear totales
    Object.keys(totales).forEach(k => { totales[k] = this._r2(totales[k]); });

    const resultado = {
      exito: true,
      periodo,
      fechaCalculo: new Date().toISOString(),
      cantidadEmpleados: planilla.length,
      planilla,
      totales
    };

    console.log(`💼 Nómina ${periodo}: ${planilla.length} empleados, neto total Bs ${this._fmt(totales.neto)}`);
    return resultado;
  }

  // ══════════════════════════════════════════════════════════
  // DEVENGADOS
  // ══════════════════════════════════════════════════════════

  /**
   * Calcula los devengados de un empleado.
   *
   * Incluye: salario base + horas extras + comisiones +
   *          bonificaciones + bono de antigüedad.
   *
   * @param {Object} empleado
   * @param {Object} [extras]
   * @returns {Object} Desglose completo
   */
  calcularDevengados(empleado, extras = {}) {
    const salarioBase = Number(empleado.salarioBase) || 0;

    // Horas extras (basadas en salario por hora = salario / 240h mensuales)
    const salarioHora = salarioBase / 240;
    const horasDiurnas = Number(extras.horasExtrasDiurnas) || 0;
    const horasNocturnas = Number(extras.horasExtrasNocturnas) || 0;
    const horasFeriado = Number(extras.horasFeriado) || 0;

    const pagoHorasDiurnas = this._r2(horasDiurnas * salarioHora * (1 + this.RECARGOS_HORAS_EXTRAS.DIURNAS));
    const pagoHorasNocturnas = this._r2(horasNocturnas * salarioHora * (1 + this.RECARGOS_HORAS_EXTRAS.NOCTURNAS));
    const pagoHorasFeriado = this._r2(horasFeriado * salarioHora * (1 + this.RECARGOS_HORAS_EXTRAS.FERIADOS));
    const horasExtras = this._r2(pagoHorasDiurnas + pagoHorasNocturnas + pagoHorasFeriado);

    // Comisiones y bonificaciones ocasionales
    const comisiones = this._r2(Number(extras.comisiones) || 0);
    const bonificaciones = this._r2(Number(extras.bonificaciones) || 0);

    // Bono de antigüedad (ya calculado en el catálogo, pero lo recalculamos por seguridad)
    const bono = window.TablaBonoAntiguedad
      ? window.TablaBonoAntiguedad.calcularBono(empleado.antiguedadAnios || 0)
      : { monto: 0, porcentaje: 0 };
    const bonoAntiguedad = this._r2(bono.monto);

    const totalDevengado = this._r2(
      salarioBase + horasExtras + comisiones + bonificaciones + bonoAntiguedad
    );

    return {
      salarioBase,
      salarioHora: this._r2(salarioHora),
      horasExtras: {
        diurnas: { cantidad: horasDiurnas, monto: pagoHorasDiurnas },
        nocturnas: { cantidad: horasNocturnas, monto: pagoHorasNocturnas },
        feriados: { cantidad: horasFeriado, monto: pagoHorasFeriado },
        total: horasExtras
      },
      comisiones,
      bonificaciones,
      bonoAntiguedad: {
        monto: bonoAntiguedad,
        porcentaje: bono.porcentaje,
        base: bono.base
      },
      totalDevengado
    };
  }

  // ══════════════════════════════════════════════════════════
  // DEDUCCIONES
  // ══════════════════════════════════════════════════════════

  /**
   * Calcula las deducciones del empleado.
   *
   * - Aporte laboral AFP/Gestora: 10% del total devengado.
   * - RC-IVA: 13% del total devengado, MENOS IVA de facturas
   *   de gastos personales presentadas.
   *
   * @param {Object} empleado
   * @param {number} totalDevengado
   * @param {Array} [facturasRCIVA] - Array de facturas { monto, cuf, nit }
   * @returns {Object}
   */
  calcularDeducciones(empleado, totalDevengado, facturasRCIVA = []) {
    // Aporte laboral a la Gestora Pública (ex AFP): 10%
    const aporteAFP = this._r2(totalDevengado * this.PORCENTAJES.APORTE_LABORAL_AFP);

    // RC-IVA: 13% compensable
    const rcIVATeorico = this._r2(totalDevengado * this.PORCENTAJES.RC_IVA);

    // Calcular IVA de las facturas presentadas
    // IVA = monto × 13 / 113 (extraer de monto con IVA incluido)
    const ivaFacturas = this._r2(
      facturasRCIVA.reduce((acc, f) => {
        const monto = Number(f.monto) || 0;
        const iva = monto * 0.13 / 1.13;
        return acc + iva;
      }, 0)
    );

    // RC-IVA a pagar = teórico − IVA facturas (no puede ser negativo)
    const rcIVA = this._r2(Math.max(0, rcIVATeorico - ivaFacturas));
    const rcIVACompensado = this._r2(rcIVATeorico - rcIVA);

    const totalDeducciones = this._r2(aporteAFP + rcIVA);

    return {
      aporteAFP,
      rcIVA: {
        teorico: rcIVATeorico,
        ivaFacturas,
        compensado: rcIVACompensado,
        aPagar: rcIVA
      },
      facturasPresentadas: facturasRCIVA.length,
      totalDeducciones
    };
  }

  // ══════════════════════════════════════════════════════════
  // NETO A PAGAR
  // ══════════════════════════════════════════════════════════

  /**
   * Calcula el neto a pagar al empleado.
   * Neto = Total Devengado − Total Deducciones.
   */
  calcularNetoAPagar(totalDevengado, totalDeducciones) {
    return this._r2(totalDevengado - totalDeducciones);
  }

  // ══════════════════════════════════════════════════════════
  // APORTES PATRONALES
  // ══════════════════════════════════════════════════════════

  /**
   * Calcula los aportes patronales (los paga la empresa, adicional al salario).
   *
   * - Salud (CNS/Gestora): 10%
   * - AFP/Gestora LP: 10%
   * - Riesgo laboral: 2%
   * - Aporte solidario: 2%
   * - Vivienda: 2%
   * ───────────────────────
   * Total: ~16.71%
   */
  calcularAportesPatronales(empleado, totalDevengado) {
    const salud = this._r2(totalDevengado * this.PORCENTAJES.PATRONAL_SALUD);
    const afp = this._r2(totalDevengado * this.PORCENTAJES.PATRONAL_AFP);
    const riesgoLaboral = this._r2(totalDevengado * this.PORCENTAJES.PATRONAL_RIESGO_LABORAL);
    const solidario = this._r2(totalDevengado * this.PORCENTAJES.PATRONAL_SOLIDARIO);
    const vivienda = this._r2(totalDevengado * this.PORCENTAJES.PATRONAL_VIVIENDA);

    const totalPatronal = this._r2(salud + afp + riesgoLaboral + solidario + vivienda);

    return {
      salud, afp, riesgoLaboral, solidario, vivienda,
      totalPatronal,
      porcentajeTotal: this._r2(
        (this.PORCENTAJES.PATRONAL_SALUD +
         this.PORCENTAJES.PATRONAL_AFP +
         this.PORCENTAJES.PATRONAL_RIESGO_LABORAL +
         this.PORCENTAJES.PATRONAL_SOLIDARIO +
         this.PORCENTAJES.PATRONAL_VIVIENDA) * 100
      )
    };
  }

  // ══════════════════════════════════════════════════════════
  // RESUMEN Y PERSISTENCIA
  // ══════════════════════════════════════════════════════════

  /**
   * Genera (y guarda) una planilla resumen del período.
   */
  generarPlanillaResumen(periodo, datosExtras = {}) {
    const resultado = this.calcularNominaMensual(periodo, datosExtras);
    if (!resultado.exito) return resultado;

    // Guardar en localStorage
    resultado.id = 'nom-' + periodo + '-' + Date.now().toString(36);
    this.almacenamiento.guardar(this.COLLECCION, resultado);
    console.log(`💾 Planilla ${periodo} guardada (${resultado.id})`);

    return resultado;
  }

  /**
   * Obtiene todas las planillas guardadas.
   */
  obtenerPlanillas() {
    return this.almacenamiento.obtener(this.COLLECCION) || [];
  }

  /**
   * Obtiene la planilla de un período específico.
   */
  obtenerPlanillaPeriodo(periodo) {
    const todas = this.obtenerPlanillas();
    return todas.find(p => p.periodo === periodo) || null;
  }

  /**
   * Genera resumen comparativo entre dos períodos.
   */
  compararPeriodos(periodoA, periodoB) {
    const pA = this.obtenerPlanillaPeriodo(periodoA);
    const pB = this.obtenerPlanillaPeriodo(periodoB);
    if (!pA || !pB) return null;
    return {
      periodoA: pA, periodoB: pB,
      diferencia: {
        neto: this._r2(pB.totales.neto - pA.totales.neto),
        costoEmpresa: this._r2(pB.totales.costoEmpresa - pA.totales.costoEmpresa)
      }
    };
  }

  // ══════════════════════════════════════════════════════════
  // UTILIDADES PRIVADAS
  // ══════════════════════════════════════════════════════════

  _r2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }

  _fmt(n) {
    return (window.utilidades && window.utilidades.formatearBs)
      ? window.utilidades.formatearBs(n)
      : `Bs ${n.toFixed(2)}`;
  }
}

window.ModuloNomina = ModuloNomina;
