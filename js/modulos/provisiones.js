// ══════════════════════════════════════════════════════════════
// provisiones.js — Aguinaldo de Navidad y Segundo Aguinaldo
// ══════════════════════════════════════════════════════════════

/**
 * Módulo de Provisiones de Aguinaldo Boliviano.
 *
 * Implementa:
 * 1. Aguinaldo de Navidad (LGT Art. 56) — OBLIGATORIO SIEMPRE
 *    - Pago antes del 20 de diciembre
 *    - 1 mes del "total ganado" (promedio últimos 3 meses)
 *    - Proporcional si < 1 año de servicio
 *
 * 2. Segundo Aguinaldo "Esfuerzo por Bolivia" (DS 1802) — CONDICIONAL
 *    - Solo si INE confirma PIB > 4.5%
 *    - Toggle MANUAL de RRHH (NO automático)
 *    - Se activó en: 2013, 2014, 2015, 2018
 *    - Retroactivo cuando se activa a mitad de año
 *
 * Asientos contables (plan de cuentas boliviano):
 *   5.2.05 Gasto de Aguinaldo         ← Debe (provisión)
 *   2.1.11 Aguinaldo por Pagar        ← Haber (provisión)
 *   5.2.06 Gasto de Segundo Aguinaldo ← Debe
 *   2.1.12 Segundo Aguinaldo por Pagar ← Haber
 *   1.1.02 Bancos                     ← Haber (pago)
 */
class ModuloProvisiones {

  constructor(deps) {
    this.almacenamiento = deps.almacenamiento;
    this.catalogoEmpleados = deps.catalogoEmpleados;
    this.moduloNomina = deps.moduloNomina;
    this.motorContable = deps.motorContable;

    // Clave de configuración del toggle
    this.KEY_TOGGLE = 'segundo_aguinaldo_config';

    // Cuentas del plan contable boliviano
    this.CUENTAS = {
      GASTO_AGUINALDO: '5.2.05',
      AGUINALDO_POR_PAGAR: '2.1.11',
      GASTO_SEGUNDO_AGUINALDO: '5.2.06',
      SEGUNDO_AGUINALDO_POR_PAGAR: '2.1.12',
      BANCOS: '1.1.02'
    };

    // Verificar cuentas en el plan
    this._verificarCuentas();

    // Inicializar toggle si no existe (localStorage directo)
    if (!localStorage.getItem(this.KEY_TOGGLE)) {
      localStorage.setItem(this.KEY_TOGGLE, JSON.stringify({
        activado: false,
        anioActivacion: null,
        fechaActivacion: null
      }));
    }

    console.log('🎄 Módulo de Provisiones inicializado.');
  }

  _verificarCuentas() {
    if (!window.PlanCuentasUtilidades) return;
    const cuentasFaltantes = [];
    Object.values(this.CUENTAS).forEach(codigo => {
      if (!window.PlanCuentasUtilidades.obtenerCuenta(codigo)) {
        cuentasFaltantes.push(codigo);
      }
    });
    if (cuentasFaltantes.length > 0) {
      console.warn(`⚠️ Cuentas faltantes en plan: ${cuentasFaltantes.join(', ')}`);
    }
  }

  // ══════════════════════════════════════════════════════════
  // CÁLCULO DE AGUINALDO
  // ══════════════════════════════════════════════════════════

  /**
   * Calcula el aguinaldo de Navidad para un empleado.
   *
   * Fórmula: promedio total ganado últimos 3 meses × factor proporcional
   *   - Si trabajó ≥ 1 año: factor = 1 (aguinaldo completo)
   *   - Si trabajó < 1 año: factor = mesesTrabajados / 12
   *
   * @param {Object} empleado
   * @param {string} periodo - Formato "AAAA-MM"
   * @returns {Object} { monto, promedio3Meses, mesesTrabajados, factor, esProporcional }
   */
  calcularAguinaldoNavidad(empleado, periodo) {
    const promedio = this._obtenerPromedioTotalGanado(empleado.id, periodo);
    const mesesTrabajados = this._obtenerMesesTrabajadosAnio(empleado, periodo);

    const factor = mesesTrabajados >= 12 ? 1 : mesesTrabajados / 12;
    const esProporcional = mesesTrabajados < 12;
    const monto = this._r2(promedio * factor);

    return {
      monto,
      promedio3Meses: promedio,
      mesesTrabajados,
      factor: this._r4(factor),
      esProporcional
    };
  }

