// ══════════════════════════════════════════════════════════════
// LANDING.JS — Lógica principal de la landing page
// ══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Landing ERP Contable Bolivia inicializada');

  inicializarThemeToggle();
  inicializarAnimacionesReveal();
  renderizarModulos();
  renderizarGuias();
  renderizarParticularidades();
  renderizarUbicacionFooter();
  inicializarNavbarScroll();
  inicializarMenuMovil();
  inicializarBarraProgreso();
  inicializarImagenesLazy();
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
// RENDERIZAR MÓDULOS (Fase 3 - Versión con expansión)
// ────────────────────────────────────────────────────────────────
function renderizarModulos() {
  const grid = document.getElementById('modulos-grid');
  if (!grid || typeof MODULOS_ERP === 'undefined') return;

  grid.innerHTML = MODULOS_ERP.map((modulo, i) => `
    <div class="card modulo-card reveal reveal-delay-${(i % 3) + 1}"
         data-modulo="${modulo.numero}"
         tabindex="0"
         role="button"
         aria-expanded="false"
         aria-label="Módulo ${modulo.numero}: ${modulo.nombre}. Click para ver detalles.">

      <!-- Header: número + estado -->
      <div class="flex justify-between items-start mb-sm">
        <span class="modulo-numero">Módulo ${modulo.numero}</span>
        <span class="badge badge-exito">✅ Completo</span>
      </div>

      <!-- Icono + nombre -->
      <div class="card-icono">${modulo.icono}</div>
      <h3 class="card-titulo">${modulo.nombre}</h3>

      <!-- Descripción -->
      <p class="card-descripcion">${modulo.descripcion}</p>

      <!-- Badges de tecnología -->
      <div class="flex flex-wrap gap-xs mb-sm">
        ${modulo.tecnologias.map(t => `<span class="badge badge-neutral">${t}</span>`).join('')}
      </div>

      <!-- Línea destacada -->
      <p class="modulo-destacado">
        💡 ${modulo.destacado}
      </p>

      <!-- Stats -->
      <div class="modulo-stats">
        <span>📝 ${modulo.loc.toLocaleString('es-BO')} LoC</span>
        <span>📋 ${modulo.fases} fases</span>
        <span class="modulo-expandir-hint">▼ Ver más</span>
      </div>

      <!-- Detalle expandible (oculto por defecto) -->
      <div class="modulo-detalle" aria-hidden="true">
        <div class="modulo-detalle-seccion">
          <h5 class="modulo-detalle-titulo">⚡ Funciones clave</h5>
          <ul class="modulo-detalle-lista">
            ${modulo.detalle.funcionesClave.map(f => `<li>${f}</li>`).join('')}
          </ul>
        </div>

        <div class="modulo-detalle-seccion">
          <h5 class="modulo-detalle-titulo">📁 Archivos principales</h5>
          <div class="flex flex-wrap gap-xs">
            ${modulo.detalle.archivos.map(a => `<code class="modulo-archivo">${a}</code>`).join('')}
          </div>
        </div>

        <div class="modulo-detalle-seccion">
          <h5 class="modulo-detalle-titulo">⚖️ Normativa</h5>
          <p class="modulo-detalle-normativa">${modulo.detalle.normativa}</p>
        </div>

        <div class="modulo-dato-curioso">
          <span class="badge badge-secundario">🎯 Dato curioso</span>
          <p>${modulo.detalle.datoCurioso}</p>
        </div>
      </div>
    </div>
  `).join('');

  // Conectar eventos de expansión
  conectarExpansionModulos();

  // Re-observar los nuevos elementos reveal
  inicializarAnimacionesReveal();
}

// ────────────────────────────────────────────────────────────────
// EXPANSIÓN DE CARDS DE MÓDULOS
// ────────────────────────────────────────────────────────────────
function conectarExpansionModulos() {
  const cards = document.querySelectorAll('.modulo-card');

  cards.forEach(card => {
    // Click para expandir/colapsar
    card.addEventListener('click', () => toggleModuloDetalle(card));

    // Teclado: Enter o Space para expandir (accesibilidad)
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleModuloDetalle(card);
      }
    });
  });
}

