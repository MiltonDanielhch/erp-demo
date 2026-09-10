// ══════════════════════════════════════════════════════════════
// centros-costo.js — Módulo 8.4: Centros de Costo
// ══════════════════════════════════════════════════════════════

/**
 * Gestión de Centros de Costo
 *
 * Clasifica los gastos de la empresa por departamento o proyecto
 * para evaluar el desempeño de cada unidad de negocio.
 *
 * Tipos de centros:
 *   - PRODUCTIVO: fabrica producto o presta servicio principal
 *   - SERVICIO: apoya a los productivos (mantenimiento, calidad, almacén)
 *   - ADMINISTRATIVO: gestión general (gerencia, contabilidad, RRHH)
 *
 * Los centros de SERVICIO deben distribuir sus costos a los
 * PRODUCTIVOS al final de cada período.
 */
class CentrosCosto {

  constructor(deps = {}) {
    this.almacenamiento = deps.almacenamiento || null;
    this.KEY_CENTROS = 'erp_costos_centros';
    this.KEY_GASTOS = 'erp_costos_gastos_asignados';
    this.KEY_DISTRIBUCIONES = 'erp_costos_distribuciones';

    console.log('🏢 Módulo Centros de Costo inicializado');
  }

  // ══════════════════════════════════════════════════════════
  // CRUD DE CENTROS DE COSTO
  // ══════════════════════════════════════════════════════════

  /**
   * Crea un nuevo centro de costo.
   *
   * @param {Object} datos
   * @returns {Object}
   */
  crearCentro(datos = {}) {
    const tiposValidos = ['PRODUCTIVO', 'SERVICIO', 'ADMINISTRATIVO'];

    if (!datos.codigo || !datos.nombre) {
      return { exito: false, errores: ['Código y nombre son obligatorios'] };
    }

    if (!tiposValidos.includes(datos.tipo)) {
      return { exito: false, errores: [`Tipo inválido: ${datos.tipo}. Debe ser uno de: ${tiposValidos.join(', ')}`] };
    }

    const centros = this._leerCentros();
    if (centros.some(c => c.codigo === datos.codigo)) {
      return { exito: false, errores: [`Código ${datos.codigo} ya existe`] };
    }

    const centro = {
      id: 'cc-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 6),
      codigo: datos.codigo.toUpperCase(),
      nombre: datos.nombre,
      tipo: datos.tipo,
      responsable: datos.responsable || '',
      departamento: datos.departamento || '',
      presupuestoAnual: this._r2(Number(datos.presupuestoAnual) || 0),
      gastosAcumulados: 0,
      porcentajeEjecucion: 0,
      estado: 'ACTIVO',
      creadoEn: new Date().toISOString(),
      historial: []
    };

    centros.push(centro);
    this._guardarCentros(centros);

    console.log(`🏢 Centro creado: ${centro.codigo} - ${centro.nombre}`);
    return { exito: true, centro };
  }

  /**
   * Obtiene todos los centros con filtros.
   */
  obtenerTodos(filtros = {}) {
    const centros = this._leerCentros();
    let resultado = centros;

    if (filtros.tipo) {
      resultado = resultado.filter(c => c.tipo === filtros.tipo);
    }
    if (filtros.estado) {
      resultado = resultado.filter(c => c.estado === filtros.estado);
    }
    if (filtros.departamento) {
      resultado = resultado.filter(c => c.departamento === filtros.departamento);
    }

    return resultado.map(c => ({
      ...c,
      porcentajeEjecucion: c.presupuestoAnual > 0
        ? this._r2((c.gastosAcumulados / c.presupuestoAnual) * 100)
        : 0
    }));
  }

  /**
   * Obtiene un centro por ID.
   */
  obtenerPorId(centroId) {
    const centros = this._leerCentros();
    return centros.find(c => c.id === centroId) || null;
  }

