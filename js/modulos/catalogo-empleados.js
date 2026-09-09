// ══════════════════════════════════════════════════════════════
// catalogo-empleados.js — Catálogo de Empleados (RRHH)
// ══════════════════════════════════════════════════════════════

/**
 * Catálogo de Empleados.
 *
 * Responsabilidades:
 * - CRUD de empleados (crear, leer, actualizar, retirar)
 * - Cálculo de antigüedad (años, meses, días)
 * - Validación de datos personales y laborales
 * - Cálculo automático de bono de antigüedad al crear/actualizar
 *
 * Estructura del empleado:
 *   id, ci, nit, nombres, apellidos, fechaNacimiento, genero, estadoCivil
 *   fechaIngreso, fechaRetiro, cargo, departamento, tipoContrato, salarioBase
 *   antiguedadAnios, bonoAntiguedadPorcentaje, bonoAntiguedadMonto
 *   facturasGastosPersonales, saldoRCIVACompensado
 *   aguinaldoAcumulado, indemnizacionAcumulada
 *   estado (ACTIVO/RETIRADO/SUSPENDIDO), motivoRetiro, creadoEn
 */
class CatalogoEmpleados {

  constructor(deps) {
    this.almacenamiento = deps.almacenamiento;
    this.COLLECCION = 'empleados';

    // Estados posibles
    this.ESTADOS = {
      ACTIVO: 'ACTIVO',
      RETIRADO: 'RETIRADO',
      SUSPENDIDO: 'SUSPENDIDO'
    };

    // Motivos de retiro
    this.MOTIVOS_RETIRO = {
      RENUNCIA: 'RENUNCIA',
      DESPIDO: 'DESPIDO',
      DESPIDO_JUSTA_CAUSA: 'DESPIDO_JUSTA_CAUSA',
      JUBILACION: 'JUBILACION',
      MUTUO_ACUERDO: 'MUTUO_ACUERDO',
      FALLECIMIENTO: 'FALLECIMIENTO'
    };

    // Tipos de contrato
    this.TIPOS_CONTRATO = {
      INDEFINIDO: 'INDEFINIDO',
      PLAZO_FIJO: 'PLAZO_FIJO',
      CONSULTORIA: 'CONSULTORIA',
      EVENTUAL: 'EVENTUAL',
      APRENDIZAJE: 'APRENDIZAJE'
    };

    // Géneros
    this.GENEROS = {
      MASCULINO: 'MASCULINO',
      FEMENINO: 'FEMENINO'
    };

    // Asegurar que la colección exista
    if (!this.almacenamiento.obtener(this.COLLECCION)) {
      this.almacenamiento.guardar(this.COLLECCION, []);
    }

    console.log('👥 Catálogo de Empleados inicializado.');
  }

  // ══════════════════════════════════════════════════════════
  // CREAR
  // ══════════════════════════════════════════════════════════

