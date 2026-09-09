# 📁 ROADMAP_MODULO_5_IMPUESTOS.md

**Proyecto:** ERP Contable Integral Boliviano (Prototipo Educativo / Portafolio)
**Arquitectura:** Frontend Vanilla JS + LocalStorage (sin backend real — enfoque didáctico)
**Versión:** 1.0.0 · **Formato:** Guía Arquitectónica Explicativa
**Tiempo estimado:** 6–8 horas · **Bloquea:** Módulos 6→8 (Estados Financieros, Cumplimiento SIN)
**Depende de:** Módulo 0 (Setup) + Módulo 2 (Compras/Ventas) + Módulo 3 (Motor Contable)

> **Objetivo del Módulo:** Construir el **módulo de Impuestos y Cumplimiento Fiscal** adaptado al sistema tributario boliviano. Aquí se calcula el **IVA (13%)** con la conciliación débito/crédito fiscal para el Formulario 200, el **IT (3%)** sobre ingresos brutos para el Formulario 400, el **IUE (25%)** sobre la utilidad imponible para el Formulario 500, la **compensación del IT pagado contra el IUE anual** (Art. 77 Ley 843), el **RC-IVA (13%)** para dependientes e independientes, las **retenciones** (RC-IVA e IT), y el **IUE-BE (12.5% efectivo)** para beneficiarios del exterior. Este módulo transforma los datos contables en las declaraciones juradas que se presentan ante el SIN.

> **Nota didáctica:** Este módulo es donde el ERP demuestra que **no es solo un sistema contable, sino un sistema tributario**. La compensación IT-IUE (Art. 77 Ley 843) es una regla que muchos contadores bolivianos conocen pero pocos sistemas implementan correctamente. En una exposición, poder mostrar cómo el IT pagado mes a mes se acumula y se descuenta del IUE anual es el momento que demuestra dominio real de la normativa tributaria boliviana.

---

## 🗺️ Mapa del Módulo

```text
Módulo 5
├── Fase 5.1 → Teoría: Sistema Tributario Boliviano (Ley 843)
├── Fase 5.2 → Modelo de datos: Períodos fiscales y obligaciones
├── Fase 5.3 → IVA: Conciliación débito/crédito fiscal (Form. 200)
├── Fase 5.4 → IT: Impuesto a las Transacciones (Form. 400)
├── Fase 5.5 → IUE: Impuesto a las Utilidades (Form. 500)
├── Fase 5.6 → Compensación IT vs IUE (Art. 77 Ley 843)
├── Fase 5.7 → RC-IVA: Régimen Complementario al IVA
├── Fase 5.8 → Retenciones (RC-IVA e IT)
├── Fase 5.9 → IUE-BE: Beneficiarios del Exterior
├── Fase 5.10 → Regímenes tributarios (RG, RTS, STI, RAU, SIETE-RG)
├── Fase 5.11 → Generación de asientos contables de impuestos
├── Fase 5.12 → Vista de Impuestos (liquidaciones + formularios)
└── Fase 5.13 → Smoke test final y commit de cierre
```

---

## 🟥 Estado: `[ ] Pendiente`

---

# FASE 5.1 — Teoría: Sistema Tributario Boliviano (Ley 843)

## Impuestos vigentes en Bolivia

```text
╔══════════════════════════════════════════════════════════════════╗
║  IMPUESTO  │ TASA  │ BASE IMPONIBLE          │ FORMULARIO SIN   ║
║────────────┼───────┼─────────────────────────┼──────────────────║
║  IVA       │ 13%   │ Precio neto de ventas   │ Form. 200        ║
║  IT        │ 3%    │ Ingresos brutos         │ Form. 400        ║
║  IUE       │ 25%   │ Utilidad neta imponible │ Form. 500/510    ║
║  RC-IVA    │ 13%   │ Ingresos de dependientes│ Form. 200        ║
║  IUE-BE    │ 12.5% │ Utilidades remesadas    │ Form. 530        ║
╚══════════════════════════════════════════════════════════════════╝

⚠️ El IVA boliviano está INCLUIDO en el precio (Art. 5 Ley 843).
   Para extraer el neto: Neto = Total ÷ 1.13
   
⚠️ La Ley 1733 (2026) modificó el Art. 5 para mostrar el IVA 
   "por fuera", pero aún pendiente de decreto reglamentario.
```

## Calendario tributario

```text
VENCIMIENTOS MENSUALES (según último dígito del NIT):
─────────────────────────────────────────────────
Dígito NIT │ Fecha de vencimiento
───────────┼──────────────────────
1          │ 10 del mes siguiente
2          │ 11 del mes siguiente
3          │ 12 del mes siguiente
4          │ 13 del mes siguiente
5          │ 14 del mes siguiente
6          │ 15 del mes siguiente
7          │ 16 del mes siguiente
8          │ 17 del mes siguiente
9          │ 18 del mes siguiente
0          │ 19 del mes siguiente

Ejemplo: NIT 123456789-1 (dígito 1) → vence el 10 del mes siguiente
         NIT 987654321-2 (dígito 2) → vence el 11 del mes siguiente
```

## Tareas de la Fase 5.1

