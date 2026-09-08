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
  window.ESTADOS_CATALOGO = ESTADOS_CATALOGO;
  window.REGIMENES_TRIBUTARIOS = REGIMENES_TRIBUTARIOS;
  window.CONDICIONES_PAGO = CONDICIONES_PAGO;
  window.UNIDADES_MEDIDA = UNIDADES_MEDIDA;
  window.CATEGORIAS_PRODUCTO = CATEGORIAS_PRODUCTO;
  window.ERP.catalogoClientes = catalogoClientes;
  window.ERP.catalogoProveedores = catalogoProveedores;
  window.ERP.catalogoProductos = catalogoProductos;
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
  console.log('   window.motorContable.calcularBalanzaComprobacion()');
  console.log('   window.motorContable.crearAsientoManual({...})');
  console.log('   window.motorContable.anularAsiento(id, motivo)');
  console.log('   📌 MOTOR CONTABLE:');
  console.log('   window.motorContable.procesarAsientosPendientes()');
  console.log('   window.motorContable.obtenerLibroMayor()');
  console.log('   window.motorContable.calcularBalanzaComprobacion()');
  console.log('   window.motorContable.crearAsientoManual({...})');
  console.log('   window.motorContable.anularAsiento(id, motivo)');
  console.log('   window.motorContable.obtenerDiario({tipo, cuentaCodigo})');
  console.log('   window.motorContable.obtenerDiarioPorPeriodo("2026-09")');
  console.log('   window.motorContable.obtenerDiarioPorDocumento(docId)');

  console.log('   window.motorContable.obtenerMayorPorCuenta("1.1.06")');
  console.log('   window.motorContable.obtenerMovimientosDeCuenta("1.1.06", "2026-09")');
  console.log('   window.motorContable.obtenerSaldosDeCuentas("2026-09")');
  console.log('   window.motorContable.calcularSaldoInicial("1.1.06", "2026-09")');

  console.log('   window.motorContable.calcularBalanza("2026-09")');
  console.log('   window.motorContable.verificarCuadratura(totales)');
  console.log('   window.motorContable.detectarErroresComunes("2026-09")');

  console.log('   window.motorContable.cerrarEjercicio("2026-09")');
  console.log('   window.motorContable.simularCierreEjercicio("2026-09")');
}

// ──────────────────────────────────────────────────────────────
// ARRANQUE: Esperar a que el DOM esté listo
// ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', iniciarERP);
