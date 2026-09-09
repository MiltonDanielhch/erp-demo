// ══════════════════════════════════════════════════════════════
// impuestos.js — Módulo de Impuestos Bolivianos (Módulo 5)
// ══════════════════════════════════════════════════════════════

/**
 * Módulo de Impuestos Bolivianos.
 *
 * Gestiona la liquidación de los impuestos principales según Ley 843:
 *   - IVA (13%): débito/crédito fiscal, Form. 200
 *   - IT (3%): sobre ingresos brutos, Form. 400
 *   - IUE (25%): sobre utilidad imponible, Form. 500
 *   - RC-IVA (13%): compensable con facturas
 *   - IUE-BE (12.5%): beneficiarios del exterior
 *
 * ⚠️ PARTICULARIDAD BOLIVIANA:
 * El IVA está INCLUIDO en el precio (Art. 5 Ley 843).
 * Para extraer el IVA: IVA = Total - (Total / 1.13)
 *   equivalencia: IVA = Total × (13/113)
 *
 * ⚠️ SALDO A FAVOR:
 * Si el crédito fiscal supera al débito fiscal, el exceso
 * se ARRASTRA al mes siguiente. NO se devuelve en efectivo.
 */
class ModuloImpuestos {

  constructor(deps) {
    this.almacenamiento = deps.almacenamiento;
    this.capaDocumentos = deps.capaDocumentos;
    this.periodosFiscales = deps.periodosFiscales;

    // Clave para almacenar saldo a favor acumulado
    this.KEY_SALDO_FAVOR = 'iva_saldo_favor_acumulado';

    // Porcentaje IVA
    this.PORCENTAJE_IVA = (window.BOLIVIA && window.BOLIVIA.IVA_PORCENTAJE) || 0.13;

    // Inicializar saldo a favor si no existe
    if (!localStorage.getItem(this.KEY_SALDO_FAVOR)) {
      localStorage.setItem(this.KEY_SALDO_FAVOR, '0');
    }

    console.log('🧾 Módulo de Impuestos inicializado.');
  }

  // ══════════════════════════════════════════════════════════
  // OBTENCIÓN DE DOCUMENTOS DEL PERÍODO
  // ══════════════════════════════════════════════════════════

  /**
   * Obtiene todas las VENTAS (facturas emitidas) del período.
   *
   * @param {string} periodo - Formato "AAAA-MM"
   * @returns {Array} Lista de documentos de venta
   */
  obtenerVentasDelPeriodo(periodo) {
    if (!this.capaDocumentos) return [];

    const todosDocs = this.capaDocumentos.obtenerDocumentos() || [];
    const [anio, mes] = periodo.split('-').map(Number);

    return todosDocs.filter(doc => {
      // Filtrar por tipo de documento de venta
      const esVenta = doc.tipoDocumento === 'FACTURA_VENTA' ||
                      doc.tipoDocumento === 'NOTA_VENTA' ||
                      (doc.tipoDocumento && doc.tipoDocumento.includes('VENTA'));

      if (!esVenta) return false;

      // Filtrar por fecha dentro del período
      if (!doc.fecha) return false;
      const fechaDoc = new Date(doc.fecha);
      return fechaDoc.getFullYear() === anio && (fechaDoc.getMonth() + 1) === mes;
    });
  }

  /**
   * Obtiene todas las COMPRAS (facturas recibidas) del período.
   *
   * @param {string} periodo - Formato "AAAA-MM"
   * @returns {Array} Lista de documentos de compra
   */
  obtenerComprasDelPeriodo(periodo) {
    if (!this.capaDocumentos) return [];

    const todosDocs = this.capaDocumentos.obtenerDocumentos() || [];
    const [anio, mes] = periodo.split('-').map(Number);

    return todosDocs.filter(doc => {
      // Filtrar por tipo de documento de compra
      const esCompra = doc.tipoDocumento === 'FACTURA_COMPRA' ||
                       doc.tipoDocumento === 'NOTA_COMPRA' ||
                       (doc.tipoDocumento && doc.tipoDocumento.includes('COMPRA'));

      if (!esCompra) return false;

      // Filtrar por fecha dentro del período
      if (!doc.fecha) return false;
      const fechaDoc = new Date(doc.fecha);
      return fechaDoc.getFullYear() === anio && (fechaDoc.getMonth() + 1) === mes;
    });
  }