```text
[x] Crear docs/aprendizaje/17-impuestos-bolivianos-explicados.md
    → Explicación teórica de cada impuesto (máximo 3 páginas).
    → Incluir: IVA, IT, IUE, RC-IVA, IUE-BE.
    → Explicar la base imponible de cada uno.
    → 🧠 Mini-Prompt para IA: "Escribe una explicación didáctica 
      de los 5 impuestos principales de Bolivia según la Ley 843: 
      IVA (13%), IT (3%), IUE (25%), RC-IVA (13%), IUE-BE (12.5% 
      efectivo). Para cada uno explica: tasa, base imponible, 
      formulario SIN donde se declara, y frecuencia. Máximo 800 
      palabras. Incluye la particularidad del IVA incluido en el 
      precio (Art. 5 Ley 843)."

[x] Crear docs/aprendizaje/18-calendario-tributario.md
    → Tabla de vencimientos según último dígito del NIT.
    → Explicar cómo calcular la fecha de vencimiento.
    → Incluir los plazos del IUE (120 días tras cierre).
    → 🧠 Mini-Prompt para IA: "Genera una tabla del calendario 
      tributario boliviano según el último dígito del NIT. 
      Los vencimientos van del 10 al 19 del mes siguiente. 
      Incluye los plazos especiales: IUE (120 días tras cierre 
      de gestión), segundo aguinaldo (20 de diciembre), 
      envío de Estados Financieros (Form. 605)."

[x] Crear docs/aprendizaje/19-compensacion-it-iue.md
    → Explicar el Art. 77 de la Ley 843.
    → Mostrar ejemplos numéricos de compensación.
    → 🧠 Mini-Prompt para IA: "Explica la compensación del IT 
      contra el IUE en Bolivia según el Art. 77 de la Ley 843. 
      El IT pagado durante el año (3% sobre ingresos brutos) 
      se puede usar como pago a cuenta del IUE anual (25% sobre 
      utilidad imponible). Muestra 3 ejemplos: 1) IT menor que 
      IUE (paga diferencia), 2) IT igual a IUE (no paga nada), 
      3) IT mayor que IUE (saldo a favor). Máximo 500 palabras."
```

---

# FASE 5.2 — Modelo de Datos: Períodos Fiscales y Obligaciones

## ¿Qué hace esta fase?
Define la **estructura de los períodos fiscales** y las obligaciones tributarias de la empresa. Cada período tiene sus impuestos calculados, sus formularios generados, y su estado de pago.

## Estructura del período fiscal

```javascript
const periodoFiscal = {
  id: "periodo-2026-09",
  periodo: "2026-09",               // Formato AAAA-MM
  tipo: "MENSUAL",                   // MENSUAL, ANUAL
  estado: "ABIERTO",                // ABIERTO, CERRADO, DECLARADO, PAGADO
  
  // IVA (Form. 200)
  iva: {
    debitoFiscal: 1950.00,          // IVA de ventas
    creditoFiscal: 910.00,          // IVA de compras
    ivaPorPagar: 1040.00,           // Débito - Crédito
    saldoFavorContribuyente: 0.00,  // Si crédito > débito
    formulario200: null,            // Datos del formulario generado
    declarado: false,
    pagado: false
  },
  
  // IT (Form. 400)
  it: {
    ingresosBrutos: 16950.00,       // Total ventas del mes
    itPorPagar: 508.50,             // 3% de ingresos brutos
    itPagadoAcumulado: 508.50,      // Acumulado del año (para IUE)
    formulario400: null,
    declarado: false,
    pagado: false
  },
  
  // RC-IVA (Form. 200 - agente de retención)
  rcIVA: {
    retencionesEmpleados: 2000.00,
    retencionesProveedores: 500.00,
    totalRetenido: 2500.00,
    declarado: false,
    pagado: false
  },
  
  // Fechas
  fechaDeclaracion: null,
  fechaPago: null,
  fechaVencimiento: "2026-10-10",   // Según dígito del NIT
  
  creadoEn: "2026-09-01T00:00:00"
};
```

## Tareas de la Fase 5.2

```text
[x] Crear js/config/periodos-fiscales.js
    → Clase PeriodosFiscales con métodos de gestión.
    → crearPeriodo(periodo): crea un nuevo período fiscal.
    → obtenerPeriodo(periodo): obtiene un período específico.
    → cerrarPeriodo(periodo): marca como CERRADO.
    → obtenerPeriodosAbiertos(): lista períodos pendientes.

[x] Implementar calcularFechaVencimiento(nit, periodo)
    → Extrae el último dígito del NIT.
    → Calcula el día de vencimiento (10 + dígito - 1).
    → Si dígito es 0 → día 19.
    → Devuelve la fecha de vencimiento completa.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que calcule 
      la fecha de vencimiento tributario en Bolivia según el 
      último dígito del NIT. Los vencimientos van del 10 al 19 
      del mes siguiente al período fiscal. Ejemplo: período 
      2026-09, NIT terminado en 1 → vence el 10/10/2026. 
      NIT terminado en 0 → vence el 19/10/2026."

[x] Implementar obtenerObligacionesPendientes()
    → Recorre todos los períodos fiscales.
    → Devuelve los que tienen impuestos por declarar o pagar.
    → Ordenado por fecha de vencimiento ascendente.
    → Para el dashboard: "Próximos vencimientos".

[x] Implementar generarAlertasVencimiento(diasAntes)
    → Genera alertas para vencimientos próximos.
    → Ejemplo: "Form. 200 de septiembre vence en 3 días".
    → Se muestra en el dashboard y en la vista de impuestos.
```

---

# FASE 5.3 — IVA: Conciliación Débito/Crédito Fiscal (Form. 200)

## ¿Qué hace esta fase?
Implementa la **conciliación del IVA** — el proceso de comparar el IVA débito fiscal (de las ventas) contra el IVA crédito fiscal (de las compras) para determinar si la empresa debe pagar IVA o tiene saldo a favor.

## Lógica de la conciliación

