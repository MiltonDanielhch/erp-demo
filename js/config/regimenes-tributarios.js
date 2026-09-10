// ══════════════════════════════════════════════════════════════
// regimenes-tributarios.js — Regímenes bolivianos (v3 definitivo)
// ══════════════════════════════════════════════════════════════

window.REGIMENES_TRIBUTARIOS = {
  'RG': {
    codigo: 'RG', nombre: 'Régimen General',
    descripcion: 'Empresas sin límite de ingresos',
    impuestos: ['IVA', 'IT', 'IUE'],
    periodicidad: { IVA: 'MENSUAL', IT: 'MENSUAL', IUE: 'ANUAL' },
    emiteCreditoFiscal: true, emiteFacturaSIN: true,
    requiereContabilidad: true,
    limites: { ingresosAnuales: null, empleados: null },
    vigencia: 'Desde 1986 (Ley 843)', esPredeterminado: true
  },
  'RTS': {
    codigo: 'RTS', nombre: 'Régimen Tributario Simplificado',
    descripcion: 'Comerciantes minoristas, cuota fija bimestral',
    impuestos: ['CUOTA_FIJA'], periodicidad: { CUOTA_FIJA: 'BIMESTRAL' },
    emiteCreditoFiscal: false, emiteFacturaSIN: false,
    requiereContabilidad: false,
    limites: { ingresosAnuales: 1200000, empleados: 5 },
    vigencia: 'Desde 1986'
  },
  'STI': {
    codigo: 'STI', nombre: 'Sistema Tributario Integrado',
    descripcion: 'Transporte público, cuota fija trimestral',
    impuestos: ['CUOTA_FIJA'], periodicidad: { CUOTA_FIJA: 'TRIMESTRAL' },
    emiteCreditoFiscal: false, emiteFacturaSIN: false,
    requiereContabilidad: false,
    limites: { ingresosAnuales: null, vehiculos: 2 },
    vigencia: 'Desde 1996'
  },
  'RAU': {
    codigo: 'RAU', nombre: 'Régimen Agropecuario Unificado',
    descripcion: 'Productores agropecuarios, cuota anual',
    impuestos: ['CUOTA_FIJA'], periodicidad: { CUOTA_FIJA: 'ANUAL' },
    emiteCreditoFiscal: false, emiteFacturaSIN: false,
    requiereContabilidad: false,
    limites: { ingresosAnuales: null, superficieHectareas: 500 },
    vigencia: 'Desde 1986'
  },
  'SIETE-RG': {
    codigo: 'SIETE-RG', nombre: 'Sistema Integral de Emprendedores',
    descripcion: 'Emprendedores pequeños (2026), 5% sobre bruto, acumula crédito',
    impuestos: ['IVA_EMPRENDEDOR'], periodicidad: { IVA_EMPRENDEDOR: 'BIMESTRAL' },
    emiteCreditoFiscal: false, acumulaCreditoFiscal: true,
    emiteFacturaSIN: true, requiereContabilidad: false,
    limites: { ingresosAnuales: 600000, aniosAntiguedad: 3, empleados: 10 },
    tasaEfectiva: 0.05, vigencia: 'Desde 2026 (Ley 1733)',
    esNuevo: true
  }
};

window.REGIMENES_CON_CREDITO_FISCAL = ['RG'];
window.REGIMENES_SIN_CREDITO_FISCAL = ['RTS', 'STI', 'RAU', 'SIETE-RG'];
window.REGIMENES_CON_CUOTA_FIJA = ['RTS', 'STI', 'RAU'];
window.RegimenesUtilidades = {
  obtenerRegimen: function(c) { return window.REGIMENES_TRIBUTARIOS[c] || null; },
  obtenerTodos: function() { return Object.values(window.REGIMENES_TRIBUTARIOS); },
  permiteCreditoFiscal: function(c) {
    var r = this.obtenerRegimen(c); return r ? r.emiteCreditoFiscal === true : false;
  }
};
console.log('🏛️ Regímenes cargados: ' + Object.keys(window.REGIMENES_TRIBUTARIOS).join(', '));