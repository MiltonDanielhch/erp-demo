// ══════════════════════════════════════════════════════════════
// DATOS.JS — Datos del ERP para renderizar en la landing
// ══════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────
// MÉTRICAS DEL PROYECTO
// ────────────────────────────────────────────────────────────────
const METRICAS_ERP = {
  lineasDeCodigo: 41090,
  archivos: 127,
  modulosCompletos: 8,
  guiasAprendizaje: 17,
  roadmaps: 11,
  adrs: 2,
  pesoTotal: '2.09 MB'
};

// ────────────────────────────────────────────────────────────────
// LOS 8 MÓDULOS
// ────────────────────────────────────────────────────────────────
const MODULOS_ERP = [
  {
    numero: '00',
    nombre: 'Setup y Configuración',
    icono: '⚙️',
    descripcion: 'Base del sistema: almacenamiento, utilidades, validadores y configuración boliviana (IVA 13%, SMN, feriados).',
    tecnologias: ['LocalStorage', 'Vanilla JS'],
    loc: 660,
    fases: 5,
    destacado: 'Configuración normativa boliviana centralizada'
  },
  {
    numero: '01',
    nombre: 'Documentos Fuente',
    icono: '📄',
    descripcion: 'Capa 1: registro de facturas, notas de débito/crédito con validación de NIT y CUF según SIAT.',
    tecnologias: ['Capas', 'Validadores'],
    loc: 496,
    fases: 4,
    destacado: 'Validación de NIT con dígito verificador'
  },
  {
    numero: '02',
    nombre: 'Compras y Ventas',
    icono: '🛒',
    descripcion: 'Ciclo completo: solicitud → orden → recepción → factura → pago. Inventario con kardex.',
    tecnologias: ['Módulos', 'Kardex'],
    loc: 1382,
    fases: 8,
    destacado: 'Ciclo de compras con cuentas por pagar'
  },
  {
    numero: '03',
    nombre: 'Motor Contable',
    icono: '⚙️',
    descripcion: 'Capa 3: partida doble, libro diario, mayor, balanza y cierre de ejercicio con validaciones.',
    tecnologias: ['Partida doble', 'Plan de cuentas'],
    loc: 905,
    fases: 10,
    destacado: 'Detección automática de errores contables'
  },
  {
    numero: '04',
    nombre: 'Nómina Boliviana',
    icono: '👥',
    descripcion: 'Aguinaldo, bono de antigüedad, indemnización, desahucio, RC-IVA con facturas y aportes patronales.',
    tecnologias: ['LGT', 'DS 28699', 'DS 22138'],
    loc: 1405,
    fases: 8,
    destacado: 'Las 5 provisiones laborales bolivianas'
  },
  {
    numero: '05',
    nombre: 'Impuestos Bolivianos',
    icono: '🧾',
    descripcion: 'IVA, IT, IUE, RC-IVA e IUE-BE. Compensación IT-IUE del Art. 77 y calendario por dígito de NIT.',
    tecnologias: ['Ley 843', 'Formularios SIN'],
    loc: 2024,
    fases: 13,
    destacado: 'Compensación IT-IUE (la joya del módulo)'
  },
  {
    numero: '06',
    nombre: 'Estados Financieros',
    icono: '📊',
    descripcion: 'Balance, resultados, flujo de efectivo, notas (12), comparativos y razones financieras.',
    tecnologias: ['NC CTNAC', 'Ratios'],
    loc: 950,
    fases: 10,
    destacado: '12 notas según NC del CTNAC'
  },
  {
    numero: '07',
    nombre: 'Cumplimiento SIN',
    icono: '✅',
    descripcion: 'Formularios 200/400/500/110/601/605, LCV, facturación electrónica (CUIS/CUFD/CUF) y Fundempresa.',
    tecnologias: ['SIAT', 'Fundempresa'],
    loc: 2091,
    fases: 12,
    destacado: 'Trazabilidad documento → asiento → estado'
  },
  {
    numero: '08',
    nombre: 'Contabilidad de Costos',
    icono: '🏭',
    descripcion: 'FIFO/LIFO/Promedio con comparador visual, centros de costo, órdenes de trabajo y punto de equilibrio.',
    tecnologias: ['NIC 2', 'CVP'],
    loc: 3010,
    fases: 13,
    destacado: 'Comparador de 3 métodos (herramienta didáctica)'
  }
];

