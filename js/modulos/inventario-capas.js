// ══════════════════════════════════════════════════════════════
// inventario-capas.js — Módulo 8.2 + 8.3: Inventario por capas
// ══════════════════════════════════════════════════════════════

/**
 * Sistema de Capas de Inventario (FIFO/LIFO/Promedio)
 *
 * Implementa los 3 métodos de valuación de inventarios:
 *   - PROMEDIO PONDERADO: costo promedio de todas las capas
 *   - FIFO (PEPS): consume las capas más antiguas primero
 *   - LIFO (UEPS): consume las capas más recientes primero
 *
 * ⚠️ ADVERTENCIA IMPORTANTE (fines educativos):
 *   - ✅ PROMEDIO: aceptado por SIN Bolivia y NIIF
 *   - ✅ FIFO: aceptado por SIN Bolivia y NIIF
 *   - ❌ LIFO: PROHIBIDO por NIIF (NIC 2) desde 2005 y por el SIN en Bolivia
 *   LIFO se implementa SOLO para demostrar por qué se prohibió:
 *   en entornos inflacionarios, reduce artificialmente utilidades e impuestos.
 */
class InventarioCapas {

  constructor(deps = {}) {
    this.almacenamiento = deps.almacenamiento || null;
    this.KEY_CAPAS = 'erp_costos_capas_inventario';
    this.KEY_HISTORIAL = 'erp_costos_historial_metodos';

    console.log('📦 Módulo Inventario por Capas inicializado (FIFO/LIFO/Promedio)');
  }

  // ══════════════════════════════════════════════════════════
  // GESTIÓN DE CAPAS
  // ══════════════════════════════════════════════════════════

  /**
   * Agrega una nueva capa de inventario (compra).
   *
   * @param {string} productoId
   * @param {Object} datosEntrada
   * @returns {Object}
   */
  agregarCapa(productoId, datosEntrada = {}) {
    if (!productoId) {
      return { exito: false, errores: ['ID de producto requerido'] };
    }

    const cantidad = Number(datosEntrada.cantidad) || 0;
    const costoUnitario = Number(datosEntrada.costoUnitario) || 0;

    if (cantidad <= 0) {
      return { exito: false, errores: ['Cantidad debe ser mayor a 0'] };
    }
    if (costoUnitario < 0) {
      return { exito: false, errores: ['Costo unitario no puede ser negativo'] };
    }

    const todosProductos = this._leerCapas();

    if (!todosProductos[productoId]) {
      todosProductos[productoId] = {
        productoId,
        metodo: datosEntrada.metodo || 'PROMEDIO',
        capas: [],
        totalUnidades: 0,
        valorTotal: 0
      };
    }

    const nuevaCapa = {
      id: 'capa-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 6),
      fechaEntrada: datosEntrada.fecha || new Date().toISOString().split('T')[0],
      documentoOrigen: datosEntrada.documentoOrigen || 'S/D',
      cantidadInicial: cantidad,
      cantidadDisponible: cantidad,
      costoUnitario: this._r2(costoUnitario),
      valorTotal: this._r2(cantidad * costoUnitario)
    };

    todosProductos[productoId].capas.push(nuevaCapa);
    this._recalcularTotales(todosProductos[productoId]);
    this._guardarCapas(todosProductos);

    console.log(`📦 Capa agregada: ${productoId} | ${cantidad}u × Bs ${costoUnitario}`);
    return { exito: true, capa: nuevaCapa, producto: todosProductos[productoId] };
  }

