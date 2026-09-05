// ══════════════════════════════════════════════════════════════
// utilidades.js — ERP Contable Bolivia
// Funciones auxiliares: formato de montos, fechas, cálculos IVA/IT
// ══════════════════════════════════════════════════════════════

/**
 * Utilidades: Funciones puras que se usan en todo el ERP.
 *
 * Regla: estas funciones NO modifican estado, NO tienen efectos
 * secundarios. Reciben datos, devuelven datos. Punto.
 *
 * Si necesitas formatear un monto, una fecha, o calcular el IVA,
 * usa estas funciones. NO las reinventes en cada módulo.
 */

const Utilidades = {

  // ──────────────────────────────────────────────────────────────
  // FORMATO DE MONTOS (Bolivianos)
  // ──────────────────────────────────────────────────────────────

  /**
   * Formatea un monto en bolivianos.
   * Ejemplo: 1234.5 → "Bs 1.234,50"
   * @param {number} monto - El monto a formatear
   * @returns {string} Monto formateado
   */
  formatearBs(monto) {
    if (monto === null || monto === undefined || isNaN(monto)) {
      return 'Bs 0,00';
    }
    // Usar toLocaleString con formato boliviano
    // Bolivia usa punto para miles y coma para decimales
    const formateado = Number(monto).toLocaleString('es-BO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `Bs ${formateado}`;
  },

  /**
   * Formatea un monto sin el prefijo "Bs".
   * Ejemplo: 1234.5 → "1.234,50"
   * @param {number} monto - El monto a formatear
   * @returns {string} Monto formateado sin prefijo
   */
  formatearMonto(monto) {
    if (monto === null || monto === undefined || isNaN(monto)) {
      return '0,00';
    }
    return Number(monto).toLocaleString('es-BO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  },

  /**
   * Redondea a 2 decimales (para evitar errores de punto flotante).
   * @param {number} numero - El número a redondear
   * @returns {number} Número redondeado
   */
  redondear(numero) {
    return Math.round((numero + Number.EPSILON) * 100) / 100;
  },

  // ──────────────────────────────────────────────────────────────
  // FORMATO DE FECHAS
  // ──────────────────────────────────────────────────────────────

  /**
   * Formatea una fecha como DD/MM/AAAA.
   * Ejemplo: "2026-09-15" → "15/09/2026"
   * @param {string|Date} fecha - La fecha a formatear
   * @returns {string} Fecha formateada
   */
  formatearFecha(fecha) {
    if (!fecha) return '--/--/----';
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return '--/--/----';
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    return `${dia}/${mes}/${anio}`;
  },

  /**
   * Formatea una fecha como "Mes AAAA" (para períodos).
   * Ejemplo: "2026-09-15" → "Sep 2026"
   * @param {string|Date} fecha - La fecha
   * @returns {string} Período formateado
   */
  formatearPeriodo(fecha) {
    if (!fecha) return '--- ----';
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return '--- ----';
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                   'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${meses[d.getMonth()]} ${d.getFullYear()}`;
  },

  /**
   * Obtiene el período contable de una fecha.
   * Ejemplo: "2026-09-15" → "2026-09"
   * @param {string|Date} fecha - La fecha
   * @returns {string} Período en formato AAAA-MM
   */
  obtenerPeriodoContable(fecha) {
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return null;
    const anio = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    return `${anio}-${mes}`;
  },

  /**
   * Devuelve la fecha actual como string ISO.
   * @returns {string} Fecha actual en formato ISO
   */
  fechaActual() {
    return new Date().toISOString();
  },

  /**
   * Devuelve la fecha actual como YYYY-MM-DD.
   * @returns {string} Fecha actual
   */
  fechaActualCorta() {
    const d = new Date();
    const anio = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  },

  // ──────────────────────────────────────────────────────────────
  // FORMATO DE NIT
  // ──────────────────────────────────────────────────────────────

  /**
   * Formatea un NIT con guión verificador.
   * Ejemplo: "1234567891" → "123456789-1"
   * @param {string} nit - El NIT (con o sin guión)
   * @returns {string} NIT formateado
   */
  formatearNIT(nit) {
    if (!nit) return '';
    // Quitar guiones y espacios existentes
    const limpio = nit.replace(/[-\s]/g, '');
    if (limpio.length < 2) return limpio;
    const base = limpio.slice(0, -1);
    const verificador = limpio.slice(-1);
    return `${base}-${verificador}`;
  },

  // ──────────────────────────────────────────────────────────────
  // CÁLCULOS DE IMPUESTOS BOLIVIANOS
  // ──────────────────────────────────────────────────────────────

  /**
   * Extrae el valor neto de un monto con IVA incluido (13%).
   * Fórmula: Neto = Total ÷ 1.13
   *
   * ⚠️ En Bolivia, el IVA está INCLUIDO en el precio (Art. 5 Ley 843).
   * Esta es la fórmula estándar del Libro de Compras y Ventas.
   *
   * Ejemplo: 5650 → 5000
   * @param {number} montoTotal - Monto total con IVA incluido
   * @returns {number} Valor neto sin IVA
   */
  extraerNetoDeTotal(montoTotal) {
    if (!montoTotal || montoTotal <= 0) return 0;
    return this.redondear(montoTotal / 1.13);
  },

  /**
   * Calcula el IVA de un monto total con IVA incluido.
   * Fórmula: IVA = Total − (Total ÷ 1.13)
   *
   * Ejemplo: 5650 → 650
   * @param {number} montoTotal - Monto total con IVA incluido
   * @returns {number} Monto del IVA
   */
  calcularIVADeTotal(montoTotal) {
    if (!montoTotal || montoTotal <= 0) return 0;
    const neto = this.extraerNetoDeTotal(montoTotal);
    return this.redondear(montoTotal - neto);
  },

  /**
   * Calcula el IVA sobre un neto (para futuro "IVA por fuera").
   * Fórmula: IVA = Neto × 0.13
   *
   * ⚠️ Esta función es para cuando entre en vigencia la Ley 1733
   * que muestra el IVA "por fuera" del precio.
   *
   * @param {number} montoNeto - Valor neto sin IVA
   * @returns {number} Monto del IVA
   */
  calcularIVASobreNeto(montoNeto) {
    if (!montoNeto || montoNeto <= 0) return 0;
    return this.redondear(montoNeto * 0.13);
  },

  /**
   * Calcula el IT (Impuesto a las Transacciones) sobre un monto bruto.
   * Fórmula: IT = Monto Bruto × 3%
   *
   * ⚠️ El IT se calcula sobre el MONTO BRUTO (total de la factura),
   * NO sobre el neto. No importa que el IVA esté incluido.
   *
   * Ejemplo: 11300 → 339
   * @param {number} montoBruto - Monto bruto de la transacción
   * @returns {number} Monto del IT
   */
  calcularIT(montoBruto) {
    if (!montoBruto || montoBruto <= 0) return 0;
    return this.redondear(montoBruto * 0.03);
  },

  /**
   * Calcula el IUE (Impuesto a las Utilidades) sobre utilidad imponible.
   * Fórmula: IUE = Utilidad Imponible × 25%
   * Si la utilidad es ≤ 0, el IUE es 0.
   *
   * @param {number} utilidadImponible - Utilidad neta imponible
   * @returns {number} Monto del IUE
   */
  calcularIUE(utilidadImponible) {
    if (!utilidadImponible || utilidadImponible <= 0) return 0;
    return this.redondear(utilidadImponible * 0.25);
  },

  // ──────────────────────────────────────────────────────────────
  // CÁLCULOS LABORALES BOLIVIANOS
  // ──────────────────────────────────────────────────────────────

  /**
   * Calcula el bono de antigüedad según años de servicio.
   * Base: 3 × SMN vigente. Porcentaje según tabla.
   *
   * @param {number} aniosServicio - Años de servicio del empleado
   * @param {number} smnVigente - Salario Mínimo Nacional vigente
   * @returns {Object} { porcentaje, base, monto }
   */
  calcularBonoAntiguedad(aniosServicio, smnVigente) {
    const TABLA = [
      { min: 2, max: 4, porcentaje: 0.05 },
      { min: 5, max: 7, porcentaje: 0.11 },
      { min: 8, max: 10, porcentaje: 0.18 },
      { min: 11, max: 14, porcentaje: 0.26 },
      { min: 15, max: 19, porcentaje: 0.34 },
      { min: 20, max: 24, porcentaje: 0.42 },
      { min: 25, max: Infinity, porcentaje: 0.50 }
    ];

    if (aniosServicio < 2) {
      return { porcentaje: 0, base: 0, monto: 0 };
    }

    const tramo = TABLA.find(t => aniosServicio >= t.min && aniosServicio <= t.max);
    if (!tramo) {
      return { porcentaje: 0, base: 0, monto: 0 };
    }

    const base = 3 * smnVigente;
    const monto = this.redondear(base * tramo.porcentaje);

    return { porcentaje: tramo.porcentaje, base, monto };
  },

  // ──────────────────────────────────────────────────────────────
  // UTILIDADES GENERALES
  // ──────────────────────────────────────────────────────────────

  /**
   * Genera un número correlativo con prefijo.
   * Ejemplo: generarNumero("AD-2026-09", 1) → "AD-2026-09-001"
   * @param {string} prefijo - Prefijo del número
   * @param {number} secuencia - Número de secuencia
   * @returns {string} Número formateado
   */
  generarNumero(prefijo, secuencia) {
    const seq = String(secuencia).padStart(3, '0');
    return `${prefijo}-${seq}`;
  },

  /**
   * Calcula la variación entre dos valores (en Bs y %).
   * @param {number} valorAnterior - Valor del período anterior
   * @param {number} valorActual - Valor del período actual
   * @returns {Object} { variacionBs, variacionPorcentaje }
   */
  calcularVariacion(valorAnterior, valorActual) {
    const variacionBs = this.redondear(valorActual - valorAnterior);
    let variacionPorcentaje = 0;
    if (valorAnterior !== 0) {
      variacionPorcentaje = this.redondear(((valorActual - valorAnterior) / Math.abs(valorAnterior)) * 100);
    }
    return { variacionBs, variacionPorcentaje };
  },

  /**
   * Verifica si un valor es un número válido.
   * @param {*} valor - El valor a verificar
   * @returns {boolean} true si es un número válido
   */
  esNumero(valor) {
    return typeof valor === 'number' && !isNaN(valor) && isFinite(valor);
  },

  /**
   * Genera un hash simple de un string (para CUF simulado).
   * @param {string} texto - Texto a hashear
   * @returns {string} Hash de 8 caracteres
   */
  hashSimple(texto) {
    let hash = 0;
    for (let i = 0; i < texto.length; i++) {
      const char = texto.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36).toUpperCase().padStart(8, '0').slice(0, 8);
  }
};
