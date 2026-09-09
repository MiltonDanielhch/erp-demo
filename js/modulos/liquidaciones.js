// ══════════════════════════════════════════════════════════════
// liquidaciones.js — Indemnización y Desahucio (DS 28699, DS 22138)
// ══════════════════════════════════════════════════════════════

/**
 * Módulo de Liquidaciones Boliviano.
 *
 * ⚠️ PARTICULARIDAD BOLIVIANA ÚNICA:
 * La indemnización por tiempo de servicio aplica TAMBIÉN A
 * RENUNCIA VOLUNTARIA (DS 28699, confirmado por el Tribunal
 * Constitucional Plurinacional).
 *
 * Un ERP que solo provisiona indemnización en "despido" está
 * MAL PARAMETRIZADO para Bolivia.
 *
 * Cuentas contables:
 *   5.2.07 Gasto de Indemnización       ← Debe (gasto)
 *   2.1.14 Indemnización por Pagar      ← Haber (pasivo)
 *   5.2.08 Gasto de Desahucio           ← Debe (gasto)
 *   2.1.15 Desahucio por Pagar          ← Haber (pasivo)
 */
class ModuloLiquidaciones {

  constructor(deps) {
    this.almacenamiento = deps.almacenamiento;
    this.catalogoEmpleados = deps.catalogoEmpleados;
    this.moduloNomina = deps.moduloNomina;
    this.motorContable = deps.motorContable;

    // Cuentas contables
    this.CUENTAS = {
      GASTO_INDEMNIZACION: '5.2.07',
      INDEMNIZACION_POR_PAGAR: '2.1.14',
      GASTO_DESAHUCIO: '5.2.08',
      DESAHUCIO_POR_PAGAR: '2.1.15',
      BANCOS: '1.1.02'
    };

    // Motivos de retiro
    this.MOTIVOS = {
      RENUNCIA: 'RENUNCIA',
      DESPIDO: 'DESPIDO',
      DESPIDO_JUSTA_CAUSA: 'DESPIDO_JUSTA_CAUSA',
      JUBILACION: 'JUBILACION',
      MUTUO_ACUERDO: 'MUTUO_ACUERDO',
      FALLECIMIENTO: 'FALLECIMIENTO'
    };

    console.log('⚖️ Módulo de Liquidaciones inicializado.');
  }

  // ══════════════════════════════════════════════════════════
  // CÁLCULO DE INDEMNIZACIÓN
  // ══════════════════════════════════════════════════════════

  /**
   * Calcula la indemnización por tiempo de servicio.
   *
   * Fórmula: promedio últimos 3 meses × años de servicio (con fracción)
   *
   * ⚠️ APLICA A: renuncia, despido, mutuo acuerdo
   * ⚠️ NO APLICA A: jubilación, fallecimiento
   * ⚠️ SIN TOPE de años
   * ⚠️ A partir de 90 días de trabajo continuo
   *
   * @param {Object} empleado
   * @param {string} motivoRetiro - Uno de MOTIVOS
   * @returns {Object}
   */
  calcularIndemnizacion(empleado, motivoRetiro = null) {
    // Motivos que NO aplican indemnización
    const noAplica = [this.MOTIVOS.JUBILACION, this.MOTIVOS.FALLECIMIENTO];
    if (motivoRetiro && noAplica.includes(motivoRetiro)) {
      return {
        monto: 0,
        promedioSalario: 0,
        aniosServicio: 0,
        aplica: false,
        motivo: `${motivoRetiro} no aplica indemnización`
      };
    }

    // Calcular promedio de últimos 3 meses
    const promedio = this._obtenerPromedioTotalGanado(empleado);

    // Calcular antigüedad en años (con fracción)
    const antiguedad = this.catalogoEmpleados.calcularAntiguedad(empleado);
    const aniosDecimal = antiguedad.aniosDecimal;

    // Verificar mínimo de 90 días
    if (antiguedad.diasTotales < 90) {
      return {
        monto: 0,
        promedioSalario: promedio,
        aniosServicio: aniosDecimal,
        aplica: false,
        motivo: 'Menos de 90 días de servicio'
      };
    }

    const monto = this._r2(promedio * aniosDecimal);

    return {
      monto,
      promedioSalario: promedio,
      aniosServicio: aniosDecimal,
      antiguedadDetalle: antiguedad,
      aplica: true,
      motivo: motivoRetiro || 'Sin especificar'
    };
  }