  /**
   * Actualiza datos de un centro.
   */
  actualizarCentro(centroId, cambios) {
    const centros = this._leerCentros();
    const indice = centros.findIndex(c => c.id === centroId);

    if (indice === -1) {
      return { exito: false, errores: ['Centro no encontrado'] };
    }

    const cambiosSeguros = { ...cambos };
    delete cambiosSeguros.id;
    delete cambiosSeguros.creadoEn;
    delete cambiosSeguros.gastosAcumulados;

    centros[indice] = { ...centros[indice], ...cambios };
    this._guardarCentros(centros);

    return { exito: true, centro: centros[indice] };
  }

  /**
   * Desactiva un centro (no elimina).
   */
  desactivarCentro(centroId) {
    const centros = this._leerCentros();
    const centro = centros.find(c => c.id === centroId);
    if (!centro) return { exito: false, errores: ['Centro no encontrado'] };

    centro.estado = 'INACTIVO';
    this._guardarCentros(centros);
    return { exito: true, centro };
  }

  // ══════════════════════════════════════════════════════════
  // ASIGNACIÓN DE GASTOS
  // ══════════════════════════════════════════════════════════

  /**
   * Asigna un gasto a un centro de costo.
   *
   * @param {string} centroId
   * @param {Object} gasto
   * @param {number} monto
   * @returns {Object}
   */
  asignarGasto(centroId, gasto = {}, monto = 0) {
    const centros = this._leerCentros();
    const centro = centros.find(c => c.id === centroId);

    if (!centro) {
      return { exito: false, errores: ['Centro no encontrado'] };
    }

    const montoNum = this._r2(Number(monto) || 0);
    if (montoNum <= 0) {
      return { exito: false, errores: ['Monto debe ser mayor a 0'] };
    }

    const asignacion = {
      id: 'gas-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 6),
      centroId,
      centroCodigo: centro.codigo,
      descripcion: gasto.descripcion || 'Gasto sin descripción',
      categoria: gasto.categoria || 'GENERAL',
      monto: montoNum,
      documento: gasto.documento || '',
      fecha: gasto.fecha || new Date().toISOString().split('T')[0],
      fechaAsignacion: new Date().toISOString()
    };

    // Actualizar acumulado del centro
    centro.gastosAcumulados = this._r2(centro.gastosAcumulados + montoNum);
    centro.porcentajeEjecucion = centro.presupuestoAnual > 0
      ? this._r2((centro.gastosAcumulados / centro.presupuestoAnual) * 100)
      : 0;

    centro.historial.push({
      fecha: new Date().toISOString(),
      accion: 'ASIGNACION_GASTO',
      monto: montoNum,
      descripcion: asignacion.descripcion
    });

    // Guardar gasto
    const gastos = this._leerGastos();
    gastos.push(asignacion);
    this._guardarGastos(gastos);
    this._guardarCentros(centros);

    // Alerta si supera presupuesto
    const alerta = this._verificarPresupuesto(centro);

    console.log(`💰 Gasto asignado: ${centro.codigo} | Bs ${montoNum} | ${asignacion.descripcion}`);
    return {
      exito: true,
      asignacion,
      centro,
      alerta
    };
  }

  /**
   * Obtiene gastos de un centro.
   */
  obtenerGastos(centroId, periodo = null) {
    const gastos = this._leerGastos();
    let resultado = gastos.filter(g => g.centroId === centroId);

    if (periodo) {
      resultado = resultado.filter(g => g.fecha.startsWith(periodo));
    }

    return resultado;
  }

