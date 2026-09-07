# 📁 ROADMAP_MODULO_2_COMPRAS_VENTAS.md

**Proyecto:** ERP Contable Integral Boliviano (Prototipo Educativo / Portafolio)
**Arquitectura:** Frontend Vanilla JS + LocalStorage (sin backend real — enfoque didáctico)
**Versión:** 1.0.0 · **Formato:** Guía Arquitectónica Explicativa
**Tiempo estimado:** 6–8 horas · **Bloquea:** Módulos 3→8 (Motor Contable, Impuestos, Estados Financieros)
**Depende de:** Módulo 0 (Setup) + Módulo 1 (Documentos Fuente)

> **Objetivo del Módulo:** Construir los **módulos de Compras y Ventas** — el corazón operativo de cualquier empresa comercial. Aquí se implementa el ciclo completo desde la orden de compra hasta el pago al proveedor, y desde la cotización hasta el cobro del cliente. Se calcula el **IVA boliviano (13% incluido en el precio)** usando la fórmula `Total ÷ 1.13`, el **IT (3%)** sobre ventas brutas, y se generan automáticamente los **asientos contables** que alimentarán el Motor Contable (Módulo 3). Este es el módulo donde el ERP empieza a parecerse a un sistema real: cada compra o venta mueve simultáneamente inventario, impuestos, cuentas por pagar/cobrar y contabilidad.

> **Nota didáctica:** Este módulo es el **mejor momento para una exposición**. Aquí puedes mostrar en vivo cómo una sola transacción de compra actualiza 5 cosas al mismo tiempo: el inventario sube, el IVA crédito fiscal se acumula, la cuenta por pagar aparece, el asiento contable se genera, y el Libro de Compras se actualiza. Ese es el argumento de venta de un ERP frente a "varios Excel conectados a mano".

---

## 🗺️ Mapa del Módulo

```text
Módulo 2
├── Fase 2.1 → Teoría: Ciclos de Compra y Venta en Bolivia
├── Fase 2.2 → Modelo de datos: Catálogos (Clientes, Proveedores, Productos)
├── Fase 2.3 → js/modulos/compras.js — Ciclo de compras completo
├── Fase 2.4 → js/modulos/ventas.js — Ciclo de ventas completo
├── Fase 2.5 → js/modulos/inventario.js — Kardex valorado (entrada/salida)
├── Fase 2.6 → Vistas de Compras y Ventas (formularios + tablas)
├── Fase 2.7 → Cálculo del IVA boliviano (÷1.13) y el IT (3%)
├── Fase 2.8 → Generación automática de asientos contables
├── Fase 2.9 → Libro de Compras y Ventas (LCV) preliminar
└── Fase 2.10 → Smoke test final y commit de cierre
```

---

## 🟥 Estado: `[ ] Pendiente`

---

# FASE 2.1 — Teoría: Ciclos de Compra y Venta en Bolivia

## El Ciclo de Compra (desde la necesidad hasta el pago)

```text
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ 1. Solicitud │────▶│ 2. Orden de  │────▶│ 3. Recepción │
│    de Compra │     │    Compra    │     │  en Almacén  │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
┌──────────────┐     ┌──────────────┐     ┌──────▼───────┐
│ 6. Pago al   │◀────│ 5. Cuenta    │◀────│ 4. Factura   │
│   Proveedor  │     │  por Pagar   │     │  Proveedor   │
└──────────────┘     └──────────────┘     └──────────────┘

En cada paso, el ERP registra un documento fuente (Capa 1)
y genera asientos contables (Capa 3).
```

## El Ciclo de Venta (desde la cotización hasta el cobro)

```text
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ 1. Cotización│────▶│ 2. Pedido /  │────▶│ 3. Despacho  │
│   al Cliente │     │  Orden Venta │     │  de Almacén  │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
┌──────────────┐     ┌──────────────┐     ┌──────▼───────┐
│ 6. Cobro del │◀────│ 5. Cuenta    │◀────│ 4. Factura   │
│   Cliente    │     │  por Cobrar  │     │  de Venta    │
└──────────────┘     └──────────────┘     └──────────────┘

La factura de venta genera: IVA Débito Fiscal + IT 3%
El despacho genera: Salida de Kardex + Costo de Ventas
```

## La clave del IVA boliviano

```text
En Bolivia, el IVA (13%) ESTÁ INCLUIDO EN EL PRECIO.
Esto significa que cuando ves un precio de Bs 100:
  - Bs 88.50 son el valor neto del producto
  - Bs 11.50 son el IVA
  - Total: Bs 100

Para extraer el neto: Neto = Total ÷ 1.13
Para calcular el IVA: IVA = Total − Neto

Ejemplo con Bs 5,650:
  Neto = 5,650 ÷ 1.13 = Bs 5,000
  IVA  = 5,650 − 5,000 = Bs 650
  Verificación: 5,000 × 13% = Bs 650 ✓

⚠️ La "tasa efectiva" de 14.94% NO es un impuesto diferente.
Es un efecto matemático: si quieres que te queden Bs 100 limpios,
debes facturar Bs 114.94 (100 ÷ 0.87). El IVA de Bs 14.94
representa el 14.94% de esos Bs 100 netos.
```

