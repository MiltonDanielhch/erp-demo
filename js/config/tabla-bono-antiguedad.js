// ══════════════════════════════════════════════════════════════
// tabla-bono-antiguedad.js — Tabla del DS 21060
// Base de cálculo: 3 × SMN (NO el salario real del empleado)
// ══════════════════════════════════════════════════════════════

/**
 * Tabla oficial del Bono de Antigüedad según DS 21060 (Bolivia).
 *
 * Particularidad boliviana única: la base SIEMPRE es 3 × SMN,
 * no el salario real del empleado. Dos empleados con la misma
 * antigüedad cobran el mismo bono, sin importar cuánto ganen.
 *
 * Ejemplo (SMN 2026 = Bs 2,500, base = Bs 7,500):
 *   6 años → 11% × 7,500 = Bs 825/mes
 */

const TABLA_BONO_ANTIGUEDAD = [
  { aniosMin: 0,  aniosMax: 1.99, porcentaje: 0,   tramo: 'Menos de 2 años' },
  { aniosMin: 2,  aniosMax: 4.99, porcentaje: 5,   tramo: '2 a 4 años' },
  { aniosMin: 5,  aniosMax: 7.99, porcentaje: 11,  tramo: '5 a 7 años' },
  { aniosMin: 8,  aniosMax: 10.99, porcentaje: 18,  tramo: '8 a 10 años' },
  { aniosMin: 11, aniosMax: 14.99, porcentaje: 26,  tramo: '11 a 14 años' },
  { aniosMin: 15, aniosMax: 19.99, porcentaje: 34,  tramo: '15 a 19 años' },
  { aniosMin: 20, aniosMax: 24.99, porcentaje: 42,  tramo: '20 a 24 años' },
  { aniosMin: 25, aniosMax: 999,   porcentaje: 50,  tramo: '25+ años' }
];

const TablaBonoAntiguedad = {

  /**
   * Obtiene el tramo aplicable según años de servicio.
   * @param {number} aniosServicio - Años (con fracción, ej: 6.5)
   * @returns {Object} { aniosMin, aniosMax, porcentaje, tramo }
   */
  obtenerTramo(aniosServicio) {
    if (typeof aniosServicio !== 'number' || aniosServicio < 0) {
      return TABLA_BONO_ANTIGUEDAD[0];
    }
    return TABLA_BONO_ANTIGUEDAD.find(t =>
      aniosServicio >= t.aniosMin && aniosServicio <= t.aniosMax
    ) || TABLA_BONO_ANTIGUEDAD[TABLA_BONO_ANTIGUEDAD.length - 1];
  },

  /**
   * Obtiene el porcentaje del bono según años de servicio.
   * @param {number} aniosServicio
   * @returns {number} Porcentaje (0, 5, 11, 18, 26, 34, 42, 50)
   */
  obtenerPorcentaje(aniosServicio) {
    return this.obtenerTramo(aniosServicio).porcentaje;
  },

  /**
   * Calcula el monto mensual del bono de antigüedad.
   *
   * @param {number} aniosServicio - Años de servicio
   * @param {number} [smnVigente] - SMN vigente (por defecto usa window.BOLIVIA.SMN_VIGENTE)
   * @returns {Object} { porcentaje, base, monto, tramo }
   */
  calcularBono(aniosServicio, smnVigente) {
    const SMN = smnVigente || (window.BOLIVIA && window.BOLIVIA.SMN_VIGENTE) || 2500;
    const base = SMN * 3;
    const tramo = this.obtenerTramo(aniosServicio);
    const porcentaje = tramo.porcentaje;
    const monto = window.BOLIVIA
      ? window.BOLIVIA.redondear2(base * porcentaje / 100)
      : Math.round(base * porcentaje) / 100;

    return {
      porcentaje,
      base,
      monto,
      tramo: tramo.tramo,
      aniosServicio,
      smnVigente: SMN
    };
  },

  /**
   * Devuelve toda la tabla en formato legible (para mostrar en UI).
   * @param {number} [smnVigente]
   * @returns {Array}
   */
  obtenerTablaConMontos(smnVigente) {
    return TABLA_BONO_ANTIGUEDAD.map(t => ({
      ...t,
      base: (smnVigente || (window.BOLIVIA && window.BOLIVIA.SMN_VIGENTE) || 2500) * 3,
      monto: window.BOLIVIA
        ? window.BOLIVIA.redondear2((smnVigente || window.BOLIVIA.SMN_VIGENTE || 2500) * 3 * t.porcentaje / 100)
        : Math.round((smnVigente || 2500) * 3 * t.porcentaje) / 100
    }));
  }
};

// Exponer globalmente
window.TABLA_BONO_ANTIGUEDAD = TABLA_BONO_ANTIGUEDAD;
window.TablaBonoAntiguedad = TablaBonoAntiguedad;
