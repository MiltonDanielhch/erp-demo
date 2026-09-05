// ══════════════════════════════════════════════════════════════
// app.js — ERP Contable Bolivia
// Punto de entrada del sistema
// ══════════════════════════════════════════════════════════════

/**
 * Inicialización del ERP Contable Bolivia.
 * Este archivo arranca el sistema y conecta todos los módulos.
 *
 * En las siguientes fases se irán agregando:
 * - Fase 0.4: Importación del núcleo (enrutador, almacenamiento, etc.)
 * - Fase 0.5: Importación de la configuración boliviana
 * - Fase 0.6: Carga de datos de ejemplo
 */

// ──────────────────────────────────────────────────────────────
// ARRANQUE DEL SISTEMA
// ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  console.log('🇧🇴 ERP Contable Bolivia — Iniciando...');
  console.log('Versión: 0.1.0 (Módulo 0: Setup)');
  console.log('Stack: Vanilla JS + LocalStorage');
  console.log('Normativa: NC del CTNAC, Ley 843, LGT');

  // Mostrar mensaje en el contenido
  const contenido = document.getElementById('contenido');
  if (contenido) {
    console.log('✅ DOM cargado correctamente.');
  }

  console.log('✅ Sistema iniciado. Esperando módulos...');
});
