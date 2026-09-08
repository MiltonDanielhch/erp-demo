// ══════════════════════════════════════════════════════════════
// compras.js — ERP Contable Bolivia
// Módulo de Compras: Ciclo completo desde solicitud hasta pago
// ══════════════════════════════════════════════════════════════

/**
 * Módulo de Compras
 *
 * Gestiona el ciclo completo:
 * SOLICITADA → ORDENADA → RECIBIDA → FACTURADA → PAGADA
 *
 * Responsabilidades:
 * - Crear solicitudes de compra
 * - Generar órdenes de compra (con numeración automática)
 * - Registrar recepción de mercadería (actualiza Kardex)
 * - Procesar facturas de proveedores (genera IVA crédito fiscal)
 * - Registrar pagos (reduce cuentas por pagar)
 * - Consultar cuentas por pagar e historial
 *
 * Cada paso genera un documento fuente en la Capa 1.
 *
 * @class ModuloCompras
 */
class ModuloCompras {

  /**
   * @param {Object} deps - Dependencias inyectadas
   * @param {Object} deps.almacenamiento - Instancia de Almacenamiento
   * @param {Object} deps.capaDocumentos - Instancia de CapaDocumentos
   * @param {Object} deps.catalogoProveedores - Instancia de CatalogoProveedores
   * @param {Object} deps.catalogoProductos - Instancia de CatalogoProductos
   */
  constructor(deps) {
    this.almacenamiento = deps.almacenamiento;
    this.capaDocumentos = deps.capaDocumentos;
    this.catalogoProveedores = deps.catalogoProveedores;
    this.catalogoProductos = deps.catalogoProductos;

    this.coleccionSolicitudes = 'solicitudes_compra';
    this.coleccionOrdenes = 'ordenes_compra';
    this.coleccionCuentasPorPagar = 'cuentas_por_pagar';

    console.log('🛒 Módulo de Compras inicializado.');
  }

  // ════════════════════════════════════════════════════════════
  // ETAPA 1: SOLICITUD DE COMPRA
  // ════════════════════════════════════════════════════════════

  /**
   * Crea una solicitud de compra.
   * Es el primer paso del ciclo: un usuario solicita productos.
   *
   * @param {Object} datos - Datos de la solicitud
   * @param {string} datos.solicitante - Nombre del solicitante
   * @param {string} datos.departamento - Departamento que solicita
   * @param {Array} datos.productos - [{productoId, cantidad, justificacion}]
   * @param {string} datos.justificacion - Justificación general
   * @returns {Object} { exito, mensaje, solicitud, errores }
   */
  solicitarCompra(datos) {
    console.log('📋 Registrando solicitud de compra...');

    const errores = this._validarSolicitud(datos);
    if (errores.length > 0) {
      return { exito: false, mensaje: 'Datos inválidos', solicitud: null, errores };
    }

    const solicitud = {
      id: this._generarId(),
      numero: this._generarNumeroSolicitud(),
      estado: 'SOLICITADA',
      solicitante: datos.solicitante.trim(),
      departamento: datos.departamento.trim(),
      justificacion: datos.justificacion?.trim() || '',
      productos: datos.productos.map(p => ({
        productoId: p.productoId,
        codigo: p.codigo || '',
        nombre: p.nombre || '',
        cantidad: parseInt(p.cantidad, 10),
        justificacion: p.justificacion || '',
        cantidadRecibida: 0,
        cantidadOrdenada: 0
      })),
      fechaSolicitud: new Date().toISOString(),
      fechaAprobacion: null,
      aprobadaPor: null,
      ordenesGeneradas: [],
      creadoEn: new Date().toISOString()
    };

    const guardado = this.almacenamiento.guardar(this.coleccionSolicitudes, solicitud);

    if (!guardado) {
      return { exito: false, mensaje: 'Error al guardar la solicitud', solicitud: null, errores: [] };
    }

    this._dispararEvento('solicitud-compra-creada', solicitud);
    console.log(`✅ Solicitud creada: ${solicitud.numero}`);

    return {
      exito: true,
      mensaje: `Solicitud ${solicitud.numero} creada exitosamente`,
      solicitud: guardado,
      errores: []
    };
  }

