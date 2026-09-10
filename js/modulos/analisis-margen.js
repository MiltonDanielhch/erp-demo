// ══════════════════════════════════════════════════════════════
// analisis-margen.js — Módulo 8.7: Análisis de Margen por Producto
// ══════════════════════════════════════════════════════════════

/**
 * Análisis de Rentabilidad por Producto
 *
 * Calcula:
 *   - Margen de contribución (precio - costo variable)
 *   - Margen neto (precio - costo total)
 *   - Clasificación ABC (Pareto 80/20)
 *   - Recomendaciones gerenciales
 *
 * Clasificación ABC:
 *   - A: top 20% de productos que aportan 80% del margen
 *   - B: siguiente 30% que aporta 15%
 *   - C: último 50% que aporta 5%
 */
class AnalisisMargen {

  constructor(deps = {}) {
    this.almacenamiento = deps.almacenamiento || null;
    this.inventarioCapas = deps.inventarioCapas || null;
    this.ordenesTrabajo = deps.ordenesTrabajo || null;

    console.log('💰 Módulo Análisis de Margen inicializado');
  }

  // ══════════════════════════════════════════════════════════
  // CÁLCULO DE MARGEN POR PRODUCTO
  // ══════════════════════════════════════════════════════════

  /**
   * Calcula el margen de un producto en un período.
   *
   * @param {string} productoId
   * @param {string} [periodo] - "AAAA-MM"
   * @returns {Object}
   */
  calcularMargenProducto(productoId, periodo) {
    const ventas = this._obtenerVentasProducto(productoId, periodo);
    const costoUnitario = this._obtenerCostoPromedio(productoId);

    const precioPromedio = ventas.unidadesVendidas > 0
      ? this._r2(ventas.ingresosTotales / ventas.unidadesVendidas)
      : 0;

    const margenUnitario = this._r2(precioPromedio - costoUnitario);
    const porcentajeMargen = precioPromedio > 0
      ? this._r2((margenUnitario / precioPromedio) * 100)
      : 0;

    const margenTotal = this._r2(margenUnitario * ventas.unidadesVendidas);

    return {
      exito: true,
      productoId,
      periodo,
      precioPromedio,
      costoUnitario,
      margenUnitario,
      porcentajeMargen,
      unidadesVendidas: ventas.unidadesVendidas,
      ingresosTotales: ventas.ingresosTotales,
      costoTotal: this._r2(costoUnitario * ventas.unidadesVendidas),
      margenTotal,
      datosVentas: ventas
    };
  }

  /**
   * Calcula margen de todos los productos.
   */
  calcularMargenTodosProductos(periodo) {
    const productos = this._obtenerProductosConVentas(periodo);

    const resultados = productos.map(p =>
      this.calcularMargenProducto(p.productoId, periodo)
    ).filter(r => r.exito && r.unidadesVendidas > 0);

    // Ordenar por margen total descendente
    resultados.sort((a, b) => b.margenTotal - a.margenTotal);

    // Calcular totales
    const margenTotalGeneral = this._r2(resultados.reduce((s, r) => s + r.margenTotal, 0));

    // Agregar % de contribución
    const conContribucion = resultados.map(r => ({
      ...r,
      contribucionMargen: margenTotalGeneral > 0
        ? this._r2((r.margenTotal / margenTotalGeneral) * 100)
        : 0
    }));

    return {
      exito: true,
      periodo,
      productos: conContribucion,
      totalProductos: conContribucion.length,
      margenTotalGeneral,
      margenPromedio: resultados.length > 0
        ? this._r2(margenTotalGeneral / resultados.length)
        : 0
    };
  }

  // ══════════════════════════════════════════════════════════
  // CLASIFICACIÓN ABC
  // ══════════════════════════════════════════════════════════

