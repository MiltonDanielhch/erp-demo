// Archivo: js/modulos/ventas.js
// Versión: 0.10.0
// Fase: 2.4 - Módulo de Ventas

/**
 * Módulo de Ventas
 * Gestiona el ciclo completo: cotización → pedido → despacho → factura → cobro
 */
class ModuloVentas {
  constructor(almacenamiento, capa1, catalogoClientes, catalogoProductos) {
    this.almacenamiento = almacenamiento;
    this.capa1 = capa1;
    this.catalogoClientes = catalogoClientes;
    this.catalogoProductos = catalogoProductos;

    // Colecciones
    this.COL_COTIZACIONES = 'cotizaciones';
    this.COL_PEDIDOS = 'pedidos_venta';
    this.COL_CUENTAS_COBRAR = 'cuentas_por_cobrar';

    // Asegurar que las colecciones existen
    this.almacenamiento.obtener(this.COL_COTIZACIONES) || this.almacenamiento.guardar(this.COL_COTIZACIONES, []);
    this.almacenamiento.obtener(this.COL_PEDIDOS) || this.almacenamiento.guardar(this.COL_PEDIDOS, []);
    this.almacenamiento.obtener(this.COL_CUENTAS_COBRAR) || this.almacenamiento.guardar(this.COL_CUENTAS_COBRAR, []);

    console.log('💼 Módulo de Ventas inicializado');
  }

  // ═══════════════════════════════════════════════════════════
  // ETAPA 1: COTIZACIÓN
  // ═══════════════════════════════════════════════════════════

  /**
   * Crea una cotización para un cliente
   * @param {Object} datos - {clienteId, productos: [{productoId, cantidad, precioUnitario, descuento}], vigenciaDias}
   * @returns {Object} {exito, mensaje, cotizacion}
   */
  crearCotizacion(datos) {
    const errores = [];

    // Validar cliente
    const cliente = this.catalogoClientes.obtenerPorId(datos.clienteId);
    if (!cliente) {
      errores.push('Cliente no encontrado');
    }

    // Validar productos
    if (!datos.productos || datos.productos.length === 0) {
      errores.push('Debe incluir al menos un producto');
    }

    if (errores.length > 0) {
      return { exito: false, mensaje: 'Datos inválidos', errores };
    }

    // Generar número de cotización
    const cotizaciones = this.almacenamiento.obtener(this.COL_COTIZACIONES) || [];
    const numero = `COT-${new Date().getFullYear()}-${String(cotizaciones.length + 1).padStart(4, '0')}`;

    // Calcular totales
    let subtotal = 0;
    let totalDescuentos = 0;
    const productosDetalle = [];

    for (const item of datos.productos) {
      const producto = this.catalogoProductos.obtenerPorId(item.productoId);
      if (!producto) {
        errores.push(`Producto ${item.productoId} no encontrado`);
        continue;
      }

      const precioUnitario = item.precioUnitario || producto.precioVenta;
      const descuento = item.descuento || 0;
      const subtotalItem = (precioUnitario * item.cantidad) - descuento;

      productosDetalle.push({
        productoId: producto.id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        cantidad: item.cantidad,
        precioUnitario: precioUnitario,
        descuento: descuento,
        subtotal: subtotalItem
      });

      subtotal += precioUnitario * item.cantidad;
      totalDescuentos += descuento;
    }

    if (errores.length > 0) {
      return { exito: false, mensaje: 'Error en productos', errores };
    }

    const montoTotal = subtotal - totalDescuentos;
    const vigenciaDias = datos.vigenciaDias || 7;
    const fechaEmision = new Date();
    const fechaVencimiento = new Date(fechaEmision);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + vigenciaDias);

    const cotizacion = {
      id: this._generarId(),
      numero: numero,
      clienteId: cliente.id,
      clienteNombre: cliente.razonSocial,
      clienteNit: cliente.nit,
      productos: productosDetalle,
      subtotal: subtotal,
      totalDescuentos: totalDescuentos,
      montoTotal: montoTotal,
      fechaEmision: fechaEmision.toISOString().split('T')[0],
      fechaVencimiento: fechaVencimiento.toISOString().split('T')[0],
      estado: 'COTIZADA',
      observaciones: datos.observaciones || '',
      creadoEn: new Date().toISOString()
    };

    this.almacenamiento.guardar(this.COL_COTIZACIONES, cotizacion);
    this._dispararEvento('cotizacion-creada', cotizacion);

