// ══════════════════════════════════════════════════════════════
// bolivia.js — ERP Contable Bolivia
// Configuración del dominio boliviano: constantes tributarias,
// laborales y contables según la legislación vigente
// ══════════════════════════════════════════════════════════════

/**
 * Configuración del dominio boliviano.
 *
 * Este archivo centraliza TODAS las constantes que dependen de
 * la legislación boliviana. Si una ley cambia, solo tocamos aquí.
 *
 * ⚠️ REGLA: Ningún módulo debe tener constantes bolivianas
 * hardcodeadas (ej: "const IVA = 13"). Siempre usar BOLIVIA.IVA_PORCENTAJE.
 *
 * Fuentes normativas:
 * - Ley 843 (impuestos nacionales)
 * - Código Tributario Boliviano (Ley 2492)
 * - Ley General del Trabajo (LGT)
 * - NC del CTNAC (Normas de Contabilidad)
 * - Decretos Supremos específicos (1802, 21060, 28699, etc.)
 * - Ley 1733 de Alivio Tributario (2026)
 */

const BOLIVIA = {

  // ════════════════════════════════════════════════════════════
  // IMPUESTOS NACIONALES (Ley 843)
  // ════════════════════════════════════════════════════════════

  /**
   * IVA — Impuesto al Valor Agregado
   * Tasa: 13%
   * Base legal: Ley 843, Título II, Art. 1 al 13
   *
   * ⚠️ PARTICULARIDAD BOLIVIANA (vigente hasta decreto reglamentario
   * de la Ley 1733 de 2026):
   * El IVA está INCLUIDO en el precio (Art. 5 Ley 843).
   * Para extraer el neto: Neto = Total ÷ 1.13
   *
   * La Ley 1733 (27/05/2026) modificó el Art. 5 para mostrar el IVA
   * "por fuera" del precio, pero aún pendiente de reglamentación.
   * Este ERP usa un parámetro IVA_MOSTRADO_POR_FUERA para controlar
   * el comportamiento según la fecha de vigencia.
   */
  IVA_PORCENTAJE: 13,
  FACTOR_IVA_DENTRO: 1.13,  // Total ÷ 1.13 = Neto (esquema vigente)
  FACTOR_IVA_FUERA: 0.13,   // Neto × 0.13 = IVA (esquema futuro)

  /**
   * IVA_MOSTRADO_POR_FUERA: toggle para el cambio de esquema.
   * false = IVA incluido en el precio (vigente hoy)
   * true = IVA separado del precio (cuando entre en vigor el reglamento)
   *
   * Se puede cambiar por fecha de vigencia si se conoce.
   */
  IVA_MOSTRADO_POR_FUERA: false,

  /**
   * IT — Impuesto a las Transacciones
   * Tasa: 3% sobre el monto BRUTO de cada transacción
   * Base legal: Ley 843, Título III, Art. 72 al 77
   *
   * ⚠️ IMPORTANTE:
   * - Se calcula sobre el monto BRUTO (total factura), no el neto.
   * - El IT pagado en el año se compensa contra el IUE anual (Art. 77).
   * - Si IT pagado > IUE determinado, el exceso SE PIERDE (no se devuelve).
   */
  IT_PORCENTAJE: 3,

  /**
   * IUE — Impuesto sobre las Utilidades de las Empresas
   * Tasa: 25% sobre la utilidad neta imponible
   * Base legal: Ley 843, Título IV, Art. 37 al 57
   *
   * Plazo de declaración: 120 días después del cierre de gestión.
   * Formulario: Form. 500 (contribuyentes con contabilidad)
   *            Form. 510 (otros casos)
   *
   * Si la utilidad imponible es ≤ 0, el IUE es 0.
   */
  IUE_PORCENTAJE: 25,
  IUE_PLAZO_DIAS: 120,

  /**
   * RC-IVA — Régimen Complementario al IVA
   * Tasa: 13%
   * Base legal: Ley 843, Título II, Art. 14 al 23
   *
   * Aplica a:
   * - Empleados dependientes (compensable con facturas de gastos personales)
   * - Profesionales independientes (desde 2023)
   * - Proveedores del régimen complementario (retención)
   */
  RC_IVA_PORCENTAJE: 13,

  /**
   * IUE-BE — IUE para Beneficiarios del Exterior
   * Tasa efectiva: 12.5% (25% sobre base presunta del 50%)
   * Base legal: Ley 843, Art. 52 al 54
   * Formulario: Form. 530
   *
   * Se retiene cuando una empresa boliviana remesa utilidades
   * o dividendos al exterior.
   */
  IUE_BE_TASA_EFECTIVA: 12.5,  // 12.5% del monto remesado
  IUE_BE_BASE_PRESUNTA: 50,    // 50% del monto remesado

  // ════════════════════════════════════════════════════════════
  // RETENCIONES
  // ════════════════════════════════════════════════════════════

  /**
   * Retenciones que la empresa practica como agente de retención.
   * - RC-IVA: 13% a proveedores del régimen complementario.
   * - IT: 3% en ciertos pagos (servicios profesionales, alquileres).
   */
  RETENCION_RC_IVA_PORCENTAJE: 13,
  RETENCION_IT_PORCENTAJE: 3,

  // ════════════════════════════════════════════════════════════
  // SALARIO MÍNIMO NACIONAL (LGT, DS anuales)
  // ════════════════════════════════════════════════════════════

  /**
   * SMN — Salario Mínimo Nacional vigente.
   * Se actualiza anualmente por Decreto Supremo (generalmente en mayo).
   *
   * ⚠️ VERIFICAR cada año el SMN vigente en el Ministerio de Trabajo.
   * El SMN es la base de cálculo del bono de antigüedad (3 × SMN).
   *
   * Históricos recientes:
   * - 2020: Bs 2,122
   * - 2021: Bs 2,122
   * - 2022: Bs 2,122
   * - 2023: Bs 2,362
   * - 2024: Bs 2,362
   * - 2025: Bs 2,500 (estimado)
   * - 2026: Bs 2,500 (referencia, verificar DS vigente)
   */
  SMN_VIGENTE: 2500,
  SMN_VIGENTE_DESDE: '2025-05-01',  // Fecha desde la cual rige

  /**
   * Tabla de Bono de Antigüedad (DS 21060, Art. 60)
   * Base de cálculo: 3 × SMN vigente (NO el salario real).
   *
   * Años de servicio │ Porcentaje
   * ─────────────────┼──────────
   * 2 - 4            │ 5%
   * 5 - 7            │ 11%
   * 8 - 10           │ 18%
   * 11 - 14          │ 26%
   * 15 - 19          │ 34%
   * 20 - 24          │ 42%
   * 25+              │ 50%
   */
  TABLA_BONO_ANTIGUEDAD: [
    { min: 2,  max: 4,         porcentaje: 0.05 },
    { min: 5,  max: 7,         porcentaje: 0.11 },
    { min: 8,  max: 10,        porcentaje: 0.18 },
    { min: 11, max: 14,        porcentaje: 0.26 },
    { min: 15, max: 19,        porcentaje: 0.34 },
    { min: 20, max: 24,        porcentaje: 0.42 },
    { min: 25, max: Infinity,  porcentaje: 0.50 }
  ],

  // ════════════════════════════════════════════════════════════
  // AGUINALDO (LGT, DS 1802)
  // ════════════════════════════════════════════════════════════

  /**
   * AGUINALDO DE NAVIDAD (obligatorio, siempre)
   * - Monto: 1 mes del "total ganado" (promedio últimos 3 meses).
   * - Fecha límite de pago: 20 de diciembre.
   * - Si trabajó menos de 1 año: proporcional.
   * - Se provisiona 1/12 cada mes.
   */
  AGUINALDO_MESES: 1,            // 1 mes de salario
  AGUINALDO_FECHA_LIMITE: '12-20',  // 20 de diciembre
  AGUINALDO_MINIMO_DIAS: 90,     // Aplica desde 90 días de trabajo

  /**
   * SEGUNDO AGUINALDO "ESFUERZO POR BOLIVIA" (condicional)
   * Base legal: Decreto Supremo N° 1802 (20/11/2013)
   *
   * Condición: solo si el INE confirma que el PIB creció > 4.5%
   * en el período julio-junio.
   *
   * Se activó para las gestiones: 2013, 2014, 2015, 2018.
   * NO se ha vuelto a activar desde 2018.
   *
   * ⚠️ NO programar como automático. Debe ser un toggle manual
   * que RRHH activa solo cuando el Gobierno confirma el umbral.
   */
  SEGUNDO_AGUINALDO_UMBRAL_PIB: 4.5,  // % de crecimiento del PIB
  SEGUNDO_AGUINALDO_ACTIVO: false,     // Toggle manual (RRHH lo activa)

  // ════════════════════════════════════════════════════════════
  // INDEMNIZACIÓN Y DESAHUCIO (LGT, DS 28699, DS 22138)
  // ════════════════════════════════════════════════════════════

  /**
   * INDEMNIZACIÓN POR TIEMPO DE SERVICIO (Art. 13 LGT)
   * - Monto: 1 mes del "total ganado" por cada año de servicio.
   * - SIN TOPE (no hay límite de años).
   * - Aplica desde 90 días de trabajo continuo.
   *
   * ⚠️ PARTICULARIDAD BOLIVIANA (DS 28699, confirmado por TCP):
   * La indemnización aplica TAMBIÉN a renuncia voluntaria,
   * no solo a despido. Un ERP que solo la provisione en despido
   * está MAL PARAMETRIZADO.
   */
  INDEMNIZACION_MINIMO_DIAS: 90,
  INDEMNIZACION_APLICA_RENUNCIA: true,  // DS 28699
  INDEMNIZACION_SIN_TOPE: true,

  /**
   * DESAHUCIO (falta de preaviso en despido injustificado)
   * Base legal: DS 22138
   * - Monto: 3 meses de salario.
   * - Aplica cuando el empleador no avisa el retiro con 90 días.
   * - Es ADICIONAL a la indemnización, no la reemplaza.
   */
  DESAHUCIO_MESES: 3,
  DESAHUCIO_PREAVISO_DIAS: 90,

  // ════════════════════════════════════════════════════════════
  // VACACIONES (Art. 44 LGT, DS 1592, DS 4709)
  // ════════════════════════════════════════════════════════════

  /**
   * Días de vacaciones anuales (días HÁBILES, no calendario).
   * Se generan al cumplir el primer año de antigüedad ininterrumpida.
   *
   * Años de servicio │ Días hábiles
   * ─────────────────┼────────────
   * 1 - 5 años       │ 15
   * 5 - 10 años      │ 20
   * Más de 10 años   │ 30
   */
  VACACIONES_TABLA: [
    { min: 1,  max: 5,         dias: 15 },
    { min: 5,  max: 10,        dias: 20 },
    { min: 10, max: Infinity,  dias: 30 }
  ],

  // ════════════════════════════════════════════════════════════
  // APORTES A LA SEGURIDAD SOCIAL
  // ════════════════════════════════════════════════════════════

  /**
   * Aportes laborales (descuentos al empleado)
   */
  APORTE_LABORAL_AFP: 0.10,  // 10% del total devengado

  /**
   * Aportes patronales (los paga la empresa, adicionales al salario)
   */
  APORTE_PATRONAL_SALUD: 0.10,    // ~10% a Gestora Pública (salud)
  APORTE_PATRONAL_AFP: 0.10,      // ~10% a Gestora Pública (largo plazo)
  APORTE_RIESGO_LABORAL: 0.02,    // ~2% según actividad

  // ════════════════════════════════════════════════════════════
  // NORMAS CONTABLES
  // ════════════════════════════════════════════════════════════

  /**
   * NORMAS CONTABLES APLICABLES
   * - NC del CTNAC (16 normas + marco conceptual, vigentes desde 01/01/2011)
   * - NO son NIIF puras (solo supletorias)
   *
   * ⚠️ UFV (ajuste por inflación) está SUSPENDIDO desde el
   * 10 de diciembre de 2020 según instrucción del CTNAC.
   */
  NORMAS_CONTABLES: 'NC_CTNAC',  // NC del CTNAC, no NIIF puras
  UFV_ACTIVO: false,             // Suspendido desde dic/2020
  UFV_FECHA_SUSPENSION: '2020-12-10',

  // ════════════════════════════════════════════════════════════
  // REGÍMENES TRIBUTARIOS
  // ════════════════════════════════════════════════════════════

  /**
   * Regímenes tributarios del SIN.
   *
   * RG: Régimen General (empresas formales, sin límite)
   * RTS: Régimen Tributario Simplificado (comerciantes minoristas)
   * STI: Sistema Tributario Integrado (transporte público)
   * RAU: Régimen Agropecuario Unificado
   * SIETE-RG: Sistema Integrado Especial de Transición (2026, Ley 1733)
   */
  REGIMENES_TRIBUTARIOS: {
    RG: {
      codigo: 'RG',
      nombre: 'Régimen General',
      emiteCreditoFiscal: true,
      periodicidad: 'mensual_anual'
    },
    RTS: {
      codigo: 'RTS',
      nombre: 'Régimen Tributario Simplificado',
      emiteCreditoFiscal: false,
      periodicidad: 'bimestral'
    },
    STI: {
      codigo: 'STI',
      nombre: 'Sistema Tributario Integrado',
      emiteCreditoFiscal: false,
      periodicidad: 'trimestral'
    },
    RAU: {
      codigo: 'RAU',
      nombre: 'Régimen Agropecuario Unificado',
      emiteCreditoFiscal: false,
      periodicidad: 'anual'
    },
    SIETE_RG: {
      codigo: 'SIETE-RG',
      nombre: 'Sistema Integrado Especial de Transición',
      emiteCreditoFiscal: false,  // Se acumula para migración a RG
      periodicidad: 'bimestral',
      tasaUnica: 5,  // 5% sobre ingreso bruto
      vigenciaMaximaAnios: 3
    }
  },

  // ════════════════════════════════════════════════════════════
  // MONEDA Y ZONA HORARIA
  // ════════════════════════════════════════════════════════════

  MONEDA_CODIGO: 'BOB',           // Boliviano
  MONEDA_SIMBOLO: 'Bs',
  MONEDA_DECIMALES: 2,
  ZONA_HORARIA: 'America/La_Paz',

  // ════════════════════════════════════════════════════════════
  // CALENDARIO TRIBUTARIO (vencimientos según dígito del NIT)
  // ════════════════════════════════════════════════════════════

  /**
   * Vencimientos mensuales de formularios SIN según último dígito del NIT.
   *
   * Dígito NIT │ Día de vencimiento (del mes siguiente)
   * ───────────┼──────────────────────────────────────
   * 1          │ 10
   * 2          │ 11
   * 3          │ 12
   * 4          │ 13
   * 5          │ 14
   * 6          │ 15
   * 7          │ 16
   * 8          │ 17
   * 9          │ 18
   * 0          │ 19
   */
  VENCIMIENTOS_POR_DIGITO: {
    1: 10, 2: 11, 3: 12, 4: 13, 5: 14,
    6: 15, 7: 16, 8: 17, 9: 18, 0: 19
  },

  // ════════════════════════════════════════════════════════════
  // FUNCIONES AUXILIARES DEL DOMINIO
  // ════════════════════════════════════════════════════════════

  /**
   * Verifica si una fecha está dentro del período de vigencia de una regla.
   * @param {string|Date} fecha - Fecha a verificar
   * @param {string} fechaInicio - Fecha de inicio de vigencia (YYYY-MM-DD)
   * @param {string} [fechaFin] - Fecha de fin de vigencia (opcional)
   * @returns {boolean} true si está vigente
   */
  estaVigente(fecha, fechaInicio, fechaFin = null) {
    const f = new Date(fecha);
    const inicio = new Date(fechaInicio);
    if (isNaN(f.getTime()) || isNaN(inicio.getTime())) return false;

    if (f < inicio) return false;

    if (fechaFin) {
      const fin = new Date(fechaFin);
      if (isNaN(fin.getTime())) return false;
      if (f > fin) return false;
    }

    return true;
  },

  /**
   * Determina si el esquema "IVA por fuera" está vigente en una fecha.
   * @param {string|Date} fecha - Fecha a verificar
   * @returns {boolean} true si se muestra el IVA por fuera
   */
  esquemaIVAPorFueraVigente(fecha) {
    // Por ahora siempre false (pendiente decreto reglamentario Ley 1733)
    // Cuando se publique el decreto, actualizar esta función:
    // return this.estaVigente(fecha, 'AAAA-MM-DD'); // fecha del decreto
    return false;
  },

  /**
   * Obtiene el último dígito del NIT para calcular vencimiento.
   * @param {string} nit - El NIT (con o sin guión)
   * @returns {number} Último dígito (0-9)
   */
  obtenerUltimoDigitoNIT(nit) {
    const limpio = String(nit).replace(/[-\s.]/g, '');
    if (!/^\d+$/.test(limpio)) return null;
    return parseInt(limpio.slice(-1), 10);
  },

  /**
   * Calcula la fecha de vencimiento de un formulario según el NIT.
   * @param {string} nit - NIT del contribuyente
   * @param {string} periodo - Período en formato "AAAA-MM"
   * @returns {string} Fecha de vencimiento en formato YYYY-MM-DD
   */
  calcularFechaVencimiento(nit, periodo) {
    const digito = this.obtenerUltimoDigitoNIT(nit);
    if (digito === null) return null;

    const dia = this.VENCIMIENTOS_POR_DIGITO[digito];
    const [anio, mes] = periodo.split('-').map(Number);

    // Vencimiento es el mes siguiente al período
    let mesVencimiento = mes + 1;
    let anioVencimiento = anio;
    if (mesVencimiento > 12) {
      mesVencimiento = 1;
      anioVencimiento = anio + 1;
    }

    const mesStr = String(mesVencimiento).padStart(2, '0');
    const diaStr = String(dia).padStart(2, '0');

    return `${anioVencimiento}-${mesStr}-${diaStr}`;
  },

  /**
   * Obtiene el porcentaje de bono de antigüedad según años de servicio.
   * @param {number} aniosServicio - Años de servicio
   * @returns {number} Porcentaje (0.05 a 0.50, o 0 si < 2 años)
   */
  obtenerPorcentajeBonoAntiguedad(aniosServicio) {
    if (aniosServicio < 2) return 0;
    const tramo = this.TABLA_BONO_ANTIGUEDAD.find(
      t => aniosServicio >= t.min && aniosServicio <= t.max
    );
    return tramo ? tramo.porcentaje : 0;
  },

  /**
   * Obtiene los días de vacaciones según años de servicio.
   * @param {number} aniosServicio - Años de servicio
   * @returns {number} Días hábiles de vacaciones (0 si < 1 año)
   */
  obtenerDiasVacaciones(aniosServicio) {
    if (aniosServicio < 1) return 0;
    const tramo = this.VACACIONES_TABLA.find(
      t => aniosServicio >= t.min && aniosServicio <= t.max
    );
    return tramo ? tramo.dias : 0;
  }
};
