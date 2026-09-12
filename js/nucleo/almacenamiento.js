// ══════════════════════════════════════════════════════════════
// almacenamiento.js — ERP Contable Bolivia
// Capa de persistencia usando localStorage del navegador
// ══════════════════════════════════════════════════════════════

/**
 * Almacenamiento: "Base de datos" del prototipo educativo.
 *
 * Usa localStorage del navegador para persistir datos.
 * Cada "colección" es una clave en localStorage que contiene
 * un array JSON de objetos.
 *
 * Ejemplo de uso:
 *   Almacenamiento.guardar('clientes', { id: 'cli-001', nombre: 'ABC SRL' });
 *   Almacenamiento.obtener('clientes');  // [{ id: 'cli-001', nombre: 'ABC SRL' }]
 *   Almacenamiento.obtenerPorId('clientes', 'cli-001');  // { id: 'cli-001', ... }
 *   Almacenamiento.eliminar('clientes', 'cli-001');
 *
 * ⚠️ LIMITACIONES (por ser prototipo educativo):
 * - Los datos viven solo en ESTE navegador.
 * - Si el usuario limpia el caché, pierde todo.
 * - No hay persistencia entre dispositivos.
 * - Límite de ~5-10 MB según el navegador.
 *
 * Para un SaaS real → migrar a backend + PostgreSQL (Módulo 8).
 */

class AlmacenamientoLocal {
  /**
   * @param {string} prefijo - Prefijo para las claves de localStorage
   */
  constructor(prefijo = 'erp_bolivia') {
    this.prefijo = prefijo;
  }

  /**
   * Genera la clave completa para localStorage.
   * @param {string} coleccion - Nombre de la colección
   * @returns {string} Clave con prefijo: "erp_bolivia_clientes"
   */
  _clave(coleccion) {
    return `${this.prefijo}_${coleccion}`;
  }

  /**
   * Obtiene todos los registros de una colección.
   * @param {string} coleccion - Nombre de la colección
   * @returns {Array} Array de objetos (vacío si no existe)
   */
  obtener(coleccion) {
    try {
      const clave = this._clave(coleccion);
      const datos = localStorage.getItem(clave);
      if (!datos) return [];
      return JSON.parse(datos);
    } catch (error) {
      console.error(`❌ Error al leer "${coleccion}":`, error);
      return [];
    }
  }

  /**
   * Obtiene un registro específico por su ID.
   * @param {string} coleccion - Nombre de la colección
   * @param {string} id - ID del registro
   * @returns {Object|null} El registro o null si no existe
   */
  obtenerPorId(coleccion, id) {
    const registros = this.obtener(coleccion);
    return registros.find(r => r.id === id) || null;
  }

  /**
   * Busca registros que cumplan un criterio.
   * @param {string} coleccion - Nombre de la colección
   * @param {Function} criterio - Función de filtro
   * @returns {Array} Registros que cumplen el criterio
   */
  buscar(coleccion, criterio) {
    const registros = this.obtener(coleccion);
    return registros.filter(criterio);
  }

  /**
   * Guarda un nuevo registro en una colección.
   * Si el registro no tiene ID, se genera uno automáticamente.
   * @param {string} coleccion - Nombre de la colección
   * @param {Object} datos - El registro a guardar
   * @returns {Object} El registro guardado (con ID)
   */
  guardar(coleccion, datos) {
    try {
      const registros = this.obtener(coleccion);

      // Generar ID si no tiene
      if (!datos.id) {
        datos.id = this._generarId();
      }

      // Agregar timestamp de creación si no tiene
      if (!datos.creadoEn) {
        datos.creadoEn = new Date().toISOString();
      }

      registros.push(datos);
      localStorage.setItem(this._clave(coleccion), JSON.stringify(registros));

      console.log(`💾 Guardado en "${coleccion}": ${datos.id}`);
      return datos;
    } catch (error) {
      console.error(`❌ Error al guardar en "${coleccion}":`, error);
      return null;
    }
  }

