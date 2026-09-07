// ══════════════════════════════════════════════════════════════
// catalogos-vista.js — ERP Contable Bolivia
// Lógica de la vista: Mantenimiento de catálogos
// ══════════════════════════════════════════════════════════════

console.log('📚 [INICIO] Ejecutando catalogos-vista.js');

window.CatalogosVista = {

  pestañaActual: 'clientes',
  modoEdicion: false,
  idEditando: null,
  elementos: {},

  inicializar() {
    console.log('📚 [1/5] CatalogosVista.inicializar()');

    try {
      this.capturarElementos();
      console.log('📚 [2/5] Elementos capturados');

      this.configurarEventListeners();
      console.log('📚 [3/5] Event listeners configurados');

      this.actualizarEstadisticas();
      console.log('📚 [4/5] Estadísticas actualizadas');

      this.refrescarTabla();
      console.log('📚 [5/5] Tabla refrescada');

      console.log('✅ Vista Catálogos lista');
    } catch (error) {
      console.error('❌ Error en inicializar():', error);
      console.error('Stack:', error.stack);
    }
  },

  capturarElementos() {
    this.elementos = {
      statsClientes: document.getElementById('stats-clientes'),
      statsProveedores: document.getElementById('stats-proveedores'),
      statsProductos: document.getElementById('stats-productos'),
      statsInventario: document.getElementById('stats-inventario'),

      tabs: document.querySelectorAll('.tab-btn'),
      btnNuevo: document.getElementById('btn-nuevo'),
      btnCancelar: document.getElementById('btn-cancelar'),
      btnRefrescar: document.getElementById('btn-refrescar'),
      btnLimpiar: document.getElementById('btn-limpiar'),
      buscar: document.getElementById('buscar'),

      formulario: document.getElementById('formulario'),
      form: document.getElementById('form-catalogo'),
      formTitulo: document.getElementById('form-titulo'),
      formId: document.getElementById('form-id'),

      camposCliente: document.getElementById('campos-cliente'),
      camposProveedor: document.getElementById('campos-proveedor'),
      camposProducto: document.getElementById('campos-producto'),

      tablaHead: document.getElementById('tabla-head'),
      tablaBody: document.getElementById('tabla-body'),

      contenedorToasts: document.getElementById('contenedor-toasts')
    };

    // Verificar elementos críticos
    if (!this.elementos.btnNuevo) {
      console.error('❌ btn-nuevo no encontrado en el DOM');
    }
    if (!this.elementos.form) {
      console.error('❌ form-catalogo no encontrado en el DOM');
    }
  },

  configurarEventListeners() {
    // Pestañas
    this.elementos.tabs.forEach(tab => {
      tab.addEventListener('click', () => this.cambiarPestaña(tab.dataset.tab));
    });

    // Botones
    if (this.elementos.btnNuevo) {
      this.elementos.btnNuevo.addEventListener('click', () => {
        console.log('🔘 Click en btn-nuevo');
        this.mostrarFormulario(true);
      });
    }

    if (this.elementos.btnCancelar) {
      this.elementos.btnCancelar.addEventListener('click', () => {
        this.mostrarFormulario(false);
        this.limpiarFormulario();
      });
    }

    if (this.elementos.btnRefrescar) {
      this.elementos.btnRefrescar.addEventListener('click', () => this.refrescarTabla());
    }

    if (this.elementos.btnLimpiar) {
      this.elementos.btnLimpiar.addEventListener('click', () => this.limpiarFormulario());
    }

    // Búsqueda
    if (this.elementos.buscar) {
      this.elementos.buscar.addEventListener('input', () => this.refrescarTabla());
    }

    // Submit
    if (this.elementos.form) {
      this.elementos.form.addEventListener('submit', (e) => this.manejarSubmit(e));
    }

    // Validación NIT en tiempo real
    const cNit = document.getElementById('c-nit');
    const pNit = document.getElementById('p-nit');
    if (cNit) cNit.addEventListener('input', (e) => this.validarNITInput(e, 'c-nit-validacion'));
    if (pNit) pNit.addEventListener('input', (e) => this.validarNITInput(e, 'p-nit-validacion'));

    // Cálculo IVA
    const prPrecio = document.getElementById('pr-precioVenta');
    if (prPrecio) prPrecio.addEventListener('input', () => this.calcularIVAPrecio());

    // Eventos del sistema
    const eventos = [
      'erp:cliente-registrado', 'erp:cliente-actualizado', 'erp:cliente-desactivado',
      'erp:proveedor-registrado', 'erp:proveedor-actualizado', 'erp:proveedor-desactivado',
      'erp:producto-registrado', 'erp:producto-actualizado', 'erp:producto-desactivado'
    ];
    eventos.forEach(evt => {
      window.addEventListener(evt, () => {
        this.actualizarEstadisticas();
        this.refrescarTabla();
      });
    });
  },

  cambiarPestaña(pestaña) {
    console.log('🗂️ Cambiando a pestaña:', pestaña);
    this.pestañaActual = pestaña;
    this.mostrarFormulario(false);
    this.limpiarFormulario();

    this.elementos.tabs.forEach(tab => {
      if (tab.dataset.tab === pestaña) {
        tab.classList.add('activo');
        tab.style.color = 'var(--color-primario)';
        tab.style.borderBottomColor = 'var(--color-primario)';
      } else {
        tab.classList.remove('activo');
        tab.style.color = 'var(--texto-secundario)';
        tab.style.borderBottomColor = 'transparent';
      }
    });

    this.refrescarTabla();
  },

  mostrarFormulario(visible) {
    console.log('📝 mostrarFormulario:', visible);
    if (visible) {
      this.elementos.formulario.classList.remove('oculto');
      this.elementos.btnNuevo.classList.add('oculto');
      this.elementos.btnCancelar.classList.remove('oculto');
      this.mostrarCamposSegunPestaña();
    } else {
      this.elementos.formulario.classList.add('oculto');
      this.elementos.btnNuevo.classList.remove('oculto');
      this.elementos.btnCancelar.classList.add('oculto');
      this.modoEdicion = false;
      this.idEditando = null;
    }
  },

  mostrarCamposSegunPestaña() {
    this.elementos.camposCliente.classList.add('oculto');
    this.elementos.camposProveedor.classList.add('oculto');
    this.elementos.camposProducto.classList.add('oculto');

    if (this.pestañaActual === 'clientes') {
      this.elementos.camposCliente.classList.remove('oculto');
    } else if (this.pestañaActual === 'proveedores') {
      this.elementos.camposProveedor.classList.remove('oculto');
    } else if (this.pestañaActual === 'productos') {
      this.elementos.camposProducto.classList.remove('oculto');
    }
  },

  limpiarFormulario() {
    this.elementos.form.reset();
    this.elementos.formId.value = '';
    this.modoEdicion = false;
    this.idEditando = null;
    this.elementos.formTitulo.textContent = `Nuevo ${this.obtenerNombrePestaña()}`;

    const cNitVal = document.getElementById('c-nit-validacion');
    const pNitVal = document.getElementById('p-nit-validacion');
    if (cNitVal) {
      cNitVal.textContent = 'Ingrese NIT con guión verificador';
      cNitVal.style.color = '';
    }
    if (pNitVal) {
      pNitVal.textContent = 'Ingrese NIT con guión verificador';
      pNitVal.style.color = '';
    }
  },

  obtenerNombrePestaña() {
    const nombres = { clientes: 'cliente', proveedores: 'proveedor', productos: 'producto' };
    return nombres[this.pestañaActual] || '';
  },

  obtenerCatalogo() {
    if (this.pestañaActual === 'clientes') return window.CatalogoClientes;
    if (this.pestañaActual === 'proveedores') return window.CatalogoProveedores;
    if (this.pestañaActual === 'productos') return window.CatalogoProductos;
    return null;
  },

  editarRegistro(id) {
    const catalogo = this.obtenerCatalogo();
    const registro = catalogo.obtenerPorId(id);
    if (!registro) return;

    this.modoEdicion = true;
    this.idEditando = id;
    this.elementos.formId.value = id;
    this.elementos.formTitulo.textContent = `Editar ${this.obtenerNombrePestaña()}`;
    this.mostrarFormulario(true);
    this.mostrarCamposSegunPestaña();

    if (this.pestañaActual === 'clientes') {
      document.getElementById('c-nit').value = registro.nit || '';
      document.getElementById('c-razonSocial').value = registro.razonSocial || '';
      document.getElementById('c-telefono').value = registro.telefono || '';
      document.getElementById('c-email').value = registro.email || '';
      document.getElementById('c-direccion').value = registro.direccion || '';
      document.getElementById('c-limiteCredito').value = registro.limiteCredito || 0;
      document.getElementById('c-regimenTributario').value = registro.regimenTributario || 'REGIMEN_GENERAL';
    } else if (this.pestañaActual === 'proveedores') {
      document.getElementById('p-nit').value = registro.nit || '';
      document.getElementById('p-razonSocial').value = registro.razonSocial || '';
      document.getElementById('p-telefono').value = registro.telefono || '';
      document.getElementById('p-email').value = registro.email || '';
      document.getElementById('p-direccion').value = registro.direccion || '';
      document.getElementById('p-condicionesPago').value = registro.condicionesPago || 'CONTADO';
      document.getElementById('p-regimenTributario').value = registro.regimenTributario || 'REGIMEN_GENERAL';
      document.getElementById('p-esAgenteRetencion').checked = registro.esAgenteRetencion || false;
    } else if (this.pestañaActual === 'productos') {
      document.getElementById('pr-codigo').value = registro.codigo || '';
      document.getElementById('pr-nombre').value = registro.nombre || '';
      document.getElementById('pr-descripcion').value = registro.descripcion || '';
      document.getElementById('pr-categoria').value = registro.categoria || 'OTROS';
      document.getElementById('pr-unidadMedida').value = registro.unidadMedida || 'UNIDAD';
      document.getElementById('pr-precioVenta').value = registro.precioVenta || 0;
      document.getElementById('pr-costoUltimo').value = registro.costoUltimo || 0;
      document.getElementById('pr-stockActual').value = registro.stockActual || 0;
      document.getElementById('pr-stockMinimo').value = registro.stockMinimo || 0;
      document.getElementById('pr-almacen').value = registro.almacen || 'ALMACEN_CENTRAL';
      this.calcularIVAPrecio();
    }
  },

  manejarSubmit(e) {
    e.preventDefault();

    const catalogo = this.obtenerCatalogo();
    let datos = {};

    if (this.pestañaActual === 'clientes') {
      datos = {
        nit: document.getElementById('c-nit').value.trim(),
        razonSocial: document.getElementById('c-razonSocial').value.trim(),
        telefono: document.getElementById('c-telefono').value.trim(),
        email: document.getElementById('c-email').value.trim(),
        direccion: document.getElementById('c-direccion').value.trim(),
        limiteCredito: parseFloat(document.getElementById('c-limiteCredito').value) || 0,
        regimenTributario: document.getElementById('c-regimenTributario').value
      };
    } else if (this.pestañaActual === 'proveedores') {
      datos = {
        nit: document.getElementById('p-nit').value.trim(),
        razonSocial: document.getElementById('p-razonSocial').value.trim(),
        telefono: document.getElementById('p-telefono').value.trim(),
        email: document.getElementById('p-email').value.trim(),
        direccion: document.getElementById('p-direccion').value.trim(),
        condicionesPago: document.getElementById('p-condicionesPago').value,
        regimenTributario: document.getElementById('p-regimenTributario').value,
        esAgenteRetencion: document.getElementById('p-esAgenteRetencion').checked
      };
    } else if (this.pestañaActual === 'productos') {
      datos = {
        codigo: document.getElementById('pr-codigo').value.trim(),
        nombre: document.getElementById('pr-nombre').value.trim(),
        descripcion: document.getElementById('pr-descripcion').value.trim(),
        categoria: document.getElementById('pr-categoria').value,
        unidadMedida: document.getElementById('pr-unidadMedida').value,
        precioVenta: parseFloat(document.getElementById('pr-precioVenta').value) || 0,
        costoUltimo: parseFloat(document.getElementById('pr-costoUltimo').value) || 0,
        stockActual: parseInt(document.getElementById('pr-stockActual').value, 10) || 0,
        stockMinimo: parseInt(document.getElementById('pr-stockMinimo').value, 10) || 0,
        almacen: document.getElementById('pr-almacen').value.trim()
      };
    }

    let resultado;
    if (this.modoEdicion && this.idEditando) {
      resultado = catalogo.actualizar(this.idEditando, datos);
    } else {
      resultado = catalogo.registrar(datos);
    }

    if (resultado.exito) {
      this.mostrarToast(`✅ ${this.modoEdicion ? 'Actualizado' : 'Registrado'} correctamente`, 'exito');
      this.limpiarFormulario();
      this.mostrarFormulario(false);
      this.refrescarTabla();
      this.actualizarEstadisticas();
    } else {
      const mensaje = resultado.errores?.join(', ') || resultado.mensaje;
      this.mostrarToast(`❌ ${mensaje}`, 'error');
    }
  },

  validarNITInput(e, idValidacion) {
    const nit = e.target.value;
    const span = document.getElementById(idValidacion);
    if (!span) return;

    if (!nit) {
      span.textContent = 'Ingrese NIT con guión verificador';
      span.style.color = '';
      return;
    }

    const validacion = window.validadores.validarNIT(nit);
    if (validacion.valido) {
      span.textContent = '✓ NIT válido';
      span.style.color = 'var(--color-exito)';
    } else {
      span.textContent = validacion.errores[0] || '✗ NIT inválido';
      span.style.color = 'var(--color-error)';
    }
  },

  calcularIVAPrecio() {
    const precio = parseFloat(document.getElementById('pr-precioVenta').value) || 0;
    const detalle = document.getElementById('pr-precio-detalle');
    if (!detalle) return;

    if (precio <= 0) {
      detalle.textContent = 'Neto: Bs 0.00 | IVA: Bs 0.00';
      return;
    }

    const neto = window.utilidades.extraerNetoDeTotal(precio);
    const iva = window.utilidades.calcularIVADeTotal(precio);
    detalle.textContent = `Neto: ${window.utilidades.formatearBs(neto)} | IVA: ${window.utilidades.formatearBs(iva)}`;
  },

  refrescarTabla() {
    const catalogo = this.obtenerCatalogo();
    if (!catalogo) return;

    const busqueda = this.elementos.buscar ? this.elementos.buscar.value.toLowerCase().trim() : '';
    let registros = catalogo.obtenerTodos();

    if (busqueda) {
      registros = registros.filter(r => {
        if (this.pestañaActual === 'clientes' || this.pestañaActual === 'proveedores') {
          return (r.razonSocial || '').toLowerCase().includes(busqueda) ||
                 (r.nit || '').toLowerCase().includes(busqueda);
        } else if (this.pestañaActual === 'productos') {
          return (r.nombre || '').toLowerCase().includes(busqueda) ||
                 (r.codigo || '').toLowerCase().includes(busqueda);
        }
        return false;
      });
    }

    this.renderizarCabecera();

    if (registros.length === 0) {
      this.elementos.tablaBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: var(--espacio-xl); color: var(--texto-secundario);">
            📭 No hay registros que coincidan con la búsqueda.
          </td>
        </tr>
      `;
      return;
    }

    this.elementos.tablaBody.innerHTML = registros.map(r => this.renderizarFila(r)).join('');

    this.elementos.tablaBody.querySelectorAll('[data-accion]').forEach(btn => {
      btn.addEventListener('click', (e) => this.manejarAccion(e));
    });
  },

  renderizarCabecera() {
    let html = '<tr>';

    if (this.pestañaActual === 'clientes') {
      html += '<th>NIT</th><th>Razón Social</th><th>Teléfono</th><th>Saldo</th><th>Estado</th><th>Acciones</th>';
    } else if (this.pestañaActual === 'proveedores') {
      html += '<th>NIT</th><th>Razón Social</th><th>Cond. Pago</th><th>Por Pagar</th><th>Estado</th><th>Acciones</th>';
    } else if (this.pestañaActual === 'productos') {
      html += '<th>Código</th><th>Nombre</th><th>Stock</th><th>Precio Venta</th><th>Estado</th><th>Acciones</th>';
    }

    html += '</tr>';
    this.elementos.tablaHead.innerHTML = html;
  },

  renderizarFila(r) {
    const badge = r.estado === 'ACTIVO'
      ? '<span class="badge badge-validado">✓ Activo</span>'
      : '<span class="badge badge-rechazado">✗ Inactivo</span>';

    let celdas = '';

    if (this.pestañaActual === 'clientes') {
      celdas = `
        <td>${r.nit || '—'}</td>
        <td><strong>${r.razonSocial}</strong></td>
        <td>${r.telefono || '—'}</td>
        <td class="monto texto-derecha">${window.utilidades.formatearBs(r.saldoActual || 0)}</td>
        <td>${badge}</td>
      `;
    } else if (this.pestañaActual === 'proveedores') {
      celdas = `
        <td>${r.nit || '—'}</td>
        <td><strong>${r.razonSocial}</strong></td>
        <td>${r.condicionesPago || '—'}</td>
        <td class="monto texto-derecha">${window.utilidades.formatearBs(r.saldoPorPagar || 0)}</td>
        <td>${badge}</td>
      `;
    } else if (this.pestañaActual === 'productos') {
      const stockAlert = r.stockActual <= r.stockMinimo ? ' style="color: var(--color-error); font-weight: bold;"' : '';
      celdas = `
        <td><code>${r.codigo}</code></td>
        <td><strong>${r.nombre}</strong></td>
        <td${stockAlert}>${r.stockActual} / ${r.stockMinimo}</td>
        <td class="monto texto-derecha">${window.utilidades.formatearBs(r.precioVenta || 0)}</td>
        <td>${badge}</td>
      `;
    }

    const acciones = `
      <td class="texto-centro">
        <button class="btn btn-sm btn-outline" data-accion="editar" data-id="${r.id}" title="Editar">✏️</button>
        ${r.estado === 'ACTIVO'
          ? `<button class="btn btn-sm btn-danger" data-accion="desactivar" data-id="${r.id}" title="Desactivar">🚫</button>`
          : `<button class="btn btn-sm btn-secondary" data-accion="reactivar" data-id="${r.id}" title="Reactivar">✓</button>`
        }
      </td>
    `;

    return `<tr>${celdas}${acciones}</tr>`;
  },

  manejarAccion(e) {
    const btn = e.currentTarget;
    const accion = btn.dataset.accion;
    const id = btn.dataset.id;
    const catalogo = this.obtenerCatalogo();

    if (accion === 'editar') {
      this.editarRegistro(id);
    } else if (accion === 'desactivar') {
      if (!confirm('¿Desactivar este registro? (soft delete)')) return;
      const resultado = catalogo.eliminar(id, 'Desactivación manual desde UI');
      this.mostrarToast(
        resultado.exito ? '🚫 Registro desactivado' : `❌ ${resultado.mensaje}`,
        resultado.exito ? 'alerta' : 'error'
      );
    } else if (accion === 'reactivar') {
      const resultado = catalogo.reactivar(id);
      this.mostrarToast(
        resultado.exito ? '✅ Registro reactivado' : `❌ ${resultado.mensaje}`,
        resultado.exito ? 'exito' : 'error'
      );
    }
  },

  actualizarEstadisticas() {
    if (this.elementos.statsClientes) {
      this.elementos.statsClientes.textContent = window.CatalogoClientes.obtenerActivos().length;
    }
    if (this.elementos.statsProveedores) {
      this.elementos.statsProveedores.textContent = window.CatalogoProveedores.obtenerActivos().length;
    }
    if (this.elementos.statsProductos) {
      this.elementos.statsProductos.textContent = window.CatalogoProductos.obtenerActivos().length;
    }
    if (this.elementos.statsInventario) {
      const valor = window.CatalogoProductos.obtenerValorInventario();
      this.elementos.statsInventario.textContent = window.utilidades.formatearBs(valor);
    }
  },

  mostrarToast(mensaje, tipo = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `<span>${mensaje}</span>`;

    this.elementos.contenedorToasts.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toastSalida 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 4000);

    toast.addEventListener('click', () => toast.remove());
  }
};

// ──────────────────────────────────────────────────────────
// ARRANQUE AUTOMÁTICO con try/catch
// ──────────────────────────────────────────────────────────
try {
  console.log('📚 [ARRANQUE] Intentando inicializar CatalogosVista...');
  console.log('📚 [ARRANQUE] window.CatalogosVista existe:', !!window.CatalogosVista);

  if (window.CatalogosVista && typeof window.CatalogosVista.inicializar === 'function') {
    window.CatalogosVista.inicializar();
  } else {
    console.error('❌ CatalogosVista o su método inicializar no están disponibles');
  }
} catch (error) {
  console.error('❌ Error al inicializar CatalogosVista:', error);
  console.error('Stack:', error.stack);
}

console.log('📚 [FIN] catalogos-vista.js ejecutado');
