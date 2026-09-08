// ══════════════════════════════════════════════════════════════
// inventario.js — ERP Contable Bolivia
// Módulo de Inventario: Kardex Valorado con Costo Promedio Ponderado
// ══════════════════════════════════════════════════════════════

/**
 * Módulo de Inventario
 *
 * Gestiona el kardex valorado de todos los productos.
 * Cada entrada y salida se registra con cantidad, costo y valor.
 *
 * Método de valuación: Costo Promedio Ponderado
 * - Cada entrada recalcula el costo promedio
 * - Las salidas usan el costo promedio vigente
 * - Es el método estándar en Bolivia para empresas comerciales
 *
 * @class ModuloInventario
 */
class ModuloInventario {

  /**
   * @param {Object} deps - Dependencias inyectadas
   * @param {Object} deps.almacenamiento - Instancia de Almacenamiento
   * @param {Object} deps.catalogoProductos - Instancia de CatalogoProductos
   */
  constructor(deps) {
    this.almacenamiento = deps.almacenamiento;
    this.catalogoProductos = deps.catalogoProductos;

    this.coleccionKardex = 'kardex';
    this.coleccionMovimientos = 'movimientos_inventario';

    console.log('📦 Módulo de Inventario (Kardex) inicializado.');
  }

  // ════════════════════════════════════════════════════════════
  // ENTRADA DE INVENTARIO
  // ════════════════════════════════════════════════════════════

  /**
   * Registra una entrada de inventario (compra, devolución, ajuste).
   *
   * Fórmula del nuevo promedio ponderado:
   * nuevoCosto = (stockAnterior × costoAnterior + cantidadEntrada × costoEntrada)
   *              ÷ (stockAnterior + cantidadEntrada)
   *
   * @param {Object} datos
   * @param {string} datos.productoId - ID del producto
   * @param {number} datos.cantidad - Cantidad que entra
   * @param {number} datos.costoUnitario - Costo por unidad
   * @param {string} datos.referencia - Origen del movimiento (ej: "COMPRA_OC-2026-001")
   * @param {string} datos.motivo - Motivo: COMPRA, DEVOLUCION_CLIENTE, AJUSTE
   * @returns {Object} { exito, mensaje, movimiento, nuevoCostoPromedio }
   */
  registrarEntrada(datos) {
    console.log(`📥 Registrando entrada: ${datos.cantidad} unidades de producto ${datos.productoId}`);

    // ── Validaciones ──
    const errores = this._validarEntrada(datos);
    if (errores.length > 0) {
      return { exito: false, mensaje: 'Datos de entrada inválidos', errores };
    }

    const producto = this.catalogoProductos.obtenerPorId(datos.productoId);
    if (!producto) {
      return { exito: false, mensaje: `Producto no encontrado: ${datos.productoId}`, errores: [] };
    }

    // ── Calcular nuevo costo promedio ponderado ──
    const stockAnterior = producto.stockActual || 0;
    const costoAnterior = producto.costoPromedio || producto.costoUltimo || 0;

    let nuevoCostoPromedio;
    if (stockAnterior === 0) {
      // Primer ingreso: el costo promedio es el costo de entrada
      nuevoCostoPromedio = datos.costoUnitario;
    } else {
      // Fórmula de promedio ponderado
      nuevoCostoPromedio = (
        (stockAnterior * costoAnterior) + (datos.cantidad * datos.costoUnitario)
      ) / (stockAnterior + datos.cantidad);
      nuevoCostoPromedio = window.utilidades.redondear(nuevoCostoPromedio);
    }

    const nuevoStock = stockAnterior + datos.cantidad;
    const valorEntrada = datos.cantidad * datos.costoUnitario;

    // ── Crear movimiento ──
    const movimiento = {
      id: this._generarId(),
      productoId: producto.id,
      productoCodigo: producto.codigo,
      productoNombre: producto.nombre,
      tipo: 'ENTRADA',
      motivo: datos.motivo || 'COMPRA',
      referencia: datos.referencia || 'SIN_REFERENCIA',
      cantidad: datos.cantidad,
      costoUnitario: datos.costoUnitario,
      valorTotal: valorEntrada,
      stockAnterior: stockAnterior,
      stockNuevo: nuevoStock,
      costoPromedioAnterior: costoAnterior,
      costoPromedioNuevo: nuevoCostoPromedio,
      fecha: new Date().toISOString(),
      observaciones: datos.observaciones || ''
    };

    // ── Guardar movimiento ──
    const guardado = this.almacenamiento.guardar(this.coleccionMovimientos, movimiento);
    if (!guardado) {
      return { exito: false, mensaje: 'Error al guardar movimiento', errores: [] };
    }

    // ── Actualizar stock y costo promedio en catálogo ──
    const resultadoStock = this.catalogoProductos.actualizarStock(
      datos.productoId,
      datos.cantidad,
      'COMPRA'
    );

    if (!resultadoStock.exito) {
      return { exito: false, mensaje: resultadoStock.mensaje, errores: [] };
    }

    // Actualizar costo promedio (se guarda como costoUltimo para mantener compatibilidad)
    this.catalogoProductos.actualizarCostoUltimo(datos.productoId, nuevoCostoPromedio);

    this._dispararEvento('inventario-entrada', {
      movimiento: movimiento,
      productoId: datos.productoId,
      nuevoStock: nuevoStock,
      nuevoCostoPromedio: nuevoCostoPromedio
    });

    console.log(`✅ Entrada registrada: ${producto.nombre}`);
    console.log(`   Cantidad: ${stockAnterior} → ${nuevoStock}`);
    console.log(`   Costo promedio: ${window.utilidades.formatearBs(costoAnterior)} → ${window.utilidades.formatearBs(nuevoCostoPromedio)}`);

    return {
      exito: true,
      mensaje: `Entrada registrada. Nuevo stock: ${nuevoStock}, nuevo costo promedio: ${window.utilidades.formatearBs(nuevoCostoPromedio)}`,
      movimiento: guardado,
      nuevoCostoPromedio: nuevoCostoPromedio,
      nuevoStock: nuevoStock
    };
  }

