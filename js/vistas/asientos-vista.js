// ══════════════════════════════════════════════════════════════
// asientos-vista.js — Vista de Asiento Manual
// ══════════════════════════════════════════════════════════════

window.AsientosVista = {

  elementos: {},

  inicializar() {
    console.log('✍️ AsientosVista.inicializar()');
    this.capturarElementos();
    this.configurarEventListeners();
    this.agregarLinea();
    this.agregarLinea();
    this.renderizarHistorial();
    console.log('✅ Vista Asiento Manual lista');
  },

  capturarElementos() {
    const g = (id) => document.getElementById(id);
    this.elementos = {
      form: g('form-asiento-manual'),
      fecha: g('am-fecha'),
      concepto: g('am-concepto'),
      tbodyLineas: g('am-lineas'),
      btnAgregar: g('am-btn-agregar'),
      btnLimpiar: g('am-btn-limpiar'),
      btnRegistrar: g('am-btn-registrar'),
      totalDebe: g('am-total-debe'),
      totalHaber: g('am-total-haber'),
      indicador: g('am-indicador'),
      diferencia: g('am-diferencia'),
      historial: g('am-historial'),
      toasts: g('contenedor-toasts')
    };

    // Fecha de hoy por defecto
    this.elementos.fecha.value = new Date().toISOString().split('T')[0];
  },

  configurarEventListeners() {
    this.elementos.btnAgregar.addEventListener('click', () => this.agregarLinea());
    this.elementos.btnLimpiar.addEventListener('click', () => this.limpiar());
    this.elementos.form.addEventListener('submit', (e) => this.registrar(e));
  },

  // ── Líneas dinámicas ─────────────────────────────────────────
  agregarLinea() {
    const cuentas = window.PlanCuentasUtilidades.obtenerTodasLasCuentas();

    // Agrupar por grupo para optgroup
    const grupos = {};
    cuentas.forEach(c => {
      const clave = `${c.codigo.split('.')[0]} - ${c.grupo}`;
      if (!grupos[clave]) grupos[clave] = [];
      grupos[clave].push(c);
    });

    const opciones = Object.entries(grupos).map(([nombre, lista]) => `
      <optgroup label="${nombre}">
        ${lista.map(c => `<option value="${c.codigo}">${c.codigo} — ${c.nombre}</option>`).join('')}
      </optgroup>
    `).join('');

    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>
        <select class="form-select am-cuenta" required>
          <option value="">Seleccione cuenta...</option>
          ${opciones}
        </select>
      </td>
      <td><input type="number" class="form-input am-debe" step="0.01" min="0" placeholder="0.00"></td>
      <td><input type="number" class="form-input am-haber" step="0.01" min="0" placeholder="0.00"></td>
      <td><input type="text" class="form-input am-desc" placeholder="Detalle"></td>
      <td class="texto-centro">
        <button type="button" class="btn btn-sm btn-danger am-quitar">✕</button>
      </td>
    `;

    this.elementos.tbodyLineas.appendChild(fila);

    // Validación en tiempo real
    fila.querySelectorAll('input.am-debe, input.am-haber').forEach(inp => {
      inp.addEventListener('input', (e) => {
        // Regla: una línea no puede tener Debe y Haber a la vez
        const debe = fila.querySelector('.am-debe');
        const haber = fila.querySelector('.am-haber');
        if (e.target === debe && parseFloat(debe.value) > 0) haber.value = '';
        if (e.target === haber && parseFloat(haber.value) > 0) debe.value = '';
        this.validarEnVivo();
      });
    });

    fila.querySelector('.am-quitar').addEventListener('click', () => {
      fila.remove();
      this.validarEnVivo();
    });

    this.validarEnVivo();
  },

  // ── Validación en tiempo real ────────────────────────────────
  validarEnVivo() {
    let totalD = 0, totalH = 0;

    this.elementos.tbodyLineas.querySelectorAll('tr').forEach(f => {
      totalD += parseFloat(f.querySelector('.am-debe').value) || 0;
      totalH += parseFloat(f.querySelector('.am-haber').value) || 0;
    });

    totalD = window.BOLIVIA.redondear2(totalD);
    totalH = window.BOLIVIA.redondear2(totalH);
    const dif = window.BOLIVIA.redondear2(totalD - totalH);
    const cuadra = Math.abs(dif) <= 0.01;
    const numLineas = this.elementos.tbodyLineas.querySelectorAll('tr').length;
    const lineasConMonto = Array.from(this.elementos.tbodyLineas.querySelectorAll('tr'))
      .filter(f => (parseFloat(f.querySelector('.am-debe').value) || 0) > 0 ||
                   (parseFloat(f.querySelector('.am-haber').value) || 0) > 0).length;

    this.elementos.totalDebe.textContent = window.utilidades.formatearBs(totalD);
    this.elementos.totalHaber.textContent = window.utilidades.formatearBs(totalH);

    const ind = this.elementos.indicador;
    if (cuadra && lineasConMonto >= 2) {
      ind.textContent = '✓ CUADRA';
      ind.style.background = '#10b981';
    } else if (cuadra) {
      ind.textContent = '⚠ FALTAN LÍNEAS';
      ind.style.background = '#f59e0b';
    } else {
      ind.textContent = '✗ DESCUADRADO';
      ind.style.background = '#ef4444';
    }

    this.elementos.diferencia.textContent = cuadra
      ? ''
      : `Diferencia: ${window.utilidades.formatearBs(Math.abs(dif))}`;

    // Habilitar botón solo si cuadra y hay >= 2 líneas con monto
    const cuentasOk = Array.from(this.elementos.tbodyLineas.querySelectorAll('tr'))
      .every(f => f.querySelector('.am-cuenta').value !== '');
    this.elementos.btnRegistrar.disabled = !(cuadra && lineasConMonto >= 2 && cuentasOk);
  },

  // ── Registrar ───────────────────────────────────────────────
  registrar(e) {
    e.preventDefault();

    const lineas = [];
    this.elementos.tbodyLineas.querySelectorAll('tr').forEach(f => {
      const cuentaCodigo = f.querySelector('.am-cuenta').value;
      const debe = parseFloat(f.querySelector('.am-debe').value) || 0;
      const haber = parseFloat(f.querySelector('.am-haber').value) || 0;
      const desc = f.querySelector('.am-desc').value;

      if (cuentaCodigo && (debe > 0 || haber > 0)) {
        const cuenta = window.PlanCuentasUtilidades.obtenerCuenta(cuentaCodigo);
        lineas.push({
          cuentaCodigo,
          cuentaNombre: cuenta ? cuenta.nombre : cuentaCodigo,
          debe, haber,
          descripcion: desc
        });
      }
    });

    const resultado = window.motorContable.crearAsientoManual({
      fecha: this.elementos.fecha.value,
      concepto: this.elementos.concepto.value.trim(),
      lineas
    });

    if (resultado.exito) {
      this.mostrarToast(`✅ Asiento ${resultado.asiento.numero} registrado y contabilizado`, 'exito');
      this.limpiar();
      this.renderizarHistorial();
    } else {
      this.mostrarToast(`❌ ${(resultado.errores || []).join(' | ')}`, 'error');
    }
  },

  limpiar() {
    this.elementos.form.reset();
    this.elementos.fecha.value = new Date().toISOString().split('T')[0];
    this.elementos.tbodyLineas.innerHTML = '';
    this.agregarLinea();
    this.agregarLinea();
  },

  // ── Historial de manuales ────────────────────────────────────
  renderizarHistorial() {
    const manuales = window.motorContable.obtenerAsientosContabilizados({ tipo: 'MANUAL' })
      .slice(-8).reverse();

    if (manuales.length === 0) {
      this.elementos.historial.innerHTML =
        '<tr><td colspan="5" style="text-align:center; padding:24px;">Sin asientos manuales</td></tr>';
      return;
    }

    this.elementos.historial.innerHTML = manuales.map(a => `
      <tr>
        <td><code>${a.numero}</code></td>
        <td>${a.fecha}</td>
        <td>${this._escapeHTML(a.concepto)}</td>
        <td class="texto-derecha">${window.utilidades.formatearBs(a.totalDebe)}</td>
        <td><span class="badge" style="background:#10b981; color:#fff;">${a.estado}</span></td>
      </tr>
    `).join('');
  },

  _escapeHTML(t) {
    if (!t) return '';
    return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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
  if (window.AsientosVista && typeof window.AsientosVista.inicializar === 'function') {
    window.AsientosVista.inicializar();
  }
} catch (error) {
  console.error('❌ Error al inicializar AsientosVista:', error);
}
