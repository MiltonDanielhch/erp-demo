// ══════════════════════════════════════════════════════════════
// campos-documentos.js — ERP Contable Bolivia
// Definición de campos requeridos por tipo de documento
// ══════════════════════════════════════════════════════════════

/**
 * Campos requeridos por tipo de documento.
 *
 * Cada tipo tiene:
 * - camposBase: Campos que TODOS los documentos tienen
 * - camposEspecificos: Campos únicos de ese tipo
 * - validaciones: Funciones de validación específicas
 *
 * Uso:
 *   const campos = CAMPOS_DOCUMENTO['FACTURA_COMPRA'];
 *   campos.camposEspecificos.forEach(campo => { ... });
 */

// Campos base que TODOS los documentos tienen
const CAMPOS_BASE = [
  { nombre: 'id', tipo: 'string', requerido: false, autoGenerado: true },
  { nombre: 'tipo', tipo: 'string', requerido: true },
  { nombre: 'numero', tipo: 'string', requerido: true },
  { nombre: 'fechaEmision', tipo: 'date', requerido: true },
  { nombre: 'fechaRegistro', tipo: 'datetime', requerido: false, autoGenerado: true },
  { nombre: 'periodoContable', tipo: 'string', requerido: false, autoGenerado: true },
  { nombre: 'montoTotal', tipo: 'number', requerido: true, minimo: 0.01 },
  { nombre: 'estado', tipo: 'string', requerido: false, default: 'PENDIENTE' },
  { nombre: 'observaciones', tipo: 'string', requerido: false, maxLongitud: 500 },
  { nombre: 'creadoPor', tipo: 'string', requerido: false, autoGenerado: true },
  { nombre: 'creadoEn', tipo: 'datetime', requerido: false, autoGenerado: true }
];

