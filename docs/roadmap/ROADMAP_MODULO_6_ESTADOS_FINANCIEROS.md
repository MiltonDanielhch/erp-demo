# 📁 ROADMAP_MODULO_6_ESTADOS_FINANCIEROS.md

**Proyecto:** ERP Contable Integral Boliviano (Prototipo Educativo / Portafolio)
**Arquitectura:** Frontend Vanilla JS + LocalStorage (sin backend real — enfoque didáctico)
**Versión:** 1.0.0 · **Formato:** Guía Arquitectónica Explicativa
**Tiempo estimado:** 5–7 horas · **Bloquea:** Módulos 7→8 (Cumplimiento SIN, Migración SaaS)
**Depende de:** Módulo 0 (Setup) + Módulo 3 (Motor Contable) + Módulo 5 (Impuestos)

> **Objetivo del Módulo:** Construir la **Capa 4: Estados Financieros** — la salida principal del ERP para la gerencia, el SIN, los bancos y los socios. Aquí se genera el **Estado de Resultados** (pérdidas y ganancias), el **Balance General** (situación financiera), el **Estado de Flujo de Efectivo**, las **Notas a los Estados Financieros**, los **estados comparativos** y las **razones financieras** (*ratios*). Estos estados son la base para el Formulario 500 (IUE) y el Formulario 605 (envío digital al SIN vía SIAT). En Bolivia, se rigen por las **NC (Normas de Contabilidad) del CTNAC**, no por NIIF puras, y el ajuste por inflación con UFV está **suspendido desde diciembre 2020**.

> **Nota didáctica:** Este módulo es donde todo lo anterior **se materializa en números que la gerencia entiende**. El contador registra asientos, pero el gerente quiere saber: "¿Ganamos o perdimos?", "¿Cuánto tenemos?", "¿Podemos pagar nuestras deudas?". En una exposición, este es el momento de mostrar cómo una sola venta (registrada en Módulo 2) termina afectando la utilidad neta del Estado de Resultados, el saldo de clientes en el Balance General, y la liquidez en el Flujo de Efectivo — todo automáticamente, sin que nadie lo copie a mano.

---

## 🗺️ Mapa del Módulo

```text
Módulo 6
├── Fase 6.1 → Teoría: Estados Financieros según las NC del CTNAC
├── Fase 6.2 → Estado de Resultados (Pérdidas y Ganancias)
├── Fase 6.3 → Balance General (Estado de Situación Financiera)
├── Fase 6.4 → Estado de Flujo de Efectivo
├── Fase 6.5 → Notas a los Estados Financieros
├── Fase 6.6 → Estados Comparativos (mes vs mes, año vs año)
├── Fase 6.7 → Razones Financieras (ratios)
├── Fase 6.8 → Vinculación con IUE (Form. 500) y SIAT (Form. 605)
├── Fase 6.9 → Vista de Estados Financieros
└── Fase 6.10 → Smoke test final y commit de cierre
```

---

## 🟥 Estado: `[ ] Pendiente`

---

# FASE 6.1 — Teoría: Estados Financieros según las NC del CTNAC

## ¿Qué son los Estados Financieros?

```text
╔══════════════════════════════════════════════════════════════════╗
║  LOS ESTADOS FINANCIEROS SON LA "FOTO" DE LA EMPRESA:           ║
║                                                                  ║
║  📊 Estado de Resultados    → ¿Ganamos o perdimos?              ║
║  📋 Balance General         → ¿Qué tenemos y qué debemos?       ║
║  💧 Estado de Flujo         → ¿De dónde entró y a dónde salió   ║
║     de Efectivo                el dinero?                        ║
║  📝 Notas a los EEFF        → Explicaciones y detalles          ║
║                                                                  ║
║  En Bolivia, se rigen por las NC del CTNAC (no NIIF puras).     ║
║  El ajuste por inflación (UFV) está SUSPENDIDO desde dic/2020.  ║
╚══════════════════════════════════════════════════════════════════╝
```

## ¿Quién los usa y para qué?

```text
┌─────────────────────────────────────────────────────────────────┐
│ USUARIO          │ ESTADO QUE MÁS USA        │ PARA QUÉ         │
├──────────────────┼───────────────────────────┼──────────────────┤
│ Gerente / Dueño  │ Estado de Resultados      │ Saber si ganó    │
│ Contador         │ Balance General           │ Cerrar gestión   │
│ SIN              │ Todos (Form. 500 + 605)   │ Fiscalizar       │
│ Banco            │ Balance + Flujo Efectivo  │ Dar crédito      │
│ Auditor externo  │ Todos + Notas             │ Dictamen         │
│ Inversionista    │ Estado de Resultados      │ Decidir invertir │
└──────────────────┴───────────────────────────┴──────────────────┘
```

## Particularidades bolivianas

```text
1. NORMAS CONTABLES:
   • Se usan las NC del CTNAC (Colegio de Auditores de Bolivia).
   • NO se usan NIIF puras (solo de forma supletoria).
   • El ajuste por inflación con UFV está SUSPENDIDO desde dic/2020.
   • Un ERP configurado con reexpresión automática por inflación 
     para gestiones posteriores a 2020 estaría aplicando un ajuste 
     que ya no corresponde.

2. ESTADOS REQUERIDOS:
   • Balance General (Estado de Situación Financiera).
   • Estado de Resultados (Pérdidas y Ganancias).
   • Estado de Flujo de Efectivo.
   • Estado de Cambios en el Patrimonio Neto.
   • Notas a los Estados Financieros.

3. ENVÍO AL SIN:
   • Se declaran en el Formulario 500 (IUE).
   • Se envían digitalmente en el Formulario 605 vía SIAT.
   • Plazo: 120 días tras el cierre de la gestión.
```