  /**
   * Calcula el segundo aguinaldo (solo si está activado).
   *
   * @param {Object} empleado
   * @param {string} periodo
   * @returns {Object} { monto, activado }
   */
  calcularSegundoAguinaldo(empleado, periodo) {
    const config = this.obtenerConfigSegundoAguinaldo();
    if (!config.activado) {
      return { monto: 0, activado: false };
    }

    const navidad = this.calcularAguinaldoNavidad(empleado, periodo);
    return {
      monto: navidad.monto,   // Mismo monto que aguinaldo de Navidad
      activado: true
    };
  }

  // ══════════════════════════════════════════════════════════
  // PROVISIÓN MENSUAL
  // ══════════════════════════════════════════════════════════

  /**
   * Calcula la provisión mensual de aguinaldo para un empleado.
   *
   * - Aguinaldo Navidad: estimadoAnual / 12 (siempre)
   * - Segundo Aguinaldo: estimadoAnual / 12 (solo si activado)
   *
   * @param {Object} empleado
   * @param {string} periodo
   * @returns {Object} { navidad, segundoAguinaldo, totalProvision }
   */
  provisionAguinaldoMensual(empleado, periodo) {
    const navidad = this.calcularAguinaldoNavidad(empleado, periodo);
    const provNavidad = this._r2(navidad.monto / 12);

    const segundo = this.calcularSegundoAguinaldo(empleado, periodo);
    const provSegundo = segundo.activado ? this._r2(segundo.monto / 12) : 0;

    return {
      navidad: provNavidad,
      segundoAguinaldo: provSegundo,
      totalProvision: this._r2(provNavidad + provSegundo)
    };
  }

  /**
   * Genera asiento contable de provisión mensual de aguinaldo.
   *
   * Asiento:
   *   Gasto de Aguinaldo            Bs X   (Debe)
   *       Aguinaldo por Pagar               Bs X   (Haber)
   *
   * Si segundo aguinaldo activado, genera también:
   *   Gasto de Segundo Aguinaldo    Bs X   (Debe)
   *       Segundo Aguinaldo por Pagar       Bs X   (Haber)
   *
   * @param {string} periodo
   * @returns {Object} { exito, asientosGenerados, totalProvision }
   */
  generarAsientoProvisionMensual(periodo) {
    const empleados = this.catalogoEmpleados.obtenerActivos();
    if (empleados.length === 0) {
      return { exito: false, errores: ['No hay empleados activos'] };
    }

    let totalNavidad = 0;
    let totalSegundo = 0;

    empleados.forEach(emp => {
      const prov = this.provisionAguinaldoMensual(emp, periodo);
      totalNavidad += prov.navidad;
      totalSegundo += prov.segundoAguinaldo;
    });

    totalNavidad = this._r2(totalNavidad);
    totalSegundo = this._r2(totalSegundo);

    const asientos = [];

    // Asiento de aguinaldo de Navidad
    if (totalNavidad > 0) {
      const r1 = this.motorContable.crearAsientoManual({
        fecha: this._ultimoDiaDelMes(periodo),
        concepto: `Provisión aguinaldo Navidad ${periodo} — ${empleados.length} empleados`,
        lineas: [
          { cuentaCodigo: this.CUENTAS.GASTO_AGUINALDO, cuentaNombre: 'Gasto de Aguinaldo', debe: totalNavidad, haber: 0 },
          { cuentaCodigo: this.CUENTAS.AGUINALDO_POR_PAGAR, cuentaNombre: 'Aguinaldo por Pagar', debe: 0, haber: totalNavidad }
        ]
      });
      if (r1.exito) asientos.push(r1.asiento);
    }

    // Asiento de segundo aguinaldo (si activado)
    if (totalSegundo > 0) {
      const r2 = this.motorContable.crearAsientoManual({
        fecha: this._ultimoDiaDelMes(periodo),
        concepto: `Provisión segundo aguinaldo ${periodo} — DS 1802 activado`,
        lineas: [
          { cuentaCodigo: this.CUENTAS.GASTO_SEGUNDO_AGUINALDO, cuentaNombre: 'Gasto de Segundo Aguinaldo', debe: totalSegundo, haber: 0 },
          { cuentaCodigo: this.CUENTAS.SEGUNDO_AGUINALDO_POR_PAGAR, cuentaNombre: 'Segundo Aguinaldo por Pagar', debe: 0, haber: totalSegundo }
        ]
      });
      if (r2.exito) asientos.push(r2.asiento);
    }

    console.log(`🎄 Provisión ${periodo}: Navidad ${this._fmt(totalNavidad)} + Segundo ${this._fmt(totalSegundo)}`);

    return {
      exito: true,
      periodo,
      cantidadEmpleados: empleados.length,
      totalNavidad,
      totalSegundo,
      totalProvision: this._r2(totalNavidad + totalSegundo),
      asientosGenerados: asientos.length,
      asientos
    };
  }

