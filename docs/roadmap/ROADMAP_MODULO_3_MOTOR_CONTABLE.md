# 📁 ROADMAP_MODULO_3_MOTOR_CONTABLE.md

**Proyecto:** ERP Contable Integral Boliviano (Prototipo Educativo / Portafolio)
**Arquitectura:** Frontend Vanilla JS + LocalStorage (sin backend real — enfoque didáctico)
**Versión:** 1.0.0 · **Formato:** Guía Arquitectónica Explicativa
**Tiempo estimado:** 8–10 horas · **Bloquea:** Módulos 4→8 (Nómina, Impuestos, Estados Financieros)
**Depende de:** Módulo 0 (Setup) + Módulo 1 (Documentos) + Módulo 2 (Compras/Ventas)

> **Objetivo del Módulo:** Construir la **Capa 3: Motor Contable** — el corazón del ERP. Aquí se procesan todos los asientos generados por los módulos operativos (compras, ventas, nómina), se valida la **partida doble** (Debe = Haber), se mantiene el **Libro Diario**, el **Libro Mayor**, la **Balanza de Comprobación**, los **asientos de ajuste** (depreciación, provisiones bolivianas) y el **cierre del ejercicio**. Este módulo transforma transacciones sueltas en información contable estructurada que luego se convierte en estados financieros (Módulo 6).

> **Nota didáctica:** Este es el módulo **más técnico y más importante** del ERP. Si lo entiendes bien, entiendes contabilidad. Si lo construyes bien, todo lo demás funciona solo. En una exposición, este es el momento de mostrar cómo una sola compra (registrada en Módulo 2) viaja por el Libro Diario, se clasifica en el Libro Mayor, aparece en la Balanza de Comprobación, y eventualmente llega al Balance General. Esa trazabilidad completa es lo que justifica un ERP frente a Excel.

---

## 🗺️ Mapa del Módulo

```text
Módulo 3
├── Fase 3.1 → Teoría: El Ciclo Contable y la Partida Doble
├── Fase 3.2 → Modelo de datos: Asiento Contable y Líneas
├── Fase 3.3 → js/capas/capa3-motor.js — Motor principal
├── Fase 3.4 → Libro Diario: Registro cronológico de asientos
├── Fase 3.5 → Libro Mayor: Clasificación por cuenta
├── Fase 3.6 → Balanza de Comprobación: Verificación matemática
├── Fase 3.7 → Asientos de ajuste: Depreciación y provisiones bolivianas
├── Fase 3.8 → Cierre del ejercicio: Cuentas de resultado a cero
├── Fase 3.9 → Vistas: Diario, Mayor, Balanza
└── Fase 3.10 → Smoke test final y commit de cierre
```

---

## 🟥 Estado: `[ ] Pendiente`

---

# FASE 3.1 — Teoría: El Ciclo Contable y la Partida Doble

## ¿Qué es la Partida Doble?

```text
╔══════════════════════════════════════════════════════════╗
║  EN CADA TRANSACCIÓN CONTABLE:                          ║
║                                                         ║
║  TOTAL DEBE = TOTAL HABER                              ║
║                                                         ║
║  No existe excepción. Si no cuadra, hay un error.      ║
╚══════════════════════════════════════════════════════════╝
```

La **partida doble** es el sistema contable inventado en el siglo XV por Luca Pacioli. La idea es simple: cada transacción afecta **al menos dos cuentas**, una en el Debe (cargo) y otra en el Haber (abono), y los montos siempre deben ser iguales.

```text
Ejemplo: Compra de mercancía por Bs 5,650 (IVA incluido)

  CUENTA                  │ DEBE (carga) │ HABER (abona)
  ────────────────────────┼──────────────┼──────────────
  Inventario              │ Bs 5,000     │
  IVA Crédito Fiscal      │ Bs 650       │
  Proveedores             │              │ Bs 5,650
  ────────────────────────┼──────────────┼──────────────
  TOTALES                 │ Bs 5,650     │ Bs 5,650  ✓ OK
```

## El Ciclo Contable (6 pasos)

```text
┌──────────────────────────────────────────────────────────────┐
│                     CICLO CONTABLE                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. IDENTIFICACIÓN      ← ¿Qué pasó? (documento fuente)     │
│         ↓                                                    │
│  2. REGISTRO EN DIARIO  ← Asiento cronológico               │
│         ↓                                                    │
│  3. TRASLADO AL MAYOR   ← Clasificar por cuenta             │
│         ↓                                                    │
│  4. BALANZA DE COMPROBACIÓN ← Verificar que cuadra          │
│         ↓                                                    │
│  5. ASIENTOS DE AJUSTE  ← Depreciación, provisiones         │
│         ↓                                                    │
│  6. CIERRE DEL EJERCICIO ← Cuentas de resultado a cero      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Tareas de la Fase 3.1

```text
[ ] Crear docs/aprendizaje/07-partida-doble-explicada.md
    → Explicación teórica de la partida doble (máximo 2 páginas).
    → Incluir 3 ejemplos: compra, venta, pago de nómina.
    → 🧠 Mini-Prompt para IA: "Escribe una explicación didáctica 
      de la partida doble en contabilidad para alguien que nunca 
      estudió contabilidad. Usa 3 ejemplos bolivianos: compra de 
      mercancía con IVA incluido, venta con IVA e IT, y pago de 
      nómina con aguinaldo. Máximo 600 palabras. Explica por qué 
      Debe siempre debe ser igual a Haber."

