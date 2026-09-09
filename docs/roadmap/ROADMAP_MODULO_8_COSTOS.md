# 📁 ROADMAP_MODULO_8_COSTOS.md

**Proyecto:** ERP Contable Integral Boliviano (Prototipo Educativo / Portafolio)
**Arquitectura:** Frontend Vanilla JS + LocalStorage (sin backend real — enfoque didáctico)
**Versión:** 1.0.0 · **Formato:** Guía Arquitectónica Explicativa
**Tiempo estimado:** 10–12 horas · **Bloquea:** Módulo 6 (Estados Financieros) — mejora con datos de costos
**Depende de:** Módulo 2 (Compras/Ventas) + Módulo 3 (Motor Contable) + Módulo 4 (Nómina)

> **Objetivo del Módulo:** Construir el **módulo de Contabilidad de Costos** adaptado a las Normas de Contabilidad Generalmente Aceptadas (NC GA) de Bolivia y a las NIIF. Aquí se implementan los **3 métodos de valuación de inventarios** (Promedio Ponderado, FIFO/PEPS, LIFO/UEPS), la **gestión de centros de costos** por departamento o proyecto, el **costeo por órdenes de trabajo**, el **análisis de rentabilidad por producto y cliente**, y el **punto de equilibrio** mensual. Este módulo transforma los datos operativos (compras, ventas, nómina) en información gerencial para la toma de decisiones estratégicas.

> **Nota didáctica:** Este módulo es donde el ERP demuestra que **no es solo un sistema contable, sino un sistema de gestión empresarial**. La implementación de los 3 métodos de valuación (FIFO, LIFO, Promedio) con ejemplos comparativos lado a lado es una herramienta de aprendizaje que **no existe en ningún ERP comercial**. En una exposición, poder mostrar cómo un mismo inventario tiene 3 valores diferentes según el método elegido — y cómo cada método afecta la utilidad bruta, el IUE a pagar y los ratios financieros — es lo que demuestra dominio real de contabilidad de costos. ⚠️ El método LIFO está implementado **solo con fines educativos**: NIIF (NIC 2) lo prohibió desde 2005 y el SIN en Bolivia no lo acepta para declaraciones fiscales. Su presencia en el sistema es para demostrar por qué se prohibió.

---

## 🗺️ Mapa del Módulo

```text
Módulo 8
├── Fase 8.1  → Teoría: Contabilidad de Costos y métodos de valuación
├── Fase 8.2  → Sistema de capas de inventario (FIFO/LIFO)
├── Fase 8.3  → Comparador de métodos (Promedio vs FIFO vs LIFO)
├── Fase 8.4  → Centros de costos (departamentos, proyectos)
├── Fase 8.5  → Asignación de costos indirectos (CIF)
├── Fase 8.6  → Costeo por órdenes de trabajo
├── Fase 8.7  → Análisis de margen por producto
├── Fase 8.8  → Análisis de margen por cliente
├── Fase 8.9  → Punto de equilibrio (análisis CVP)
├── Fase 8.10 → Dashboard de costos
├── Fase 8.11 → Generación de asientos contables de costos
├── Fase 8.12 → Vista de Costos (6 tabs)
└── Fase 8.13 → Smoke test final y commit de cierre
```

---

## 🟥 Estado: `[ ] Pendiente`

---

# FASE 8.1 — Teoría: Contabilidad de Costos y métodos de valuación

## ¿Qué hace esta fase?
Establece la **base teórica** de la contabilidad de costos: conceptos fundamentales, clasificación de costos (directos/indirectos, fijos/variables), y los 3 métodos de valuación de inventarios con sus implicaciones tributarias en Bolivia.

## Métodos de valuación de inventarios

```text
╔══════════════════════════════════════════════════════════════════╗
║  MÉTODO       │ COSTO DE VENTA │ INVENTARIO FINAL │ ACEPTADO   ║
║───────────────┼────────────────┼──────────────────┼────────────║
║  Promedio     │ Medio          │ Medio            │ ✓ NIIF/SIN ║
║  FIFO / PEPS  │ Bajo (antiguo) │ Alto (reciente)  │ ✓ NIIF/SIN ║
║  LIFO / UEPS  │ Alto (reciente)│ Bajo (antiguo)   │ ✗ PROHIBIDO║
╚══════════════════════════════════════════════════════════════════╝

⚠️ EN ENTORNO INFLACIONARIO (como Bolivia históricamente):
   • FIFO → utilidad MÁS ALTA → MÁS impuestos
   • LIFO → utilidad MÁS BAJA → MENOS impuestos (por eso se prohibió)
   • Promedio → utilidad MEDIA → término medio

⚠️ NORMATIVA BOLIVIANA:
   • Código de Comercio, Art. 40: acepta Promedio y FIFO
   • NIC 2 (Inventarios): prohibió LIFO desde 2005
   • SIN: solo acepta Promedio y FIFO para declaraciones
```

## Clasificación de costos

```text
POR SU IDENTIFICACIÓN CON EL PRODUCTO:
─────────────────────────────────────────────────
  • Costos Directos: se identifican directamente
    - Materia prima
    - Mano de obra directa
    - Comisiones de venta
  • Costos Indirectos (CIF): no se identifican directamente
    - Alquiler de fábrica
    - Supervisor de planta
    - Depreciación de maquinaria
    - Servicios básicos (luz, agua)

POR SU COMPORTAMIENTO CON EL VOLUMEN:
─────────────────────────────────────────────────
  • Costos Fijos: no cambian con el volumen
    - Alquiler, sueldos administrativos, seguros
  • Costos Variables: cambian proporcionalmente
    - Materia prima, comisiones, fletes
  • Costos Mixtos: tienen componente fijo y variable
    - Teléfono (cargo fijo + consumo)
    - Electricidad (cargo fijo + kWh)

POR SU FUNCIÓN EN LA EMPRESA:
─────────────────────────────────────────────────
  • Costos de Producción: fabricación del producto
  • Costos de Distribución: llevarlo al cliente
  • Costos de Administración: gestión general
  • Costos Financieros: intereses, comisiones bancarias
```

## Tareas de la Fase 8.1