```text
CONCILIACIÓN DEL IVA — Septiembre 2026
─────────────────────────────────────────────────────────────────
IVA DÉBITO FISCAL (de las ventas):
  Venta 1: Bs 11,300 → IVA: 11,300 - 11,300/1.13 = Bs 1,300.00
  Venta 2: Bs 5,650  → IVA: 5,650 - 5,650/1.13  = Bs 650.00
  ─────────────────────────────────────────────────
  TOTAL IVA DÉBITO:                              Bs 1,950.00

IVA CRÉDITO FISCAL (de las compras):
  Compra 1: Bs 5,650 → IVA: 5,650 - 5,650/1.13  = Bs 650.00
  Compra 2: Bs 2,260 → IVA: 2,260 - 2,260/1.13  = Bs 260.00
  ─────────────────────────────────────────────────
  TOTAL IVA CRÉDITO:                             Bs 910.00

RESULTADO:
  IVA Débito:    Bs 1,950.00
  IVA Crédito:   Bs 910.00
  ─────────────────────────────────────────────────
  IVA POR PAGAR: Bs 1,040.00  ← Se paga al SIN con Form. 200

⚠️ Si IVA Crédito > IVA Débito:
   → Saldo a favor del contribuyente.
   → Se arrastra al mes siguiente.
   → No se paga IVA ese mes.
```

## Tareas de la Fase 5.3

```text
[x] Implementar calcularIVADebito(periodo)
    → Recorre todas las ventas del período.
    → Para cada venta: calcula el IVA débito (total - total/1.13).
    → Suma todos los IVA débito.
    → Devuelve { totalVentas, totalIVADebito, detalle[] }.

[x] Implementar calcularIVACredito(periodo)
    → Recorre todas las compras del período.
    → Para cada compra: calcula el IVA crédito (total - total/1.13).
    → Suma todos los IVA crédito.
    → Valida que cada factura tenga NIT y CUF válidos.
    → ⚠️ No incluye facturas de proveedores con NIT inválido.
    → Devuelve { totalCompras, totalIVACredito, detalle[] }.

[x] Implementar conciliarIVA(periodo)
    → Calcula IVA débito y crédito.
    → Si débito > crédito → IVA por pagar = débito - crédito.
    → Si crédito > débito → saldo a favor = crédito - débito.
    → Guarda el resultado en el período fiscal.
    → Devuelve { ivaPorPagar, saldoFavor, detalle }.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que concilie 
      el IVA de un período fiscal en Bolivia. Recibe el IVA débito 
      fiscal (de ventas) y el IVA crédito fiscal (de compras). 
      Si débito > crédito → hay IVA por pagar. Si crédito > débito 
      → hay saldo a favor que se arrastra al mes siguiente. 
      Devuelve objeto con el resultado y el desglose."

[x] Implementar generarFormulario200(periodo)
    → Genera la estructura del Formulario 200 del SIN.
    → Incluye: ventas netas, IVA débito, compras netas, IVA crédito, 
      IVA por pagar o saldo a favor.
    → Devuelve un objeto con los campos del formulario.
    → ⚠️ En el prototipo, solo se genera la estructura. 
      El envío real al SIN se haría en un sistema productivo.

[x] Implementar obtenerSaldoIVAFavor()
    → Devuelve el saldo a favor acumulado de meses anteriores.
    → Se usa para compensar en el mes actual.
    → Si hay saldo a favor → se resta del IVA por pagar.
```

---

# FASE 5.4 — IT: Impuesto a las Transacciones (Form. 400)

## ¿Qué hace esta fase?
Implementa el cálculo del **IT (Impuesto a las Transacciones)** — el 3% sobre los ingresos brutos de cada transacción. Se declara mensualmente en el Formulario 400. El IT pagado durante el año se puede compensar contra el IUE anual (Art. 77 Ley 843).

## Lógica del IT

```text
CÁLCULO DEL IT — Septiembre 2026
─────────────────────────────────────────────────────────────────
Ingresos brutos del mes:
  Venta 1: Bs 11,300
  Venta 2: Bs 5,650
  ─────────────────────────────────────────────────
  TOTAL INGRESOS BRUTOS: Bs 16,950

IT = 3% × 16,950 = Bs 508.50

⚠️ IMPORTANTE: El IT se calcula sobre el MONTO BRUTO 
   (el total de la factura), NO sobre el neto.
   No importa que el IVA esté incluido.

⚠️ El IT pagado en el mes se acumula para compensar 
   contra el IUE anual (Art. 77 Ley 843).
   Ver Fase 5.6.
```

## Tareas de la Fase 5.4

```text
[x] Implementar calcularIT(periodo)
    → Recorre todas las ventas del período.
    → Suma los ingresos brutos (montos totales, sin descontar IVA).
    → Calcula: IT = ingresos brutos × 3%.
    → Devuelve { ingresosBrutos, itPorPagar }.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que calcule 
      el IT (Impuesto a las Transacciones) en Bolivia. El IT es 
      el 3% sobre los ingresos brutos del período (monto total 
      de las facturas, sin descontar IVA). Devuelve el monto 
      del IT por pagar y el acumulado del año para compensar 
      contra el IUE."

[x] Implementar acumularITAnual(periodo, itPagado)
    → Suma el IT pagado en el período al acumulado anual.
    → Este acumulado se usará para compensar el IUE.
    → Guarda en el período fiscal: itPagadoAcumulado.

[x] Implementar generarFormulario400(periodo)
    → Genera la estructura del Formulario 400 del SIN.
    → Incluye: ingresos brutos, IT por pagar.
    → Devuelve un objeto con los campos del formulario.

[x] Implementar obtenerITAcumuladoAnual(año)
    → Suma el IT pagado en todos los meses del año.
    → Este dato es clave para la compensación IT-IUE (Fase 5.6).
```

---

# FASE 5.5 — IUE: Impuesto a las Utilidades (Form. 500)

## ¿Qué hace esta fase?
Implementa el cálculo del **IUE (Impuesto sobre las Utilidades de las Empresas)** — el 25% sobre la utilidad neta imponible. Se declara anualmente en el Formulario 500 (o 510) dentro de los 120 días posteriores al cierre de la gestión fiscal.

## Lógica del IUE