[ ] Crear docs/aprendizaje/08-ciclo-contable-pasos.md
    → Los 6 pasos del ciclo contable con diagramas.
    → Explicar qué pasa en cada paso y por qué importa.
    → 🧠 Mini-Prompt para IA: "Explica los 6 pasos del ciclo 
      contable adaptado para Bolivia: identificación, registro 
      en diario, traslado al mayor, balanza de comprobación, 
      asientos de ajuste (incluyendo provisiones de aguinaldo 
      y bono de antigüedad), y cierre del ejercicio. Máximo 
      700 palabras. Usa diagramas ASCII."

[ ] Crear docs/aprendizaje/09-cuentas-naturaleza.md
    → Explicar la naturaleza de las cuentas (deudora vs. acreedora).
    → Mostrar la clasificación del plan de cuentas (1-5).
    → 🧠 Mini-Prompt para IA: "Explica la naturaleza de las 
      cuentas contables: cuáles tienen naturaleza deudora (activos, 
      gastos, costos) y cuáles acreedora (pasivos, patrimonio, 
      ingresos). Muestra cómo esto determina si un aumento se 
      registra en el Debe o en el Haber. Incluye la clasificación 
      del plan de cuentas boliviano: 1-Activos, 2-Pasivos, 
      3-Patrimonio, 4-Ingresos, 5-Gastos/Costos."
```

---

# FASE 3.2 — Modelo de Datos: Asiento Contable y Líneas

## ¿Qué hace esta fase?
Define la **estructura exacta** de un asiento contable. Esta estructura es la más importante de todo el ERP: cada asiento que se genere (desde compras, ventas, nómina, impuestos) debe tener exactamente esta forma.

## Estructura del Asiento Contable

```javascript
// Estructura de un ASIENTO CONTABLE completo
const asiento = {
  id: "asiento-001",
  numero: "AD-2026-09-001",          // Número único (Año-Mes-Secuencia)
  fecha: "2026-09-15",               // Fecha de la transacción
  periodoContable: "2026-09",        // Período al que pertenece
  tipo: "COMPRA",                     // COMPRA, VENTA, NOMINA, AJUSTE, CIERRE
  concepto: "Compra de mercancía según Factura F-4521 del proveedor ABC SRL",
  documentoFuenteId: "doc-001",      // Vinculación a Capa 1
  estado: "PROCESADO",               // PENDIENTE, PROCESADO, ANULADO
  lineas: [                           // Líneas del asiento (mínimo 2)
    {
      id: "linea-001",
      cuentaCodigo: "1.1.03",        // Código del plan de cuentas
      cuentaNombre: "Inventario de Mercancías",
      debe: 5000.00,                  // Monto en el Debe (0 si es Haber)
      haber: 0.00,                    // Monto en el Haber (0 si es Debe)
      descripcion: "Entrada de mercancía PROD-001 x10"
    },
    {
      id: "linea-002",
      cuentaCodigo: "1.1.04",
      cuentaNombre: "IVA Crédito Fiscal",
      debe: 650.00,
      haber: 0.00,
      descripcion: "IVA de la factura F-4521"
    },
    {
      id: "linea-003",
      cuentaCodigo: "2.1.01",
      cuentaNombre: "Proveedores",
      debe: 0.00,
      haber: 5650.00,
      descripcion: "Cuenta por pagar a ABC SRL"
    }
  ],
  totalDebe: 5650.00,                // Suma de todos los debe
  totalHaber: 5650.00,               // Suma de todos los haber
  cuadra: true,                       // totalDebe === totalHaber
  creadoPor: "usuario1",
  creadoEn: "2026-09-15T10:30:00"
};
```

## Reglas de validación del asiento

```text
1. Mínimo 2 líneas (no puede haber asiento de 1 línea)
2. totalDebe DEBE ser exactamente igual a totalHaber
3. Cada línea debe tener una cuenta válida del plan de cuentas
4. La fecha debe estar dentro del período contable abierto
5. El documentoFuenteId debe existir en Capa 1
6. El número de asiento debe ser único
7. No se pueden registrar asientos en períodos cerrados
```

## Tareas de la Fase 3.2

```text
[x] Crear js/config/estructura-asiento.js
    → Exportar función crearAsiento(datos): construye un asiento completo.
    → Exportar función crearLinea(cuentaCodigo, debe, haber, descripcion).
    → Exportar constantes: TIPOS_ASIENTO, ESTADOS_ASIENTO.

[x] Implementar la generación de números de asiento
    → Formato: "AD-AAAA-MM-NNN" (AD = Asiento Diario)
    → Ejemplo: "AD-2026-09-001", "AD-2026-09-002"
    → Para ajustes: "AJ-AAAA-MM-NNN" (AJ = Asiento de Ajuste)
    → Para cierre: "CI-AAAA-NNN" (CI = Asiento de Cierre)

[x] Implementar validación de estructura
    → Función validarEstructuraAsiento(asiento):
      - Verifica que tenga al menos 2 líneas.
      - Verifica que totalDebe === totalHaber.
      - Verifica que cada línea tenga cuenta válida.
      - Verifica que la fecha esté en período abierto.
    → Devuelve { valido, errores[] }.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que valide 
      la estructura de un asiento contable. Debe verificar: mínimo 
      2 líneas, total Debe igual a total Haber, cada línea tiene 
      cuenta válida, fecha dentro del período contable abierto. 
      Devuelve objeto { valido: boolean, errores: string[] }."

