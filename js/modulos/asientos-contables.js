// ══════════════════════════════════════════════════════════════
// asientos-contables.js — ERP Contable Bolivia
// Generador automático de asientos contables
// ══════════════════════════════════════════════════════════════

/**
 * Generador de Asientos Contables
 *
 * Escucha eventos del sistema y genera automáticamente los asientos
 * correspondientes a cada operación económica.
 *
 * Los asientos se guardan en estado "PENDIENTE" para que el
 * Motor Contable (Módulo 3) los contabilice.
 *
 * @class GeneradorAsientos
 */
class GeneradorAsientos {

  /**
   * @param {Object} deps
   * @param {Object} deps.almacenamiento - Instancia de Almacenamiento
   * @param {Object} deps.planCuentas - Instancia de PlanCuentasUtilidades
   */
  constructor(deps) {
    this.almacenamiento = deps.almacenamiento;
    this.planCuentas = deps.planCuentas;

    this.coleccionAsientos = 'asientos_pendientes';

    // Mapeo de códigos de cuenta (plan contable boliviano típico)
    this.CUENTAS = {
      // Activos
      CAJA: '1.1.01',
      BANCOS: '1.1.02',
      CLIENTES: '1.1.03',
      INVENTARIO: '1.1.05',
      IVA_CREDITO_FISCAL: '1.1.06',

      // Pasivos
      PROVEEDORES: '2.1.01',
      IVA_DEBITO_FISCAL: '2.1.02',
      IT_POR_PAGAR: '2.1.03',

      // Ingresos
      VENTAS: '4.1.01',

      // Costos
      COSTO_VENTAS: '5.1.01',

      // Gastos
      GASTOS_GENERALES: '6.1.01'
    };

    this._registrarEventListeners();

    console.log('📒 Generador de Asientos Contables inicializado.');
  }

  // ════════════════════════════════════════════════════════════
  // REGISTRO DE EVENT LISTENERS
  // ════════════════════════════════════════════════════════════

  _registrarEventListeners() {
    // Compras
    window.addEventListener('erp:factura-proveedor-registrada', (e) => {
      console.log('📒 [EVENTO] Factura de proveedor registrada');
      this.generarAsientoCompra(e.detail);
    });

    window.addEventListener('erp:pago-proveedor-registrado', (e) => {
      console.log('📒 [EVENTO] Pago a proveedor registrado');
      this.generarAsientoPago(e.detail);
    });

    // Ventas
    window.addEventListener('erp:factura-emitida', (e) => {
      console.log('📒 [EVENTO] Factura de venta emitida');
      this.generarAsientoVenta(e.detail);
    });

    window.addEventListener('erp:despacho-registrado', (e) => {
      console.log('📒 [EVENTO] Despacho registrado');
      this.generarAsientoCostoVenta(e.detail);
    });

    window.addEventListener('erp:cobro-registrado', (e) => {
      console.log('📒 [EVENTO] Cobro registrado');
      this.generarAsientoCobro(e.detail);
    });
  }

  // ════════════════════════════════════════════════════════════
  // ASIENTO DE COMPRA
  // ════════════════════════════════════════════════════════════

  /**
   * Genera asiento de compra de mercancía.
   *
   *   Debe: Inventario        (neto)
   *   Debe: IVA Crédito Fiscal (IVA)
   *   Haber: Proveedores      (total)
   *
   * @param {Object} detalle - { orden, documento, cuentaPorPagar }
   */
  generarAsientoCompra(detalle) {
    const { documento, cuentaPorPagar } = detalle;
    if (!documento || !cuentaPorPagar) return;

    const neto = documento.montoNeto || window.BOLIVIA.extraerNetoDeTotal(documento.montoTotal);
    const iva = documento.montoIVA || window.BOLIVIA.calcularIVADeTotal(documento.montoTotal);
    const total = documento.montoTotal;

    const lineas = [
      this._crearLinea(this.CUENTAS.INVENTARIO, 'Inventario de Mercancías', neto, 0),
      this._crearLinea(this.CUENTAS.IVA_CREDITO_FISCAL, 'IVA Crédito Fiscal', iva, 0),
      this._crearLinea(this.CUENTAS.PROVEEDORES, `Proveedores - ${cuentaPorPagar.proveedorRazonSocial}`, 0, total)
    ];

    const asiento = this._construirAsiento({
      fecha: documento.fechaEmision,
      tipo: 'COMPRA',
      documentoFuenteId: documento.id,
      documentoFuenteNumero: documento.numero,
      glosa: `Compra según factura ${cuentaPorPagar.numeroFactura} - ${cuentaPorPagar.proveedorRazonSocial}`,
      lineas: lineas
    });

    return this._guardarAsiento(asiento);
  }