  /**
   * Calcula el desahucio por falta de preaviso.
   *
   * Fórmula: 3 × salario mensual (si el empleador no avisa con 90 días)
   *
   * ⚠️ APLICA SOLO A: despido sin preaviso
   * ⚠️ NO APLICA A: renuncia, despido con preaviso
   *
   * @param {Object} empleado
   * @param {boolean} tienePreaviso - Si el empleador avisó con 90 días
   * @returns {Object}
   */
  calcularDesahucio(empleado, tienePreaviso = true, motivoRetiro = null) {
    // El desahucio solo aplica en despido sin preaviso
    if (tienePreaviso || motivoRetiro !== this.MOTIVOS.DESPIDO) {
      return {
        monto: 0,
        aplica: false,
        motivo: tienePreaviso ? 'Con preaviso de 90 días' : 'No es despido'
      };
    }

    const promedio = this._obtenerPromedioTotalGanado(empleado);
    const monto = this._r2(promedio * 3);

    return {
      monto,
      salarioBase: promedio,
      meses: 3,
      aplica: true,
      motivo: 'Despido sin preaviso de 90 días'
    };
  }

  /**
   * Calcula la liquidación completa de un empleado al retiro.
   *
   * Incluye:
   * - Indemnización (aplica a renuncia también)
   * - Desahucio (solo si despido sin preaviso)
   * - Aguinaldo proporcional del año en curso
   *
   * @param {Object} empleado
   * @param {string} motivoRetiro
   * @param {Object} [opciones] - { tienePreaviso, periodo }
   * @returns {Object}
   */
  calcularLiquidacion(empleado, motivoRetiro, opciones = {}) {
    const tienePreaviso = opciones.tienePreaviso !== undefined ? opciones.tienePreaviso : true;
    const periodo = opciones.periodo || new Date().toISOString().slice(0, 7);

    // Indemnización
    const indemnizacion = this.calcularIndemnizacion(empleado, motivoRetiro);

    // Desahucio
    const desahucio = this.calcularDesahucio(empleado, tienePreaviso, motivoRetiro);

    // Aguinaldo proporcional del año en curso
    const aguinaldo = this._calcularAguinaldoProporcional(empleado, periodo);

    const totalLiquidacion = this._r2(
      indemnizacion.monto + desahucio.monto + aguinaldo.monto
    );

    return {
      empleadoId: empleado.id,
      empleadoNombre: `${empleado.nombres} ${empleado.apellidos}`,
      empleadoCI: empleado.ci,
      motivoRetiro,
      tienePreaviso,
      periodo,
      indemnizacion,
      desahucio,
      aguinaldo,
      totalLiquidacion,
      desglose: [
        { concepto: 'Indemnización', monto: indemnizacion.monto },
        { concepto: 'Desahucio', monto: desahucio.monto },
        { concepto: 'Aguinaldo proporcional', monto: aguinaldo.monto },
        { concepto: 'TOTAL', monto: totalLiquidacion }
      ]
    };
  }

