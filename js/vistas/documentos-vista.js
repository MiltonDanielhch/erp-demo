// ══════════════════════════════════════════════════════════════
// documentos-vista.js — ERP Contable Bolivia
// Lógica de la vista: Documentos Fuente (Capa 1)
// VERSIÓN 3.0: Fix completo de bugs de navegación SPA
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
  elementos: {},
  _inicializado: false,
  _listenersGlobales: false,

  // ════════════════════════════════════════════════════════════
  // INICIALIZACIÓN
  // ════════════════════════════════════════════════════════════

  inicializar() {
    console.log('📄 DocumentosVista.inicializar()');

    try {
      // Si ya inicializado y seguimos en la vista, solo refrescar
      if (this._inicializado && this._estamosEnVista()) {
        console.log('📄 [REFRESH] Ya inicializado, refrescando datos');
        this.capturarElementos();
        this.llenarSelectorPeriodos();
        this.refrescarTabla();
        return;
      }

      // Reset de estado
      this.elementos = {};

      this.capturarElementos();
      this._conectarEventListenersGlobales();  // Una sola vez
      this._conectarEventListenersDOM();       // Cada vez

      this.llenarSelectoresTipos();
      this.llenarSelectorPeriodos();
      this.configurarFechas();
      this.refrescarTabla();

      this._inicializado = true;
      console.log('✅ Vista Documentos lista');
    } catch (error) {
      console.error('❌ Error en inicializar():', error);
      console.error('Stack:', error.stack);
    }
  },

  /**
   * Verifica si el hash actual corresponde a la vista de documentos
   */
  _estamosEnVista() {
    const hash = window.location.hash || '';
    return hash.includes('documentos');
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
      filtroPeriodo: document.getElementById('filtro-periodo'),
      docTipo: document.getElementById('doc-tipo'),
      docNumero: document.getElementById('doc-numero'),
      docFechaEmision: document.getElementById('doc-fecha-emision'),
      docMontoTotal: document.getElementById('doc-monto-total'),
      montoDetalle: document.getElementById('monto-detalle'),

      camposFactura: document.getElementById('campos-factura'),
      camposActivoFijo: document.getElementById('campos-activo-fijo'),
      docCodigoActivo: document.getElementById('doc-codigo-activo'),
      docCategoriaActivo: document.getElementById('doc-categoria-activo'),
      docDescripcionActivo: document.getElementById('doc-descripcion-activo'),
      docVidaUtil: document.getElementById('doc-vida-util'),
      docMetodoDepreciacion: document.getElementById('doc-metodo-depreciacion'),
      docCufFactura: document.getElementById('doc-cuf-factura'),
      docNitProveedorActivo: document.getElementById('doc-nit-proveedor-activo'),

      camposNomina: document.getElementById('campos-nomina'),
      docPeriodoNomina: document.getElementById('doc-periodo-nomina'),
      docFormaPagoNomina: document.getElementById('doc-forma-pago-nomina'),

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
  // LISTENERS GLOBALES (UNA SOLA VEZ)
  // ════════════════════════════════════════════════════════════

  /**
   * Listeners globales: hashchange + eventos del sistema.
   * Solo se registran una vez en el ciclo de vida de la página
   * usando marca global para evitar duplicados.
   */
  _conectarEventListenersGlobales() {
    if (window.__documentosListenersRegistrados) return;
    window.__documentosListenersRegistrados = true;

    // Re-inicializar al volver a la vista
    window.addEventListener('hashchange', () => {
      if (this._estamosEnVista()) {
        setTimeout(() => this.inicializar(), 50);
      }
    });

    // Eventos del sistema (solo si estamos en la vista)
    const eventos = [
      'erp:documento-registrado',
      'erp:documento-estado-cambiado',
      'erp:documento-eliminado',
      'erp:datos-ejemplo-cargados',
      'erp:datos-limpiados'
    ];

    eventos.forEach(evt => {
      window.addEventListener(evt, () => {
        if (this._estamosEnVista()) {
          this.refrescarTabla();
        }
      });
    });

    console.log('📄 [LISTENERS] Globales registrados (una sola vez)');
  },

  // ════════════════════════════════════════════════════════════
  // LISTENERS DEL DOM (CADA VEZ QUE SE INICIALIZA)
  // ════════════════════════════════════════════════════════════

  _conectarEventListenersDOM() {
    this.elementos.btnNuevo?.addEventListener('click', () => this.mostrarFormulario(true));
    this.elementos.filtroPeriodo?.addEventListener('change', () => this.refrescarTabla());
    this.elementos.filtroTipo?.addEventListener('change', () => this.refrescarTabla());
    this.elementos.filtroEstado?.addEventListener('change', () => this.refrescarTabla());

    this.elementos.btnCancelar?.addEventListener('click', () => {
      this.mostrarFormulario(false);
      this.limpiarFormulario();
    });

    this.elementos.btnRefrescar?.addEventListener('click', () => this.refrescarTabla());
    this.elementos.btnLimpiar?.addEventListener('click', () => this.limpiarFormulario());

    this.elementos.docTipo?.addEventListener('change', () => this.manejarCambioTipo());
    this.elementos.docMontoTotal?.addEventListener('input', () => this.manejarCambioMonto());
    this.elementos.docCuf?.addEventListener('input', () => this.manejarCambioCUF());
    this.elementos.docNit?.addEventListener('input', () => this.manejarCambioNIT());

    this.elementos.form?.addEventListener('submit', (e) => this.manejarSubmit(e));

    this.elementos.docFacturaOrigen?.addEventListener('change', () => this.manejarCambioFacturaOrigen());

    // EVENT DELEGATION para botones de acción (✓ ✗ 🗑️ 👁️)
    // Sobrevive a re-renders de la tabla
    if (this.elementos.tablaBody) {
      this.elementos.tablaBody.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-accion]');
        if (btn) this.manejarAccionDocumento({ currentTarget: btn });
      });
    }
  },

  // ════════════════════════════════════════════════════════════
  // CONFIGURACIÓN INICIAL
  // ════════════════════════════════════════════════════════════

  llenarSelectoresTipos() {
    const tipos = window.TiposDocumentoUtilidades.listarTipos();

    if (this.elementos.docTipo) {
      tipos.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo.codigo;
        option.textContent = `${tipo.icono} ${tipo.nombre}`;
        this.elementos.docTipo.appendChild(option);
      });
    }

    if (this.elementos.filtroTipo) {
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
    }
  },

  configurarFechas() {
    if (this.elementos.docFechaEmision) {
      this.elementos.docFechaEmision.max = window.utilidades.fechaActualCorta();
    }
  },

  // ════════════════════════════════════════════════════════════
  // FORMULARIO: Mostrar / Ocultar / Limpiar
  // ════════════════════════════════════════════════════════════

  mostrarFormulario(visible) {
    if (!this.elementos.formulario) return;

    if (visible) {
      this.elementos.formulario.classList.remove('oculto');
      this.elementos.btnNuevo?.classList.add('oculto');
      this.elementos.btnCancelar?.classList.remove('oculto');
      this.elementos.docTipo?.focus();
    } else {
      this.elementos.formulario.classList.add('oculto');
      this.elementos.btnNuevo?.classList.remove('oculto');
      this.elementos.btnCancelar?.classList.add('oculto');
    }
  },

  limpiarFormulario() {
    this.elementos.form?.reset();
    this.elementos.camposFactura?.classList.add('oculto');
    this.elementos.camposTesoreria?.classList.add('oculto');
    this.elementos.camposNota?.classList.add('oculto');
    this.elementos.camposActivoFijo?.classList.add('oculto');
    this.elementos.camposNomina?.classList.add('oculto');
    this.elementos.camposExtracto?.classList.add('oculto');

    if (this.elementos.montoDetalle) {
      this.elementos.montoDetalle.textContent = 'Neto: Bs 0,00 | IVA: Bs 0,00';
    }
    if (this.elementos.cufContador) this.elementos.cufContador.textContent = '0';
    if (this.elementos.cufValidacion) {
      this.elementos.cufValidacion.textContent = 'Pendiente';
      this.elementos.cufValidacion.style.color = '';
    }
    if (this.elementos.nitValidacion) {
      this.elementos.nitValidacion.textContent = 'Ingrese el NIT con guión verificador';
      this.elementos.nitValidacion.style.color = '';
    }
    if (this.elementos.formTipoBadge) {
      this.elementos.formTipoBadge.textContent = 'Seleccionar tipo';
      this.elementos.formTipoBadge.className = 'badge badge-info';
    }
  },

  // ════════════════════════════════════════════════════════════
  // CAMPOS DINÁMICOS SEGÚN TIPO DE DOCUMENTO
  // ════════════════════════════════════════════════════════════

  manejarCambioTipo() {
    if (!this.elementos.docTipo) return;
    const tipo = this.elementos.docTipo.value;

    // Ocultar TODAS las secciones específicas
    ['camposFactura', 'camposTesoreria', 'camposNota',
     'camposActivoFijo', 'camposNomina', 'camposExtracto'].forEach(s => {
      this.elementos[s]?.classList.add('oculto');
    });

    if (!tipo) {
      if (this.elementos.formTipoBadge) {
        this.elementos.formTipoBadge.textContent = 'Seleccionar tipo';
        this.elementos.formTipoBadge.className = 'badge badge-info';
      }
      return;
    }

    const configTipo = window.TiposDocumentoUtilidades.obtenerTipo(tipo);
    if (!configTipo) return;

    if (this.elementos.formTipoBadge) {
      this.elementos.formTipoBadge.textContent = configTipo.nombre;
      this.elementos.formTipoBadge.className = 'badge badge-info';
    }

    const esNota = tipo.includes('NOTA_CREDITO') || tipo.includes('NOTA_DEBITO');

    if (esNota) {
      this.elementos.camposNota?.classList.remove('oculto');
      this.cargarFacturasOrigen(tipo);
    }

    if (tipo === 'ACTA_COMPRA_ACTIVO') {
      this.elementos.camposActivoFijo?.classList.remove('oculto');
    }

    if (tipo === 'COMPROBANTE_NOMINA') {
      this.elementos.camposNomina?.classList.remove('oculto');
      const hoy = new Date();
      const periodoActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
      if (this.elementos.docPeriodoNomina) this.elementos.docPeriodoNomina.value = periodoActual;
    }

    if (tipo === 'EXTRACTO_BANCARIO') {
      this.elementos.camposExtracto?.classList.remove('oculto');
    }

    if (configTipo.requiereCUF || configTipo.requiereNIT) {
      this.elementos.camposFactura?.classList.remove('oculto');
      if (this.elementos.labelNit) {
        if (configTipo.origen === 'PROVEEDOR') {
          this.elementos.labelNit.textContent = 'NIT del Proveedor';
        } else if (configTipo.origen === 'EMPRESA') {
          this.elementos.labelNit.textContent = 'NIT del Cliente';
        } else {
          this.elementos.labelNit.textContent = 'NIT';
        }
      }
    }

    if (tipo === 'RECIBO_CAJA' || tipo === 'COMPROBANTE_EGRESO') {
      this.elementos.camposTesoreria?.classList.remove('oculto');
      if (this.elementos.labelPersona) {
        this.elementos.labelPersona.textContent = tipo === 'RECIBO_CAJA' ? 'Recibido de' : 'Pagado a';
      }
    }
  },

  // ════════════════════════════════════════════════════════════
  // FACTURAS ORIGEN (para notas crédito/débito)
  // ════════════════════════════════════════════════════════════

  cargarFacturasOrigen(tipoNota) {
    const select = this.elementos.docFacturaOrigen;
    if (!select) return;
    select.innerHTML = '<option value="">-- Seleccionar factura origen --</option>';

    let tiposFactura = [];
    if (tipoNota === 'NOTA_CREDITO_RECIBIDA' || tipoNota === 'NOTA_DEBITO_RECIBIDA') {
      tiposFactura = ['FACTURA_COMPRA'];
    } else if (tipoNota === 'NOTA_CREDITO_EMITIDA' || tipoNota === 'NOTA_DEBITO_EMITIDA') {
      tiposFactura = ['FACTURA_VENTA'];
    }

    const todasFacturas = [];
    tiposFactura.forEach(tipoFactura => {
      const validadas = window.capaDocumentos.obtenerDocumentos({
        tipo: tipoFactura, estado: 'VALIDADO'
      });
      todasFacturas.push(...validadas);

      const procesadas = window.capaDocumentos.obtenerDocumentos({
        tipo: tipoFactura, estado: 'PROCESADO'
      });
      todasFacturas.push(...procesadas);
    });

    if (todasFacturas.length === 0) {
      select.innerHTML += '<option value="" disabled>⚠️ No hay facturas validadas disponibles</option>';
      return;
    }

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
    if (!select) return;
    const option = select.options[select.selectedIndex];
    if (!option || !option.value) return;

    if (this.elementos.docNumero) this.elementos.docNumero.value = `NC-${option.dataset.numero}`;
    if (this.elementos.docMontoTotal) this.elementos.docMontoTotal.value = option.dataset.monto;
    if (this.elementos.docNit) this.elementos.docNit.value = option.dataset.nit;
    if (this.elementos.docRazonSocial) this.elementos.docRazonSocial.value = option.dataset.razonSocial;
    if (this.elementos.docCuf) this.elementos.docCuf.value = '';

    this.manejarCambioMonto();
    this.manejarCambioNIT();
  },

  // ════════════════════════════════════════════════════════════
  // VALIDACIONES EN TIEMPO REAL
  // ════════════════════════════════════════════════════════════

  manejarCambioMonto() {
    if (!this.elementos.docMontoTotal) return;
    const montoTotal = parseFloat(this.elementos.docMontoTotal.value) || 0;
    const tipo = this.elementos.docTipo?.value || '';

    if (montoTotal <= 0) {
      if (this.elementos.montoDetalle) {
        this.elementos.montoDetalle.textContent = 'Neto: Bs 0,00 | IVA: Bs 0,00';
      }
      return;
    }

    const neto = window.utilidades.extraerNetoDeTotal(montoTotal);
    const iva = window.utilidades.calcularIVADeTotal(montoTotal);
    let detalle = `Neto: ${window.utilidades.formatearBs(neto)} | IVA: ${window.utilidades.formatearBs(iva)}`;

    if (tipo === 'FACTURA_VENTA' || tipo === 'NOTA_CREDITO_EMITIDA' || tipo === 'NOTA_DEBITO_EMITIDA') {
      const it = window.utilidades.calcularIT(montoTotal);
      detalle += ` | IT: ${window.utilidades.formatearBs(it)}`;
    }

    if (this.elementos.montoDetalle) this.elementos.montoDetalle.textContent = detalle;
  },

  manejarCambioCUF() {
    if (!this.elementos.docCuf) return;
    const cuf = this.elementos.docCuf.value.toUpperCase();
    this.elementos.docCuf.value = cuf;
    if (this.elementos.cufContador) this.elementos.cufContador.textContent = cuf.length;

    if (cuf.length === 0) {
      if (this.elementos.cufValidacion) {
        this.elementos.cufValidacion.textContent = 'Pendiente';
        this.elementos.cufValidacion.style.color = '';
      }
    } else if (cuf.length !== 43) {
      if (this.elementos.cufValidacion) {
        this.elementos.cufValidacion.textContent = `Faltan ${43 - cuf.length} caracteres`;
        this.elementos.cufValidacion.style.color = 'var(--color-alerta)';
      }
    } else {
      const validacion = window.validadores.validarCUF(cuf);
      if (this.elementos.cufValidacion) {
        if (validacion.valido) {
          this.elementos.cufValidacion.textContent = '✓ Válido';
          this.elementos.cufValidacion.style.color = 'var(--color-exito)';
        } else {
          this.elementos.cufValidacion.textContent = '✗ Inválido';
          this.elementos.cufValidacion.style.color = 'var(--color-error)';
        }
      }
    }
  },

  manejarCambioNIT() {
    if (!this.elementos.docNit) return;
    const nit = this.elementos.docNit.value;

    if (!nit) {
      if (this.elementos.nitValidacion) {
        this.elementos.nitValidacion.textContent = 'Ingrese el NIT con guión verificador';
        this.elementos.nitValidacion.style.color = '';
      }
      return;
    }

    const validacion = window.validadores.validarNIT(nit);
    if (this.elementos.nitValidacion) {
      if (validacion.valido) {
        this.elementos.nitValidacion.textContent = '✓ NIT válido';
        this.elementos.nitValidacion.style.color = 'var(--color-exito)';
      } else {
        this.elementos.nitValidacion.textContent = validacion.errores[0] || '✗ NIT inválido';
        this.elementos.nitValidacion.style.color = 'var(--color-error)';
      }
    }
  },

  // ════════════════════════════════════════════════════════════
  // SUBMIT DEL FORMULARIO
  // ════════════════════════════════════════════════════════════

  manejarSubmit(evento) {
    evento.preventDefault();

    const tipo = this.elementos.docTipo?.value;
    if (!tipo) {
      this.mostrarToast('Debe seleccionar un tipo de documento', 'error');
      return;
    }

    const documento = {
      tipo: tipo,
      numero: this.elementos.docNumero?.value.trim() || '',
      fechaEmision: this.elementos.docFechaEmision?.value,
      montoTotal: parseFloat(this.elementos.docMontoTotal?.value) || 0,
      observaciones: this.elementos.docObservaciones?.value.trim() || ''
    };

    if (!this.elementos.camposFactura?.classList.contains('oculto')) {
      documento.nitProveedor = this.elementos.docNit?.value.trim();
      documento.nitCliente = this.elementos.docNit?.value.trim();
      documento.razonSocialProveedor = this.elementos.docRazonSocial?.value.trim();
      documento.razonSocialCliente = this.elementos.docRazonSocial?.value.trim();
      documento.cuf = this.elementos.docCuf?.value.trim();
    }

    if (!this.elementos.camposTesoreria?.classList.contains('oculto')) {
      documento.recibidoDe = this.elementos.docPersona?.value.trim();
      documento.pagadoA = this.elementos.docPersona?.value.trim();
      documento.concepto = this.elementos.docConcepto?.value.trim();
      documento.formaPago = this.elementos.docFormaPago?.value;
      documento.cuentaBancaria = this.elementos.docCuentaBancaria?.value.trim();
    }

    if (!this.elementos.camposNota?.classList.contains('oculto')) {
      const facturaOrigenId = this.elementos.docFacturaOrigen?.value;
      const option = this.elementos.docFacturaOrigen?.options[this.elementos.docFacturaOrigen.selectedIndex];
      documento.facturaOrigenId = facturaOrigenId;
      documento.facturaOrigenNumero = option ? option.dataset.numero : '';
      documento.motivo = this.elementos.docMotivoNota?.value.trim();
    }

    if (this.elementos.btnRegistrar) {
      this.elementos.btnRegistrar.disabled = true;
      this.elementos.btnRegistrar.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px;"></span> Registrando...';
    }

    try {
      if (!this.elementos.camposActivoFijo?.classList.contains('oculto')) {
        documento.codigoActivo = this.elementos.docCodigoActivo?.value.trim();
        documento.categoriaActivo = this.elementos.docCategoriaActivo?.value;
        documento.descripcionActivo = this.elementos.docDescripcionActivo?.value.trim();
        documento.vidaUtilMeses = parseInt(this.elementos.docVidaUtil?.value, 10) || 0;
        documento.metodoDepreciacion = this.elementos.docMetodoDepreciacion?.value;
        documento.cufFactura = this.elementos.docCufFactura?.value.trim();
        documento.nitProveedor = this.elementos.docNitProveedorActivo?.value.trim();
        documento.razonSocialProveedor = 'Proveedor del activo';
      }

      if (!this.elementos.camposNomina?.classList.contains('oculto')) {
        documento.periodoNomina = this.elementos.docPeriodoNomina?.value;
        documento.formaPago = this.elementos.docFormaPagoNomina?.value;
        documento.empleados = [];
      }

      if (!this.elementos.camposExtracto?.classList.contains('oculto')) {
        documento.banco = this.elementos.docBanco?.value;
        documento.cuentaBancaria = this.elementos.docCuentaBancariaExt?.value.trim();
        documento.tipoMovimiento = this.elementos.docTipoMovimiento?.value;
        documento.concepto = this.elementos.docConceptoExt?.value.trim();
      }

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
      if (this.elementos.btnRegistrar) {
        this.elementos.btnRegistrar.disabled = false;
        this.elementos.btnRegistrar.innerHTML = '✅ Registrar Documento';
      }
    }
  },

  // ════════════════════════════════════════════════════════════
  // TABLA DE DOCUMENTOS
  // ════════════════════════════════════════════════════════════

  refrescarTabla() {
    // ═══════════════════════════════════════════════════════════
    // FIX CRÍTICO: Re-instanciar capaDocumentos para evitar cache obsoleto
    // La Capa 1 cachea documentos en memoria al instanciarse.
    // Si los datos se cargaron DESPUÉS, siguen viendo el array vacío.
    // Re-instanciar los obliga a leer localStorage nuevamente.
    // ═══════════════════════════════════════════════════════════
    try {
      if (typeof CapaDocumentos === 'function' && window.almacenamiento) {
        window.capaDocumentos = new CapaDocumentos(window.almacenamiento);
      }
    } catch (e) {
      console.warn('⚠️ No se pudo re-instanciar capaDocumentos:', e.message);
    }

    if (!this.elementos.tablaBody) {
      console.warn('⚠️ refrescarTabla: tablaBody no disponible');
      return;
    }

    const filtros = {
      periodoContable: this.elementos.filtroPeriodo?.value || undefined,
      tipo: this.elementos.filtroTipo?.value || undefined,
      estado: this.elementos.filtroEstado?.value || undefined
    };

    const documentos = window.capaDocumentos.obtenerDocumentos(filtros);
    const conteos = window.capaDocumentos.contarDocumentos();

    console.log(`📊 refrescarTabla documentos: ${documentos.length} documentos`);

    if (this.elementos.statsTotal) this.elementos.statsTotal.textContent = conteos.total;
    if (this.elementos.statsPendientes) this.elementos.statsPendientes.textContent = conteos.pendientes;
    if (this.elementos.statsValidados) this.elementos.statsValidados.textContent = conteos.validados;
    if (this.elementos.statsRechazados) this.elementos.statsRechazados.textContent = conteos.rechazados;

    if (this.elementos.tablaContador) {
      this.elementos.tablaContador.textContent = `${documentos.length} documento${documentos.length !== 1 ? 's' : ''}`;
    }

    if (documentos.length === 0) {
      this.elementos.tablaBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: var(--espacio-xl); color: var(--texto-secundario);">
            📭 No hay documentos que coincidan con los filtros.
          </td>
        </tr>
      `;
      return;
    }

    this.elementos.tablaBody.innerHTML = documentos.map(doc => this.renderizarFilaDocumento(doc)).join('');
    // NOTA: No agregamos listeners individuales aquí porque usamos event delegation
  },

  renderizarFilaDocumento(doc) {
    const tipoConfig = window.TiposDocumentoUtilidades.obtenerTipo(doc.tipo);
    const icono = tipoConfig ? tipoConfig.icono : '📄';
    const nombreTipo = tipoConfig ? tipoConfig.nombre : doc.tipo;

    const contraparte = doc.razonSocialProveedor || doc.razonSocialCliente ||
                        doc.recibidoDe || doc.pagadoA || '—';

    const badgeEstado = this.obtenerBadgeEstado(doc.estado);

    const periodoFormateado = doc.periodoContable
      ? window.PeriodosContables.formatearNombre(doc.periodoContable)
      : '—';

    const periodoAbierto = doc.periodoContable
      ? window.PeriodosContables.estaAbierto(doc.periodoContable)
      : false;

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
      case 'validar': {
        const r1 = window.capaDocumentos.cambiarEstado(id, 'VALIDADO', 'Validación manual desde UI');
        this.mostrarToast(r1.exito ? '✅ Documento validado' : `❌ ${r1.mensaje}`, r1.exito ? 'exito' : 'error');
        break;
      }
      case 'rechazar': {
        const motivo = prompt('Motivo del rechazo (opcional):');
        if (motivo === null) return;
        const r2 = window.capaDocumentos.cambiarEstado(id, 'RECHAZADO', motivo || 'Rechazado desde UI');
        this.mostrarToast(r2.exito ? '✗ Documento rechazado' : `❌ ${r2.mensaje}`, r2.exito ? 'alerta' : 'error');
        break;
      }
      case 'eliminar': {
        if (!confirm('¿Estás seguro de eliminar este documento? Esta acción no se puede deshacer.')) return;
        const r3 = window.capaDocumentos.eliminarDocumento(id);
        this.mostrarToast(r3.exito ? '🗑️ Documento eliminado' : `❌ ${r3.mensaje}`, r3.exito ? 'alerta' : 'error');
        break;
      }
      case 'ver':
        this.mostrarToast('👁️ Ver detalle (próximamente en Fase 1.5)', 'info');
        break;
    }
  },

  // ════════════════════════════════════════════════════════════
  // SELECTOR DE PERÍODOS
  // ════════════════════════════════════════════════════════════

  llenarSelectorPeriodos() {
    const select = this.elementos.filtroPeriodo;
    if (!select) return;

    const periodos = window.PeriodosContables.obtenerUltimosMeses(12);
    select.innerHTML = '<option value="">Todos los períodos</option>';

    periodos.forEach(periodo => {
      const option = document.createElement('option');
      option.value = periodo;
      const estaAbierto = window.PeriodosContables.estaAbierto(periodo);
      const nombreLegible = window.PeriodosContables.formatearNombre(periodo);
      option.textContent = estaAbierto
        ? `📅 ${nombreLegible}`
        : `🔒 ${nombreLegible} (cerrado)`;
      select.appendChild(option);
    });

    const periodoActual = window.PeriodosContables.obtenerPeriodoActual();
    select.value = periodoActual;
  },

  // ════════════════════════════════════════════════════════════
  // TOASTS (notificaciones)
  // ════════════════════════════════════════════════════════════

  mostrarToast(mensaje, tipo = 'info') {
    if (!this.elementos.contenedorToasts) return;
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
try {
  DocumentosVista.inicializar();
} catch (error) {
  console.error('❌ Error al inicializar DocumentosVista:', error);
}