  /**
   * Verifica si el centro supera presupuesto.
   * @private
   */
  _verificarPresupuesto(centro) {
    if (centro.presupuestoAnual <= 0) return null;

    const porcentaje = (centro.gastosAcumulados / centro.presupuestoAnual) * 100;

    if (porcentaje >= 100) {
      return {
        nivel: 'CRITICO',
        icono: '🔴',
        mensaje: `⚠️ ${centro.codigo} superó el presupuesto (${porcentaje.toFixed(1)}%)`
      };
    }
    if (porcentaje >= 90) {
      return {
        nivel: 'ADVERTENCIA',
        icono: '🟡',
        mensaje: `⚠️ ${centro.codigo} al ${porcentaje.toFixed(1)}% del presupuesto`
      };
    }
    if (porcentaje >= 75) {
      return {
        nivel: 'INFO',
        icono: '🟢',
        mensaje: `${centro.codigo} al ${porcentaje.toFixed(1)}% del presupuesto`
      };
    }
    return null;
  }

  // ══════════════════════════════════════════════════════════
  // EJECUCIÓN PRESUPUESTAL
  // ══════════════════════════════════════════════════════════

  /**
   * Calcula ejecución presupuestal de un centro.
   */
  calcularEjecucionPresupuestal(centroId, periodo = null) {
    const centro = this.obtenerPorId(centroId);
    if (!centro) return { exito: false, errores: ['Centro no encontrado'] };

    const gastos = this.obtenerGastos(centroId, periodo);
    const ejecutado = this._r2(gastos.reduce((s, g) => s + g.monto, 0));

    // Presupuestado proporcional al período
    const mesesTranscurridos = periodo
      ? Number(periodo.split('-')[1])
      : new Date().getMonth() + 1;

    const presupuestadoProporcional = this._r2(
      (centro.presupuestoAnual / 12) * mesesTranscurridos
    );

    const desviacion = this._r2(ejecutado - presupuestadoProporcional);
    const porcentajeDesviacion = presupuestadoProporcional > 0
      ? this._r2((desviacion / presupuestadoProporcional) * 100)
      : 0;

    return {
      exito: true,
      centroId,
      centroCodigo: centro.codigo,
      centroNombre: centro.nombre,
      periodo: periodo || 'ACUMULADO',
      mesesTranscurridos,
      presupuestadoAnual: centro.presupuestoAnual,
      presupuestadoProporcional,
      ejecutado,
      desviacion,
      porcentajeDesviacion,
      porcentajeEjecucionTotal: centro.presupuestoAnual > 0
        ? this._r2((centro.gastosAcumulados / centro.presupuestoAnual) * 100)
        : 0,
      estado: desviacion > 0
        ? (porcentajeDesviacion > 10 ? 'SOBRE_EJECUTADO' : 'LEVEMENTE_SOBRE')
        : 'SUB_EJECUTADO'
    };
  }