  // ══════════════════════════════════════════════════════════
  // PAGO DE AGUINALDO (diciembre)
  // ══════════════════════════════════════════════════════════

  /**
   * Paga el aguinaldo de Navidad (se ejecuta en diciembre, antes del 20).
   *
   * Asiento de pago:
   *   Aguinaldo por Pagar           Bs X   (Debe)
   *       Bancos                            Bs X   (Haber)
   *
   * Si segundo aguinaldo activado:
   *   Segundo Aguinaldo por Pagar   Bs X   (Debe)
   *       Bancos                            Bs X   (Haber)
   *
   * @param {string} periodo
   * @param {Object} [metodoPago] - 'BANCOS' o 'CAJA'
   * @returns {Object}
   */
  pagarAguinaldo(periodo, metodoPago = 'BANCOS') {
    const empleados = this.catalogoEmpleados.obtenerActivos();
    if (empleados.length === 0) {
      return { exito: false, errores: ['No hay empleados activos'] };
    }

    let totalNavidad = 0;
    let totalSegundo = 0;
    const detalle = [];

    empleados.forEach(emp => {
      const nav = this.calcularAguinaldoNavidad(emp, periodo);
      const seg = this.calcularSegundoAguinaldo(emp, periodo);
      totalNavidad += nav.monto;
      totalSegundo += seg.monto;
      detalle.push({
        empleadoId: emp.id,
        nombre: `${emp.nombres} ${emp.apellidos}`,
        aguinaldoNavidad: nav.monto,
        segundoAguinaldo: seg.monto
      });
    });

    totalNavidad = this._r2(totalNavidad);
    totalSegundo = this._r2(totalSegundo);

    const cuentaPago = metodoPago === 'CAJA' ? '1.1.03' : this.CUENTAS.BANCOS;
    const asientos = [];

    // Pago aguinaldo de Navidad
    if (totalNavidad > 0) {
      const r1 = this.motorContable.crearAsientoManual({
        fecha: new Date().toISOString().split('T')[0],
        concepto: `Pago aguinaldo Navidad ${periodo} — ${empleados.length} empleados`,
        lineas: [
          { cuentaCodigo: this.CUENTAS.AGUINALDO_POR_PAGAR, cuentaNombre: 'Aguinaldo por Pagar', debe: totalNavidad, haber: 0 },
          { cuentaCodigo: cuentaPago, cuentaNombre: metodoPago === 'CAJA' ? 'Caja' : 'Bancos', debe: 0, haber: totalNavidad }
        ]
      });
      if (r1.exito) asientos.push(r1.asiento);
    }

    // Pago segundo aguinaldo (si activado)
    if (totalSegundo > 0) {
      const r2 = this.motorContable.crearAsientoManual({
        fecha: new Date().toISOString().split('T')[0],
        concepto: `Pago segundo aguinaldo ${periodo} — DS 1802 activado`,
        lineas: [
          { cuentaCodigo: this.CUENTAS.SEGUNDO_AGUINALDO_POR_PAGAR, cuentaNombre: 'Segundo Aguinaldo por Pagar', debe: totalSegundo, haber: 0 },
          { cuentaCodigo: cuentaPago, cuentaNombre: metodoPago === 'CAJA' ? 'Caja' : 'Bancos', debe: 0, haber: totalSegundo }
        ]
      });
      if (r2.exito) asientos.push(r2.asiento);
    }

    return {
      exito: true,
      periodo,
      cantidadEmpleados: empleados.length,
      totalNavidad,
      totalSegundo,
      totalPagado: this._r2(totalNavidad + totalSegundo),
      detalle,
      asientosGenerados: asientos.length,
      asientos
    };
  }