```text
[ ] Crear docs/aprendizaje/21-contabilidad-costos-explicada.md
    → Explicación teórica (máximo 4 páginas).
    → Incluir: clasificación de costos (directos/indirectos, fijos/variables).
    → Explicar el ciclo contable de costos.
    → 🧠 Mini-Prompt para IA: "Escribe una explicación didáctica
      de la contabilidad de costos para un ERP. Incluye:
      clasificación de costos (directos vs indirectos, fijos vs
      variables vs mixtos), ciclo contable de costos (compra →
      producción → inventario → venta), diferencias con contabilidad
      financiera. Máximo 1000 palabras."

[ ] Crear docs/aprendizaje/22-metodos-valuacion-inventarios.md
    → Teoría completa de Promedio, FIFO, LIFO.
    → Ejemplos numéricos comparativos.
    → Ventajas y desventajas de cada método.
    → Normativa boliviana (solo Promedio y FIFO).
    → 🧠 Mini-Prompt para IA: "Explica los 3 métodos de valuación
      de inventarios: Promedio Ponderado, FIFO/PEPS y LIFO/UEPS.
      Incluye ejemplos numéricos del mismo inventario valuado con
      los 3 métodos, mostrando el efecto en utilidad bruta, IUE
      e inventario final. Explica por qué NIIF prohibió LIFO en
      2005 y por qué el SIN boliviano solo acepta Promedio y FIFO.
      Máximo 1200 palabras con tablas comparativas."

[ ] Crear docs/aprendizaje/23-centros-de-costos.md
    → Clasificación de costos por departamento o proyecto.
    → Asignación de costos indirectos.
    → Tasa de absorción de CIF.
    → 🧠 Mini-Prompt para IA: "Explica los centros de costos en
      contabilidad gerencial: definición, tipos (productivos,
      de servicio, administrativos), asignación de costos
      indirectos mediante tasa de absorción, y cómo se usa para
      evaluar desempeño por departamento. Máximo 800 palabras."
```

---

# FASE 8.2 — Sistema de Capas de Inventario (FIFO/LIFO)

## ¿Qué hace esta fase?
Implementa el **sistema de capas** que permite soportar FIFO y LIFO. Cada compra crea una nueva "capa" de inventario con su cantidad y costo. Las ventas consumen las capas según el método elegido (más antiguas en FIFO, más recientes en LIFO).

## Estructura de capas

```javascript
const inventarioCapas = {
  productoId: "prod-001",
  metodo: "FIFO",                    // "PROMEDIO", "FIFO", "LIFO"
  capas: [
    {
      id: "capa-001",
      fechaEntrada: "2026-01-15",
      documentoOrigen: "OC-2026-0001",
      cantidadInicial: 100,
      cantidadDisponible: 80,        // Lo que queda
      costoUnitario: 50.00,
      valorTotal: 4000.00
    },
    {
      id: "capa-002",
      fechaEntrada: "2026-02-20",
      documentoOrigen: "OC-2026-0005",
      cantidadInicial: 150,
      cantidadDisponible: 150,
      costoUnitario: 55.00,
      valorTotal: 8250.00
    },
    {
      id: "capa-003",
      fechaEntrada: "2026-03-10",
      documentoOrigen: "OC-2026-0012",
      cantidadInicial: 200,
      cantidadDisponible: 200,
      costoUnitario: 60.00,
      valorTotal: 12000.00
    }
  ],
  totalUnidades: 430,
  valorTotal: 24250.00
};
```

## Lógica de consumo de capas

```text
FIFO (Primeras en Entrar, Primeras en Salir):
─────────────────────────────────────────────────
Venta de 120 unidades:
  → Se consume Capa 001 completa: 80 u × Bs 50 = Bs 4,000
  → Se consume parte de Capa 002: 40 u × Bs 55 = Bs 2,200
  → Costo de venta total: Bs 6,200
  → Capa 002 queda con: 110 u × Bs 55 = Bs 6,050

LIFO (Últimas en Entrar, Primeras en Salir):
─────────────────────────────────────────────────
Venta de 120 unidades:
  → Se consume parte de Capa 003: 120 u × Bs 60 = Bs 7,200
  → Costo de venta total: Bs 7,200
  → Capa 003 queda con: 80 u × Bs 60 = Bs 4,800

⚠️ MISMA VENTA, DIFERENTE COSTO:
  FIFO: Bs 6,200 → utilidad MÁS ALTA
  LIFO: Bs 7,200 → utilidad MÁS BAJA (Bs 1,000 menos)
```

## Tareas de la Fase 8.2

```text
[ ] Crear js/modulos/inventario-capas.js
    → Clase InventarioCapas que maneja el sistema de capas.
    → agregarCapa(productoId, datos): crea una nueva capa con compra.
    → consumirCapas(productoId, cantidad, metodo): consume según método.
    → obtenerCapas(productoId): devuelve las capas actuales.
    → calcularValorInventario(productoId): suma de todas las capas.
    → calcularCostoVenta(productoId, cantidad): costo según método.

[ ] Implementar agregarCapa(productoId, datosEntrada)
    → Crea una nueva capa con la compra recibida.
    → Datos: fecha, cantidad, costo unitario, documento origen.
    → Genera ID único para la capa.
    → Actualiza totales del inventario.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que agregue
      una capa de inventario en un sistema FIFO/LIFO. Recibe el
      ID del producto, la cantidad, el costo unitario y el documento
      origen. Crea un objeto capa con ID único, fecha de entrada,
      cantidad inicial y disponible, y costo unitario. Agrega la
      capa al array de capas del producto."

[ ] Implementar consumirCapasFIFO(productoId, cantidad)
    → Consume capas desde la más ANTIGUA a la más RECIENTE.
    → Si una capa no alcanza, consume la siguiente.
    → Si no hay suficiente → error de stock insuficiente.
    → Devuelve { costoTotal, detalleConsumo[] }.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que consuma
      inventario usando FIFO. Recorre las capas desde la más
      antigua hasta cubrir la cantidad solicitada. Si una capa
      no alcanza, consume toda y pasa a la siguiente. Devuelve
      el costo total y el detalle de consumo por capa."

[ ] Implementar consumirCapasLIFO(productoId, cantidad)
    → Consume capas desde la más RECIENTE a la más ANTIGUA.
    → Mismo proceso pero en orden inverso.
    → ⚠️ Advertencia: genera "capas LIFO" antiguas que nunca se liquidan.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que consuma
      inventario usando LIFO. Recorre las capas desde la más
      reciente hasta cubrir la cantidad. Incluye una advertencia
      sobre las 'capas LIFO' antiguas que se acumulan y distorsionan
      el valor del inventario. Devuelve costo total y detalle."

[ ] Implementar cambiarMetodoValuacion(productoId, nuevoMetodo)
    → Cambia el método de valuación de un producto.
    → Recalcula el inventario con el nuevo método.
    → Genera asiento de ajuste si hay diferencia.
    → Registra el cambio en historial.
    → ⚠️ Los cambios de método deben informarse en notas a EEFF.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que cambie
      el método de valuación de un producto (Promedio → FIFO, etc).
      Recalcula el inventario con el nuevo método, calcula la
      diferencia con el método anterior, y genera asiento de ajuste
      contable. Registra el cambio en historial para notas a EEFF."
```

---

# FASE 8.3 — Comparador de Métodos (Promedio vs FIFO vs LIFO)

