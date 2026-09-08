// ══════════════════════════════════════════════════════════════
// inventario-vista.js — ERP Contable Bolivia
// Lógica de la vista: Inventario y Kardex
// ══════════════════════════════════════════════════════════════

const InventarioVista = {

  productoSeleccionado: null,
  elementos: {},

  inicializar() {
    console.log('📦 InventarioVista.inicializar()');
    this.capturarElementos();
    this.configurarEventListeners();
    this.actualizarEstadisticas();
    this.refrescarTabla();
    console.log('✅ Vista Inventario lista');
  },

  capturarElementos() {
    this.elementos = {
      statsValor: document.getElementById('stats-valor-inventario'),
      statsProductosStock: document.getElementById('stats-productos-stock'),
      statsStockBajo: document.getElementById('stats-stock-bajo'),
      statsSinStock: document.getElementById('stats-sin-stock'),

      btnAjuste: document.getElementById('btn-ajuste-inventario'),
      btnExportar: document.getElementById('btn-exportar-kardex'),
      btnRefrescar: document.getElementById('btn-refrescar'),
      buscar: document.getElementById('buscar-producto'),

      tablaProductos: document.getElementById('tabla-productos-body'),

      modalKardex: document.getElementById('modal-kardex'),
      btnCerrarKardex: document.getElementById('btn-cerrar-kardex'),
      kardexTitulo: document.getElementById('kardex-titulo'),
      kardexCodigo: document.getElementById('kardex-codigo'),
      kardexNombre: document.getElementById('kardex-nombre'),
      kardexStock: document.getElementById('kardex-stock'),
      kardexCosto: document.getElementById('kardex-costo'),
      kardexValor: document.getElementById('kardex-valor'),
      kardexMovimientos: document.getElementById('kardex-movimientos'),
      
      kardexFechaInicio: document.getElementById('kardex-fecha-inicio'),
      kardexFechaFin: document.getElementById('kardex-fecha-fin'),
      kardexTipoFiltro: document.getElementById('kardex-tipo-filtro'),
      btnFiltrarKardex: document.getElementById('btn-filtrar-kardex'),
      btnLimpiarFiltros: document.getElementById('btn-limpiar-filtros'),
      
      tablaKardex: document.getElementById('tabla-kardex-body'),
      kardexTotalEntradas: document.getElementById('kardex-total-entradas'),
      kardexTotalSalidas: document.getElementById('kardex-total-salidas'),
      kardexValorNeto: document.getElementById('kardex-valor-neto'),
      kardexTotalMovimientos: document.getElementById('kardex-total-movimientos'),

      modalAjuste: document.getElementById('modal-ajuste'),
      btnCerrarAjuste: document.getElementById('btn-cerrar-ajuste'),
      btnCancelarAjuste: document.getElementById('btn-cancelar-ajuste'),
      formAjuste: document.getElementById('form-ajuste'),
      ajusteProducto: document.getElementById('ajuste-producto'),
      ajusteStockSistema: document.getElementById('ajuste-stock-sistema'),
      ajusteStockReal: document.getElementById('ajuste-stock-real'),
      ajusteDiferencia: document.getElementById('ajuste-diferencia'),

      contenedorToasts: document.getElementById('contenedor-toasts')
    };
    
    // ── NUEVO: Mover modales al <body> ──
    // Esto evita que el contenedor del enrutador (#contenido)
    // con transform/overflow rompa el position:fixed del modal.
    if (this.elementos.modalKardex) {
      document.body.appendChild(this.elementos.modalKardex);
    }
    if (this.elementos.modalAjuste) {
      document.body.appendChild(this.elementos.modalAjuste);
    }
  },

  configurarEventListeners() {
    // Botones principales
    this.elementos.btnAjuste.addEventListener('click', () => this.abrirModalAjuste());
    this.elementos.btnExportar.addEventListener('click', () => this.exportarKardex());
    this.elementos.btnRefrescar.addEventListener('click', () => {
      this.actualizarEstadisticas();
      this.refrescarTabla();
    });

    // Búsqueda
    this.elementos.buscar.addEventListener('input', () => this.refrescarTabla());

    // Modal Kardex
    this.elementos.btnCerrarKardex.addEventListener('click', () => this.cerrarModalKardex());
    this.elementos.btnFiltrarKardex.addEventListener('click', () => this.filtrarKardex());
    this.elementos.btnLimpiarFiltros.addEventListener('click', () => this.limpiarFiltrosKardex());

    // Modal Ajuste
    this.elementos.btnCerrarAjuste.addEventListener('click', () => this.cerrarModalAjuste());
    this.elementos.btnCancelarAjuste.addEventListener('click', () => this.cerrarModalAjuste());
    this.elementos.formAjuste.addEventListener('submit', (e) => this.manejarAjuste(e));
    
    // Cambio en producto del ajuste
    this.elementos.ajusteProducto.addEventListener('change', (e) => {
      const producto = window.CatalogoProductos.obtenerPorId(e.target.value);
      if (producto) {
        this.elementos.ajusteStockSistema.value = producto.stockActual;
      }
    });

    // Cambio en stock real (calcular diferencia)
    this.elementos.ajusteStockReal.addEventListener('input', () => {
      const sistema = parseInt(this.elementos.ajusteStockSistema.value) || 0;
      const real = parseInt(this.elementos.ajusteStockReal.value) || 0;
      this.elementos.ajusteDiferencia.value = real - sistema;
    });

    // Eventos del sistema
    window.addEventListener('erp:inventario-entrada', () => {
      this.actualizarEstadisticas();
      this.refrescarTabla();
      if (this.productoSeleccionado) {
        this.cargarKardex(this.productoSeleccionado);
      }
    });

    window.addEventListener('erp:inventario-salida', () => {
      this.actualizarEstadisticas();
      this.refrescarTabla();
      if (this.productoSeleccionado) {
        this.cargarKardex(this.productoSeleccionado);
      }
    });

    window.addEventListener('erp:inventario-ajuste', () => {
      this.actualizarEstadisticas();
      this.refrescarTabla();
      if (this.productoSeleccionado) {
        this.cargarKardex(this.productoSeleccionado);
      }
    });
  },

  // ──────────────────────────────────────────────────────────
  // ESTADÍSTICAS
  // ──────────────────────────────────────────────────────────
  actualizarEstadisticas() {
    const valor = window.moduloInventario.obtenerValorInventario();
    const alertas = window.moduloInventario.verificarStockBajo();

    if (this.elementos.statsValor) {
      this.elementos.statsValor.textContent = window.utilidades.formatearBs(valor.valorTotal);
    }
    if (this.elementos.statsProductosStock) {
      this.elementos.statsProductosStock.textContent = valor.cantidadProductos;
    }
    if (this.elementos.statsStockBajo) {
      this.elementos.statsStockBajo.textContent = alertas.stockBajo.length;
    }
    if (this.elementos.statsSinStock) {
      this.elementos.statsSinStock.textContent = alertas.sinStock.length;
    }
  },

  // ──────────────────────────────────────────────────────────
  // TABLA DE PRODUCTOS
  // ──────────────────────────────────────────────────────────
  refrescarTabla() {
    const productos = window.CatalogoProductos.obtenerTodos()
      .filter(p => p.activo !== false);

    const busqueda = this.elementos.buscar.value.toLowerCase().trim();

    let productosFiltrados = productos;
    if (busqueda) {
      productosFiltrados = productos.filter(p =>
        (p.codigo || '').toLowerCase().includes(busqueda) ||
        (p.nombre || '').toLowerCase().includes(busqueda) ||
        (p.categoria || '').toLowerCase().includes(busqueda)
      );
    }

    if (productosFiltrados.length === 0) {
      this.elementos.tablaProductos.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: var(--espacio-xl); color: var(--texto-secundario);">
            📦 No se encontraron productos que coincidan con la búsqueda.
          </td>
        </tr>
      `;
      return;
    }

    this.elementos.tablaProductos.innerHTML = productosFiltrados
      .map(p => this.renderizarFilaProducto(p))
      .join('');

    // Event listeners a botones
    this.elementos.tablaProductos.querySelectorAll('[data-accion]').forEach(btn => {
      btn.addEventListener('click', (e) => this.manejarAccionProducto(e));
    });
  },

  renderizarFilaProducto(p) {
    const costoPromedio = p.costoPromedio || p.costoUltimo || 0;
    const valorTotal = p.stockActual * costoPromedio;

    let estado = '';
    if (p.stockActual === 0) {
      estado = '<span class="badge badge-rechazado">🚫 Sin Stock</span>';
    } else if (p.stockActual <= p.stockMinimo) {
      estado = '<span class="badge badge-pendiente">⚠️ Stock Bajo</span>';
    } else {
      estado = '<span class="badge badge-validado">✓ OK</span>';
    }

    const stockAlert = p.stockActual <= p.stockMinimo ? ' style="color: var(--color-error); font-weight: bold;"' : '';

    return `
      <tr>
        <td><code>${p.codigo}</code></td>
        <td><strong>${p.nombre}</strong></td>
        <td>${p.categoria || '-'}</td>
        <td${stockAlert} class="texto-derecha">${p.stockActual}</td>
        <td class="texto-derecha">${p.stockMinimo}</td>
        <td class="texto-derecha">${window.utilidades.formatearBs(costoPromedio)}</td>
        <td class="texto-derecha monto"><strong>${window.utilidades.formatearBs(valorTotal)}</strong></td>
        <td>${estado}</td>
        <td class="texto-centro">
          <button class="btn btn-sm btn-primary" data-accion="ver-kardex" data-id="${p.id}" title="Ver Kardex">📊</button>
        </td>
      </tr>
    `;
  },

  manejarAccionProducto(e) {
    const btn = e.currentTarget;
    const accion = btn.dataset.accion;
    const id = btn.dataset.id;

    if (accion === 'ver-kardex') {
      this.abrirModalKardex(id);
    }
  },

  // ──────────────────────────────────────────────────────────
  // MODAL KARDEX
  // ──────────────────────────────────────────────────────────
  abrirModalKardex(productoId) {
    const producto = window.CatalogoProductos.obtenerPorId(productoId);
    if (!producto) {
      this.mostrarToast('❌ Producto no encontrado', 'error');
      return;
    }

    this.productoSeleccionado = productoId;
    this.elementos.modalKardex.classList.remove('oculto');

    // Actualizar resumen
    this.elementos.kardexTitulo.textContent = `📊 Kardex: ${producto.nombre}`;
    this.elementos.kardexCodigo.textContent = producto.codigo;
    this.elementos.kardexNombre.textContent = producto.nombre;
    this.elementos.kardexStock.textContent = producto.stockActual;
    
    const costoPromedio = producto.costoPromedio || producto.costoUltimo || 0;
    this.elementos.kardexCosto.textContent = window.utilidades.formatearBs(costoPromedio);
    this.elementos.kardexValor.textContent = window.utilidades.formatearBs(producto.stockActual * costoPromedio);

    // Cargar kardex
    this.cargarKardex(productoId);
  },

  cargarKardex(productoId) {
    const filtros = { productoId };

    if (this.elementos.kardexFechaInicio.value) {
      filtros.fechaInicio = this.elementos.kardexFechaInicio.value;
    }
    if (this.elementos.kardexFechaFin.value) {
      filtros.fechaFin = this.elementos.kardexFechaFin.value;
    }
    if (this.elementos.kardexTipoFiltro.value) {
      filtros.tipo = this.elementos.kardexTipoFiltro.value;
    }

    const kardex = window.moduloInventario.obtenerKardex(filtros);

    this.elementos.kardexMovimientos.textContent = kardex.cantidadMovimientos;

    if (kardex.movimientos.length === 0) {
      this.elementos.tablaKardex.innerHTML = `
        <tr>
          <td colspan="11" style="text-align: center; padding: var(--espacio-xl); color: var(--texto-secundario);">
            📋 No hay movimientos registrados para este producto en el período seleccionado.
          </td>
        </tr>
      `;
    } else {
      this.elementos.tablaKardex.innerHTML = kardex.movimientos
        .map(m => this.renderizarFilaKardex(m))
        .join('');
    }

    // Actualizar resumen
    this.elementos.kardexTotalEntradas.textContent = window.utilidades.formatearBs(kardex.totalEntradas);
    this.elementos.kardexTotalSalidas.textContent = window.utilidades.formatearBs(kardex.totalSalidas);
    this.elementos.kardexValorNeto.textContent = window.utilidades.formatearBs(kardex.valorNeto);
    this.elementos.kardexTotalMovimientos.textContent = kardex.cantidadMovimientos;
  },

  renderizarFilaKardex(m) {
    const badgeTipo = m.tipo === 'ENTRADA'
      ? '<span class="badge-entrada">📥 ENTRADA</span>'
      : '<span class="badge-salida">📤 SALIDA</span>';

    const fecha = window.utilidades.formatearFecha(m.fecha);

    return `
      <tr>
        <td>${fecha}</td>
        <td>${badgeTipo}</td>
        <td>${m.motivo || '-'}</td>
        <td><small>${m.referencia || '-'}</small></td>
        <td class="texto-derecha">${m.cantidad}</td>
        <td class="texto-derecha">${window.utilidades.formatearBs(m.costoUnitario)}</td>
        <td class="texto-derecha monto"><strong>${window.utilidades.formatearBs(m.valorTotal)}</strong></td>
        <td class="texto-derecha">${m.stockAnterior}</td>
        <td class="texto-derecha"><strong>${m.stockNuevo}</strong></td>
        <td class="texto-derecha">${window.utilidades.formatearBs(m.costoPromedioAnterior)}</td>
        <td class="texto-derecha"><strong>${window.utilidades.formatearBs(m.costoPromedioNuevo)}</strong></td>
      </tr>
    `;
  },

  cerrarModalKardex() {
    this.elementos.modalKardex.classList.add('oculto');
    this.productoSeleccionado = null;
  },

  filtrarKardex() {
    if (!this.productoSeleccionado) return;
    this.cargarKardex(this.productoSeleccionado);
  },

  limpiarFiltrosKardex() {
    this.elementos.kardexFechaInicio.value = '';
    this.elementos.kardexFechaFin.value = '';
    this.elementos.kardexTipoFiltro.value = '';
    if (this.productoSeleccionado) {
      this.cargarKardex(this.productoSeleccionado);
    }
  },

  // ──────────────────────────────────────────────────────────
  // MODAL AJUSTE
  // ──────────────────────────────────────────────────────────
  abrirModalAjuste() {
    const productos = window.CatalogoProductos.obtenerTodos()
      .filter(p => p.activo !== false);

    this.elementos.ajusteProducto.innerHTML = '<option value="">Seleccione un producto...</option>' +
      productos.map(p => `<option value="${p.id}">${p.codigo} - ${p.nombre}</option>`).join('');

    this.elementos.formAjuste.reset();
    this.elementos.ajusteStockSistema.value = '';
    this.elementos.ajusteDiferencia.value = '';
    
    this.elementos.modalAjuste.classList.remove('oculto');
  },

  cerrarModalAjuste() {
    this.elementos.modalAjuste.classList.add('oculto');
  },

  manejarAjuste(e) {
    e.preventDefault();

    const formData = new FormData(this.elementos.formAjuste);
    const datos = {
      productoId: formData.get('productoId'),
      cantidadReal: parseInt(formData.get('cantidadReal'), 10),
      motivo: formData.get('motivo'),
      referencia: formData.get('referencia') || 'AJUSTE_MANUAL'
    };

    if (!datos.productoId) {
      this.mostrarToast('❌ Seleccione un producto', 'error');
      return;
    }

    if (isNaN(datos.cantidadReal) || datos.cantidadReal < 0) {
      this.mostrarToast('❌ El stock físico debe ser un número positivo', 'error');
      return;
    }

    const resultado = window.moduloInventario.registrarAjuste(datos);

    if (resultado.exito) {
      this.mostrarToast(`✅ ${resultado.mensaje}`, 'exito');
      this.cerrarModalAjuste();
      this.actualizarEstadisticas();
      this.refrescarTabla();
    } else {
      this.mostrarToast(`❌ ${resultado.mensaje}`, 'error');
    }
  },

  // ──────────────────────────────────────────────────────────
  // EXPORTAR KARDEX
  // ──────────────────────────────────────────────────────────
  exportarKardex() {
    const productos = window.CatalogoProductos.obtenerTodos()
      .filter(p => p.activo !== false);

    let csv = 'Código,Producto,Stock Actual,Costo Promedio,Valor Total\n';

    productos.forEach(p => {
      const costoPromedio = p.costoPromedio || p.costoUltimo || 0;
      const valorTotal = p.stockActual * costoPromedio;
      csv += `"${p.codigo}","${p.nombre}",${p.stockActual},${costoPromedio.toFixed(2)},${valorTotal.toFixed(2)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventario_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    this.mostrarToast('✅ Inventario exportado a CSV', 'exito');
  },

  // ──────────────────────────────────────────────────────────
  // TOASTS
  // ──────────────────────────────────────────────────────────
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

// Arranque automático
try {
  console.log('📦 [ARRANQUE] Intentando inicializar InventarioVista...');
  if (typeof InventarioVista !== 'undefined' && typeof InventarioVista.inicializar === 'function') {
    InventarioVista.inicializar();
  } else {
    console.error('❌ InventarioVista o su método inicializar no están disponibles');
  }
} catch (error) {
  console.error('❌ Error al inicializar InventarioVista:', error);
}