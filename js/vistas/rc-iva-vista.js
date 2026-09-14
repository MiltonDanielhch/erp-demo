// ══════════════════════════════════════════════════════════════
// rc-iva-vista.js — Vista de RC-IVA con facturas
// ══════════════════════════════════════════════════════════════

window.RCIVAVista = {

  elementos: {},

  inicializar() {
    console.log('🧾 RCIVAVista.inicializar()');
    this.capturarElementos();
    this.configurarEventListeners();
    this.cargarEmpleados();
    this.cargarPeriodoActual();
    this.renderizar();
    console.log('✅ Vista RC-IVA lista');
  },

  capturarElementos() {
    const g = (id) => document.getElementById(id);
    this.elementos = {
      periodo: g('rciva-periodo'),
      btnVerResumen: g('rciva-btn-ver-resumen'),

      totalTeorico: g('rciva-total-teorico'),
      totalFacturas: g('rciva-total-facturas'),
      totalCompensado: g('rciva-total-compensado'),
      totalPagar: g('rciva-total-pagar'),

      tablaBody: g('rciva-tabla-body'),

      formFactura: g('form-factura'),
      facturaEmpleado: g('factura-empleado'),
      facturaNumero: g('factura-numero'),
      facturaNIT: g('factura-nit'),
      facturaCUF: g('factura-cuf'),
      facturaMonto: g('factura-monto'),
      facturaFecha: g('factura-fecha'),
      facturaDescripcion: g('factura-descripcion'),
      facturaIVACalculado: g('factura-iva-calculado'),

      facturasBody: g('rciva-facturas-body'),

      toasts: g('contenedor-toasts')
    };
  },

  configurarEventListeners() {
    this.elementos.btnVerResumen.addEventListener('click', () => this.renderizar());
    this.elementos.formFactura.addEventListener('submit', (e) => this.registrarFactura(e));
    this.elementos.facturaMonto.addEventListener('input', () => this.actualizarPreviewIVA());
  },

  cargarEmpleados() {
    const empleados = window.catalogoEmpleados.obtenerActivos();
    this.elementos.facturaEmpleado.innerHTML = empleados.map(e =>
      `<option value="${e.id}">${e.nombres} ${e.apellidos} (CI ${e.ci})</option>`
    ).join('');
  },

  cargarPeriodoActual() {
    const ahora = new Date();
    const periodo = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
    this.elementos.periodo.value = periodo;
  },

  // ══════════════════════════════════════════════════════════
  // UTILIDAD: Parsear números con formato boliviano/internacional
  // Acepta: "1500", "1,500", "1.500", "1500,00", "1500.00"
  // ══════════════════════════════════════════════════════════
  parsearMonto(valor) {
    if (valor === null || valor === undefined || valor === '') return 0;

    let str = String(valor).trim();

    // Detectar formato: si tiene coma Y punto, el último es el decimal
    const tieneComa = str.includes(',');
    const tienePunto = str.includes('.');

    if (tieneComa && tienePunto) {
      const ultimaComa = str.lastIndexOf(',');
      const ultimoPunto = str.lastIndexOf('.');
      if (ultimaComa > ultimoPunto) {
        // "1.500,00" → coma es decimal
        str = str.replace(/\./g, '').replace(',', '.');
      } else {
        // "1,500.00" → punto es decimal
        str = str.replace(/,/g, '');
      }
    } else if (tieneComa && !tienePunto) {
      // Solo coma: si hay exactamente 3 dígitos después, es miles
      const partes = str.split(',');
      if (partes.length === 2 && partes[1].length === 3) {
        // "1,500" → miles
        str = str.replace(',', '');
      } else {
        // "1500,50" o "1,5" → decimal
        str = str.replace(',', '.');
      }
    }
    // Si solo tiene punto o ninguno, ya está en formato JS

    const num = parseFloat(str);
    return isNaN(num) ? 0 : Math.round(num * 100) / 100;
  },

  // ── Renderizado ──────────────────────────────────────────────
  renderizar() {
    const periodo = this.elementos.periodo.value;
    if (!periodo) return;

    const resultado = window.moduloRCIVA.obtenerResumenPeriodo(periodo);

    // Totales
    this.elementos.totalTeorico.textContent = window.utilidades.formatearBs(resultado.totales.rcIVATeorico);
    this.elementos.totalFacturas.textContent = window.utilidades.formatearBs(resultado.totales.ivaFacturas);
    this.elementos.totalCompensado.textContent = window.utilidades.formatearBs(resultado.totales.compensado);
    this.elementos.totalPagar.textContent = window.utilidades.formatearBs(resultado.totales.aPagar);

    // Tabla por empleado
    if (resultado.resumen.length === 0) {
      this.elementos.tablaBody.innerHTML =
        '<tr><td colspan="8" style="text-align:center; padding:24px;">Sin empleados activos</td></tr>';
    } else {
      this.elementos.tablaBody.innerHTML = resultado.resumen.map(e => {
        const badgeCompensado = e.porcentajeCompensado >= 100
          ? '<span class="badge" style="background:#10b981; color:#fff;">100%</span>'
          : e.porcentajeCompensado > 0
            ? `<span class="badge" style="background:#f59e0b; color:#fff;">${e.porcentajeCompensado}%</span>`
            : '<span class="badge" style="background:#6b7280; color:#fff;">0%</span>';

        return `
          <tr>
            <td><code>${this._escapeHTML(e.empleadoCI)}</code></td>
            <td><strong>${this._escapeHTML(e.empleadoNombre)}</strong></td>
            <td class="texto-derecha">${window.utilidades.formatearBs(e.totalDevengado)}</td>
            <td class="texto-derecha">${window.utilidades.formatearBs(e.rcIVATeorico)}</td>
            <td class="texto-derecha">${e.cantidadFacturas}</td>
            <td class="texto-derecha">${window.utilidades.formatearBs(e.ivaFacturas)}</td>
            <td class="texto-derecha">${window.utilidades.formatearBs(e.aPagar)}</td>
            <td>${badgeCompensado}</td>
          </tr>
        `;
      }).join('');
    }

    // Facturas del primer empleado (o ninguno)
    this.renderizarFacturas();
  },

  renderizarFacturas() {
    const empleadoId = this.elementos.facturaEmpleado.value;
    const periodo = this.elementos.periodo.value;

    if (!empleadoId) {
      this.elementos.facturasBody.innerHTML =
        '<tr><td colspan="7" style="text-align:center; padding:24px;">Seleccione un empleado</td></tr>';
      return;
    }

    const facturas = window.moduloRCIVA.obtenerFacturasPorEmpleado(empleadoId, periodo);

    if (facturas.length === 0) {
      this.elementos.facturasBody.innerHTML =
        '<tr><td colspan="7" style="text-align:center; padding:24px;">Sin facturas en este período</td></tr>';
    } else {
      this.elementos.facturasBody.innerHTML = facturas.map(f => `
        <tr>
          <td>${f.fecha}</td>
          <td><code>${this._escapeHTML(f.numeroFactura)}</code></td>
          <td>${this._escapeHTML(f.nitEmisor)}</td>
          <td class="texto-derecha">${window.utilidades.formatearBs(f.monto)}</td>
          <td class="texto-derecha">${window.utilidades.formatearBs(f.iva)}</td>
          <td>${this._escapeHTML(f.descripcion || '—')}</td>
          <td>
            <button class="btn btn-sm btn-danger" data-accion="eliminar" data-id="${f.id}">🗑️</button>
          </td>
        </tr>
      `).join('');
    }

    // Listeners de eliminación
    this.elementos.facturasBody.querySelectorAll('[data-accion="eliminar"]').forEach(btn => {
      btn.addEventListener('click', () => this.eliminarFactura(btn.dataset.id));
    });
  },

  // ── Acciones ─────────────────────────────────────────────────
  actualizarPreviewIVA() {
    const monto = this.parsearMonto(this.elementos.facturaMonto.value);
    const iva = window.BOLIVIA.redondear2(monto - monto / 1.13);
    this.elementos.facturaIVACalculado.textContent = window.utilidades.formatearBs(iva);
  },

  registrarFactura(e) {
    e.preventDefault();

    const monto = this.parsearMonto(this.elementos.facturaMonto.value);

    // Validación de monto
    if (!monto || monto <= 0) {
      this.mostrarToast('⚠️ El monto debe ser mayor a 0', 'error');
      return;
    }

    const datos = {
      empleadoId: this.elementos.facturaEmpleado.value,
      numeroFactura: this.elementos.facturaNumero.value,
      nitEmisor: this.elementos.facturaNIT.value,
      cuf: this.elementos.facturaCUF.value,
      monto: monto,  // ← Ya parseado correctamente
      fecha: this.elementos.facturaFecha.value,
      descripcion: this.elementos.facturaDescripcion.value
    };

    const resultado = window.moduloRCIVA.registrarFactura(datos);

    if (resultado.exito) {
      this.mostrarToast(`✅ Factura registrada: ${resultado.factura.numeroFactura} — IVA ${window.utilidades.formatearBs(resultado.factura.iva)}`, 'exito');
      this.elementos.formFactura.reset();
      this.elementos.facturaFecha.value = new Date().toISOString().split('T')[0];
      this.elementos.facturaIVACalculado.textContent = 'Bs 0';
      this.renderizar();
    } else {
      this.mostrarToast(`❌ ${(resultado.errores || []).join(' | ')}`, 'error');
    }
  },

  eliminarFactura(facturaId) {
    const resultado = window.moduloRCIVA.eliminarFactura(facturaId);
    if (resultado.exito) {
      this.mostrarToast(`🗑️ Factura eliminada: ${resultado.factura.numeroFactura}`, 'info');
      this.renderizar();
    } else {
      this.mostrarToast(`❌ ${(resultado.errores || []).join(' | ')}`, 'error');
    }
  },

  // ── Utilidades ───────────────────────────────────────────────
  _escapeHTML(texto) {
    if (!texto) return '';
    return String(texto)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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

try {
  if (window.RCIVAVista && typeof window.RCIVAVista.inicializar === 'function') {
    window.RCIVAVista.inicializar();
  }
} catch (error) {
  console.error('❌ Error al inicializar RCIVAVista:', error);
}
