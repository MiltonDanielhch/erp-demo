// ══════════════════════════════════════════════════════════════
// fundempresa.js — Módulo 7.8: Obligaciones Societarias
// ══════════════════════════════════════════════════════════════

/**
 * Módulo de Obligaciones Societarias — Fundempresa
 *
 * Gestiona las obligaciones ante el Registro de Comercio de Bolivia:
 * - Matrícula de Comercio (renovación anual)
 * - Depósito de Estados Financieros (anual)
 * - Registro de actas de asamblea (ocasional)
 * - RUPS — Reunión de Socios / Junta de Accionistas (anual)
 *
 * Plazos típicos:
 * - Matrícula: enero-marzo de cada año
 * - Depósito EEFF: dentro de los 30 días posteriores a la RUPS
 * - RUPS: dentro de los 4 meses posteriores al cierre de gestión
 */
class ModuloFundempresa {

  constructor(deps = {}) {
    this.almacenamiento = deps.almacenamiento || null;
    this.KEY_OBLIGACIONES = 'erp_fundempresa_obligaciones';

    console.log('🏛️ Módulo Fundempresa inicializado');
  }

  // ══════════════════════════════════════════════════════════
  // REGISTRO DE OBLIGACIONES
  // ══════════════════════════════════════════════════════════

  /**
   * Registra una obligación societaria.
   *
   * @param {Object} datos
   * @param {string} datos.tipo - MATRICULA, DEPOSITO_EEFF, ACTA, RUPS
   * @param {string} datos.fechaVencimiento - Fecha límite
   * @param {string} datos.gestion - Año de gestión
   * @param {Object} [datos.detalle] - Información adicional
   * @returns {Object}
   */
  registrarObligacionSocietaria(datos) {
    if (!datos.tipo) {
      return { exito: false, errores: ['Tipo de obligación requerido'] };
    }

    if (!datos.fechaVencimiento) {
      return { exito: false, errores: ['Fecha de vencimiento requerida'] };
    }

    const tiposValidos = ['MATRICULA', 'DEPOSITO_EEFF', 'ACTA', 'RUPS'];
    if (!tiposValidos.includes(datos.tipo)) {
      return { exito: false, errores: [`Tipo inválido: ${datos.tipo}`] };
    }

    const obligacion = {
      id: 'obl-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 6),
      tipo: datos.tipo,
      nombre: this._obtenerNombreTipo(datos.tipo),
      fechaVencimiento: datos.fechaVencimiento,
      gestion: datos.gestion || new Date().getFullYear(),
      estado: 'PENDIENTE',
      fechaRegistro: new Date().toISOString(),
      fechaCumplimiento: null,
      detalle: datos.detalle || {},
      observaciones: datos.observaciones || ''
    };

    const obligaciones = this._leerObligaciones();
    obligaciones.push(obligacion);
    this._guardarObligaciones(obligaciones);

    console.log(`📋 Obligación registrada: ${obligacion.nombre} | Vence: ${obligacion.fechaVencimiento}`);
    return { exito: true, obligacion };
  }