  /**
   * Aprueba una solicitud de compra.
   * @param {string} solicitudId
   * @param {string} aprobadoPor - Nombre de quien aprueba
   * @returns {Object}
   */
  aprobarSolicitud(solicitudId, aprobadoPor) {
    const solicitud = this.almacenamiento.obtenerPorId(this.coleccionSolicitudes, solicitudId);
    if (!solicitud) {
      return { exito: false, mensaje: `Solicitud no encontrada: ${solicitudId}` };
    }

    if (solicitud.estado !== 'SOLICITADA') {
      return { exito: false, mensaje: `La solicitud ya fue procesada (estado: ${solicitud.estado})` };
    }

    const actualizada = this.almacenamiento.actualizar(this.coleccionSolicitudes, solicitudId, {
      ...solicitud,
      estado: 'APROBADA',
      fechaAprobacion: new Date().toISOString(),
      aprobadaPor: aprobadoPor
    });

    if (actualizada) {
      console.log(`✅ Solicitud ${solicitud.numero} aprobada por ${aprobadoPor}`);
      return { exito: true, mensaje: 'Solicitud aprobada', solicitud: actualizada };
    }

    return { exito: false, mensaje: 'Error al aprobar la solicitud' };
  }

  // ════════════════════════════════════════════════════════════
  // ETAPA 2: ORDEN DE COMPRA
  // ════════════════════════════════════════════════════════════

  /**
   * Genera una orden de compra a partir de una solicitud aprobada.
   *
   * @param {string} solicitudId
   * @param {Object} datosOrden
   * @param {string} datosOrden.proveedorId - ID del proveedor seleccionado
   * @param {Array} datosOrden.productos - [{productoId, cantidad, precioUnitario}]
   * @param {string} datosOrden.condicionesPago - CONTADO, CREDITO_30, etc.
   * @returns {Object}
   */
  generarOrdenCompra(solicitudId, datosOrden) {
    console.log('📝 Generando orden de compra...');

    const solicitud = this.almacenamiento.obtenerPorId(this.coleccionSolicitudes, solicitudId);
    if (!solicitud) {
      return { exito: false, mensaje: `Solicitud no encontrada: ${solicitudId}` };
    }

    if (solicitud.estado !== 'APROBADA' && solicitud.estado !== 'SOLICITADA') {
      return { exito: false, mensaje: `La solicitud no está disponible para OC (estado: ${solicitud.estado})` };
    }

    const proveedor = this.catalogoProveedores.obtenerPorId(datosOrden.proveedorId);
    if (!proveedor) {
      return { exito: false, mensaje: `Proveedor no encontrado: ${datosOrden.proveedorId}` };
    }

    if (proveedor.estado !== 'ACTIVO') {
      return { exito: false, mensaje: `El proveedor ${proveedor.razonSocial} está inactivo` };
    }

    // Validar y calcular productos
    const productosOrden = [];
    let subtotal = 0;

    for (const item of datosOrden.productos) {
      const producto = this.catalogoProductos.obtenerPorId(item.productoId);
      if (!producto) {
        return { exito: false, mensaje: `Producto no encontrado: ${item.productoId}` };
      }

      const cantidad = parseInt(item.cantidad, 10);
      const precioUnitario = parseFloat(item.precioUnitario);

      if (cantidad <= 0) {
        return { exito: false, mensaje: `Cantidad inválida para ${producto.nombre}` };
      }

      if (precioUnitario <= 0) {
        return { exito: false, mensaje: `Precio inválido para ${producto.nombre}` };
      }

      const subtotalItem = cantidad * precioUnitario;
      subtotal += subtotalItem;

      productosOrden.push({
        productoId: producto.id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        cantidad: cantidad,
        precioUnitario: precioUnitario,
        subtotal: subtotalItem,
        cantidadRecibida: 0
      });
    }

    const iva = window.utilidades.calcularIVADeTotal(subtotal);
    const neto = window.utilidades.extraerNetoDeTotal(subtotal);

    const orden = {
      id: this._generarId(),
      numero: this._generarNumeroOrden(),
      solicitudId: solicitudId,
      solicitudNumero: solicitud.numero,
      estado: 'ORDENADA',
      proveedorId: proveedor.id,
      proveedorNit: proveedor.nit,
      proveedorRazonSocial: proveedor.razonSocial,
      condicionesPago: datosOrden.condicionesPago || proveedor.condicionesPago || 'CONTADO',
      productos: productosOrden,
      subtotal: neto,
      montoIVA: iva,
      montoTotal: subtotal,
      fechaOrden: new Date().toISOString(),
      fechaRecepcion: null,
      fechaFactura: null,
      fechaPago: null,
      creadoEn: new Date().toISOString()
    };

    const guardado = this.almacenamiento.guardar(this.coleccionOrdenes, orden);

    if (!guardado) {
      return { exito: false, mensaje: 'Error al guardar la orden', errores: [] };
    }

    // Actualizar solicitud: agregar esta OC
    solicitud.ordenesGeneradas.push({
      ordenId: orden.id,
      ordenNumero: orden.numero,
      fechaGeneracion: new Date().toISOString()
    });

    if (solicitud.estado === 'SOLICITADA') {
      solicitud.estado = 'APROBADA';
      solicitud.fechaAprobacion = new Date().toISOString();
    }

    this.almacenamiento.actualizar(this.coleccionSolicitudes, solicitudId, solicitud);

    this._dispararEvento('orden-compra-generada', orden);
    console.log(`✅ Orden de compra creada: ${orden.numero}`);
    console.log(`   Proveedor: ${proveedor.razonSocial}`);
    console.log(`   Total: ${window.utilidades.formatearBs(subtotal)} (IVA incluido)`);

    return {
      exito: true,
      mensaje: `Orden ${orden.numero} generada correctamente`,
      orden: guardado,
      errores: []
    };
  }