  // ════════════════════════════════════════════════════════════
  // SALIDA DE INVENTARIO
  // ════════════════════════════════════════════════════════════

  /**
   * Registra una salida de inventario (venta, devolución a proveedor, ajuste).
   * Usa el costo promedio ponderado vigente como costo de salida.
   *
   * @param {Object} datos
   * @param {string} datos.productoId - ID del producto
   * @param {number} datos.cantidad - Cantidad que sale
   * @param {string} datos.referencia - Origen (ej: "VENTA_PED-2026-001")
   * @param {string} datos.motivo - Motivo: VENTA, DEVOLUCION_PROVEEDOR, AJUSTE
   * @returns {Object} { exito, mensaje, movimiento, costoSalida }
   */
  registrarSalida(datos) {
    console.log(`📤 Registrando salida: ${datos.cantidad} unidades de producto ${datos.productoId}`);

    // ── Validaciones ──
    const errores = this._validarSalida(datos);
    if (errores.length > 0) {
      return { exito: false, mensaje: 'Datos de salida inválidos', errores };
    }

    const producto = this.catalogoProductos.obtenerPorId(datos.productoId);
    if (!producto) {
      return { exito: false, mensaje: `Producto no encontrado: ${datos.productoId}`, errores: [] };
    }

    // ── Validar stock suficiente ──
    const stockAnterior = producto.stockActual || 0;
    if (stockAnterior < datos.cantidad) {
      return {
        exito: false,
        mensaje: `Stock insuficiente. Disponible: ${stockAnterior}, Solicitado: ${datos.cantidad}`,
        errores: [`Stock insuficiente: hay ${stockAnterior}, se requieren ${datos.cantidad}`]
      };
    }

    // ── Costo de salida = costo promedio ponderado vigente ──
    const costoSalida = producto.costoPromedio || producto.costoUltimo || 0;
    const valorSalida = datos.cantidad * costoSalida;
    const nuevoStock = stockAnterior - datos.cantidad;

    // ── Crear movimiento ──
    const movimiento = {
      id: this._generarId(),
      productoId: producto.id,
      productoCodigo: producto.codigo,
      productoNombre: producto.nombre,
      tipo: 'SALIDA',
      motivo: datos.motivo || 'VENTA',
      referencia: datos.referencia || 'SIN_REFERENCIA',
      cantidad: datos.cantidad,
      costoUnitario: costoSalida,
      valorTotal: valorSalida,
      stockAnterior: stockAnterior,
      stockNuevo: nuevoStock,
      costoPromedioAnterior: costoSalida,
      costoPromedioNuevo: costoSalida, // En salidas, el promedio no cambia
      fecha: new Date().toISOString(),
      observaciones: datos.observaciones || ''
    };

    // ── Guardar movimiento ──
    const guardado = this.almacenamiento.guardar(this.coleccionMovimientos, movimiento);
    if (!guardado) {
      return { exito: false, mensaje: 'Error al guardar movimiento', errores: [] };
    }

    // ── Actualizar stock en catálogo ──
    const resultadoStock = this.catalogoProductos.actualizarStock(
      datos.productoId,
      -datos.cantidad,
      'VENTA'
    );

    if (!resultadoStock.exito) {
      return { exito: false, mensaje: resultadoStock.mensaje, errores: [] };
    }

    this._dispararEvento('inventario-salida', {
      movimiento: movimiento,
      productoId: datos.productoId,
      nuevoStock: nuevoStock,
      costoSalida: costoSalida
    });

    console.log(`✅ Salida registrada: ${producto.nombre}`);
    console.log(`   Cantidad: ${stockAnterior} → ${nuevoStock}`);
    console.log(`   Costo de salida: ${window.utilidades.formatearBs(costoSalida)} (promedio vigente)`);
    console.log(`   Valor total: ${window.utilidades.formatearBs(valorSalida)}`);

    return {
      exito: true,
      mensaje: `Salida registrada. Nuevo stock: ${nuevoStock}, costo de venta: ${window.utilidades.formatearBs(valorSalida)}`,
      movimiento: guardado,
      costoSalida: costoSalida,
      valorSalida: valorSalida,
      nuevoStock: nuevoStock
    };
  }