## Tareas de la Fase 6.1

```text
[ ] Crear docs/aprendizaje/21-estados-financieros-explicados.md
    → Explicación teórica de los 5 estados financieros (máximo 3 páginas).
    → Incluir: quién los usa, para qué, y las particularidades bolivianas.
    → 🧠 Mini-Prompt para IA: "Escribe una explicación didáctica 
      de los estados financieros según las Normas de Contabilidad 
      del CTNAC de Bolivia. Incluye: Estado de Resultados, Balance 
      General, Estado de Flujo de Efectivo, Estado de Cambios en 
      el Patrimonio Neto, y Notas. Explica que el ajuste por 
      inflación con UFV está suspendido desde diciembre 2020. 
      Máximo 800 palabras."

[ ] Crear docs/aprendizaje/22-normas-contables-bolivianas.md
    → Explicar la diferencia entre NC del CTNAC y NIIF.
    → Explicar por qué Bolivia no adoptó NIIF plenamente.
    → Incluir la referencia al BID y la convergencia de 2013.
    → 🧠 Mini-Prompt para IA: "Explica las Normas de Contabilidad 
      (NC) emitidas por el CTNAC/CAUB de Bolivia y su relación 
      con las NIIF internacionales. Bolivia avanzó en convergencia 
      hacia NIIF con apoyo del BID (concluida técnicamente en 2013), 
      pero no entró en vigencia plena por consideraciones fiscales. 
      Las NIIF y NIA se usan solo de forma supletoria. Máximo 
      500 palabras."

[ ] Crear docs/aprendizaje/23-ufv-inflacion-suspendida.md
    → Explicar qué era el ajuste por inflación con UFV.
    → Explicar por qué se suspendió en diciembre 2020.
    → Advertir que un ERP no debe aplicar reexpresión automática.
    → 🧠 Mini-Prompt para IA: "Explica el ajuste por inflación 
      con UFV en Bolivia. Estuvo vigente hasta el 10 de diciembre 
      de 2020 según instrucción del CTNAC. Desde entonces está 
      suspendido hasta nuevo pronunciamiento. Un ERP configurado 
      con reexpresión automática por inflación para gestiones 
      posteriores a 2020 estaría aplicando un ajuste que ya no 
      corresponde. Máximo 300 palabras."
```

---

# FASE 6.2 — Estado de Resultados (Pérdidas y Ganancias)

## ¿Qué hace esta fase?
Genera el **Estado de Resultados** — el reporte que muestra si la empresa ganó o perdió dinero en el período. Es el estado más usado por la gerencia y la base para calcular el IUE.

## Estructura del Estado de Resultados

```text
ESTADO DE RESULTADOS
Del 1 de enero al 31 de diciembre de 2026
(Expresado en Bolivianos)
─────────────────────────────────────────────────────────────────
Ventas Netas                              Bs 150,000.00
(-) Costo de Ventas                       (Bs 80,000.00)
─────────────────────────────────────────────────────────────────
= UTILIDAD BRUTA                          Bs 70,000.00

(-) Gastos Operativos:
    Gastos de Nómina             Bs 40,000.00
    Gastos de Servicios           Bs 5,000.00
    Depreciación                  Bs 2,000.00
    Gastos Administrativos        Bs 3,000.00
    IT 3% sobre ventas brutas     Bs 4,500.00
    ─────────────────────────────────────────────
    Total Gastos Operativos      (Bs 54,500.00)
─────────────────────────────────────────────────────────────────
= UTILIDAD OPERATIVA                      Bs 15,500.00

(+) Ingresos No Operativos                Bs 500.00
(-) Gastos No Operativos                  (Bs 200.00)
─────────────────────────────────────────────────────────────────
= UTILIDAD ANTES DE IMPUESTOS             Bs 15,800.00

(-) IUE (25%)                             (Bs 3,950.00)
─────────────────────────────────────────────────────────────────
= UTILIDAD NETA DEL PERÍODO               Bs 11,850.00
─────────────────────────────────────────────────────────────────

⚠️ Si hay pérdida contable, el IUE es Bs 0.
   El IUE solo se calcula sobre utilidad imponible positiva.
```

## Tareas de la Fase 6.2