## Tareas de la Fase 2.1

```text
[x] Crear docs/aprendizaje/04-ciclo-compra-venta.md
    → Explicación teórica de ambos ciclos (máximo 2 páginas).
    → Incluir diagramas de flujo (pueden ser ASCII como arriba).
    → 🧠 Mini-Prompt para IA: "Escribe una explicación didáctica 
      del ciclo de compra y venta en un ERP adaptado para Bolivia. 
      Incluye la fórmula del IVA incluido (Total ÷ 1.13) y por qué 
      el IT del 3% se calcula sobre el monto bruto. Máximo 600 
      palabras. Usa ejemplos con montos en bolivianos."

[x] Crear docs/aprendizaje/05-iva-boliviano-explicado.md
    → Explicar la diferencia entre tasa nominal (13%) y efectiva (14.94%).
    → Incluir el cambio pendiente a "IVA por fuera" (Ley 1733).
    → Mostrar la fórmula y un ejemplo numérico paso a paso.
    → 🧠 Mini-Prompt para IA: "Explica de forma didáctica por qué 
      en Bolivia el IVA está incluido en el precio (Art. 5 Ley 843). 
      Muestra la fórmula Total ÷ 1.13 con un ejemplo de Bs 5,650. 
      Explica por qué existe la 'tasa efectiva' de 14.94% y que 
      no es un impuesto separado. Menciona brevemente el cambio 
      pendiente a 'IVA por fuera' de la Ley 1733."
```

---

# FASE 2.2 — Modelo de Datos: Catálogos (Clientes, Proveedores, Productos)

## ¿Qué hace esta fase?
Antes de registrar compras y ventas, necesitamos saber **a quién le compramos**, **a quién le vendemos**, y **qué productos manejamos**. Estos tres catálogos son la base de referencia que usan todos los módulos posteriores.

## Estructura de los catálogos

```javascript
// CLIENTE — Quién nos compra
const cliente = {
  id: "cli-001",
  nit: "123456789-1",           // NIT del cliente
  razonSocial: "Comercial ABC SRL",
  telefono: "591-2-2345678",
  email: "contacto@abc.com.bo",
  direccion: "Av. Arce #1234, La Paz",
  limiteCredito: 50000.00,      // Bs máximo que puede debernos
  saldoActual: 0.00,            // Cuánto nos debe ahora
  estado: "ACTIVO",             // ACTIVO | INACTIVO | BLOQUEADO
  regimenTributario: "REGIMEN_GENERAL",  // RG, RTS, STI, RAU, SIETE-RG
  creadoEn: "2026-09-01T10:00:00"
};

// PROVEEDOR — Quién nos vende
const proveedor = {
  id: "prov-001",
  nit: "987654321-2",
  razonSocial: "Importadora XYZ SA",
  telefono: "591-4-4567890",
  email: "ventas@xyz.com.bo",
  direccion: "C. Junín #567, Cochabamba",
  condicionesPago: "30_DIAS",   // CONTADO, 15_DIAS, 30_DIAS, 60_DIAS
  saldoPorPagar: 0.00,          // Cuánto le debemos ahora
  estado: "ACTIVO",
  regimenTributario: "REGIMEN_GENERAL",
  esAgenteRetencion: false,     // Si le retenemos RC-IVA o IT
  creadoEn: "2026-09-01T10:00:00"
};

// PRODUCTO — Qué vendemos / compramos
const producto = {
  id: "prod-001",
  codigo: "PROD-001",
  nombre: "Laptop Lenovo ThinkPad",
  categoria: "TECNOLOGIA",
  unidadMedida: "UNIDAD",       // UNIDAD, KILOGRAMO, LITRO, METRO
  precioVenta: 5650.00,         // Precio de venta CON IVA incluido
  costoUltimo: 4000.00,         // Último costo de compra SIN IVA
  stockActual: 10,              // Cantidad en inventario
  stockMinimo: 5,               // Alerta si baja de esto
  almacen: "ALMACEN_CENTRAL",
  activo: true,
  creadoEn: "2026-09-01T10:00:00"
};
```

## Tareas de la Fase 2.2

