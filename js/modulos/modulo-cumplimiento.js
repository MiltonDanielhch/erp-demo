// ══════════════════════════════════════════════════════════════
// modulo-cumplimiento.js — Módulo 7.3 a 7.6: Cumplimiento SIN
// ══════════════════════════════════════════════════════════════

/**
 * Módulo de Cumplimiento SIN
 *
 * Incluye:
 * - Formularios SIN: 200, 400, 110, 500
 * - Formulario 601: Partes vinculadas
 * - Formulario 605: Estados Financieros SIAT
 * - Libro de Compras y Ventas IVA (LCV)
 * - Validaciones y exportaciones JSON/CSV
 *
 * Prototipo educativo:
 * Genera estructuras JSON exportables.
 * En producción, estas estructuras se adaptarían al formato exacto del SIN.
 */
class ModuloCumplimientoSIN {

  constructor(deps = {}) {
    this.almacenamiento = deps.almacenamiento || null;
    this.motorContable = deps.motorContable || null;
    this.moduloImpuestos = deps.moduloImpuestos || null;
    this.capaEstadosFinancieros = deps.capaEstadosFinancieros || null;
    this.calendarioTributario = deps.calendarioTributario || null;

    this.KEY_FORMULARIOS = 'erp_cumplimiento_formularios';
    this.KEY_LCV = 'erp_cumplimiento_lcv';
    this.KEY_DICTAMENES = 'erp_cumplimiento_dictamenes_auditor';

    console.log('✅ ModuloCumplimientoSIN inicializado');
  }

  // ══════════════════════════════════════════════════════════
  // FASE 7.3 — FORMULARIOS SIN 200, 400, 110, 500
  // ══════════════════════════════════════════════════════════

  /**
   * Formulario 200 — IVA
   */
  generarFormulario200(periodo) {
    let base = null;

    // Intentar usar Módulo 5 si existe.
    if (this.moduloImpuestos && typeof this.moduloImpuestos.generarFormulario200 === 'function') {
      try {
        base = this.moduloImpuestos.generarFormulario200(periodo);
      } catch (e) {
        console.warn('No se pudo usar moduloImpuestos.generarFormulario200:', e);
      }
    }

    const lcv = this.generarLCV(periodo);

    const ventasNetasGravadas = lcv.exito ? lcv.totales.ventas.neto : 0;
    const ivaDebitoFiscal = lcv.exito ? lcv.totales.ventas.iva : 0;
    const comprasNetasGravadas = lcv.exito ? lcv.totales.compras.neto : 0;
    const ivaCreditoFiscal = lcv.exito ? lcv.totales.compras.iva : 0;

    const saldoFavorAnterior = this._obtenerSaldoFavorAnteriorIVA(periodo);
    const diferencia = this._r2(ivaDebitoFiscal - ivaCreditoFiscal - saldoFavorAnterior);

    const ivaPorPagar = Math.max(0, diferencia);
    const saldoFavorContribuyente = Math.max(0, -diferencia);

    const formulario = {
      exito: true,
      formulario: 'FORM_200',
      nombre: 'Formulario 200 — Declaración Jurada del IVA',
      periodo,
      fechaGeneracion: new Date().toISOString(),
      moneda: 'BOB',
      fuente: base ? 'moduloImpuestos + LCV' : 'LCV',

      datos: {
        ventas: {
          ventasNetasGravadas,
          ventasExentas: 0,
          ventasNoAlcanzadas: 0,
          totalVentas: ventasNetasGravadas
        },
        debitoFiscal: {
          ivaDebitoFiscal
        },
        compras: {
          comprasNetasGravadas,
          ivaCreditoFiscal
        },
        liquidacion: {
          ivaDebitoFiscal,
          ivaCreditoFiscal,
          saldoFavorAnterior,
          ivaPorPagar,
          saldoFavorContribuyente
        }
      }
    };

    formulario.validacion = this.validarFormulario(formulario);
    this._guardarFormulario(formulario);

    return formulario;
  }

  /**
   * Formulario 400 — IT
   */
  generarFormulario400(periodo) {
    let base = null;

    if (this.moduloImpuestos && typeof this.moduloImpuestos.generarFormulario400 === 'function') {
      try {
        base = this.moduloImpuestos.generarFormulario400(periodo);
      } catch (e) {
        console.warn('No se pudo usar moduloImpuestos.generarFormulario400:', e);
      }
    }

    const lcv = this.generarLCV(periodo);
    const ingresosBrutos = lcv.exito ? lcv.totales.ventas.total : 0;
    const itDeterminado = this._r2(ingresosBrutos * 0.03);

    const formulario = {
      exito: true,
      formulario: 'FORM_400',
      nombre: 'Formulario 400 — Impuesto a las Transacciones',
      periodo,
      fechaGeneracion: new Date().toISOString(),
      moneda: 'BOB',
      fuente: base ? 'moduloImpuestos + LCV' : 'LCV',

      datos: {
        ingresosBrutos,
        alicuota: 0.03,
        itDeterminado,
        pagosACuenta: 0,
        saldoFavorAnterior: 0,
        itPorPagar: itDeterminado
      }
    };

    formulario.validacion = this.validarFormulario(formulario);
    this._guardarFormulario(formulario);

    return formulario;
  }

  /**
   * Formulario 110 — Retenciones
   */
  generarFormulario110(periodo) {
    let base = null;

    if (this.moduloImpuestos && typeof this.moduloImpuestos.generarFormulario110 === 'function') {
      try {
        base = this.moduloImpuestos.generarFormulario110(periodo);
      } catch (e) {
        console.warn('No se pudo usar moduloImpuestos.generarFormulario110:', e);
      }
    }

    const retenciones = this._obtenerRetencionesPeriodo(periodo);

    const totalRCIVA = this._r2(retenciones.empleados.rciva + retenciones.proveedores.rciva);
    const totalIT = this._r2(retenciones.proveedores.it);
    const totalRetenido = this._r2(totalRCIVA + totalIT);

    const formulario = {
      exito: true,
      formulario: 'FORM_110',
      nombre: 'Formulario 110 — Retenciones RC-IVA e IT',
      periodo,
      fechaGeneracion: new Date().toISOString(),
      moneda: 'BOB',
      fuente: base ? 'moduloImpuestos + registros locales' : 'registros locales',

      datos: {
        empleados: retenciones.empleados,
        proveedores: retenciones.proveedores,
        resumen: {
          totalRCIVA,
          totalIT,
          totalRetenido
        }
      }
    };

    formulario.validacion = this.validarFormulario(formulario);
    this._guardarFormulario(formulario);

    return formulario;
  }