## ¿Qué hace esta fase?
Implementa un **comparador visual** que muestra el mismo inventario valuado con los 3 métodos simultáneamente. Esto permite ver en tiempo real cómo cada método afecta la utilidad bruta, el IUE a pagar y los ratios financieros. Es la **joya didáctica** del módulo.

## Datos del comparador

```text
COMPARADOR DE MÉTODOS — Producto X — Septiembre 2026
─────────────────────────────────────────────────────────────────
DATOS DE ENTRADA:
  Inventario inicial: 100 u × Bs 100 = Bs 10,000
  Compra 1: 200 u × Bs 120 = Bs 24,000
  Compra 2: 150 u × Bs 140 = Bs 21,000
  Venta del mes: 300 u × Bs 200 = Bs 60,000

RESULTADOS POR MÉTODO:
─────────────────────────────────────────────────────────────────
MÉTODO    │ COSTO VENTA │ UTILIDAD BRUTA │ IUE (25%) │ INVENTARIO
──────────┼─────────────┼────────────────┼───────────┼──────────
Promedio  │ Bs 36,667   │ Bs 23,333      │ Bs 5,833  │ Bs 18,333
FIFO      │ Bs 34,000   │ Bs 26,000      │ Bs 6,500  │ Bs 21,000
LIFO      │ Bs 40,000   │ Bs 20,000      │ Bs 5,000  │ Bs 15,000
──────────┼─────────────┼────────────────┼───────────┼──────────
Diferencia│ Bs 6,000    │ Bs 6,000       │ Bs 1,500  │ Bs 6,000

⚠️ LA ELECCIÓN DEL MÉTODO AFECTA:
   • Bs 6,000 en utilidad bruta
   • Bs 1,500 en IUE a pagar
   • Bs 6,000 en valor del inventario (activo)
   • Ratios financieros (ROA, ROE, liquidez)
```

## Tareas de la Fase 8.3

```text
[ ] Implementar compararMetodos(productoId, periodo)
    → Calcula el costo de venta con los 3 métodos para el mismo período.
    → Calcula utilidad bruta, IUE estimado, valor inventario.
    → Devuelve objeto comparativo con los 3 métodos.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que compare
      los 3 métodos de valuación para el mismo producto y período.
      Calcula costo de venta, utilidad bruta, IUE estimado (25%)
      y valor del inventario final con Promedio, FIFO y LIFO.
      Devuelve objeto comparativo con los 3 resultados y las
      diferencias entre ellos."

[ ] Implementar simularCompra(productoId, cantidad, costoUnitario)
    → Simula una compra sin persistirla.
    → Muestra cómo afecta a cada método.
    → Para aprendizaje interactivo.

[ ] Implementar simularVenta(productoId, cantidad, precioUnitario)
    → Simula una venta sin persistirla.
    → Calcula utilidad bruta con cada método.
    → Muestra la diferencia en IUE a pagar.

[ ] Implementar generarReporteComparativo(productoId, periodo)
    → Genera un reporte HTML/PDF con la comparación.
    → Incluye gráficos de barras comparativos.
    → Tabla con ventajas/desventajas de cada método.
    → Recomendación según el tipo de producto.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que genere
      un reporte comparativo HTML de los 3 métodos de valuación.
      Incluye tabla comparativa, gráficos en Chart.js, análisis
      de impacto en utilidad, IUE e inventario, y recomendación
      final según tipo de producto (perecedero, durable, etc)."
```

---

# FASE 8.4 — Centros de Costos (Departamentos, Proyectos)

## ¿Qué hace esta fase?
Implementa la **gestión de centros de costos** para clasificar los gastos de la empresa por departamento (Producción, Ventas, Administración) o por proyecto (Proyecto A, Proyecto B). Cada gasto se asigna a un centro de costo específico para evaluar su desempeño.

## Estructura del centro de costo

```javascript
const centroCosto = {
  id: "cc-001",
  codigo: "PROD-01",
  nombre: "Producción Planta 1",
  tipo: "PRODUCTIVO",             // PRODUCTIVO, SERVICIO, ADMINISTRATIVO
  responsable: "Ing. Juan Pérez",
  departamento: "PRODUCCION",
  presupuestoAnual: 500000.00,
  gastosAcumulados: 245000.00,
  porcentajeEjecucion: 49.0,
  estado: "ACTIVO",
  creadoEn: "2026-01-01T00:00:00"
};
```

## Tipos de centros de costo

```text
TIPOS DE CENTROS DE COSTO:
─────────────────────────────────────────────────────────────────
1. PRODUCTIVOS: fabrican el producto o prestan el servicio
   • Producción Planta 1
   • Producción Planta 2
   • Taller de mantenimiento

2. DE SERVICIO: apoyan a los productivos
   • Mantenimiento
   • Calidad
   • Almacén

3. ADMINISTRATIVOS: gestión general
   • Gerencia General
   • Contabilidad
   • Recursos Humanos
   • Sistemas

ASIGNACIÓN DE COSTOS:
─────────────────────────────────────────────────────────────────
Los centros de SERVICIO deben distribuir sus costos a los
PRODUCTIVOS al final del período (ej: Mantenimiento distribuye
a Planta 1 y Planta 2 según horas de servicio usadas).
```

## Tareas de la Fase 8.4

```text
[ ] Crear js/modulos/centros-costo.js
    → Clase CentrosCosto con CRUD de centros.
    → crearCentro(datos): valida y guarda un centro.
    → obtenerTodos(filtros): lista con presupuestos y ejecución.
    → asignarGasto(centroId, gastoId, monto): asigna un gasto.
    → calcularEjecucion(centroId): % del presupuesto ejecutado.

[ ] Implementar crearCentro(datos)
    → Crea un nuevo centro de costo.
    → Valida código único, tipo válido.
    → Establece presupuesto anual.
    → Devuelve { exito, centro, errores }.

[ ] Implementar asignarGasto(centroId, gasto, monto)
    → Asigna un gasto específico a un centro de costo.
    → Actualiza el acumulado del centro.
    → Registra la asignación con fecha y documento.
    → Verifica que no exceda presupuesto (alerta, no bloqueo).
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que asigne
      un gasto a un centro de costo. Recibe el ID del centro,
      descripción del gasto y monto. Actualiza el acumulado,
      registra la asignación y alerta si el acumulado supera el
      presupuesto. Devuelve el nuevo % de ejecución."

[ ] Implementar calcularEjecucionPresupuestal(centroId, periodo)
    → Calcula el % del presupuesto ejecutado en el período.
    → Compara con el presupuesto programado.
    → Identifica desviaciones.
    → Devuelve { presupuestado, ejecutado, desviacion, porcentaje }.

[ ] Implementar distribuirCostosServicio(centroServicioId, criterios)
    → Distribuye los costos de un centro de SERVICIO a los PRODUCTIVOS.
    → Usa criterios: horas de servicio, m² ocupados, número de empleados.
    → Genera asientos contables de distribución.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que distribuya
      los costos de un centro de servicio a los centros productivos.
      Recibe criterios de distribución (horas, m², empleados) y
      genera asientos contables de distribución. Devuelve el
      detalle de distribución por centro productivo."
```