  /**
   * Consume capas según el método especificado.
   *
   * @param {string} productoId
   * @param {number} cantidad
   * @param {string} metodo - "PROMEDIO", "FIFO", "LIFO"
   * @returns {Object}
   */
  consumirCapas(productoId, cantidad, metodo) {
    const todosProductos = this._leerCapas();
    const producto = todosProductos[productoId];

    if (!producto) {
      return { exito: false, errores: [`Producto ${productoId} no encontrado`] };
    }

    const metodoUsar = (metodo || producto.metodo || 'PROMEDIO').toUpperCase();
    const cantidadReq = Number(cantidad) || 0;

    if (cantidadReq <= 0) {
      return { exito: false, errores: ['Cantidad debe ser mayor a 0'] };
    }

    if (producto.totalUnidades < cantidadReq) {
      return {
        exito: false,
        errores: [`Stock insuficiente: disponible ${producto.totalUnidades}, solicitado ${cantidadReq}`]
      };
    }

    let resultado;
    switch (metodoUsar) {
      case 'FIFO':
        resultado = this._consumirFIFO(producto, cantidadReq);
        break;
      case 'LIFO':
        resultado = this._consumirLIFO(producto, cantidadReq);
        break;
      case 'PROMEDIO':
      default:
        resultado = this._consumirPromedio(producto, cantidadReq);
    }

    if (!resultado.exito) return resultado;

    this._recalcularTotales(producto);
    this._guardarCapas(todosProductos);

    console.log(`📤 Consumo ${metodoUsar}: ${productoId} | ${cantidadReq}u → Bs ${resultado.costoTotal}`);
    return {
      ...resultado,
      metodo: metodoUsar,
      producto: this._snapshot(producto)
    };
  }

  /**
   * Obtiene las capas actuales de un producto.
   */
  obtenerCapas(productoId) {
    const todos = this._leerCapas();
    return todos[productoId] || null;
  }

  /**
   * Calcula el valor total del inventario de un producto.
   */
  calcularValorInventario(productoId) {
    const producto = this.obtenerCapas(productoId);
    if (!producto) return 0;
    return producto.valorTotal;
  }

  /**
   * Calcula el costo de venta sin consumir inventario (preview).
   */
  calcularCostoVenta(productoId, cantidad, metodo) {
    const todos = this._leerCapas();
    const producto = todos[productoId];
    if (!producto) return { exito: false, errores: ['Producto no encontrado'] };

    const metodoUsar = (metodo || producto.metodo || 'PROMEDIO').toUpperCase();
    const copia = JSON.parse(JSON.stringify(producto));

    let resultado;
    switch (metodoUsar) {
      case 'FIFO':
        resultado = this._consumirFIFO(copia, cantidad, true);
        break;
      case 'LIFO':
        resultado = this._consumirLIFO(copia, cantidad, true);
        break;
      case 'PROMEDIO':
      default:
        resultado = this._consumirPromedio(copia, cantidad, true);
    }

    return resultado;
  }

  /**
   * Cambia el método de valuación de un producto.
   * ⚠️ Los cambios de método deben informarse en notas a los EEFF.
   */
  cambiarMetodoValuacion(productoId, nuevoMetodo) {
    const metodosValidos = ['PROMEDIO', 'FIFO', 'LIFO'];
    if (!metodosValidos.includes(nuevoMetodo)) {
      return { exito: false, errores: [`Método inválido: ${nuevoMetodo}`] };
    }

    if (nuevoMetodo === 'LIFO') {
      console.warn('⚠️ LIFO está implementado SOLO con fines educativos.');
      console.warn('   NIIF (NIC 2) y SIN Bolivia NO aceptan LIFO.');
    }

    const todos = this._leerCapas();
    const producto = todos[productoId];
    if (!producto) {
      return { exito: false, errores: ['Producto no encontrado'] };
    }

    const metodoAnterior = producto.metodo;
    const valorAnterior = producto.valorTotal;

    producto.metodo = nuevoMetodo;

    // Recalcular el inventario bajo el nuevo método
    // (las capas existentes permanecen, solo cambia el método de consumo futuro)
    const valorNuevo = producto.valorTotal;
    const diferencia = this._r2(valorNuevo - valorAnterior);

    // Registrar en historial
    const historial = this._leerHistorial();
    historial.push({
      productoId,
      fechaCambio: new Date().toISOString(),
      metodoAnterior,
      metodoNuevo: nuevoMetodo,
      valorAnterior,
      valorNuevo,
      diferencia,
      requiereNotaEEFF: true,
      advertencia: nuevoMetodo === 'LIFO'
        ? '⚠️ LIFO NO aceptado por NIIF (NIC 2) ni SIN Bolivia. Solo educativo.'
        : ''
    });
    this._guardarHistorial(historial);

    this._guardarCapas(todos);

    console.log(`🔄 Método cambiado: ${productoId} | ${metodoAnterior} → ${nuevoMetodo}`);
    return {
      exito: true,
      productoId,
      metodoAnterior,
      metodoNuevo: nuevoMetodo,
      valorAnterior,
      valorNuevo,
      diferencia,
      requiereNotaEEFF: true
    };
  }

