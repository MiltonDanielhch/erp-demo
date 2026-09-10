// ══════════════════════════════════════════════════════════════
// costos-cif.js — Módulo 8.5: Asignación de CIF
// ══════════════════════════════════════════════════════════════

/**
 * Asignación de Costos Indirectos de Fabricación (CIF)
 *
 * Calcula la tasa de absorción de CIF para distribuir los costos
 * indirectos a los productos mediante una base de asignación
 * (horas MOD, horas máquina, unidades, etc.)
 *
 * Variación CIF:
 *   - Subabsorción: CIF real > CIF aplicado (costo faltante)
 *   - Sobreabsorción: CIF aplicado > CIF real (costo de más)
 */
class CostosCIF {

  constructor(deps = {}) {
    this.almacenamiento = deps.almacenamiento || null;
    this.centrosCosto = deps.centrosCosto || null;
    this.motorContable = deps.motorContable || null;

    this.KEY_CONFIG = 'erp_costos_cif_config';
    this.KEY_APLICACIONES = 'erp_costos_cif_aplicaciones';
    this.KEY_VARIACIONES = 'erp_costos_cif_variaciones';

    console.log('🏭 Módulo Costos CIF inicializado');
  }

  // ══════════════════════════════════════════════════════════
  // TASA DE ABSORCIÓN CIF
  // ══════════════════════════════════════════════════════════

  /**
   * Configura la tasa CIF para un centro de costo.
   *
   * @param {string} centroId
   * @param {Object} config
   * @returns {Object}
   */
  configurarTasaCIF(centroId, config = {}) {
    if (!centroId) {
      return { exito: false, errores: ['Centro ID requerido'] };
    }

    const cifPresupuestado = Number(config.cifPresupuestado) || 0;
    const basePresupuestada = Number(config.basePresupuestada) || 0;
    const unidadBase = config.unidadBase || 'HORAS_MOD';

    if (cifPresupuestado <= 0) {
      return { exito: false, errores: ['CIF presupuestado debe ser mayor a 0'] };
    }
    if (basePresupuestada <= 0) {
      return { exito: false, errores: ['Base presupuestada debe ser mayor a 0'] };
    }

    const tasa = this._r2(cifPresupuestado / basePresupuestada);

    const configuracion = {
      centroId,
      cifPresupuestado: this._r2(cifPresupuestado),
      basePresupuestada: this._r2(basePresupuestada),
      unidadBase,
      tasa,
      periodo: config.periodo || new Date().getFullYear().toString(),
      fechaConfiguracion: new Date().toISOString()
    };

    const configs = this._leerConfig();
    configs[centroId] = configuracion;
    this._guardarConfig(configs);

    console.log(`⚙️ Tasa CIF configurada: ${centroId} | Bs ${tasa}/${unidadBase}`);
    return { exito: true, configuracion };
  }

  /**
   * Calcula la tasa CIF de un centro.
   *
   * @param {string} centroId
   * @param {string} [periodo]
   * @returns {Object}
   */
  calcularTasaCIF(centroId, periodo) {
    const configs = this._leerConfig();
    const config = configs[centroId];

    if (!config) {
      return {
        exito: false,
        errores: [`Tasa CIF no configurada para centro ${centroId}`]
      };
    }

    return {
      exito: true,
      centroId,
      cifPresupuestado: config.cifPresupuestado,
      basePresupuestada: config.basePresupuestada,
      unidadBase: config.unidadBase,
      tasa: config.tasa,
      periodo: config.periodo
    };
  }

  /**
   * Obtiene todas las tasas CIF configuradas.
   */
  obtenerTodasLasTasas() {
    return this._leerConfig();
  }

  // ══════════════════════════════════════════════════════════
  // APLICACIÓN DE CIF A PRODUCTOS
  // ══════════════════════════════════════════════════════════

