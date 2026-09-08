// ══════════════════════════════════════════════════════════════
// lcv.js — ERP Contable Bolivia
// Libro de Compras y Ventas IVA (Reporte Tributario SIN)
// ══════════════════════════════════════════════════════════════

/**
 * Libro de Compras y Ventas IVA (LCV)
 *
 * Genera el reporte preliminar obligatorio para el SIN.
 * Lista todas las compras y ventas del período con sus impuestos.
 *
 * @class LibroComprasVentas
 */
class LibroComprasVentas {

  /**
   * @param {Object} deps
   * @param {Object} deps.almacenamiento - Instancia de Almacenamiento
   * @param {Object} deps.capaDocumentos - Instancia de CapaDocumentos
   */
  constructor(deps) {
    this.almacenamiento = deps.almacenamiento;
    this.capaDocumentos = deps.capaDocumentos;

    console.log('📋 Libro de Compras y Ventas (LCV) inicializado.');
  }

  // ════════════════════════════════════════════════════════════
  // GENERAR LCV COMPLETO
  // ════════════════════════════════════════════════════════════

  /**
   * Genera el LCV completo para un período contable.
   *
   * @param {string} periodoContable - Formato "AAAA-MM"
   * @returns {Object} { compras, ventas, resumen }
   */
  generarLCV(periodoContable) {
    console.log(`📋 Generando LCV para período: ${periodoContable}`);

    const compras = this._recopilarCompras(periodoContable);
    const ventas = this._recopilarVentas(periodoContable);
    const resumen = this._calcularResumen(compras, ventas);

    return {
      periodoContable,
      compras,
      ventas,
      resumen,
      generadoEn: new Date().toISOString()
    };
  }

  // ════════════════════════════════════════════════════════════
  // RECOPILAR COMPRAS
  // ════════════════════════════════════════════════════════════

  _recopilarCompras(periodoContable) {
    const documentos = this.capaDocumentos.obtenerDocumentos({
      tipo: 'FACTURA_COMPRA',
      periodoContable: periodoContable
    });

    const compras = documentos.map(doc => ({
      numeroFactura: doc.numero,
      cuf: doc.cuf || '',
      fechaEmision: doc.fechaEmision,
      nitProveedor: doc.nitProveedor,
      razonSocialProveedor: doc.razonSocialProveedor,
      montoTotal: doc.montoTotal,
      montoNeto: doc.montoNeto || window.BOLIVIA.extraerNetoDeTotal(doc.montoTotal),
      montoIVA: doc.montoIVA || window.BOLIVIA.calcularIVADeTotal(doc.montoTotal),
      documentoId: doc.id
    }));

    // Ordenar por fecha
    compras.sort((a, b) => a.fechaEmision.localeCompare(b.fechaEmision));

    return {
      registros: compras,
      cantidad: compras.length,
      totalNeto: compras.reduce((sum, c) => sum + c.montoNeto, 0),
      totalIVA: compras.reduce((sum, c) => sum + c.montoIVA, 0),
      totalGeneral: compras.reduce((sum, c) => sum + c.montoTotal, 0)
    };
  }

  // ════════════════════════════════════════════════════════════
  // RECOPILAR VENTAS
  // ════════════════════════════════════════════════════════════

  _recopilarVentas(periodoContable) {
    const documentos = this.capaDocumentos.obtenerDocumentos({
      tipo: 'FACTURA_VENTA',
      periodoContable: periodoContable
    });

    const ventas = documentos.map(doc => ({
      numeroFactura: doc.numero,
      cuf: doc.cuf || '',
      fechaEmision: doc.fechaEmision,
      nitCliente: doc.nitCliente,
      razonSocialCliente: doc.razonSocialCliente,
      montoTotal: doc.montoTotal,
      montoNeto: doc.montoNeto || window.BOLIVIA.extraerNetoDeTotal(doc.montoTotal),
      montoIVA: doc.montoIVA || window.BOLIVIA.calcularIVADeTotal(doc.montoTotal),
      montoIT: window.BOLIVIA.calcularIT(doc.montoTotal),
      documentoId: doc.id
    }));

    // Ordenar por fecha
    ventas.sort((a, b) => a.fechaEmision.localeCompare(b.fechaEmision));

    return {
      registros: ventas,
      cantidad: ventas.length,
      totalNeto: ventas.reduce((sum, v) => sum + v.montoNeto, 0),
      totalIVA: ventas.reduce((sum, v) => sum + v.montoIVA, 0),
      totalIT: ventas.reduce((sum, v) => sum + v.montoIT, 0),
      totalGeneral: ventas.reduce((sum, v) => sum + v.montoTotal, 0)
    };
  }