  /**
   * Crea un nuevo empleado.
   * @param {Object} datos
   * @returns {Object} { exito, empleado, errores }
   */
  crear(datos) {
    const validacion = this.validarEmpleado(datos);
    if (!validacion.valido) {
      return { exito: false, empleado: null, errores: validacion.errores };
    }

    // Normalizar datos
    const hoy = new Date().toISOString().split('T')[0];
    const antiguedad = this.calcularAntiguedad({
      fechaIngreso: datos.fechaIngreso,
      fechaRetiro: null
    });

    const bono = window.TablaBonoAntiguedad
      ? window.TablaBonoAntiguedad.calcularBono(antiguedad.anios)
      : { porcentaje: 0, monto: 0, base: 0 };

    const empleado = {
      id: this._generarId(),
      ci: (datos.ci || '').trim(),
      nit: (datos.nit || '').trim() || null,
      nombres: (datos.nombres || '').trim(),
      apellidos: (datos.apellidos || '').trim(),
      fechaNacimiento: datos.fechaNacimiento || null,
      genero: datos.genero || this.GENEROS.MASCULINO,
      estadoCivil: datos.estadoCivil || 'SOLTERO',

      fechaIngreso: datos.fechaIngreso,
      fechaRetiro: null,
      cargo: (datos.cargo || '').trim(),
      departamento: (datos.departamento || '').trim(),
      tipoContrato: datos.tipoContrato || this.TIPOS_CONTRATO.INDEFINIDO,
      salarioBase: Number(datos.salarioBase) || 0,

      antiguedadAnios: antiguedad.anios,
      bonoAntiguedadPorcentaje: bono.porcentaje,
      bonoAntiguedadMonto: bono.monto,

      facturasGastosPersonales: [],
      saldoRCIVACompensado: 0,
      aguinaldoAcumulado: 0,
      indemnizacionAcumulada: 0,

      estado: this.ESTADOS.ACTIVO,
      motivoRetiro: null,
      creadoEn: new Date().toISOString()
    };

    this.almacenamiento.guardar(this.COLLECCION, empleado);
    console.log(`👥 Empleado creado: ${empleado.nombres} ${empleado.apellidos} (${empleado.ci})`);

    return { exito: true, empleado, errores: [] };
  }

  // ══════════════════════════════════════════════════════════
  // LECTURA
  // ══════════════════════════════════════════════════════════

  /**
   * Obtiene todos los empleados con filtros opcionales.
   * @param {Object} [filtros] - { estado, departamento, buscar }
   * @returns {Array}
   */
  obtenerTodos(filtros = {}) {
    let empleados = this.almacenamiento.obtener(this.COLLECCION) || [];

    // Refrescar antigüedad en memoria (sin persistir)
    empleados = empleados.map(e => {
      const ant = this.calcularAntiguedad(e);
      const bono = window.TablaBonoAntiguedad
        ? window.TablaBonoAntiguedad.calcularBono(ant.anios)
        : { porcentaje: 0, monto: 0 };
      return {
        ...e,
        antiguedadAnios: ant.anios,
        antiguedadDetalle: ant,
        bonoAntiguedadPorcentaje: bono.porcentaje,
        bonoAntiguedadMonto: bono.monto
      };
    });

    if (filtros.estado) {
      empleados = empleados.filter(e => e.estado === filtros.estado);
    }
    if (filtros.departamento) {
      empleados = empleados.filter(e => e.departamento === filtros.departamento);
    }
    if (filtros.buscar) {
      const q = filtros.buscar.toLowerCase();
      empleados = empleados.filter(e =>
        `${e.nombres} ${e.apellidos} ${e.ci} ${e.cargo}`
          .toLowerCase().includes(q)
      );
    }

    return empleados.sort((a, b) =>
      (a.apellidos + a.nombres).localeCompare(b.apellidos + b.nombres)
    );
  }

  /**
   * Obtiene empleados activos (acceso rápido).
   * @returns {Array}
   */
  obtenerActivos() {
    return this.obtenerTodos({ estado: this.ESTADOS.ACTIVO });
  }

  /**
   * Obtiene un empleado por ID.
   * @param {string} id
   * @returns {Object|null}
   */
  obtenerPorId(id) {
    const todos = this.obtenerTodos();
    return todos.find(e => e.id === id) || null;
  }

  /**
   * Busca un empleado por Cédula de Identidad.
   * @param {string} ci
   * @returns {Object|null}
   */
  obtenerPorCI(ci) {
    if (!ci) return null;
    const todos = this.almacenamiento.obtener(this.COLLECCION) || [];
    return todos.find(e => e.ci === ci.trim()) || null;
  }

  /**
   * Cuenta empleados por estado.
   * @returns {Object} { activos, retirados, suspendidos, total }
   */
  contar() {
    const todos = this.almacenamiento.obtener(this.COLLECCION) || [];
    return {
      activos: todos.filter(e => e.estado === this.ESTADOS.ACTIVO).length,
      retirados: todos.filter(e => e.estado === this.ESTADOS.RETIRADO).length,
      suspendidos: todos.filter(e => e.estado === this.ESTADOS.SUSPENDIDO).length,
      total: todos.length
    };
  }