  /**
   * Genera el asiento contable de liquidación por retiro.
   *
   * Asiento:
   *   Indemnización por Pagar (2.1.14)     Bs X  (Debe)
   *   Desahucio por Pagar (2.1.15)         Bs X  (Debe)
   *       Bancos (1.1.02)                          Bs X  (Haber)
   *
   * @param {Object} liquidacion - Resultado de calcularLiquidacion()
   * @returns {Object}
   */
  generarAsientoLiquidacion(liquidacion) {
    const lineas = [];

    // Indemnización (Debe)
    if (liquidacion.indemnizacion.monto > 0) {
      lineas.push({
        cuentaCodigo: this.CUENTAS.INDEMNIZACION_POR_PAGAR,
        cuentaNombre: 'Indemnización por Tiempo de Servicio por Pagar',
        debe: liquidacion.indemnizacion.monto,
        haber: 0
      });
    }

    // Desahucio (Debe)
    if (liquidacion.desahucio.monto > 0) {
      lineas.push({
        cuentaCodigo: this.CUENTAS.DESAHUCIO_POR_PAGAR,
        cuentaNombre: 'Desahucio por Pagar',
        debe: liquidacion.desahucio.monto,
        haber: 0
      });
    }

    // Aguinaldo proporcional (Debe)
    if (liquidacion.aguinaldo.monto > 0) {
      lineas.push({
        cuentaCodigo: '2.1.11',  // Aguinaldo por Pagar
        cuentaNombre: 'Aguinaldo por Pagar',
        debe: liquidacion.aguinaldo.monto,
        haber: 0
      });
    }

    // Total a pagar (Haber)
    lineas.push({
      cuentaCodigo: this.CUENTAS.BANCOS,
      cuentaNombre: 'Bancos',
      debe: 0,
      haber: liquidacion.totalLiquidacion
    });

    const resultado = this.motorContable.crearAsientoManual({
      fecha: new Date().toISOString().split('T')[0],
      concepto: `Liquidación por ${liquidacion.motivoRetiro} — ${liquidacion.empleadoNombre} (CI ${liquidacion.empleadoCI})`,
      lineas
    });

    if (!resultado.exito) {
      return { exito: false, errores: resultado.errores };
    }

    console.log(`⚖️ Liquidación generada: ${liquidacion.empleadoNombre} — ${this._fmt(liquidacion.totalLiquidacion)}`);

    return {
      exito: true,
      liquidacion,
      asiento: resultado.asiento
    };
  }

  /**
   * Registra el retiro de un empleado y genera la liquidación.
   *
   * @param {string} empleadoId
   * @param {string} motivoRetiro
   * @param {Object} [opciones] - { fechaRetiro, tienePreaviso }
   * @returns {Object}
   */
  registrarRetiro(empleadoId, motivoRetiro, opciones = {}) {
    const empleado = this.catalogoEmpleados.obtenerPorId(empleadoId);
    if (!empleado) {
      return { exito: false, errores: ['Empleado no encontrado'] };
    }

    if (empleado.estado === 'RETIRADO') {
      return { exito: false, errores: ['El empleado ya está retirado'] };
    }

    const fechaRetiro = opciones.fechaRetiro || new Date().toISOString().split('T')[0];
    const tienePreaviso = opciones.tienePreaviso !== undefined ? opciones.tienePreaviso : true;

    // Calcular liquidación
    const liquidacion = this.calcularLiquidacion(empleado, motivoRetiro, {
      tienePreaviso,
      periodo: fechaRetiro.slice(0, 7)
    });

    // Generar asiento de liquidación
    const asiento = this.generarAsientoLiquidacion(liquidacion);
    if (!asiento.exito) {
      return { exito: false, errores: asiento.errores };
    }

    // Marcar como retirado en el catálogo
    const retiro = this.catalogoEmpleados.retirar(empleadoId, motivoRetiro, fechaRetiro);
    if (!retiro.exito) {
      return { exito: false, errores: retiro.errores };
    }

    console.log(`🚪 Retiro registrado: ${empleado.nombres} ${empleado.apellidos} — Motivo: ${motivoRetiro}`);

    return {
      exito: true,
      liquidacion,
      asiento: asiento.asiento,
      empleado: retiro.empleado
    };
  }

  // ══════════════════════════════════════════════════════════
  // PROVISIÓN MENSUAL DE INDEMNIZACIÓN
  // ══════════════════════════════════════════════════════════