  /**
   * Obtiene el historial de cambios de método.
   */
  obtenerHistorialCambios(productoId) {
    const historial = this._leerHistorial();
    if (!productoId) return historial;
    return historial.filter(h => h.productoId === productoId);
  }

  // ══════════════════════════════════════════════════════════
  // CONSUMO POR MÉTODO
  // ══════════════════════════════════════════════════════════

  /**
   * FIFO: consume capas desde la más ANTIGUA.
   * @private
   */
  _consumirFIFO(producto, cantidad, preview = false) {
    const capasOrdenadas = [...producto.capas]
      .filter(c => c.cantidadDisponible > 0)
      .sort((a, b) => new Date(a.fechaEntrada) - new Date(b.fechaEntrada));

    return this._ejecutarConsumo(producto, capasOrdenadas, cantidad, 'FIFO', preview);
  }

  /**
   * LIFO: consume capas desde la más RECIENTE.
   * @private
   */
  _consumirLIFO(producto, cantidad, preview = false) {
    const capasOrdenadas = [...producto.capas]
      .filter(c => c.cantidadDisponible > 0)
      .sort((a, b) => new Date(b.fechaEntrada) - new Date(a.fechaEntrada));

    return this._ejecutarConsumo(producto, capasOrdenadas, cantidad, 'LIFO', preview);
  }

  /**
   * PROMEDIO: usa costo promedio ponderado de todo el inventario.
   * @private
   */
  _consumirPromedio(producto, cantidad, preview = false) {
    if (producto.totalUnidades <= 0) {
      return { exito: false, errores: ['Sin stock para consumir'] };
    }

    const costoPromedio = this._r2(producto.valorTotal / producto.totalUnidades);
    const costoTotal = this._r2(costoPromedio * cantidad);

    const detalleConsumo = [{
      capaId: 'PROMEDIO',
      cantidad: cantidad,
      costoUnitario: costoPromedio,
      costoTotal: costoTotal
    }];

    if (!preview) {
      // Distribuir consumo proporcionalmente en todas las capas
      let restante = cantidad;
      for (const capa of producto.capas) {
        if (restante <= 0) break;
        if (capa.cantidadDisponible <= 0) continue;

        const consumir = Math.min(capa.cantidadDisponible, restante);
        capa.cantidadDisponible = this._r2(capa.cantidadDisponible - consumir);
        capa.valorTotal = this._r2(capa.cantidadDisponible * capa.costoUnitario);
        restante -= consumir;
      }
    }

    return {
      exito: true,
      costoTotal,
      costoUnitarioPromedio: costoPromedio,
      detalleConsumo,
      metodo: 'PROMEDIO'
    };
  }

  /**
   * Ejecuta el consumo recorriendo capas ordenadas.
   * @private
   */
  _ejecutarConsumo(producto, capasOrdenadas, cantidad, metodo, preview) {
    let restante = cantidad;
    let costoTotal = 0;
    const detalleConsumo = [];

    for (const capa of capasOrdenadas) {
      if (restante <= 0) break;

      const consumir = Math.min(capa.cantidadDisponible, restante);
      const costoCapa = this._r2(consumir * capa.costoUnitario);

      detalleConsumo.push({
        capaId: capa.id,
        fechaEntrada: capa.fechaEntrada,
        documentoOrigen: capa.documentoOrigen,
        cantidad: consumir,
        costoUnitario: capa.costoUnitario,
        costoTotal: costoCapa
      });

      costoTotal += costoCapa;
      restante -= consumir;

      if (!preview) {
        const capaReal = producto.capas.find(c => c.id === capa.id);
        if (capaReal) {
          capaReal.cantidadDisponible = this._r2(capaReal.cantidadDisponible - consumir);
          capaReal.valorTotal = this._r2(capaReal.cantidadDisponible * capaReal.costoUnitario);
        }
      }
    }

    if (restante > 0) {
      return { exito: false, errores: [`Stock insuficiente (faltan ${restante}u)`] };
    }

    // Advertencia LIFO
    if (metodo === 'LIFO') {
      const capasAntiguas = producto.capas.filter(c =>
        c.cantidadDisponible > 0 &&
        (new Date() - new Date(c.fechaEntrada)) > 365 * 24 * 60 * 60 * 1000
      );
      if (capasAntiguas.length > 0) {
        console.warn(`⚠️ LIFO genera "capas antiguas" que nunca se liquidan.`);
        console.warn(`   ${capasAntiguas.length} capa(s) antigua(s) con costo subvaluado.`);
      }
    }

    return {
      exito: true,
      costoTotal: this._r2(costoTotal),
      detalleConsumo,
      metodo
    };
  }