  // ══════════════════════════════════════════════════════════
  // CÁLCULO DE IVA DÉBITO FISCAL
  // ══════════════════════════════════════════════════════════

  /**
   * Calcula el IVA Débito Fiscal (de las VENTAS) del período.
   *
   * Fórmula boliviana (IVA incluido en precio):
   *   IVA = Total - (Total / 1.13) = Total × (13/113)
   *
   * @param {string} periodo - Formato "AAAA-MM"
   * @returns {Object} { totalVentas, totalNeto, totalIVADebito, detalle }
   */
  calcularIVADebito(periodo) {
    const ventas = this.obtenerVentasDelPeriodo(periodo);

    let totalVentas = 0;
    let totalNeto = 0;
    let totalIVADebito = 0;
    const detalle = [];

    ventas.forEach(v => {
      const monto = Number(v.monto || v.total || 0);
      const neto = this._r2(monto / 1.13);
      const iva = this._r2(monto - neto);

      totalVentas += monto;
      totalNeto += neto;
      totalIVADebito += iva;

      detalle.push({
        documentoId: v.id,
        numero: v.numeroDocumento || v.numero || 'S/N',
        fecha: v.fecha,
        cliente: v.clienteNombre || v.razonSocial || '—',
        monto,
        neto,
        iva
      });
    });

    return {
      totalVentas: this._r2(totalVentas),
      totalNeto: this._r2(totalNeto),
      totalIVADebito: this._r2(totalIVADebito),
      cantidadFacturas: ventas.length,
      detalle
    };
  }

  // ══════════════════════════════════════════════════════════
  // CÁLCULO DE IVA CRÉDITO FISCAL
  // ══════════════════════════════════════════════════════════

  /**
   * Valida si una factura de compra da derecho a crédito fiscal.
   *
   * Requisitos en Bolivia:
   *   - NIT del proveedor válido (no vacío)
   *   - CUF válido (Código Único de Factura)
   *   - Factura autorizada por el SIN
   *
   * @param {Object} factura
   * @returns {Object} { valido, motivo }
   */
  _validarFacturaParaCredito(factura) {
    // NIT obligatorio
    const nit = (factura.proveedorNIT || factura.nitProveedor || factura.nit || '').trim();
    if (!nit) {
      return { valido: false, motivo: 'Sin NIT de proveedor' };
    }

    // CUF obligatorio (Código Único de Factura)
    const cuf = (factura.cuf || '').trim();
    if (!cuf || cuf.length < 10) {
      return { valido: false, motivo: 'CUF inválido o ausente' };
    }

    // Número de factura obligatorio
    const numero = (factura.numeroDocumento || factura.numero || '').trim();
    if (!numero) {
      return { valido: false, motivo: 'Sin número de factura' };
    }

    return { valido: true, motivo: 'OK' };
  }

  /**
   * Calcula el IVA Crédito Fiscal (de las COMPRAS) del período.
   *
   * Solo incluye facturas con NIT y CUF válidos.
   * Las facturas no válidas se registran como "no aprovechables".
   *
   * @param {string} periodo - Formato "AAAA-MM"
   * @returns {Object} { totalCompras, totalNeto, totalIVACredito, detalle }
   */
  calcularIVACredito(periodo) {
    const compras = this.obtenerComprasDelPeriodo(periodo);

    let totalCompras = 0;
    let totalNeto = 0;
    let totalIVACredito = 0;
    let noAprovechables = 0;
    const detalle = [];

    compras.forEach(c => {
      const monto = Number(c.monto || c.total || 0);
      const validacion = this._validarFacturaParaCredito(c);
      const neto = this._r2(monto / 1.13);
      const iva = this._r2(monto - neto);

      if (validacion.valido) {
        totalCompras += monto;
        totalNeto += neto;
        totalIVACredito += iva;
      } else {
        noAprovechables++;
      }

      detalle.push({
        documentoId: c.id,
        numero: c.numeroDocumento || c.numero || 'S/N',
        fecha: c.fecha,
        proveedor: c.proveedorNombre || c.razonSocial || '—',
        nit: c.proveedorNIT || c.nitProveedor || c.nit || '—',
        cuf: c.cuf || '—',
        monto,
        neto,
        iva,
        valida: validacion.valido,
        motivo: validacion.motivo
      });
    });

    return {
      totalCompras: this._r2(totalCompras),
      totalNeto: this._r2(totalNeto),
      totalIVACredito: this._r2(totalIVACredito),
      cantidadFacturas: compras.length,
      facturasAprovechables: compras.length - noAprovechables,
      facturasNoAprovechables: noAprovechables,
      detalle
    };
  }

