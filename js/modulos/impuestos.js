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
    // Normalizar porcentaje: si es > 1, dividirlo entre 100
    // (acepta tanto 13 como 0.13)
    const ivaRaw = (window.BOLIVIA && window.BOLIVIA.IVA_PORCENTAJE) || 0.13;
    this.PORCENTAJE_IVA = ivaRaw > 1 ? ivaRaw / 100 : ivaRaw;

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
      // Filtrar por tipo de documento de venta (acepta tanto tipoDocumento como tipo)
      const tipoDoc = doc.tipoDocumento || doc.tipo || '';
      const esVenta = tipoDoc === 'FACTURA_VENTA' ||
                      tipoDoc === 'NOTA_VENTA' ||
                      tipoDoc.includes('VENTA');

      if (!esVenta) return false;

      // Filtrar por fecha dentro del período (acepta tanto fecha como fechaEmision)
      const fechaStr = doc.fecha || doc.fechaEmision;
      if (!fechaStr) return false;
      const fechaDoc = new Date(fechaStr);
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
      // Filtrar por tipo de documento de compra (acepta tanto tipoDocumento como tipo)
      const tipoDoc = doc.tipoDocumento || doc.tipo || '';
      const esCompra = tipoDoc === 'FACTURA_COMPRA' ||
                      tipoDoc === 'NOTA_COMPRA' ||
                      tipoDoc.includes('COMPRA');

      if (!esCompra) return false;

      // Filtrar por fecha dentro del período (acepta tanto fecha como fechaEmision)
      const fechaStr = doc.fecha || doc.fechaEmision;
      if (!fechaStr) return false;
      const fechaDoc = new Date(fechaStr);
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
      const monto = Number(v.monto || v.total || v.montoTotal || 0);
      const neto = this._r2(monto / 1.13);
      const iva = this._r2(monto - neto);

      totalVentas += monto;
      totalNeto += neto;
      totalIVADebito += iva;

      detalle.push({
        documentoId: v.id,
        numero: v.numeroDocumento || v.numero || 'S/N',
        fecha: v.fecha || v.fechaEmision || v.fechaRegistro || '—',
        cliente: v.clienteNombre || v.razonSocialCliente || v.razonSocial || '—',
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
      const monto = Number(c.monto || c.total || c.montoTotal || 0);
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
        fecha: c.fecha || c.fechaEmision || c.fechaRegistro || '—',
        proveedor: c.proveedorNombre || c.razonSocialProveedor || c.razonSocial || '—',
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
      const monto = Number(v.monto || v.total || v.montoTotal || 0);
      ingresosBrutos += monto;

      detalle.push({
        documentoId: v.id,
        numero: v.numeroDocumento || v.numero || 'S/N',
        fecha: v.fecha || v.fechaEmision || v.fechaRegistro || '—',
        cliente: v.clienteNombre || v.razonSocialCliente || v.razonSocial || '—',
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
  // IUE — IMPUESTO SOBRE LAS UTILIDADES (Form. 500)
  // ══════════════════════════════════════════════════════════

  /**
   * Obtiene la utilidad contable del ejercicio desde el Motor Contable.
   *
   * Consulta las cuentas de resultado (4.x ingresos, 5.x gastos)
   * del Libro Mayor para calcular la utilidad del año.
   *
   * @param {number} anio
   * @returns {Object} { exito, utilidadContable, detalle, errores }
   */
  obtenerUtilidadContable(anio) {
    // Intentar obtener desde el Motor Contable si está disponible
    if (!window.motorContable) {
      return {
        exito: false,
        utilidadContable: 0,
        detalle: null,
        errores: ['Motor Contable no disponible. Ingrese la utilidad contable manualmente.']
      };
    }

    try {
      const mayor = window.motorContable.obtenerLibroMayor() || [];

      let totalIngresos = 0;
      let totalGastos = 0;
      const detalleIngresos = [];
      const detalleGastos = [];

      mayor.forEach(cuenta => {
        const codigo = cuenta.cuentaCodigo || '';
        // Filtrar solo cuentas del año (esto es una simplificación;
        // en producción se filtraría por movimientos del año)
        if (codigo.startsWith('4.')) {
          // Ingresos (naturaleza acreedora)
          const saldo = cuenta.saldo || 0;
          totalIngresos += saldo;
          detalleIngresos.push({ codigo, nombre: cuenta.cuentaNombre, monto: saldo });
        } else if (codigo.startsWith('5.')) {
          // Gastos (naturaleza deudora)
          const saldo = cuenta.saldo || 0;
          totalGastos += saldo;
          detalleGastos.push({ codigo, nombre: cuenta.cuentaNombre, monto: saldo });
        }
      });

      const utilidadContable = this._r2(totalIngresos - totalGastos);

      return {
        exito: true,
        utilidadContable,
        totalIngresos: this._r2(totalIngresos),
        totalGastos: this._r2(totalGastos),
        detalle: { ingresos: detalleIngresos, gastos: detalleGastos },
        errores: []
      };
    } catch (e) {
      return {
        exito: false,
        utilidadContable: 0,
        detalle: null,
        errores: [`Error al consultar Motor Contable: ${e.message}`]
      };
    }
  }

  /**
   * Aplica los ajustes fiscales a la utilidad contable.
   *
   * Ajustes típicos en Bolivia:
   *   (+) Gastos no deducibles: multas, sanciones, donaciones no autorizadas
   *   (-) Ingresos no gravables: intereses exentos, indemnizaciones
   *
   * @param {number} utilidadContable
   * @param {Object} ajustes - { gastosNoDeducibles: [], ingresosNoGravables: [] }
   * @returns {Object} { utilidadImponible, totalGastosNoDeducibles, totalIngresosNoGravables }
   */
  aplicarAjustesFiscales(utilidadContable, ajustes = {}) {
    const gastosNoDeducibles = ajustes.gastosNoDeducibles || [];
    const ingresosNoGravables = ajustes.ingresosNoGravables || [];

    const totalGastosNoDeducibles = this._r2(
      gastosNoDeducibles.reduce((sum, g) => sum + (Number(g.monto) || 0), 0)
    );

    const totalIngresosNoGravables = this._r2(
      ingresosNoGravables.reduce((sum, i) => sum + (Number(i.monto) || 0), 0)
    );

    // Utilidad imponible = utilidad contable + gastos no deducibles - ingresos no gravables
    const utilidadImponible = this._r2(
      utilidadContable + totalGastosNoDeducibles - totalIngresosNoGravables
    );

    return {
      utilidadImponible,
      totalGastosNoDeducibles,
      totalIngresosNoGravables,
      detalle: {
        gastosNoDeducibles,
        ingresosNoGravables
      }
    };
  }

  /**
   * Calcula el IUE (Impuesto sobre las Utilidades de las Empresas).
   *
   * Fórmula: IUE = 25% × Utilidad Imponible
   * Si utilidad imponible ≤ 0 → IUE = 0
   *
   * @param {number} anio - Año de la gestión (ej: 2026)
   * @param {Object} [opciones]
   * @param {number} [opciones.utilidadContable] - Si no se pasa, se obtiene del Motor Contable
   * @param {Object} [opciones.ajustes] - Ajustes fiscales manuales
   * @returns {Object} Resultado completo del cálculo
   */
  calcularIUE(anio, opciones = {}) {
    // 1. Obtener utilidad contable
    let utilidadContable;
    let fuenteUtilidad;

    if (opciones.utilidadContable !== undefined) {
      utilidadContable = Number(opciones.utilidadContable) || 0;
      fuenteUtilidad = 'MANUAL';
    } else {
      const consulta = this.obtenerUtilidadContable(anio);
      if (!consulta.exito) {
        return {
          exito: false,
          errores: consulta.errores,
          sugerencia: 'Pase la utilidad contable manualmente: calcularIUE(2026, { utilidadContable: 23500 })'
        };
      }
      utilidadContable = consulta.utilidadContable;
      fuenteUtilidad = 'MOTOR_CONTABLE';
    }

    // 2. Aplicar ajustes fiscales
    const ajustes = opciones.ajustes || {};
    const resultadoAjustes = this.aplicarAjustesFiscales(utilidadContable, ajustes);
    const utilidadImponible = resultadoAjustes.utilidadImponible;

    // 3. Calcular IUE (25% sobre utilidad imponible)
    let iueDeterminado = 0;
    if (utilidadImponible > 0) {
      iueDeterminado = this._r2(utilidadImponible * 0.25);
    }

    // 4. Obtener IT acumulado del año (para compensación en Fase 5.6)
    const itAcumulado = this.obtenerITAcumuladoAnual(anio);

    // 5. Calcular fecha límite (120 días tras cierre)
    const fechaLimite = this.calcularFechaLimiteIUE(anio);

    const resultado = {
      exito: true,
      anio,
      fechaCalculo: new Date().toISOString(),
      fuenteUtilidad,

      // Utilidad contable
      utilidadContable,

      // Ajustes fiscales
      ajustes: {
        gastosNoDeducibles: ajustes.gastosNoDeducibles || [],
        ingresosNoGravables: ajustes.ingresosNoGravables || [],
        totalGastosNoDeducibles: resultadoAjustes.totalGastosNoDeducibles,
        totalIngresosNoGravables: resultadoAjustes.totalIngresosNoGravables
      },

      // Utilidad imponible
      utilidadImponible,

      // IUE determinado
      tasaIUE: 0.25,
      iueDeterminado,

      // Compensación con IT (se completa en Fase 5.6)
      itAcumulado,
      iuePorPagarPreliminar: this._r2(Math.max(0, iueDeterminado - itAcumulado)),

      // Fecha límite
      fechaLimite,

      // Advertencias
      advertencias: []
    };

    // Advertencia si hay pérdida
    if (utilidadImponible <= 0) {
      resultado.advertencias.push('⚠️ Utilidad imponible ≤ 0: no se paga IUE este año. La pérdida se puede arrastrar a futuros ejercicios.');
    }

    // Advertencia si el IT supera el IUE (se pierde el exceso)
    if (itAcumulado > iueDeterminado && iueDeterminado > 0) {
      const exceso = this._r2(itAcumulado - iueDeterminado);
      resultado.advertencias.push(`⚠️ El IT acumulado (${this._fmt(itAcumulado)}) supera el IUE determinado (${this._fmt(iueDeterminado)}). El exceso de ${this._fmt(exceso)} SE PIERDE.`);
    }

    console.log(`🧾 IUE ${anio}: utilidad imponible ${this._fmt(utilidadImponible)} → IUE ${this._fmt(iueDeterminado)}`);

    return resultado;
  }

  /**
   * Calcula la fecha límite para declarar el IUE.
   *
   * Regla boliviana: 120 días calendario después del cierre de gestión.
   * Ejemplo: cierre 31/12/2026 → límite 30/04/2027.
   *
   * @param {number} anio - Año de la gestión
   * @param {string} [fechaCierre] - Fecha de cierre (por defecto 31 de diciembre)
   * @returns {string} Fecha "AAAA-MM-DD"
   */
  calcularFechaLimiteIUE(anio, fechaCierre = null) {
    // Si periodosFiscales tiene el método, usarlo
    if (this.periodosFiscales && typeof this.periodosFiscales.calcularFechaLimiteIUE === 'function') {
      return this.periodosFiscales.calcularFechaLimiteIUE(anio);
    }

    // Fallback: calcular manualmente
    const cierre = fechaCierre ? new Date(fechaCierre) : new Date(anio, 11, 31);
    const limite = new Date(cierre);
    limite.setDate(limite.getDate() + 120);
    return limite.toISOString().split('T')[0];
  }

  /**
   * Genera la estructura del Formulario 500 del SIN (IUE).
   *
   * ⚠️ En el prototipo solo se genera la estructura.
   * En producción se enviaría electrónicamente al SIN.
   *
   * @param {number} anio
   * @param {Object} [opciones] - Mismas opciones que calcularIUE
   * @returns {Object} Estructura del Form. 500
   */
  generarFormulario500(anio, opciones = {}) {
    const iue = this.calcularIUE(anio, opciones);

    if (!iue.exito) {
      return { exito: false, errores: iue.errores };
    }

    const nitEmpresa = (window.BOLIVIA && window.BOLIVIA.NIT_EMPRESA) || '000000000-0';

    const formulario = {
      // Datos del contribuyente
      nit: nitEmpresa,
      razonSocial: (window.BOLIVIA && window.BOLIVIA.RAZON_SOCIAL) || 'EMPRESA S.A.',
      gestion: anio,
      tipoFormulario: 'FORM_500',

      // Fechas
      fechaGeneracion: new Date().toISOString(),
      fechaLimite: iue.fechaLimite,
      cierreGestion: `${anio}-12-31`,

      // Sección 1: Utilidad contable
      utilidadContable: {
        monto: iue.utilidadContable,
        fuente: iue.fuenteUtilidad
      },

      // Sección 2: Ajustes fiscales
      ajustesFiscales: {
        gastosNoDeducibles: iue.ajustes.gastosNoDeducibles,
        ingresosNoGravables: iue.ajustes.ingresosNoGravables,
        totalGastosNoDeducibles: iue.ajustes.totalGastosNoDeducibles,
        totalIngresosNoGravables: iue.ajustes.totalIngresosNoGravables
      },

      // Sección 3: Liquidación
      liquidacion: {
        utilidadImponible: iue.utilidadImponible,
        tasaIUE: iue.tasaIUE,
        iueDeterminado: iue.iueDeterminado,
        itCompensado: Math.min(iue.itAcumulado, iue.iueDeterminado),
        iuePorPagar: iue.iuePorPagarPreliminar
      },

      // Resultado final
      resultado: {
        aPagar: iue.iuePorPagarPreliminar,
        itAcumulado: iue.itAcumulado,
        presentacion: 'PENDIENTE'
      },

      // Advertencias
      advertencias: iue.advertencias,

      // Estado
      estado: 'GENERADO',
      declarado: false,
      pagado: false
    };

    // Guardar el formulario en el período fiscal anual si existe
    const periodoFiscal = this.periodosFiscales
      ? this.periodosFiscales.obtenerPeriodo(String(anio))
      : null;

    if (periodoFiscal) {
      this.periodosFiscales.actualizarPeriodo(String(anio), {
        iue: {
          utilidadContable: iue.utilidadContable,
          utilidadImponible: iue.utilidadImponible,
          iueDeterminado: iue.iueDeterminado,
          itCompensado: formulario.liquidacion.itCompensado,
          iuePorPagar: iue.iuePorPagarPreliminar,
          formulario500: formulario
        }
      });
    }

    console.log(`📄 Form. 500 generado para gestión ${anio}`);
    return { exito: true, formulario, iue };
  }

  /**
   * Liquida el IUE del año: calcula y genera formulario.
   * Método de conveniencia que combina calcularIUE + generarFormulario500.
   *
   * @param {number} anio
   * @param {Object} [opciones]
   * @returns {Object}
   */
  liquidarIUE(anio, opciones = {}) {
    const resultado = this.generarFormulario500(anio, opciones);

    if (!resultado.exito) {
      return resultado;
    }

    return {
      exito: true,
      anio,
      iueCalculado: resultado.iue,
      formulario500: resultado.formulario
    };
  }

    // ══════════════════════════════════════════════════════════
  // COMPENSACIÓN IT vs IUE — Art. 77 Ley 843
  // ══════════════════════════════════════════════════════════

  /**
   * Compensa el IT pagado durante el año contra el IUE determinado.
   *
   * Art. 77 Ley 843:
   *   - El IT pagado mes a mes (3% sobre ingresos brutos) se acumula.
   *   - Al cierre del año, se descuenta del IUE determinado (25%).
   *   - Si IT < IUE → se paga la diferencia.
   *   - Si IT ≥ IUE → IUE = 0. El EXCESO SE PIERDE.
   *     No se devuelve, no se arrastra, no se compensa con otros impuestos.
   *
   * @param {number} anio - Año de la gestión
   * @param {Object} [opcionesIUE] - Opciones para calcularIUE (utilidadContable, ajustes)
   * @returns {Object} Resultado completo de la compensación
   */
  compensarITcontraIUE(anio, opcionesIUE = {}) {
    // 1. Obtener IUE determinado
    const iue = this.calcularIUE(anio, opcionesIUE);
    if (!iue.exito) {
      return { exito: false, errores: iue.errores };
    }

    // 2. Obtener IT acumulado del año
    const itAcumulado = this.obtenerITAcumuladoAnual(anio);

    // 3. Obtener desglose mensual del IT
    const desgloseMensualIT = this._obtenerDesgloseMensualIT(anio);

    // 4. Aplicar compensación (Art. 77 Ley 843)
    const iueDeterminado = iue.iueDeterminado;
    let itCompensado = 0;
    let iuePorPagar = 0;
    let excesoIT = 0;
    let caso = '';

    if (iueDeterminado <= 0) {
      // Sin IUE (pérdida) → todo el IT se pierde
      itCompensado = 0;
      iuePorPagar = 0;
      excesoIT = itAcumulado;
      caso = 'PERDIDA';
    } else if (itAcumulado < iueDeterminado) {
      // Caso 1: IT < IUE → paga la diferencia
      itCompensado = itAcumulado;
      iuePorPagar = this._r2(iueDeterminado - itAcumulado);
      excesoIT = 0;
      caso = 'IT_MENOR';
    } else if (Math.abs(itAcumulado - iueDeterminado) < 0.01) {
      // Caso 2: IT = IUE → no paga nada
      itCompensado = iueDeterminado;
      iuePorPagar = 0;
      excesoIT = 0;
      caso = 'IT_IGUAL';
    } else {
      // Caso 3: IT > IUE → IUE = 0, exceso se pierde
      itCompensado = iueDeterminado;
      iuePorPagar = 0;
      excesoIT = this._r2(itAcumulado - iueDeterminado);
      caso = 'IT_MAYOR';
    }

    // 5. Generar advertencias
    const advertencias = [];

    if (caso === 'IT_MAYOR') {
      advertencias.push(
        `⚠️ EXCESO DE IT: El IT pagado (${this._fmt(itAcumulado)}) supera el IUE ` +
        `(${this._fmt(iueDeterminado)}) en ${this._fmt(excesoIT)}. ` +
        `Este exceso NO se devuelve ni se arrastra. SE PIERDE. (Art. 77 Ley 843)`
      );
    }

    if (caso === 'PERDIDA' && itAcumulado > 0) {
      advertencias.push(
        `⚠️ PÉRDIDA FISCAL: La empresa tiene pérdida en la gestión ${anio}. ` +
        `Todo el IT pagado (${this._fmt(itAcumulado)}) se pierde porque no hay IUE contra el cual compensar.`
      );
    }

    if (caso === 'IT_IGUAL') {
      advertencias.push(
        `✅ COMPENSACIÓN PERFECTA: El IT pagado (${this._fmt(itAcumulado)}) cubre ` +
        `exactamente el IUE determinado (${this._fmt(iueDeterminado)}). No hay pago adicional.`
      );
    }

    if (caso === 'IT_MENOR') {
      advertencias.push(
        `📋 COMPENSACIÓN PARCIAL: El IT pagado (${this._fmt(itAcumulado)}) se descuenta del IUE ` +
        `(${this._fmt(iueDeterminado)}). Queda por pagar: ${this._fmt(iuePorPagar)}.`
      );
    }

    // 6. Resultado
    const resultado = {
      exito: true,
      anio,
      fechaCalculo: new Date().toISOString(),
      caso,

      // Datos del IUE
      utilidadContable: iue.utilidadContable,
      utilidadImponible: iue.utilidadImponible,
      iueDeterminado,

      // Datos del IT
      itAcumulado,
      desgloseMensualIT,

      // Resultado de la compensación
      itCompensado,
      iuePorPagar,
      excesoIT,

      // Fecha límite de presentación
      fechaLimite: iue.fechaLimite,

      // Advertencias y recomendaciones
      advertencias,

      // Resumen ejecutivo
      resumen: this._generarResumenCompensacion(caso, {
        itAcumulado, iueDeterminado, itCompensado, iuePorPagar, excesoIT
      })
    };

    console.log(`🏛️ Compensación IT-IUE ${anio}: ${caso} → IUE a pagar: ${this._fmt(iuePorPagar)}${excesoIT > 0 ? ` | Exceso IT perdido: ${this._fmt(excesoIT)}` : ''}`);

    return resultado;
  }

  /**
   * Genera una advertencia de planificación tributaria.
   *
   * Se usa DURANTE el año para alertar al contador cuando
   * el IT acumulado está cerca de superar el IUE estimado.
   *
   * @param {number} anio
   * @param {number} iueEstimado - IUE estimado para el año
   * @returns {Object}
   */
  generarAdvertenciaPlanificacion(anio, iueEstimado) {
    const itAcumulado = this.obtenerITAcumuladoAnual(anio);
    const diferencia = this._r2(iueEstimado - itAcumulado);
    const porcentajeIT = iueEstimado > 0
      ? this._r2((itAcumulado / iueEstimado) * 100)
      : 0;

    // Determinar el mes actual
    const hoy = new Date();
    const mesActual = hoy.getMonth() + 1;  // 1-12
    const mesesRestantes = 12 - mesActual;

    // Proyección: IT mensual promedio × meses restantes
    const itMensualPromedio = mesActual > 0 ? this._r2(itAcumulado / mesActual) : 0;
    const itProyectadoAnual = this._r2(itAcumulado + (itMensualPromedio * mesesRestantes));

    let nivel, mensaje, recomendacion;

    if (itAcumulado >= iueEstimado) {
      nivel = 'CRITICO';
      mensaje = `🚨 El IT acumulado (${this._fmt(itAcumulado)}) YA SUPERA el IUE estimado (${this._fmt(iueEstimado)}).`;
      recomendacion = `Cada boliviano adicional de IT que se pague SE PIERDE. Revisar estrategia de facturación para el resto del año.`;
    } else if (porcentajeIT >= 80) {
      nivel = 'ALTO';
      mensaje = `⚠️ El IT acumulado (${this._fmt(itAcumulado)}) alcanza el ${porcentajeIT}% del IUE estimado (${this._fmt(iueEstimado)}).`;
      recomendacion = `Queda margen de ${this._fmt(diferencia)} antes de que el IT supere el IUE. Monitorear de cerca.`;
    } else if (itProyectadoAnual > iueEstimado) {
      nivel = 'MEDIO';
      mensaje = `⚡ Proyección anual: el IT podría alcanzar ${this._fmt(itProyectadoAnual)} al cierre, superando el IUE estimado.`;
      recomendacion = `IT promedio mensual: ${this._fmt(itMensualPromedio)}. Si el ritmo continúa, habrá exceso de ${this._fmt(this._r2(itProyectadoAnual - iueEstimado))}.`;
    } else {
      nivel = 'BAJO';
      mensaje = `✅ IT acumulado (${this._fmt(itAcumulado)}) está al ${porcentajeIT}% del IUE estimado.`;
      recomendacion = `Margen holgado de ${this._fmt(diferencia)}. Situación tributaria saludable.`;
    }

    return {
      anio,
      nivel,
      mensaje,
      recomendacion,
      datos: {
        itAcumulado,
        iueEstimado,
        diferencia,
        porcentajeIT,
        itMensualPromedio,
        itProyectadoAnual,
        mesesRestantes
      }
    };
  }

  /**
   * Genera el resumen ejecutivo de la compensación para el contador.
   * @private
   */
  _generarResumenCompensacion(caso, datos) {
    const { itAcumulado, iueDeterminado, itCompensado, iuePorPagar, excesoIT } = datos;

    const lineas = [
      `══════════════════════════════════════════`,
      `COMPENSACIÓN IT vs IUE — Art. 77 Ley 843`,
      `══════════════════════════════════════════`,
      ``,
      `IUE Determinado (25%):      ${this._fmt(iueDeterminado).padStart(15)}`,
      `(-) IT Pagado en el año:    ${this._fmt(itAcumulado).padStart(15)}`,
      `──────────────────────────────────────────`,
    ];

    switch (caso) {
      case 'IT_MENOR':
        lineas.push(
          `IUE POR PAGAR:              ${this._fmt(iuePorPagar).padStart(15)}`,
          ``,
          `✅ Se compensó ${this._fmt(itCompensado)} de IT contra el IUE.`,
          `📋 Queda por pagar: ${this._fmt(iuePorPagar)}.`
        );
        break;
      case 'IT_IGUAL':
        lineas.push(
          `IUE POR PAGAR:              ${this._fmt(0).padStart(15)}`,
          ``,
          `✅ Compensación perfecta. No hay monto adicional a pagar.`
        );
        break;
      case 'IT_MAYOR':
        lineas.push(
          `IUE POR PAGAR:              ${this._fmt(0).padStart(15)}`,
          `EXCESO DE IT:               ${this._fmt(excesoIT).padStart(15)} → SE PIERDE`,
          ``,
          `⚠️ El exceso de ${this._fmt(excesoIT)} NO se devuelve.`,
          `⚠️ NO se arrastra al siguiente año.`,
          `⚠️ NO se compensa con otros impuestos.`,
          `📋 Planificar mejor el IT para la próxima gestión.`
        );
        break;
      case 'PERDIDA':
        lineas.push(
          `IUE POR PAGAR:              ${this._fmt(0).padStart(15)}`,
          `IT PERDIDO:                 ${this._fmt(itAcumulado).padStart(15)} → SE PIERDE`,
          ``,
          `⚠️ Empresa en pérdida. No hay IUE contra el cual compensar.`,
          `⚠️ Todo el IT pagado durante el año se pierde.`
        );
        break;
    }

    return lineas.join('\n');
  }

  /**
   * Obtiene el desglose mensual del IT pagado en el año.
   * @private
   */
  _obtenerDesgloseMensualIT(anio) {
    const desglose = [];
    const periodos = this.periodosFiscales ? this.periodosFiscales.obtenerTodos() : [];

    for (let mes = 1; mes <= 12; mes++) {
      const periodoStr = `${anio}-${String(mes).padStart(2, '0')}`;
      const periodo = periodos.find(p => p.periodo === periodoStr);

      desglose.push({
        mes,
        periodo: periodoStr,
        itPagado: periodo ? (periodo.it.itPorPagar || 0) : 0
      });
    }

    return desglose;
  }

    // ══════════════════════════════════════════════════════════
  // RC-IVA — RÉGIMEN COMPLEMENTARIO AL IVA
  // ══════════════════════════════════════════════════════════

  /**
   * Calcula el RC-IVA para profesionales independientes (desde 2023).
   *
   * Desde 2023, los profesionales independientes (abogados, contadores,
   * consultores, etc.) son contribuyentes DIRECTOS del RC-IVA, no
   * dependen de un agente de retención.
   *
   * Fórmula:
   *   RC-IVA teórico = ingresos × 13%
   *   Compensación = IVA de facturas de gastos vinculados
   *   RC-IVA a pagar = max(0, teórico - compensación)
   *
   * @param {number} ingresos - Ingresos brutos del período
   * @param {Array} gastos - Facturas de gastos vinculados
   * @returns {Object}
   */
  calcularRCIVAIndependiente(ingresos, gastos = []) {
    const ingresosNum = Number(ingresos) || 0;
    const rcIVATeorico = this._r2(ingresosNum * this.PORCENTAJE_IVA);

    // Calcular IVA de las facturas de gastos
    let totalGastosCompensables = 0;
    let totalIVAFacturas = 0;
    const detalleGastos = [];

    gastos.forEach(g => {
      const monto = Number(g.monto) || 0;
      const neto = this._r2(monto / 1.13);
      const iva = this._r2(monto - neto);

      // Validar que la factura tenga NIT y CUF válidos
      const nit = (g.nitEmisor || g.nit || '').trim();
      const cuf = (g.cuf || '').trim();
      const valida = nit && cuf && cuf.length >= 10;

      if (valida) {
        totalGastosCompensables += monto;
        totalIVAFacturas += iva;
      }

      detalleGastos.push({
        numero: g.numeroFactura || g.numero || 'S/N',
        proveedor: g.proveedor || g.descripcion || '—',
        monto,
        iva,
        nit,
        cuf,
        valida,
        motivo: valida ? 'OK' : 'Sin NIT/CUF válido'
      });
    });

    const compensacion = this._r2(totalIVAFacturas);
    const rcIVAPagar = this._r2(Math.max(0, rcIVATeorico - compensacion));
    const porcentajeCompensado = rcIVATeorico > 0
      ? this._r2((Math.min(rcIVATeorico, compensacion) / rcIVATeorico) * 100)
      : 0;

    return {
      exito: true,
      ingresos: this._r2(ingresosNum),
      rcIVATeorico,
      gastosCompensables: this._r2(totalGastosCompensables),
      ivAFacturas: compensacion,
      cantidadFacturas: gastos.length,
      facturasAprovechables: detalleGastos.filter(g => g.valida).length,
      facturasNoAprovechables: detalleGastos.filter(g => !g.valida).length,
      compensacion,
      rcIVAPagar,
      porcentajeCompensado,
      detalleGastos
    };
  }

  /**
   * Calcula la retención de RC-IVA a un proveedor.
   *
   * Regla boliviana:
   *   - Si el proveedor NO emite factura válida → retención 13%
   *   - Si el proveedor está en régimen especial (RTS, STI, RAU) → retención 13%
   *   - Si el proveedor emite factura válida con NIT+CUF → NO retención
   *
   * @param {number} montoPago - Monto bruto del pago
   * @param {Object} [opciones]
   * @param {boolean} [opciones.emiteFacturaValida] - Si emite factura con NIT+CUF
   * @param {string} [opciones.regimenProveedor] - Régimen del proveedor (RG, RTS, STI, RAU)
   * @param {boolean} [opciones.esSujetoRCIVA] - Si es sujeto del RC-IVA
   * @returns {Object}
   */
  calcularRetencionRCIVA(montoPago, opciones = {}) {
    const monto = Number(montoPago) || 0;

    // Determinar si aplica retención
    const emiteFacturaValida = opciones.emiteFacturaValida === true;
    const regimen = (opciones.regimenProveedor || 'RG').toUpperCase();
    const esSujetoRCIVA = opciones.esSujetoRCIVA === true;

    // Regímenes especiales que NO emiten crédito fiscal → aplica retención
    const regimenesConRetencion = ['RTS', 'STI', 'RAU', 'SIETE-RG'];
    const regimenEspecial = regimenesConRetencion.includes(regimen);

    let retiene = false;
    let motivo = '';

    if (!emiteFacturaValida) {
      retiene = true;
      motivo = 'Proveedor sin factura válida (sin NIT/CUF)';
    } else if (regimenEspecial) {
      retiene = true;
      motivo = `Proveedor en régimen especial (${regimen})`;
    } else if (esSujetoRCIVA) {
      retiene = true;
      motivo = 'Proveedor sujeto pasivo del RC-IVA';
    } else {
      motivo = 'Proveedor con factura válida en Régimen General';
    }

    const retencionRCIVA = retiene ? this._r2(monto * this.PORCENTAJE_IVA) : 0;
    const netoAPagar = this._r2(monto - retencionRCIVA);

    return {
      exito: true,
      montoPago: monto,
      emiteFacturaValida,
      regimenProveedor: regimen,
      esSujetoRCIVA,
      retiene,
      motivo,
      retencionRCIVA,
      netoAPagar
    };
  }

  /**
   * Calcula la retención de IT (3%) a un proveedor.
   *
   * Regla boliviana: se retiene IT cuando:
   *   - El proveedor es persona natural no inscrita
   *   - Servicios profesionales sin factura
   *   - Alquileres a personas naturales
   *
   * @param {number} montoPago - Monto bruto del pago
   * @param {Object} [opciones]
   * @param {boolean} [opciones.aplicaRetencionIT]
   * @returns {Object}
   */
  calcularRetencionIT(montoPago, opciones = {}) {
    const monto = Number(montoPago) || 0;
    const aplica = opciones.aplicaRetencionIT === true;

    const retencionIT = aplica ? this._r2(monto * 0.03) : 0;
    const netoAPagar = this._r2(monto - retencionIT);

    return {
      exito: true,
      montoPago: monto,
      aplicaRetencionIT: aplica,
      retencionIT,
      netoAPagar,
      motivo: aplica
        ? 'Proveedor sujeto a retención de IT (persona natural / sin inscripción)'
        : 'No aplica retención de IT'
    };
  }

  /**
   * Calcula las retenciones combinadas (RC-IVA + IT) a un proveedor.
   *
   * @param {number} montoPago
   * @param {Object} opciones - Opciones combinadas para RC-IVA e IT
   * @returns {Object}
   */
  calcularRetencionesCombinadas(montoPago, opciones = {}) {
    const rcIVA = this.calcularRetencionRCIVA(montoPago, opciones);
    const it = this.calcularRetencionIT(montoPago, opciones);

    const totalRetenido = this._r2(rcIVA.retencionRCIVA + it.retencionIT);
    const netoAPagar = this._r2(montoPago - totalRetenido);

    return {
      exito: true,
      montoPago,
      retencionRCIVA: rcIVA.retencionRCIVA,
      retencionIT: it.retencionIT,
      totalRetenido,
      netoAPagar,
      motivoRCIVA: rcIVA.motivo,
      motivoIT: it.motivo,
      retieneRCIVA: rcIVA.retiene,
      retieneIT: it.aplicaRetencionIT
    };
  }

  /**
   * Registra una retención practicada a un proveedor.
   *
   * @param {Object} datos - Datos de la retención
   * @returns {Object}
   */
  registrarRetencionProveedor(datos) {
    const calculo = this.calcularRetencionesCombinadas(
      datos.montoPago,
      {
        emiteFacturaValida: datos.emiteFacturaValida,
        regimenProveedor: datos.regimenProveedor,
        esSujetoRCIVA: datos.esSujetoRCIVA,
        aplicaRetencionIT: datos.aplicaRetencionIT
      }
    );

    const retencion = {
      id: 'ret-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 6),
      tipoRetencion: 'PROVEEDOR',
      fecha: datos.fecha || new Date().toISOString().split('T')[0],
      periodo: (datos.fecha || new Date().toISOString()).slice(0, 7),
      proveedorId: datos.proveedorId || null,
      proveedorNombre: datos.proveedorNombre || 'Proveedor externo',
      proveedorNIT: datos.proveedorNIT || '',
      montoPago: datos.montoPago,
      retencionRCIVA: calculo.retencionRCIVA,
      retencionIT: calculo.retencionIT,
      totalRetenido: calculo.totalRetenido,
      netoAPagar: calculo.netoAPagar,
      motivoRCIVA: calculo.motivoRCIVA,
      motivoIT: calculo.motivoIT,
      creadaEn: new Date().toISOString()
    };

    // Guardar en colección de retenciones
    const COLLECCION = 'retenciones_proveedores';
    if (!this.almacenamiento.obtener(COLLECCION)) {
      this.almacenamiento.guardar(COLLECCION, []);
    }
    this.almacenamiento.guardar(COLLECCION, retencion);

    console.log(`📋 Retención registrada: ${retencion.proveedorNombre} — Total retenido ${this._fmt(retencion.totalRetenido)}`);

    return { exito: true, retencion, calculo };
  }

  /**
   * Obtiene las retenciones de RC-IVA a empleados del período.
   *
   * Integra con el Módulo 4 (Nómina) para obtener el RC-IVA retenido
   * a cada empleado como parte de su planilla.
   *
   * @param {string} periodo - Formato "AAAA-MM"
   * @returns {Object}
   */
  obtenerRetencionesEmpleados(periodo) {
    if (!window.moduloNomina) {
      return { exito: false, errores: ['Módulo de Nómina no disponible'] };
    }

    const nomina = window.moduloNomina.calcularNominaMensual(periodo);
    if (!nomina.exito) {
      return { exito: false, errores: nomina.errores };
    }

    let totalRetenido = 0;
    const detalle = [];

    nomina.planilla.forEach(linea => {
      const rcIVA = linea.deducciones?.rcIVA?.aPagar || 0;
      if (rcIVA > 0) {
        totalRetenido += rcIVA;
        detalle.push({
          empleadoId: linea.empleadoId,
          empleadoNombre: linea.empleadoNombre,
          empleadoCI: linea.empleadoCI,
          totalDevengado: linea.devengados.totalDevengado,
          rcIVATeorico: this._r2(linea.devengados.totalDevengado * this.PORCENTAJE_IVA),
          rcIVACompensado: this._r2((linea.devengados.totalDevengado * this.PORCENTAJE_IVA) - rcIVA),
          rcIVAaPagar: rcIVA
        });
      }
    });

    return {
      exito: true,
      periodo,
      totalRetenido: this._r2(totalRetenido),
      cantidadEmpleados: detalle.length,
      detalle
    };
  }

  /**
   * Obtiene las retenciones a proveedores del período.
   *
   * @param {string} periodo
   * @returns {Object}
   */
  obtenerRetencionesProveedores(periodo) {
    const COLLECCION = 'retenciones_proveedores';
    const todas = this.almacenamiento.obtener(COLLECCION) || [];
    const delPeriodo = todas.filter(r => r.periodo === periodo);

    let totalRCIVA = 0;
    let totalIT = 0;

    delPeriodo.forEach(r => {
      totalRCIVA += r.retencionRCIVA || 0;
      totalIT += r.retencionIT || 0;
    });

    return {
      exito: true,
      periodo,
      totalRCIVA: this._r2(totalRCIVA),
      totalIT: this._r2(totalIT),
      totalRetenido: this._r2(totalRCIVA + totalIT),
      cantidad: delPeriodo.length,
      detalle: delPeriodo
    };
  }

  /**
   * Genera la estructura del Formulario 110 del SIN (Retenciones).
   *
   * El Form. 110 es mensual e incluye:
   *   - Retenciones de RC-IVA a empleados
   *   - Retenciones de RC-IVA a proveedores
   *   - Retenciones de IT a proveedores
   *
   * @param {string} periodo
   * @returns {Object}
   */
  generarFormulario110(periodo) {
    const retEmpleados = this.obtenerRetencionesEmpleados(periodo);
    const retProveedores = this.obtenerRetencionesProveedores(periodo);

    if (!retEmpleados.exito) {
      return { exito: false, errores: retEmpleados.errores };
    }

    const nitEmpresa = (window.BOLIVIA && window.BOLIVIA.NIT_EMPRESA) || '000000000-0';
    const [anio, mes] = periodo.split('-').map(Number);
    const fechaVencimiento = this.periodosFiscales
      ? this.periodosFiscales.calcularFechaVencimiento(nitEmpresa, periodo)
      : null;

    // Total RC-IVA retenido = empleados + proveedores
    const totalRCIVARetenido = this._r2(
      (retEmpleados.totalRetenido || 0) + (retProveedores.totalRCIVA || 0)
    );
    const totalITRetenido = retProveedores.totalIT || 0;
    const totalRetenido = this._r2(totalRCIVARetenido + totalITRetenido);

    const formulario = {
      // Datos del contribuyente
      nit: nitEmpresa,
      razonSocial: (window.BOLIVIA && window.BOLIVIA.RAZON_SOCIAL) || 'EMPRESA S.A.',
      periodoFiscal: periodo,
      gestion: anio,
      mes,
      tipoFormulario: 'FORM_110',

      // Fechas
      fechaGeneracion: new Date().toISOString(),
      fechaVencimiento,

      // Sección 1: Retenciones de RC-IVA a empleados
      rcIVAEmpleados: {
        cantidadEmpleados: retEmpleados.cantidadEmpleados,
        totalRetenido: retEmpleados.totalRetenido,
        detalle: retEmpleados.detalle
      },

      // Sección 2: Retenciones de RC-IVA a proveedores
      rcIVAProveedores: {
        cantidadProveedores: retProveedores.cantidad,
        totalRetenido: retProveedores.totalRCIVA,
        detalle: retProveedores.detalle.filter(d => d.retencionRCIVA > 0)
      },

      // Sección 3: Retenciones de IT a proveedores
      itProveedores: {
        cantidadProveedores: retProveedores.detalle.filter(d => d.retencionIT > 0).length,
        totalRetenido: retProveedores.totalIT,
        detalle: retProveedores.detalle.filter(d => d.retencionIT > 0)
      },

      // Liquidación final
      liquidacion: {
        totalRCIVARetenido,
        totalITRetenido,
        totalRetenido
      },

      // Resultado
      resultado: {
        aPagar: totalRetenido,
        presentacion: 'PENDIENTE'
      },

      estado: 'GENERADO',
      declarado: false,
      pagado: false
    };

    // Guardar en período fiscal
    const periodoFiscal = this.periodosFiscales ? this.periodosFiscales.obtenerPeriodo(periodo) : null;
    if (periodoFiscal) {
      this.periodosFiscales.actualizarPeriodo(periodo, {
        rcIVA: {
          retencionesEmpleados: retEmpleados.totalRetenido,
          retencionesProveedores: retProveedores.totalRCIVA + retProveedores.totalIT,
          totalRetenido,
          formulario110: formulario
        }
      });
    }

    console.log(`📄 Form. 110 generado para ${periodo}: ${this._fmt(totalRetenido)} retenidos`);
    return { exito: true, formulario, retenciones: { empleados: retEmpleados, proveedores: retProveedores } };
  }

    // ══════════════════════════════════════════════════════════
  // RETENCIONES: MÉTODO UNIFICADO + ASIENTOS CONTABLES
  // ══════════════════════════════════════════════════════════

  /**
   * Registra una retención completa con asiento contable y comprobante.
   *
   * Genera:
   *   1. La retención calculada (RC-IVA + IT si aplica)
   *   2. El comprobante de retención (documento fuente)
   *   3. El asiento contable:
   *        Gasto (monto total)           Bs X (Debe)
   *            Retención RC-IVA por Pagar (2.1.16)  Bs Y (Haber)
   *            Retención IT por Pagar (2.1.17)      Bs Z (Haber)
   *            Bancos (1.1.02)                      Bs (X-Y-Z) (Haber)
   *
   * @param {Object} datos - Datos de la retención
   * @returns {Object}
   */
  registrarRetencion(datos) {
    const calculo = this.calcularRetencionesCombinadas(
      datos.montoPago,
      {
        emiteFacturaValida: datos.emiteFacturaValida,
        regimenProveedor: datos.regimenProveedor,
        esSujetoRCIVA: datos.esSujetoRCIVA,
        aplicaRetencionIT: datos.aplicaRetencionIT
      }
    );

    if (!calculo.exito) {
      return { exito: false, errores: ['Error al calcular retenciones'] };
    }

    const fecha = datos.fecha || new Date().toISOString().split('T')[0];
    const periodo = fecha.slice(0, 7);

    // 1. Generar el comprobante de retención (documento fuente)
    const comprobante = {
      id: 'comp-ret-' + Date.now().toString(36),
      tipoDocumento: 'COMPROBANTE_RETENCION',
      numeroComprobante: this._generarNumeroComprobante(),
      fecha,
      periodo,
      proveedorNombre: datos.proveedorNombre || 'Sin nombre',
      proveedorNIT: datos.proveedorNIT || '',
      concepto: datos.concepto || 'Servicios profesionales',
      montoPago: datos.montoPago,
      retencionRCIVA: calculo.retencionRCIVA,
      retencionIT: calculo.retencionIT,
      totalRetenido: calculo.totalRetenido,
      netoAPagar: calculo.netoAPagar,
      creadoEn: new Date().toISOString()
    };

    // 2. Generar asiento contable
    let asiento = null;
    if (window.motorContable && calculo.totalRetenido > 0) {
      const lineas = [
        {
          cuentaCodigo: '5.3.07',
          cuentaNombre: 'Gastos por Servicios Profesionales',
          debe: calculo.montoPago,
          haber: 0
        }
      ];

      if (calculo.retencionRCIVA > 0) {
        lineas.push({
          cuentaCodigo: '2.1.18',
          cuentaNombre: 'Retención RC-IVA por Pagar',
          debe: 0,
          haber: calculo.retencionRCIVA
        });
      }

      if (calculo.retencionIT > 0) {
        lineas.push({
          cuentaCodigo: '2.1.19',
          cuentaNombre: 'Retención IT por Pagar',
          debe: 0,
          haber: calculo.retencionIT
        });
      }

      lineas.push({
        cuentaCodigo: '1.1.02',
        cuentaNombre: 'Bancos',
        debe: 0,
        haber: calculo.netoAPagar
      });

      const resultadoAsiento = window.motorContable.crearAsientoManual({
        fecha,
        concepto: `Retención a ${comprobante.proveedorNombre} — ${comprobante.numeroComprobante}`,
        lineas
      });

      if (resultadoAsiento.exito) {
        asiento = resultadoAsiento.asiento;
        comprobante.asientoId = asiento.id;
        comprobante.asientoNumero = asiento.numero;
      }
    }

    // 3. Guardar comprobante en colección
    const COLLECCION = 'comprobantes_retencion';
    if (!this.almacenamiento.obtener(COLLECCION)) {
      this.almacenamiento.guardar(COLLECCION, []);
    }
    this.almacenamiento.guardar(COLLECCION, comprobante);

    // 4. Registrar también como retención de proveedor (compatibilidad Fase 5.7)
    this.registrarRetencionProveedor({
      montoPago: datos.montoPago,
      proveedorNombre: datos.proveedorNombre,
      proveedorNIT: datos.proveedorNIT,
      emiteFacturaValida: datos.emiteFacturaValida,
      regimenProveedor: datos.regimenProveedor,
      esSujetoRCIVA: datos.esSujetoRCIVA,
      aplicaRetencionIT: datos.aplicaRetencionIT,
      fecha
    });

    console.log(`📄 Retención registrada: ${comprobante.numeroComprobante} — RC-IVA ${this._fmt(calculo.retencionRCIVA)} + IT ${this._fmt(calculo.retencionIT)}`);

    return {
      exito: true,
      comprobante,
      asiento,
      calculo
    };
  }

  /**
   * Obtiene TODAS las retenciones del período (empleados + proveedores).
   * Método unificado para el Form. 110.
   *
   * @param {string} periodo
   * @returns {Object}
   */
  obtenerRetencionesDelPeriodo(periodo) {
    const empleados = this.obtenerRetencionesEmpleados(periodo);
    const proveedores = this.obtenerRetencionesProveedores(periodo);

    const totalRCIVA = this._r2(
      (empleados.totalRetenido || 0) + (proveedores.totalRCIVA || 0)
    );
    const totalIT = proveedores.totalIT || 0;
    const totalRetenido = this._r2(totalRCIVA + totalIT);

    return {
      exito: true,
      periodo,
      rcIVAEmpleados: empleados.totalRetenido || 0,
      rcIVAProveedores: proveedores.totalRCIVA || 0,
      totalRCIVA,
      totalIT,
      totalRetenido,
      cantidadEmpleados: empleados.cantidadEmpleados || 0,
      cantidadProveedores: proveedores.cantidad || 0,
      detalleEmpleados: empleados.detalle || [],
      detalleProveedores: proveedores.detalle || []
    };
  }

  /**
   * Genera el asiento de pago de retenciones al SIN.
   *
   * Asiento:
   *   Retención RC-IVA por Pagar (2.1.16)   Bs X (Debe)
   *   Retención IT por Pagar (2.1.17)       Bs Y (Debe)
   *       Bancos (1.1.02)                           Bs (X+Y) (Haber)
   *
   * @param {string} periodo
   * @returns {Object}
   */
  generarAsientoPagoRetenciones(periodo) {
    const retenciones = this.obtenerRetencionesDelPeriodo(periodo);

    if (retenciones.totalRetenido === 0) {
      return { exito: false, errores: ['No hay retenciones que pagar en el período'] };
    }

    const lineas = [];

    if (retenciones.totalRCIVA > 0) {
      lineas.push({
        cuentaCodigo: '2.1.16',
        cuentaNombre: 'Retención RC-IVA por Pagar',
        debe: retenciones.totalRCIVA,
        haber: 0
      });
    }

    if (retenciones.totalIT > 0) {
      lineas.push({
        cuentaCodigo: '2.1.17',
        cuentaNombre: 'Retención IT por Pagar',
        debe: retenciones.totalIT,
        haber: 0
      });
    }

    lineas.push({
      cuentaCodigo: '1.1.02',
      cuentaNombre: 'Bancos',
      debe: 0,
      haber: retenciones.totalRetenido
    });

    if (!window.motorContable) {
      return { exito: false, errores: ['Motor Contable no disponible'] };
    }

    const resultado = window.motorContable.crearAsientoManual({
      fecha: new Date().toISOString().split('T')[0],
      concepto: `Pago retenciones al SIN — Período ${periodo}`,
      lineas
    });

    if (!resultado.exito) {
      return { exito: false, errores: resultado.errores };
    }

    console.log(`💸 Asiento de pago de retenciones generado: ${resultado.asiento.numero}`);

    return {
      exito: true,
      asiento: resultado.asiento,
      periodo,
      totalPagado: retenciones.totalRetenido,
      desglose: {
        rcIVA: retenciones.totalRCIVA,
        it: retenciones.totalIT
      }
    };
  }

  /**
   * Genera número correlativo para comprobantes de retención.
   * @private
   */
  _generarNumeroComprobante() {
    const COLLECCION = 'comprobantes_retencion';
    const todos = this.almacenamiento.obtener(COLLECCION) || [];
    const año = new Date().getFullYear();
    const correlativo = todos.filter(c =>
      c.numeroComprobante && c.numeroComprobante.startsWith(`CRET-${año}`)
    ).length + 1;
    return `CRET-${año}-${String(correlativo).padStart(4, '0')}`;
  }

    // ══════════════════════════════════════════════════════════
  // IUE-BE — IUE PARA BENEFICIARIOS DEL EXTERIOR
  // ══════════════════════════════════════════════════════════

  /**
   * Calcula el IUE-BE (IUE para Beneficiarios del Exterior).
   *
   * Lógica boliviana:
   *   - Se aplica sobre remesas de utilidades o dividendos al exterior.
   *   - Tasa nominal: 25% (tasa del IUE).
   *   - Base imponible presunta: 50% del monto remesado.
   *   - Tasa EFECTIVA: 25% × 50% = 12.5%.
   *
   * Base legal: Art. 48 Ley 843, modificado por Ley 091
   * Formulario SIN: Form. 530 (IUE-BE)
   *
   * @param {number} montoRemesa - Monto bruto a remesar al exterior
   * @returns {Object}
   */
  calcularIUEBE(montoRemesa) {
    const monto = Number(montoRemesa) || 0;

    if (monto <= 0) {
      return {
        exito: false,
        errores: ['El monto de la remesa debe ser positivo']
      };
    }

    // Base imponible presunta: 50% del monto remesado
    const baseImponible = this._r2(monto * 0.50);

    // IUE-BE: 25% sobre la base presunta (= 12.5% efectivo)
    const iueBE = this._r2(baseImponible * 0.25);

    // Equivalente directo: 12.5% del monto
    const iueBE_Efectivo = this._r2(monto * 0.125);

    // Neto a remesar al exterior
    const netoRemesado = this._r2(monto - iueBE);

    // Tasa efectiva para referencia
    const tasaEfectiva = this._r2((iueBE / monto) * 100);

    return {
      exito: true,
      montoRemesa: monto,
      baseImponible,
      tasaNominal: 0.25,         // 25% (IUE)
      porcentajeBase: 0.50,      // 50% presunción
      tasaEfectiva: 0.125,       // 12.5%
      tasaEfectivaPorcentaje: tasaEfectiva,
      iueBE,
      iueBE_Efectivo,
      netoRemesado,
      formulario: 'FORM_530',
      detalleCalculo: [
        `Monto remesado:        ${this._fmt(monto)}`,
        `Base presunta (50%):   ${this._fmt(baseImponible)}`,
        `IUE-BE (25% × 50%):    ${this._fmt(iueBE)}`,
        `Tasa efectiva:         ${tasaEfectiva.toFixed(2)}%`,
        `Neto a remesar:        ${this._fmt(netoRemesado)}`
      ].join('\n')
    };
  }

  /**
   * Registra una remesa de utilidades al exterior con asiento contable.
   *
   * Genera:
   *   1. El cálculo del IUE-BE
   *   2. El documento fuente (COMPROBANTE_REMESA_EXTERIOR)
   *   3. El asiento contable:
   *        Utilidades Retenidas (3.2.02)       Bs X (Debe)
   *            IUE-BE por Pagar (2.2.03)             Bs Y (Haber)
   *            Bancos (1.1.02)                       Bs Z (Haber)
   *
   * @param {Object} datos
   * @returns {Object}
   */
  registrarRemesaExterior(datos) {
    const calculo = this.calcularIUEBE(datos.montoRemesa);

    if (!calculo.exito) {
      return { exito: false, errores: calculo.errores };
    }

    const fecha = datos.fecha || new Date().toISOString().split('T')[0];
    const periodo = fecha.slice(0, 7);

    // 1. Crear comprobante de remesa (documento fuente)
    const comprobante = {
      id: 'rem-ext-' + Date.now().toString(36),
      tipoDocumento: 'COMPROBANTE_REMESA_EXTERIOR',
      numeroComprobante: this._generarNumeroRemesaExterior(),
      fecha,
      periodo,
      beneficiarioNombre: datos.beneficiarioNombre || 'Beneficiario del exterior',
      beneficiarioPais: datos.beneficiarioPais || 'No especificado',
      beneficiarioIdentificacion: datos.beneficiarioIdentificacion || '',
      concepto: datos.concepto || 'Remesa de utilidades/dividendos',
      montoRemesa: calculo.montoRemesa,
      baseImponible: calculo.baseImponible,
      iueBE: calculo.iueBE,
      netoRemesado: calculo.netoRemesado,
      formulario: 'FORM_530',
      creadoEn: new Date().toISOString()
    };

    // 2. Generar asiento contable
    let asiento = null;
    if (window.motorContable) {
      const lineas = [
        {
          cuentaCodigo: '3.2.02',
          cuentaNombre: 'Utilidades Retenidas',
          debe: calculo.montoRemesa,
          haber: 0
        },
        {
          cuentaCodigo: '2.2.03',
          cuentaNombre: 'IUE-BE por Pagar',
          debe: 0,
          haber: calculo.iueBE
        },
        {
          cuentaCodigo: '1.1.02',
          cuentaNombre: 'Bancos',
          debe: 0,
          haber: calculo.netoRemesado
        }
      ];

      const resultadoAsiento = window.motorContable.crearAsientoManual({
        fecha,
        concepto: `IUE-BE remesa a ${comprobante.beneficiarioNombre} (${comprobante.beneficiarioPais}) — ${comprobante.numeroComprobante}`,
        lineas
      });

      if (resultadoAsiento.exito) {
        asiento = resultadoAsiento.asiento;
        comprobante.asientoId = asiento.id;
        comprobante.asientoNumero = asiento.numero;
      }
    }

    // 3. Guardar comprobante en colección
    const COLLECCION = 'remesas_exterior';
    if (!this.almacenamiento.obtener(COLLECCION)) {
      this.almacenamiento.guardar(COLLECCION, []);
    }
    this.almacenamiento.guardar(COLLECCION, comprobante);

    // 4. También generar asiento del gasto (si corresponde)
    // El IUE-BE como gasto del ejercicio se registra en 5.6.03
    // (en muchos sistemas el IUE-BE se considera costo de distribución,
    // no gasto del ejercicio, por eso no se genera aquí)

    console.log(`🌍 Remesa exterior registrada: ${comprobante.numeroComprobante} — IUE-BE ${this._fmt(calculo.iueBE)}`);

    return {
      exito: true,
      comprobante,
      asiento,
      calculo
    };
  }

  /**
   * Obtiene todas las remesas al exterior del período.
   *
   * @param {string} periodo - Formato "AAAA-MM" (opcional, si no se pasa, todas)
   * @returns {Object}
   */
  obtenerRemesasExterior(periodo = null) {
    const COLLECCION = 'remesas_exterior';
    const todas = this.almacenamiento.obtener(COLLECCION) || [];

    const filtradas = periodo
      ? todas.filter(r => r.periodo === periodo)
      : todas;

    let totalRemesado = 0;
    let totalIUEBE = 0;
    let totalNeto = 0;

    filtradas.forEach(r => {
      totalRemesado += r.montoRemesa || 0;
      totalIUEBE += r.iueBE || 0;
      totalNeto += r.netoRemesado || 0;
    });

    return {
      exito: true,
      periodo: periodo || 'TODOS',
      cantidad: filtradas.length,
      totalRemesado: this._r2(totalRemesado),
      totalIUEBE: this._r2(totalIUEBE),
      totalNetoRemesado: this._r2(totalNeto),
      detalle: filtradas
    };
  }

  /**
   * Genera la estructura del Formulario 530 del SIN (IUE-BE).
   *
   * El Form. 530 se presenta por cada remesa al exterior.
   *
   * @param {string} remesaId - ID de la remesa específica
   * @returns {Object}
   */
  generarFormulario530(remesaId) {
    const COLLECCION = 'remesas_exterior';
    const todas = this.almacenamiento.obtener(COLLECCION) || [];
    const remesa = todas.find(r => r.id === remesaId);

    if (!remesa) {
      return { exito: false, errores: ['Remesa no encontrada'] };
    }

    const nitEmpresa = (window.BOLIVIA && window.BOLIVIA.NIT_EMPRESA) || '000000000-0';
    const [anio, mes] = remesa.periodo.split('-').map(Number);

    const formulario = {
      // Datos del agente de retención (empresa boliviana)
      agenteRetencion: {
        nit: nitEmpresa,
        razonSocial: (window.BOLIVIA && window.BOLIVIA.RAZON_SOCIAL) || 'EMPRESA S.A.'
      },

      // Datos del beneficiario del exterior
      beneficiario: {
        nombre: remesa.beneficiarioNombre,
        pais: remesa.beneficiarioPais,
        identificacion: remesa.beneficiarioIdentificacion
      },

      // Datos de la remesa
      remesa: {
        fecha: remesa.fecha,
        periodoFiscal: remesa.periodo,
        gestion: anio,
        mes,
        concepto: remesa.concepto
      },

      // Liquidación del IUE-BE
      liquidacion: {
        montoRemesa: remesa.montoRemesa,
        baseImponible: remesa.baseImponible,
        tasaNominal: 0.25,
        porcentajeBase: 0.50,
        tasaEfectiva: 0.125,
        iueBE: remesa.iueBE,
        netoRemesado: remesa.netoRemesado
      },

      // Estado
      estado: 'GENERADO',
      presentado: false,
      pagado: false,
      numeroComprobante: remesa.numeroComprobante
    };

    console.log(`📄 Form. 530 generado: ${remesa.numeroComprobante} — IUE-BE ${this._fmt(remesa.iueBE)}`);

    return { exito: true, formulario, remesa };
  }

  /**
   * Genera número correlativo para comprobantes de remesa exterior.
   * @private
   *
   */
  _generarNumeroRemesaExterior() {
    const COLLECCION = 'remesas_exterior';
    const todos = this.almacenamiento.obtener(COLLECCION) || [];
    const año = new Date().getFullYear();
    const correlativo = todos.filter(c =>
      c.numeroComprobante && c.numeroComprobante.startsWith(`REXT-${año}`)
    ).length + 1;
    return `REXT-${año}-${String(correlativo).padStart(4, '0')}`;
  }
    // ══════════════════════════════════════════════════════════
  // REGÍMENES TRIBUTARIOS (RG, RTS, STI, RAU, SIETE-RG)
  // ══════════════════════════════════════════════════════════

  /**
   * Obtiene el régimen tributario de un contribuyente por su NIT.
   * Busca en catálogos de clientes/proveedores. Default: RG.
   *
   * @param {string} nit
   * @returns {Object}
   */
  obtenerRegimenContribuyente(nit) {
    if (!nit || typeof nit !== 'string') {
      return { exito: false, regimen: null, errores: ['NIT inválido'] };
    }

    const nitNormalizado = nit.trim();
    let regimenCodigo = 'RG';
    let fuente = 'DEFAULT';
    let contribuyente = null;

    // Buscar en catálogo de proveedores
    if (window.CatalogoProveedores) {
      const proveedores = window.CatalogoProveedores.obtenerTodos
        ? window.CatalogoProveedores.obtenerTodos()
        : (this.almacenamiento.obtener('proveedores') || []);
      const prov = proveedores.find(p => p.nit === nitNormalizado);
      if (prov) {
        regimenCodigo = prov.regimenTributario || 'RG';
        fuente = 'CATALOGO_PROVEEDORES';
        contribuyente = { tipo: 'PROVEEDOR', datos: prov };
      }
    }

    // Buscar en catálogo de clientes
    if (!contribuyente && window.CatalogoClientes) {
      const clientes = window.CatalogoClientes.obtenerTodos
        ? window.CatalogoClientes.obtenerTodos()
        : (this.almacenamiento.obtener('clientes') || []);
      const cli = clientes.find(c => c.nit === nitNormalizado);
      if (cli) {
        regimenCodigo = cli.regimenTributario || 'RG';
        fuente = 'CATALOGO_CLIENTES';
        contribuyente = { tipo: 'CLIENTE', datos: cli };
      }
    }

    const regimen = window.REGIMENES_TRIBUTARIOS
      ? window.REGIMENES_TRIBUTARIOS[regimenCodigo]
      : null;

    if (!regimen) {
      return {
        exito: false,
        regimen: null,
        regimenCodigo,
        errores: [`Régimen ${regimenCodigo} no reconocido`]
      };
    }

    return {
      exito: true,
      nit: nitNormalizado,
      regimen,
      regimenCodigo,
      fuente,
      contribuyente
    };
  }

  /**
   * Valida si un régimen tributario permite cierta operación.
   *
   * @param {string} regimenCodigo
   * @param {string} tipoOperacion
   * @param {Object} [datos]
   * @returns {Object} { permitido, advertencia, detalle }
   */
  validarRegimenParaOperacion(regimenCodigo, tipoOperacion, datos = {}) {
    const regimen = window.REGIMENES_TRIBUTARIOS
      ? window.REGIMENES_TRIBUTARIOS[regimenCodigo]
      : null;

    if (!regimen) {
      return {
        permitido: false,
        advertencia: `Régimen ${regimenCodigo} no reconocido`,
        detalle: null
      };
    }

    switch (tipoOperacion) {

      case 'EMITIR_CREDITO_FISCAL':
      case 'COMPENSAR_IVA': {
        const permite = regimen.emiteCreditoFiscal === true;

        // PARTICULARIDAD del SIETE-RG: acumula crédito para migración
        if (regimenCodigo === 'SIETE-RG') {
          return {
            permitido: false,
            advertencia: `⚠️ ${regimen.nombre}: NO emite crédito fiscal actualmente, ` +
              `pero el IVA se ACUMULA para cuando el contribuyente migre al RG.`,
            detalle: {
              acumulaCredito: true,
              motivo: 'Régimen SIETE-RG con acumulación de crédito'
            }
          };
        }

        return {
          permitido: permite,
          advertencia: permite
            ? `✅ ${regimen.nombre}: permite ${tipoOperacion === 'COMPENSAR_IVA' ? 'compensar IVA' : 'emitir crédito fiscal'}`
            : `❌ ${regimen.nombre}: NO permite ${tipoOperacion === 'COMPENSAR_IVA' ? 'compensar IVA' : 'emitir crédito fiscal'}`,
          detalle: {
            emiteCreditoFiscal: regimen.emiteCreditoFiscal,
            motivo: permite ? 'Régimen General autorizado' : 'Régimen sin crédito fiscal'
          }
        };
      }

      case 'EMITIR_FACTURA_SIN': {
        return {
          permitido: regimen.emiteFacturaSIN === true,
          advertencia: regimen.emiteFacturaSIN
            ? `✅ ${regimen.nombre}: emite factura con CUF/NIT`
            : `❌ ${regimen.nombre}: emite nota de venta (sin CUF)`,
          detalle: { emiteFacturaSIN: regimen.emiteFacturaSIN }
        };
      }

      case 'LLEVAR_CONTABILIDAD': {
        return {
          permitido: true,
          obligatorio: regimen.requiereContabilidad === true,
          advertencia: regimen.requiereContabilidad
            ? `📋 ${regimen.nombre}: contabilidad OBLIGATORIA`
            : `📋 ${regimen.nombre}: contabilidad NO requerida`,
          detalle: { requiereContabilidad: regimen.requiereContabilidad }
        };
      }

      case 'VERIFICAR_LIMITE_INGRESOS': {
        if (!datos.ingresosAnuales) {
          return {
            permitido: true,
            advertencia: 'Sin datos de ingresos para verificar',
            detalle: null
          };
        }

        const limite = regimen.limites?.ingresosAnuales;
        if (limite === null || limite === undefined) {
          return {
            permitido: true,
            advertencia: `✅ ${regimen.nombre}: sin límite de ingresos`,
            detalle: { ingresosAnuales: datos.ingresosAnuales, limite: null }
          };
        }

        const supera = datos.ingresosAnuales > limite;
        return {
          permitido: !supera,
          advertencia: supera
            ? `⚠️ Ingresos ${this._fmt(datos.ingresosAnuales)} SUPERAN el límite de ${this._fmt(limite)} del ${regimen.nombre}`
            : `✅ Ingresos dentro del límite de ${this._fmt(limite)}`,
          detalle: {
            ingresosAnuales: datos.ingresosAnuales,
            limite,
            supera
          }
        };
      }

      default:
        return {
          permitido: true,
          advertencia: `Operación ${tipoOperacion} no validada específicamente`,
          detalle: null
        };
    }
  }

  /**
   * Detecta si un contribuyente debe migrar a otro régimen.
   *
   * @param {Object} contribuyente
   * @returns {Object}
   */
  detectarMigracionRegimen(contribuyente) {
    if (!contribuyente) {
      return { exito: false, errores: ['Contribuyente no proporcionado'] };
    }

    const regimenActual = contribuyente.regimenTributario || 'RG';
    const regimen = window.REGIMENES_TRIBUTARIOS
      ? window.REGIMENES_TRIBUTARIOS[regimenActual]
      : null;

    if (!regimen) {
      return {
        exito: false,
        errores: [`Régimen actual ${regimenActual} no reconocido`]
      };
    }

    const motivos = [];
    const limites = regimen.limites || {};
    const ingresosAnuales = Number(contribuyente.ingresosAnuales) || 0;
    const aniosAntiguedad = Number(contribuyente.aniosAntiguedad) || 0;
    const empleados = Number(contribuyente.empleados) || 0;

    // Verificar límites de ingresos
    if (limites.ingresosAnuales !== null && limites.ingresosAnuales !== undefined) {
      if (ingresosAnuales > limites.ingresosAnuales) {
        motivos.push(
          `📈 Ingresos anuales (${this._fmt(ingresosAnuales)}) superan el límite de ` +
          `${this._fmt(limites.ingresosAnuales)} del ${regimen.nombre}`
        );
      }
    }

    // Verificar años de antigüedad (SIETE-RG)
    if (limites.aniosAntiguedad !== null && limites.aniosAntiguedad !== undefined) {
      if (aniosAntiguedad >= limites.aniosAntiguedad) {
        motivos.push(
          `📅 Antigüedad en régimen (${aniosAntiguedad} años) alcanza el límite de ` +
          `${limites.aniosAntiguedad} años del ${regimen.nombre}`
        );
      }
    }

    // Verificar empleados (RTS)
    if (limites.empleados !== null && limites.empleados !== undefined) {
      if (empleados > limites.empleados) {
        motivos.push(
          `👥 Empleados (${empleados}) superan el límite de ${limites.empleados} del ${regimen.nombre}`
        );
      }
    }

    const debeMigrar = motivos.length > 0;
    const regimenSugerido = debeMigrar ? 'RG' : regimenActual;
    const regimenSugeridoInfo = debeMigrar
      ? (window.REGIMENES_TRIBUTARIOS ? window.REGIMENES_TRIBUTARIOS['RG'] : null)
      : null;

    let advertencia = '';
    if (debeMigrar) {
      advertencia = `⚠️ El contribuyente debe migrar al Régimen General (RG) por: ${motivos.join(' | ')}`;
    } else {
      advertencia = `✅ Contribuyente dentro de los límites del ${regimen.nombre}`;
    }

    return {
      exito: true,
      debeMigrar,
      regimenActual,
      regimenSugerido,
      regimenSugeridoInfo,
      motivos,
      advertencia,
      datosEvaluados: {
        ingresosAnuales,
        aniosAntiguedad,
        empleados
      }
    };
  }

  /**
   * Obtiene un resumen comparativo de todos los regímenes.
   *
   * @returns {Array}
   */
  obtenerResumenRegimenes() {
    if (!window.REGIMENES_TRIBUTARIOS) return [];

    return Object.values(window.REGIMENES_TRIBUTARIOS).map(r => ({
      codigo: r.codigo,
      nombre: r.nombre,
      descripcion: r.descripcion,
      impuestos: r.impuestos,
      periodicidad: r.periodicidad,
      emiteCreditoFiscal: r.emiteCreditoFiscal,
      limiteIngresos: r.limites?.ingresosAnuales || null,
      vigencia: r.vigencia,
      esNuevo: r.esNuevo || false
    }));
  }

    // ══════════════════════════════════════════════════════════
  // ASIENTOS CONTABLES DE IMPUESTOS
  // ══════════════════════════════════════════════════════════

  /**
   * Genera el asiento contable de la conciliación del IVA (Form. 200).
   *
   * Asiento cuando hay IVA a pagar:
   *   IVA Débito Fiscal (2.1.03)       Bs X (Debe)
   *       IVA Crédito Fiscal (1.1.07)      Bs Y (Haber)
   *       IVA por Pagar (2.1.04)           Bs (X-Y) (Haber)
   *
   * Asiento cuando hay saldo a favor:
   *   IVA Débito Fiscal (2.1.03)       Bs X (Debe)
   *   IVA Saldo a Favor (1.1.08)       Bs (Y-X) (Debe)
   *       IVA Crédito Fiscal (1.1.07)      Bs Y (Haber)
   *
   * @param {Object} conciliacion - Resultado de conciliarIVA()
   * @returns {Object}
   */
  generarAsientoIVA(conciliacion) {
    if (!conciliacion || !conciliacion.exito) {
      return { exito: false, errores: ['Conciliación inválida'] };
    }

    if (!window.motorContable) {
      return { exito: false, errores: ['Motor Contable no disponible'] };
    }

    const lineas = [];

    // Debe: IVA Débito Fiscal (si hay ventas)
    if (conciliacion.debitoFiscal > 0) {
      lineas.push({
        cuentaCodigo: '2.1.03',
        cuentaNombre: 'IVA Débito Fiscal',
        debe: conciliacion.debitoFiscal,
        haber: 0
      });
    }

    // Haber: IVA Crédito Fiscal (si hay compras aprovechables)
    if (conciliacion.creditoFiscal > 0) {
      lineas.push({
        cuentaCodigo: '1.1.07',
        cuentaNombre: 'IVA Crédito Fiscal',
        debe: 0,
        haber: conciliacion.creditoFiscal
      });
    }

    // Resultado: IVA por pagar o saldo a favor
    if (conciliacion.ivaPorPagar > 0) {
      lineas.push({
        cuentaCodigo: '2.1.04',
        cuentaNombre: 'IVA por Pagar',
        debe: 0,
        haber: conciliacion.ivaPorPagar
      });
    } else if (conciliacion.saldoFavorNuevo > 0 && conciliacion.debitoFiscal < conciliacion.creditoFiscal) {
      // Saldo a favor como activo (solo si crédito > débito en este período)
      const saldoEstePeriodo = this._r2(conciliacion.creditoFiscal - conciliacion.debitoFiscal);
      lineas.push({
        cuentaCodigo: '1.1.08',
        cuentaNombre: 'IVA Saldo a Favor',
        debe: saldoEstePeriodo,
        haber: 0
      });
    }

    if (lineas.length === 0) {
      return { exito: false, errores: ['No hay movimientos de IVA que registrar'] };
    }

    const concepto = `Conciliación IVA ${conciliacion.periodo} — ` +
      (conciliacion.ivaPorPagar > 0
        ? `A pagar ${this._fmt(conciliacion.ivaPorPagar)}`
        : `Saldo a favor ${this._fmt(conciliacion.saldoFavorNuevo)}`);

    const resultado = window.motorContable.crearAsientoManual({
      fecha: this._ultimoDiaDelMes(conciliacion.periodo),
      concepto,
      lineas
    });

    if (!resultado.exito) {
      return { exito: false, errores: resultado.errores };
    }

    console.log(`📝 Asiento IVA generado: ${resultado.asiento.numero} — ${concepto}`);
    return { exito: true, asiento: resultado.asiento, conciliacion };
  }

  /**
   * Genera el asiento contable del IT mensual (Form. 400).
   *
   * Asiento:
   *   Gasto IT (5.6.01)              Bs X (Debe)
   *       IT por Pagar (2.1.05)          Bs X (Haber)
   *
   * @param {Object} itCalculado - Resultado de calcularIT()
   * @returns {Object}
   */
  generarAsientoIT(itCalculado) {
    if (!itCalculado || !itCalculado.exito) {
      return { exito: false, errores: ['Cálculo de IT inválido'] };
    }

    if (!window.motorContable) {
      return { exito: false, errores: ['Motor Contable no disponible'] };
    }

    if (itCalculado.itPorPagar <= 0) {
      return { exito: false, errores: ['No hay IT a registrar'] };
    }

    const lineas = [
      {
        cuentaCodigo: '5.6.01',
        cuentaNombre: 'IT (Impuesto a las Transacciones)',
        debe: itCalculado.itPorPagar,
        haber: 0
      },
      {
        cuentaCodigo: '2.1.05',
        cuentaNombre: 'IT por Pagar',
        debe: 0,
        haber: itCalculado.itPorPagar
      }
    ];

    const concepto = `IT mensual ${itCalculado.periodo} — ${this._fmt(itCalculado.itPorPagar)} (3% sobre ${this._fmt(itCalculado.ingresosBrutos)})`;

    const resultado = window.motorContable.crearAsientoManual({
      fecha: this._ultimoDiaDelMes(itCalculado.periodo),
      concepto,
      lineas
    });

    if (!resultado.exito) {
      return { exito: false, errores: resultado.errores };
    }

    console.log(`📝 Asiento IT generado: ${resultado.asiento.numero} — ${this._fmt(itCalculado.itPorPagar)}`);
    return { exito: true, asiento: resultado.asiento, it: itCalculado };
  }

  /**
   * Genera el asiento contable del pago de IVA e IT al SIN.
   *
   * Asiento:
   *   IVA por Pagar (2.1.04)         Bs X (Debe)
   *   IT por Pagar (2.1.05)          Bs Y (Debe)
   *       Bancos (1.1.02)                  Bs (X+Y) (Haber)
   *
   * @param {string} periodo
   * @param {number} montoIVA - IVA a pagar
   * @param {number} montoIT - IT a pagar
   * @returns {Object}
   */
  generarAsientoPagoImpuestos(periodo, montoIVA, montoIT) {
    if (!window.motorContable) {
      return { exito: false, errores: ['Motor Contable no disponible'] };
    }

    const iva = this._r2(Number(montoIVA) || 0);
    const it = this._r2(Number(montoIT) || 0);
    const total = this._r2(iva + it);

    if (total <= 0) {
      return { exito: false, errores: ['No hay impuestos que pagar'] };
    }

    const lineas = [];

    if (iva > 0) {
      lineas.push({
        cuentaCodigo: '2.1.04',
        cuentaNombre: 'IVA por Pagar',
        debe: iva,
        haber: 0
      });
    }

    if (it > 0) {
      lineas.push({
        cuentaCodigo: '2.1.05',
        cuentaNombre: 'IT por Pagar',
        debe: it,
        haber: 0
      });
    }

    lineas.push({
      cuentaCodigo: '1.1.02',
      cuentaNombre: 'Bancos',
      debe: 0,
      haber: total
    });

    const concepto = `Pago de impuestos al SIN — Período ${periodo} ` +
      `(IVA ${this._fmt(iva)} + IT ${this._fmt(it)})`;

    const resultado = window.motorContable.crearAsientoManual({
      fecha: new Date().toISOString().split('T')[0],
      concepto,
      lineas
    });

    if (!resultado.exito) {
      return { exito: false, errores: resultado.errores };
    }

    console.log(`💸 Pago de impuestos: ${resultado.asiento.numero} — ${this._fmt(total)}`);
    return {
      exito: true,
      asiento: resultado.asiento,
      periodo,
      desglose: { iva, it, total }
    };
  }

  /**
   * Genera el asiento contable del IUE anual (Form. 500).
   *
   * Asiento:
   *   Gasto IUE (5.6.02)              Bs X (Debe)
   *       IUE por Pagar (2.2.02)          Bs X (Haber)
   *
   * @param {Object} iueCalculado - Resultado de calcularIUE()
   * @returns {Object}
   */
  generarAsientoIUE(iueCalculado) {
    if (!iueCalculado || !iueCalculado.exito) {
      return { exito: false, errores: ['Cálculo de IUE inválido'] };
    }

    if (!window.motorContable) {
      return { exito: false, errores: ['Motor Contable no disponible'] };
    }

    if (iueCalculado.iueDeterminado <= 0) {
      return { exito: false, errores: ['No hay IUE que registrar (pérdida o cero)'] };
    }

    const lineas = [
      {
        cuentaCodigo: '5.6.02',
        cuentaNombre: 'IUE (Impuesto a las Utilidades)',
        debe: iueCalculado.iueDeterminado,
        haber: 0
      },
      {
        cuentaCodigo: '2.2.02',
        cuentaNombre: 'IUE por Pagar',
        debe: 0,
        haber: iueCalculado.iueDeterminado
      }
    ];

    const concepto = `IUE Gestión ${iueCalculado.anio} — 25% sobre utilidad imponible ${this._fmt(iueCalculado.utilidadImponible)}`;

    const resultado = window.motorContable.crearAsientoManual({
      fecha: `${iueCalculado.anio}-12-31`,
      concepto,
      lineas
    });

    if (!resultado.exito) {
      return { exito: false, errores: resultado.errores };
    }

    console.log(`📝 Asiento IUE generado: ${resultado.asiento.numero} — ${this._fmt(iueCalculado.iueDeterminado)}`);
    return { exito: true, asiento: resultado.asiento, iue: iueCalculado };
  }

  /**
   * Genera el asiento contable de la compensación IT-IUE (Art. 77 Ley 843).
   *
   * Asiento:
   *   IUE por Pagar (2.2.02)          Bs X (Debe) [IUE determinado]
   *       IT Pagado Acumulado (1.1.15)    Bs Y (Haber) [IT usado]
   *       IUE por Pagar (2.2.02)          Bs (X-Y) (Haber) [Diferencia a pagar]
   *
   * ⚠️ Si IT > IUE: IUE = 0, el exceso se pierde (no genera asiento de pérdida).
   *
   * @param {Object} compensacion - Resultado de compensarITcontraIUE()
   * @returns {Object}
   */
  generarAsientoCompensacionIT(compensacion) {
    if (!compensacion || !compensacion.exito) {
      return { exito: false, errores: ['Compensación inválida'] };
    }

    if (!window.motorContable) {
      return { exito: false, errores: ['Motor Contable no disponible'] };
    }

    // Caso PERDIDA: no hay asiento de compensación
    if (compensacion.caso === 'PERDIDA') {
      return {
        exito: false,
        errores: ['No hay IUE en pérdida, no se genera asiento de compensación'],
        caso: 'PERDIDA'
      };
    }

    const lineas = [];

    // Debe: IUE por Pagar (total determinado)
    lineas.push({
      cuentaCodigo: '2.2.02',
      cuentaNombre: 'IUE por Pagar',
      debe: compensacion.iueDeterminado,
      haber: 0
    });

    // Haber: IT Pagado (activo transitorio) — la parte que se usa
    if (compensacion.itCompensado > 0) {
      lineas.push({
        cuentaCodigo: '1.1.15',
        cuentaNombre: 'IT Pagado Acumulado',
        debe: 0,
        haber: compensacion.itCompensado
      });
    }

    // Haber: IUE por Pagar — la diferencia (si IT < IUE)
    if (compensacion.iuePorPagar > 0) {
      lineas.push({
        cuentaCodigo: '2.2.02',
        cuentaNombre: 'IUE por Pagar (diferencia)',
        debe: 0,
        haber: compensacion.iuePorPagar
      });
    }

    // Caso IT_MAYOR: el exceso se pierde (no se genera asiento).
    // Solo registramos la compensación efectiva.
    if (compensacion.caso === 'IT_MAYOR' && compensacion.excesoIT > 0) {
      console.log(`⚠️ Compensación IT-IUE: Exceso de IT ${this._fmt(compensacion.excesoIT)} SE PIERDE (Art. 77 Ley 843)`);
    }

    const concepto = `Compensación IT-IUE Gestión ${compensacion.anio} — ` +
      `IT ${this._fmt(compensacion.itAcumulado)} vs IUE ${this._fmt(compensacion.iueDeterminado)} ` +
      `(${compensacion.caso})`;

    const resultado = window.motorContable.crearAsientoManual({
      fecha: `${compensacion.anio}-12-31`,
      concepto,
      lineas
    });

    if (!resultado.exito) {
      return { exito: false, errores: resultado.errores };
    }

    console.log(`📝 Asiento compensación IT-IUE: ${resultado.asiento.numero} — ${compensacion.caso}`);
    return {
      exito: true,
      asiento: resultado.asiento,
      compensacion,
      advertenciaExceso: compensacion.excesoIT > 0 ? compensacion.excesoIT : null
    };
  }

  /**
   * Genera el asiento contable del pago de IUE al SIN.
   *
   * Asiento:
   *   IUE por Pagar (2.2.02)          Bs X (Debe)
   *       Bancos (1.1.02)                  Bs X (Haber)
   *
   * @param {number} anio
   * @param {number} monto
   * @returns {Object}
   */
  generarAsientoPagoIUE(anio, monto) {
    if (!window.motorContable) {
      return { exito: false, errores: ['Motor Contable no disponible'] };
    }

    const montoNum = this._r2(Number(monto) || 0);
    if (montoNum <= 0) {
      return { exito: false, errores: ['No hay IUE que pagar'] };
    }

    const lineas = [
      {
        cuentaCodigo: '2.2.02',
        cuentaNombre: 'IUE por Pagar',
        debe: montoNum,
        haber: 0
      },
      {
        cuentaCodigo: '1.1.02',
        cuentaNombre: 'Bancos',
        debe: 0,
        haber: montoNum
      }
    ];

    const concepto = `Pago IUE Gestión ${anio} — ${this._fmt(montoNum)}`;

    const resultado = window.motorContable.crearAsientoManual({
      fecha: new Date().toISOString().split('T')[0],
      concepto,
      lineas
    });

    if (!resultado.exito) {
      return { exito: false, errores: resultado.errores };
    }

    console.log(`💸 Pago IUE: ${resultado.asiento.numero} — ${this._fmt(montoNum)}`);
    return { exito: true, asiento: resultado.asiento, anio, monto: montoNum };
  }

  /**
   * Genera TODOS los asientos de impuestos de un período (mensual).
   * Método orquestador que ejecuta: IVA + IT + Pago.
   *
   * @param {string} periodo - Formato "AAAA-MM"
   * @returns {Object}
   */
  generarAsientosPeriodo(periodo) {
    const resultados = {
      periodo,
      iva: null,
      it: null,
      pago: null,
      errores: []
    };

    // 1. Conciliar IVA y generar asiento
    const conciliacion = this.conciliarIVA(periodo);
    if (conciliacion.exito) {
      const asientoIVA = this.generarAsientoIVA(conciliacion);
      if (asientoIVA.exito) {
        resultados.iva = asientoIVA;
      } else {
        resultados.errores.push(`IVA: ${asientoIVA.errores.join(', ')}`);
      }
    }

    // 2. Calcular IT y generar asiento
    const it = this.calcularIT(periodo);
    if (it.exito && it.itPorPagar > 0) {
      const asientoIT = this.generarAsientoIT(it);
      if (asientoIT.exito) {
        resultados.it = asientoIT;
      } else {
        resultados.errores.push(`IT: ${asientoIT.errores.join(', ')}`);
      }
    }

    // 3. Generar asiento de pago (si hay impuestos por pagar)
    const ivaAPagar = conciliacion.exito ? conciliacion.ivaPorPagar : 0;
    const itAPagar = it.exito ? it.itPorPagar : 0;

    if (ivaAPagar > 0 || itAPagar > 0) {
      const pago = this.generarAsientoPagoImpuestos(periodo, ivaAPagar, itAPagar);
      if (pago.exito) {
        resultados.pago = pago;
      } else {
        resultados.errores.push(`Pago: ${pago.errores.join(', ')}`);
      }
    }

    console.log(`📚 Asientos período ${periodo}: ` +
      `IVA ${resultados.iva ? '✅' : '❌'} | ` +
      `IT ${resultados.it ? '✅' : '❌'} | ` +
      `Pago ${resultados.pago ? '✅' : '❌'}`);

    return resultados;
  }

  /**
   * Genera todos los asientos anuales (cierre de gestión).
   * Ejecuta: IUE + Compensación IT-IUE + Pago.
   *
   * @param {number} anio
   * @param {Object} [opcionesIUE] - Opciones para calcularIUE
   * @returns {Object}
   */
  generarAsientosAnuales(anio, opcionesIUE = {}) {
    const resultados = {
      anio,
      iue: null,
      compensacion: null,
      pago: null,
      errores: []
    };

    // 1. Compensar IT vs IUE (Art. 77)
    const comp = this.compensarITcontraIUE(anio, opcionesIUE);
    if (!comp.exito) {
      resultados.errores.push(`Compensación: ${comp.errores.join(', ')}`);
      return resultados;
    }

    // 2. Generar asiento del IUE determinado
    if (comp.iueDeterminado > 0) {
      const iueCalc = this.calcularIUE(anio, opcionesIUE);
      if (iueCalc.exito) {
        const asientoIUE = this.generarAsientoIUE(iueCalc);
        if (asientoIUE.exito) {
          resultados.iue = asientoIUE;
        }
      }
    }

    // 3. Generar asiento de compensación
    if (comp.caso !== 'PERDIDA' && comp.iueDeterminado > 0) {
      const asientoComp = this.generarAsientoCompensacionIT(comp);
      if (asientoComp.exito) {
        resultados.compensacion = asientoComp;
      }
    }

    // 4. Pago del IUE (si hay diferencia)
    if (comp.iuePorPagar > 0) {
      const pago = this.generarAsientoPagoIUE(anio, comp.iuePorPagar);
      if (pago.exito) {
        resultados.pago = pago;
      }
    }

    console.log(`📚 Asientos anuales ${anio}: ` +
      `IUE ${resultados.iue ? '✅' : '❌'} | ` +
      `Compensación ${resultados.compensacion ? '✅' : '❌'} | ` +
      `Pago ${resultados.pago ? '✅' : '❌'}`);

    return resultados;
  }

  /**
   * Obtiene el último día de un mes.
   * @private
   */
  _ultimoDiaDelMes(periodo) {
    const [anio, mes] = periodo.split('-').map(Number);
    const ultimoDia = new Date(anio, mes, 0).getDate();
    return `${periodo}-${String(ultimoDia).padStart(2, '0')}`;
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
