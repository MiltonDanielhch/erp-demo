# Impuestos Bolivianos según la Ley 843

**Módulo:** 5 — Impuestos y Cumplimiento Fiscal
**Tiempo de lectura:** 8 minutos
**Normativa aplicable:** Ley 843 (Reforma Tributaria), decretos reglamentarios, RND del SIN

---

## Introducción

El sistema tributario boliviano se rige principalmente por la **Ley 843 de Reforma Tributaria** (1986, con múltiples modificaciones). A diferencia de otros países de la región, Bolivia tiene un sistema donde **varios impuestos coexisten sobre la misma transacción** (IVA + IT sobre una misma venta), y donde las empresas actúan como **agentes de retención** del Estado.

En este documento explicamos los **5 impuestos principales** que toda empresa boliviana debe conocer y declarar.

---

## 1. IVA — Impuesto al Valor Agregado

| Aspecto | Detalle |
|---|---|
| **Tasa** | 13% |
| **Base imponible** | Precio neto de ventas (sin IVA) |
| **Formulario SIN** | Form. 200 (mensual) |
| **Frecuencia** | Mensual |
| **Hecho imponible** | Venta de bienes, prestación de servicios, importaciones |

### Cómo funciona

El IVA es un impuesto al consumo que grava el valor agregado en cada etapa de la cadena productiva. La empresa cobra IVA en sus ventas (**débito fiscal**) y paga IVA en sus compras (**crédito fiscal**). Mensualmente se concilian:

```text
IVA Débito Fiscal (de ventas)       Bs 10,000
(-) IVA Crédito Fiscal (de compras) Bs  4,500
─────────────────────────────────────────────
= IVA por pagar al SIN              Bs  5,500
```

Si el crédito supera al débito, se genera un **saldo a favor** que se arrastra al mes siguiente (nunca se devuelve en efectivo).

### ⚠️ Particularidad boliviana: IVA incluido en el precio

Según el **Art. 5 de la Ley 843**, en Bolivia el IVA está **incluido en el precio de venta**, a diferencia de otros países donde se agrega al final.

Para extraer el valor neto y el IVA de un monto con IVA incluido:

```text
Precio con IVA:  Bs 113.00
Valor neto:      Bs 113.00 ÷ 1.13 = Bs 100.00
IVA contenido:   Bs 113.00 − 100.00 = Bs 13.00
```

> **Nota:** La Ley 1733 (2026) modificó el Art. 5 para mostrar el IVA "por fuera", pero su decreto reglamentario aún está pendiente. En la práctica actual, seguimos trabajando con precios con IVA incluido.

---

## 2. IT — Impuesto a las Transacciones

| Aspecto | Detalle |
|---|---|
| **Tasa** | 3% |
| **Base imponible** | Ingresos brutos (monto total de la factura, con IVA) |
| **Formulario SIN** | Form. 400 (mensual) |
| **Frecuencia** | Mensual |
| **Hecho imponible** | Toda transacción comercial gravada |

### Cómo funciona

El IT grava **todos los ingresos brutos** de la empresa, sin deducciones. Se calcula sobre el monto total de cada factura, **sin descontar el IVA**.

```text
Ingresos brutos del mes: Bs 113,000
IT = 3% × 113,000 = Bs 3,390
```

### ⚠️ Particularidad clave: compensación con el IUE

El IT pagado durante el año **se acumula y se descuenta del IUE anual** (Art. 77 Ley 843). Esto evita la doble tributación sobre la misma renta. Ver documento `19-compensacion-it-iue.md` para detalles.

---

## 3. IUE — Impuesto sobre las Utilidades de las Empresas

| Aspecto | Detalle |
|---|---|
| **Tasa** | 25% |
| **Base imponible** | Utilidad neta imponible (con ajustes fiscales) |
| **Formulario SIN** | Form. 500 / 510 (anual) |
| **Frecuencia** | Anual (120 días después del cierre de gestión) |
| **Hecho imponible** | Utilidades generadas en el ejercicio fiscal |

### Cómo funciona

El IUE grava la utilidad de la empresa. Se parte de la **utilidad contable** (del Estado de Resultados) y se aplican **ajustes fiscales** para llegar a la utilidad imponible:

```text
Utilidad contable:                 Bs 100,000
(+) Gastos no deducibles:          Bs   5,000
(-) Ingresos no gravables:         Bs       0
─────────────────────────────────────────────
= Utilidad imponible:              Bs 105,000
IUE = 25% × 105,000 =              Bs  26,250
(-) IT pagado en el año (Art. 77): Bs   6,000
─────────────────────────────────────────────
= IUE a pagar:                     Bs  20,250
```

**Gastos no deducibles típicos:** multas, sanciones, donaciones no autorizadas, gastos sin factura válida.

---

## 4. RC-IVA — Régimen Complementario al IVA