  /**
   * Genera el asiento de provisión mensual de indemnización.
   *
   * ⚠️ Se provisiona para TODOS los empleados activos, porque
   * la indemnización aplica también a renuncia voluntaria.
   *
   * Asiento:
   *   Gasto de Indemnización (5.2.07)         Bs X  (Debe)
   *       Indemnización por Pagar (2.1.14)            Bs X  (Haber)
   *
   * @param {string} periodo
   * @returns {Object}
   */
  generarAsientoProvisionMensual(periodo) {
    const empleados = this.catalogoEmpleados.obtenerActivos();
    if (empleados.length === 0) {
      return { exito: false, errores: ['No hay empleados activos'] };
    }

    let totalProvision = 0;
    const detalle = [];

    empleados.forEach(emp => {
      const indemnizacion = this.calcularIndemnizacion(emp);
      if (indemnizacion.aplica && indemnizacion.monto > 0) {
        // Provisión mensual = indemnización acumulada / 12
        const provisionMensual = this._r2(indemnizacion.monto / 12);
        totalProvision += provisionMensual;
        detalle.push({
          empleadoId: emp.id,
          nombre: `${emp.nombres} ${emp.apellidos}`,
          monto: provisionMensual
        });
      }
    });

    totalProvision = this._r2(totalProvision);

    if (totalProvision <= 0) {
      return { exito: false, errores: ['Ningún empleado aplica indemnización (todos con menos de 90 días)'] };
    }

    const resultado = this.motorContable.crearAsientoManual({
      fecha: this._ultimoDiaDelMes(periodo),
      concepto: `Provisión indemnización ${periodo} — ${detalle.length} empleados (DS 28699)`,
      lineas: [
        {
          cuentaCodigo: this.CUENTAS.GASTO_INDEMNIZACION,
          cuentaNombre: 'Gasto de Indemnización',
          debe: totalProvision,
          haber: 0
        },
        {
          cuentaCodigo: this.CUENTAS.INDEMNIZACION_POR_PAGAR,
          cuentaNombre: 'Indemnización por Tiempo de Servicio por Pagar',
          debe: 0,
          haber: totalProvision
        }
      ]
    });

    if (!resultado.exito) {
      return { exito: false, errores: resultado.errores };
    }

    console.log(`⚖️ Provisión indemnización ${periodo}: ${this._fmt(totalProvision)} (${detalle.length} empleados)`);

    return {
      exito: true,
      periodo,
      totalProvision,
      cantidadEmpleados: detalle.length,
      detalle,
      asiento: resultado.asiento
    };
  }

  /**
   * Obtiene el saldo acumulado de indemnización por pagar.
   * @returns {number}
   */
  obtenerProvisionAcumulada() {
    const mayor = this.motorContable.obtenerLibroMayor();
    const cuenta = mayor.find(m => m.cuentaCodigo === this.CUENTAS.INDEMNIZACION_POR_PAGAR);
    return cuenta ? cuenta.saldo : 0;
  }

  // ══════════════════════════════════════════════════════════
  // UTILIDADES PRIVADAS
  // ══════════════════════════════════════════════════════════

  _obtenerPromedioTotalGanado(empleado) {
    const planillas = this.almacenamiento.obtener('planillas_nomina') || [];
    const periodoActual = new Date().toISOString().slice(0, 7);
    const [anio, mes] = periodoActual.split('-').map(Number);

    const ultimos3 = [];
    for (let i = 1; i <= 3; i++) {
      const mesAnterior = mes - i;
      const periodoConsulta = mesAnterior <= 0
        ? `${anio - 1}-${String(12 + mesAnterior).padStart(2, '0')}`
        : `${anio}-${String(mesAnterior).padStart(2, '0')}`;

      const planilla = planillas.find(p => p.periodo === periodoConsulta);
      if (planilla) {
        const linea = planilla.planilla.find(l => l.empleadoId === empleado.id);
        if (linea) {
          ultimos3.push(linea.devengados.totalDevengado);
        }
      }
    }

    if (ultimos3.length === 0) {
      const bono = window.TablaBonoAntiguedad
        ? window.TablaBonoAntiguedad.calcularBono(empleado.antiguedadAnios || 0).monto
        : 0;
      return this._r2((empleado.salarioBase || 0) + bono);
    }

    return this._r2(ultimos3.reduce((a, b) => a + b, 0) / ultimos3.length);
  }

  _calcularAguinaldoProporcional(empleado, periodo) {
    const promedio = this._obtenerPromedioTotalGanado(empleado);
    const antiguedad = this.catalogoEmpleados.calcularAntiguedad(empleado);
    const [anio, mes] = periodo.split('-').map(Number);

    let mesesTrabajadosAnio;
    if (antiguedad.anios >= anio) {
      mesesTrabajadosAnio = mes;
    } else {
      mesesTrabajadosAnio = mes - new Date(empleado.fechaIngreso).getMonth();
    }
    mesesTrabajadosAnio = Math.max(0, Math.min(12, mesesTrabajadosAnio));

    const factor = mesesTrabajadosAnio / 12;
    const monto = this._r2(promedio * factor);

    return {
      monto,
      promedio,
      mesesTrabajados: mesesTrabajadosAnio,
      factor: this._r4(factor)
    };
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
      ? window.utilidades.formatearBs(n)
      : `Bs ${n.toFixed(2)}`;
  }
}

window.ModuloLiquidaciones = ModuloLiquidaciones;
