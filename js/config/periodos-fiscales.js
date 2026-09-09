// ══════════════════════════════════════════════════════════════
// periodos-fiscales.js — Períodos fiscales y obligaciones tributarias
// ══════════════════════════════════════════════════════════════

/**
 * Módulo de Períodos Fiscales Bolivianos.
 *
 * Gestiona los períodos fiscales mensuales y anuales de la empresa,
 * incluyendo el cálculo de vencimientos según el último dígito del NIT
 * (dígito verificador, después del guión).
 *
 * Vencimientos mensuales (IVA, IT, RC-IVA):
 *   - Dígito 1 → día 10 del mes siguiente
 *   - Dígito 2 → día 11 del mes siguiente
 *   - ...
 *   - Dígito 9 → día 18 del mes siguiente
 *   - Dígito 0 → día 19 del mes siguiente
 *
 * Plazos especiales:
 *   - IUE: 120 días tras cierre de gestión (generalmente 30 abril)
 *   - Form. 605 (EEFF): mismo plazo que IUE
 *   - Aguinaldo: antes del 20 de diciembre
 *
 * Estados del período:
 *   - ABIERTO: aún no se han calculado los impuestos
 *   - CERRADO: impuestos calculados, pendiente declarar
 *   - DECLARADO: formularios presentados al SIN
 *   - PAGADO: impuestos pagados al SIN
 */
class PeriodosFiscales {

  constructor(deps) {
    this.almacenamiento = deps.almacenamiento;
    this.COLLECCION = 'periodos_fiscales';

    // NIT de la empresa (para calcular vencimientos)
    // Se puede configurar vía window.BOLIVIA.NIT_EMPRESA
    this.NIT_EMPRESA_DEFAULT = '000000000-0';

    // Estados posibles
    this.ESTADOS = {
      ABIERTO: 'ABIERTO',
      CERRADO: 'CERRADO',
      DECLARADO: 'DECLARADO',
      PAGADO: 'PAGADO'
    };

    // Tipos de período
    this.TIPOS = {
      MENSUAL: 'MENSUAL',
      ANUAL: 'ANUAL'
    };

    // Asegurar colección existente
    if (!this.almacenamiento.obtener(this.COLLECCION)) {
      this.almacenamiento.guardar(this.COLLECCION, []);
    }

    console.log('📅 Períodos Fiscales inicializado.');
  }

  // ══════════════════════════════════════════════════════════
  // CRUD DE PERÍODOS FISCALES
  // ══════════════════════════════════════════════════════════