```text
[ ] Crear js/capas/capa4-estados.js
    → Clase CapaEstadosFinancieros con métodos para cada estado.

[ ] Implementar generarEstadoResultados(periodo)
    → Recorre todas las cuentas de resultados (grupos 4 y 5).
    → Agrupa por categoría: Ventas, Costo de Ventas, 
      Gastos Operativos, Ingresos/Gastos No Operativos.
    → Calcula: Utilidad Bruta, Operativa, Antes de Impuestos, Neta.
    → Devuelve objeto estructurado con todos los niveles.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que genere 
      el Estado de Resultados desde un libro mayor contable. 
      Debe agrupar las cuentas de ingresos (grupo 4) y 
      gastos/costos (grupo 5), calcular utilidad bruta, 
      operativa, antes de impuestos, y neta. Incluye el IUE 
      del 25% si hay utilidad positiva. Devuelve objeto 
      estructurado con todos los niveles."

[ ] Implementar calcularUtilidadBruta(ventas, costoVentas)
    → Utilidad Bruta = Ventas Netas − Costo de Ventas.

[ ] Implementar calcularUtilidadOperativa(utilidadBruta, gastosOperativos)
    → Utilidad Operativa = Utilidad Bruta − Gastos Operativos.

[ ] Implementar calcularUtilidadNeta(utilidadAntesImpuestos, iue)
    → Utilidad Neta = Utilidad Antes de Impuestos − IUE.
    → Si utilidad antes de impuestos ≤ 0 → IUE = 0.

[ ] Implementar compararPeriodos(periodo1, periodo2)
    → Genera un estado de resultados comparativo.
    → Columnas: Período 1, Período 2, Variación (Bs y %).
    → Para análisis de tendencias.

[ ] Crear vista parcial en estados-financieros.html
    → Tabla con el Estado de Resultados.
    → Selector de período (mensual, trimestral, anual).
    → Botón "Comparar con período anterior".
    → Formato de impresión limpio.
```

---

# FASE 6.3 — Balance General (Estado de Situación Financiera)

## ¿Qué hace esta fase?
Genera el **Balance General** — el reporte que muestra qué posee la empresa (activos), qué debe (pasivos), y cuál es el valor de los dueños (patrimonio) a una fecha específica. Debe cumplir la **ecuación contable fundamental**: Activo = Pasivo + Patrimonio.

## Estructura del Balance General

```text
BALANCE GENERAL
Al 31 de diciembre de 2026
(Expresado en Bolivianos)
─────────────────────────────────────────────────────────────────
ACTIVOS
  Activos Corrientes:
    Efectivo y equivalentes         Bs 25,000.00
    Clientes                         Bs 18,500.00
    Inventarios                      Bs 32,000.00
    IVA Crédito Fiscal               Bs 4,200.00
    ─────────────────────────────────────────────
    Total Activos Corrientes         Bs 79,700.00

  Activos No Corrientes:
    Maquinaria y Equipo              Bs 45,000.00
    (-) Depreciación Acumulada       (Bs 8,500.00)
    Vehículos                        Bs 25,000.00
    (-) Depreciación Acumulada       (Bs 6,000.00)
    ─────────────────────────────────────────────
    Total Activos No Corrientes      Bs 55,500.00

─────────────────────────────────────────────────────────────────
TOTAL ACTIVOS                        Bs 135,200.00

PASIVOS
  Pasivos Corrientes:
    Proveedores                      Bs 12,300.00
    Impuestos por Pagar (IVA+IT)    Bs 3,800.00
    Nómina por Pagar                Bs 8,500.00
    Aguinaldo por Pagar              Bs 6,200.00
    Bono de Antigüedad por Pagar     Bs 3,100.00
    Indemnización por Pagar          Bs 28,000.00
    ─────────────────────────────────────────────
    Total Pasivos Corrientes         Bs 61,900.00

  Pasivos No Corrientes:
    Obligaciones Bancarias (LP)     Bs 20,000.00
    ─────────────────────────────────────────────
    Total Pasivos No Corrientes      Bs 20,000.00

─────────────────────────────────────────────────────────────────
TOTAL PASIVOS                        Bs 81,900.00

PATRIMONIO
  Capital Social                     Bs 30,000.00
  Utilidades Retenidas               Bs 11,450.00
  Utilidad del Ejercicio             Bs 11,850.00
  ─────────────────────────────────────────────
  Total Patrimonio                   Bs 53,300.00

─────────────────────────────────────────────────────────────────
TOTAL PASIVO + PATRIMONIO            Bs 135,200.00 ✓ (= Activo)
─────────────────────────────────────────────────────────────────

⚠️ VERIFICACIÓN: Total Activo DEBE ser igual a Total Pasivo + Patrimonio.
   Si no cuadra, hay un error en algún asiento contable.
```

## Tareas de la Fase 6.3

```text
[ ] Implementar generarBalanceGeneral(fecha)
    → Recorre todas las cuentas de balance (grupos 1, 2, 3).
    → Agrupa por categoría: Activo Corriente, Activo No Corriente, 
      Pasivo Corriente, Pasivo No Corriente, Patrimonio.
    → Calcula totales por categoría y total general.
    → Verifica la ecuación: Activo = Pasivo + Patrimonio.
    → Devuelve objeto estructurado con verificación.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que genere 
      el Balance General desde un libro mayor contable. Debe 
      agrupar las cuentas de activos (grupo 1), pasivos (grupo 2) 
      y patrimonio (grupo 3), separando corriente y no corriente. 
      Verifica la ecuación contable: Activo = Pasivo + Patrimonio. 
      Si no cuadra, devuelve el monto de la diferencia."

[ ] Implementar verificarEcuacionContable(balance)
    → Compara Total Activo vs. Total Pasivo + Patrimonio.
    → Si son iguales → devuelve { cuadra: true }.
    → Si no → devuelve { cuadra: false, diferencia: monto }.
    → ⚠️ Si no cuadra, el ERP debe alertar y NO permitir cerrar.

[ ] Implementar clasificarCuentaPorCorriente(cuentaCodigo)
    → Determina si una cuenta es corriente o no corriente.
    → Activos corrientes: efectivo, clientes, inventario, IVA CF.
    → Activos no corrientes: maquinaria, vehículos, edificios.
    → Pasivos corrientes: proveedores, impuestos, nómina.
    → Pasivos no corrientes: préstamos a largo plazo.

[ ] Implementar generarBalanceComparativo(fecha1, fecha2)
    → Genera un balance comparativo entre dos fechas.
    → Columnas: Fecha 1, Fecha 2, Variación (Bs y %).
    → Para análisis de evolución patrimonial.

[ ] Crear vista parcial en estados-financieros.html
    → Tabla con el Balance General.
    → Selector de fecha de corte.
    → Indicador visual: ✓ verde si cuadra, ❌ rojo si no.
    → Formato de impresión limpio.
```

