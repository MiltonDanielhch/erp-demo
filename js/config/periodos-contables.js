// ══════════════════════════════════════════════════════════════
// periodos-contables.js — ERP Contable Bolivia
// Gestión de períodos contables (abiertos/cerrados)
// ══════════════════════════════════════════════════════════════

/**
 * Gestor de Períodos Contables
 *
 * Responsabilidades:
 * - Trackear qué períodos están abiertos/cerrados
 * - Controlar el cierre mensual contable
 * - Validar que no se registren documentos en períodos cerrados
 * - Generar lista de períodos disponibles
 *
 * Regla de negocio:
 * Un período "abierto" permite registrar y modificar documentos.
 * Un período "cerrado" es de solo lectura (ya se hizo el cierre contable).
 *
 * @namespace PeriodosContables
 */

const PeriodosContables = {

  nombreColeccion: 'periodosContables',

  /**
   * Inicializa el gestor de períodos.
   * Si no hay períodos en localStorage, crea el actual como abierto.
   */
  inicializar() {
    const periodos = this.obtenerTodos();

    if (periodos.length === 0) {
      // Crear los últimos 12 meses como abiertos por defecto
      const hoy = new Date();
      for (let i = 0; i < 12; i++) {
        const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
        const periodo = this._formatearPeriodo(fecha);
        this.abrirPeriodo(periodo);
      }
      console.log('📅 Períodos contables inicializados (últimos 12 meses abiertos)');
    }
  },

  /**
   * Obtiene todos los períodos registrados.
   * @returns {Array} Lista de períodos con su estado
   */
  obtenerTodos() {
    return window.almacenamiento.obtener(this.nombreColeccion);
  },

  /**
   * Obtiene solo los períodos abiertos.
   * @returns {Array} Períodos abiertos ordenados descendente
   */
  obtenerAbiertos() {
    const periodos = this.obtenerTodos()
      .filter(p => p.estado === 'ABIERTO')
      .sort((a, b) => b.periodo.localeCompare(a.periodo));

    return periodos;
  },

  /**
   * Obtiene los últimos N meses disponibles (abiertos o cerrados).
   * @param {number} cantidad - Cuántos meses hacia atrás (default: 12)
   * @returns {Array} Lista de períodos en formato "AAAA-MM"
   */
  obtenerUltimosMeses(cantidad = 12) {
    const periodos = [];
    const hoy = new Date();

    for (let i = 0; i < cantidad; i++) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      periodos.push(this._formatearPeriodo(fecha));
    }

    return periodos;
  },

  /**
   * Verifica si un período está abierto.
   * @param {string} periodo - Período en formato "AAAA-MM"
   * @returns {boolean} true si está abierto
   */
  estaAbierto(periodo) {
    const periodos = this.obtenerTodos();
    const encontrado = periodos.find(p => p.periodo === periodo);

    // Si no existe en el registro, por defecto está cerrado
    if (!encontrado) return false;

    return encontrado.estado === 'ABIERTO';
  },

  /**
   * Abre un período contable.
   * @param {string} periodo - Período en formato "AAAA-MM"
   * @returns {Object} Resultado de la operación
   */
  abrirPeriodo(periodo) {
    if (!this._validarFormato(periodo)) {
      return { exito: false, mensaje: `Formato inválido: ${periodo}. Use AAAA-MM.` };
    }

    const periodos = this.obtenerTodos();
    const existente = periodos.find(p => p.periodo === periodo);

    if (existente) {
      if (existente.estado === 'ABIERTO') {
        return { exito: false, mensaje: `El período ${periodo} ya está abierto.` };
      }
      // Actualizar estado
      window.almacenamiento.actualizar(this.nombreColeccion, existente.id, {
        estado: 'ABIERTO',
        modificadoEn: new Date().toISOString()
      });
    } else {
      // Crear nuevo período
      window.almacenamiento.guardar(this.nombreColeccion, {
        periodo: periodo,
        estado: 'ABIERTO',
        creadoEn: new Date().toISOString()
      });
    }

    this._dispararEvento('periodo-abierto', { periodo });
    console.log(`🔓 Período ${periodo} abierto`);
    return { exito: true, mensaje: `Período ${periodo} abierto correctamente.` };
  },

  /**
   * Cierra un período contable.
   * ⚠️ ADVERTENCIA: Una vez cerrado, no se pueden registrar documentos en este período.
   *
   * @param {string} periodo - Período en formato "AAAA-MM"
   * @param {string} motivo - Motivo del cierre
   * @returns {Object} Resultado de la operación
   */
  cerrarPeriodo(periodo, motivo = 'Cierre mensual contable') {
    if (!this._validarFormato(periodo)) {
      return { exito: false, mensaje: `Formato inválido: ${periodo}. Use AAAA-MM.` };
    }

    const periodos = this.obtenerTodos();
    const existente = periodos.find(p => p.periodo === periodo);

    if (!existente) {
      return { exito: false, mensaje: `El período ${periodo} no existe.` };
    }

    if (existente.estado === 'CERRADO') {
      return { exito: false, mensaje: `El período ${periodo} ya está cerrado.` };
    }

    window.almacenamiento.actualizar(this.nombreColeccion, existente.id, {
      estado: 'CERRADO',
      fechaCierre: new Date().toISOString(),
      motivoCierre: motivo,
      modificadoEn: new Date().toISOString()
    });

    this._dispararEvento('periodo-cerrado', { periodo, motivo });
    console.log(`🔒 Período ${periodo} cerrado: ${motivo}`);
    return { exito: true, mensaje: `Período ${periodo} cerrado correctamente.` };
  },

  /**
   * Obtiene el período actual (mes en curso).
   * @returns {string} Período actual en formato "AAAA-MM"
   */
  obtenerPeriodoActual() {
    return this._formatearPeriodo(new Date());
  },

  /**
   * Obtiene el período anterior.
   * @returns {string} Período anterior en formato "AAAA-MM"
   */
  obtenerPeriodoAnterior() {
    const hoy = new Date();
    const anterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    return this._formatearPeriodo(anterior);
  },

  /**
   * Formatea un nombre legible para el período.
   * Ejemplo: "2026-09" → "Septiembre 2026"
   *
   * @param {string} periodo - Período en formato "AAAA-MM"
   * @returns {string} Nombre legible
   */
  formatearNombre(periodo) {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const [anio, mes] = periodo.split('-');
    const mesNumero = parseInt(mes, 10);

    if (isNaN(mesNumero) || mesNumero < 1 || mesNumero > 12) {
      return periodo;
    }

    return `${meses[mesNumero - 1]} ${anio}`;
  },

  // ════════════════════════════════════════════════════════════
  // MÉTODOS PRIVADOS
  // ════════════════════════════════════════════════════════════

  /**
   * Formatea una fecha como "AAAA-MM".
   * @param {Date} fecha - Fecha a formatear
   * @returns {string} Período en formato AAAA-MM
   * @private
   */
  _formatearPeriodo(fecha) {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    return `${anio}-${mes}`;
  },

  /**
   * Valida el formato de un período (AAAA-MM).
   * @param {string} periodo - Período a validar
   * @returns {boolean} true si el formato es válido
   * @private
   */
  _validarFormato(periodo) {
    return /^\d{4}-\d{2}$/.test(periodo);
  },

  /**
   * Dispara un evento personalizado.
   * @param {string} nombreEvento - Nombre del evento
   * @param {Object} datos - Datos del evento
   * @private
   */
  _dispararEvento(nombreEvento, datos) {
    const evento = new CustomEvent(`erp:${nombreEvento}`, { detail: datos });
    window.dispatchEvent(evento);
  }
};
