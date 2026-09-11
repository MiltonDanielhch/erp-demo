// ══════════════════════════════════════════════════════════════
// costos-vista.js — Vista de Contabilidad de Costos
// ══════════════════════════════════════════════════════════════

window.CostosVista = {

  elementos: {},
  chartPE: null,

  inicializar() {
    console.log('🏭 CostosVista.inicializar()');
    this.capturarElementos();
    this.configurarEventListeners();
    this.cargarSelectores();
    console.log('✅ Vista de Costos lista');
  },

  capturarElementos() {
    const g = (id) => document.getElementById(id);
    this.elementos = {
      // Tabs
      tabs: document.querySelectorAll('.btn-tab:not(.sub-tab)'),
      tabContents: document.querySelectorAll('.tab-content'),
      subTabs: document.querySelectorAll('.sub-tab'),
      subTabContents: document.querySelectorAll('.sub-tab-content'),

      // Dashboard
      dashPeriodo: g('dash-periodo'),
      dashBtnActualizar: g('dash-btn-actualizar'),
      dashContenido: g('dash-contenido'),

      // Inventario
      invProducto: g('inv-producto'),
      invMetodo: g('inv-metodo'),
      invBtnCambiar: g('inv-btn-cambiar'),
      invBtnComparar: g('inv-btn-comparar'),
      invCapasContenido: g('inv-capas-contenido'),
      invComparadorContenido: g('inv-comparador-contenido'),

      // Centros de Costo
      ccBtnNuevo: g('cc-btn-nuevo'),
      ccBtnActualizar: g('cc-btn-actualizar'),
      ccListaContenido: g('cc-lista-contenido'),

      // Órdenes de Trabajo
      otBtnNueva: g('ot-btn-nueva'),
      otFiltroEstado: g('ot-filtro-estado'),
      otBtnActualizar: g('ot-btn-actualizar'),
      otListaContenido: g('ot-lista-contenido'),

      // Rentabilidad
      rentProdPeriodo: g('rent-prod-periodo'),
      rentProdBtn: g('rent-prod-btn'),
      rentProdContenido: g('rent-prod-contenido'),
      rentCliPeriodo: g('rent-cli-periodo'),
      rentCliBtn: g('rent-cli-btn'),
      rentCliContenido: g('rent-cli-contenido'),

      // Punto de Equilibrio
      pePeriodo: g('pe-periodo'),
      peCostosFijos: g('pe-costos-fijos'),
      peBtnCalcular: g('pe-btn-calcular'),
      peBtnSimular: g('pe-btn-simular'),
      peResultados: g('pe-resultados'),
      peGrafico: g('pe-grafico'),
      peChart: g('pe-chart'),
      peEscenarios: g('pe-escenarios-contenido'),

      toasts: g('contenedor-toasts')
    };
  },

  configurarEventListeners() {
    // Tabs principales
    this.elementos.tabs.forEach(tab => {
      tab.addEventListener('click', (e) => this.cambiarTab(e.target.dataset.tab));
    });

    // Sub-tabs de rentabilidad
    this.elementos.subTabs.forEach(tab => {
      tab.addEventListener('click', (e) => this.cambiarSubTab(e.target.dataset.subtab));
    });

    // Dashboard
    this.elementos.dashBtnActualizar?.addEventListener('click', () => this.actualizarDashboard());
    this.elementos.dashPeriodo?.addEventListener('change', () => this.actualizarDashboard());

    // Inventario
    this.elementos.invProducto?.addEventListener('change', () => this.mostrarCapas());
    this.elementos.invBtnCambiar?.addEventListener('click', () => this.cambiarMetodo());
    this.elementos.invBtnComparar?.addEventListener('click', () => this.compararMetodos());

    // Centros de costo
    this.elementos.ccBtnNuevo?.addEventListener('click', () => this.nuevoCentroCosto());
    this.elementos.ccBtnActualizar?.addEventListener('click', () => this.actualizarCentros());

    // Órdenes de trabajo
    this.elementos.otBtnNueva?.addEventListener('click', () => this.nuevaOrdenTrabajo());
    this.elementos.otBtnActualizar?.addEventListener('click', () => this.actualizarOrdenes());
    this.elementos.otFiltroEstado?.addEventListener('change', () => this.actualizarOrdenes());

    // Rentabilidad
    this.elementos.rentProdBtn?.addEventListener('click', () => this.analizarProductos());
    this.elementos.rentCliBtn?.addEventListener('click', () => this.analizarClientes());

    // Punto de equilibrio
    this.elementos.peBtnCalcular?.addEventListener('click', () => this.calcularPE());
    this.elementos.peBtnSimular?.addEventListener('click', () => this.simularEscenarios());
  },

  cambiarTab(tabId) {
    this.elementos.tabs.forEach(t => t.classList.toggle('activo', t.dataset.tab === tabId));
    this.elementos.tabContents.forEach(c => {
      const id = c.id.replace('tab-', '');
      c.classList.toggle('oculto', id !== tabId);
    });
  },

  cambiarSubTab(subTabId) {
    this.elementos.subTabs.forEach(t => t.classList.toggle('activo', t.dataset.subtab === subTabId));
    this.elementos.subTabContents.forEach(c => {
      const id = c.id.replace('subtab-', '');
      c.classList.toggle('oculto', id !== subTabId);
    });
  },

  cargarSelectores() {
    // Períodos (últimos 12 meses)
    const ahora = new Date();
    const periodos = [];
    for (let i = 0; i < 12; i++) {
      const f = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const p = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}`;
      periodos.push(p);
    }
    const opciones = periodos.map(p => `<option value="${p}">${p}</option>`).join('');
    if (this.elementos.dashPeriodo) this.elementos.dashPeriodo.innerHTML = opciones;

    // Productos con capas
    this._cargarProductos();
  },

  _cargarProductos() {
    if (!this.elementos.invProducto) return;
    try {
      const capas = JSON.parse(localStorage.getItem('erp_costos_capas_inventario') || '{}');
      const opciones = Object.keys(capas)
        .map(id => `<option value="${id}">${id}</option>`)
        .join('');
      this.elementos.invProducto.innerHTML = opciones || '<option value="">Sin productos con capas</option>';
    } catch (e) {
      this.elementos.invProducto.innerHTML = '<option value="">Error al cargar</option>';
    }
  },

  // ══════════════════════════════════════════════════════════
  // TAB 1: DASHBOARD
  // ══════════════════════════════════════════════════════════

  actualizarDashboard() {
    if (!window.dashboardCostos) {
      this.mostrarToast('❌ Dashboard no disponible', 'error');
      return;
    }

    const periodo = this.elementos.dashPeriodo?.value;
    const d = window.dashboardCostos.generarDashboardCostos(periodo);

    if (!d.exito) {
      this.mostrarToast('❌ Error al generar dashboard', 'error');
      return;
    }

    this.elementos.dashContenido.innerHTML = `
      <!-- Estado general -->
      <div style="padding: 16px; background: ${
        d.resumen.estadoGeneral === 'CRITICO' ? '#fef2f2' :
        d.resumen.estadoGeneral === 'ADVERTENCIA' ? '#fffbeb' : '#f0fdf4'
      }; border-radius: 8px; margin-bottom: 16px;">
        <div style="font-size: 1.5em; font-weight: bold;">
          ${d.resumen.estadoGeneral}
        </div>
        <div>${d.resumen.mensaje}</div>
      </div>

      <!-- KPIs -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="valor">${this.fmt(d.kpis.ventas)}</div>
          <div class="label">Ventas</div>
        </div>
        <div class="kpi-card">
          <div class="valor">${this.fmt(d.kpis.utilidadBruta)}</div>
          <div class="label">Utilidad Bruta (${d.kpis.porcentajeBruto}%)</div>
        </div>
        <div class="kpi-card">
          <div class="valor">${d.puntoEquilibrio ? this.fmt(d.puntoEquilibrio.enBs) : 'N/A'}</div>
          <div class="label">Punto de Equilibrio</div>
        </div>
        <div class="kpi-card">
          <div class="valor">${d.puntoEquilibrio ? d.puntoEquilibrio.margenSeguridad + '%' : 'N/A'}</div>
          <div class="label">Margen de Seguridad</div>
        </div>
      </div>

      <!-- Alertas -->
      <div style="margin-top: 16px;">
        <h4>🚨 Alertas (${d.alertas.total})</h4>
        ${d.alertas.criticas.map(a => `
          <div class="alerta-card critica">${a.icono} <span>${a.mensaje}</span></div>
        `).join('')}
        ${d.alertas.advertencias.map(a => `
          <div class="alerta-card advertencia">${a.icono} <span>${a.mensaje}</span></div>
        `).join('')}
        ${d.alertas.informativas.map(a => `
          <div class="alerta-card info">${a.icono} <span>${a.mensaje}</span></div>
        `).join('')}
        ${d.alertas.total === 0 ? '<p style="color: var(--texto-secundario);">✅ Sin alertas</p>' : ''}
      </div>

      <!-- Top productos -->
      ${d.topProductos.length > 0 ? `
        <div style="margin-top: 16px;">
          <h4>⭐ Top 5 Productos por Margen</h4>
          <table class="tabla" style="width: 100%;">
            <thead>
              <tr>
                <th>Producto</th>
                <th class="texto-derecha">Margen Total</th>
                <th class="texto-derecha">% Margen</th>
                <th class="texto-derecha">Unidades</th>
              </tr>
            </thead>
            <tbody>
              ${d.topProductos.slice(0, 5).map(p => `
                <tr>
                  <td>${p.productoId}</td>
                  <td class="texto-derecha">${this.fmt(p.margenTotal)}</td>
                  <td class="texto-derecha">${p.porcentajeMargen}%</td>
                  <td class="texto-derecha">${p.unidadesVendidas}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}
    `;

    this.mostrarToast('✅ Dashboard actualizado', 'exito');
  },

  // ══════════════════════════════════════════════════════════
  // TAB 2: INVENTARIO (3 MÉTODOS) - LA JOYA DIDÁCTICA
  // ══════════════════════════════════════════════════════════

  mostrarCapas() {
    const productoId = this.elementos.invProducto?.value;
    if (!productoId || !window.inventarioCapas) {
      this.elementos.invCapasContenido.innerHTML = '<p style="color: var(--texto-secundario);">Seleccione un producto</p>';
      return;
    }

    const prod = window.inventarioCapas.obtenerCapas(productoId);
    if (!prod || prod.capas.length === 0) {
      this.elementos.invCapasContenido.innerHTML = '<p>Sin capas de inventario</p>';
      return;
    }

    this.elementos.invMetodo.value = prod.metodo || 'PROMEDIO';

    this.elementos.invCapasContenido.innerHTML = `
      <div style="margin-bottom: 12px;">
        <strong>Método actual:</strong>
        <span class="estado-badge ${prod.metodo}">${prod.metodo}</span>
        | <strong>Total unidades:</strong> ${prod.totalUnidades}
        | <strong>Valor total:</strong> ${this.fmt(prod.valorTotal)}
      </div>
      <table class="tabla" style="width: 100%;">
        <thead>
          <tr>
            <th>Fecha Entrada</th>
            <th>Documento</th>
            <th class="texto-derecha">Cant. Disponible</th>
            <th class="texto-derecha">Costo Unitario</th>
            <th class="texto-derecha">Valor Total</th>
          </tr>
        </thead>
        <tbody>
          ${prod.capas.filter(c => c.cantidadDisponible > 0).map(c => `
            <tr>
              <td>${c.fechaEntrada}</td>
              <td>${c.documentoOrigen}</td>
              <td class="texto-derecha">${c.cantidadDisponible}</td>
              <td class="texto-derecha">${this.fmt(c.costoUnitario)}</td>
              <td class="texto-derecha">${this.fmt(c.valorTotal)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  },

  cambiarMetodo() {
    const productoId = this.elementos.invProducto?.value;
    const nuevoMetodo = this.elementos.invMetodo?.value;

    if (!productoId) {
      this.mostrarToast('❌ Seleccione un producto', 'error');
      return;
    }

    if (nuevoMetodo === 'LIFO') {
      if (!confirm(
        '⚠️ ADVERTENCIA IMPORTANTE:\n\n' +
        'LIFO está implementado SOLO con fines educativos.\n' +
        'NIIF (NIC 2) y SIN Bolivia NO aceptan LIFO.\n\n' +
        '¿Continuar de todos modos?'
      )) return;
    }

    const resultado = window.inventarioCapas.cambiarMetodoValuacion(productoId, nuevoMetodo);
    if (resultado.exito) {
      this.mostrarToast(`✅ Método cambiado a ${nuevoMetodo}`, 'exito');
      this.mostrarCapas();
    } else {
      this.mostrarToast(`❌ ${resultado.errores.join(', ')}`, 'error');
    }
  },

  compararMetodos() {
    const productoId = this.elementos.invProducto?.value;
    if (!productoId) {
      this.mostrarToast('❌ Seleccione un producto', 'error');
      return;
    }

    // Simular una venta del 50% del inventario
    const prod = window.inventarioCapas.obtenerCapas(productoId);
    if (!prod || prod.totalUnidades === 0) {
      this.mostrarToast('❌ Producto sin inventario', 'error');
      return;
    }

    const cantidadVenta = Math.floor(prod.totalUnidades * 0.5);
    const precioVenta = this._r2((prod.valorTotal / prod.totalUnidades) * 1.5); // 50% markup

    const comparacion = window.inventarioCapas.compararMetodos(productoId, {
      cantidadVendida: cantidadVenta,
      precioVenta
    });

    if (!comparacion.exito) {
      this.mostrarToast('❌ Error al comparar', 'error');
      return;
    }

    const ventasTotales = this._r2(cantidadVenta * precioVenta);

    this.elementos.invComparadorContenido.innerHTML = `
      <div style="padding: 12px; background: var(--color-fondo-claro); border-radius: 6px; margin-bottom: 16px;">
        <strong>Datos de la simulación:</strong>
        <br>• Inventario total: ${prod.totalUnidades} unidades (valor: ${this.fmt(prod.valorTotal)})
        <br>• Venta simulada: ${cantidadVenta} unidades a ${this.fmt(precioVenta)}/u = ${this.fmt(ventasTotales)}
      </div>

      <div class="comparador-grid">
        <div class="metodo-card promedio">
          <h4 style="margin-top: 0;">📘 PROMEDIO PONDERADO</h4>
          <p style="font-size: 0.85em; color: var(--texto-secundario);">Aceptado por SIN y NIIF ✅</p>
          <div class="metrica"><span>Costo de Venta:</span><span class="valor">${this.fmt(comparacion.metodos.PROMEDIO.costoVenta)}</span></div>
          <div class="metrica"><span>Utilidad Bruta:</span><span class="valor">${this.fmt(comparacion.metodos.PROMEDIO.utilidadBruta)}</span></div>
          <div class="metrica"><span>IUE estimado (25%):</span><span class="valor">${this.fmt(comparacion.metodos.PROMEDIO.iueEstimado)}</span></div>
          <div class="metrica"><span>Inventario final:</span><span class="valor">${this.fmt(comparacion.metodos.PROMEDIO.inventarioFinal)}</span></div>
        </div>

        <div class="metodo-card fifo">
          <h4 style="margin-top: 0;">📗 FIFO (PEPS)</h4>
          <p style="font-size: 0.85em; color: var(--texto-secundario);">Aceptado por SIN y NIIF ✅</p>
          <div class="metrica"><span>Costo de Venta:</span><span class="valor">${this.fmt(comparacion.metodos.FIFO.costoVenta)}</span></div>
          <div class="metrica"><span>Utilidad Bruta:</span><span class="valor">${this.fmt(comparacion.metodos.FIFO.utilidadBruta)}</span></div>
          <div class="metrica"><span>IUE estimado (25%):</span><span class="valor">${this.fmt(comparacion.metodos.FIFO.iueEstimado)}</span></div>
          <div class="metrica"><span>Inventario final:</span><span class="valor">${this.fmt(comparacion.metodos.FIFO.inventarioFinal)}</span></div>
        </div>

        <div class="metodo-card lifo">
          <h4 style="margin-top: 0;">📕 LIFO (UEPS)</h4>
          <p style="font-size: 0.85em; color: var(--color-error);">⚠️ PROHIBIDO por NIIF y SIN</p>
          <div class="metrica"><span>Costo de Venta:</span><span class="valor">${this.fmt(comparacion.metodos.LIFO.costoVenta)}</span></div>
          <div class="metrica"><span>Utilidad Bruta:</span><span class="valor">${this.fmt(comparacion.metodos.LIFO.utilidadBruta)}</span></div>
          <div class="metrica"><span>IUE estimado (25%):</span><span class="valor">${this.fmt(comparacion.metodos.LIFO.iueEstimado)}</span></div>
          <div class="metrica"><span>Inventario final:</span><span class="valor">${this.fmt(comparacion.metodos.LIFO.inventarioFinal)}</span></div>
        </div>
      </div>

      <div class="advertencia-lifo">
        <strong>⚠️ IMPACTO DE LA ELECCIÓN DEL MÉTODO:</strong>
        <br>• Diferencia en utilidad bruta: <strong>${this.fmt(comparacion.diferencias.utilidadBruta)}</strong>
        <br>• Diferencia en IUE a pagar: <strong>${this.fmt(comparacion.diferencias.iueEstimado)}</strong>
        <br>• Diferencia en valor del inventario: <strong>${this.fmt(comparacion.diferencias.inventarioFinal)}</strong>
        <br><br>
        <strong>Por esto NIIF (NIC 2) prohibió LIFO en 2005:</strong> en entornos inflacionarios permite manipular utilidades reduciendo impuestos artificialmente.
      </div>
    `;

    this.mostrarToast('✅ Comparación generada', 'exito');
  },

  // ══════════════════════════════════════════════════════════
  // TAB 3: CENTROS DE COSTO
  // ══════════════════════════════════════════════════════════

  nuevoCentroCosto() {
    const codigo = prompt('Código del centro (ej: PROD-01):');
    if (!codigo) return;
    const nombre = prompt('Nombre del centro:');
    if (!nombre) return;
    const tipo = prompt('Tipo (PRODUCTIVO / SERVICIO / ADMINISTRATIVO):', 'PRODUCTIVO');
    const presupuesto = Number(prompt('Presupuesto anual (Bs):', '500000'));

    const resultado = window.centrosCosto.crearCentro({
      codigo, nombre, tipo, presupuestoAnual: presupuesto
    });

    if (resultado.exito) {
      this.mostrarToast(`✅ Centro ${codigo} creado`, 'exito');
      this.actualizarCentros();
    } else {
      this.mostrarToast(`❌ ${resultado.errores.join(', ')}`, 'error');
    }
  },

  actualizarCentros() {
    const centros = window.centrosCosto.obtenerTodos();

    if (centros.length === 0) {
      this.elementos.ccListaContenido.innerHTML = '<p style="color: var(--texto-secundario);">No hay centros registrados</p>';
      return;
    }

    this.elementos.ccListaContenido.innerHTML = centros.map(c => {
      const porcentaje = c.presupuestoAnual > 0 ? (c.gastosAcumulados / c.presupuestoAnual) * 100 : 0;
      const color = porcentaje >= 100 ? '#ef4444' : porcentaje >= 90 ? '#f59e0b' : '#10b981';

      return `
        <div class="cc-card">
          <div class="cc-header">
            <div>
              <strong>${c.codigo}</strong> - ${c.nombre}
              <br><small style="color: var(--texto-secundario);">${c.tipo} | ${c.responsable || 'Sin responsable'}</small>
            </div>
            <span class="estado-badge ${c.estado}">${c.estado}</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; font-size: 0.9em;">
            <div>
              <div style="color: var(--texto-secundario);">Presupuesto</div>
              <div><strong>${this.fmt(c.presupuestoAnual)}</strong></div>
            </div>
            <div>
              <div style="color: var(--texto-secundario);">Ejecutado</div>
              <div><strong>${this.fmt(c.gastosAcumulados)}</strong></div>
            </div>
            <div>
              <div style="color: var(--texto-secundario);">% Ejecución</div>
              <div><strong style="color: ${color};">${porcentaje.toFixed(1)}%</strong></div>
            </div>
          </div>
          <div class="cc-barra-progreso">
            <div class="cc-barra-relleno" style="width: ${Math.min(100, porcentaje)}%; background: ${color};"></div>
          </div>
        </div>
      `;
    }).join('');
  },

  // ══════════════════════════════════════════════════════════
  // TAB 4: ÓRDENES DE TRABAJO
  // ══════════════════════════════════════════════════════════

  nuevaOrdenTrabajo() {
    const productoId = prompt('ID del producto:');
    if (!productoId) return;
    const cantidad = Number(prompt('Cantidad a producir:', '10'));
    const descripcion = prompt('Descripción:', '');

    const resultado = window.ordenesTrabajo.crearOrden({
      productoId,
      cantidadPlaneada: cantidad,
      descripcion
    });

    if (resultado.exito) {
      this.mostrarToast(`✅ Orden ${resultado.orden.numero} creada`, 'exito');
      this.actualizarOrdenes();
    } else {
      this.mostrarToast(`❌ ${resultado.errores.join(', ')}`, 'error');
    }
  },

  actualizarOrdenes() {
    const filtro = this.elementos.otFiltroEstado?.value;
    const ordenes = window.ordenesTrabajo.obtenerTodas(filtro ? { estado: filtro } : {});

    if (ordenes.length === 0) {
      this.elementos.otListaContenido.innerHTML = '<p style="color: var(--texto-secundario);">No hay órdenes</p>';
      return;
    }

    this.elementos.otListaContenido.innerHTML = ordenes.map(o => `
      <div class="ot-card">
        <div class="ot-header">
          <div>
            <strong>${o.numero}</strong> - ${o.productoNombre || o.productoId}
            <br><small>${o.descripcion || 'Sin descripción'}</small>
          </div>
          <span class="estado-badge ${o.estado}">${o.estado}</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px; font-size: 0.9em;">
          <div><div style="color: var(--texto-secundario);">Planeadas</div><strong>${o.cantidadPlaneada}</strong></div>
          <div><div style="color: var(--texto-secundario);">Producidas</div><strong>${o.cantidadProducida}</strong></div>
          <div><div style="color: var(--texto-secundario);">MP</div><strong>${this.fmt(o.costos.materiaPrima)}</strong></div>
          <div><div style="color: var(--texto-secundario);">MOD</div><strong>${this.fmt(o.costos.manoDeObra)}</strong></div>
          <div><div style="color: var(--texto-secundario);">CIF</div><strong>${this.fmt(o.costos.cifAplicado)}</strong></div>
          <div><div style="color: var(--texto-secundario);">TOTAL</div><strong>${this.fmt(o.costos.totalCosto)}</strong></div>
        </div>
        ${o.estado === 'ABIERTA' ? `
          <div style="margin-top: 12px;">
            <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.85em;" onclick="window.CostosVista.cerrarOrden('${o.id}')">
              ✅ Cerrar Orden
            </button>
          </div>
        ` : ''}
      </div>
    `).join('');
  },

  cerrarOrden(ordenId) {
    if (!confirm('¿Cerrar esta orden y transferir a productos terminados?')) return;

    const resultado = window.ordenesTrabajo.cerrarOrden(ordenId);
    if (resultado.exito) {
      this.mostrarToast(`✅ Orden cerrada | Costo unitario: ${this.fmt(resultado.costoUnitario)}`, 'exito');
      this.actualizarOrdenes();
    } else {
      this.mostrarToast(`❌ ${resultado.errores.join(', ')}`, 'error');
    }
  },

  // ══════════════════════════════════════════════════════════
  // TAB 5: RENTABILIDAD
  // ══════════════════════════════════════════════════════════

  analizarProductos() {
    const periodo = this.elementos.rentProdPeriodo?.value;
    const abc = window.analisisMargen.clasificacionABC(periodo);

    if (!abc.exito) {
      this.elementos.rentProdContenido.innerHTML = `<p style="color: var(--texto-secundario);">Sin datos para ${periodo || 'el período'}</p>`;
      return;
    }

    const todas = [
      ...abc.claseA.productos.map(p => ({ ...p, clase: 'A' })),
      ...abc.claseB.productos.map(p => ({ ...p, clase: 'B' })),
      ...abc.claseC.productos.map(p => ({ ...p, clase: 'C' }))
    ];

    this.elementos.rentProdContenido.innerHTML = `
      <h4>📊 Clasificación ABC — ${periodo}</h4>
      <div class="kpi-grid" style="margin-bottom: 16px;">
        <div class="kpi-card">
          <div class="valor">${abc.claseA.cantidad}</div>
          <div class="label">Clase A (${abc.claseA.porcentajeMargen}% del margen)</div>
        </div>
        <div class="kpi-card">
          <div class="valor">${abc.claseB.cantidad}</div>
          <div class="label">Clase B (${abc.claseB.porcentajeMargen}% del margen)</div>
        </div>
        <div class="kpi-card">
          <div class="valor">${abc.claseC.cantidad}</div>
          <div class="label">Clase C (${abc.claseC.porcentajeMargen}% del margen)</div>
        </div>
      </div>

      <table class="tabla" style="width: 100%;">
        <thead>
          <tr>
            <th>Clase</th>
            <th>Producto</th>
            <th class="texto-derecha">Margen Total</th>
            <th class="texto-derecha">% Margen</th>
            <th class="texto-derecha">Unidades</th>
          </tr>
        </thead>
        <tbody>
          ${todas.map(p => `
            <tr>
              <td><span class="clase-badge ${p.clase}">${p.clase}</span></td>
              <td>${p.productoId}</td>
              <td class="texto-derecha">${this.fmt(p.margenTotal)}</td>
              <td class="texto-derecha">${p.porcentajeMargen}%</td>
              <td class="texto-derecha">${p.unidadesVendidas}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="margin-top: 16px; padding: 12px; background: var(--color-fondo-claro); border-radius: 6px;">
        💡 <strong>${abc.interpretacion}</strong>
      </div>
    `;

    this.mostrarToast(`✅ ${todas.length} productos analizados`, 'exito');
  },

  analizarClientes() {
    const periodo = this.elementos.rentCliPeriodo?.value;
    const cartera = window.analisisClientes.analizarCarteraClientes(periodo);

    if (!cartera.exito || cartera.clientes.length === 0) {
      this.elementos.rentCliContenido.innerHTML = `<p style="color: var(--texto-secundario);">Sin datos de clientes para ${periodo || 'el período'}</p>`;
      return;
    }

    this.elementos.rentCliContenido.innerHTML = `
      <h4>👥 Análisis de Cartera de Clientes — ${periodo}</h4>
      <div class="kpi-grid" style="margin-bottom: 16px;">
        <div class="kpi-card">
          <div class="valor">${cartera.totales.totalClientes}</div>
          <div class="label">Total Clientes</div>
        </div>
        <div class="kpi-card">
          <div class="valor">${this.fmt(cartera.totales.margenTotal)}</div>
          <div class="label">Margen Total</div>
        </div>
        <div class="kpi-card">
          <div class="valor">${cartera.totales.vip}</div>
          <div class="label">Clientes VIP</div>
        </div>
        <div class="kpi-card">
          <div class="valor">${cartera.totales.noRentable}</div>
          <div class="label">No Rentables</div>
        </div>
      </div>

      <h4>📈 Pareto de Clientes</h4>
      <p style="margin-bottom: 12px;">${cartera.pareto.interpretacion}</p>

      <table class="tabla" style="width: 100%;">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Clasificación</th>
            <th class="texto-derecha">Ventas</th>
            <th class="texto-derecha">Margen</th>
            <th class="texto-derecha">% Margen</th>
          </tr>
        </thead>
        <tbody>
          ${cartera.clientes.slice(0, 10).map(c => `
            <tr>
              <td>${c.clienteNombre || c.clienteId}</td>
              <td><span class="estado-badge ${c.clasificacion}">${c.clasificacion}</span></td>
              <td class="texto-derecha">${this.fmt(c.ventasTotales)}</td>
              <td class="texto-derecha">${this.fmt(c.margen)}</td>
              <td class="texto-derecha">${c.porcentaje}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    this.mostrarToast(`✅ ${cartera.clientes.length} clientes analizados`, 'exito');
  },

  // ══════════════════════════════════════════════════════════
  // TAB 6: PUNTO DE EQUILIBRIO
  // ══════════════════════════════════════════════════════════

  calcularPE() {
    const periodo = this.elementos.pePeriodo?.value;
    const costosFijos = Number(this.elementos.peCostosFijos?.value) || 0;

    const pe = window.puntoEquilibrio.calcularPuntoEquilibrio(periodo, { costosFijos });

    if (!pe.exito) {
      this.mostrarToast('❌ Error al calcular PE', 'error');
      return;
    }

    this.elementos.peResultados.innerHTML = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="valor">${pe.puntoEquilibrio.unidades}</div>
          <div class="label">PE en Unidades</div>
        </div>
        <div class="kpi-card">
          <div class="valor">${this.fmt(pe.puntoEquilibrio.enBs)}</div>
          <div class="label">PE en Bs</div>
        </div>
        <div class="kpi-card">
          <div class="valor">${pe.margenSeguridad.porcentaje}%</div>
          <div class="label">Margen de Seguridad</div>
        </div>
        <div class="kpi-card">
          <div class="valor">${pe.margenContribucion.porcentaje}%</div>
          <div class="label">Margen Contribución</div>
        </div>
      </div>

      <div style="padding: 16px; background: var(--color-fondo-claro); border-radius: 8px; margin-top: 16px;">
        <strong>📊 Análisis:</strong>
        <br>• Costos fijos: ${this.fmt(pe.costosFijos)}
        <br>• Precio promedio: ${this.fmt(pe.ventasReales.precioPromedio)}
        <br>• Costo variable promedio: ${this.fmt(pe.ventasReales.costoVariablePromedio)}
        <br>• Margen contribución unitario: ${this.fmt(pe.margenContribucion.unitario)}
        <br><br>
        <strong>${pe.interpretacion}</strong>
      </div>
    `;

    this._renderizarGraficoPE(pe);
    this.mostrarToast('✅ Punto de equilibrio calculado', 'exito');
  },

  _renderizarGraficoPE(pe) {
    const grafico = window.puntoEquilibrio.generarGraficoPuntoEquilibrio(this.elementos.pePeriodo?.value);
    if (!grafico.exito) return;

    this.elementos.peGrafico.style.display = 'block';

    if (this.chartPE) this.chartPE.destroy();

    this.chartPE = new Chart(this.elementos.peChart, grafico.chartConfig);
  },

  simularEscenarios() {
    const periodo = this.elementos.pePeriodo?.value;
    const escenarios = window.puntoEquilibrio.simularEscenariosComunes(periodo);

    if (!escenarios.exito) {
      this.elementos.peEscenarios.innerHTML = '<p>Error al simular escenarios</p>';
      return;
    }

    this.elementos.peEscenarios.innerHTML = `
      <table class="tabla" style="width: 100%;">
        <thead>
          <tr>
            <th>Escenario</th>
            <th class="texto-derecha">Utilidad Original</th>
            <th class="texto-derecha">Utilidad Proyectada</th>
            <th class="texto-derecha">Cambio</th>
            <th class="texto-derecha">Nuevo PE</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(escenarios.escenarios).map(([nombre, res]) => {
            if (!res.exito) return '';
            const color = res.impacto.utilidad >= 0 ? 'var(--color-exito)' : 'var(--color-error)';
            return `
              <tr>
                <td><strong>${nombre}</strong></td>
                <td class="texto-derecha">${this.fmt(res.original.utilidad)}</td>
                <td class="texto-derecha">${this.fmt(res.proyectado.utilidad)}</td>
                <td class="texto-derecha" style="color: ${color};">
                  ${res.impacto.utilidad >= 0 ? '+' : ''}${this.fmt(res.impacto.utilidad)} (${res.impacto.utilidadPct}%)
                </td>
                <td class="texto-derecha">${this.fmt(res.proyectado.peBs)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;

    this.mostrarToast('✅ 7 escenarios simulados', 'exito');
  },

  // ══════════════════════════════════════════════════════════
  // UTILIDADES
  // ══════════════════════════════════════════════════════════

  fmt(n) {
    return (window.utilidades && window.utilidades.formatearBs)
      ? window.utilidades.formatearBs(n)
      : `Bs ${Number(n || 0).toFixed(2)}`;
  },

  _r2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
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
  if (window.CostosVista && typeof window.CostosVista.inicializar === 'function') {
    window.CostosVista.inicializar();
  }
} catch (error) {
  console.error('❌ Error al inicializar CostosVista:', error);
}
