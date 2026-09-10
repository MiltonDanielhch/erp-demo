// ══════════════════════════════════════════════════════════════
// app.js — ERP Contable Bolivia
// Punto de entrada del sistema
// Conecta: Enrutador + Almacenamiento + Utilidades + Validadores
//          + Capa 1 (Documentos) + Configuración boliviana
// ══════════════════════════════════════════════════════════════

/**
 * ERP Contable Bolivia — Prototipo Educativo
 *
 * Este archivo:
 * 1. Verifica que todas las dependencias estén cargadas.
 * 2. Instancia los módulos del núcleo y las capas.
 * 3. Configura el enrutador con todas las rutas.
 * 4. Expone las funciones al objeto window (para las vistas).
 * 5. Arranca el sistema.
 *
 * Los módulos del núcleo se cargan ANTES que este archivo
 * (mediante <script> tags en index.html).
 */

// ──────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE RUTAS
// ──────────────────────────────────────────────────────────────
const RUTAS_ERP = {
  // Principal
  'dashboard': 'vistas/dashboard.html',

  // Capa 1: Documentos
  'documentos': 'vistas/documentos.html',

  'catalogos': 'vistas/catalogos.html',

  // Capa 2: Módulos Operativos
  'compras': 'vistas/compras.html',
  'ventas': 'vistas/ventas.html',
  'inventario': 'vistas/inventario.html',
  'empleados': 'vistas/empleados.html',       // ← NUEVO Fase 4.2
  'bono-antiguedad': 'vistas/bono-antiguedad.html',
  'rc-iva': 'vistas/rc-iva.html',
  'nomina': 'vistas/nomina.html',
  'impuestos': 'vistas/impuestos.html',

  // Capa 3: Motor Contable
  'libro-diario': 'vistas/libro-diario.html',
  'libro-mayor': 'vistas/libro-mayor.html',
  'balanza': 'vistas/balanza.html',
  'lcv': 'vistas/lcv.html',
  // Capa 4: Estados Financieros
  'estados-financieros': 'vistas/estados-financieros.html',

  'asientos': 'vistas/asientos.html',

  // Capa 5: Cumplimiento
  'cumplimiento': 'vistas/cumplimiento.html'
};

