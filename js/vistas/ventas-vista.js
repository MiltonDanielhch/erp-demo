// ══════════════════════════════════════════════════════════════
// ventas-vista.js — ERP Contable Bolivia
// Lógica de la vista: Ventas y Cuentas por Cobrar
// ══════════════════════════════════════════════════════════════

window.VentasVista = {

  tabActivo: 'cotizacion',
  elementos: {},

  inicializar() {
    console.log('💰 VentasVista.inicializar()');
    this.capturarElementos();
    this.configurarEventListeners();
    this.cargarSelectores();
    this.refrescarTodo();
    console.log('✅ Vista Ventas lista');
  },

  capturarElementos() {
    const g = (id) => document.getElementById(id);
    this.elementos = {
      tabs: document.querySelectorAll('#tab-cotizacion, #tab-pedidos, #tab-despachos, #tab-facturas, #tab-cuentas-cobrar'),
      tabButtons: document.querySelectorAll('.tab'),

      // Cotizacion
      formCotizacion: g('form-cotizacion'),
      vtCliente: g('vt-cliente'),
      vtVigencia: g('vt-vigencia'),
      vtTablaProductos: g('vt-tabla-productos'),
      vtTotal: g('vt-total'),
      vtBtnAgregar: g('vt-btn-agregar-producto'),
      vtBtnLimpiar: g('vt-btn-limpiar'),
      vtObservaciones: g('vt-observaciones'),
      vtTablaCotizaciones: g('vt-tabla-cotizaciones'),

      // Pedidos
      vdTablaPedidos: g('vd-tabla-pedidos'),

      // Despacho
      formDespacho: g('form-despacho'),
      dsPedido: g('ds-pedido'),
      dsDespachadoPor: g('ds-despachado-por'),
      dsTablaProductos: g('ds-tabla-productos'),
      dsObservaciones: g('ds-observaciones'),

      // Factura
      formFactura: g('form-factura-venta'),
      fvPedido: g('fv-pedido'),
      fvFecha: g('fv-fecha'),
      fvNumero: g('fv-numero'),
      fvResumen: g('fv-resumen-impuestos'),
      fvTotal: g('fv-total'),
      fvNeto: g('fv-neto'),
      fvIva: g('fv-iva'),
      fvIt: g('fv-it'),

      // Cuentas por cobrar
      ccTotalPendiente: g('cc-total-pendiente'),
      ccTablaCuentas: g('cc-tabla-cuentas'),

      // Modal cobro
      modalCobro: g('modal-cobro'),
      cbBtnCerrar: g('cb-btn-cerrar'),
      cbBtnCancelar: g('cb-btn-cancelar'),
      formCobro: g('form-cobro'),
      cbCuentaId: g('cb-cuenta-id'),
      cbMonto: g('cb-monto'),
      cbMetodo: g('cb-metodo'),
      cbReferencia: g('cb-referencia'),
      cbFactura: g('cb-factura'),
      cbSaldo: g('cb-saldo'),

      toasts: g('contenedor-toasts')
    };

    if (this.elementos.modalCobro) document.body.appendChild(this.elementos.modalCobro);
  },

  configurarEventListeners() {
    const e = this.elementos;

    e.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => this.cambiarTab(btn.dataset.tab));
    });

    // Cotizacion
    e.vtBtnAgregar.addEventListener('click', () => this.agregarFilaProductoCotizacion());
    e.vtBtnLimpiar.addEventListener('click', () => this.limpiarFormCotizacion());
    e.formCotizacion.addEventListener('submit', (ev) => this.manejarCotizacion(ev));

    // Despacho
    e.dsPedido.addEventListener('change', () => this.cargarProductosDespacho());
    e.formDespacho.addEventListener('submit', (ev) => this.manejarDespacho(ev));

    // Factura
    e.fvPedido.addEventListener('change', () => this.calcularImpuestosFactura());
    e.formFactura.addEventListener('submit', (ev) => this.manejarFactura(ev));

    // Modal cobro
    e.cbBtnCerrar.addEventListener('click', () => this.cerrarModalCobro());
    e.cbBtnCancelar.addEventListener('click', () => this.cerrarModalCobro());
    e.formCobro.addEventListener('submit', (ev) => this.manejarCobro(ev));
  },

  cambiarTab(tab) {
    this.tabActivo = tab;
    this.elementos.tabButtons.forEach(btn => {
      btn.classList.toggle('tab-activo', btn.dataset.tab === tab);
    });
    this.elementos.tabs.forEach(cont => {
      cont.classList.toggle('oculto', cont.id !== `tab-${tab}`);
    });
    this.refrescarTodo();
  },

  cargarSelectores() {
    const clientes = window.CatalogoClientes.obtenerActivos();
    this.elementos.vtCliente.innerHTML = '<option value="">Seleccione cliente...</option>' +
      clientes.map(c => `<option value="${c.id}">${c.razonSocial}</option>`).join('');
  },

  // ──────────────────────────────────────────────────────────
  // COTIZACION
  // ──────────────────────────────────────────────────────────
  agregarFilaProductoCotizacion() {
    const productos = window.CatalogoProductos.obtenerTodos().filter(p => p.activo !== false);
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>
        <select class="form-select vt-producto">
          <option value="">Seleccione...</option>
          ${productos.map(p => `<option value="${p.id}" data-precio="${p.precioVenta}">${p.codigo} - ${p.nombre}</option>`).join('')}
        </select>
      </td>
      <td><input type="number" class="form-input vt-cantidad" min="1" value="1"></td>
      <td><input type="number" class="form-input vt-precio" step="0.01" min="0" value="0"></td>
      <td><input type="number" class="form-input vt-descuento" step="0.01" min="0" value="0"></td>
      <td class="texto-derecha vt-subtotal">Bs 0,00</td>
      <td class="texto-centro"><button type="button" class="btn btn-sm btn-danger vt-quitar">✕</button></td>
    `;
    this.elementos.vtTablaProductos.appendChild(fila);

    const select = fila.querySelector('.vt-producto');
    select.addEventListener('change', () => {
      const opcion = select.options[select.selectedIndex];
      if (opcion && opcion.dataset.precio) {
        fila.querySelector('.vt-precio').value = opcion.dataset.precio;
        this.recalcularTotalCotizacion();
      }
    });

    ['.vt-cantidad', '.vt-precio', '.vt-descuento'].forEach(sel => {
      fila.querySelector(sel).addEventListener('input', () => this.recalcularTotalCotizacion());
    });

    fila.querySelector('.vt-quitar').addEventListener('click', () => {
      fila.remove();
      this.recalcularTotalCotizacion();
    });
  },

  recalcularTotalCotizacion() {
    let total = 0;
    this.elementos.vtTablaProductos.querySelectorAll('tr').forEach(tr => {
      const cantidad = parseFloat(tr.querySelector('.vt-cantidad').value) || 0;
      const precio = parseFloat(tr.querySelector('.vt-precio').value) || 0;
      const descuento = parseFloat(tr.querySelector('.vt-descuento').value) || 0;
      const subtotal = (cantidad * precio) - descuento;
      tr.querySelector('.vt-subtotal').textContent = window.utilidades.formatearBs(subtotal);
      total += subtotal;
    });
    this.elementos.vtTotal.textContent = window.utilidades.formatearBs(total);
  },

  limpiarFormCotizacion() {
    this.elementos.formCotizacion.reset();
    this.elementos.vtTablaProductos.innerHTML = '';
    this.elementos.vtTotal.textContent = 'Bs 0,00';
  },

  manejarCotizacion(ev) {
    ev.preventDefault();
    const e = this.elementos;

    const productos = [];
    e.vtTablaProductos.querySelectorAll('tr').forEach(tr => {
      const productoId = tr.querySelector('.vt-producto').value;
      const cantidad = parseFloat(tr.querySelector('.vt-cantidad').value) || 0;
      const precio = parseFloat(tr.querySelector('.vt-precio').value) || 0;
      const descuento = parseFloat(tr.querySelector('.vt-descuento').value) || 0;
      if (productoId && cantidad > 0) {
        productos.push({ productoId, cantidad, precioUnitario: precio, descuento });
      }
    });

    const resultado = window.moduloVentas.crearCotizacion({
      clienteId: e.vtCliente.value,
      vigenciaDias: parseInt(e.vtVigencia.value, 10) || 7,
      observaciones: e.vtObservaciones.value.trim(),
      productos: productos
    });

    if (resultado.exito) {
      this.mostrarToast(`✅ Cotización ${resultado.cotizacion.numero} creada`, 'exito');
      this.limpiarFormCotizacion();
      this.refrescarCotizaciones();
    } else {
      this.mostrarToast(`❌ ${resultado.mensaje}: ${(resultado.errores || []).join(', ')}`, 'error');
    }
  },

  refrescarCotizaciones() {
    const cotizaciones = window.moduloVentas.obtenerCotizaciones();
    const tbody = this.elementos.vtTablaCotizaciones;

    if (cotizaciones.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:24px;">Sin cotizaciones.</td></tr>';
      return;
    }

    tbody.innerHTML = cotizaciones.map(c => `
      <tr>
        <td><strong>${c.numero}</strong></td>
        <td>${c.clienteNombre}</td>
        <td>${c.fechaEmision}</td>
        <td>${c.fechaVencimiento}</td>
        <td class="texto-derecha monto">${window.utilidades.formatearBs(c.montoTotal)}</td>
        <td>${this.badgeEstado(c.estado)}</td>
        <td class="texto-centro">
          ${c.estado === 'COTIZADA'
            ? `<button class="btn btn-sm btn-secondary" data-accion="confirmar" data-id="${c.id}">✓ Confirmar Pedido</button>`
            : ''}
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-accion="confirmar"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const r = window.moduloVentas.generarPedido(btn.dataset.id);
        this.mostrarToast(r.exito ? `✅ Pedido ${r.pedido.numero} generado` : `❌ ${r.mensaje}: ${(r.errores || []).join(', ')}`, r.exito ? 'exito' : 'error');
        this.refrescarTodo();
      });
    });
  },

  // ──────────────────────────────────────────────────────────
  // PEDIDOS
  // ──────────────────────────────────────────────────────────
  refrescarPedidos() {
    const pedidos = window.moduloVentas.obtenerPedidos();
    const tbody = this.elementos.vdTablaPedidos;

    if (pedidos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:24px;">Sin pedidos.</td></tr>';
      return;
    }

    tbody.innerHTML = pedidos.map(p => `
      <tr>
        <td><strong>${p.numero}</strong></td>
        <td>${p.cotizacionNumero}</td>
        <td>${p.clienteNombre}</td>
        <td>${p.fechaPedido}</td>
        <td class="texto-derecha monto">${window.utilidades.formatearBs(p.montoTotal)}</td>
        <td>${this.badgeEstado(p.estado)}</td>
        <td class="texto-centro">—</td>
      </tr>
    `).join('');
  },

  // ──────────────────────────────────────────────────────────
  // DESPACHO
  // ──────────────────────────────────────────────────────────
  cargarSelectPedidosDespacho() {
    const pendientes = window.moduloVentas.obtenerPedidos()
      .filter(p => p.estado === 'PEDIDO' || p.estado === 'PARCIALMENTE_DESPACHADO');
    this.elementos.dsPedido.innerHTML = '<option value="">Seleccione pedido pendiente...</option>' +
      pendientes.map(p => `<option value="${p.id}">${p.numero} — ${p.clienteNombre}</option>`).join('');
  },

  cargarProductosDespacho() {
    const pedidoId = this.elementos.dsPedido.value;
    const tbody = this.elementos.dsTablaProductos;
    if (!pedidoId) { tbody.innerHTML = ''; return; }

    const pedido = window.moduloVentas.obtenerPedidos().find(p => p.id === pedidoId);
    if (!pedido) return;

    tbody.innerHTML = pedido.productos.map(p => {
      const pendiente = p.cantidad - p.cantidadDespachada;
      const producto = window.CatalogoProductos.obtenerPorId(p.productoId);
      const stock = producto ? producto.stockActual : 0;
      return `
        <tr data-producto-id="${p.productoId}">
          <td>${p.nombre}</td>
          <td class="texto-derecha">${p.cantidad}</td>
          <td class="texto-derecha">${pendiente}</td>
          <td class="texto-derecha">${stock}</td>
          <td><input type="number" class="form-input ds-cantidad" min="0" max="${Math.min(pendiente, stock)}" value="0"></td>
        </tr>
      `;
    }).join('');
  },

  manejarDespacho(ev) {
    ev.preventDefault();
    const e = this.elementos;

    const productos = [];
    e.dsTablaProductos.querySelectorAll('tr').forEach(tr => {
      const cantidad = parseInt(tr.querySelector('.ds-cantidad').value, 10);
      if (cantidad > 0) {
        productos.push({ productoId: tr.dataset.productoId, cantidadDespachada: cantidad });
      }
    });

    if (productos.length === 0) {
      this.mostrarToast('❌ Indique al menos una cantidad a despachar', 'error');
      return;
    }

    const resultado = window.moduloVentas.registrarDespacho(e.dsPedido.value, {
      despachadoPor: e.dsDespachadoPor.value.trim(),
      observaciones: e.dsObservaciones.value.trim(),
      productos: productos
    });

    if (resultado.exito) {
      this.mostrarToast(`✅ ${resultado.mensaje}`, 'exito');
      e.formDespacho.reset();
      e.dsTablaProductos.innerHTML = '';
      this.refrescarTodo();
    } else {
      this.mostrarToast(`❌ ${resultado.mensaje}: ${(resultado.errores || []).join(', ')}`, 'error');
    }
  },

  // ──────────────────────────────────────────────────────────
  // FACTURA VENTA
  // ──────────────────────────────────────────────────────────
  cargarSelectPedidosFactura() {
    const despachados = window.moduloVentas.obtenerPedidos().filter(p => p.estado === 'DESPACHADO');
    this.elementos.fvPedido.innerHTML = '<option value="">Seleccione pedido despachado...</option>' +
      despachados.map(p => `<option value="${p.id}" data-monto="${p.montoTotal}">${p.numero} — ${p.clienteNombre}</option>`).join('');
  },

  calcularImpuestosFactura() {
    const select = this.elementos.fvPedido;
    const opcion = select.options[select.selectedIndex];
    if (!opcion || !opcion.dataset.monto) {
      this.elementos.fvResumen.classList.add('oculto');
      return;
    }

    const total = parseFloat(opcion.dataset.monto);
    const neto = window.utilidades.extraerNetoDeTotal(total);
    const iva = window.utilidades.calcularIVADeTotal(total);
    const it = window.utilidades.calcularIT(total);

    this.elementos.fvResumen.classList.remove('oculto');
    this.elementos.fvTotal.textContent = window.utilidades.formatearBs(total);
    this.elementos.fvNeto.textContent = window.utilidades.formatearBs(neto);
    this.elementos.fvIva.textContent = window.utilidades.formatearBs(iva);
    this.elementos.fvIt.textContent = window.utilidades.formatearBs(it);
  },

  manejarFactura(ev) {
    ev.preventDefault();
    const e = this.elementos;

    const resultado = window.moduloVentas.emitirFactura(e.fvPedido.value, {
      numeroFactura: e.fvNumero.value.trim() || undefined,
      fechaEmision: e.fvFecha.value
    });

    if (resultado.exito) {
      this.mostrarToast(`✅ ${resultado.mensaje}`, 'exito');
      e.formFactura.reset();
      e.fvResumen.classList.add('oculto');
      this.refrescarTodo();
    } else {
      this.mostrarToast(`❌ ${resultado.mensaje}: ${(resultado.errores || []).join(', ')}`, 'error');
    }
  },

  // ──────────────────────────────────────────────────────────
  // CUENTAS POR COBRAR
  // ──────────────────────────────────────────────────────────
  refrescarCuentasPorCobrar() {
    const cuentas = window.moduloVentas.obtenerCuentasPorCobrar();
    const total = window.moduloVentas.obtenerTotalPorCobrar();
    const tbody = this.elementos.ccTablaCuentas;

    this.elementos.ccTotalPendiente.textContent = window.utilidades.formatearBs(total.total);

    if (cuentas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:24px;">Sin cuentas por cobrar.</td></tr>';
      return;
    }

    tbody.innerHTML = cuentas.map(c => `
      <tr>
        <td><strong>${c.facturaNumero}</strong></td>
        <td>${c.clienteNombre}</td>
        <td>${c.fechaEmision}</td>
        <td>${c.fechaVencimiento}</td>
        <td class="texto-derecha">${window.utilidades.formatearBs(c.montoTotal)}</td>
        <td class="texto-derecha">${window.utilidades.formatearBs(c.montoPagado)}</td>
        <td class="texto-derecha monto"><strong>${window.utilidades.formatearBs(c.saldoPendiente)}</strong></td>
        <td>${this.badgeEstado(c.estado)}</td>
        <td class="texto-centro">
          ${c.estado !== 'COBRADA'
            ? `<button class="btn btn-sm btn-primary" data-accion="cobrar" data-id="${c.id}" data-factura="${c.facturaNumero}" data-saldo="${c.saldoPendiente}">💵 Cobrar</button>`
            : '—'}
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-accion="cobrar"]').forEach(btn => {
      btn.addEventListener('click', () => this.abrirModalCobro(btn));
    });
  },

  abrirModalCobro(btn) {
    const e = this.elementos;
    e.cbCuentaId.value = btn.dataset.id;
    e.cbFactura.textContent = btn.dataset.factura;
    e.cbSaldo.textContent = window.utilidades.formatearBs(parseFloat(btn.dataset.saldo));
    e.cbMonto.value = btn.dataset.saldo;
    e.modalCobro.classList.remove('oculto');
  },

  cerrarModalCobro() {
    this.elementos.modalCobro.classList.add('oculto');
  },

  manejarCobro(ev) {
    ev.preventDefault();
    const e = this.elementos;

    const resultado = window.moduloVentas.registrarCobro(e.cbCuentaId.value, {
      monto: parseFloat(e.cbMonto.value) || 0,
      metodoPago: e.cbMetodo.value,
      referencia: e.cbReferencia.value.trim()
    });

    if (resultado.exito) {
      this.mostrarToast(`✅ ${resultado.mensaje}`, 'exito');
      this.cerrarModalCobro();
      e.formCobro.reset();
      this.refrescarTodo();
    } else {
      this.mostrarToast(`❌ ${resultado.mensaje}`, 'error');
    }
  },

  // ──────────────────────────────────────────────────────────
  // UTILIDADES
  // ──────────────────────────────────────────────────────────
  refrescarTodo() {
    this.cargarSelectPedidosDespacho();
    this.cargarSelectPedidosFactura();
    this.refrescarCotizaciones();
    this.refrescarPedidos();
    this.refrescarCuentasPorCobrar();
  },

  badgeEstado(estado) {
    const mapa = {
      'COTIZADA': 'badge-pendiente',
      'PEDIDO_GENERADO': 'badge-info',
      'PEDIDO': 'badge-info',
      'PARCIALMENTE_DESPACHADO': 'badge-pendiente',
      'DESPACHADO': 'badge-validado',
      'FACTURADO': 'badge-validado',
      'COBRADA': 'badge-validado',
      'PENDIENTE': 'badge-pendiente',
      'PARCIALMENTE_COBRADA': 'badge-pendiente',
      'VENCIDA': 'badge-rechazado'
    };
    const clase = mapa[estado] || 'badge-info';
    return `<span class="badge ${clase}">${estado}</span>`;
  },

  mostrarToast(mensaje, tipo = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `<span>${mensaje}</span>`;
    this.elementos.toasts.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'toastSalida 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
    toast.addEventListener('click', () => toast.remove());
  }
};

// Arranque automático
try {
  if (window.VentasVista && typeof window.VentasVista.inicializar === 'function') {
    window.VentasVista.inicializar();
  }
} catch (error) {
  console.error('❌ Error al inicializar VentasVista:', error);
}