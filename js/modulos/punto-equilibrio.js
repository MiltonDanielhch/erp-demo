// ══════════════════════════════════════════════════════════════
// punto-equilibrio.js — Módulo 8.9: Análisis CVP
// ══════════════════════════════════════════════════════════════

/**
 * Análisis Costo-Volumen-Utilidad (CVP) y Punto de Equilibrio
 *
 * Calcula:
 *   - Punto de equilibrio en unidades y Bs
 *   - Margen de contribución %
 *   - Margen de seguridad
 *   - Simulador what-if (escenarios)
 *
 * Fórmulas:
 *   PE unidades = Costos Fijos / (Precio - Costo Variable Unitario)
 *   PE Bs = Costos Fijos / Margen Contribución %
 *   Margen Seguridad = (Ventas - PE) / Ventas × 100
 */
class PuntoEquilibrio {

  constructor(deps = {}) {
    this.almacenamiento = deps.almacenamiento || null;
    this.centrosCosto = deps.centrosCosto || null;

    console.log('⚖️ Módulo Punto de Equilibrio inicializado');
  }

  // ══════════════════════════════════════════════════════════
  // CÁLCULO DEL PUNTO DE EQUILIBRIO
  // ══════════════════════════════════════════════════════════

  /**
   * Calcula el punto de equilibrio del período.
   *
   * @param {string} [periodo] - "AAAA-MM"
   * @param {Object} [datos] - datos manuales para sobreescribir
   * @returns {Object}
   */
  calcularPuntoEquilibrio(periodo, datos = {}) {
    const costosFijos = datos.costosFijos || this._obtenerCostosFijos(periodo);
    const ventas = this._obtenerVentasDelPeriodo(periodo);

    const margenContribucionUnitario = this._r2(
      ventas.precioPromedio - ventas.costoVariablePromedio
    );

    const margenContribucionPct = ventas.precioPromedio > 0
      ? this._r2((margenContribucionUnitario / ventas.precioPromedio) * 100)
      : 0;

    const peUnidades = margenContribucionUnitario > 0
      ? Math.ceil(costosFijos / margenContribucionUnitario)
      : 0;

    const peBs = margenContribucionPct > 0
      ? this._r2(costosFijos / (margenContribucionPct / 100))
      : 0;

    // Margen de seguridad
    const margenSeguridad = this._calcularMargenSeguridad(ventas.ingresosTotales, peBs);

    // Utilidad proyectada al nivel actual
    const utilidadActual = this._r2(
      ventas.ingresosTotales - costosFijos - (ventas.costoVariablePromedio * ventas.unidadesVendidas)
    );

    return {
      exito: true,
      periodo,
      costosFijos,
      ventasReales: {
        ingresosTotales: ventas.ingresosTotales,
        unidadesVendidas: ventas.unidadesVendidas,
        precioPromedio: ventas.precioPromedio,
        costoVariablePromedio: ventas.costoVariablePromedio
      },
      margenContribucion: {
        unitario: margenContribucionUnitario,
        porcentaje: margenContribucionPct
      },
      puntoEquilibrio: {
        unidades: peUnidades,
        enBs: peBs
      },
      margenSeguridad,
      utilidadActual,
      interpretacion: this._interpretarPE(ventas.ingresosTotales, peBs, margenSeguridad)
    };
  }

  /**
   * Calcula el margen de seguridad.
   */
  calcularMargenSeguridad(periodo) {
    const pe = this.calcularPuntoEquilibrio(periodo);
    if (!pe.exito) return pe;

    return {
      exito: true,
      periodo,
      ventasReales: pe.ventasReales.ingresosTotales,
      peBs: pe.puntoEquilibrio.enBs,
      margenSeguridadBs: pe.margenSeguridad.bs,
      margenSeguridadPct: pe.margenSeguridad.porcentaje,
      interpretacion: pe.margenSeguridad.porcentaje >= 30
        ? '✅ Margen de seguridad saludable'
        : pe.margenSeguridad.porcentaje >= 15
        ? '🟡 Margen de seguridad ajustado'
        : '🔴 Margen de seguridad crítico'
    };
  }

  // ══════════════════════════════════════════════════════════
  // SIMULADOR WHAT-IF
  // ══════════════════════════════════════════════════════════

