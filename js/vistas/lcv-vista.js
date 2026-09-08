// ══════════════════════════════════════════════════════════════
// lcv-vista.js — ERP Contable Bolivia
// Lógica de la vista: Libro de Compras y Ventas
// ══════════════════════════════════════════════════════════════

window.LCVVista = {

  lcvActual: null,
  elementos: {},

  inicializar() {
    console.log('📋 LCVVista.inicializar()');
    this.capturarElementos();
    this.configurarEventListeners();
    this.cargarPeriodos();
    console.log('✅ Vista LCV lista');
  },

  capturarElementos() {
    const g = (id) => document.getElementById(id);
    this.elementos = {
      selectPeriodo: g('lcv-periodo'),
      btnGenerar: g('lcv-btn-generar'),
      btnExportar: g('lcv-btn-exportar'),
      contenido: g('lcv-contenido'),

      // Compras
      comprasBody: g('lcv-compras-body'),
      comprasFoot: g('lcv-compras-foot'),
      comprasTotal: g('lcv-compras-total'),
      comprasNeto: g('lcv-compras-neto'),
      comprasIVA: g('lcv-compras-iva'),

      // Ventas
      ventasBody: g('lcv-ventas-body'),
      ventasFoot: g('lcv-ventas-foot'),
      ventasTotal: g('lcv-ventas-total'),
      ventasNeto: g('lcv-ventas-neto'),
      ventasIVA: g('lcv-ventas-iva'),
      ventasIT: g('lcv-ventas-it'),

      // Resumen
      ivaDebito: g('lcv-iva-debito'),
      ivaCredito: g('lcv-iva-credito'),
      ivaPagar: g('lcv-iva-pagar'),
      itPagar: g('lcv-it-pagar'),

      toasts: g('contenedor-toasts')
    };
  },

  configurarEventListeners() {
    this.elementos.btnGenerar.addEventListener('click', () => this.generarLCV());
    this.elementos.btnExportar.addEventListener('click', () => this.exportarCSV());
  },

  cargarPeriodos() {
    const periodos = window.libroComprasVentas.obtenerPeriodosConMovimientos();
    this.elementos.selectPeriodo.innerHTML = '<option value="">Seleccione un período...</option>';

    if (periodos.length === 0) {
      this.elementos.selectPeriodo.innerHTML += '<option value="" disabled>No hay períodos con movimientos</option>';
      return;
    }

    periodos.forEach(p => {
      const [anio, mes] = p.split('-');
      const nombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const nombreMes = nombres[parseInt(mes, 10) - 1];
      this.elementos.selectPeriodo.innerHTML += `<option value="${p}">${nombreMes} ${anio}</option>`;
    });

    // Seleccionar el más reciente por defecto
    if (periodos.length > 0) {
      this.elementos.selectPeriodo.value = periodos[0];
    }
  },

  generarLCV() {
    const periodo = this.elementos.selectPeriodo.value;
    if (!periodo) {
      this.mostrarToast('❌ Seleccione un período', 'error');
      return;
    }

    this.lcvActual = window.libroComprasVentas.generarLCV(periodo);
    this.renderizarLCV();
    this.elementos.contenido.classList.remove('oculto');
    this.elementos.btnExportar.disabled = false;
  },

  renderizarLCV() {
    const lcv = this.lcvActual;

    // ── COMPRAS ──
    if (lcv.compras.registros.length === 0) {
      this.elementos.comprasBody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:24px;">Sin compras en este período</td></tr>';
      this.elementos.comprasFoot.style.display = 'none';
    } else {
      this.elementos.comprasBody.innerHTML = lcv.compras.registros.map(c => `
        <tr>
          <td>${c.nitProveedor}</td>
          <td>${c.razonSocialProveedor}</td>
          <td>${c.numeroFactura}</td>
          <td><code style="font-size:0.75rem;">${c.cuf.substring(0, 20)}...</code></td>
          <td>${c.fechaEmision}</td>
          <td class="texto-derecha">${window.utilidades.formatearBs(c.montoTotal)}</td>
          <td class="texto-derecha">${window.utilidades.formatearBs(c.montoNeto)}</td>
          <td class="texto-derecha">${window.utilidades.formatearBs(c.montoIVA)}</td>
        </tr>
      `).join('');

      this.elementos.comprasTotal.textContent = window.utilidades.formatearBs(lcv.compras.totalGeneral);
      this.elementos.comprasNeto.textContent = window.utilidades.formatearBs(lcv.compras.totalNeto);
      this.elementos.comprasIVA.textContent = window.utilidades.formatearBs(lcv.compras.totalIVA);
      this.elementos.comprasFoot.style.display = 'table-footer-group';
    }

    // ── VENTAS ──
    if (lcv.ventas.registros.length === 0) {
      this.elementos.ventasBody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:24px;">Sin ventas en este período</td></tr>';
      this.elementos.ventasFoot.style.display = 'none';
    } else {
      this.elementos.ventasBody.innerHTML = lcv.ventas.registros.map(v => `
        <tr>
          <td>${v.nitCliente}</td>
          <td>${v.razonSocialCliente}</td>
          <td>${v.numeroFactura}</td>
          <td><code style="font-size:0.75rem;">${v.cuf.substring(0, 20)}...</code></td>
          <td>${v.fechaEmision}</td>
          <td class="texto-derecha">${window.utilidades.formatearBs(v.montoTotal)}</td>
          <td class="texto-derecha">${window.utilidades.formatearBs(v.montoNeto)}</td>
          <td class="texto-derecha">${window.utilidades.formatearBs(v.montoIVA)}</td>
          <td class="texto-derecha">${window.utilidades.formatearBs(v.montoIT)}</td>
        </tr>
      `).join('');

      this.elementos.ventasTotal.textContent = window.utilidades.formatearBs(lcv.ventas.totalGeneral);
      this.elementos.ventasNeto.textContent = window.utilidades.formatearBs(lcv.ventas.totalNeto);
      this.elementos.ventasIVA.textContent = window.utilidades.formatearBs(lcv.ventas.totalIVA);
      this.elementos.ventasIT.textContent = window.utilidades.formatearBs(lcv.ventas.totalIT);
      this.elementos.ventasFoot.style.display = 'table-footer-group';
    }

    // ── RESUMEN ──
    this.elementos.ivaDebito.textContent = window.utilidades.formatearBs(lcv.resumen.ivaDebito);
    this.elementos.ivaCredito.textContent = window.utilidades.formatearBs(lcv.resumen.ivaCredito);
    this.elementos.ivaPagar.textContent = window.utilidades.formatearBs(lcv.resumen.ivaPorPagar);
    this.elementos.itPagar.textContent = window.utilidades.formatearBs(lcv.resumen.itPorPagar);

    // Colorear IVA por pagar según si es a pagar o a favor
    if (lcv.resumen.saldoAFavor) {
      this.elementos.ivaPagar.style.color = 'var(--color-exito)';
    } else {
      this.elementos.ivaPagar.style.color = 'var(--color-error)';
    }
  },

  exportarCSV() {
    if (!this.lcvActual) {
      this.mostrarToast('❌ Primero genere el LCV', 'error');
      return;
    }

    const csv = window.libroComprasVentas.exportarCSV(this.lcvActual.periodoContable);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LCV_${this.lcvActual.periodoContable}.csv`;
    link.click();

    this.mostrarToast('✅ LCV exportado a CSV', 'exito');
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
  if (window.LCVVista && typeof window.LCVVista.inicializar === 'function') {
    window.LCVVista.inicializar();
  }
} catch (error) {
  console.error('❌ Error al inicializar LCVVista:', error);
}