  // ════════════════════════════════════════════════════════════
  // CONSULTAS DE KARDEX
  // ════════════════════════════════════════════════════════════

  /**
   * Obtiene el kardex completo de un producto en un rango de fechas.
   *
   * @param {Object} filtros
   * @param {string} filtros.productoId - ID del producto
   * @param {string} [filtros.fechaInicio] - Fecha inicio (AAAA-MM-DD)
   * @param {string} [filtros.fechaFin] - Fecha fin (AAAA-MM-DD)
   * @param {string} [filtros.tipo] - ENTRADA o SALIDA
   * @returns {Object} { movimientos, saldoFinal, valorTotal }
   */
  obtenerKardex(filtros = {}) {
    let movimientos = this.almacenamiento.obtener(this.coleccionMovimientos);

    if (filtros.productoId) {
      movimientos = movimientos.filter(m => m.productoId === filtros.productoId);
    }

    if (filtros.tipo) {
      movimientos = movimientos.filter(m => m.tipo === filtros.tipo);
    }

    if (filtros.fechaInicio) {
      movimientos = movimientos.filter(m => m.fecha.split('T')[0] >= filtros.fechaInicio);
    }

    if (filtros.fechaFin) {
      movimientos = movimientos.filter(m => m.fecha.split('T')[0] <= filtros.fechaFin);
    }

    // Ordenar por fecha ascendente (los más antiguos primero)
    movimientos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    // Calcular totales
    const totalEntradas = movimientos
      .filter(m => m.tipo === 'ENTRADA')
      .reduce((sum, m) => sum + m.valorTotal, 0);

    const totalSalidas = movimientos
      .filter(m => m.tipo === 'SALIDA')
      .reduce((sum, m) => sum + m.valorTotal, 0);

    return {
      movimientos: movimientos,
      cantidadMovimientos: movimientos.length,
      totalEntradas: totalEntradas,
      totalSalidas: totalSalidas,
      valorNeto: totalEntradas - totalSalidas
    };
  }