  // ══════════════════════════════════════════════════════════
  // FASE 8.3 — COMPARADOR DE MÉTODOS
  // ══════════════════════════════════════════════════════════

  /**
   * Compara los 3 métodos de valuación para un producto.
   * Muestra el mismo inventario valuado con Promedio, FIFO y LIFO.
   *
   * @param {string} productoId
   * @param {Object} [parametros] - precioVenta, ventas del período
   * @returns {Object}
   */
  compararMetodos(productoId, parametros = {}) {
    const producto = this.obtenerCapas(productoId);
    if (!producto || producto.capas.length === 0) {
      return { exito: false, errores: ['Producto sin capas de inventario'] };
    }

    const cantidadVendida = Number(parametros.cantidadVendida) || 0;
    const precioVenta = Number(parametros.precioVenta) || 0;
    const ventasTotales = this._r2(cantidadVendida * precioVenta);

    // Calcular con cada método (sin persistir)
    const resultadoPromedio = this.calcularCostoVenta(productoId, cantidadVendida, 'PROMEDIO');
    const resultadoFIFO = this.calcularCostoVenta(productoId, cantidadVendida, 'FIFO');
    const resultadoLIFO = this.calcularCostoVenta(productoId, cantidadVendida, 'LIFO');

    const inventarioFinal = this._calcularInventarioFinalPorMetodo(producto);

    const comparacion = {
      exito: true,
      productoId,
      fechaComparacion: new Date().toISOString(),
      datosEntrada: {
        totalUnidades: producto.totalUnidades,
        valorTotal: producto.valorTotal,
        cantidadVendida,
        precioVenta,
        ventasTotales
      },
      metodos: {
        PROMEDIO: {
          costoVenta: resultadoPromedio.exito ? resultadoPromedio.costoTotal : 0,
          costoUnitarioPromedio: resultadoPromedio.exito ? resultadoPromedio.costoUnitarioPromedio : 0,
          inventarioFinal: inventarioFinal.PROMEDIO,
          utilidadBruta: 0,
          iueEstimado: 0
        },
        FIFO: {
          costoVenta: resultadoFIFO.exito ? resultadoFIFO.costoTotal : 0,
          inventarioFinal: inventarioFinal.FIFO,
          utilidadBruta: 0,
          iueEstimado: 0
        },
        LIFO: {
          costoVenta: resultadoLIFO.exito ? resultadoLIFO.costoTotal : 0,
          inventarioFinal: inventarioFinal.LIFO,
          utilidadBruta: 0,
          iueEstimado: 0,
          advertencia: '⚠️ LIFO prohibido por NIIF (NIC 2) y SIN Bolivia. Solo educativo.'
        }
      }
    };

    // Calcular utilidades e IUE para cada método
    ['PROMEDIO', 'FIFO', 'LIFO'].forEach(m => {
      const ub = this._r2(ventasTotales - comparacion.metodos[m].costoVenta);
      comparacion.metodos[m].utilidadBruta = ub;
      comparacion.metodos[m].iueEstimado = ub > 0 ? this._r2(ub * 0.25) : 0;
    });

    // Calcular diferencias (FIFO vs LIFO)
    const maxCosto = Math.max(
      comparacion.metodos.PROMEDIO.costoVenta,
      comparacion.metodos.FIFO.costoVenta,
      comparacion.metodos.LIFO.costoVenta
    );
    const minCosto = Math.min(
      comparacion.metodos.PROMEDIO.costoVenta,
      comparacion.metodos.FIFO.costoVenta,
      comparacion.metodos.LIFO.costoVenta
    );

    comparacion.diferencias = {
      costoVenta: this._r2(maxCosto - minCosto),
      utilidadBruta: this._r2(maxCosto - minCosto),
      iueEstimado: this._r2((maxCosto - minCosto) * 0.25),
      inventarioFinal: this._r2(
        Math.max(...Object.values(inventarioFinal)) - Math.min(...Object.values(inventarioFinal))
      )
    };

    // Análisis
    comparacion.analisis = this._analizarComparacion(comparacion);

    console.log(`📊 Comparación de métodos: ${productoId}`);
    console.log(`   Promedio: ${comparacion.metodos.PROMEDIO.costoVenta}`);
    console.log(`   FIFO:     ${comparacion.metodos.FIFO.costoVenta}`);
    console.log(`   LIFO:     ${comparacion.metodos.LIFO.costoVenta}`);
    console.log(`   Diferencia máxima: ${comparacion.diferencias.costoVenta}`);

    return comparacion;
  }