  // ════════════════════════════════════════════════════════════
  // ETAPA 3: RECEPCIÓN DE MERCADERÍA
  // ════════════════════════════════════════════════════════════

  /**
   * Registra la recepción de mercadería en almacén.
   * Genera una NOTA_ENTRADA (documento fuente) y actualiza el stock.
   *
   * Soporta recepciones parciales: puede recibir menos de lo ordenado.
   *
   * @param {string} ordenId
   * @param {Object} datosRecepcion
   * @param {Array} datosRecepcion.productos - [{productoId, cantidadRecibida}]
   * @param {string} datosRecepcion.recibidoPor - Nombre de quien recibe
   * @param {string} datosRecepcion.observaciones - Notas de recepción
   * @returns {Object}
   */
  registrarRecepcion(ordenId, datosRecepcion) {
    console.log('📦 Registrando recepción de mercadería...');

    const orden = this.almacenamiento.obtenerPorId(this.coleccionOrdenes, ordenId);
    if (!orden) {
      return { exito: false, mensaje: `Orden no encontrada: ${ordenId}` };
    }

    if (orden.estado !== 'ORDENADA' && orden.estado !== 'PARCIALMENTE_RECIBIDA') {
      return { exito: false, mensaje: `La orden no está disponible para recepción (estado: ${orden.estado})` };
    }

    // Validar cantidades recibidas
    const errores = [];
    const productosRecibidos = [];
    let totalRecibidoValor = 0;

    for (const item of datosRecepcion.productos) {
      const productoOrden = orden.productos.find(p => p.productoId === item.productoId);
      if (!productoOrden) {
        errores.push(`Producto ${item.productoId} no está en la orden`);
        continue;
      }

      const cantidadRecibida = parseInt(item.cantidadRecibida, 10);
      const cantidadPendiente = productoOrden.cantidad - productoOrden.cantidadRecibida;

      if (cantidadRecibida <= 0) {
        errores.push(`Cantidad recibida inválida para ${productoOrden.nombre}`);
        continue;
      }

      if (cantidadRecibida > cantidadPendiente) {
        errores.push(
          `${productoOrden.nombre}: cantidad recibida (${cantidadRecibida}) ` +
          `excede lo pendiente (${cantidadPendiente})`
        );
        continue;
      }

      productosRecibidos.push({
        productoId: item.productoId,
        codigo: productoOrden.codigo,
        nombre: productoOrden.nombre,
        cantidadRecibida: cantidadRecibida,
        costoUnitario: productoOrden.precioUnitario,
        subtotal: cantidadRecibida * productoOrden.precioUnitario
      });

      totalRecibidoValor += cantidadRecibida * productoOrden.precioUnitario;
    }

    if (errores.length > 0) {
      return { exito: false, mensaje: 'Errores en la recepción', errores };
    }

    if (productosRecibidos.length === 0) {
      return { exito: false, mensaje: 'No se especificaron productos a recibir', errores: [] };
    }

    // ── Generar documento fuente: NOTA_ENTRADA ──
    const documentoResultado = this.capaDocumentos.registrarDocumento({
      tipo: 'NOTA_ENTRADA',
      numero: `NE-${orden.numero}-${Date.now()}`,
      fechaEmision: new Date().toISOString().split('T')[0],
      montoTotal: totalRecibidoValor,
      observaciones: `Recepción de orden ${orden.numero}. ${datosRecepcion.observaciones || ''}`,
      ordenCompraId: orden.id,
      ordenCompraNumero: orden.numero,
      // ── Campos requeridos por campos-documentos.js ──
      almacen: datosRecepcion.almacen || 'ALMACEN_CENTRAL',
      motivo: 'COMPRA',
      responsable: datosRecepcion.recibidoPor || 'Almacén',
      productos: productosRecibidos
    });

    if (!documentoResultado.exito) {
      return {
        exito: false,
        mensaje: 'Error al registrar documento de recepción',
        errores: documentoResultado.errores
      };
    }

    // ── Actualizar stock y kardex ──
    const erroresStock = [];
    for (const item of productosRecibidos) {
      // Usar módulo de inventario si está disponible
      if (window.moduloInventario) {
        const resultadoKardex = window.moduloInventario.registrarEntrada({
          productoId: item.productoId,
          cantidad: item.cantidadRecibida,
          costoUnitario: item.costoUnitario,
          referencia: `COMPRA_${orden.numero}`,
          motivo: 'COMPRA',
          observaciones: `Recepción de orden ${orden.numero}`
        });

        if (!resultadoKardex.exito) {
          erroresStock.push(`${item.nombre}: ${resultadoKardex.mensaje}`);
        }
      } else {
        // Fallback: actualizar stock directamente
        const resultado = this.catalogoProductos.actualizarStock(
          item.productoId,
          item.cantidadRecibida,
          'COMPRA'
        );

        if (!resultado.exito) {
          erroresStock.push(`${item.nombre}: ${resultado.mensaje}`);
        } else {
          this.catalogoProductos.actualizarCostoUltimo(item.productoId, item.costoUnitario);
        }
      }
    }

    if (erroresStock.length > 0) {
      console.warn('⚠️ Errores al actualizar stock:', erroresStock);
    }

    // ── Actualizar cantidades recibidas en la orden ──
    for (const item of productosRecibidos) {
      const productoOrden = orden.productos.find(p => p.productoId === item.productoId);
      if (productoOrden) {
        productoOrden.cantidadRecibida += item.cantidadRecibida;
      }
    }

    // Determinar nuevo estado de la orden
    const todosRecibidos = orden.productos.every(p => p.cantidadRecibida === p.cantidad);
    const algunoRecibido = orden.productos.some(p => p.cantidadRecibida > 0);

    const nuevoEstado = todosRecibidos ? 'RECIBIDA' : 'PARCIALMENTE_RECIBIDA';

    orden.estado = nuevoEstado;
    orden.fechaRecepcion = new Date().toISOString();
    orden.recibidoPor = datosRecepcion.recibidoPor;

    this.almacenamiento.actualizar(this.coleccionOrdenes, ordenId, orden);

    this._dispararEvento('recepcion-registrada', {
      orden: orden,
      productosRecibidos: productosRecibidos,
      documento: documentoResultado.documento
    });

    console.log(`✅ Recepción registrada: ${productosRecibidos.length} productos`);
    console.log(`   Orden ${orden.numero}: ${nuevoEstado}`);

    return {
      exito: true,
      mensaje: `Recepción registrada. Orden: ${nuevoEstado}`,
      orden: orden,
      productosRecibidos: productosRecibidos,
      documento: documentoResultado.documento,
      errores: erroresStock
    };
  }