  /**
   * Simula escenarios "qué pasa si".
   *
   * @param {string} periodo
   * @param {Object} cambios - { precio, volumen, costosVariables, costosFijos } (en %)
   * @returns {Object}
   */
  simularEscenario(periodo, cambios = {}) {
    const base = this.calcularPuntoEquilibrio(periodo);
    if (!base.exito) return base;

    const cambioPrecio = Number(cambios.precio) || 0;         // %
    const cambioVolumen = Number(cambios.volumen) || 0;       // %
    const cambioCostosVar = Number(cambios.costosVariables) || 0; // %
    const cambioCostosFijos = Number(cambios.costosFijos) || 0;   // %

    const nuevoPrecio = this._r2(base.ventasReales.precioPromedio * (1 + cambioPrecio / 100));
    const nuevoCostoVar = this._r2(base.ventasReales.costoVariablePromedio * (1 + cambioCostosVar / 100));
    const nuevasUnidades = Math.round(base.ventasReales.unidadesVendidas * (1 + cambioVolumen / 100));
    const nuevosCostosFijos = this._r2(base.costosFijos * (1 + cambioCostosFijos / 100));

    const nuevoMargenUnit = this._r2(nuevoPrecio - nuevoCostoVar);
    const nuevoMargenPct = nuevoPrecio > 0 ? this._r2((nuevoMargenUnit / nuevoPrecio) * 100) : 0;

    const nuevoPE_Unidades = nuevoMargenUnit > 0 ? Math.ceil(nuevosCostosFijos / nuevoMargenUnit) : 0;
    const nuevoPE_Bs = nuevoMargenPct > 0 ? this._r2(nuevosCostosFijos / (nuevoMargenPct / 100)) : 0;

    const nuevosIngresos = this._r2(nuevoPrecio * nuevasUnidades);
    const nuevaUtilidad = this._r2(
      nuevosIngresos - nuevosCostosFijos - (nuevoCostoVar * nuevasUnidades)
    );

    const nuevoMargenSeg = nuevosIngresos > 0
      ? this._r2(((nuevosIngresos - nuevoPE_Bs) / nuevosIngresos) * 100)
      : 0;

    return {
      exito: true,
      periodo,
      escenario: {
        cambios: {
          precio: cambioPrecio,
          volumen: cambioVolumen,
          costosVariables: cambioCostosVar,
          costosFijos: cambioCostosFijos
        }
      },
      original: {
        precio: base.ventasReales.precioPromedio,
        unidades: base.ventasReales.unidadesVendidas,
        costoVariable: base.ventasReales.costoVariablePromedio,
        costosFijos: base.costosFijos,
        ingresos: base.ventasReales.ingresosTotales,
        utilidad: base.utilidadActual,
        peUnidades: base.puntoEquilibrio.unidades,
        peBs: base.puntoEquilibrio.enBs,
        margenSeguridad: base.margenSeguridad.porcentaje
      },
      proyectado: {
        precio: nuevoPrecio,
        unidades: nuevasUnidades,
        costoVariable: nuevoCostoVar,
        costosFijos: nuevosCostosFijos,
        ingresos: nuevosIngresos,
        utilidad: nuevaUtilidad,
        peUnidades: nuevoPE_Unidades,
        peBs: nuevoPE_Bs,
        margenSeguridad: nuevoMargenSeg
      },
      impacto: {
        utilidad: this._r2(nuevaUtilidad - base.utilidadActual),
        utilidadPct: base.utilidadActual !== 0
          ? this._r2(((nuevaUtilidad - base.utilidadActual) / Math.abs(base.utilidadActual)) * 100)
          : 0,
        peBs: this._r2(nuevoPE_Bs - base.puntoEquilibrio.enBs),
        margenSeguridad: this._r2(nuevoMargenSeg - base.margenSeguridad.porcentaje)
      }
    };
  }

