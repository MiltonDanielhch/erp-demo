// ══════════════════════════════════════════════════════════════
// analisis-clientes.js — Módulo 8.8: Análisis de Margen por Cliente
// ══════════════════════════════════════════════════════════════

/**
 * Análisis de Rentabilidad por Cliente
 *
 * Calcula:
 *   - Ventas totales y costo de ventas por cliente
 *   - Margen total y % de margen
 *   - Costo de atención (visitas, fletes, descuentos)
 *   - Rentabilidad real ajustada
 *   - Clasificación: VIP, Regular, Ocasional, No Rentable
 *
 * Pareto de clientes:
 *   Top 20% de clientes → 80% del margen total
 */
class AnalisisClientes {

  constructor(deps = {}) {
    this.almacenamiento = deps.almacenamiento || null;
    this.inventarioCapas = deps.inventarioCapas || null;
    this.KEY_COSTOS_ATENCION = 'erp_costos_atencion_clientes';

    console.log('👥 Módulo Análisis de Clientes inicializado');
  }

  // ══════════════════════════════════════════════════════════
  // CÁLCULO DE MARGEN POR CLIENTE
  // ══════════════════════════════════════════════════════════

  /**
   * Calcula el margen de un cliente en un período.
   *
   * @param {string} clienteId
   * @param {string} [periodo] - "AAAA-MM"
   * @returns {Object}
   */
  calcularMargenCliente(clienteId, periodo) {
    const ventas = this._obtenerVentasCliente(clienteId, periodo);
    const costoTotal = this._calcularCostoVentasCliente(ventas.detalle);

    const margen = this._r2(ventas.ingresosTotales - costoTotal);
    const porcentaje = ventas.ingresosTotales > 0
      ? this._r2((margen / ventas.ingresosTotales) * 100)
      : 0;

    return {
      exito: true,
      clienteId,
      clienteNombre: ventas.clienteNombre,
      periodo,
      ventasTotales: this._r2(ventas.ingresosTotales),
      costoVentas: this._r2(costoTotal),
      margen,
      porcentaje,
      unidadesVendidas: ventas.unidades,
      cantidadFacturas: ventas.cantidadFacturas,
      detalle: ventas.detalle
    };
  }

  /**
   * Calcula margen de todos los clientes activos.
   */
  analizarCarteraClientes(periodo) {
    const clientes = this._obtenerTodosLosClientes();
    const resultados = clientes
      .map(c => this.calcularMargenCliente(c.id, periodo))
      .filter(r => r.exito && r.ventasTotales > 0);

    // Ordenar por margen descendente
    resultados.sort((a, b) => b.margen - a.margen);

    // Clasificar
    const clasificados = resultados.map(r => ({
      ...r,
      clasificacion: this._clasificarCliente(r)
    }));

    // Pareto (80/20)
    const margenTotalGeneral = this._r2(clasificados.reduce((s, c) => s + c.margen, 0));
    const pareto = this._calcularPareto(clasificados, margenTotalGeneral);

    // Totales
    const totales = {
      totalClientes: clasificados.length,
      ventasTotales: this._r2(clasificados.reduce((s, c) => s + c.ventasTotales, 0)),
      margenTotal: margenTotalGeneral,
      vip: clasificados.filter(c => c.clasificacion === 'VIP').length,
      regular: clasificados.filter(c => c.clasificacion === 'REGULAR').length,
      ocasional: clasificados.filter(c => c.clasificacion === 'OCASIONAL').length,
      noRentable: clasificados.filter(c => c.clasificacion === 'NO_RENTABLE').length
    };

    return {
      exito: true,
      periodo,
      clientes: clasificados,
      totales,
      pareto
    };
  }

  // ══════════════════════════════════════════════════════════
  // COSTO DE ATENCIÓN AL CLIENTE
  // ══════════════════════════════════════════════════════════

  /**
   * Registra costos de atención a un cliente.
   */
  registrarCostoAtencion(clienteId, costo = {}) {
    if (!clienteId) return { exito: false, errores: ['Cliente ID requerido'] };

    const registro = {
      id: 'ca-' + Date.now().toString(36),
      clienteId,
      tipo: costo.tipo || 'GENERAL', // VISITA, FLETE, DESCUENTO, CREDITO
      monto: this._r2(Number(costo.monto) || 0),
      descripcion: costo.descripcion || '',
      fecha: costo.fecha || new Date().toISOString().split('T')[0]
    };

    const costos = this._leerCostosAtencion();
    costos.push(registro);
    this._guardarCostosAtencion(costos);

    console.log(`💼 Costo atención registrado: ${clienteId} | Bs ${registro.monto} | ${registro.tipo}`);
    return { exito: true, registro };
  }

