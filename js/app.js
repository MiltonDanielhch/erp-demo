// ══════════════════════════════════════════════════════════════
// app.js — ERP Contable Bolivia
// Punto de entrada del sistema
// Conecta: Enrutador + Almacenamiento + Utilidades + Validadores
//          + Capa 1 (Documentos) + Configuración boliviana
// ══════════════════════════════════════════════════════════════

/**
 * ERP Contable Bolivia — Prototipo Educativo
 *
 * Este archivo:
 * 1. Verifica que todas las dependencias estén cargadas.
 * 2. Instancia los módulos del núcleo y las capas.
 * 3. Configura el enrutador con todas las rutas.
 * 4. Expone las funciones al objeto window (para las vistas).
 * 5. Arranca el sistema.
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
  console.log('Versión: 0.8.0 (Módulo 1: Fase 1.3)');
  console.log('Stack: Vanilla JS + LocalStorage');
  console.log('Normativa: NC del CTNAC, Ley 843, LGT');
  console.log('═══════════════════════════════════════════════════════');

  // ── 1. Verificar dependencias críticas ──────────────────────
  if (typeof BOLIVIA === 'undefined') {
    console.error('❌ BOLIVIA no está cargado. Verifica js/config/bolivia.js');
    return;
  }

  if (typeof PLAN_CUENTAS === 'undefined') {
    console.error('❌ PLAN_CUENTAS no está cargado. Verifica js/config/plan-cuentas.js');
    return;
  }

  if (typeof TIPOS_DOCUMENTO === 'undefined') {
    console.error('❌ TIPOS_DOCUMENTO no está cargado. Verifica js/config/tipos-documentos.js');
    return;
  }

  if (typeof CAMPOS_DOCUMENTO === 'undefined') {
    console.error('❌ CAMPOS_DOCUMENTO no está cargado. Verifica js/config/campos-documentos.js');
    return;
  }

  // ── 2. Instanciar módulos del núcleo ────────────────────────
  const almacenamiento = new AlmacenamientoLocal('erp_bolivia');
  console.log('💾 Almacenamiento inicializado (localStorage).');

  // ── 3. Instanciar capas ─────────────────────────────────────

  // Capa 1: Documentos Fuente (Fase 1.3)
  // Se le pasa 'almacenamiento' como dependencia (inyección)
  const capaDocumentos = new CapaDocumentos(almacenamiento);
  console.log('📄 Capa 1 (Documentos Fuente) inicializada.');

  // Capa 3: Motor Contable (stub, se completa en Módulo 3)
  const motorContable = new MotorContable();
  console.log('⚙️  Motor Contable inicializado (stub — Módulo 3).');

  // ── 4. Configurar el Enrutador ──────────────────────────────
  const enrutador = new Enrutador({
    rutas: RUTAS_ERP,
    contenedorId: 'contenido',
    vistaPorDefecto: 'dashboard'
  });

  // ── 5. Exponer módulos al objeto window ─────────────────────
  // Objeto principal ERP (para acceso estructurado)
  window.ERP = {
    enrutador,
    almacenamiento,
    motorContable,
    capaDocumentos,
    utilidades: Utilidades,
    validadores: Validadores,
    bolivia: BOLIVIA,
    planCuentas: PLAN_CUENTAS,
    planCuentasUtilidades: PlanCuentasUtilidades,
    tiposDocumento: TIPOS_DOCUMENTO,
    estadosDocumento: ESTADOS_DOCUMENTO,
    tiposDocumentoUtilidades: TiposDocumentoUtilidades,
    camposDocumento: CAMPOS_DOCUMENTO,
    camposDocumentoUtilidades: CamposDocumentoUtilidades,
    version: '0.8.0',
    normativa: 'NC del CTNAC, Ley 843, LGT'
  };

  // Acceso directo en consola (atajos para desarrollo)
  window.utilidades = Utilidades;
  window.validadores = Validadores;
  window.almacenamiento = almacenamiento;
  window.motorContable = motorContable;
  window.capaDocumentos = capaDocumentos;  // ← NUEVO Fase 1.3
  window.BOLIVIA = BOLIVIA;
  window.PLAN_CUENTAS = PLAN_CUENTAS;
  window.PlanCuentasUtilidades = PlanCuentasUtilidades;
  window.TIPOS_DOCUMENTO = TIPOS_DOCUMENTO;
  window.ESTADOS_DOCUMENTO = ESTADOS_DOCUMENTO;
  window.TiposDocumentoUtilidades = TiposDocumentoUtilidades;
  window.CAMPOS_DOCUMENTO = CAMPOS_DOCUMENTO;
  window.CamposDocumentoUtilidades = CamposDocumentoUtilidades;

  // ── 6. Iniciar el enrutador (carga la vista inicial) ────────
  enrutador.iniciar();

  // ── 7. Log de estado y comandos disponibles ─────────────────
  console.log('✅ Sistema iniciado correctamente.');
  console.log('');
  console.log('📝 Comandos disponibles en la consola:');
  console.log('');
  console.log('   📌 CONFIGURACIÓN BOLIVIANA:');
  console.log('   window.BOLIVIA.IVA_PORCENTAJE');
  console.log('   window.BOLIVIA.SMN_VIGENTE');
  console.log('   window.BOLIVIA.calcularFechaVencimiento("123456789-1", "2026-09")');
  console.log('   window.BOLIVIA.obtenerPorcentajeBonoAntiguedad(6)');
  console.log('');
  console.log('   📌 PLAN DE CUENTAS:');
  console.log('   window.PlanCuentasUtilidades.obtenerCuenta("1.1.01")');
  console.log('   window.PlanCuentasUtilidades.obtenerTodasLasCuentas()');
  console.log('   window.PlanCuentasUtilidades.obtenerCuentasPorNaturaleza("deudora")');
  console.log('');
  console.log('   📌 DOCUMENTOS (Capa 1):');
  console.log('   window.TiposDocumentoUtilidades.listarTipos()');
  console.log('   window.CamposDocumentoUtilidades.obtenerCamposRequeridos("FACTURA_COMPRA")');
  console.log('   window.capaDocumentos.obtenerDocumentos()');
  console.log('   window.capaDocumentos.registrarDocumento({...})');
  console.log('   window.capaDocumentos.contarDocumentos()');
  console.log('');
}

// ──────────────────────────────────────────────────────────────
// ARRANQUE: Esperar a que el DOM esté listo
// ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', iniciarERP);
