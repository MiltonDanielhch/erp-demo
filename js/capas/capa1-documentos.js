// ══════════════════════════════════════════════════════════════
// capa1-documentos.js — ERP Contable Bolivia
// Capa 1: Documentos Fuente (Registro y Validación)
// ══════════════════════════════════════════════════════════════

/**
 * Capa 1: Documentos Fuente
 *
 * Responsabilidades:
 * - Recibir documentos fuente de los usuarios
 * - Validar que cumplan con los requisitos legales bolivianos
 * - Persistir documentos válidos en localStorage
 * - Gestionar estados del documento (PENDIENTE → VALIDADO → PROCESADO)
 * - Proporcionar consultas y filtros
 *
 * Esta capa es el "portero" del ERP. Si un documento no pasa
 * por aquí validado, no puede generar asientos contables.
 *
 * @class CapaDocumentos
 */
class CapaDocumentos {

  constructor(almacenamiento) {
    if (!almacenamiento) {
      throw new Error('CapaDocumentos requiere una instancia de AlmacenamientoLocal');
    }

    this.almacenamiento = almacenamiento;
    this.nombreColeccion = 'documentos';

    console.log('📄 Capa 1 (Documentos Fuente) inicializada.');
  }

  // ════════════════════════════════════════════════════════════
  // REGISTRO DE DOCUMENTOS
  // ════════════════════════════════════════════════════════════

  registrarDocumento(datos) {
    console.log('📄 Registrando documento:', datos.tipo, datos.numero);

    try {
      if (!TiposDocumentoUtilidades.tipoExiste(datos.tipo)) {
        return {
          exito: false,
          mensaje: `Tipo de documento inválido: ${datos.tipo}`,
          documento: null,
          errores: ['Tipo de documento no reconocido']
        };
      }

      const validacionCampos = CamposDocumentoUtilidades.validarCamposRequeridos(datos.tipo, datos);
      if (!validacionCampos.valido) {
        return {
          exito: false,
          mensaje: 'Faltan campos requeridos',
          documento: null,
          errores: validacionCampos.errores
        };
      }

      const validacionNegocio = this.validarDocumento(datos);
      if (!validacionNegocio.valido) {
        return {
          exito: false,
          mensaje: 'Documento no cumple reglas de negocio',
          documento: null,
          errores: validacionNegocio.errores
        };
      }

      const documento = this._prepararDocumento(datos);
      const documentoGuardado = this.almacenamiento.guardar(this.nombreColeccion, documento);

      if (!documentoGuardado) {
        return {
          exito: false,
          mensaje: 'Error al guardar el documento',
          documento: null,
          errores: ['No se pudo persistir el documento']
        };
      }

      this._dispararEvento('documento-registrado', documentoGuardado);
      console.log('✅ Documento registrado:', documentoGuardado.id);

      return {
        exito: true,
        mensaje: 'Documento registrado exitosamente',
        documento: documentoGuardado,
        errores: []
      };

    } catch (error) {
      console.error('❌ Error al registrar documento:', error);
      return {
        exito: false,
        mensaje: `Error inesperado: ${error.message}`,
        documento: null,
        errores: [error.message]
      };
    }
  }

  _prepararDocumento(datos) {
    const documento = { ...datos };

    if (!documento.id) {
      documento.id = this._generarId();
    }

    documento.estado = ESTADOS_DOCUMENTO.PENDIENTE.codigo;

    if (documento.fechaEmision) {
      documento.periodoContable = Utilidades.obtenerPeriodoContable(documento.fechaEmision);
    }

    documento.fechaRegistro = new Date().toISOString();
    documento.creadoEn = new Date().toISOString();
    documento.creadoPor = 'sistema';

    this._calcularCamposAutomaticos(documento);

    documento.historial = [
      {
        fecha: new Date().toISOString(),
        estadoAnterior: null,
        estadoNuevo: ESTADOS_DOCUMENTO.PENDIENTE.codigo,
        usuario: 'sistema',
        motivo: 'Registro inicial'
      }
    ];

    return documento;
  }

