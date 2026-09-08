// ══════════════════════════════════════════════════════════════
// capa3-motor.js — ERP Contable Bolivia
// Capa 3: Motor Contable (Corazón del ERP)
// ══════════════════════════════════════════════════════════════

/**
 * Capa 3: Motor Contable
 *
 * Responsabilidades:
 * - Procesar asientos pendientes del Generador de Asientos
 * - Mantener saldos actualizados en el Libro Mayor
 * - Numerar y archivar asientos contabilizados
 * - Permitir asientos manuales (ajustes del contador)
 * - Permitir anulación mediante asiento de reversa
 *
 * Esta capa es la fuente de verdad contable del ERP.
 *
 * @class MotorContable
 */
class MotorContable {

  constructor(deps) {
    this.almacenamiento = deps.almacenamiento;
    this.capaDocumentos = deps.capaDocumentos;
    this.planCuentas = deps.planCuentas;

    // Colecciones (asientos sí van por colección)
    this.COL_PENDIENTES = 'asientos_pendientes';
    this.COL_CONTABILIZADOS = 'asientos_contabilizados';
    this.COL_ANULADOS = 'asientos_anulados';

    // Clave directa en localStorage para el Libro Mayor
    // (no se usa colección porque cada asiento MODIFICA cuentas,
    // no agrega nuevos items. Evita QuotaExceededError.)
    // Clave PROPIA del mayor (NO colisiona con colecciones del AlmacenamientoLocal)
    this.MAYOR_STORAGE_KEY = 'erp_bolivia_MAYOR_CONTABLE_v2';

    // Asegurar que las colecciones existen
    if (!this.almacenamiento.obtener(this.COL_PENDIENTES)) {
      this.almacenamiento.guardar(this.COL_PENDIENTES, []);
    }
    if (!this.almacenamiento.obtener(this.COL_CONTABILIZADOS)) {
      this.almacenamiento.guardar(this.COL_CONTABILIZADOS, []);
    }
    if (!this.almacenamiento.obtener(this.COL_ANULADOS)) {
      this.almacenamiento.guardar(this.COL_ANULADOS, []);
    }


    console.log('⚙️ Motor Contable inicializado.');
  }

  // ════════════════════════════════════════════════════════════
  // PROCESAMIENTO DE ASIENTOS
  // ════════════════════════════════════════════════════════════

  /**
   * Procesa todos los asientos pendientes.
   * Los valida, contabiliza y actualiza el Libro Mayor.
   *
   * @returns {Object} { procesados, fallidos, errores }
   */
  procesarAsientosPendientes() {
    console.log('⚙️ [MOTOR] Procesando asientos pendientes...');

    const pendientes = this.almacenamiento.obtener(this.COL_PENDIENTES) || [];

    if (pendientes.length === 0) {
      console.log('ℹ️ No hay asientos pendientes');
      return { procesados: 0, fallidos: 0, errores: [] };
    }

    let procesados = 0;
    let fallidos = 0;
    const errores = [];

    // Copiamos IDs porque el array de pendientes mutará
    const idsPendientes = pendientes.map(a => a.id);

    for (const id of idsPendientes) {
      const resultado = this.contabilizarAsiento(id);

      if (resultado.exito) {
        procesados++;
      } else {
        fallidos++;
        errores.push({
          asientoId: id,
          numero: resultado.asiento?.numero || '?',
          errores: resultado.errores
        });
      }
    }

    console.log(`✅ [MOTOR] Procesamiento completado: ${procesados} OK, ${fallidos} errores`);
    if (fallidos > 0) {
      console.warn('⚠️ [MOTOR] Asientos con errores:', errores);
    }

    this._dispararEvento('motor-procesamiento-completado', {
      procesados, fallidos, errores
    });

    return { procesados, fallidos, errores };
  }

  /**
   * Contabiliza un asiento específico.
   * 1. Valida la estructura
   * 2. Actualiza saldos en el Libro Mayor
   * 3. Mueve el asiento a contabilizados
   * 4. Elimina de pendientes
   *
   * @param {string} asientoId
   * @returns {Object} { exito, asiento, errores }
   */
  contabilizarAsiento(asientoId) {
    const pendientes = this.almacenamiento.obtener(this.COL_PENDIENTES) || [];
    let asiento = pendientes.find(a => a.id === asientoId);

    if (!asiento) {
      return { exito: false, asiento: null, errores: [`Asiento ${asientoId} no encontrado`] };
    }

    // 0. Normalizar formato legado (Módulo 2 usaba glosa/sin número)
    asiento = this._normalizarAsientoLegado(asiento);

    // 1. Validar estructura
    const validacion = window.estructuraAsiento.validarEstructuraAsiento(asiento);
    if (!validacion.valido) {
      console.error(`❌ [MOTOR] Asiento ${asiento.numero} inválido:`, validacion.errores);
      return { exito: false, asiento: null, errores: validacion.errores };
    }

    // 2. Cambiar estado a PROCESADO
    asiento.estado = window.estructuraAsiento.ESTADOS_ASIENTO.PROCESADO;
    asiento.procesadoEn = new Date().toISOString();

    // 3. Actualizar Libro Mayor (sumar cada línea a su cuenta)
    this._actualizarMayor(asiento);

    // 4. Guardar en contabilizados
    this.almacenamiento.guardar(this.COL_CONTABILIZADOS, asiento);

    // 5. Eliminar de pendientes
    this.almacenamiento.eliminar(this.COL_PENDIENTES, asientoId);

    console.log(`✅ [MOTOR] Asiento ${asiento.numero} contabilizado correctamente`);

    this._dispararEvento('asiento-contabilizado', asiento);

    return { exito: true, asiento: asiento, errores: [] };
  }

  /**
   * Actualiza los saldos del Libro Mayor con las líneas de un asiento.
   *
   * ⚠️ El libro mayor se guarda como UN SOLO JSON en localStorage
   * (no como colección de items) para evitar QuotaExceededError.
   * Esto es porque cada asiento modifica cuentas existentes, no
   * crea nuevos items.
   *
   * @param {Object} asiento - Asiento a procesar
   * @private
   */
  _actualizarMayor(asiento) {
    // Leer mayor completo desde localStorage
    let mayor = this._leerMayor();

    asiento.lineas.forEach(linea => {
      let registro = mayor.find(m => m.cuentaCodigo === linea.cuentaCodigo);

      // Resolver nombre y naturaleza desde el plan de cuentas
      const cuenta = this.planCuentas.obtenerCuenta(linea.cuentaCodigo);
      const nombreCuenta = cuenta?.nombre || linea.cuentaNombre || linea.cuentaCodigo;
      const naturaleza = cuenta?.naturaleza || 'deudora';

      if (!registro) {
        registro = {
          cuentaCodigo: linea.cuentaCodigo,
          cuentaNombre: nombreCuenta,
          naturaleza: naturaleza,
          movimientos: [],
          totalDebe: 0,
          totalHaber: 0,
          saldo: 0
        };
        mayor.push(registro);
      }

      // Agregar movimiento
      registro.movimientos.push({
        fecha: asiento.fecha,
        asientoId: asiento.id,
        asientoNumero: asiento.numero,
        concepto: asiento.concepto,
        debe: linea.debe,
        haber: linea.haber
      });

      // Actualizar totales
      registro.totalDebe = window.BOLIVIA.redondear2(registro.totalDebe + linea.debe);
      registro.totalHaber = window.BOLIVIA.redondear2(registro.totalHaber + linea.haber);

      // Calcular saldo según naturaleza
      if (registro.naturaleza === 'acreedora') {
        registro.saldo = window.BOLIVIA.redondear2(registro.totalHaber - registro.totalDebe);
      } else {
        registro.saldo = window.BOLIVIA.redondear2(registro.totalDebe - registro.totalHaber);
      }
    });

    // Guardar TODO el mayor como un único JSON
    this._guardarMayor(mayor);
  }