  /**
   * Simula múltiples escenarios predefinidos.
   */
  simularEscenariosComunes(periodo) {
    return {
      exito: true,
      periodo,
      escenarios: {
        'Precio +10%': this.simularEscenario(periodo, { precio: 10 }),
        'Precio -5%': this.simularEscenario(periodo, { precio: -5 }),
        'Volumen +20%': this.simularEscenario(periodo, { volumen: 20 }),
        'Volumen -10%': this.simularEscenario(periodo, { volumen: -10 }),
        'Costos Variables +8%': this.simularEscenario(periodo, { costosVariables: 8 }),
        'Costos Fijos -5%': this.simularEscenario(periodo, { costosFijos: -5 }),
        'Combinado (precio +5%, volumen +10%)': this.simularEscenario(periodo, { precio: 5, volumen: 10 })
      }
    };
  }

  // ══════════════════════════════════════════════════════════
  // GRÁFICO DEL PUNTO DE EQUILIBRIO
  // ══════════════════════════════════════════════════════════

  /**
   * Genera configuración para Chart.js del punto de equilibrio.
   */
  generarGraficoPuntoEquilibrio(periodo) {
    const pe = this.calcularPuntoEquilibrio(periodo);
    if (!pe.exito) return { exito: false, errores: pe.errores };

    const maxUnidades = Math.max(
      pe.ventasReales.unidadesVendidas * 1.5,
      pe.puntoEquilibrio.unidades * 1.5,
      10
    );

    const puntos = 20;
    const incremento = maxUnidades / puntos;

    const ingresos = [];
    const costosTotales = [];
    const costosFijos = [];
    const etiquetas = [];

    for (let i = 0; i <= puntos; i++) {
      const u = Math.round(i * incremento);
      etiquetas.push(u.toString());
      ingresos.push(this._r2(u * pe.ventasReales.precioPromedio));
      costosTotales.push(this._r2(pe.costosFijos + u * pe.ventasReales.costoVariablePromedio));
      costosFijos.push(pe.costosFijos);
    }

    return {
      exito: true,
      periodo,
      puntoEquilibrio: pe.puntoEquilibrio,
      chartConfig: {
        type: 'line',
        data: {
          labels: etiquetas,
          datasets: [
            {
              label: 'Ingresos',
              data: ingresos,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fill: false,
              tension: 0
            },
            {
              label: 'Costos Totales',
              data: costosTotales,
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              fill: false,
              tension: 0
            },
            {
              label: 'Costos Fijos',
              data: costosFijos,
              borderColor: '#6b7280',
              borderDash: [5, 5],
              fill: false,
              tension: 0
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: `Punto de Equilibrio - ${periodo || 'Período actual'}`
            },
            annotation: {
              annotations: {
                puntoEquilibrio: {
                  type: 'point',
                  xValue: pe.puntoEquilibrio.unidades.toString(),
                  yValue: pe.puntoEquilibrio.enBs,
                  backgroundColor: '#f59e0b',
                  radius: 8
                }
              }
            }
          },
          scales: {
            x: { title: { display: true, text: 'Unidades Vendidas' } },
            y: { title: { display: true, text: 'Bolivianos (Bs)' } }
          }
        }
      }
    };
  }

  // ══════════════════════════════════════════════════════════
  // UTILIDADES PRIVADAS
  // ══════════════════════════════════════════════════════════

  _obtenerCostosFijos(periodo) {
    // Costos fijos típicos: administrativos, alquileres, sueldos
    if (this.centrosCosto) {
      const administrativos = this.centrosCosto.obtenerTodos({ tipo: 'ADMINISTRATIVO' });
      const totalAdmin = administrativos.reduce((s, c) => s + c.gastosAcumulados, 0);

      // Sumar también ciertos gastos de centros de servicio
      const servicios = this.centrosCosto.obtenerTodos({ tipo: 'SERVICIO' });
      const totalServicios = servicios.reduce((s, c) => s + c.gastosAcumulados, 0);

      if (totalAdmin + totalServicios > 0) {
        return this._r2(totalAdmin + totalServicios);
      }
    }

    // Fallback: estimar desde gastos del período
    const gastos = this._obtenerGastosPeriodo(periodo);
    const fijos = gastos.filter(g =>
      g.categoria === 'ADMINISTRATIVO' ||
      g.categoria === 'ALQUILER' ||
      g.categoria === 'SERVICIOS_BASICOS' ||
      g.tipoCosto === 'FIJO'
    );

    return this._r2(fijos.reduce((s, g) => s + (g.monto || 0), 0));
  }

