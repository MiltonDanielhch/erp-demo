// ══════════════════════════════════════════════════════════════
// libro-diario-vista.js — Vista del Libro Diario
// ══════════════════════════════════════════════════════════════

window.LibroDiarioVista = {

  elementos: {},
  filtrosActuales: {},

  inicializar() {
    console.log('📖 LibroDiarioVista.inicializar()');
    this.capturarElementos();
    this.configurarEventListeners();
    this.cargarSelectores();
    this.filtrarYRenderizar();
    console.log('✅ Vista Libro Diario lista');
  },

  capturarElementos() {
    const g = (id) => document.getElementById(id);
    this.elementos = {
      selectPeriodo: g('diario-periodo'),
      selectTipo: g('diario-tipo'),
      selectCuenta: g('diario-cuenta'),
      chkIncluirAnulados: g('diario-incluir-anulados'),
      btnFiltrar: g('diario-btn-filtrar'),
      btnImprimir: g('diario-btn-imprimir'),
      contenido: g('diario-contenido'),

      // Resumen
      resumenCantidad: g('diario-resumen-cantidad'),
      resumenDebe: g('diario-resumen-debe'),
      resumenHaber: g('diario-resumen-haber'),
      resumenEstado: g('diario-resumen-estado'),

      // Modal anulación
      modalAnular: g('modal-anular-asiento'),
      anularBtnCerrar: g('anular-btn-cerrar'),
      anularBtnCancelar: g('anular-btn-cancelar'),
      anularBtnConfirmar: g('anular-btn-confirmar'),
      anularAsientoId: g('anular-asiento-id'),
      anularNumero: g('anular-numero'),
      anularFecha: g('anular-fecha'),
      anularConcepto: g('anular-concepto'),
      anularMotivo: g('anular-motivo'),

      toasts: g('contenedor-toasts')
    };
  },

  configurarEventListeners() {
    const e = this.elementos;

    e.btnFiltrar.addEventListener('click', () => this.filtrarYRenderizar());
    e.btnImprimir.addEventListener('click', () => window.print());

    // Modal anulación
    e.anularBtnCerrar.addEventListener('click', () => this.cerrarModalAnular());
    e.anularBtnCancelar.addEventListener('click', () => this.cerrarModalAnular());
    e.anularBtnConfirmar.addEventListener('click', () => this.confirmarAnulacion());
  },

  cargarSelectores() {
    // Períodos
    const periodos = window.motorContable.obtenerPeriodosConDiario();
    this.elementos.selectPeriodo.innerHTML = '<option value="">Todos los períodos</option>';
    periodos.forEach(p => {
      const [anio, mes] = p.split('-');
      const nombres = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                       'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
      this.elementos.selectPeriodo.innerHTML +=
        `<option value="${p}">${nombres[parseInt(mes, 10) - 1]} ${anio}</option>`;
    });

    // Cuentas (desde el mayor o plan)
    this.elementos.selectCuenta.innerHTML = '<option value="">Todas</option>';
    try {
      const cuentas = window.PlanCuentasUtilidades.obtenerTodasLasCuentas();
      cuentas.forEach(c => {
        this.elementos.selectCuenta.innerHTML +=
          `<option value="${c.codigo}">${c.codigo} - ${c.nombre}</option>`;
      });
    } catch (e) {
      console.warn('No se pudo cargar plan de cuentas:', e);
    }
  },

  filtrarYRenderizar() {
    const periodo = this.elementos.selectPeriodo.value;
    const tipo = this.elementos.selectTipo.value;
    const cuenta = this.elementos.selectCuenta.value;
    const incluirAnulados = this.elementos.chkIncluirAnulados.checked;

    this.filtrosActuales = { tipo, cuentaCodigo: cuenta, incluirAnulados };

    let asientos;
    let resumen;

    if (periodo) {
      const diario = window.motorContable.obtenerDiarioPorPeriodo(periodo);
      asientos = diario.asientos;
      resumen = diario.resumen;
      // Aplicar filtros adicionales
      if (tipo) asientos = asientos.filter(a => a.tipo === tipo);
      if (cuenta) asientos = asientos.filter(a => a.lineas.some(l => l.cuentaCodigo === cuenta));
      if (!incluirAnulados) asientos = asientos.filter(a => !a.anulado);
    } else {
      asientos = window.motorContable.obtenerDiario(this.filtrosActuales);
      let totalDebe = 0, totalHaber = 0;
      asientos.forEach(a => { totalDebe += a.totalDebe || 0; totalHaber += a.totalHaber || 0; });
      resumen = {
        cantidadAsientos: asientos.length,
        totalDebe: window.BOLIVIA.redondear2(totalDebe),
        totalHaber: window.BOLIVIA.redondear2(totalHaber),
        cuadra: Math.abs(totalDebe - totalHaber) <= 0.01
      };
    }

    this.renderizarResumen(resumen);
    this.renderizarAsientos(asientos, periodo);
  },

  renderizarResumen(resumen) {
    this.elementos.resumenCantidad.textContent = resumen.cantidadAsientos;
    this.elementos.resumenDebe.textContent = window.utilidades.formatearBs(resumen.totalDebe);
    this.elementos.resumenHaber.textContent = window.utilidades.formatearBs(resumen.totalHaber);

    if (resumen.cantidadAsientos === 0) {
      this.elementos.resumenEstado.textContent = '—';
      this.elementos.resumenEstado.style.color = 'var(--texto-secundario)';
    } else if (resumen.cuadra) {
      this.elementos.resumenEstado.textContent = '✓ Cuadra';
      this.elementos.resumenEstado.style.color = 'var(--color-exito)';
    } else {
      this.elementos.resumenEstado.textContent = '✗ Descuadre';
      this.elementos.resumenEstado.style.color = 'var(--color-error)';
    }
  },

  renderizarAsientos(asientos, periodo) {
    if (asientos.length === 0) {
      this.elementos.contenido.innerHTML = `
        <div class="card" style="text-align: center; padding: 40px; color: var(--texto-secundario);">
          <p>📭 No hay asientos para mostrar con los filtros seleccionados</p>
        </div>
      `;
      return;
    }

    const html = asientos.map(a => this._renderAsiento(a)).join('');

    // Separador de título del libro
    const tituloPeriodo = periodo
      ? `<h3 style="margin-bottom: 12px;">📖 Libro Diario — ${this._formatearPeriodo(periodo)}</h3>`
      : `<h3 style="margin-bottom: 12px;">📖 Libro Diario — Todos los períodos</h3>`;

    this.elementos.contenido.innerHTML = tituloPeriodo + html;

    // Agregar listeners de anulación
    this.elementos.contenido.querySelectorAll('[data-accion="anular"]').forEach(btn => {
      btn.addEventListener('click', () => this.abrirModalAnular(btn));
    });

    // Agregar listeners de ver documento
    this.elementos.contenido.querySelectorAll('[data-accion="ver-documento"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        console.log('Ver documento:', id);
        // Futuro: navegar a vista de documentos
        this.mostrarToast(`Documento ${id} (próximamente)`, 'info');
      });
    });
  },

  _renderAsiento(a) {
    const claseAnulado = a.anulado ? 'anulado' : '';
    const tipoTexto = this._tipoATexto(a.tipo);
    const fechaFmt = this._formatearFecha(a.fecha);

    const lineasHTML = a.lineas.map(l => {
      const naturaleza = this._obtenerNaturaleza(l.cuentaCodigo);
      const clase = naturaleza === 'acreedora' ? 'cuenta-acreedora' : 'cuenta-deudora';
      const debeStr = l.debe > 0 ? window.utilidades.formatearBs(l.debe) : '';
      const haberStr = l.haber > 0 ? window.utilidades.formatearBs(l.haber) : '';

      return `
        <tr class="${clase}">
          <td class="col-cuenta"><code style="color:var(--texto-secundario); font-size:0.8rem;">${l.cuentaCodigo}</code> ${this._escapeHTML(l.cuentaNombre)}</td>
          <td class="col-monto">${debeStr}</td>
          <td class="col-monto">${haberStr}</td>
        </tr>
      `;
    }).join('');

    const docLink = a.documentoFuenteId
      ? `<button class="btn btn-sm btn-outline" data-accion="ver-documento" data-id="${a.documentoFuenteId}">📄 Ver documento</button>`
      : '';

    const btnAnular = a.anulado
      ? `<span style="color:var(--color-error); font-size:0.85rem;">⚠️ Anulado el ${this._formatearFecha(a.anuladoEn)}</span>`
      : `<button class="btn btn-sm btn-danger" data-accion="anular" data-id="${a.id}" data-numero="${a.numero}" data-fecha="${a.fecha}" data-concepto="${this._escapeHTML(a.concepto)}">⚠️ Anular</button>`;

    return `
      <div class="diario-asiento ${claseAnulado}">
        <div class="diario-cabecera">
          <div class="diario-info">
            <h4>
              <strong>${a.numero || 'Sin número'}</strong>
              <span class="badge-tipo ${a.tipo}">${tipoTexto}</span>
            </h4>
            <div class="meta">
              📅 ${fechaFmt}
              ${a.anulado ? ' • <span style="color:var(--color-error);">ANULADO</span>' : ''}
            </div>
          </div>
        </div>
        <div class="diario-concepto">
          <strong>Concepto:</strong> ${this._escapeHTML(a.concepto || '—')}
        </div>
        <table class="diario-lineas">
          <thead>
            <tr>
              <th class="col-cuenta">Cuenta</th>
              <th class="col-monto">Debe</th>
              <th class="col-monto">Haber</th>
            </tr>
          </thead>
          <tbody>
            ${lineasHTML}
          </tbody>
          <tfoot>
            <tr>
              <td class="col-cuenta">TOTALES</td>
              <td class="col-monto">${window.utilidades.formatearBs(a.totalDebe)}</td>
              <td class="col-monto">${window.utilidades.formatearBs(a.totalHaber)}</td>
            </tr>
          </tfoot>
        </table>
        <div class="diario-acciones">
          ${docLink}
          ${btnAnular}
        </div>
      </div>
    `;
  },

  // ── Modal de anulación ───────────────────────────────────────
  abrirModalAnular(btn) {
    const e = this.elementos;
    e.anularAsientoId.value = btn.dataset.id;
    e.anularNumero.textContent = btn.dataset.numero;
    e.anularFecha.textContent = this._formatearFecha(btn.dataset.fecha);
    e.anularConcepto.textContent = btn.dataset.concepto;
    e.anularMotivo.value = '';
    e.modalAnular.classList.remove('oculto');
  },

  cerrarModalAnular() {
    this.elementos.modalAnular.classList.add('oculto');
  },

  confirmarAnulacion() {
    const e = this.elementos;
    const id = e.anularAsientoId.value;
    const motivo = e.anularMotivo.value.trim();

    if (!motivo) {
      this.mostrarToast('❌ Debe indicar el motivo de anulación', 'error');
      return;
    }

    const resultado = window.motorContable.anularAsiento(id, motivo);

    if (resultado.exito) {
      this.mostrarToast(`✅ ${resultado.mensaje}`, 'exito');
      this.cerrarModalAnular();
      this.filtrarYRenderizar();
    } else {
      this.mostrarToast(`❌ ${resultado.mensaje}`, 'error');
    }
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

  _formatearPeriodo(periodo) {
    const [anio, mes] = periodo.split('-');
    const nombres = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                     'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    return `${nombres[parseInt(mes, 10) - 1]} ${anio}`;
  },

  _tipoATexto(tipo) {
    const mapa = {
      'COMPRA': 'Compra',
      'VENTA': 'Venta',
      'COSTO_VENTA': 'Costo Venta',
      'PAGO_PROVEEDOR': 'Pago Proveedor',
      'COBRO_CLIENTE': 'Cobro Cliente',
      'NOMINA': 'Nómina',
      'AJUSTE': 'Ajuste',
      'CIERRE': 'Cierre',
      'MANUAL': 'Manual'
    };
    return mapa[tipo] || tipo;
  },

  _obtenerNaturaleza(cuentaCodigo) {
    try {
      const cuenta = window.PlanCuentasUtilidades.obtenerCuenta(cuentaCodigo);
      return cuenta ? cuenta.naturaleza : 'deudora';
    } catch (e) {
      return 'deudora';
    }
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
  if (window.LibroDiarioVista && typeof window.LibroDiarioVista.inicializar === 'function') {
    window.LibroDiarioVista.inicializar();
  }
} catch (error) {
  console.error('❌ Error al inicializar LibroDiarioVista:', error);
}
