// ══════════════════════════════════════════════════════════════
// LANDING.JS — Lógica principal de la landing page
// ══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Landing ERP Contable Bolivia inicializada');

  inicializarThemeToggle();
  inicializarAnimacionesReveal();
  inicializarContadoresAnimados();
  renderizarModulos();
  renderizarGuias();
  renderizarParticularidades();
  renderizarArquitectura();
  inicializarNavbarScroll();
});

// ────────────────────────────────────────────────────────────────
// THEME TOGGLE (Modo claro/oscuro)
// ────────────────────────────────────────────────────────────────
function inicializarThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');
  const html = document.documentElement;

  // Cargar tema guardado
  const temaGuardado = localStorage.getItem('landing-theme') || 'light';
  html.setAttribute('data-theme', temaGuardado);
  icon.textContent = temaGuardado === 'dark' ? '☀️' : '🌙';

  toggle?.addEventListener('click', () => {
    const temaActual = html.getAttribute('data-theme');
    const nuevoTema = temaActual === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', nuevoTema);
    localStorage.setItem('landing-theme', nuevoTema);
    icon.textContent = nuevoTema === 'dark' ? '☀️' : '🌙';
  });
}

// ────────────────────────────────────────────────────────────────
// ANIMACIONES REVEAL-ON-SCROLL
// ────────────────────────────────────────────────────────────────
function inicializarAnimacionesReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ────────────────────────────────────────────────────────────────
// CONTADORES ANIMADOS (Métricas del hero)
// ────────────────────────────────────────────────────────────────
function inicializarContadoresAnimados() {
  const contadores = document.querySelectorAll('.metrica-valor[data-target]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('animado')) {
        entry.target.classList.add('animado');
        animarContador(entry.target);
      }
    });
  }, { threshold: 0.5 });

  contadores.forEach(c => observer.observe(c));
}

function animarContador(elemento) {
  const target = parseInt(elemento.dataset.target);
  const duracion = 1500;
  const inicio = performance.now();

  function actualizar(ahora) {
    const progreso = Math.min((ahora - inicio) / duracion, 1);
    const eased = 1 - Math.pow(1 - progreso, 3); // ease-out cubic
    const valor = Math.floor(eased * target);

    elemento.textContent = valor.toLocaleString('es-BO');

    if (progreso < 1) {
      requestAnimationFrame(actualizar);
    } else {
      elemento.textContent = target.toLocaleString('es-BO');
    }
  }

  requestAnimationFrame(actualizar);
}

// ────────────────────────────────────────────────────────────────
// RENDERIZAR MÓDULOS (Fase 3)
// ────────────────────────────────────────────────────────────────
function renderizarModulos() {
  const grid = document.getElementById('modulos-grid');
  if (!grid || typeof MODULOS_ERP === 'undefined') return;

  grid.innerHTML = MODULOS_ERP.map((modulo, i) => `
    <div class="card modulo-card reveal reveal-delay-${(i % 3) + 1}">
      <div class="flex justify-between items-start mb-sm">
        <span class="modulo-numero">Módulo ${modulo.numero}</span>
        <span class="badge badge-exito">✅ Completo</span>
      </div>

      <div class="card-icono">${modulo.icono}</div>
      <h3 class="card-titulo">${modulo.nombre}</h3>
      <p class="card-descripcion">${modulo.descripcion}</p>

      <div class="flex flex-wrap gap-xs mb-sm">
        ${modulo.tecnologias.map(t => `<span class="badge badge-neutral">${t}</span>`).join('')}
      </div>

      <p style="font-size: var(--texto-xs); color: var(--color-secundario); font-style: italic;">
        💡 ${modulo.destacado}
      </p>

      <div class="modulo-stats">
        <span>📝 ${modulo.loc.toLocaleString()} LoC</span>
        <span>📋 ${modulo.fases} fases</span>
      </div>
    </div>
  `).join('');

  // Re-observar los nuevos elementos reveal
  inicializarAnimacionesReveal();
}