// ────────────────────────────────────────────────────────────────
// GUÍAS DE APRENDIZAJE
// ────────────────────────────────────────────────────────────────
const GUIAS_APRENDIZAJE = {
  fundamentos: [
    { numero: '01', titulo: 'Documentos fuente', descripcion: 'Facturas, notas de débito/crédito y su rol contable' },
    { numero: '02', titulo: 'Tipos de documentos', descripcion: 'Clasificación y estructura de cada tipo' },
    { numero: '03', titulo: 'Modelo de datos', descripcion: 'Cómo se estructuran los documentos en el sistema' },
    { numero: '04', titulo: 'Ciclo compra-venta', descripcion: 'Del pedido al pago: el flujo completo' },
    { numero: '05', titulo: 'IVA boliviano', descripcion: 'IVA incluido en el precio (Art. 5 Ley 843)', destacada: true },
    { numero: '06', titulo: 'Funciones IVA e IT', descripcion: 'Cálculos y conciliación de impuestos' },
    { numero: '07', titulo: 'Partida doble', descripcion: 'El principio fundamental de la contabilidad' },
    { numero: '08', titulo: 'Ciclo contable', descripcion: 'Los pasos del registro al cierre' },
    { numero: '09', titulo: 'Cuentas y naturaleza', descripcion: 'Deudoras, acreedoras y su comportamiento' },
    { numero: '10', titulo: 'Estructura de asiento', descripcion: 'Cómo se construye un asiento contable' }
  ],
  normativa: [
    { numero: '11', titulo: 'Provisiones laborales', descripcion: 'Aguinaldo, indemnización y más' },
    { numero: '12', titulo: 'Cierre de ejercicio', descripcion: 'El proceso de cierre anual' },
    { numero: '13', titulo: 'Nómina boliviana', descripcion: 'Cálculo de sueldos con normativa local' },
    { numero: '14', titulo: 'Particularidades BO', descripcion: 'Lo que hace única la contabilidad boliviana', destacada: true },
    { numero: '17', titulo: 'Impuestos explicados', descripcion: 'IVA, IT, IUE, RC-IVA e IUE-BE' },
    { numero: '18', titulo: 'Calendario tributario', descripcion: 'Vencimientos según dígito de NIT' },
    { numero: '19', titulo: 'Compensación IT-IUE', descripcion: 'Art. 77 Ley 843: la joya del sistema', destacada: true }
  ]
};

// ────────────────────────────────────────────────────────────────
// PARTICULARIDADES BOLIVIANAS
// ────────────────────────────────────────────────────────────────
const PARTICULARIDADES_BOLIVIANAS = [
  {
    icono: '1️⃣',
    titulo: 'IVA incluido en el precio',
    descripcion: 'En Bolivia el IVA está dentro del precio, no se agrega. El ERP lo extrae automáticamente.',
    codigo: 'IVA = Total - (Total ÷ 1.13)',
    normativa: 'Art. 5 Ley 843',
    destacada: false
  },
  {
    icono: '2️⃣',
    titulo: 'Compensación IT-IUE',
    descripcion: 'El IT pagado mensualmente se descuenta del IUE anual. Si IT > IUE, el exceso SE PIERDE.',
    codigo: 'IUE por pagar = IUE - IT pagado',
    normativa: 'Art. 77 Ley 843',
    destacada: true
  },
  {
    icono: '3️⃣',
    titulo: 'LIFO prohibido',
    descripcion: 'Implementado solo para enseñar por qué se prohibió. NIIF y SIN no lo aceptan.',
    codigo: '// LIFO: solo educativo',
    normativa: 'NIC 2 + SIN Bolivia',
    destacada: false
  },
  {
    icono: '4️⃣',
    titulo: 'Calendario por dígito de NIT',
    descripcion: 'Los vencimientos van del 10 al 19 según el último dígito del NIT del contribuyente.',
    codigo: 'Día = 9 + últimoDígitoNIT',
    normativa: 'RND del SIN',
    destacada: false
  },
  {
    icono: '5️⃣',
    titulo: '5 provisiones laborales',
    descripcion: 'Aguinaldo, bono de antigüedad, indemnización, desahucio y segundo aguinaldo condicional.',
    codigo: 'Provisiones = f(antigüedad, salario)',
    normativa: 'LGT + DS 28699 + DS 1802',
    destacada: false
  },
  {
    icono: '6️⃣',
    titulo: 'UFV suspendido desde dic/2020',
    descripcion: 'El ERP no aplica reexpresión por inflación porque está suspendida. Un ERP genérico la aplicaría mal.',
    codigo: 'ajusteUFV = SUSPENDIDO',
    normativa: 'Instrucción CTNAC',
    destacada: false
  }
];

// ────────────────────────────────────────────────────────────────
// ARQUITECTURA POR CAPAS
// ────────────────────────────────────────────────────────────────
const ARQUITECTURA_CAPAS = [
  {
    nombre: 'Capa 5: Cumplimiento',
    descripcion: 'Formularios SIN, LCV, SIAT, Fundempresa',
    color: '#dc2626'
  },
  {
    nombre: 'Capa 4: Estados Financieros',
    descripcion: 'Balance, resultados, flujo, notas, ratios',
    color: '#d97706'
  },
  {
    nombre: 'Capa 3: Motor Contable',
    descripcion: 'Partida doble, libro diario, mayor, balanza',
    color: '#059669'
  },
  {
    nombre: 'Capa 2: Módulos Operativos',
    descripcion: 'Compras, ventas, nómina, costos, impuestos',
    color: '#0284c7'
  },
  {
    nombre: 'Capa 1: Documentos',
    descripcion: 'Facturas, notas, validación NIT/CUF',
    color: '#7c3aed'
  },
  {
    nombre: 'Núcleo',
    descripcion: 'Almacenamiento, utilidades, validadores',
    color: '#1e40af'
  }
];