```text
[x] Crear js/config/catalogos.js
    → Clase CatalogoClientes con métodos CRUD básicos.
    → Clase CatalogoProveedores con métodos CRUD básicos.
    → Clase CatalogoProductos con métodos CRUD básicos.
    → Cada clase usa window.Almacenamiento para persistir.

[x] Implementar métodos CRUD en cada catálogo
    → crear(datos): valida y guarda un nuevo registro.
    → obtenerTodos(): devuelve array completo.
    → obtenerPorId(id): busca uno específico.
    → obtenerPorNIT(nit): busca por NIT (único).
    → actualizar(id, datos): modifica un registro.
    → eliminar(id): marca como INACTIVO (soft delete).
    → 🧠 Mini-Prompt para IA: "Escribe una clase JS genérica 
      CatalogoCRUD que tenga métodos crear, obtenerTodos, 
      obtenerPorId, obtenerPorNIT, actualizar, eliminar (soft 
      delete). Luego muestra cómo extenderla para CatalogoClientes, 
      CatalogoProveedores y CatalogoProductos con campos específicos."

[x] Crear validaciones específicas de catálogos
    → Cliente: NIT válido + no duplicado.
    → Proveedor: NIT válido + no duplicado.
    → Producto: código único + precio > 0 + stock >= 0.
    → 🧠 Mini-Prompt para IA: "Escribe validaciones JS para 
      catálogos de un ERP boliviano: cliente requiere NIT válido 
      y único, proveedor requiere NIT válido y único, producto 
      requiere código único y precio positivo. Devuelve objeto 
      { valido, errores[] }."

[x] Crear vistas/catalogos.html (pantalla de mantenimiento)
    → Tres pestañas: Clientes | Proveedores | Productos.
    → Formulario para agregar/editar.
    → Tabla para listar con búsqueda por nombre o NIT.

[x] Cargar datos de ejemplo desde datos/ejemplo.json
    → 3 clientes, 3 proveedores, 5 productos precargados.
    → Función cargarCatalogosEjemplo() que solo se ejecuta 
      si las colecciones están vacías.
```

---

# FASE 2.3 — js/modulos/compras.js: Ciclo de Compras Completo

## ¿Qué hace esta fase?
Implementa el **ciclo de compras** paso a paso. Cada paso genera un documento fuente (Capa 1) y, eventualmente, un asiento contable (Capa 3). Por ahora, los asientos se guardan como "pendientes" hasta que el Motor Contable esté listo en el Módulo 3.

## Estados de una compra

```text
SOLICITADA → ORDENADA → RECIBIDA → FACTURADA → PAGADA
     │           │          │           │          │
     ▼           ▼          ▼           ▼          ▼
  Usuario     Se genera   Almacén    Se registra  Tesorería
  pide algo   la OC       recibe     la factura   paga
```

## Tareas de la Fase 2.3

```text
[x] Crear js/modulos/compras.js
    → Clase ModuloCompras con métodos para cada etapa del ciclo.

[x] Implementar solicitarCompra(datos)
    → Crea una solicitud de compra (documento fuente tipo SOLICITUD_COMPRA).
    → Campos: solicitante, departamento, productos solicitados, justificación.
    → Estado inicial: "SOLICITADA".

[x] Implementar generarOrdenCompra(solicitudId)
    → Convierte una solicitud aprobada en una Orden de Compra.
    → Genera número único: "OC-2026-001", "OC-2026-002", etc.
    → Selecciona proveedor (de la solicitud o el usuario elige).
    → Calcula totales por producto y total general.
    → Estado: "ORDENADA".

[x] Implementar registrarRecepcion(ordenId, datosRecepcion)
    → Registra la entrada de mercancía al almacén.
    → Genera una NOTA_ENTRADA (documento fuente de Capa 1).
    → Actualiza el stock en el catálogo de productos.
    → Valida que las cantidades recibidas ≤ cantidades ordenadas.
    → Estado: "RECIBIDA".
    → 🧠 Mini-Prompt para IA: "Escribe un método JS para registrar 
      la recepción de mercancía en un ERP. Debe: validar que lo 
      recibido no exceda lo ordenado, generar una nota de entrada, 
      actualizar el stock del producto, y devolver un objeto con 
      el resultado. Incluye manejo de recepciones parciales."

[x] Implementar registrarFacturaProveedor(ordenId, datosFactura)
    → Registra la factura del proveedor.
    → Valida NIT del proveedor contra el catálogo.
    → Valida CUF de la factura.
    → Calcula el IVA: neto = total ÷ 1.13, IVA = total − neto.
    → Genera una cuenta por pagar.
    → Estado: "FACTURADA".
    → 🧠 Mini-Prompt para IA: "Escribe un método JS para registrar 
      una factura de proveedor en un ERP boliviano. Debe validar 
      NIT y CUF, calcular el IVA incluido (total ÷ 1.13), crear 
      una cuenta por pagar, y generar los datos para el asiento 
      contable (Inventario Debe, IVA Crédito Fiscal Debe, 
      Proveedores Haber)."

[x] Implementar registrarPago(facturaId, datosPago)
    → Registra el pago al proveedor.
    → Reduce la cuenta por pagar.
    → Si es pago total → estado "PAGADA".
    → Si es pago parcial → estado "PARCIALMENTE_PAGADA".
    → Genera un RECIBO_PAGO (documento fuente).

[x] Implementar obtenerCuentasPorPagar(filtros)
    → Lista todas las facturas pendientes de pago.
    → Filtros: proveedor, vencimiento, monto mínimo.
    → Ordenado por fecha de vencimiento ascendente.

[x] Implementar obtenerHistorialCompras(proveedorId)
    → Todas las compras hechas a un proveedor específico.
    → Para análisis de proveedor (volumen, puntualidad, etc.)
```