  /**
   * Actualiza un registro existente.
   * @param {string} coleccion - Nombre de la colección
   * @param {string} id - ID del registro a actualizar
   * @param {Object} nuevosDatos - Los campos a actualizar
   * @returns {Object|null} El registro actualizado o null
   */
  actualizar(coleccion, id, nuevosDatos) {
    try {
      const registros = this.obtener(coleccion);
      const indice = registros.findIndex(r => r.id === id);

      if (indice === -1) {
        console.warn(`⚠️ No se encontró "${id}" en "${coleccion}".`);
        return null;
      }

      // Agregar timestamp de actualización
      nuevosDatos.actualizadoEn = new Date().toISOString();

      // Fusionar datos (sin sobrescribir id ni creadoEn)
      registros[indice] = { ...registros[indice], ...nuevosDatos, id: registros[indice].id };

      localStorage.setItem(this._clave(coleccion), JSON.stringify(registros));
      console.log(`✏️ Actualizado en "${coleccion}": ${id}`);
      return registros[indice];
    } catch (error) {
      console.error(`❌ Error al actualizar "${id}" en "${coleccion}":`, error);
      return null;
    }
  }

  /**
   * Elimina un registro de una colección.
   * @param {string} coleccion - Nombre de la colección
   * @param {string} id - ID del registro a eliminar
   * @returns {boolean} true si se eliminó, false si no existía
   */
  eliminar(coleccion, id) {
    try {
      const registros = this.obtener(coleccion);
      const filtrados = registros.filter(r => r.id !== id);

      if (filtrados.length === registros.length) {
        console.warn(`⚠️ No se encontró "${id}" en "${coleccion}" para eliminar.`);
        return false;
      }

      localStorage.setItem(this._clave(coleccion), JSON.stringify(filtrados));
      console.log(`🗑️ Eliminado de "${coleccion}": ${id}`);
      return true;
    } catch (error) {
      console.error(`❌ Error al eliminar "${id}" de "${coleccion}":`, error);
      return false;
    }
  }

  /**
   * Elimina todos los registros de una colección.
   * @param {string} coleccion - Nombre de la colección
   */
  vaciar(coleccion) {
    localStorage.removeItem(this._clave(coleccion));
    console.log(`🗑️ Colección "${coleccion}" vaciada.`);
  }

  /**
   * Cuenta cuántos registros tiene una colección.
   * @param {string} coleccion - Nombre de la colección
   * @returns {number} Cantidad de registros
   */
  contar(coleccion) {
    return this.obtener(coleccion).length;
  }

  /**
   * Verifica si existe un registro con cierto criterio.
   * @param {string} coleccion - Nombre de la colección
   * @param {Function} criterio - Función de búsqueda
   * @returns {boolean} true si existe
   */
  existe(coleccion, criterio) {
    return this.buscar(coleccion, criterio).length > 0;
  }

  /**
   * Genera un ID único.
   * Usa crypto.randomUUID() si está disponible, sino Date.now() + random.
   * @returns {string} ID único
   */
  _generarId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback para navegadores antiguos
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Exporta todos los datos como JSON (para backup).
   * @returns {Object} Todos los datos organizados por colección
   */
  exportarTodo() {
    const datos = {};
    for (let i = 0; i < localStorage.length; i++) {
      const clave = localStorage.key(i);
      if (clave.startsWith(this.prefijo)) {
        const coleccion = clave.replace(`${this.prefijo}_`, '');
        datos[coleccion] = this.obtener(coleccion);
      }
    }
    return datos;
  }

  /**
   * Importa datos desde un JSON (restaurar backup).
   * @param {Object} datos - Datos a importar
   */
  importarTodo(datos) {
    for (const [coleccion, registros] of Object.entries(datos)) {
      localStorage.setItem(this._clave(coleccion), JSON.stringify(registros));
    }
    console.log('📥 Datos importados correctamente.');
  }