```text
CÁLCULO DEL IUE — Gestión 2026
─────────────────────────────────────────────────────────────────
UTILIDAD CONTABLE (del Estado de Resultados):
  Ventas netas:                    Bs 150,000
  (-) Costo de ventas:             Bs 80,000
  (-) Gastos operativos:           Bs 40,000
  (-) Depreciación:                Bs 2,000
  (-) IT pagado:                   Bs 4,500
  ─────────────────────────────────────────────────
  UTILIDAD CONTABLE:               Bs 23,500

AJUSTES FISCALES (diferencias entre contabilidad y tributación):
  (+) Gastos no deducibles:        Bs 1,500
  (-) Ingresos no gravables:       Bs 0
  ─────────────────────────────────────────────────
  UTILIDAD IMPONIBLE:              Bs 25,000

IUE = 25% × 25,000 = Bs 6,250

COMPENSACIÓN CON IT (Art. 77 Ley 843):
  IT pagado en el año:             Bs 4,500
  IUE determinado:                 Bs 6,250
  ─────────────────────────────────────────────────
  IUE POR PAGAR: 6,250 - 4,500 = Bs 1,750

⚠️ Si IT pagado > IUE determinado:
   → IUE por pagar = 0
   → El exceso NO se devuelve (se pierde).
   → Por eso es importante planificar el IT.
```

## Tareas de la Fase 5.5

```text
[x] Implementar calcularIUE(año)
    → Obtiene la utilidad contable del cierre del ejercicio.
    → Aplica ajustes fiscales (gastos no deducibles, ingresos no gravables).
    → Calcula la utilidad imponible.
    → Calcula: IUE = 25% × utilidad imponible.
    → Si utilidad imponible ≤ 0 → IUE = 0.
    → Devuelve { utilidadContable, ajustes, utilidadImponible, iueDeterminado }.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que calcule 
      el IUE (Impuesto sobre las Utilidades) en Bolivia. Parte 
      de la utilidad contable, aplica ajustes fiscales (gastos 
      no deducibles, ingresos no gravables), calcula la utilidad 
      imponible, y aplica el 25%. Si la utilidad imponible es 
      negativa o cero, el IUE es 0. Devuelve desglose completo."

[x] Implementar aplicarAjustesFiscales(utilidadContable, ajustes)
    → Suma gastos no deducibles (multas, donaciones no autorizadas).
    → Resta ingresos no gravables.
    → Devuelve la utilidad imponible ajustada.
    → ⚠️ En el prototipo, los ajustes son manuales (el contador 
      los ingresa). En un sistema productivo, se detectarían 
      automáticamente.

[x] Implementar generarFormulario500(año)
    → Genera la estructura del Formulario 500 del SIN.
    → Incluye: utilidad contable, ajustes, utilidad imponible, 
      IUE determinado, IT compensado, IUE por pagar.
    → Devuelve un objeto con los campos del formulario.

[x] Implementar calcularFechaLimiteIUE(cierreGestion)
    → La fecha límite es 120 días después del cierre.
    → Ejemplo: cierre 31/12/2026 → límite 30/04/2027.
    → Devuelve la fecha límite.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que calcule 
      la fecha límite para declarar el IUE en Bolivia. Son 120 
      días calendario posteriores al cierre de la gestión fiscal. 
      Ejemplo: si la gestión cierra el 31/12/2026, la fecha límite 
      es el 30/04/2027. Maneja años bisiestos correctamente."
```

---

# FASE 5.6 — Compensación IT vs IUE (Art. 77 Ley 843)

## ¿Qué hace esta fase?
Implementa la **compensación del IT pagado contra el IUE anual**. Esta es una de las reglas más importantes de la tributación boliviana y la que muchos sistemas genéricos no implementan.

## Lógica de la compensación

```text
COMPENSACIÓN IT vs IUE — Gestión 2026
─────────────────────────────────────────────────────────────────
IT PAGADO MES A MES:
  Enero:      Bs 450.00
  Febrero:    Bs 380.00
  Marzo:      Bs 520.00
  Abril:      Bs 410.00
  Mayo:       Bs 480.00
  Junio:      Bs 390.00
  Julio:      Bs 460.00
  Agosto:     Bs 430.00
  Septiembre: Bs 508.50
  Octubre:    Bs 471.50
  ─────────────────────────────────────────────────
  TOTAL IT PAGADO EN EL AÑO:     Bs 4,500.00

IUE DETERMINADO:                  Bs 6,250.00

COMPENSACIÓN:
  IUE determinado:                Bs 6,250.00
  (-) IT pagado en el año:        Bs 4,500.00
  ─────────────────────────────────────────────────
  IUE POR PAGAR:                  Bs 1,750.00

⚠️ CASO ESPECIAL: Si IT pagado > IUE determinado
  IUE determinado:                Bs 3,000.00
  IT pagado en el año:            Bs 4,500.00
  ─────────────────────────────────────────────────
  IUE POR PAGAR:                  Bs 0.00
  Exceso de IT:                   Bs 1,500.00 → SE PIERDE
  
  ⚠️ El exceso de IT NO se devuelve ni se arrastra.
     Por eso la planificación tributaria es importante.
```

## Tareas de la Fase 5.6