  // ══════════════════════════════════════════════════════════
  // CONCILIACIÓN DE IVA
  // ══════════════════════════════════════════════════════════

  /**
   * Concilia el IVA del período: débito vs crédito.
   *
   * Reglas bolivianas:
   *   - Si débito > crédito → IVA por pagar = débito - crédito - saldoFavorAnterior
   *   - Si crédito > débito → saldo a favor = crédito - débito
   *   - Saldo a favor se arrastra al mes siguiente (carry-forward)
   *
   * @param {string} periodo - Formato "AAAA-MM"
   * @returns {Object} Resultado de la conciliación
   */
  conciliarIVA(periodo) {
    const debito = this.calcularIVADebito(periodo);
    const credito = this.calcularIVACredito(periodo);

    // Obtener saldo a favor del mes anterior
    const saldoFavorAnterior = this.obtenerSaldoIVAFavor();

    // Calcular diferencia bruta
    const diferenciaBruta = this._r2(debito.totalIVADebito - credito.totalIVACredito);

    let ivaPorPagar = 0;
    let saldoFavorNuevo = 0;
    let saldoFavorUtilizado = 0;

    if (diferenciaBruta > 0) {
      // Débito mayor → hay IVA por pagar
      // Primero usar el saldo a favor acumulado
      if (saldoFavorAnterior > 0) {
        if (saldoFavorAnterior >= diferenciaBruta) {
          // Saldo a favor cubre todo el IVA
          ivaPorPagar = 0;
          saldoFavorUtilizado = diferenciaBruta;
          saldoFavorNuevo = this._r2(saldoFavorAnterior - diferenciaBruta);
        } else {
          // Saldo a favor cubre parcialmente
          ivaPorPagar = this._r2(diferenciaBruta - saldoFavorAnterior);
          saldoFavorUtilizado = saldoFavorAnterior;
          saldoFavorNuevo = 0;
        }
      } else {
        ivaPorPagar = diferenciaBruta;
        saldoFavorNuevo = 0;
      }
    } else if (diferenciaBruta < 0) {
      // Crédito mayor → nuevo saldo a favor
      ivaPorPagar = 0;
      saldoFavorNuevo = this._r2(saldoFavorAnterior + Math.abs(diferenciaBruta));
    } else {
      // Exactamente igual
      ivaPorPagar = 0;
      saldoFavorNuevo = saldoFavorAnterior;
    }

    const resultado = {
      exito: true,
      periodo,
      fechaCalculo: new Date().toISOString(),

      // Débito fiscal (ventas)
      debitoFiscal: debito.totalIVADebito,
      totalVentas: debito.totalVentas,
      ventasNetas: debito.totalNeto,
      cantidadVentas: debito.cantidadFacturas,

      // Crédito fiscal (compras)
      creditoFiscal: credito.totalIVACredito,
      totalCompras: credito.totalCompras,
      comprasNetas: credito.totalNeto,
      cantidadCompras: credito.cantidadFacturas,
      facturasAprovechables: credito.facturasAprovechables,
      facturasNoAprovechables: credito.facturasNoAprovechables,

      // Conciliación
      diferenciaBruta,
      saldoFavorAnterior,
      saldoFavorUtilizado,
      ivaPorPagar,
      saldoFavorNuevo,

      // Detalle completo
      detalleVentas: debito.detalle,
      detalleCompras: credito.detalle
    };

    // Guardar el nuevo saldo a favor
    this._guardarSaldoIVAFavor(saldoFavorNuevo);

    // Actualizar el período fiscal si existe
    const periodoFiscal = this.periodosFiscales ? this.periodosFiscales.obtenerPeriodo(periodo) : null;
    if (periodoFiscal) {
      this.periodosFiscales.actualizarPeriodo(periodo, {
        iva: {
          debitoFiscal: debito.totalIVADebito,
          creditoFiscal: credito.totalIVACredito,
          ivaPorPagar,
          saldoFavorContribuyente: saldoFavorNuevo,
          saldoFavorAnterior
        }
      });
    }

    console.log(`🧾 IVA ${periodo}: débito ${this._fmt(debito.totalIVADebito)}, crédito ${this._fmt(credito.totalIVACredito)} → ${ivaPorPagar > 0 ? 'pagar ' + this._fmt(ivaPorPagar) : 'saldo favor ' + this._fmt(saldoFavorNuevo)}`);

    return resultado;
  }

