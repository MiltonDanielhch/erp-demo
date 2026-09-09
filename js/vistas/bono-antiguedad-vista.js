// ══════════════════════════════════════════════════════════════
// bono-antiguedad-vista.js — Vista del Bono de Antigüedad
// ══════════════════════════════════════════════════════════════

window.BonoAntiguedadVista = {

  elementos: {},

  inicializar() {
    console.log('🎖️ BonoAntiguedadVista.inicializar()');
    this.capturarElementos();
    this.configurarEventListeners();
    this.renderizar();
    console.log('✅ Vista Bono de Antigüedad lista');
  },

  capturarElementos() {
    const g = (id) => document.getElementById(id);
    this.elementos = {
      smn: g('bono-smn'),
      base: g('bono-base'),
      conBono: g('bono-conBono'),
      sinBono: g('bono-sinBono'),
      totalMensual: g('bono-totalMensual'),
      totalAnual: g('bono-totalAnual'),

      btnProvisionar: g('bono-btn-provisionar'),
      btnActualizarSMN: g('bono-btn-actualizar-smn'),
      btnVerHistorial: g('bono-btn-ver-historial'),

      tablaBody: g('bono-tabla-body'),
      tablaTramos: g('bono-tabla-tramos'),

      // Modal SMN
      modalSMN: g('modal-smn'),
      smnCerrar: g('modal-smn-cerrar'),
      smnCancelar: g('modal-smn-cancelar'),
      smnConfirmar: g('modal-smn-confirmar'),
      smnActual: g('smn-actual'),
      baseActual: g('base-actual'),
      inputNuevo: g('smn-nuevo'),
      inputMotivo: g('smn-motivo'),
      previewVariacion: g('smn-variacion'),
      previewNuevaBase: g('smn-nueva-base'),

      toasts: g('contenedor-toasts')
    };
  },

  configurarEventListeners() {
    this.elementos.btnProvisionar.addEventListener('click', () => this.provisionar());
    this.elementos.btnActualizarSMN.addEventListener('click', () => this.abrirModalSMN());
    this.elementos.btnVerHistorial.addEventListener('click', () => this.verHistorial());

    // Modal SMN
    this.elementos.smnCerrar.addEventListener('click', () => this.cerrarModalSMN());
    this.elementos.smnCancelar.addEventListener('click', () => this.cerrarModalSMN());
    this.elementos.smnConfirmar.addEventListener('click', () => this.confirmarSMN());
    this.elementos.inputNuevo.addEventListener('input', () => this.actualizarPreviewSMN());
  },

  // ── Renderizado ──────────────────────────────────────────────
  renderizar() {
    const modulo = window.moduloBonoAntiguedad;
    if (!modulo) {
      console.error('❌ moduloBonoAntiguedad no está inicializado');
      return;
    }

    const resultado = modulo.calcularBonosTodos();
    const t = resultado.totales;

    // Resumen
    this.elementos.smn.textContent = window.utilidades.formatearBs(modulo.obtenerSMNVigente());
    this.elementos.base.textContent = window.utilidades.formatearBs(modulo.obtenerBaseCalculo());
    this.elementos.conBono.textContent = t.conBono;
    this.elementos.sinBono.textContent = t.sinBono;
    this.elementos.totalMensual.textContent = window.utilidades.formatearBs(t.totalBonoMensual);
    this.elementos.totalAnual.textContent = window.utilidades.formatearBs(t.totalBonoAnual);

    // Tabla de bonos por empleado
    if (resultado.empleados.length === 0) {
      this.elementos.tablaBody.innerHTML =
        '<tr><td colspan="6" style="text-align:center; padding:24px;">Sin empleados</td></tr>';
    } else {
      this.elementos.tablaBody.innerHTML = resultado.empleados.map(e => {
        const badgeAplica = e.aplicaBono
          ? '<span class="badge" style="background:#10b981; color:#fff;">Aplica</span>'
          : '<span class="badge" style="background:#6b7280; color:#fff;">No aplica (&lt;2 años)</span>';

        return `
          <tr>
            <td><code>${this._escapeHTML(e.empleadoCI)}</code></td>
            <td><strong>${this._escapeHTML(e.empleadoNombre)}</strong></td>
            <td>${e.aniosServicio} años</td>
            <td>${e.tramo} ${badgeAplica}</td>
            <td class="texto-derecha">${e.porcentaje}%</td>
            <td class="texto-derecha">${e.monto > 0 ? window.utilidades.formatearBs(e.monto) : '—'}</td>
          </tr>
        `;
      }).join('');
    }

    // Tabla de tramos
    const tablaTramos = window.TablaBonoAntiguedad.obtenerTablaConMontos();
    this.elementos.tablaTramos.innerHTML = tablaTramos.map(t => `
      <tr>
        <td>${t.tramo}</td>
        <td>${t.aniosMin} – ${t.aniosMax === 999 ? '∞' : t.aniosMax} años</td>
        <td class="texto-derecha">${t.porcentaje}%</td>
        <td class="texto-derecha">${window.utilidades.formatearBs(t.base)}</td>
        <td class="texto-derecha">${t.monto > 0 ? window.utilidades.formatearBs(t.monto) : '—'}</td>
      </tr>
    `).join('');
  },

  // ── Acciones ─────────────────────────────────────────────────
  provisionar() {
    const P = new Date().toISOString().slice(0, 7);
    const resultado = window.moduloBonoAntiguedad.generarAsientoProvisionMensual(P);

    if (resultado.exito) {
      this.mostrarToast(`✅ Provisión generada: ${window.utilidades.formatearBs(resultado.totalBono)} (${resultado.cantidadEmpleados} empleados)`, 'exito');
    } else {
      this.mostrarToast(`❌ ${(resultado.errores || []).join(' | ')}`, 'error');
    }
  },

  verHistorial() {
    const historial = window.moduloBonoAntiguedad.obtenerHistorialSMN();
    const texto = historial.map(h =>
      `${new Date(h.fecha).toLocaleDateString()} — Bs ${h.smn.toFixed(2)} (${h.motivo})`
    ).join('\n');
    alert(`📜 Historial del SMN:\n\n${texto || 'Sin historial'}`);
  },

  // ── Modal SMN ────────────────────────────────────────────────
  abrirModalSMN() {
    const modulo = window.moduloBonoAntiguedad;
    this.elementos.smnActual.textContent = window.utilidades.formatearBs(modulo.obtenerSMNVigente());
    this.elementos.baseActual.textContent = window.utilidades.formatearBs(modulo.obtenerBaseCalculo());
    this.elementos.inputNuevo.value = '';
    this.elementos.inputMotivo.value = '';
    this.elementos.previewVariacion.textContent = '—';
    this.elementos.previewNuevaBase.textContent = '—';
    this.elementos.modalSMN.classList.remove('oculto');
  },

  cerrarModalSMN() {
    this.elementos.modalSMN.classList.add('oculto');
  },

  actualizarPreviewSMN() {
    const nuevoSMN = parseFloat(this.elementos.inputNuevo.value);
    const smnActual = window.moduloBonoAntiguedad.obtenerSMNVigente();

    if (isNaN(nuevoSMN) || nuevoSMN <= 0) {
      this.elementos.previewVariacion.textContent = '—';
      this.elementos.previewNuevaBase.textContent = '—';
      return;
    }

    const variacion = ((nuevoSMN - smnActual) / smnActual * 100).toFixed(2);
    const nuevaBase = nuevoSMN * 3;

    this.elementos.previewVariacion.textContent = `${variacion > 0 ? '+' : ''}${variacion}%`;
    this.elementos.previewVariacion.style.color = variacion > 0 ? 'var(--color-exito)' : 'var(--color-error)';
    this.elementos.previewNuevaBase.textContent = window.utilidades.formatearBs(nuevaBase);
  },

  confirmarSMN() {
    const nuevoSMN = parseFloat(this.elementos.inputNuevo.value);
    const motivo = this.elementos.inputMotivo.value.trim() || 'Actualización manual';

    const resultado = window.moduloBonoAntiguedad.actualizarSMN(nuevoSMN, motivo);

    if (resultado.exito) {
      this.mostrarToast(
        `✅ SMN actualizado: ${window.utilidades.formatearBs(resultado.smnAnterior)} → ${window.utilidades.formatearBs(resultado.smnNuevo)} (+${resultado.variacion}%)`,
        'exito'
      );
      this.cerrarModalSMN();
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
  if (window.BonoAntiguedadVista && typeof window.BonoAntiguedadVista.inicializar === 'function') {
    window.BonoAntiguedadVista.inicializar();
  }
} catch (error) {
  console.error('❌ Error al inicializar BonoAntiguedadVista:', error);
}
