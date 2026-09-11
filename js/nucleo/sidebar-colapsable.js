// ══════════════════════════════════════════════════════════════
// sidebar-colapsable.js — Menú lateral tipo acordeón
// Recuerda el estado de cada grupo en LocalStorage
// ══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  const KEY_ESTADO = 'erp-sidebar-grupos';

  function leerEstado() {
    try {
      return JSON.parse(localStorage.getItem(KEY_ESTADO) || '{}');
    } catch (e) {
      return {};
    }
  }

  function guardarEstado(obj) {
    localStorage.setItem(KEY_ESTADO, JSON.stringify(obj));
  }

  function vistaActual() {
    return (window.location.hash || '#/dashboard').replace('#/', '');
  }

  function inicializarSidebar() {
    const secciones = document.querySelectorAll('#menu-lateral .menu-seccion');
    if (secciones.length === 0) return;

    const estado = leerEstado();
    const activa = vistaActual();

    secciones.forEach(seccion => {
      const grupo = seccion.dataset.grupo;
      const boton = seccion.querySelector('.menu-titulo-btn');
      const tieneActiva = seccion.querySelector(`.menu-link[data-vista="${activa}"]`) !== null;

      // Abierto por defecto; el grupo con la vista activa SIEMPRE abierto
      let abierto = estado[grupo] !== undefined ? estado[grupo] : true;
      if (tieneActiva) abierto = true;

      seccion.classList.toggle('colapsada', !abierto);
      boton.setAttribute('aria-expanded', String(abierto));

      boton.addEventListener('click', () => {
        const colapsada = seccion.classList.toggle('colapsada');
        boton.setAttribute('aria-expanded', String(!colapsada));

        const estadoNuevo = leerEstado();
        estadoNuevo[grupo] = !colapsada;
        guardarEstado(estadoNuevo);
      });
    });

    // Al navegar, expandir automáticamente el grupo de la vista destino
    window.addEventListener('hashchange', () => {
      const vista = vistaActual();
      secciones.forEach(seccion => {
        if (seccion.querySelector(`.menu-link[data-vista="${vista}"]`)) {
          seccion.classList.remove('colapsada');
          seccion.querySelector('.menu-titulo-btn').setAttribute('aria-expanded', 'true');
        }
      });
    });

    // Botones globales
    document.getElementById('btn-expandir-todo')?.addEventListener('click', () => {
      secciones.forEach(s => {
        s.classList.remove('colapsada');
        s.querySelector('.menu-titulo-btn').setAttribute('aria-expanded', 'true');
      });
      guardarEstado({}); // reset: todo abierto por defecto
    });

    document.getElementById('btn-colapsar-todo')?.addEventListener('click', () => {
      const estadoNuevo = {};
      secciones.forEach(s => {
        // No colapsar el grupo con la vista activa
        const tieneActiva = s.querySelector('.menu-link.activo') !== null;
        s.classList.toggle('colapsada', !tieneActiva);
        s.querySelector('.menu-titulo-btn').setAttribute('aria-expanded', String(tieneActiva));
        estadoNuevo[s.dataset.grupo] = tieneActiva;
      });
      guardarEstado(estadoNuevo);
    });

    console.log('🗂️ Sidebar colapsable inicializado (' + secciones.length + ' grupos)');
  }

  document.addEventListener('DOMContentLoaded', inicializarSidebar);
})();
