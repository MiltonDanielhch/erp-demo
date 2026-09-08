// ══════════════════════════════════════════════════════════════
// estructura-asiento.js — ERP Contable Bolivia
// Estructura de datos del Asiento Contable
// ══════════════════════════════════════════════════════════════

/**
 * Constantes de tipos de asiento
 */
const TIPOS_ASIENTO = {
  COMPRA: 'COMPRA',
  VENTA: 'VENTA',
  NOMINA: 'NOMINA',
  AJUSTE: 'AJUSTE',
  CIERRE: 'CIERRE',
  MANUAL: 'MANUAL'
};

/**
 * Constantes de estados del asiento
 */
const ESTADOS_ASIENTO = {
  PENDIENTE: 'PENDIENTE',
  PROCESADO: 'PROCESADO',
  ANULADO: 'ANULADO'
};

/**
 * Crea una línea de asiento contable.
 *
 * @param {Object} datos
 * @param {string} datos.cuentaCodigo - Código de la cuenta (ej: "1.1.01")
 * @param {string} datos.cuentaNombre - Nombre descriptivo de la cuenta
 * @param {number} datos.debe - Monto en el Debe (0 si es Haber)
 * @param {number} datos.haber - Monto en el Haber (0 si es Debe)
 * @param {string} [datos.descripcion] - Descripción opcional de la línea
 * @returns {Object} Línea del asiento
 */
function crearLinea(datos) {
  const debe = parseFloat(datos.debe) || 0;
  const haber = parseFloat(datos.haber) || 0;

  if (debe > 0 && haber > 0) {
    throw new Error(`Línea inválida: no puede tener Debe (${debe}) y Haber (${haber}) simultáneamente`);
  }

  if (debe === 0 && haber === 0) {
    throw new Error(`Línea inválida: debe tener Debe o Haber (ambos son 0)`);
  }

  return {
    id: `linea-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    cuentaCodigo: datos.cuentaCodigo,
    cuentaNombre: datos.cuentaNombre || '',
    debe: BOLIVIA.redondear2(debe),
    haber: BOLIVIA.redondear2(haber),
    descripcion: datos.descripcion || ''
  };
}

/**
 * Crea un asiento contable completo con validación automática.
 *
 * @param {Object} datos
 * @param {string} datos.fecha - Fecha del asiento (YYYY-MM-DD)
 * @param {string} datos.tipo - Tipo de asiento (COMPRA, VENTA, NOMINA, etc.)
 * @param {string} datos.concepto - Descripción del asiento
 * @param {Array} datos.lineas - Array de líneas (mínimo 2)
 * @param {string} [datos.documentoFuenteId] - ID del documento fuente
 * @param {string} [datos.creadoPor] - Usuario que creó el asiento
 * @returns {Object} { exito: boolean, asiento: Object|null, errores: string[] }
 */
function crearAsiento(datos) {
  const errores = [];

  // Validar datos básicos
  if (!datos.fecha) {
    errores.push('La fecha es obligatoria');
  }

  if (!datos.tipo) {
    errores.push('El tipo de asiento es obligatorio');
  }

  if (!datos.concepto || datos.concepto.trim().length === 0) {
    errores.push('El concepto es obligatorio');
  }

  if (!Array.isArray(datos.lineas) || datos.lineas.length < 2) {
    errores.push('El asiento debe tener al menos 2 líneas');
  }

  if (errores.length > 0) {
    return { exito: false, asiento: null, errores };
  }

  // Calcular totales
  let totalDebe = 0;
  let totalHaber = 0;

  const lineasProcesadas = datos.lineas.map(linea => {
    const lineaCreada = crearLinea(linea);
    totalDebe += lineaCreada.debe;
    totalHaber += lineaCreada.haber;
    return lineaCreada;
  });

  totalDebe = BOLIVIA.redondear2(totalDebe);
  totalHaber = BOLIVIA.redondear2(totalHaber);

  const cuadra = Math.abs(totalDebe - totalHaber) <= 0.01;

  // Determinar período contable
  const periodoContable = utilidades.obtenerPeriodoContable(datos.fecha);

  // Generar número de asiento
  const numero = generarNumeroAsiento(datos.tipo, periodoContable);

  const asiento = {
    id: `asiento-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    numero: numero,
    fecha: datos.fecha,
    periodoContable: periodoContable,
    tipo: datos.tipo,
    concepto: datos.concepto.trim(),
    documentoFuenteId: datos.documentoFuenteId || null,
    estado: ESTADOS_ASIENTO.PENDIENTE,
    lineas: lineasProcesadas,
    totalDebe: totalDebe,
    totalHaber: totalHaber,
    cuadra: cuadra,
    creadoPor: datos.creadoPor || 'sistema',
    creadoEn: new Date().toISOString()
  };

  // Validar estructura completa
  const validacion = validarEstructuraAsiento(asiento);
  if (!validacion.valido) {
    return { exito: false, asiento: null, errores: validacion.errores };
  }

  return { exito: true, asiento: asiento, errores: [] };
}

/**
 * Genera un número único de asiento según el tipo y período.
 *
 * Formatos:
 * - Diario: AD-2026-09-001
 * - Ajuste: AJ-2026-09-001
 * - Cierre: CI-2026-001
 *
 * @param {string} tipo - Tipo de asiento
 * @param {string} periodoContable - Período en formato "AAAA-MM"
 * @returns {string} Número de asiento
 */