  // ══════════════════════════════════════════════════════════
  // TOGGLE DEL SEGUNDO AGUINALDO
  // ══════════════════════════════════════════════════════════

  /**
   * Obtiene la configuración actual del segundo aguinaldo.
   * @returns {Object} { activado, anioActivacion, fechaActivacion }
   */
  /**
   * Obtiene la configuración actual del segundo aguinaldo.
   * Usa localStorage directamente porque es un valor único (no colección).
   * @returns {Object} { activado, anioActivacion, fechaActivacion }
   */
  obtenerConfigSegundoAguinaldo() {
    try {
      const raw = localStorage.getItem(this.KEY_TOGGLE);
      if (!raw) {
        return { activado: false, anioActivacion: null, fechaActivacion: null };
      }
      return JSON.parse(raw);
    } catch (e) {
      console.warn('⚠️ Error al leer config segundo aguinaldo:', e);
      return { activado: false, anioActivacion: null, fechaActivacion: null };
    }
  }

  /**
   * Activa o desactiva el segundo aguinaldo (uso manual de RRHH).
   *
   * ⚠️ NO ES AUTOMÁTICO. Solo se activa cuando el Gobierno confirma
   * que el PIB creció > 4.5% (DS 1802).
   *
   * Si se activa a mitad de año, genera asiento de provisión retroactiva.
   *
   * @param {boolean} activado
   * @returns {Object} { exito, config, retroactivoGenerado }
   */
  toggleSegundoAguinaldo(activado) {
    const configAnterior = this.obtenerConfigSegundoAguinaldo();
    const ahora = new Date();
    const anioActual = ahora.getFullYear();

    const nuevaConfig = {
      activado: Boolean(activado),
      anioActivacion: activado ? anioActual : configAnterior.anioActivacion,
      fechaActivacion: activado ? ahora.toISOString() : configAnterior.fechaActivacion
    };

    try {
      localStorage.setItem(this.KEY_TOGGLE, JSON.stringify(nuevaConfig));
    } catch (e) {
      console.error('❌ Error al guardar config segundo aguinaldo:', e);
    }

    console.log(`🎄 Segundo aguinaldo ${activado ? 'ACTIVADO' : 'DESACTIVADO'}`);

    // Si se activa, generar retroactivo de meses anteriores del año
    let retroactivoGenerado = null;
    if (activado && ahora.getMonth() > 0) {  // Si no estamos en enero
      retroactivoGenerado = this._generarProvisionRetroactiva(anioActual);
    }

    return {
      exito: true,
      config: nuevaConfig,
      retroactivoGenerado
    };
  }

  /**
   * Genera provisión retroactiva del segundo aguinaldo para meses anteriores.
   * @private
   */
  _generarProvisionRetroactiva(anio) {
    const ahora = new Date();
    const mesActual = ahora.getMonth();  // 0-11
    const empleados = this.catalogoEmpleados.obtenerActivos();

    let totalRetroactivo = 0;

    // Calcular provisión retroactiva de meses anteriores (0 a mesActual-1)
    for (let mes = 0; mes < mesActual; mes++) {
      const periodo = `${anio}-${String(mes + 1).padStart(2, '0')}`;
      empleados.forEach(emp => {
        const nav = this.calcularAguinaldoNavidad(emp, periodo);
        totalRetroactivo += nav.monto / 12;
      });
    }

    totalRetroactivo = this._r2(totalRetroactivo);

    if (totalRetroactivo <= 0) return null;

    // Generar asiento de retroactivo
    const resultado = this.motorContable.crearAsientoManual({
      fecha: ahora.toISOString().split('T')[0],
      concepto: `Provisión retroactiva segundo aguinaldo ${anio} (${mesActual} meses)`,
      lineas: [
        { cuentaCodigo: this.CUENTAS.GASTO_SEGUNDO_AGUINALDO, cuentaNombre: 'Gasto de Segundo Aguinaldo', debe: totalRetroactivo, haber: 0 },
        { cuentaCodigo: this.CUENTAS.SEGUNDO_AGUINALDO_POR_PAGAR, cuentaNombre: 'Segundo Aguinaldo por Pagar', debe: 0, haber: totalRetroactivo }
      ]
    });

    return {
      exito: resultado.exito,
      monto: totalRetroactivo,
      mesesCubiertos: mesActual,
      asiento: resultado.exito ? resultado.asiento : null
    };
  }