  /**
   * Calcula inventario final bajo cada método.
   * @private
   */
  _calcularInventarioFinalPorMetodo(producto) {
    const capas = producto.capas.filter(c => c.cantidadDisponible > 0);

    // PROMEDIO: valor total actual
    const promedio = this._r2(producto.valorTotal);

    // FIFO: quedan las capas más recientes (las antiguas se consumen primero)
    const capasFIFO = [...capas].sort((a, b) => new Date(b.fechaEntrada) - new Date(a.fechaEntrada));
    const fifo = this._r2(capasFIFO.reduce((s, c) => s + c.valorTotal, 0));

    // LIFO: quedan las capas más antiguas (las recientes se consumen primero)
    const capasLIFO = [...capas].sort((a, b) => new Date(a.fechaEntrada) - new Date(b.fechaEntrada));
    const lifo = this._r2(capasLIFO.reduce((s, c) => s + c.valorTotal, 0));

    // En realidad, cuando no hay consumo, los 3 son iguales.
    // La diferencia aparece con consumo. Aquí devolvemos el actual.
    return { PROMEDIO: promedio, FIFO: fifo, LIFO: lifo };
  }

  /**
   * Simula una compra sin persistirla.
   */
  simularCompra(productoId, cantidad, costoUnitario) {
    const producto = this.obtenerCapas(productoId);
    const resultado = {
      productoId,
      datosActuales: producto
        ? { totalUnidades: producto.totalUnidades, valorTotal: producto.valorTotal }
        : { totalUnidades: 0, valorTotal: 0 },
      datosNuevos: {
        cantidad,
        costoUnitario,
        valorTotal: this._r2(cantidad * costoUnitario)
      }
    };

    const unidadesPost = resultado.datosActuales.totalUnidades + cantidad;
    const valorPost = this._r2(resultado.datosActuales.valorTotal + cantidad * costoUnitario);

    resultado.postCompra = {
      totalUnidades: unidadesPost,
      valorTotal: valorPost,
      costoPromedio: unidadesPost > 0 ? this._r2(valorPost / unidadesPost) : 0
    };

    return { exito: true, simulacion: resultado };
  }

  /**
   * Simula una venta sin persistirla.
   */
  simularVenta(productoId, cantidad, precioUnitario) {
    const producto = this.obtenerCapas(productoId);
    if (!producto) {
      return { exito: false, errores: ['Producto no encontrado'] };
    }

    const ventasTotales = this._r2(cantidad * precioUnitario);

    const costoPromedio = this.calcularCostoVenta(productoId, cantidad, 'PROMEDIO');
    const costoFIFO = this.calcularCostoVenta(productoId, cantidad, 'FIFO');
    const costoLIFO = this.calcularCostoVenta(productoId, cantidad, 'LIFO');

    return {
      exito: true,
      simulacion: {
        productoId,
        cantidad,
        precioUnitario,
        ventasTotales,
        metodos: {
          PROMEDIO: {
            costoVenta: costoPromedio.exito ? costoPromedio.costoTotal : 0,
            utilidadBruta: costoPromedio.exito ? this._r2(ventasTotales - costoPromedio.costoTotal) : 0
          },
          FIFO: {
            costoVenta: costoFIFO.exito ? costoFIFO.costoTotal : 0,
            utilidadBruta: costoFIFO.exito ? this._r2(ventasTotales - costoFIFO.costoTotal) : 0
          },
          LIFO: {
            costoVenta: costoLIFO.exito ? costoLIFO.costoTotal : 0,
            utilidadBruta: costoLIFO.exito ? this._r2(ventasTotales - costoLIFO.costoTotal) : 0,
            advertencia: '⚠️ LIFO prohibido por NIIF (NIC 2) y SIN Bolivia.'
          }
        }
      }
    };
  }

