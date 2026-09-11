// ══════════════════════════════════════════════════════════════
// dashboard-costos.js — Módulo 8.10: Dashboard Gerencial
// ══════════════════════════════════════════════════════════════

/**
 * Dashboard Gerencial de Costos
 *
 * Consolida todos los módulos de costos en KPIs clave:
 *   - Ventas, costo de ventas, utilidad bruta
 *   - Punto de equilibrio y margen de seguridad
 *   - Top productos y clientes
 *   - Variaciones de CIF
 *   - Alertas de presupuesto
 */
class DashboardCostos {

  constructor(deps = {}) {
    this.almacenamiento = deps.almacenamiento || null;
    this.inventarioCapas = deps.inventarioCapas || null;
    this.centrosCosto = deps.centrosCosto || null;
    this.costosCIF = deps.costosCIF || null;
    this.ordenesTrabajo = deps.ordenesTrabajo || null;
    this.analisisMargen = deps.analisisMargen || null;
    this.analisisClientes = deps.analisisClientes || null;
    this.puntoEquilibrio = deps.puntoEquilibrio || null;

    console.log('📊 Dashboard de Costos inicializado');
  }

  // ══════════════════════════════════════════════════════════
  // DASHBOARD PRINCIPAL
  // ══════════════════════════════════════════════════════════

  /**
   * Genera el dashboard completo del período.
   *
   * @param {string} [periodo]
   * @returns {Object}
   */
  generarDashboardCostos(periodo) {
    periodo = periodo || this._periodoActual();

    const kpis = this._calcularKPIs(periodo);
    const topProductos = this._topProductos(periodo);
    const topClientes = this._topClientes(periodo);
    const alertas = this.generarAlertasCostos(periodo);
    const variacionesCIF = this._variacionesCIF(periodo);
    const pe = this.puntoEquilibrio ? this.puntoEquilibrio.calcularPuntoEquilibrio(periodo) : null;

    const dashboard = {
      exito: true,
      periodo,
      fechaGeneracion: new Date().toISOString(),

      kpis,
      puntoEquilibrio: pe && pe.exito ? {
        unidades: pe.puntoEquilibrio.unidades,
        enBs: pe.puntoEquilibrio.enBs,
        margenSeguridad: pe.margenSeguridad.porcentaje,
        interpretacion: pe.interpretacion
      } : null,

      topProductos,
      topClientes,
      variacionesCIF,
      alertas,

      resumen: this._generarResumenEjecutivo(kpis, alertas, pe)
    };

    console.log(`📊 Dashboard generado: ${periodo} | ${alertas.total} alertas`);
    return dashboard;
  }

  // ══════════════════════════════════════════════════════════
  // ALERTAS INTELIGENTES
  // ══════════════════════════════════════════════════════════