[x] Crear docs/aprendizaje/10-estructura-asiento.md
    → Documentar la estructura del asiento con ejemplos.
    → Explicar por qué cada campo es necesario.
    → Mostrar un asiento válido y uno inválido (con errores marcados).
```

---

# FASE 3.3 — js/capas/capa3-motor.js: Motor Principal

## ¿Qué hace esta fase?
Implementa el **motor contable** — la clase principal que orquesta todo el ciclo contable. Recibe asientos pendientes de los módulos operativos, los valida, los procesa, y actualiza el Diario, el Mayor y la Balanza.

## Arquitectura del Motor

```text
js/capas/capa3-motor.js
│
├── Clase MotorContable
│   │
│   ├── 📥 ENTRADA
│   │   ├── procesarAsientosPendientes()    ← Procesa la cola de asientos
│   │   ├── registrarAsiento(asiento)       ← Registra un asiento manual
│   │   └── validarAsiento(asiento)         ← Valida antes de registrar
│   │
│   ├── 📖 LIBRO DIARIO
│   │   ├── agregarAlDiario(asiento)        ← Agrega al diario cronológico
│   │   ├── obtenerDiario(filtros)          ← Obtiene diario filtrado
│   │   └── obtenerDiarioPorPeriodo(periodo) ← Diario de un mes
│   │
│   ├── 📊 LIBRO MAYOR
│   │   ├── actualizarMayor(asiento)        ← Actualiza saldos por cuenta
│   │   ├── obtenerMayorPorCuenta(cuenta)   ← Movimientos de una cuenta
│   │   └── obtenerSaldosDeCuentas()        ← Saldos de todas las cuentas
│   │
│   ├── ⚖️ BALANZA DE COMPROBACIÓN
│   │   ├── calcularBalanza(periodo)        ← Genera la balanza
│   │   └── verificarCuadratura()           ← Verifica Debe = Haber
│   │
│   ├── 🔧 AJUSTES
│   │   ├── registrarAsientoAjuste(asiento) ← Registra un ajuste
│   │   └── generarAjustesAutomaticos()     ← Depreciación, provisiones
│   │
│   └── 🔒 CIERRE
│       ├── cerrarPeriodo(periodo)          ← Cierra el mes
│       └── cerrarEjercicio(año)            ← Cierra el año (cuentas resultado)
│
└── Exportación al objeto window
```

## Tareas de la Fase 3.3

```text
[x] Crear js/capas/capa3-motor.js
    → Clase MotorContable con todos los métodos listados arriba.
    → Por ahora, algunos métodos pueden ser stubs (se completan 
      en fases posteriores).

[x] Implementar procesarAsientosPendientes()
    → Lee la colección "asientosPendientes" de localStorage.
    → Para cada asiento:
      1. Validar estructura (validarAsiento).
      2. Si válido → agregarAlDiario + actualizarMayor.
      3. Si inválido → marcar como RECHAZADO con motivo.
    → Devolver resumen: { procesados, rechazados, errores }.
    → 🧠 Mini-Prompt para IA: "Escribe un método JS que procese 
      una cola de asientos contables pendientes. Para cada asiento: 
      valida estructura, verifica partida doble (Debe=Haber), 
      verifica período abierto. Si pasa todo, lo agrega al diario 
      y actualiza el mayor. Si falla, lo marca como rechazado 
      con el motivo específico. Devuelve resumen de procesados 
      y rechazados."

[x] Implementar registrarAsiento(asiento)
    → Punto de entrada para asientos manuales (contador).
    → Valida, registra en diario, actualiza mayor.
    → Devuelve el asiento procesado con su número asignado.

[x] Implementar validarAsiento(asiento)
    → Verifica todas las reglas de la Fase 3.2.
    → Verifica que las cuentas existan en el plan de cuentas.
    → Verifica que la naturaleza de la cuenta sea coherente 
      (ej: no puedes debitar una cuenta de pasivo para aumentarla).
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que valide 
      un asiento contable boliviano. Verifica: partida doble, 
      cuentas válidas del plan de cuentas, coherencia de naturaleza 
      (activos y gastos aumentan por Debe, pasivos, patrimonio e 
      ingresos aumentan por Haber), fecha en período abierto. 
      Devuelve { valido, errores[], advertencias[] }."

[x] Exponer el motor al objeto window
    → En app.js: window.MotorContable = new MotorContable()
    → Esto permite que las vistas HTML usen el motor directamente.
```

---

# FASE 3.4 — Libro Diario: Registro Cronológico de Asientos

## ¿Qué hace esta fase?
Implementa el **Libro Diario** — el registro cronológico de todos los asientos contables. Es como el "diario personal" de la empresa: anota todo lo que pasa, en orden de fecha, sin clasificar.

## Estructura del Libro Diario

```text
LIBRO DIARIO — Septiembre 2026
─────────────────────────────────────────────────────────────────
Asiento: AD-2026-09-001 │ Fecha: 01/09/2026 │ Tipo: COMPRA
Concepto: Compra de mercancía según Factura F-4521 de ABC SRL

  Cuenta                    │ Debe     │ Haber
  ──────────────────────────┼──────────┼──────────
  Inventario de Mercancías  │ 5,000.00 │
  IVA Crédito Fiscal        │ 650.00   │
  Proveedores               │          │ 5,650.00
  ──────────────────────────┼──────────┼──────────
  TOTALES                   │ 5,650.00 │ 5,650.00 ✓