  /**
   * Genera un reporte comparativo estructurado.
   */
  generarReporteComparativo(productoId, parametros = {}) {
    const comparacion = this.compararMetodos(productoId, parametros);
    if (!comparacion.exito) return comparacion;

    return {
      exito: true,
      tipo: 'REPORTE_COMPARATIVO_METODOS_VALUACION',
      fechaGeneracion: new Date().toISOString(),
      productoId,
      datos: comparacion,
      conclusiones: [
        {
          metodo: 'PROMEDIO',
          ventajas: ['Suaviza fluctuaciones de precios', 'Simple de calcular', 'Aceptado por SIN y NIIF'],
          desventajas: ['No refleja valores actuales del inventario'],
          recomendadoPara: 'La mayoría de empresas, especialmente retail y distribución'
        },
        {
          metodo: 'FIFO',
          ventajas: ['Inventario final a valores actuales', 'Aceptado por SIN y NIIF'],
          desventajas: ['En inflación, utilidad más alta → más IUE'],
          recomendadoPara: 'Productos perecederos, industrias con rotación rápida'
        },
        {
          metodo: 'LIFO',
          ventajas: ['En inflación, utilidad más baja → menos IUE'],
          desventajas: ['PROHIBIDO por NIIF (NIC 2) y SIN Bolivia', 'Inventario subvaluado', 'Distorsiona ratios'],
          recomendadoPara: 'NO USAR. Solo con fines educativos.',
          estadoNormativo: 'PROHIBIDO desde 2005 por NIIF (NIC 2)'
        }
      ],
      normativa: {
        niif: 'NIC 2 prohíbe LIFO desde 2005. Solo Promedio y FIFO permitidos.',
        bolivia: 'SIN Bolivia acepta Promedio y FIFO. LIFO no es deducible fiscalmente.',
        codigoComercio: 'Art. 40 del Código de Comercio de Bolivia acepta Promedio y FIFO.'
      }
    };
  }

  /**
   * Analiza la comparación y genera recomendaciones.
   * @private
   */
  _analizarComparacion(comp) {
    const { PROMEDIO, FIFO, LIFO } = comp.metodos;
    const diferencias = comp.diferencias;

    return {
      impactoEnUtilidad: diferencias.utilidadBruta,
      impactoEnIUE: diferencias.iueEstimado,
      impactoEnActivo: diferencias.inventarioFinal,
      recomendacion:
        diferencias.utilidadBruta > 1000
          ? 'La elección del método impacta significativamente los estados financieros. Elija PROMEDIO o FIFO según política contable.'
          : 'El impacto es menor. Cualquiera de los métodos aceptados es válido.',
      metodoMasConservador: 'FIFO (inventario a valores actuales)',
      metodoMasAgresivo: 'LIFO (reduce utilidad en inflación) — NO RECOMENDADO'
    };
  }

  // ══════════════════════════════════════════════════════════
  // UTILIDADES PRIVADAS
  // ══════════════════════════════════════════════════════════

  _recalcularTotales(producto) {
    const capasActivas = producto.capas.filter(c => c.cantidadDisponible > 0);
    producto.totalUnidades = this._r2(capasActivas.reduce((s, c) => s + c.cantidadDisponible, 0));
    producto.valorTotal = this._r2(capasActivas.reduce((s, c) => s + c.valorTotal, 0));
  }

  _snapshot(producto) {
    return JSON.parse(JSON.stringify(producto));
  }

  _leerCapas() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY_CAPAS) || '{}');
    } catch (e) {
      return {};
    }
  }

  _guardarCapas(todosProductos) {
    localStorage.setItem(this.KEY_CAPAS, JSON.stringify(todosProductos));
  }

  _leerHistorial() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY_HISTORIAL) || '[]');
    } catch (e) {
      return [];
    }
  }

  _guardarHistorial(historial) {
    localStorage.setItem(this.KEY_HISTORIAL, JSON.stringify(historial));
  }

  _r2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }
}

window.InventarioCapasClase = InventarioCapas;