  /**
   * Lee el libro mayor completo desde localStorage.
   * @returns {Array}
   * @private
   */
  _leerMayor() {
    try {
      const raw = localStorage.getItem(this.MAYOR_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('⚠️ Error leyendo libro_mayor, iniciando vacío:', e);
      return [];
    }
  }

  /**
   * Guarda el libro mayor completo en localStorage.
   * @param {Array} mayor
   * @private
   */
  _guardarMayor(mayor) {
    try {
      localStorage.setItem(this.MAYOR_STORAGE_KEY, JSON.stringify(mayor));
    } catch (e) {
      console.error('❌ No se pudo persistir libro_mayor:', e);
      throw new Error(`No se pudo guardar libro mayor: ${e.message}`);
    }
  }

  /**
   * Normaliza un asiento generado por versiones anteriores del ERP.
   *
   * El Generador de Asientos del Módulo 2 usaba un formato previo:
   * - 'glosa' en lugar de 'concepto'
   * - sin campo 'numero'
   * - documentoFuenteId a veces apuntaba a entidades que no son
   *   documentos de Capa 1 (cuentas por pagar, pedidos, etc.)
   *
   * Esta migración adapta esos asientos al formato de la Fase 3.2
   * antes de validarlos. Es el mismo principio que usan los ERPs
   * reales cuando migran datos históricos.
   *
   * @param {Object} asiento - Asiento a normalizar
   * @returns {Object} Asiento normalizado
   * @private
   */
  _normalizarAsientoLegado(asiento) {
    const cambios = [];

    // 1. glosa → concepto
    if (!asiento.concepto && asiento.glosa) {
      asiento.concepto = asiento.glosa;
      cambios.push('glosa→concepto');
    }

    // 2. Asignar número correlativo si no tiene
    if (!asiento.numero) {
      asiento.numero = window.estructuraAsiento.generarNumeroAsiento(
        asiento.tipo,
        asiento.periodoContable
      );
      cambios.push(`numero=${asiento.numero}`);
    }

    // 3. Limpiar documentoFuenteId si no existe en Capa 1
    if (asiento.documentoFuenteId) {
      const doc = this.capaDocumentos.obtenerDocumentoPorId(asiento.documentoFuenteId);
      if (!doc) {
        asiento.documentoFuenteId = null;
        cambios.push('documentoFuenteId limpiado');
      }
    }

    if (cambios.length > 0) {
      console.log(`🔧 [MOTOR] Asiento legado normalizado: ${cambios.join(' | ')}`);
      this.almacenamiento.actualizar(this.COL_PENDIENTES, asiento.id, asiento);
    }

    return asiento;
  }

  // ════════════════════════════════════════════════════════════
  // ASIENTOS MANUALES
  // ════════════════════════════════════════════════════════════

  /**
   * Crea un asiento manual (ajuste del contador).
   * Se valida y se contabiliza directamente.
   *
   * @param {Object} datos - Datos del asiento
   * @returns {Object}
   */
  crearAsientoManual(datos) {
    console.log('📝 [MOTOR] Creando asiento manual...');

    // Forzar tipo MANUAL
    datos.tipo = window.estructuraAsiento.TIPOS_ASIENTO.MANUAL;

    const resultado = window.estructuraAsiento.crearAsiento(datos);
    if (!resultado.exito) {
      return { exito: false, mensaje: 'Error al crear asiento', errores: resultado.errores };
    }

    // Guardar como pendiente y contabilizar inmediatamente
    this.almacenamiento.guardar(this.COL_PENDIENTES, resultado.asiento);
    const contabilizacion = this.contabilizarAsiento(resultado.asiento.id);

    if (contabilizacion.exito) {
      return {
        exito: true,
        mensaje: `Asiento ${resultado.asiento.numero} creado y contabilizado`,
        asiento: contabilizacion.asiento,
        errores: []
      };
    } else {
      return {
        exito: false,
        mensaje: 'Asiento creado pero no pudo contabilizarse',
        errores: contabilizacion.errores
      };
    }
  }

  // ════════════════════════════════════════════════════════════
  // ANULACIÓN DE ASIENTOS
  // ════════════════════════════════════════════════════════════

  /**
   * Anula un asiento creando un asiento de reversa (Debe ↔ Haber).
   * Nunca borra asientos (auditoría).
   *
   * @param {string} asientoId - ID del asiento a anular
   * @param {string} motivo - Motivo de la anulación
   * @returns {Object}
   */
  anularAsiento(asientoId, motivo) {
    console.log(`🔄 [MOTOR] Anulando asiento ${asientoId}...`);

    const contabilizados = this.almacenamiento.obtener(this.COL_CONTABILIZADOS) || [];
    const asientoOriginal = contabilizados.find(a => a.id === asientoId);

    if (!asientoOriginal) {
      return { exito: false, mensaje: `Asiento ${asientoId} no encontrado o no contabilizado` };
    }

    if (asientoOriginal.anulado) {
      return { exito: false, mensaje: 'El asiento ya fue anulado anteriormente' };
    }

    // Crear líneas invertidas (Debe ↔ Haber)
    const lineasReversa = asientoOriginal.lineas.map(linea => ({
      cuentaCodigo: linea.cuentaCodigo,
      cuentaNombre: linea.cuentaNombre,
      debe: linea.haber,    // Invertido
      haber: linea.debe,    // Invertido
      descripcion: `REVERSA: ${linea.descripcion || ''}`
    }));

    // Crear asiento de reversa
    const resultado = window.estructuraAsiento.crearAsiento({
      fecha: new Date().toISOString().split('T')[0],
      tipo: asientoOriginal.tipo,
      concepto: `ANULACIÓN de ${asientoOriginal.numero}. Motivo: ${motivo}`,
      lineas: lineasReversa
    });

    if (!resultado.exito) {
      return { exito: false, mensaje: 'Error al crear reversa', errores: resultado.errores };
    }

    // Guardar reversa y contabilizar
    this.almacenamiento.guardar(this.COL_PENDIENTES, resultado.asiento);
    const contabilizacion = this.contabilizarAsiento(resultado.asiento.id);

    if (!contabilizacion.exito) {
      return { exito: false, mensaje: 'Reversa creada pero no contabilizada', errores: contabilizacion.errores };
    }

    // Marcar asiento original como anulado
    asientoOriginal.anulado = true;
    asientoOriginal.anuladoEn = new Date().toISOString();
    asientoOriginal.anuladoPor = motivo;
    asientoOriginal.reversaId = resultado.asiento.id;
    this.almacenamiento.actualizar(this.COL_CONTABILIZADOS, asientoOriginal.id, asientoOriginal);

    // Registrar en anulados (trazabilidad)
    this.almacenamiento.guardar(this.COL_ANULADOS, {
      asientoOriginalId: asientoOriginal.id,
      asientoOriginalNumero: asientoOriginal.numero,
      asientoReversaId: resultado.asiento.id,
      asientoReversaNumero: resultado.asiento.numero,
      motivo: motivo,
      anuladoEn: new Date().toISOString()
    });

    console.log(`✅ [MOTOR] Asiento ${asientoOriginal.numero} anulado con reversa ${resultado.asiento.numero}`);

    this._dispararEvento('asiento-anulado', {
      original: asientoOriginal,
      reversa: resultado.asiento
    });

    return {
      exito: true,
      mensaje: `Asiento ${asientoOriginal.numero} anulado. Reversa: ${resultado.asiento.numero}`,
      asientoOriginal: asientoOriginal,
      asientoReversa: resultado.asiento
    };
  }

  // ════════════════════════════════════════════════════════════
  // CONSULTAS
  // ════════════════════════════════════════════════════════════

  /**
   * Obtiene todos los asientos pendientes.
   * @returns {Array}
   */
  obtenerAsientosPendientes() {
    return this.almacenamiento.obtener(this.COL_PENDIENTES) || [];
  }

  /**
   * Obtiene todos los asientos contabilizados.
   * @param {Object} [filtros] - {periodoContable, tipo, incluirAnulados}
   * @returns {Array}
   */
  obtenerAsientosContabilizados(filtros = {}) {
    let asientos = this.almacenamiento.obtener(this.COL_CONTABILIZADOS) || [];

    if (filtros.periodoContable) {
      asientos = asientos.filter(a => a.periodoContable === filtros.periodoContable);
    }
    if (filtros.tipo) {
      asientos = asientos.filter(a => a.tipo === filtros.tipo);
    }
    if (filtros.incluirAnulados === false) {
      asientos = asientos.filter(a => !a.anulado);
    }

    return asientos.sort((a, b) => (a.numero || '').localeCompare(b.numero || ''));
  }

  /**
   * Obtiene el Libro Mayor completo.
   * Lee directamente desde localStorage (formato nuevo).
   * @returns {Array} Registros del mayor con saldos
   */
  obtenerLibroMayor() {
    return this._leerMayor();
  }

  /**
   * Obtiene la ficha completa de una cuenta en el Libro Mayor,
   * con saldos acumulados después de cada movimiento.
   *
   * @param {string} cuentaCodigo
   * @param {Object} [filtros] - { fechaDesde, fechaHasta, periodoContable }
   * @returns {Object|null} Ficha de la cuenta
   */
  obtenerMayorPorCuenta(cuentaCodigo, filtros = {}) {
    const mayor = this._leerMayor();
    const registro = mayor.find(m => m.cuentaCodigo === cuentaCodigo);
    if (!registro) return null;

    const naturaleza = registro.naturaleza || 'deudora';

    // Filtrar movimientos
    let movimientos = registro.movimientos || [];
    if (filtros.fechaDesde) {
      movimientos = movimientos.filter(m => m.fecha >= filtros.fechaDesde);
    }
    if (filtros.fechaHasta) {
      movimientos = movimientos.filter(m => m.fecha <= filtros.fechaHasta);
    }
    if (filtros.periodoContable) {
      movimientos = movimientos.filter(m => (m.fecha || '').slice(0, 7) === filtros.periodoContable);
    }

    // Ordenar cronológicamente (fecha, luego número de asiento)
    movimientos = [...movimientos].sort((a, b) => {
      const cmpFecha = (a.fecha || '').localeCompare(b.fecha || '');
      if (cmpFecha !== 0) return cmpFecha;
      return (a.asientoNumero || '').localeCompare(b.asientoNumero || '');
    });

    // Calcular saldos acumulados
    let saldo = this.calcularSaldoInicial(cuentaCodigo, filtros.periodoContable);
    const saldoInicial = saldo;

    const movimientosConSaldo = movimientos.map(m => {
      if (naturaleza === 'deudora') {
        saldo += m.debe - m.haber;
      } else {
        saldo += m.haber - m.debe;
      }
      return { ...m, saldoAcumulado: window.BOLIVIA.redondear2(saldo) };
    });

    const totalDebe = window.BOLIVIA.redondear2(
      movimientos.reduce((s, m) => s + m.debe, 0)
    );
    const totalHaber = window.BOLIVIA.redondear2(
      movimientos.reduce((s, m) => s + m.haber, 0)
    );

    return {
      cuentaCodigo,
      cuentaNombre: registro.cuentaNombre,
      naturaleza,
      saldoInicial,
      movimientos: movimientosConSaldo,
      totalDebe,
      totalHaber,
      saldoFinal: window.BOLIVIA.redondear2(saldo),
      cantidadMovimientos: movimientos.length
    };
  }

    /**
   * Calcula el saldo inicial de una cuenta al inicio de un período.
   * Suma todos los movimientos de períodos ANTERIORES al indicado.
   *
   * @param {string} cuentaCodigo
   * @param {string} [periodo] - Formato "AAAA-MM". Si no se pasa, retorna 0.
   * @returns {number} Saldo inicial (signo según naturaleza)
   */
  calcularSaldoInicial(cuentaCodigo, periodo) {
    if (!periodo) return 0;

    const mayor = this._leerMayor();
    const registro = mayor.find(m => m.cuentaCodigo === cuentaCodigo);
    if (!registro) return 0;

    const naturaleza = registro.naturaleza || 'deudora';
    let saldo = 0;

    (registro.movimientos || []).forEach(m => {
      const periodoMov = (m.fecha || '').slice(0, 7);
      if (periodoMov && periodoMov < periodo) {
        if (naturaleza === 'deudora') {
          saldo += m.debe - m.haber;
        } else {
          saldo += m.haber - m.debe;
        }
      }
    });

    return window.BOLIVIA.redondear2(saldo);
  }

  /**
   * Obtiene todos los movimientos de una cuenta en un período.
   * Alias semántico de obtenerMayorPorCuenta con filtro de período.
   *
   * @param {string} cuentaCodigo
   * @param {string} periodo - Formato "AAAA-MM"
   * @returns {Object|null}
   */
  obtenerMovimientosDeCuenta(cuentaCodigo, periodo) {
    return this.obtenerMayorPorCuenta(cuentaCodigo, { periodoContable: periodo });
  }

  /**
   * Obtiene el saldo de cada cuenta al cierre de un período.
   * Es la base para la Balanza de Comprobación (Fase 3.6).
   *
   * @param {string} [periodo] - Si no se pasa, calcula con todo el historial
   * @returns {Array} [{ cuentaCodigo, cuentaNombre, naturaleza,
   *                    saldoInicial, movimiento, saldoFinal,
   *                    saldoDeudor, saldoAcreedor }]
   */
  obtenerSaldosDeCuentas(periodo) {
    const mayor = this._leerMayor();
    const resultado = [];

    mayor.forEach(registro => {
      const naturaleza = registro.naturaleza || 'deudora';
      const saldoInicial = this.calcularSaldoInicial(registro.cuentaCodigo, periodo);

      // Movimiento del período (o de todo el historial si no hay período)
      let movimiento = 0;
      (registro.movimientos || []).forEach(m => {
        const periodoMov = (m.fecha || '').slice(0, 7);
        if (!periodo || periodoMov === periodo) {
          if (naturaleza === 'deudora') {
            movimiento += m.debe - m.haber;
          } else {
            movimiento += m.haber - m.debe;
          }
        }
      });

      const saldoFinal = window.BOLIVIA.redondear2(saldoInicial + movimiento);

      // Clasificar el saldo final en deudor o acreedor según naturaleza
      let saldoDeudor = 0;
      let saldoAcreedor = 0;
      if (saldoFinal >= 0) {
        if (naturaleza === 'deudora') saldoDeudor = saldoFinal;
        else saldoAcreedor = saldoFinal;
      } else {
        // Saldo "al revés" de la naturaleza (ej: Bancos en negativo)
        if (naturaleza === 'deudora') saldoAcreedor = -saldoFinal;
        else saldoDeudor = -saldoFinal;
      }

      resultado.push({
        cuentaCodigo: registro.cuentaCodigo,
        cuentaNombre: registro.cuentaNombre,
        naturaleza,
        saldoInicial,
        movimiento: window.BOLIVIA.redondear2(movimiento),
        saldoFinal,
        saldoDeudor,
        saldoAcreedor
      });
    });

    return resultado.sort((a, b) => a.cuentaCodigo.localeCompare(b.cuentaCodigo));
  }

  /**
   * Calcula la balanza de comprobación (suma de saldos por naturaleza).
   * Debe cuadrar: Σ Saldos Deudores = Σ Saldos Acreedores
   *
   * @returns {Object}
   */
  calcularBalanzaComprobacion() {
    const mayor = this.obtenerLibroMayor();

    let totalSaldosDeudores = 0;
    let totalSaldosAcreedores = 0;
    let totalMovimientosDebe = 0;
    let totalMovimientosHaber = 0;

    mayor.forEach(registro => {
      // Usar naturaleza guardada en el registro (o consultar plan como fallback)
      const naturaleza = registro.naturaleza ||
                        this.planCuentas.obtenerCuenta(registro.cuentaCodigo)?.naturaleza ||
                        'deudora';

      totalMovimientosDebe += registro.totalDebe;
      totalMovimientosHaber += registro.totalHaber;

      if (naturaleza === 'deudora') {
        totalSaldosDeudores += registro.saldo;
      } else {
        totalSaldosAcreedores += registro.saldo;
      }
    });

    totalSaldosDeudores = window.BOLIVIA.redondear2(totalSaldosDeudores);
    totalSaldosAcreedores = window.BOLIVIA.redondear2(totalSaldosAcreedores);

    return {
      totalSaldosDeudores,
      totalSaldosAcreedores,
      totalMovimientosDebe: window.BOLIVIA.redondear2(totalMovimientosDebe),
      totalMovimientosHaber: window.BOLIVIA.redondear2(totalMovimientosHaber),
      cuadra: Math.abs(totalSaldosDeudores - totalSaldosAcreedores) <= 0.01,
      diferencia: window.BOLIVIA.redondear2(totalSaldosDeudores - totalSaldosAcreedores),
      cantidadCuentas: mayor.length
    };
  }

    /**
   * Calcula la Balanza de Comprobación completa con detalle por cuenta.
   * Incluye movimientos Y saldos (a diferencia de calcularBalanzaComprobacion
   * que solo da los totales).
   *
   * @param {string} [periodo] - Formato "AAAA-MM"
   * @returns {Object} { cuentas, totales, verificacion, errores }
   */
  calcularBalanza(periodo) {
    const mayor = this._leerMayor();
    const cuentas = [];

    let totMovDebe = 0, totMovHaber = 0;
    let totSaldoD = 0, totSaldoA = 0;

    mayor.forEach(registro => {
      const naturaleza = registro.naturaleza || 'deudora';

      // Calcular movimientos del período (o todos si no hay período)
      let movDebe = 0, movHaber = 0;
      (registro.movimientos || []).forEach(m => {
        const periodoMov = (m.fecha || '').slice(0, 7);
        if (!periodo || periodoMov === periodo) {
          movDebe += m.debe;
          movHaber += m.haber;
        }
      });

      movDebe = window.BOLIVIA.redondear2(movDebe);
      movHaber = window.BOLIVIA.redondear2(movHaber);

      // Calcular saldo según naturaleza
      let saldo = 0;
      if (naturaleza === 'deudora') {
        saldo = movDebe - movHaber;
      } else {
        saldo = movHaber - movDebe;
      }
      saldo = window.BOLIVIA.redondear2(saldo);

      // Clasificar en Deudor o Acreedor según naturaleza
      let saldoDeudor = 0, saldoAcreedor = 0;
      if (saldo >= 0) {
        if (naturaleza === 'deudora') saldoDeudor = saldo;
        else saldoAcreedor = saldo;
      } else {
        // Saldo "al revés" (ej: Bancos en descubierto)
        if (naturaleza === 'deudora') saldoAcreedor = -saldo;
        else saldoDeudor = -saldo;
      }

      cuentas.push({
        cuentaCodigo: registro.cuentaCodigo,
        cuentaNombre: registro.cuentaNombre,
        naturaleza,
        movimientoDebe: movDebe,
        movimientoHaber: movHaber,
        saldoDeudor,
        saldoAcreedor
      });

      totMovDebe += movDebe;
      totMovHaber += movHaber;
      totSaldoD += saldoDeudor;
      totSaldoA += saldoAcreedor;
    });

    // Ordenar por código
    cuentas.sort((a, b) => a.cuentaCodigo.localeCompare(b.cuentaCodigo));

    const totales = {
      movimientoDebe: window.BOLIVIA.redondear2(totMovDebe),
      movimientoHaber: window.BOLIVIA.redondear2(totMovHaber),
      saldoDeudor: window.BOLIVIA.redondear2(totSaldoD),
      saldoAcreedor: window.BOLIVIA.redondear2(totSaldoA)
    };

    return {
      periodo: periodo || 'TODOS',
      cuentas,
      totales,
      verificacion: this.verificarCuadratura(totales),
      errores: this.detectarErroresComunes(periodo),
      generadoEn: new Date().toISOString()
    };
  }

  /**
   * Verifica la cuadratura de la Balanza.
   * Compara:
   * - Σ Movimientos Debe vs Σ Movimientos Haber
   * - Σ Saldos Deudores vs Σ Saldos Acreedores
   *
   * @param {Object} totales
   * @returns {Object}
   */
  verificarCuadratura(totales) {
    const difMovimientos = window.BOLIVIA.redondear2(
      totales.movimientoDebe - totales.movimientoHaber
    );
    const difSaldos = window.BOLIVIA.redondear2(
      totales.saldoDeudor - totales.saldoAcreedor
    );

    return {
      movimientosCuadran: Math.abs(difMovimientos) <= 0.01,
      diferenciaMovimientos: difMovimientos,
      saldosCuadran: Math.abs(difSaldos) <= 0.01,
      diferenciaSaldos: difSaldos,
      cuadraTotalmente:
        Math.abs(difMovimientos) <= 0.01 &&
        Math.abs(difSaldos) <= 0.01,
        explicacion: this._explicarCuadratura(difMovimientos, difSaldos)
    };
  }

  /**
   * Detecta errores comunes en los asientos de un período.
   *
   * @param {string} [periodo]
   * @returns {Array} Lista de advertencias/errores
   */
  detectarErroresComunes(periodo) {
    const errores = [];
    const asientos = this.obtenerAsientosContabilizados({
      periodoContable: periodo,
      incluirAnulados: false
    });

    asientos.forEach(a => {
      // 1. Asiento con una sola línea (grave)
      if (!a.lineas || a.lineas.length < 2) {
        errores.push({
          nivel: 'error',
          asientoId: a.id,
          asientoNumero: a.numero,
          mensaje: `Asiento con menos de 2 líneas (tiene ${a.lineas?.length || 0})`
        });
      }

      // 2. Asiento desbalanceado (Debe ≠ Haber)
      const dif = Math.abs((a.totalDebe || 0) - (a.totalHaber || 0));
      if (dif > 0.01) {
        errores.push({
          nivel: 'error',
          asientoId: a.id,
          asientoNumero: a.numero,
          mensaje: `Asiento desbalanceado: diferencia de ${dif.toFixed(2)}`
        });
      }
    });

    // 3. Cuentas con saldo "al revés" (naturaleza invertida)
    const mayor = this._leerMayor();
    mayor.forEach(registro => {
      const naturaleza = registro.naturaleza || 'deudora';
      const saldo = registro.saldo || 0;

      // Saldo negativo en cuenta de naturaleza deudora → posible descubierto
      if (naturaleza === 'deudora' && saldo < -0.01) {
        // Bancos es una excepción común (descubiertos bancarios)
        if (registro.cuentaCodigo !== '1.1.02' && registro.cuentaCodigo !== '1.1.03') {
          errores.push({
            nivel: 'advertencia',
            cuentaCodigo: registro.cuentaCodigo,
            cuentaNombre: registro.cuentaNombre,
            mensaje: `Saldo acreedor (${saldo.toFixed(2)}) en cuenta de naturaleza deudora`
          });
        }
      }
    });

    return errores;
  }

  /**
   * Explica las posibles causas de un descuadre en la Balanza.
   * @private
   */
  _explicarCuadratura(difMovimientos, difSaldos) {
    const mensajes = [];

    if (Math.abs(difMovimientos) > 0.01) {
      mensajes.push(
        `Movimientos descuadrados por ${difMovimientos.toFixed(2)}. ` +
        `Posibles causas: asiento sin contrapartida, error de digitación, ` +
        `o asiento de ajuste pendiente.`
      );
    }

    if (Math.abs(difSaldos) > 0.01) {
      mensajes.push(
        `Saldos descuadrados por ${difSaldos.toFixed(2)}. ` +
        `Revisar cálculos de saldos o asientos mal clasificados.`
      );
    }

    if (mensajes.length === 0) {
      return 'La balanza cuadra correctamente. ✓';
    }

    return mensajes.join(' ');
  }

    // ════════════════════════════════════════════════════════════
  // CONSULTAS ESPECÍFICAS DEL LIBRO DIARIO
  // ════════════════════════════════════════════════════════════

  /**
   * Obtiene el Libro Diario con filtros avanzados.
   * Es el "diario personal" de la empresa: todo en orden cronológico.
   *
   * @param {Object} [filtros]
   * @param {string} [filtros.fechaDesde] - AAAA-MM-DD
   * @param {string} [filtros.fechaHasta] - AAAA-MM-DD
   * @param {string} [filtros.tipo] - COMPRA, VENTA, NOMINA, AJUSTE, etc.
   * @param {string} [filtros.cuentaCodigo] - Filtrar asientos que afectan esta cuenta
   * @param {boolean} [filtros.incluirAnulados=false]
   * @returns {Array} Asientos ordenados cronológicamente
   */
  obtenerDiario(filtros = {}) {
    let asientos = this.obtenerAsientosContabilizados({
      incluirAnulados: filtros.incluirAnulados === true
    });

    if (filtros.fechaDesde) {
      asientos = asientos.filter(a => a.fecha >= filtros.fechaDesde);
    }
    if (filtros.fechaHasta) {
      asientos = asientos.filter(a => a.fecha <= filtros.fechaHasta);
    }
    if (filtros.tipo) {
      asientos = asientos.filter(a => a.tipo === filtros.tipo);
    }
    if (filtros.cuentaCodigo) {
      asientos = asientos.filter(a =>
        a.lineas.some(l => l.cuentaCodigo === filtros.cuentaCodigo)
      );
    }

    // Ordenar por fecha ascendente, luego por número ascendente
    return asientos.sort((a, b) => {
      const cmpFecha = a.fecha.localeCompare(b.fecha);
      if (cmpFecha !== 0) return cmpFecha;
      return (a.numero || '').localeCompare(b.numero || '');
    });
  }

  /**
   * Obtiene todos los asientos de un período contable con resumen.
   *
   * @param {string} periodo - Formato "AAAA-MM"
   * @returns {Object} { asientos, resumen }
   */
  obtenerDiarioPorPeriodo(periodo) {
    const asientos = this.obtenerDiario({}).filter(a => a.periodoContable === periodo);

    let totalDebe = 0;
    let totalHaber = 0;

    asientos.forEach(a => {
      totalDebe += a.totalDebe || 0;
      totalHaber += a.totalHaber || 0;
    });

    return {
      periodo,
      asientos,
      resumen: {
        cantidadAsientos: asientos.length,
        totalDebe: window.BOLIVIA.redondear2(totalDebe),
        totalHaber: window.BOLIVIA.redondear2(totalHaber),
        cuadra: Math.abs(totalDebe - totalHaber) <= 0.01
      }
    };
  }

  /**
   * Busca el asiento vinculado a un documento fuente de Capa 1.
   * Para trazabilidad: desde documento fuente → asiento contable.
   *
   * @param {string} documentoFuenteId
   * @returns {Object|null}
   */
  obtenerDiarioPorDocumento(documentoFuenteId) {
    if (!documentoFuenteId) return null;

    const asientos = this.almacenamiento.obtener(this.COL_CONTABILIZADOS) || [];
    return asientos.find(a => a.documentoFuenteId === documentoFuenteId) || null;
  }

  /**
   * Obtiene la lista de períodos que tienen asientos en el Diario.
   * Útil para poblar selectores de período.
   *
   * @returns {Array<string>} Períodos en formato "AAAA-MM", ordenados desc
   */
  obtenerPeriodosConDiario() {
    const asientos = this.obtenerAsientosContabilizados({ incluirAnulados: true });
    const periodos = new Set();
    asientos.forEach(a => {
      if (a.periodoContable) periodos.add(a.periodoContable);
    });
    return Array.from(periodos).sort((a, b) => b.localeCompare(a));
  }

    // ════════════════════════════════════════════════════════════
  // ASIENTOS DE AJUSTE (CIERRE MENSUAL)
  // ════════════════════════════════════════════════════════════

  /**
   * Genera todos los asientos de ajuste automático para un período.
   *
   * Ajustes incluidos:
   * 1. Depreciación de activos fijos (línea recta)
   * 2. Provisión de aguinaldo (1/12 del estimado anual)
   * 3. Provisión de bono de antigüedad (DS 21060)
   * 4. Provisión de indemnización (DS 28699, aplica a renuncia)
   * 5. Devengados (parámetros opcionales)
   *
   * @param {string} periodo - Formato "AAAA-MM"
   * @param {Object} [datos] - Datos externos (empleados, activos)
   * @returns {Object} { generados, asientos, errores }
   */
  generarAjustesAutomaticos(periodo, datos = {}) {
    console.log(`⚙️ [MOTOR] Generando ajustes automáticos para ${periodo}...`);

    const resultados = [];
    const errores = [];

    // 1. Depreciación
    if (datos.activosFijos && datos.activosFijos.length > 0) {
      const dep = this.generarAsientoDepreciacion(periodo, datos.activosFijos);
      if (dep.exito) resultados.push(dep.asiento);
      else errores.push({ tipo: 'depreciacion', errores: dep.errores });
    }

    // 2. Aguinaldo
    if (datos.empleados && datos.empleados.length > 0) {
      const agui = this.generarAsientoProvisionAguinaldo(periodo, datos.empleados);
      if (agui.exito) resultados.push(agui.asiento);
      else errores.push({ tipo: 'aguinaldo', errores: agui.errores });

      // 3. Bono de antigüedad
      const bono = this.generarAsientoProvisionBonoAntiguedad(periodo, datos.empleados);
      if (bono.exito) resultados.push(bono.asiento);
      else errores.push({ tipo: 'bono_antiguedad', errores: bono.errores });

      // 4. Indemnización
      const ind = this.generarAsientoProvisionIndemnizacion(periodo, datos.empleados);
      if (ind.exito) resultados.push(ind.asiento);
      else errores.push({ tipo: 'indemnizacion', errores: ind.errores });
    }

    console.log(`✅ [MOTOR] ${resultados.length} asientos de ajuste generados, ${errores.length} errores`);
    return { generados: resultados.length, asientos: resultados, errores };
  }

  /**
   * Genera asiento de depreciación mensual por línea recta.
   * Crea líneas separadas por tipo de activo para usar las cuentas
   * específicas del plan (5.5.01-5.5.05 y 1.2.02-1.2.10).
   */
  generarAsientoDepreciacion(periodo, activosFijos) {
    // Mapeo de tipo de activo a cuentas específicas del plan
    const MAPA_CUENTAS = {
      maquinaria:     { gasto: '5.5.01', depAcum: '1.2.02', nombreGasto: 'Depreciación de Maquinaria y Equipo', nombreDepAcum: 'Depreciación Acumulada - Maquinaria y Equipo' },
      vehiculo:       { gasto: '5.5.02', depAcum: '1.2.04', nombreGasto: 'Depreciación de Vehículos', nombreDepAcum: 'Depreciación Acumulada - Vehículos' },
      mueble:         { gasto: '5.5.03', depAcum: '1.2.06', nombreGasto: 'Depreciación de Muebles y Útiles', nombreDepAcum: 'Depreciación Acumulada - Muebles y Útiles' },
      equipo_computacion: { gasto: '5.5.04', depAcum: '1.2.08', nombreGasto: 'Depreciación de Equipos de Computación', nombreDepAcum: 'Depreciación Acumulada - Equipos de Computación' },
      edificio:       { gasto: '5.5.05', depAcum: '1.2.10', nombreGasto: 'Depreciación de Edificios', nombreDepAcum: 'Depreciación Acumulada - Edificios' }
    };

    // Agrupar depreciación por tipo
    const porTipo = {};

    activosFijos.forEach(activo => {
      if (!activo.costo || activo.costo <= 0) return;
      if (activo.tipo === 'terreno') return; // Terrenos no se deprecian

      const valorResidual = activo.valorResidual || 0;
      const vidaUtilMeses = (activo.vidaUtilAnios || 5) * 12;
      const depreciacionMensual = window.BOLIVIA.redondear2(
        (activo.costo - valorResidual) / vidaUtilMeses
      );

      if (depreciacionMensual <= 0) return;

      const tipo = activo.tipo || 'maquinaria';
      if (!porTipo[tipo]) porTipo[tipo] = { total: 0, detalles: [] };
      porTipo[tipo].total += depreciacionMensual;
      porTipo[tipo].detalles.push(`${activo.nombre}: ${depreciacionMensual}`);
    });

    const tipos = Object.keys(porTipo);
    if (tipos.length === 0) {
      return { exito: false, asiento: null, errores: ['No hay depreciación que registrar'] };
    }

    // Construir líneas del asiento
    const lineas = [];
    tipos.forEach(tipo => {
      const cuentas = MAPA_CUENTAS[tipo] || MAPA_CUENTAS.maquinaria;
      const total = window.BOLIVIA.redondear2(porTipo[tipo].total);

      lineas.push({
        cuentaCodigo: cuentas.gasto,
        cuentaNombre: cuentas.nombreGasto,
        debe: total,
        haber: 0,
        descripcion: porTipo[tipo].detalles.join(', ')
      });
      lineas.push({
        cuentaCodigo: cuentas.depAcum,
        cuentaNombre: cuentas.nombreDepAcum,
        debe: 0,
        haber: total,
        descripcion: porTipo[tipo].detalles.join(', ')
      });
    });

    const totalDepreciacion = window.BOLIVIA.redondear2(
      lineas.filter(l => l.debe > 0).reduce((s, l) => s + l.debe, 0)
    );

    const resultado = window.estructuraAsiento.crearAsiento({
      fecha: `${periodo}-${this._ultimoDiaDelMes(periodo)}`,
      tipo: window.estructuraAsiento.TIPOS_ASIENTO.AJUSTE,
      concepto: `Depreciación mensual ${periodo} — ${tipos.length} tipos de activos`,
      lineas: lineas
    });

    if (resultado.exito) {
      this.almacenamiento.guardar(this.COL_PENDIENTES, resultado.asiento);
      this.contabilizarAsiento(resultado.asiento.id);
    }

    return resultado;
  }

  generarAsientoProvisionAguinaldo(periodo, empleados) {
    const CUENTA_GASTO = '5.2.05';  // Gasto de Aguinaldo
    const CUENTA_PAGAR = '2.1.11';  // Aguinaldo por Pagar

    let totalAguinaldo = 0;

    empleados.forEach(emp => {
      const totalGanado = emp.totalGanadoUltimos3Meses || 0;
      const promedioMensual = totalGanado / 3;
      const provisionMensual = window.BOLIVIA.redondear2(promedioMensual / 12);
      totalAguinaldo += provisionMensual;
    });

    if (totalAguinaldo === 0) {
      return { exito: false, asiento: null, errores: ['No hay aguinaldo que provisionar'] };
    }

    totalAguinaldo = window.BOLIVIA.redondear2(totalAguinaldo);

    const resultado = window.estructuraAsiento.crearAsiento({
      fecha: `${periodo}-${this._ultimoDiaDelMes(periodo)}`,
      tipo: window.estructuraAsiento.TIPOS_ASIENTO.AJUSTE,
      concepto: `Provisión aguinaldo ${periodo} — ${empleados.length} empleados (LGT Art. 56)`,
      lineas: [
        { cuentaCodigo: CUENTA_GASTO, cuentaNombre: 'Gasto de Aguinaldo', debe: totalAguinaldo, haber: 0 },
        { cuentaCodigo: CUENTA_PAGAR, cuentaNombre: 'Aguinaldo por Pagar', debe: 0, haber: totalAguinaldo }
      ]
    });

    if (resultado.exito) {
      this.almacenamiento.guardar(this.COL_PENDIENTES, resultado.asiento);
      this.contabilizarAsiento(resultado.asiento.id);
    }

    return resultado;
  }

  /**
   * Provisión mensual de bono de antigüedad (DS 21060).
   *
   * Base: 3 × SMN vigente.
   * Porcentaje por años de servicio:
   *   2 años:  5%  |  4 años:  9%  |  6 años: 11%
   *   8 años: 15%  | 10 años: 20%  | 15 años: 25%
   *  20 años: 30%  | 25 años: 50%
   *
   * Asiento:
   *   Gasto Bono Antigüedad        (Debe)
   *       Bono de Antigüedad por Pagar      (Haber)
   */
  generarAsientoProvisionBonoAntiguedad(periodo, empleados) {
    const CUENTA_GASTO = '5.2.04';  // Bono de Antigüedad
    const CUENTA_PAGAR = '2.1.13';  // Bono de Antigüedad por Pagar
    const SMN = window.BOLIVIA.SMN_VIGENTE || 2500;
    const BASE = SMN * 3;

    let totalBono = 0;

    empleados.forEach(emp => {
      const aniosServicio = emp.aniosServicio || 0;
      const porcentaje = this._porcentajeBonoAntiguedad(aniosServicio);
      const bonoMensual = window.BOLIVIA.redondear2(BASE * porcentaje / 100);
      totalBono += bonoMensual;
    });

    if (totalBono === 0) {
      return { exito: false, asiento: null, errores: ['No hay bono de antigüedad que provisionar (mín. 2 años de servicio)'] };
    }

    totalBono = window.BOLIVIA.redondear2(totalBono);

    const resultado = window.estructuraAsiento.crearAsiento({
      fecha: `${periodo}-${this._ultimoDiaDelMes(periodo)}`,
      tipo: window.estructuraAsiento.TIPOS_ASIENTO.AJUSTE,
      concepto: `Provisión bono antigüedad ${periodo} — ${empleados.length} empleados (DS 21060)`,
      lineas: [
        { cuentaCodigo: CUENTA_GASTO, cuentaNombre: 'Bono de Antigüedad', debe: totalBono, haber: 0 },
        { cuentaCodigo: CUENTA_PAGAR, cuentaNombre: 'Bono de Antigüedad por Pagar', debe: 0, haber: totalBono }
      ]
    });

    if (resultado.exito) {
      this.almacenamiento.guardar(this.COL_PENDIENTES, resultado.asiento);
      this.contabilizarAsiento(resultado.asiento.id);
    }

    return resultado;
  }

  /**
   * Provisión mensual de indemnización por tiempo de servicio.
   *
   * DS 28699: aplica incluso a RENUNCIA VOLUNTARIA.
   * Indemnización = 1 mes de sueldo por año de servicio + fracción.
   * Provisión mensual = acumulado anual ÷ 12.
   *
   * Asiento:
   *   Gasto Indemnización          (Debe)
   *       Indemnización por Pagar           (Haber)
   */
  generarAsientoProvisionIndemnizacion(periodo, empleados) {
    const CUENTA_GASTO = '5.2.07';  // Gasto de Indemnización
    const CUENTA_PAGAR = '2.1.14';  // Indemnización por Tiempo de Servicio por Pagar

    let totalIndemnizacion = 0;

    empleados.forEach(emp => {
      const totalGanado = emp.totalGanadoUltimos3Meses || 0;
      const promedioMensual = totalGanado / 3;
      const aniosServicio = emp.aniosServicio || 0;
      const provisionAnual = promedioMensual * aniosServicio;
      const provisionMensual = window.BOLIVIA.redondear2(provisionAnual / 12);
      totalIndemnizacion += provisionMensual;
    });

    if (totalIndemnizacion === 0) {
      return { exito: false, asiento: null, errores: ['No hay indemnización que provisionar'] };
    }

    totalIndemnizacion = window.BOLIVIA.redondear2(totalIndemnizacion);

    const resultado = window.estructuraAsiento.crearAsiento({
      fecha: `${periodo}-${this._ultimoDiaDelMes(periodo)}`,
      tipo: window.estructuraAsiento.TIPOS_ASIENTO.AJUSTE,
      concepto: `Provisión indemnización ${periodo} — ${empleados.length} empleados (DS 28699, aplica a renuncia)`,
      lineas: [
        { cuentaCodigo: CUENTA_GASTO, cuentaNombre: 'Gasto de Indemnización', debe: totalIndemnizacion, haber: 0 },
        { cuentaCodigo: CUENTA_PAGAR, cuentaNombre: 'Indemnización por Tiempo de Servicio por Pagar', debe: 0, haber: totalIndemnizacion }
      ]
    });

    if (resultado.exito) {
      this.almacenamiento.guardar(this.COL_PENDIENTES, resultado.asiento);
      this.contabilizarAsiento(resultado.asiento.id);
    }

    return resultado;
  }

    // ════════════════════════════════════════════════════════════
  // CIERRE DEL EJERCICIO
  // ════════════════════════════════════════════════════════════

  /**
   * Cierra el ejercicio contable de un período.
   *
   * Proceso:
   * 1. Suma todos los ingresos (cuentas 4.x)
   * 2. Suma todos los gastos y costos (cuentas 5.x)
   * 3. Calcula utilidad/pérdida: Ingresos − Gastos
   * 4. Genera asiento de cierre que lleva cuentas de resultado a cero
   * 5. Transfiere el resultado a Utilidad del Ejercicio (3.2.04)
   * 6. Marca el período como cerrado
   *
   * @param {string} periodo - Formato "AAAA-MM" o "AAAA" para cierre anual
   * @param {Object} [opciones]
   * @param {boolean} [opciones.simular=false] - Si true, no guarda cambios
   * @returns {Object} { exito, utilidad, asiento, errores }
   */
  cerrarEjercicio(periodo, opciones = {}) {
    console.log(`⚙️ [MOTOR] Cerrando ejercicio ${periodo}...`);

    const simular = opciones.simular || false;

    // 1. Obtener todas las cuentas de resultado (ingresos y gastos)
    const saldos = this.obtenerSaldosDeCuentas(periodo);

    const ingresos = saldos.filter(s => s.cuentaCodigo.startsWith('4.'));
    const gastos = saldos.filter(s => s.cuentaCodigo.startsWith('5.'));

    // 2. Calcular totales
    let totalIngresos = 0;
    let totalGastos = 0;

    ingresos.forEach(c => {
      // Ingresos tienen naturaleza acreedora: saldo positivo = ingreso
      totalIngresos += c.saldoFinal;
    });

    gastos.forEach(c => {
      // Gastos tienen naturaleza deudora: saldo positivo = gasto
      totalGastos += c.saldoFinal;
    });

    totalIngresos = window.BOLIVIA.redondear2(totalIngresos);
    totalGastos = window.BOLIVIA.redondear2(totalGastos);
    const utilidad = window.BOLIVIA.redondear2(totalIngresos - totalGastos);

    console.log(`   Ingresos: ${window.utilidades.formatearBs(totalIngresos)}`);
    console.log(`   Gastos:   ${window.utilidades.formatearBs(totalGastos)}`);
    console.log(`   Utilidad: ${window.utilidades.formatearBs(utilidad)}`);

    if (totalIngresos === 0 && totalGastos === 0) {
      return {
        exito: false,
        utilidad: 0,
        asiento: null,
        errores: ['No hay cuentas de resultado para cerrar en este período']
      };
    }

    // 3. Construir líneas del asiento de cierre
    const lineas = [];
    const CUENTA_UTILIDAD = '3.2.04'; // Utilidad del Ejercicio

    // Cerrar cuentas de ingresos (llevar a cero)
    // Ingresos tienen saldo acreedor → debitamos para cerrar
    ingresos.forEach(c => {
      if (Math.abs(c.saldoFinal) > 0.01) {
        lineas.push({
          cuentaCodigo: c.cuentaCodigo,
          cuentaNombre: c.cuentaNombre,
          debe: c.saldoFinal,
          haber: 0,
          descripcion: `Cierre de ${c.cuentaNombre}`
        });
      }
    });

    // Cerrar cuentas de gastos (llevar a cero)
    // Gastos tienen saldo deudor → acreditamos para cerrar
    gastos.forEach(c => {
      if (Math.abs(c.saldoFinal) > 0.01) {
        lineas.push({
          cuentaCodigo: c.cuentaCodigo,
          cuentaNombre: c.cuentaNombre,
          debe: 0,
          haber: c.saldoFinal,
          descripcion: `Cierre de ${c.cuentaNombre}`
        });
      }
    });

    // Transferir utilidad/pérdida a cuenta de resultado del ejercicio
    if (utilidad >= 0) {
      // Utilidad: acreditamos la cuenta de utilidad
      lineas.push({
        cuentaCodigo: CUENTA_UTILIDAD,
        cuentaNombre: 'Utilidad del Ejercicio',
        debe: 0,
        haber: utilidad,
        descripcion: `Utilidad del ejercicio ${periodo}`
      });
    } else {
      // Pérdida: debitamos la cuenta de utilidad (saldo deudor)
      lineas.push({
        cuentaCodigo: CUENTA_UTILIDAD,
        cuentaNombre: 'Utilidad del Ejercicio',
        debe: -utilidad,
        haber: 0,
        descripcion: `Pérdida del ejercicio ${periodo}`
      });
    }

    // 4. Crear asiento de cierre
    const resultado = window.estructuraAsiento.crearAsiento({
      fecha: `${periodo}-${this._ultimoDiaDelMes(periodo)}`,
      tipo: window.estructuraAsiento.TIPOS_ASIENTO.CIERRE,
      concepto: `Cierre del ejercicio ${periodo} — Utilidad: ${window.utilidades.formatearBs(utilidad)}`,
      lineas: lineas
    });

    if (!resultado.exito) {
      return {
        exito: false,
        utilidad,
        asiento: null,
        errores: resultado.errores
      };
    }

    // 5. Si no es simulación, guardar y contabilizar
    if (!simular) {
      this.almacenamiento.guardar(this.COL_PENDIENTES, resultado.asiento);
      const contabilizacion = this.contabilizarAsiento(resultado.asiento.id);

      if (!contabilizacion.exito) {
        return {
          exito: false,
          utilidad,
          asiento: null,
          errores: contabilizacion.errores
        };
      }

      // Marcar período como cerrado (si existe el gestor)
      if (typeof window.PeriodosContables !== 'undefined') {
        try {
          window.PeriodosContables.cerrarPeriodo(periodo, `Cierre contable automático. Utilidad: ${window.utilidades.formatearBs(utilidad)}`);
        } catch (e) {
          console.warn('⚠️ No se pudo marcar período como cerrado:', e);
        }
      }

      console.log(`✅ [MOTOR] Ejercicio ${periodo} cerrado. Utilidad: ${window.utilidades.formatearBs(utilidad)}`);
    } else {
      console.log(`🔍 [MOTOR] Simulación de cierre. No se guardaron cambios.`);
    }

    return {
      exito: true,
      utilidad,
      totalIngresos,
      totalGastos,
      asiento: resultado.asiento,
      errores: []
    };
  }

  /**
   * Simula el cierre del ejercicio sin guardar cambios.
   * Útil para previsualizar el resultado antes de confirmar.
   *
   * @param {string} periodo
   * @returns {Object}
   */
  simularCierreEjercicio(periodo) {
    return this.cerrarEjercicio(periodo, { simular: true });
  }

  /**
   * Porcentaje de bono de antigüedad según años de servicio (DS 21060).
   * @private
   */
  _porcentajeBonoAntiguedad(anios) {
    if (anios >= 25) return 50;
    if (anios >= 20) return 30;
    if (anios >= 15) return 25;
    if (anios >= 10) return 20;
    if (anios >= 8) return 15;
    if (anios >= 6) return 11;
    if (anios >= 4) return 9;
    if (anios >= 2) return 5;
    return 0;
  }

  /**
   * Calcula el último día del mes para un período.
   * @private
   */
  _ultimoDiaDelMes(periodo) {
    const [anio, mes] = periodo.split('-').map(Number);
    const ultimoDia = new Date(anio, mes, 0).getDate();
    return String(ultimoDia).padStart(2, '0');
  }

  // ════════════════════════════════════════════════════════════
  // MÉTODOS PRIVADOS
  // ════════════════════════════════════════════════════════════

  _dispararEvento(nombre, datos) {
    const evento = new CustomEvent(`erp:${nombre}`, { detail: datos });
    window.dispatchEvent(evento);
  }
}

// Exponer globalmente
window.MotorContable = MotorContable;