---

# FASE 8.5 — Asignación de Costos Indirectos (CIF)

## ¿Qué hace esta fase?
Implementa la **tasa de absorción de CIF** (Costos Indirectos de Fabricación) para distribuir los costos indirectos a los productos. Es fundamental en empresas manufactureras para calcular el costo real de cada producto.

## Cálculo de la tasa CIF

```text
TASA DE ABSORCIÓN CIF = CIF Presupuestado / Base de Asignación
─────────────────────────────────────────────────────────────────
CIF Presupuestado anual:           Bs 600,000
Base de asignación (horas MOD):    30,000 horas
─────────────────────────────────────────────────────────────────
Tasa CIF por hora MOD:             Bs 20 / hora

APLICACIÓN A UN PRODUCTO:
─────────────────────────────────────────────────────────────────
Producto X:
  Materia prima:                   Bs 500
  Mano de obra directa (5 h):      Bs 250
  CIF (5 h × Bs 20):               Bs 100
  ─────────────────────────────────────────────────
  COSTO TOTAL UNITARIO:            Bs 850

Bases de asignación comunes:
  • Horas de mano de obra directa (MOD)
  • Costo de MOD
  • Horas máquina
  • Unidades producidas
  • Costo de materia prima
```

## Tareas de la Fase 8.5

```text
[ ] Implementar calcularTasaCIF(centroId, periodo)
    → Calcula la tasa de absorción de CIF.
    → Tasa = CIF presupuestado / base de asignación presupuestada.
    → Devuelve { cifPresupuestado, basePresupuestada, tasa, unidadBase }.

[ ] Implementar aplicarCIF(productoId, cantidadBase, tasaCIF)
    → Aplica la tasa CIF al producto.
    → CIF aplicado = cantidadBase × tasaCIF.
    → Actualiza el costo del producto.
    → Devuelve { cifAplicado, costoTotalProducto }.

[ ] Implementar calcularVariacionCIF(centroId, periodo)
    → Compara CIF aplicado vs CIF real incurrido.
    → Variación = CIF real - CIF aplicado.
    → Subabsorción (real > aplicado) → costo faltante.
    → Sobreabsorción (aplicado > real) → costo de más.
    → Genera asiento de ajuste al costo de ventas.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que calcule
      la variación de CIF (sub/sobreabsorción). Compara el CIF
      real incurrido contra el CIF aplicado a los productos.
      Si hay subabsorción, incrementa el costo de ventas. Si hay
      sobreabsorción, lo reduce. Genera asiento contable de ajuste."
```

---

# FASE 8.6 — Costeo por Órdenes de Trabajo

## ¿Qué hace esta fase?
Implementa el **costeo por órdenes de trabajo** (job order costing) para empresas que fabrican productos personalizados o por lotes identificables. Cada orden acumula sus costos directos (MP, MOD) y su parte de CIF, y al terminarse se calcula el costo unitario.

## Estructura de la orden de trabajo

```javascript
const ordenTrabajo = {
  id: "ot-2026-0042",
  numero: "OT-2026-0042",
  cliente: "Cliente XYZ",
  productoId: "prod-005",
  descripcion: "Fabricación de 100 mesas de roble",
  fechaInicio: "2026-09-01",
  fechaFin: "2026-09-15",
  estado: "TERMINADA",          // ABIERTA, EN_PROCESO, TERMINADA, CANCELADA
  cantidadProducida: 100,
  
  costos: {
    materiaPrima: 25000.00,
    manoDeObra: 15000.00,
    cifAplicado: 8000.00,
    totalCosto: 48000.00,
    costoUnitario: 480.00
  },
  
  detalleMateriales: [
    { materialId: "mat-001", cantidad: 50, costoUnit: 300, total: 15000 },
    { materialId: "mat-002", cantidad: 100, costoUnit: 100, total: 10000 }
  ],
  
  detalleMO: [
    { empleadoId: "emp-001", horas: 40, costoHora: 50, total: 2000 },
    { empleadoId: "emp-002", horas: 60, costoHora: 45, total: 2700 }
  ]
};
```

## Tareas de la Fase 8.6

```text
[ ] Crear js/modulos/ordenes-trabajo.js
    → Clase OrdenesTrabajo con gestión de órdenes.
    → crearOrden(datos): crea nueva orden.
    → agregarMaterial(ordenId, material, cantidad): agrega MP.
    → agregarManoObra(ordenId, horas, costoHora): agrega MOD.
    → aplicarCIF(ordenId, tasa): aplica CIF.
    → cerrarOrden(ordenId): calcula costo final.

[ ] Implementar crearOrden(datos)
    → Crea una nueva orden de trabajo.
    → Genera número correlativo (OT-AAAA-NNNN).
    → Establece estado ABIERTA.
    → Devuelve { exito, orden, errores }.

[ ] Implementar agregarMaterial(ordenId, materialId, cantidad)
    → Agrega material a la orden.
    → Calcula el costo usando el método de valuación del producto.
    → Descuenta del inventario.
    → Actualiza el acumulado de MP de la orden.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que agregue
      material a una orden de trabajo. Valida stock suficiente,
      calcula el costo según el método de valuación, descuenta
      del inventario y actualiza el acumulado de la orden."

[ ] Implementar cerrarOrden(ordenId)
    → Marca la orden como TERMINADA.
    → Calcula el costo total acumulado.
    → Calcula el costo unitario.
    → Ingresa los productos al inventario terminado.
    → Genera asiento contable: Inventario PT / Inventario PEP.
    → Devuelve { exito, costoTotal, costoUnitario, asiento }.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que cierre
      una orden de trabajo. Suma MP + MOD + CIF, calcula costo
      unitario, ingresa al inventario de productos terminados y
      genera asiento contable de transferencia."
```

---

# FASE 8.7 — Análisis de Margen por Producto

## ¿Qué hace esta fase?
Implementa el **análisis de rentabilidad por producto**, calculando el margen de contribución (precio - costo variable) y el margen neto (precio - costo total) de cada producto. Identifica los productos estrella, los problemáticos y los que deberían descontinuarse.

## Métricas del análisis

