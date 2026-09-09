// ══════════════════════════════════════════════════════════════
// bono-antiguedad.js — Módulo de Bono de Antigüedad (DS 21060)
// ══════════════════════════════════════════════════════════════

/**
 * Módulo de Bono de Antigüedad Boliviano.
 *
 * Particularidad única de Bolivia: la base SIEMPRE es 3 × SMN,
 * NO el salario real del empleado. Dos empleados con la misma
 * antigüedad cobran el MISMO bono, sin importar cuánto ganen.
 *
 * Cuentas contables (plan boliviano):
 *   5.2.04 Bono de Antigüedad          ← Debe (gasto)
 *   2.1.13 Bono de Antigüedad por Pagar ← Haber (pasivo)
 */
class ModuloBonoAntiguedad {

  constructor(deps) {
    this.almacenamiento = deps.almacenamiento;
    this.catalogoEmpleados = deps.catalogoEmpleados;
    this.motorContable = deps.motorContable;

    // Cuentas contables
    this.CUENTAS = {
      GASTO_BONO: '5.2.04',
      BONO_POR_PAGAR: '2.1.13'
    };

    // Clave de historial de SMN
    this.KEY_HISTORIAL_SMN = 'historial_smn';

    // Inicializar historial si no existe
    if (!localStorage.getItem(this.KEY_HISTORIAL_SMN)) {
      localStorage.setItem(this.KEY_HISTORIAL_SMN, JSON.stringify([
        {
          smn: window.BOLIVIA.SMN_VIGENTE || 2500,
          fecha: new Date().toISOString(),
          motivo: 'SMN inicial'
        }
      ]));
    }

    console.log('🎖️ Módulo de Bono de Antigüedad inicializado.');
  }

  // ══════════════════════════════════════════════════════════
  // CÁLCULO INDIVIDUAL
  // ══════════════════════════════════════════════════════════

  /**
   * Calcula el bono de antigüedad para un empleado específico.
   *
   * @param {Object} empleado
   * @returns {Object} { aniosServicio, tramo, porcentaje, base, monto }
   */
  calcularBonoEmpleado(empleado) {
    const antiguedad = this.catalogoEmpleados.calcularAntiguedad(empleado);
    const bono = window.TablaBonoAntiguedad.calcularBono(antiguedad.aniosDecimal);

    return {
      empleadoId: empleado.id,
      empleadoNombre: `${empleado.nombres} ${empleado.apellidos}`,
      empleadoCI: empleado.ci,
      salarioBase: empleado.salarioBase,
      aniosServicio: antiguedad.anios,
      aniosDecimal: antiguedad.aniosDecimal,
      detalleAntiguedad: antiguedad,
      tramo: bono.tramo,
      porcentaje: bono.porcentaje,
      base: bono.base,
      monto: bono.monto,
      aplicaBono: bono.porcentaje > 0
    };
  }

  /**
   * Calcula el bono de antigüedad para todos los empleados activos.
   * @returns {Object} { empleados, totales, sinBono, conBono }
   */
  calcularBonosTodos() {
    const activos = this.catalogoEmpleados.obtenerActivos();
    const empleados = activos.map(e => this.calcularBonoEmpleado(e));

    const conBono = empleados.filter(e => e.aplicaBono);
    const sinBono = empleados.filter(e => !e.aplicaBono);

    const totales = {
      cantidadEmpleados: empleados.length,
      conBono: conBono.length,
      sinBono: sinBono.length,
      totalBonoMensual: this._r2(empleados.reduce((s, e) => s + e.monto, 0)),
      totalBonoAnual: this._r2(empleados.reduce((s, e) => s + e.monto * 12, 0))
    };

    return { empleados, totales, conBono, sinBono };
  }

  // ══════════════════════════════════════════════════════════
  // PROVISIÓN MENSUAL (asiento contable)
  // ══════════════════════════════════════════════════════════

  /**
   * Genera el asiento contable de provisión mensual del bono.
   *
   * Asiento:
   *   Bono de Antigüedad (5.2.04)            Bs X  (Debe)
   *       Bono de Antigüedad por Pagar (2.1.13)    Bs X  (Haber)
   *
   * @param {string} periodo - Formato "AAAA-MM"
   * @returns {Object}
   */
  generarAsientoProvisionMensual(periodo) {
    const empleados = this.catalogoEmpleados.obtenerActivos();
    if (empleados.length === 0) {
      return { exito: false, errores: ['No hay empleados activos'] };
    }

    let totalBono = 0;
    const detalle = [];

    empleados.forEach(emp => {
      const bono = this.calcularBonoEmpleado(emp);
      if (bono.monto > 0) {
        totalBono += bono.monto;
        detalle.push({
          empleadoId: emp.id,
          nombre: bono.empleadoNombre,
          monto: bono.monto,
          porcentaje: bono.porcentaje
        });
      }
    });

    totalBono = this._r2(totalBono);

    if (totalBono <= 0) {
      return { exito: false, errores: ['Ningún empleado aplica bono (todos tienen menos de 2 años)'] };
    }

    const resultado = this.motorContable.crearAsientoManual({
      fecha: this._ultimoDiaDelMes(periodo),
      concepto: `Provisión bono de antigüedad ${periodo} — ${detalle.length} empleados (DS 21060)`,
      lineas: [
        {
          cuentaCodigo: this.CUENTAS.GASTO_BONO,
          cuentaNombre: 'Bono de Antigüedad',
          debe: totalBono,
          haber: 0
        },
        {
          cuentaCodigo: this.CUENTAS.BONO_POR_PAGAR,
          cuentaNombre: 'Bono de Antigüedad por Pagar',
          debe: 0,
          haber: totalBono
        }
      ]
    });

    if (!resultado.exito) {
      return { exito: false, errores: resultado.errores };
    }

    console.log(`🎖️ Provisión bono ${periodo}: ${this._fmt(totalBono)} (${detalle.length} empleados)`);

    return {
      exito: true,
      periodo,
      totalBono,
      cantidadEmpleados: detalle.length,
      detalle,
      asiento: resultado.asiento
    };
  }