  /**
   * Obtiene el kardex de todos los productos (resumen).
   *
   * @returns {Object} { porProducto, totalInventario, valorTotal }
   */
  obtenerResumenKardex() {
    const movimientos = this.almacenamiento.obtener(this.coleccionMovimientos);
    const productos = this.catalogoProductos.obtenerTodos();

    const porProducto = {};
    movimientos.forEach(m => {
      if (!porProducto[m.productoId]) {
        porProducto[m.productoId] = {
          productoCodigo: m.productoCodigo,
          productoNombre: m.productoNombre,
          entradas: 0,
          salidas: 0,
          valorEntradas: 0,
          valorSalidas: 0
        };
      }

      if (m.tipo === 'ENTRADA') {
        porProducto[m.productoId].entradas += m.cantidad;
        porProducto[m.productoId].valorEntradas += m.valorTotal;
      } else {
        porProducto[m.productoId].salidas += m.cantidad;
        porProducto[m.productoId].valorSalidas += m.valorTotal;
      }
    });

    return {
      porProducto: porProducto,
      totalMovimientos: movimientos.length,
      productosConMovimientos: Object.keys(porProducto).length
    };
  }

  // ════════════════════════════════════════════════════════════
  // VALOR DE INVENTARIO
  // ════════════════════════════════════════════════════════════

  /**
   * Calcula el valor total del inventario actual.
   * Para cada producto: stockActual × costoPromedio
   *
   * @returns {Object} { valorTotal, porProducto, cantidadProductos }
   */
  obtenerValorInventario() {
    // Usar obtenerTodos() y filtrar manualmente
    const productos = this.catalogoProductos.obtenerTodos();

    let valorTotal = 0;
    const porProducto = [];

    productos.forEach(p => {
      // Filtrar manualmente los activos (campo boolean 'activo')
      if (p.activo === false) return;

      const costoPromedio = p.costoPromedio || p.costoUltimo || 0;
      const valor = p.stockActual * costoPromedio;
      valorTotal += valor;

      porProducto.push({
        productoId: p.id,
        codigo: p.codigo,
        nombre: p.nombre,
        stockActual: p.stockActual,
        costoPromedio: costoPromedio,
        valorTotal: valor
      });
    });

    // Ordenar por valor descendente
    porProducto.sort((a, b) => b.valorTotal - a.valorTotal);

    return {
      valorTotal: window.utilidades.redondear(valorTotal),
      cantidadProductos: porProducto.length,
      porProducto: porProducto
    };
  }

  // ════════════════════════════════════════════════════════════
  // ALERTAS DE STOCK
  // ════════════════════════════════════════════════════════════

  /**
   * Obtiene productos con stock bajo o sin stock.
   *
   * @returns {Object} { stockBajo, sinStock, totalAlertas }
   */
  verificarStockBajo() {
    // Usar obtenerTodos() y filtrar manualmente
    const productos = this.catalogoProductos.obtenerTodos()
      .filter(p => p.activo !== false);

    const stockBajo = productos.filter(p =>
      p.stockActual > 0 && p.stockActual <= p.stockMinimo
    );

    const sinStock = productos.filter(p => p.stockActual === 0);

    return {
      stockBajo: stockBajo,
      sinStock: sinStock,
      totalAlertas: stockBajo.length + sinStock.length,
      resumen: stockBajo.length > 0 || sinStock.length > 0
        ? `⚠️ ${stockBajo.length} productos con stock bajo, ${sinStock.length} sin stock`
        : '✅ Todos los productos tienen stock suficiente'
    };
  }

  /**
   * Verifica si un producto tiene stock suficiente para una cantidad.
   *
   * @param {string} productoId
   * @param {number} cantidad
   * @returns {Object} { suficiente, stockActual, faltante }
   */
  verificarStockSuficiente(productoId, cantidad) {
    const producto = this.catalogoProductos.obtenerPorId(productoId);
    if (!producto) {
      return { suficiente: false, mensaje: 'Producto no encontrado', stockActual: 0, faltante: cantidad };
    }

    const suficiente = producto.stockActual >= cantidad;
    return {
      suficiente: suficiente,
      stockActual: producto.stockActual,
      faltante: suficiente ? 0 : cantidad - producto.stockActual,
      mensaje: suficiente
        ? 'Stock suficiente'
        : `Stock insuficiente: hay ${producto.stockActual}, se requieren ${cantidad}`
    };
  }