---

# FASE 2.4 — js/modulos/ventas.js: Ciclo de Ventas Completo

## ¿Qué hace esta fase?
Implementa el **ciclo de ventas** paso a paso. Aquí es donde el ERP genera ingresos, calcula el IVA débito fiscal y el IT, y actualiza el inventario.

## Estados de una venta

```text
COTIZADA → PEDIDA → DESPACHADA → FACTURADA → COBRADA
     │         │          │           │          │
     ▼         ▼          ▼           ▼          ▼
  Se envía  Cliente    Almacén     Se emite   Tesorería
  cotización acepta    despacha    factura    cobra
```

## Tareas de la Fase 2.4

```text
[ ] Crear js/modulos/ventas.js
    → Clase ModuloVentas con métodos para cada etapa del ciclo.

[ ] Implementar crearCotizacion(datos)
    → Genera una cotización para un cliente.
    → Número único: "COT-2026-001".
    → Incluye productos, cantidades, precios (con IVA incluido).
    → Fecha de vencimiento de la cotización.
    → Estado: "COTIZADA".

[ ] Implementar confirmarPedido(cotizacionId)
    → Convierte la cotización aceptada en un pedido.
    → Verifica stock disponible antes de confirmar.
    → Si no hay stock suficiente → alerta al usuario.
    → Estado: "PEDIDA".
    → 🧠 Mini-Prompt para IA: "Escribe un método JS para confirmar 
      un pedido de venta en un ERP. Debe verificar stock disponible 
      para cada producto antes de confirmar. Si no hay stock, 
      devolver error indicando qué productos faltan. Si hay stock, 
      reservar las cantidades (stockReservado) para que no se 
      vendan a otro cliente."

[ ] Implementar registrarDespacho(pedidoId)
    → Genera una NOTA_SALIDA (documento fuente de Capa 1).
    → Descuenta el stock del inventario.
    → Calcula el costo de ventas según el método de valuación 
      (por ahora, usar costo promedio ponderado).
    → Estado: "DESPACHADA".

[ ] Implementar emitirFacturaVenta(pedidoId)
    → Genera la factura de venta.
    → Calcula el IVA: neto = total ÷ 1.13, IVA = total − neto.
    → Calcula el IT: total × 3%.
    → Genera una cuenta por cobrar.
    → Genera un CUF simulado (43 caracteres alfanuméricos).
    → Estado: "FACTURADA".
    → 🧠 Mini-Prompt para IA: "Escribe un método JS para emitir 
      una factura de venta en un ERP boliviano. Debe calcular el 
      IVA incluido (total ÷ 1.13), el IT del 3% sobre el total, 
      generar un CUF simulado de 43 caracteres, crear una cuenta 
      por cobrar, y preparar los datos para el asiento contable 
      (Clientes Debe, Ventas Haber, IVA Débito Fiscal Haber)."

[ ] Implementar registrarCobro(facturaId, datosCobro)
    → Registra el cobro del cliente.
    → Reduce la cuenta por cobrar.
    → Si es cobro total → estado "COBRADA".
    → Si es cobro parcial → estado "PARCIALMENTE_COBRADA".
    → Genera un RECIBO_CAJA (documento fuente).

[ ] Implementar obtenerCuentasPorCobrar(filtros)
    → Lista todas las facturas pendientes de cobro.
    → Filtros: cliente, vencimiento, monto mínimo.
    → Calcula antigüedad de la deuda (días vencidos).

[ ] Implementar obtenerHistorialVentas(clienteId)
    → Todas las ventas hechas a un cliente específico.
    → Para análisis de cliente (volumen, frecuencia, etc.)
```

---

# FASE 2.5 — js/modulos/inventario.js: Kardex Valorado

## ¿Qué hace esta fase?
Implementa el **kardex valorado** — el registro detallado de cada movimiento de inventario. Cada entrada (compra) y salida (venta) se registra con cantidad, costo unitario y valor total. El método de valuación es **Costo Promedio Ponderado** (el más común en Bolivia para empresas comerciales).

## Estructura del Kardex