  _calcularCamposAutomaticos(documento) {
    const tipo = documento.tipo;

    if (tipo === 'FACTURA_COMPRA' || tipo === 'FACTURA_VENTA' ||
        tipo === 'NOTA_CREDITO_RECIBIDA' || tipo === 'NOTA_DEBITO_RECIBIDA' ||
        tipo === 'NOTA_CREDITO_EMITIDA' || tipo === 'NOTA_DEBITO_EMITIDA' ||
        tipo === 'FACTURA_GASTOS_PERSONALES') {

      if (documento.montoTotal && !documento.montoNeto) {
        documento.montoNeto = Utilidades.extraerNetoDeTotal(documento.montoTotal);
      }
      if (documento.montoTotal && !documento.montoIVA) {
        documento.montoIVA = Utilidades.calcularIVADeTotal(documento.montoTotal);
      }
    }

    if (tipo === 'FACTURA_VENTA' || tipo === 'NOTA_CREDITO_EMITIDA' || tipo === 'NOTA_DEBITO_EMITIDA') {
      if (documento.montoTotal && !documento.montoIT) {
        documento.montoIT = Utilidades.calcularIT(documento.montoTotal);
      }
    }

    if (tipo === 'COMPROBANTE_RETENCION') {
      if (documento.baseImponible && documento.porcentajeRetencion && !documento.montoRetenido) {
        documento.montoRetenido = Utilidades.redondear(
          documento.baseImponible * (documento.porcentajeRetencion / 100)
        );
      }
    }

    if (tipo === 'ACTA_COMPRA_ACTIVO') {
      if (documento.montoTotal && documento.vidaUtilMeses && !documento.depreciacionMensual) {
        const valorResidual = documento.valorResidual || 0;
        documento.depreciacionMensual = Utilidades.redondear(
          (documento.montoTotal - valorResidual) / documento.vidaUtilMeses
        );
      }
    }
  }

  // ════════════════════════════════════════════════════════════
  // VALIDACIONES
  // ════════════════════════════════════════════════════════════