  // ════════════════════════════════════════════════════════════
  // ASIENTO DE PAGO
  // ════════════════════════════════════════════════════════════

  /**
   * Genera asiento de pago al proveedor.
   *
   *   Debe: Proveedores (monto pagado)
   *   Haber: Bancos     (monto pagado)
   *
   * @param {Object} detalle - { cuenta, pago, documento }
   */
  generarAsientoPago(detalle) {
    const { cuenta, pago } = detalle;
    if (!cuenta || !pago) return;

    const lineas = [
      this._crearLinea(this.CUENTAS.PROVEEDORES, `Proveedores - ${cuenta.proveedorRazonSocial}`, pago.monto, 0),
      this._crearLinea(this.CUENTAS.BANCOS, 'Bancos', 0, pago.monto)
    ];

    const asiento = this._construirAsiento({
      fecha: pago.fecha,
      tipo: 'PAGO_PROVEEDOR',
      documentoFuenteId: cuenta.id,
      documentoFuenteNumero: cuenta.numeroFactura,
      glosa: `Pago factura ${cuenta.numeroFactura} - ${cuenta.proveedorRazonSocial} (${pago.metodoPago})`,
      lineas: lineas
    });

    return this._guardarAsiento(asiento);
  }

  // ════════════════════════════════════════════════════════════
  // ASIENTO DE VENTA
  // ════════════════════════════════════════════════════════════

  /**
   * Genera asiento de venta de mercancía.
   *
   *   Debe: Clientes            (total)
   *   Haber: Ventas             (neto)
   *   Haber: IVA Débito Fiscal  (IVA)
   *
   * @param {Object} detalle - { pedido, factura, cuentaPorCobrar }
   */
  generarAsientoVenta(detalle) {
    const { factura, cuentaPorCobrar } = detalle;
    if (!factura || !cuentaPorCobrar) return;

    const total = factura.montoTotal;
    const neto = window.BOLIVIA.extraerNetoDeTotal(total);
    const iva = window.BOLIVIA.calcularIVADeTotal(total);

    const lineas = [
      this._crearLinea(this.CUENTAS.CLIENTES, `Clientes - ${cuentaPorCobrar.clienteNombre}`, total, 0),
      this._crearLinea(this.CUENTAS.VENTAS, 'Ventas de Mercancías', 0, neto),
      this._crearLinea(this.CUENTAS.IVA_DEBITO_FISCAL, 'IVA Débito Fiscal', 0, iva)
    ];

    const asiento = this._construirAsiento({
      fecha: factura.fechaEmision,
      tipo: 'VENTA',
      documentoFuenteId: factura.id,
      documentoFuenteNumero: factura.numero,
      glosa: `Venta según factura ${factura.numero} - ${cuentaPorCobrar.clienteNombre}`,
      lineas: lineas
    });

    return this._guardarAsiento(asiento);
  }

  // ════════════════════════════════════════════════════════════
  // ASIENTO DE COSTO DE VENTAS
  // ════════════════════════════════════════════════════════════

  /**
   * Genera asiento de costo de ventas (al despachar).
   *
   *   Debe: Costo de Ventas     (valor)
   *   Haber: Inventario         (valor)
   *
   * @param {Object} detalle - { pedido, productosDespachados, costoVenta }
   */
  generarAsientoCostoVenta(detalle) {
    const { pedido, costoVenta } = detalle;
    if (!pedido || !costoVenta || costoVenta <= 0) return;

    const lineas = [
      this._crearLinea(this.CUENTAS.COSTO_VENTAS, 'Costo de Ventas', costoVenta, 0),
      this._crearLinea(this.CUENTAS.INVENTARIO, 'Inventario de Mercancías', 0, costoVenta)
    ];

    const asiento = this._construirAsiento({
      fecha: new Date().toISOString().split('T')[0],
      tipo: 'COSTO_VENTA',
      documentoFuenteId: pedido.id,
      documentoFuenteNumero: pedido.numero,
      glosa: `Costo de ventas - Pedido ${pedido.numero} a ${pedido.clienteNombre}`,
      lineas: lineas
    });

    return this._guardarAsiento(asiento);
  }

  // ════════════════════════════════════════════════════════════
  // ASIENTO DE COBRO
  // ════════════════════════════════════════════════════════════

  /**
   * Genera asiento de cobro al cliente.
   *
   *   Debe: Bancos  (monto cobrado)
   *   Haber: Clientes (monto cobrado)
   *
   * @param {Object} detalle - { cuenta, cobro, recibo }
   */
  generarAsientoCobro(detalle) {
    const { cuenta, cobro } = detalle;
    if (!cuenta || !cobro) return;

    const lineas = [
      this._crearLinea(this.CUENTAS.BANCOS, 'Bancos', cobro, 0),
      this._crearLinea(this.CUENTAS.CLIENTES, `Clientes - ${cuenta.clienteNombre}`, 0, cobro)
    ];

    const asiento = this._construirAsiento({
      fecha: new Date().toISOString().split('T')[0],
      tipo: 'COBRO_CLIENTE',
      documentoFuenteId: cuenta.id,
      documentoFuenteNumero: cuenta.facturaNumero,
      glosa: `Cobro factura ${cuenta.facturaNumero} - ${cuenta.clienteNombre}`,
      lineas: lineas
    });

    return this._guardarAsiento(asiento);
  }