function generarNumeroAsiento(tipo, periodoContable) {
  const prefijo = {
    [TIPOS_ASIENTO.COMPRA]: 'AD',
    [TIPOS_ASIENTO.VENTA]: 'AD',
    [TIPOS_ASIENTO.NOMINA]: 'AD',
    [TIPOS_ASIENTO.AJUSTE]: 'AJ',
    [TIPOS_ASIENTO.CIERRE]: 'CI',
    [TIPOS_ASIENTO.MANUAL]: 'AD'
  }[tipo] || 'AD';

  const [anio, mes] = periodoContable.split('-');

  // Para cierre, el número es anual
  if (tipo === TIPOS_ASIENTO.CIERRE) {
    const asientosCierre = almacenamiento.obtener('asientos_contabilizados')
      .filter(a => a.tipo === TIPOS_ASIENTO.CIERRE && a.numero.startsWith(`CI-${anio}`));
    const secuencia = asientosCierre.length + 1;
    return `CI-${anio}-${String(secuencia).padStart(3, '0')}`;
  }

  // Para otros tipos, el número es por período
  const asientosPeriodo = almacenamiento.obtener('asientos_contabilizados')
    .filter(a => a.periodoContable === periodoContable && a.numero.startsWith(prefijo));
  const secuencia = asientosPeriodo.length + 1;

  return `${prefijo}-${anio}-${mes}-${String(secuencia).padStart(3, '0')}`;
}

/**
 * Valida la estructura completa de un asiento contable.
 *
 * Verificaciones:
 * 1. Mínimo 2 líneas
 * 2. totalDebe === totalHaber (con tolerancia ±0.01)
 * 3. Cada línea tiene cuenta válida
 * 4. Fecha dentro del período contable
 * 5. Período contable abierto
 *
 * @param {Object} asiento - Asiento a validar
 * @returns {Object} { valido: boolean, errores: string[] }
 */
function validarEstructuraAsiento(asiento) {
  const errores = [];

  // 1. Validar estructura básica
  if (!asiento.id) errores.push('Falta ID del asiento');
  if (!asiento.numero) errores.push('Falta número de asiento');
  if (!asiento.fecha) errores.push('Falta fecha');
  if (!asiento.periodoContable) errores.push('Falta período contable');
  if (!asiento.tipo) errores.push('Falta tipo de asiento');
  if (!asiento.concepto) errores.push('Falta concepto');

  // 2. Validar líneas
  if (!Array.isArray(asiento.lineas)) {
    errores.push('Las líneas deben ser un array');
  } else {
    if (asiento.lineas.length < 2) {
      errores.push(`El asiento debe tener al menos 2 líneas (tiene ${asiento.lineas.length})`);
    }

    asiento.lineas.forEach((linea, idx) => {
      if (!linea.cuentaCodigo) {
        errores.push(`Línea ${idx + 1}: falta código de cuenta`);
      } else {
        // Verificar que la cuenta existe en el plan
        const cuenta = PlanCuentasUtilidades.obtenerCuenta(linea.cuentaCodigo);
        if (!cuenta) {
          errores.push(`Línea ${idx + 1}: cuenta ${linea.cuentaCodigo} no existe en el plan`);
        }
      }

      if (linea.debe > 0 && linea.haber > 0) {
        errores.push(`Línea ${idx + 1}: no puede tener Debe y Haber simultáneamente`);
      }

      if (linea.debe === 0 && linea.haber === 0) {
        errores.push(`Línea ${idx + 1}: debe tener Debe o Haber (ambos son 0)`);
      }
    });
  }

  // 3. Validar cuadre de partida doble
  if (typeof asiento.totalDebe !== 'number' || typeof asiento.totalHaber !== 'number') {
    errores.push('Faltan totales Debe/Haber');
  } else {
    const diferencia = Math.abs(asiento.totalDebe - asiento.totalHaber);
    if (diferencia > 0.01) {
      errores.push(
        `El asiento no cuadra: Debe ${asiento.totalDebe.toFixed(2)} ≠ Haber ${asiento.totalHaber.toFixed(2)} ` +
        `(diferencia: ${diferencia.toFixed(2)})`
      );
    }
  }

  // 4. Validar fecha y período
  if (asiento.fecha) {
    const fechaAsiento = new Date(asiento.fecha);
    if (isNaN(fechaAsiento.getTime())) {
      errores.push(`Fecha inválida: ${asiento.fecha}`);
    } else {
      const periodoCalculado = utilidades.obtenerPeriodoContable(asiento.fecha);
      if (periodoCalculado !== asiento.periodoContable) {
        errores.push(
          `Inconsistencia: fecha ${asiento.fecha} corresponde a ${periodoCalculado}, ` +
          `pero el asiento dice ${asiento.periodoContable}`
        );
      }

      // Verificar que el período esté abierto
      if (typeof PeriodosContables !== 'undefined') {
        const periodosAbiertos = PeriodosContables.obtenerAbiertos().map(p => p.periodo);
        if (periodosAbiertos.length > 0 && !periodosAbiertos.includes(asiento.periodoContable)) {
          errores.push(
            `El período ${asiento.periodoContable} está cerrado. ` +
            `Períodos abiertos: ${periodosAbiertos.join(', ')}`
          );
        }
      }
    }
  }

  // 5. Validar documento fuente si existe
  if (asiento.documentoFuenteId && typeof capaDocumentos !== 'undefined') {
    const documento = capaDocumentos.obtenerDocumentoPorId(asiento.documentoFuenteId);
    if (!documento) {
      errores.push(`El documento fuente ${asiento.documentoFuenteId} no existe en Capa 1`);
    }
  }

  return {
    valido: errores.length === 0,
    errores: errores
  };
}

// Exponer globalmente
window.estructuraAsiento = {
  TIPOS_ASIENTO,
  ESTADOS_ASIENTO,
  crearLinea,
  crearAsiento,
  generarNumeroAsiento,
  validarEstructuraAsiento
};

console.log('✅ Estructura de Asiento Contable cargada');