  // ════════════════════════════════════════════════════════════
  // ETAPA 4: FACTURA DEL PROVEEDOR
  // ════════════════════════════════════════════════════════════

  /**
   * Registra la factura del proveedor.
   * Genera documento fuente, IVA crédito fiscal y cuenta por pagar.
   *
   * @param {string} ordenId
   * @param {Object} datosFactura
   * @param {string} datosFactura.numeroFactura - Número de la factura del proveedor
   * @param {string} datosFactura.cuf - Código Único de Factura (43 caracteres)
   * @param {string} datosFactura.fechaEmision - Fecha de la factura
   * @param {number} datosFactura.montoTotal - Monto total con IVA incluido
   * @returns {Object}
   */
  registrarFacturaProveedor(ordenId, datosFactura) {
    console.log('🧾 Registrando factura del proveedor...');

    const orden = this.almacenamiento.obtenerPorId(this.coleccionOrdenes, ordenId);
    if (!orden) {
      return { exito: false, mensaje: `Orden no encontrada: ${ordenId}` };
    }

    if (orden.estado !== 'RECIBIDA' && orden.estado !== 'PARCIALMENTE_RECIBIDA') {
      return { exito: false, mensaje: `La orden debe estar recibida para facturar (estado: ${orden.estado})` };
    }

    // Validar proveedor
    const proveedor = this.catalogoProveedores.obtenerPorId(orden.proveedorId);
    if (!proveedor) {
      return { exito: false, mensaje: `Proveedor no encontrado: ${orden.proveedorId}` };
    }

    // ── Generar documento fuente: FACTURA_COMPRA ──
    const documentoResultado = this.capaDocumentos.registrarDocumento({
      tipo: 'FACTURA_COMPRA',
      numero: datosFactura.numeroFactura,
      fechaEmision: datosFactura.fechaEmision,
      montoTotal: datosFactura.montoTotal,
      nitProveedor: proveedor.nit,
      razonSocialProveedor: proveedor.razonSocial,
      cuf: datosFactura.cuf,
      ordenCompraId: orden.id,
      ordenCompraNumero: orden.numero
    });

    if (!documentoResultado.exito) {
      return {
        exito: false,
        mensaje: 'Error al registrar factura',
        errores: documentoResultado.errores
      };
    }

    const documento = documentoResultado.documento;

    // ── Crear cuenta por pagar ──
    const fechaVencimiento = this._calcularFechaVencimiento(
      datosFactura.fechaEmision,
      orden.condicionesPago
    );

    const cuentaPorPagar = {
      id: this._generarId(),
      ordenCompraId: orden.id,
      ordenCompraNumero: orden.numero,
      documentoId: documento.id,
      documentoNumero: documento.numero,
      proveedorId: proveedor.id,
      proveedorNit: proveedor.nit,
      proveedorRazonSocial: proveedor.razonSocial,
      numeroFactura: datosFactura.numeroFactura,
      cuf: datosFactura.cuf,
      fechaEmision: datosFactura.fechaEmision,
      fechaVencimiento: fechaVencimiento,
      montoTotal: datosFactura.montoTotal,
      montoNeto: documento.montoNeto,
      montoIVA: documento.montoIVA,
      montoPagado: 0,
      saldoPendiente: datosFactura.montoTotal,
      estado: 'PENDIENTE', // PENDIENTE, PARCIAL, PAGADA, VENCIDA
      condicionesPago: orden.condicionesPago,
      pagos: [],
      creadoEn: new Date().toISOString()
    };

    const cuentaGuardada = this.almacenamiento.guardar(this.coleccionCuentasPorPagar, cuentaPorPagar);

    // ── Actualizar saldo del proveedor ──
    this.catalogoProveedores.actualizarSaldo(proveedor.id, datosFactura.montoTotal);

    // ── Actualizar orden ──
    orden.estado = 'FACTURADA';
    orden.fechaFactura = new Date().toISOString();
    orden.facturaId = documento.id;
    orden.facturaNumero = datosFactura.numeroFactura;
    orden.cuentaPorPagarId = cuentaGuardada.id;

    this.almacenamiento.actualizar(this.coleccionOrdenes, ordenId, orden);

    this._dispararEvento('factura-proveedor-registrada', {
      orden: orden,
      documento: documento,
      cuentaPorPagar: cuentaGuardada
    });

    console.log(`✅ Factura registrada: ${datosFactura.numeroFactura}`);
    console.log(`   CUF: ${datosFactura.cuf}`);
    console.log(`   Total: ${window.utilidades.formatearBs(datosFactura.montoTotal)}`);
    console.log(`   IVA Crédito Fiscal: ${window.utilidades.formatearBs(documento.montoIVA)}`);
    console.log(`   Vencimiento: ${fechaVencimiento}`);

    return {
      exito: true,
      mensaje: `Factura ${datosFactura.numeroFactura} registrada. Cuenta por pagar creada.`,
      orden: orden,
      documento: documento,
      cuentaPorPagar: cuentaGuardada,
      errores: []
    };
  }