─────────────────────────────────────────────────────────────────
Asiento: AD-2026-09-002 │ Fecha: 03/09/2026 │ Tipo: VENTA
Concepto: Venta de mercancía según Factura F-11111 a Cliente XYZ

  Cuenta                    │ Debe     │ Haber
  ──────────────────────────┼──────────┼──────────
  Clientes                  │ 11,300.00│
  Ventas de Mercancías      │          │ 10,000.00
  IVA Débito Fiscal         │          │ 1,300.00
  ──────────────────────────┼──────────┼──────────
  TOTALES                   │ 11,300.00│ 11,300.00 ✓

─────────────────────────────────────────────────────────────────
Asiento: AD-2026-09-003 │ Fecha: 03/09/2026 │ Tipo: COSTO_VENTA
Concepto: Costo de ventas según despacho PED-2026-001

  Cuenta                    │ Debe     │ Haber
  ──────────────────────────┼──────────┼──────────
  Costo de Ventas           │ 5,000.00 │
  Inventario de Mercancías  │          │ 5,000.00
  ──────────────────────────┼──────────┼──────────
  TOTALES                   │ 5,000.00 │ 5,000.00 ✓
```

## Tareas de la Fase 3.4

```text
[x] Implementar agregarAlDiario(asiento)
    → Agrega el asiento a la colección "libroDiario" en localStorage.
    → Asigna número correlativo si no lo tiene.
    → Ordena por fecha y número.
    → Verifica que no exista un asiento con el mismo número.

[x] Implementar obtenerDiario(filtros)
    → Filtros opcionales: { fechaDesde, fechaHasta, tipo, cuentaCodigo }.
    → Devuelve array de asientos filtrados.
    → Ordenado por fecha ascendente y número ascendente.

[x] Implementar obtenerDiarioPorPeriodo(periodo)
    → Devuelve todos los asientos del período "AAAA-MM".
    → Incluye resumen: totalDebe, totalHaber, cantidadAsientos.

[x] Implementar obtenerDiarioPorDocumento(documentoFuenteId)
    → Busca el asiento vinculado a un documento fuente específico.
    → Para trazabilidad: desde Capa 1 → Capa 3.

[x] Implementar anularAsiento(asientoId, motivo)
    → No elimina el asiento (por trazabilidad).
    → Crea un asiento REVERSO con las líneas invertidas.
    → Marca el original como ANULADO.
    → 🧠 Mini-Prompt para IA: "Escribe un método JS para anular 
      un asiento contable. No debe eliminar el asiento original 
      (por trazabilidad), sino crear un asiento reverso con las 
      líneas invertidas (lo que estaba en Debe pasa a Haber y 
      viceversa). El concepto del reverso debe indicar 'ANULACIÓN 
      DE [número original] - [motivo]'."
```

---

# FASE 3.5 — Libro Mayor: Clasificación por Cuenta

## ¿Qué hace esta fase?
Implementa el **Libro Mayor** — la clasificación de los movimientos por cuenta contable. Mientras el Diario es cronológico (todo mezclado por fecha), el Mayor es analítico (cada cuenta tiene su propia ficha con sus movimientos).

## Estructura del Libro Mayor

```text
LIBRO MAYOR — Cuenta: Inventario de Mercancías (1.1.03)
─────────────────────────────────────────────────────────────────
Fecha       │ Asiento     │ Concepto              │ Debe     │ Haber    │ Saldo
─────────────────────────────────────────────────────────────────
01/09/2026  │ AD-09-001   │ Compra mercancía      │ 5,000.00 │          │ 5,000.00
03/09/2026  │ AD-09-003   │ Costo de ventas       │          │ 5,000.00 │ 0.00
10/09/2026  │ AD-09-005   │ Compra mercancía      │ 3,000.00 │          │ 3,000.00
─────────────────────────────────────────────────────────────────
TOTALES     │             │                       │ 8,000.00 │ 5,000.00 │ 3,000.00

─────────────────────────────────────────────────────────────────
LIBRO MAYOR — Cuenta: Proveedores (2.1.01)
─────────────────────────────────────────────────────────────────
Fecha       │ Asiento     │ Concepto              │ Debe     │ Haber    │ Saldo
─────────────────────────────────────────────────────────────────
01/09/2026  │ AD-09-001   │ Compra mercancía      │          │ 5,650.00 │ 5,650.00
15/09/2026  │ AD-09-010   │ Pago a proveedor      │ 5,650.00 │          │ 0.00
─────────────────────────────────────────────────────────────────
TOTALES     │             │                       │ 5,650.00 │ 5,650.00 │ 0.00
```

## Tareas de la Fase 3.5

```text
[x] Implementar actualizarMayor(asiento)
    → Para cada línea del asiento:
      - Si la cuenta no existe en el mayor → crearla.
      - Agregar el movimiento a la ficha de la cuenta.
      - Recalcular el saldo acumulado.
    → Guardar en colección "libroMayor" de localStorage.

[x] Implementar obtenerMayorPorCuenta(cuentaCodigo, filtros)
    → Devuelve todos los movimientos de una cuenta específica.
    → Filtros opcionales: { fechaDesde, fechaHasta, periodoContable }.
    → Incluye saldos acumulados después de cada movimiento.

[x] Implementar obtenerSaldosDeCuentas(periodo)
    → Devuelve un array con el saldo de cada cuenta al cierre del período.
    → Formato: { cuentaCodigo, cuentaNombre, saldoDeudor, saldoAcreedor }.
    → Este método es la base para la Balanza de Comprobación.

