// ══════════════════════════════════════════════════════════════
// tipos-documentos.js — ERP Contable Bolivia
// Configuración de los tipos de documentos fuente
// ══════════════════════════════════════════════════════════════

/**
 * Tipos de documentos fuente del ERP.
 *
 * Cada tipo de documento tiene:
 * - codigo: Identificador único en el sistema
 * - nombre: Nombre legible en español
 * - descripcion: Para qué sirve este documento
 * - origen: Quién emite el documento (proveedor, empresa, banco, etc.)
 * - moduloDestino: Qué módulo del ERP procesa este documento
 * - naturalezaContable: "deudora" o "acreedora" (afecta el Debe o Haber)
 * - generaAsiento: Si genera asiento contable directo
 *
 * ⚠️ Esta lista es el "contrato" entre la Capa 1 y el resto del ERP.
 * Si agregas un tipo nuevo, debes actualizar también:
 * - js/config/campos-documentos.js (campos requeridos)
 * - js/capas/capa1-documentos.js (validación)
 * - vistas/documentos.html (formulario)
 */

const TIPOS_DOCUMENTO = {

  // ════════════════════════════════════════════════════════════
  // DOCUMENTOS DE COMPRA (Origen: Proveedor)
  // ════════════════════════════════════════════════════════════

  FACTURA_COMPRA: {
    codigo: 'FACTURA_COMPRA',
    nombre: 'Factura de Compra',
    descripcion: 'Factura emitida por proveedor por compra de bienes o servicios.',
    origen: 'PROVEEDOR',
    moduloDestino: ['COMPRAS', 'INVENTARIO'],
    naturalezaContable: 'deudora',
    generaAsiento: true,
    requiereCUF: true,
    requiereNIT: true,
    icono: '🛒'
  },

  NOTA_CREDITO_RECIBIDA: {
    codigo: 'NOTA_CREDITO_RECIBIDA',
    nombre: 'Nota de Crédito Recibida',
    descripcion: 'Nota de crédito emitida por proveedor (devolución o descuento).',
    origen: 'PROVEEDOR',
    moduloDestino: ['COMPRAS', 'INVENTARIO'],
    naturalezaContable: 'acreedora',
    generaAsiento: true,
    requiereCUF: true,
    requiereNIT: true,
    requiereFacturaOrigen: true,
    icono: '↩️'
  },

  NOTA_DEBITO_RECIBIDA: {
    codigo: 'NOTA_DEBITO_RECIBIDA',
    nombre: 'Nota de Débito Recibida',
    descripcion: 'Nota de débito emitida por proveedor (recargo o ajuste).',
    origen: 'PROVEEDOR',
    moduloDestino: ['COMPRAS'],
    naturalezaContable: 'deudora',
    generaAsiento: true,
    requiereCUF: true,
    requiereNIT: true,
    requiereFacturaOrigen: true,
    icono: '↗️'
  },

  // ════════════════════════════════════════════════════════════
  // DOCUMENTOS DE VENTA (Origen: Empresa)
  // ════════════════════════════════════════════════════════════

  FACTURA_VENTA: {
    codigo: 'FACTURA_VENTA',
    nombre: 'Factura de Venta',
    descripcion: 'Factura emitida por la empresa a cliente por venta.',
    origen: 'EMPRESA',
    moduloDestino: ['VENTAS', 'INVENTARIO'],
    naturalezaContable: 'acreedora',
    generaAsiento: true,
    requiereCUF: true,
    requiereNIT: true,
    generaIT: true,  // Genera IT del 3%
    icono: '💰'
  },

  NOTA_CREDITO_EMITIDA: {
    codigo: 'NOTA_CREDITO_EMITIDA',
    nombre: 'Nota de Crédito Emitida',
    descripcion: 'Nota de crédito emitida a cliente (devolución o descuento).',
    origen: 'EMPRESA',
    moduloDestino: ['VENTAS', 'INVENTARIO'],
    naturalezaContable: 'deudora',
    generaAsiento: true,
    requiereCUF: true,
    requiereNIT: true,
    requiereFacturaOrigen: true,
    icono: '🔄'
  },

  NOTA_DEBITO_EMITIDA: {
    codigo: 'NOTA_DEBITO_EMITIDA',
    nombre: 'Nota de Débito Emitida',
    descripcion: 'Nota de débito emitida a cliente (recargo o ajuste).',
    origen: 'EMPRESA',
    moduloDestino: ['VENTAS'],
    naturalezaContable: 'acreedora',
    generaAsiento: true,
    requiereCUF: true,
    requiereNIT: true,
    requiereFacturaOrigen: true,
    icono: '⬆️'
  },

  // ════════════════════════════════════════════════════════════
  // DOCUMENTOS DE TESORERÍA
  // ════════════════════════════════════════════════════════════

  RECIBO_CAJA: {
    codigo: 'RECIBO_CAJA',
    nombre: 'Recibo de Caja',
    descripcion: 'Ingreso de dinero en efectivo o por transferencia.',
    origen: 'TESORERIA',
    moduloDestino: ['TESORERIA'],
    naturalezaContable: 'deudora',
    generaAsiento: true,
    requiereCUF: false,
    requiereNIT: false,
    icono: '💵'
  },

  COMPROBANTE_EGRESO: {
    codigo: 'COMPROBANTE_EGRESO',
    nombre: 'Comprobante de Egreso',
    descripcion: 'Salida de dinero en efectivo o por transferencia.',
    origen: 'TESORERIA',
    moduloDestino: ['TESORERIA'],
    naturalezaContable: 'acreedora',
    generaAsiento: true,
    requiereCUF: false,
    requiereNIT: false,
    icono: '💸'
  },

  EXTRACTO_BANCARIO: {
    codigo: 'EXTRACTO_BANCARIO',
    nombre: 'Extracto Bancario',
    descripcion: 'Movimientos de cuenta bancaria (cargo o abono).',
    origen: 'BANCO',
    moduloDestino: ['TESORERIA'],
    naturalezaContable: 'mixta',
    generaAsiento: true,
    requiereCUF: false,
    requiereNIT: false,
    icono: '🏦'
  },

  // ════════════════════════════════════════════════════════════
  // DOCUMENTOS DE INVENTARIO
  // ════════════════════════════════════════════════════════════

  NOTA_ENTRADA: {
    codigo: 'NOTA_ENTRADA',
    nombre: 'Nota de Entrada de Almacén',
    descripcion: 'Ingreso físico de mercadería al almacén.',
    origen: 'ALMACEN',
    moduloDestino: ['INVENTARIO'],
    naturalezaContable: 'deudora',
    generaAsiento: false,  // El asiento lo genera la factura de compra
    requiereCUF: false,
    requiereNIT: false,
    requiereProductos: true,
    icono: '📥'
  },

  NOTA_SALIDA: {
    codigo: 'NOTA_SALIDA',
    nombre: 'Nota de Salida de Almacén',
    descripcion: 'Salida física de mercadería del almacén.',
    origen: 'ALMACEN',
    moduloDestino: ['INVENTARIO'],
    naturalezaContable: 'acreedora',
    generaAsiento: false,  // El asiento lo genera la factura de venta
    requiereCUF: false,
    requiereNIT: false,
    requiereProductos: true,
    icono: '📤'
  },

  GUIA_REMISION: {
    codigo: 'GUIA_REMISION',
    nombre: 'Guía de Remisión',
    descripcion: 'Traslado de mercadería entre almacenes o a cliente.',
    origen: 'ALMACEN',
    moduloDestino: ['INVENTARIO', 'VENTAS'],
    naturalezaContable: 'informativa',
    generaAsiento: false,  // Solo mueve inventario, no genera asiento
    requiereCUF: false,
    requiereNIT: false,
    requiereProductos: true,
    icono: '🚚'
  },

  // ════════════════════════════════════════════════════════════
  // DOCUMENTOS DE NÓMINA
  // ════════════════════════════════════════════════════════════

  COMPROBANTE_NOMINA: {
    codigo: 'COMPROBANTE_NOMINA',
    nombre: 'Comprobante de Nómina',
    descripcion: 'Planilla de sueldos y salarios del mes.',
    origen: 'RRHH',
    moduloDestino: ['NOMINA'],
    naturalezaContable: 'deudora',
    generaAsiento: true,
    requiereCUF: false,
    requiereNIT: false,
    requiereEmpleados: true,
    icono: '👥'
  },

  // ════════════════════════════════════════════════════════════
  // DOCUMENTOS DE ACTIVOS FIJOS
  // ════════════════════════════════════════════════════════════

  ACTA_COMPRA_ACTIVO: {
    codigo: 'ACTA_COMPRA_ACTIVO',
    nombre: 'Acta de Compra de Activo Fijo',
    descripcion: 'Adquisición de activo fijo (maquinaria, vehículo, etc.).',
    origen: 'ADMINISTRACION',
    moduloDestino: ['ACTIVOS_FIJOS'],
    naturalezaContable: 'deudora',
    generaAsiento: true,
    requiereCUF: true,  // La factura del proveedor tiene CUF
    requiereNIT: true,
    requiereVidaUtil: true,
    icono: '🏭'
  },

  // ════════════════════════════════════════════════════════════
  // DOCUMENTOS DE RC-IVA (Régimen Complementario)
  // ════════════════════════════════════════════════════════════

  FACTURA_GASTOS_PERSONALES: {
    codigo: 'FACTURA_GASTOS_PERSONALES',
    nombre: 'Factura de Gastos Personales (RC-IVA)',
    descripcion: 'Factura presentada por empleado para compensar RC-IVA.',
    origen: 'EMPLEADO',
    moduloDestino: ['NOMINA', 'IMPUESTOS'],
    naturalezaContable: 'informativa',
    generaAsiento: false,  // No genera asiento, solo compensa RC-IVA
    requiereCUF: true,
    requiereNIT: true,
    requiereEmpleado: true,
    icono: '🧾'
  },

  // ════════════════════════════════════════════════════════════
  // DOCUMENTOS DE RETENCIONES
  // ════════════════════════════════════════════════════════════

  COMPROBANTE_RETENCION: {
    codigo: 'COMPROBANTE_RETENCION',
    nombre: 'Comprobante de Retención',
    descripcion: 'Retención de RC-IVA o IT practicada a proveedor.',
    origen: 'EMPRESA',
    moduloDestino: ['IMPUESTOS'],
    naturalezaContable: 'acreedora',
    generaAsiento: true,
    requiereCUF: false,
    requiereNIT: true,
    requiereProveedor: true,
    icono: '✂️'
  }
};