  /**
   * Calcula el costo de atención de un cliente en un período.
   */
  calcularCostoAtencion(clienteId, periodo) {
    const costos = this._leerCostosAtencion();
    const relevantes = costos.filter(c =>
      c.clienteId === clienteId && (!periodo || c.fecha.startsWith(periodo))
    );

    const costoTotal = this._r2(relevantes.reduce((s, c) => s + c.monto, 0));
    const detallePorTipo = {};

    relevantes.forEach(c => {
      detallePorTipo[c.tipo] = (detallePorTipo[c.tipo] || 0) + c.monto;
    });

    return {
      exito: true,
      clienteId,
      periodo,
      costoTotal,
      detallePorTipo,
      cantidadRegistros: relevantes.length
    };
  }

  /**
   * Calcula rentabilidad real (margen - costo atención).
   */
  calcularRentabilidadReal(clienteId, periodo) {
    const margenResult = this.calcularMargenCliente(clienteId, periodo);
    if (!margenResult.exito) return margenResult;

    const costoAtencion = this.calcularCostoAtencion(clienteId, periodo);
    const margenNeto = this._r2(margenResult.margen - costoAtencion.costoTotal);
    const porcentajeNeto = margenResult.ventasTotales > 0
      ? this._r2((margenNeto / margenResult.ventasTotales) * 100)
      : 0;

    const esRentable = margenNeto > 0;

    return {
      exito: true,
      clienteId,
      clienteNombre: margenResult.clienteNombre,
      periodo,
      ventasTotales: margenResult.ventasTotales,
      margenContable: margenResult.margen,
      costoAtencion: costoAtencion.costoTotal,
      margenNeto,
      porcentajeNeto,
      esRentable,
      alerta: !esRentable && margenResult.margen > 0
        ? `⚠️ Cliente genera margen contable positivo (Bs ${margenResult.margen}) pero el costo de atención (Bs ${costoAtencion.costoTotal}) lo hace NO RENTABLE`
        : null,
      detalleCostoAtencion: costoAtencion.detallePorTipo
    };
  }

  /**
   * Identifica clientes no rentables (margen - costo atención < 0).
   */
  identificarClientesNoRentables(periodo) {
    const clientes = this._obtenerTodosLosClientes();
    const noRentables = [];

    clientes.forEach(c => {
      const rent = this.calcularRentabilidadReal(c.id, periodo);
      if (rent.exito && !rent.esRentable && rent.ventasTotales > 0) {
        noRentables.push({
          clienteId: c.id,
          clienteNombre: c.nombre,
          ventasTotales: rent.ventasTotales,
          margenContable: rent.margenContable,
          costoAtencion: rent.costoAtencion,
          margenNeto: rent.margenNeto,
          alerta: rent.alerta
        });
      }
    });

    return {
      exito: true,
      periodo,
      totalClientesNoRentables: noRentables.length,
      clientes: noRentables,
      perdidaTotal: this._r2(noRentables.reduce((s, c) => s + Math.abs(c.margenNeto), 0)),
      recomendacion: noRentables.length > 0
        ? 'Revisar estructura de atención, negociar precios o considerar desvinculación'
        : 'Todos los clientes activos son rentables'
    };
  }

  // ══════════════════════════════════════════════════════════
  // CLASIFICACIÓN Y PARETO
  // ══════════════════════════════════════════════════════════

  /**
   * Clasifica un cliente según su desempeño.
   * @private
   */
  _clasificarCliente(cliente) {
    if (cliente.margen < 0) return 'NO_RENTABLE';
    if (cliente.porcentaje >= 25 && cliente.ventasTotales >= 20000) return 'VIP';
    if (cliente.porcentaje >= 15 && cliente.ventasTotales >= 5000) return 'REGULAR';
    return 'OCASIONAL';
  }

  /**
   * Calcula análisis Pareto (80/20) de clientes.
   * @private
   */
  _calcularPareto(clientes, margenTotal) {
    let margenAcumulado = 0;
    const top20 = [];
    const bottom80 = [];

    const umbralTop = Math.ceil(clientes.length * 0.2);

    clientes.forEach((c, i) => {
      margenAcumulado += c.margen;
      const porcentajeAcumulado = margenTotal > 0
        ? this._r2((margenAcumulado / margenTotal) * 100)
        : 0;

      const dato = {
        ...c,
        margenAcumulado: this._r2(margenAcumulado),
        porcentajeAcumulado,
        posicion: i + 1
      };

      if (i < umbralTop) {
        top20.push(dato);
      } else {
        bottom80.push(dato);
      }
    });

    return {
      top20: {
        clientes: top20,
        cantidad: top20.length,
        margenTotal: this._r2(top20.reduce((s, c) => s + c.margen, 0)),
        porcentajeMargen: margenTotal > 0
          ? this._r2((top20.reduce((s, c) => s + c.margen, 0) / margenTotal) * 100)
          : 0
      },
      bottom80: {
        clientes: bottom80,
        cantidad: bottom80.length,
        margenTotal: this._r2(bottom80.reduce((s, c) => s + c.margen, 0)),
        porcentajeMargen: margenTotal > 0
          ? this._r2((bottom80.reduce((s, c) => s + c.margen, 0) / margenTotal) * 100)
          : 0
      },
      interpretacion: `El top ${top20.length} clientes (${top20.length} de ${clientes.length}) genera el ${
        margenTotal > 0 ? this._r2((top20.reduce((s, c) => s + c.margen, 0) / margenTotal) * 100) : 0
      }% del margen total`
    };
  }