```text
ANÁLISIS DE MARGEN POR PRODUCTO — Septiembre 2026
─────────────────────────────────────────────────────────────────
Producto         │ Precio  │ Costo   │ Margen   │ % Margen │ Unidades │ Margen Total
─────────────────┼─────────┼─────────┼──────────┼──────────┼──────────┼─────────────
Laptop ThinkPad  │ Bs 6780 │ Bs 4500 │ Bs 2280  │ 33.6%    │   50     │ Bs 114,000
Mouse Genius     │ Bs 85   │ Bs 45   │ Bs 40    │ 47.1%    │  500     │ Bs 20,000
Teclado Logitech │ Bs 450  │ Bs 280  │ Bs 170   │ 37.8%    │  200     │ Bs 34,000
Monitor Samsung  │ Bs 2500 │ Bs 2200 │ Bs 300   │ 12.0%    │   30     │ Bs 9,000
─────────────────┼─────────┼─────────┼──────────┼──────────┼──────────┼─────────────
TOTAL            │         │         │          │          │          │ Bs 177,000

CLASIFICACIÓN ABC:
─────────────────────────────────────────────────────────────────
• Productos A (top 20% → 80% margen): Laptop, Teclado
• Productos B (medio 30% → 15% margen): Mouse
• Productos C (último 50% → 5% margen): Monitor

RECOMENDACIONES:
  • Laptop: aumentar producción (alta rentabilidad + volumen)
  • Mouse: mantener (alto margen %, bajo volumen)
  • Monitor: evaluar descontinuación (bajo margen % y Bs)
```

## Tareas de la Fase 8.7

```text
[ ] Crear js/modulos/analisis-margen.js
    → Clase AnalisisMargen con métodos de cálculo.
    → calcularMargenProducto(productoId, periodo).
    → calcularMargenCliente(clienteId, periodo).
    → clasificacionABC(periodo).
    → obtenerProductosEstrella(periodo).
    → obtenerProductosProblematicos(periodo).

[ ] Implementar calcularMargenProducto(productoId, periodo)
    → Calcula precio promedio de venta.
    → Calcula costo promedio según método de valuación.
    → Calcula margen unitario y %.
    → Calcula margen total (margen × unidades vendidas).
    → Devuelve { precio, costo, margenUnitario, margenTotal, porcentaje }.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que calcule
      el margen de un producto en un período. Obtiene precio promedio
      de ventas, costo promedio del método de valuación elegido,
      unidades vendidas, y calcula margen unitario, % de margen
      y margen total. Incluye comparación con período anterior."

[ ] Implementar clasificacionABC(periodo)
    → Clasifica productos por aporte al margen total.
    • A: top 20% que aporta 80% del margen
    • B: siguiente 30% que aporta 15%
    • C: último 50% que aporta 5%
    → Devuelve { claseA, claseB, claseC, totales }.

[ ] Implementar recomendarAccion(productoId, periodo)
    → Analiza el desempeño del producto.
    → Recomienda: aumentar producción, mantener, revisar precio,
      reducir costos, o descontinuar.
    → Basado en margen %, volumen, tendencia.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que analice
      el desempeño de un producto y genere recomendaciones
      gerenciales: aumentar producción, mantener, revisar precio,
      reducir costos o descontinuar. Basado en margen %, volumen
      de ventas, tendencia vs período anterior y comparación con
      promedio de la empresa."
```

---

# FASE 8.8 — Análisis de Margen por Cliente

## ¿Qué hace esta fase?
Implementa el **análisis de rentabilidad por cliente**, calculando cuánto margen genera cada cliente. Identifica los clientes rentables, los que solo compran productos de bajo margen, y los que cuestan más atender de lo que generan.

## Métricas del análisis

```text
ANÁLISIS DE MARGEN POR CLIENTE — Septiembre 2026
─────────────────────────────────────────────────────────────────
Cliente          │ Ventas     │ Margen    │ % Margen │ Compras │ Clasificación
─────────────────┼────────────┼───────────┼──────────┼─────────┼──────────────
Empresa ABC SA   │ Bs 45,000  │ Bs 13,500 │ 30.0%    │   12    │ VIP
Comercial XYZ    │ Bs 28,000  │ Bs 7,000  │ 25.0%    │    8    │ Regular
Tienda Don Juan  │ Bs 8,500   │ Bs 2,550  │ 30.0%    │   25    │ Alto volumen
Cliente Nuevo    │ Bs 2,000   │ Bs 400    │ 20.0%    │    1    │ Prospecto

ANÁLISIS DE PARETO (80/20):
─────────────────────────────────────────────────────────────────
Top 20% de clientes → 80% del margen total
Bottom 30% → solo 5% del margen (clientes pequeños)

COSTO DE ATENCIÓN:
─────────────────────────────────────────────────────────────────
Si el costo de atención (ventas, logística, crédito) supera
el margen, el cliente es NO RENTABLE aunque compre mucho.
```

## Tareas de la Fase 8.8

```text
[ ] Implementar calcularMargenCliente(clienteId, periodo)
    → Calcula ventas totales del cliente en el período.
    → Calcula costo de ventas según método de valuación.
    → Calcula margen total y %.
    → Devuelve { ventas, costo, margen, porcentaje, unidades }.

[ ] Implementar analizarCarteraClientes(periodo)
    → Calcula margen de todos los clientes activos.
    → Clasifica en VIP, Regular, Ocasional, No rentable.
    → Identifica clientes que deberían recibir atención especial.
    → Devuelve { totalClientes, vip, regular, ocasional, noRentable }.

[ ] Implementar calcularCostoAtencion(clienteId, periodo)
    → Calcula el costo de atender al cliente (opcional).
    • Visitas de vendedores (horas × tarifa)
    • Fletes especiales
    • Costo financiero por crédito
    • Descuentos otorgados
    → Compara con margen generado.
    → Devuelve { costoAtencion, margenNeto, rentabilidadReal }.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que calcule
      el costo de atender a un cliente (visitas, fletes, costo
      financiero, descuentos) y lo compare con el margen generado.
      Identifica clientes cuya atención cuesta más de lo que
      generan. Devuelve rentabilidad real ajustada."
```

---

# FASE 8.9 — Punto de Equilibrio (Análisis CVP)

## ¿Qué hace esta fase?
Implementa el **análisis Costo-Volumen-Utilidad (CVP)** y el cálculo del **punto de equilibrio**: el nivel de ventas donde la utilidad es cero (ingresos = costos totales). Herramienta clave para planificar y tomar decisiones.

## Fórmula del punto de equilibrio

