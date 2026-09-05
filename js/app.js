// ══════════════════════════════════════════════════════════════
// app.js — ERP Contable Bolivia
// Punto de entrada del sistema
// Conecta: Enrutador + Almacenamiento + Utilidades + Validadores
// ══════════════════════════════════════════════════════════════

/**
 * ERP Contable Bolivia — Prototipo Educativo
 *
 * Este archivo:
 * 1. Instancia los 4 módulos del núcleo.
 * 2. Configura el enrutador con todas las rutas.
 * 3. Expone las funciones al objeto window (para las vistas).
 * 4. Arranca el sistema.
 *
 * Los módulos del núcleo se cargan ANTES que este archivo
 * (mediante <script> tags en index.html).
 */

// ──────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE RUTAS
// ──────────────────────────────────────────────────────────────
const RUTAS_ERP = {
  // Principal
  'dashboard': 'vistas/dashboard.html',

  // Capa 1: Documentos
  'documentos': 'vistas/documentos.html',

  // Capa 2: Módulos Operativos
  'compras': 'vistas/compras.html',
  'ventas': 'vistas/ventas.html',
  'inventario': 'vistas/inventario.html',
  'nomina': 'vistas/nomina.html',
  'impuestos': 'vistas/impuestos.html',

  // Capa 3: Motor Contable
  'libro-diario': 'vistas/libro-diario.html',
  'libro-mayor': 'vistas/libro-mayor.html',
  'balanza': 'vistas/balanza.html',

  // Capa 4: Estados Financieros
  'estados-financieros': 'vistas/estados-financieros.html',

  // Capa 5: Cumplimiento
  'cumplimiento': 'vistas/cumplimiento.html'
};

// ──────────────────────────────────────────────────────────────
// INICIALIZACIÓN DEL SISTEMA
// ──────────────────────────────────────────────────────────────
function iniciarERP() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🇧🇴 ERP Contable Bolivia — Iniciando...');
  console.log('Versión: 0.5.0 (Módulo 0: Fase 0.5)');
  console.log('Stack: Vanilla JS + LocalStorage');
  console.log('Normativa: NC del CTNAC, Ley 843, LGT');
  console.log('═══════════════════════════════════════════════════════');

  // 1. Verificar que BOLIVIA esté cargado
  if (typeof BOLIVIA === 'undefined') {
    console.error('❌ BOLIVIA no está cargado. Verifica js/config/bolivia.js');
    return;
  }

  // 2. Verificar que PLAN_CUENTAS esté cargado
  if (typeof PLAN_CUENTAS === 'undefined') {
    console.error('❌ PLAN_CUENTAS no está cargado. Verifica js/config/plan-cuentas.js');
    return;
  }

  // 3. Instanciar el Almacenamiento
  const almacenamiento = new AlmacenamientoLocal('erp_bolivia');
  console.log('💾 Almacenamiento inicializado (localStorage).');

  // 4. Instanciar el Motor Contable (stub, se completa en Módulo 3)
  const motorContable = new MotorContable();
  console.log('⚙️  Motor Contable inicializado (stub — Módulo 3).');

  // 5. Configurar el Enrutador
  const enrutador = new Enrutador({
    rutas: RUTAS_ERP,
    contenedorId: 'contenido',
    vistaPorDefecto: 'dashboard'
  });

  // 6. Exponer módulos al objeto window (para acceso desde las vistas)
  window.ERP = {
    enrutador,
    almacenamiento,
    motorContable,
    utilidades: Utilidades,
    validadores: Validadores,
    bolivia: BOLIVIA,
    planCuentas: PLAN_CUENTAS,
    planCuentasUtilidades: PlanCuentasUtilidades,
    version: '0.5.0',
    normativa: 'NC del CTNAC, Ley 843, LGT'
  };

  // También exponer individualmente para acceso directo en consola
  window.utilidades = Utilidades;
  window.validadores = Validadores;
  window.almacenamiento = almacenamiento;
  window.motorContable = motorContable;
  window.BOLIVIA = BOLIVIA;
  window.PLAN_CUENTAS = PLAN_CUENTAS;
  window.PlanCuentasUtilidades = PlanCuentasUtilidades;

  // 7. Iniciar el enrutador (carga la vista inicial)
  enrutador.iniciar();

  // 8. Log de estado y comandos disponibles
  console.log('✅ Sistema iniciado correctamente.');
  console.log('');
  console.log('📝 Comandos disponibles en la consola:');
  console.log('   window.BOLIVIA.IVA_PORCENTAJE');
  console.log('   window.BOLIVIA.SMN_VIGENTE');
  console.log('   window.BOLIVIA.calcularFechaVencimiento("123456789-1", "2026-09")');
  console.log('   window.BOLIVIA.obtenerPorcentajeBonoAntiguedad(6)');
  console.log('   window.PlanCuentasUtilidades.obtenerCuenta("1.1.01")');
  console.log('   window.PlanCuentasUtilidades.obtenerTodasLasCuentas()');
  console.log('   window.PlanCuentasUtilidades.obtenerCuentasPorNaturaleza("deudora")');
  console.log('');
}

// ──────────────────────────────────────────────────────────────
// ARRANQUE: Esperar a que el DOM esté listo
// ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', iniciarERP);