  /**
   * Clasifica productos por aporte al margen total (Pareto).
   *
   * - A: top 20% → 80% del margen
   * - B: siguiente 30% → 15% del margen
   * - C: último 50% → 5% del margen
   *
   * @param {string} periodo
   * @returns {Object}
   */
  clasificacionABC(periodo) {
    const margen = this.calcularMargenTodosProductos(periodo);
    if (!margen.exito || margen.productos.length === 0) {
      return { exito: false, errores: ['Sin datos de margen para clasificar'] };
    }

    const productos = margen.productos;
    const margenTotal = margen.margenTotalGeneral;

    let margenAcumulado = 0;
    const claseA = [], claseB = [], claseC = [];

    productos.forEach((p, i) => {
      margenAcumulado += p.margenTotal;
      const porcentajeAcumulado = margenTotal > 0
        ? (margenAcumulado / margenTotal) * 100
        : 0;

      const productoConClase = {
        ...p,
        margenAcumulado: this._r2(margenAcumulado),
        porcentajeAcumulado: this._r2(porcentajeAcumulado),
        posicion: i + 1
      };

      if (porcentajeAcumulado <= 80) {
        productoConClase.clase = 'A';
        claseA.push(productoConClase);
      } else if (porcentajeAcumulado <= 95) {
        productoConClase.clase = 'B';
        claseB.push(productoConClase);
      } else {
        productoConClase.clase = 'C';
        claseC.push(productoConClase);
      }
    });

    const resultado = {
      exito: true,
      periodo,
      margenTotal,
      claseA: {
        productos: claseA,
        cantidad: claseA.length,
        porcentajeProductos: this._r2((claseA.length / productos.length) * 100),
        margenTotal: this._r2(claseA.reduce((s, p) => s + p.margenTotal, 0)),
        porcentajeMargen: this._r2((claseA.reduce((s, p) => s + p.margenTotal, 0) / margenTotal) * 100)
      },
      claseB: {
        productos: claseB,
        cantidad: claseB.length,
        porcentajeProductos: this._r2((claseB.length / productos.length) * 100),
        margenTotal: this._r2(claseB.reduce((s, p) => s + p.margenTotal, 0)),
        porcentajeMargen: this._r2((claseB.reduce((s, p) => s + p.margenTotal, 0) / margenTotal) * 100)
      },
      claseC: {
        productos: claseC,
        cantidad: claseC.length,
        porcentajeProductos: this._r2((claseC.length / productos.length) * 100),
        margenTotal: this._r2(claseC.reduce((s, p) => s + p.margenTotal, 0)),
        porcentajeMargen: this._r2((claseC.reduce((s, p) => s + p.margenTotal, 0) / margenTotal) * 100)
      },
      interpretacion: this._interpretarABC(claseA, claseB, claseC, margenTotal)
    };

    console.log(`📊 Clasificación ABC: A=${claseA.length} B=${claseB.length} C=${claseC.length}`);
    return resultado;
  }

  // ══════════════════════════════════════════════════════════
  // ANÁLISIS Y RECOMENDACIONES
  // ══════════════════════════════════════════════════════════

  /**
   * Identifica productos estrella (alto margen + alto volumen).
   */
  obtenerProductosEstrella(periodo) {
    const margen = this.calcularMargenTodosProductos(periodo);
    if (!margen.exito) return { exito: false, productos: [] };

    const umbralMargen = 25; // 25% margen mínimo
    const umbralVolumen = 10; // 10 unidades mínimo

    const estrellas = margen.productos.filter(p =>
      p.porcentajeMargen >= umbralMargen && p.unidadesVendidas >= umbralVolumen
    );

    return {
      exito: true,
      periodo,
      productos: estrellas,
      cantidad: estrellas.length,
      margenTotalEstrellas: this._r2(estrellas.reduce((s, p) => s + p.margenTotal, 0))
    };
  }

  /**
   * Identifica productos problemáticos (bajo margen o bajo volumen).
   */
  obtenerProductosProblematicos(periodo) {
    const margen = this.calcularMargenTodosProductos(periodo);
    if (!margen.exito) return { exito: false, productos: [] };

    const problematicos = margen.productos.filter(p =>
      p.porcentajeMargen < 10 ||
      (p.margenTotal < 0) ||
      (p.unidadesVendidas > 0 && p.porcentajeMargen < 5)
    );

    return {
      exito: true,
      periodo,
      productos: problematicos,
      cantidad: problematicos.length,
      recomendacion: problematicos.length > 0
        ? 'Revisar precios, costos o considerar descontinuación'
        : 'Sin productos problemáticos identificados'
    };
  }