```text
PUNTO DE EQUILIBRIO EN UNIDADES:
─────────────────────────────────────────────────────────────────
                Costos Fijos Totales
PE (unidades) = ─────────────────────────────
                Precio Unitario - Costo Variable Unitario

PUNTO DE EQUILIBRIO EN Bs:
─────────────────────────────────────────────────────────────────
                Costos Fijos Totales
PE (Bs) = ─────────────────────────────
                Margen de Contribución %

EJEMPLO:
─────────────────────────────────────────────────────────────────
Costos fijos mensuales:              Bs 50,000
Precio promedio de venta:            Bs 1,000
Costo variable unitario:             Bs 600
Margen de contribución unitario:     Bs 400
Margen de contribución %:            40%

PE (unidades) = 50,000 / 400 = 125 unidades
PE (Bs)       = 50,000 / 0.40 = Bs 125,000

Interpretación:
  • Si vende 125 unidades → utilidad = 0
  • Si vende 150 unidades → utilidad = 25 × Bs 400 = Bs 10,000
  • Si vende 100 unidades → pérdida = 25 × Bs 400 = Bs 10,000

MARGEN DE SEGURIDAD:
─────────────────────────────────────────────────────────────────
Ventas reales:                       Bs 200,000
PE en Bs:                            Bs 125,000
Margen de seguridad:                 Bs 75,000 (37.5%)

Interpretación: puede caer 37.5% en ventas antes de tener pérdidas.
```

## Tareas de la Fase 8.9

```text
[ ] Implementar calcularPuntoEquilibrio(periodo)
    → Obtiene costos fijos del período.
    → Calcula margen de contribución % (promedio ponderado).
    → Calcula PE en unidades y en Bs.
    → Calcula margen de seguridad.
    → Devuelve { costosFijos, margenContribucion, peUnidades, peBs, margenSeguridad }.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que calcule
      el punto de equilibrio de la empresa en un período. Obtiene
      costos fijos totales, margen de contribución promedio
      ponderado, y calcula PE en unidades y en Bs. Incluye margen
      de seguridad con ventas reales. Devuelve desglose completo."

[ ] Implementar calcularMargenSeguridad(periodo)
    → Calcula cuánto pueden caer las ventas antes de tener pérdidas.
    → Margen de seguridad = (Ventas reales - PE) / Ventas reales.
    → Devuelve { ventasReales, peBs, margenSeguridadBs, margenSeguridadPct }.

[ ] Implementar simularEscenario(cambioPrecio, cambioVolumen, cambioCostos)
    → Simula cambios en precio, volumen o costos.
    → Recalcula PE, utilidad, margen de seguridad.
    → Para análisis "what-if" (qué pasa si).
    → Devuelve { peOriginal, peNuevo, utilidadOriginal, utilidadNueva }.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que simule
      escenarios 'what-if': qué pasa si el precio sube 5%, si el
      volumen cae 10%, si los costos variables suben 8%. Recalcula
      PE, utilidad y margen de seguridad para cada escenario.
      Devuelve tabla comparativa."

[ ] Implementar generarGraficoPuntoEquilibrio(periodo)
    → Genera gráfico de punto de equilibrio con Chart.js.
    • Eje X: unidades vendidas
    • Eje Y: Bs
    • Línea de ingresos (crece con unidades)
    • Línea de costos totales (fijos + variables)
    • Punto de cruce = PE
    → Devuelve { chartConfig, datos }.
```

---

# FASE 8.10 — Dashboard de Costos

## ¿Qué hace esta fase?
Construye el **dashboard gerencial de costos** que muestra KPIs clave en tiempo real: margen bruto, margen neto, punto de equilibrio, top productos, top clientes, variaciones de CIF, y alertas de presupuesto.

## KPIs del dashboard

```text
DASHBOARD DE COSTOS — Septiembre 2026
─────────────────────────────────────────────────────────────────
KPIs PRINCIPALES:
  • Ventas del mes:                Bs 250,000
  • Costo de ventas:               Bs 150,000 (60%)
  • Utilidad bruta:                Bs 100,000 (40%)
  • Punto de equilibrio:           Bs 125,000
  • Margen de seguridad:           50%
  • CIF aplicado vs real:          Bs 5,000 subabsorción

TOP 5 PRODUCTOS POR MARGEN:
  1. Laptop ThinkPad: Bs 114,000 (64.4% del margen total)
  2. Teclado Logitech: Bs 34,000 (19.2%)
  3. Mouse Genius: Bs 20,000 (11.3%)
  4. Audífonos Sony: Bs 8,500 (4.8%)
  5. Monitor Samsung: Bs 9,000 (5.1%)

ALERTAS:
  ⚠️ Centro de Costo Ventas ejecutó 95% presupuesto (quedan 3 meses)
  ⚠️ Producto Monitor Samsung con margen < 15% (evaluar)
  ✅ Punto de equilibrio superado en 100%
```

## Tareas de la Fase 8.10

```text
[ ] Implementar generarDashboardCostos(periodo)
    → Recopila todos los KPIs del período.
    → Devuelve objeto con todos los datos del dashboard.
    → Incluye comparativo con período anterior.

[ ] Implementar generarAlertasCostos(periodo)
    → Genera alertas inteligentes:
    • Centros de costo cerca del límite presupuestal
    • Productos con margen bajo
    • Clientes no rentables
    • Variaciones significativas de CIF
    → Devuelve { alertasCriticas, alertasAdvertencia, alertasInfo }.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que genere
      alertas inteligentes de costos. Revisa centros de costo
      ejecutados, productos con bajo margen, clientes no rentables,
      variaciones de CIF. Clasifica en críticas (rojo), advertencia
      (amarillo) e informativas (verde)."

[ ] Implementar generarReporteEjecutivo(periodo)
    → Genera un resumen ejecutivo HTML/PDF.
    • KPIs principales
    • Top productos y clientes
    • Variaciones vs período anterior
    • Alertas y recomendaciones
    → Para enviar a gerencia.
```

---

# FASE 8.11 — Generación de Asientos Contables de Costos

## ¿Qué hace esta fase?
Genera los **asientos contables** del sistema de costos que se procesan en el Motor Contable (Módulo 3). Incluye asientos de inventario, órdenes de trabajo, distribución de CIF y variaciones.

## Asientos típicos de costos

```text
ASIENTO DE COMPRA DE MATERIA PRIMA:
─────────────────────────────────────────────────
  Inventario MP (1.1.06.01)        Bs 10,000  (Debe)
  IVA Crédito Fiscal (1.1.08)      Bs 1,300   (Debe)
      Cuentas por Pagar (2.1.01)            Bs 11,300  (Haber)

ASIENTO DE SALIDA DE MP A PRODUCCIÓN:
─────────────────────────────────────────────────
  Inventario PEP (1.1.06.02)       Bs 8,000   (Debe)
      Inventario MP (1.1.06.01)             Bs 8,000   (Haber)

ASIENTO DE MANO DE OBRA DIRECTA:
─────────────────────────────────────────────────
  Inventario PEP (1.1.06.02)       Bs 5,000   (Debe)
      Nómina por Pagar (2.1.08)             Bs 5,000   (Haber)

ASIENTO DE APLICACIÓN DE CIF:
─────────────────────────────────────────────────
  Inventario PEP (1.1.06.02)       Bs 3,000   (Debe)
      CIF Aplicado (4.1.99)                 Bs 3,000   (Haber)

ASIENTO DE PRODUCTOS TERMINADOS:
─────────────────────────────────────────────────
  Inventario PT (1.1.06.03)        Bs 16,000  (Debe)
      Inventario PEP (1.1.06.02)            Bs 16,000  (Haber)

ASIENTO DE VENTA Y COSTO:
─────────────────────────────────────────────────
  Costo de Ventas (5.1.01)         Bs 12,000  (Debe)
      Inventario PT (1.1.06.03)             Bs 12,000  (Haber)

ASIENTO DE VARIACIÓN CIF (subabsorción):
─────────────────────────────────────────────────
  Costo de Ventas (5.1.01)         Bs 2,000   (Debe)
      Variación CIF (5.1.99)                Bs 2,000   (Haber)
```