  // ══════════════════════════════════════════════════════════
  // SALDO A FAVOR (CARRY-FORWARD)
  // ══════════════════════════════════════════════════════════

  /**
   * Obtiene el saldo a favor acumulado de IVA.
   *
   * @returns {number}
   */
  obtenerSaldoIVAFavor() {
    try {
      const raw = localStorage.getItem(this.KEY_SALDO_FAVOR);
      return raw ? parseFloat(raw) || 0 : 0;
    } catch (e) {
      return 0;
    }
  }

  /**
   * Guarda el saldo a favor acumulado.
   * @private
   */
  _guardarSaldoIVAFavor(monto) {
    try {
      localStorage.setItem(this.KEY_SALDO_FAVOR, String(this._r2(monto)));
    } catch (e) {
      console.error('❌ Error al guardar saldo a favor:', e);
    }
  }

  /**
   * Resetea el saldo a favor (útil para tests).
   */
  resetearSaldoIVAFavor() {
    this._guardarSaldoIVAFavor(0);
    console.log('🔄 Saldo a favor de IVA reseteado');
  }

  // ══════════════════════════════════════════════════════════
  // FORMULARIO 200 DEL SIN
  // ══════════════════════════════════════════════════════════

  /**
   * Genera la estructura del Formulario 200 del SIN.
   *
   * ⚠️ En el prototipo solo se genera la estructura.
   * En producción se enviaría electrónicamente al SIN.
   *
   * @param {string} periodo
   * @returns {Object} Estructura del Form. 200
   */
  generarFormulario200(periodo) {
    const conciliacion = this.conciliarIVA(periodo);

    const nitEmpresa = (window.BOLIVIA && window.BOLIVIA.NIT_EMPRESA) || '000000000-0';
    const [anio, mes] = periodo.split('-').map(Number);
    const fechaVencimiento = this.periodosFiscales
      ? this.periodosFiscales.calcularFechaVencimiento(nitEmpresa, periodo)
      : null;

    const formulario = {
      // Datos del contribuyente
      nit: nitEmpresa,
      razonSocial: (window.BOLIVIA && window.BOLIVIA.RAZON_SOCIAL) || 'EMPRESA S.A.',
      periodoFiscal: periodo,
      gestion: anio,
      mes,

      // Fechas
      fechaGeneracion: new Date().toISOString(),
      fechaVencimiento,

      // Sección 1: Ventas (Débito Fiscal)
      ventas: {
        brutas: conciliacion.totalVentas,
        netas: conciliacion.ventasNetas,
        ivaDebitoFiscal: conciliacion.debitoFiscal,
        cantidadFacturas: conciliacion.cantidadVentas
      },

      // Sección 2: Compras (Crédito Fiscal)
      compras: {
        brutas: conciliacion.totalCompras,
        netas: conciliacion.comprasNetas,
        ivaCreditoFiscal: conciliacion.creditoFiscal,
        cantidadFacturas: conciliacion.cantidadCompras,
        facturasAprovechables: conciliacion.facturasAprovechables,
        facturasNoAprovechables: conciliacion.facturasNoAprovechables
      },

      // Sección 3: Liquidación
      liquidacion: {
        ivaDebitoFiscal: conciliacion.debitoFiscal,
        ivaCreditoFiscal: conciliacion.creditoFiscal,
        diferencia: conciliacion.diferenciaBruta,
        saldoFavorAnterior: conciliacion.saldoFavorAnterior,
        saldoFavorUtilizado: conciliacion.saldoFavorUtilizado,
        ivaDeterminado: conciliacion.ivaPorPagar,
        saldoFavorNuevo: conciliacion.saldoFavorNuevo
      },

      // Resultado final
      resultado: {
        aPagar: conciliacion.ivaPorPagar,
        saldoFavor: conciliacion.saldoFavorNuevo,
        presentacion: 'PENDIENTE'
      },

      // Estado
      estado: 'GENERADO',
      declarado: false,
      pagado: false
    };

    // Guardar el formulario en el período fiscal
    const periodoFiscal = this.periodosFiscales ? this.periodosFiscales.obtenerPeriodo(periodo) : null;
    if (periodoFiscal) {
      this.periodosFiscales.actualizarPeriodo(periodo, {
        iva: { formulario200: formulario }
      });
    }

    console.log(`📄 Form. 200 generado para ${periodo}`);
    return formulario;
  }