  _obtenerVentasDelPeriodo(periodo) {
    const documentos = this._obtenerDocumentosVenta();
    const ventas = documentos.filter(d => {
      const fecha = d.fecha || d.fechaEmision || '';
      return !periodo || fecha.startsWith(periodo);
    });

    let ingresos = 0;
    let unidades = 0;
    let costoVariable = 0;

    ventas.forEach(v => {
      ingresos += Number(v.montoTotal || v.total || v.monto || 0);
      
      // Aceptar tanto 'detalle' como 'productos' (ambos son arrays de ítems)
      const items = v.detalle || v.productos || [];
      if (Array.isArray(items)) {
        items.forEach(item => {
          const cant = Number(item.cantidad) || 0;
          unidades += cant;
          costoVariable += cant * (Number(item.costoUnitario) || 0);
        });
      }
    });

    // Si no hay costo unitario, estimar 60% del precio
    if (costoVariable === 0 && ingresos > 0) {
      costoVariable = ingresos * 0.6;
    }

    return {
      ingresosTotales: this._r2(ingresos),
      unidadesVendidas: unidades,
      precioPromedio: unidades > 0 ? this._r2(ingresos / unidades) : 0,
      costoVariablePromedio: unidades > 0 ? this._r2(costoVariable / unidades) : 0
    };
  }
  
  _calcularMargenSeguridad(ventasReales, peBs) {
    const margenBs = this._r2(ventasReales - peBs);
    const margenPct = ventasReales > 0
      ? this._r2((margenBs / ventasReales) * 100)
      : 0;

    return {
      bs: margenBs,
      porcentaje: margenPct,
      interpretacion:
        margenPct >= 30 ? 'Saludable' :
        margenPct >= 15 ? 'Ajustado' :
        margenPct > 0 ? 'Crítico' : 'Pérdidas'
    };
  }

  _interpretarPE(ventasReales, peBs, margenSeguridad) {
    if (ventasReales <= 0) return 'Sin ventas registradas en el período';
    if (peBs <= 0) return 'No se pudo calcular el punto de equilibrio';

    const porcentaje = margenSeguridad.porcentaje;

    if (porcentaje >= 30) {
      return `✅ Excelente: la empresa puede caer ${porcentaje}% en ventas antes de tener pérdidas`;
    }
    if (porcentaje >= 15) {
      return `🟡 Aceptable: margen de seguridad de ${porcentaje}%. Monitorear costos`;
    }
    if (porcentaje > 0) {
      return `🔴 Crítico: solo ${porcentaje}% de margen. Riesgo alto de pérdidas`;
    }
    return '⚫ Pérdidas: ventas por debajo del punto de equilibrio';
  }

  _obtenerGastosPeriodo(periodo) {
    try {
      const gastos = JSON.parse(localStorage.getItem('erp_costos_gastos_asignados') || '[]');
      if (!periodo) return gastos;
      return gastos.filter(g => g.fecha && g.fecha.startsWith(periodo));
    } catch (e) {
      return [];
    }
  }

  _obtenerDocumentosVenta() {
    try {
      const docs = JSON.parse(localStorage.getItem('erp_bolivia_documentos') || '[]');
      return docs.filter(d => {
        const tipo = (d.tipo || d.tipoDocumento || '').toString();
        return tipo === 'FACTURA_VENTA' || tipo.includes('VENTA');
      }).map(d => ({
        id: d.id,
        numero: d.numero,
        fecha: d.fechaEmision || d.fecha,
        fechaEmision: d.fechaEmision || d.fecha,
        periodoContable: d.periodoContable || (d.fechaEmision || '').slice(0, 7),
        monto: d.montoTotal || d.monto || 0,
        montoTotal: d.montoTotal || d.monto || 0,
        montoNeto: d.montoNeto || 0,
        montoIVA: d.montoIVA || 0,
        clienteNombre: d.razonSocialCliente || d.clienteNombre || '',
        clienteNit: d.nitCliente || d.clienteNit || '',
        productos: d.productos || []
      }));
    } catch (e) {
      return [];
    }
  }

  _r2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }
}

window.PuntoEquilibrioClase = PuntoEquilibrio;
