// ══════════════════════════════════════════════════════════════
// libro-mayor-vista.js — Vista del Libro Mayor
// ══════════════════════════════════════════════════════════════

window.LibroMayorVista = {

  elementos: {},

  inicializar() {
    console.log('📚 LibroMayorVista.inicializar()');
    this.capturarElementos();
    this.configurarEventListeners();
    this.cargarSelectores();
    this.renderizarResumen();
    console.log('✅ Vista Libro Mayor lista');
  },

  capturarElementos() {
    const g = (id) => document.getElementById(id);
    this.elementos = {
      selectPeriodo: g('mayor-periodo'),
      selectCuenta: g('mayor-cuenta'),
      btnVer: g('mayor-btn-ver'),
      btnImprimir: g('mayor-btn-imprimir'),

      ficha: g('mayor-ficha'),
      fichaTitulo: g('mayor-ficha-titulo'),
      fichaNaturaleza: g('mayor-ficha-naturaleza'),
      fichaInicial: g('mayor-ficha-inicial'),
      fichaDebe: g('mayor-ficha-debe'),
      fichaHaber: g('mayor-ficha-haber'),
      fichaFinal: g('mayor-ficha-final'),
      fichaBody: g('mayor-ficha-body'),
      fichaTotDebe: g('mayor-ficha-tot-debe'),
      fichaTotHaber: g('mayor-ficha-tot-haber'),
      fichaTotSaldo: g('mayor-ficha-tot-saldo'),

      resumenBody: g('mayor-resumen-body'),
      resumenTotDeudor: g('mayor-resumen-tot-deudor'),
      resumenTotAcreedor: g('mayor-resumen-tot-acreedor'),

      toasts: g('contenedor-toasts')
    };
  },

  configurarEventListeners() {
    this.elementos.btnVer.addEventListener('click', () => this.verFicha());
    this.elementos.btnImprimir.addEventListener('click', () => window.print());
    this.elementos.selectPeriodo.addEventListener('change', () => this.renderizarResumen());
  },

  cargarSelectores() {
    // Períodos
    const periodos = window.motorContable.obtenerPeriodosConDiario();
    this.elementos.selectPeriodo.innerHTML = '<option value="">Todo el historial</option>';
    periodos.forEach(p => {
      const [anio, mes] = p.split('-');
      const nombres = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                       'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
      this.elementos.selectPeriodo.innerHTML +=
        `<option value="${p}">${nombres[parseInt(mes, 10) - 1]} ${anio}</option>`;
    });

    // Cuentas con movimientos (del mayor)
    const mayor = window.motorContable.obtenerLibroMayor();
    this.elementos.selectCuenta.innerHTML = '<option value="">Seleccione una cuenta...</option>';
    mayor
      .slice()
      .sort((a, b) => a.cuentaCodigo.localeCompare(b.cuentaCodigo))
      .forEach(m => {
        this.elementos.selectCuenta.innerHTML +=
          `<option value="${m.cuentaCodigo}">${m.cuentaCodigo} - ${this._escapeHTML(m.cuentaNombre)}</option>`;
      });
  },

  // ── Ficha de cuenta seleccionada ─────────────────────────────
  verFicha() {
    const cuentaCodigo = this.elementos.selectCuenta.value;
    const periodo = this.elementos.selectPeriodo.value;

    if (!cuentaCodigo) {
      this.mostrarToast('❌ Seleccione una cuenta', 'error');
      return;
    }

    const ficha = window.motorContable.obtenerMayorPorCuenta(cuentaCodigo, {
      periodoContable: periodo || undefined
    });

    if (!ficha) {
      this.mostrarToast('❌ Cuenta no encontrada en el mayor', 'error');
      return;
    }

    this.renderizarFicha(ficha, periodo);
  },

  renderizarFicha(ficha, periodo) {
    const e = this.elementos;

    e.ficha.classList.remove('oculto');
    e.fichaTitulo.textContent = `📚 ${ficha.cuentaCodigo} — ${ficha.cuentaNombre}`;

    // Badge de naturaleza
    e.fichaNaturaleza.textContent = ficha.naturaleza === 'deudora' ? 'DEUDORA' : 'ACREEDORA';
    e.fichaNaturaleza.style.background = ficha.naturaleza === 'deudora' ? '#10b981' : '#ef4444';

    // Resumen
    e.fichaInicial.textContent = window.utilidades.formatearBs(ficha.saldoInicial);
    e.fichaDebe.textContent = window.utilidades.formatearBs(ficha.totalDebe);
    e.fichaHaber.textContent = window.utilidades.formatearBs(ficha.totalHaber);
    e.fichaFinal.textContent = window.utilidades.formatearBs(ficha.saldoFinal);

    // Movimientos
    if (ficha.movimientos.length === 0) {
      e.fichaBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:24px;">Sin movimientos en ${periodo || 'el historial'}</td></tr>`;
    } else {
      e.fichaBody.innerHTML = ficha.movimientos.map(m => `
        <tr>
          <td>${this._formatearFecha(m.fecha)}</td>
          <td><code>${m.asientoNumero || '—'}</code></td>
          <td>${this._escapeHTML(m.concepto || '—')}</td>
          <td class="texto-derecha">${m.debe > 0 ? window.utilidades.formatearBs(m.debe) : ''}</td>
          <td class="texto-derecha">${m.haber > 0 ? window.utilidades.formatearBs(m.haber) : ''}</td>
          <td class="texto-derecha"><strong>${window.utilidades.formatearBs(m.saldoAcumulado)}</strong></td>
        </tr>
      `).join('');
    }

    // Totales
    e.fichaTotDebe.textContent = window.utilidades.formatearBs(ficha.totalDebe);
    e.fichaTotHaber.textContent = window.utilidades.formatearBs(ficha.totalHaber);
    e.fichaTotSaldo.textContent = window.utilidades.formatearBs(ficha.saldoFinal);
  },

  // ── Resumen de todas las cuentas ─────────────────────────────
  renderizarResumen() {
    const periodo = this.elementos.selectPeriodo.value || undefined;
    const saldos = window.motorContable.obtenerSaldosDeCuentas(periodo);

    if (saldos.length === 0) {
      this.elementos.resumenBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:24px;">Sin datos</td></tr>`;
      return;
    }

    let totDeudor = 0;
    let totAcreedor = 0;

    this.elementos.resumenBody.innerHTML = saldos.map(s => {
      totDeudor += s.saldoDeudor;
      totAcreedor += s.saldoAcreedor;

      const naturalezaBadge = s.naturaleza === 'deudora'
        ? '<span style="color:#10b981; font-size:0.8rem;">DEUDORA</span>'
        : '<span style="color:#ef4444; font-size:0.8rem;">ACREEDORA</span>';

      return `
        <tr>
          <td><code>${s.cuentaCodigo}</code></td>
          <td>${this._escapeHTML(s.cuentaNombre)}</td>
          <td>${naturalezaBadge}</td>
          <td class="texto-derecha">${window.utilidades.formatearBs(s.saldoInicial)}</td>
          <td class="texto-derecha">${window.utilidades.formatearBs(s.movimiento)}</td>
          <td class="texto-derecha">${s.saldoDeudor > 0 ? window.utilidades.formatearBs(s.saldoDeudor) : ''}</td>
          <td class="texto-derecha">${s.saldoAcreedor > 0 ? window.utilidades.formatearBs(s.saldoAcreedor) : ''}</td>
        </tr>
      `;
    }).join('');

    this.elementos.resumenTotDeudor.textContent = window.utilidades.formatearBs(window.BOLIVIA.redondear2(totDeudor));
    this.elementos.resumenTotAcreedor.textContent = window.utilidades.formatearBs(window.BOLIVIA.redondear2(totAcreedor));
  },

  // ── Utilidades ───────────────────────────────────────────────
  _formatearFecha(fecha) {
    if (!fecha) return '—';
    const f = new Date(fecha);
    if (isNaN(f.getTime())) return fecha;
    const dd = String(f.getDate()).padStart(2, '0');
    const mm = String(f.getMonth() + 1).padStart(2, '0');
    const yyyy = f.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  },

  _escapeHTML(texto) {
    if (!texto) return '';
    return String(texto)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
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
  if (window.LibroMayorVista && typeof window.LibroMayorVista.inicializar === 'function') {
    window.LibroMayorVista.inicializar();
  }
} catch (error) {
  console.error('❌ Error al inicializar LibroMayorVista:', error);
}