    // ══════════════════════════════════════════════════════════
  // IT — IMPUESTO A LAS TRANSACCIONES (Form. 400)
  // ══════════════════════════════════════════════════════════

  /**
   * Calcula el IT (Impuesto a las Transacciones) del período.
   *
   * ⚠️ PARTICULARIDAD BOLIVIANA:
   * El IT se calcula sobre los INGRESOS BRUTOS (monto total de la
   * factura, con IVA incluido), NO sobre el neto. Esto difiere del IVA.
   *
   * Fórmula: IT = Ingresos Brutos × 3%
   *
   * @param {string} periodo - Formato "AAAA-MM"
   * @returns {Object} { ingresosBrutos, itPorPagar, detalle }
   */
  calcularIT(periodo) {
    const ventas = this.obtenerVentasDelPeriodo(periodo);

    let ingresosBrutos = 0;
    const detalle = [];

    ventas.forEach(v => {
      // El IT se calcula sobre el MONTO BRUTO (con IVA incluido)
      const monto = Number(v.monto || v.total || 0);
      ingresosBrutos += monto;

      detalle.push({
        documentoId: v.id,
        numero: v.numeroDocumento || v.numero || 'S/N',
        fecha: v.fecha,
        cliente: v.clienteNombre || v.razonSocial || '—',
        montoBruto: monto
      });
    });

    const itPorPagar = this._r2(ingresosBrutos * 0.03);

    return {
      exito: true,
      periodo,
      ingresosBrutos: this._r2(ingresosBrutos),
      itPorPagar,
      cantidadFacturas: ventas.length,
      detalle
    };
  }

  /**
   * Obtiene el IT acumulado del año (para compensación con IUE).
   *
   * @param {number} anio
   * @returns {number} IT acumulado en el año
   */
  obtenerITAcumuladoAnual(anio) {
    try {
      const key = `it_acumulado_anual_${anio}`;
      const raw = localStorage.getItem(key);
      return raw ? parseFloat(raw) || 0 : 0;
    } catch (e) {
      return 0;
    }
  }

  /**
   * Acumula el IT pagado en el período al acumulado anual.
   *
   * Este acumulado es CLAVE para la compensación IT-IUE (Art. 77 Ley 843).
   * Se usa en la Fase 5.6.
   *
   * @param {string} periodo - Formato "AAAA-MM"
   * @param {number} itPagado - IT pagado en el período
   * @returns {Object}
   */
  acumularITAnual(periodo, itPagado) {
    const [anio] = periodo.split('-').map(Number);
    const acumuladoAnterior = this.obtenerITAcumuladoAnual(anio);
    const acumuladoNuevo = this._r2(acumuladoAnterior + itPagado);

    try {
      const key = `it_acumulado_anual_${anio}`;
      localStorage.setItem(key, String(acumuladoNuevo));
    } catch (e) {
      console.error('❌ Error al guardar IT acumulado:', e);
      return { exito: false, errores: ['Error al guardar IT acumulado'] };
    }

    // Actualizar el período fiscal
    const periodoFiscal = this.periodosFiscales ? this.periodosFiscales.obtenerPeriodo(periodo) : null;
    if (periodoFiscal) {
      this.periodosFiscales.actualizarPeriodo(periodo, {
        it: { itPagadoAcumulado: acumuladoNuevo }
      });
    }

    console.log(`💰 IT acumulado ${anio}: ${this._fmt(acumuladoAnterior)} + ${this._fmt(itPagado)} = ${this._fmt(acumuladoNuevo)}`);

    return {
      exito: true,
      periodo,
      anio,
      itPagado,
      acumuladoAnterior,
      acumuladoNuevo
    };
  }