```text
KARDEX: Laptop Lenovo ThinkPad (PROD-001)
─────────────────────────────────────────────────────────────────
Fecha       │ Tipo    │ Cantidad │ Costo Unit. │ Valor Total │ Saldo
─────────────────────────────────────────────────────────────────
01/09/2026  │ ENTRADA │    10    │  Bs 4,000   │ Bs 40,000   │  10 unidades @ Bs 4,000
05/09/2026  │ SALIDA  │     3    │  Bs 4,000   │ Bs 12,000   │   7 unidades @ Bs 4,000
10/09/2026  │ ENTRADA │     5    │  Bs 4,200   │ Bs 21,000   │  12 unidades @ Bs 4,083.33*
15/09/2026  │ SALIDA  │     2    │  Bs 4,083.33│ Bs 8,166.67 │  10 unidades @ Bs 4,083.33

* Nuevo promedio = (7 × 4,000 + 5 × 4,200) ÷ 12 = Bs 4,083.33
```

## Tareas de la Fase 2.5

```text
[ ] Crear js/modulos/inventario.js
    → Clase ModuloInventario con métodos de kardex.

[ ] Implementar registrarEntrada(productoId, cantidad, costoUnitario, referencia)
    → Suma al stock actual.
    → Recalcula el costo promedio ponderado.
    → Registra el movimiento en el kardex.
    → Referencia: "COMPRA_OC-2026-001" o "DEVOLUCION_CLIENTE".
    → 🧠 Mini-Prompt para IA: "Escribe un método JS para registrar 
      una entrada de inventario con costo promedio ponderado. 
      Fórmula: nuevoPromedio = (stockAnterior × costoAnterior + 
      cantidadEntrada × costoEntrada) ÷ (stockAnterior + 
      cantidadEntrada). Guarda el movimiento en un array de kardex."

[ ] Implementar registrarSalida(productoId, cantidad, referencia)
    → Valida que haya stock suficiente.
    → Resta del stock actual.
    → Usa el costo promedio ponderado actual como costo de salida.
    → Registra el movimiento en el kardex.
    → Referencia: "VENTA_PED-2026-001" o "AJUSTE_INVENTARIO".

[ ] Implementar obtenerKardex(productoId, fechaInicio, fechaFin)
    → Devuelve todos los movimientos de un producto en un rango.
    → Ordenado por fecha ascendente.
    → Incluye saldos acumulados después de cada movimiento.

[ ] Implementar obtenerValorInventario()
    → Suma el valor total de todo el inventario.
    → Para cada producto: stockActual × costoPromedio.
    → Devuelve el total en Bs.

[ ] Implementar verificarStockBajo()
    → Devuelve lista de productos donde stockActual ≤ stockMinimo.
    → Para alertas en el dashboard.

[ ] Conectar con compras.js y ventas.js
    → compras.js llama a registrarEntrada() al recibir mercancía.
    → ventas.js llama a registrarSalida() al despachar.
```

---

# FASE 2.6 — Vistas de Compras y Ventas (Formularios + Tablas)

## ¿Qué hace esta fase?
Construye las **pantallas** donde el usuario interactúa con los módulos de compras y ventas. Son las vistas más importantes del ERP porque son las que más se usan en el día a día.

## Tareas de la Fase 2.6

```text
[ ] Crear vistas/compras.html
    → Secciones:
      ├── <h1> Compras y Cuentas por Pagar
      ├── <div class="tabs">
      │   ├── Nueva Solicitud
      │   ├── Órdenes de Compra
      │   ├── Recepciones
      │   ├── Facturas de Proveedor
      │   └── Cuentas por Pagar
      ├── <div id="contenido-tab"> (cambia según tab activo)
      └── <table> para listar registros

[ ] Crear vistas/ventas.html
    → Secciones:
      ├── <h1> Ventas y Cuentas por Cobrar
      ├── <div class="tabs">
      │   ├── Nueva Cotización
      │   ├── Pedidos
      │   ├── Despachos
      │   ├── Facturas de Venta
      │   └── Cuentas por Cobrar
      ├── <div id="contenido-tab">
      └── <table> para listar registros

[ ] Crear js/vistas/compras-vista.js
    → Lógica de la vista de compras.
    → Manejar cambio de tabs.
    → Formularios dinámicos según la etapa del ciclo.
    → Llamar a window.ModuloCompras.registrarFacturaProveedor() etc.

[ ] Crear js/vistas/ventas-vista.js
    → Lógica de la vista de ventas.
    → Manejar cambio de tabs.
    → Formularios dinámicos según la etapa del ciclo.
    → Llamar a window.ModuloVentas.emitirFacturaVenta() etc.

[ ] Agregar estilos específicos en css/componentes.css
    → Estilos para tabs (.tab, .tab-activo).
    → Estilos para el flujo de estados (badge de estado por etapa).
    → Estilos para la tabla de kardex.

[ ] Conectar con el menú lateral
    → Agregar enlaces "🛒 Compras" y "💰 Ventas" en index.html.
    → Verificar que el enrutador carga las vistas correctamente.
```

---

# FASE 2.7 — Cálculo del IVA Boliviano (÷1.13) y el IT (3%)

## ¿Qué hace esta fase?
Implementa las **funciones de cálculo tributario** que se usan en cada compra y venta. Estas funciones viven en `js/config/bolivia.js` y se usan desde compras.js y ventas.js.

