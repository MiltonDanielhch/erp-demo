// ══════════════════════════════════════════════════════════════
// enrutador.js — ERP Contable Bolivia
// Enrutador SPA artesanal: carga vistas sin recargar la página
// ══════════════════════════════════════════════════════════════

/**
 * Enrutador SPA (Single Page Application) artesanal.
 *
 * ¿Qué hace?
 * - Escucha cambios en el hash de la URL (#/compras, #/ventas, etc.)
 * - Carga el HTML correspondiente desde /vistas/ usando fetch()
 * - Lo inserta en el div #contenido sin recargar la página
 * - Actualiza el menú lateral (marca el link activo)
 *
 * ¿Por qué artesanal y no un framework?
 * Para entender cómo funcionan React Router, Vue Router, etc.
 * por dentro. La lógica es exactamente la misma, solo que aquí
 * la escribimos a mano.
 */

class Enrutador {
  /**
   * @param {Object} opciones - Configuración del enrutador
   * @param {Object} opciones.rutas - Mapa de ruta → archivo HTML
   * @param {string} opciones.contenedorId - ID del div donde se carga el contenido
   * @param {string} opciones.vistaPorDefecto - Ruta si no hay hash o es inválida
   */
  constructor(opciones = {}) {
    this.rutas = opciones.rutas || {};
    this.contenedorId = opciones.contenedorId || 'contenido';
    this.vistaPorDefecto = opciones.vistaPorDefecto || 'dashboard';
    this.vistaActual = null;
    this.estaInicializado = false;
  }

  /**
   * Inicializa el enrutador: configura listeners y carga la vista inicial.
   * Se llama una sola vez al arrancar el sistema.
   */
  iniciar() {
    if (this.estaInicializado) {
      console.warn('⚠️ Enrutador ya está inicializado.');
      return;
    }

    // Escuchar cambios en el hash (navegación del usuario)
    window.addEventListener('hashchange', () => {
      const ruta = this.obtenerRutaActual();
      this.navegarA(ruta);
    });

    // Escuchar popstate (botón atrás/adelante del navegador)
    window.addEventListener('popstate', () => {
      const ruta = this.obtenerRutaActual();
      this.navegarA(ruta);
    });

    // Cargar la vista inicial
    const rutaInicial = this.obtenerRutaActual();
    this.navegarA(rutaInicial);

    this.estaInicializado = true;
    console.log('🧭 Enrutador inicializado.');
  }

  /**
   * Obtiene la ruta actual del hash de la URL.
   * Ejemplos:
   *   "#/compras" → "compras"
   *   "#/dashboard" → "dashboard"
   *   "" → "dashboard" (por defecto)
   * @returns {string} La ruta actual
   */
  obtenerRutaActual() {
    const hash = window.location.hash || '';
    // Quitar "#/" del inicio
    const ruta = hash.replace(/^#\/?/, '');
    return ruta || this.vistaPorDefecto;
  }

  /**
   * Navega a una vista específica.
   * @param {string} ruta - La ruta a la que navegar (ej: "compras")
   */
  async navegarA(ruta) {
    // Verificar que la ruta existe en el mapa de rutas
    if (!this.rutas[ruta]) {
      console.warn(`⚠️ Ruta "${ruta}" no encontrada. Redirigiendo a "${this.vistaPorDefecto}".`);
      ruta = this.vistaPorDefecto;
    }

    const contenedor = document.getElementById(this.contenedorId);
    if (!contenedor) {
      console.error(`❌ No se encontró el contenedor #${this.contenedorId}`);
      return;
    }

    try {
      // Mostrar indicador de carga
      contenedor.innerHTML = `
        <div class="cargando">
          <div class="spinner"></div>
          <p>Cargando ${ruta}...</p>
        </div>
      `;

      // Cargar el HTML de la vista usando fetch()
      const archivoVista = this.rutas[ruta];
      const respuesta = await fetch(archivoVista);

      if (!respuesta.ok) {
        throw new Error(`HTTP ${respuesta.status}: No se pudo cargar ${archivoVista}`);
      }

      const html = await respuesta.text();
      contenedor.innerHTML = html;

      // Actualizar estado
      this.vistaActual = ruta;

      // Actualizar el menú lateral
      this.actualizarMenuActivo(ruta);

      // Actualizar el hash sin generar un nuevo evento hashchange
      // (solo si el hash no coincide con la ruta actual)
      const hashActual = window.location.hash.replace(/^#\/?/, '');
      if (hashActual !== ruta) {
        window.history.pushState(null, '', `#/${ruta}`);
      }

      // Log para debugging
      console.log(`📄 Vista cargada: ${ruta} → ${archivoVista}`);

    } catch (error) {
      console.error(`❌ Error al cargar la vista "${ruta}":`, error);
      contenedor.innerHTML = `
        <div class="card" style="text-align: center; padding: 2rem;">
          <h3>⚠️ Error al cargar la vista</h3>
          <p style="margin: 1rem 0;">No se pudo cargar <strong>"${ruta}"</strong>.</p>
          <p style="font-size: 0.8rem; color: var(--texto-secundario);">
            Error: ${error.message}<br>
            Si abriste el archivo con doble clic, usa <strong>Live Server</strong> de VS Code.
          </p>
          <button class="btn btn-primary" onclick="window.location.hash='#/dashboard'"
                  style="margin-top: 1rem;">
            ← Volver al Dashboard
          </button>
        </div>
      `;
    }
  }

  /**
   * Actualiza el menú lateral marcando el link activo.
   * @param {string} ruta - La ruta activa
   */
  actualizarMenuActivo(ruta) {
    // Quitar clase "activo" de todos los links del menú
    const links = document.querySelectorAll('.menu-link');
    links.forEach(link => link.classList.remove('activo'));

    // Agregar clase "activo" al link correspondiente
    const linkActivo = document.querySelector(`.menu-link[data-vista="${ruta}"]`);
    if (linkActivo) {
      linkActivo.classList.add('activo');
    }
  }

  /**
   * Registra una nueva ruta dinámicamente.
   * Útil si un módulo quiere agregar una vista nueva.
   * @param {string} ruta - Nombre de la ruta
   * @param {string} archivo - Ruta al archivo HTML
   */
  registrarRuta(ruta, archivo) {
    this.rutas[ruta] = archivo;
    console.log(`🧭 Ruta registrada: ${ruta} → ${archivo}`);
  }
}