[x] Implementar obtenerMovimientosDeCuenta(cuentaCodigo, periodo)
    → Devuelve todos los movimientos de una cuenta en un período.
    → Para mostrar en la vista de Mayor.

[x] Implementar calcularSaldoInicial(cuentaCodigo, periodo)
    → Suma los saldos de todos los períodos anteriores.
    → Para mostrar el saldo inicial del período actual.
```

---

# FASE 3.6 — Balanza de Comprobación: Verificación Matemática

## ¿Qué hace esta fase?
Implementa la **Balanza de Comprobación** — el reporte que verifica que la contabilidad esté matemáticamente correcta. Suma todos los movimientos del Debe y del Haber, y todos los saldos deudores y acreedores. Si no cuadran, hay un error en algún asiento.

## Estructura de la Balanza

```text
BALANZA DE COMPROBACIÓN — Septiembre 2026
─────────────────────────────────────────────────────────────────
Cuenta                    │ Mov. Debe  │ Mov. Haber │ Saldo Deudor │ Saldo Acreedor
─────────────────────────────────────────────────────────────────
Bancos                    │ 16,950.00  │ 5,650.00   │ 11,300.00    │
Clientes                  │ 11,300.00  │ 0.00       │ 11,300.00    │
Inventario                │ 8,000.00   │ 5,000.00   │ 3,000.00     │
IVA Crédito Fiscal        │ 650.00     │ 0.00       │ 650.00       │
Maquinaria (neto)         │ 20,000.00  │ 167.00     │ 19,833.00    │
Proveedores               │ 5,650.00   │ 5,650.00   │              │ 0.00
IVA Débito Fiscal         │ 0.00       │ 1,300.00   │              │ 1,300.00
Nómina por Pagar          │ 0.00       │ 37,000.00  │              │ 37,000.00
Ventas                    │ 0.00       │ 10,000.00  │              │ 10,000.00
Costo de Ventas           │ 5,000.00   │ 0.00       │ 5,000.00     │
Gastos de Nómina          │ 50,000.00  │ 0.00       │ 50,000.00    │
Depreciación              │ 167.00     │ 0.00       │ 167.00       │
─────────────────────────────────────────────────────────────────
TOTALES                   │ 117,717.00 │ 64,767.00  │ 101,250.00   │ 48,300.00
─────────────────────────────────────────────────────────────────

Verificación:
  Movimientos: Debe (117,717) ≠ Haber (64,767) ❌
  → Normal: hay asientos de ajuste pendientes (provisiones)
  
  Saldos: Deudor (101,250) ≠ Acreedor (48,300) ❌
  → Normal antes de ajustes. Después de todos los ajustes, 
    DEBE cuadrar exactamente.
```

## Tareas de la Fase 3.6

```text
[x] Implementar calcularBalanza(periodo)
    → Recorre todas las cuentas del Libro Mayor.
    → Para cada cuenta: suma movimientos Debe, movimientos Haber.
    → Calcula saldo: si es cuenta deudora (activo/gasto) → Debe − Haber.
    → Si es cuenta acreedora (pasivo/patrimonio/ingreso) → Haber − Debe.
    → Devuelve objeto con todas las cuentas y totales.

[x] Implementar verificarCuadratura()
    → Compara total movimientos Debe vs. total movimientos Haber.
    → Compara total saldos Deudores vs. total saldos Acreedores.
    → Si no cuadran → devolver diferencia y posibles causas.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que calcule 
      la balanza de comprobación desde un libro mayor. Para cada 
      cuenta: suma movimientos debe y haber, calcula saldo según 
      naturaleza (deudora o acreedora). Devuelve la balanza completa 
      y un boolean indicando si cuadra. Si no cuadra, sugiere 
      posibles causas (asiento sin contrapartida, error de digitación)."

[x] Implementar detectarErroresComunes()
    → Verificar asientos con una sola línea (error grave).
    → Verificar asientos donde Debe ≠ Haber (error grave).
    → Verificar cuentas con saldo negativo cuando no debería.
    → Verificar cuentas que no tuvieron movimiento en el período.

[x] Crear la estructura para la vista de Balanza
    → Tabla con columnas: Cuenta, Mov. Debe, Mov. Haber, Saldo Deudor, Saldo Acreedor.
    → Fila de totales al final.
    → Indicador visual: ✓ verde si cuadra, ❌ rojo si no.
```

---

# FASE 3.7 — Asientos de Ajuste: Depreciación y Provisiones Bolivianas

## ¿Qué hace esta fase?
Implementa los **asientos de ajuste** que se generan automáticamente al cierre de cada mes. Estos son los ajustes que hacen que la contabilidad refleje la realidad económica, no solo los movimientos de caja.

## Asientos de ajuste bolivianos

```text
1. DEPRECIACIÓN DE ACTIVOS FIJOS (mensual)
   Gasto de Depreciación          Bs 167    (Debe)
       Depreciación Acumulada              Bs 167    (Haber)

2. PROVISIÓN DE AGUINALDO (mensual, 1/12 del estimado anual)
   Gasto de Aguinaldo             Bs 4,167  (Debe)
       Aguinaldo por Pagar                 Bs 4,167  (Haber)

3. PROVISIÓN DE BONO DE ANTIGÜEDAD (mensual)
   Gasto de Bono de Antigüedad    Bs 2,500  (Debe)
       Bono de Antigüedad por Pagar        Bs 2,500  (Haber)