## Funciones a implementar

```javascript
// En js/config/bolivia.js

/**
 * Extrae el valor neto de un monto con IVA incluido.
 * Fórmula: Neto = Total ÷ 1.13
 * @param {number} montoTotal - Monto total con IVA incluido
 * @returns {number} Valor neto sin IVA
 */
function extraerNetoDeTotal(montoTotal) {
  return montoTotal / BOLIVIA.FACTOR_IVA_DENTRO;  // ÷ 1.13
}

/**
 * Calcula el IVA de un monto total con IVA incluido.
 * Fórmula: IVA = Total − Neto
 * @param {number} montoTotal - Monto total con IVA incluido
 * @returns {number} Monto del IVA
 */
function calcularIVADeTotal(montoTotal) {
  const neto = extraerNetoDeTotal(montoTotal);
  return montoTotal - neto;
}

/**
 * Calcula el IT (Impuesto a las Transacciones) sobre un monto bruto.
 * Fórmula: IT = Total × 3%
 * @param {number} montoBruto - Monto bruto de la transacción
 * @returns {number} Monto del IT
 */
function calcularIT(montoBruto) {
  return montoBruto * (BOLIVIA.IT_PORCENTAJE / 100);  // × 0.03
}

/**
 * Calcula el IVA que se debe agregar a un neto (para "IVA por fuera").
 * Útil para el futuro cuando cambie la ley (Ley 1733).
 * @param {number} montoNeto - Valor neto sin IVA
 * @returns {number} Monto del IVA a agregar
 */
function calcularIVASobreNeto(montoNeto) {
  return montoNeto * (BOLIVIA.IVA_PORCENTAJE / 100);  // × 0.13
}
```

## Tareas de la Fase 2.7

```text
[ ] Implementar las 4 funciones de cálculo en bolivia.js
    → extraerNetoDeTotal(montoTotal)
    → calcularIVADeTotal(montoTotal)
    → calcularIT(montoBruto)
    → calcularIVASobreNeto(montoNeto)  ← Para el futuro "IVA por fuera"

[ ] Crear pruebas manuales en la consola del navegador
    → window.BOLIVIA.extraerNetoDeTotal(5650) debe dar 5000
    → window.BOLIVIA.calcularIVADeTotal(5650) debe dar 650
    → window.BOLIVIA.calcularIT(11300) debe dar 339
    → window.BOLIVIA.calcularIVASobreNeto(5000) debe dar 650

[ ] Agregar validación de redondeo
    → Los montos deben redondearse a 2 decimales.
    → Usar: Math.round(monto * 100) / 100
    → Verificar que neto + IVA = total (con tolerancia de ±0.01)

[ ] Crear docs/aprendizaje/06-funciones-iva-it.md
    → Documentar cada función con ejemplos.
    → Incluir la fórmula matemática y un caso de uso.
    → 🧠 Mini-Prompt para IA: "Documenta en formato markdown 
      las funciones de cálculo de IVA e IT para Bolivia. Incluye 
      la fórmula matemática, un ejemplo numérico paso a paso, 
      y una nota sobre el cambio pendiente a 'IVA por fuera' 
      según la Ley 1733."
```

---

# FASE 2.8 — Generación Automática de Asientos Contables

## ¿Qué hace esta fase?
Cuando se registra una compra o una venta, el ERP debe generar **automáticamente** el asiento contable correspondiente. Por ahora, estos asientos se guardan en una colección "asientosPendientes" que el Motor Contable (Módulo 3) procesará.

## Asientos que se generan

```text
COMPRA DE MERCANCÍA (Bs 5,650 con IVA incluido):
─────────────────────────────────────────────────
  Inventario de Mercancías    Bs 5,000  (Debe)
  IVA Crédito Fiscal            Bs 650  (Debe)
      Proveedores                      Bs 5,650  (Haber)

VENTA DE MERCANCÍA (Bs 11,300 con IVA incluido):
─────────────────────────────────────────────────
  Clientes / Cuentas por Cobrar  Bs 11,300  (Debe)
      Ventas de Mercancías                Bs 10,000  (Haber)
      IVA Débito Fiscal                    Bs 1,300  (Haber)

COSTO DE VENTAS (automático por el kardex):
─────────────────────────────────────────────────
  Costo de Ventas              Bs 5,000  (Debe)
      Inventario de Mercancías          Bs 5,000  (Haber)

PAGO AL PROVEEDOR:
─────────────────────────────────────────────────
  Proveedores                  Bs 5,650  (Debe)
      Bancos                           Bs 5,650  (Haber)

COBRO DEL CLIENTE:
─────────────────────────────────────────────────
  Bancos                       Bs 11,300  (Debe)
      Clientes / Cuentas por Cobrar      Bs 11,300  (Haber)
```

## Tareas de la Fase 2.8