// ──────────────────────────────────────────────────────────────
// INICIALIZACIÓN DEL SISTEMA
// ──────────────────────────────────────────────────────────────
function iniciarERP() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🇧🇴 ERP Contable Bolivia — Iniciando...');
  console.log('Versión: 0.10.0 (Módulo 2: Fase 2.2)');
  console.log('Stack: Vanilla JS + LocalStorage');
  console.log('Normativa: NC del CTNAC, Ley 843, LGT');
  console.log('═══════════════════════════════════════════════════════');

  // ── 1. Verificar dependencias críticas ──────────────────────
  if (typeof BOLIVIA === 'undefined') {
    console.error('❌ BOLIVIA no está cargado. Verifica js/config/bolivia.js');
    return;
  }

  if (typeof PLAN_CUENTAS === 'undefined') {
    console.error('❌ PLAN_CUENTAS no está cargado. Verifica js/config/plan-cuentas.js');
    return;
  }

  if (typeof TIPOS_DOCUMENTO === 'undefined') {
    console.error('❌ TIPOS_DOCUMENTO no está cargado. Verifica js/config/tipos-documentos.js');
    return;
  }

  if (typeof CAMPOS_DOCUMENTO === 'undefined') {
    console.error('❌ CAMPOS_DOCUMENTO no está cargado. Verifica js/config/campos-documentos.js');
    return;
  }

  // ── 2. Instanciar módulos del núcleo ────────────────────────
  const almacenamiento = new AlmacenamientoLocal('erp_bolivia');
  console.log('💾 Almacenamiento inicializado (localStorage).');

  // ── 3. Instanciar capas ─────────────────────────────────────

  // Capa 1: Documentos Fuente (Fase 1.3)
  // Se le pasa 'almacenamiento' como dependencia (inyección)
  const capaDocumentos = new CapaDocumentos(almacenamiento);
  console.log('📄 Capa 1 (Documentos Fuente) inicializada.');

  // Capa 3: Motor Contable (implementación completa)
  const motorContable = new MotorContable({
    almacenamiento: almacenamiento,
    capaDocumentos: capaDocumentos,
    planCuentas: PlanCuentasUtilidades
  });
  console.log('⚙️ Motor Contable (Capa 3) inicializado.');

  // ── 4. Configurar el Enrutador ──────────────────────────────
  const enrutador = new Enrutador({
    rutas: RUTAS_ERP,
    contenedorId: 'contenido',
    vistaPorDefecto: 'dashboard'
  });

  // ── 5. Exponer módulos al objeto window ─────────────────────
  // Objeto principal ERP (para acceso estructurado)
  window.ERP = {
    enrutador,
    almacenamiento,
    motorContable,
    capaDocumentos,
    utilidades: Utilidades,
    validadores: Validadores,
    bolivia: BOLIVIA,
    planCuentas: PLAN_CUENTAS,
    planCuentasUtilidades: PlanCuentasUtilidades,
    tiposDocumento: TIPOS_DOCUMENTO,
    estadosDocumento: ESTADOS_DOCUMENTO,
    tiposDocumentoUtilidades: TiposDocumentoUtilidades,
    camposDocumento: CAMPOS_DOCUMENTO,
    camposDocumentoUtilidades: CamposDocumentoUtilidades,
    version: '0.9.0',
    normativa: 'NC del CTNAC, Ley 843, LGT'
  };

  // Acceso directo en consola (atajos para desarrollo)
  window.utilidades = Utilidades;
  window.validadores = Validadores;
  window.almacenamiento = almacenamiento;
  window.motorContable = motorContable;
  window.capaDocumentos = capaDocumentos;  // ← NUEVO Fase 1.3
  window.BOLIVIA = BOLIVIA;
  window.PLAN_CUENTAS = PLAN_CUENTAS;
  window.PlanCuentasUtilidades = PlanCuentasUtilidades;
  window.TIPOS_DOCUMENTO = TIPOS_DOCUMENTO;
  window.ESTADOS_DOCUMENTO = ESTADOS_DOCUMENTO;
  window.TiposDocumentoUtilidades = TiposDocumentoUtilidades;
  window.CAMPOS_DOCUMENTO = CAMPOS_DOCUMENTO;
  window.CamposDocumentoUtilidades = CamposDocumentoUtilidades;

  // ── NUEVO: Inicializar gestor de períodos contables ─────────
  PeriodosContables.inicializar();
  console.log('📅 Gestor de períodos contables inicializado.');

  // ── Instanciar catálogos maestros ────────────────────────────
  const catalogoClientes = new CatalogoClientes();
  const catalogoProveedores = new CatalogoProveedores();
  const catalogoProductos = new CatalogoProductos();
  console.log('👥 Catálogos maestros inicializados (Clientes, Proveedores, Productos).');

  // ── NUEVO Fase 4.2: Instanciar Catálogo de Empleados ─────────
  const catalogoEmpleados = new CatalogoEmpleados({
    almacenamiento: almacenamiento
  });
  console.log('👷 Catálogo de Empleados inicializado (RRHH).');

   // ── NUEVO Fase 4.3: Instanciar Módulo de Nómina ──────────────
  const moduloNomina = new ModuloNomina({
    almacenamiento: almacenamiento,
    catalogoEmpleados: catalogoEmpleados
  });
  console.log('💼 Módulo de Nómina inicializado (Módulo 4).');

  // ── NUEVO Fase 4.4: Instanciar Módulo de Provisiones ─────────
  const moduloProvisiones = new ModuloProvisiones({
    almacenamiento: almacenamiento,
    catalogoEmpleados: catalogoEmpleados,
    moduloNomina: moduloNomina,
    motorContable: motorContable
  });
  console.log('🎄 Módulo de Provisiones inicializado (aguinaldo).');

  // ── NUEVO Fase 4.5: Instanciar Módulo de Bono de Antigüedad ──
  const moduloBonoAntiguedad = new ModuloBonoAntiguedad({
    almacenamiento: almacenamiento,
    catalogoEmpleados: catalogoEmpleados,
    motorContable: motorContable
  });
  console.log('🎖️ Módulo de Bono de Antigüedad inicializado.');

  // ── NUEVO Fase 4.6: Instanciar Módulo de Liquidaciones ───────
  const moduloLiquidaciones = new ModuloLiquidaciones({
    almacenamiento: almacenamiento,
    catalogoEmpleados: catalogoEmpleados,
    moduloNomina: moduloNomina,
    motorContable: motorContable
  });
  console.log('⚖️ Módulo de Liquidaciones inicializado.');

  // ── NUEVO Fase 4.7: Instanciar Módulo de RC-IVA ──────────────
  const moduloRCIVA = new ModuloRCIVA({
    almacenamiento: almacenamiento,
    catalogoEmpleados: catalogoEmpleados
  });
  console.log('🧾 Módulo de RC-IVA inicializado.');

  // ── NUEVO Fase 5.2: Instanciar Períodos Fiscales ─────────────
  const periodosFiscales = new PeriodosFiscales({
    almacenamiento: almacenamiento
  });
  console.log('📅 Períodos Fiscales inicializado (Módulo 5).');

    // ── NUEVO Fase 5.3: Instanciar Módulo de Impuestos ───────────
  const moduloImpuestos = new ModuloImpuestos({
    almacenamiento: almacenamiento,
    capaDocumentos: capaDocumentos,
    periodosFiscales: periodosFiscales
  });
  console.log('🧾 Módulo de Impuestos inicializado (Módulo 5).');

  // ── NUEVO Fase 6.2: Instanciar Capa 4 (Estados Financieros) ──
  const capaEstadosFinancieros = new CapaEstadosFinancieros({
    motorContable: motorContable,
    almacenamiento: almacenamiento,
    periodosFiscales: periodosFiscales,
    moduloImpuestos: moduloImpuestos
  });
  console.log('📊 Capa 4: Estados Financieros inicializada.');

  // ── NUEVO Fase 4.8: Instanciar Módulo de Asientos de Nómina ──
  const moduloAsientosNomina = new ModuloAsientosNomina({
    almacenamiento: almacenamiento,
    moduloNomina: moduloNomina,
    moduloProvisiones: moduloProvisiones,
    moduloBonoAntiguedad: moduloBonoAntiguedad,
    moduloLiquidaciones: moduloLiquidaciones,
    catalogoEmpleados: catalogoEmpleados,
    motorContable: motorContable
  });
  console.log('📒 Módulo de Asientos de Nómina inicializado.');

   // ── NUEVO: Instanciar Módulo de Compras ──────────────────────
  const moduloCompras = new ModuloCompras({
    almacenamiento: almacenamiento,
    capaDocumentos: capaDocumentos,
    catalogoProveedores: catalogoProveedores,
    catalogoProductos: catalogoProductos
  });
  console.log('🛒 Módulo de Compras inicializado.');

  // ── NUEVO: Inicializar Módulo de Ventas ────────────────
  const moduloVentas = new ModuloVentas(
    almacenamiento,
    new CapaDocumentos(almacenamiento),
    catalogoClientes,
    catalogoProductos
  );
  console.log('💼 Módulo de Ventas inicializado');

    // ── Instanciar Módulo de Inventario ──────────────────────────
  const moduloInventario = new ModuloInventario({
    almacenamiento: almacenamiento,
    catalogoProductos: catalogoProductos
  });
  console.log('📦 Módulo de Inventario (Kardex) inicializado.');

  // ── Instanciar Generador de Asientos Contables ───────────────
  const generadorAsientos = new GeneradorAsientos({
    almacenamiento: almacenamiento,
    planCuentas: PlanCuentasUtilidades
  });
  console.log('📒 Generador de Asientos Contables inicializado.');

  // ── Instanciar Libro de Compras y Ventas ─────────────────────
  const libroComprasVentas = new LibroComprasVentas({
    almacenamiento: almacenamiento,
    capaDocumentos: capaDocumentos
  });
  console.log('📋 Libro de Compras y Ventas inicializado.');

  // ── NUEVO: Cargar datos de ejemplo (pasando catálogos como parámetros) ──
  if (typeof cargarDatosEjemplo === 'function') {
    cargarDatosEjemplo({
      clientes: catalogoClientes,
      proveedores: catalogoProveedores,
      productos: catalogoProductos,
      almacenamiento: almacenamiento
    }).then(resultado => {
      if (resultado.cargado) {
        console.log('🎉 Datos de ejemplo cargados correctamente');
      }
    }).catch(error => {
      console.error('❌ Error en carga de datos:', error);
    });
  }

  // ── Exponer al objeto window ─────────────────────────────────
  window.CatalogoClientes = catalogoClientes;
  window.CatalogoProveedores = catalogoProveedores;
  window.CatalogoProductos = catalogoProductos;
  window.catalogoEmpleados = catalogoEmpleados;        // ← NUEVO Fase 4.2
  window.moduloNomina = moduloNomina;
  window.moduloProvisiones = moduloProvisiones;
  window.moduloBonoAntiguedad = moduloBonoAntiguedad;
  window.moduloLiquidaciones = moduloLiquidaciones;
  window.moduloLiquidaciones = moduloLiquidaciones;
  window.moduloRCIVA = moduloRCIVA;
  window.periodosFiscales = periodosFiscales;
  window.moduloImpuestos = moduloImpuestos;
  window.capaEstadosFinancieros = capaEstadosFinancieros;
  window.moduloAsientosNomina = moduloAsientosNomina;
  window.ESTADOS_CATALOGO = ESTADOS_CATALOGO;
  window.REGIMENES_TRIBUTARIOS = REGIMENES_TRIBUTARIOS;
  window.CONDICIONES_PAGO = CONDICIONES_PAGO;
  window.UNIDADES_MEDIDA = UNIDADES_MEDIDA;
  window.CATEGORIAS_PRODUCTO = CATEGORIAS_PRODUCTO;
  window.ERP.catalogoClientes = catalogoClientes;
  window.ERP.catalogoProveedores = catalogoProveedores;
  window.ERP.catalogoProductos = catalogoProductos;
  window.ERP.catalogoEmpleados = catalogoEmpleados;    // ← NUEVO Fase 4.2
  window.ERP.moduloNomina = moduloNomina;
  window.ERP.moduloProvisiones = moduloProvisiones;
  window.ERP.moduloBonoAntiguedad = moduloBonoAntiguedad;
  window.ERP.moduloLiquidaciones = moduloLiquidaciones;
  window.ERP.moduloRCIVA = moduloRCIVA;
  window.ERP.periodosFiscales = periodosFiscales;
  window.ERP.moduloImpuestos = moduloImpuestos;
  window.ERP.capaEstadosFinancieros = capaEstadosFinancieros;
  window.ERP.moduloAsientosNomina = moduloAsientosNomina;
  window.moduloCompras = moduloCompras;
  window.ERP.moduloCompras = moduloCompras;
  // ── Exponer al objeto window ─────────────────────────────────
  window.moduloInventario = moduloInventario;
  window.ERP.moduloInventario = moduloInventario;
  // ── Exponer al objeto window ─────────────────────────────────
  window.generadorAsientos = generadorAsientos;
  window.ERP.generadorAsientos = generadorAsientos;
  // ── Exponer al objeto window ─────────────────────────────────
  window.libroComprasVentas = libroComprasVentas;

  // En la sección donde expones los módulos (línea ~234)
  window.moduloVentas = moduloVentas;
  window.ERP.moduloVentas = moduloVentas;

  // ── Exponer al objeto window ─────────────────────────────────
  window.PeriodosContables = PeriodosContables;
  window.ERP.periodosContables = PeriodosContables;

  // ── 6. Iniciar el enrutador (carga la vista inicial) ────────
  enrutador.iniciar();

  // ── 7. Log de estado y comandos disponibles ─────────────────
  console.log('✅ Sistema iniciado correctamente.');
  console.log('');
  console.log('📝 Comandos disponibles en la consola:');
  console.log('');
  console.log('   📌 CONFIGURACIÓN BOLIVIANA:');
  console.log('   window.BOLIVIA.IVA_PORCENTAJE');
  console.log('   window.BOLIVIA.SMN_VIGENTE');
  console.log('   window.BOLIVIA.calcularFechaVencimiento("123456789-1", "2026-09")');
  console.log('   window.BOLIVIA.obtenerPorcentajeBonoAntiguedad(6)');
  console.log('');
  console.log('   📌 PLAN DE CUENTAS:');
  console.log('   window.PlanCuentasUtilidades.obtenerCuenta("1.1.01")');
  console.log('   window.PlanCuentasUtilidades.obtenerTodasLasCuentas()');
  console.log('   window.PlanCuentasUtilidades.obtenerCuentasPorNaturaleza("deudora")');
  console.log('');
  console.log('   📌 DOCUMENTOS (Capa 1):');
  console.log('   window.TiposDocumentoUtilidades.listarTipos()');
  console.log('   window.CamposDocumentoUtilidades.obtenerCamposRequeridos("FACTURA_COMPRA")');
  console.log('   window.capaDocumentos.obtenerDocumentos()');
  console.log('   window.capaDocumentos.registrarDocumento({...})');
  console.log('   window.capaDocumentos.contarDocumentos()');
  console.log('');
  console.log('   📌 PERÍODOS CONTABLES:');
  console.log('   window.PeriodosContables.obtenerAbiertos()');
  console.log('   window.PeriodosContables.cerrarPeriodo("2026-09", "motivo")');
  console.log('   window.PeriodosContables.abrirPeriodo("2026-09")');
  console.log('');
  console.log('');
  console.log('   📌 CATÁLOGOS:');
  console.log('   window.CatalogoClientes.obtenerTodos()');
  console.log('   window.CatalogoProveedores.buscarPorNIT("123456789-7")');
  console.log('   window.CatalogoProductos.obtenerStockBajo()');
  console.log('');
  console.log('   📌 COMPRAS:');
  console.log('   window.moduloCompras.solicitarCompra({...})');
  console.log('   window.moduloCompras.generarOrdenCompra(solicitudId, {...})');
  console.log('   window.moduloCompras.registrarRecepcion(ordenId, {...})');
  console.log('   window.moduloCompras.registrarFacturaProveedor(ordenId, {...})');
  console.log('   window.moduloCompras.registrarPago(cuentaId, {...})');
  console.log('   window.moduloCompras.obtenerCuentasPorPagar()');
  console.log('   window.moduloCompras.obtenerTotalPendiente()');
  console.log('');
  console.log('   📌 INVENTARIO:');
  console.log('   window.moduloInventario.registrarEntrada({...})');
  console.log('   window.moduloInventario.registrarSalida({...})');
  console.log('   window.moduloInventario.obtenerKardex({productoId})');
  console.log('   window.moduloInventario.obtenerValorInventario()');
  console.log('   window.moduloInventario.verificarStockBajo()');
  console.log('');
  console.log('   📌 CONTABILIDAD:');
  console.log('   window.generadorAsientos.obtenerAsientos()');
  console.log('   window.generadorAsientos.obtenerAsientosPendientes()');
  console.log('   window.generadorAsientos.obtenerResumenPorPeriodo("2026-09")');
  console.log('');
  console.log('   📌 LIBRO COMPRAS/VENTAS:');
  console.log('   window.libroComprasVentas.generarLCV("2026-09")');
  console.log('   window.libroComprasVentas.calcularIVAPorPagar("2026-09")');
  console.log('   window.libroComprasVentas.exportarCSV("2026-09")');
  console.log('');
  console.log('   📌 MOTOR CONTABLE (Capa 3):');
  console.log('   window.motorContable.procesarAsientosPendientes()');
  console.log('   window.motorContable.obtenerLibroMayor()');
  console.log('   window.motorContable.calcularBalanza("2026-09")');
  console.log('   window.motorContable.crearAsientoManual({...})');
  console.log('   window.motorContable.anularAsiento(id, motivo)');
  console.log('   window.motorContable.obtenerDiario({tipo, cuentaCodigo})');
  console.log('   window.motorContable.obtenerDiarioPorPeriodo("2026-09")');
  console.log('   window.motorContable.obtenerDiarioPorDocumento(docId)');
  console.log('   window.motorContable.obtenerMayorPorCuenta("1.1.06")');
  console.log('   window.motorContable.obtenerMovimientosDeCuenta("1.1.06", "2026-09")');
  console.log('   window.motorContable.obtenerSaldosDeCuentas("2026-09")');
  console.log('   window.motorContable.calcularSaldoInicial("1.1.06", "2026-09")');
  console.log('   window.motorContable.verificarCuadratura(totales)');
  console.log('   window.motorContable.detectarErroresComunes("2026-09")');
  console.log('   window.motorContable.cerrarEjercicio("2026-09")');
  console.log('   window.motorContable.simularCierreEjercicio("2026-09")');
  console.log('');
  console.log('   📌 EMPLEADOS (RRHH — Módulo 4):');
  console.log('   window.catalogoEmpleados.obtenerActivos()');
  console.log('   window.catalogoEmpleados.crear({ci, nombres, apellidos, salarioBase, fechaIngreso})');
  console.log('   window.catalogoEmpleados.retirar(id, "RENUNCIA")');
  console.log('   window.catalogoEmpleados.contar()');
  console.log('   window.TablaBonoAntiguedad.calcularBono(6)');
  console.log('   window.TablaBonoAntiguedad.obtenerTablaConMontos()');
  console.log('');
  console.log('   📌 NÓMINA (Módulo 4):');
  console.log('   window.moduloNomina.calcularNominaMensual("2026-09")');
  console.log('   window.moduloNomina.calcularDevengados(empleado, extras)');
  console.log('   window.moduloNomina.calcularDeducciones(empleado, devengado, facturas)');
  console.log('   window.moduloNomina.calcularAportesPatronales(empleado, devengado)');
  console.log('   window.moduloNomina.generarPlanillaResumen("2026-09", datosExtras)');
  console.log('   window.moduloNomina.obtenerPlanillas()');
  console.log('   📌 PROVISIONES (Módulo 4 — Aguinaldo):');
  console.log('   window.moduloProvisiones.calcularAguinaldoNavidad(empleado, "2026-12")');
  console.log('   window.moduloProvisiones.generarAsientoProvisionMensual("2026-09")');
  console.log('   window.moduloProvisiones.toggleSegundoAguinaldo(true)');
  console.log('   window.moduloProvisiones.obtenerConfigSegundoAguinaldo()');
  console.log('   window.moduloProvisiones.obtenerProvisionesAcumuladas()');
  console.log('   window.moduloProvisiones.pagarAguinaldo("2026-12")');
  console.log('   📌 BONO DE ANTIGÜEDAD (Módulo 4):');
  console.log('   window.moduloBonoAntiguedad.calcularBonosTodos()');
  console.log('   window.moduloBonoAntiguedad.generarAsientoProvisionMensual("2026-09")');
  console.log('   window.moduloBonoAntiguedad.actualizarSMN(2750, "DS 5012")');
  console.log('   window.moduloBonoAntiguedad.obtenerHistorialSMN()');
  console.log('   window.moduloBonoAntiguedad.obtenerProvisionAcumulada()');
  console.log('   📌 LIQUIDACIONES (Módulo 4 — Indemnización):');
  console.log('   window.moduloLiquidaciones.calcularIndemnizacion(empleado)');
  console.log('   window.moduloLiquidaciones.calcularDesahucio(empleado, false)');
  console.log('   window.moduloLiquidaciones.calcularLiquidacion(empleado, "RENUNCIA")');
  console.log('   window.moduloLiquidaciones.registrarRetiro(empleadoId, "DESPIDO", {tienePreaviso: false})');
  console.log('   window.moduloLiquidaciones.generarAsientoProvisionMensual("2026-09")');
  console.log('   📌 RC-IVA (Módulo 4 — Facturas):');
  console.log('   window.moduloRCIVA.registrarFactura({empleadoId, numeroFactura, nitEmisor, cuf, monto, fecha})');
  console.log('   window.moduloRCIVA.obtenerFacturasPorEmpleado(empleadoId, "2026-09")');
  console.log('   window.moduloRCIVA.calcularRCIVAPagar(empleadoId, totalDevengado, "2026-09")');
  console.log('   window.moduloRCIVA.obtenerResumenPeriodo("2026-09")');
  console.log('   📌 ASIENTOS DE NÓMINA (Módulo 4):');
  console.log('   window.moduloAsientosNomina.generarAsientosMensuales("2026-09")');
  console.log('   window.moduloAsientosNomina.generarAsientoPagoNomina("2026-09")');
  console.log('   window.moduloAsientosNomina.generarAsientoPagoAportesPatronales("2026-09")');
  console.log('');
  console.log('   📌 PERÍODOS FISCALES (Módulo 5):');
  console.log('   window.periodosFiscales.crearPeriodo("2026-09")');
  console.log('   window.periodosFiscales.obtenerPeriodo("2026-09")');
  console.log('   window.periodosFiscales.obtenerPeriodosAbiertos()');
  console.log('   window.periodosFiscales.calcularFechaVencimiento("123456789-5", "2026-09")');
  console.log('   window.periodosFiscales.obtenerObligacionesPendientes()');
  console.log('   window.periodosFiscales.generarAlertasVencimiento(7)');
  console.log('   window.periodosFiscales.generarPeriodosAnio(2026)');
  console.log('');
  console.log('   📌 IMPUESTOS (Módulo 5):');
  console.log('   window.moduloImpuestos.calcularIVADebito("2026-09")');
  console.log('   window.moduloImpuestos.calcularIVACredito("2026-09")');
  console.log('   window.moduloImpuestos.conciliarIVA("2026-09")');
  console.log('   window.moduloImpuestos.generarFormulario200("2026-09")');
  console.log('   window.moduloImpuestos.obtenerSaldoIVAFavor()');
  console.log('');
  console.log('   📌 ESTADOS FINANCIEROS (Módulo 6 - Capa 4):');
  console.log('   window.capaEstadosFinancieros.generarEstadoResultados("2026")');
  console.log('   window.capaEstadosFinancieros.generarEstadoResultados("2026-09")');
  console.log('   window.capaEstadosFinancieros.compararPeriodos("2026-08", "2026-09")');
  console.log('   window.capaEstadosFinancieros.calcularVariacion(1000, 1500)');
}

// ──────────────────────────────────────────────────────────────
// ARRANQUE: Esperar a que el DOM esté listo
// ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', iniciarERP);
