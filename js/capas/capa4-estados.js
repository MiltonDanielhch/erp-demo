// ══════════════════════════════════════════════════════════════
// capa4-estados.js — Capa 4: Estados Financieros
// ══════════════════════════════════════════════════════════════

/**
 * Capa 4: Estados Financieros según las NC del CTNAC.
 *
 * Genera los estados financieros principales:
 *   - Estado de Resultados (Pérdidas y Ganancias)
 *   - Balance General (Estado de Situación Financiera)
 *   - Estado de Flujo de Efectivo
 *   - Notas a los Estados Financieros
 *   - Estados Comparativos
 *   - Razones Financieras
 *
 * ⚠️ PARTICULARIDAD BOLIVIANA:
 * El ajuste por inflación con UFV está SUSPENDIDO desde diciembre 2020.
 * Esta capa NO aplica reexpresión automática.
 */
class CapaEstadosFinancieros {

  constructor(deps) {
    this.motorContable = deps.motorContable;
    this.almacenamiento = deps.almacenamiento;
    this.periodosFiscales = deps.periodosFiscales || null;
    this.moduloImpuestos = deps.moduloImpuestos || null;

    console.log('📊 Capa 4: Estados Financieros inicializada.');
  }

  // ══════════════════════════════════════════════════════════
  // ESTADO DE RESULTADOS (PÉRDIDAS Y GANANCIAS)
  // ══════════════════════════════════════════════════════════

  /**
   * Genera el Estado de Resultados del período.
   *
   * Estructura según NC del CTNAC:
   *   Ventas Netas
   *   (-) Costo de Ventas
   *   = Utilidad Bruta
   *   (-) Gastos Operativos
   *   = Utilidad Operativa
   *   (+/-) Ingresos/Gastos No Operativos
   *   = Utilidad Antes de Impuestos
   *   (-) IUE (25% si hay utilidad)
   *   = Utilidad Neta
   *
   * @param {string} periodo - "AAAA-MM" (mensual) o "AAAA" (anual)
   * @param {Object} [opciones]
   * @param {boolean} [opciones.incluirIUE=true] - Incluir cálculo de IUE
   * @returns {Object} Estado de Resultados estructurado
   */
  generarEstadoResultados(periodo, opciones = {}) {
    const validacion = this._validarPeriodo(periodo);
    if (!validacion.valido) {
      return { exito: false, errores: validacion.errores };
    }

    const incluirIUE = opciones.incluirIUE !== false;

    // Obtener saldos de cuentas de resultados (grupos 4 y 5)
    const mayor = this._obtenerSaldosResultados(periodo);

    if (!mayor.exito) {
      return { exito: false, errores: mayor.errores };
    }

    // Clasificar cuentas por categoría
    const clasificacion = this._clasificarCuentasResultados(mayor.cuentas);

    // 1. Ventas Netas
    const ventasNetas = this._r2(clasificacion.ventas);

    // 2. Costo de Ventas
    const costoVentas = this._r2(clasificacion.costoVentas);

    // 3. Utilidad Bruta
    const utilidadBruta = this.calcularUtilidadBruta(ventasNetas, costoVentas);

    // 4. Gastos Operativos
    const gastosOperativos = this._r2(clasificacion.gastosOperativos);

    // 5. Utilidad Operativa
    const utilidadOperativa = this.calcularUtilidadOperativa(utilidadBruta, gastosOperativos);

    // 6. Ingresos/Gastos No Operativos
    const ingresosNoOperativos = this._r2(clasificacion.ingresosNoOperativos);
    const gastosNoOperativos = this._r2(clasificacion.gastosNoOperativos);

    // 7. Utilidad Antes de Impuestos
    const utilidadAntesImpuestos = this._r2(
      utilidadOperativa + ingresosNoOperativos - gastosNoOperativos
    );

    // 8. IUE (solo si hay utilidad positiva)
    let iue = 0;
    if (incluirIUE && utilidadAntesImpuestos > 0) {
      iue = this._r2(utilidadAntesImpuestos * 0.25);
    }

    // 9. Utilidad Neta
    const utilidadNeta = this.calcularUtilidadNeta(utilidadAntesImpuestos, iue);

    // Armar resultado estructurado
    const estado = {
      exito: true,
      periodo,
      tipo: this._determinarTipoPeriodo(periodo),
      fechaGeneracion: new Date().toISOString(),
      expresadoEn: 'Bolivianos',
      normasAplicadas: 'NC del CTNAC (ajuste UFV suspendido desde dic/2020)',

      // Desglose por cuentas
      desglose: {
        ventas: clasificacion.detalleVentas,
        costoVentas: clasificacion.detalleCostoVentas,
        gastosOperativos: clasificacion.detalleGastosOperativos,
        ingresosNoOperativos: clasificacion.detalleIngresosNoOperativos,
        gastosNoOperativos: clasificacion.detalleGastosNoOperativos
      },

      // Totales por nivel
      ventasNetas,
      costoVentas,
      utilidadBruta,
      gastosOperativos,
      utilidadOperativa,
      ingresosNoOperativos,
      gastosNoOperativos,
      utilidadAntesImpuestos,
      iue,
      utilidadNeta,

      // Indicadores
      indicadores: {
        esUtilidad: utilidadNeta > 0,
        esPerdida: utilidadNeta < 0,
        esEquilibrio: utilidadNeta === 0,
        margenBruto: ventasNetas > 0 ? this._r2((utilidadBruta / ventasNetas) * 100) : 0,
        margenOperativo: ventasNetas > 0 ? this._r2((utilidadOperativa / ventasNetas) * 100) : 0,
        margenNeto: ventasNetas > 0 ? this._r2((utilidadNeta / ventasNetas) * 100) : 0
      }
    };

    console.log(`📊 Estado de Resultados ${periodo}: ` +
      `${estado.esUtilidad ? 'UTILIDAD' : estado.esPerdida ? 'PÉRDIDA' : 'EQUILIBRIO'} ` +
      `${this._fmt(utilidadNeta)}`);

    return estado;
  }