    console.log(`✅ Cotización creada: ${numero} por ${window.utilidades.formatearBs(montoTotal)}`);

    return {
      exito: true,
      mensaje: `Cotización ${numero} creada exitosamente`,
      cotizacion: cotizacion
    };
  }

  // ═══════════════════════════════════════════════════════════
  // ETAPA 2: PEDIDO DE VENTA
  // ═══════════════════════════════════════════════════════════

  /**
   * Convierte una cotización en un pedido de venta
   * @param {string} cotizacionId - ID de la cotización
   * @returns {Object} {exito, mensaje, pedido}
   */
  generarPedido(cotizacionId) {
    const cotizaciones = this.almacenamiento.obtener(this.COL_COTIZACIONES) || [];
    const cotizacion = cotizaciones.find(c => c.id === cotizacionId);

    if (!cotizacion) {
      return { exito: false, mensaje: 'Cotización no encontrada', errores: [] };
    }

    if (cotizacion.estado !== 'COTIZADA') {
      return { exito: false, mensaje: `La cotización ya fue procesada (${cotizacion.estado})`, errores: [] };
    }

    // Verificar vigencia
    const hoy = new Date();
    const vencimiento = new Date(cotizacion.fechaVencimiento);
    if (hoy > vencimiento) {
      return { exito: false, mensaje: 'La cotización ha vencido', errores: [] };
    }

    // Validar stock disponible
    const erroresStock = [];
    for (const item of cotizacion.productos) {
      const producto = this.catalogoProductos.obtenerPorId(item.productoId);
      if (producto.stockActual < item.cantidad) {
        erroresStock.push(`${producto.nombre}: stock insuficiente (${producto.stockActual} disponibles, ${item.cantidad} solicitados)`);
      }
    }

    if (erroresStock.length > 0) {
      return { exito: false, mensaje: 'Stock insuficiente', errores: erroresStock };
    }

    // Generar número de pedido
    const pedidos = this.almacenamiento.obtener(this.COL_PEDIDOS) || [];
    const numero = `PV-${new Date().getFullYear()}-${String(pedidos.length + 1).padStart(4, '0')}`;

    // Crear pedido
    const pedido = {
      id: this._generarId(),
      numero: numero,
      cotizacionId: cotizacion.id,
      cotizacionNumero: cotizacion.numero,
      clienteId: cotizacion.clienteId,
      clienteNombre: cotizacion.clienteNombre,
      clienteNit: cotizacion.clienteNit,
      productos: cotizacion.productos.map(p => ({
        ...p,
        cantidadDespachada: 0
      })),
      subtotal: cotizacion.subtotal,
      totalDescuentos: cotizacion.totalDescuentos,
      montoTotal: cotizacion.montoTotal,
      fechaPedido: new Date().toISOString().split('T')[0],
      estado: 'PEDIDO',
      creadoEn: new Date().toISOString()
    };

    this.almacenamiento.guardar(this.COL_PEDIDOS, pedido);

    // Actualizar estado de la cotización
    cotizacion.estado = 'PEDIDO_GENERADO';
    cotizacion.pedidoId = pedido.id;
    cotizacion.pedidoNumero = pedido.numero;
    this.almacenamiento.actualizar(this.COL_COTIZACIONES, cotizacion.id, cotizacion);

    this._dispararEvento('pedido-generado', pedido);

    console.log(`✅ Pedido generado: ${numero} desde cotización ${cotizacion.numero}`);

    return {
      exito: true,
      mensaje: `Pedido ${numero} generado exitosamente`,
      pedido: pedido
    };
  }

  // ═══════════════════════════════════════════════════════════
  // ETAPA 3: DESPACHO DE MERCANCÍA
  // ═══════════════════════════════════════════════════════════

  /**
   * Registra el despacho de mercancía (salida de almacén)
   * @param {string} pedidoId - ID del pedido
   * @param {Object} datosDespacho - {productos: [{productoId, cantidadDespachada}], despachadoPor, observaciones}
   * @returns {Object} {exito, mensaje, despacho}
   */
  registrarDespacho(pedidoId, datosDespacho) {
    const pedidos = this.almacenamiento.obtener(this.COL_PEDIDOS) || [];
    const pedido = pedidos.find(p => p.id === pedidoId);

    if (!pedido) {
      return { exito: false, mensaje: 'Pedido no encontrado', errores: [] };
    }

    if (pedido.estado !== 'PEDIDO' && pedido.estado !== 'PARCIALMENTE_DESPACHADO') {
      return { exito: false, mensaje: `El pedido no está disponible para despacho (${pedido.estado})`, errores: [] };
    }

    const errores = [];
    const productosDespachados = [];
    let costoTotalVenta = 0;

    for (const item of datosDespacho.productos) {
      const productoPedido = pedido.productos.find(p => p.productoId === item.productoId);
      if (!productoPedido) {
        errores.push(`Producto ${item.productoId} no está en el pedido`);
        continue;
      }

      const cantidadPendiente = productoPedido.cantidad - productoPedido.cantidadDespachada;
      if (item.cantidadDespachada > cantidadPendiente) {
        errores.push(`${productoPedido.nombre}: cantidad despachada (${item.cantidadDespachada}) excede pendiente (${cantidadPendiente})`);
        continue;
      }

      const producto = this.catalogoProductos.obtenerPorId(item.productoId);

      // Validar stock disponible
      if (producto.stockActual < item.cantidadDespachada) {
        errores.push(`${producto.nombre}: stock insuficiente (${producto.stockActual} disponibles)`);
        continue;
      }

      productosDespachados.push({
        productoId: producto.id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        cantidadDespachada: item.cantidadDespachada,
        costoUnitario: producto.costoUltimo,
        subtotal: item.cantidadDespachada * producto.costoUltimo
      });

      costoTotalVenta += item.cantidadDespachada * producto.costoUltimo;
    }

    if (errores.length > 0) {
      return { exito: false, mensaje: 'Error en despacho', errores };
    }

    // Generar documento fuente: NOTA_SALIDA
    const resultadoDoc = this.capa1.registrarDocumento({
      tipo: 'NOTA_SALIDA',
      numero: `NS-${pedido.numero}-${Date.now()}`,
      fechaEmision: new Date().toISOString().split('T')[0],
      montoTotal: costoTotalVenta,
      nitCliente: pedido.clienteNit,
      razonSocialCliente: pedido.clienteNombre,
      almacen: datosDespacho.almacen || 'ALMACEN_CENTRAL',
      motivo: 'VENTA',
      responsable: datosDespacho.despachadoPor || 'Almacén',
      productos: productosDespachados.map(p => ({
        ...p,
        cantidad: p.cantidadDespachada // Para compatibilidad con validación de Capa 1
      })),
      pedidoId: pedido.id,
      pedidoNumero: pedido.numero
    });

    if (!resultadoDoc.exito) {
      return resultadoDoc;
    }

    // Actualizar stock y kardex
    for (const item of productosDespachados) {
      if (window.moduloInventario) {
        const resultadoKardex = window.moduloInventario.registrarSalida({
          productoId: item.productoId,
          cantidad: item.cantidadDespachada,
          referencia: `VENTA_${pedido.numero}`,
          motivo: 'VENTA',
          observaciones: `Despacho de pedido ${pedido.numero}`
        });

        if (!resultadoKardex.exito) {
          console.warn(`⚠️ Error en kardex: ${resultadoKardex.mensaje}`);
        }
      } else {
        // Fallback: actualizar stock directamente
        this.catalogoProductos.actualizarStock(
          item.productoId,
          -item.cantidadDespachada,
          'VENTA'
        );
      }
    }

    // Actualizar cantidades despachadas en el pedido
    for (const item of productosDespachados) {
      const productoPedido = pedido.productos.find(p => p.productoId === item.productoId);
      productoPedido.cantidadDespachada += item.cantidadDespachada;
    }

    // Determinar nuevo estado del pedido
    const todosDespachados = pedido.productos.every(p => p.cantidadDespachada === p.cantidad);
    pedido.estado = todosDespachados ? 'DESPACHADO' : 'PARCIALMENTE_DESPACHADO';
    pedido.fechaDespacho = new Date().toISOString().split('T')[0];
    pedido.costoVenta = (pedido.costoVenta || 0) + costoTotalVenta;

    this.almacenamiento.actualizar(this.COL_PEDIDOS, pedido.id, pedido);

    this._dispararEvento('despacho-registrado', {
      pedido: pedido,
      productosDespachados: productosDespachados,
      costoVenta: costoTotalVenta
    });

    console.log(`✅ Despacho registrado: ${productosDespachados.length} productos, costo: ${window.utilidades.formatearBs(costoTotalVenta)}`);

    return {
      exito: true,
      mensaje: `Despacho registrado. Pedido: ${pedido.estado}`,
      pedido: pedido,
      productosDespachados: productosDespachados,
      costoVenta: costoTotalVenta
    };
  }

  // ═══════════════════════════════════════════════════════════
  // ETAPA 4: FACTURA DE VENTA
  // ═══════════════════════════════════════════════════════════

  /**
   * Emite la factura de venta al cliente
   * @param {string} pedidoId - ID del pedido
   * @param {Object} datosFactura - {numeroFactura, cuf, fechaEmision}
   * @returns {Object} {exito, mensaje, factura}
   */
  emitirFactura(pedidoId, datosFactura) {
    const pedidos = this.almacenamiento.obtener(this.COL_PEDIDOS) || [];
    const pedido = pedidos.find(p => p.id === pedidoId);

    if (!pedido) {
      return { exito: false, mensaje: 'Pedido no encontrado', errores: [] };
    }

    if (pedido.estado !== 'DESPACHADO') {
      return { exito: false, mensaje: `El pedido debe estar completamente despachado para facturar (${pedido.estado})`, errores: [] };
    }

    // Validar cliente
    const cliente = this.catalogoClientes.obtenerPorId(pedido.clienteId);
    if (!cliente) {
      return { exito: false, mensaje: 'Cliente no encontrado', errores: [] };
    }

    // Generar CUF si no se proporciona
    const cuf = datosFactura.cuf || this._generarCUF();
    const numeroFactura = datosFactura.numeroFactura || `FV-${new Date().getFullYear()}-${String((this.almacenamiento.obtener('documentos') || []).filter(d => d.tipo === 'FACTURA_VENTA').length + 1).padStart(6, '0')}`;

    // Calcular impuestos
    const montoTotal = pedido.montoTotal;
    const montoNeto = window.utilidades.redondear(montoTotal / 1.13);
    const montoIVA = window.utilidades.redondear(montoTotal - montoNeto);
    const montoIT = window.utilidades.redondear(montoTotal * 0.03); // 3% del total

    // Generar documento fuente: FACTURA_VENTA
    const resultadoDoc = this.capa1.registrarDocumento({
      tipo: 'FACTURA_VENTA',
      numero: numeroFactura,
      fechaEmision: datosFactura.fechaEmision || new Date().toISOString().split('T')[0],
      montoTotal: montoTotal,
      nitCliente: cliente.nit,
      razonSocialCliente: cliente.razonSocial,
      cuf: cuf,
      productos: pedido.productos,
      pedidoId: pedido.id,
      pedidoNumero: pedido.numero
    });

    if (!resultadoDoc.exito) {
      return resultadoDoc;
    }

    // Calcular fecha de vencimiento según condiciones de pago del cliente
    const diasCredito = this._obtenerDiasCredito(cliente);
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + diasCredito);

    // Crear cuenta por cobrar
    const cuentaPorCobrar = {
      id: this._generarId(),
      facturaId: resultadoDoc.documento.id,
      facturaNumero: numeroFactura,
      pedidoId: pedido.id,
      pedidoNumero: pedido.numero,
      clienteId: cliente.id,
      clienteNombre: cliente.razonSocial,
      clienteNit: cliente.nit,
      montoTotal: montoTotal,
      montoPagado: 0,
      saldoPendiente: montoTotal,
      fechaEmision: resultadoDoc.documento.fechaEmision,
      fechaVencimiento: fechaVencimiento.toISOString().split('T')[0],
      estado: 'PENDIENTE',
      creadoEn: new Date().toISOString()
    };

    this.almacenamiento.guardar(this.COL_CUENTAS_COBRAR, cuentaPorCobrar);

    // Actualizar pedido
    pedido.estado = 'FACTURADO';
    pedido.facturaId = resultadoDoc.documento.id;
    pedido.facturaNumero = numeroFactura;
    pedido.cuentaPorCobrarId = cuentaPorCobrar.id;
    pedido.montoIVA = montoIVA;
    pedido.montoIT = montoIT;

    this.almacenamiento.actualizar(this.COL_PEDIDOS, pedido.id, pedido);

    this._dispararEvento('factura-emitida', {
      pedido: pedido,
      factura: resultadoDoc.documento,
      cuentaPorCobrar: cuentaPorCobrar
    });

    console.log(`✅ Factura emitida: ${numeroFactura} por ${window.utilidades.formatearBs(montoTotal)}`);
    console.log(`   IVA Débito Fiscal: ${window.utilidades.formatearBs(montoIVA)}`);
    console.log(`   IT (3%): ${window.utilidades.formatearBs(montoIT)}`);

    return {
      exito: true,
      mensaje: `Factura ${numeroFactura} emitida exitosamente`,
      factura: resultadoDoc.documento,
      cuentaPorCobrar: cuentaPorCobrar,
      impuestos: {
        iva: montoIVA,
        it: montoIT
      }
    };
  }

  // ═══════════════════════════════════════════════════════════
  // ETAPA 5: COBRO
  // ═══════════════════════════════════════════════════════════

  /**
   * Registra un cobro (total o parcial) de una factura
   * @param {string} cuentaPorCobrarId - ID de la cuenta por cobrar
   * @param {Object} datosCobro - {monto, metodoPago, referencia}
   * @returns {Object} {exito, mensaje, cobro}
   */
  registrarCobro(cuentaPorCobrarId, datosCobro) {
    const cuentas = this.almacenamiento.obtener(this.COL_CUENTAS_COBRAR) || [];
    const cuenta = cuentas.find(c => c.id === cuentaPorCobrarId);

    if (!cuenta) {
      return { exito: false, mensaje: 'Cuenta por cobrar no encontrada', errores: [] };
    }

    if (cuenta.estado === 'COBRADA') {
      return { exito: false, mensaje: 'La cuenta ya está completamente cobrada', errores: [] };
    }

    const monto = parseFloat(datosCobro.monto);
    if (monto <= 0) {
      return { exito: false, mensaje: 'El monto debe ser mayor a 0', errores: [] };
    }

    if (monto > cuenta.saldoPendiente) {
      return { exito: false, mensaje: `El monto excede el saldo pendiente (${window.utilidades.formatearBs(cuenta.saldoPendiente)})`, errores: [] };
    }

    // Generar documento fuente: RECIBO_CAJA (ya configurado en tipos-documentos.js)
    const resultadoDoc = this.capa1.registrarDocumento({
      tipo: 'RECIBO_CAJA',
      numero: `RC-${Date.now()}`,
      fechaEmision: new Date().toISOString().split('T')[0],
      montoTotal: monto,
      recibidoDe: cuenta.clienteNombre,  // Campo específico de RECIBO_CAJA
      nitRecibidoDe: cuenta.clienteNit,  // Campo específico de RECIBO_CAJA
      concepto: `Cobro factura ${cuenta.facturaNumero}`,
      formaPago: datosCobro.metodoPago || 'EFECTIVO',
      cuentaPorCobrarId: cuenta.id
    });

    if (!resultadoDoc.exito) {
      return resultadoDoc;
    }

    // Actualizar cuenta por cobrar
    cuenta.montoPagado += monto;
    cuenta.saldoPendiente -= monto;
    cuenta.estado = cuenta.saldoPendiente <= 0.01 ? 'COBRADA' : 'PARCIALMENTE_COBRADA';

    if (!cuenta.pagos) cuenta.pagos = [];
    cuenta.pagos.push({
      id: this._generarId(),
      monto: monto,
      metodoPago: datosCobro.metodoPago || 'EFECTIVO',
      referencia: datosCobro.referencia || '',
      fecha: new Date().toISOString(),
      reciboId: resultadoDoc.documento.id
    });

    this.almacenamiento.actualizar(this.COL_CUENTAS_COBRAR, cuenta.id, cuenta);

    this._dispararEvento('cobro-registrado', {
      cuenta: cuenta,
      cobro: monto,
      recibo: resultadoDoc.documento
    });

    console.log(`✅ Cobro registrado: ${window.utilidades.formatearBs(monto)}`);
    console.log(`   Saldo pendiente: ${window.utilidades.formatearBs(cuenta.saldoPendiente)}`);
    console.log(`   Estado: ${cuenta.estado}`);

    return {
      exito: true,
      mensaje: `Cobro de ${window.utilidades.formatearBs(monto)} registrado. ${cuenta.estado === 'COBRADA' ? 'Cuenta saldada.' : `Saldo: ${window.utilidades.formatearBs(cuenta.saldoPendiente)}`}`,
      cuenta: cuenta,
      cobro: monto,
      recibo: resultadoDoc.documento
    };
  }

  // ═══════════════════════════════════════════════════════════
  // CONSULTAS
  // ═══════════════════════════════════════════════════════════

  /**
   * Obtiene todas las cotizaciones
   * @param {Object} filtros - {estado, clienteId}
   * @returns {Array} Lista de cotizaciones
   */
  obtenerCotizaciones(filtros = {}) {
    let cotizaciones = this.almacenamiento.obtener(this.COL_COTIZACIONES) || [];

    if (filtros.estado) {
      cotizaciones = cotizaciones.filter(c => c.estado === filtros.estado);
    }

    if (filtros.clienteId) {
      cotizaciones = cotizaciones.filter(c => c.clienteId === filtros.clienteId);
    }

    return cotizaciones.sort((a, b) => new Date(b.fechaEmision) - new Date(a.fechaEmision));
  }

  /**
   * Obtiene todos los pedidos de venta
   * @param {Object} filtros - {estado, clienteId}
   * @returns {Array} Lista de pedidos
   */
  obtenerPedidos(filtros = {}) {
    let pedidos = this.almacenamiento.obtener(this.COL_PEDIDOS) || [];

    if (filtros.estado) {
      pedidos = pedidos.filter(p => p.estado === filtros.estado);
    }

    if (filtros.clienteId) {
      pedidos = pedidos.filter(p => p.clienteId === filtros.clienteId);
    }

    return pedidos.sort((a, b) => new Date(b.fechaPedido) - new Date(a.fechaPedido));
  }

  /**
   * Obtiene todas las cuentas por cobrar
   * @param {Object} filtros - {estado, clienteId}
   * @returns {Array} Lista de cuentas por cobrar
   */
  obtenerCuentasPorCobrar(filtros = {}) {
    let cuentas = this.almacenamiento.obtener(this.COL_CUENTAS_COBRAR) || [];

    if (filtros.estado) {
      cuentas = cuentas.filter(c => c.estado === filtros.estado);
    }

    if (filtros.clienteId) {
      cuentas = cuentas.filter(c => c.clienteId === filtros.clienteId);
    }

    return cuentas.sort((a, b) => new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento));
  }

  /**
   * Calcula el total pendiente de cobro
   * @returns {Object} {total, porCliente}
   */
  obtenerTotalPorCobrar() {
    const cuentas = this.obtenerCuentasPorCobrar();
    const pendientes = cuentas.filter(c => c.estado === 'PENDIENTE' || c.estado === 'PARCIALMENTE_COBRADA');

    const total = pendientes.reduce((sum, c) => sum + c.saldoPendiente, 0);

    const porCliente = {};
    pendientes.forEach(c => {
      if (!porCliente[c.clienteNombre]) {
        porCliente[c.clienteNombre] = 0;
      }
      porCliente[c.clienteNombre] += c.saldoPendiente;
    });

    return {
      total: total,
      cantidad: pendientes.length,
      porCliente: porCliente
    };
  }

  /**
   * Obtiene el historial de ventas de un cliente
   * @param {string} clienteId - ID del cliente
   * @returns {Object} {pedidos, totalVendido, cantidadPedidos}
   */
  obtenerHistorialVentas(clienteId) {
    const pedidos = this.obtenerPedidos({ clienteId: clienteId });
    const totalVendido = pedidos.reduce((sum, p) => sum + p.montoTotal, 0);

    return {
      pedidos: pedidos,
      totalVendido: totalVendido,
      cantidadPedidos: pedidos.length,
      promedioPorPedido: pedidos.length > 0 ? totalVendido / pedidos.length : 0
    };
  }

  // ═══════════════════════════════════════════════════════════
  // MÉTODOS PRIVADOS
  // ═══════════════════════════════════════════════════════════

  _generarId() {
    return 'v-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  _generarCUF() {
    // Genera un CUF simulado de 43 caracteres
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let cuf = '';
    for (let i = 0; i < 43; i++) {
      cuf += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return cuf;
  }

  _obtenerDiasCredito(cliente) {
    // Mapeo de condiciones de pago a días
    const mapa = {
      'CONTADO': 0,
      'CREDITO_7': 7,
      'CREDITO_15': 15,
      'CREDITO_30': 30,
      'CREDITO_60': 60,
      'CREDITO_90': 90
    };

    return mapa[cliente.condicionesPago] || 0;
  }

  _dispararEvento(nombre, datos) {
    const evento = new CustomEvent(`erp:${nombre}`, { detail: datos });
    window.dispatchEvent(evento);
  }
}

// Exponer globalmente
window.ModuloVentas = ModuloVentas;

console.log('✅ Módulo de Ventas cargado y disponible');
