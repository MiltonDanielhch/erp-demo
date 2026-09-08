// ══════════════════════════════════════════════════════════════
// balanza-vista.js — Vista de la Balanza de Comprobación
// ══════════════════════════════════════════════════════════════

window.BalanzaVista = {

  elementos: {},

  inicializar() {
    console.log('⚖️ BalanzaVista.inicializar()');
    this.capturarElementos();
    this.configurarEventListeners();
    this.cargarSelectores();
    this.calcularYRenderizar();
    console.log('✅ Vista Balanza lista');
  },

  capturarElementos() {
    const g = (id) => document.getElementById(id);
    this.elementos = {
      selectPeriodo: g('balanza-periodo'),
      btnCalcular: g('balanza-btn-calcular'),
      btnImprimir: g('balanza-btn-imprimir'),

      verificacionCard: g('balanza-verificacion'),
      verificacionContenido: g('balanza-verif-contenido'),

      tablaCard: g('balanza-tabla-card'),
      titulo: g('balanza-titulo'),
      fecha: g('balanza-fecha'),
      body: g('balanza-body'),
      totMovD: g('balanza-tot-mov-d'),
      totMovH: g('balanza-tot-mov-h'),
      totSalD: g('balanza-tot-sal-d'),
      totSalA: g('balanza-tot-sal-a'),

      erroresCard: g('balanza-errores-card'),
      erroresContenido: g('balanza-errores-contenido'),

      toasts: g('contenedor-toasts')
    };
  },

  configurarEventListeners() {
    this.elementos.btnCalcular.addEventListener('click', () => this.calcularYRenderizar());
    this.elementos.btnImprimir.addEventListener('click', () => window.print());
  },

  cargarSelectores() {
    const periodos = window.motorContable.obtenerPeriodosConDiario();
    this.elementos.selectPeriodo.innerHTML = '<option value="">Todo el historial</option>';
    periodos.forEach(p => {
      const [anio, mes] = p.split('-');
      const nombres = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                       'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
      this.elementos.selectPeriodo.innerHTML +=
        `<option value="${p}">${nombres[parseInt(mes, 10) - 1]} ${anio}</option>`;
    });
  },

  calcularYRenderizar() {
    const periodo = this.elementos.selectPeriodo.value || undefined;
    const balanza = window.motorContable.calcularBalanza(periodo);

    this.renderizarVerificacion(balanza, periodo);
    this.renderizarTabla(balanza, periodo);
    this.renderizarErrores(balanza);
  },

  renderizarVerificacion(balanza, periodo) {
    const e = this.elementos;
    e.verificacionCard.classList.remove('oculto');

    const v = balanza.verificacion;
    const tot = balanza.totales;

    const badgeOk = (ok) => ok
      ? '<span class="balanza-estado ok">✓ CUADRA</span>'
      : '<span class="balanza-estado error">✗ DESCUADRA</span>';

    e.verificacionContenido.innerHTML = `
      <div class="balanza-cuadra-linea">
        <span class="balanza-etiqueta">Σ Movimientos Debe:</span>
        <span class="balanza-valor">${window.utilidades.formatearBs(tot.movimientoDebe)}</span>
        <span>vs</span>
        <span class="balanza-valor">${window.utilidades.formatearBs(tot.movimientoHaber)}</span>
        ${badgeOk(v.movimientosCuadran)}
        ${!v.movimientosCuadran ? `<span style="color:#ef4444;">(diferencia: ${window.utilidades.formatearBs(v.diferenciaMovimientos)})</span>` : ''}
      </div>
      <div class="balanza-cuadra-linea">
        <span class="balanza-etiqueta">Σ Saldos Deudores:</span>
        <span class="balanza-valor">${window.utilidades.formatearBs(tot.saldoDeudor)}</span>
        <span>vs</span>
        <span class="balanza-valor">${window.utilidades.formatearBs(tot.saldoAcreedor)}</span>
        ${badgeOk(v.saldosCuadran)}
        ${!v.saldosCuadran ? `<span style="color:#ef4444;">(diferencia: ${window.utilidades.formatearBs(v.diferenciaSaldos)})</span>` : ''}
      </div>
      <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--color-borde); font-size: 0.9rem; color: var(--texto-secundario);">
        <strong>Diagnóstico:</strong> ${this._escapeHTML(v.explicacion)}
      </div>
    `;
  },

  renderizarTabla(balanza, periodo) {
    const e = this.elementos;
    e.tablaCard.classList.remove('oculto');

    const tituloPeriodo = periodo ? this._formatearPeriodo(periodo) : 'Todo el historial';
    e.titulo.textContent = `⚖️ Balanza de Comprobación — ${tituloPeriodo}`;
    e.fecha.textContent = `Generada: ${new Date(balanza.generadoEn).toLocaleString('es-BO')}`;

    if (balanza.cuentas.length === 0) {
      e.body.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:24px;">Sin datos para el período seleccionado</td></tr>`;
      return;
    }

    e.body.innerHTML = balanza.cuentas.map(c => {
      // Detectar saldos "al revés" (naturaleza invertida)
      const naturalezaInvertida =
        (c.naturaleza === 'deudora' && c.saldoAcreedor > 0) ||
        (c.naturaleza === 'acreedora' && c.saldoDeudor > 0);
      const aviso = naturalezaInvertida ? ' ⚠️' : '';

      return `
        <tr>
          <td><code>${c.cuentaCodigo}</code></td>
          <td>${this._escapeHTML(c.cuentaNombre)}${aviso}</td>
          <td class="texto-derecha">${c.movimientoDebe > 0 ? window.utilidades.formatearBs(c.movimientoDebe) : ''}</td>
          <td class="texto-derecha">${c.movimientoHaber > 0 ? window.utilidades.formatearBs(c.movimientoHaber) : ''}</td>
          <td class="texto-derecha">${c.saldoDeudor > 0 ? window.utilidades.formatearBs(c.saldoDeudor) : ''}</td>
          <td class="texto-derecha">${c.saldoAcreedor > 0 ? window.utilidades.formatearBs(c.saldoAcreedor) : ''}</td>
        </tr>
      `;
    }).join('');

    e.totMovD.textContent = window.utilidades.formatearBs(balanza.totales.movimientoDebe);
    e.totMovH.textContent = window.utilidades.formatearBs(balanza.totales.movimientoHaber);
    e.totSalD.textContent = window.utilidades.formatearBs(balanza.totales.saldoDeudor);
    e.totSalA.textContent = window.utilidades.formatearBs(balanza.totales.saldoAcreedor);
  },

  renderizarErrores(balanza) {
    const e = this.elementos;
    const errores = balanza.errores || [];

    if (errores.length === 0) {
      e.erroresCard.classList.add('oculto');
      return;
    }

    e.erroresCard.classList.remove('oculto');
    const erroresHTML = errores.map(err => `
      <div class="balanza-error-item ${err.nivel}">
        <strong>${err.nivel === 'error' ? '❌ Error' : '⚠️ Advertencia'}:</strong>
        ${this._escapeHTML(err.mensaje)}
        ${err.asientoNumero ? ` (Asiento: <code>${err.asientoNumero}</code>)` : ''}
        ${err.cuentaCodigo ? ` (Cuenta: <code>${err.cuentaCodigo} - ${this._escapeHTML(err.cuentaNombre || '')}</code>)` : ''}
      </div>
    `).join('');

    e.erroresContenido.innerHTML = erroresHTML;
  },

  _formatearPeriodo(periodo) {
    const [anio, mes] = periodo.split('-');
    const nombres = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                     'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    return `${nombres[parseInt(mes, 10) - 1]} ${anio}`;
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

try {
  if (window.BalanzaVista && typeof window.BalanzaVista.inicializar === 'function') {
    window.BalanzaVista.inicializar();
  }
} catch (error) {
  console.error('❌ Error al inicializar BalanzaVista:', error);
}