  /**
   * Distribuye costos de un centro de SERVICIO a los PRODUCTIVOS.
   *
   * @param {string} centroServicioId
   * @param {Object} criterios - { centroId: porcentaje }
   * @returns {Object}
   */
  distribuirCostosServicio(centroServicioId, criterios = {}) {
    const centros = this._leerCentros();
    const centroOrigen = centros.find(c => c.id === centroServicioId);

    if (!centroOrigen) {
      return { exito: false, errores: ['Centro de servicio no encontrado'] };
    }

    if (centroOrigen.tipo !== 'SERVICIO') {
      return { exito: false, errores: ['Solo se pueden distribuir costos de centros tipo SERVICIO'] };
    }

    // Validar criterios
    const totalPorcentaje = Object.values(criterios).reduce((s, p) => s + Number(p), 0);
    if (Math.abs(totalPorcentaje - 100) > 0.01) {
      return { exito: false, errores: [`Los criterios deben sumar 100%. Actual: ${totalPorcentaje}%`] };
    }

    const montoDistribuir = centroOrigen.gastosAcumulados;
    if (montoDistribuir <= 0) {
      return { exito: false, errores: ['No hay gastos acumulados para distribuir'] };
    }

    const distribuciones = [];

    Object.entries(criterios).forEach(([centroDestinoId, porcentaje]) => {
      const centroDestino = centros.find(c => c.id === centroDestinoId);
      if (!centroDestino || centroDestino.tipo === 'SERVICIO') return;

      const monto = this._r2(montoDistribuir * (porcentaje / 100));

      centroDestino.gastosAcumulados = this._r2(centroDestino.gastosAcumulados + monto);
      centroDestino.historial.push({
        fecha: new Date().toISOString(),
        accion: 'DISTRIBUCION_DEDE_' + centroOrigen.codigo,
        monto,
        descripcion: `Distribución desde ${centroOrigen.nombre} (${porcentaje}%)`
      });

      distribuciones.push({
        centroDestinoId,
        centroDestinoCodigo: centroDestino.codigo,
        porcentaje,
        monto
      });
    });

    // Marcar centro origen como distribuido
    centroOrigen.gastosAcumulados = 0;
    centroOrigen.historial.push({
      fecha: new Date().toISOString(),
      accion: 'DISTRIBUIDO',
      monto: montoDistribuir,
      descripcion: 'Costos distribuidos a centros productivos'
    });

    // Registrar distribución
    const distribucionesLog = this._leerDistribuciones();
    distribucionesLog.push({
      fecha: new Date().toISOString(),
      centroOrigenId,
      centroOrigenCodigo: centroOrigen.codigo,
      montoTotal: montoDistribuir,
      distribuciones
    });
    this._guardarDistribuciones(distribucionesLog);

    this._guardarCentros(centros);

    console.log(`🔄 Distribución: ${centroOrigen.codigo} | Bs ${montoDistribuir} → ${distribuciones.length} centros`);
    return {
      exito: true,
      centroOrigen,
      montoDistribuido: montoDistribuir,
      distribuciones
    };
  }

  /**
   * Genera resumen ejecutivo de todos los centros.
   */
  generarResumenEjecutivo() {
    const centros = this.obtenerTodos();

    const resumen = {
      totalCentros: centros.length,
      porTipo: {
        PRODUCTIVO: centros.filter(c => c.tipo === 'PRODUCTIVO').length,
        SERVICIO: centros.filter(c => c.tipo === 'SERVICIO').length,
        ADMINISTRATIVO: centros.filter(c => c.tipo === 'ADMINISTRATIVO').length
      },
      presupuestoTotal: this._r2(centros.reduce((s, c) => s + c.presupuestoAnual, 0)),
      gastoTotal: this._r2(centros.reduce((s, c) => s + c.gastosAcumulados, 0)),
      ejecucionPromedio: 0,
      alertas: []
    };

    resumen.ejecucionPromedio = resumen.presupuestoTotal > 0
      ? this._r2((resumen.gastoTotal / resumen.presupuestoTotal) * 100)
      : 0;

    centros.forEach(c => {
      if (c.presupuestoAnual > 0) {
        const alerta = this._verificarPresupuesto(c);
        if (alerta) resumen.alertas.push(alerta);
      }
    });

    return resumen;
  }

  // ══════════════════════════════════════════════════════════
  // UTILIDADES PRIVADAS
  // ══════════════════════════════════════════════════════════

  _leerCentros() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY_CENTROS) || '[]');
    } catch (e) {
      return [];
    }
  }

  _guardarCentros(centros) {
    localStorage.setItem(this.KEY_CENTROS, JSON.stringify(centros));
  }

  _leerGastos() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY_GASTOS) || '[]');
    } catch (e) {
      return [];
    }
  }

  _guardarGastos(gastos) {
    localStorage.setItem(this.KEY_GASTOS, JSON.stringify(gastos));
  }

  _leerDistribuciones() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY_DISTRIBUCIONES) || '[]');
    } catch (e) {
      return [];
    }
  }

  _guardarDistribuciones(distribuciones) {
    localStorage.setItem(this.KEY_DISTRIBUCIONES, JSON.stringify(distribuciones));
  }

  _r2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }
}

window.CentrosCostoClase = CentrosCosto;