  // ════════════════════════════════════════════════════════════
  // ETAPA 5: PAGO AL PROVEEDOR
  // ════════════════════════════════════════════════════════════

  /**
   * Registra un pago al proveedor (total o parcial).
   *
   * @param {string} cuentaPorPagarId
   * @param {Object} datosPago
   * @param {number} datosPago.monto - Monto a pagar
   * @param {string} datosPago.metodoPago - EFECTIVO, TRANSFERENCIA, CHEQUE
   * @param {string} datosPago.fechaPago - Fecha del pago
   * @param {string} datosPago.referencia - Número de cheque, transferencia, etc.
   * @returns {Object}
   */
  registrarPago(cuentaPorPagarId, datosPago) {
    console.log('💰 Registrando pago a proveedor...');

    const cuenta = this.almacenamiento.obtenerPorId(this.coleccionCuentasPorPagar, cuentaPorPagarId);
    if (!cuenta) {
      return { exito: false, mensaje: `Cuenta por pagar no encontrada: ${cuentaPorPagarId}` };
    }

    if (cuenta.estado === 'PAGADA') {
      return { exito: false, mensaje: 'La cuenta ya está completamente pagada' };
    }

    const monto = parseFloat(datosPago.monto);
    if (monto <= 0) {
      return { exito: false, mensaje: 'El monto del pago debe ser mayor a 0' };
    }

    if (monto > cuenta.saldoPendiente) {
      return {
        exito: false,
        mensaje: `El monto (${window.utilidades.formatearBs(monto)}) excede el saldo pendiente (${window.utilidades.formatearBs(cuenta.saldoPendiente)})`
      };
    }

    // ── Registrar pago en la cuenta ──
    const pago = {
      id: this._generarId(),
      fecha: datosPago.fechaPago || new Date().toISOString().split('T')[0],
      monto: monto,
      metodoPago: datosPago.metodoPago || 'EFECTIVO',
      referencia: datosPago.referencia || '',
      registradoEn: new Date().toISOString()
    };

    cuenta.pagos.push(pago);
    cuenta.montoPagado += monto;
    cuenta.saldoPendiente -= monto;

    if (cuenta.saldoPendiente <= 0.01) {
      cuenta.estado = 'PAGADA';
      cuenta.saldoPendiente = 0;
    } else {
      cuenta.estado = 'PARCIAL';
    }

    this.almacenamiento.actualizar(this.coleccionCuentasPorPagar, cuentaPorPagarId, cuenta);

    // ── Actualizar saldo del proveedor ──
    this.catalogoProveedores.actualizarSaldo(cuenta.proveedorId, -monto);

    // ── Si está completamente pagada, actualizar orden ──
    if (cuenta.estado === 'PAGADA') {
      const orden = this.almacenamiento.obtenerPorId(this.coleccionOrdenes, cuenta.ordenCompraId);
      if (orden) {
        orden.estado = 'PAGADA';
        orden.fechaPago = pago.fecha;
        this.almacenamiento.actualizar(this.coleccionOrdenes, orden.id, orden);
      }
    }

    // ── Generar documento fuente: COMPROBANTE_EGRESO ──
    const documentoResultado = this.capaDocumentos.registrarDocumento({
      tipo: 'COMPROBANTE_EGRESO',
      numero: `EG-${Date.now()}`,
      fechaEmision: pago.fecha,
      montoTotal: monto,
      pagadoA: cuenta.proveedorRazonSocial,
      concepto: `Pago factura ${cuenta.numeroFactura} (${cuenta.ordenCompraNumero})`,
      formaPago: pago.metodoPago,
      cuentaPorPagarId: cuenta.id
    });

    this._dispararEvento('pago-proveedor-registrado', {
      cuenta: cuenta,
      pago: pago,
      documento: documentoResultado.documento
    });

    console.log(`✅ Pago registrado: ${window.utilidades.formatearBs(monto)}`);
    console.log(`   Saldo pendiente: ${window.utilidades.formatearBs(cuenta.saldoPendiente)}`);
    console.log(`   Estado: ${cuenta.estado}`);

    return {
      exito: true,
      mensaje: `Pago de ${window.utilidades.formatearBs(monto)} registrado. ${cuenta.estado === 'PAGADA' ? 'Cuenta saldada.' : `Saldo: ${window.utilidades.formatearBs(cuenta.saldoPendiente)}`}`,
      cuenta: cuenta,
      pago: pago,
      documento: documentoResultado.documento,
      errores: []
    };
  }

