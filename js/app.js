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
  console.log('Versión: 0.4.0 (Módulo 0: Fase 0.4)');
  console.log('Stack: Vanilla JS + LocalStorage');
  console.log('Normativa: NC del CTNAC, Ley 843, LGT');
  console.log('═══════════════════════════════════════════════════════');

  // 1. Instanciar el Almacenamiento
  const almacenamiento = new AlmacenamientoLocal('erp_bolivia');
  console.log('💾 Almacenamiento inicializado (localStorage).');

  // 2. Configurar el Enrutador
  const enrutador = new Enrutador({
    rutas: RUTAS_ERP,
    contenedorId: 'contenido',
    vistaPorDefecto: 'dashboard'
  });

  // 3. Exponer módulos al objeto window (para acceso desde las vistas)
  window.ERP = {
    enrutador,
    almacenamiento,
    utilidades: Utilidades,
    validadores: Validadores,
    version: '0.4.0',
    normativa: 'NC del CTNAC, Ley 843, LGT'
  };

  // También exponer individualmente para acceso directo en consola
  window.utilidades = Utilidades;
  window.validadores = Validadores;
  window.almacenamiento = almacenamiento;

  // 4. Iniciar el enrutador (carga la vista inicial)
  enrutador.iniciar();

  // 5. Log de estado
  console.log('✅ Sistema iniciado correctamente.');
  console.log('');
  console.log('📝 Comandos disponibles en la consola:');
  console.log('   window.utilidades.formatearBs(1234.5)');
  console.log('   window.validadores.validarNIT("123456789-1")');
  console.log('   window.almacenamiento.obtener("clientes")');
  console.log('   window.ERP.enrutador.navegarA("compras")');
  console.log('');
}

// ──────────────────────────────────────────────────────────────
// ARRANQUE: Esperar a que el DOM esté listo
// ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', iniciarERP);
