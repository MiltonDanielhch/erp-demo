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
    this.MAYOR_STORAGE_KEY = 'erp_bolivia_libro_mayor';

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

    // Migrar cualquier libro_mayor corrupto anterior de la colección
    // al storage directo (una sola vez)
    this._migrarMayorDeColeccion();

    console.log('⚙️ Motor Contable inicializado.');
  }

  /**
   * Migra datos del libro_mayor de la colección antigua (si existen)
   * al nuevo formato de localStorage directo.
   * @private
   */
  _migrarMayorDeColeccion() {
    try {
      const mayorColeccion = this.almacenamiento.obtener('libro_mayor') || [];
      if (mayorColeccion.length > 0) {
        // Eliminar IDs únicos innecesarios (ya no se usan en el nuevo formato)
        const mayorLimpio = mayorColeccion.map(m => ({
          cuentaCodigo: m.cuentaCodigo,
          cuentaNombre: m.cuentaNombre,
          naturaleza: m.naturaleza || 'deudora',
          movimientos: m.movimientos || [],
          totalDebe: m.totalDebe || 0,
          totalHaber: m.totalHaber || 0,
          saldo: m.saldo || 0
        }));
        localStorage.setItem(this.MAYOR_STORAGE_KEY, JSON.stringify(mayorLimpio));
        // Limpiar colección vieja
        mayorColeccion.forEach(item => this.almacenamiento.eliminar('libro_mayor', item.id));
        console.log(`🔧 [MOTOR] Migrados ${mayorLimpio.length} registros de libro_mayor a nuevo formato`);
      }
    } catch (e) {
      console.warn('⚠️ No se pudo migrar libro_mayor:', e);
    }
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
   * Obtiene el mayor de una cuenta específica.
   * @param {string} cuentaCodigo
   * @returns {Object|null}
   */
  obtenerMayorPorCuenta(cuentaCodigo) {
    const mayor = this._leerMayor();
    return mayor.find(m => m.cuentaCodigo === cuentaCodigo) || null;
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