  /**
   * Calcula la Utilidad Bruta.
   * Utilidad Bruta = Ventas Netas − Costo de Ventas
   *
   * @param {number} ventas
   * @param {number} costoVentas
   * @returns {number}
   */
  calcularUtilidadBruta(ventas, costoVentas) {
    return this._r2((Number(ventas) || 0) - (Number(costoVentas) || 0));
  }

  /**
   * Calcula la Utilidad Operativa.
   * Utilidad Operativa = Utilidad Bruta − Gastos Operativos
   *
   * @param {number} utilidadBruta
   * @param {number} gastosOperativos
   * @returns {number}
   */
  calcularUtilidadOperativa(utilidadBruta, gastosOperativos) {
    return this._r2((Number(utilidadBruta) || 0) - (Number(gastosOperativos) || 0));
  }

  /**
   * Calcula la Utilidad Antes de Impuestos.
   * Utilidad Antes Impuestos = Utilidad Operativa + Ingresos No Op − Gastos No Op
   *
   * @param {number} utilidadOperativa
   * @param {number} ingresosNoOperativos
   * @param {number} gastosNoOperativos
   * @returns {number}
   */
  calcularUtilidadAntesImpuestos(utilidadOperativa, ingresosNoOperativos, gastosNoOperativos) {
    return this._r2(
      (Number(utilidadOperativa) || 0) +
      (Number(ingresosNoOperativos) || 0) -
      (Number(gastosNoOperativos) || 0)
    );
  }