  validarDocumento(datos) {
    const errores = [];
    const tipo = datos.tipo;
    const configTipo = TiposDocumentoUtilidades.obtenerTipo(tipo);

    if (configTipo.requiereNIT) {
      const nit = datos.nitProveedor || datos.nitCliente || datos.nitRecibidoDe || datos.nitPagadoA;
      if (nit) {
        const validacionNIT = Validadores.validarNIT(nit);
        if (!validacionNIT.valido) {
          errores.push(...validacionNIT.errores);
        }
      }
    }

    if (configTipo.requiereCUF && datos.cuf) {
      const validacionCUF = Validadores.validarCUF(datos.cuf);
      if (!validacionCUF.valido) {
        errores.push(...validacionCUF.errores);
      }

      if (validacionCUF.valido) {
        const duplicado = this._buscarPorCUF(datos.cuf);
        if (duplicado) {
          errores.push(`CUF duplicado: ya existe un documento con CUF ${datos.cuf} (ID: ${duplicado.id})`);
        }
      }
    }

    if (datos.fechaEmision) {
      const validacionPeriodo = this.validarPeriodoContable(datos.fechaEmision);
      if (!validacionPeriodo.valido) {
        errores.push(...validacionPeriodo.errores);
      }
    }

    const validacionDuplicado = this.validarDuplicado(datos);
    if (!validacionDuplicado.valido) {
      errores.push(...validacionDuplicado.errores);
    }

    if (datos.montoTotal !== undefined && datos.montoTotal !== null) {
      const validacionMonto = Validadores.validarMonto(datos.montoTotal);
      if (!validacionMonto.valido) {
        errores.push(...validacionMonto.errores);
      }
    }

    if (configTipo.requiereFacturaOrigen && datos.facturaOrigenId) {
      const facturaOrigen = this.obtenerDocumentoPorId(datos.facturaOrigenId);
      if (!facturaOrigen) {
        errores.push(`Factura origen no encontrada: ${datos.facturaOrigenId}`);
      }
    }

    if (configTipo.requiereProductos && datos.productos) {
      if (!Array.isArray(datos.productos) || datos.productos.length === 0) {
        errores.push('El documento debe tener al menos un producto');
      }
      datos.productos.forEach((prod, idx) => {
        if (!prod.cantidad || prod.cantidad <= 0) {
          errores.push(`Producto ${idx + 1}: cantidad debe ser mayor a 0`);
        }
      });
    }

    if (datos.montoTotal && datos.montoIVA) {
      const ivaCalculado = Utilidades.calcularIVADeTotal(datos.montoTotal);
      const diferencia = Math.abs(ivaCalculado - datos.montoIVA);
      if (diferencia > 0.01) {
        errores.push(
          `IVA incoherente: calculado ${ivaCalculado.toFixed(2)}, ` +
          `declarado ${datos.montoIVA.toFixed(2)}, diferencia ${diferencia.toFixed(2)}`
        );
      }
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  _buscarPorCUF(cuf) {
    const documentos = this.almacenamiento.obtener(this.nombreColeccion);
    return documentos.find(doc => doc.cuf === cuf) || null;
  }

  // ════════════════════════════════════════════════════════════
  // CONSULTAS
  // ════════════════════════════════════════════════════════════

  obtenerDocumentos(filtros = {}) {
    let documentos = this.almacenamiento.obtener(this.nombreColeccion);

    if (filtros.tipo) {
      documentos = documentos.filter(doc => doc.tipo === filtros.tipo);
    }

    if (filtros.estado) {
      documentos = documentos.filter(doc => doc.estado === filtros.estado);
    }

    if (filtros.periodoContable) {
      documentos = documentos.filter(doc => doc.periodoContable === filtros.periodoContable);
    }

    if (filtros.nitContraparte) {
      documentos = documentos.filter(doc =>
        doc.nitProveedor === filtros.nitContraparte ||
        doc.nitCliente === filtros.nitContraparte ||
        doc.nitRecibidoDe === filtros.nitContraparte ||
        doc.nitPagadoA === filtros.nitContraparte
      );
    }

    documentos.sort((a, b) => {
      const fechaA = new Date(a.fechaRegistro || a.creadoEn);
      const fechaB = new Date(b.fechaRegistro || b.creadoEn);
      return fechaB - fechaA;
    });

    return documentos;
  }

  obtenerDocumentoPorId(id) {
    return this.almacenamiento.obtenerPorId(this.nombreColeccion, id);
  }

  obtenerDocumentosPorNumero(numero) {
    return this.almacenamiento.buscar(this.nombreColeccion, doc => doc.numero === numero);
  }

  obtenerEstadisticas(periodoContable = null) {
    const documentos = periodoContable
      ? this.obtenerDocumentos({ periodoContable })
      : this.obtenerDocumentos();

    const estadisticas = {
      total: documentos.length,
      porTipo: {},
      porEstado: {},
      montoTotal: 0,
      montoIVA: 0,
      montoIT: 0
    };

    documentos.forEach(doc => {
      if (!estadisticas.porTipo[doc.tipo]) {
        estadisticas.porTipo[doc.tipo] = 0;
      }
      estadisticas.porTipo[doc.tipo]++;

      if (!estadisticas.porEstado[doc.estado]) {
        estadisticas.porEstado[doc.estado] = 0;
      }
      estadisticas.porEstado[doc.estado]++;

      estadisticas.montoTotal += doc.montoTotal || 0;
      estadisticas.montoIVA += doc.montoIVA || 0;
      estadisticas.montoIT += doc.montoIT || 0;
    });

    return estadisticas;
  }

  // ════════════════════════════════════════════════════════════
  // GESTIÓN DE ESTADOS
  // ════════════════════════════════════════════════════════════

  cambiarEstado(id, nuevoEstado, motivo = '') {
    const documento = this.obtenerDocumentoPorId(id);
    if (!documento) {
      return {
        exito: false,
        mensaje: `Documento no encontrado: ${id}`,
        documento: null
      };
    }

    if (!ESTADOS_DOCUMENTO[nuevoEstado]) {
      return {
        exito: false,
        mensaje: `Estado inválido: ${nuevoEstado}`,
        documento: null
      };
    }

    const estadoAnterior = documento.estado;
    const transicionValida = this._validarTransicionEstado(estadoAnterior, nuevoEstado);
    if (!transicionValida.valida) {
      return {
        exito: false,
        mensaje: transicionValida.mensaje,
        documento: null
      };
    }

    const documentoActualizado = {
      ...documento,
      estado: nuevoEstado,
      actualizadoEn: new Date().toISOString(),
      actualizadoPor: 'sistema'
    };

    documentoActualizado.historial = documento.historial || [];
    documentoActualizado.historial.push({
      fecha: new Date().toISOString(),
      estadoAnterior,
      estadoNuevo: nuevoEstado,
      usuario: 'sistema',
      motivo
    });

    const resultado = this.almacenamiento.actualizar(this.nombreColeccion, id, documentoActualizado);

    if (!resultado) {
      return {
        exito: false,
        mensaje: 'Error al actualizar el documento',
        documento: null
      };
    }

    this._dispararEvento('documento-estado-cambiado', {
      documento: documentoActualizado,
      estadoAnterior,
      estadoNuevo: nuevoEstado
    });

    console.log(`✅ Estado cambiado: ${estadoAnterior} → ${nuevoEstado} (doc ${id})`);

    return {
      exito: true,
      mensaje: `Estado actualizado a ${nuevoEstado}`,
      documento: documentoActualizado
    };
  }

  _validarTransicionEstado(estadoAnterior, estadoNuevo) {
    const transicionesValidas = {
      'PENDIENTE': ['VALIDADO', 'RECHAZADO'],
      'RECHAZADO': ['PENDIENTE'],
      'VALIDADO': ['PROCESADO', 'ANULADO'],
      'PROCESADO': ['ANULADO'],
      'ANULADO': []
    };

    const destinosPermitidos = transicionesValidas[estadoAnterior] || [];
    const valida = destinosPermitidos.includes(estadoNuevo);

    return {
      valida,
      mensaje: valida
        ? 'Transición válida'
        : `No se puede cambiar de ${estadoAnterior} a ${estadoNuevo}. ` +
          `Destinos permitidos: ${destinosPermitidos.join(', ') || 'ninguno'}`
    };
  }

  validarYActualizarEstado(id) {
    const documento = this.obtenerDocumentoPorId(id);
    if (!documento) {
      return {
        exito: false,
        mensaje: `Documento no encontrado: ${id}`,
        documento: null
      };
    }

    if (documento.estado !== ESTADOS_DOCUMENTO.PENDIENTE.codigo) {
      return {
        exito: false,
        mensaje: `El documento no está en estado PENDIENTE (está en ${documento.estado})`,
        documento: null
      };
    }

    const validacion = this.validarDocumento(documento);
    const nuevoEstado = validacion.valido
      ? ESTADOS_DOCUMENTO.VALIDADO.codigo
      : ESTADOS_DOCUMENTO.RECHAZADO.codigo;

    const motivo = validacion.valido
      ? 'Validación automática exitosa'
      : `Validación fallida: ${validacion.errores.join('; ')}`;

    return this.cambiarEstado(id, nuevoEstado, motivo);
  }

  // ════════════════════════════════════════════════════════════
  // UTILIDADES INTERNAS
  // ════════════════════════════════════════════════════════════

  _generarId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  _dispararEvento(nombreEvento, datos) {
    const evento = new CustomEvent(`erp:${nombreEvento}`, { detail: datos });
    window.dispatchEvent(evento);
  }

  // ════════════════════════════════════════════════════════════
  // MÉTODOS DE ADMINISTRACIÓN
  // ════════════════════════════════════════════════════════════

  eliminarDocumento(id) {
    const documento = this.obtenerDocumentoPorId(id);
    if (!documento) {
      return {
        exito: false,
        mensaje: `Documento no encontrado: ${id}`
      };
    }

    if (documento.estado !== ESTADOS_DOCUMENTO.PENDIENTE.codigo &&
        documento.estado !== ESTADOS_DOCUMENTO.RECHAZADO.codigo) {
      return {
        exito: false,
        mensaje: `No se puede eliminar un documento en estado ${documento.estado}. ` +
                 `Solo se pueden eliminar documentos PENDIENTES o RECHAZADOS.`
      };
    }

    const eliminado = this.almacenamiento.eliminar(this.nombreColeccion, id);

    if (eliminado) {
      this._dispararEvento('documento-eliminado', { id, documento });
      return {
        exito: true,
        mensaje: 'Documento eliminado correctamente'
      };
    }

    return {
      exito: false,
      mensaje: 'Error al eliminar el documento'
    };
  }

  contarDocumentos() {
    const documentos = this.almacenamiento.obtener(this.nombreColeccion);

    return {
      total: documentos.length,
      pendientes: documentos.filter(d => d.estado === 'PENDIENTE').length,
      validados: documentos.filter(d => d.estado === 'VALIDADO').length,
      rechazados: documentos.filter(d => d.estado === 'RECHAZADO').length,
      procesados: documentos.filter(d => d.estado === 'PROCESADO').length,
      anulados: documentos.filter(d => d.estado === 'ANULADO').length
    };
  }

  // ════════════════════════════════════════════════════════════
  // VALIDACIÓN DE PERÍODO CONTABLE
  // ════════════════════════════════════════════════════════════

  validarPeriodoContable(fechaEmision) {
    const errores = [];

    if (!fechaEmision) {
      return { valido: false, errores: ['La fecha de emisión es requerida.'] };
    }

    const fecha = new Date(fechaEmision);
    if (isNaN(fecha.getTime())) {
      return { valido: false, errores: ['La fecha de emisión no es válida.'] };
    }

    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);

    if (fecha > hoy) {
      errores.push(
        `No se pueden registrar documentos con fecha futura. ` +
        `Fecha ingresada: ${Utilidades.formatearFecha(fechaEmision)}, ` +
        `Fecha actual: ${Utilidades.formatearFecha(hoy.toISOString())}.`
      );
    }

    const periodoContable = Utilidades.obtenerPeriodoContable(fechaEmision);
    if (!periodoContable) {
      errores.push('No se pudo determinar el período contable de la fecha.');
    } else {
      const periodosAbiertos = this._obtenerPeriodosAbiertos();

      if (periodosAbiertos.length > 0 && !periodosAbiertos.includes(periodoContable)) {
        errores.push(
          `El período contable ${periodoContable} está cerrado. ` +
          `Períodos abiertos: ${periodosAbiertos.join(', ')}.`
        );
      }
    }

    return { valido: errores.length === 0, errores };
  }

  // ════════════════════════════════════════════════════════════
  // VALIDACIÓN DE DUPLICADOS
  // ════════════════════════════════════════════════════════════

  validarDuplicado(datos) {
    const errores = [];
    const documentos = this.almacenamiento.obtener(this.nombreColeccion);

    if (documentos.length === 0) {
      return { valido: true, errores: [] };
    }

    const duplicado = documentos.find(doc => {
      if (doc.tipo !== datos.tipo || doc.numero !== datos.numero) {
        return false;
      }

      if (datos.tipo.includes('FACTURA') || datos.tipo.includes('NOTA')) {
        const nitNuevo = datos.nitProveedor || datos.nitCliente;
        const nitExistente = doc.nitProveedor || doc.nitCliente;
        return nitNuevo === nitExistente;
      }

      return true;
    });

    if (duplicado) {
      const nitInfo = duplicado.nitProveedor || duplicado.nitCliente
        ? ` para el NIT ${duplicado.nitProveedor || duplicado.nitCliente}`
        : '';

      errores.push(
        `Documento duplicado: ya se registró un ${duplicado.tipo} ` +
        `con el número ${duplicado.numero}${nitInfo} ` +
        `(ID: ${duplicado.id}, estado: ${duplicado.estado}).`
      );
    }

    return { valido: errores.length === 0, errores };
  }

  /**
   * Obtiene la lista de períodos contables abiertos.
   * Usa el gestor PeriodosContables si está disponible.
   * 
   * @returns {Array} Lista de períodos en formato "AAAA-MM"
   * @private
   */
  _obtenerPeriodosAbiertos() {
    // Si PeriodosContables está disponible, usarlo
    if (typeof PeriodosContables !== 'undefined' && PeriodosContables.obtenerAbiertos) {
      return PeriodosContables.obtenerAbiertos().map(p => p.periodo);
    }
    
    // Fallback: generar los últimos 12 meses
    const periodos = [];
    const hoy = new Date();
    for (let i = 0; i < 12; i++) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const anio = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      periodos.push(`${anio}-${mes}`);
    }
    return periodos;
  }
}