  /**
   * Genera recomendación gerencial para un producto.
   */
  recomendarAccion(productoId, periodo) {
    const margen = this.calcularMargenProducto(productoId, periodo);
    if (!margen.exito) return { exito: false, errores: margen.errores };

    const { porcentajeMargen, unidadesVendidas, margenTotal } = margen;

    let accion, prioridad, justificacion;

    if (porcentajeMargen >= 30 && unidadesVendidas >= 20) {
      accion = 'AUMENTAR_PRODUCCION';
      prioridad = 'ALTA';
      justificacion = `Alto margen (${porcentajeMargen}%) + buen volumen (${unidadesVendidas}u). Producto estrella.`;
    } else if (porcentajeMargen >= 20 && unidadesVendidas >= 10) {
      accion = 'MANTENER';
      prioridad = 'MEDIA';
      justificacion = `Margen saludable (${porcentajeMargen}%) con volumen adecuado. Mantener estrategia actual.`;
    } else if (porcentajeMargen >= 15 && unidadesVendidas < 10) {
      accion = 'PROMOCIONAR';
      prioridad = 'MEDIA';
      justificacion = `Buen margen (${porcentajeMargen}%) pero bajo volumen. Necesita promoción.`;
    } else if (porcentajeMargen >= 5 && porcentajeMargen < 15) {
      accion = 'REVISAR_PRECIO';
      prioridad = 'ALTA';
      justificacion = `Margen bajo (${porcentajeMargen}%). Evaluar aumento de precio o reducción de costos.`;
    } else if (margenTotal < 0) {
      accion = 'DESCONTINUAR';
      prioridad = 'URGENTE';
      justificacion = `Producto genera pérdida (Bs ${margenTotal}). Descontinuar urgentemente.`;
    } else {
      accion = 'EVALUAR';
      prioridad = 'BAJA';
      justificacion = `Margen muy bajo (${porcentajeMargen}%). Evaluar viabilidad del producto.`;
    }

    return {
      exito: true,
      productoId,
      periodo,
      margen,
      accion,
      prioridad,
      justificacion,
      metricas: {
        margenUnitario: margen.margenUnitario,
        porcentajeMargen,
        unidadesVendidas,
        margenTotal
      }
    };
  }

  /**
   * Genera reporte ejecutivo de márgenes.
   */
  generarReporteEjecutivo(periodo) {
    const margen = this.calcularMargenTodosProductos(periodo);
    const abc = this.clasificacionABC(periodo);
    const estrellas = this.obtenerProductosEstrella(periodo);
    const problematicos = this.obtenerProductosProblematicos(periodo);

    if (!margen.exito) {
      return { exito: false, errores: margen.errores };
    }

    const top5 = margen.productos.slice(0, 5);
    const bottom5 = margen.productos.slice(-5).reverse();

    return {
      exito: true,
      periodo,
      resumen: {
        totalProductos: margen.totalProductos,
        margenTotalGeneral: margen.margenTotalGeneral,
        margenPromedio: margen.margenPromedio
      },
      clasificacion: abc.exito ? {
        claseA: abc.claseA.cantidad,
        claseB: abc.claseB.cantidad,
        claseC: abc.claseC.cantidad
      } : null,
      top5Productos: top5.map(p => ({
        productoId: p.productoId,
        margenTotal: p.margenTotal,
        porcentajeMargen: p.porcentajeMargen,
        unidades: p.unidadesVendidas
      })),
      productosEstrella: estrellas.cantidad,
      productosProblematicos: problematicos.cantidad,
      recomendaciones: this._generarRecomendacionesGenerales(margen, abc, estrellas, problematicos)
    };
  }

  // ══════════════════════════════════════════════════════════
  // UTILIDADES PRIVADAS
  // ══════════════════════════════════════════════════════════

  _obtenerVentasProducto(productoId, periodo) {
    // Buscar en documentos de venta o módulo de ventas
    const documentos = this._obtenerDocumentosVenta();
    const ventas = documentos.filter(d => {
      const fecha = d.fecha || d.fechaEmision || '';
      const matchPeriodo = !periodo || fecha.startsWith(periodo);
      const matchProducto = (d.productoId === productoId) ||
        (d.detalle && d.detalle.some(i => i.productoId === productoId));
      return matchPeriodo && matchProducto;
    });

    let unidades = 0;
    let ingresos = 0;

    ventas.forEach(v => {
      if (v.detalle) {
        const item = v.detalle.find(i => i.productoId === productoId);
        if (item) {
          unidades += Number(item.cantidad) || 0;
          ingresos += Number(item.total) || 0;
        }
      } else if (v.productoId === productoId) {
        unidades += Number(v.cantidad) || 1;
        ingresos += Number(v.total || v.monto) || 0;
      }
    });

    return { unidadesVendidas: unidades, ingresosTotales: this._r2(ingresos) };
  }

