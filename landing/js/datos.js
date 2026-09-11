// ══════════════════════════════════════════════════════════════
// DATOS.JS — Datos del ERP para renderizar en la landing
// Contextualizado para Trinidad, Beni, Bolivia
// ══════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────
// INFORMACIÓN DEL PROYECTO (Contexto Trinidad-Beni)
// ────────────────────────────────────────────────────────────────
const PROYECTO_INFO = {
  nombre: 'ERP Contable Bolivia',
  version: 'v1.0',
  tipo: 'Prototipo Educativo',
  ubicacion: {
    ciudad: 'Trinidad',
    departamento: 'Beni',
    pais: 'Bolivia',
    codigoPostal: '8001',
    latitud: '-14.8333',
    longitud: '-64.9000'
  },
  empresaEjemplo: {
    nombre: 'Distribuidora Mamoré SRL',
    nit: '123456789-7',
    actividad: 'Comercio al por mayor y menor',
    regimen: 'Régimen General',
    municipio: 'Trinidad',
    departamento: 'Beni'
  },
  normativa: ['Ley 843', 'NC del CTNAC', 'LGT', 'Código de Comercio'],
  stack: ['Vanilla JavaScript', 'LocalStorage', 'HTML5', 'CSS3'],
  anioDesarrollo: 2026
};