// Campos específicos por tipo de documento
const CAMPOS_DOCUMENTO = {

  FACTURA_COMPRA: {
    camposEspecificos: [
      { nombre: 'nitProveedor', tipo: 'string', requerido: true, validacion: 'NIT' },
      { nombre: 'razonSocialProveedor', tipo: 'string', requerido: true, maxLongitud: 100 },
      { nombre: 'cuf', tipo: 'string', requerido: true, longitud: 43, validacion: 'CUF' },
      { nombre: 'numeroAutorizacion', tipo: 'string', requerido: false, maxLongitud: 20 },
      { nombre: 'montoNeto', tipo: 'number', requerido: false, calculado: true },
      { nombre: 'montoIVA', tipo: 'number', requerido: false, calculado: true },
      { nombre: 'controlInterno', tipo: 'string', requerido: false, maxLongitud: 20 },
      { nombre: 'fechaLimitePago', tipo: 'date', requerido: false },
      { nombre: 'productos', tipo: 'array', requerido: false,
        estructura: { codigo: 'string', nombre: 'string', cantidad: 'number',
                      costoUnitario: 'number', subtotal: 'number' } }
    ],
    validaciones: ['validarCUFUnico', 'validarNITValido', 'validarIVACorrecto'],
    calculosAutomaticos: ['montoNeto', 'montoIVA', 'periodoContable']
  },

  FACTURA_VENTA: {
    camposEspecificos: [
      { nombre: 'nitCliente', tipo: 'string', requerido: true, validacion: 'NIT' },
      { nombre: 'razonSocialCliente', tipo: 'string', requerido: true, maxLongitud: 100 },
      { nombre: 'cuf', tipo: 'string', requerido: true, longitud: 43, validacion: 'CUF' },
      { nombre: 'numeroAutorizacion', tipo: 'string', requerido: false, maxLongitud: 20 },
      { nombre: 'montoNeto', tipo: 'number', requerido: false, calculado: true },
      { nombre: 'montoIVA', tipo: 'number', requerido: false, calculado: true },
      { nombre: 'montoIT', tipo: 'number', requerido: false, calculado: true },
      { nombre: 'formaPago', tipo: 'string', requerido: false,
        valoresPermitidos: ['CONTADO', 'CREDITO', 'TRANSFERENCIA', 'TARJETA'] },
      { nombre: 'productos', tipo: 'array', requerido: false,
        estructura: { codigo: 'string', nombre: 'string', cantidad: 'number',
                      precioUnitario: 'number', subtotal: 'number' } }
    ],
    validaciones: ['validarCUFUnico', 'validarNITValido', 'validarIVACorrecto', 'validarITCorrecto'],
    calculosAutomaticos: ['montoNeto', 'montoIVA', 'montoIT', 'periodoContable']
  },

  NOTA_CREDITO_RECIBIDA: {
    camposEspecificos: [
      { nombre: 'nitProveedor', tipo: 'string', requerido: true, validacion: 'NIT' },
      { nombre: 'razonSocialProveedor', tipo: 'string', requerido: true, maxLongitud: 100 },
      { nombre: 'cuf', tipo: 'string', requerido: true, longitud: 43, validacion: 'CUF' },
      { nombre: 'facturaOrigenId', tipo: 'string', requerido: true,
        descripcion: 'ID de la factura de compra a la que anula' },
      { nombre: 'facturaOrigenNumero', tipo: 'string', requerido: true },
      { nombre: 'motivo', tipo: 'string', requerido: true, maxLongitud: 200 },
      { nombre: 'montoNeto', tipo: 'number', requerido: false, calculado: true },
      { nombre: 'montoIVA', tipo: 'number', requerido: false, calculado: true }
    ],
    validaciones: ['validarCUFUnico', 'validarFacturaOrigenExiste'],
    calculosAutomaticos: ['montoNeto', 'montoIVA', 'periodoContable']
  },

  NOTA_DEBITO_RECIBIDA: {
    camposEspecificos: [
      { nombre: 'nitProveedor', tipo: 'string', requerido: true, validacion: 'NIT' },
      { nombre: 'razonSocialProveedor', tipo: 'string', requerido: true, maxLongitud: 100 },
      { nombre: 'cuf', tipo: 'string', requerido: true, longitud: 43, validacion: 'CUF' },
      { nombre: 'facturaOrigenId', tipo: 'string', requerido: true },
      { nombre: 'facturaOrigenNumero', tipo: 'string', requerido: true },
      { nombre: 'motivo', tipo: 'string', requerido: true, maxLongitud: 200 },
      { nombre: 'montoNeto', tipo: 'number', requerido: false, calculado: true },
      { nombre: 'montoIVA', tipo: 'number', requerido: false, calculado: true }
    ],
    validaciones: ['validarCUFUnico', 'validarFacturaOrigenExiste'],
    calculosAutomaticos: ['montoNeto', 'montoIVA', 'periodoContable']
  },

  NOTA_CREDITO_EMITIDA: {
    camposEspecificos: [
      { nombre: 'nitCliente', tipo: 'string', requerido: true, validacion: 'NIT' },
      { nombre: 'razonSocialCliente', tipo: 'string', requerido: true, maxLongitud: 100 },
      { nombre: 'cuf', tipo: 'string', requerido: true, longitud: 43, validacion: 'CUF' },
      { nombre: 'facturaOrigenId', tipo: 'string', requerido: true },
      { nombre: 'facturaOrigenNumero', tipo: 'string', requerido: true },
      { nombre: 'motivo', tipo: 'string', requerido: true, maxLongitud: 200 },
      { nombre: 'montoNeto', tipo: 'number', requerido: false, calculado: true },
      { nombre: 'montoIVA', tipo: 'number', requerido: false, calculado: true },
      { nombre: 'montoIT', tipo: 'number', requerido: false, calculado: true }
    ],
    validaciones: ['validarCUFUnico', 'validarFacturaOrigenExiste'],
    calculosAutomaticos: ['montoNeto', 'montoIVA', 'montoIT', 'periodoContable']
  },

  NOTA_DEBITO_EMITIDA: {
    camposEspecificos: [
      { nombre: 'nitCliente', tipo: 'string', requerido: true, validacion: 'NIT' },
      { nombre: 'razonSocialCliente', tipo: 'string', requerido: true, maxLongitud: 100 },
      { nombre: 'cuf', tipo: 'string', requerido: true, longitud: 43, validacion: 'CUF' },
      { nombre: 'facturaOrigenId', tipo: 'string', requerido: true },
      { nombre: 'facturaOrigenNumero', tipo: 'string', requerido: true },
      { nombre: 'motivo', tipo: 'string', requerido: true, maxLongitud: 200 },
      { nombre: 'montoNeto', tipo: 'number', requerido: false, calculado: true },
      { nombre: 'montoIVA', tipo: 'number', requerido: false, calculado: true },
      { nombre: 'montoIT', tipo: 'number', requerido: false, calculado: true }
    ],
    validaciones: ['validarCUFUnico', 'validarFacturaOrigenExiste'],
    calculosAutomaticos: ['montoNeto', 'montoIVA', 'montoIT', 'periodoContable']
  },

  RECIBO_CAJA: {
    camposEspecificos: [
      { nombre: 'recibidoDe', tipo: 'string', requerido: true, maxLongitud: 100 },
      { nombre: 'nitRecibidoDe', tipo: 'string', requerido: false, validacion: 'NIT' },
      { nombre: 'concepto', tipo: 'string', requerido: true, maxLongitud: 200 },
      { nombre: 'formaPago', tipo: 'string', requerido: true,
        valoresPermitidos: ['EFECTIVO', 'CHEQUE', 'TRANSFERENCIA', 'TARJETA'] },
      { nombre: 'cuentaBancaria', tipo: 'string', requerido: false },
      { nombre: 'referenciaFacturaId', tipo: 'string', requerido: false,
        descripcion: 'Si es cobro de una factura, ID de la factura' },
      { nombre: 'moneda', tipo: 'string', requerido: false, default: 'BOB' }
    ],
    validaciones: ['validarNumeroCorrelativo'],
    calculosAutomaticos: ['periodoContable']
  },

  COMPROBANTE_EGRESO: {
    camposEspecificos: [
      { nombre: 'pagadoA', tipo: 'string', requerido: true, maxLongitud: 100 },
      { nombre: 'nitPagadoA', tipo: 'string', requerido: false, validacion: 'NIT' },
      { nombre: 'concepto', tipo: 'string', requerido: true, maxLongitud: 200 },
      { nombre: 'formaPago', tipo: 'string', requerido: true,
        valoresPermitidos: ['EFECTIVO', 'CHEQUE', 'TRANSFERENCIA', 'TARJETA'] },
      { nombre: 'cuentaBancaria', tipo: 'string', requerido: false },
      { nombre: 'referenciaFacturaId', tipo: 'string', requerido: false },
      { nombre: 'moneda', tipo: 'string', requerido: false, default: 'BOB' }
    ],
    validaciones: ['validarNumeroCorrelativo', 'validarAutorizacion'],
    calculosAutomaticos: ['periodoContable']
  },

  EXTRACTO_BANCARIO: {
    camposEspecificos: [
      { nombre: 'banco', tipo: 'string', requerido: true, maxLongitud: 50 },
      { nombre: 'cuentaBancaria', tipo: 'string', requerido: true },
      { nombre: 'tipoMovimiento', tipo: 'string', requerido: true,
        valoresPermitidos: ['CARGO', 'ABONO', 'COMISION', 'INTERES'] },
      { nombre: 'concepto', tipo: 'string', requerido: true, maxLongitud: 200 },
      { nombre: 'referenciaBancaria', tipo: 'string', requerido: false },
      { nombre: 'saldoAnterior', tipo: 'number', requerido: false },
      { nombre: 'saldoPosterior', tipo: 'number', requerido: false }
    ],
    validaciones: ['validarConciliacion'],
    calculosAutomaticos: ['periodoContable']
  },

  NOTA_ENTRADA: {
    camposEspecificos: [
      { nombre: 'almacen', tipo: 'string', requerido: true },
      { nombre: 'motivo', tipo: 'string', requerido: true,
        valoresPermitidos: ['COMPRA_PROVEEDOR', 'DEVOLUCION_CLIENTE', 'AJUSTE_INVENTARIO', 'PRODUCCION'] },
      { nombre: 'referenciaDocumentoId', tipo: 'string', requerido: false,
        descripcion: 'ID de la factura de compra o documento origen' },
      { nombre: 'productos', tipo: 'array', requerido: true,
        estructura: { productoId: 'string', codigo: 'string', nombre: 'string',
                      cantidad: 'number', costoUnitario: 'number', lote: 'string' } },
      { nombre: 'responsable', tipo: 'string', requerido: true }
    ],
    validaciones: ['validarProductosExistentes', 'validarCantidadPositiva'],
    calculosAutomaticos: ['periodoContable']
  },

  NOTA_SALIDA: {
    camposEspecificos: [
      { nombre: 'almacen', tipo: 'string', requerido: true },
      { nombre: 'motivo', tipo: 'string', requerido: true,
        valoresPermitidos: ['VENTA_CLIENTE', 'DEVOLUCION_PROVEEDOR', 'MERMA', 'AJUSTE_INVENTARIO'] },
      { nombre: 'referenciaDocumentoId', tipo: 'string', requerido: false },
      { nombre: 'productos', tipo: 'array', requerido: true,
        estructura: { productoId: 'string', codigo: 'string', nombre: 'string',
                      cantidad: 'number', costoUnitario: 'number', lote: 'string' } },
      { nombre: 'responsable', tipo: 'string', requerido: true }
    ],
    validaciones: ['validarProductosExistentes', 'validarStockSuficiente', 'validarCantidadPositiva'],
    calculosAutomaticos: ['periodoContable']
  },

  GUIA_REMISION: {
    camposEspecificos: [
      { nombre: 'almacenOrigen', tipo: 'string', requerido: true },
      { nombre: 'almacenDestino', tipo: 'string', requerido: true },
      { nombre: 'motivo', tipo: 'string', requerido: true,
        valoresPermitidos: ['TRASLADO_INTERNO', 'ENTREGA_CLIENTE', 'EXPOSICION'] },
      { nombre: 'transportista', tipo: 'string', requerido: false },
      { nombre: 'placaVehiculo', tipo: 'string', requerido: false },
      { nombre: 'productos', tipo: 'array', requerido: true,
        estructura: { productoId: 'string', codigo: 'string', nombre: 'string', cantidad: 'number' } },
      { nombre: 'responsable', tipo: 'string', requerido: true }
    ],
    validaciones: ['validarAlmacenesDistintos', 'validarStockSuficiente'],
    calculosAutomaticos: ['periodoContable']
  },

  COMPROBANTE_NOMINA: {
    camposEspecificos: [
      { nombre: 'periodoNomina', tipo: 'string', requerido: true, formato: 'AAAA-MM' },
      { nombre: 'empleados', tipo: 'array', requerido: true,
        estructura: { empleadoId: 'string', nombres: 'string', apellidos: 'string',
                      salarioBase: 'number', bonoAntiguedad: 'number',
                      horasExtras: 'number', totalDevengado: 'number',
                      aporteAFP: 'number', rcIVA: 'number', totalDeducciones: 'number',
                      netoPagado: 'number' } },
      { nombre: 'totalDevengado', tipo: 'number', requerido: false, calculado: true },
      { nombre: 'totalDeducciones', tipo: 'number', requerido: false, calculado: true },
      { nombre: 'totalPatronal', tipo: 'number', requerido: false, calculado: true },
      { nombre: 'netoPagado', tipo: 'number', requerido: false, calculado: true },
      { nombre: 'formaPago', tipo: 'string', requerido: true,
        valoresPermitidos: ['TRANSFERENCIA', 'EFECTIVO', 'CHEQUE'] },
      { nombre: 'cuentaBancaria', tipo: 'string', requerido: false }
    ],
    validaciones: ['validarEmpleadosActivos', 'validarCalculosNominados'],
    calculosAutomaticos: ['totalDevengado', 'totalDeducciones', 'netoPagado', 'periodoContable']
  },

  ACTA_COMPRA_ACTIVO: {
    camposEspecificos: [
      { nombre: 'codigoActivo', tipo: 'string', requerido: true },
      { nombre: 'descripcionActivo', tipo: 'string', requerido: true, maxLongitud: 200 },
      { nombre: 'categoriaActivo', tipo: 'string', requerido: true,
        valoresPermitidos: ['MAQUINARIA', 'VEHICULO', 'MUEBLES', 'EQUIPO_COMPUTO', 'EDIFICIO', 'TERRENO'] },
      { nombre: 'nitProveedor', tipo: 'string', requerido: true, validacion: 'NIT' },
      { nombre: 'razonSocialProveedor', tipo: 'string', requerido: true },
      { nombre: 'cufFactura', tipo: 'string', requerido: true, longitud: 43, validacion: 'CUF' },
      { nombre: 'vidaUtilMeses', tipo: 'number', requerido: true, minimo: 1 },
      { nombre: 'valorResidual', tipo: 'number', requerido: false, default: 0 },
      { nombre: 'metodoDepreciacion', tipo: 'string', requerido: true,
        valoresPermitidos: ['LINEA_RECTA', 'UNIDADES_PRODUCCION'] },
      { nombre: 'ubicacion', tipo: 'string', requerido: false }
    ],
    validaciones: ['validarCUFUnico', 'validarCodigoActivoUnico', 'validarVidaUtilValida'],
    calculosAutomaticos: ['periodoContable', 'depreciacionMensual']
  },

  FACTURA_GASTOS_PERSONALES: {
    camposEspecificos: [
      { nombre: 'empleadoId', tipo: 'string', requerido: true },
      { nombre: 'nombresEmpleado', tipo: 'string', requerido: true },
      { nombre: 'periodoNomina', tipo: 'string', requerido: true, formato: 'AAAA-MM' },
      { nombre: 'nitEmisor', tipo: 'string', requerido: true, validacion: 'NIT' },
      { nombre: 'razonSocialEmisor', tipo: 'string', requerido: true },
      { nombre: 'cuf', tipo: 'string', requerido: true, longitud: 43, validacion: 'CUF' },
      { nombre: 'montoNeto', tipo: 'number', requerido: false, calculado: true },
      { nombre: 'montoIVA', tipo: 'number', requerido: false, calculado: true },
      { nombre: 'categoriaGasto', tipo: 'string', requerido: true,
        valoresPermitidos: ['ALIMENTACION', 'SALUD', 'EDUCACION', 'VIVIENDA', 'VESTIMENTA', 'OTROS'] }
    ],
    validaciones: ['validarCUFUnico', 'validarEmpleadoActivo', 'validarMontoIVACorrecto'],
    calculosAutomaticos: ['montoNeto', 'montoIVA', 'periodoContable']
  },

  COMPROBANTE_RETENCION: {
    camposEspecificos: [
      { nombre: 'nitProveedor', tipo: 'string', requerido: true, validacion: 'NIT' },
      { nombre: 'razonSocialProveedor', tipo: 'string', requerido: true },
      { nombre: 'facturaOrigenId', tipo: 'string', requerido: true },
      { nombre: 'facturaOrigenNumero', tipo: 'string', requerido: true },
      { nombre: 'tipoRetencion', tipo: 'string', requerido: true,
        valoresPermitidos: ['RC_IVA', 'IT', 'IUE_BE'] },
      { nombre: 'porcentajeRetencion', tipo: 'number', requerido: true },
      { nombre: 'baseImponible', tipo: 'number', requerido: true },
      { nombre: 'montoRetenido', tipo: 'number', requerido: false, calculado: true },
      { nombre: 'periodoRetencion', tipo: 'string', requerido: true, formato: 'AAAA-MM' }
    ],
    validaciones: ['validarFacturaOrigenExiste', 'validarPorcentajeValido'],
    calculosAutomaticos: ['montoRetenido', 'periodoContable']
  }
};