  // ════════════════════════════════════════════════════════════
  // CONSULTAS
  // ════════════════════════════════════════════════════════════

  /**
   * Obtiene todas las cuentas por pagar con filtros.
   *
   * @param {Object} filtros
   * @param {string} [filtros.proveedorId]
   * @param {string} [filtros.estado] - PENDIENTE, PARCIAL, PAGADA, VENCIDA
   * @param {number} [filtros.montoMinimo]
   * @param {string} [filtros.vencimientoAntes] - AAAA-MM-DD
   * @returns {Array}
   */
  obtenerCuentasPorPagar(filtros = {}) {
    let cuentas = this.almacenamiento.obtener(this.coleccionCuentasPorPagar);

    if (filtros.proveedorId) {
      cuentas = cuentas.filter(c => c.proveedorId === filtros.proveedorId);
    }

    if (filtros.estado) {
      cuentas = cuentas.filter(c => c.estado === filtros.estado);
    }

    if (filtros.montoMinimo) {
      cuentas = cuentas.filter(c => c.saldoPendiente >= filtros.montoMinimo);
    }

    if (filtros.vencimientoAntes) {
      cuentas = cuentas.filter(c => c.fechaVencimiento <= filtros.vencimientoAntes);
    }

    // Ordenar por fecha de vencimiento ascendente (las que vencen primero primero)
    cuentas.sort((a, b) => {
      if (!a.fechaVencimiento) return 1;
      if (!b.fechaVencimiento) return -1;
      return a.fechaVencimiento.localeCompare(b.fechaVencimiento);
    });

    return cuentas;
  }

