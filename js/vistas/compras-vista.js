// ══════════════════════════════════════════════════════════════
// compras-vista.js — ERP Contable Bolivia
// Lógica de la vista: Compras y Cuentas por Pagar
// ══════════════════════════════════════════════════════════════

window.ComprasVista = {

  tabActivo: 'solicitud',
  elementos: {},

  inicializar() {
    console.log('🛒 ComprasVista.inicializar()');
    this.capturarElementos();
    this.configurarEventListeners();
    this.cargarSelectores();
    this.refrescarTodo();
    console.log('✅ Vista Compras lista');
  },

  capturarElementos() {
    const g = (id) => document.getElementById(id);
    this.elementos = {
      tabs: document.querySelectorAll('#tab-solicitud, #tab-ordenes, #tab-recepciones, #tab-facturas, #tab-cuentas-pagar'),
      tabButtons: document.querySelectorAll('.tab'),

      // Solicitud
      formSolicitud: g('form-solicitud'),
      csSolicitante: g('cs-solicitante'),
      csDepartamento: g('cs-departamento'),
      csJustificacion: g('cs-justificacion'),
      csTablaProductos: g('cs-tabla-productos'),
      csBtnAgregar: g('cs-btn-agregar-producto'),
      csBtnLimpiar: g('cs-btn-limpiar'),
      csTablaSolicitudes: g('cs-tabla-solicitudes'),

      // Orden
      formOrden: g('form-orden'),
      coSolicitud: g('co-solicitud'),
      coProveedor: g('co-proveedor'),
      coCondiciones: g('co-condiciones'),
      coTablaProductos: g('co-tabla-productos'),
      coTotal: g('co-total'),
      coTablaOrdenes: g('co-tabla-ordenes'),

      // Recepcion
      formRecepcion: g('form-recepcion'),
      crOrden: g('cr-orden'),
      crRecibidoPor: g('cr-recibido-por'),
      crTablaProductos: g('cr-tabla-productos'),
      crObservaciones: g('cr-observaciones'),

      // Factura
      formFactura: g('form-factura-proveedor'),
      cfOrden: g('cf-orden'),
      cfNumero: g('cf-numero'),
      cfFecha: g('cf-fecha'),
      cfMonto: g('cf-monto'),
      cfDetalleIva: g('cf-detalle-iva'),
      cfCuf: g('cf-cuf'),

      // Cuentas por pagar
      cpTotalPendiente: g('cp-total-pendiente'),
      cpTablaCuentas: g('cp-tabla-cuentas'),

      // Modal pago
      modalPago: g('modal-pago'),
      pgBtnCerrar: g('pg-btn-cerrar'),
      pgBtnCancelar: g('pg-btn-cancelar'),
      formPago: g('form-pago'),
      pgCuentaId: g('pg-cuenta-id'),
      pgMonto: g('pg-monto'),
      pgMetodo: g('pg-metodo'),
      pgReferencia: g('pg-referencia'),
      pgFactura: g('pg-factura'),
      pgSaldo: g('pg-saldo'),

      toasts: g('contenedor-toasts')
    };

    // Mover modal al body (evita conflictos de position:fixed)
    if (this.elementos.modalPago) document.body.appendChild(this.elementos.modalPago);
  },

  configurarEventListeners() {
    const e = this.elementos;

    // Tabs
    e.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => this.cambiarTab(btn.dataset.tab));
    });

    // Solicitud
    e.csBtnAgregar.addEventListener('click', () => this.agregarFilaProductoSolicitud());
    e.csBtnLimpiar.addEventListener('click', () => this.limpiarFormSolicitud());
    e.formSolicitud.addEventListener('submit', (ev) => this.manejarSolicitud(ev));

    // Orden
    e.coSolicitud.addEventListener('change', () => this.cargarProductosOrden());
    e.formOrden.addEventListener('submit', (ev) => this.manejarOrden(ev));

    // Recepcion
    e.crOrden.addEventListener('change', () => this.cargarProductosRecepcion());
    e.formRecepcion.addEventListener('submit', (ev) => this.manejarRecepcion(ev));

    // Factura
    e.cfOrden.addEventListener('change', () => this.precargarMontoFactura());
    e.cfMonto.addEventListener('input', () => this.calcularIvaFactura());
    e.formFactura.addEventListener('submit', (ev) => this.manejarFactura(ev));

    // Modal pago
    e.pgBtnCerrar.addEventListener('click', () => this.cerrarModalPago());
    e.pgBtnCancelar.addEventListener('click', () => this.cerrarModalPago());
    e.formPago.addEventListener('submit', (ev) => this.manejarPago(ev));
  },

  // ──────────────────────────────────────────────────────────
  // TABS
  // ──────────────────────────────────────────────────────────
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

  // ──────────────────────────────────────────────────────────
  // SELECTORES
  // ──────────────────────────────────────────────────────────
  cargarSelectores() {
    const e = this.elementos;

    // Proveedores activos
    const proveedores = window.CatalogoProveedores.obtenerActivos();
    e.coProveedor.innerHTML = '<option value="">Seleccione proveedor...</option>' +
      proveedores.map(p => `<option value="${p.id}">${p.razonSocial}</option>`).join('');
  },

  // ──────────────────────────────────────────────────────────
  // SOLICITUD
  // ──────────────────────────────────────────────────────────
  agregarFilaProductoSolicitud() {
    const productos = window.CatalogoProductos.obtenerTodos().filter(p => p.activo !== false);
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>
        <select class="form-select cs-producto">
          <option value="">Seleccione...</option>
          ${productos.map(p => `<option value="${p.id}">${p.codigo} - ${p.nombre}</option>`).join('')}
        </select>
      </td>
      <td><input type="number" class="form-input cs-cantidad" min="1" value="1"></td>
      <td><input type="text" class="form-input cs-justificacion" placeholder="Motivo"></td>
      <td class="texto-centro"><button type="button" class="btn btn-sm btn-danger cs-quitar">✕</button></td>
    `;
    this.elementos.csTablaProductos.appendChild(fila);
    fila.querySelector('.cs-quitar').addEventListener('click', () => fila.remove());
  },

  limpiarFormSolicitud() {
    this.elementos.formSolicitud.reset();
    this.elementos.csTablaProductos.innerHTML = '';
  },

  manejarSolicitud(ev) {
    ev.preventDefault();
    const e = this.elementos;

    const filas = e.csTablaProductos.querySelectorAll('tr');
    const productos = [];
    filas.forEach(f => {
      const productoId = f.querySelector('.cs-producto').value;
      const cantidad = parseInt(f.querySelector('.cs-cantidad').value, 10);
      const justificacion = f.querySelector('.cs-justificacion').value;
      if (productoId && cantidad > 0) {
        productos.push({ productoId, cantidad, justificacion });
      }
    });

    const resultado = window.moduloCompras.solicitarCompra({
      solicitante: e.csSolicitante.value.trim(),
      departamento: e.csDepartamento.value,
      justificacion: e.csJustificacion.value.trim(),
      productos: productos
    });

    if (resultado.exito) {
      this.mostrarToast(`✅ Solicitud ${resultado.solicitud.numero} creada`, 'exito');
      this.limpiarFormSolicitud();
      this.refrescarSolicitudes();
    } else {
      this.mostrarToast(`❌ ${resultado.mensaje}: ${(resultado.errores || []).join(', ')}`, 'error');
    }
  },

  refrescarSolicitudes() {
    const solicitudes = window.moduloCompras.obtenerSolicitudes();
    const tbody = this.elementos.csTablaSolicitudes;

    if (solicitudes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:24px;">Sin solicitudes.</td></tr>';
      return;
    }

    tbody.innerHTML = solicitudes.map(s => `
      <tr>
        <td><strong>${s.numero}</strong></td>
        <td>${s.solicitante}</td>
        <td>${s.departamento}</td>
        <td class="texto-derecha">${s.productos.length}</td>
        <td>${this.badgeEstado(s.estado)}</td>
        <td class="texto-centro">
          ${s.estado === 'SOLICITADA'
            ? `<button class="btn btn-sm btn-secondary" data-accion="aprobar" data-id="${s.id}">✓ Aprobar</button>`
            : ''}
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-accion="aprobar"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const r = window.moduloCompras.aprobarSolicitud(btn.dataset.id, 'Usuario UI');
        this.mostrarToast(r.exito ? '✅ Solicitud aprobada' : `❌ ${r.mensaje}`, r.exito ? 'exito' : 'error');
        this.refrescarTodo();
      });
    });
  },

  // ──────────────────────────────────────────────────────────
  // ORDEN DE COMPRA
  // ──────────────────────────────────────────────────────────
  cargarSelectSolicitudes() {
    const aprobadas = window.moduloCompras.obtenerSolicitudes('APROBADA');
    this.elementos.coSolicitud.innerHTML = '<option value="">Seleccione solicitud aprobada...</option>' +
      aprobadas.map(s => `<option value="${s.id}">${s.numero} — ${s.solicitante}</option>`).join('');
  },

  cargarProductosOrden() {
    const solicitudId = this.elementos.coSolicitud.value;
    const tbody = this.elementos.coTablaProductos;
    if (!solicitudId) { tbody.innerHTML = ''; this.elementos.coTotal.textContent = 'Bs 0,00'; return; }

    const solicitud = window.moduloCompras.obtenerSolicitudes().find(s => s.id === solicitudId);
    if (!solicitud) return;

    tbody.innerHTML = solicitud.productos.map(p => `
      <tr data-producto-id="${p.productoId}">
        <td>${p.nombre}</td>
        <td class="texto-derecha">${p.cantidad}</td>
        <td><input type="number" class="form-input co-precio" step="0.01" min="0" value="0" data-cantidad="${p.cantidad}"></td>
        <td class="texto-derecha co-subtotal">Bs 0,00</td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.co-precio').forEach(inp => {
      inp.addEventListener('input', () => this.recalcularTotalOrden());
    });
  },

  recalcularTotalOrden() {
    let total = 0;
    this.elementos.coTablaProductos.querySelectorAll('tr').forEach(tr => {
      const precio = parseFloat(tr.querySelector('.co-precio').value) || 0;
      const cantidad = parseInt(tr.querySelector('.co-precio').dataset.cantidad, 10) || 0;
      const subtotal = precio * cantidad;
      tr.querySelector('.co-subtotal').textContent = window.utilidades.formatearBs(subtotal);
      total += subtotal;
    });
    this.elementos.coTotal.textContent = window.utilidades.formatearBs(total);
  },

  manejarOrden(ev) {
    ev.preventDefault();
    const e = this.elementos;

    const productos = [];
    e.coTablaProductos.querySelectorAll('tr').forEach(tr => {
      productos.push({
        productoId: tr.dataset.productoId,
        cantidad: parseInt(tr.querySelector('.co-precio').dataset.cantidad, 10),
        precioUnitario: parseFloat(tr.querySelector('.co-precio').value) || 0
      });
    });

    const resultado = window.moduloCompras.generarOrdenCompra(e.coSolicitud.value, {
      proveedorId: e.coProveedor.value,
      condicionesPago: e.coCondiciones.value,
      productos: productos
    });

    if (resultado.exito) {
      this.mostrarToast(`✅ Orden ${resultado.orden.numero} generada`, 'exito');
      e.formOrden.reset();
      e.coTablaProductos.innerHTML = '';
      e.coTotal.textContent = 'Bs 0,00';
      this.refrescarTodo();
    } else {
      this.mostrarToast(`❌ ${resultado.mensaje}`, 'error');
    }
  },

  refrescarOrdenes() {
    const ordenes = window.moduloCompras.obtenerOrdenes();
    const tbody = this.elementos.coTablaOrdenes;

    if (ordenes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:24px;">Sin órdenes.</td></tr>';
      return;
    }

    tbody.innerHTML = ordenes.map(o => `
      <tr>
        <td><strong>${o.numero}</strong></td>
        <td>${o.proveedorRazonSocial}</td>
        <td>${o.fechaOrden}</td>
        <td class="texto-derecha monto">${window.utilidades.formatearBs(o.montoTotal)}</td>
        <td>${this.badgeEstado(o.estado)}</td>
        <td class="texto-centro">—</td>
      </tr>
    `).join('');
  },

  // ──────────────────────────────────────────────────────────
  // RECEPCION
  // ──────────────────────────────────────────────────────────
  cargarSelectOrdenesRecepcion() {
    const pendientes = window.moduloCompras.obtenerOrdenes()
      .filter(o => o.estado === 'ORDENADA' || o.estado === 'PARCIALMENTE_RECIBIDA');
    this.elementos.crOrden.innerHTML = '<option value="">Seleccione orden pendiente...</option>' +
      pendientes.map(o => `<option value="${o.id}">${o.numero} — ${o.proveedorRazonSocial}</option>`).join('');
  },

  cargarProductosRecepcion() {
    const ordenId = this.elementos.crOrden.value;
    const tbody = this.elementos.crTablaProductos;
    if (!ordenId) { tbody.innerHTML = ''; return; }

    const orden = window.moduloCompras.obtenerOrdenes().find(o => o.id === ordenId);
    if (!orden) return;

    tbody.innerHTML = orden.productos.map(p => {
      const pendiente = p.cantidad - p.cantidadRecibida;
      return `
        <tr data-producto-id="${p.productoId}">
          <td>${p.nombre}</td>
          <td class="texto-derecha">${p.cantidad}</td>
          <td class="texto-derecha">${pendiente}</td>
          <td><input type="number" class="form-input cr-cantidad" min="0" max="${pendiente}" value="0" data-pendiente="${pendiente}"></td>
        </tr>
      `;
    }).join('');
  },

  manejarRecepcion(ev) {
    ev.preventDefault();
    const e = this.elementos;

    const productos = [];
    e.crTablaProductos.querySelectorAll('tr').forEach(tr => {
      const cantidad = parseInt(tr.querySelector('.cr-cantidad').value, 10);
      if (cantidad > 0) {
        productos.push({ productoId: tr.dataset.productoId, cantidadRecibida: cantidad });
      }
    });

    if (productos.length === 0) {
      this.mostrarToast('❌ Indique al menos una cantidad a recibir', 'error');
      return;
    }

    const resultado = window.moduloCompras.registrarRecepcion(e.crOrden.value, {
      recibidoPor: e.crRecibidoPor.value.trim(),
      observaciones: e.crObservaciones.value.trim(),
      productos: productos
    });

    if (resultado.exito) {
      this.mostrarToast(`✅ ${resultado.mensaje}`, 'exito');
      e.formRecepcion.reset();
      e.crTablaProductos.innerHTML = '';
      this.refrescarTodo();
    } else {
      this.mostrarToast(`❌ ${resultado.mensaje}: ${(resultado.errores || []).join(', ')}`, 'error');
    }
  },

  // ──────────────────────────────────────────────────────────
  // FACTURA PROVEEDOR
  // ──────────────────────────────────────────────────────────
  cargarSelectOrdenesFactura() {
    const recibidas = window.moduloCompras.obtenerOrdenes()
      .filter(o => o.estado === 'RECIBIDA' || o.estado === 'PARCIALMENTE_RECIBIDA');
    this.elementos.cfOrden.innerHTML = '<option value="">Seleccione orden recibida...</option>' +
      recibidas.map(o => `<option value="${o.id}" data-monto="${o.montoTotal}">${o.numero} — ${o.proveedorRazonSocial}</option>`).join('');
  },

  precargarMontoFactura() {
    const select = this.elementos.cfOrden;
    const opcion = select.options[select.selectedIndex];
    if (opcion && opcion.dataset.monto) {
      this.elementos.cfMonto.value = opcion.dataset.monto;
      this.calcularIvaFactura();
    }
  },

  calcularIvaFactura() {
    const total = parseFloat(this.elementos.cfMonto.value) || 0;
    const neto = window.utilidades.extraerNetoDeTotal(total);
    const iva = window.utilidades.calcularIVADeTotal(total);
    this.elementos.cfDetalleIva.textContent =
      `Neto: ${window.utilidades.formatearBs(neto)} | IVA: ${window.utilidades.formatearBs(iva)}`;
  },

  manejarFactura(ev) {
    ev.preventDefault();
    const e = this.elementos;

    const resultado = window.moduloCompras.registrarFacturaProveedor(e.cfOrden.value, {
      numeroFactura: e.cfNumero.value.trim(),
      cuf: e.cfCuf.value.trim() || undefined,
      fechaEmision: e.cfFecha.value,
      montoTotal: parseFloat(e.cfMonto.value) || 0
    });

    if (resultado.exito) {
      this.mostrarToast(`✅ ${resultado.mensaje}`, 'exito');
      e.formFactura.reset();
      e.cfDetalleIva.textContent = 'Neto: Bs 0,00 | IVA: Bs 0,00';
      this.refrescarTodo();
    } else {
      this.mostrarToast(`❌ ${resultado.mensaje}: ${(resultado.errores || []).join(', ')}`, 'error');
    }
  },

  // ──────────────────────────────────────────────────────────
  // CUENTAS POR PAGAR
  // ──────────────────────────────────────────────────────────
  refrescarCuentasPorPagar() {
    const cuentas = window.moduloCompras.obtenerCuentasPorPagar();
    const total = window.moduloCompras.obtenerTotalPendiente();
    const tbody = this.elementos.cpTablaCuentas;

    this.elementos.cpTotalPendiente.textContent = window.utilidades.formatearBs(total.total);

    if (cuentas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:24px;">Sin cuentas por pagar.</td></tr>';
      return;
    }

    tbody.innerHTML = cuentas.map(c => `
      <tr>
        <td><strong>${c.numeroFactura}</strong></td>
        <td>${c.proveedorRazonSocial}</td>
        <td>${c.fechaEmision}</td>
        <td>${c.fechaVencimiento}</td>
        <td class="texto-derecha">${window.utilidades.formatearBs(c.montoTotal)}</td>
        <td class="texto-derecha">${window.utilidades.formatearBs(c.montoPagado)}</td>
        <td class="texto-derecha monto"><strong>${window.utilidades.formatearBs(c.saldoPendiente)}</strong></td>
        <td>${this.badgeEstado(c.estado)}</td>
        <td class="texto-centro">
          ${c.estado !== 'PAGADA'
            ? `<button class="btn btn-sm btn-primary" data-accion="pagar" data-id="${c.id}" data-factura="${c.numeroFactura}" data-saldo="${c.saldoPendiente}">💰 Pagar</button>`
            : '—'}
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-accion="pagar"]').forEach(btn => {
      btn.addEventListener('click', () => this.abrirModalPago(btn));
    });
  },

  abrirModalPago(btn) {
    const e = this.elementos;
    e.pgCuentaId.value = btn.dataset.id;
    e.pgFactura.textContent = btn.dataset.factura;
    e.pgSaldo.textContent = window.utilidades.formatearBs(parseFloat(btn.dataset.saldo));
    e.pgMonto.value = btn.dataset.saldo;
    e.modalPago.classList.remove('oculto');
  },

  cerrarModalPago() {
    this.elementos.modalPago.classList.add('oculto');
  },

  manejarPago(ev) {
    ev.preventDefault();
    const e = this.elementos;

    const resultado = window.moduloCompras.registrarPago(e.pgCuentaId.value, {
      monto: parseFloat(e.pgMonto.value) || 0,
      metodoPago: e.pgMetodo.value,
      referencia: e.pgReferencia.value.trim()
    });

    if (resultado.exito) {
      this.mostrarToast(`✅ ${resultado.mensaje}`, 'exito');
      this.cerrarModalPago();
      e.formPago.reset();
      this.refrescarTodo();
    } else {
      this.mostrarToast(`❌ ${resultado.mensaje}`, 'error');
    }
  },

  // ──────────────────────────────────────────────────────────
  // UTILIDADES
  // ──────────────────────────────────────────────────────────
  refrescarTodo() {
    this.cargarSelectSolicitudes();
    this.cargarSelectOrdenesRecepcion();
    this.cargarSelectOrdenesFactura();
    this.refrescarSolicitudes();
    this.refrescarOrdenes();
    this.refrescarCuentasPorPagar();
  },

  badgeEstado(estado) {
    const mapa = {
      'SOLICITADA': 'badge-pendiente',
      'APROBADA': 'badge-info',
      'ORDENADA': 'badge-info',
      'PARCIALMENTE_RECIBIDA': 'badge-pendiente',
      'RECIBIDA': 'badge-validado',
      'FACTURADA': 'badge-validado',
      'PAGADA': 'badge-validado',
      'PENDIENTE': 'badge-pendiente',
      'PARCIAL': 'badge-pendiente',
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
  if (window.ComprasVista && typeof window.ComprasVista.inicializar === 'function') {
    window.ComprasVista.inicializar();
  }
} catch (error) {
  console.error('❌ Error al inicializar ComprasVista:', error);
}