  /**
   * Obtiene todas las obligaciones pendientes.
   *
   * @returns {Array}
   */
  obtenerObligacionesPendientes() {
    const obligaciones = this._leerObligaciones();
    return obligaciones
      .filter(o => o.estado === 'PENDIENTE')
      .sort((a, b) => new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento));
  }

  /**
   * Obtiene todas las obligaciones cumplidas.
   *
   * @returns {Array}
   */
  obtenerObligacionesCumplidas() {
    const obligaciones = this._leerObligaciones();
    return obligaciones
      .filter(o => o.estado === 'CUMPLIDA')
      .sort((a, b) => new Date(b.fechaCumplimiento) - new Date(a.fechaCumplimiento));
  }

  /**
   * Obtiene todas las obligaciones (pendientes + cumplidas).
   *
   * @returns {Array}
   */
  obtenerTodasLasObligaciones() {
    return this._leerObligaciones();
  }

  // ══════════════════════════════════════════════════════════
  // ALERTAS
  // ══════════════════════════════════════════════════════════

  /**
   * Genera alertas para obligaciones próximas.
   *
   * @param {number} [diasAntes=30] - Días de anticipación
   * @returns {Array}
   */
  generarAlertasFundempresa(diasAntes = 30) {
    const pendientes = this.obtenerObligacionesPendientes();
    const hoy = new Date();

    return pendientes
      .map(obl => {
        const fechaVenc = new Date(obl.fechaVencimiento);
        const diasRestantes = this._diasEntre(hoy, fechaVenc);
        const semaforo = this._generarSemaforo(diasRestantes);

        return {
          ...obl,
          diasRestantes,
          semaforo,
          vencido: diasRestantes < 0,
          mensaje: `${semaforo.icono} ${obl.nombre} (${obl.gestion}) ${
            diasRestantes < 0
              ? `VENCIDO hace ${Math.abs(diasRestantes)} días`
              : `vence en ${diasRestantes} días`
          }`
        };
      })
      .filter(alerta => alerta.diasRestantes <= diasAntes)
      .sort((a, b) => a.diasRestantes - b.diasRestantes);
  }

  // ══════════════════════════════════════════════════════════
  // MARCAR COMO CUMPLIDA
  // ══════════════════════════════════════════════════════════

  /**
   * Marca una obligación como cumplida.
   *
   * @param {string} obligacionId
   * @param {Object} [datosCumplimiento]
   * @param {string} [datosCumplimiento.fechaCumplimiento]
   * @param {string} [datosCumplimiento.observaciones]
   * @returns {Object}
   */
  marcarCumplida(obligacionId, datosCumplimiento = {}) {
    const obligaciones = this._leerObligaciones();
    const indice = obligaciones.findIndex(o => o.id === obligacionId);

    if (indice === -1) {
      return { exito: false, errores: ['Obligación no encontrada'] };
    }

    if (obligaciones[indice].estado === 'CUMPLIDA') {
      return { exito: false, errores: ['La obligación ya está marcada como cumplida'] };
    }

    obligaciones[indice].estado = 'CUMPLIDA';
    obligaciones[indice].fechaCumplimiento = datosCumplimiento.fechaCumplimiento || new Date().toISOString();
    obligaciones[indice].observacionesCumplimiento = datosCumplimiento.observaciones || '';

    this._guardarObligaciones(obligaciones);

    console.log(`✅ Obligación cumplida: ${obligaciones[indice].nombre} (${obligaciones[indice].gestion})`);
    return { exito: true, obligacion: obligaciones[indice] };
  }

  /**
   * Reactiva una obligación cumplida (vuelve a PENDIENTE).
   *
   * @param {string} obligacionId
   * @returns {Object}
   */
  reactivarObligacion(obligacionId) {
    const obligaciones = this._leerObligaciones();
    const indice = obligaciones.findIndex(o => o.id === obligacionId);

    if (indice === -1) {
      return { exito: false, errores: ['Obligación no encontrada'] };
    }

    obligaciones[indice].estado = 'PENDIENTE';
    obligaciones[indice].fechaCumplimiento = null;
    obligaciones[indice].observacionesCumplimiento = '';

    this._guardarObligaciones(obligaciones);

    console.log(`🔄 Obligación reactivada: ${obligaciones[indice].nombre}`);
    return { exito: true, obligacion: obligaciones[indice] };
  }

  /**
   * Elimina una obligación.
   *
   * @param {string} obligacionId
   * @returns {Object}
   */
  eliminarObligacion(obligacionId) {
    const obligaciones = this._leerObligaciones();
    const filtradas = obligaciones.filter(o => o.id !== obligacionId);

    if (filtradas.length === obligaciones.length) {
      return { exito: false, errores: ['Obligación no encontrada'] };
    }

    this._guardarObligaciones(filtradas);
    console.log(`🗑️ Obligación eliminada: ${obligacionId}`);
    return { exito: true };
  }

  // ══════════════════════════════════════════════════════════
  // OBLIGACIONES AUTOMÁTICAS
  // ══════════════════════════════════════════════════════════

  /**
   * Genera obligaciones anuales automáticas para una gestión.
   *
   * @param {number} gestion
   * @returns {Object}
   */
  generarObligacionesAnuales(gestion) {
    const anio = Number(gestion);
    const creadas = [];

    // 1. Matrícula de Comercio (vencimiento: 31 de marzo)
    const matricula = this.registrarObligacionSocietaria({
      tipo: 'MATRICULA',
      fechaVencimiento: `${anio}-03-31`,
      gestion: anio,
      detalle: { descripcion: 'Renovación de Matrícula de Comercio' }
    });
    if (matricula.exito) creadas.push(matricula.obligacion);

    // 2. RUPS — Reunión de Socios (vencimiento: 30 de abril)
    const rups = this.registrarObligacionSocietaria({
      tipo: 'RUPS',
      fechaVencimiento: `${anio}-04-30`,
      gestion: anio,
      detalle: { descripcion: 'Reunión de Socios / Junta de Accionistas' }
    });
    if (rups.exito) creadas.push(rups.obligacion);

    // 3. Depósito de EEFF (vencimiento: 30 de mayo, 30 días después de RUPS)
    const deposito = this.registrarObligacionSocietaria({
      tipo: 'DEPOSITO_EEFF',
      fechaVencimiento: `${anio}-05-30`,
      gestion: anio,
      detalle: { descripcion: 'Depósito de Estados Financieros en Fundempresa' }
    });
    if (deposito.exito) creadas.push(deposito.obligacion);

    console.log(`📅 ${creadas.length} obligaciones anuales generadas para gestión ${anio}`);
    return { exito: true, creadas, total: creadas.length };
  }

  // ══════════════════════════════════════════════════════════
  // UTILIDADES PRIVADAS
  // ══════════════════════════════════════════════════════════

  _obtenerNombreTipo(tipo) {
    const nombres = {
      MATRICULA: 'Matrícula de Comercio',
      DEPOSITO_EEFF: 'Depósito de Estados Financieros',
      ACTA: 'Registro de Acta de Asamblea',
      RUPS: 'Reunión de Socios / Junta de Accionistas'
    };
    return nombres[tipo] || tipo;
  }

  _diasEntre(fecha1, fecha2) {
    const a = new Date(fecha1);
    const b = new Date(fecha2);
    a.setHours(0, 0, 0, 0);
    b.setHours(0, 0, 0, 0);
    return Math.ceil((b - a) / (1000 * 60 * 60 * 24));
  }

  _generarSemaforo(diasRestantes) {
    if (diasRestantes < 0) {
      return { nivel: 'VENCIDO', color: 'negro', icono: '⚫' };
    }
    if (diasRestantes < 7) {
      return { nivel: 'CRÍTICO', color: 'rojo', icono: '🔴' };
    }
    if (diasRestantes <= 30) {
      return { nivel: 'PRÓXIMO', color: 'amarillo', icono: '🟡' };
    }
    return { nivel: 'OK', color: 'verde', icono: '🟢' };
  }

  _leerObligaciones() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY_OBLIGACIONES) || '[]');
    } catch (e) {
      return [];
    }
  }

  _guardarObligaciones(obligaciones) {
    localStorage.setItem(this.KEY_OBLIGACIONES, JSON.stringify(obligaciones));
  }
}

window.ModuloFundempresaClase = ModuloFundempresa;