  // ══════════════════════════════════════════════════════════
  // ACTUALIZACIÓN DEL SMN
  // ══════════════════════════════════════════════════════════

  /**
   * Actualiza el Salario Mínimo Nacional.
   *
   * Cuando el Gobierno cambia el SMN (generalmente en mayo),
   * todos los bonos de antigüedad se recalculan automáticamente
   * porque la base es 3 × SMN.
   *
   * @param {number} nuevoSMN - Nuevo Salario Mínimo Nacional
   * @param {string} [motivo] - Motivo del cambio (ej: "DS 1234")
   * @returns {Object} { exito, smnAnterior, smnNuevo, variacion, empleadosAfectados }
   */
  actualizarSMN(nuevoSMN, motivo = 'Actualización manual') {
    const SMN_ANTERIOR = window.BOLIVIA.SMN_VIGENTE;

    if (isNaN(nuevoSMN) || nuevoSMN <= 0) {
      return { exito: false, errores: ['SMN inválido: debe ser un número positivo'] };
    }
    if (nuevoSMN <= SMN_ANTERIOR) {
      return { exito: false, errores: [`El nuevo SMN (${nuevoSMN}) debe ser mayor al vigente (${SMN_ANTERIOR})`] };
    }

    const variacion = this._r2((nuevoSMN - SMN_ANTERIOR) / SMN_ANTERIOR * 100);

    // Actualizar en window.BOLIVIA
    if (window.BOLIVIA) {
      window.BOLIVIA.SMN_VIGENTE = nuevoSMN;
    }

    // Guardar en historial
    const historial = this.obtenerHistorialSMN();
    historial.push({
      smn: nuevoSMN,
      fecha: new Date().toISOString(),
      motivo
    });
    try {
      localStorage.setItem(this.KEY_HISTORIAL_SMN, JSON.stringify(historial));
    } catch (e) {
      console.error('❌ Error al guardar historial SMN:', e);
    }

    // Recalcular bonos de todos los empleados (se hace automáticamente
    // al consultarlos, porque el cálculo usa el SMN vigente)
    const empleados = this.calcularBonosTodos();

    console.log(`🎖️ SMN actualizado: ${this._fmt(SMN_ANTERIOR)} → ${this._fmt(nuevoSMN)} (+${variacion}%)`);

    return {
      exito: true,
      smnAnterior: SMN_ANTERIOR,
      smnNuevo: nuevoSMN,
      variacion,
      baseAnterior: SMN_ANTERIOR * 3,
      baseNueva: nuevoSMN * 3,
      empleadosAfectados: empleados.totales.conBono,
      totalBonoMensualNuevo: empleados.totales.totalBonoMensual
    };
  }

  /**
   * Obtiene el historial de cambios del SMN.
   * @returns {Array}
   */
  obtenerHistorialSMN() {
    try {
      const raw = localStorage.getItem(this.KEY_HISTORIAL_SMN);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Obtiene el SMN vigente.
   * @returns {number}
   */
  obtenerSMNVigente() {
    return (window.BOLIVIA && window.BOLIVIA.SMN_VIGENTE) || 2500;
  }

  /**
   * Obtiene la base de cálculo del bono (3 × SMN).
   * @returns {number}
   */
  obtenerBaseCalculo() {
    return this.obtenerSMNVigente() * 3;
  }

  // ══════════════════════════════════════════════════════════
  // CONSULTAS DE PROVISIONES ACUMULADAS
  // ══════════════════════════════════════════════════════════

  /**
   * Obtiene el saldo acumulado del bono por pagar desde el Libro Mayor.
   * @returns {number}
   */
  obtenerProvisionAcumulada() {
    const mayor = this.motorContable.obtenerLibroMayor();
    const cuenta = mayor.find(m => m.cuentaCodigo === this.CUENTAS.BONO_POR_PAGAR);
    return cuenta ? cuenta.saldo : 0;
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

window.ModuloBonoAntiguedad = ModuloBonoAntiguedad;