  /**
   * Aplica CIF a un producto/orden según la cantidad base.
   *
   * @param {string} centroId
   * @param {Object} datosAplicacion
   * @returns {Object}
   */
  aplicarCIF(centroId, datosAplicacion = {}) {
    const tasaResult = this.calcularTasaCIF(centroId);
    if (!tasaResult.exito) return tasaResult;

    const cantidadBase = Number(datosAplicacion.cantidadBase) || 0;
    if (cantidadBase <= 0) {
      return { exito: false, errores: ['Cantidad base debe ser mayor a 0'] };
    }

    const cifAplicado = this._r2(cantidadBase * tasaResult.tasa);

    const aplicacion = {
      id: 'cif-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 6),
      centroId,
      ordenId: datosAplicacion.ordenId || null,
      productoId: datosAplicacion.productoId || null,
      cantidadBase,
      unidadBase: tasaResult.unidadBase,
      tasa: tasaResult.tasa,
      cifAplicado,
      fecha: datosAplicacion.fecha || new Date().toISOString().split('T')[0],
      fechaAplicacion: new Date().toISOString()
    };

    const aplicaciones = this._leerAplicaciones();
    aplicaciones.push(aplicacion);
    this._guardarAplicaciones(aplicaciones);

    console.log(`🏭 CIF aplicado: ${centroId} | ${cantidadBase} ${tasaResult.unidadBase} × Bs ${tasaResult.tasa} = Bs ${cifAplicado}`);
    return {
      exito: true,
      aplicacion,
      cifAplicado,
      tasa: tasaResult.tasa
    };
  }

  /**
   * Obtiene CIF total aplicado en un período.
   */
  obtenerCIFAplicado(centroId, periodo) {
    const aplicaciones = this._leerAplicaciones();
    return aplicaciones
      .filter(a => a.centroId === centroId && (!periodo || a.fecha.startsWith(periodo)))
      .reduce((s, a) => s + a.cifAplicado, 0);
  }

  /**
   * Obtiene CIF real incurrido de un centro (desde gastos asignados).
   */
  obtenerCIFReal(centroId, periodo) {
    if (!this.centrosCosto) return 0;

    const gastos = this.centrosCosto.obtenerGastos(centroId, periodo);
    return this._r2(gastos
      .filter(g => g.categoria === 'INDIRECTO' || g.categoria === 'CIF')
      .reduce((s, g) => s + g.monto, 0));
  }

  // ══════════════════════════════════════════════════════════
  // VARIACIÓN CIF (SUB/SOBREABSORCIÓN)
  // ══════════════════════════════════════════════════════════

  /**
   * Calcula la variación de CIF (sub/sobreabsorción).
   *
   * Subabsorción: CIF real > CIF aplicado (costo faltante)
   * Sobreabsorción: CIF aplicado > CIF real (costo de más)
   *
   * @param {string} centroId
   * @param {string} periodo
   * @returns {Object}
   */
  calcularVariacionCIF(centroId, periodo) {
    const cifAplicado = this.obtenerCIFAplicado(centroId, periodo);
    const cifReal = this.obtenerCIFReal(centroId, periodo);

    const variacion = this._r2(cifReal - cifAplicado);

    let tipo, interpretacion;
    if (variacion > 0) {
      tipo = 'SUBABSORCION';
      interpretacion = `Faltó aplicar Bs ${variacion} de CIF. Incrementa costo de ventas.`;
    } else if (variacion < 0) {
      tipo = 'SOBREABSORCION';
      interpretacion = `Se aplicó de más Bs ${Math.abs(variacion)} de CIF. Reduce costo de ventas.`;
    } else {
      tipo = 'EQUILIBRIO';
      interpretacion = 'CIF aplicado = CIF real. Sin ajuste necesario.';
    }

    // Generar asiento de ajuste si hay variación
    const asiento = variacion !== 0
      ? this._generarAsientoAjuste(centroId, variacion, tipo, periodo)
      : null;

    const resultado = {
      exito: true,
      centroId,
      periodo,
      cifReal,
      cifAplicado,
      variacion,
      tipo,
      interpretacion,
      asiento
    };

    // Registrar variación
    const variaciones = this._leerVariaciones();
    variaciones.push({
      ...resultado,
      fechaCalculo: new Date().toISOString()
    });
    this._guardarVariaciones(variaciones);

    console.log(`📊 Variación CIF ${centroId}: ${tipo} | Bs ${variacion}`);
    return resultado;
  }

