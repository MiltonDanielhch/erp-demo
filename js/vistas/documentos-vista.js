// ══════════════════════════════════════════════════════════════
// documentos-vista.js — ERP Contable Bolivia
// Lógica de la vista: Documentos Fuente (Capa 1)
// ══════════════════════════════════════════════════════════════

/**
 * Vista: Documentos Fuente
 *
 * Responsabilidades:
 * - Renderizar formulario dinámico según tipo de documento
 * - Validar campos en tiempo real (NIT, CUF, montos)
 * - Gestionar tabla de documentos con filtros
 * - Mostrar toasts de feedback
 * - Conectar UI con la Capa 1 (window.capaDocumentos)
 *
 * Separación de responsabilidades:
 * - Este archivo NO conoce localStorage
 * - Este archivo NO implementa lógica de negocio
 * - Solo consume la API pública de window.capaDocumentos
 */

const DocumentosVista = {

  // ════════════════════════════════════════════════════════════
  // REFERENCIAS AL DOM
  // ════════════════════════════════════════════════════════════
  elementos: {},

  // ════════════════════════════════════════════════════════════
  // INICIALIZACIÓN
  // ════════════════════════════════════════════════════════════

  /**
   * Punto de entrada de la vista.
   * Se llama automáticamente cuando el enrutador carga documentos.html
   */
  inicializar() {
    console.log('📄 DocumentosVista.inicializar()');

    this.capturarElementos();
    this.llenarSelectoresTipos();
    this.llenarSelectorPeriodos(); 
    this.configurarFechas();
    this.refrescarTabla();
    this.configurarEventListeners();
    this.configurarEventosSistema();

    console.log('✅ Vista Documentos lista');
  },

  capturarElementos() {
    this.elementos = {
      btnNuevo: document.getElementById('btn-nuevo-documento'),
      btnCancelar: document.getElementById('btn-cancelar-documento'),
      btnRefrescar: document.getElementById('btn-refrescar'),
      btnLimpiar: document.getElementById('btn-limpiar-form'),
      btnRegistrar: document.getElementById('btn-registrar'),

      formulario: document.getElementById('formulario-documento'),
      form: document.getElementById('form-documento'),
      formTitulo: document.getElementById('form-titulo'),
      formTipoBadge: document.getElementById('form-tipo-badge'),

      filtroTipo: document.getElementById('filtro-tipo'),
      filtroEstado: document.getElementById('filtro-estado'),
      filtroPeriodo: document.getElementById('filtro-periodo'),  // NUEVO
      docTipo: document.getElementById('doc-tipo'),
      docNumero: document.getElementById('doc-numero'),
      docFechaEmision: document.getElementById('doc-fecha-emision'),
      docMontoTotal: document.getElementById('doc-monto-total'),
      montoDetalle: document.getElementById('monto-detalle'),

      camposFactura: document.getElementById('campos-factura'),
            // Campos de activo fijo
      camposActivoFijo: document.getElementById('campos-activo-fijo'),
      docCodigoActivo: document.getElementById('doc-codigo-activo'),
      docCategoriaActivo: document.getElementById('doc-categoria-activo'),
      docDescripcionActivo: document.getElementById('doc-descripcion-activo'),
      docVidaUtil: document.getElementById('doc-vida-util'),
      docMetodoDepreciacion: document.getElementById('doc-metodo-depreciacion'),
      docCufFactura: document.getElementById('doc-cuf-factura'),
      docNitProveedorActivo: document.getElementById('doc-nit-proveedor-activo'),

      // Campos de nómina
      camposNomina: document.getElementById('campos-nomina'),
      docPeriodoNomina: document.getElementById('doc-periodo-nomina'),
      docFormaPagoNomina: document.getElementById('doc-forma-pago-nomina'),

      // Campos de extracto bancario
      camposExtracto: document.getElementById('campos-extracto'),
      docBanco: document.getElementById('doc-banco'),
      docCuentaBancariaExt: document.getElementById('doc-cuenta-bancaria-ext'),
      docTipoMovimiento: document.getElementById('doc-tipo-movimiento'),
      docConceptoExt: document.getElementById('doc-concepto-ext'),

      camposTesoreria: document.getElementById('campos-tesoreria'),
      camposNota: document.getElementById('campos-nota'),

      docNit: document.getElementById('doc-nit-contraparte'),
      docRazonSocial: document.getElementById('doc-razon-social'),
      docCuf: document.getElementById('doc-cuf'),
      cufContador: document.getElementById('cuf-contador'),
      cufValidacion: document.getElementById('cuf-validacion'),
      nitValidacion: document.getElementById('nit-validacion'),
      labelNit: document.getElementById('label-nit-contraparte'),

      docPersona: document.getElementById('doc-persona'),
      labelPersona: document.getElementById('label-persona'),
      docConcepto: document.getElementById('doc-concepto'),
      docFormaPago: document.getElementById('doc-forma-pago'),
      docCuentaBancaria: document.getElementById('doc-cuenta-bancaria'),

      docFacturaOrigen: document.getElementById('doc-factura-origen'),
      docMotivoNota: document.getElementById('doc-motivo-nota'),

      docObservaciones: document.getElementById('doc-observaciones'),

      tablaBody: document.getElementById('tabla-documentos-body'),
      tablaContador: document.getElementById('tabla-contador'),

      statsTotal: document.getElementById('stats-total'),
      statsPendientes: document.getElementById('stats-pendientes'),
      statsValidados: document.getElementById('stats-validados'),
      statsRechazados: document.getElementById('stats-rechazados'),

      contenedorToasts: document.getElementById('contenedor-toasts')
    };
  },

  // ════════════════════════════════════════════════════════════
  // CONFIGURACIÓN INICIAL
  // ════════════════════════════════════════════════════════════

  llenarSelectoresTipos() {
    const tipos = window.TiposDocumentoUtilidades.listarTipos();

    // Selector del formulario
    tipos.forEach(tipo => {
      const option = document.createElement('option');
      option.value = tipo.codigo;
      option.textContent = `${tipo.icono} ${tipo.nombre}`;
      this.elementos.docTipo.appendChild(option);
    });

    // Selector de filtro (agrupado por origen)
    const origenes = [...new Set(tipos.map(t => t.origen))];
    origenes.forEach(origen => {
      const grupo = document.createElement('optgroup');
      grupo.label = origen;
      tipos.filter(t => t.origen === origen).forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo.codigo;
        option.textContent = `${tipo.icono} ${tipo.nombre}`;
        grupo.appendChild(option);
      });
      this.elementos.filtroTipo.appendChild(grupo);
    });
  },

  configurarFechas() {
    this.elementos.docFechaEmision.max = window.utilidades.fechaActualCorta();
  },

  // ════════════════════════════════════════════════════════════
  // EVENT LISTENERS
  // ════════════════════════════════════════════════════════════

  configurarEventListeners() {
    this.elementos.btnNuevo.addEventListener('click', () => this.mostrarFormulario(true));
    this.elementos.filtroPeriodo.addEventListener('change', () => this.refrescarTabla());  // NUEVO
    this.elementos.filtroTipo.addEventListener('change', () => this.refrescarTabla());
    this.elementos.filtroEstado.addEventListener('change', () => this.refrescarTabla());
    
    this.elementos.btnCancelar.addEventListener('click', () => {
      this.mostrarFormulario(false);
      this.limpiarFormulario();
    });

    this.elementos.btnRefrescar.addEventListener('click', () => this.refrescarTabla());
    this.elementos.btnLimpiar.addEventListener('click', () => this.limpiarFormulario());

    this.elementos.docTipo.addEventListener('change', () => this.manejarCambioTipo());
    this.elementos.docMontoTotal.addEventListener('input', () => this.manejarCambioMonto());
    this.elementos.docCuf.addEventListener('input', () => this.manejarCambioCUF());
    this.elementos.docNit.addEventListener('input', () => this.manejarCambioNIT());

    this.elementos.filtroTipo.addEventListener('change', () => this.refrescarTabla());
    this.elementos.filtroEstado.addEventListener('change', () => this.refrescarTabla());

    this.elementos.form.addEventListener('submit', (e) => this.manejarSubmit(e));

    if (this.elementos.docFacturaOrigen) {
      this.elementos.docFacturaOrigen.addEventListener('change', () => this.manejarCambioFacturaOrigen());
    }
  },

  configurarEventosSistema() {
    window.addEventListener('erp:documento-registrado', () => this.refrescarTabla());
    window.addEventListener('erp:documento-estado-cambiado', () => this.refrescarTabla());
    window.addEventListener('erp:documento-eliminado', () => this.refrescarTabla());
  },

  // ════════════════════════════════════════════════════════════
  // FORMULARIO: Mostrar / Ocultar / Limpiar
  // ════════════════════════════════════════════════════════════

  /**
   * Muestra u oculta el formulario de registro.
   * @param {boolean} visible - true para mostrar, false para ocultar
   */
  mostrarFormulario(visible) {
    if (visible) {
      this.elementos.formulario.classList.remove('oculto');
      this.elementos.btnNuevo.classList.add('oculto');
      this.elementos.btnCancelar.classList.remove('oculto');
      this.elementos.docTipo.focus();
    } else {
      this.elementos.formulario.classList.add('oculto');
      this.elementos.btnNuevo.classList.remove('oculto');
      this.elementos.btnCancelar.classList.add('oculto');
    }
  },

  limpiarFormulario() {
    this.elementos.form.reset();
    this.elementos.camposFactura.classList.add('oculto');
    this.elementos.camposTesoreria.classList.add('oculto');
    this.elementos.camposNota.classList.add('oculto');
    this.elementos.camposActivoFijo.classList.add('oculto');  // NUEVO
    this.elementos.camposNomina.classList.add('oculto');      // NUEVO
    this.elementos.camposExtracto.classList.add('oculto');    // NUEVO
    this.elementos.montoDetalle.textContent = 'Neto: Bs 0,00 | IVA: Bs 0,00';
    this.elementos.cufContador.textContent = '0';
    this.elementos.cufValidacion.textContent = 'Pendiente';
    this.elementos.cufValidacion.style.color = '';
    this.elementos.nitValidacion.textContent = 'Ingrese el NIT con guión verificador';
    this.elementos.nitValidacion.style.color = '';
    this.elementos.formTipoBadge.textContent = 'Seleccionar tipo';
    this.elementos.formTipoBadge.className = 'badge badge-info';
    this.elementos.camposActivoFijo?.classList.add('oculto');
    this.elementos.camposNomina?.classList.add('oculto');
    this.elementos.camposExtracto?.classList.add('oculto');
  },

  // ════════════════════════════════════════════════════════════
  // CAMPOS DINÁMICOS SEGÚN TIPO DE DOCUMENTO
  // ════════════════════════════════════════════════════════════

  manejarCambioTipo() {
    const tipo = this.elementos.docTipo.value;

    // Ocultar TODAS las secciones específicas
    this.elementos.camposFactura.classList.add('oculto');
    this.elementos.camposTesoreria.classList.add('oculto');
    this.elementos.camposNota.classList.add('oculto');
    this.elementos.camposActivoFijo.classList.add('oculto');
    this.elementos.camposNomina.classList.add('oculto');
    this.elementos.camposExtracto.classList.add('oculto');

    if (!tipo) {
      this.elementos.formTipoBadge.textContent = 'Seleccionar tipo';
      this.elementos.formTipoBadge.className = 'badge badge-info';
      return;
    }

    const configTipo = window.TiposDocumentoUtilidades.obtenerTipo(tipo);
    if (!configTipo) return;

    this.elementos.formTipoBadge.textContent = configTipo.nombre;
    this.elementos.formTipoBadge.className = 'badge badge-info';

    // Mostrar sección según el tipo
    const esNota = tipo.includes('NOTA_CREDITO') || tipo.includes('NOTA_DEBITO');

    if (esNota) {
      this.elementos.camposNota.classList.remove('oculto');
      this.cargarFacturasOrigen(tipo);
    }

    if (tipo === 'ACTA_COMPRA_ACTIVO') {
      this.elementos.camposActivoFijo.classList.remove('oculto');
    }

    if (tipo === 'COMPROBANTE_NOMINA') {
      this.elementos.camposNomina.classList.remove('oculto');
      // Precargar período actual
      const hoy = new Date();
      const periodoActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
      this.elementos.docPeriodoNomina.value = periodoActual;
    }

    if (tipo === 'EXTRACTO_BANCARIO') {
      this.elementos.camposExtracto.classList.remove('oculto');
    }

    if (configTipo.requiereCUF || configTipo.requiereNIT) {
      this.elementos.camposFactura.classList.remove('oculto');

      if (configTipo.origen === 'PROVEEDOR') {
        this.elementos.labelNit.textContent = 'NIT del Proveedor';
      } else if (configTipo.origen === 'EMPRESA') {
        this.elementos.labelNit.textContent = 'NIT del Cliente';
      } else {
        this.elementos.labelNit.textContent = 'NIT';
      }
    }

    if (tipo === 'RECIBO_CAJA' || tipo === 'COMPROBANTE_EGRESO') {
      this.elementos.camposTesoreria.classList.remove('oculto');
      this.elementos.labelPersona.textContent = tipo === 'RECIBO_CAJA' ? 'Recibido de' : 'Pagado a';
    }
    // Ocultar TODAS las secciones específicas
    const secciones = [
      'camposFactura', 'camposTesoreria', 'camposNota',
      'camposActivoFijo', 'camposNomina', 'camposExtracto'
    ];
    secciones.forEach(seccion => {
      if (this.elementos[seccion]) {
        this.elementos[seccion].classList.add('oculto');
      }
    });
  },

  // ════════════════════════════════════════════════════════════
  // FACTURAS ORIGEN (para notas crédito/débito)
  // ════════════════════════════════════════════════════════════

  cargarFacturasOrigen(tipoNota) {
    const select = this.elementos.docFacturaOrigen;
    select.innerHTML = '<option value="">-- Seleccionar factura origen --</option>';

    // Determinar qué tipo de facturas buscar
    let tiposFactura = [];
    if (tipoNota === 'NOTA_CREDITO_RECIBIDA' || tipoNota === 'NOTA_DEBITO_RECIBIDA') {
      tiposFactura = ['FACTURA_COMPRA'];
    } else if (tipoNota === 'NOTA_CREDITO_EMITIDA' || tipoNota === 'NOTA_DEBITO_EMITIDA') {
      tiposFactura = ['FACTURA_VENTA'];
    }

    // Buscar facturas VALIDADAS y PROCESADAS
    const todasFacturas = [];
    tiposFactura.forEach(tipoFactura => {
      const validadas = window.capaDocumentos.obtenerDocumentos({
        tipo: tipoFactura,
        estado: 'VALIDADO'
      });
      todasFacturas.push(...validadas);

      const procesadas = window.capaDocumentos.obtenerDocumentos({
        tipo: tipoFactura,
        estado: 'PROCESADO'
      });
      todasFacturas.push(...procesadas);
    });

    if (todasFacturas.length === 0) {
      select.innerHTML += '<option value="" disabled>⚠️ No hay facturas validadas disponibles</option>';
      return;
    }

    // Llenar el select
    todasFacturas.forEach(factura => {
      const contraparte = factura.razonSocialProveedor || factura.razonSocialCliente || '—';
      const option = document.createElement('option');
      option.value = factura.id;
      option.textContent = `${factura.numero} — ${contraparte} — ${window.utilidades.formatearBs(factura.montoTotal)}`;
      option.dataset.numero = factura.numero;
      option.dataset.monto = factura.montoTotal;
      option.dataset.nit = factura.nitProveedor || factura.nitCliente || '';
      option.dataset.razonSocial = factura.razonSocialProveedor || factura.razonSocialCliente || '';
      option.dataset.cuf = factura.cuf || '';
      select.appendChild(option);
    });
  },

  manejarCambioFacturaOrigen() {
    const select = this.elementos.docFacturaOrigen;
    const option = select.options[select.selectedIndex];

    if (!option || !option.value) return;

    // Autocompletar campos con datos de la factura origen
    this.elementos.docNumero.value = `NC-${option.dataset.numero}`;
    this.elementos.docMontoTotal.value = option.dataset.monto;
    this.elementos.docNit.value = option.dataset.nit;
    this.elementos.docRazonSocial.value = option.dataset.razonSocial;
    this.elementos.docCuf.value = '';

    // Actualizar validaciones
    this.manejarCambioMonto();
    this.manejarCambioNIT();
  },

  // ════════════════════════════════════════════════════════════
  // VALIDACIONES EN TIEMPO REAL
  // ════════════════════════════════════════════════════════════

  manejarCambioMonto() {
    const montoTotal = parseFloat(this.elementos.docMontoTotal.value) || 0;
    const tipo = this.elementos.docTipo.value;

    if (montoTotal <= 0) {
      this.elementos.montoDetalle.textContent = 'Neto: Bs 0,00 | IVA: Bs 0,00';
      return;
    }

    const neto = window.utilidades.extraerNetoDeTotal(montoTotal);
    const iva = window.utilidades.calcularIVADeTotal(montoTotal);

    let detalle = `Neto: ${window.utilidades.formatearBs(neto)} | IVA: ${window.utilidades.formatearBs(iva)}`;

    // Agregar IT si es venta
    if (tipo === 'FACTURA_VENTA' || tipo === 'NOTA_CREDITO_EMITIDA' || tipo === 'NOTA_DEBITO_EMITIDA') {
      const it = window.utilidades.calcularIT(montoTotal);
      detalle += ` | IT: ${window.utilidades.formatearBs(it)}`;
    }

    this.elementos.montoDetalle.textContent = detalle;
  },

  manejarCambioCUF() {
    const cuf = this.elementos.docCuf.value.toUpperCase();
    this.elementos.docCuf.value = cuf;
    this.elementos.cufContador.textContent = cuf.length;

    if (cuf.length === 0) {
      this.elementos.cufValidacion.textContent = 'Pendiente';
      this.elementos.cufValidacion.style.color = '';
    } else if (cuf.length !== 43) {
      this.elementos.cufValidacion.textContent = `Faltan ${43 - cuf.length} caracteres`;
      this.elementos.cufValidacion.style.color = 'var(--color-alerta)';
    } else {
      const validacion = window.validadores.validarCUF(cuf);
      if (validacion.valido) {
        this.elementos.cufValidacion.textContent = '✓ Válido';
        this.elementos.cufValidacion.style.color = 'var(--color-exito)';
      } else {
        this.elementos.cufValidacion.textContent = '✗ Inválido';
        this.elementos.cufValidacion.style.color = 'var(--color-error)';
      }
    }
  },

  manejarCambioNIT() {
    const nit = this.elementos.docNit.value;

    if (!nit) {
      this.elementos.nitValidacion.textContent = 'Ingrese el NIT con guión verificador';
      this.elementos.nitValidacion.style.color = '';
      return;
    }

    const validacion = window.validadores.validarNIT(nit);
    if (validacion.valido) {
      this.elementos.nitValidacion.textContent = '✓ NIT válido';
      this.elementos.nitValidacion.style.color = 'var(--color-exito)';
    } else {
      this.elementos.nitValidacion.textContent = validacion.errores[0] || '✗ NIT inválido';
      this.elementos.nitValidacion.style.color = 'var(--color-error)';
    }
  },

  // ════════════════════════════════════════════════════════════
  // SUBMIT DEL FORMULARIO
  // ════════════════════════════════════════════════════════════

  /**
   * Maneja el envío del formulario de registro.
   * @param {Event} evento - Evento submit
   */
  manejarSubmit(evento) {
    evento.preventDefault();

    const tipo = this.elementos.docTipo.value;
    if (!tipo) {
      this.mostrarToast('Debe seleccionar un tipo de documento', 'error');
      return;
    }

    // Construir objeto documento base
    const documento = {
      tipo: tipo,
      numero: this.elementos.docNumero.value.trim(),
      fechaEmision: this.elementos.docFechaEmision.value,
      montoTotal: parseFloat(this.elementos.docMontoTotal.value) || 0,
      observaciones: this.elementos.docObservaciones.value.trim()
    };

    // Campos de factura
    if (!this.elementos.camposFactura.classList.contains('oculto')) {
      documento.nitProveedor = this.elementos.docNit.value.trim();
      documento.nitCliente = this.elementos.docNit.value.trim();
      documento.razonSocialProveedor = this.elementos.docRazonSocial.value.trim();
      documento.razonSocialCliente = this.elementos.docRazonSocial.value.trim();
      documento.cuf = this.elementos.docCuf.value.trim();
    }

    // Campos de tesorería
    if (!this.elementos.camposTesoreria.classList.contains('oculto')) {
      documento.recibidoDe = this.elementos.docPersona.value.trim();
      documento.pagadoA = this.elementos.docPersona.value.trim();
      documento.concepto = this.elementos.docConcepto.value.trim();
      documento.formaPago = this.elementos.docFormaPago.value;
      documento.cuentaBancaria = this.elementos.docCuentaBancaria.value.trim();
    }

    // Campos de nota crédito/débito
    if (!this.elementos.camposNota.classList.contains('oculto')) {
      const facturaOrigenId = this.elementos.docFacturaOrigen.value;
      const option = this.elementos.docFacturaOrigen.options[this.elementos.docFacturaOrigen.selectedIndex];

      documento.facturaOrigenId = facturaOrigenId;
      documento.facturaOrigenNumero = option ? option.dataset.numero : '';
      documento.motivo = this.elementos.docMotivoNota.value.trim();
    }

    // Deshabilitar botón mientras procesa
    this.elementos.btnRegistrar.disabled = true;
    this.elementos.btnRegistrar.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px;"></span> Registrando...';

    try {
            // Campos de ACTIVO FIJO
      if (!this.elementos.camposActivoFijo.classList.contains('oculto')) {
        documento.codigoActivo = this.elementos.docCodigoActivo.value.trim();
        documento.categoriaActivo = this.elementos.docCategoriaActivo.value;
        documento.descripcionActivo = this.elementos.docDescripcionActivo.value.trim();
        documento.vidaUtilMeses = parseInt(this.elementos.docVidaUtil.value, 10) || 0;
        documento.metodoDepreciacion = this.elementos.docMetodoDepreciacion.value;
        documento.cufFactura = this.elementos.docCufFactura.value.trim();
        documento.nitProveedor = this.elementos.docNitProveedorActivo.value.trim();
        documento.razonSocialProveedor = 'Proveedor del activo'; // TODO: lookup
      }

      // Campos de NÓMINA
      if (!this.elementos.camposNomina.classList.contains('oculto')) {
        documento.periodoNomina = this.elementos.docPeriodoNomina.value;
        documento.formaPago = this.elementos.docFormaPagoNomina.value;
        documento.empleados = []; // Se llena en el módulo de nómina
      }

      // Campos de EXTRACTO BANCARIO
      if (!this.elementos.camposExtracto.classList.contains('oculto')) {
        documento.banco = this.elementos.docBanco.value;
        documento.cuentaBancaria = this.elementos.docCuentaBancariaExt.value.trim();
        documento.tipoMovimiento = this.elementos.docTipoMovimiento.value;
        documento.concepto = this.elementos.docConceptoExt.value.trim();
      }
      // Llamar a la Capa 1
      const resultado = window.capaDocumentos.registrarDocumento(documento);

      if (resultado.exito) {
        this.mostrarToast(`✅ Documento registrado: ${documento.numero}`, 'exito');
        this.limpiarFormulario();
        this.mostrarFormulario(false);
        this.refrescarTabla();
      } else {
        const mensajeError = resultado.errores.length > 0
          ? resultado.errores.join('\n')
          : resultado.mensaje;
        this.mostrarToast(`❌ Error: ${mensajeError}`, 'error');
      }
    } catch (error) {
      this.mostrarToast(`❌ Error inesperado: ${error.message}`, 'error');
    } finally {
      this.elementos.btnRegistrar.disabled = false;
      this.elementos.btnRegistrar.innerHTML = '✅ Registrar Documento';
    }
  },

  // ════════════════════════════════════════════════════════════
  // TABLA DE DOCUMENTOS
  // ════════════════════════════════════════════════════════════

  /**
   * Carga/actualiza la tabla de documentos.
   * Aplica los filtros actuales y renderiza las filas.
   */
  refrescarTabla() {
    
    // Obtener filtros actuales
    const filtros = {
      periodoContable: this.elementos.filtroPeriodo ? this.elementos.filtroPeriodo.value : undefined,  // NUEVO
      tipo: this.elementos.filtroTipo.value || undefined,
      estado: this.elementos.filtroEstado.value || undefined
    };

    // Obtener documentos de la Capa 1
    const documentos = window.capaDocumentos.obtenerDocumentos(filtros);
    const conteos = window.capaDocumentos.contarDocumentos();

    // Actualizar estadísticas
    this.elementos.statsTotal.textContent = conteos.total;
    this.elementos.statsPendientes.textContent = conteos.pendientes;
    this.elementos.statsValidados.textContent = conteos.validados;
    this.elementos.statsRechazados.textContent = conteos.rechazados;

    // Actualizar contador
    this.elementos.tablaContador.textContent = `${documentos.length} documento${documentos.length !== 1 ? 's' : ''}`;

    // Renderizar tabla
    if (documentos.length === 0) {
      this.elementos.tablaBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: var(--espacio-xl); color: var(--texto-secundario);">
            📭 No hay documentos que coincidan con los filtros.
          </td>
        </tr>
      `;
      return;
    }

    this.elementos.tablaBody.innerHTML = documentos.map(doc => this.renderizarFilaDocumento(doc)).join('');

    // Agregar event listeners a botones de acción
    this.elementos.tablaBody.querySelectorAll('[data-accion]').forEach(btn => {
      btn.addEventListener('click', (e) => this.manejarAccionDocumento(e));
    });
  },

  /**
   * Renderiza una fila de la tabla de documentos.
   * @param {Object} doc - Documento a renderizar
   * @returns {string} HTML de la fila
   */
  renderizarFilaDocumento(doc) {
    const tipoConfig = window.TiposDocumentoUtilidades.obtenerTipo(doc.tipo);
    const icono = tipoConfig ? tipoConfig.icono : '📄';
    const nombreTipo = tipoConfig ? tipoConfig.nombre : doc.tipo;

    const contraparte = doc.razonSocialProveedor || doc.razonSocialCliente ||
                        doc.recibidoDe || doc.pagadoA || '—';

    const badgeEstado = this.obtenerBadgeEstado(doc.estado);

    // NUEVO: Formatear período contable
    const periodoFormateado = doc.periodoContable 
      ? window.PeriodosContables.formatearNombre(doc.periodoContable)
      : '—';
    
    const periodoAbierto = doc.periodoContable 
      ? window.PeriodosContables.estaAbierto(doc.periodoContable)
      : false;

    // Acciones según estado
    let acciones = '';
    if (doc.estado === 'PENDIENTE') {
      acciones = `
        <button class="btn btn-sm btn-secondary" data-accion="validar" data-id="${doc.id}" title="Validar">✓</button>
        <button class="btn btn-sm btn-danger" data-accion="rechazar" data-id="${doc.id}" title="Rechazar">✗</button>
        <button class="btn btn-sm btn-ghost" data-accion="eliminar" data-id="${doc.id}" title="Eliminar">🗑️</button>
      `;
    } else if (doc.estado === 'RECHAZADO') {
      acciones = `
        <button class="btn btn-sm btn-ghost" data-accion="eliminar" data-id="${doc.id}" title="Eliminar">🗑️</button>
      `;
    } else {
      acciones = `
        <button class="btn btn-sm btn-outline" data-accion="ver" data-id="${doc.id}" title="Ver detalle">👁️</button>
      `;
    }

    return `
      <tr>
        <td>
          <span title="${nombreTipo}">${icono}</span>
          <small style="display: block; color: var(--texto-secundario); font-size: 0.7rem;">${nombreTipo}</small>
        </td>
        <td><strong>${doc.numero}</strong></td>
        <td>${window.utilidades.formatearFecha(doc.fechaEmision)}</td>
        <td>
          <span style="font-size: 0.85rem;">${periodoFormateado}</span>
          ${!periodoAbierto ? '<br><small style="color: var(--color-error);">🔒 Cerrado</small>' : ''}
        </td>
        <td>${contraparte}</td>
        <td class="monto texto-derecha">${window.utilidades.formatearBs(doc.montoTotal)}</td>
        <td>${badgeEstado}</td>
        <td class="texto-centro">${acciones}</td>
      </tr>
    `;
  },

  obtenerBadgeEstado(estado) {
    const mapa = {
      'PENDIENTE': { clase: 'badge-pendiente', texto: '⏳ Pendiente' },
      'VALIDADO': { clase: 'badge-validado', texto: '✓ Validado' },
      'RECHAZADO': { clase: 'badge-rechazado', texto: '✗ Rechazado' },
      'PROCESADO': { clase: 'badge-procesado', texto: '⚙️ Procesado' },
      'ANULADO': { clase: 'badge-info', texto: '🚫 Anulado' }
    };

    const config = mapa[estado] || { clase: 'badge-info', texto: estado };
    return `<span class="badge ${config.clase}">${config.texto}</span>`;
  },

  // ════════════════════════════════════════════════════════════
  // ACCIONES SOBRE DOCUMENTOS
  // ════════════════════════════════════════════════════════════

  manejarAccionDocumento(evento) {
    const boton = evento.currentTarget;
    const accion = boton.dataset.accion;
    const id = boton.dataset.id;

    switch (accion) {
      case 'validar':
        const r1 = window.capaDocumentos.cambiarEstado(id, 'VALIDADO', 'Validación manual desde UI');
        this.mostrarToast(r1.exito ? '✅ Documento validado' : `❌ ${r1.mensaje}`, r1.exito ? 'exito' : 'error');
        break;

      case 'rechazar':
        const motivo = prompt('Motivo del rechazo (opcional):');
        if (motivo === null) return;
        const r2 = window.capaDocumentos.cambiarEstado(id, 'RECHAZADO', motivo || 'Rechazado desde UI');
        this.mostrarToast(r2.exito ? '✗ Documento rechazado' : `❌ ${r2.mensaje}`, r2.exito ? 'alerta' : 'error');
        break;

      case 'eliminar':
        if (!confirm('¿Estás seguro de eliminar este documento? Esta acción no se puede deshacer.')) return;
        const r3 = window.capaDocumentos.eliminarDocumento(id);
        this.mostrarToast(r3.exito ? '🗑️ Documento eliminado' : `❌ ${r3.mensaje}`, r3.exito ? 'alerta' : 'error');
        break;

      case 'ver':
        this.mostrarToast('👁️ Ver detalle (próximamente en Fase 1.5)', 'info');
        break;
    }
  },

    /**
   * Llena el selector de períodos con los últimos 12 meses.
   */
  llenarSelectorPeriodos() {
    const periodos = window.PeriodosContables.obtenerUltimosMeses(12);
    const select = this.elementos.filtroPeriodo;

    if (!select) return;

    // Limpiar opciones existentes (excepto la primera "Todos los períodos")
    select.innerHTML = '<option value="">Todos los períodos</option>';

    // Agregar los 12 meses
    periodos.forEach(periodo => {
      const option = document.createElement('option');
      option.value = periodo;
      
      // Indicar si está abierto o cerrado
      const estaAbierto = window.PeriodosContables.estaAbierto(periodo);
      const nombreLegible = window.PeriodosContables.formatearNombre(periodo);
      
      option.textContent = estaAbierto 
        ? `📅 ${nombreLegible}` 
        : `🔒 ${nombreLegible} (cerrado)`;
      
      select.appendChild(option);
    });

    // Seleccionar por defecto el período actual
    const periodoActual = window.PeriodosContables.obtenerPeriodoActual();
    select.value = periodoActual;
  },

  // ════════════════════════════════════════════════════════════
  // TOASTS (notificaciones)
  // ════════════════════════════════════════════════════════════

  mostrarToast(mensaje, tipo = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `<span>${mensaje}</span>`;

    this.elementos.contenedorToasts.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toastSalida 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 4000);

    toast.addEventListener('click', () => toast.remove());
  }
};

// ════════════════════════════════════════════════════════════
// ARRANQUE AUTOMÁTICO
// ════════════════════════════════════════════════════════════
DocumentosVista.inicializar();