// ══════════════════════════════════════════════════════════════
// FUNCIONES AUXILIARES
// ══════════════════════════════════════════════════════════════

const CamposDocumentoUtilidades = {

  /**
   * Obtiene todos los campos (base + específicos) de un tipo de documento.
   * @param {string} tipo - Código del tipo de documento
   * @returns {Array} Lista de campos
   */
  obtenerTodosLosCampos(tipo) {
    const config = CAMPOS_DOCUMENTO[tipo];
    if (!config) return [...CAMPOS_BASE];
    return [...CAMPOS_BASE, ...config.camposEspecificos];
  },

  /**
   * Obtiene solo los campos requeridos de un tipo de documento.
   * @param {string} tipo - Código del tipo de documento
   * @returns {Array} Lista de campos requeridos
   */
  obtenerCamposRequeridos(tipo) {
    return this.obtenerTodosLosCampos(tipo).filter(c => c.requerido === true);
  },

  /**
   * Obtiene los campos calculados automáticamente.
   * @param {string} tipo - Código del tipo de documento
   * @returns {Array} Lista de nombres de campos calculados
   */
  obtenerCamposCalculados(tipo) {
    const config = CAMPOS_DOCUMENTO[tipo];
    return config ? config.calculosAutomaticos || [] : [];
  },

  /**
   * Obtiene las validaciones específicas de un tipo.
   * @param {string} tipo - Código del tipo de documento
   * @returns {Array} Lista de nombres de validaciones
   */
  obtenerValidaciones(tipo) {
    const config = CAMPOS_DOCUMENTO[tipo];
    return config ? config.validaciones || [] : [];
  },

  /**
   * Valida que un objeto documento tenga todos los campos requeridos.
   * @param {string} tipo - Tipo de documento
   * @param {Object} datos - Datos del documento
   * @returns {Object} { valido, errores }
   */
  validarCamposRequeridos(tipo, datos) {
    const requeridos = this.obtenerCamposRequeridos(tipo);
    const errores = [];

    requeridos.forEach(campo => {
      if (campo.autoGenerado) return;  // No validar campos auto-generados
      const valor = datos[campo.nombre];
      if (valor === undefined || valor === null || valor === '') {
        errores.push(`Campo requerido faltante: ${campo.nombre}`);
      }
    });

    return {
      valido: errores.length === 0,
      errores
    };
  }
};