| Aspecto | Detalle |
|---|---|
| **Tasa** | 13% |
| **Base imponible** | Ingresos brutos del contribuyente |
| **Formulario SIN** | Form. 200 (mensual) |
| **Frecuencia** | Mensual |
| **Hecho imponible** | Ingresos de dependientes e independientes |

### Cómo funciona

El RC-IVA es un régimen **complementario** al IVA, creado para gravar ingresos que de otra forma escaparían al sistema. Tiene dos modalidades:

**a) Empleados dependientes (agentes de retención):**
- La empresa retiene el 13% del total devengado.
- El empleado puede compensar con **facturas de gastos personales** (supermercado, farmacia, alquiler).
- Si las facturas cubren el 13%, el empleado no paga RC-IVA.

```text
Salario devengado:    Bs 10,000
RC-IVA teórico:       Bs 1,300
(-) IVA de facturas:  Bs 1,300
────────────────────────────────
RC-IVA a pagar:       Bs     0
```

**b) Profesionales independientes (desde 2023):**
- El profesional es contribuyente directo.
- Calcula su propio RC-IVA mensual.
- También puede compensar con facturas.

---

## 5. IUE-BE — IUE para Beneficiarios del Exterior

| Aspecto | Detalle |
|---|---|
| **Tasa efectiva** | 12.5% (25% × 50% de base presunta) |
| **Base imponible** | Utilidades o dividendos remesados al exterior |
| **Formulario SIN** | Form. 530 |
| **Frecuencia** | Por cada remesa |
| **Hecho imponible** | Remesa de utilidades a beneficiarios del exterior |

### Cómo funciona

Cuando una empresa boliviana distribuye utilidades o dividendos a **socios o accionistas residentes en el exterior**, debe retener el IUE-BE.

La ley presume que solo el **50% de la remesa** es utilidad imponible, y sobre ese 50% se aplica el 25%. En la práctica, equivale al **12.5% efectivo**:

```text
Remesa al exterior:            Bs 100,000
Base presunta (50%):           Bs  50,000
IUE-BE = 25% × 50,000 =        Bs  12,500

O directamente: 12.5% × 100,000 = Bs 12,500

Neto remesado al exterior:     Bs  87,500
```

---

## Cuadro resumen de los 5 impuestos

| Impuesto | Tasa | Base Imponible | Form. SIN | Frecuencia |
|---|---|---|---|---|
| **IVA** | 13% | Precio neto (sin IVA) | 200 | Mensual |
| **IT** | 3% | Ingresos brutos (con IVA) | 400 | Mensual |
| **IUE** | 25% | Utilidad imponible (con ajustes) | 500/510 | Anual |
| **RC-IVA** | 13% | Ingresos (compensable con facturas) | 200 | Mensual |
| **IUE-BE** | 12.5% | Remesas al exterior | 530 | Por evento |

---

## Calendario de vencimientos mensuales

Los vencimientos de los impuestos mensuales (IVA, IT, RC-IVA) dependen del **último dígito del NIT** del contribuyente:

| Dígito NIT | Fecha de vencimiento |
|---|---|
| 1 | Día 10 del mes siguiente |
| 2 | Día 11 del mes siguiente |
| 3 | Día 12 del mes siguiente |
| 4 | Día 13 del mes siguiente |
| 5 | Día 14 del mes siguiente |
| 6 | Día 15 del mes siguiente |
| 7 | Día 16 del mes siguiente |
| 8 | Día 17 del mes siguiente |
| 9 | Día 18 del mes siguiente |
| 0 | Día 19 del mes siguiente |

**Ejemplo:** Una empresa con NIT terminado en **5** debe presentar y pagar el Form. 200 (IVA) y el Form. 400 (IT) del mes de septiembre **hasta el 14 de octubre**.

---

## Referencias legales clave

| Norma | Tema | Año |
|---|---|---|
| **Ley 843** | Reforma Tributaria (base de todos los impuestos) | 1986 |
| **Ley 1733** | Modifica Art. 5 (IVA por fuera, pendiente) | 2026 |
| **Decreto Supremo 29380** | Reglamento del IVA | 2007 |
| **RND del SIN** | Normativa de facturación y presentación | Vigente |

---

## Conclusión

El sistema tributario boliviano tiene varias particularidades que lo hacen único en la región:

1. **El IVA está incluido en el precio** (Art. 5 Ley 843) — hay que extraerlo.
2. **IVA + IT sobre la misma venta** — pero el IT se compensa con el IUE.
3. **El IT se calcula sobre ingresos brutos** (con IVA incluido), no sobre netos.
4. **El RC-IVA se compensa con facturas de gastos personales** — no es un impuesto tradicional a la renta.
5. **El IUE-BE tiene tasa efectiva del 12.5%** por la presunción del 50% de base imponible.

Un contador que maneje estos 5 impuestos correctamente puede optimizar significativamente la carga tributaria de una empresa. Un ERP que los implemente bien es una herramienta estratégica.

---
