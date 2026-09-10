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
