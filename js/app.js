// ══════════════════════════════════════════════════════════════
// app.js — ERP Contable Bolivia
// Punto de entrada del sistema + Enrutador SPA artesanal
// ══════════════════════════════════════════════════════════════

/**
 * ERP Contable Bolivia — Prototipo Educativo
 *
 * Este archivo maneja:
 * 1. Arranque del sistema
 * 2. Enrutamiento SPA (Single Page Application) artesanal
 * 3. Carga de vistas sin recargar la página
 *
 * En las siguientes fases se agregarán:
 * - Fase 0.4: Núcleo (almacenamiento, utilidades, validadores)
 * - Fase 0.5: Configuración boliviana
 * - Fase 0.6: Datos de ejemplo
 */

// ──────────────────────────────────────────────────────────────
// CONFIGURACIÓN DEL ENRUTADOR
// ──────────────────────────────────────────────────────────────

/**
 * Mapa de rutas → archivos de vista.
 * Cada ruta corresponde a un archivo HTML en la carpeta /vistas/
 */
const RUTAS = {
  'dashboard': 'vistas/dashboard.html',
  'documentos': 'vistas/documentos.html',
  'compras': 'vistas/compras.html',
  'ventas': 'vistas/ventas.html',
  'inventario': 'vistas/inventario.html',
  'nomina': 'vistas/nomina.html',
  'impuestos': 'vistas/impuestos.html',
  'estados-financieros': 'vistas/estados-financieros.html',
  'cumplimiento': 'vistas/cumplimiento.html',
  'libro-diario': 'vistas/libro-diario.html',
  'libro-mayor': 'vistas/libro-mayor.html',
  'balanza': 'vistas/balanza.html'
};

/**
 * Vista por defecto si no hay ruta o la ruta es inválida.
 */
const VISTA_POR_DEFECTO = 'dashboard';

// ──────────────────────────────────────────────────────────────
// ENRUTADOR SPA ARTESANAL
// ──────────────────────────────────────────────────────────────

/**
 * Obtiene la ruta actual del hash de la URL.
 * Ejemplo: "#/compras" → "compras"
 * @returns {string} La ruta actual
 */
function obtenerRutaActual() {
  const hash = window.location.hash; // "#/compras"
  const ruta = hash.replace('#/', '').replace('#', ''); // "compras"
  return ruta || VISTA_POR_DEFECTO;
}

/**
 * Carga una vista en el área de contenido principal.
 * Usa fetch() para cargar el HTML sin recargar la página.
 * @param {string} ruta - La ruta de la vista a cargar
 */
async function cargarVista(ruta) {
  const contenido = document.getElementById('contenido');

  if (!contenido) {
    console.error('❌ No se encontró el elemento #contenido');
    return;
  }

  // Verificar que la ruta existe
  const archivoVista = RUTAS[ruta];
  if (!archivoVista) {
    console.warn(`⚠️ Ruta "${ruta}" no encontrada. Cargando dashboard.`);
    ruta = VISTA_POR_DEFECTO;
  }

  try {
    // Mostrar indicador de carga
    contenido.innerHTML = '<div class="cargando"><p>Cargando...</p></div>';

    // Cargar el HTML de la vista
    const respuesta = await fetch(RUTAS[ruta]);

    if (!respuesta.ok) {
      throw new Error(`Error al cargar ${RUTAS[ruta]}: ${respuesta.status}`);
    }

    const html = await respuesta.text();
    contenido.innerHTML = html;

    // Actualizar el menú lateral (marcar link activo)
    actualizarMenuActivo(ruta);

    // Log en consola para debugging
    console.log(`📄 Vista cargada: ${ruta}`);

  } catch (error) {
    console.error(`❌ Error al cargar la vista "${ruta}":`, error);
    contenido.innerHTML = `
      <div class="card" style="text-align: center; padding: 2rem;">
        <h3>⚠️ Error al cargar la vista</h3>
        <p>No se pudo cargar "${ruta}".</p>
        <p style="font-size: 0.8rem; color: var(--gris-medio);">
          Si abriste el archivo con doble clic, usa Live Server de VS Code.
        </p>
      </div>
    `;
  }
}

/**
 * Actualiza el menú lateral marcando el link activo.
 * @param {string} ruta - La ruta activa
 */
function actualizarMenuActivo(ruta) {
  // Quitar clase "activo" de todos los links
  const links = document.querySelectorAll('.menu-link');
  links.forEach(link => link.classList.remove('activo'));

  // Agregar clase "activo" al link correspondiente
  const linkActivo = document.querySelector(`.menu-link[data-vista="${ruta}"]`);
  if (linkActivo) {
    linkActivo.classList.add('activo');
  }
}

// ──────────────────────────────────────────────────────────────
// INICIALIZACIÓN DEL SISTEMA
// ──────────────────────────────────────────────────────────────

/**
 * Arranca el ERP: configura listeners y carga la vista inicial.
 */
function iniciarERP() {
  console.log('═══════════════════════════════════════════════════');
  console.log('🇧🇴 ERP Contable Bolivia — Iniciando...');
  console.log('Versión: 0.2.0 (Módulo 0: Fase 0.2)');
  console.log('Stack: Vanilla JS + LocalStorage');
  console.log('Normativa: NC del CTNAC, Ley 843, LGT');
  console.log('═══════════════════════════════════════════════════');

  // Escuchar cambios en el hash (navegación)
  window.addEventListener('hashchange', () => {
    const ruta = obtenerRutaActual();
    cargarVista(ruta);
  });

  // Escuchar clicks en el menú lateral (para navegación)
  const menuLinks = document.querySelectorAll('.menu-link');
  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // No prevenir el comportamiento por defecto (el hash cambia solo)
      // Solo actualizamos el menú activo
      const ruta = link.dataset.vista;
      actualizarMenuActivo(ruta);
    });
  });

  // Cargar la vista inicial
  const rutaInicial = obtenerRutaActual();
  cargarVista(rutaInicial);

  console.log('✅ Sistema iniciado correctamente.');
}

// ──────────────────────────────────────────────────────────────
// ARRANQUE: Esperar a que el DOM esté listo
// ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', iniciarERP);