```text
[x] Implementar compensarITcontraIUE(año)
    → Obtiene el IT acumulado del año (de la Fase 5.4).
    → Obtiene el IUE determinado (de la Fase 5.5).
    → Si IT < IUE → IUE por pagar = IUE - IT.
    → Si IT ≥ IUE → IUE por pagar = 0 (exceso se pierde).
    → Devuelve { itAcumulado, iueDeterminado, iuePorPagar, excesoIT }.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que implemente 
      la compensación del IT contra el IUE en Bolivia según el 
      Art. 77 de la Ley 843. El IT pagado durante el año se 
      descuenta del IUE determinado. Si el IT es menor que el IUE, 
      se paga la diferencia. Si el IT es mayor o igual, el IUE 
      es 0 y el exceso se pierde (no se devuelve). Devuelve 
      desglose completo con advertencias."

[x] Implementar generarAdvertenciaPlanificacion(año)
    → Si el IT acumulado está cerca de superar el IUE estimado,
      genera una advertencia.
    → Ejemplo: "IT acumulado: Bs 4,200. IUE estimado: Bs 4,500. 
      Si el IT supera el IUE, el exceso se pierde."
    → Para ayudar al contador a planificar.

[x] Crear docs/aprendizaje/20-compensacion-it-iue-ejemplos.md
    → 3 ejemplos numéricos completos:
      1. IT < IUE (paga diferencia).
      2. IT = IUE (no paga nada).
      3. IT > IUE (exceso se pierde).
    → 🧠 Mini-Prompt para IA: "Genera 3 ejemplos numéricos 
      completos de la compensación IT-IUE en Bolivia: 
      1) IT menor que IUE (paga diferencia), 
      2) IT igual a IUE (no paga nada), 
      3) IT mayor que IUE (exceso se pierde, advertencia). 
      Usa montos realistas en bolivianos. Incluye la referencia 
      al Art. 77 de la Ley 843."
```

---

# FASE 5.7 — RC-IVA: Régimen Complementario al IVA

## ¿Qué hace esta fase?
Implementa el **RC-IVA (Régimen Complementario al IVA)** del 13% que aplica a dependientes (empleados) y, desde 2023, también a profesionales independientes como contribuyentes directos.

## Lógica del RC-IVA

```text
RC-IVA PARA EMPLEADOS (ya visto en Módulo 4):
─────────────────────────────────────────────────
• Se calcula como 13% del total devengado.
• Se compensa con facturas de gastos personales.
• La empresa actúa como agente de retención.
• Se declara en el Form. 200 (junto con el IVA).

RC-IVA PARA PROFESIONALES INDEPENDIENTES (desde 2023):
─────────────────────────────────────────────────
• El profesional es contribuyente directo.
• Calcula el 13% de sus ingresos.
• Puede compensar con facturas de gastos vinculados.
• Se declara en el Form. 200 mensual.

RC-IVA COMO RETENCIÓN (proveedores):
─────────────────────────────────────────────────
• Se retiene el 13% cuando el proveedor:
  - No emite factura válida.
  - Está en un régimen especial.
  - Es sujeto pasivo del régimen complementario.
• La empresa retiene y paga al SIN.
• Se declara en el Form. 110 (retenciones).
```

## Tareas de la Fase 5.7

```text
[ ] Implementar calcularRCIVAIndependiente(ingresos, gastos)
    → Calcula el 13% de los ingresos del profesional independiente.
    → Compensa con facturas de gastos vinculados.
    → Devuelve { rcIVATeorico, gastosCompensables, rcIVAPagar }.

[ ] Implementar calcularRetencionRCIVA(montoPago, tipoProveedor)
    → Si el proveedor es sujeto de retención → retiene 13%.
    → Si el proveedor emite factura válida → no retiene.
    → Devuelve { montoPago, retencionRCIVA, netoAPagar }.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que calcule 
      la retención del RC-IVA en Bolivia. Se retiene el 13% cuando 
      el proveedor no emite factura válida o está en un régimen 
      especial. Si el proveedor emite factura válida con NIT y CUF, 
      no se retiene. Devuelve el monto retenido y el neto a pagar."

[ ] Implementar generarFormulario110(periodo)
    → Genera la estructura del Formulario 110 del SIN.
    → Incluye: retenciones de RC-IVA a empleados y proveedores.
    → Devuelve un objeto con los campos del formulario.
```

---

# FASE 5.8 — Retenciones (RC-IVA e IT)

## ¿Qué hace esta fase?
Implementa las **retenciones** que la empresa debe practicar como agente de retención. Las dos principales son: retención del RC-IVA (13%) y retención del IT (3%).

## Retenciones en Bolivia

```text
RETENCIÓN RC-IVA (13%):
─────────────────────────────────────────────────
• Se retiene a proveedores del régimen complementario.
• Se retiene a empleados (como parte de la nómina).
• Se retiene a profesionales independientes (desde 2023).
• Se declara en Form. 110.

RETENCIÓN IT (3%):
─────────────────────────────────────────────────
• Se retiene en ciertos pagos:
  - Servicios profesionales sin factura.
  - Alquileres a personas naturales.
  - Compras a contribuyentes no inscritos.
• Se declara en Form. 110.

EJEMPLO DE RETENCIÓN COMBINADA:
─────────────────────────────────────────────────
Pago por servicio profesional sin factura: Bs 10,000

  Retención RC-IVA: 13% × 10,000 = Bs 1,300
  Retención IT:      3% × 10,000 = Bs 300
  ─────────────────────────────────────────────────
  Total retenido:                   Bs 1,600
  Neto a pagar al proveedor:        Bs 8,400
```

## Tareas de la Fase 5.8

```text
[ ] Implementar calcularRetenciones(montoPago, tipoProveedor)
    → Determina qué retenciones aplican según el tipo de proveedor.
    → Calcula retención RC-IVA (si aplica).
    → Calcula retención IT (si aplica).
    → Devuelve { retencionRCIVA, retencionIT, totalRetenido, netoAPagar }.

[ ] Implementar obtenerRetencionesDelPeriodo(periodo)
    → Recorre todos los pagos del período.
    → Suma las retenciones de RC-IVA e IT.
    → Devuelve el total para el Form. 110.

[ ] Implementar registrarRetencion(datosRetencion)
    → Registra una retención practicada.
    → Genera el documento fuente: COMPROBANTE_RETENCION.
    → Genera el asiento contable:
      Gasto / Retención RC-IVA por Pagar / Retención IT por Pagar / Bancos.
```

---

# FASE 5.9 — IUE-BE: Beneficiarios del Exterior

## ¿Qué hace esta fase?
Implementa el **IUE-BE (IUE para Beneficiarios del Exterior)** — la retención sobre utilidades o dividendos remesados al extranjero. La tasa efectiva es 12.5% (25% sobre una base presunta del 50%).

