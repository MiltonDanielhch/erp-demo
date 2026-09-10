// ══════════════════════════════════════════════════════════════
// cumplimiento-vista.js — Vista de Cumplimiento y Reportería
// ══════════════════════════════════════════════════════════════

window.CumplimientoVista = {

  elementos: {},
  ultimoDashboard: null,
  ultimoLCV: null,
  ultimoFormulario: null,

  inicializar() {
    console.log('✅ CumplimientoVista.inicializar()');
    this.capturarElementos();
    this.configurarEventListeners();
    this.cargarPeriodoActual();
    console.log('✅ Vista Cumplimiento lista');
  },

  capturarElementos() {
    const g = (id) => document.getElementById(id);
    this.elementos = {
      tabs: document.querySelectorAll('.btn-tab'),
      tabContents: document.querySelectorAll('.tab-content'),

      // Dashboard
      dashBtnActualizar: g('dash-btn-actualizar'),
      dashResumen: g('dash-resumen'),
      dashContenido: g('dash-contenido'),

      // Calendario
      calNit: g('cal-nit'),
      calPeriodo: g('cal-periodo'),
      calBtnCalcular: g('cal-btn-calcular'),
      calContenido: g('cal-contenido'),

      // Formularios
      formTipo: g('form-tipo'),
      formPeriodo: g('form-periodo'),
      formBtnGenerar: g('form-btn-generar'),
      formBtnExportar: g('form-btn-exportar'),
      formContenido: g('form-contenido'),

      // LCV
      lcvPeriodo: g('lcv-periodo'),
      lcvBtnGenerar: g('lcv-btn-generar'),
      lcvBtnConciliar: g('lcv-btn-conciliar'),
      lcvBtnExportar: g('lcv-btn-exportar'),
      lcvContenido: g('lcv-contenido'),

      // Facturación
      factBtnCuis: g('fact-btn-cuis'),
      factBtnCufd: g('fact-btn-cufd'),
      factBtnFactura: g('fact-btn-factura'),
      factBtnActualizar: g('fact-btn-actualizar'),
      factEstado: g('fact-estado'),
      factFacturas: g('fact-facturas'),

      // Fundempresa
      fundGestion: g('fund-gestion'),
      fundBtnGenerar: g('fund-btn-generar'),
      fundBtnActualizar: g('fund-btn-actualizar'),
      fundContenido: g('fund-contenido'),

      // Auditoría
      auditPeriodo: g('audit-periodo'),
      auditBtnPapeles: g('audit-btn-papeles'),
      auditBtnExportar: g('audit-btn-exportar'),
      auditDocId: g('audit-doc-id'),
      auditBtnTrazar: g('audit-btn-trazar'),
      auditContenido: g('audit-contenido'),

      // Alertas
      alertBtnActualizar: g('alert-btn-actualizar'),
      alertContenido: g('alert-contenido'),

      toasts: g('contenedor-toasts')
    };
  },

  configurarEventListeners() {
    this.elementos.tabs.forEach(tab => {
      if (tab) tab.addEventListener('click', (e) => this.cambiarTab(e.target.dataset.tab));
    });

    // Dashboard
    if (this.elementos.dashBtnActualizar) {
      this.elementos.dashBtnActualizar.addEventListener('click', () => this.actualizarDashboard());
    }

    // Calendario
    if (this.elementos.calBtnCalcular) {
      this.elementos.calBtnCalcular.addEventListener('click', () => this.calcularCalendario());
    }

    // Formularios
    if (this.elementos.formBtnGenerar) {
      this.elementos.formBtnGenerar.addEventListener('click', () => this.generarFormulario());
    }
    if (this.elementos.formBtnExportar) {
      this.elementos.formBtnExportar.addEventListener('click', () => this.exportarFormulario());
    }

    // LCV
    if (this.elementos.lcvBtnGenerar) {
      this.elementos.lcvBtnGenerar.addEventListener('click', () => this.generarLCV());
    }
    if (this.elementos.lcvBtnConciliar) {
      this.elementos.lcvBtnConciliar.addEventListener('click', () => this.conciliarLCV());
    }
    if (this.elementos.lcvBtnExportar) {
      this.elementos.lcvBtnExportar.addEventListener('click', () => this.exportarLCV());
    }

    // Facturación
    if (this.elementos.factBtnCuis) {
      this.elementos.factBtnCuis.addEventListener('click', () => this.generarCUIS());
    }
    if (this.elementos.factBtnCufd) {
      this.elementos.factBtnCufd.addEventListener('click', () => this.generarCUFD());
    }
    if (this.elementos.factBtnFactura) {
      this.elementos.factBtnFactura.addEventListener('click', () => this.emitirFacturaDemo());
    }
    if (this.elementos.factBtnActualizar) {
      this.elementos.factBtnActualizar.addEventListener('click', () => this.actualizarEstadoFacturacion());
    }

    // Fundempresa
    if (this.elementos.fundBtnGenerar) {
      this.elementos.fundBtnGenerar.addEventListener('click', () => this.generarObligacionesAnuales());
    }
    if (this.elementos.fundBtnActualizar) {
      this.elementos.fundBtnActualizar.addEventListener('click', () => this.actualizarFundempresa());
    }

    // Auditoría
    if (this.elementos.auditBtnPapeles) {
      this.elementos.auditBtnPapeles.addEventListener('click', () => this.generarPapeles());
    }
    if (this.elementos.auditBtnExportar) {
      this.elementos.auditBtnExportar.addEventListener('click', () => this.exportarPapeles());
    }
    if (this.elementos.auditBtnTrazar) {
      this.elementos.auditBtnTrazar.addEventListener('click', () => this.trazarDocumento());
    }

    // Alertas
    if (this.elementos.alertBtnActualizar) {
      this.elementos.alertBtnActualizar.addEventListener('click', () => this.actualizarAlertas());
    }
  },

  cambiarTab(tabId) {
    this.elementos.tabs.forEach(tab => {
      tab.classList.toggle('activo', tab.dataset.tab === tabId);
    });
    this.elementos.tabContents.forEach(content => {
      const id = content.id.replace('tab-', '');
      content.classList.toggle('oculto', id !== tabId);
    });
  },

  cargarPeriodoActual() {
    const ahora = new Date();
    const periodo = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
    const anio = String(ahora.getFullYear());

    if (this.elementos.calPeriodo) this.elementos.calPeriodo.value = periodo;
    if (this.elementos.formPeriodo) this.elementos.formPeriodo.value = periodo;
    if (this.elementos.lcvPeriodo) this.elementos.lcvPeriodo.value = periodo;
    if (this.elementos.auditPeriodo) this.elementos.auditPeriodo.value = periodo;
    if (this.elementos.fundGestion) this.elementos.fundGestion.value = anio;
  },

  // ══════════════════════════════════════════════════════════
  // DASHBOARD
  // ══════════════════════════════════════════════════════════

  actualizarDashboard() {
    if (!window.ModuloCumplimiento) {
      this.mostrarToast('❌ Módulo de Cumplimiento no disponible', 'error');
      return;
    }

    this.ultimoDashboard = window.ModuloCumplimiento.generarDashboardCumplimiento();
    const d = this.ultimoDashboard;

    // Resumen ejecutivo
    this.elementos.dashResumen.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
        <div>
          <div style="font-size: 1.5em; font-weight: bold; color: ${d.resumen.colorGeneral === 'rojo' ? 'var(--color-error)' : d.resumen.colorGeneral === 'amarillo' ? '#f59e0b' : 'var(--color-exito)'};">
            ${d.resumen.estadoGeneral}
          </div>
          <div style="color: var(--texto-secundario); margin-top: 4px;">${d.resumen.mensaje}</div>
        </div>
        <div style="display: flex; gap: 24px;">
          <div style="text-align: center;">
            <div style="font-size: 2em; font-weight: bold;">${d.resumen.totalAlertas}</div>
            <div style="color: var(--texto-secundario); font-size: 0.85em;">Alertas</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 2em; font-weight: bold; color: var(--color-error);">${d.resumen.alertasCriticas}</div>
            <div style="color: var(--texto-secundario); font-size: 0.85em;">Críticas</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 2em; font-weight: bold; color: #f59e0b;">${d.resumen.alertasProximas}</div>
            <div style="color: var(--texto-secundario); font-size: 0.85em;">Próximas</div>
          </div>
        </div>
      </div>
    `;

    // Contenido del dashboard
    this.elementos.dashContenido.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 12px; margin-bottom: 16px;">

        <div class="card">
          <h4 style="margin-bottom: 12px;">📄 Formularios SIN</h4>
          <table class="tabla">
            <thead>
              <tr><th>Período</th><th>F-200</th><th>F-400</th><th>F-110</th></tr>
            </thead>
            <tbody>
              ${d.formularios.slice(-3).map(f => `
                <tr>
                  <td>${f.periodo}</td>
                  <td>${this._badgeFormulario(f.form200)}</td>
                  <td>${this._badgeFormulario(f.form400)}</td>
                  <td>${this._badgeFormulario(f.form110)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="card">
          <h4 style="margin-bottom: 12px;">📈 Indicadores</h4>
          <div style="padding: 8px 0; border-bottom: 1px solid var(--color-borde);">
            % Facturas con NIT: <strong>${d.indicadores.porcentajeFacturasConNIT}%</strong>
          </div>
          <div style="padding: 8px 0; border-bottom: 1px solid var(--color-borde);">
            % Facturas con CUF: <strong>${d.indicadores.porcentajeFacturasConCUF}%</strong>
          </div>
          <div style="padding: 8px 0;">
            Calidad documental:
            <span class="estado-badge ${d.indicadores.calidadDocumental.color}">
              ${d.indicadores.calidadDocumental.nivel}
            </span>
          </div>
        </div>

        <div class="card">
          <h4 style="margin-bottom: 12px;">🏛️ Fundempresa</h4>
          ${d.fundempresa.disponible ? `
            <div style="padding: 8px 0; border-bottom: 1px solid var(--color-borde);">
              Pendientes: <strong>${d.fundempresa.pendientes}</strong>
            </div>
            <div style="padding: 8px 0; border-bottom: 1px solid var(--color-borde);">
              Cumplidas: <strong>${d.fundempresa.cumplidas}</strong>
            </div>
            <div style="padding: 8px 0;">
              Alertas: <strong>${d.fundempresa.alertas}</strong>
            </div>
          ` : '<p>Módulo no disponible</p>'}
        </div>

        <div class="card">
          <h4 style="margin-bottom: 12px;">🧾 Facturación Electrónica</h4>
          ${d.facturacion.disponible ? `
            <div style="padding: 8px 0; border-bottom: 1px solid var(--color-borde);">
              CUIS: ${d.facturacion.cuisVigente ? '<span class="estado-badge verde">VIGENTE</span>' : '<span class="estado-badge rojo">VENCIDO</span>'}
            </div>
            <div style="padding: 8px 0; border-bottom: 1px solid var(--color-borde);">
              CUFD: ${d.facturacion.cufdVigente ? '<span class="estado-badge verde">VIGENTE</span>' : '<span class="estado-badge rojo">VENCIDO</span>'}
            </div>
            <div style="padding: 8px 0;">
              Facturas emitidas: <strong>${d.facturacion.totalFacturas}</strong>
            </div>
          ` : '<p>Módulo no disponible</p>'}
        </div>

      </div>

      <div class="card">
        <h4 style="margin-bottom: 12px;">📅 Próximos Vencimientos</h4>
        <table class="tabla">
          <thead>
            <tr><th>Estado</th><th>Formulario</th><th>Período</th><th>Vencimiento</th><th class="texto-derecha">Días</th></tr>
          </thead>
          <tbody>
            ${d.proximosVencimientos.slice(0, 5).map(v => `
              <tr>
                <td>${v.semaforo.icono}</td>
                <td>${v.nombre}</td>
                <td>${v.periodo}</td>
                <td>${v.fechaVencimiento}</td>
                <td class="texto-derecha"><strong>${v.diasRestantes}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    this.mostrarToast(`✅ Dashboard actualizado: ${d.resumen.totalAlertas} alertas`, 'exito');
  },

  _badgeFormulario(estado) {
    if (estado === 'GENERADO') return '<span class="estado-badge verde">✓</span>';
    if (estado === 'DECLARADO') return '<span class="estado-badge verde">📋</span>';
    if (estado === 'PAGADO') return '<span class="estado-badge verde">💰</span>';
    return '<span class="estado-badge amarillo">⏳</span>';
  },

  // ══════════════════════════════════════════════════════════
  // CALENDARIO
  // ══════════════════════════════════════════════════════════

  calcularCalendario() {
    const nit = this.elementos.calNit.value;
    const periodo = this.elementos.calPeriodo.value;

    if (!nit || !periodo) {
      this.mostrarToast('❌ Ingrese NIT y período', 'error');
      return;
    }

    const cal = window.CalendarioTributario;
    if (!cal) {
      this.mostrarToast('❌ Calendario Tributario no disponible', 'error');
      return;
    }

    const vencimientos = cal.calcularVencimientos(nit, periodo);

    this.elementos.calContenido.innerHTML = `
      <h4 style="margin-bottom: 12px;">Vencimientos para NIT ${nit} — Período ${periodo}</h4>
      <table class="tabla">
        <thead>
          <tr>
            <th>Estado</th>
            <th>Formulario</th>
            <th>Impuesto</th>
            <th>Frecuencia</th>
            <th>Vencimiento</th>
            <th class="texto-derecha">Días Restantes</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${vencimientos.map(v => `
            <tr>
              <td>${v.semaforo.icono}</td>
              <td><strong>${v.nombre}</strong></td>
              <td>${v.impuesto}</td>
              <td>${v.frecuencia}</td>
              <td>${v.fechaVencimiento}</td>
              <td class="texto-derecha"><strong>${v.diasRestantes}</strong></td>
              <td>
                ${!v.declarado ? `<button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.85em;" onclick="window.CumplimientoVista.marcarDeclarado('${v.formulario}', '${v.periodo}')">📋 Declarar</button>` : '<span class="estado-badge verde">DECLARADO</span>'}
                ${v.declarado && !v.pagado ? `<button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.85em;" onclick="window.CumplimientoVista.marcarPagado('${v.formulario}', '${v.periodo}')">💰 Pagar</button>` : ''}
                ${v.pagado ? '<span class="estado-badge verde">PAGADO</span>' : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    this.mostrarToast(`✅ ${vencimientos.length} vencimientos calculados`, 'exito');
  },

  marcarDeclarado(formulario, periodo) {
    const cal = window.CalendarioTributario;
    if (cal) {
      cal.marcarDeclarado(formulario, periodo);
      this.mostrarToast(`✅ ${formulario} marcado como DECLARADO`, 'exito');
      this.calcularCalendario();
    }
  },

  marcarPagado(formulario, periodo) {
    const cal = window.CalendarioTributario;
    if (cal) {
      cal.marcarPagado(formulario, periodo);
      this.mostrarToast(`✅ ${formulario} marcado como PAGADO`, 'exito');
      this.calcularCalendario();
    }
  },

  // ══════════════════════════════════════════════════════════
  // FORMULARIOS SIN
  // ══════════════════════════════════════════════════════════

  generarFormulario() {
    const tipo = this.elementos.formTipo.value;
    const periodo = this.elementos.formPeriodo.value;

    if (!periodo) {
      this.mostrarToast('❌ Seleccione un período', 'error');
      return;
    }

    const cum = window.ModuloCumplimiento;
    if (!cum) {
      this.mostrarToast('❌ Módulo de Cumplimiento no disponible', 'error');
      return;
    }

    let formulario = null;

    switch (tipo) {
      case 'FORM_200':
        formulario = cum.generarFormulario200(periodo);
        break;
      case 'FORM_400':
        formulario = cum.generarFormulario400(periodo);
        break;
      case 'FORM_110':
        formulario = cum.generarFormulario110(periodo);
        break;
      case 'FORM_500':
        formulario = cum.generarFormulario500(periodo.split('-')[0]);
        break;
      case 'FORM_601':
        formulario = cum.generarFormulario601(periodo.split('-')[0]);
        break;
      case 'FORM_605':
        formulario = cum.generarFormulario605(periodo.split('-')[0], { razonSocial: 'EMPRESA S.A.', nit: '123456789-1' });
        break;
    }

    if (!formulario) {
      this.mostrarToast('❌ No se pudo generar el formulario', 'error');
      return;
    }

    this.ultimoFormulario = formulario;

    const validacionHTML = formulario.validacion
      ? (formulario.validacion.valido
          ? '<span class="estado-badge verde">✅ VÁLIDO</span>'
          : `<span class="estado-badge rojo">❌ ${formulario.validacion.errores.length} errores</span>`)
      : '';

    this.elementos.formContenido.innerHTML = `
      <h4 style="margin-bottom: 12px;">${formulario.nombre || formulario.formulario}</h4>
      <div style="margin-bottom: 16px;">
        <strong>Período:</strong> ${formulario.periodo || formulario.gestion} |
        <strong>Generado:</strong> ${new Date(formulario.fechaGeneracion).toLocaleString()} |
        Validación: ${validacionHTML}
      </div>
      ${formulario.validacion && !formulario.validacion.valido ? `
        <div style="background: #fef2f2; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
          <strong>Errores:</strong>
          <ul style="margin: 8px 0 0 20px;">
            ${formulario.validacion.errores.map(e => `<li>${e}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      <pre style="background: var(--color-fondo-claro); padding: 16px; border-radius: 6px; overflow-x: auto; max-height: 400px;">${JSON.stringify(formulario.datos || formulario, null, 2)}</pre>
    `;

    this.mostrarToast(`✅ ${formulario.formulario} generado`, 'exito');
  },

  exportarFormulario() {
    if (!this.ultimoFormulario) {
      this.mostrarToast('❌ Primero genere un formulario', 'error');
      return;
    }

    const json = window.ModuloCumplimiento.exportarFormulario(this.ultimoFormulario, 'JSON');
    this._descargarArchivo(`formulario_${this.ultimoFormulario.formulario}.json`, json, 'application/json');
    this.mostrarToast('✅ Formulario exportado', 'exito');
  },

  // ══════════════════════════════════════════════════════════
  // LCV
  // ══════════════════════════════════════════════════════════

  generarLCV() {
    const periodo = this.elementos.lcvPeriodo.value;

    if (!periodo) {
      this.mostrarToast('❌ Seleccione un período', 'error');
      return;
    }

    const lcv = window.ModuloCumplimiento.generarLCV(periodo);
    this.ultimoLCV = lcv;

    this.elementos.lcvContenido.innerHTML = `
      <h4 style="margin-bottom: 12px;">Libro de Compras y Ventas IVA — ${periodo}</h4>

      <h5 style="margin-top: 16px;">📥 Sección Compras</h5>
      <table class="tabla">
        <thead>
          <tr>
            <th>NIT</th><th>Razón Social</th><th>Factura</th><th>Fecha</th>
            <th class="texto-derecha">Total</th><th class="texto-derecha">Neto</th><th class="texto-derecha">IVA</th>
          </tr>
        </thead>
        <tbody>
          ${lcv.compras.length > 0 ? lcv.compras.map(f => `
            <tr>
              <td>${f.nit}</td><td>${this._escapeHTML(f.razonSocial)}</td><td>${f.factura}</td><td>${f.fecha}</td>
              <td class="texto-derecha">${this.fmt(f.total)}</td>
              <td class="texto-derecha">${this.fmt(f.neto)}</td>
              <td class="texto-derecha">${this.fmt(f.iva)}</td>
            </tr>
          `).join('') : '<tr><td colspan="7" style="text-align:center; padding:24px;">Sin compras</td></tr>'}
        </tbody>
      </table>

      <h5 style="margin-top: 16px;">📤 Sección Ventas</h5>
      <table class="tabla">
        <thead>
          <tr>
            <th>NIT</th><th>Razón Social</th><th>Factura</th><th>Fecha</th>
            <th class="texto-derecha">Total</th><th class="texto-derecha">Neto</th><th class="texto-derecha">IVA</th><th class="texto-derecha">IT</th>
          </tr>
        </thead>
        <tbody>
          ${lcv.ventas.length > 0 ? lcv.ventas.map(f => `
            <tr>
              <td>${f.nit}</td><td>${this._escapeHTML(f.razonSocial)}</td><td>${f.factura}</td><td>${f.fecha}</td>
              <td class="texto-derecha">${this.fmt(f.total)}</td>
              <td class="texto-derecha">${this.fmt(f.neto)}</td>
              <td class="texto-derecha">${this.fmt(f.iva)}</td>
              <td class="texto-derecha">${this.fmt(f.it)}</td>
            </tr>
          `).join('') : '<tr><td colspan="8" style="text-align:center; padding:24px;">Sin ventas</td></tr>'}
        </tbody>
      </table>

      <div style="margin-top: 16px; padding: 16px; background: var(--color-fondo-claro); border-radius: 6px;">
        <h5 style="margin-bottom: 8px;">📊 Resumen del Período</h5>
        <div>IVA Débito Fiscal: <strong>${this.fmt(lcv.totales.resumen.ivaDebito)}</strong></div>
        <div>IVA Crédito Fiscal: <strong>${this.fmt(lcv.totales.resumen.ivaCredito)}</strong></div>
        <div>IVA por Pagar: <strong>${this.fmt(lcv.totales.resumen.ivaPorPagar)}</strong></div>
        <div>IT por Pagar: <strong>${this.fmt(lcv.totales.resumen.itPorPagar)}</strong></div>
      </div>
    `;

    this.mostrarToast(`✅ LCV generado: ${lcv.compras.length} compras, ${lcv.ventas.length} ventas`, 'exito');
  },

  conciliarLCV() {
    if (!this.ultimoLCV) {
      this.mostrarToast('❌ Primero genere el LCV', 'error');
      return;
    }

    const periodo = this.elementos.lcvPeriodo.value;
    const f200 = window.ModuloCumplimiento.generarFormulario200(periodo);
    const conc = window.ModuloCumplimiento.conciliarLCVconForm200(this.ultimoLCV, f200);

    if (conc.conciliado) {
      this.mostrarToast('✅ LCV conciliado con Form. 200', 'exito');
    } else {
      this.mostrarToast(`❌ Diferencias encontradas: ${conc.diferencias.length}`, 'error');
    }
  },

  exportarLCV() {
    if (!this.ultimoLCV) {
      this.mostrarToast('❌ Primero genere el LCV', 'error');
      return;
    }

    const csv = window.ModuloCumplimiento.exportarLCV(this.ultimoLCV, 'CSV');
    this._descargarArchivo(`lcv_${this.elementos.lcvPeriodo.value}.csv`, csv, 'text/csv');
    this.mostrarToast('✅ LCV exportado a CSV', 'exito');
  },

  // ══════════════════════════════════════════════════════════
  // FACTURACIÓN
  // ══════════════════════════════════════════════════════════

  generarCUIS() {
    const cuis = window.moduloFacturacion.generarCUIS(true);
    this.mostrarToast(`✅ CUIS generado: ${cuis.cuis}`, 'exito');
    this.actualizarEstadoFacturacion();
  },

  generarCUFD() {
    const cufd = window.moduloFacturacion.generarCUFD(true);
    if (cufd.cufd) {
      this.mostrarToast(`✅ CUFD generado: ${cufd.cufd}`, 'exito');
    } else {
      this.mostrarToast(`❌ ${cufd.errores.join(', ')}`, 'error');
    }
    this.actualizarEstadoFacturacion();
  },

  emitirFacturaDemo() {
    const factura = window.moduloFacturacion.generarFacturaElectronica({
      clienteNit: '987654321-2',
      razonSocialCliente: 'Cliente Demo SRL',
      total: 11300,
      detalle: [
        { descripcion: 'Producto Demo', cantidad: 1, precioUnitario: 11300, total: 11300 }
      ]
    });

    if (factura.exito) {
      this.mostrarToast(`✅ Factura #${factura.numeroFactura} emitida | CUF: ${factura.cuf.substring(0, 20)}...`, 'exito');
      this.actualizarEstadoFacturacion();
    } else {
      this.mostrarToast(`❌ ${factura.errores.join(', ')}`, 'error');
    }
  },

  actualizarEstadoFacturacion() {
    const estado = window.moduloFacturacion.obtenerEstado();

    this.elementos.factEstado.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
        <div>
          <div style="color: var(--texto-secundario); font-size: 0.85rem;">CUIS</div>
          <div>
            ${estado.cuis.vigente
              ? `<span class="estado-badge verde">VIGENTE</span> <code>${estado.cuis.codigo}</code>`
              : '<span class="estado-badge rojo">VENCIDO</span>'}
          </div>
          ${estado.cuis.expiracion ? `<div style="font-size: 0.8rem; color: var(--texto-secundario);">Expira: ${new Date(estado.cuis.expiracion).toLocaleString()}</div>` : ''}
        </div>
        <div>
          <div style="color: var(--texto-secundario); font-size: 0.85rem;">CUFD</div>
          <div>
            ${estado.cufd.vigente
              ? `<span class="estado-badge verde">VIGENTE</span> <code>${estado.cufd.codigo}</code>`
              : '<span class="estado-badge rojo">VENCIDO</span>'}
          </div>
          ${estado.cufd.expiracion ? `<div style="font-size: 0.8rem; color: var(--texto-secundario);">Expira: ${new Date(estado.cufd.expiracion).toLocaleString()}</div>` : ''}
        </div>
        <div>
          <div style="color: var(--texto-secundario); font-size: 0.85rem;">Facturas Emitidas</div>
          <div style="font-size: 1.5rem; font-weight: bold;">${estado.facturas.total}</div>
        </div>
      </div>
    `;

    if (estado.facturas.total > 0) {
      const facturas = JSON.parse(localStorage.getItem('erp_facturacion_facturas') || '[]');
      this.elementos.factFacturas.innerHTML = `
        <h4 style="margin-bottom: 12px;">🧾 Últimas Facturas Emitidas</h4>
        <table class="tabla">
          <thead>
            <tr>
              <th>Número</th><th>Fecha</th><th>Cliente</th>
              <th class="texto-derecha">Total</th><th>CUF</th><th>QR</th>
            </tr>
          </thead>
          <tbody>
            ${facturas.slice(-5).reverse().map(f => `
              <tr>
                <td><strong>${f.numeroFactura}</strong></td>
                <td>${f.factura?.fecha || '—'}</td>
                <td>${this._escapeHTML(f.receptor?.razonSocial || '—')}</td>
                <td class="texto-derecha">${this.fmt(f.totales?.total || 0)}</td>
                <td><code style="font-size: 0.75em;">${f.cuf.substring(0, 20)}...</code></td>
                <td><a href="${f.codigoQR}" target="_blank" style="font-size: 0.85em;">🔗 Validar</a></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }
  },

  // ══════════════════════════════════════════════════════════
  // FUNDEMPRESA
  // ══════════════════════════════════════════════════════════

  generarObligacionesAnuales() {
    const gestion = parseInt(this.elementos.fundGestion.value);

    if (!gestion) {
      this.mostrarToast('❌ Ingrese una gestión válida', 'error');
      return;
    }

    const resultado = window.moduloFundempresa.generarObligacionesAnuales(gestion);
    this.mostrarToast(`✅ ${resultado.total} obligaciones generadas para ${gestion}`, 'exito');
    this.actualizarFundempresa();
  },

  actualizarFundempresa() {
    const fund = window.moduloFundempresa;
    if (!fund) {
      this.mostrarToast('❌ Módulo Fundempresa no disponible', 'error');
      return;
    }

    const pendientes = fund.obtenerObligacionesPendientes();
    const cumplidas = fund.obtenerObligacionesCumplidas();

    this.elementos.fundContenido.innerHTML = `
      <h4 style="margin-bottom: 12px;">🏛️ Obligaciones Societarias</h4>

      <h5 style="margin-top: 16px;">📋 Pendientes (${pendientes.length})</h5>
      ${pendientes.length > 0 ? `
        <table class="tabla">
          <thead>
            <tr><th>Obligación</th><th>Gestión</th><th>Vencimiento</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            ${pendientes.map(o => {
              const diasRestantes = Math.ceil((new Date(o.fechaVencimiento) - new Date()) / (1000 * 60 * 60 * 24));
              const estado = diasRestantes < 0 ? '⚫ VENCIDO' : diasRestantes < 7 ? '🔴 CRÍTICO' : diasRestantes < 30 ? '🟡 PRÓXIMO' : '🟢 OK';
              return `
                <tr>
                  <td><strong>${o.nombre}</strong></td>
                  <td>${o.gestion}</td>
                  <td>${o.fechaVencimiento}</td>
                  <td>${estado}</td>
                  <td><button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.85em;" onclick="window.CumplimientoVista.cumplirObligacion('${o.id}')">✅ Cumplir</button></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      ` : '<p style="color: var(--texto-secundario);">Sin obligaciones pendientes</p>'}

      <h5 style="margin-top: 16px;">✅ Cumplidas (${cumplidas.length})</h5>
      ${cumplidas.length > 0 ? `
        <table class="tabla">
          <thead>
            <tr><th>Obligación</th><th>Gestión</th><th>Fecha Cumplimiento</th></tr>
          </thead>
          <tbody>
            ${cumplidas.map(o => `
              <tr>
                <td>${o.nombre}</td>
                <td>${o.gestion}</td>
                <td>${o.fechaCumplimiento ? new Date(o.fechaCumplimiento).toLocaleDateString() : '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p style="color: var(--texto-secundario);">Sin obligaciones cumplidas</p>'}
    `;
  },

  cumplirObligacion(id) {
    const resultado = window.moduloFundempresa.marcarCumplida(id);
    if (resultado.exito) {
      this.mostrarToast(`✅ Obligación cumplida`, 'exito');
      this.actualizarFundempresa();
    } else {
      this.mostrarToast(`❌ ${resultado.errores.join(', ')}`, 'error');
    }
  },

  // ══════════════════════════════════════════════════════════
  // AUDITORÍA
  // ══════════════════════════════════════════════════════════

  generarPapeles() {
    const periodo = this.elementos.auditPeriodo.value;

    if (!periodo) {
      this.mostrarToast('❌ Seleccione un período', 'error');
      return;
    }

    const papeles = window.ModuloCumplimiento.generarPapelesTrabajo(periodo);

    this.ultimoPapeles = papeles;

    const listaPapeles = Object.entries(papeles)
      .filter(([k, v]) => !['exito', 'periodo', 'fechaGeneracion', 'totalPapeles', 'advertencia', 'papelesDisponibles'].includes(k))
      .map(([k, v]) => {
        const disponible = v !== null && v !== undefined;
        return `
          <div style="padding: 8px 0; border-bottom: 1px solid var(--color-borde);">
            ${disponible ? '✅' : '⚠️'} <strong>${this._nombrePapel(k)}</strong>
          </div>
        `;
      }).join('');

    this.elementos.auditContenido.innerHTML = `
      <h4 style="margin-bottom: 12px;">📋 Papeles de Trabajo — ${periodo}</h4>
      <div style="margin-bottom: 16px;">
        Disponibles: <strong>${papeles.papelesDisponibles}/${papeles.totalPapeles}</strong>
      </div>
      <div>${listaPapeles}</div>
      <div style="margin-top: 16px; padding: 12px; background: #fef3c7; border-radius: 6px;">
        ${papeles.advertencia}
      </div>
    `;

    this.mostrarToast(`✅ ${papeles.papelesDisponibles}/${papeles.totalPapeles} papeles generados`, 'exito');
  },

  _nombrePapel(clave) {
    const nombres = {
      libroDiario: 'Libro Diario',
      libroMayor: 'Libro Mayor',
      balanza: 'Balanza de Comprobación',
      conciliacionBancaria: 'Conciliación Bancaria',
      cuentasPorCobrar: 'Cuentas por Cobrar',
      cuentasPorPagar: 'Cuentas por Pagar',
      kardexInventario: 'Kardex de Inventario',
      activosFijos: 'Activos Fijos',
      provisiones: 'Provisiones Laborales',
      conciliacionIVA: 'Conciliación IVA (Form. 200)',
      conciliacionIT: 'Conciliación IT (Form. 400)',
      liquidacionIUE: 'Liquidación IUE (Form. 500)',
      lcv: 'Libro de Compras y Ventas',
      estadosFinancieros: 'Estados Financieros'
    };
    return nombres[clave] || clave;
  },

  exportarPapeles() {
    if (!this.ultimoPapeles) {
      this.mostrarToast('❌ Primero genere los papeles de trabajo', 'error');
      return;
    }

    const json = window.ModuloCumplimiento.exportarParaAuditor(this.elementos.auditPeriodo.value, 'JSON');
    this._descargarArchivo(`auditoria_${this.elementos.auditPeriodo.value}.json`, json, 'application/json');
    this.mostrarToast('✅ Paquete de auditoría exportado', 'exito');
  },

  trazarDocumento() {
    const docId = this.elementos.auditDocId.value;

    if (!docId) {
      this.mostrarToast('❌ Ingrese el ID del documento', 'error');
      return;
    }

    const traz = window.ModuloCumplimiento.generarTrazabilidadDocumento(docId);

    if (!traz.exito) {
      this.mostrarToast(`❌ ${traz.errores.join(', ')}`, 'error');
      return;
    }

    this.elementos.auditContenido.innerHTML = `
      <h4 style="margin-bottom: 12px;">🔍 Trazabilidad del Documento</h4>

      <div class="card" style="margin-bottom: 12px;">
        <h5>📄 Documento Fuente</h5>
        <div>ID: <code>${traz.cadena.documento.id}</code></div>
        <div>Tipo: <strong>${traz.cadena.documento.tipo}</strong></div>
        <div>Fecha: ${traz.cadena.documento.fecha || '—'}</div>
        <div>Monto: ${this.fmt(traz.cadena.documento.monto || 0)}</div>
        <div>Contraparte: ${this._escapeHTML(traz.cadena.documento.contraparte || '—')}</div>
      </div>

      <div class="card" style="margin-bottom: 12px;">
        <h5>📒 Asientos Contables (${traz.cadena.asientos.length})</h5>
        ${traz.cadena.asientos.length > 0 ? `
          <table class="tabla">
            <thead><tr><th>Número</th><th>Fecha</th><th>Concepto</th><th class="texto-derecha">Debe</th><th class="texto-derecha">Haber</th></tr></thead>
            <tbody>
              ${traz.cadena.asientos.map(a => `
                <tr>
                  <td>${a.numero}</td>
                  <td>${a.fecha}</td>
                  <td>${a.concepto}</td>
                  <td class="texto-derecha">${this.fmt(a.totalDebe)}</td>
                  <td class="texto-derecha">${this.fmt(a.totalHaber)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p style="color: var(--texto-secundario);">Sin asientos vinculados</p>'}
      </div>

      <div class="card" style="margin-bottom: 12px;">
        <h5>📊 Cuentas Afectadas (${traz.cadena.cuentasAfectadas.length})</h5>
        ${traz.cadena.cuentasAfectadas.length > 0 ? `
          <table class="tabla">
            <thead><tr><th>Código</th><th>Nombre</th><th class="texto-derecha">Monto</th></tr></thead>
            <tbody>
              ${traz.cadena.cuentasAfectadas.map(c => `
                <tr>
                  <td><code>${c.codigo}</code></td>
                  <td>${c.nombre}</td>
                  <td class="texto-derecha">${this.fmt(c.montoEnDocumento)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p style="color: var(--texto-secundario);">Sin cuentas afectadas</p>'}
      </div>

      <div class="card">
        <h5>📈 Estados Financieros Afectados</h5>
        ${traz.resumen.estados.length > 0
          ? traz.resumen.estados.map(e => `<div>• ${e}</div>`).join('')
          : '<p style="color: var(--texto-secundario);">Sin estados afectados</p>'}
      </div>
    `;

    this.mostrarToast('✅ Trazabilidad generada', 'exito');
  },

  // ══════════════════════════════════════════════════════════
  // ALERTAS
  // ══════════════════════════════════════════════════════════

  actualizarAlertas() {
    const dashboard = window.ModuloCumplimiento.generarDashboardCumplimiento();
    const alertas = dashboard.alertasConsolidadas;

    if (alertas.length === 0) {
      this.elementos.alertContenido.innerHTML = '<p style="text-align:center; padding:40px; color: var(--texto-secundario);">✅ Sin alertas pendientes</p>';
      return;
    }

    this.elementos.alertContenido.innerHTML = alertas.map(a => {
      const clase = a.prioridad <= 2 ? 'critico' : a.prioridad <= 4 ? 'proximo' : 'ok';
      return `
        <div class="alerta-card ${clase}">
          <div>
            <div style="font-weight: 600;">${a.icono || '⚪'} ${a.mensaje}</div>
            <div style="font-size: 0.85em; color: var(--texto-secundario); margin-top: 4px;">
              Origen: <strong>${a.origen}</strong> |
              Nivel: <strong>${a.nivel || '—'}</strong>
            </div>
          </div>
          <div style="text-align: right;">
            ${a.diasRestantes !== undefined
              ? `<div style="font-weight: bold;">${a.diasRestantes < 0 ? Math.abs(a.diasRestantes) + ' días vencido' : a.diasRestantes + ' días'}</div>`
              : ''}
          </div>
        </div>
      `;
    }).join('');

    this.mostrarToast(`✅ ${alertas.length} alertas cargadas`, 'exito');
  },

  // ══════════════════════════════════════════════════════════
  // UTILIDADES
  // ══════════════════════════════════════════════════════════

  fmt(n) {
    return (window.utilidades && window.utilidades.formatearBs)
      ? window.utilidades.formatearBs(n)
      : `Bs ${Number(n || 0).toFixed(2)}`;
  },

  _escapeHTML(texto) {
    if (!texto) return '';
    return String(texto)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  _descargarArchivo(nombre, contenido, tipoMime) {
    const blob = new Blob([contenido], { type: tipoMime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  mostrarToast(mensaje, tipo = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `<span>${mensaje}</span>`;
    if (this.elementos.toasts) this.elementos.toasts.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'toastSalida 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
    toast.addEventListener('click', () => toast.remove());
  }
};

try {
  if (window.CumplimientoVista && typeof window.CumplimientoVista.inicializar === 'function') {
    window.CumplimientoVista.inicializar();
  }
} catch (error) {
  console.error('❌ Error al inicializar CumplimientoVista:', error);
}
