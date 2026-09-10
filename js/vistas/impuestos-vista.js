// ══════════════════════════════════════════════════════════════
// impuestos-vista.js — Vista de Impuestos y Cumplimiento Fiscal
// ══════════════════════════════════════════════════════════════

window.ImpuestosVista = {

  elementos: {},

  inicializar() {
    console.log('🧾 ImpuestosVista.inicializar()');
    this.capturarElementos();
    this.configurarEventListeners();
    this.cargarPeriodoActual();
    this.cargarRegimenes();
    this.cargarCalendario();
    console.log('✅ Vista Impuestos lista');
  },

  capturarElementos() {
    const g = (id) => document.getElementById(id);
    this.elementos = {
      tabs: document.querySelectorAll('.btn-tab'),
      tabContents: document.querySelectorAll('.tab-content'),

      // Tab IVA
      ivaPeriodo: g('iva-periodo'),
      ivaBtnCalc: g('iva-btn-calcular'),
      ivaBtnForm200: g('iva-btn-form200'),
      ivaBtnAsiento: g('iva-btn-asiento'),
      ivaDebito: g('iva-debito'),
      ivaCredito: g('iva-credito'),
      ivaSaldoAnt: g('iva-saldo-anterior'),
      ivaAPagar: g('iva-a-pagar'),
      ivaSaldoNuevo: g('iva-saldo-nuevo'),
      ivaTablaVentas: g('iva-tabla-ventas'),

      // Tab IT
      itPeriodo: g('it-periodo'),
      itBtnCalc: g('it-btn-calcular'),
      itBtnForm400: g('it-btn-form400'),
      itBtnAsiento: g('it-btn-asiento'),
      itIngresos: g('it-ingresos'),
      itMonto: g('it-monto'),
      itAcumulado: g('it-acumulado'),
      itFacturas: g('it-facturas'),
      itTablaDetalle: g('it-tabla-detalle'),

      // Tab IUE
      iueAnio: g('iue-anio'),
      iueUtilidad: g('iue-utilidad'),
      iueGastosNoDed: g('iue-gastos-no-ded'),
      iueIngresosNoGrav: g('iue-ingresos-no-grav'),
      iueBtnCalc: g('iue-btn-calcular'),
      iueBtnForm500: g('iue-btn-form500'),
      iueBtnAsiento: g('iue-btn-asiento'),
      iueUtilidadContable: g('iue-utilidad-contable'),
      iueUtilidadImp: g('iue-utilidad-imp'),
      iueDeterminado: g('iue-determinado'),
      iueItAcum: g('iue-it-acum'),
      iueFechaLimite: g('iue-fecha-limite'),
      iueAdvertencias: g('iue-advertencias'),

      // Tab Compensación
      compAnio: g('comp-anio'),
      compBtnCompensar: g('comp-btn-compensar'),
      compTablaMensual: g('comp-tabla-mensual'),
      compResultado: g('comp-resultado'),

      // Tab Retenciones
      retPeriodo: g('ret-periodo'),
      retBtnForm110: g('ret-btn-form110'),
      retBtnPago: g('ret-btn-pago'),
      retRcivaEmpleados: g('ret-rciva-empleados'),
      retRcivaProveedores: g('ret-rciva-proveedores'),
      retItProveedores: g('ret-it-proveedores'),
      retTotal: g('ret-total'),
      retTablaProveedores: g('ret-tabla-proveedores'),

      // Tab Regímenes
      regTabla: g('reg-tabla'),

      // Tab Calendario
      calTabla: g('cal-tabla'),

      toasts: g('contenedor-toasts')
    };
  },

  configurarEventListeners() {
    this.elementos.tabs.forEach(tab => {
      if (tab) tab.addEventListener('click', (e) => this.cambiarTab(e.target.dataset.tab));
    });

    // IVA
    if (this.elementos.ivaBtnCalc) {
      this.elementos.ivaBtnCalc.addEventListener('click', () => this.calcularIVA());
    }
    if (this.elementos.ivaBtnForm200) {
      this.elementos.ivaBtnForm200.addEventListener('click', () => this.generarForm200());
    }
    if (this.elementos.ivaBtnAsiento) {
      this.elementos.ivaBtnAsiento.addEventListener('click', () => this.generarAsientoIVA());
    }

    // IT
    if (this.elementos.itBtnCalc) {
      this.elementos.itBtnCalc.addEventListener('click', () => this.calcularIT());
    }
    if (this.elementos.itBtnForm400) {
      this.elementos.itBtnForm400.addEventListener('click', () => this.generarForm400());
    }
    if (this.elementos.itBtnAsiento) {
      this.elementos.itBtnAsiento.addEventListener('click', () => this.generarAsientoIT());
    }

    // IUE
    if (this.elementos.iueBtnCalc) {
      this.elementos.iueBtnCalc.addEventListener('click', () => this.calcularIUE());
    }
    if (this.elementos.iueBtnForm500) {
      this.elementos.iueBtnForm500.addEventListener('click', () => this.generarForm500());
    }
    if (this.elementos.iueBtnAsiento) {
      this.elementos.iueBtnAsiento.addEventListener('click', () => this.generarAsientoIUE());
    }

    // Compensación
    if (this.elementos.compBtnCompensar) {
      this.elementos.compBtnCompensar.addEventListener('click', () => this.compensarITIUE());
    }

    // Retenciones
    if (this.elementos.retBtnForm110) {
      this.elementos.retBtnForm110.addEventListener('click', () => this.generarForm110());
    }
    if (this.elementos.retBtnPago) {
      this.elementos.retBtnPago.addEventListener('click', () => this.pagarRetenciones());
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

    if (tabId === 'calendario') this.cargarCalendario();
    if (tabId === 'regimenes') this.cargarRegimenes();
  },

  cargarPeriodoActual() {
    const ahora = new Date();
    const periodo = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
    if (this.elementos.ivaPeriodo) this.elementos.ivaPeriodo.value = periodo;
    if (this.elementos.itPeriodo) this.elementos.itPeriodo.value = periodo;
    if (this.elementos.retPeriodo) this.elementos.retPeriodo.value = periodo;
    if (this.elementos.iueAnio) this.elementos.iueAnio.value = ahora.getFullYear();
    if (this.elementos.compAnio) this.elementos.compAnio.value = ahora.getFullYear();
  },

  // ══════════════════════════════════════════════════════════
  // IVA
  // ══════════════════════════════════════════════════════════

  calcularIVA() {
    const periodo = this.elementos.ivaPeriodo.value;
    if (!periodo) {
      this.mostrarToast('❌ Seleccione un período', 'error');
      return;
    }

    const conc = window.moduloImpuestos.conciliarIVA(periodo);
    if (!conc.exito) {
      this.mostrarToast(`❌ ${conc.errores.join(', ')}`, 'error');
      return;
    }

    this.elementos.ivaDebito.textContent = window.utilidades.formatearBs(conc.debitoFiscal);
    this.elementos.ivaCredito.textContent = window.utilidades.formatearBs(conc.creditoFiscal);
    this.elementos.ivaSaldoAnt.textContent = window.utilidades.formatearBs(conc.saldoFavorAnterior);
    this.elementos.ivaAPagar.textContent = window.utilidades.formatearBs(conc.ivaPorPagar);
    this.elementos.ivaSaldoNuevo.textContent = window.utilidades.formatearBs(conc.saldoFavorNuevo);

    if (conc.detalleVentas.length === 0) {
      this.elementos.ivaTablaVentas.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:24px;">Sin ventas en el período</td></tr>';
    } else {
      this.elementos.ivaTablaVentas.innerHTML = conc.detalleVentas.map(v => `
        <tr>
          <td>${v.fecha || '—'}</td>
          <td><code>${this._escapeHTML(v.numero)}</code></td>
          <td>${this._escapeHTML(v.cliente)}</td>
          <td class="texto-derecha">${window.utilidades.formatearBs(v.monto)}</td>
          <td class="texto-derecha">${window.utilidades.formatearBs(v.neto)}</td>
          <td class="texto-derecha">${window.utilidades.formatearBs(v.iva)}</td>
        </tr>
      `).join('');
    }

    this.mostrarToast(`✅ IVA conciliado: a pagar ${window.utilidades.formatearBs(conc.ivaPorPagar)}`, 'exito');
  },

  generarForm200() {
    const periodo = this.elementos.ivaPeriodo.value;
    const f200 = window.moduloImpuestos.generarFormulario200(periodo);
    this.mostrarToast(`✅ Form. 200 generado para ${periodo}`, 'exito');
    console.log('📄 Form. 200:', f200);
  },

  generarAsientoIVA() {
    const periodo = this.elementos.ivaPeriodo.value;
    const conc = window.moduloImpuestos.conciliarIVA(periodo);
    if (!conc.exito) {
      this.mostrarToast(`❌ Primero conciliar IVA`, 'error');
      return;
    }
    const as = window.moduloImpuestos.generarAsientoIVA(conc);
    if (as.exito) {
      this.mostrarToast(`✅ Asiento generado: ${as.asiento.numero}`, 'exito');
    } else {
      this.mostrarToast(`❌ ${as.errores.join(', ')}`, 'error');
    }
  },

  // ══════════════════════════════════════════════════════════
  // IT
  // ══════════════════════════════════════════════════════════

  calcularIT() {
    const periodo = this.elementos.itPeriodo.value;
    const it = window.moduloImpuestos.calcularIT(periodo);
    if (!it.exito) {
      this.mostrarToast(`❌ Error al calcular IT`, 'error');
      return;
    }

    this.elementos.itIngresos.textContent = window.utilidades.formatearBs(it.ingresosBrutos);
    this.elementos.itMonto.textContent = window.utilidades.formatearBs(it.itPorPagar);
    this.elementos.itFacturas.textContent = it.cantidadFacturas;

    const anio = periodo.split('-')[0];
    const acum = window.moduloImpuestos.obtenerITAcumuladoAnual(anio);
    this.elementos.itAcumulado.textContent = window.utilidades.formatearBs(acum);

    if (it.detalle.length === 0) {
      this.elementos.itTablaDetalle.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:24px;">Sin ventas en el período</td></tr>';
    } else {
      this.elementos.itTablaDetalle.innerHTML = it.detalle.map(d => `
        <tr>
          <td>${d.fecha || '—'}</td>
          <td><code>${this._escapeHTML(d.numero)}</code></td>
          <td>${this._escapeHTML(d.cliente)}</td>
          <td class="texto-derecha">${window.utilidades.formatearBs(d.montoBruto)}</td>
          <td class="texto-derecha">${window.utilidades.formatearBs(d.montoBruto * 0.03)}</td>
        </tr>
      `).join('');
    }

    this.mostrarToast(`✅ IT calculado: ${window.utilidades.formatearBs(it.itPorPagar)}`, 'exito');
  },

  generarForm400() {
    const periodo = this.elementos.itPeriodo.value;
    const f400 = window.moduloImpuestos.generarFormulario400(periodo);
    this.mostrarToast(`✅ Form. 400 generado para ${periodo}`, 'exito');
    console.log('📄 Form. 400:', f400);
  },

  generarAsientoIT() {
    const periodo = this.elementos.itPeriodo.value;
    const it = window.moduloImpuestos.calcularIT(periodo);
    if (!it.exito || it.itPorPagar <= 0) {
      this.mostrarToast('❌ No hay IT para generar asiento', 'error');
      return;
    }
    const as = window.moduloImpuestos.generarAsientoIT(it);
    if (as.exito) {
      this.mostrarToast(`✅ Asiento IT: ${as.asiento.numero}`, 'exito');
    }
  },

  // ══════════════════════════════════════════════════════════
  // IUE
  // ══════════════════════════════════════════════════════════

  calcularIUE() {
    const anio = parseInt(this.elementos.iueAnio.value);
    const utilidad = parseFloat(this.elementos.iueUtilidad.value) || 0;
    const gastosND = parseFloat(this.elementos.iueGastosNoDed.value) || 0;
    const ingresosNG = parseFloat(this.elementos.iueIngresosNoGrav.value) || 0;

    const iue = window.moduloImpuestos.calcularIUE(anio, {
      utilidadContable: utilidad,
      ajustes: {
        gastosNoDeducibles: gastosND > 0 ? [{ concepto: 'Manual', monto: gastosND }] : [],
        ingresosNoGravables: ingresosNG > 0 ? [{ concepto: 'Manual', monto: ingresosNG }] : []
      }
    });

    if (!iue.exito) {
      this.mostrarToast(`❌ ${iue.errores.join(', ')}`, 'error');
      return;
    }

    this.elementos.iueUtilidadContable.textContent = window.utilidades.formatearBs(iue.utilidadContable);
    this.elementos.iueUtilidadImp.textContent = window.utilidades.formatearBs(iue.utilidadImponible);
    this.elementos.iueDeterminado.textContent = window.utilidades.formatearBs(iue.iueDeterminado);
    this.elementos.iueItAcum.textContent = window.utilidades.formatearBs(iue.itAcumulado);
    this.elementos.iueFechaLimite.textContent = iue.fechaLimite;

    if (iue.advertencias.length > 0) {
      this.elementos.iueAdvertencias.style.display = 'block';
      this.elementos.iueAdvertencias.innerHTML = '<h4 style="margin-bottom:8px;">⚠️ Advertencias</h4>' +
        iue.advertencias.map(a => `<div style="padding:8px; background:#fef3c7; border-radius:4px; margin-bottom:4px;">${a}</div>`).join('');
    } else {
      this.elementos.iueAdvertencias.style.display = 'none';
    }

    this.mostrarToast(`✅ IUE calculado: ${window.utilidades.formatearBs(iue.iueDeterminado)}`, 'exito');
  },

  generarForm500() {
    const anio = parseInt(this.elementos.iueAnio.value);
    const utilidad = parseFloat(this.elementos.iueUtilidad.value) || 0;
    const f500 = window.moduloImpuestos.generarFormulario500(anio, { utilidadContable: utilidad });
    if (f500.exito) {
      this.mostrarToast(`✅ Form. 500 generado para ${anio}`, 'exito');
      console.log('📄 Form. 500:', f500.formulario);
    }
  },

  generarAsientoIUE() {
    const anio = parseInt(this.elementos.iueAnio.value);
    const utilidad = parseFloat(this.elementos.iueUtilidad.value) || 0;
    const iue = window.moduloImpuestos.calcularIUE(anio, { utilidadContable: utilidad });
    if (!iue.exito || iue.iueDeterminado <= 0) {
      this.mostrarToast('❌ No hay IUE para generar asiento', 'error');
      return;
    }
    const as = window.moduloImpuestos.generarAsientoIUE(iue);
    if (as.exito) {
      this.mostrarToast(`✅ Asiento IUE: ${as.asiento.numero}`, 'exito');
    }
  },

  // ══════════════════════════════════════════════════════════
  // COMPENSACIÓN IT-IUE
  // ══════════════════════════════════════════════════════════

  compensarITIUE() {
    const anio = parseInt(this.elementos.compAnio.value);
    const utilidad = parseFloat(this.elementos.iueUtilidad.value) || 25000;

    const comp = window.moduloImpuestos.compensarITcontraIUE(anio, { utilidadContable: utilidad });
    if (!comp.exito) {
      this.mostrarToast(`❌ ${comp.errores.join(', ')}`, 'error');
      return;
    }

    // Tabla mensual
    if (comp.desgloseMensualIT && comp.desgloseMensualIT.length > 0) {
      let acum = 0;
      this.elementos.compTablaMensual.innerHTML = comp.desgloseMensualIT.map(m => {
        acum += m.itPagado;
        return `
          <tr>
            <td>${m.periodo}</td>
            <td class="texto-derecha">${window.utilidades.formatearBs(m.itPagado)}</td>
            <td class="texto-derecha">${window.utilidades.formatearBs(acum)}</td>
          </tr>
        `;
      }).join('');
    }

    // Resultado
    this.elementos.compResultado.style.display = 'block';
    let color = 'var(--color-exito)';
    let mensaje = '';
    if (comp.caso === 'IT_MENOR') {
      color = 'var(--color-exito)';
      mensaje = `✅ IT < IUE: paga ${window.utilidades.formatearBs(comp.iuePorPagar)} de diferencia`;
    } else if (comp.caso === 'IT_IGUAL') {
      color = 'var(--color-exito)';
      mensaje = `✅ Compensación perfecta: no paga nada`;
    } else if (comp.caso === 'IT_MAYOR') {
      color = 'var(--color-error)';
      mensaje = `⚠️ IT > IUE: el exceso de ${window.utilidades.formatearBs(comp.excesoIT)} SE PIERDE`;
    } else {
      color = '#f59e0b';
      mensaje = `⚠️ Pérdida fiscal: todo el IT se pierde`;
    }

    this.elementos.compResultado.innerHTML = `
      <h4 style="margin-bottom:12px; color:${color};">Resultado de la compensación</h4>
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:16px;">
        <div><div style="color:var(--texto-secundario); font-size:0.85rem;">IUE Determinado</div>
          <div style="font-size:1.3rem; font-weight:bold;">${window.utilidades.formatearBs(comp.iueDeterminado)}</div></div>
        <div><div style="color:var(--texto-secundario); font-size:0.85rem;">IT Acumulado</div>
          <div style="font-size:1.3rem; font-weight:bold;">${window.utilidades.formatearBs(comp.itAcumulado)}</div></div>
        <div><div style="color:var(--texto-secundario); font-size:0.85rem;">IT Compensado</div>
          <div style="font-size:1.3rem; font-weight:bold;">${window.utilidades.formatearBs(comp.itCompensado)}</div></div>
        <div><div style="color:var(--texto-secundario); font-size:0.85rem;">IUE a Pagar</div>
          <div style="font-size:1.3rem; font-weight:bold;">${window.utilidades.formatearBs(comp.iuePorPagar)}</div></div>
      </div>
      <div style="padding:12px; background:${color}20; border-radius:6px; border-left:4px solid ${color};">
        <strong>${mensaje}</strong>
      </div>
      ${comp.advertencias.length > 0 ? `
        <div style="margin-top:12px;">
          ${comp.advertencias.map(a => `<div style="padding:8px; background:#fef3c7; border-radius:4px; margin-bottom:4px;">${a}</div>`).join('')}
        </div>
      ` : ''}
    `;

    this.mostrarToast(`✅ Compensación completada: ${comp.caso}`, 'exito');
  },

  // ══════════════════════════════════════════════════════════
  // RETENCIONES
  // ══════════════════════════════════════════════════════════

  generarForm110() {
    const periodo = this.elementos.retPeriodo.value;
    const f110 = window.moduloImpuestos.generarFormulario110(periodo);
    if (!f110.exito) {
      this.mostrarToast(`❌ ${f110.errores.join(', ')}`, 'error');
      return;
    }

    const r = f110.retenciones;
    this.elementos.retRcivaEmpleados.textContent = window.utilidades.formatearBs(r.empleados.totalRetenido || 0);
    this.elementos.retRcivaProveedores.textContent = window.utilidades.formatearBs(r.proveedores.totalRCIVA || 0);
    this.elementos.retItProveedores.textContent = window.utilidades.formatearBs(r.proveedores.totalIT || 0);
    this.elementos.retTotal.textContent = window.utilidades.formatearBs(
      (r.empleados.totalRetenido || 0) + (r.proveedores.totalRCIVA || 0) + (r.proveedores.totalIT || 0)
    );

    const detalle = r.proveedores.detalle || [];
    if (detalle.length === 0) {
      this.elementos.retTablaProveedores.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:24px;">Sin retenciones a proveedores</td></tr>';
    } else {
      this.elementos.retTablaProveedores.innerHTML = detalle.map(d => `
        <tr>
          <td>${d.fecha}</td>
          <td>${this._escapeHTML(d.proveedorNombre)}</td>
          <td class="texto-derecha">${window.utilidades.formatearBs(d.montoPago)}</td>
          <td class="texto-derecha">${window.utilidades.formatearBs(d.retencionRCIVA)}</td>
          <td class="texto-derecha">${window.utilidades.formatearBs(d.retencionIT)}</td>
          <td class="texto-derecha">${window.utilidades.formatearBs(d.netoAPagar)}</td>
        </tr>
      `).join('');
    }

    this.mostrarToast(`✅ Form. 110 generado para ${periodo}`, 'exito');
  },

  pagarRetenciones() {
    const periodo = this.elementos.retPeriodo.value;
    const pago = window.moduloImpuestos.generarAsientoPagoRetenciones(periodo);
    if (pago.exito) {
      this.mostrarToast(`✅ Pago registrado: ${pago.asiento.numero}`, 'exito');
    } else {
      this.mostrarToast(`❌ ${pago.errores.join(', ')}`, 'error');
    }
  },

  // ══════════════════════════════════════════════════════════
  // REGÍMENES TRIBUTARIOS
  // ══════════════════════════════════════════════════════════

  cargarRegimenes() {
    const resumen = window.moduloImpuestos ? window.moduloImpuestos.obtenerResumenRegimenes() : [];
    if (resumen.length === 0) {
      this.elementos.regTabla.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:24px;">No se pudieron cargar los regímenes</td></tr>';
      return;
    }

    this.elementos.regTabla.innerHTML = resumen.map(r => `
      <tr>
        <td><code>${r.codigo}</code></td>
        <td><strong>${r.nombre}</strong>${r.esNuevo ? ' <span style="background:#10b981; color:white; padding:2px 6px; border-radius:3px; font-size:0.7rem;">NUEVO</span>' : ''}</td>
        <td>${this._escapeHTML(r.descripcion.substring(0, 80))}${r.descripcion.length > 80 ? '...' : ''}</td>
        <td>${r.impuestos.join(', ')}</td>
        <td>${r.emiteCreditoFiscal ? '✅ Sí' : '❌ No'}</td>
        <td class="texto-derecha">${r.limiteIngresos ? window.utilidades.formatearBs(r.limiteIngresos) : 'Sin límite'}</td>
      </tr>
    `).join('');
  },

  // ══════════════════════════════════════════════════════════
  // CALENDARIO DE VENCIMIENTOS
  // ══════════════════════════════════════════════════════════

  cargarCalendario() {
    if (!window.periodosFiscales) {
      this.elementos.calTabla.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:24px;">Módulo de períodos fiscales no disponible</td></tr>';
      return;
    }

    const alertas = window.periodosFiscales.generarAlertasVencimiento(365);
    if (alertas.length === 0) {
      this.elementos.calTabla.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:24px;">Sin vencimientos próximos</td></tr>';
      return;
    }

    this.elementos.calTabla.innerHTML = alertas.map(a => `
      <tr>
        <td><span class="semaforo ${a.color}"></span>${a.nivel}</td>
        <td><strong>${a.impuesto}</strong></td>
        <td>${a.periodo}</td>
        <td>${a.formulario}</td>
        <td class="texto-derecha">${window.utilidades.formatearBs(a.monto)}</td>
        <td>${a.fechaVencimiento}</td>
        <td class="texto-derecha"><strong>${a.diasRestantes >= 0 ? a.diasRestantes + ' días' : 'VENCIDO'}</strong></td>
      </tr>
    `).join('');
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
    if (this.elementos.toasts) this.elementos.toasts.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'toastSalida 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
    toast.addEventListener('click', () => toast.remove());
  }
};

try {
  if (window.ImpuestosVista && typeof window.ImpuestosVista.inicializar === 'function') {
    window.ImpuestosVista.inicializar();
  }
} catch (error) {
  console.error('❌ Error al inicializar ImpuestosVista:', error);
}