function toggleModuloDetalle(card) {
  const detalle = card.querySelector('.modulo-detalle');
  const hint = card.querySelector('.modulo-expandir-hint');
  const estaExpandido = card.classList.contains('expandida');

  // Colapsar todas las demás cards primero (solo una expandida a la vez)
  document.querySelectorAll('.modulo-card.expandida').forEach(otraCard => {
    if (otraCard !== card) {
      otraCard.classList.remove('expandida');
      otraCard.setAttribute('aria-expanded', 'false');
      otraCard.querySelector('.modulo-detalle').setAttribute('aria-hidden', 'true');
      otraCard.querySelector('.modulo-expandir-hint').textContent = '▼ Ver más';
    }
  });

  // Toggle de la card actual
  if (estaExpandido) {
    card.classList.remove('expandida');
    card.setAttribute('aria-expanded', 'false');
    detalle.setAttribute('aria-hidden', 'true');
    hint.textContent = '▼ Ver más';
  } else {
    card.classList.add('expandida');
    card.setAttribute('aria-expanded', 'true');
    detalle.setAttribute('aria-hidden', 'false');
    hint.textContent = '▲ Ver menos';
  }
}

// ────────────────────────────────────────────────────────────────
// RENDERIZAR GUÍAS DE APRENDIZAJE (Fase 4 - Versión con buscador)
// ────────────────────────────────────────────────────────────────
function renderizarGuias() {
  const contenedor = document.getElementById('guias-contenido');
  if (!contenedor || typeof GUIAS_APRENDIZAJE === 'undefined') return;

  // Contar guías totales y destacadas
  const todasLasGuias = [
    ...GUIAS_APRENDIZAJE.fundamentos,
    ...GUIAS_APRENDIZAJE.normativa,
    ...GUIAS_APRENDIZAJE.costos
  ];
  const guiasDestacadas = todasLasGuias.filter(g => g.destacada).length;

  // Header con contadores y buscador
  const headerHTML = `
    <div class="aprendizaje-header">
      <div class="aprendizaje-stats">
        <div class="aprendizaje-stat">
          <span class="aprendizaje-stat-valor">${todasLasGuias.length}</span>
          <span class="aprendizaje-stat-label">Guías totales</span>
        </div>
        <div class="aprendizaje-stat">
          <span class="aprendizaje-stat-valor">${guiasDestacadas}</span>
          <span class="aprendizaje-stat-label">⭐ Imprescindibles</span>
        </div>
        <div class="aprendizaje-stat">
          <span class="aprendizaje-stat-valor">3</span>
          <span class="aprendizaje-stat-label">Categorías</span>
        </div>
      </div>

      <div class="aprendizaje-buscador">
        <input type="text"
               id="buscador-guias"
               class="input-busqueda"
               placeholder="🔍 Buscar guía (ej: IVA, nómina, partida doble...)"
               aria-label="Buscar guía de aprendizaje">
      </div>
    </div>

    <div id="guias-resultados-busqueda" class="oculto"></div>
    <div id="guias-listado-completo">
      ${renderizarGrupoGuias('📘 Fundamentos (Guías 01-10)', GUIAS_APRENDIZAJE.fundamentos)}
      ${renderizarGrupoGuias('🇧🇴 Normativa Boliviana (Guías 11-26)', GUIAS_APRENDIZAJE.normativa)}
      ${renderizarGrupoGuias('🏭 Costos y Caso Integral (Guías 27-30)', GUIAS_APRENDIZAJE.costos)}
    </div>
  `;

  contenedor.innerHTML = headerHTML;

  // Conectar el buscador
  conectarBuscadorGuias();
}

// Renderiza un grupo de guías (Fundamentos o Normativa)
function renderizarGrupoGuias(titulo, guias) {
  return `
    <div class="aprendizaje-grupo">
      <h3 class="aprendizaje-grupo-titulo">${titulo}</h3>
      <div class="guias-grid">
        ${guias.map(guia => renderizarGuiaCard(guia)).join('')}
      </div>
    </div>
  `;
}