  /**
   * Formulario 500 — IUE
   */
  generarFormulario500(anio) {
    const gestion = String(anio);

    let utilidadContable = 0;
    let utilidadImponible = 0;
    let iueDeterminado = 0;
    let itCompensado = 0;
    let iuePorPagar = 0;
    let estadoResultados = null;

    if (this.capaEstadosFinancieros) {
      estadoResultados = this.capaEstadosFinancieros.generarEstadoResultados(gestion);
      if (estadoResultados.exito) {
        utilidadContable = estadoResultados.utilidadAntesImpuestos;
        utilidadImponible = utilidadContable;
        iueDeterminado = utilidadImponible > 0 ? this._r2(utilidadImponible * 0.25) : 0;
      }
    }

    // Intentar usar compensación IT-IUE del Módulo 5.
    if (this.moduloImpuestos && typeof this.moduloImpuestos.compensarITcontraIUE === 'function') {
      try {
        const comp = this.moduloImpuestos.compensarITcontraIUE(Number(anio), {
          utilidadContable
        });

        if (comp && comp.exito) {
          iueDeterminado = comp.iueDeterminado || iueDeterminado;
          itCompensado = comp.itCompensado || 0;
          iuePorPagar = comp.iuePorPagar || Math.max(0, iueDeterminado - itCompensado);
        } else {
          iuePorPagar = Math.max(0, iueDeterminado - itCompensado);
        }
      } catch (e) {
        iuePorPagar = Math.max(0, iueDeterminado - itCompensado);
      }
    } else {
      iuePorPagar = Math.max(0, iueDeterminado - itCompensado);
    }

    const formulario = {
      exito: true,
      formulario: 'FORM_500',
      nombre: 'Formulario 500 — IUE',
      gestion: Number(anio),
      fechaGeneracion: new Date().toISOString(),
      moneda: 'BOB',

      datos: {
        utilidadContable,
        ajustesFiscales: {
          gastosNoDeducibles: 0,
          ingresosNoGravables: 0
        },
        utilidadImponible,
        alicuotaIUE: 0.25,
        iueDeterminado,
        itCompensado,
        iuePorPagar
      },

      soporte: {
        estadoResultados
      }
    };

    formulario.validacion = this.validarFormulario(formulario);
    this._guardarFormulario(formulario);

    return formulario;
  }