// ────────────────────────────────────────────────────────────────
// LOS 8 MÓDULOS (con detalle expandible)
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
    destacado: 'Configuración normativa boliviana centralizada',
    detalle: {
      funcionesClave: [
        'AlmacenamientoLocal: persistencia en localStorage con namespace',
        'Utilidades: formatearBs, generarId, fechas bolivianas',
        'Validadores: NIT, CI, montos, fechas',
        'BOLIVIA.js: IVA 13%, SMN, feriados nacionales'
      ],
      archivos: ['nucleo/almacenamiento.js', 'nucleo/utilidades.js', 'config/bolivia.js'],
      normativa: 'Configuración base Ley 843',
      datoCurioso: 'El NIT de ejemplo usa dígito verificador real de Trinidad-Beni'
    }
  },
  {
    numero: '01',
    nombre: 'Documentos Fuente',
    icono: '📄',
    descripcion: 'Capa 1: registro de facturas, notas de débito/crédito con validación de NIT y CUF según SIAT.',
    tecnologias: ['Capas', 'Validadores'],
    loc: 496,
    fases: 4,
    destacado: 'Validación de NIT con dígito verificador',
    detalle: {
      funcionesClave: [
        'CapaDocumentos: CRUD de documentos fuente',
        'Validación de NIT con algoritmo de dígito verificador',
        'Validación de CUF (Código Único de Factura)',
        'Clasificación automática por tipo de documento'
      ],
      archivos: ['capas/capa1-documentos.js', 'config/tipos-documentos.js'],
      normativa: 'SIAT - Sistema de Facturación en Línea',
      datoCurioso: 'El CUF tiene 77 caracteres y es único por factura en Bolivia'
    }
  },
  {
    numero: '02',
    nombre: 'Compras y Ventas',
    icono: '🛒',
    descripcion: 'Ciclo completo: solicitud → orden → recepción → factura → pago. Inventario con kardex.',
    tecnologias: ['Módulos', 'Kardex'],
    loc: 1382,
    fases: 8,
    destacado: 'Ciclo de compras con cuentas por pagar',
    detalle: {
      funcionesClave: [
        'ModuloCompras: solicitud → orden → recepción → factura → pago',
        'ModuloVentas: cotización → factura → cobro',
        'ModuloInventario: kardex valorado (entradas/salidas/saldos)',
        'Gestión de cuentas por pagar y por cobrar'
      ],
      archivos: ['modulos/compras.js', 'modulos/ventas.js', 'modulos/inventario.js'],
      normativa: 'Código de Comercio de Bolivia',
      datoCurioso: 'El kardex usa el método de promedio ponderado por defecto'
    }
  },
  {
    numero: '03',
    nombre: 'Motor Contable',
    icono: '⚙️',
    descripcion: 'Capa 3: partida doble, libro diario, mayor, balanza y cierre de ejercicio con validaciones.',
    tecnologias: ['Partida doble', 'Plan de cuentas'],
    loc: 905,
    fases: 10,
    destacado: 'Detección automática de errores contables',
    detalle: {
      funcionesClave: [
        'MotorContable: procesar asientos con validación de partida doble',
        'Libro Diario y Libro Mayor dinámicos',
        'Balanza de comprobación con detección de descuadres',
        'Cierre de ejercicio con asiento de resultados'
      ],
      archivos: ['capas/capa3-motor.js', 'config/plan-cuentas.js'],
      normativa: 'NC del CTNAC - Partida doble',
      datoCurioso: 'El plan de cuentas tiene la estructura NC boliviana (no NIIF puras)'
    }
  },
  {
    numero: '04',
    nombre: 'Nómina Boliviana',
    icono: '👥',
    descripcion: 'Aguinaldo, bono de antigüedad, indemnización, desahucio, RC-IVA con facturas y aportes patronales.',
    tecnologias: ['LGT', 'DS 28699', 'DS 22138'],
    loc: 1405,
    fases: 8,
    destacado: 'Las 5 provisiones laborales bolivianas',
    detalle: {
      funcionesClave: [
        'Cálculo de devengados: básico + bono antigüedad + extras',
        'Aguinaldo de Navidad y Segundo Aguinaldo (DS 1802)',
        'Indemnización por tiempo de servicio (DS 28699)',
        'Desahucio por falta de preaviso (DS 22138)',
        'RC-IVA compensable con facturas de empleados'
      ],
      archivos: ['modulos/nomina.js', 'modulos/provisiones.js', 'modulos/liquidaciones.js'],
      normativa: 'LGT + DS 28699 + DS 22138 + DS 1802',
      datoCurioso: 'El bono de antigüedad usa la tabla oficial con SMN vigente'
    }
  },
  {
    numero: '05',
    nombre: 'Impuestos Bolivianos',
    icono: '🧾',
    descripcion: 'IVA, IT, IUE, RC-IVA e IUE-BE. Compensación IT-IUE del Art. 77 y calendario por dígito de NIT.',
    tecnologias: ['Ley 843', 'Formularios SIN'],
    loc: 2024,
    fases: 13,
    destacado: 'Compensación IT-IUE (la joya del módulo)',
    detalle: {
      funcionesClave: [
        'IVA: débito/crédito fiscal con saldo a favor (Form. 200)',
        'IT: 3% sobre ingresos brutos (Form. 400)',
        'IUE: 25% con ajustes fiscales (Form. 500)',
        'Compensación IT-IUE del Art. 77 Ley 843',
        'Calendario tributario por dígito de NIT (10-19)',
        'IUE-BE: beneficiarios del exterior (12.5%)'
      ],
      archivos: ['modulos/impuestos.js', 'config/periodos-fiscales.js'],
      normativa: 'Ley 843 + Ley 2492 (Código Tributario)',
      datoCurioso: 'El IT pagado se compensa con el IUE, pero el exceso SE PIERDE'
    }
  },
  {
    numero: '06',
    nombre: 'Estados Financieros',
    icono: '📊',
    descripcion: 'Balance, resultados, flujo de efectivo, notas (12), comparativos y razones financieras.',
    tecnologias: ['NC CTNAC', 'Ratios'],
    loc: 950,
    fases: 10,
    destacado: '12 notas según NC del CTNAC',
    detalle: {
      funcionesClave: [
        'Balance General con ecuación contable verificada',
        'Estado de Resultados con todos los niveles',
        'Estado de Flujo de Efectivo (directo e indirecto)',
        '12 Notas a los Estados Financieros (NC CTNAC)',
        'Estados comparativos y razones financieras'
      ],
      archivos: ['capas/capa4-estados.js'],
      normativa: 'NC del CTNAC (ajuste UFV suspendido dic/2020)',
      datoCurioso: 'El ERP no aplica reexpresión UFV porque está suspendida'
    }
  },
  {
    numero: '07',
    nombre: 'Cumplimiento SIN',
    icono: '✅',
    descripcion: 'Formularios 200/400/500/110/601/605, LCV, facturación electrónica (CUIS/CUFD/CUF) y Fundempresa.',
    tecnologias: ['SIAT', 'Fundempresa'],
    loc: 2091,
    fases: 12,
    destacado: 'Trazabilidad documento → asiento → estado',
    detalle: {
      funcionesClave: [
        'Formularios SIN: 200, 400, 500, 110, 601, 605',
        'Libro de Compras y Ventas (LCV) en formato SIN',
        'Facturación electrónica: CUIS, CUFD, CUF simulados',
        'Obligaciones ante Fundempresa',
        'Trazabilidad completa: documento → asiento → estado'
      ],
      archivos: ['modulos/modulo-cumplimiento.js', 'modulos/facturacion.js', 'modulos/fundempresa.js'],
      normativa: 'RND del SIN + Ley 2492 + Fundempresa',
      datoCurioso: 'El CUIS vence cada 8 horas y el CUFD cada 24 horas'
    }
  },
  {
    numero: '08',
    nombre: 'Contabilidad de Costos',
    icono: '🏭',
    descripcion: 'FIFO/LIFO/Promedio con comparador visual, centros de costo, órdenes de trabajo y punto de equilibrio.',
    tecnologias: ['NIC 2', 'CVP'],
    loc: 3010,
    fases: 13,
    destacado: 'Comparador de 3 métodos (herramienta didáctica)',
    detalle: {
      funcionesClave: [
        'Inventario por capas: FIFO, LIFO y Promedio Ponderado',
        'Comparador visual de los 3 métodos en vivo',
        'Centros de costo con presupuesto y ejecución',
        'Órdenes de trabajo con MP + MOD + CIF',
        'Punto de equilibrio y análisis CVP',
        'Análisis de margen por producto y cliente'
      ],
      archivos: ['modulos/inventario-capas.js', 'modulos/centros-costo.js', 'modulos/punto-equilibrio.js'],
      normativa: 'NIC 2 (LIFO prohibido) + SIN Bolivia',
      datoCurioso: 'LIFO está implementado solo para enseñar por qué se prohibió'
    }
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
// PARTICULARIDADES BOLIVIANAS (con código real del ERP)
// ────────────────────────────────────────────────────────────────
const PARTICULARIDADES_BOLIVIANAS = [
  {
    icono: '1️⃣',
    titulo: 'IVA incluido en el precio',
    descripcion: 'En Bolivia el IVA está dentro del precio, no se agrega al final como en otros países. El ERP lo extrae automáticamente con la fórmula correcta.',
    normativa: 'Art. 5 Ley 843',
    destacada: false,
    codigo: `// Extraer IVA de un precio con IVA incluido
function extraerIVA(total) {
  const neto = total / 1.13;
  const iva = total - neto;
  return { neto, iva };
}

// Ejemplo: Bs 1,130 con IVA incluido
extraerIVA(1130);
// → { neto: 1000, iva: 130 }`,
    explicacionLarga: 'A diferencia de otros países donde el IVA se suma al precio, en Bolivia el precio ya incluye el 13% de IVA. Por eso para obtener el neto se divide entre 1.13, no se multiplica.'
  },
  {
    icono: '2️⃣',
    titulo: 'Compensación IT-IUE',
    descripcion: 'El IT pagado mensualmente (3%) se descuenta del IUE anual (25%). Pero si el IT es mayor que el IUE, el exceso SE PIERDE — no se devuelve ni se arrastra.',
    normativa: 'Art. 77 Ley 843',
    destacada: true,
    codigo: `// Compensación IT-IUE (Art. 77 Ley 843)
function compensarITcontraIUE(iueDeterminado, itPagado) {
  if (itPagado >= iueDeterminado) {
    // ⚠️ El exceso SE PIERDE (no se devuelve)
    return {
      iuePorPagar: 0,
      excesoPerdido: itPagado - iueDeterminado
    };
  }
  return {
    iuePorPagar: iueDeterminado - itPagado,
    excesoPerdido: 0
  };
}`,
    explicacionLarga: 'Esta es la joya del sistema. Muchas empresas pagan más IT del IUE que deben, y pierden la diferencia sin saberlo. El ERP calcula esto automáticamente y alerta al contador.'
  },
  {
    icono: '3️⃣',
    titulo: 'LIFO prohibido',
    descripcion: 'El método LIFO (Últimas en Entrar, Primeras en Salir) está prohibido por las NIIF desde 2005 y el SIN no lo acepta. Lo implementamos solo para enseñar por qué.',
    normativa: 'NIC 2 + SIN Bolivia',
    destacada: false,
    codigo: `// Métodos de valuación aceptados en Bolivia
const METODOS_ACEPTADOS = ['PROMEDIO', 'FIFO'];

// LIFO: solo con fines educativos
const METODOS_EDUCATIVOS = ['LIFO'];
// ⚠️ NO usar LIFO en declaraciones fiscales

// El comparador muestra los 3 lado a lado
// para entender por qué se prohibió LIFO`,
    explicacionLarga: 'En entornos inflacionarios, LIFO reduce artificialmente la utilidad (y por tanto el IUE). Por eso las NIIF lo prohibieron en 2005. El ERP lo incluye solo como herramienta didáctica.'
  },
  {
    icono: '4️⃣',
    titulo: 'Calendario por dígito de NIT',
    descripcion: 'Los vencimientos tributarios no son el mismo día para todos. Van del 10 al 19 del mes siguiente, según el último dígito del NIT del contribuyente.',
    normativa: 'RND del SIN',
    destacada: false,
    codigo: `// Vencimiento según último dígito del NIT
function calcularDiaVencimiento(nit) {
  const ultimoDigito = parseInt(nit.slice(-1));
  // Dígito 1→día 10, 2→día 11, ..., 9→día 18
  // Dígito 0→día 19
  return ultimoDigito === 0 ? 19 : 9 + ultimoDigito;
}

// Ejemplo: NIT 123456789-1
calcularDiaVencimiento('123456789-1');
// → 10 (vence el día 10 del mes siguiente)`,
    explicacionLarga: 'Este sistema escalona los vencimientos para evitar que todos los contribuyentes declaren el mismo día y colapsen las oficinas del SIN.'
  },
  {
    icono: '5️⃣',
    titulo: '5 provisiones laborales',
    descripcion: 'La nómina boliviana exige provisionar aguinaldo, segundo aguinaldo (condicional), bono de antigüedad, indemnización y desahucio. El ERP las calcula todas.',
    normativa: 'LGT + DS 28699 + DS 1802',
    destacada: false,
    codigo: `// Las 5 provisiones laborales bolivianas
const PROVISIONES_LABORALES = {
  aguinaldo:        'Aguinaldo de Navidad (LGT)',
  segundoAguinaldo: 'Segundo Aguinaldo (DS 1802)',
  bonoAntiguedad:   'Bono de Antigüedad (tabla SMN)',
  indemnizacion:    'Indemnización (DS 28699)',
  desahucio:        'Desahucio (DS 22138)'
};
// El segundo aguinaldo solo si PIB > 4.5%`,
    explicacionLarga: 'El segundo aguinaldo es condicional: solo se paga si el crecimiento del PIB supera el 4.5%. El ERP permite activarlo/desactivarlo según el anuncio del INE.'
  },
  {
    icono: '6️⃣',
    titulo: 'UFV: Conflicto Contable vs Tributario',
    descripcion: 'El CTNAC suspendió el ajuste por inflación desde dic/2020, pero el SIN sigue exigiéndolo para el IUE. Un ERP genérico no entiende esta dualidad.',
    normativa: 'Res. CTNAC 03/2020 vs DS AITB',
    destacada: true,  // ← Ahora es joya porque es más complejo
    codigo: `// El dilema de la UFV en Bolivia (2026)
const ESCENARIO_UFV = {
  // Res. CTNAC 03/2020: suspendido desde 10/12/2020
  contable: {
    reexpresarEstados: false,
    ultimaUFV: '2020-12-10',
    normativa: 'CTNAC'
  },

  // SIN sigue exigiéndolo para IUE
  tributario: {
    reexpresarEstados: true,  // ¡Para el Form. 500!
    ajustePorInflacion: true,
    normativa: 'SIN - DS AITB'
  },

  // ⚠️ Conflicto vigente en 2026
  conflicto: 'CTNAC vs SIN no resuelto'
};

// El ERP maneja AMBOS escenarios
// para no generar problemas al contador`,
    explicacionLarga: 'Esta es una de las particularidades más complejas de la contabilidad boliviana actual. El CTNAC (auditores) suspendió la reexpresión en dic/2020, pero el SIN (impuestos) sigue exigiendo el AITB para calcular el IUE. Los contadores bolivianos viven esta dualidad diariamente. Un ERP genérico aplicaría la NC3 automáticamente y generaría problemas tributarios, o no la aplicaría y tendría problemas contables. Este ERP maneja ambos escenarios por separado.'
  },
  {
    icono: '7️⃣',
    titulo: 'Conciliación del IVA (Débito vs Crédito)',
    descripcion: 'Cada mes se concilia el IVA de ventas (débito) contra el IVA de compras (crédito). Si el crédito es mayor, se genera saldo a favor que se arrastra al mes siguiente.',
    normativa: 'Form. 200 + Art. 8 Ley 843',
    destacada: false,
    codigo: `// Conciliación mensual de IVA (Formulario 200)
function conciliarIVA(ivaDebito, ivaCredito, saldoFavorAnterior) {
  const ivaPorPagar = ivaDebito - ivaCredito - saldoFavorAnterior;

  if (ivaPorPagar > 0) {
    // Hay que pagar al SIN
    return {
      ivaPorPagar: ivaPorPagar,
      nuevoSaldoFavor: 0
    };
  } else {
    // Saldo a favor: se arrastra al próximo mes
    return {
      ivaPorPagar: 0,
      nuevoSaldoFavor: Math.abs(ivaPorPagar)
    };
  }
}

// Ejemplo: ventas Bs 1,130, compras Bs 565
conciliarIVA(130, 65, 0);
// → { ivaPorPagar: 65, nuevoSaldoFavor: 0 }`,
    explicacionLarga: 'El Formulario 200 del SIN se presenta mensualmente. El ERP concilia automáticamente el débito de ventas contra el crédito de compras validadas con NIT y CUF válidos. Si una factura no cumple requisitos, el SIN puede desconocer el crédito fiscal.'
  }
];