// ────────────────────────────────────────────────────────────────
// MAPA: número de guía → nombre REAL del archivo .md
// (Los slugs generados desde el título NO coinciden con los
//  nombres reales; esa era la causa de los 404)
// ────────────────────────────────────────────────────────────────
const ARCHIVOS_GUIAS = {
  '01': '01-documentos-fuente',
  '02': '02-tipos-documentos-tabla',
  '03': '03-modelo-datos-documentos',
  '04': '04-ciclo-compra-venta',
  '05': '05-iva-boliviano-explicado',
  '06': '06-funciones-iva-it',
  '07': '07-partida-doble-explicada',
  '08': '08-ciclo-contable-pasos',
  '09': '09-cuentas-naturaleza',
  '10': '10-estructura-asiento',
  '11': '11-provisiones-bolivianas',
  '12': '12-cierre-ejercicio',
  '13': '13-nomina-boliviana-explicada',
  '14': '14-particularidades-bolivianas',
  '15': '15-bono-antiguedad-explicado',
  '16': '16-indemnizacion-boliviana',
  '17': '17-impuestos-bolivianos-explicados',
  '18': '18-calendario-tributario',
  '19': '19-compensacion-it-iue',
  '20': '20-compensacion-it-iue-ejemplos',
  '21': '21-estados-financieros-explicados',
  '22': '22-normas-contables-bolivianas',
  '23': '23-ufv-inflacion-suspendida',
  '24': '24-cumplimiento-sin-explicado',
  '25': '25-formularios-sin-detallados',
  '26': '26-consecuencias-incumplimiento',
  '27': '27-contabilidad-costos-explicada',
  '28': '28-metodos-valuacion-inventarios',
  '29': '29-centros-de-costos',
  '30': '30-caso-integral-un-mes'
};

// Renderiza una card individual de guía
function renderizarGuiaCard(guia) {
  const numero = String(guia.numero).padStart(2, '0');
  const archivo = ARCHIVOS_GUIAS[numero] || numero;
  const url = `docs/aprendizaje/leer.html?g=${archivo}`;

  return `
    <a href="${url}"
       class="guia-card ${guia.destacada ? 'guia-destacada' : ''}"
       data-guia="${guia.numero}"
       data-titulo="${guia.titulo.toLowerCase()}"
       data-descripcion="${guia.descripcion.toLowerCase()}">

      <div class="guia-card-header">
        <span class="guia-numero">Guía ${guia.numero}</span>
        ${guia.destacada ? '<span class="badge badge-secundario">⭐ Imprescindible</span>' : ''}
      </div>

      <h4 class="guia-titulo">${guia.titulo}</h4>
      <p class="guia-descripcion">${guia.descripcion}</p>

      <div class="guia-card-footer">
        <span class="guia-leer">Leer guía →</span>
      </div>
    </a>
  `;
}

// ────────────────────────────────────────────────────────────────
// BUSCADOR DE GUÍAS
// ────────────────────────────────────────────────────────────────
function conectarBuscadorGuias() {
  const buscador = document.getElementById('buscador-guias');
  const resultados = document.getElementById('guias-resultados-busqueda');
  const listadoCompleto = document.getElementById('guias-listado-completo');

  if (!buscador) return;

  buscador.addEventListener('input', (e) => {
    const termino = e.target.value.toLowerCase().trim();

    // Si no hay término, mostrar listado completo
    if (termino.length === 0) {
      resultados.classList.add('oculto');
      listadoCompleto.classList.remove('oculto');
      return;
    }

    // Filtrar guías de las 3 categorías
    const todasLasGuias = [
      ...GUIAS_APRENDIZAJE.fundamentos.map(g => ({ ...g, categoria: 'Fundamentos' })),
      ...GUIAS_APRENDIZAJE.normativa.map(g => ({ ...g, categoria: 'Normativa' })),
      ...GUIAS_APRENDIZAJE.costos.map(g => ({ ...g, categoria: 'Costos' }))
    ];

    const guiasFiltradas = todasLasGuias.filter(guia =>
      guia.titulo.toLowerCase().includes(termino) ||
      guia.descripcion.toLowerCase().includes(termino) ||
      guia.numero.includes(termino)
    );

    // Mostrar resultados
    listadoCompleto.classList.add('oculto');
    resultados.classList.remove('oculto');

    if (guiasFiltradas.length === 0) {
      resultados.innerHTML = `
        <div class="busqueda-vacia">
          <p>🔍 No se encontraron guías para "<strong>${termino}</strong>"</p>
          <p style="font-size: var(--texto-sm); color: var(--texto-secundario);">
            Intenta con: IVA, nómina, partida doble, IUE, calendario, costos...
          </p>
        </div>
      `;
    } else {
      resultados.innerHTML = `
        <p class="busqueda-contador">
          ${guiasFiltradas.length} guía${guiasFiltradas.length !== 1 ? 's' : ''} encontrada${guiasFiltradas.length !== 1 ? 's' : ''}
        </p>
        <div class="guias-grid">
          ${guiasFiltradas.map(guia => renderizarGuiaCard(guia)).join('')}
        </div>
      `;
    }
  });
}