  /**
   * Crea un nuevo período fiscal.
   *
   * @param {string} periodo - Formato "AAAA-MM" (mensual) o "AAAA" (anual)
   * @param {string} [tipo] - "MENSUAL" o "ANUAL" (por defecto MENSUAL)
   * @param {string} [nit] - NIT de la empresa (para calcular vencimiento)
   * @returns {Object} { exito, periodo, errores }
   */
  crearPeriodo(periodo, tipo = this.TIPOS.MENSUAL, nit = null) {
    const validacion = this._validarFormatoPeriodo(periodo, tipo);
    if (!validacion.valido) {
      return { exito: false, periodo: null, errores: validacion.errores };
    }

    // Verificar si ya existe
    const existente = this.obtenerPeriodo(periodo);
    if (existente) {
      return { exito: false, periodo: existente, errores: [`El período ${periodo} ya existe`] };
    }

    const nitEmpresa = nit || this._obtenerNITEmpresa();
    const fechaVencimiento = this.calcularFechaVencimiento(nitEmpresa, periodo);

    const nuevoPeriodo = {
      id: `periodo-${periodo}`,
      periodo,
      tipo,
      estado: this.ESTADOS.ABIERTO,

      // IVA (Form. 200)
      iva: {
        debitoFiscal: 0,
        creditoFiscal: 0,
        ivaPorPagar: 0,
        saldoFavorContribuyente: 0,
        saldoFavorAnterior: 0,
        formulario200: null,
        declarado: false,
        pagado: false
      },

      // IT (Form. 400)
      it: {
        ingresosBrutos: 0,
        itPorPagar: 0,
        itPagadoAcumulado: 0,
        formulario400: null,
        declarado: false,
        pagado: false
      },

      // RC-IVA (Form. 200 - agente de retención)
      rcIVA: {
        retencionesEmpleados: 0,
        retencionesProveedores: 0,
        totalRetenido: 0,
        declarado: false,
        pagado: false
      },

      // IUE (solo períodos anuales)
      iue: tipo === this.TIPOS.ANUAL ? {
        utilidadContable: 0,
        ajustesFiscales: 0,
        utilidadImponible: 0,
        iueDeterminado: 0,
        itCompensado: 0,
        iuePorPagar: 0,
        formulario500: null,
        declarado: false,
        pagado: false
      } : null,

      // Fechas
      fechaVencimiento,
      fechaDeclaracion: null,
      fechaPago: null,

      // Metadatos
      nitEmpresa,
      creadoEn: new Date().toISOString()
    };

    this.almacenamiento.guardar(this.COLLECCION, nuevoPeriodo);
    console.log(`📅 Período fiscal creado: ${periodo} — vence ${fechaVencimiento}`);

    return { exito: true, periodo: nuevoPeriodo, errores: [] };
  }

  /**
   * Obtiene un período fiscal específico.
   *
   * @param {string} periodo - Formato "AAAA-MM" o "AAAA"
   * @returns {Object|null}
   */
  obtenerPeriodo(periodo) {
    const todos = this.almacenamiento.obtener(this.COLLECCION) || [];
    return todos.find(p => p.periodo === periodo) || null;
  }

  /**
   * Obtiene todos los períodos fiscales.
   * @returns {Array}
   */
  obtenerTodos() {
    const todos = this.almacenamiento.obtener(this.COLLECCION) || [];
    return todos.sort((a, b) => a.periodo.localeCompare(b.periodo));
  }

  /**
   * Obtiene todos los períodos ABIERTOS (pendientes).
   * @returns {Array}
   */
  obtenerPeriodosAbiertos() {
    return this.obtenerTodos().filter(p =>
      p.estado === this.ESTADOS.ABIERTO ||
      p.estado === this.ESTADOS.CERRADO
    );
  }

  /**
   * Actualiza un período fiscal.
   *
   * @param {string} periodo
   * @param {Object} datos - Datos a actualizar
   * @returns {Object}
   */
  actualizarPeriodo(periodo, datos) {
    const existente = this.obtenerPeriodo(periodo);
    if (!existente) {
      return { exito: false, periodo: null, errores: ['Período no encontrado'] };
    }

    // Merge profundo para subobjetos (iva, it, rcIVA, iue)
    const actualizado = { ...existente };
    if (datos.iva) actualizado.iva = { ...existente.iva, ...datos.iva };
    if (datos.it) actualizado.it = { ...existente.it, ...datos.it };
    if (datos.rcIVA) actualizado.rcIVA = { ...existente.rcIVA, ...datos.rcIVA };
    if (datos.iue && actualizado.iue) actualizado.iue = { ...existente.iue, ...datos.iue };

    // Actualizar campos de nivel superior
    Object.keys(datos).forEach(key => {
      if (!['iva', 'it', 'rcIVA', 'iue'].includes(key)) {
        actualizado[key] = datos[key];
      }
    });

    this.almacenamiento.actualizar(this.COLLECCION, actualizado.id, actualizado);
    console.log(`✏️ Período actualizado: ${periodo}`);

    return { exito: true, periodo: actualizado, errores: [] };
  }