  // ══════════════════════════════════════════════════════════
  // ACTUALIZAR
  // ══════════════════════════════════════════════════════════

  /**
   * Actualiza un empleado existente.
   * @param {string} id
   * @param {Object} datos
   * @returns {Object}
   */
  actualizar(id, datos) {
    const existente = this.almacenamiento.obtener(this.COLLECCION) || [];
    const empleado = existente.find(e => e.id === id);

    if (!empleado) {
      return { exito: false, empleado: null, errores: ['Empleado no encontrado'] };
    }

    // Mezclar datos manteniendo ID y campos de control
    const actualizado = { ...empleado, ...datos, id: empleado.id };

    const validacion = this.validarEmpleado(actualizado, id);
    if (!validacion.valido) {
      return { exito: false, empleado: null, errores: validacion.errores };
    }

    // Recalcular antigüedad y bono si cambió fechaIngreso
    const ant = this.calcularAntiguedad(actualizado);
    const bono = window.TablaBonoAntiguedad
      ? window.TablaBonoAntiguedad.calcularBono(ant.anios)
      : { porcentaje: 0, monto: 0 };
    actualizado.antiguedadAnios = ant.anios;
    actualizado.bonoAntiguedadPorcentaje = bono.porcentaje;
    actualizado.bonoAntiguedadMonto = bono.monto;

    this.almacenamiento.actualizar(this.COLLECCION, id, actualizado);
    console.log(`✏️ Empleado actualizado: ${actualizado.nombres} ${actualizado.apellidos}`);

    return { exito: true, empleado: actualizado, errores: [] };
  }

  /**
   * Marca un empleado como RETIRADO.
   * @param {string} id
   * @param {string} motivo - Uno de MOTIVOS_RETIRO
   * @param {string} [fechaRetiro] - Formato YYYY-MM-DD (por defecto hoy)
   * @returns {Object}
   */
  retirar(id, motivo, fechaRetiro) {
    const empleado = this.obtenerPorId(id);
    if (!empleado) {
      return { exito: false, empleado: null, errores: ['Empleado no encontrado'] };
    }
    if (empleado.estado === this.ESTADOS.RETIRADO) {
      return { exito: false, empleado: null, errores: ['El empleado ya está retirado'] };
    }
    if (!Object.values(this.MOTIVOS_RETIRO).includes(motivo)) {
      return { exito: false, empleado: null, errores: [`Motivo de retiro inválido: ${motivo}`] };
    }

    const fecha = fechaRetiro || new Date().toISOString().split('T')[0];
    if (fecha < empleado.fechaIngreso) {
      return { exito: false, empleado: null, errores: ['Fecha de retiro no puede ser anterior a fecha de ingreso'] };
    }

    const resultado = this.actualizar(id, {
      estado: this.ESTADOS.RETIRADO,
      fechaRetiro: fecha,
      motivoRetiro: motivo
    });

    if (resultado.exito) {
      console.log(`🚪 Empleado retirado: ${resultado.empleado.nombres} ${resultado.empleado.apellidos} — Motivo: ${motivo}`);
    }
    return resultado;
  }

  // ══════════════════════════════════════════════════════════
  // CÁLCULO DE ANTIGÜEDAD
  // ══════════════════════════════════════════════════════════