## Lógica del IUE-BE

```text
CÁLCULO DEL IUE-BE:
─────────────────────────────────────────────────
• Aplica cuando una empresa boliviana remesa utilidades 
  o dividendos a un beneficiario del exterior.
• Tasa nominal: 25% sobre una base presunta del 50%.
• Tasa efectiva: 25% × 50% = 12.5%.

EJEMPLO:
─────────────────────────────────────────────────
Remesa de utilidades al exterior: Bs 100,000

  Base presunta: 50% × 100,000 = Bs 50,000
  IUE-BE: 25% × 50,000 = Bs 12,500
  
  O directamente: 12.5% × 100,000 = Bs 12,500

  Neto remesado: 100,000 - 12,500 = Bs 87,500
```

## Tareas de la Fase 5.9

```text
[ ] Implementar calcularIUEBE(montoRemesa)
    → Calcula el IUE-BE: 12.5% del monto remesado.
    → Devuelve { montoRemesa, iueBE, netoRemesado }.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que calcule 
      el IUE-BE (IUE para Beneficiarios del Exterior) en Bolivia. 
      La tasa efectiva es 12.5% (25% sobre base presunta del 50%). 
      Devuelve el monto retenido y el neto a remesar. Incluye 
      la referencia al Formulario 530."

[ ] Implementar registrarRemesaExterior(datosRemesa)
    → Registra una remesa de utilidades al exterior.
    → Calcula el IUE-BE.
    → Genera el asiento contable:
      Utilidades por Distribuir / IUE-BE por Pagar / Bancos.
    → Genera el documento fuente.
```

---

# FASE 5.10 — Regímenes Tributarios (RG, RTS, STI, RAU, SIETE-RG)

## ¿Qué hace esta fase?
Implementa la **clasificación de contribuyentes por régimen tributario**. Cada régimen tiene reglas diferentes de facturación, declaración y pago. El ERP debe saber en qué régimen está cada cliente y proveedor para aplicar las reglas correctas.

## Cuadro comparativo de regímenes

```text
╔══════════════════════════════════════════════════════════════════╗
║ RÉGIMEN │ PARA QUIÉN │ PAGO │ PERIODICIDAD │ CRÉDITO FISCAL   ║
║─────────┼────────────┼──────┼──────────────┼──────────────────║
║ RG      │ Empresas   │ IVA+ │ Mensual +    │ SÍ               ║
║         │ sin límite │ IT+  │ anual IUE    │                  ║
║         │            │ IUE  │              │                  ║
║─────────┼────────────┼──────┼──────────────┼──────────────────║
║ RTS     │ Comerciantes│ Cuota│ Bimestral    │ NO               ║
║         │ minoristas │ fija │              │                  ║
║─────────┼────────────┼──────┼──────────────┼──────────────────║
║ STI     │ Transporte │ Cuota│ Trimestral   │ NO               ║
║         │ público    │ fija │              │                  ║
║─────────┼────────────┼──────┼──────────────┼──────────────────║
║ RAU     │ Actividad  │ Cuota│ Anual        │ NO               ║
║         │ agropecuaria│ por │              │                  ║
║         │            │ super│              │                  ║
║─────────┼────────────┼──────┼──────────────┼──────────────────║
║ SIETE-RG│ Emprendedor│ 5%   │ Bimestral    │ NO (se acumula)  ║
║ (2026)  │ pequeños   │ bruto│              │                  ║
╚══════════════════════════════════════════════════════════════════╝
```

## Tareas de la Fase 5.10

```text
[ ] Crear js/config/regimenes-tributarios.js
    → Exportar constante REGIMENES_TRIBUTARIOS con los 5 regímenes.
    → Cada régimen tiene: codigo, nombre, descripcion, 
      periodicidad, emiteCreditoFiscal, limites.

[ ] Implementar obtenerRegimenContribuyente(nit)
    → Consulta el régimen tributario del contribuyente.
    → En el prototipo, se guarda en el catálogo de clientes/proveedores.
    → En un sistema productivo, se consultaría al padrón del SIN.

[ ] Implementar validarRegimenParaOperacion(regimen, tipoOperacion)
    → Verifica si un régimen permite cierta operación.
    → Ejemplo: RTS no puede emitir factura con crédito fiscal.
    → Ejemplo: SIETE-RG no genera débito/crédito fiscal.
    → Devuelve { permitido, advertencia }.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que valide 
      si un régimen tributario boliviano permite cierta operación. 
      El Régimen General permite crédito fiscal. El RTS, STI, RAU 
      y SIETE-RG no permiten crédito fiscal. El SIETE-RG acumula 
      el crédito para cuando migre al RG. Devuelve si está 
      permitido y una advertencia explicativa."

[ ] Implementar detectarMigracionRegimen(contribuyente)
    → Verifica si el contribuyente superó los límites de su régimen.
    → Si superó → sugiere migrar al Régimen General.
    → Ejemplo: RTS con ventas > límite → migrar a RG.
    → Ejemplo: SIETE-RG con 3 años de antigüedad → migrar a RG.
    → Devuelve { debeMigrar, regimenSugerido, motivo }.
```

---

# FASE 5.11 — Generación de Asientos Contables de Impuestos

## ¿Qué hace esta fase?
Genera los **asientos contables** que reflejan el cálculo y pago de impuestos. Estos asientos se procesan en el Motor Contable (Módulo 3).

## Asientos que se generan