  /**
   * Marca un período como CERRADO (impuestos calculados).
   * @param {string} periodo
   */
  cerrarPeriodo(periodo) {
    const existente = this.obtenerPeriodo(periodo);
    if (!existente) {
      return { exito: false, errores: ['Período no encontrado'] };
    }
    if (existente.estado !== this.ESTADOS.ABIERTO) {
      return { exito: false, errores: [`Solo se pueden cerrar períodos ABIERTOS (actual: ${existente.estado})`] };
    }

    return this.actualizarPeriodo(periodo, { estado: this.ESTADOS.CERRADO });
  }

  /**
   * Marca un período como DECLARADO (formulario presentado al SIN).
   * @param {string} periodo
   */
  declararPeriodo(periodo) {
    const existente = this.obtenerPeriodo(periodo);
    if (!existente) {
      return { exito: false, errores: ['Período no encontrado'] };
    }

    return this.actualizarPeriodo(periodo, {
      estado: this.ESTADOS.DECLARADO,
      fechaDeclaracion: new Date().toISOString()
    });
  }

  /**
   * Marca un período como PAGADO.
   * @param {string} periodo
   */
  pagarPeriodo(periodo) {
    const existente = this.obtenerPeriodo(periodo);
    if (!existente) {
      return { exito: false, errores: ['Período no encontrado'] };
    }

    return this.actualizarPeriodo(periodo, {
      estado: this.ESTADOS.PAGADO,
      fechaPago: new Date().toISOString()
    });
  }

  // ══════════════════════════════════════════════════════════
  // CÁLCULO DE FECHA DE VENCIMIENTO
  // ══════════════════════════════════════════════════════════

  /**
   * Extrae el último dígito del NIT (dígito verificador, después del guión).
   *
   * Formato NIT boliviano: XXXXXXXXX-Y (Y es el dígito verificador).
   * El calendario tributario usa este dígito para escalonar vencimientos.
   *
   * @param {string} nit - Formato "XXXXXXXXX-Y"
   * @returns {number} Dígito 0-9
   */
  obtenerUltimoDigitoNIT(nit) {
    if (!nit || typeof nit !== 'string') return 0;

    // Buscar el dígito después del guión
    if (nit.includes('-')) {
      const despuesGuion = nit.split('-')[1];
      const digito = parseInt(despuesGuion, 10);
      return isNaN(digito) ? 0 : digito;
    }

    // Si no hay guión, usar el último dígito del string
    const ultimo = nit.slice(-1);
    const digito = parseInt(ultimo, 10);
    return isNaN(digito) ? 0 : digito;
  }

  /**
   * Calcula la fecha de vencimiento tributario de un período.
   *
   * Regla del SIN boliviano:
   *   - Dígito 1 → día 10 del mes siguiente
   *   - Dígito 2 → día 11 del mes siguiente
   *   - ...
   *   - Dígito 9 → día 18 del mes siguiente
   *   - Dígito 0 → día 19 del mes siguiente
   *
   * Si el día cae en fin de semana, se extiende al lunes siguiente.
   *
   * @param {string} nit - NIT de la empresa
   * @param {string} periodo - Formato "AAAA-MM"
   * @returns {string} Fecha "AAAA-MM-DD"
   */
  calcularFechaVencimiento(nit, periodo) {
    const validacion = this._validarFormatoPeriodo(periodo, this.TIPOS.MENSUAL);
    if (!validacion.valido) return null;

    const ultimoDigito = this.obtenerUltimoDigitoNIT(nit);
    const [anio, mes] = periodo.split('-').map(Number);

    // Calcular día de vencimiento
    let dia;
    if (ultimoDigito === 0) {
      dia = 19;
    } else {
      dia = 9 + ultimoDigito;  // dígito 1 → día 10, dígito 2 → día 11, etc.
    }

    // Mes siguiente
    let mesVenc = mes + 1;
    let anioVenc = anio;
    if (mesVenc > 12) {
      mesVenc = 1;
      anioVenc += 1;
    }

    // Crear fecha y ajustar si cae en fin de semana
    let fecha = new Date(anioVenc, mesVenc - 1, dia);
    const diaSemana = fecha.getDay();  // 0 = domingo, 6 = sábado

    if (diaSemana === 6) {  // sábado → lunes (+2 días)
      fecha.setDate(fecha.getDate() + 2);
    } else if (diaSemana === 0) {  // domingo → lunes (+1 día)
      fecha.setDate(fecha.getDate() + 1);
    }

    // Formato YYYY-MM-DD
    return fecha.toISOString().split('T')[0];
  }