---

# FASE 6.4 — Estado de Flujo de Efectivo

## ¿Qué hace esta fase?
Genera el **Estado de Flujo de Efectivo** — el reporte que muestra de dónde entró y a dónde salió el dinero durante el período. Es el estado que los bancos más miran antes de dar un crédito.

## Métodos de elaboración

```text
MÉTODO DIRECTO:
─────────────────────────────────────────────────
Suma y resta las entradas y salidas de efectivo reales.
Más intuitivo, pero requiere reprocesar cada movimiento de caja.

MÉTODO INDIRECTO (el más usado en Bolivia):
─────────────────────────────────────────────────
Parte de la utilidad neta y ajusta por partidas que no mueven caja.
Se arma directamente desde el Balance y el Estado de Resultados.

EJEMPLO (MÉTODO INDIRECTO):
─────────────────────────────────────────────────
Utilidad Neta del Período:              Bs 11,850.00
(+) Depreciación (no mueve caja):       Bs 2,000.00
(-) Aumento en Clientes (no cobrado):   (Bs 3,500.00)
(+) Disminución en Inventario:          Bs 1,200.00
(-) Aumento en Proveedores (no pagado): Bs 2,300.00
─────────────────────────────────────────────────
Flujo de Efectivo Operativo:            Bs 13,850.00

(-) Compra de Maquinaria (inversión):   (Bs 5,000.00)
(+) Préstamo bancario (financiamiento): Bs 8,000.00
(-) Pago de dividendos:                 (Bs 2,000.00)
─────────────────────────────────────────────────
Flujo de Efectivo del Período:          Bs 14,850.00

Saldo Inicial de Efectivo:              Bs 10,150.00
Saldo Final de Efectivo:                Bs 25,000.00
─────────────────────────────────────────────────
```

## Tareas de la Fase 6.4

```text
[ ] Implementar generarFlujoEfectivo(periodo, metodo)
    → Si metodo = "DIRECTO": suma entradas y salidas de caja.
    → Si metodo = "INDIRECTO": parte de utilidad neta y ajusta.
    → Clasifica en 3 categorías: Operativo, Inversión, Financiamiento.
    → Devuelve objeto estructurado con las 3 categorías.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que genere 
      el Estado de Flujo de Efectivo por el método indirecto. 
      Parte de la utilidad neta, ajusta por depreciación, 
      variaciones en cuentas de capital de trabajo (clientes, 
      inventario, proveedores), y clasifica en actividades 
      operativas, de inversión y de financiamiento. Devuelve 
      el flujo neto del período y los saldos inicial y final."

[ ] Implementar calcularFlujoOperativo(utilidadNeta, ajustes)
    → Parte de la utilidad neta.
    → Suma depreciación (no mueve caja).
    → Ajusta por variaciones en capital de trabajo.
    → Devuelve el flujo operativo.

[ ] Implementar calcularFlujoInversion(movimientosActivos)
    → Suma las compras de activos fijos (salida de caja).
    → Suma las ventas de activos fijos (entrada de caja).
    → Devuelve el flujo de inversión.

[ ] Implementar calcularFlujoFinanciamiento(movimientosDeuda)
    → Suma los préstamos recibidos (entrada de caja).
    → Suma los pagos de préstamos y dividendos (salida de caja).
    → Devuelve el flujo de financiamiento.

[ ] Implementar verificarFlujoEfectivo(flujo, saldoInicial, saldoFinal)
    → Verifica que: Saldo Inicial + Flujo Neto = Saldo Final.
    → Si no cuadra → devuelve la diferencia.

[ ] Crear vista parcial en estados-financieros.html
    → Tabla con el Flujo de Efectivo.
    → Selector de método (directo / indirecto).
    → Selector de período.
    → Formato de impresión limpio.
```

---

# FASE 6.5 — Notas a los Estados Financieros

## ¿Qué hace esta fase?
Genera la **estructura de las Notas a los Estados Financieros**. Las NC bolivianas (en línea con el estándar internacional) consideran que el Balance, el Estado de Resultados y el Flujo de Efectivo **no están completos sin sus notas**. En el prototipo, generamos la estructura y los campos; el contenido narrativo lo escribe el contador.

## Notas típicas requeridas