  // ════════════════════════════════════════════════════════════
  // AJUSTES DE INVENTARIO
  // ════════════════════════════════════════════════════════════

  /**
   * Registra un ajuste de inventario (inventario físico vs sistema).
   *
   * @param {Object} datos
   * @param {string} datos.productoId
   * @param {number} datos.cantidadReal - Cantidad contada físicamente
   * @param {string} datos.motivo - Motivo del ajuste
   * @returns {Object}
   */
  registrarAjuste(datos) {
    const producto = this.catalogoProductos.obtenerPorId(datos.productoId);
    if (!producto) {
      return { exito: false, mensaje: `Producto no encontrado: ${datos.productoId}`, errores: [] };
    }

    const stockSistema = producto.stockActual || 0;
    const diferencia = datos.cantidadReal - stockSistema;

    if (diferencia === 0) {
      return { exito: true, mensaje: 'No hay diferencia, no se requiere ajuste' };
    }

    const movimiento = {
      id: this._generarId(),
      productoId: producto.id,
      productoCodigo: producto.codigo,
      productoNombre: producto.nombre,
      tipo: diferencia > 0 ? 'ENTRADA' : 'SALIDA',
      motivo: 'AJUSTE_INVENTARIO',
      referencia: datos.referencia || 'AJUSTE_FISICO',
      cantidad: Math.abs(diferencia),
      costoUnitario: producto.costoPromedio || producto.costoUltimo || 0,
      valorTotal: Math.abs(diferencia) * (producto.costoPromedio || producto.costoUltimo || 0),
      stockAnterior: stockSistema,
      stockNuevo: datos.cantidadReal,
      costoPromedioAnterior: producto.costoPromedio || 0,
      costoPromedioNuevo: producto.costoPromedio || 0,
      fecha: new Date().toISOString(),
      observaciones: datos.motivo || 'Ajuste por inventario físico'
    };

    this.almacenamiento.guardar(this.coleccionMovimientos, movimiento);

    // Actualizar stock directamente (usando actualizar que permite establecer valores)
    const productoActualizado = { ...producto, stockActual: datos.cantidadReal };
    this.catalogoProductos.actualizar(producto.id, productoActualizado);

    this._dispararEvento('inventario-ajuste', {
      movimiento: movimiento,
      diferencia: diferencia
    });

    console.log(`🔧 Ajuste registrado: ${producto.nombre}`);
    console.log(`   Stock: ${stockSistema} → ${datos.cantidadReal} (diferencia: ${diferencia})`);

    return {
      exito: true,
      mensaje: `Ajuste registrado. Diferencia: ${diferencia > 0 ? '+' : ''}${diferencia}`,
      movimiento: movimiento,
      diferencia: diferencia
    };
  }

  // ════════════════════════════════════════════════════════════
  // MÉTODOS PRIVADOS
  // ════════════════════════════════════════════════════════════

  _validarEntrada(datos) {
    const errores = [];

    if (!datos.productoId) {
      errores.push('El ID del producto es requerido');
    }

    if (!datos.cantidad || datos.cantidad <= 0) {
      errores.push('La cantidad debe ser mayor a 0');
    }

    if (!datos.costoUnitario || datos.costoUnitario <= 0) {
      errores.push('El costo unitario debe ser mayor a 0');
    }

    return errores;
  }

  _validarSalida(datos) {
    const errores = [];

    if (!datos.productoId) {
      errores.push('El ID del producto es requerido');
    }

    if (!datos.cantidad || datos.cantidad <= 0) {
      errores.push('La cantidad debe ser mayor a 0');
    }

    return errores;
  }

  _generarId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `mov-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  _dispararEvento(nombre, datos) {
    const evento = new CustomEvent(`erp:${nombre}`, { detail: datos });
    window.dispatchEvent(evento);
  }
}

// Exponer la clase globalmente
window.ModuloInventario = ModuloInventario;