// ══════════════════════════════════════════════════════════════
// validadores.js — ERP Contable Bolivia
// Validaciones bolivianas: NIT (módulo 11), CUF (43 chars),
// montos, fechas, partidas dobles
// ══════════════════════════════════════════════════════════════

/**
 * Validadores: Funciones que verifican datos antes de aceptarlos.
 *
 * REGLA DE ORO: Ningún dato entra al sistema sin pasar por aquí.
 * Un NIT inválido, un CUF duplicado, o un monto negativo pueden
 * corromper toda la contabilidad.
 *
 * Cada validador devuelve: { valido: boolean, errores: string[] }
 */

const Validadores = {

  // ──────────────────────────────────────────────────────────────
  // VALIDACIÓN DE NIT (Número de Identificación Tributaria)
  // ──────────────────────────────────────────────────────────────

  /**
   * Valida un NIT boliviano usando el algoritmo oficial del SIN.
   *
   * El NIT tiene formato: 123456789-1
   * El último dígito es el verificador, calculado con módulo 11
   * usando pesos cíclicos del 2 al 9.
   *
   * Algoritmo:
   * 1. Tomar los dígitos base (sin el verificador).
   * 2. Multiplicar cada dígito por pesos: 2, 3, 4, 5, 6, 7, 8, 9, 2, 3...
   *    (cíclico, de derecha a izquierda).
   * 3. Sumar todos los productos.
   * 4. residuo = suma % 11
   * 5. verificador = 11 - residuo
   * 6. Si verificador es 10 → usar 0. Si es 11 → usar 0.
   *
   * @param {string} nit - El NIT a validar (con o sin guión)
   * @returns {Object} { valido, errores }
   */
  validarNIT(nit) {
    const errores = [];

    if (!nit || typeof nit !== 'string') {
      return { valido: false, errores: ['El NIT es requerido.'] };
    }

    // Limpiar: quitar guiones, espacios, puntos
    const limpio = nit.replace(/[-\s.]/g, '');

    // Verificar que solo contiene dígitos
    if (!/^\d+$/.test(limpio)) {
      return { valido: false, errores: ['El NIT solo puede contener dígitos.'] };
    }

    // Verificar longitud (mínimo 2 dígitos: 1 base + 1 verificador)
    if (limpio.length < 2) {
      return { valido: false, errores: ['El NIT es demasiado corto.'] };
    }

    if (limpio.length > 12) {
      return { valido: false, errores: ['El NIT es demasiado largo (máximo 12 dígitos).'] };
    }

    // Extraer dígitos base y verificador
    const digitosBase = limpio.slice(0, -1);
    const verificadorIngresado = parseInt(limpio.slice(-1), 10);

    // Calcular el dígito verificador esperado
    const verificadorEsperado = this._calcularDigitoVerificadorNIT(digitosBase);

    if (verificadorIngresado !== verificadorEsperado) {
      errores.push(
        `NIT inválido: dígito verificador incorrecto. ` +
        `Se esperaba ${verificadorEsperado}, se ingresó ${verificadorIngresado}.`
      );
    }

    return { valido: errores.length === 0, errores };
  },

  /**
   * Calcula el dígito verificador del NIT (algoritmo módulo 11).
   * @param {string} digitosBase - Los dígitos base del NIT (sin verificador)
   * @returns {number} Dígito verificador calculado
   * @private
   */
  _calcularDigitoVerificadorNIT(digitosBase) {
    // Pesos cíclicos del 2 al 9, aplicados de derecha a izquierda
    const pesos = [2, 3, 4, 5, 6, 7, 8, 9];
    let suma = 0;

    // Recorrer de derecha a izquierda
    for (let i = 0; i < digitosBase.length; i++) {
      const digito = parseInt(digitosBase[digitosBase.length - 1 - i], 10);
      const peso = pesos[i % pesos.length];
      suma += digito * peso;
    }

    const residuo = suma % 11;
    let verificador = 11 - residuo;

    // Casos especiales
    if (verificador === 11) verificador = 0;
    if (verificador === 10) verificador = 0;

    return verificador;
  },

  // ──────────────────────────────────────────────────────────────
  // VALIDACIÓN DE CUF (Código Único de Factura)
  // ──────────────────────────────────────────────────────────────

  /**
   * Valida un CUF (Código Único de Factura) del sistema SIAT.
   *
   * El CUF tiene exactamente 43 caracteres alfanuméricos [A-Z0-9].
   * Los primeros caracteres contienen el NIT del emisor.
   *
   * Estructura típica:
   * B5A3C8D9E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U
   * ├──┤├──────────────────────────────────────┤
   * NIT    Código único generado por el SIN
   *
   * @param {string} cuf - El CUF a validar
   * @returns {Object} { valido, errores }
   */
  validarCUF(cuf) {
    const errores = [];

    if (!cuf || typeof cuf !== 'string') {
      return { valido: false, errores: ['El CUF es requerido.'] };
    }

    // Validación 1: Longitud exacta de 43 caracteres
    if (cuf.length !== 43) {
      errores.push(`El CUF debe tener exactamente 43 caracteres. Tiene ${cuf.length}.`);
    }

    // Validación 2: Solo caracteres alfanuméricos en mayúscula
    if (!/^[A-Z0-9]+$/.test(cuf)) {
      errores.push('El CUF solo puede contener letras mayúsculas (A-Z) y dígitos (0-9).');
    }

    // Validación 3: Extraer y validar NIT embebido (si es posible)
    // El NIT suele estar en los primeros 9-12 caracteres
    // Esto es una validación opcional, no todos los CUFs tienen el NIT visible
    if (cuf.length >= 12 && errores.length === 0) {
      // Intentar extraer secuencia de dígitos del inicio
      const match = cuf.match(/^(\d{8,11})/);
      if (match) {
        const nitBase = match[1];
        // Podríamos validar que este NIT existe, pero requeriría
        // acceso a una base de datos de NITs válidos del SIN
        // Por ahora solo verificamos que sea una secuencia válida
        if (nitBase.length < 8) {
          errores.push('El NIT extraído del CUF es demasiado corto.');
        }
      }
    }

    return { valido: errores.length === 0, errores };
  },

  // ──────────────────────────────────────────────────────────────
  // VALIDACIÓN DE MONTOS
  // ──────────────────────────────────────────────────────────────

  /**
   * Valida que un monto sea válido para el ERP.
   * - Debe ser un número.
   * - Debe ser positivo (> 0).
   * - Máximo 2 decimales.
   * - No puede ser mayor a 999,999,999.99 (límite práctico).
   *
   * @param {number} monto - El monto a validar
   * @returns {Object} { valido, errores }
   */
  validarMonto(monto) {
    const errores = [];

    if (monto === null || monto === undefined) {
      return { valido: false, errores: ['El monto es requerido.'] };
    }

    if (typeof monto !== 'number' || isNaN(monto)) {
      return { valido: false, errores: ['El monto debe ser un número.'] };
    }

    if (monto <= 0) {
      errores.push('El monto debe ser mayor a cero.');
    }

    // Verificar máximo 2 decimales
    const decimales = String(monto).split('.')[1];
    if (decimales && decimales.length > 2) {
      errores.push('El monto no puede tener más de 2 decimales.');
    }

    if (monto > 999999999.99) {
      errores.push('El monto excede el límite máximo permitido.');
    }

    return { valido: errores.length === 0, errores };
  },

  // ──────────────────────────────────────────────────────────────
  // VALIDACIÓN DE FECHAS
  // ──────────────────────────────────────────────────────────────

  /**
   * Valida que una fecha no sea futura.
   * No se pueden registrar asientos con fecha futura.
   *
   * @param {string|Date} fecha - La fecha a validar
   * @returns {Object} { valido, errores }
   */
  validarFechaNoFutura(fecha) {
    const errores = [];

    if (!fecha) {
      return { valido: false, errores: ['La fecha es requerida.'] };
    }

    const fechaIngresada = new Date(fecha);
    if (isNaN(fechaIngresada.getTime())) {
      return { valido: false, errores: ['La fecha no es válida.'] };
    }

    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999); // Fin del día actual

    if (fechaIngresada > hoy) {
      errores.push('No se pueden registrar documentos con fecha futura.');
    }

    return { valido: errores.length === 0, errores };
  },

  /**
   * Valida que una fecha esté dentro de un período contable abierto.
   * @param {string|Date} fecha - La fecha a validar
   * @param {Array} periodosAbiertos - Lista de períodos abiertos ["2026-08", "2026-09"]
   * @returns {Object} { valido, errores }
   */
  validarFechaEnPeriodoAbierto(fecha, periodosAbiertos) {
    const errores = [];

    if (!fecha) {
      return { valido: false, errores: ['La fecha es requerida.'] };
    }

    const fechaIngresada = new Date(fecha);
    if (isNaN(fechaIngresada.getTime())) {
      return { valido: false, errores: ['La fecha no es válida.'] };
    }

    const anio = fechaIngresada.getFullYear();
    const mes = String(fechaIngresada.getMonth() + 1).padStart(2, '0');
    const periodo = `${anio}-${mes}`;

    if (periodosAbiertos && periodosAbiertos.length > 0) {
      if (!periodosAbiertos.includes(periodo)) {
        errores.push(`El período ${periodo} está cerrado. Períodos abiertos: ${periodosAbiertos.join(', ')}.`);
      }
    }

    return { valido: errores.length === 0, errores };
  },

  // ──────────────────────────────────────────────────────────────
  // VALIDACIÓN DE PARTIDA DOBLE
  // ──────────────────────────────────────────────────────────────

  /**
   * Valida que un asiento contable cumpla la partida doble.
   * Reglas:
   * - Mínimo 2 líneas.
   * - Total Debe = Total Haber.
   * - Cada línea debe tener una cuenta.
   * - Cada línea debe tener monto en Debe O en Haber (no ambos).
   *
   * @param {Object} asiento - El asiento a validar
   * @param {Array} asiento.lineas - Array de líneas del asiento
   * @returns {Object} { valido, errores, advertencias }
   */
  validarPartidaDoble(asiento) {
    const errores = [];
    const advertencias = [];

    if (!asiento || !asiento.lineas || !Array.isArray(asiento.lineas)) {
      return { valido: false, errores: ['El asiento debe tener un array de líneas.'], advertencias: [] };
    }

    // Regla 1: Mínimo 2 líneas
    if (asiento.lineas.length < 2) {
      errores.push('Un asiento contable debe tener al menos 2 líneas (partida doble).');
    }

    // Calcular totales
    let totalDebe = 0;
    let totalHaber = 0;

    asiento.lineas.forEach((linea, indice) => {
      // Verificar que tenga cuenta
      if (!linea.cuentaCodigo) {
        errores.push(`Línea ${indice + 1}: no tiene código de cuenta.`);
      }

      // Verificar que tenga monto en Debe o Haber
      const debe = linea.debe || 0;
      const haber = linea.haber || 0;

      if (debe === 0 && haber === 0) {
        errores.push(`Línea ${indice + 1}: debe tener un monto en Debe o en Haber.`);
      }

      if (debe > 0 && haber > 0) {
        errores.push(`Línea ${indice + 1}: no puede tener monto en Debe Y Haber simultáneamente.`);
      }

      if (debe < 0 || haber < 0) {
        errores.push(`Línea ${indice + 1}: los montos no pueden ser negativos.`);
      }

      totalDebe += debe;
      totalHaber += haber;
    });

    // Regla 2: Total Debe = Total Haber
    // Usar tolerancia de 0.01 por errores de redondeo
    const diferencia = Math.abs(totalDebe - totalHaber);
    if (diferencia > 0.01) {
      errores.push(
        `Partida doble no cuadra: Debe (${totalDebe.toFixed(2)}) ≠ Haber (${totalHaber.toFixed(2)}). ` +
        `Diferencia: ${diferencia.toFixed(2)}.`
      );
    }

    return {
      valido: errores.length === 0,
      errores,
      advertencias,
      totalDebe: Utilidades.redondear(totalDebe),
      totalHaber: Utilidades.redondear(totalHaber)
    };
  },

  // ──────────────────────────────────────────────────────────────
  // VALIDACIÓN DE EMAIL (para usuarios)
  // ──────────────────────────────────────────────────────────────

  /**
   * Valida un email básico.
   * @param {string} email - El email a validar
   * @returns {Object} { valido, errores }
   */
  validarEmail(email) {
    const errores = [];
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !regex.test(email)) {
      errores.push('El formato del email no es válido.');
    }

    return { valido: errores.length === 0, errores };
  }
};