```text
NOTA 1: Información General de la Empresa
  • Razón social, NIT, domicilio, actividad económica.
  • Régimen tributario (RG, RTS, STI, RAU, SIETE-RG).

NOTA 2: Bases de Presentación
  • Normas contables aplicadas (NC del CTNAC).
  • Moneda de presentación (Bolivianos).
  • Período cubierto.
  • ⚠️ Indicar que el ajuste por inflación (UFV) está suspendido.

NOTA 3: Políticas Contables
  • Método de valuación de inventario (PEPS, Promedio Ponderado).
  • Método de depreciación (línea recta, unidades de producción).
  • Criterio de reconocimiento de ingresos.
  • Tratamiento del IVA (incluido en el precio, Art. 5 Ley 843).

NOTA 4: Efectivo y Equivalentes
  • Desglose: caja, bancos, inversiones temporales.

NOTA 5: Cuentas por Cobrar
  • Desglose por antigüedad de saldo.
  • Provisión para cuentas incobrables.

NOTA 6: Inventarios
  • Desglose: mercancías, materia prima, producto terminado.
  • Método de valuación aplicado.

NOTA 7: Activos Fijos
  • Desglose por tipo de activo.
  • Depreciación acumulada.
  • Vida útil estimada.

NOTA 8: Cuentas por Pagar
  • Desglose: proveedores, impuestos, nómina.

NOTA 9: Obligaciones Bancarias
  • Desglose por entidad, monto, plazo, tasa de interés.

NOTA 10: Patrimonio
  • Capital social, utilidades retenidas, reservas.

NOTA 11: Contingencias
  • Juicios pendientes, garantías otorgadas, contratos relevantes.

NOTA 12: Hechos Posteriores al Cierre
  • Eventos ocurridos entre el cierre y la emisión de los estados.
```

## Tareas de la Fase 6.5

```text
[ ] Implementar generarEstructuraNotas(empresa, periodo)
    → Genera la estructura vacía de las 12 notas típicas.
    → Pre-llena los datos automáticos (NIT, período, moneda).
    → Deja campos vacíos para el contenido narrativo del contador.
    → Devuelve objeto estructurado con todas las notas.
    → 🧠 Mini-Prompt para IA: "Genera la estructura JSON de las 
      Notas a los Estados Financieros según las NC del CTNAC 
      de Bolivia. Incluye 12 notas: información general, bases 
      de presentación (indicando que UFV está suspendido desde 
      dic/2020), políticas contables, efectivo, cuentas por 
      cobrar, inventarios, activos fijos, cuentas por pagar, 
      obligaciones bancarias, patrimonio, contingencias, y 
      hechos posteriores. Pre-llena campos automáticos."

[ ] Implementar generarNotaPoliticasContables(config)
    → Genera la Nota 3 con las políticas configuradas en el ERP.
    → Método de inventario (PEPS / Promedio Ponderado).
    → Método de depreciación (línea recta).
    → Tratamiento del IVA (incluido / por fuera).
    → ⚠️ Debe indicar que NO se aplica ajuste por inflación.

[ ] Implementar generarNotaActivosFijos(activos)
    → Genera la Nota 7 con el desglose de activos fijos.
    → Incluye: costo original, depreciación acumulada, valor neto.
    → Agrupado por tipo: maquinaria, vehículos, edificios, muebles.

[ ] Implementar generarNotaCuentasCobrar(clientes)
    → Genera la Nota 5 con la antigüedad de saldos.
    → Agrupa: 0-30 días, 31-60 días, 61-90 días, >90 días.
    → Calcula la provisión para incobrables.

[ ] Crear vista parcial en estados-financieros.html
    → Sección "Notas a los Estados Financieros".
    → Acordeón con las 12 notas (expandible/colapsable).
    → Campos editables para el contenido narrativo.
    → Campos automáticos pre-llenados (no editables).
```

---

# FASE 6.6 — Estados Comparativos (Mes vs Mes, Año vs Año)

## ¿Qué hace esta fase?
Genera **estados financieros comparativos** — la herramienta que permite ver la evolución de la empresa en el tiempo. Un estado financiero de un solo período es una foto; un comparativo es una película.

## Tipos de comparativos

```text
1. MES ACTUAL vs. MES ANTERIOR
   → Para ver tendencias de corto plazo.
   → Ejemplo: ventas de septiembre vs. agosto.

2. GESTIÓN ACTUAL vs. GESTIÓN ANTERIOR (misma fecha de corte)
   → Para ver evolución anual.
   → Ejemplo: ventas de enero-septiembre 2026 vs. enero-septiembre 2025.

3. REAL vs. PRESUPUESTO
   → Para control de gestión.
   → Ejemplo: gastos reales vs. gastos presupuestados.
   → (Requiere el módulo de presupuestos — Módulo 8 avanzado).
```

## Estructura del comparativo

```text
ESTADO DE RESULTADOS COMPARATIVO
─────────────────────────────────────────────────────────────────
Concepto              │ Sep 2026   │ Ago 2026   │ Variación
──────────────────────┼────────────┼────────────┼──────────────
Ventas Netas          │ Bs 15,000  │ Bs 12,500  │ +Bs 2,500 (+20%)
Costo de Ventas       │ (Bs 8,000) │ (Bs 6,800) │ -Bs 1,200 (+18%)
Utilidad Bruta        │ Bs 7,000   │ Bs 5,700   │ +Bs 1,300 (+23%)
Gastos Operativos     │ (Bs 5,450) │ (Bs 5,200) │ -Bs 250 (+5%)
Utilidad Operativa    │ Bs 1,550   │ Bs 500     │ +Bs 1,050 (+210%)
Utilidad Neta         │ Bs 1,163   │ Bs 375     │ +Bs 788 (+210%)
─────────────────────────────────────────────────────────────────
```