4. PROVISIÓN DE INDEMNIZACIÓN (mensual, aplica también a renuncia)
   Gasto de Indemnización         Bs 1,000  (Debe)
       Indemnización por Pagar             Bs 1,000  (Haber)

5. DEVENGADOS (gastos ocurridos pero no pagados)
   Gasto de Servicios             Bs 1,000  (Debe)
       Servicios por Pagar                 Bs 1,000  (Haber)

6. IT PAGADO EN EL MES (se usa como pago a cuenta del IUE)
   IT por Pagar                   Bs 339    (Debe)
       Bancos                              Bs 339    (Haber)

⚠️ NOTA: El ajuste por inflación con UFV está SUSPENDIDO desde 
   diciembre 2020. No generar asientos de reexpresión por inflación.
```

## Tareas de la Fase 3.7

```text
[x] Implementar generarAjustesAutomaticos(periodo)
    → Genera todos los asientos de ajuste para el período.
    → Los marca como tipo "AJUSTE" y número "AJ-AAAA-MM-NNN".
    → Los agrega a la cola de asientos pendientes.

[x] Implementar generarAsientoDepreciacion(periodo)
    → Calcula la depreciación mensual de cada activo fijo.
    → Método: línea recta (costo − valor residual) ÷ vida útil.
    → Genera el asiento: Gasto Depreciación / Depreciación Acumulada.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que calcule 
      la depreciación mensual por línea recta para activos fijos 
      en Bolivia. Fórmula: (costo − valor residual) ÷ (vida útil 
      en años × 12 meses). Genera el asiento contable: Gasto de 
      Depreciación (Debe) / Depreciación Acumulada (Haber)."

[x] Implementar generarAsientoProvisionAguinaldo(periodo)
    → Calcula 1/12 del aguinaldo estimado anual.
    → Aguinaldo = promedio del total ganado de los últimos 3 meses.
    → Genera el asiento: Gasto Aguinaldo / Aguinaldo por Pagar.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que calcule 
      la provisión mensual de aguinaldo en Bolivia. El aguinaldo 
      es 1 mes del 'total ganado' (promedio últimos 3 meses). 
      La provisión mensual es 1/12 del estimado anual. Genera 
      el asiento: Gasto de Aguinaldo (Debe) / Aguinaldo por Pagar 
      (Haber). Incluye la lógica para el segundo aguinaldo 
      condicional (solo si PIB > 4.5%)."

[x] Implementar generarAsientoProvisionBonoAntiguedad(periodo)
    → Calcula la provisión mensual del bono de antigüedad.
    → Base: 3 × SMN vigente.
    → Porcentaje: según años de servicio (5% a 50%).
    → Genera el asiento: Gasto Bono / Bono por Pagar.

[x] Implementar generarAsientoProvisionIndemnizacion(periodo)
    → Calcula la provisión mensual de indemnización.
    → 1 mes de total ganado por año de servicio, proporcional.
    → ⚠️ Aplica también a renuncia voluntaria (DS 28699).
    → Genera el asiento: Gasto Indemnización / Indemnización por Pagar.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que calcule 
      la provisión mensual de indemnización por tiempo de servicio 
      en Bolivia. La indemnización es 1 mes de 'total ganado' 
      (promedio últimos 3 meses) por cada año de servicio, 
      proporcional por fracción. IMPORTANTE: aplica también a 
      renuncia voluntaria (DS 28699), no solo a despido. 
      La provisión mensual es 1/12 del acumulado."

[x] Implementar registrarAsientoAjuste(asiento)
    → Registra un asiento de ajuste manual (contador).
    → Valida, registra en diario, actualiza mayor.
    → Número con prefijo "AJ-" en vez de "AD-".

[x] Crear docs/aprendizaje/11-provisiones-bolivianas.md
    → Explicar cada provisión boliviana con ejemplos numéricos.
    → Incluir la particularidad de la indemnización en renuncia.
    → 🧠 Mini-Prompt para IA: "Explica las provisiones contables 
      obligatorias en Bolivia: aguinaldo de Navidad, segundo 
      aguinaldo condicional (DS 1802), bono de antigüedad 
      (base 3 SMN, DS 21060), e indemnización por tiempo de 
      servicio (DS 28699, aplica a renuncia voluntaria). 
      Incluye ejemplos numéricos y los asientos contables 
      de provisión mensual."
```

---

# FASE 3.8 — Cierre del Ejercicio: Cuentas de Resultado a Cero

## ¿Qué hace esta fase?
Implementa el **cierre del ejercicio** — el proceso que "borra" las cuentas de resultados (ingresos, gastos, costos) para empezar el nuevo período con saldo cero. Las cuentas de balance (activos, pasivos, patrimonio) NO se cierran: acumulan de período en período.

## Asiento de cierre

```text
CIERRE DEL EJERCICIO 2026
─────────────────────────────────────────────────────────────────
CUENTAS QUE SE CIERRAN (temporales):
  Ventas                        Bs 150,000  (Debe)   ← Se cierra
  Ingresos No Operativos        Bs 5,000    (Debe)   ← Se cierra
      Costo de Ventas                      Bs 80,000  (Haber)  ← Se cierra
      Gastos de Nómina                     Bs 40,000  (Haber)  ← Se cierra
      Gastos de Servicios                  Bs 10,000  (Haber)  ← Se cierra
      Depreciación                         Bs 2,000   (Haber)  ← Se cierra
      IT 3%                                Bs 4,500   (Haber)  ← Se cierra
      Utilidad del Ejercicio               Bs 18,500  (Haber)  ← Resultado