  /**
   * Obtiene el total pendiente de pago.
   * @returns {Object} { total, porProveedor }
   */
  obtenerTotalPendiente() {
    const cuentas = this.obtenerCuentasPorPagar({ estado: 'PENDIENTE' });
    const parciales = this.obtenerCuentasPorPagar({ estado: 'PARCIAL' });
    const todas = [...cuentas, ...parciales];

    const total = todas.reduce((sum, c) => sum + c.saldoPendiente, 0);

    const porProveedor = {};
    todas.forEach(c => {
      if (!porProveedor[c.proveedorRazonSocial]) {
        porProveedor[c.proveedorRazonSocial] = 0;
      }
      porProveedor[c.proveedorRazonSocial] += c.saldoPendiente;
    });

    return { total, porProveedor, cantidad: todas.length };
  }

  /**
   * Obtiene el historial de compras de un proveedor.
   * @param {string} proveedorId
   * @returns {Object} { ordenes, totalComprado, cantidadOrdenes }
   */
  obtenerHistorialCompras(proveedorId) {
    const ordenes = this.almacenamiento.obtener(this.coleccionOrdenes)
      .filter(o => o.proveedorId === proveedorId)
      .sort((a, b) => b.fechaOrden.localeCompare(a.fechaOrden));

    const totalComprado = ordenes.reduce((sum, o) => sum + o.montoTotal, 0);

    return {
      ordenes,
      totalComprado,
      cantidadOrdenes: ordenes.length,
      promedioPorOrden: ordenes.length > 0 ? totalComprado / ordenes.length : 0
    };
  }