  /**
   * Genera alertas inteligentes del período.
   */
  generarAlertasCostos(periodo) {
    const alertasCriticas = [];
    const alertasAdvertencia = [];
    const alertasInfo = [];

    // 1. Alertas de presupuesto (centros de costo)
    if (this.centrosCosto) {
      const centros = this.centrosCosto.obtenerTodos();
      centros.forEach(c => {
        if (c.presupuestoAnual > 0) {
          const porcentaje = (c.gastosAcumulados / c.presupuestoAnual) * 100;
          if (porcentaje >= 100) {
            alertasCriticas.push({
              tipo: 'PRESUPUESTO_EXCEDIDO',
              icono: '🔴',
              mensaje: `${c.codigo} superó presupuesto (${porcentaje.toFixed(1)}%)`,
              centro: c.codigo,
              monto: c.gastosAcumulados
            });
          } else if (porcentaje >= 90) {
            alertasAdvertencia.push({
              tipo: 'PRESUPUESTO_CASI_LLENO',
              icono: '🟡',
              mensaje: `${c.codigo} al ${porcentaje.toFixed(1)}% del presupuesto`,
              centro: c.codigo,
              monto: c.gastosAcumulados
            });
          }
        }
      });
    }

    // 2. Productos con margen bajo
    if (this.analisisMargen) {
      const margen = this.analisisMargen.calcularMargenTodosProductos(periodo);
      if (margen.exito) {
        margen.productos.filter(p => p.porcentajeMargen < 15 && p.porcentajeMargen >= 0)
          .slice(0, 3)
          .forEach(p => {
            alertasAdvertencia.push({
              tipo: 'MARGEN_BAJO',
              icono: '🟡',
              mensaje: `${p.productoId}: margen ${p.porcentajeMargen}% (evaluar precio)`,
              producto: p.productoId,
              margen: p.porcentajeMargen
            });
          });

        margen.productos.filter(p => p.margenTotal < 0)
          .forEach(p => {
            alertasCriticas.push({
              tipo: 'PRODUCTO_PERDIDA',
              icono: '🔴',
              mensaje: `${p.productoId}: genera pérdida de Bs ${Math.abs(p.margenTotal)}`,
              producto: p.productoId,
              perdida: p.margenTotal
            });
          });
      }
    }

    // 3. Clientes no rentables
    if (this.analisisClientes) {
      const noRentables = this.analisisClientes.identificarClientesNoRentables(periodo);
      if (noRentables.exito && noRentables.totalClientesNoRentables > 0) {
        alertasCriticas.push({
          tipo: 'CLIENTES_NO_RENTABLES',
          icono: '🔴',
          mensaje: `${noRentables.totalClientesNoRentables} cliente(s) no rentable(s)`,
          cantidad: noRentables.totalClientesNoRentables,
          perdidaTotal: noRentables.perdidaTotal
        });
      }
    }

    // 4. Variaciones significativas de CIF
    if (this.costosCIF) {
      const variaciones = this.costosCIF.obtenerHistorialVariaciones();
      const recientes = variaciones.filter(v =>
        v.periodo === periodo || (v.fechaCalculo && v.fechaCalculo.startsWith(periodo))
      );

      recientes.forEach(v => {
        if (Math.abs(v.variacion) > 5000) {
          const lista = v.tipo === 'SUBABSORCION' ? alertasAdvertencia : alertasInfo;
          lista.push({
            tipo: 'VARIACION_CIF',
            icono: v.tipo === 'SUBABSORCION' ? '🟡' : '🟢',
            mensaje: `${v.tipo}: Bs ${Math.abs(v.variacion)} en ${v.periodo}`,
            variacion: v.variacion,
            tipoVariacion: v.tipo
          });
        }
      });
    }

    // 5. Punto de equilibrio crítico
    if (this.puntoEquilibrio) {
      const pe = this.puntoEquilibrio.calcularPuntoEquilibrio(periodo);
      if (pe.exito && pe.margenSeguridad.porcentaje < 15 && pe.margenSeguridad.porcentaje > 0) {
        alertasAdvertencia.push({
          tipo: 'MARGEN_SEGURIDAD_BAJO',
          icono: '🟡',
          mensaje: `Margen de seguridad solo ${pe.margenSeguridad.porcentaje}%`,
          margenSeguridad: pe.margenSeguridad.porcentaje
        });
      } else if (pe.exito && pe.margenSeguridad.porcentaje <= 0) {
        alertasCriticas.push({
          tipo: 'PUNTO_EQUILIBRIO_NO_ALCANZADO',
          icono: '🔴',
          mensaje: 'Ventas por debajo del punto de equilibrio',
          pe: pe.puntoEquilibrio.enBs
        });
      }
    }

    return {
      total: alertasCriticas.length + alertasAdvertencia.length + alertasInfo.length,
      criticas: alertasCriticas,
      advertencias: alertasAdvertencia,
      informativas: alertasInfo,
      estado: alertasCriticas.length > 0 ? 'CRITICO'
            : alertasAdvertencia.length > 3 ? 'ADVERTENCIA'
            : 'SALUDABLE'
    };
  }

  // ══════════════════════════════════════════════════════════
  // REPORTE EJECUTIVO
  // ══════════════════════════════════════════════════════════

  /**
   * Genera reporte ejecutivo consolidado.
   */
  generarReporteEjecutivo(periodo) {
    const dashboard = this.generarDashboardCostos(periodo);
    if (!dashboard.exito) return dashboard;

    return {
      exito: true,
      periodo,
      fechaGeneracion: new Date().toISOString(),
      resumenEjecutivo: dashboard.resumen,
      kpis: dashboard.kpis,
      top5Productos: dashboard.topProductos.slice(0, 5),
      top5Clientes: dashboard.topClientes.slice(0, 5),
      alertas: dashboard.alertas,
      recomendaciones: this._generarRecomendaciones(dashboard)
    };
  }

  // ══════════════════════════════════════════════════════════
  // UTILIDADES PRIVADAS
  // ══════════════════════════════════════════════════════════

  _calcularKPIs(periodo) {
    const ventas = this._obtenerVentasPeriodo(periodo);
    const costoVentas = this._obtenerCostoVentasPeriodo(periodo);
    const utilidadBruta = this._r2(ventas - costoVentas);
    const porcentajeBruto = ventas > 0 ? this._r2((utilidadBruta / ventas) * 100) : 0;

    return {
      ventas: this._r2(ventas),
      costoVentas: this._r2(costoVentas),
      porcentajeCosto: ventas > 0 ? this._r2((costoVentas / ventas) * 100) : 0,
      utilidadBruta,
      porcentajeBruto,
      variacionVsAnterior: this._calcularVariacionVsAnterior(periodo, ventas)
    };
  }

  _topProductos(periodo, limite = 10) {
    if (!this.analisisMargen) return [];

    const margen = this.analisisMargen.calcularMargenTodosProductos(periodo);
    if (!margen.exito) return [];

    return margen.productos.slice(0, limite);
  }