## Tareas de la Fase 8.11

```text
[ ] Implementar generarAsientoCompraMP(documentoCompra)
    → Genera asiento de compra de materia prima.
    → Debe: Inventario MP + IVA Crédito Fiscal.
    → Haber: Cuentas por Pagar o Bancos.

[ ] Implementar generarAsientoSalidaMP(ordenId, materiales)
    → Genera asiento de salida de MP a producción.
    → Debe: Inventario PEP.
    → Haber: Inventario MP.

[ ] Implementar generarAsientoMOD(ordenId, horas, costoHora)
    → Genera asiento de mano de obra directa.
    → Debe: Inventario PEP.
    → Haber: Nómina por Pagar.

[ ] Implementar generarAsientoCIFAplicado(ordenId, monto)
    → Genera asiento de aplicación de CIF.
    → Debe: Inventario PEP.
    → Haber: CIF Aplicado.

[ ] Implementar generarAsientoProductoTerminado(ordenId)
    → Genera asiento de transferencia a PT.
    → Debe: Inventario PT.
    → Haber: Inventario PEP.

[ ] Implementar generarAsientoVariacionCIF(centroId, periodo)
    → Genera asiento de variación de CIF.
    → Subabsorción: costo de ventas (Debe).
    → Sobreabsorción: costo de ventas (Haber).

[ ] Conectar con Motor Contable (Módulo 3)
    → Todos los asientos pasan a asientosPendientes.
    → El Motor Contable los valida y contabiliza.
    → Aparecen en Libro Diario y Libro Mayor.
```

---

# FASE 8.12 — Vista de Costos (6 tabs)

## ¿Qué hace esta fase?
Construye la **vista unificada de costos** con 6 tabs que integran todas las funcionalidades del módulo.

## Estructura de la vista

```text
VISTA DE COSTOS
├── Tab 1: 📊 Dashboard
│   ├── KPIs principales
│   ├── Gráficos de margen
│   ├── Alertas y recomendaciones
│   └── Comparativo con período anterior
│
├── Tab 2: 📦 Inventario (3 métodos)
│   ├── Selector de método (Promedio/FIFO/LIFO)
│   ├── Tabla de capas (FIFO/LIFO)
│   ├── Comparador lado a lado de los 3 métodos
│   └── Botón para cambiar método
│
├── Tab 3: 🏢 Centros de Costo
│   ├── Lista de centros con presupuesto y ejecución
│   ├── Formulario de nuevo centro
│   ├── Asignación de gastos
│   └── Distribución de costos de servicio
│
├── Tab 4: 🛠️ Órdenes de Trabajo
│   ├── Lista de órdenes (abiertas, en proceso, terminadas)
│   ├── Formulario de nueva orden
│   ├── Detalle de materiales y MO
│   └── Cierre de orden con costo final
│
├── Tab 5: 💰 Análisis de Rentabilidad
│   ├── Sub-tab Productos (margen por producto + ABC)
│   ├── Sub-tab Clientes (margen por cliente + Pareto)
│   └── Recomendaciones gerenciales
│
└── Tab 6: ⚖️ Punto de Equilibrio
    ├── KPIs de PE (unidades y Bs)
    ├── Margen de seguridad
    ├── Gráfico de PE
    └── Simulador de escenarios what-if
```

## Tareas de la Fase 8.12

```text
[ ] Crear vistas/costos.html
    → Sección con 6 tabs.
    → Cada tab con su contenido específico.
    → Estilos CSS para comparador y gráficos.
    → Integración con Chart.js para gráficos.

[ ] Crear js/vistas/costos-vista.js
    → Lógica de la vista de costos (~600 líneas).
    → Manejo de tabs y sub-tabs.
    → Renderizado dinámico de cada sección.
    → Integración con todos los módulos del Módulo 8.

[ ] Implementar Tab 1: Dashboard
    → Renderiza KPIs principales.
    → Gráficos de margen y tendencia.
    → Tarjetas de alertas.

[ ] Implementar Tab 2: Inventario con comparador
    → Selector de método.
    → Tabla de capas (FIFO/LIFO).
    → Comparador visual de los 3 métodos.
    → Botón para simular compras/ventas.
    → 🧠 Mini-Prompt para IA: "Escribe un componente HTML/JS para
      un comparador visual de 3 métodos de valuación. Muestra 3
      columnas (Promedio, FIFO, LIFO) con el mismo inventario,
      el costo de venta calculado, la utilidad bruta, el IUE
      estimado y el valor del inventario. Incluye inputs para
      simular compras y ventas en vivo."

[ ] Implementar Tab 3: Centros de costo
    → CRUD de centros.
    → Tabla con presupuesto, ejecución, desviación.
    → Formulario de asignación de gastos.
    → Gráfico de ejecución presupuestal.

[ ] Implementar Tab 4: Órdenes de trabajo
    → Lista de órdenes por estado.
    → Formulario de nueva orden.
    → Detalle con materiales, MO, CIF.
    → Botón de cierre con cálculo de costo.

[ ] Implementar Tab 5: Análisis de rentabilidad
    → Tabla de margen por producto + clasificación ABC.
    → Tabla de margen por cliente + Pareto.
    → Recomendaciones automáticas.

[ ] Implementar Tab 6: Punto de equilibrio
    → KPIs: PE unidades, PE Bs, margen seguridad.
    → Gráfico de punto de equilibrio (Chart.js).
    → Simulador what-if con sliders.

[ ] Conectar con menú lateral
    → Agregar enlace "🏭 Costos" en index.html.
    → Verificar que el enrutador carga vistas/costos.html.
```

---

# FASE 8.13 — Smoke Test Final y Commit de Cierre

## Checklist de humo (smoke test)