  /**
   * Calcula la fecha límite del IUE (120 días tras cierre de gestión).
   *
   * @param {number} anio - Año de la gestión (ej: 2026)
   * @returns {string} Fecha "AAAA-MM-DD"
   */
  calcularFechaLimiteIUE(anio) {
    // Cierre: 31 de diciembre del año
    const cierre = new Date(anio, 11, 31);
    // +120 días
    const limite = new Date(cierre);
    limite.setDate(limite.getDate() + 120);
    return limite.toISOString().split('T')[0];
  }

  // ══════════════════════════════════════════════════════════
  // OBLIGACIONES PENDIENTES Y ALERTAS
  // ══════════════════════════════════════════════════════════

  /**
   * Obtiene todas las obligaciones tributarias pendientes.
   *
   * Devuelve una lista ordenada por fecha de vencimiento ascendente,
   * con información de cada impuesto pendiente en cada período.
   *
   * @returns {Array} Lista de obligaciones pendientes
   */
  obtenerObligacionesPendientes() {
    const todos = this.obtenerTodos();
    const obligaciones = [];
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    todos.forEach(p => {
      if (p.estado === this.ESTADOS.DECLARADO || p.estado === this.ESTADOS.PAGADO) return;

      const vencimiento = new Date(p.fechaVencimiento);
      const diasRestantes = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));

      // IVA pendiente
      if (!p.iva.declarado && (p.iva.ivaPorPagar > 0 || p.iva.debitoFiscal > 0)) {
        obligaciones.push({
          periodo: p.periodo,
          impuesto: 'IVA',
          formulario: 'Form. 200',
          monto: p.iva.ivaPorPagar,
          fechaVencimiento: p.fechaVencimiento,
          diasRestantes,
          estado: diasRestantes < 0 ? 'VENCIDO' : 'PENDIENTE'
        });
      }

      // IT pendiente
      if (!p.it.declarado && p.it.itPorPagar > 0) {
        obligaciones.push({
          periodo: p.periodo,
          impuesto: 'IT',
          formulario: 'Form. 400',
          monto: p.it.itPorPagar,
          fechaVencimiento: p.fechaVencimiento,
          diasRestantes,
          estado: diasRestantes < 0 ? 'VENCIDO' : 'PENDIENTE'
        });
      }

      // RC-IVA pendiente
      if (!p.rcIVA.declarado && p.rcIVA.totalRetenido > 0) {
        obligaciones.push({
          periodo: p.periodo,
          impuesto: 'RC-IVA (retenciones)',
          formulario: 'Form. 200',
          monto: p.rcIVA.totalRetenido,
          fechaVencimiento: p.fechaVencimiento,
          diasRestantes,
          estado: diasRestantes < 0 ? 'VENCIDO' : 'PENDIENTE'
        });
      }
    });

    // Ordenar por fecha de vencimiento ascendente
    return obligaciones.sort((a, b) => a.fechaVencimiento.localeCompare(b.fechaVencimiento));
  }

  /**
   * Genera alertas para vencimientos próximos.
   *
   * @param {number} [diasAntes=7] - Días antes del vencimiento para generar alerta
   * @returns {Array} Lista de alertas con semáforo (verde/amarillo/rojo)
   */
  generarAlertasVencimiento(diasAntes = 7) {
    const obligaciones = this.obtenerObligacionesPendientes();
    const alertas = [];

    obligaciones.forEach(ob => {
      if (ob.diasRestantes > diasAntes) return;

      let nivel, color, mensaje;
      if (ob.diasRestantes < 0) {
        nivel = 'CRITICO';
        color = 'rojo';
        mensaje = `⚠️ ${ob.impuesto} de ${ob.periodo} VENCIDO hace ${Math.abs(ob.diasRestantes)} días`;
      } else if (ob.diasRestantes <= 3) {
        nivel = 'ALTO';
        color = 'rojo';
        mensaje = `🚨 ${ob.impuesto} de ${ob.periodo} vence en ${ob.diasRestantes} día${ob.diasRestantes !== 1 ? 's' : ''}`;
      } else if (ob.diasRestantes <= 7) {
        nivel = 'MEDIO';
        color = 'amarillo';
        mensaje = `⚡ ${ob.impuesto} de ${ob.periodo} vence en ${ob.diasRestantes} días`;
      } else {
        nivel = 'BAJO';
        color = 'verde';
        mensaje = `📅 ${ob.impuesto} de ${ob.periodo} vence en ${ob.diasRestantes} días`;
      }

      alertas.push({
        nivel,
        color,
        mensaje,
        periodo: ob.periodo,
        impuesto: ob.impuesto,
        formulario: ob.formulario,
        monto: ob.monto,
        fechaVencimiento: ob.fechaVencimiento,
        diasRestantes: ob.diasRestantes
      });
    });

    // Ordenar: primero los críticos, luego por días restantes
    return alertas.sort((a, b) => {
      if (a.nivel === 'CRITICO' && b.nivel !== 'CRITICO') return -1;
      if (b.nivel === 'CRITICO' && a.nivel !== 'CRITICO') return 1;
      return a.diasRestantes - b.diasRestantes;
    });
  }

  /**
   * Genera períodos fiscales mensuales automáticamente para un año.
   *
   * @param {number} anio
   * @param {string} [nit]
   * @returns {Object}
   */
  generarPeriodosAnio(anio, nit = null) {
    const creados = [];
    for (let mes = 1; mes <= 12; mes++) {
      const periodo = `${anio}-${String(mes).padStart(2, '0')}`;
      const resultado = this.crearPeriodo(periodo, this.TIPOS.MENSUAL, nit);
      if (resultado.exito) creados.push(periodo);
    }
    return { exito: true, anio, creados };
  }

  // ══════════════════════════════════════════════════════════
  // UTILIDADES PRIVADAS
  // ══════════════════════════════════════════════════════════

  _obtenerNITEmpresa() {
    if (window.BOLIVIA && window.BOLIVIA.NIT_EMPRESA) {
      return window.BOLIVIA.NIT_EMPRESA;
    }
    return this.NIT_EMPRESA_DEFAULT;
  }

  _validarFormatoPeriodo(periodo, tipo = this.TIPOS.MENSUAL) {
    const errores = [];
    if (!periodo || typeof periodo !== 'string') {
      errores.push('Período inválido');
      return { valido: false, errores };
    }

    if (tipo === this.TIPOS.MENSUAL) {
      if (!/^\d{4}-\d{2}$/.test(periodo)) {
        errores.push(`Formato mensual inválido: ${periodo} (esperado AAAA-MM)`);
      } else {
        const [anio, mes] = periodo.split('-').map(Number);
        if (mes < 1 || mes > 12) {
          errores.push(`Mes inválido: ${mes}`);
        }
        if (anio < 2000 || anio > 2100) {
          errores.push(`Año fuera de rango: ${anio}`);
        }
      }
    } else if (tipo === this.TIPOS.ANUAL) {
      if (!/^\d{4}$/.test(periodo)) {
        errores.push(`Formato anual inválido: ${periodo} (esperado AAAA)`);
      }
    }

    return { valido: errores.length === 0, errores };
  }

  _r2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }
}

window.PeriodosFiscales = PeriodosFiscales;