```text
[ ] Crear js/modulos/generador-asientos.js
    → Clase GeneradorAsientos con métodos para cada tipo de transacción.

[ ] Implementar generarAsientoCompra(datosCompra)
    → Crea el asiento de compra (Inventario + IVA CF / Proveedores).
    → Devuelve un objeto asiento con líneas de Debe y Haber.
    → Verifica que Debe = Haber antes de devolver.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que genere 
      el asiento contable de una compra de mercancía en Bolivia. 
      Recibe: montoTotal (con IVA incluido), proveedorId, productoId. 
      Calcula: neto = total ÷ 1.13, IVA = total − neto. Devuelve 
      un objeto asiento con líneas: Inventario (Debe), IVA Crédito 
      Fiscal (Debe), Proveedores (Haber). Verifica que Debe = Haber."

[ ] Implementar generarAsientoVenta(datosVenta)
    → Crea el asiento de venta (Clientes / Ventas + IVA DF).
    → Calcula el IT: total × 3%.
    → Devuelve un objeto asiento.

[ ] Implementar generarAsientoCostoVentas(datosDespacho)
    → Crea el asiento de costo de ventas (Costo de Ventas / Inventario).
    → Usa el costo promedio ponderado del kardex.

[ ] Implementar generarAsientoPagoProveedor(datosPago)
    → Crea el asiento de pago (Proveedores / Bancos).

[ ] Implementar generarAsientoCobroCliente(datosCobro)
    → Crea el asiento de cobro (Bancos / Clientes).

[ ] Guardar asientos en colección "asientosPendientes"
    → Cada asiento tiene: id, fecha, concepto, lineas[], estado: "PENDIENTE".
    → El Motor Contable (Módulo 3) los procesará y validará.
```

---

# FASE 2.9 — Libro de Compras y Ventas (LCV) Preliminar

## ¿Qué hace esta fase?
Genera un **reporte preliminar** del Libro de Compras y Ventas IVA (LCV). Este reporte es obligatorio para el SIN y lista todas las compras y ventas del mes con NIT, número de factura, monto e IVA. En este módulo generamos la estructura básica; el formato exacto para enviar al SIN se hará en el Módulo 7 (Cumplimiento).

## Estructura del LCV

```text
LIBRO DE COMPRAS Y VENTAS IVA — Septiembre 2026
─────────────────────────────────────────────────────────────────
COMPRAS:
NIT Proveedor │ Factura │ Fecha │ Total Bs │ Neto Bs │ IVA Bs
─────────────────────────────────────────────────────────────────
987654321-2   │ F-12345 │ 01/09 │ 5,650.00 │ 5,000.00│ 650.00
111222333-4   │ F-67890 │ 05/09 │ 2,260.00 │ 2,000.00│ 260.00
─────────────────────────────────────────────────────────────────
TOTAL COMPRAS:                 │ 7,910.00 │ 7,000.00│ 910.00

VENTAS:
NIT Cliente │ Factura │ Fecha │ Total Bs │ Neto Bs │ IVA Bs │ IT Bs
─────────────────────────────────────────────────────────────────
123456789-1 │ F-11111 │ 03/09 │ 11,300.00│10,000.00│1,300.00│339.00
444555666-7 │ F-22222 │ 08/09 │ 5,650.00 │ 5,000.00│ 650.00│169.50
─────────────────────────────────────────────────────────────────
TOTAL VENTAS:                  │ 16,950.00│15,000.00│1,950.00│508.50

RESUMEN DEL PERÍODO:
IVA Débito (de ventas):   Bs 1,950.00
IVA Crédito (de compras): Bs 910.00
IVA por Pagar:            Bs 1,040.00
IT por Pagar:             Bs 508.50
```

## Tareas de la Fase 2.9

```text
[ ] Crear js/modulos/lcv.js
    → Clase LibroComprasVentas.

[ ] Implementar generarLCV(periodoContable)
    → Recopila todas las compras del período.
    → Recopila todas las ventas del período.
    → Calcula totales: IVA crédito, IVA débito, IT.
    → Devuelve objeto estructurado con todos los datos.

[ ] Implementar calcularIVAPorPagar(periodoContable)
    → IVA Débito − IVA Crédito = IVA por Pagar (o saldo a favor).
    → Si es negativo → saldo a favor del contribuyente.

[ ] Crear vistas/lcv.html
    → Tabla con dos secciones: Compras y Ventas.
    → Filtro por período contable (mes/año).
    → Resumen al final con IVA por pagar y IT por pagar.
    → Botón "Exportar a CSV" para descargar.

[ ] Conectar con el menú lateral
    → Agregar enlace "📋 Libro Compras/Ventas" en index.html.
```

---

# FASE 2.10 — Smoke Test Final y Commit de Cierre

## Checklist de humo (smoke test)