  /**
   * Genera asiento de ajuste por variación de CIF.
   * @private
   */
  _generarAsientoAjuste(centroId, variacion, tipo, periodo) {
    if (!this.motorContable || typeof this.motorContable.crearAsientoManual !== 'function') {
      return {
        generado: false,
        razon: 'Motor Contable no disponible',
        detalle: this._detalleAsiento(variacion, tipo)
      };
    }

    const absVariacion = Math.abs(variacion);
    const lineas = [];

    if (tipo === 'SUBABSORCION') {
      // Debe: Costo de Ventas (5.1.01)
      // Haber: CIF Aplicado / Variación CIF (5.1.99)
      lineas.push({
        cuentaCodigo: '5.1.01',
        cuentaNombre: 'Costo de Ventas',
        debe: absVariacion,
        haber: 0
      });
      lineas.push({
        cuentaCodigo: '5.1.99',
        cuentaNombre: 'Variación CIF (Subabsorción)',
        debe: 0,
        haber: absVariacion
      });
    } else if (tipo === 'SOBREABSORCION') {
      // Debe: CIF Aplicado / Variación CIF (5.1.99)
      // Haber: Costo de Ventas (5.1.01)
      lineas.push({
        cuentaCodigo: '5.1.99',
        cuentaNombre: 'Variación CIF (Sobreabsorción)',
        debe: absVariacion,
        haber: 0
      });
      lineas.push({
        cuentaCodigo: '5.1.01',
        cuentaNombre: 'Costo de Ventas',
        debe: 0,
        haber: absVariacion
      });
    }

    try {
      const asiento = this.motorContable.crearAsientoManual({
        fecha: `${periodo}-12-31`,
        concepto: `Ajuste variación CIF ${tipo} - Centro ${centroId}`,
        lineas
      });

      return {
        generado: true,
        asientoId: asiento?.id || null,
        tipo,
        variacion,
        detalle: this._detalleAsiento(variacion, tipo)
      };
    } catch (e) {
      return {
        generado: false,
        razon: e.message,
        detalle: this._detalleAsiento(variacion, tipo)
      };
    }
  }

  _detalleAsiento(variacion, tipo) {
    const abs = Math.abs(variacion);
    if (tipo === 'SUBABSORCION') {
      return [
        { cuenta: '5.1.01 Costo de Ventas', debe: abs, haber: 0 },
        { cuenta: '5.1.99 Variación CIF', debe: 0, haber: abs }
      ];
    }
    return [
      { cuenta: '5.1.99 Variación CIF', debe: abs, haber: 0 },
      { cuenta: '5.1.01 Costo de Ventas', debe: 0, haber: abs }
    ];
  }

  /**
   * Obtiene el historial de variaciones CIF.
   */
  obtenerHistorialVariaciones(centroId = null) {
    const variaciones = this._leerVariaciones();
    if (!centroId) return variaciones;
    return variaciones.filter(v => v.centroId === centroId);
  }

  /**
   * Calcula el costo total de un producto con CIF incluido.
   */
  calcularCostoConCIF(productoId, costosDirectos, centroId) {
    const costoMP = Number(costosDirectos.materiaPrima) || 0;
    const costoMOD = Number(costosDirectos.manoDeObra) || 0;
    const horasBase = Number(costosDirectos.horasBase) || 0;

    const tasaResult = this.calcularTasaCIF(centroId);
    const cifAplicado = tasaResult.exito
      ? this._r2(horasBase * tasaResult.tasa)
      : 0;

    const costoTotal = this._r2(costoMP + costoMOD + cifAplicado);

    return {
      exito: true,
      costosDirectos: {
        materiaPrima: costoMP,
        manoDeObra: costoMOD
      },
      cif: {
        horasBase,
        tasa: tasaResult.exito ? tasaResult.tasa : 0,
        cifAplicado
      },
      costoTotal,
      desglose: {
        materiaPrima: costoMP,
        manoDeObra: costoMOD,
        cif: cifAplicado,
        total: costoTotal
      }
    };
  }

  // ══════════════════════════════════════════════════════════
  // UTILIDADES PRIVADAS
  // ══════════════════════════════════════════════════════════

  _leerConfig() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY_CONFIG) || '{}');
    } catch (e) {
      return {};
    }
  }

  _guardarConfig(configs) {
    localStorage.setItem(this.KEY_CONFIG, JSON.stringify(configs));
  }

  _leerAplicaciones() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY_APLICACIONES) || '[]');
    } catch (e) {
      return [];
    }
  }

  _guardarAplicaciones(aplicaciones) {
    localStorage.setItem(this.KEY_APLICACIONES, JSON.stringify(aplicaciones));
  }

  _leerVariaciones() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY_VARIACIONES) || '[]');
    } catch (e) {
      return [];
    }
  }

  _guardarVariaciones(variaciones) {
    localStorage.setItem(this.KEY_VARIACIONES, JSON.stringify(variaciones));
  }

  _r2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }
}

window.CostosCIFClase = CostosCIF;
