// ══════════════════════════════════════════════════════════════
// empleados-vista.js — Vista del Catálogo de Empleados
// ══════════════════════════════════════════════════════════════

window.EmpleadosVista = {

  elementos: {},
  modoEdicion: false,

  inicializar() {
    console.log('👥 EmpleadosVista.inicializar()');
    this.capturarElementos();
    this.configurarEventListeners();
    this.cargarDatosGenerales();
    this.renderizar();
    console.log('✅ Vista Empleados lista');
  },

  capturarElementos() {
    const g = (id) => document.getElementById(id);
    this.elementos = {
      // Conteos
      countActivos: g('emp-count-activos'),
      countRetirados: g('emp-count-retirados'),
      countTotal: g('emp-count-total'),
      smn: g('emp-smn'),
      baseBono: g('emp-base-bono'),

      // Filtros
      buscar: g('emp-buscar'),
      filtroEstado: g('emp-filtro-estado'),
      btnNuevo: g('emp-btn-nuevo'),

      // Tabla
      tablaBody: g('emp-tabla-body'),

      // Modal empleado
      modal: g('modal-empleado'),
      modalTitulo: g('modal-empleado-titulo'),
      modalCerrar: g('modal-empleado-cerrar'),
      modalCancelar: g('modal-empleado-cancelar'),
      form: g('form-empleado'),
      inputId: g('emp-id'),
      inputCi: g('emp-ci'),
      inputNit: g('emp-nit'),
      inputNombres: g('emp-nombres'),
      inputApellidos: g('emp-apellidos'),
      inputFechaNac: g('emp-fechaNacimiento'),
      inputGenero: g('emp-genero'),
      inputEstadoCivil: g('emp-estadoCivil'),
      inputFechaIngreso: g('emp-fechaIngreso'),
      inputCargo: g('emp-cargo'),
      inputDepartamento: g('emp-departamento'),
      inputTipoContrato: g('emp-tipoContrato'),
      inputSalario: g('emp-salarioBase'),
      previewBono: g('emp-preview-texto'),

      // Modal retiro
      modalRetiro: g('modal-retiro'),
      retiroCerrar: g('modal-retiro-cerrar'),
      retiroCancelar: g('modal-retiro-cancelar'),
      retiroConfirmar: g('modal-retiro-confirmar'),
      retiroId: g('retiro-empleado-id'),
      retiroNombre: g('retiro-empleado-nombre'),
      retiroDatos: g('retiro-empleado-datos'),
      retiroMotivo: g('retiro-motivo'),
      retiroFecha: g('retiro-fecha'),

      toasts: g('contenedor-toasts')
    };
  },

  configurarEventListeners() {
    this.elementos.btnNuevo.addEventListener('click', () => this.abrirModalNuevo());
    this.elementos.buscar.addEventListener('input', () => this.renderizar());
    this.elementos.filtroEstado.addEventListener('change', () => this.renderizar());

    // Modal empleado
    this.elementos.modalCerrar.addEventListener('click', () => this.cerrarModal());
    this.elementos.modalCancelar.addEventListener('click', () => this.cerrarModal());
    this.elementos.form.addEventListener('submit', (e) => this.guardarEmpleado(e));
    this.elementos.inputFechaIngreso.addEventListener('change', () => this.actualizarPreviewBono());

    // Modal retiro
    this.elementos.retiroCerrar.addEventListener('click', () => this.cerrarModalRetiro());
    this.elementos.retiroCancelar.addEventListener('click', () => this.cerrarModalRetiro());
    this.elementos.retiroConfirmar.addEventListener('click', () => this.confirmarRetiro());
  },

  cargarDatosGenerales() {
    const SMN = (window.BOLIVIA && window.BOLIVIA.SMN_VIGENTE) || 2500;
    this.elementos.smn.textContent = window.utilidades.formatearBs(SMN);
    this.elementos.baseBono.textContent = window.utilidades.formatearBs(SMN * 3);
  },

  // ── Renderizado ──────────────────────────────────────────────
  renderizar() {
    const filtros = {
      estado: this.elementos.filtroEstado.value || undefined,
      buscar: this.elementos.buscar.value || undefined
    };

    const empleados = window.catalogoEmpleados.obtenerTodos(filtros);
    const conteos = window.catalogoEmpleados.contar();

    this.elementos.countActivos.textContent = conteos.activos;
    this.elementos.countRetirados.textContent = conteos.retirados;
    this.elementos.countTotal.textContent = conteos.total;

    if (empleados.length === 0) {
      this.elementos.tablaBody.innerHTML =
        '<tr><td colspan="8" style="text-align:center; padding:24px;">Sin empleados</td></tr>';
      return;
    }

    this.elementos.tablaBody.innerHTML = empleados.map(e => {
      const estadoBadge = e.estado === 'ACTIVO'
        ? '<span class="badge" style="background:#10b981; color:#fff;">ACTIVO</span>'
        : '<span class="badge" style="background:#6b7280; color:#fff;">RETIRADO</span>';

      const antText = e.antiguedadDetalle
        ? `${e.antiguedadDetalle.anios}a ${e.antiguedadDetalle.meses}m`
        : `${e.antiguedadAnios || 0}a`;

      const acciones = e.estado === 'ACTIVO'
        ? `<button class="btn btn-sm btn-outline" data-accion="editar" data-id="${e.id}">✏️</button>
           <button class="btn btn-sm btn-danger" data-accion="retirar" data-id="${e.id}">🚪</button>`
        : `<span style="color: var(--texto-secundario); font-size:0.8rem;">— ${e.motivoRetiro || '—'}</span>`;

      return `
        <tr>
          <td><code>${this._escapeHTML(e.ci)}</code></td>
          <td><strong>${this._escapeHTML(e.apellidos)}, ${this._escapeHTML(e.nombres)}</strong></td>
          <td>${this._escapeHTML(e.cargo || '—')}</td>
          <td class="texto-derecha">${window.utilidades.formatearBs(e.salarioBase)}</td>
          <td>${antText}</td>
          <td class="texto-derecha">${e.bonoAntiguedadMonto > 0 ? window.utilidades.formatearBs(e.bonoAntiguedadMonto) + ' (' + e.bonoAntiguedadPorcentaje + '%)' : '—'}</td>
          <td>${estadoBadge}</td>
          <td>${acciones}</td>
        </tr>
      `;
    }).join('');

    // Listeners de acciones
    this.elementos.tablaBody.querySelectorAll('[data-accion]').forEach(btn => {
      btn.addEventListener('click', (ev) => {
        const accion = ev.currentTarget.dataset.accion;
        const id = ev.currentTarget.dataset.id;
        if (accion === 'editar') this.abrirModalEditar(id);
        if (accion === 'retirar') this.abrirModalRetiro(id);
      });
    });
  },

  // ── Modal Nuevo / Editar ─────────────────────────────────────
  abrirModalNuevo() {
    this.modoEdicion = false;
    this.elementos.modalTitulo.textContent = '➕ Nuevo Empleado';
    this.elementos.form.reset();
    this.elementos.inputId.value = '';
    this.elementos.inputFechaIngreso.value = new Date().toISOString().split('T')[0];
    this.elementos.modal.classList.remove('oculto');
    this.actualizarPreviewBono();
  },

  abrirModalEditar(id) {
    const e = window.catalogoEmpleados.obtenerPorId(id);
    if (!e) return;

    this.modoEdicion = true;
    this.elementos.modalTitulo.textContent = '✏️ Editar Empleado';
    this.elementos.inputId.value = e.id;
    this.elementos.inputCi.value = e.ci;
    this.elementos.inputNit.value = e.nit || '';
    this.elementos.inputNombres.value = e.nombres;
    this.elementos.inputApellidos.value = e.apellidos;
    this.elementos.inputFechaNac.value = e.fechaNacimiento || '';
    this.elementos.inputGenero.value = e.genero;
    this.elementos.inputEstadoCivil.value = e.estadoCivil;
    this.elementos.inputFechaIngreso.value = e.fechaIngreso;
    this.elementos.inputCargo.value = e.cargo || '';
    this.elementos.inputDepartamento.value = e.departamento || '';
    this.elementos.inputTipoContrato.value = e.tipoContrato;
    this.elementos.inputSalario.value = e.salarioBase;
    this.elementos.modal.classList.remove('oculto');
    this.actualizarPreviewBono();
  },

  cerrarModal() {
    this.elementos.modal.classList.add('oculto');
  },

  actualizarPreviewBono() {
    const fechaIngreso = this.elementos.inputFechaIngreso.value;
    if (!fechaIngreso || !window.catalogoEmpleados) {
      this.elementos.previewBono.textContent = '—';
      return;
    }
    const ant = window.catalogoEmpleados.calcularAntiguedad({ fechaIngreso });
    const bono = window.TablaBonoAntiguedad.calcularBono(ant.aniosDecimal);
    if (bono.porcentaje === 0) {
      this.elementos.previewBono.textContent =
        `Aún no aplica (menos de 2 años). Antigüedad actual: ${ant.anios} años ${ant.meses} meses.`;
    } else {
      this.elementos.previewBono.textContent =
        `${bono.tramo} → ${bono.porcentaje}% × ${window.utilidades.formatearBs(bono.base)} = ${window.utilidades.formatearBs(bono.monto)}/mes`;
    }
  },

  guardarEmpleado(e) {
    e.preventDefault();
    const datos = {
      ci: this.elementos.inputCi.value,
      nit: this.elementos.inputNit.value,
      nombres: this.elementos.inputNombres.value,
      apellidos: this.elementos.inputApellidos.value,
      fechaNacimiento: this.elementos.inputFechaNac.value || null,
      genero: this.elementos.inputGenero.value,
      estadoCivil: this.elementos.inputEstadoCivil.value,
      fechaIngreso: this.elementos.inputFechaIngreso.value,
      cargo: this.elementos.inputCargo.value,
      departamento: this.elementos.inputDepartamento.value,
      tipoContrato: this.elementos.inputTipoContrato.value,
      salarioBase: Number(this.elementos.inputSalario.value)
    };

    let resultado;
    if (this.modoEdicion) {
      resultado = window.catalogoEmpleados.actualizar(this.elementos.inputId.value, datos);
    } else {
      resultado = window.catalogoEmpleados.crear(datos);
    }

    if (resultado.exito) {
      this.mostrarToast(`✅ ${this.modoEdicion ? 'Empleado actualizado' : 'Empleado creado'}: ${resultado.empleado.nombres} ${resultado.empleado.apellidos}`, 'exito');
      this.cerrarModal();
      this.renderizar();
    } else {
      this.mostrarToast(`❌ ${(resultado.errores || []).join(' | ')}`, 'error');
    }
  },

  // ── Modal Retiro ─────────────────────────────────────────────
  abrirModalRetiro(id) {
    const e = window.catalogoEmpleados.obtenerPorId(id);
    if (!e) return;

    this.elementos.retiroId.value = e.id;
    this.elementos.retiroNombre.textContent = `${e.nombres} ${e.apellidos}`;
    this.elementos.retiroDatos.textContent =
      `CI ${e.ci} · ${e.cargo || '—'} · Ingreso: ${e.fechaIngreso}`;
    this.elementos.retiroMotivo.value = 'RENUNCIA';
    this.elementos.retiroFecha.value = new Date().toISOString().split('T')[0];
    this.elementos.modalRetiro.classList.remove('oculto');
  },

  cerrarModalRetiro() {
    this.elementos.modalRetiro.classList.add('oculto');
  },

  confirmarRetiro() {
    const id = this.elementos.retiroId.value;
    const motivo = this.elementos.retiroMotivo.value;
    const fecha = this.elementos.retiroFecha.value;

    const resultado = window.catalogoEmpleados.retirar(id, motivo, fecha);
    if (resultado.exito) {
      this.mostrarToast(`🚪 ${resultado.empleado.nombres} marcado como RETIRADO — Motivo: ${motivo}`, 'info');
      this.cerrarModalRetiro();
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
  if (window.EmpleadosVista && typeof window.EmpleadosVista.inicializar === 'function') {
    window.EmpleadosVista.inicializar();
  }
} catch (error) {
  console.error('❌ Error al inicializar EmpleadosVista:', error);
}
