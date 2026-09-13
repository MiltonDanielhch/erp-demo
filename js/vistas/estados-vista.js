// ══════════════════════════════════════════════════════════════
// estados-vista.js — Vista de Estados Financieros
// ══════════════════════════════════════════════════════════════

window.EstadosVista = {

  elementos: {},

  inicializar() {
    console.log('📊 EstadosVista.inicializar()');
    this.capturarElementos();
    this.configurarEventListeners();
    this.cargarPeriodoActual();
    console.log('✅ Vista Estados Financieros lista');
  },

  capturarElementos() {
    const g = (id) => document.getElementById(id);
    this.elementos = {
      tabs: document.querySelectorAll('.btn-tab'),
      tabContents: document.querySelectorAll('.tab-content'),

      // Estado de Resultados
      erPeriodo: g('er-periodo'),
      erTipo: g('er-tipo'),
      erBtnGenerar: g('er-btn-generar'),
      erBtnComparar: g('er-btn-comparar'),
      erBtnImprimir: g('er-btn-imprimir'),
      erContenido: g('er-contenido'),

      // Balance General
      bgFecha: g('bg-fecha'),
      bgBtnGenerar: g('bg-btn-generar'),
      bgBtnImprimir: g('bg-btn-imprimir'),
      bgContenido: g('bg-contenido'),

      // Flujo de Efectivo
      fePeriodo: g('fe-periodo'),
      feMetodo: g('fe-metodo'),
      feBtnGenerar: g('fe-btn-generar'),
      feBtnImprimir: g('fe-btn-imprimir'),
      feContenido: g('fe-contenido'),

      // Notas
      notasPeriodo: g('notas-periodo'),
      notasBtnGenerar: g('notas-btn-generar'),
      notasContenido: g('notas-contenido'),

      // Comparativos
      compPeriodo1: g('comp-periodo1'),
      compPeriodo2: g('comp-periodo2'),
      compBtnGenerar: g('comp-btn-generar'),
      compContenido: g('comp-contenido'),

      // Ratios
      ratiosPeriodo: g('ratios-periodo'),
      ratiosBtnGenerar: g('ratios-btn-generar'),
      ratiosContenido: g('ratios-contenido'),

      // Resumen
      resumenPeriodo: g('resumen-periodo'),
      resumenBtnGenerar: g('resumen-btn-generar'),
      resumenBtnPdf: g('resumen-btn-pdf'),
      resumenContenido: g('resumen-contenido'),

      toasts: g('contenedor-toasts')
    };
  },

  configurarEventListeners() {
    this.elementos.tabs.forEach(tab => {
      if (tab) tab.addEventListener('click', (e) => this.cambiarTab(e.target.dataset.tab));
    });

    // Estado de Resultados
    if (this.elementos.erBtnGenerar) {
      this.elementos.erBtnGenerar.addEventListener('click', () => this.generarEstadoResultados());
    }
    if (this.elementos.erBtnImprimir) {
      this.elementos.erBtnImprimir.addEventListener('click', () => window.print());
    }

    // Balance General
    if (this.elementos.bgBtnGenerar) {
      this.elementos.bgBtnGenerar.addEventListener('click', () => this.generarBalanceGeneral());
    }
    if (this.elementos.bgBtnImprimir) {
      this.elementos.bgBtnImprimir.addEventListener('click', () => window.print());
    }

    // Flujo de Efectivo
    if (this.elementos.feBtnGenerar) {
      this.elementos.feBtnGenerar.addEventListener('click', () => this.generarFlujoEfectivo());
    }
    if (this.elementos.feBtnImprimir) {
      this.elementos.feBtnImprimir.addEventListener('click', () => window.print());
    }

    // Notas
    if (this.elementos.notasBtnGenerar) {
      this.elementos.notasBtnGenerar.addEventListener('click', () => this.generarNotas());
    }

    // Comparativos
    if (this.elementos.compBtnGenerar) {
      this.elementos.compBtnGenerar.addEventListener('click', () => this.generarComparativo());
    }

    // Ratios
    if (this.elementos.ratiosBtnGenerar) {
      this.elementos.ratiosBtnGenerar.addEventListener('click', () => this.calcularRatios());
    }

    // Resumen
    if (this.elementos.resumenBtnGenerar) {
      this.elementos.resumenBtnGenerar.addEventListener('click', () => this.generarResumen());
    }
    if (this.elementos.resumenBtnPdf) {
      this.elementos.resumenBtnPdf.addEventListener('click', () => window.print());
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
    const fechaHoy = ahora.toISOString().split('T')[0];

    if (this.elementos.erPeriodo) this.elementos.erPeriodo.value = periodo;
    if (this.elementos.fePeriodo) this.elementos.fePeriodo.value = periodo;
    if (this.elementos.notasPeriodo) this.elementos.notasPeriodo.value = periodo;
    if (this.elementos.compPeriodo1) this.elementos.compPeriodo1.value = periodo;
    if (this.elementos.compPeriodo2) this.elementos.compPeriodo2.value = periodo;
    if (this.elementos.ratiosPeriodo) this.elementos.ratiosPeriodo.value = periodo;
    if (this.elementos.resumenPeriodo) this.elementos.resumenPeriodo.value = periodo;
    if (this.elementos.bgFecha) this.elementos.bgFecha.value = fechaHoy;
  },

  // ══════════════════════════════════════════════════════════
  // ESTADO DE RESULTADOS
  // ══════════════════════════════════════════════════════════

  generarEstadoResultados() {
    const periodoInput = this.elementos.erPeriodo.value;
    const tipo = this.elementos.erTipo.value;

    let periodo;
    if (tipo === 'anual') {
      periodo = periodoInput.split('-')[0];
    } else {
      periodo = periodoInput;
    }

    const er = window.capaEstadosFinancieros.generarEstadoResultados(periodo);
    if (!er.exito) {
      this.mostrarToast(`❌ ${er.errores.join(', ')}`, 'error');
      return;
    }

    const estado = er.indicadores.esUtilidad ? '✅ UTILIDAD' : er.indicadores.esPerdida ? '❌ PÉRDIDA' : '⚖️ EQUILIBRIO';

    this.elementos.erContenido.innerHTML = `
      <div class="reporte-header" style="text-align: center; margin-bottom: 24px;">
        <h3>ESTADO DE RESULTADOS</h3>
        <p>Del ${er.periodo} (${er.tipo})</p>
        <p>(Expresado en Bolivianos)</p>
        <p><strong>${estado}</strong></p>
      </div>
      <table class="tabla" style="width: 100%;">
        <tbody>
          <tr><td>Ventas Netas</td><td class="texto-derecha">${this.fmt(er.ventasNetas)}</td></tr>
          <tr><td>(-) Costo de Ventas</td><td class="texto-derecha">(${this.fmt(er.costoVentas)})</td></tr>
          <tr style="font-weight: bold; background: var(--color-fondo-claro);">
            <td>= UTILIDAD BRUTA</td><td class="texto-derecha">${this.fmt(er.utilidadBruta)}</td>
          </tr>
          <tr><td>(-) Gastos Operativos</td><td class="texto-derecha">(${this.fmt(er.gastosOperativos)})</td></tr>
          <tr style="font-weight: bold; background: var(--color-fondo-claro);">
            <td>= UTILIDAD OPERATIVA</td><td class="texto-derecha">${this.fmt(er.utilidadOperativa)}</td>
          </tr>
          <tr><td>(+) Ingresos No Operativos</td><td class="texto-derecha">${this.fmt(er.ingresosNoOperativos)}</td></tr>
          <tr><td>(-) Gastos No Operativos</td><td class="texto-derecha">(${this.fmt(er.gastosNoOperativos)})</td></tr>
          <tr style="font-weight: bold; background: var(--color-fondo-claro);">
            <td>= UTILIDAD ANTES DE IMPUESTOS</td><td class="texto-derecha">${this.fmt(er.utilidadAntesImpuestos)}</td>
          </tr>
          <tr><td>(-) IUE (25%)</td><td class="texto-derecha">(${this.fmt(er.iue)})</td></tr>
          <tr style="font-weight: bold; font-size: 1.1em; background: ${er.indicadores.esUtilidad ? '#f0fdf4' : '#fef2f2'};">
            <td>= UTILIDAD NETA</td><td class="texto-derecha">${this.fmt(er.utilidadNeta)}</td>
          </tr>
        </tbody>
      </table>
      <div style="margin-top: 16px; padding: 12px; background: var(--color-fondo-claro); border-radius: 6px;">
        <strong>Indicadores:</strong>
        Margen Bruto: ${er.indicadores.margenBruto}% |
        Margen Operativo: ${er.indicadores.margenOperativo}% |
        Margen Neto: ${er.indicadores.margenNeto}%
      </div>
    `;

    this.mostrarToast(`✅ Estado de Resultados generado`, 'exito');
  },

  // ══════════════════════════════════════════════════════════
  // BALANCE GENERAL
  // ══════════════════════════════════════════════════════════

  generarBalanceGeneral() {
    const fecha = this.elementos.bgFecha.value;
    const bg = window.capaEstadosFinancieros.generarBalanceGeneral(fecha);

    if (!bg.exito) {
      this.mostrarToast(`❌ ${bg.errores.join(', ')}`, 'error');
      return;
    }

    const ecuacionHTML = bg.ecuacionContable.cuadra
      ? `<div class="semaforo-ecuacion cuadra">✅ ${bg.ecuacionContable.mensaje}</div>`
      : `<div class="semaforo-ecuacion no-cuadra">❌ ${bg.ecuacionContable.mensaje}</div>`;

    this.elementos.bgContenido.innerHTML = `
      <div class="reporte-header" style="text-align: center; margin-bottom: 24px;">
        <h3>BALANCE GENERAL</h3>
        <p>Al ${fecha}</p>
        <p>(Expresado en Bolivianos)</p>
      </div>

      <h4>ACTIVOS</h4>
      <table class="tabla" style="width: 100%; margin-bottom: 16px;">
        <tbody>
          <tr><td colspan="2"><strong>Activos Corrientes</strong></td></tr>
          ${bg.desglose.activoCorriente.map(c => `
            <tr><td style="padding-left: 20px;">${c.nombre}</td><td class="texto-derecha">${this.fmt(c.saldo)}</td></tr>
          `).join('')}
          <tr style="font-weight: bold;"><td>Total Activos Corrientes</td><td class="texto-derecha">${this.fmt(bg.activoCorriente)}</td></tr>
          <tr><td colspan="2"><strong>Activos No Corrientes</strong></td></tr>
          ${bg.desglose.activoNoCorriente.map(c => `
            <tr><td style="padding-left: 20px;">${c.nombre}</td><td class="texto-derecha">${this.fmt(c.saldo)}</td></tr>
          `).join('')}
          <tr style="font-weight: bold;"><td>Total Activos No Corrientes</td><td class="texto-derecha">${this.fmt(bg.activoNoCorriente)}</td></tr>
          <tr style="font-weight: bold; font-size: 1.1em; background: var(--color-fondo-claro);">
            <td>TOTAL ACTIVOS</td><td class="texto-derecha">${this.fmt(bg.totalActivos)}</td>
          </tr>
        </tbody>
      </table>

      <h4>PASIVOS</h4>
      <table class="tabla" style="width: 100%; margin-bottom: 16px;">
        <tbody>
          <tr><td colspan="2"><strong>Pasivos Corrientes</strong></td></tr>
          ${bg.desglose.pasivoCorriente.map(c => `
            <tr><td style="padding-left: 20px;">${c.nombre}</td><td class="texto-derecha">${this.fmt(c.saldo)}</td></tr>
          `).join('')}
          <tr style="font-weight: bold;"><td>Total Pasivos Corrientes</td><td class="texto-derecha">${this.fmt(bg.pasivoCorriente)}</td></tr>
          <tr><td colspan="2"><strong>Pasivos No Corrientes</strong></td></tr>
          ${bg.desglose.pasivoNoCorriente.map(c => `
            <tr><td style="padding-left: 20px;">${c.nombre}</td><td class="texto-derecha">${this.fmt(c.saldo)}</td></tr>
          `).join('')}
          <tr style="font-weight: bold;"><td>Total Pasivos No Corrientes</td><td class="texto-derecha">${this.fmt(bg.pasivoNoCorriente)}</td></tr>
          <tr style="font-weight: bold; font-size: 1.1em; background: var(--color-fondo-claro);">
            <td>TOTAL PASIVOS</td><td class="texto-derecha">${this.fmt(bg.totalPasivos)}</td>
          </tr>
        </tbody>
      </table>

      <h4>PATRIMONIO</h4>
      <table class="tabla" style="width: 100%; margin-bottom: 16px;">
        <tbody>
          ${bg.desglose.patrimonio.map(c => `
            <tr><td style="padding-left: 20px;">${c.nombre}</td><td class="texto-derecha">${this.fmt(c.saldo)}</td></tr>
          `).join('')}
          <tr style="font-weight: bold; font-size: 1.1em; background: var(--color-fondo-claro);">
            <td>TOTAL PATRIMONIO</td><td class="texto-derecha">${this.fmt(bg.totalPatrimonio)}</td>
          </tr>
        </tbody>
      </table>

      <table class="tabla" style="width: 100%;">
        <tbody>
          <tr style="font-weight: bold; font-size: 1.1em;">
            <td>TOTAL PASIVO + PATRIMONIO</td>
            <td class="texto-derecha">${this.fmt(bg.totalPasivoPatrimonio)}</td>
          </tr>
        </tbody>
      </table>

      ${ecuacionHTML}
    `;

    this.mostrarToast(`✅ Balance General generado`, 'exito');
  },

  // ══════════════════════════════════════════════════════════
  // FLUJO DE EFECTIVO
  // ══════════════════════════════════════════════════════════

  generarFlujoEfectivo() {
    const periodo = this.elementos.fePeriodo.value;
    const metodo = this.elementos.feMetodo.value;

    const flujo = window.capaEstadosFinancieros.generarFlujoEfectivo(periodo, metodo);
    if (!flujo.exito) {
      this.mostrarToast(`❌ ${flujo.errores.join(', ')}`, 'error');
      return;
    }

    this.elementos.feContenido.innerHTML = `
      <div class="reporte-header" style="text-align: center; margin-bottom: 24px;">
        <h3>ESTADO DE FLUJO DE EFECTIVO</h3>
        <p>Del ${periodo} — Método ${flujo.metodo}</p>
        <p>(Expresado en Bolivianos)</p>
      </div>

      <h4>ACTIVIDADES OPERATIVAS</h4>
      <table class="tabla" style="width: 100%; margin-bottom: 16px;">
        <tbody>
          <tr><td>Utilidad Neta del Período</td><td class="texto-derecha">${this.fmt(flujo.actividadesOperativas?.utilidadNeta || 0)}</td></tr>
          <tr><td>(+) Depreciación</td><td class="texto-derecha">${this.fmt(flujo.actividadesOperativas?.ajustes?.depreciacion || 0)}</td></tr>
          <tr style="font-weight: bold; background: var(--color-fondo-claro);">
            <td>Flujo Neto Operativo</td><td class="texto-derecha">${this.fmt(flujo.actividadesOperativas?.flujoNetoOperativo || 0)}</td>
          </tr>
        </tbody>
      </table>

      <h4>ACTIVIDADES DE INVERSIÓN</h4>
      <table class="tabla" style="width: 100%; margin-bottom: 16px;">
        <tbody>
          <tr style="font-weight: bold; background: var(--color-fondo-claro);">
            <td>Flujo Neto de Inversión</td><td class="texto-derecha">${this.fmt(flujo.actividadesInversion?.flujoNetoInversion || 0)}</td>
          </tr>
        </tbody>
      </table>

      <h4>ACTIVIDADES DE FINANCIAMIENTO</h4>
      <table class="tabla" style="width: 100%; margin-bottom: 16px;">
        <tbody>
          <tr style="font-weight: bold; background: var(--color-fondo-claro);">
            <td>Flujo Neto de Financiamiento</td><td class="texto-derecha">${this.fmt(flujo.actividadesFinanciamiento?.flujoNetoFinanciamiento || 0)}</td>
          </tr>
        </tbody>
      </table>

      <table class="tabla" style="width: 100%;">
        <tbody>
          <tr style="font-weight: bold; font-size: 1.1em;">
            <td>FLUJO NETO DEL PERÍODO</td><td class="texto-derecha">${this.fmt(flujo.flujoNetoPeriodo)}</td>
          </tr>
          <tr><td>Saldo Inicial de Efectivo</td><td class="texto-derecha">${this.fmt(flujo.saldoInicialEfectivo)}</td></tr>
          <tr style="font-weight: bold;"><td>Saldo Final de Efectivo</td><td class="texto-derecha">${this.fmt(flujo.saldoFinalEfectivo)}</td></tr>
        </tbody>
      </table>
    `;

    this.mostrarToast(`✅ Flujo de Efectivo generado`, 'exito');
  },

  // ══════════════════════════════════════════════════════════
  // NOTAS
  // ══════════════════════════════════════════════════════════

  generarNotas() {
    const periodo = this.elementos.notasPeriodo.value;
    const notas = window.capaEstadosFinancieros.generarEstructuraNotas({}, periodo);

    if (!notas.exito) {
      this.mostrarToast(`❌ Error al generar notas`, 'error');
      return;
    }

    this.elementos.notasContenido.innerHTML = `
      <h3 style="margin-bottom: 16px;">NOTAS A LOS ESTADOS FINANCIEROS</h3>
      <p style="color: var(--texto-secundario); margin-bottom: 16px;">
        Período: ${periodo} | Expresado en Bolivianos | Normas NC del CTNAC
      </p>
      ${notas.notas.map(nota => `
        <div class="nota-acordeon">
          <div class="nota-header" onclick="this.nextElementSibling.classList.toggle('abierto')">
            <span>Nota ${nota.numero}: ${nota.titulo}</span>
            <span>▼</span>
          </div>
          <div class="nota-body">
            <pre style="white-space: pre-wrap; font-size: 0.9em;">${JSON.stringify(nota.contenidoAutomatico, null, 2)}</pre>
            ${nota.contenidoNarrativo ? `<p>${nota.contenidoNarrativo}</p>` : '<p style="color: var(--texto-secundario);">Contenido narrativo pendiente (el contador lo completa)</p>'}
          </div>
        </div>
      `).join('')}
    `;

    this.mostrarToast(`✅ ${notas.notas.length} notas generadas`, 'exito');
  },

  // ══════════════════════════════════════════════════════════
  // COMPARATIVOS
  // ══════════════════════════════════════════════════════════

  generarComparativo() {
    const periodo1 = this.elementos.compPeriodo1.value;
    const periodo2 = this.elementos.compPeriodo2.value;

    const comp = window.capaEstadosFinancieros.compararPeriodos(periodo1, periodo2);
    if (!comp.exito) {
      this.mostrarToast(`❌ ${comp.errores.join(', ')}`, 'error');
      return;
    }

    this.elementos.compContenido.innerHTML = `
      <h3 style="margin-bottom: 16px;">ESTADO DE RESULTADOS COMPARATIVO</h3>
      <table class="tabla" style="width: 100%;">
        <thead>
          <tr>
            <th>Concepto</th>
            <th class="texto-derecha">${periodo1}</th>
            <th class="texto-derecha">${periodo2}</th>
            <th class="texto-derecha">Variación Bs</th>
            <th class="texto-derecha">Variación %</th>
          </tr>
        </thead>
        <tbody>
          ${comp.lineas.map(l => `
            <tr>
              <td>${l.concepto}</td>
              <td class="texto-derecha">${this.fmt(l.p1)}</td>
              <td class="texto-derecha">${this.fmt(l.p2)}</td>
              <td class="texto-derecha" style="color: ${l.variacionBs >= 0 ? 'var(--color-exito)' : 'var(--color-error)'};">
                ${l.variacionBs >= 0 ? '+' : ''}${this.fmt(l.variacionBs)}
              </td>
              <td class="texto-derecha" style="color: ${l.variacionPorcentaje >= 0 ? 'var(--color-exito)' : 'var(--color-error)'};">
                ${l.variacionPorcentaje >= 0 ? '+' : ''}${l.variacionPorcentaje}%
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    this.mostrarToast(`✅ Comparativo generado`, 'exito');
  },

  // ══════════════════════════════════════════════════════════
  // RATIOS
  // ══════════════════════════════════════════════════════════

  calcularRatios() {
    const periodo = this.elementos.ratiosPeriodo.value;
    const er = window.capaEstadosFinancieros.generarEstadoResultados(periodo);
    const fechaBalance = periodo + '-28';
    const bg = window.capaEstadosFinancieros.generarBalanceGeneral(fechaBalance);

    const ratios = window.capaEstadosFinancieros.calcularRatiosFinancieros(bg, er);
    if (!ratios.exito) {
      this.mostrarToast(`❌ ${ratios.errores.join(', ')}`, 'error');
      return;
    }

    const dashboard = window.capaEstadosFinancieros.generarDashboardRatios(ratios);

    this.elementos.ratiosContenido.innerHTML = `
      <h3 style="margin-bottom: 16px;">RAZONES FINANCIERAS</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px;">
        ${dashboard.dashboard.detalle.map(r => `
          <div class="ratio-card ${r.nivel}">
            <div style="font-weight: bold; margin-bottom: 8px;">${this.nombreRatio(r.nombre)}</div>
            <div style="font-size: 1.5em; font-weight: bold; margin-bottom: 8px;">
              ${r.valor !== null ? r.valor + (r.unidad || '') : 'N/A'}
            </div>
            <div style="font-size: 0.9em; color: var(--texto-secundario);">${r.interpretacion}</div>
          </div>
        `).join('')}
      </div>
      <div style="margin-top: 16px; padding: 12px; background: var(--color-fondo-claro); border-radius: 6px;">
        <strong>Resumen:</strong>
        🟢 ${dashboard.dashboard.ratiosVerdes} buenos |
        🟡 ${dashboard.dashboard.ratiosAmarillos} regulares |
        🔴 ${dashboard.dashboard.ratiosRojos} críticos
      </div>
    `;

    this.mostrarToast(`✅ ${ratios.totalRatios} ratios calculados`, 'exito');
  },

  nombreRatio(nombre) {
    const nombres = {
      liquidezCorriente: 'Liquidez Corriente',
      pruebaAcida: 'Prueba Ácida',
      endeudamiento: 'Endeudamiento',
      rotacionInventario: 'Rotación de Inventario',
      margenNeto: 'Margen Neto',
      roe: 'ROE (Retorno al Accionista)'
    };
    return nombres[nombre] || nombre;
  },

  // ══════════════════════════════════════════════════════════
  // RESUMEN EJECUTIVO
  // ══════════════════════════════════════════════════════════

  generarResumen() {
    const periodo = this.elementos.resumenPeriodo.value;
    const er = window.capaEstadosFinancieros.generarEstadoResultados(periodo);
    const fechaBalance = periodo + '-28';
    const bg = window.capaEstadosFinancieros.generarBalanceGeneral(fechaBalance);

    const resumen = window.capaEstadosFinancieros.generarResumenEjecutivo({
      estadoResultados: er,
      balanceGeneral: bg
    });

    if (!resumen.exito) {
      this.mostrarToast(`❌ ${resumen.errores.join(', ')}`, 'error');
      return;
    }

    this.elementos.resumenContenido.innerHTML = `
      <div style="text-align: center; margin-bottom: 24px;">
        <h2>${resumen.titulo}</h2>
        <p>Período: ${resumen.periodo}</p>
      </div>
      <div style="font-size: 1.2em; margin-bottom: 24px; padding: 16px; background: var(--color-fondo-claro); border-radius: 8px;">
        ${resumen.conclusion}
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
        <div class="card" style="text-align: center;">
          <div style="color: var(--texto-secundario);">Utilidad Neta</div>
          <div style="font-size: 1.5em; font-weight: bold;">${this.fmt(resumen.datosClave.utilidadNeta)}</div>
        </div>
        <div class="card" style="text-align: center;">
          <div style="color: var(--texto-secundario);">Total Activos</div>
          <div style="font-size: 1.5em; font-weight: bold;">${this.fmt(resumen.datosClave.totalActivos)}</div>
        </div>
        <div class="card" style="text-align: center;">
          <div style="color: var(--texto-secundario);">Endeudamiento</div>
          <div style="font-size: 1.5em; font-weight: bold;">${resumen.datosClave.endeudamiento ? resumen.datosClave.endeudamiento.toFixed(2) + '%' : 'N/A'}</div>
        </div>
        <div class="card" style="text-align: center;">
          <div style="color: var(--texto-secundario);">Margen Neto</div>
          <div style="font-size: 1.5em; font-weight: bold;">${resumen.datosClave.margenNeto ? resumen.datosClave.margenNeto.toFixed(2) + '%' : 'N/A'}</div>
        </div>
      </div>
    `;

    this.mostrarToast(`✅ Resumen Ejecutivo generado`, 'exito');
  },

  // ══════════════════════════════════════════════════════════
  // UTILIDADES
  // ══════════════════════════════════════════════════════════

  fmt(n) {
    return (window.utilidades && window.utilidades.formatearBs)
      ? window.utilidades.formatearBs(n)
      : `Bs ${n.toFixed(2)}`;
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
  if (window.EstadosVista && typeof window.EstadosVista.inicializar === 'function') {
    window.EstadosVista.inicializar();
  }
} catch (error) {
  console.error('❌ Error al inicializar EstadosVista:', error);
}
