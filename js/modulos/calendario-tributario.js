// ══════════════════════════════════════════════════════════════
// calendario-tributario.js — Módulo 7.2: Calendario Tributario
// ══════════════════════════════════════════════════════════════

/**
 * Calendario Tributario Bolivia — SIN
 *
 * Calcula vencimientos según último dígito del NIT:
 * 1 → día 10
 * 2 → día 11
 * ...
 * 0 → día 19
 *
 * Si cae fin de semana o feriado, corre al siguiente día hábil.
 *
 * También gestiona:
 * - Alertas por vencimiento
 * - Próximos vencimientos
 * - Marcado como declarado / pagado
 * - Persistencia en LocalStorage
 */
class CalendarioTributario {

  constructor(deps = {}) {
    this.almacenamiento = deps.almacenamiento || null;
    this.nitEmpresa = deps.nitEmpresa || this._obtenerNITEmpresa() || '123456789-1';

    this.KEY_ESTADOS = 'erp_cumplimiento_estados_formularios';
    this.KEY_VENCIMIENTOS = 'erp_cumplimiento_vencimientos';

    console.log('📅 CalendarioTributario inicializado');
  }

  // ══════════════════════════════════════════════════════════
  // CÁLCULO DE VENCIMIENTOS
  // ══════════════════════════════════════════════════════════

  /**
   * Calcula vencimientos tributarios para un período mensual o anual.
   *
   * @param {string} nit - NIT del contribuyente
   * @param {string} periodo - "AAAA-MM" o "AAAA"
   * @returns {Array}
   */
  calcularVencimientos(nit = this.nitEmpresa, periodo = this._periodoActual()) {
    const ultimoDigito = this._extraerUltimoDigitoNIT(nit);
    const diaBase = this._diaVencimientoPorDigito(ultimoDigito);

    let vencimientos = [];

    if (/^\d{4}-\d{2}$/.test(periodo)) {
      vencimientos = this._calcularVencimientosMensuales(periodo, diaBase);
    } else if (/^\d{4}$/.test(periodo)) {
      vencimientos = this._calcularVencimientosAnuales(periodo, diaBase);
    } else {
      console.warn('Período inválido para calendario tributario:', periodo);
      return [];
    }

    const hoy = new Date();

    const resultado = vencimientos.map(v => {
      const fechaAjustada = this._siguienteDiaHabil(v.fechaVencimiento);
      const diasRestantes = this._diasEntre(hoy, fechaAjustada);
      const semaforo = this.generarSemaforo(diasRestantes);
      const estado = this._obtenerEstadoFormulario(v.formulario, v.periodo);

      return {
        ...v,
        nit,
        ultimoDigito,
        fechaVencimiento: this._fechaISO(fechaAjustada),
        diasRestantes,
        semaforo,
        estado: estado.estado,
        declarado: estado.declarado,
        pagado: estado.pagado,
        fechaDeclaracion: estado.fechaDeclaracion || null,
        fechaPago: estado.fechaPago || null,
        montoPagado: estado.montoPagado || 0
      };
    });

    this._guardarVencimientos(resultado);
    return resultado;
  }

  _calcularVencimientosMensuales(periodo, diaBase) {
    const [anio, mes] = periodo.split('-').map(Number);

    // Mes siguiente
    const fechaBase = new Date(anio, mes, diaBase); // JS: mes 1=Febrero si mes=1, aquí funciona porque mes viene 1-12 y queremos siguiente mes

    return [
      {
        formulario: 'FORM_200',
        nombre: 'Formulario 200 — IVA',
        impuesto: 'IVA',
        periodo,
        frecuencia: 'MENSUAL',
        fechaVencimiento: new Date(fechaBase)
      },
      {
        formulario: 'FORM_400',
        nombre: 'Formulario 400 — IT',
        impuesto: 'IT',
        periodo,
        frecuencia: 'MENSUAL',
        fechaVencimiento: new Date(fechaBase)
      },
      {
        formulario: 'FORM_110',
        nombre: 'Formulario 110 — Retenciones',
        impuesto: 'RC-IVA / Retenciones',
        periodo,
        frecuencia: 'MENSUAL',
        fechaVencimiento: new Date(fechaBase)
      },
      {
        formulario: 'LCV',
        nombre: 'Libro de Compras y Ventas IVA',
        impuesto: 'LCV',
        periodo,
        frecuencia: 'MENSUAL',
        fechaVencimiento: new Date(fechaBase)
      }
    ];
  }