// ────────────────────────────────────────────────────────────────
// RENDERIZAR PARTICULARIDADES BOLIVIANAS (Fase 5 - Expandibles)
// ────────────────────────────────────────────────────────────────
function renderizarParticularidades() {
  const grid = document.getElementById('particularidades-grid');
  if (!grid || typeof PARTICULARIDADES_BOLIVIANAS === 'undefined') return;

  grid.innerHTML = PARTICULARIDADES_BOLIVIANAS.map((p, i) => `
    <div class="card particularidad-card ${p.destacada ? 'particularidad-joya' : ''}"
         data-particularidad="${i}"
         tabindex="0"
         role="button"
         aria-expanded="false">

      <!-- Badge de normativa -->
      <div class="particularidad-badges">
        <span class="badge badge-primario">🇧🇴 Normativa boliviana</span>
        ${p.destacada ? '<span class="badge badge-secundario">💎 La joya del sistema</span>' : ''}
      </div>

      <!-- Header con icono y título -->
      <div class="particularidad-header">
        <span class="particularidad-icono">${p.icono}</span>
        <h3 class="particularidad-titulo">${p.titulo}</h3>
      </div>

      <!-- Descripción breve -->
      <p class="particularidad-descripcion">${p.descripcion}</p>

      <!-- Snippet de código (siempre visible, compacto) -->
      <div class="snippet particularidad-snippet">
        <div class="snippet-header">
          <span class="snippet-titulo">📋 ${p.normativa}</span>
        </div>
        <pre><code>${escapeHTML(p.codigo)}</code></pre>
      </div>

      <!-- Detalle expandible -->
      <div class="particularidad-detalle" aria-hidden="true">
        <p class="particularidad-explicacion">${p.explicacionLarga}</p>
      </div>

      <!-- Hint de expansión -->
      <button class="particularidad-toggle" aria-label="Ver más detalles">
        <span class="particularidad-toggle-texto">¿Por qué importa?</span>
        <span class="particularidad-toggle-icono">▼</span>
      </button>
    </div>
  `).join('');

  // Conectar eventos de expansión
  conectarExpansionParticularidades();

  // Re-observar elementos reveal
  inicializarAnimacionesReveal();
}

// Escapar HTML para mostrar código de forma segura
function escapeHTML(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

// ────────────────────────────────────────────────────────────────
// EXPANSIÓN DE PARTICULARIDADES
// ────────────────────────────────────────────────────────────────
function conectarExpansionParticularidades() {
  const cards = document.querySelectorAll('.particularidad-card');

  cards.forEach(card => {
    const toggle = card.querySelector('.particularidad-toggle');
    const detalle = card.querySelector('.particularidad-detalle');
    const icono = card.querySelector('.particularidad-toggle-icono');
    const texto = card.querySelector('.particularidad-toggle-texto');

    toggle?.addEventListener('click', (e) => {
      e.stopPropagation(); // Evitar que el click de la card también se active
      const estaExpandida = card.classList.contains('expandida');

      if (estaExpandida) {
        card.classList.remove('expandida');
        card.setAttribute('aria-expanded', 'false');
        detalle.setAttribute('aria-hidden', 'true');
        icono.textContent = '▼';
        texto.textContent = '¿Por qué importa?';
      } else {
        card.classList.add('expandida');
        card.setAttribute('aria-expanded', 'true');
        detalle.setAttribute('aria-hidden', 'false');
        icono.textContent = '▲';
        texto.textContent = 'Ver menos';
      }
    });

    // Accesibilidad con teclado
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle?.click();
      }
    });
  });
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