```text
[ ] Smoke test #1: Comparar métodos de valuación
    → Crear producto con 3 compras a diferentes precios.
    → Vender 50% del inventario.
    → Verificar que FIFO da utilidad más alta (inflación).
    → Verificar que LIFO da utilidad más baja.
    → Verificar que Promedio está en el medio.

[ ] Smoke test #2: Sistema de capas (FIFO/LIFO)
    → Agregar 3 capas con distintos costos.
    → Consumir con FIFO → debe consumir capa más antigua primero.
    → Consumir con LIFO → debe consumir capa más reciente primero.
    → Verificar que el inventario restante sea correcto.

[ ] Smoke test #3: Cambio de método de valuación
    → Cambiar un producto de Promedio a FIFO.
    → Verificar que se recalcula el inventario.
    → Verificar que se genera asiento de ajuste.

[ ] Smoke test #4: Centros de costo
    → Crear centro de costo con presupuesto Bs 100,000.
    → Asignar gastos por Bs 50,000.
    → Verificar que ejecución = 50%.
    → Asignar Bs 60,000 más → verificar alerta de exceso.

[ ] Smoke test #5: Órdenes de trabajo
    → Crear orden de trabajo.
    → Agregar materiales, MO y CIF.
    → Cerrar orden y verificar costo unitario.
    → Verificar que producto terminado entra al inventario.

[ ] Smoke test #6: Análisis de margen por producto
    → Calcular margen de productos existentes.
    → Verificar clasificación ABC.
    → Identificar productos estrella y problemáticos.

[ ] Smoke test #7: Punto de equilibrio
    → Calcular PE con datos reales.
    → Verificar que PE × margen = costos fijos.
    → Calcular margen de seguridad.
    → Simular escenario: precio +10% → verificar nuevo PE.

[ ] Smoke test #8: Dashboard de costos
    → Generar dashboard del período.
    → Verificar que todos los KPIs estén presentes.
    → Verificar que alertas se generen correctamente.

[ ] Smoke test #9: Asientos contables
    → Verificar que asientos de costos se generan.
    → Verificar que se procesan en Motor Contable.
    → Verificar que aparecen en Libro Diario y Mayor.

[ ] Smoke test #10: Persistencia
    → Recargar la página (F5).
    → Verificar que capas, centros, órdenes persisten.
    → Verificar en DevTools → LocalStorage.

[ ] Commit de cierre del Módulo 8
    → git add .
    → git commit -m "feat(modulo-8): Contabilidad de Costos completa
    
      - 3 métodos de valuación: Promedio, FIFO/PEPS, LIFO/UEPS
      - Comparador visual de los 3 métodos (herramienta didáctica)
      - Sistema de capas para FIFO y LIFO
      - Centros de costo por departamento y proyecto
      - Tasa de absorción de CIF
      - Costeo por órdenes de trabajo
      - Análisis de margen por producto (clasificación ABC)
      - Análisis de margen por cliente (Pareto 80/20)
      - Punto de equilibrio (análisis CVP)
      - Simulador de escenarios what-if
      - Dashboard gerencial con KPIs y alertas
      - Asientos contables conectados al Motor Contable
      - Smoke test: todos los tests pasan
      
      ⚠️ LIFO implementado solo con fines educativos:
         NIIF (NIC 2) y SIN Bolivia no lo aceptan.
      
      Próximo paso: Módulo 6 - Estados Financieros"
```

---

## 🎯 Criterios de Aceptación del Módulo 8

El Módulo 8 se considera **completado** cuando:

- [x] Los 3 métodos de valuación (Promedio, FIFO, LIFO) funcionan correctamente
- [x] El comparador visual muestra diferencias en utilidad e inventario
- [x] El sistema de capas consume en el orden correcto (FIFO: antiguo → reciente)
- [x] Se pueden crear y gestionar centros de costo con presupuestos
- [x] Los costos indirectos se asignan mediante tasa de absorción
- [x] Las órdenes de trabajo acumulan MP, MOD y CIF
- [x] El margen por producto se calcula y clasifica (ABC)
- [x] El margen por cliente se calcula y clasifica (Pareto)
- [x] El punto de equilibrio se calcula correctamente
- [x] El simulador what-if permite analizar escenarios
- [x] El dashboard muestra todos los KPIs
- [x] Los asientos contables se procesan en el Motor Contable
- [x] Se puede explicar en 5 minutos cada método de valuación
- [x] Se puede demostrar que LIFO está prohibido por NIIF y SIN

---

## 📚 Material de Exposición Generado en Este Módulo

| Archivo | Contenido | Uso en exposición |
|---|---|---|
| `21-contabilidad-costos-explicada.md` | Teoría general de costos | Abrir la explicación |
| `22-metodos-valuacion-inventarios.md` | Teoría de los 3 métodos | Demostrar conocimiento |
| `23-centros-de-costos.md` | Gestión por departamentos | Caso práctico |
| **Comparador visual en vivo** | Mismos datos, 3 métodos | **Demo estrella** |
| Dashboard gerencial | KPIs en tiempo real | Toma de decisiones |

---

## 🚀 Próximos Módulos (adelanto)

| Módulo | Tema | Duración | Depende de |
|---|---|---|---|
| **Módulo 6** | Capa 4 — Estados Financieros | 5–7 h | Módulo 5 (Impuestos) |
| **Módulo 7** | Capa 5 — Cumplimiento SIN | 4–6 h | Módulo 6 |
| **Módulo 9** | Reportes Avanzados + BI | 6–8 h | Módulos 1-8 |

---

## ⚠️ Advertencia final

La tentación aquí es **implementar solo Promedio Ponderado** (que ya existe en el Módulo 2) y dejar FIFO/LIFO como "bonus para después". *"Total, en Bolivia solo se usa Promedio"*. **No lo hagas.** El comparador visual de los 3 métodos con los mismos datos es **la herramienta didáctica más potente del módulo**. En una exposición, poder decir *"vean cómo con exactamente las mismas compras y ventas, el método elegido cambia la utilidad en Bs 6,000 y el IUE a pagar en Bs 1,500 — por eso NIIF prohibió LIFO en 2005, porque permitía manipular utilidades"* es el tipo de insight que demuestra dominio real de contabilidad. Dedica tiempo especial a las Fases 8.2 (capas) y 8.3 (comparador), porque son las que separan un ERP genérico de uno verdaderamente educativo.

**LIFO está implementado solo con fines educativos.** En las notas a los estados financieros y en el código debe quedar claro que:
- ✅ Promedio Ponderado: aceptado por SIN y NIIF
- ✅ FIFO/PEPS: aceptado por SIN y NIIF
- ❌ LIFO/UEPS: **prohibido por NIIF (NIC 2) y por el SIN en Bolivia**

Esta distinción es **otra oportunidad didáctica** para demostrar que el ERP entiende no solo la técnica, sino también la normativa.

---

**¿Siguiente paso?** Cuando estés listo, comenzamos con la **Fase 8.1: Teoría de Contabilidad de Costos** (creando los 3 documentos de aprendizaje), y luego avanzamos a la **Fase 8.2: Sistema de Capas de Inventario** donde implementaremos el soporte para FIFO y LIFO. 🚀
