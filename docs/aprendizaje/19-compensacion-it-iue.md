# Compensación IT vs IUE (Art. 77 Ley 843)

**Módulo:** 5 — Impuestos y Cumplimiento Fiscal
**Tiempo de lectura:** 5 minutos
**Normativa aplicable:** Ley 843, Art. 77; Código Tributario; RND del SIN

---

## Introducción

El **Art. 77 de la Ley 843** establece uno de los mecanismos más importantes de la tributación boliviana: la **compensación del IT pagado contra el IUE anual**. Este mecanismo evita la doble tributación sobre la misma renta, porque el IT (3% sobre ingresos brutos) y el IUE (25% sobre utilidades) gravan aspectos relacionados de la misma actividad económica.

Es una regla que **muchos contadores conocen pero pocos sistemas implementan correctamente**, y es exactamente el tipo de conocimiento que separa un ERP genérico de uno realmente adaptado a Bolivia.

---

## Base legal: Art. 77 Ley 843

El Art. 77 establece que el **IT pagado durante el año fiscal** constituye un **crédito fiscal** contra el IUE determinado al cierre de gestión. En la práctica:

- El IT se paga **mes a mes** (Form. 400).
- El IUE se determina **una vez al año** (Form. 500).
- Al liquidar el IUE, se descuenta todo el IT pagado en el año.

```text
FÓRMULA GENERAL:
─────────────────────────────────────────────────
IUE por pagar = max(0, IUE determinado - IT pagado en el año)
```

**⚠️ Regla crítica:** Si el IT pagado **supera** al IUE determinado, el exceso **se pierde**. No se devuelve, no se arrastra al siguiente año, no se compensa con otros impuestos. Por eso la planificación tributaria es fundamental.

---

## Ejemplo 1: IT menor que IUE (paga diferencia)

**Caso:** Empresa con utilidad alta y pocas ventas relativas.

```text
DATOS DEL EJERCICIO 2026:
─────────────────────────────────────────────────
Ventas del año:             Bs 500,000
IT pagado (3%):             Bs 15,000  (Form. 400 mensual)

Utilidad imponible:         Bs 200,000
IUE determinado (25%):      Bs 50,000

COMPENSACIÓN:
─────────────────────────────────────────────────
IUE determinado:            Bs 50,000
(-) IT pagado en el año:    Bs 15,000
─────────────────────────────────────────────────
= IUE POR PAGAR:            Bs 35,000
```

**Resultado:** La empresa paga **Bs 35,000** de IUE en el Form. 500. El IT pagado mes a mes funcionó como un pago a cuenta.

---

## Ejemplo 2: IT igual a IUE (no paga nada)

**Caso:** Empresa donde el IT acumulado coincide exactamente con el IUE.

```text
DATOS DEL EJERCICIO 2026:
─────────────────────────────────────────────────
Ventas del año:             Bs 800,000
IT pagado (3%):             Bs 24,000

Utilidad imponible:         Bs 96,000
IUE determinado (25%):      Bs 24,000

COMPENSACIÓN:
─────────────────────────────────────────────────
IUE determinado:            Bs 24,000
(-) IT pagado en el año:    Bs 24,000
─────────────────────────────────────────────────
= IUE POR PAGAR:            Bs     0
```

**Resultado:** La empresa **no paga nada** de IUE. Todo el IT pagado durante el año se compensó exactamente con el IUE. Es el escenario ideal de equilibrio tributario.

---

## Ejemplo 3: IT mayor que IUE (el exceso se pierde)

**Caso:** Empresa con márgenes bajos pero muchas ventas (retail, distribución).

```text
DATOS DEL EJERCICIO 2026:
─────────────────────────────────────────────────
Ventas del año:             Bs 2,000,000
IT pagado (3%):             Bs 60,000

Utilidad imponible:         Bs 80,000
IUE determinado (25%):      Bs 20,000

COMPENSACIÓN:
─────────────────────────────────────────────────
IUE determinado:            Bs 20,000
(-) IT pagado en el año:    Bs 60,000
─────────────────────────────────────────────────
= IUE POR PAGAR:            Bs     0

⚠️ EXCESO DE IT:            Bs 40,000 → SE PIERDE
```

**Resultado:** La empresa **no paga IUE**, pero pierde **Bs 40,000** de IT que pagó durante el año. Este dinero no se devuelve, no se arrastra, no se compensa.

**Por eso este sector (retail con márgenes bajos) debe planificar cuidadosamente:** cada boliviano de IT que supera el IUE estimado es dinero perdido.

---

## Implicaciones contables

### Asiento de compensación al cierre de gestión

```text
ASIENTO DE COMPENSACIÓN IT-IUE:
─────────────────────────────────────────────────
  IUE por Pagar (pasivo)              Bs 50,000   (Debe)
      IT Pagado (activo transitorio)        Bs 15,000   (Haber)
      IUE por Pagar (diferencia)            Bs 35,000   (Haber)
```

### Cuentas contables involucradas

| Cuenta | Naturaleza | Uso |
|---|---|---|
| **2.1.18 IUE por Pagar** | Pasivo | IUE determinado pendiente |
| **1.1.15 IT Pagado (acumulado)** | Activo transitorio | IT acumulado del año |
| **5.4.01 Gasto de IUE** | Gasto | IUE determinado del ejercicio |
| **5.4.02 Gasto de IT** | Gasto | IT pagado mes a mes |

---

## Advertencia de planificación tributaria

El ERP debe **alertar al contador** cuando detecta que el IT acumulado está por superar el IUE estimado del año:

```text
⚠️ ADVERTENCIA DEL SISTEMA:
─────────────────────────────────────────────────
Mes actual: Noviembre 2026
IT acumulado (ene-nov):    Bs 58,000
IUE estimado del año:      Bs 62,000

Si las ventas de diciembre superan Bs 133,333,
el IT acumulado superará el IUE estimado y el 
exceso se perderá.

RECOMENDACIÓN: Revisar estrategia de facturación 
y pagos de diciembre para optimizar la carga 
tributaria.
```

---

## Conclusión

La compensación IT-IUE es una **oportunidad tributaria** si se maneja bien, y una **pérdida silenciosa** si no se monitorea. Las claves son:

1. **Acumular el IT mes a mes** → llevar el control exacto del IT pagado.
2. **Estimar el IUE del año** → proyectar la utilidad imponible.
3. **Comparar mensualmente** → detectar cuándo el IT va a superar el IUE.
4. **Planificar diciembre** → último mes para ajustar la estrategia.

Un ERP que implemente correctamente el Art. 77 demuestra dominio real de la tributación boliviana. Un ERP que no lo haga está subutilizando una herramienta legal que puede ahorrar miles de bolivianos al año.

---