  _calcularVencimientosAnuales(anio, diaBase) {
    const gestion = Number(anio);

    // IUE y Form. 605: 120 días después del cierre de gestión fiscal.
    // Simplificación educativa: cierre 31/12.
    const cierre = new Date(gestion, 11, 31);
    const vencimientoIUE = new Date(cierre);
    vencimientoIUE.setDate(vencimientoIUE.getDate() + 120);

    const segundoAguinaldo = new Date(gestion, 11, 20);

    return [
      {
        formulario: 'FORM_500',
        nombre: 'Formulario 500 — IUE',
        impuesto: 'IUE',
        periodo: anio,
        frecuencia: 'ANUAL',
        fechaVencimiento: vencimientoIUE
      },
      {
        formulario: 'FORM_605',
        nombre: 'Formulario 605 — Estados Financieros SIAT',
        impuesto: 'EEFF / SIAT',
        periodo: anio,
        frecuencia: 'ANUAL',
        fechaVencimiento: vencimientoIUE
      },
      {
        formulario: 'SEGUNDO_AGUINALDO',
        nombre: 'Segundo Aguinaldo',
        impuesto: 'Laboral',
        periodo: anio,
        frecuencia: 'ANUAL',
        fechaVencimiento: segundoAguinaldo
      }
    ];
  }

  // ══════════════════════════════════════════════════════════
  // ALERTAS
  // ══════════════════════════════════════════════════════════

  /**
   * Genera alertas de vencimiento.
   *
   * @param {number} diasAntes
   * @returns {Array}
   */
  generarAlertasVencimiento(diasAntes = 15) {
    const vencimientos = this._obtenerVencimientosPersistidos();
    const alertas = vencimientos
      .filter(v => !v.declarado || !v.pagado)
      .filter(v => v.diasRestantes <= diasAntes)
      .map(v => ({
        tipo: 'SIN',
        formulario: v.formulario,
        nombre: v.nombre,
        periodo: v.periodo,
        fechaVencimiento: v.fechaVencimiento,
        diasRestantes: v.diasRestantes,
        nivel: v.semaforo.nivel,
        color: v.semaforo.color,
        icono: v.semaforo.icono,
        mensaje: `${v.semaforo.icono} ${v.nombre} (${v.periodo}) vence en ${v.diasRestantes} días`
      }))
      .sort((a, b) => a.diasRestantes - b.diasRestantes);

    return alertas;
  }

