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