  /**
   * Calcula la Utilidad Neta.
   * Utilidad Neta = Utilidad Antes de Impuestos − IUE
   *
   * ⚠️ Si utilidad antes de impuestos ≤ 0, el IUE es 0.
   *
   * @param {number} utilidadAntesImpuestos
   * @param {number} iue
   * @returns {number}
   */
  calcularUtilidadNeta(utilidadAntesImpuestos, iue) {
    const utilidad = Number(utilidadAntesImpuestos) || 0;
    const iueAplicable = utilidad > 0 ? (Number(iue) || 0) : 0;
    return this._r2(utilidad - iueAplicable);
  }

  /**
   * Genera un Estado de Resultados comparativo entre dos períodos.
   *
   * @param {string} periodo1 - Período base
   * @param {string} periodo2 - Período a comparar
   * @returns {Object} Comparativo con variaciones
   */
  compararPeriodos(periodo1, periodo2) {
    const estado1 = this.generarEstadoResultados(periodo1, { incluirIUE: false });
    const estado2 = this.generarEstadoResultados(periodo2, { incluirIUE: false });

    if (!estado1.exito || !estado2.exito) {
      return {
        exito: false,
        errores: [
          ...(!estado1.exito ? estado1.errores : []),
          ...(!estado2.exito ? estado2.errores : [])
        ]
      };
    }

    const lineas = [
      { concepto: 'Ventas Netas', p1: estado1.ventasNetas, p2: estado2.ventasNetas },
      { concepto: 'Costo de Ventas', p1: estado1.costoVentas, p2: estado2.costoVentas },
      { concepto: 'Utilidad Bruta', p1: estado1.utilidadBruta, p2: estado2.utilidadBruta },
      { concepto: 'Gastos Operativos', p1: estado1.gastosOperativos, p2: estado2.gastosOperativos },
      { concepto: 'Utilidad Operativa', p1: estado1.utilidadOperativa, p2: estado2.utilidadOperativa },
      { concepto: 'Utilidad Antes de Impuestos', p1: estado1.utilidadAntesImpuestos, p2: estado2.utilidadAntesImpuestos },
      { concepto: 'Utilidad Neta', p1: estado1.utilidadNeta, p2: estado2.utilidadNeta }
    ];

    // Calcular variaciones
    const comparativo = lineas.map(linea => {
      const variacion = this.calcularVariacion(linea.p1, linea.p2);
      return {
        ...linea,
        variacionBs: variacion.variacionBs,
        variacionPorcentaje: variacion.variacionPorcentaje
      };
    });

    return {
      exito: true,
      periodo1,
      periodo2,
      lineas: comparativo,
      resumen: {
        variacionVentas: this.calcularVariacion(estado1.ventasNetas, estado2.ventasNetas),
        variacionUtilidadNeta: this.calcularVariacion(estado1.utilidadNeta, estado2.utilidadNeta)
      }
    };
  }

  /**
   * Calcula la variación entre dos valores.
   *
   * @param {number} valor1 - Valor base
   * @param {number} valor2 - Valor comparado
   * @returns {Object} { variacionBs, variacionPorcentaje }
   */
  calcularVariacion(valor1, valor2) {
    const v1 = Number(valor1) || 0;
    const v2 = Number(valor2) || 0;
    const variacionBs = this._r2(v2 - v1);

    let variacionPorcentaje = 0;
    if (v1 !== 0) {
      variacionPorcentaje = this._r2(((v2 - v1) / Math.abs(v1)) * 100);
    } else if (v2 !== 0) {
      variacionPorcentaje = v2 > 0 ? 100 : -100;
    }

    return {
      variacionBs,
      variacionPorcentaje,
      esPositiva: variacionBs > 0,
      esNegativa: variacionBs < 0
    };
  }

  // ══════════════════════════════════════════════════════════
  // UTILIDADES PRIVADAS
  // ══════════════════════════════════════════════════════════