  // ════════════════════════════════════════════════════════════
  // CALCULAR RESUMEN
  // ════════════════════════════════════════════════════════════

  _calcularResumen(compras, ventas) {
    const ivaDebito = ventas.totalIVA;
    const ivaCredito = compras.totalIVA;
    const ivaPorPagar = window.BOLIVIA.redondear2(ivaDebito - ivaCredito);
    const itPorPagar = ventas.totalIT;

    return {
      ivaDebito: ivaDebito,
      ivaCredito: ivaCredito,
      ivaPorPagar: ivaPorPagar,
      itPorPagar: itPorPagar,
      saldoAFavor: ivaPorPagar < 0,
      descripcion: ivaPorPagar >= 0
        ? `IVA a pagar: ${window.utilidades.formatearBs(ivaPorPagar)}`
        : `Saldo a favor: ${window.utilidades.formatearBs(Math.abs(ivaPorPagar))}`
    };
  }

  // ════════════════════════════════════════════════════════════
  // CONSULTAS AUXILIARES
  // ════════════════════════════════════════════════════════════

  /**
   * Calcula el IVA por pagar de un período.
   * @param {string} periodoContable
   * @returns {Object}
   */
  calcularIVAPorPagar(periodoContable) {
    const lcv = this.generarLCV(periodoContable);
    return lcv.resumen;
  }

  /**
   * Obtiene la lista de períodos con movimientos.
   * @returns {Array} Lista de períodos en formato "AAAA-MM"
   */
  obtenerPeriodosConMovimientos() {
    const documentos = this.capaDocumentos.obtenerDocumentos();
    const periodos = new Set();

    documentos.forEach(doc => {
      if (doc.periodoContable) {
        periodos.add(doc.periodoContable);
      }
    });

    return Array.from(periodos).sort((a, b) => b.localeCompare(a));
  }

  /**
   * Exporta el LCV a formato CSV.
   * @param {string} periodoContable
   * @returns {string} Contenido CSV
   */
  exportarCSV(periodoContable) {
    const lcv = this.generarLCV(periodoContable);

    let csv = `LIBRO DE COMPRAS Y VENTAS IVA - ${periodoContable}\n\n`;

    // Compras
    csv += 'COMPRAS\n';
    csv += 'NIT Proveedor,Razón Social,N° Factura,CUF,Fecha,Total Bs,Neto Bs,IVA Bs\n';
    lcv.compras.registros.forEach(c => {
      csv += `"${c.nitProveedor}","${c.razonSocialProveedor}","${c.numeroFactura}","${c.cuf}","${c.fechaEmision}",${c.montoTotal.toFixed(2)},${c.montoNeto.toFixed(2)},${c.montoIVA.toFixed(2)}\n`;
    });
    csv += `,,,,"TOTAL COMPRAS",${lcv.compras.totalGeneral.toFixed(2)},${lcv.compras.totalNeto.toFixed(2)},${lcv.compras.totalIVA.toFixed(2)}\n\n`;

    // Ventas
    csv += 'VENTAS\n';
    csv += 'NIT Cliente,Razón Social,N° Factura,CUF,Fecha,Total Bs,Neto Bs,IVA Bs,IT Bs\n';
    lcv.ventas.registros.forEach(v => {
      csv += `"${v.nitCliente}","${v.razonSocialCliente}","${v.numeroFactura}","${v.cuf}","${v.fechaEmision}",${v.montoTotal.toFixed(2)},${v.montoNeto.toFixed(2)},${v.montoIVA.toFixed(2)},${v.montoIT.toFixed(2)}\n`;
    });
    csv += `,,,,"TOTAL VENTAS",${lcv.ventas.totalGeneral.toFixed(2)},${lcv.ventas.totalNeto.toFixed(2)},${lcv.ventas.totalIVA.toFixed(2)},${lcv.ventas.totalIT.toFixed(2)}\n\n`;

    // Resumen
    csv += 'RESUMEN DEL PERÍODO\n';
    csv += `IVA Débito (ventas),${lcv.resumen.ivaDebito.toFixed(2)}\n`;
    csv += `IVA Crédito (compras),${lcv.resumen.ivaCredito.toFixed(2)}\n`;
    csv += `IVA por Pagar,${lcv.resumen.ivaPorPagar.toFixed(2)}\n`;
    csv += `IT por Pagar,${lcv.resumen.itPorPagar.toFixed(2)}\n`;

    return csv;
  }
}

// Exponer globalmente
window.LibroComprasVentas = LibroComprasVentas;