// ────────────────────────────────────────────────────────────────
// RENDERIZAR GUÍAS DE APRENDIZAJE (Fase 4)
// ────────────────────────────────────────────────────────────────
function renderizarGuias() {
  const contenedor = document.getElementById('guias-contenido');
  if (!contenedor || typeof GUIAS_APRENDIZAJE === 'undefined') return;

  const grupoHTML = (titulo, guias) => `
    <div class="mb-lg">
      <h3 style="margin-bottom: var(--espacio-sm);">${titulo}</h3>
      <div class="grid grid-2 gap-sm">
        ${guias.map(guia => `
          <a href="https://github.com/tu-usuario/erp-contable-bo/blob/main/docs/aprendizaje/${guia.numero}-${guia.titulo.toLowerCase().replace(/\s+/g, '-')}.md"
             class="card ${guia.destacada ? 'card-destacada' : ''}"
             style="text-decoration: none; color: inherit;"
             target="_blank">
            <div class="flex justify-between items-start">
              <span class="badge ${guia.destacada ? 'badge-secundario' : 'badge-neutral'}">
                ${guia.destacada ? '⭐ ' : ''}Guía ${guia.numero}
              </span>
            </div>
            <h4 style="margin: var(--espacio-xs) 0 var(--espacio-2xs);">${guia.titulo}</h4>
            <p style="font-size: var(--texto-sm); margin: 0;">${guia.descripcion}</p>
          </a>
        `).join('')}
      </div>
    </div>
  `;

  contenedor.innerHTML =
    grupoHTML('📘 Fundamentos (Guías 01-10)', GUIAS_APRENDIZAJE.fundamentos) +
    grupoHTML('🇧🇴 Normativa Boliviana (Guías 11-19)', GUIAS_APRENDIZAJE.normativa);
}

// ────────────────────────────────────────────────────────────────
// RENDERIZAR PARTICULARIDADES BOLIVIANAS (Fase 5)
// ────────────────────────────────────────────────────────────────
function renderizarParticularidades() {
  const grid = document.getElementById('particularidades-grid');
  if (!grid || typeof PARTICULARIDADES_BOLIVIANAS === 'undefined') return;

  grid.innerHTML = PARTICULARIDADES_BOLIVIANAS.map((p, i) => `
    <div class="card particularidad-card ${p.destacada ? 'destacada' : ''} reveal reveal-delay-${(i % 2) + 1}">
      <div class="flex items-center gap-sm mb-sm">
        <span style="font-size: var(--texto-2xl);">${p.icono}</span>
        <h3 style="margin: 0; font-size: var(--text-lg, var(--texto-lg));">${p.titulo}</h3>
      </div>

      <p style="margin-bottom: var(--espacio-sm);">${p.descripcion}</p>

      <div class="snippet particularidad-codigo">
        <div class="snippet-header">
          <span class="snippet-titulo">${p.normativa}</span>
        </div>
        <pre><code>${p.codigo}</code></pre>
      </div>

      ${p.destacada ? '<span class="badge badge-primario">💎 La joya del sistema</span>' : ''}
    </div>
  `).join('');

  inicializarAnimacionesReveal();
}

// ────────────────────────────────────────────────────────────────
// RENDERIZAR ARQUITECTURA (Fase 7)
// ────────────────────────────────────────────────────────────────
function renderizarArquitectura() {
  const contenedor = document.getElementById('arquitectura-capas');
  if (!contenedor || typeof ARQUITECTURA_CAPAS === 'undefined') return;

  contenedor.innerHTML = ARQUITECTURA_CAPAS.map(capa => `
    <div class="capa" style="border-left: 4px solid ${capa.color};">
      <div class="capa-nombre" style="color: ${capa.color};">${capa.nombre}</div>
      <div class="capa-descripcion">${capa.descripcion}</div>
    </div>
  `).join('');
}

// ────────────────────────────────────────────────────────────────
// NAVBAR CON SCROLL (indicador de sección activa)
// ────────────────────────────────────────────────────────────────
function inicializarNavbarScroll() {
  const secciones = document.querySelectorAll('section[id]');
  const enlaces = document.querySelectorAll('.navbar-enlace');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        enlaces.forEach(enlace => {
          enlace.classList.toggle('activo', enlace.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.3 });

  secciones.forEach(s => observer.observe(s));
}