  /**
   * Obtiene todas las solicitudes de compra.
   * @param {string} [estado] - Filtrar por estado
   * @returns {Array}
   */
  obtenerSolicitudes(estado = null) {
    let solicitudes = this.almacenamiento.obtener(this.coleccionSolicitudes);
    if (estado) {
      solicitudes = solicitudes.filter(s => s.estado === estado);
    }
    return solicitudes.sort((a, b) => b.fechaSolicitud.localeCompare(a.fechaSolicitud));
  }

  /**
   * Obtiene todas las órdenes de compra.
   * @param {string} [estado] - Filtrar por estado
   * @returns {Array}
   */
  obtenerOrdenes(estado = null) {
    let ordenes = this.almacenamiento.obtener(this.coleccionOrdenes);
    if (estado) {
      ordenes = ordenes.filter(o => o.estado === estado);
    }
    return ordenes.sort((a, b) => b.fechaOrden.localeCompare(a.fechaOrden));
  }

  // ════════════════════════════════════════════════════════════
  // MÉTODOS PRIVADOS
  // ════════════════════════════════════════════════════════════

  _generarId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `compra-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  _generarNumeroSolicitud() {
    const solicitudes = this.almacenamiento.obtener(this.coleccionSolicitudes);
    const año = new Date().getFullYear();
    const numero = solicitudes.length + 1;
    return `SOL-${año}-${String(numero).padStart(4, '0')}`;
  }

  _generarNumeroOrden() {
    const ordenes = this.almacenamiento.obtener(this.coleccionOrdenes);
    const año = new Date().getFullYear();
    const numero = ordenes.length + 1;
    return `OC-${año}-${String(numero).padStart(4, '0')}`;
  }

  _calcularFechaVencimiento(fechaEmision, condicionesPago) {
    const fecha = new Date(fechaEmision);
    const dias = {
      'CONTADO': 0,
      'CREDITO_15': 15,
      'CREDITO_30': 30,
      'CREDITO_60': 60,
      'CREDITO_90': 90
    };

    const diasACredito = dias[condicionesPago] || 30;
    fecha.setDate(fecha.getDate() + diasACredito);
    return fecha.toISOString().split('T')[0];
  }

  _validarSolicitud(datos) {
    const errores = [];

    if (!datos.solicitante || datos.solicitante.trim().length === 0) {
      errores.push('El solicitante es requerido');
    }

    if (!datos.departamento || datos.departamento.trim().length === 0) {
      errores.push('El departamento es requerido');
    }

    if (!Array.isArray(datos.productos) || datos.productos.length === 0) {
      errores.push('Debe solicitar al menos un producto');
    } else {
      datos.productos.forEach((p, idx) => {
        if (!p.productoId) {
          errores.push(`Producto ${idx + 1}: ID requerido`);
        }
        if (!p.cantidad || parseInt(p.cantidad, 10) <= 0) {
          errores.push(`Producto ${idx + 1}: cantidad debe ser mayor a 0`);
        }
      });
    }

    return errores;
  }

  _dispararEvento(nombre, datos) {
    const evento = new CustomEvent(`erp:${nombre}`, { detail: datos });
    window.dispatchEvent(evento);
  }
}

// Exponer la clase globalmente
window.ModuloCompras = ModuloCompras;