  /**
   * Valida un formulario SIN.
   */
  validarFormulario(formulario) {
    const errores = [];

    if (!formulario) {
      return { valido: false, errores: ['Formulario vacío'] };
    }

    if (!formulario.formulario) errores.push('Falta código de formulario');
    if (!formulario.datos) errores.push('Faltan datos del formulario');

    const revisarMontos = (obj, ruta = '') => {
      if (!obj || typeof obj !== 'object') return;

      Object.entries(obj).forEach(([k, v]) => {
        const nuevaRuta = ruta ? `${ruta}.${k}` : k;

        if (typeof v === 'number') {
          if (!Number.isFinite(v)) errores.push(`Monto inválido en ${nuevaRuta}`);
          // No bloqueamos negativos en utilidad/pérdida; sí en impuestos principales.
          if (
            v < 0 &&
            !nuevaRuta.toLowerCase().includes('utilidad') &&
            !nuevaRuta.toLowerCase().includes('saldofavor')
          ) {
            errores.push(`Monto negativo no permitido en ${nuevaRuta}`);
          }
        } else if (typeof v === 'object') {
          revisarMontos(v, nuevaRuta);
        }
      });
    };

    revisarMontos(formulario.datos);

    // Validaciones específicas.
    if (formulario.formulario === 'FORM_200') {
      const l = formulario.datos.liquidacion;
      const calculado = this._r2(l.ivaDebitoFiscal - l.ivaCreditoFiscal - l.saldoFavorAnterior);
      const netoDeclarado = this._r2(l.ivaPorPagar - l.saldoFavorContribuyente);

      if (Math.abs(calculado - netoDeclarado) > 0.01) {
        errores.push('Liquidación IVA no cuadra');
      }
    }

    if (formulario.formulario === 'FORM_400') {
      const d = formulario.datos;
      const esperado = this._r2(d.ingresosBrutos * d.alicuota);

      if (Math.abs(esperado - d.itDeterminado) > 0.01) {
        errores.push('IT determinado no coincide con 3% de ingresos brutos');
      }
    }

    if (formulario.formulario === 'FORM_500') {
      const d = formulario.datos;
      const esperado = d.utilidadImponible > 0 ? this._r2(d.utilidadImponible * 0.25) : 0;

      if (Math.abs(esperado - d.iueDeterminado) > 0.01) {
        errores.push('IUE determinado no coincide con 25% de utilidad imponible');
      }
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  /**
   * Exporta formularios a JSON o CSV.
   */
  exportarFormulario(formulario, formato = 'JSON') {
    if (!formulario) return '';

    const fmt = formato.toUpperCase();

    if (fmt === 'JSON') {
      return JSON.stringify(formulario, null, 2);
    }

    if (fmt === 'CSV') {
      const filas = [];
      filas.push(['campo', 'valor']);

      const plano = this._aplanarObjeto(formulario);
      Object.entries(plano).forEach(([k, v]) => {
        filas.push([k, String(v).replace(/"/g, '""')]);
      });

      return filas.map(f => f.map(c => `"${c}"`).join(',')).join('\n');
    }

    return JSON.stringify(formulario, null, 2);
  }

  // ══════════════════════════════════════════════════════════
  // FASE 7.4 — FORMULARIO 601 PARTES VINCULADAS
  // ══════════════════════════════════════════════════════════

  detectarOperacionesPartesVinculadas(anio) {
    const docs = this._obtenerDocumentosTodos();

    const operaciones = docs.filter(d => {
      const fecha = d.fecha || d.fechaEmision || d.createdAt || '';
      const esAnio = String(fecha).startsWith(String(anio));
      const flagDoc = d.esParteVinculada === true || d.parteVinculada === true;
      const flagEntidad = d.clienteEsParteVinculada === true || d.proveedorEsParteVinculada === true;
      return esAnio && (flagDoc || flagEntidad);
    }).map(d => ({
      id: d.id || d.documentoId || this._hash(JSON.stringify(d)),
      fecha: d.fecha || d.fechaEmision || '',
      tipoOperacion: this._tipoOperacionDocumento(d),
      contraparte: d.razonSocial || d.clienteNombre || d.proveedorNombre || d.nombre || 'Sin nombre',
      nitContraparte: d.nit || d.clienteNit || d.proveedorNit || '',
      monto: Number(d.total || d.monto || d.importe || 0),
      metodoPreciosTransferencia: d.metodoPreciosTransferencia || 'Precio Comparable No Controlado',
      justificacion: d.justificacion || 'Operación identificada como parte vinculada en el prototipo.'
    }));

    return {
      exito: true,
      anio: Number(anio),
      totalOperaciones: operaciones.length,
      totalMonto: this._r2(operaciones.reduce((s, o) => s + o.monto, 0)),
      operaciones
    };
  }

  generarFormulario601(anio) {
    const ops = this.detectarOperacionesPartesVinculadas(anio);
    const ventasAnuales = this._obtenerVentasAnuales(anio);
    const umbral = this.validarUmbralForm601(ventasAnuales);

    const formulario = {
      exito: true,
      formulario: 'FORM_601',
      nombre: 'Formulario 601 — Operaciones con Partes Vinculadas',
      gestion: Number(anio),
      fechaGeneracion: new Date().toISOString(),
      moneda: 'BOB',

      datos: {
        ventasAnuales,
        umbral,
        operaciones: ops.operaciones,
        totalOperaciones: ops.totalOperaciones,
        totalMonto: ops.totalMonto
      }
    };

    formulario.validacion = this.validarFormulario(formulario);
    this._guardarFormulario(formulario);

    return formulario;
  }

  validarUmbralForm601(ventasAnuales) {
    const umbral = 1700000;
    const debeDeclarar = Number(ventasAnuales) >= umbral;

    return {
      ventasAnuales: this._r2(ventasAnuales),
      umbral,
      debeDeclarar,
      nivelDetalle: debeDeclarar ? 'ALTO' : 'BÁSICO / NO APLICA SEGÚN CASO',
      mensaje: debeDeclarar
        ? 'Supera el umbral referencial de Bs 1.700.000; requiere mayor trazabilidad.'
        : 'No supera el umbral referencial; verificar normativa aplicable.'
    };
  }

  // ══════════════════════════════════════════════════════════
  // FASE 7.5 — FORMULARIO 605 ESTADOS FINANCIEROS SIAT
  // ══════════════════════════════════════════════════════════

  generarFormulario605(anio, datosEmpresa = {}) {
    if (!this.capaEstadosFinancieros) {
      return { exito: false, errores: ['CapaEstadosFinancieros no disponible'] };
    }

    const gestion = String(anio);

    const balanceGeneral = this.capaEstadosFinancieros.generarBalanceGeneral(`${gestion}-12-31`);
    const estadoResultados = this.capaEstadosFinancieros.generarEstadoResultados(gestion);
    const flujoEfectivo = this.capaEstadosFinancieros.generarFlujoEfectivo(gestion, 'INDIRECTO');
    const notas = this.capaEstadosFinancieros.generarEstructuraNotas(datosEmpresa, gestion);

    const memoriaAnual = this.generarMemoriaAnual(anio, datosEmpresa);

    const paquete = {
      exito: true,
      formulario: 'FORM_605',
      nombre: 'Formulario 605 — Estados Financieros vía SIAT',
      gestion: Number(anio),
      fechaGeneracion: new Date().toISOString(),
      moneda: 'BOB',

      estadosFinancieros: {
        balanceGeneral,
        estadoResultados,
        flujoEfectivo,
        estadoCambiosPatrimonio: this._generarEstadoCambiosPatrimonio(anio, balanceGeneral),
        notas
      },

      memoriaAnual,
      auditoria: this._obtenerDictamenAuditor(anio)
    };

    paquete.validacion = this.validarPaqueteForm605(paquete);
    paquete.exito = paquete.validacion.valido;
    paquete.listoParaEnvio = paquete.validacion.valido;

    this._guardarFormulario(paquete);

    return paquete;
  }

  validarPaqueteForm605(paquete) {
    const errores = [];

    if (!paquete) {
      return { valido: false, errores: ['Paquete vacío'] };
    }

    const eeff = paquete.estadosFinancieros || {};

    if (!eeff.balanceGeneral || !eeff.balanceGeneral.exito) {
      errores.push('Balance General no disponible');
    } else if (!eeff.balanceGeneral.ecuacionContable.cuadra) {
      errores.push('Balance General no cuadra');
    }

    if (!eeff.estadoResultados || !eeff.estadoResultados.exito) {
      errores.push('Estado de Resultados no disponible');
    }

    if (!eeff.flujoEfectivo || !eeff.flujoEfectivo.exito) {
      errores.push('Estado de Flujo de Efectivo no disponible');
    }

    if (!eeff.notas || !eeff.notas.exito) {
      errores.push('Notas a los EEFF no disponibles');
    } else if (!eeff.notas.notas || eeff.notas.notas.length !== 12) {
      errores.push('Las Notas deben incluir 12 secciones');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  generarMemoriaAnual(anio, datosEmpresa = {}) {
    return {
      gestion: Number(anio),
      razonSocial: datosEmpresa.razonSocial || 'EMPRESA S.A.',
      nit: datosEmpresa.nit || '',
      resumenGestion: '',
      principalesCifras: {
        ventas: 0,
        utilidadNeta: 0,
        totalActivos: 0,
        patrimonio: 0
      },
      perspectivasProximaGestion: '',
      contenidoEditable: true
    };
  }

  vincularConAuditoria(form605, dictamenAuditor = {}) {
    const dictamen = {
      gestion: form605.gestion,
      formulario: 'FORM_605',
      auditor: dictamenAuditor.auditor || '',
      registroCAUB: dictamenAuditor.registroCAUB || '',
      fechaDictamen: dictamenAuditor.fechaDictamen || new Date().toISOString().split('T')[0],
      opinion: dictamenAuditor.opinion || 'SIN_OPINION',
      observaciones: dictamenAuditor.observaciones || '',
      fechaRegistro: new Date().toISOString()
    };

    const dictamenes = this._leerJSON(this.KEY_DICTAMENES, []);
    dictamenes.push(dictamen);
    this._guardarJSON(this.KEY_DICTAMENES, dictamenes);

    form605.auditoria = dictamen;
    form605.trazabilidadAuditor = true;

    this._guardarFormulario(form605);

    return {
      exito: true,
      dictamen,
      form605
    };
  }

  // ══════════════════════════════════════════════════════════
  // FASE 7.6 — LIBRO DE COMPRAS Y VENTAS IVA (LCV)
  // ══════════════════════════════════════════════════════════

  generarLCV(periodo) {
    const docs = this._obtenerDocumentosTodos();

    const compras = [];
    const ventas = [];

    docs.forEach(d => {
      const fecha = d.fecha || d.fechaEmision || d.createdAt || '';
      if (!String(fecha).startsWith(periodo)) return;

      const tipo = this._tipoOperacionDocumento(d);
      const fila = this._normalizarFilaLCV(d, tipo);

      if (tipo === 'COMPRA') compras.push(fila);
      if (tipo === 'VENTA') ventas.push(fila);
    });

    const totCompras = this._totalizarLCV(compras);
    const totVentas = this._totalizarLCV(ventas);

    const ivaPorPagar = this._r2(Math.max(0, totVentas.iva - totCompras.iva));
    const saldoFavorIVA = this._r2(Math.max(0, totCompras.iva - totVentas.iva));
    const itPorPagar = this._r2(totVentas.total * 0.03);

    const lcv = {
      exito: true,
      periodo,
      fechaGeneracion: new Date().toISOString(),
      moneda: 'BOB',
      compras,
      ventas,
      totales: {
        compras: totCompras,
        ventas: totVentas,
        resumen: {
          ivaDebito: totVentas.iva,
          ivaCredito: totCompras.iva,
          ivaPorPagar,
          saldoFavorIVA,
          itPorPagar
        }
      }
    };

    lcv.validacion = this.validarLCV(lcv);

    this._guardarLCV(lcv);
    return lcv;
  }

  validarLCV(lcv) {
    const errores = [];
    const facturas = new Set();

    const validarFila = (fila, tipo) => {
      if (!fila.nit) errores.push(`${tipo}: factura ${fila.factura} sin NIT`);
      if (!fila.cuf) errores.push(`${tipo}: factura ${fila.factura} sin CUF`);
      if (fila.cuf && !/^[A-Z0-9]{10,80}$/.test(fila.cuf)) {
        errores.push(`${tipo}: CUF inválido en factura ${fila.factura}`);
      }

      const clave = `${tipo}-${fila.nit}-${fila.factura}-${fila.fecha}`;
      if (facturas.has(clave)) {
        errores.push(`${tipo}: factura duplicada ${fila.factura}`);
      }
      facturas.add(clave);

      const esperadoIVA = this._r2(fila.neto * 0.13);
      if (Math.abs(esperadoIVA - fila.iva) > 0.05) {
        errores.push(`${tipo}: IVA no cuadra en factura ${fila.factura}`);
      }
    };

    (lcv.compras || []).forEach(f => validarFila(f, 'COMPRA'));
    (lcv.ventas || []).forEach(f => validarFila(f, 'VENTA'));

    return {
      valido: errores.length === 0,
      errores
    };
  }

  exportarLCV(lcv, formato = 'JSON') {
    if (!lcv) return '';

    const fmt = formato.toUpperCase();

    if (fmt === 'JSON') {
      return JSON.stringify(lcv, null, 2);
    }

    if (fmt === 'CSV') {
      const filas = [];

      filas.push(['SECCION', 'NIT', 'RAZON_SOCIAL', 'FACTURA', 'FECHA', 'TOTAL', 'NETO', 'IVA', 'IT', 'CUF']);

      lcv.compras.forEach(f => {
        filas.push(['COMPRAS', f.nit, f.razonSocial, f.factura, f.fecha, f.total, f.neto, f.iva, '', f.cuf]);
      });

      lcv.ventas.forEach(f => {
        filas.push(['VENTAS', f.nit, f.razonSocial, f.factura, f.fecha, f.total, f.neto, f.iva, f.it, f.cuf]);
      });

      return filas.map(fila => fila.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    }

    return JSON.stringify(lcv, null, 2);
  }

  conciliarLCVconForm200(lcv, form200) {
    const errores = [];
    const diffs = [];

    if (!lcv || !form200) {
      return { conciliado: false, errores: ['LCV o Form. 200 no disponible'], diferencias: [] };
    }

    const ivaDebitoLCV = this._r2(lcv.totales.ventas.iva);
    const ivaCreditoLCV = this._r2(lcv.totales.compras.iva);

    const ivaDebitoF200 = this._r2(form200.datos.liquidacion.ivaDebitoFiscal);
    const ivaCreditoF200 = this._r2(form200.datos.liquidacion.ivaCreditoFiscal);

    if (Math.abs(ivaDebitoLCV - ivaDebitoF200) > 0.01) {
      diffs.push({
        campo: 'IVA Débito Fiscal',
        lcv: ivaDebitoLCV,
        form200: ivaDebitoF200,
        diferencia: this._r2(ivaDebitoLCV - ivaDebitoF200)
      });
    }

    if (Math.abs(ivaCreditoLCV - ivaCreditoF200) > 0.01) {
      diffs.push({
        campo: 'IVA Crédito Fiscal',
        lcv: ivaCreditoLCV,
        form200: ivaCreditoF200,
        diferencia: this._r2(ivaCreditoLCV - ivaCreditoF200)
      });
    }

    return {
      conciliado: diffs.length === 0,
      errores,
      diferencias: diffs,
      mensaje: diffs.length === 0
        ? 'LCV conciliado con Formulario 200'
        : 'Existen diferencias entre LCV y Formulario 200'
    };
  }

    // ══════════════════════════════════════════════════════════
  // FASE 7.9 — AUDITORÍA: TRAZABILIDAD Y PAPELES DE TRABAJO
  // ══════════════════════════════════════════════════════════

  /**
   * Genera todos los papeles de trabajo para auditoría externa.
   *
   * Incluye:
   * 1. Libro Diario completo del período
   * 2. Libro Mayor por cuenta
   * 3. Balanza de Comprobación
   * 4. Conciliación bancaria
   * 5. Detalle de cuentas por cobrar (antigüedad)
   * 6. Detalle de cuentas por pagar (vencimiento)
   * 7. Kardex valorado de inventario
   * 8. Detalle de activos fijos y depreciación
   * 9. Detalle de provisiones (aguinaldo, indemnización)
   * 10. Conciliación de IVA (Form. 200)
   * 11. Conciliación de IT (Form. 400)
   * 12. Liquidación de IUE (Form. 500)
   * 13. LCV completo
   * 14. Estados Financieros con Notas
   *
   * @param {string} periodo - "AAAA" o "AAAA-MM"
   * @returns {Object}
   */
  generarPapelesTrabajo(periodo) {
    const esAnual = /^\d{4}$/.test(periodo);
    const gestion = esAnual ? periodo : periodo.split('-')[0];

    const papeles = {
      exito: true,
      periodo,
      fechaGeneracion: new Date().toISOString(),
      totalPapeles: 14,
      advertencia: '⚠️ Paquete de auditoría generado en modo prototipo educativo.'
    };

    // 1. Libro Diario
    papeles.libroDiario = this._generarPapelLibroDiario(periodo);

    // 2. Libro Mayor
    papeles.libroMayor = this._generarPapelLibroMayor();

    // 3. Balanza de Comprobación
    papeles.balanza = this._generarPapelBalanza(periodo);

    // 4. Conciliación bancaria
    papeles.conciliacionBancaria = this._generarPapelConciliacionBancaria(periodo);

    // 5. Cuentas por cobrar (antigüedad)
    papeles.cuentasPorCobrar = this._generarPapelCuentasPorCobrar(periodo);

    // 6. Cuentas por pagar (vencimiento)
    papeles.cuentasPorPagar = this._generarPapelCuentasPorPagar(periodo);

    // 7. Kardex de inventario
    papeles.kardexInventario = this._generarPapelKardex(periodo);

    // 8. Activos fijos y depreciación
    papeles.activosFijos = this._generarPapelActivosFijos();

    // 9. Provisiones (aguinaldo, indemnización)
    papeles.provisiones = this._generarPapelProvisiones(gestion);

    // 10. Conciliación IVA (Form. 200)
    papeles.conciliacionIVA = this._generarPapelConciliacionIVA(periodo);

    // 11. Conciliación IT (Form. 400)
    papeles.conciliacionIT = this._generarPapelConciliacionIT(periodo);

    // 12. Liquidación IUE (Form. 500)
    papeles.liquidacionIUE = this._generarPapelLiquidacionIUE(gestion);

    // 13. LCV
    papeles.lcv = isFinite(Number(periodo)) ? null : this.generarLCV(periodo);

    // 14. Estados Financieros
    papeles.estadosFinancieros = this._generarPapelEstadosFinancieros(gestion);

    // Resumen
    const disponibles = Object.entries(papeles)
      .filter(([k, v]) => k !== 'exito' && k !== 'periodo' && k !== 'fechaGeneracion' &&
                          k !== 'totalPapeles' && k !== 'advertencia' && v !== null)
      .length;

    papeles.papelesDisponibles = disponibles;

    console.log(`📋 Papeles de trabajo generados: ${disponibles}/${papeles.totalPapeles} para ${periodo}`);
    return papeles;
  }

  /**
   * Genera la trazabilidad completa de un documento fuente.
   *
   * Rastrea: Documento → Asiento → Cuenta en Mayor → Saldo en Balanza
   * → Estado Financiero.
   *
   * @param {string} documentoId - ID del documento
   * @returns {Object} Cadena de trazabilidad
   */
  generarTrazabilidadDocumento(documentoId) {
    if (!documentoId) {
      return { exito: false, errores: ['ID de documento requerido'] };
    }

    // 1. Buscar documento fuente
    const documentos = this._obtenerDocumentosTodos();
    const documento = documentos.find(d =>
      (d.id || d.documentoId) === documentoId
    );

    if (!documento) {
      return { exito: false, errores: [`Documento ${documentoId} no encontrado`] };
    }

    // 2. Buscar asientos relacionados
    const asientos = this._obtenerAsientosRelacionados(documentoId);

    // 3. Obtener cuentas afectadas
    const cuentas = this._obtenerCuentasDeAsientos(asientos);

    // 4. Obtener saldos de esas cuentas
    const saldos = this._obtenerSaldosDeCuentas(cuentas);

    // 5. Determinar en qué estados financieros aparecen
    const estadosAfectados = this._determinarEstadosAfectados(cuentas);

    const trazabilidad = {
      exito: true,
      documentoId,
      cadena: {
        documento: {
          id: documento.id || documento.documentoId,
          tipo: this._tipoOperacionDocumento(documento),
          fecha: documento.fecha || documento.fechaEmision,
          monto: documento.total || documento.monto,
          contraparte: documento.razonSocial || documento.clienteNombre || documento.proveedorNombre
        },
        asientos: asientos.map(a => ({
          id: a.id,
          numero: a.numero,
          fecha: a.fecha,
          concepto: a.concepto,
          totalDebe: a.totalDebe,
          totalHaber: a.totalHaber
        })),
        cuentasAfectadas: cuentas.map(c => ({
          codigo: c.cuentaCodigo,
          nombre: c.cuentaNombre,
          montoEnDocumento: this._montoDeCuentaEnAsientos(c.cuentaCodigo, asientos)
        })),
        saldos: saldos,
        estadosAfectados
      },
      resumen: {
        cantidadAsientos: asientos.length,
        cantidadCuentas: cuentas.length,
        estados: estadosAfectados.join(', ')
      }
    };

    console.log(`🔍 Trazabilidad ${documentoId}: ${asientos.length} asientos → ${cuentas.length} cuentas`);
    return trazabilidad;
  }

  /**
   * Exporta paquete completo de auditoría.
   *
   * @param {string} periodo
   * @param {string} formato - 'JSON' o 'CSV'
   * @returns {string}
   */
  exportarParaAuditor(periodo, formato = 'JSON') {
    const papeles = this.generarPapelesTrabajo(periodo);

    if (formato.toUpperCase() === 'JSON') {
      return JSON.stringify(papeles, null, 2);
    }

    if (formato.toUpperCase() === 'CSV') {
      // En CSV solo exportamos los papeles tabulares
      return '# PAPELES DE TRABAJO\n' +
             '# Formato CSV simplificado\n' +
             `# Período: ${periodo}\n` +
             `# Fecha: ${new Date().toISOString()}\n` +
             JSON.stringify(this._aplanarObjeto(papeles), null, 2);
    }

    return JSON.stringify(papeles, null, 2);
  }

  // ══════════════════════════════════════════════════════════
  // FASE 7.10 — DASHBOARD DE CUMPLIMIENTO
  // ══════════════════════════════════════════════════════════

  /**
   * Genera el dashboard completo de cumplimiento.
   *
   * Consolida:
   * - Estado de formularios SIN
   * - Alertas del calendario tributario
   * - Obligaciones de Fundempresa
   * - Estado de facturación electrónica
   * - Indicadores de cumplimiento
   *
   * @returns {Object}
   */
  generarDashboardCumplimiento() {
    const dashboard = {
      exito: true,
      fechaGeneracion: new Date().toISOString(),

      // Estado de formularios
      formularios: this._obtenerEstadoFormularios(),

      // Próximos vencimientos (SIN)
      proximosVencimientos: this.calendarioTributario
        ? this.calendarioTributario.obtenerProximosVencimientos(10)
        : [],

      // Alertas del calendario
      alertasSIN: this.calendarioTributario
        ? this.calendarioTributario.generarAlertasVencimiento(30)
        : [],

      // Obligaciones Fundempresa
      fundempresa: this._obtenerEstadoFundempresa(),

      // Facturación electrónica
      facturacion: this._obtenerEstadoFacturacion(),

      // Indicadores
      indicadores: this.calcularIndicadoresCumplimiento(),

      // Alertas consolidadas
      alertasConsolidadas: this.generarAlertasConsolidadas()
    };

    // Resumen ejecutivo
    dashboard.resumen = this._generarResumenDashboard(dashboard);

    console.log(`📊 Dashboard de cumplimiento generado: ${dashboard.alertasConsolidadas.length} alertas`);
    return dashboard;
  }

  /**
   * Calcula indicadores de cumplimiento.
   *
   * @returns {Object}
   */
  calcularIndicadoresCumplimiento() {
    const documentos = this._obtenerDocumentosTodos();
    const facturasCompra = documentos.filter(d => this._tipoOperacionDocumento(d) === 'COMPRA');

    // % facturas con NIT válido
    const conNIT = facturasCompra.filter(d => {
      const nit = d.nit || d.proveedorNit || '';
      return nit && nit.length >= 8;
    }).length;

    const porcentajeNIT = facturasCompra.length > 0
      ? this._r2((conNIT / facturasCompra.length) * 100)
      : 0;

    // % facturas con CUF
    const conCUF = facturasCompra.filter(d => d.cuf || d.CUF).length;
    const porcentajeCUF = facturasCompra.length > 0
      ? this._r2((conCUF / facturasCompra.length) * 100)
      : 0;

    // Facturas observadas (sin CUF o NIT inválido)
    const observadas = facturasCompra.length - Math.min(conNIT, conCUF);

    // Períodos cerrados vs abiertos
    const periodosCerrados = this._contarPeriodosCerrados();

    return {
      porcentajeFacturasConNIT: porcentajeNIT,
      porcentajeFacturasConCUF: porcentajeCUF,
      facturasObservadas: observadas,
      totalFacturasCompra: facturasCompra.length,
      periodosCerrados,
      calidadDocumental: this._calificarCalidad(porcentajeNIT, porcentajeCUF),
      fechaCalculo: new Date().toISOString()
    };
  }

  /**
   * Genera alertas consolidadas de SIN + Fundempresa + Facturación.
   *
   * @returns {Array}
   */
  generarAlertasConsolidadas() {
    const alertas = [];

    // 1. Alertas SIN
    if (this.calendarioTributario) {
      const alertasSIN = this.calendarioTributario.generarAlertasVencimiento(30);
      alertasSIN.forEach(a => alertas.push({
        ...a,
        origen: 'SIN',
        prioridad: this._calcularPrioridad(a.diasRestantes)
      }));
    }

    // 2. Alertas Fundempresa
    const moduloFund = window.moduloFundempresa;
    if (moduloFund) {
      const alertasFE = moduloFund.generarAlertasFundempresa(60);
      alertasFE.forEach(a => alertas.push({
        ...a,
        origen: 'FUNDEMPRESA',
        icono: a.semaforo?.icono || '⚪',
        color: a.semaforo?.color || 'gris',
        nivel: a.semaforo?.nivel || 'INFO',
        prioridad: this._calcularPrioridad(a.diasRestantes)
      }));
    }

    // 3. Alertas Facturación (CUIS/CUFD por expirar)
    const moduloFact = window.moduloFacturacion;
    if (moduloFact) {
      const estadoFact = moduloFact.obtenerEstado();
      if (!estadoFact.cuis.vigente) {
        alertas.push({
          origen: 'FACTURACION',
          nivel: 'CRÍTICO',
          color: 'rojo',
          icono: '🔴',
          mensaje: '⚠️ No hay CUIS vigente. La facturación está bloqueada.',
          diasRestantes: 0,
          prioridad: 1
        });
      }
      if (!estadoFact.cufd.vigente) {
        alertas.push({
          origen: 'FACTURACION',
          nivel: 'CRÍTICO',
          color: 'rojo',
          icono: '🔴',
          mensaje: '⚠️ No hay CUFD vigente. La facturación está bloqueada.',
          diasRestantes: 0,
          prioridad: 1
        });
      }
    }

    // Ordenar por prioridad (ascendente)
    alertas.sort((a, b) => a.prioridad - b.prioridad);

    return alertas;
  }

  // ══════════════════════════════════════════════════════════
  // UTILIDADES PRIVADAS DE AUDITORÍA
  // ══════════════════════════════════════════════════════════

  _generarPapelLibroDiario(periodo) {
    try {
      if (!this.motorContable || !this.motorContable.obtenerDiarioPorPeriodo) {
        return null;
      }
      return this.motorContable.obtenerDiarioPorPeriodo(periodo);
    } catch (e) {
      return null;
    }
  }

  _generarPapelLibroMayor() {
    try {
      if (!this.motorContable || !this.motorContable.obtenerLibroMayor) {
        return null;
      }
      return this.motorContable.obtenerLibroMayor();
    } catch (e) {
      return null;
    }
  }

  _generarPapelBalanza(periodo) {
    try {
      if (!this.motorContable || !this.motorContable.calcularBalanza) {
        return null;
      }
      return this.motorContable.calcularBalanza(periodo);
    } catch (e) {
      return null;
    }
  }

  _generarPapelConciliacionBancaria(periodo) {
    // Prototipo simplificado
    return {
      periodo,
      cuentasBancarias: [],
      nota: 'Conciliación bancaria no implementada en prototipo'
    };
  }

  _generarPapelCuentasPorCobrar(periodo) {
    const mayor = this._generarPapelLibroMayor();
    if (!mayor) return null;

    const cuentas = mayor.filter(c =>
      c.cuentaCodigo && c.cuentaCodigo.startsWith('1.1.04')
    );

    return {
      periodo,
      totalCuentasPorCobrar: this._r2(cuentas.reduce((s, c) => s + (c.saldo || 0), 0)),
      detalle: cuentas
    };
  }

  _generarPapelCuentasPorPagar(periodo) {
    const mayor = this._generarPapelLibroMayor();
    if (!mayor) return null;

    const cuentas = mayor.filter(c =>
      c.cuentaCodigo && c.cuentaCodigo.startsWith('2.1.')
    );

    return {
      periodo,
      totalCuentasPorPagar: this._r2(cuentas.reduce((s, c) => s + (c.saldo || 0), 0)),
      detalle: cuentas
    };
  }

  _generarPapelKardex(periodo) {
    try {
      if (window.moduloInventario && typeof window.moduloInventario.obtenerKardex === 'function') {
        return window.moduloInventario.obtenerKardex({});
      }
    } catch (e) {}
    return { nota: 'Módulo de inventario no disponible para auditoría' };
  }

  _generarPapelActivosFijos() {
    const mayor = this._generarPapelLibroMayor();
    if (!mayor) return null;

    const activos = mayor.filter(c =>
      c.cuentaCodigo && c.cuentaCodigo.startsWith('1.2.')
    );

    return {
      totalActivosFijos: this._r2(activos.reduce((s, c) => s + Math.abs(c.saldo || 0), 0)),
      detalle: activos.map(a => ({
        codigo: a.cuentaCodigo,
        nombre: a.cuentaNombre,
        saldo: a.saldo
      }))
    };
  }

  _generarPapelProvisiones(gestion) {
    return {
      gestion,
      aguinaldo: this._obtenerSaldoCuenta('2.1.11'),
      segundoAguinaldo: this._obtenerSaldoCuenta('2.1.12'),
      indemnizacion: this._obtenerSaldoCuenta('2.1.14'),
      vacaciones: this._obtenerSaldoCuenta('2.1.16')
    };
  }

  _generarPapelConciliacionIVA(periodo) {
    const f200 = this.generarFormulario200(periodo);
    const lcv = this.generarLCV(periodo);
    return {
      form200: f200,
      lcv: lcv,
      conciliacion: this.conciliarLCVconForm200(lcv, f200)
    };
  }

  _generarPapelConciliacionIT(periodo) {
    return {
      form400: this.generarFormulario400(periodo)
    };
  }

  _generarPapelLiquidacionIUE(gestion) {
    return {
      form500: this.generarFormulario500(gestion)
    };
  }

  _generarPapelEstadosFinancieros(gestion) {
    if (!this.capaEstadosFinancieros) return null;

    return {
      balanceGeneral: this.capaEstadosFinancieros.generarBalanceGeneral(`${gestion}-12-31`),
      estadoResultados: this.capaEstadosFinancieros.generarEstadoResultados(gestion),
      flujoEfectivo: this.capaEstadosFinancieros.generarFlujoEfectivo(gestion, 'INDIRECTO'),
      notas: this.capaEstadosFinancieros.generarEstructuraNotas({}, gestion)
    };
  }

  _obtenerAsientosRelacionados(documentoId) {
    try {
      if (this.motorContable && this.motorContable.obtenerDiarioPorDocumento) {
        return this.motorContable.obtenerDiarioPorDocumento(documentoId) || [];
      }
    } catch (e) {}
    return [];
  }

  _obtenerCuentasDeAsientos(asientos) {
    const cuentasMap = new Map();
    asientos.forEach(a => {
      (a.lineas || []).forEach(l => {
        if (!cuentasMap.has(l.cuentaCodigo)) {
          cuentasMap.set(l.cuentaCodigo, {
            cuentaCodigo: l.cuentaCodigo,
            cuentaNombre: l.cuentaNombre
          });
        }
      });
    });
    return Array.from(cuentasMap.values());
  }

  _obtenerSaldosDeCuentas(cuentas) {
    const mayor = this._generarPapelLibroMayor();
    if (!mayor) return [];

    return cuentas.map(c => {
      const cuenta = mayor.find(m => m.cuentaCodigo === c.cuentaCodigo);
      return {
        codigo: c.cuentaCodigo,
        nombre: c.cuentaNombre,
        saldo: cuenta ? cuenta.saldo : 0
      };
    });
  }

  _montoDeCuentaEnAsientos(cuentaCodigo, asientos) {
    let total = 0;
    asientos.forEach(a => {
      (a.lineas || []).forEach(l => {
        if (l.cuentaCodigo === cuentaCodigo) {
          total += (l.debe || 0) + (l.haber || 0);
        }
      });
    });
    return this._r2(total);
  }

  _determinarEstadosAfectados(cuentas) {
    const estados = new Set();
    cuentas.forEach(c => {
      const codigo = c.cuentaCodigo || '';
      if (codigo.startsWith('1.') || codigo.startsWith('2.') || codigo.startsWith('3.')) {
        estados.add('Balance General');
      }
      if (codigo.startsWith('4.') || codigo.startsWith('5.')) {
        estados.add('Estado de Resultados');
      }
      if (codigo.startsWith('1.1.01') || codigo.startsWith('1.1.02')) {
        estados.add('Estado de Flujo de Efectivo');
      }
    });
    return Array.from(estados);
  }

  _obtenerSaldoCuenta(codigo) {
    const mayor = this._generarPapelLibroMayor();
    if (!mayor) return 0;
    const cuenta = mayor.find(m => m.cuentaCodigo === codigo);
    return cuenta ? this._r2(cuenta.saldo || 0) : 0;
  }

  _obtenerEstadoFormularios() {
    const periodos = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05',
                      '2026-06', '2026-07', '2026-08', '2026-09'];
    const estados = [];

    periodos.forEach(p => {
      const f200 = this._leerFormularioGuardado('FORM_200', p);
      const f400 = this._leerFormularioGuardado('FORM_400', p);
      const f110 = this._leerFormularioGuardado('FORM_110', p);

      estados.push({
        periodo: p,
        form200: f200 ? 'GENERADO' : 'PENDIENTE',
        form400: f400 ? 'GENERADO' : 'PENDIENTE',
        form110: f110 ? 'GENERADO' : 'PENDIENTE'
      });
    });

    return estados;
  }

  _leerFormularioGuardado(formulario, periodo) {
    try {
      const formularios = JSON.parse(localStorage.getItem(this.KEY_FORMULARIOS) || '[]');
      return formularios.find(f => f.formulario === formulario && f.periodo === periodo);
    } catch (e) {
      return null;
    }
  }

  _obtenerEstadoFundempresa() {
    const moduloFund = window.moduloFundempresa;
    if (!moduloFund) return { disponible: false };

    return {
      disponible: true,
      pendientes: moduloFund.obtenerObligacionesPendientes().length,
      cumplidas: moduloFund.obtenerObligacionesCumplidas().length,
      alertas: moduloFund.generarAlertasFundempresa(60).length
    };
  }

  _obtenerEstadoFacturacion() {
    const moduloFact = window.moduloFacturacion;
    if (!moduloFact) return { disponible: false };

    const estado = moduloFact.obtenerEstado();
    return {
      disponible: true,
      cuisVigente: estado.cuis.vigente,
      cufdVigente: estado.cufd.vigente,
      totalFacturas: estado.facturas.total
    };
  }

  _contarPeriodosCerrados() {
    try {
      if (window.PeriodosContables && typeof window.PeriodosContables.obtenerCerrados === 'function') {
        return window.PeriodosContables.obtenerCerrados().length;
      }
    } catch (e) {}
    return 0;
  }

  _calificarCalidad(porcentajeNIT, porcentajeCUF) {
    const promedio = (porcentajeNIT + porcentajeCUF) / 2;
    if (promedio >= 95) return { nivel: 'EXCELENTE', color: 'verde' };
    if (promedio >= 80) return { nivel: 'BUENA', color: 'verde' };
    if (promedio >= 60) return { nivel: 'REGULAR', color: 'amarillo' };
    return { nivel: 'DEFICIENTE', color: 'rojo' };
  }

  _calcularPrioridad(diasRestantes) {
    if (diasRestantes < 0) return 1;     // Vencido
    if (diasRestantes < 3) return 2;     // Crítico
    if (diasRestantes < 7) return 3;     // Urgente
    if (diasRestantes < 30) return 4;    // Próximo
    return 5;                             // Normal
  }

  _generarResumenDashboard(dashboard) {
    const alertasCriticas = dashboard.alertasConsolidadas.filter(a => a.prioridad <= 2).length;
    const alertasProximas = dashboard.alertasConsolidadas.filter(a => a.prioridad === 3 || a.prioridad === 4).length;

    let estadoGeneral = 'BUENO';
    let colorGeneral = 'verde';

    if (alertasCriticas > 0) {
      estadoGeneral = 'CRÍTICO';
      colorGeneral = 'rojo';
    } else if (alertasProximas > 5) {
      estadoGeneral = 'ATENCIÓN';
      colorGeneral = 'amarillo';
    }

    return {
      estadoGeneral,
      colorGeneral,
      totalAlertas: dashboard.alertasConsolidadas.length,
      alertasCriticas,
      alertasProximas,
      calidadDocumental: dashboard.indicadores.calidadDocumental,
      mensaje: this._generarMensajeResumen(estadoGeneral, alertasCriticas)
    };
  }

  _generarMensajeResumen(estado, criticas) {
    if (estado === 'CRÍTICO') {
      return `⚠️ Hay ${criticas} alertas críticas que requieren atención inmediata.`;
    }
    if (estado === 'ATENCIÓN') {
      return '🟡 Varios vencimientos próximos. Monitorear de cerca.';
    }
    return '✅ Sistema de cumplimiento en buen estado.';
  }

  // ══════════════════════════════════════════════════════════
  // UTILIDADES PRIVADAS
  // ══════════════════════════════════════════════════════════

  _obtenerDocumentosTodos() {
    const colecciones = [
      'ventas',
      'compras',
      'facturas',
      'documentos',
      'documentosFuente',
      'erp_ventas',
      'erp_compras',
      'erp_documentos',
      'erp_documentos_fuente'
    ];

    let docs = [];

    colecciones.forEach(nombre => {
      const arr = this._leerColeccion(nombre);
      if (Array.isArray(arr)) docs = docs.concat(arr);
    });

    // Evitar duplicados básicos por JSON hash.
    const vistos = new Set();
    return docs.filter(d => {
      const h = this._hash(JSON.stringify(d));
      if (vistos.has(h)) return false;
      vistos.add(h);
      return true;
    });
  }

  _leerColeccion(nombre) {
    // Intentar almacenamiento propio del ERP.
    try {
      if (this.almacenamiento) {
        if (typeof this.almacenamiento.obtener === 'function') {
          const r = this.almacenamiento.obtener(nombre);
          if (Array.isArray(r)) return r;
        }
        if (typeof this.almacenamiento.obtenerTodos === 'function') {
          const r = this.almacenamiento.obtenerTodos(nombre);
          if (Array.isArray(r)) return r;
        }
      }
    } catch (e) {}

    // Fallback LocalStorage.
    try {
      const r = JSON.parse(localStorage.getItem(nombre) || '[]');
      return Array.isArray(r) ? r : [];
    } catch (e) {
      return [];
    }
  }

  _tipoOperacionDocumento(d) {
    const raw = String(
      d.tipo ||
      d.tipoDocumento ||
      d.modulo ||
      d.categoria ||
      d.operacion ||
      ''
    ).toUpperCase();

    if (raw.includes('COMPRA') || raw.includes('EGRESO') || raw.includes('PROVEEDOR')) {
      return 'COMPRA';
    }

    if (raw.includes('VENTA') || raw.includes('INGRESO') || raw.includes('CLIENTE')) {
      return 'VENTA';
    }

    // Heurísticas.
    if (d.proveedorNombre || d.proveedorNit) return 'COMPRA';
    if (d.clienteNombre || d.clienteNit) return 'VENTA';

    return 'DESCONOCIDO';
  }

  _normalizarFilaLCV(d, tipo) {
    const total = Number(d.total || d.montoTotal || d.monto || d.importe || 0);

    const neto = Number(d.neto || d.montoNeto || d.baseImponible || 0) || this._r2(total / 1.13);
    const iva = Number(d.iva || d.ivaFiscal || d.creditoFiscal || d.debitoFiscal || 0) || this._r2(neto * 0.13);
    const it = tipo === 'VENTA'
      ? (Number(d.it || d.impuestoTransacciones || 0) || this._r2(total * 0.03))
      : 0;

    return {
      id: d.id || d.documentoId || this._hash(JSON.stringify(d)),
      tipo,
      nit: d.nit || d.clienteNit || d.proveedorNit || d.nitCliente || d.nitProveedor || '0',
      razonSocial: d.razonSocial || d.clienteNombre || d.proveedorNombre || d.nombre || 'SIN NOMBRE',
      factura: d.numeroFactura || d.factura || d.numero || d.nroFactura || 'S/N',
      fecha: d.fecha || d.fechaEmision || d.createdAt || '',
      total: this._r2(total),
      neto: this._r2(neto),
      iva: this._r2(iva),
      it: this._r2(it),
      cuf: d.cuf || d.CUF || this._generarCUFSimulado(d)
    };
  }

  _totalizarLCV(filas) {
    return {
      cantidad: filas.length,
      total: this._r2(filas.reduce((s, f) => s + Number(f.total || 0), 0)),
      neto: this._r2(filas.reduce((s, f) => s + Number(f.neto || 0), 0)),
      iva: this._r2(filas.reduce((s, f) => s + Number(f.iva || 0), 0)),
      it: this._r2(filas.reduce((s, f) => s + Number(f.it || 0), 0))
    };
  }

  _generarCUFSimulado(d) {
    const base = `${d.nit || d.clienteNit || d.proveedorNit || '0'}-${d.fecha || ''}-${d.numeroFactura || d.factura || ''}-${Math.random()}`;
    return this._hash(base).toUpperCase().padEnd(43, '0').slice(0, 43);
  }

  _obtenerSaldoFavorAnteriorIVA(periodo) {
    // Prototipo: sin arrastre histórico automático todavía.
    return 0;
  }

  _obtenerRetencionesPeriodo(periodo) {
    const docs = this._obtenerDocumentosTodos().filter(d => {
      const fecha = d.fecha || d.fechaEmision || d.createdAt || '';
      return String(fecha).startsWith(periodo);
    });

    let empleadosRCIVA = 0;
    let proveedoresRCIVA = 0;
    let proveedoresIT = 0;

    docs.forEach(d => {
      empleadosRCIVA += Number(d.retencionRCIVAEmpleado || 0);
      proveedoresRCIVA += Number(d.retencionRCIVA || d.rcivaRetenido || 0);
      proveedoresIT += Number(d.retencionIT || d.itRetenido || 0);
    });

    return {
      empleados: {
        rciva: this._r2(empleadosRCIVA),
        detalle: []
      },
      proveedores: {
        rciva: this._r2(proveedoresRCIVA),
        it: this._r2(proveedoresIT),
        detalle: []
      }
    };
  }

  _obtenerVentasAnuales(anio) {
    const docs = this._obtenerDocumentosTodos();
    return this._r2(docs.reduce((sum, d) => {
      const fecha = d.fecha || d.fechaEmision || d.createdAt || '';
      if (!String(fecha).startsWith(String(anio))) return sum;
      if (this._tipoOperacionDocumento(d) !== 'VENTA') return sum;
      return sum + Number(d.total || d.montoTotal || d.monto || 0);
    }, 0));
  }

  _generarEstadoCambiosPatrimonio(anio, balanceGeneral) {
    const patrimonioFinal = balanceGeneral && balanceGeneral.exito
      ? balanceGeneral.totalPatrimonio
      : 0;

    return {
      exito: true,
      gestion: Number(anio),
      capitalSocialInicial: 0,
      aportes: 0,
      retirosDividendos: 0,
      utilidadDelEjercicio: 0,
      patrimonioFinal,
      nota: 'Estructura simplificada para prototipo educativo.'
    };
  }

  _obtenerDictamenAuditor(anio) {
    const dictamenes = this._leerJSON(this.KEY_DICTAMENES, []);
    return dictamenes.find(d => Number(d.gestion) === Number(anio)) || null;
  }

  _guardarFormulario(formulario) {
    const formularios = this._leerJSON(this.KEY_FORMULARIOS, []);
    formularios.push(formulario);
    this._guardarJSON(this.KEY_FORMULARIOS, formularios);
  }

  _guardarLCV(lcv) {
    const lcvs = this._leerJSON(this.KEY_LCV, []);
    lcvs.push(lcv);
    this._guardarJSON(this.KEY_LCV, lcvs);
  }

  _leerJSON(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch (e) {
      return fallback;
    }
  }

  _guardarJSON(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  _aplanarObjeto(obj, prefijo = '') {
    const out = {};

    Object.entries(obj || {}).forEach(([k, v]) => {
      const key = prefijo ? `${prefijo}.${k}` : k;

      if (v && typeof v === 'object' && !Array.isArray(v)) {
        Object.assign(out, this._aplanarObjeto(v, key));
      } else if (Array.isArray(v)) {
        out[key] = JSON.stringify(v);
      } else {
        out[key] = v;
      }
    });

    return out;
  }

  _hash(str) {
    let h = 0;
    const s = String(str || '');

    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h) + s.charCodeAt(i);
      h |= 0;
    }

    return Math.abs(h).toString(36).toUpperCase();
  }

  _r2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }
}

window.ModuloCumplimientoSINClase = ModuloCumplimientoSIN;