  _obtenerCostoPromedio(productoId) {
    if (!this.inventarioCapas) return 0;

    const prod = this.inventarioCapas.obtenerCapas(productoId);
    if (!prod || prod.totalUnidades <= 0) return 0;

    return this._r2(prod.valorTotal / prod.totalUnidades);
  }

  _obtenerProductosConVentas(periodo) {
    const documentos = this._obtenerDocumentosVenta();
    const productosMap = new Map();

    documentos.forEach(d => {
      const fecha = d.fecha || d.fechaEmision || '';
      if (periodo && !fecha.startsWith(periodo)) return;

      if (d.detalle && Array.isArray(d.detalle)) {
        d.detalle.forEach(item => {
          if (item.productoId) {
            if (!productosMap.has(item.productoId)) {
              productosMap.set(item.productoId, {
                productoId: item.productoId,
                nombre: item.nombreProducto || item.descripcion || ''
              });
            }
          }
        });
      } else if (d.productoId) {
        if (!productosMap.has(d.productoId)) {
          productosMap.set(d.productoId, {
            productoId: d.productoId,
            nombre: d.nombreProducto || ''
          });
        }
      }
    });

    return Array.from(productosMap.values());
  }

  _obtenerDocumentosVenta() {
    const colecciones = ['ventas', 'facturas', 'erp_ventas', 'documentos', 'documentosFuente'];
    let todos = [];

    colecciones.forEach(nombre => {
      try {
        const arr = JSON.parse(localStorage.getItem(nombre) || '[]');
        if (Array.isArray(arr)) {
          const ventas = arr.filter(d => {
            const tipo = (d.tipo || d.tipoDocumento || '').toString().toUpperCase();
            return tipo.includes('VENTA') || tipo.includes('FACTURA') ||
                   d.clienteNombre || d.clienteNit || d.clienteId;
          });
          todos = todos.concat(ventas);
        }
      } catch (e) {}
    });

    return todos;
  }

  _interpretarABC(claseA, claseB, claseC, margenTotal) {
    const totalProductos = claseA.length + claseB.length + claseC.length;

    let mensaje = '';

    if (claseA.length === 0) {
      mensaje = '⚠️ No hay productos estrella (Clase A). Revisar portafolio.';
    } else if (claseA.length / totalProductos > 0.3) {
      mensaje = '✅ Buena diversificación de productos estrella.';
    } else if (claseC.length / totalProductos > 0.5) {
      mensaje = '⚠️ Muchos productos con baja rentabilidad (Clase C). Considerar descontinuación.';
    } else {
      mensaje = '✅ Distribución Pareto saludable.';
    }

    return mensaje;
  }

  _generarRecomendacionesGenerales(margen, abc, estrellas, problematicos) {
    const recomendaciones = [];

    if (estrellas.cantidad > 0) {
      recomendaciones.push({
        tipo: 'POSITIVA',
        icono: '⭐',
        mensaje: `${estrellas.cantidad} producto(s) estrella con buen margen y volumen.`
      });
    }

    if (problematicos.cantidad > 0) {
      recomendaciones.push({
        tipo: 'ADVERTENCIA',
        icono: '⚠️',
        mensaje: `${problematicos.cantidad} producto(s) problemático(s) requieren revisión.`
      });
    }

    if (abc.exito && abc.claseC.cantidad > 0) {
      recomendaciones.push({
        tipo: 'INFO',
        icono: 'ℹ️',
        mensaje: `${abc.claseC.cantidad} producto(s) clase C aportan solo ${abc.claseC.porcentajeMargen}% del margen.`
      });
    }

    if (margen.margenPromedio < 15) {
      recomendaciones.push({
        tipo: 'CRITICA',
        icono: '🔴',
        mensaje: `Margen promedio bajo (${margen.margenPromedio}%). Revisar estructura de precios y costos.`
      });
    }

    return recomendaciones;
  }

  _r2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }
}

window.AnalisisMargenClase = AnalisisMargen;