  // ══════════════════════════════════════════════════════════
  // CONSULTAS DE PROVISIONES ACUMULADAS
  // ══════════════════════════════════════════════════════════

  /**
   * Obtiene el saldo acumulado de aguinaldo por pagar desde el Libro Mayor.
   * @returns {Object} { navidad, segundoAguinaldo }
   */
  obtenerProvisionesAcumuladas() {
    const mayor = this.motorContable.obtenerLibroMayor();

    const navidad = mayor.find(m => m.cuentaCodigo === this.CUENTAS.AGUINALDO_POR_PAGAR);
    const segundo = mayor.find(m => m.cuentaCodigo === this.CUENTAS.SEGUNDO_AGUINALDO_POR_PAGAR);

    return {
      navidad: navidad ? navidad.saldo : 0,
      segundoAguinaldo: segundo ? segundo.saldo : 0,
      total: (navidad ? navidad.saldo : 0) + (segundo ? segundo.saldo : 0)
    };
  }

  // ══════════════════════════════════════════════════════════
  // UTILIDADES PRIVADAS
  // ══════════════════════════════════════════════════════════

  /**
   * Obtiene el promedio del total ganado de los últimos 3 meses.
   * @private
   */
  _obtenerPromedioTotalGanado(empleadoId, periodo) {
    const planillas = this.almacenamiento.obtener('planillas_nomina') || [];
    const [anio, mes] = periodo.split('-').map(Number);

    const ultimos3 = [];
    for (let i = 1; i <= 3; i++) {
      const mesAnterior = mes - i;
      const periodoConsulta = mesAnterior <= 0
        ? `${anio - 1}-${String(12 + mesAnterior).padStart(2, '0')}`
        : `${anio}-${String(mesAnterior).padStart(2, '0')}`;

      const planilla = planillas.find(p => p.periodo === periodoConsulta);
      if (planilla) {
        const linea = planilla.planilla.find(l => l.empleadoId === empleadoId);
        if (linea) {
          ultimos3.push(linea.devengados.totalDevengado);
        }
      }
    }

    if (ultimos3.length === 0) {
      // Si no hay planillas anteriores, usar salario actual + bono
      const emp = this.catalogoEmpleados.obtenerPorId(empleadoId);
      if (!emp) return 0;
      const bono = window.TablaBonoAntiguedad
        ? window.TablaBonoAntiguedad.calcularBono(emp.antiguedadAnios || 0).monto
        : 0;
      return this._r2((emp.salarioBase || 0) + bono);
    }

    return this._r2(ultimos3.reduce((a, b) => a + b, 0) / ultimos3.length);
  }

  /**
   * Obtiene los meses trabajados en el año actual.
   * @private
   */
  _obtenerMesesTrabajadosAnio(empleado, periodo) {
    const [anio, mes] = periodo.split('-').map(Number);
    const fechaIngreso = new Date(empleado.fechaIngreso);

    if (fechaIngreso.getFullYear() < anio) {
      return 12;  // Trabajó todo el año
    }
    if (fechaIngreso.getFullYear() > anio) {
      return 0;   // No trabajó en este año
    }
    // Trabajó parte del año
    return mes - fechaIngreso.getMonth();
  }

  _ultimoDiaDelMes(periodo) {
    const [anio, mes] = periodo.split('-').map(Number);
    const ultimoDia = new Date(anio, mes, 0).getDate();
    return `${periodo}-${String(ultimoDia).padStart(2, '0')}`;
  }

  _r2(n) { return Math.round((Number(n) || 0) * 100) / 100; }
  _r4(n) { return Math.round((Number(n) || 0) * 10000) / 10000; }
  _fmt(n) {
    return (window.utilidades && window.utilidades.formatearBs)
      ? window.utilidades.formatearBs(n) : `Bs ${n.toFixed(2)}`;
  }
}

window.ModuloProvisiones = ModuloProvisiones;