## Tareas de la Fase 6.6

```text
[ ] Implementar generarEstadoResultadosComparativo(periodo1, periodo2)
    → Genera el estado de resultados de ambos períodos.
    → Calcula la variación en Bs y en % para cada línea.
    → Devuelve objeto con las 3 columnas.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que genere 
      un Estado de Resultados comparativo entre dos períodos. 
      Para cada línea (ventas, costo, utilidad bruta, gastos, 
      utilidad neta), calcula la variación absoluta en Bs y 
      la variación porcentual. Devuelve objeto con las 3 
      columnas: Período 1, Período 2, Variación."

[ ] Implementar generarBalanceComparativo(fecha1, fecha2)
    → Genera el balance general de ambas fechas.
    → Calcula la variación en Bs y en % para cada cuenta.
    → Devuelve objeto con las 3 columnas.

[ ] Implementar calcularVariacion(valor1, valor2)
    → Variación absoluta = valor2 − valor1.
    → Variación porcentual = (valor2 − valor1) ÷ valor1 × 100.
    → Maneja división por cero (si valor1 = 0).
    → Devuelve { variacionBs, variacionPorcentaje }.

[ ] Crear vista parcial en estados-financieros.html
    → Selector de tipo de comparativo.
    → Tabla con las 3 columnas.
    → Colores: verde si variación positiva, rojo si negativa.
    → Gráfico de barras simple (opcional, con CSS puro).
```

---

# FASE 6.7 — Razones Financieras (Ratios)

## ¿Qué hace esta fase?
Calcula automáticamente las **razones financieras** (*ratios*) a partir del Balance General y el Estado de Resultados. Son indicadores que resumen la salud financiera de la empresa en un solo número.

## Ratios a calcular

```text
╔══════════════════════════════════════════════════════════════════╗
║ RATIO              │ FÓRMULA                     │ QUÉ MIDE     ║
║────────────────────┼─────────────────────────────┼──────────────║
║ Liquidez corriente │ Activo Cte / Pasivo Cte     │ Pago corto   ║
║ Prueba ácida       │ (AC - Inventarios) / PC     │ Liquidez     ║
║ Endeudamiento      │ Total Pasivo / Total Activo │ Deuda        ║
║ Rotación inventario│ Costo Ventas / Inventario   │ Velocidad    ║
║ Margen neto        │ Utilidad Neta / Ventas      │ Rentabilidad ║
║ ROE                │ Utilidad Neta / Patrimonio  │ Retorno      ║
╚══════════════════════════════════════════════════════════════════╝

EJEMPLOS CON DATOS DEL BALANCE:
─────────────────────────────────────────────────────────────────
Liquidez corriente = 79,700 / 61,900 = 1.29
  → Por cada Bs 1 de deuda a corto plazo, hay Bs 1.29 para pagar.

Prueba ácida = (79,700 - 32,000) / 61,900 = 0.77
  → Sin contar inventario, hay Bs 0.77 por cada Bs 1 de deuda.

Endeudamiento = 81,900 / 135,200 = 60.6%
  → El 60.6% de los activos está financiado con deuda.

Margen neto = 11,850 / 150,000 = 7.9%
  → De cada Bs 100 vendidos, quedan Bs 7.90 de utilidad.

ROE = 11,850 / 53,300 = 22.2%
  → El patrimonio genera un retorno del 22.2% anual.
```

## Tareas de la Fase 6.7

```text
[ ] Implementar calcularRatiosFinancieros(balance, estadoResultados)
    → Calcula todos los ratios listados arriba.
    → Devuelve objeto con cada ratio y su interpretación.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que calcule 
      las razones financieras principales desde un balance general 
      y un estado de resultados: liquidez corriente, prueba ácida, 
      endeudamiento, rotación de inventario, margen neto, y ROE. 
      Para cada ratio, devuelve el valor numérico y una 
      interpretación breve en español."

[ ] Implementar interpretarRatio(nombre, valor)
    → Devuelve una interpretación en lenguaje simple.
    → Ejemplo: liquidez > 1.5 → "Buena capacidad de pago".
    → Ejemplo: endeudamiento > 70% → "Alto nivel de deuda".
    → Ejemplo: margen neto < 5% → "Rentabilidad baja".

[ ] Implementar generarDashboardRatios(ratios)
    → Genera un panel visual con los ratios.
    → Semáforo: verde (bueno), amarillo (regular), rojo (malo).
    → Para el dashboard principal del ERP.

[ ] Crear vista parcial en estados-financieros.html
    → Sección "Razones Financieras".
    → Tarjetas con cada ratio y su interpretación.
    → Semáforo visual.
    → Comparativo con período anterior.
```

---

# FASE 6.8 — Vinculación con IUE (Form. 500) y SIAT (Form. 605)

## ¿Qué hace esta fase?
Conecta los estados financieros con las **obligaciones ante el SIN**. El Estado de Resultados es la base para el IUE (Formulario 500), y el paquete completo de estados se envía digitalmente vía el Formulario 605 (SIAT).

## Flujo de vinculación

```text
Estado de Resultados
        │
        ▼
Utilidad Contable (punto de partida)
        │
        ▼
(+) Ajustes Fiscales (gastos no deducibles)
        │
        ▼
Utilidad Imponible
        │
        ▼
IUE = 25% × Utilidad Imponible
        │
        ▼
(-) Compensación IT pagado (Art. 77 Ley 843)
        │
        ▼
IUE por Pagar → Formulario 500
        │
        ▼
Estados Financieros completos → Formulario 605 (SIAT)
```