TRANSFERENCIA DE UTILIDAD:
  Utilidad del Ejercicio        Bs 18,500   (Debe)
      Utilidades Retenidas                 Bs 18,500  (Haber)

DESPUÉS DEL CIERRE:
  Todas las cuentas de resultados (4 y 5) tienen saldo CERO.
  Las cuentas de balance (1, 2, 3) mantienen sus saldos.
  La utilidad neta se transfiere a Utilidades Retenidas.
```

## Tareas de la Fase 3.8

```text
[x] Implementar cerrarPeriodo(periodo)
    → Marca el período como CERRADO.
    → No se pueden registrar más asientos en ese período.
    → Genera un resumen del período: ingresos, gastos, utilidad.

[x] Implementar cerrarEjercicio(año)
    → Identifica todas las cuentas de resultados (grupos 4 y 5).
    → Genera el asiento de cierre con todas las cuentas de resultado.
    → Calcula la utilidad o pérdida neta.
    → Genera el asiento de transferencia a Utilidades Retenidas.
    → Número con prefijo "CI-" (Cierre).
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que genere 
      el asiento de cierre del ejercicio contable. Debe: identificar 
      todas las cuentas de ingresos (grupo 4) y gastos/costos 
      (grupo 5), calcular la utilidad o pérdida neta, generar 
      el asiento de cierre (debitar ingresos, acreditar gastos, 
      diferencia a Utilidad del Ejercicio), y luego transferir 
      la utilidad a Utilidades Retenidas. Si hay pérdida, el 
      asiento es inverso."

[x] Implementar reaperturarEjercicio(año)
    → Solo para contadores admin.
    → Anula el asiento de cierre.
    → Permite registrar ajustes en el período cerrado.
    → ⚠️ Debe dejar rastro de quién y cuándo reabrió.

[x] Implementar calcularUtilidadNeta(año)
    → Suma todos los ingresos del año.
    → Resta todos los gastos y costos del año.
    → Devuelve la utilidad o pérdida neta.
    → Este dato es la base para el IUE (Módulo 5).

[x] Crear docs/aprendizaje/12-cierre-ejercicio.md
    → Explicar el cierre del ejercicio con ejemplos.
    → Mostrar qué cuentas se cierran y cuáles no.
    → Explicar la diferencia entre utilidad contable y utilidad 
      imponible (para el IUE).
    → 🧠 Mini-Prompt para IA: "Explica el cierre del ejercicio 
      contable en Bolivia. Muestra qué cuentas se cierran 
      (ingresos, gastos, costos) y cuáles no (activos, pasivos, 
      patrimonio). Explica cómo se calcula la utilidad neta y 
      cómo se transfiere a utilidades retenidas. Menciona que 
      esta utilidad contable es el punto de partida para el 
      IUE del 25% (Formulario 500)."
```

---

# FASE 3.9 — Vistas: Diario, Mayor, Balanza

## ¿Qué hace esta fase?
Construye las **pantallas** donde el usuario visualiza el Libro Diario, el Libro Mayor y la Balanza de Comprobación. Estas son las vistas más "contables" del ERP — las que un contador usaría todos los días.

## Tareas de la Fase 3.9

```text
[x] Crear vistas/libro-diario.html
    → Tabla cronológica de todos los asientos.
    → Filtros: período contable, tipo de asiento.
    → Cada asiento expandible para ver sus líneas.
    → Búsqueda por concepto o número de asiento.

[x] Crear vistas/libro-mayor.html
    → Selector de cuenta (dropdown con todas las cuentas).
    → Tabla de movimientos de la cuenta seleccionada.
    → Saldo acumulado después de cada movimiento.
    → Filtros: período contable.

[x] Crear vistas/balanza-comprobacion.html
    → Tabla con todas las cuentas y sus saldos.
    → Columnas: Cuenta, Mov. Debe, Mov. Haber, Saldo Deudor, Saldo Acreedor.
    → Fila de totales al final.
    → Indicador visual: ✓ verde si cuadra, ❌ rojo si no.
    → Botón "Generar Balanza" que llama a window.MotorContable.calcularBalanza().

[x] Crear vistas/asientos.html (registro manual)
    → Formulario para registrar asientos manuales.
    → Selector de cuenta, monto Debe, monto Haber.
    → Validación en tiempo real: muestra si Debe = Haber.
    → Botón "Registrar" que llama a window.MotorContable.registrarAsiento().

[x] Crear js/vistas/motor-vista.js
    → Lógica de las vistas del motor contable.
    → Manejar filtros, búsquedas, expansión de asientos.
    → Conectar con window.MotorContable.

[x] Conectar con el menú lateral
    → Agregar sección "📚 Motor Contable" con sub-enlaces:
      ├── Libro Diario
      ├── Libro Mayor
      ├── Balanza de Comprobación
      └── Nuevo Asiento Manual
```

---

# FASE 3.10 — Smoke Test Final y Commit de Cierre

## Checklist de humo (smoke test)

```text
[x] Smoke test #1: Procesar asientos pendientes del Módulo 2
    → Ejecutar window.MotorContable.procesarAsientosPendientes()
    → Verificar que los asientos de compras/ventas del Módulo 2 
      se procesaron correctamente
    → Verificar que aparecieron en el Libro Diario
    → Verificar que el Libro Mayor se actualizó