// ────────────────────────────────────────────────────────────────
// RENDERIZAR UBICACIÓN EN FOOTER (Contexto Trinidad-Beni)
// ────────────────────────────────────────────────────────────────
function renderizarUbicacionFooter() {
  const contenedor = document.getElementById('footer-ubicacion');
  if (!contenedor) {
    console.warn('⚠️ Contenedor footer-ubicacion no encontrado');
    return;
  }

  if (typeof PROYECTO_INFO === 'undefined') {
    console.warn('⚠️ PROYECTO_INFO no disponible');
    contenedor.innerHTML = `
      <p style="color: var(--texto-en-oscuro); font-size: var(--texto-sm);">
        📍 Desarrollado en Bolivia
      </p>
    `;
    return;
  }

  const { ubicacion, empresaEjemplo } = PROYECTO_INFO;

  contenedor.innerHTML = `
    <p style="color: rgba(255,255,255,.75); font-size: var(--texto-sm); margin-bottom: var(--espacio-xs);">
      📍 Desarrollado en <strong>${ubicacion.ciudad}, ${ubicacion.departamento}</strong> — ${ubicacion.pais}
    </p>
    <p style="color: rgba(255,255,255,.55); font-size: var(--texto-xs);">
      Empresa de ejemplo: ${empresaEjemplo.nombre} · NIT ${empresaEjemplo.nit}
    </p>
  `;
}

// ────────────────────────────────────────────────────────────────
// FASE 8 — MENÚ MÓVIL Y BARRA DE PROGRESO
// ────────────────────────────────────────────────────────────────

function inicializarMenuMovil() {
  const hamburguesa = document.getElementById('navbar-hamburguesa');
  const enlaces = document.getElementById('navbar-enlaces');
  const overlay = document.getElementById('navbar-overlay');

  if (!hamburguesa || !enlaces) return;

  function cerrarMenu() {
    hamburguesa.classList.remove('abierta');
    enlaces.classList.remove('abierto');
    overlay?.classList.remove('visible');
    hamburguesa.setAttribute('aria-expanded', 'false');
  }

  function abrirMenu() {
    hamburguesa.classList.add('abierta');
    enlaces.classList.add('abierto');
    overlay?.classList.add('visible');
    hamburguesa.setAttribute('aria-expanded', 'true');
  }

  hamburguesa.addEventListener('click', () => {
    const estaAbierto = enlaces.classList.contains('abierto');
    estaAbierto ? cerrarMenu() : abrirMenu();
  });

  // Cerrar al hacer click en un enlace
  enlaces.querySelectorAll('.navbar-enlace').forEach(enlace => {
    enlace.addEventListener('click', cerrarMenu);
  });

  // Cerrar al hacer click fuera (overlay)
  overlay?.addEventListener('click', cerrarMenu);

  // Cerrar con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarMenu();
  });

  // Cerrar si la ventana crece a desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) cerrarMenu();
  });
}

function inicializarBarraProgreso() {
  const barra = document.getElementById('scroll-progress');
  if (!barra) return;

  function actualizar() {
    const altoTotal = document.documentElement.scrollHeight - window.innerHeight;
    const progreso = altoTotal > 0 ? (window.scrollY / altoTotal) * 100 : 0;
    barra.style.width = progreso + '%';
  }

  window.addEventListener('scroll', actualizar, { passive: true });
  actualizar();
}

function inicializarImagenesLazy() {
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    if (img.complete) {
      img.classList.add('cargada');
    } else {
      img.addEventListener('load', () => img.classList.add('cargada'));
    }
  });
}