## Tareas de la Fase 6.8

```text
[ ] Implementar prepararDatosFormulario500(año)
    → Recopila: utilidad contable, ajustes, utilidad imponible, 
      IUE determinado, IT compensado, IUE por pagar.
    → Genera la estructura del Formulario 500.
    → Devuelve objeto con todos los campos.

[ ] Implementar prepararDatosFormulario605(año)
    → Recopila: Balance General, Estado de Resultados, 
      Flujo de Efectivo, Notas.
    → Genera la estructura del Formulario 605.
    → ⚠️ En el prototipo, solo se genera la estructura.
      El envío real al SIAT se haría en un sistema productivo.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que prepare 
      los datos para el Formulario 605 del SIN boliviano. 
      Debe incluir: Balance General, Estado de Resultados, 
      Estado de Flujo de Efectivo, Estado de Cambios en el 
      Patrimonio Neto, y Notas a los Estados Financieros. 
      Devuelve la estructura JSON lista para envío."

[ ] Implementar validarEstadosParaEnvio(estados)
    → Verifica que todos los estados estén completos.
    → Verifica que el Balance cuadre (Activo = Pasivo + Patrimonio).
    → Verifica que las Notas estén presentes.
    → Verifica que no haya períodos cerrados pendientes.
    → Devuelve { valido, errores[] }.

[ ] Implementar generarResumenEjecutivo(estados)
    → Genera un resumen de 1 página para la gerencia.
    → Incluye: utilidad neta, total activos, endeudamiento, 
      liquidez, flujo de efectivo.
    → En lenguaje simple, no técnico.
```

---

# FASE 6.9 — Vista de Estados Financieros

## ¿Qué hace esta fase?
Construye la **pantalla principal** donde el usuario visualiza todos los estados financieros, los comparativos, los ratios, y las notas. Es la vista más "gerencial" del ERP.

## Tareas de la Fase 6.9

```text
[ ] Crear vistas/estados-financieros.html
    → Secciones:
      ├── <h1> Estados Financieros
      ├── <div class="tabs">
      │   ├── Estado de Resultados
      │   ├── Balance General
      │   ├── Estado de Flujo de Efectivo
      │   ├── Notas a los EEFF
      │   ├── Comparativos
      │   ├── Razones Financieras
      │   └── Resumen Ejecutivo
      ├── <div id="contenido-tab">
      └── Botones de exportación (PDF, CSV)

[ ] Crear js/vistas/estados-vista.js
    → Lógica de la vista de estados financieros.
    → Manejar cambio de tabs.
    → Selector de período / fecha de corte.
    → Botón "Generar Estado" que llama a la Capa 4.
    → Botón "Comparar" que genera el comparativo.
    → Botón "Imprimir" que usa css/reportes.css.

[ ] Implementar la vista del Estado de Resultados
    → Tabla con todos los niveles (bruta, operativa, neta).
    → Selector de período (mensual, trimestral, anual).
    → Formato de impresión limpio (sin menú lateral).

[ ] Implementar la vista del Balance General
    → Tabla con activos, pasivos, patrimonio.
    → Indicador visual de la ecuación contable.
    → Selector de fecha de corte.

[ ] Implementar la vista del Flujo de Efectivo
    → Tabla con las 3 categorías (operativo, inversión, financiamiento).
    → Selector de método (directo / indirecto).

[ ] Implementar la vista de Razones Financieras
    → Tarjetas con cada ratio.
    → Semáforo visual (verde / amarillo / rojo).
    → Interpretación en lenguaje simple.

[ ] Implementar la vista del Resumen Ejecutivo
    → 1 página con los datos clave.
    → Lenguaje simple para la gerencia.
    → Botón "Descargar PDF" (usando window.print()).

[ ] Conectar con el menú lateral
    → Agregar enlace "📊 Estados Financieros" en index.html.
    → Verificar que el enrutador carga vistas/estados-financieros.html.

[ ] Agregar estilos en css/reportes.css
    → Estilos para impresión (@media print).
    → Ocultar menú lateral y botones al imprimir.
    → Formato limpio con logo de la empresa.
    → 🧠 Mini-Prompt para IA: "Genera CSS para impresión de 
      estados financieros. Usa @media print para ocultar el 
      menú lateral, los botones y los formularios. El contenido 
      debe verse limpio, con tipografía serif, márgenes amplios, 
      y saltos de página entre secciones. Incluye un encabezado 
      con el nombre de la empresa y el período."
```

---

# FASE 6.10 — Smoke Test Final y Commit de Cierre

## Checklist de humo (smoke test)