  /**
   * Devuelve próximos N vencimientos.
   *
   * @param {number} cantidad
   * @returns {Array}
   */
  obtenerProximosVencimientos(cantidad = 10) {
    let vencimientos = this._obtenerVencimientosPersistidos();

    if (vencimientos.length === 0) {
      const periodo = this._periodoActual();
      vencimientos = this.calcularVencimientos(this.nitEmpresa, periodo);
    }

    return vencimientos
      .sort((a, b) => new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento))
      .slice(0, cantidad);
  }

  /**
   * Genera semáforo por días restantes.
   *
   * @param {number} diasRestantes
   * @returns {Object}
   */
  generarSemaforo(diasRestantes) {
    if (diasRestantes < 0) {
      return { nivel: 'VENCIDO', color: 'negro', icono: '⚫' };
    }
    if (diasRestantes < 3) {
      return { nivel: 'CRÍTICO', color: 'rojo', icono: '🔴' };
    }
    if (diasRestantes <= 7) {
      return { nivel: 'PRÓXIMO', color: 'amarillo', icono: '🟡' };
    }
    return { nivel: 'OK', color: 'verde', icono: '🟢' };
  }

  // ══════════════════════════════════════════════════════════
  // ESTADOS: DECLARADO / PAGADO
  // ══════════════════════════════════════════════════════════

  marcarDeclarado(formulario, periodo, datos = {}) {
    const estados = this._leerEstados();
    const key = this._estadoKey(formulario, periodo);

    estados[key] = {
      ...(estados[key] || {}),
      formulario,
      periodo,
      estado: 'DECLARADO',
      declarado: true,
      fechaDeclaracion: datos.fechaDeclaracion || new Date().toISOString(),
      observaciones: datos.observaciones || ''
    };

    this._guardarEstados(estados);

    return {
      exito: true,
      formulario,
      periodo,
      estado: estados[key]
    };
  }

  marcarPagado(formulario, periodo, datos = {}) {
    const estados = this._leerEstados();
    const key = this._estadoKey(formulario, periodo);

    estados[key] = {
      ...(estados[key] || {}),
      formulario,
      periodo,
      estado: 'PAGADO',
      declarado: true,
      pagado: true,
      fechaPago: datos.fechaPago || new Date().toISOString(),
      montoPagado: Number(datos.montoPagado) || 0,
      asientoPagoId: datos.asientoPagoId || null
    };

    this._guardarEstados(estados);

    return {
      exito: true,
      formulario,
      periodo,
      estado: estados[key]
    };
  }

  // ══════════════════════════════════════════════════════════
  // UTILIDADES PRIVADAS
  // ══════════════════════════════════════════════════════════

  _extraerUltimoDigitoNIT(nit) {
    const limpio = String(nit || '').replace(/\D/g, '');
    if (!limpio) return 0;
    return Number(limpio[limpio.length - 1]);
  }

  _diaVencimientoPorDigito(digito) {
    const mapa = {
      1: 10,
      2: 11,
      3: 12,
      4: 13,
      5: 14,
      6: 15,
      7: 16,
      8: 17,
      9: 18,
      0: 19
    };
    return mapa[digito] || 19;
  }

  _siguienteDiaHabil(fecha) {
    const f = new Date(fecha);

    while (this._esFinDeSemana(f) || this._esFeriado(f)) {
      f.setDate(f.getDate() + 1);
    }

    return f;
  }

  _esFinDeSemana(fecha) {
    const dia = fecha.getDay();
    return dia === 0 || dia === 6;
  }

  _esFeriado(fecha) {
    const mmdd = `${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;

    // Feriados fijos Bolivia.
    // Nota: feriados móviles como Carnaval y Corpus Christi pueden agregarse por gestión.
    const feriadosFijos = [
      '01-01', // Año Nuevo
      '01-22', // Día del Estado Plurinacional
      '05-01', // Día del Trabajo
      '06-21', // Año Nuevo Andino Amazónico
      '08-06', // Independencia
      '11-02', // Todos Santos
      '12-25'  // Navidad
    ];

    return feriadosFijos.includes(mmdd);
  }

  _diasEntre(fecha1, fecha2) {
    const a = new Date(fecha1);
    const b = new Date(fecha2);
    a.setHours(0, 0, 0, 0);
    b.setHours(0, 0, 0, 0);
    return Math.ceil((b - a) / (1000 * 60 * 60 * 24));
  }

  _fechaISO(fecha) {
    return new Date(fecha).toISOString().split('T')[0];
  }

  _periodoActual() {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
  }

  _obtenerNITEmpresa() {
    try {
      const empresa = JSON.parse(localStorage.getItem('erp_empresa') || '{}');
      return empresa.nit || null;
    } catch (e) {
      return null;
    }
  }

  _estadoKey(formulario, periodo) {
    return `${formulario}__${periodo}`;
  }

  _leerEstados() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY_ESTADOS) || '{}');
    } catch (e) {
      return {};
    }
  }

  _guardarEstados(estados) {
    localStorage.setItem(this.KEY_ESTADOS, JSON.stringify(estados));
  }

  _obtenerEstadoFormulario(formulario, periodo) {
    const estados = this._leerEstados();
    const key = this._estadoKey(formulario, periodo);

    return estados[key] || {
      formulario,
      periodo,
      estado: 'PENDIENTE',
      declarado: false,
      pagado: false
    };
  }

  _guardarVencimientos(vencimientos) {
    localStorage.setItem(this.KEY_VENCIMIENTOS, JSON.stringify(vencimientos));
  }

  _obtenerVencimientosPersistidos() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY_VENCIMIENTOS) || '[]');
    } catch (e) {
      return [];
    }
  }
}

window.CalendarioTributarioClase = CalendarioTributario;