```text
ASIENTO DE IVA POR PAGAR (mensual):
─────────────────────────────────────────────────
  IVA Débito Fiscal               Bs 1,950   (Debe)
      IVA Crédito Fiscal                   Bs 910    (Haber)
      IVA por Pagar                        Bs 1,040  (Haber)

ASIENTO DE IT POR PAGAR (mensual):
─────────────────────────────────────────────────
  Gasto de IT                     Bs 508.50  (Debe)
      IT por Pagar                         Bs 508.50 (Haber)

ASIENTO DE PAGO DE IVA E IT:
─────────────────────────────────────────────────
  IVA por Pagar                   Bs 1,040   (Debe)
  IT por Pagar                    Bs 508.50  (Debe)
      Bancos                               Bs 1,548.50 (Haber)

ASIENTO DE IUE (anual):
─────────────────────────────────────────────────
  Gasto de IUE                    Bs 6,250   (Debe)
      IUE por Pagar                        Bs 6,250  (Haber)

ASIENTO DE COMPENSACIÓN IT-IUE:
─────────────────────────────────────────────────
  IUE por Pagar                   Bs 6,250   (Debe)
      IT Pagado (activo)                   Bs 4,500  (Haber)
      IUE por Pagar (diferencia)           Bs 1,750  (Haber)

ASIENTO DE PAGO DE IUE:
─────────────────────────────────────────────────
  IUE por Pagar                   Bs 1,750   (Debe)
      Bancos                               Bs 1,750  (Haber)
```

## Tareas de la Fase 5.11

```text
[ ] Implementar generarAsientoIVA(conciliacion)
    → Genera el asiento de conciliación del IVA.
    → Debe: IVA Débito Fiscal.
    → Haber: IVA Crédito Fiscal + IVA por Pagar.
    → Si hay saldo a favor → se registra como activo.

[ ] Implementar generarAsientoIT(itCalculado)
    → Genera el asiento del IT del mes.
    → Debe: Gasto de IT.
    → Haber: IT por Pagar.

[ ] Implementar generarAsientoPagoImpuestos(iva, it)
    → Genera el asiento de pago al SIN.
    → Debe: IVA por Pagar + IT por Pagar.
    → Haber: Bancos.

[ ] Implementar generarAsientoIUE(iueCalculado)
    → Genera el asiento del IUE anual.
    → Debe: Gasto de IUE.
    → Haber: IUE por Pagar.

[ ] Implementar generarAsientoCompensacionIT(compensacion)
    → Genera el asiento de compensación IT-IUE.
    → Debe: IUE por Pagar (total).
    → Haber: IT Pagado (acumulado) + IUE por Pagar (diferencia).

[ ] Conectar con el Motor Contable (Módulo 3)
    → Los asientos generados se guardan en "asientosPendientes".
    → El Motor Contable los procesa y valida la partida doble.
```

---

# FASE 5.12 — Vista de Impuestos (Liquidaciones + Formularios)

## ¿Qué hace esta fase?
Construye las **pantallas** donde el usuario gestiona los impuestos: liquidación de IVA, IT, IUE, compensaciones, y vista previa de los formularios del SIN.

## Tareas de la Fase 5.12

```text
[ ] Crear vistas/impuestos.html
    → Secciones:
      ├── <h1> Impuestos y Cumplimiento Fiscal
      ├── <div class="tabs">
      │   ├── Liquidación IVA (Form. 200)
      │   ├── Liquidación IT (Form. 400)
      │   ├── Liquidación IUE (Form. 500)
      │   ├── Compensación IT-IUE
      │   ├── Retenciones (Form. 110)
      │   ├── Regímenes Tributarios
      │   └── Calendario de Vencimientos
      ├── <div id="contenido-tab">
      └── <table> para listar registros

[ ] Crear js/vistas/impuestos-vista.js
    → Lógica de la vista de impuestos.
    → Manejar cambio de tabs.
    → Botón "Calcular IVA del Mes" → conciliarIVA().
    → Botón "Calcular IT del Mes" → calcularIT().
    → Botón "Calcular IUE Anual" → calcularIUE().
    → Botón "Compensar IT vs IUE" → compensarITcontraIUE().
    → Vista previa de cada formulario del SIN.

[ ] Implementar la vista de liquidación de IVA
    → Tabla con: IVA débito, IVA crédito, IVA por pagar.
    → Desglose por factura (LCV preliminar).
    → Botón "Generar Form. 200" que muestra la estructura.

[ ] Implementar la vista de compensación IT-IUE
    → Tabla con el IT pagado mes a mes.
    → Acumulado anual.
    → IUE determinado.
    → Resultado de la compensación.
    → Advertencia si el IT supera el IUE.

[ ] Implementar el calendario de vencimientos
    → Tabla con los próximos vencimientos.
    → Ordenado por fecha ascendente.
    → Semáforo: verde (>7 días), amarillo (3-7 días), rojo (<3 días).
    → 🧠 Mini-Prompt para IA: "Genera un calendario tributario 
      en HTML/JS para Bolivia. Muestra los próximos vencimientos 
      de Form. 200, Form. 400, Form. 110 (mensuales) y Form. 500 
      (anual). Los vencimientos dependen del último dígito del NIT 
      (10 al 19 del mes siguiente). Incluye un semáforo visual: 
      verde si faltan más de 7 días, amarillo si faltan 3-7 días, 
      rojo si faltan menos de 3 días."

[ ] Conectar con el menú lateral
    → Agregar enlace "🧾 Impuestos" en index.html.
    → Verificar que el enrutador carga vistas/impuestos.html.
```

---

# FASE 5.13 — Smoke Test Final y Commit de Cierre

## Checklist de humo (smoke test)