  /**
   * Resetea el IT acumulado de un año (útil para tests).
   * @param {number} anio
   */
  resetearITAcumulado(anio) {
    try {
      const key = `it_acumulado_anual_${anio}`;
      localStorage.setItem(key, '0');
      console.log(`🔄 IT acumulado ${anio} reseteado`);
    } catch (e) {
      console.error('❌ Error al resetear IT acumulado:', e);
    }
  }

  /**
   * Genera la estructura del Formulario 400 del SIN (IT).
   *
   * ⚠️ En el prototipo solo se genera la estructura.
   * En producción se enviaría electrónicamente al SIN.
   *
   * @param {string} periodo
   * @returns {Object} Estructura del Form. 400
   */
  generarFormulario400(periodo) {
    const it = this.calcularIT(periodo);

    const nitEmpresa = (window.BOLIVIA && window.BOLIVIA.NIT_EMPRESA) || '000000000-0';
    const [anio, mes] = periodo.split('-').map(Number);
    const fechaVencimiento = this.periodosFiscales
      ? this.periodosFiscales.calcularFechaVencimiento(nitEmpresa, periodo)
      : null;

    // Acumular el IT del período al anual
    if (it.itPorPagar > 0) {
      this.acumularITAnual(periodo, it.itPorPagar);
    }

    const acumuladoAnual = this.obtenerITAcumuladoAnual(anio);

    const formulario = {
      // Datos del contribuyente
      nit: nitEmpresa,
      razonSocial: (window.BOLIVIA && window.BOLIVIA.RAZON_SOCIAL) || 'EMPRESA S.A.',
      periodoFiscal: periodo,
      gestion: anio,
      mes,

      // Fechas
      fechaGeneracion: new Date().toISOString(),
      fechaVencimiento,

      // Sección 1: Ingresos
      ingresos: {
        brutos: it.ingresosBrutos,
        cantidadFacturas: it.cantidadFacturas
      },

      // Sección 2: Liquidación del IT
      liquidacion: {
        ingresosBrutos: it.ingresosBrutos,
        tasaIT: 0.03,
        itDeterminado: it.itPorPagar,
        itAcumuladoAnual: acumuladoAnual
      },

      // Resultado final
      resultado: {
        aPagar: it.itPorPagar,
        presentacion: 'PENDIENTE'
      },

      // Estado
      estado: 'GENERADO',
      declarado: false,
      pagado: false
    };

    // Guardar el formulario en el período fiscal
    const periodoFiscal = this.periodosFiscales ? this.periodosFiscales.obtenerPeriodo(periodo) : null;
    if (periodoFiscal) {
      this.periodosFiscales.actualizarPeriodo(periodo, {
        it: {
          ingresosBrutos: it.ingresosBrutos,
          itPorPagar: it.itPorPagar,
          formulario400: formulario
        }
      });
    }

    console.log(`📄 Form. 400 generado para ${periodo}`);
    return formulario;
  }

  /**
   * Liquida el IT del período: calcula, acumula y genera formulario.
   * Método de conveniencia que combina calcularIT + generarFormulario400.
   *
   * @param {string} periodo
   * @returns {Object}
   */
  liquidarIT(periodo) {
    const it = this.calcularIT(periodo);
    const formulario = this.generarFormulario400(periodo);

    return {
      exito: true,
      periodo,
      itCalculado: it,
      formulario400: formulario
    };
  }

  // ══════════════════════════════════════════════════════════
  // UTILIDADES PRIVADAS
  // ══════════════════════════════════════════════════════════

  _r2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }

  _fmt(n) {
    return (window.utilidades && window.utilidades.formatearBs)
      ? window.utilidades.formatearBs(n)
      : `Bs ${n.toFixed(2)}`;
  }
}

window.ModuloImpuestos = ModuloImpuestos;