  /**
   * Calcula la antigüedad de un empleado desde fechaIngreso hasta hoy (o fechaRetiro).
   * @param {Object} empleado - Debe tener fechaIngreso (y opcional fechaRetiro)
   * @returns {Object} { anios, meses, dias, aniosDecimal, diasTotales }
   */
  calcularAntiguedad(empleado) {
    if (!empleado || !empleado.fechaIngreso) {
      return { anios: 0, meses: 0, dias: 0, aniosDecimal: 0, diasTotales: 0 };
    }

    const ingreso = new Date(empleado.fechaIngreso);
    const fin = empleado.fechaRetiro
      ? new Date(empleado.fechaRetiro)
      : new Date();

    if (isNaN(ingreso.getTime()) || isNaN(fin.getTime()) || fin < ingreso) {
      return { anios: 0, meses: 0, dias: 0, aniosDecimal: 0, diasTotales: 0 };
    }

    let anios = fin.getFullYear() - ingreso.getFullYear();
    let meses = fin.getMonth() - ingreso.getMonth();
    let dias = fin.getDate() - ingreso.getDate();

    if (dias < 0) {
      meses--;
      const mesAnterior = new Date(fin.getFullYear(), fin.getMonth(), 0);
      dias += mesAnterior.getDate();
    }
    if (meses < 0) {
      anios--;
      meses += 12;
    }

    const diasTotales = Math.floor((fin - ingreso) / (1000 * 60 * 60 * 24));
    const aniosDecimal = window.BOLIVIA
      ? window.BOLIVIA.redondear2(diasTotales / 365.25)
      : Math.round((diasTotales / 365.25) * 100) / 100;

    return { anios, meses, dias, aniosDecimal, diasTotales };
  }

  // ══════════════════════════════════════════════════════════
  // VALIDACIÓN
  // ══════════════════════════════════════════════════════════

  /**
   * Valida los datos de un empleado.
   * @param {Object} datos
   * @param {string} [idExcluir] - ID a excluir de la verificación de CI única
   * @returns {Object} { valido, errores }
   */
  validarEmpleado(datos, idExcluir) {
    const errores = [];

    // CI obligatorio y no vacío
    if (!datos.ci || !datos.ci.trim()) {
      errores.push('La Cédula de Identidad (CI) es obligatoria');
    } else {
      // CI única (excepto al actualizar el mismo empleado)
      const existente = this.obtenerPorCI(datos.ci);
      if (existente && existente.id !== idExcluir) {
        errores.push(`Ya existe un empleado con la CI ${datos.ci}`);
      }
    }

    if (!datos.nombres || !datos.nombres.trim()) {
      errores.push('Los nombres son obligatorios');
    }
    if (!datos.apellidos || !datos.apellidos.trim()) {
      errores.push('Los apellidos son obligatorios');
    }

    // Salario base > 0
    const salario = Number(datos.salarioBase);
    if (isNaN(salario) || salario <= 0) {
      errores.push('El salario base debe ser mayor a 0');
    } else if (window.BOLIVIA && salario < window.BOLIVIA.SMN_VIGENTE) {
      errores.push(`El salario base (${salario}) no puede ser menor al SMN vigente (${window.BOLIVIA.SMN_VIGENTE})`);
    }

    // Fecha de ingreso
    if (!datos.fechaIngreso) {
      errores.push('La fecha de ingreso es obligatoria');
    } else {
      const ingreso = new Date(datos.fechaIngreso);
      const hoy = new Date();
      hoy.setHours(23, 59, 59, 999);
      if (isNaN(ingreso.getTime())) {
        errores.push('La fecha de ingreso no es válida');
      } else if (ingreso > hoy) {
        errores.push('La fecha de ingreso no puede ser futura');
      }
    }

    // Fecha de retiro posterior al ingreso
    if (datos.fechaRetiro && datos.fechaIngreso) {
      if (new Date(datos.fechaRetiro) < new Date(datos.fechaIngreso)) {
        errores.push('La fecha de retiro debe ser posterior a la fecha de ingreso');
      }
    }

    return { valido: errores.length === 0, errores };
  }

  // ══════════════════════════════════════════════════════════
  // MÉTODOS PRIVADOS
  // ══════════════════════════════════════════════════════════

  _generarId() {
    return 'emp-' + Date.now().toString(36) + '-' +
           Math.random().toString(36).substr(2, 9);
  }
}

// Exponer globalmente
window.CatalogoEmpleados = CatalogoEmpleados;