  /**
   * Carga datos de ejemplo desde datos/ejemplo.json.
   *
   * ESTRATEGIA: Siempre sobrescribe los datos de ejemplo, porque
   * son datos ficticios. Si el usuario tiene datos propios, debe
   * exportarlos primero con exportarTodo().
   *
   * @param {boolean} forzar - Si true, sobrescribe incluso si hay datos.
   * @returns {Object} Resumen de lo cargado
   */
  async cargarDatosEjemplo(forzar = true) {
    const resumen = {
      exito: false,
      mensaje: '',
      coleccionesCargadas: [],
      coleccionesOmitidas: [],
      coleccionesSobreescritas: [],
      errores: []
    };

    try {
      const respuesta = await fetch('datos/ejemplo.json');
      if (!respuesta.ok) {
        throw new Error(`No se pudo cargar datos/ejemplo.json (HTTP ${respuesta.status}). Verifica que estés usando Live Server.`);
      }

      const datos = await respuesta.json();

      // Mapeo: clave en JSON → nombre de colección en localStorage
      const colecciones = {
        'empresa': datos.empresa ? [datos.empresa] : [],
        'clientes': datos.clientes || [],
        'proveedores': datos.proveedores || [],
        'productos': datos.productos || [],
        'transacciones': datos.transacciones || [],
        'empleados': datos.empleados || [],
        'documentos': datos.documentos || []   // ← NUEVO: Capa 1 - Documentos Fuente
      };

      for (const [coleccion, registros] of Object.entries(colecciones)) {
        if (registros.length === 0) {
          resumen.coleccionesOmitidas.push(coleccion);
          continue;
        }

        const existentes = this.obtener(coleccion);
        const habiaDatos = existentes.length > 0;

        if (forzar || !habiaDatos) {
          // Sobrescribir siempre (los datos de ejemplo son ficticios)
          localStorage.setItem(this._clave(coleccion), JSON.stringify(registros));

          if (habiaDatos) {
            resumen.coleccionesSobreescritas.push(
              `${coleccion} (${existentes.length} → ${registros.length})`
            );
          } else {
            resumen.coleccionesCargadas.push(`${coleccion} (${registros.length})`);
          }
        } else {
          resumen.coleccionesOmitidas.push(`${coleccion} (${existentes.length} existentes)`);
        }
      }

      // Construir mensaje de resultado
      const partes = [];
      if (resumen.coleccionesCargadas.length > 0) {
        partes.push(`✅ Cargadas: ${resumen.coleccionesCargadas.join(', ')}`);
      }
      if (resumen.coleccionesSobreescritas.length > 0) {
        partes.push(`🔄 Sobreescritas: ${resumen.coleccionesSobreescritas.join(', ')}`);
      }
      if (resumen.coleccionesOmitidas.length > 0) {
        partes.push(`⏭️ Omitidas: ${resumen.coleccionesOmitidas.join(', ')}`);
      }

      resumen.exito = true;
      resumen.mensaje = partes.join('. ') + '.';

      // NUEVO: Disparar evento global para que las vistas se actualicen
      window.dispatchEvent(new CustomEvent('erp:datos-ejemplo-cargados', {
        detail: resumen
      }));

      console.log('📥 Datos de ejemplo:', resumen);
      return resumen;

    } catch (error) {
      resumen.errores.push(error.message);
      resumen.mensaje = `❌ Error al cargar datos de ejemplo: ${error.message}`;
      console.error('❌ Error cargando datos de ejemplo:', error);
      return resumen;
    }
  }
    /**
   * Limpia todos los datos del ERP (reset total).
   * Útil para pruebas y para empezar de cero.
   */
  limpiarTodo() {
    const colecciones = [
      'empresa', 'clientes', 'proveedores', 'productos',
      'transacciones', 'empleados', 'documentos',
      'asientos', 'libroDiario', 'libroMayor',
      'periodosFiscales', 'iva_saldo_favor_acumulado',
      'segundo_aguinaldo_config', 'historial_smn'
    ];
    colecciones.forEach(c => this.vaciar(c));
    console.log('🧹 Todos los datos del ERP han sido eliminados.');

    // NUEVO: Disparar evento global para que las vistas se actualicen
    window.dispatchEvent(new CustomEvent('erp:datos-limpiados'));
  }

  /**
   * Fuerza la recarga de datos de ejemplo (borra y vuelve a cargar).
   * @returns {Object} Resumen de lo cargado
   */
  async recargarDatosEjemplo() {

    console.log('🔄 Recargando datos de ejemplo...');
    this.limpiarTodo();

    return await this.cargarDatosEjemplo(true);
  }
}