```text
[ ] Smoke test #1: Conciliar IVA del mes
    → Ejecutar window.ModuloImpuestos.conciliarIVA("2026-09")
    → Verificar que IVA débito = suma de IVA de ventas
    → Verificar que IVA crédito = suma de IVA de compras
    → Verificar que IVA por pagar = débito - crédito

[ ] Smoke test #2: Calcular IT del mes
    → Ejecutar window.ModuloImpuestos.calcularIT("2026-09")
    → Verificar que IT = 3% × ingresos brutos
    → Verificar que se acumula al IT anual

[ ] Smoke test #3: Calcular IUE anual
    → Ejecutar window.ModuloImpuestos.calcularIUE(2026)
    → Verificar que parte de la utilidad contable
    → Verificar que aplica ajustes fiscales
    → Verificar que IUE = 25% × utilidad imponible

[ ] Smoke test #4: Compensar IT contra IUE
    → Ejecutar window.ModuloImpuestos.compensarITcontraIUE(2026)
    → Verificar que IT acumulado se descuenta del IUE
    → Verificar que si IT < IUE → paga diferencia
    → Verificar que si IT ≥ IUE → IUE = 0 (exceso se pierde)

[ ] Smoke test #5: Calcular retenciones
    → Registrar un pago a proveedor sin factura
    → Verificar que se retiene RC-IVA 13% + IT 3%
    → Verificar que el neto a pagar es correcto

[ ] Smoke test #6: Calcular IUE-BE
    → Ejecutar window.ModuloImpuestos.calcularIUEBE(100000)
    → Verificar que IUE-BE = 12.5% × 100,000 = 12,500
    → Verificar que neto remesado = 87,500

[ ] Smoke test #7: Validar regímenes tributarios
    → Cliente en Régimen General → permite crédito fiscal
    → Cliente en RTS → no permite crédito fiscal
    → Cliente en SIETE-RG → no genera débito/crédito, acumula

[ ] Smoke test #8: Verificar calendario de vencimientos
    → Verificar que los vencimientos se calculan según dígito del NIT
    → Verificar que el semáforo muestra colores correctos
    → Verificar que Form. 500 tiene plazo de 120 días

[ ] Smoke test #9: Verificar asientos contables
    → Los asientos de impuestos se generan correctamente
    → Se procesan en el Motor Contable (Módulo 3)
    → Aparecen en el Libro Diario y el Libro Mayor

[ ] Smoke test #10: Persistencia
    → Recargar la página (F5)
    → Las liquidaciones y formularios deben seguir ahí
    → Abrir DevTools → LocalStorage → verificar colecciones

[ ] Commit de cierre del Módulo 5
    → git add .
    → git commit -m "feat(modulo-5): Impuestos bolivianos completos
    
      - IVA: conciliación débito/crédito fiscal (Form. 200)
      - IT: 3% sobre ingresos brutos (Form. 400)
      - IUE: 25% sobre utilidad imponible (Form. 500)
      - Compensación IT vs IUE (Art. 77 Ley 843)
      - RC-IVA: empleados y profesionales independientes
      - Retenciones: RC-IVA e IT (Form. 110)
      - IUE-BE: beneficiarios del exterior (12.5% efectivo)
      - Regímenes tributarios: RG, RTS, STI, RAU, SIETE-RG
      - Calendario de vencimientos según dígito del NIT
      - Generación automática de asientos contables
      - Smoke test: todos los tests pasan
      
      Próximo paso: Módulo 6 - Estados Financieros"
```

---

## 🎯 Criterios de Aceptación del Módulo 5

El Módulo 5 se considera **completado** cuando:

- [x] El IVA se concilia correctamente (débito vs. crédito)
- [x] El IT se calcula sobre ingresos brutos (no netos)
- [x] El IUE se calcula sobre utilidad imponible (con ajustes)
- [x] La compensación IT-IUE funciona según Art. 77 Ley 843
- [x] El exceso de IT sobre IUE se pierde (no se devuelve)
- [x] El RC-IVA se calcula y compensa con facturas
- [x] Las retenciones se aplican según el tipo de proveedor
- [x] El IUE-BE se calcula correctamente (12.5% efectivo)
- [x] Los regímenes tributarios se validan correctamente
- [x] El calendario de vencimientos funciona según dígito del NIT
- [x] Los asientos contables se generan y procesan
- [x] Se puede explicar en 5 minutos el sistema tributario boliviano

---

## 📚 Material de Exposición Generado en Este Módulo

| Archivo | Contenido | Uso en exposición |
|---|---|---|
| `17-impuestos-bolivianos-explicados.md` | Teoría de los 5 impuestos | Abrir la explicación |
| `18-calendario-tributario.md` | Vencimientos por NIT | Mostrar el calendario |
| `19-compensacion-it-iue.md` | Art. 77 Ley 843 | Demostrar conocimiento |
| `20-compensacion-it-iue-ejemplos.md` | 3 ejemplos numéricos | Caso práctico |

---

## 🚀 Próximos Módulos (adelanto)

| Módulo | Tema | Duración | Depende de |
|---|---|---|---|
| **Módulo 6** | Capa 4 — Estados Financieros | 5–7 h | Módulo 5 |
| **Módulo 7** | Capa 5 — Cumplimiento SIN | 4–6 h | Módulo 6 |
| **Módulo 8** | Migración a SaaS real (opcional) | 10–15 h | Módulo 7 |

---

## ⚠️ Advertencia final

La tentación aquí es **implementar solo el IVA y el IT** porque son los impuestos mensuales más visibles, y dejar el IUE y la compensación IT-IUE para "después". *"Total, el IUE es anual y falta mucho"*. **No lo hagas.** La compensación IT-IUE (Art. 77 Ley 843) es una de las reglas más distintivas del sistema tributario boliviano, y es exactamente el tipo de conocimiento que separa un ERP genérico de uno realmente adaptado a Bolivia. En una exposición, poder decir *"este sistema acumula el IT pagado mes a mes y lo compensa automáticamente contra el IUE anual, y si el IT supera el IUE, el sistema alerta al contador porque el exceso se pierde"* es lo que demuestra que no solo sabes programar — sabes tributación boliviana. Dedica tiempo a que la compensación funcione perfectamente con ejemplos numéricos reales.

---

**¿Siguiente paso?** Cuando completes este Módulo 5, avísame y generamos el **ROADMAP_MODULO_6_ESTADOS_FINANCIEROS.md** con el mismo formato. 🚀