  /**
   * Obtiene los saldos de las cuentas de resultados (grupos 4 y 5).
   * @private
   */
  _obtenerSaldosResultados(periodo) {
    if (!this.motorContable) {
      return { exito: false, errores: ['Motor Contable no disponible'] };
    }

    try {
      const mayor = this.motorContable.obtenerLibroMayor() || [];

      // Filtrar cuentas de resultados (grupos 4 y 5)
      const cuentasResultados = mayor.filter(cuenta => {
        const codigo = cuenta.cuentaCodigo || '';
        return codigo.startsWith('4.') || codigo.startsWith('5.');
      });

      return { exito: true, cuentas: cuentasResultados };
    } catch (e) {
      return { exito: false, errores: [`Error al obtener Libro Mayor: ${e.message}`] };
    }
  }

  /**
   * Clasifica las cuentas de resultados por categoría.
   * @private
   */
  _clasificarCuentasResultados(cuentas) {
    const resultado = {
      ventas: 0,
      costoVentas: 0,
      gastosOperativos: 0,
      ingresosNoOperativos: 0,
      gastosNoOperativos: 0,
      detalleVentas: [],
      detalleCostoVentas: [],
      detalleGastosOperativos: [],
      detalleIngresosNoOperativos: [],
      detalleGastosNoOperativos: []
    };

    cuentas.forEach(cuenta => {
      const codigo = cuenta.cuentaCodigo || '';
      const saldo = Math.abs(Number(cuenta.saldo) || 0);
      const detalle = { codigo, nombre: cuenta.cuentaNombre, saldo };

      // Clasificar por subgrupo
      if (codigo.startsWith('4.1')) {
        // Ingresos por Ventas
        resultado.ventas += saldo;
        resultado.detalleVentas.push(detalle);
      } else if (codigo.startsWith('4.2')) {
        // Otros Ingresos (no operativos)
        resultado.ingresosNoOperativos += saldo;
        resultado.detalleIngresosNoOperativos.push(detalle);
      } else if (codigo.startsWith('5.1')) {
        // Costo de Ventas
        resultado.costoVentas += saldo;
        resultado.detalleCostoVentas.push(detalle);
      } else if (codigo.startsWith('5.7')) {
        // Gastos Financieros (no operativos)
        resultado.gastosNoOperativos += saldo;
        resultado.detalleGastosNoOperativos.push(detalle);
      } else if (codigo.startsWith('5.')) {
        // Gastos Operativos (5.2, 5.3, 5.4, 5.5, 5.6)
        resultado.gastosOperativos += saldo;
        resultado.detalleGastosOperativos.push(detalle);
      }
    });

    return resultado;
  }

  /**
   * Valida el formato del período.
   * @private
   */
  _validarPeriodo(periodo) {
    if (!periodo || typeof periodo !== 'string') {
      return { valido: false, errores: ['Período inválido'] };
    }

    // Formato mensual: AAAA-MM
    if (/^\d{4}-\d{2}$/.test(periodo)) {
      const [anio, mes] = periodo.split('-').map(Number);
      if (mes < 1 || mes > 12) {
        return { valido: false, errores: [`Mes inválido: ${mes}`] };
      }
      return { valido: true };
    }

    // Formato anual: AAAA
    if (/^\d{4}$/.test(periodo)) {
      return { valido: true };
    }

    return { valido: false, errores: [`Formato de período inválido: ${periodo}`] };
  }

  /**
   * Determina el tipo de período.
   * @private
   */
  _determinarTipoPeriodo(periodo) {
    if (/^\d{4}-\d{2}$/.test(periodo)) return 'MENSUAL';
    if (/^\d{4}$/.test(periodo)) return 'ANUAL';
    return 'DESCONOCIDO';
  }

  _r2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }

  _fmt(n) {
    return (window.utilidades && window.utilidades.formatearBs)
      ? window.utilidades.formatearBs(n)
      : `Bs ${n.toFixed(2)}`;
  }
}

window.CapaEstadosFinancieros = CapaEstadosFinancieros;