[x] Smoke test #2: Verificar la partida doble
    → Registrar un asiento manual donde Debe ≠ Haber
    → Debe ser RECHAZADO con mensaje claro
    → Registrar un asiento manual donde Debe = Haber
    → Debe ser ACEPTADO y aparecer en el Diario

[x] Smoke test #3: Generar la Balanza de Comprobación
    → Ejecutar window.MotorContable.calcularBalanza("2026-09")
    → Verificar que los totales de movimientos cuadran
    → Verificar que los saldos son coherentes

[x] Smoke test #4: Generar asientos de ajuste automáticos
    → Ejecutar window.MotorContable.generarAjustesAutomaticos("2026-09")
    → Verificar que se generaron: depreciación, provisión aguinaldo, 
      provisión bono antigüedad, provisión indemnización
    → Verificar que los asientos tienen número con prefijo "AJ-"

[x] Smoke test #5: Cerrar el ejercicio
    → Ejecutar window.MotorContable.cerrarEjercicio(2026)
    → Verificar que las cuentas de resultados quedaron en cero
    → Verificar que la utilidad se transfirió a Utilidades Retenidas
    → Verificar que las cuentas de balance mantienen sus saldos

[x] Smoke test #6: Trazabilidad completa
    → Desde un documento fuente (Capa 1), navegar hasta su asiento 
      (Capa 3) y luego hasta la cuenta en el Libro Mayor
    → Verificar que la cadena está completa: 
      Documento → Asiento → Cuenta en Mayor → Saldo en Balanza

[x] Smoke test #7: Persistencia
    → Recargar la página (F5)
    → El Libro Diario, Mayor y Balanza deben seguir cargando
    → Abrir DevTools → LocalStorage → verificar colecciones

[x] Commit de cierre del Módulo 3
    → git add .
    → git commit -m "feat(modulo-3): Motor Contable completo
    
      - Libro Diario: registro cronológico de asientos
      - Libro Mayor: clasificación por cuenta con saldos
      - Balanza de Comprobación: verificación matemática
      - Asientos de ajuste: depreciación, provisiones bolivianas
      - Cierre del ejercicio: cuentas de resultado a cero
      - Validación de partida doble (Debe = Haber)
      - Trazabilidad completa: documento → asiento → mayor → balanza
      - Smoke test: todos los tests pasan
      
      Próximo paso: Módulo 4 - Nómina Boliviana"
```

---

## 🎯 Criterios de Aceptación del Módulo 3

El Módulo 3 se considera **completado** cuando:

- [x] Los asientos del Módulo 2 se procesan correctamente
- [x] La partida doble se valida siempre (Debe = Haber)
- [x] El Libro Diario muestra todos los asientos en orden cronológico
- [x] El Libro Mayor muestra los movimientos por cuenta con saldos
- [x] La Balanza de Comprobación cuadra (o explica por qué no)
- [x] Los asientos de ajuste se generan automáticamente
- [x] El cierre del ejercicio deja las cuentas de resultado en cero
- [x] La trazabilidad es completa: documento → asiento → mayor → balanza
- [x] No se pueden registrar asientos en períodos cerrados
- [x] Se puede explicar en 5 minutos cómo funciona el ciclo contable

---

## 📚 Material de Exposición Generado en Este Módulo

| Archivo | Contenido | Uso en exposición |
|---|---|---|
| `07-partida-doble-explicada.md` | Teoría de partida doble | Abrir la explicación |
| `08-ciclo-contable-pasos.md` | 6 pasos del ciclo | Mostrar el flujo |
| `09-cuentas-naturaleza.md` | Naturaleza de cuentas | Explicar Debe/Haber |
| `10-estructura-asiento.md` | Estructura del asiento | Mostrar el modelo |
| `11-provisiones-bolivianas.md` | Provisiones específicas | Demostrar conocimiento |
| `12-cierre-ejercicio.md` | Cierre contable | Explicar el cierre |

---

## 🚀 Próximos Módulos (adelanto)

| Módulo | Tema | Duración | Depende de |
|---|---|---|---|
| **Módulo 4** | Capa 2 — Nómina Boliviana | 6–8 h | Módulo 3 |
| **Módulo 5** | Capa 2 — Impuestos (IVA, IT, IUE) | 6–8 h | Módulo 3 |
| **Módulo 6** | Capa 4 — Estados Financieros | 5–7 h | Módulo 5 |
| **Módulo 7** | Capa 5 — Cumplimiento SIN | 4–6 h | Módulo 6 |
| **Módulo 8** | Migración a SaaS real (opcional) | 10–15 h | Módulo 7 |

---

## ⚠️ Advertencia final

La tentación aquí es **saltarse las provisiones bolivianas** porque parecen "extras" que no afectan el flujo principal. *"Total, la depreciación y el aguinaldo los puedo agregar después"*. **No lo hagas.** Las provisiones de aguinaldo, bono de antigüedad e indemnización son **lo que hace que este ERP sea boliviano**. En una exposición, poder decir *"este sistema provisiona automáticamente el aguinaldo de Navidad, el bono de antigüedad sobre 3 SMN, y la indemnización que aplica incluso a renuncia voluntaria según el DS 28699"* es lo que demuestra que no solo sabes programar — sabes contabilidad boliviana. Dedica tiempo a que cada provisión funcione correctamente con ejemplos numéricos reales.

---

**¿Siguiente paso?** Cuando completes este Módulo 3, avísame y generamos el **ROADMAP_MODULO_4_NOMINA_BOLIVIANA.md** con el mismo formato. 🚀