  // ════════════════════════════════════════════════════════════
  // MÉTODOS AUXILIARES
  // ════════════════════════════════════════════════════════════

  /**
   * Crea una línea de asiento (Debe o Haber).
   */
  _crearLinea(cuentaCodigo, cuentaNombre, debe, haber) {
    return {
      cuentaCodigo,
      cuentaNombre,
      debe: window.BOLIVIA.redondear2(debe),
      haber: window.BOLIVIA.redondear2(haber)
    };
  }

  /**
   * Construye la estructura del asiento validando partida doble.
   */
  _construirAsiento(datos) {
    const totalDebe = datos.lineas.reduce((sum, l) => sum + l.debe, 0);
    const totalHaber = datos.lineas.reduce((sum, l) => sum + l.haber, 0);
    const diferencia = window.BOLIVIA.redondear2(totalDebe - totalHaber);

    const periodoContable = window.utilidades
      ? window.utilidades.obtenerPeriodoContable(datos.fecha)
      : datos.fecha.slice(0, 7);

    return {
      id: this._generarId(),
      fecha: datos.fecha,
      periodoContable: periodoContable,
      tipo: datos.tipo,
      documentoFuenteId: datos.documentoFuenteId,
      documentoFuenteNumero: datos.documentoFuenteNumero,
      glosa: datos.glosa,
      lineas: datos.lineas,
      totalDebe: window.BOLIVIA.redondear2(totalDebe),
      totalHaber: window.BOLIVIA.redondear2(totalHaber),
      cuadra: Math.abs(diferencia) <= 0.01,
      diferencia: diferencia,
      estado: 'PENDIENTE',
      creadoEn: new Date().toISOString(),
      contabilidadPor: null
    };
  }

  _guardarAsiento(asiento) {
    if (!asiento.cuadra) {
      console.error(`❌ Asiento no cuadra. Diferencia: ${asiento.diferencia}`, asiento);
      return { exito: false, mensaje: 'El asiento no cuadra', asiento };
    }

    const guardado = this.almacenamiento.guardar(this.coleccionAsientos, asiento);

    if (guardado) {
      console.log(`✅ Asiento ${asiento.tipo} generado: ${asiento.id}`);
      console.log(`   Debe: ${window.utilidades.formatearBs(asiento.totalDebe)} | Haber: ${window.utilidades.formatearBs(asiento.totalHaber)}`);
      this._dispararEvento('asiento-generado', asiento);
    }

    return { exito: !!guardado, asiento: guardado };
  }

  _generarId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `asiento-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  _dispararEvento(nombre, datos) {
    const evento = new CustomEvent(`erp:${nombre}`, { detail: datos });
    window.dispatchEvent(evento);
  }

  // ════════════════════════════════════════════════════════════
  // CONSULTAS
  // ════════════════════════════════════════════════════════════

  obtenerAsientos(filtros = {}) {
    let asientos = this.almacenamiento.obtener(this.coleccionAsientos);

    if (filtros.tipo) asientos = asientos.filter(a => a.tipo === filtros.tipo);
    if (filtros.estado) asientos = asientos.filter(a => a.estado === filtros.estado);
    if (filtros.periodoContable) asientos = asientos.filter(a => a.periodoContable === filtros.periodoContable);

    return asientos.sort((a, b) => b.fecha.localeCompare(a.fecha));
  }

  obtenerAsientosPendientes() {
    return this.obtenerAsientos({ estado: 'PENDIENTE' });
  }

  obtenerResumenPorPeriodo(periodoContable) {
    const asientos = this.obtenerAsientos({ periodoContable });

    const totales = {};
    asientos.forEach(a => {
      a.lineas.forEach(l => {
        if (!totales[l.cuentaCodigo]) {
          totales[l.cuentaCodigo] = {
            codigo: l.cuentaCodigo,
            nombre: l.cuentaNombre,
            totalDebe: 0,
            totalHaber: 0
          };
        }
        totales[l.cuentaCodigo].totalDebe += l.debe;
        totales[l.cuentaCodigo].totalHaber += l.haber;
      });
    });

    return {
      periodoContable,
      cantidadAsientos: asientos.length,
      totalesPorCuenta: Object.values(totales)
    };
  }
}

// Exponer globalmente
window.GeneradorAsientos = GeneradorAsientos;