// ══════════════════════════════════════════════════════════════
// ESTADOS DEL DOCUMENTO
// ══════════════════════════════════════════════════════════════

const ESTADOS_DOCUMENTO = {
  PENDIENTE: {
    codigo: 'PENDIENTE',
    nombre: 'Pendiente',
    descripcion: 'Documento registrado, pendiente de validación.',
    color: 'amarillo'
  },
  VALIDADO: {
    codigo: 'VALIDADO',
    nombre: 'Validado',
    descripcion: 'Documento validado y listo para generar asiento.',
    color: 'verde'
  },
  RECHAZADO: {
    codigo: 'RECHAZADO',
    nombre: 'Rechazado',
    descripcion: 'Documento rechazado por errores de validación.',
    color: 'rojo'
  },
  ANULADO: {
    codigo: 'ANULADO',
    nombre: 'Anulado',
    descripcion: 'Documento anulado después de validación.',
    color: 'gris'
  },
  PROCESADO: {
    codigo: 'PROCESADO',
    nombre: 'Procesado',
    descripcion: 'Documento procesado, asiento contable generado.',
    color: 'azul'
  }
};

// ══════════════════════════════════════════════════════════════
// FUNCIONES AUXILIARES
// ══════════════════════════════════════════════════════════════

const TiposDocumentoUtilidades = {

  /**
   * Obtiene la configuración de un tipo de documento.
   * @param {string} codigo - Código del tipo de documento
   * @returns {Object|null} Configuración o null si no existe
   */
  obtenerTipo(codigo) {
    return TIPOS_DOCUMENTO[codigo] || null;
  },

  /**
   * Lista todos los tipos de documentos disponibles.
   * @returns {Array} Array de tipos con código y nombre
   */
  listarTipos() {
    return Object.values(TIPOS_DOCUMENTO).map(t => ({
      codigo: t.codigo,
      nombre: t.nombre,
      icono: t.icono,
      origen: t.origen
    }));
  },

  /**
   * Lista tipos de documento por origen.
   * @param {string} origen - Origen (PROVEEDOR, EMPRESA, BANCO, etc.)
   * @returns {Array} Tipos filtrados por origen
   */
  listarTiposPorOrigen(origen) {
    return Object.values(TIPOS_DOCUMENTO)
      .filter(t => t.origen === origen)
      .map(t => ({ codigo: t.codigo, nombre: t.nombre, icono: t.icono }));
  },

  /**
   * Verifica si un tipo de documento requiere CUF.
   * @param {string} codigo - Código del tipo
   * @returns {boolean}
   */
  requiereCUF(codigo) {
    const tipo = this.obtenerTipo(codigo);
    return tipo ? tipo.requiereCUF === true : false;
  },

  /**
   * Verifica si un tipo de documento requiere NIT.
   * @param {string} codigo - Código del tipo
   * @returns {boolean}
   */
  requiereNIT(codigo) {
    const tipo = this.obtenerTipo(codigo);
    return tipo ? tipo.requiereNIT === true : false;
  },

  /**
   * Verifica si un tipo de documento genera asiento contable directo.
   * @param {string} codigo - Código del tipo
   * @returns {boolean}
   */
  generaAsiento(codigo) {
    const tipo = this.obtenerTipo(codigo);
    return tipo ? tipo.generaAsiento === true : false;
  },

  /**
   * Verifica si un código de tipo de documento es válido.
   * @param {string} codigo - Código a verificar
   * @returns {boolean}
   */
  tipoExiste(codigo) {
    return TIPOS_DOCUMENTO[codigo] !== undefined;
  }
};
