// ══════════════════════════════════════════════════════════════
// nomina-vista.js — Vista unificada de Nómina y RRHH
// ══════════════════════════════════════════════════════════════

window.NominaVista = {

  elementos: {},
  estadoActual: {
    periodo: null,
    planillaCalculada: null,
    liquidacionCalculada: null
  },

  inicializar() {
    console.log('💼 NominaVista.inicializar()');
    this.capturarElementos();
    this.configurarEventListeners();
    this.cargarPeriodoActual();
    this.cargarEmpleados();
    this.cargarProvisiones();
    this.cargarEstadoSegundoAguinaldo();
    console.log('✅ Vista Nómina lista');
  },

  capturarElementos() {
    const g = (id) => document.getElementById(id);
    this.elementos = {
      // Tabs
      tabs: document.querySelectorAll('.btn-tab'),
      tabContents: document.querySelectorAll('.tab-content'),

      // Tab Planilla
      periodo: g('nomina-periodo'),
      btnCalcular: g('nomina-btn-calcular'),
      btnGenerarAsientos: g('nomina-btn-generar-asientos'),
      cantidad: g('nomina-cantidad'),
      totalDevengado: g('nomina-total-devengado'),
      totalDeducciones: g('nomina-total-deducciones'),
      totalNeto: g('nomina-total-neto'),
      totalPatronal: g('nomina-total-patronal'),
      tablaBody: g('nomina-tabla-body'),

      // Tab Provisiones
      provAguinaldo: g('prov-aguinaldo'),
      provSegundo: g('prov-segundo'),
      provBono: g('prov-bono'),
      provIndemnizacion: g('prov-indemnizacion'),
      toggleSegundo: g('prov-toggle-segundo'),
      estadoToggle: g('prov-estado-toggle'),

      // Tab Liquidaciones
      liqEmpleado: g('liq-empleado'),
      liqMotivo: g('liq-motivo'),
      liqFecha: g('liq-fecha'),
      liqPreaviso: g('liq-preaviso'),
      btnLiqCalcular: g('liq-btn-calcular'),
      liqResultado: g('liq-resultado'),
      liqDesglose: g('liq-desglose'),
      btnLiqRegistrar: g('liq-registrar'),

      // Tab Asientos
      asientosPeriodo: g('asientos-periodo'),
      btnAsientosGenerar: g('asientos-btn-generar'),
      asientosResumen: g('asientos-resumen'),

      toasts: g('contenedor-toasts')
    };
  },

  configurarEventListeners() {
    // Tabs
    this.elementos.tabs.forEach(tab => {
      tab.addEventListener('click', (e) => this.cambiarTab(e.target.dataset.tab));
    });

    // Tab Planilla
    this.elementos.btnCalcular.addEventListener('click', () => this.calcularPlanilla());
    this.elementos.btnGenerarAsientos.addEventListener('click', () => this.generarAsientosDesdePlanilla());

    // Tab Provisiones
    this.elementos.toggleSegundo.addEventListener('change', () => this.toggleSegundoAguinaldo());

    // Tab Liquidaciones
    this.elementos.btnLiqCalcular.addEventListener('click', () => this.calcularLiquidacion());
    this.elementos.btnLiqRegistrar.addEventListener('click', () => this.registrarRetiro());

    // Tab Asientos
    this.elementos.btnAsientosGenerar.addEventListener('click', () => this.generarAsientosConsolidados());
  },

  // ══════════════════════════════════════════════════════════
  // TABS
  // ══════════════════════════════════════════════════════════

  cambiarTab(tabId) {
    this.elementos.tabs.forEach(tab => {
      tab.classList.toggle('activo', tab.dataset.tab === tabId);
    });

    this.elementos.tabContents.forEach(content => {
      const id = content.id.replace('tab-', '');
      if (id === tabId) {
        content.classList.remove('oculto');
      } else {
        content.classList.add('oculto');
      }
    });

    // Actualizar contenido según tab
    if (tabId === 'provisiones') {
      this.cargarProvisiones();
    }
  },

  // ══════════════════════════════════════════════════════════
  // TAB: PLANILLA MENSUAL
  // ══════════════════════════════════════════════════════════

  cargarPeriodoActual() {
    const ahora = new Date();
    const periodo = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
    this.elementos.periodo.value = periodo;
    this.elementos.asientosPeriodo.value = periodo;
    this.estadoActual.periodo = periodo;
  },

  cargarEmpleados() {
    const empleados = window.catalogoEmpleados.obtenerActivos();
    this.elementos.liqEmpleado.innerHTML = empleados.map(e =>
      `<option value="${e.id}">${e.nombres} ${e.apellidos} (CI ${e.ci})</option>`
    ).join('');

    // Fecha de retiro por defecto: hoy
    this.elementos.liqFecha.value = new Date().toISOString().split('T')[0];
  },

  calcularPlanilla() {
    const periodo = this.elementos.periodo.value;
    if (!periodo) {
      this.mostrarToast('❌ Seleccione un período', 'error');
      return;
    }

    const resultado = window.moduloNomina.calcularNominaMensual(periodo);
    if (!resultado.exito) {
      this.mostrarToast(`❌ ${(resultado.errores || []).join(' | ')}`, 'error');
      return;
    }

    this.estadoActual.planillaCalculada = resultado;

    // Actualizar resumen
    this.elementos.cantidad.textContent = resultado.cantidadEmpleados;
    this.elementos.totalDevengado.textContent = window.utilidades.formatearBs(resultado.totales.devengados);
    this.elementos.totalDeducciones.textContent = window.utilidades.formatearBs(resultado.totales.deducciones);
    this.elementos.totalNeto.textContent = window.utilidades.formatearBs(resultado.totales.neto);
    this.elementos.totalPatronal.textContent = window.utilidades.formatearBs(resultado.totales.aportesPatronales);

    // Tabla de detalle
    if (resultado.planilla.length === 0) {
      this.elementos.tablaBody.innerHTML =
        '<tr><td colspan="9" style="text-align:center; padding:24px;">Sin empleados activos</td></tr>';
    } else {
      this.elementos.tablaBody.innerHTML = resultado.planilla.map(l => `
        <tr>
          <td><code>${this._escapeHTML(l.empleadoCI)}</code></td>
          <td><strong>${this._escapeHTML(l.empleadoNombre)}</strong></td>
          <td>${this._escapeHTML(l.cargo || '—')}</td>
          <td class="texto-derecha">${window.utilidades.formatearBs(l.salarioBase)}</td>
          <td class="texto-derecha">${window.utilidades.formatearBs(l.devengados.bonoAntiguedad.monto)}</td>
          <td class="texto-derecha">${window.utilidades.formatearBs(l.devengados.totalDevengado)}</td>
          <td class="texto-derecha">${window.utilidades.formatearBs(l.deducciones.aporteAFP)}</td>
          <td class="texto-derecha">${window.utilidades.formatearBs(l.deducciones.rcIVA.aPagar)}</td>
          <td class="texto-derecha"><strong>${window.utilidades.formatearBs(l.neto)}</strong></td>
        </tr>
      `).join('');
    }

    this.mostrarToast(`✅ Planilla calculada: ${resultado.cantidadEmpleados} empleados`, 'exito');
  },

  generarAsientosDesdePlanilla() {
    if (!this.estadoActual.planillaCalculada) {
      this.mostrarToast('❌ Primero calcule la planilla', 'error');
      return;
    }
    this.generarAsientosConsolidados(this.elementos.periodo.value);
  },

  // ══════════════════════════════════════════════════════════
  // TAB: PROVISIONES
  // ══════════════════════════════════════════════════════════

  cargarProvisiones() {
    if (!window.moduloProvisiones || !window.moduloBonoAntiguedad || !window.moduloLiquidaciones) {
      return;
    }

    const provAguinaldo = window.moduloProvisiones.obtenerProvisionesAcumuladas();
    this.elementos.provAguinaldo.textContent = window.utilidades.formatearBs(provAguinaldo.navidad);
    this.elementos.provSegundo.textContent = window.utilidades.formatearBs(provAguinaldo.segundoAguinaldo);

    const provBono = window.moduloBonoAntiguedad.obtenerProvisionAcumulada();
    this.elementos.provBono.textContent = window.utilidades.formatearBs(provBono);

    const provIndem = window.moduloLiquidaciones.obtenerProvisionAcumulada();
    this.elementos.provIndemnizacion.textContent = window.utilidades.formatearBs(provIndem);
  },

  cargarEstadoSegundoAguinaldo() {
    if (!window.moduloProvisiones) return;
    const config = window.moduloProvisiones.obtenerConfigSegundoAguinaldo();
    this.elementos.toggleSegundo.checked = config.activado;
    this.elementos.estadoToggle.textContent = config.activado ? 'ACTIVADO' : 'DESACTIVADO';
    this.elementos.estadoToggle.style.color = config.activado ? 'var(--color-exito)' : 'var(--color-error)';
  },

  toggleSegundoAguinaldo() {
    const activado = this.elementos.toggleSegundo.checked;
    const resultado = window.moduloProvisiones.toggleSegundoAguinaldo(activado);

    if (resultado.exito) {
      this.elementos.estadoToggle.textContent = activado ? 'ACTIVADO' : 'DESACTIVADO';
      this.elementos.estadoToggle.style.color = activado ? 'var(--color-exito)' : 'var(--color-error)';
      this.mostrarToast(`✅ Segundo aguinaldo ${activado ? 'activado' : 'desactivado'}`, 'exito');

      if (resultado.retroactivoGenerado) {
        this.mostrarToast(`✅ Retroactivo generado: ${window.utilidades.formatearBs(resultado.retroactivoGenerado.monto)}`, 'exito');
      }

      this.cargarProvisiones();
    } else {
      this.mostrarToast(`❌ Error al cambiar toggle`, 'error');
      this.elementos.toggleSegundo.checked = !activado;
    }
  },

  // ══════════════════════════════════════════════════════════
  // TAB: LIQUIDACIONES
  // ══════════════════════════════════════════════════════════

  calcularLiquidacion() {
    const empleadoId = this.elementos.liqEmpleado.value;
    const motivo = this.elementos.liqMotivo.value;
    const fecha = this.elementos.liqFecha.value;
    const tienePreaviso = this.elementos.liqPreaviso.value === 'true';

    if (!empleadoId) {
      this.mostrarToast('❌ Seleccione un empleado', 'error');
      return;
    }

    const empleado = window.catalogoEmpleados.obtenerPorId(empleadoId);
    if (!empleado) {
      this.mostrarToast('❌ Empleado no encontrado', 'error');
      return;
    }

    const liquidacion = window.moduloLiquidaciones.calcularLiquidacion(empleado, motivo, {
      tienePreaviso,
      periodo: fecha.slice(0, 7)
    });

    this.estadoActual.liquidacionCalculada = { liquidacion, empleadoId, motivo, fecha, tienePreaviso };

    // Mostrar desglose
    const desglose = liquidacion.desglose.map(d => `
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--color-borde);">
        <span>${d.concepto}</span>
        <strong>${window.utilidades.formatearBs(d.monto)}</strong>
      </div>
    `).join('');

    this.elementos.liqDesglose.innerHTML = `
      <div style="padding: 12px; background: var(--color-fondo-claro); border-radius: 6px; margin-bottom: 12px;">
        <strong>Empleado:</strong> ${this._escapeHTML(liquidacion.empleadoNombre)} (CI ${liquidacion.empleadoCI})<br>
        <strong>Motivo:</strong> ${liquidacion.motivoRetiro}<br>
        <strong>Preaviso:</strong> ${tienePreaviso ? 'Sí (90 días)' : 'No'}
      </div>
      ${desglose}
    `;

    this.elementos.liqResultado.classList.remove('oculto');
    this.mostrarToast(`✅ Liquidación calculada: ${window.utilidades.formatearBs(liquidacion.totalLiquidacion)}`, 'exito');
  },

  registrarRetiro() {
    if (!this.estadoActual.liquidacionCalculada) {
      this.mostrarToast('❌ Primero calcule la liquidación', 'error');
      return;
    }

    const { empleadoId, motivo, fecha, tienePreaviso } = this.estadoActual.liquidacionCalculada;

    const resultado = window.moduloLiquidaciones.registrarRetiro(empleadoId, motivo, {
      fechaRetiro: fecha,
      tienePreaviso
    });

    if (resultado.exito) {
      this.mostrarToast(`✅ Retiro registrado: ${resultado.empleado.nombres} ${resultado.empleado.apellidos}`, 'exito');
      this.mostrarToast(`✅ Asiento generado: ${resultado.asiento.numero}`, 'exito');

      // Recargar empleados y limpiar
      this.cargarEmpleados();
      this.elementos.liqResultado.classList.add('oculto');
      this.estadoActual.liquidacionCalculada = null;
    } else {
      this.mostrarToast(`❌ ${(resultado.errores || []).join(' | ')}`, 'error');
    }
  },

  // ══════════════════════════════════════════════════════════
  // TAB: ASIENTOS CONTABLES
  // ══════════════════════════════════════════════════════════

  generarAsientosConsolidados(periodo) {
    const P = periodo || this.elementos.asientosPeriodo.value;
    if (!P) {
      this.mostrarToast('❌ Seleccione un período', 'error');
      return;
    }

    const resultado = window.moduloAsientosNomina.generarAsientosMensuales(P);

    if (!resultado.exito) {
      this.mostrarToast(`❌ ${(resultado.errores || []).join(' | ')}`, 'error');
      return;
    }

    // Mostrar resumen
    const resumen = resultado.resumen;
    const asientosHTML = resultado.asientos.map(a => `
      <div style="padding: 12px; background: var(--color-fondo-claro); border-radius: 6px; margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <strong>${a.numero}</strong>
          <span style="color: var(--color-exito);">✓ Cuadra</span>
        </div>
        <div style="font-size: 0.9rem; color: var(--texto-secundario);">${this._escapeHTML(a.concepto)}</div>
        <div style="font-size: 0.9rem; margin-top: 4px;">
          Debe: <strong>${window.utilidades.formatearBs(a.totalDebe)}</strong> | 
          Haber: <strong>${window.utilidades.formatearBs(a.totalHaber)}</strong>
        </div>
      </div>
    `).join('');

    this.elementos.asientosResumen.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="padding: 12px; background: var(--color-fondo-claro); border-radius: 6px;">
          <div style="color: var(--texto-secundario); font-size: 0.85rem;">Asientos generados</div>
          <div style="font-size: 1.3rem; font-weight: bold; color: var(--color-exito);">${resumen.asientosGenerados}</div>
        </div>
        <div style="padding: 12px; background: var(--color-fondo-claro); border-radius: 6px;">
          <div style="color: var(--texto-secundario); font-size: 0.85rem;">Asientos fallidos</div>
          <div style="font-size: 1.3rem; font-weight: bold; color: var(--color-error);">${resumen.asientosFallidos}</div>
        </div>
        <div style="padding: 12px; background: var(--color-fondo-claro); border-radius: 6px;">
          <div style="color: var(--texto-secundario); font-size: 0.85rem;">Empleados</div>
          <div style="font-size: 1.3rem; font-weight: bold;">${resumen.cantidadEmpleados}</div>
        </div>
      </div>
      <h4 style="margin-bottom: 12px;">Asientos contabilizados</h4>
      ${asientosHTML}
    `;

    this.mostrarToast(`✅ ${resumen.asientosGenerados} asientos generados para ${P}`, 'exito');
    this.cargarProvisiones();
  },

  // ══════════════════════════════════════════════════════════
  // UTILIDADES
  // ══════════════════════════════════════════════════════════

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
  if (window.NominaVista && typeof window.NominaVista.inicializar === 'function') {
    window.NominaVista.inicializar();
  }
} catch (error) {
  console.error('❌ Error al inicializar NominaVista:', error);
}