  // ══════════════════════════════════════════════════════════
  // UTILIDADES PRIVADAS
  // ══════════════════════════════════════════════════════════

  _obtenerVentasCliente(clienteId, periodo) {
    const documentos = this._obtenerDocumentosVenta();
    const ventas = documentos.filter(d => {
      const fecha = d.fecha || d.fechaEmision || '';
      const matchPeriodo = !periodo || fecha.startsWith(periodo);
      const matchCliente = (d.clienteId === clienteId) ||
        (d.clienteNit && d.clienteNit === this._obtenerNitCliente(clienteId));
      return matchPeriodo && matchCliente;
    });

    let ingresos = 0;
    let unidades = 0;
    const detalle = [];
    let clienteNombre = '';

    ventas.forEach(v => {
      const totalVenta = Number(v.total || v.monto || v.montoTotal || 0);
      ingresos += totalVenta;

      if (v.detalle && Array.isArray(v.detalle)) {
        v.detalle.forEach(item => {
          unidades += Number(item.cantidad) || 0;
          detalle.push({
            productoId: item.productoId,
            cantidad: item.cantidad,
            precio: item.precioUnitario || (item.total / (item.cantidad || 1)),
            total: item.total
          });
        });
      }

      if (!clienteNombre) {
        clienteNombre = v.clienteNombre || v.razonSocial || '';
      }
    });

    return {
      clienteNombre,
      ingresosTotales: this._r2(ingresos),
      unidades,
      cantidadFacturas: ventas.length,
      detalle
    };
  }

  _calcularCostoVentasCliente(detalle) {
    if (!this.inventarioCapas) return 0;

    let costoTotal = 0;
    detalle.forEach(item => {
      const prod = this.inventarioCapas.obtenerCapas(item.productoId);
      if (prod && prod.totalUnidades > 0) {
        const costoUnit = prod.valorTotal / prod.totalUnidades;
        costoTotal += costoUnit * (item.cantidad || 0);
      }
    });

    return this._r2(costoTotal);
  }

  _obtenerTodosLosClientes() {
    try {
      const catalogo = JSON.parse(localStorage.getItem('erp_clientes') || '[]');
      if (Array.isArray(catalogo)) return catalogo;

      // Fallback: obtener desde documentos de venta
      const documentos = this._obtenerDocumentosVenta();
      const clientesMap = new Map();

      documentos.forEach(d => {
        if (d.clienteId) {
          if (!clientesMap.has(d.clienteId)) {
            clientesMap.set(d.clienteId, {
              id: d.clienteId,
              nombre: d.clienteNombre || d.razonSocial || 'Sin nombre',
              nit: d.clienteNit || ''
            });
          }
        }
      });

      return Array.from(clientesMap.values());
    } catch (e) {
      return [];
    }
  }

  _obtenerNitCliente(clienteId) {
    const clientes = this._obtenerTodosLosClientes();
    const c = clientes.find(cl => cl.id === clienteId);
    return c ? c.nit : null;
  }

  _obtenerDocumentosVenta() {
    const colecciones = ['ventas', 'facturas', 'erp_ventas', 'documentos', 'documentosFuente'];
    let todos = [];

    colecciones.forEach(nombre => {
      try {
        const arr = JSON.parse(localStorage.getItem(nombre) || '[]');
        if (Array.isArray(arr)) {
          const ventas = arr.filter(d =>
            d.clienteId || d.clienteNit || d.clienteNombre
          );
          todos = todos.concat(ventas);
        }
      } catch (e) {}
    });

    return todos;
  }

  _leerCostosAtencion() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY_COSTOS_ATENCION) || '[]');
    } catch (e) {
      return [];
    }
  }

  _guardarCostosAtencion(costos) {
    localStorage.setItem(this.KEY_COSTOS_ATENCION, JSON.stringify(costos));
  }

  _r2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }
}

window.AnalisisClientesClase = AnalisisClientes;