```text
[ ] Smoke test #1: Registrar una compra completa
    → Crear solicitud de compra → Orden → Recepción → Factura → Pago
    → Verificar que el stock del producto aumentó
    → Verificar que el IVA crédito fiscal se calculó (÷1.13)
    → Verificar que se generó el asiento contable

[ ] Smoke test #2: Registrar una venta completa
    → Crear cotización → Pedido → Despacho → Factura → Cobro
    → Verificar que el stock del producto disminuyó
    → Verificar que el IVA débito fiscal se calculó
    → Verificar que el IT se calculó (×3%)
    → Verificar que se generó el asiento contable

[ ] Smoke test #3: Validar el kardex
    → Registrar una entrada de 10 unidades a Bs 4,000
    → Registrar una salida de 3 unidades
    → Verificar que el saldo es 7 unidades @ Bs 4,000
    → Registrar una entrada de 5 unidades a Bs 4,200
    → Verificar que el nuevo promedio es Bs 4,083.33

[ ] Smoke test #4: Verificar el LCV
    → Generar el LCV del período actual
    → Verificar que los totales de IVA débito/crédito son correctos
    → Verificar que IVA por pagar = Débito − Crédito

[ ] Smoke test #5: Persistencia
    → Recargar la página (F5)
    → Todas las compras, ventas y kardex deben seguir ahí
    → Abrir DevTools → LocalStorage → verificar colecciones

[ ] Smoke test #6: Validaciones bolivianas
    → Intentar registrar una compra con NIT inválido → debe rechazar
    → Intentar vender más stock del disponible → debe rechazar
    → Intentar registrar una venta con monto 0 → debe rechazar

[ ] Commit de cierre del Módulo 2
    → git add .
    → git commit -m "feat(modulo-2): Compras, Ventas, Inventario y LCV
    
      - Ciclo completo de compras (solicitud → pago)
      - Ciclo completo de ventas (cotización → cobro)
      - Kardex valorado con costo promedio ponderado
      - Cálculo del IVA boliviano (÷1.13) y el IT (×3%)
      - Generación automática de asientos contables
      - Libro de Compras y Ventas (LCV) preliminar
      - Smoke test: todos los tests pasan
      
      Próximo paso: Módulo 3 - Motor Contable (Partida Doble)"
```

---

## 🎯 Criterios de Aceptación del Módulo 2

El Módulo 2 se considera **completado** cuando:

- [x] Se puede registrar una compra completa (5 pasos)
- [x] Se puede registrar una venta completa (5 pasos)
- [x] El IVA se calcula correctamente con ÷1.13
- [x] El IT se calcula correctamente con ×3%
- [x] El kardex actualiza stock y costo promedio
- [x] Se generan asientos contables automáticos
- [x] El LCV muestra totales correctos
- [x] Las validaciones rechazan datos inválidos
- [x] Los datos persisten después de recargar
- [x] Se puede explicar en 5 minutos cómo funciona el ciclo

---

## 📚 Material de Exposición Generado en Este Módulo

| Archivo | Contenido | Uso en exposición |
|---|---|---|
| `04-ciclo-compra-venta.md` | Teoría de los ciclos | Explicar el flujo |
| `05-iva-boliviano-explicado.md` | Fórmula ÷1.13 y 14.94% | Demostrar el cálculo |
| `06-funciones-iva-it.md` | Documentación de funciones | Mostrar el código |

---

## 🚀 Próximos Módulos (adelanto)

| Módulo | Tema | Duración | Depende de |
|---|---|---|---|
| **Módulo 3** | Capa 3 — Motor Contable (Partida Doble) | 8–10 h | Módulo 2 |
| **Módulo 4** | Capa 2 — Nómina Boliviana | 6–8 h | Módulo 3 |
| **Módulo 5** | Capa 2 — Impuestos (IVA, IT, IUE) | 6–8 h | Módulo 3 |
| **Módulo 6** | Capa 4 — Estados Financieros | 5–7 h | Módulo 5 |
| **Módulo 7** | Capa 5 — Cumplimiento SIN | 4–6 h | Módulo 6 |
| **Módulo 8** | Migración a SaaS real (opcional) | 10–15 h | Módulo 7 |

---

## ⚠️ Advertencia final

La tentación aquí es hacer que las compras y ventas funcionen pero **saltarse los asientos contables automáticos**. *"Total, el Motor Contable viene en el Módulo 3"*. **No lo hagas.** Los asientos generados en este módulo son la materia prima del Motor Contable. Si aquí no generas los asientos correctamente (Debe = Haber, cuentas correctas, montos precisos), el Módulo 3 no tendrá nada que procesar. Además, en una exposición, poder mostrar que **una sola compra genera automáticamente el asiento contable** es el momento "wow" que demuestra que entendiste qué es un ERP.

---

**¿Siguiente paso?** Cuando completes este Módulo 2, avísame y generamos el **ROADMAP_MODULO_3_MOTOR_CONTABLE.md** con el mismo formato. 🚀