```text
[ ] Smoke test #1: Generar Estado de Resultados
    → Ejecutar window.CapaEstadosFinancieros.generarEstadoResultados("2026")
    → Verificar que muestra ventas, costo, utilidad bruta, 
      gastos operativos, utilidad operativa, IUE, utilidad neta
    → Verificar que si hay pérdida, el IUE es 0

[ ] Smoke test #2: Generar Balance General
    → Ejecutar window.CapaEstadosFinancieros.generarBalanceGeneral("2026-12-31")
    → Verificar que Total Activo = Total Pasivo + Patrimonio
    → Verificar que las cuentas están clasificadas correctamente 
      (corriente vs. no corriente)

[ ] Smoke test #3: Verificar la ecuación contable
    → Si Activo ≠ Pasivo + Patrimonio → debe mostrar error
    → Si Activo = Pasivo + Patrimonio → debe mostrar ✓ verde

[ ] Smoke test #4: Generar Estado de Flujo de Efectivo
    → Ejecutar window.CapaEstadosFinancieros.generarFlujoEfectivo("2026", "INDIRECTO")
    → Verificar que clasifica en operativo, inversión, financiamiento
    → Verificar que Saldo Inicial + Flujo Neto = Saldo Final

[ ] Smoke test #5: Generar Notas a los Estados Financieros
    → Verificar que se generan las 12 notas
    → Verificar que la Nota 2 indica que UFV está suspendido
    → Verificar que la Nota 3 muestra las políticas contables

[ ] Smoke test #6: Generar Estado Comparativo
    → Comparar septiembre vs. agosto
    → Verificar que la variación en Bs y % es correcta
    → Verificar que los colores son correctos (verde/rojo)

[ ] Smoke test #7: Calcular Razones Financieras
    → Verificar liquidez corriente = Activo Cte / Pasivo Cte
    → Verificar endeudamiento = Total Pasivo / Total Activo
    → Verificar que las interpretaciones son coherentes

[ ] Smoke test #8: Preparar datos para Form. 500 y 605
    → Verificar que la utilidad contable es la base del IUE
    → Verificar que la estructura del Form. 605 incluye todos los estados
    → Verificar que la validación detecta estados incompletos

[ ] Smoke test #9: Impresión
    → Hacer clic en "Imprimir" en cada estado
    → Verificar que el menú lateral se oculta
    → Verificar que el formato es limpio y profesional

[ ] Smoke test #10: Persistencia
    → Recargar la página (F5)
    → Los estados financieros deben seguir generándose
    → Abrir DevTools → LocalStorage → verificar colecciones

[ ] Commit de cierre del Módulo 6
    → git add .
    → git commit -m "feat(modulo-6): Estados Financieros completos
    
      - Estado de Resultados (pérdidas y ganancias)
      - Balance General con verificación de ecuación contable
      - Estado de Flujo de Efectivo (método directo e indirecto)
      - Notas a los Estados Financieros (12 notas según NC)
      - Estados comparativos (mes vs mes, año vs año)
      - Razones financieras con interpretación automática
      - Vinculación con IUE (Form. 500) y SIAT (Form. 605)
      - Resumen ejecutivo para la gerencia
      - Estilos de impresión profesionales
      - Smoke test: todos los tests pasan
      
      Próximo paso: Módulo 7 - Cumplimiento SIN"
```

---

## 🎯 Criterios de Aceptación del Módulo 6

El Módulo 6 se considera **completado** cuando:

- [x] El Estado de Resultados muestra todos los niveles correctamente
- [x] El IUE se calcula solo si hay utilidad positiva
- [x] El Balance General cuadra (Activo = Pasivo + Patrimonio)
- [x] El Flujo de Efectivo clasifica en 3 categorías
- [x] Las Notas incluyen las 12 secciones requeridas
- [x] Las Notas indican que el ajuste UFV está suspendido
- [x] Los comparativos muestran variación en Bs y %
- [x] Los ratios se calculan y se interpretan correctamente
- [x] Los datos se preparan para Form. 500 y Form. 605
- [x] La impresión genera un documento limpio y profesional
- [x] Se puede explicar en 5 minutos los estados financieros bolivianos

---

## 📚 Material de Exposición Generado en Este Módulo

| Archivo | Contenido | Uso en exposición |
|---|---|---|
| `21-estados-financieros-explicados.md` | Teoría de los 5 estados | Abrir la explicación |
| `22-normas-contables-bolivianas.md` | NC vs NIIF | Demostrar conocimiento |
| `23-ufv-inflacion-suspendida.md` | UFV suspendido | Particularidad boliviana |

---

## 🚀 Próximos Módulos (adelanto)

| Módulo | Tema | Duración | Depende de |
|---|---|---|---|
| **Módulo 7** | Capa 5 — Cumplimiento SIN | 4–6 h | Módulo 6 |
| **Módulo 8** | Migración a SaaS real (opcional) | 10–15 h | Módulo 7 |

---

## ⚠️ Advertencia final

La tentación aquí es **generar los estados financieros pero saltarse las Notas y los comparativos**. *"Total, las notas las escribe el contador a mano, y los comparativos son un extra"*. **No lo hagas.** Las Notas a los Estados Financieros son **obligatorias según las NC del CTNAC** — un Balance sin Notas está incompleto. En una exposición, poder decir *"este ERP genera automáticamente la estructura de las 12 Notas requeridas por las NC bolivianas, incluyendo la indicación de que el ajuste por inflación con UFV está suspendido desde diciembre 2020"* es lo que demuestra que no solo sabes generar números — sabes qué exige la normativa contable boliviana. Y los comparativos son lo que convierte un estado financiero de "foto" a "película" — la herramienta que la gerencia realmente usa para tomar decisiones.

---

**¿Siguiente paso?** Cuando completes este Módulo 6, avísame y generamos el **ROADMAP_MODULO_7_CUMPLIMIENTO_SIN.md** con el mismo formato. 🚀