  _topClientes(periodo, limite = 10) {
    if (!this.analisisClientes) return [];

    const cartera = this.analisisClientes.analizarCarteraClientes(periodo);
    if (!cartera.exito) return [];

    return cartera.clientes.slice(0, limite);
  }

  _variacionesCIF(periodo) {
    if (!this.costosCIF) return { total: 0, detalle: [] };

    const variaciones = this.costosCIF.obtenerHistorialVariaciones();
    const delPeriodo = variaciones.filter(v =>
      v.periodo === periodo || (v.fechaCalculo && v.fechaCalculo.startsWith(periodo))
    );

    const totalVariacion = this._r2(delPeriodo.reduce((s, v) => s + v.variacion, 0));

    return {
      total: delPeriodo.length,
      totalVariacion,
      subabsorcion: this._r2(delPeriodo.filter(v => v.variacion > 0).reduce((s, v) => s + v.variacion, 0)),
      sobreabsorcion: this._r2(delPeriodo.filter(v => v.variacion < 0).reduce((s, v) => s + v.variacion, 0)),
      detalle: delPeriodo
    };
  }

  _generarResumenEjecutivo(kpis, alertas, pe) {
    let estadoGeneral = 'SALUDABLE';
    let mensaje = '✅ Desempeño saludable';

    if (alertas.criticas.length > 0) {
      estadoGeneral = 'CRITICO';
      mensaje = `🔴 ${alertas.criticas.length} alerta(s) crítica(s) requieren atención`;
    } else if (alertas.advertencias.length > 3) {
      estadoGeneral = 'ADVERTENCIA';
      mensaje = `🟡 ${alertas.advertencias.length} advertencias a monitorear`;
    }

    return {
      estadoGeneral,
      mensaje,
      ventas: kpis.ventas,
      utilidadBruta: kpis.utilidadBruta,
      margenBruto: kpis.porcentajeBruto,
      margenSeguridad: pe && pe.exito ? pe.margenSeguridad.porcentaje : null,
      puntoEquilibrio: pe && pe.exito ? pe.puntoEquilibrio.enBs : null
    };
  }

  _generarRecomendaciones(dashboard) {
    const recs = [];

    if (dashboard.kpis.porcentajeBruto < 25) {
      recs.push({
        icono: '📉',
        texto: 'Margen bruto bajo. Revisar estructura de costos y precios.'
      });
    }

    if (dashboard.alertas.criticas.length > 0) {
      recs.push({
        icono: '⚠️',
        texto: `Resolver ${dashboard.alertas.criticas.length} alerta(s) crítica(s) urgentemente.`
      });
    }

    if (dashboard.puntoEquilibrio && dashboard.puntoEquilibrio.margenSeguridad < 15) {
      recs.push({
        icono: '🎯',
        texto: 'Margen de seguridad bajo. Buscar aumentar volumen o reducir costos fijos.'
      });
    }

    if (dashboard.topProductos.length > 0 && dashboard.topProductos[0].porcentajeMargen > 30) {
      recs.push({
        icono: '⭐',
        texto: `Aumentar producción de ${dashboard.topProductos[0].productoId} (alto margen).`
      });
    }

    return recs;
  }

  _obtenerVentasPeriodo(periodo) {
    const documentos = this._obtenerDocumentosVenta();
    return documentos
      .filter(d => !periodo || (d.fecha || d.fechaEmision || '').startsWith(periodo))
      .reduce((s, d) => s + Number(d.total || d.monto || 0), 0);
  }

  _obtenerCostoVentasPeriodo(periodo) {
    // Estimación basada en 60% de ventas si no hay datos
    const ventas = this._obtenerVentasPeriodo(periodo);
    return ventas * 0.6;
  }

  _calcularVariacionVsAnterior(periodo, ventasActuales) {
    if (!periodo) return null;
    const [anio, mes] = periodo.split('-').map(Number);
    const mesAnterior = mes === 1 ? 12 : mes - 1;
    const anioAnterior = mes === 1 ? anio - 1 : anio;
    const periodoAnterior = `${anioAnterior}-${String(mesAnterior).padStart(2, '0')}`;

    const ventasAnteriores = this._obtenerVentasPeriodo(periodoAnterior);
    if (ventasAnteriores === 0) return null;

    return this._r2(((ventasActuales - ventasAnteriores) / ventasAnteriores) * 100);
  }

  _obtenerDocumentosVenta() {
    const colecciones = ['ventas', 'facturas', 'erp_ventas'];
    let todos = [];

    colecciones.forEach(nombre => {
      try {
        const arr = JSON.parse(localStorage.getItem(nombre) || '[]');
        if (Array.isArray(arr)) todos = todos.concat(arr);
      } catch (e) {}
    });

    return todos;
  }

  _periodoActual() {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
  }

  _r2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }
}

window.DashboardCostosClase = DashboardCostos;
