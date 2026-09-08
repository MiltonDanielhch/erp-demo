# La Partida Doble Explicada sin Jerga Contable

**Módulo:** 3 — Capa 3 (Motor Contable)
**Tiempo de lectura:** 8 minutos
**Nivel:** Para alguien que nunca estudió contabilidad

---

## La idea en una frase

> **Cada vez que algo entra por un lado, algo sale por otro lado, y los dos lados siempre valen lo mismo.**

Eso es todo. La partida doble no es más que esa regla aplicada a cada transacción de una empresa.

---

## ¿Por qué dos lados?

Piensa en tu bolsillo. Si compras un celular por Bs 2,000 en efectivo:

- **Entra** a tu vida: un celular (algo que tienes, un "activo").
- **Sale** de tu vida: Bs 2,000 en efectivo (también un activo, pero ahora menor).

Nada aparece de la nada. Todo movimiento tiene un **origen** y un **destino**. La contabilidad solo registra esos dos lados:

- **DEBE** = el destino (a dónde fue el valor / qué recibiste).
- **HABER** = el origen (de dónde salió el valor / quién lo aportó).

Como el valor no se crea ni se destruye, **Debe y Haber siempre suman igual**. Si no cuadran, alguien se equivocó al registrar.

---

## Ejemplo 1: Compra de mercancía con IVA incluido

Compras laptops por **Bs 5,650** con IVA incluido (el precio boliviano ya trae el IVA dentro).

Primero separamos el IVA: Neto = 5,650 ÷ 1.13 = **Bs 5,000**; IVA = **Bs 650**.
Como no pagaste aún, quedó una deuda con el proveedor.

```text
CUENTA                │   DEBE    │   HABER
──────────────────────┼───────────┼───────────
Inventario            │   5,000   │
IVA Crédito Fiscal    │     650   │
Proveedores           │           │   5,650
──────────────────────┼───────────┼───────────
TOTALES               │   5,650   │   5,650   ✓ CUADRA
```

**Lectura en español:** "Entró mercancía por 5,000 y un crédito fiscal por 650 (Debe); todo eso se lo debo al proveedor (Haber)."

---

## Ejemplo 2: Venta con IVA e IT

Vendes por **Bs 11,300** con IVA incluido. Neto = 10,000; IVA = 1,300. El IT (3%) es un impuesto aparte que genera una deuda con el SIN: 11,300 × 3% = **Bs 339**.

```text
CUENTA                │   DEBE    │   HABER
──────────────────────┼───────────┼───────────
Clientes (por cobrar) │  11,300   │
Ventas                │           │  10,000
IVA Débito Fiscal     │           │   1,300
──────────────────────┼───────────┼───────────
TOTALES               │  11,300   │  11,300   ✓ CUADRA
```

*(El IT se registra en su propio asiento: Gasto IT al Debe, IT por Pagar al Haber, por Bs 339.)*

**Lectura:** "Me deben 11,300 (Debe); eso se compone de una venta de 10,000 y un IVA que deberé al SIN por 1,300 (Haber)."

---

## Ejemplo 3: Pago de nómina con aguinaldo

En diciembre pagas sueldos y el aguinaldo. Supón: sueldos del mes Bs 9,000 + aguinaldo Bs 9,000 (ya provisionado durante el año). Pagas todo desde el banco.

```text
CUENTA                       │   DEBE    │   HABER
─────────────────────────────┼───────────┼───────────
Gasto Sueldos                │   9,000   │
Provisión Aguinaldo (pasivo) │   9,000   │
Bancos                       │           │  18,000
─────────────────────────────┼───────────┼───────────
TOTALES                      │  18,000   │  18,000   ✓ CUADRA
```

**Lectura:** "Consumí el gasto del mes y usé la provisión que había guardado (Debe); todo salió del banco (Haber)."

Fíjate en algo clave: el aguinaldo **no** es un gasto nuevo en diciembre. Se fue gastando mes a mes como provisión (1/12 cada mes). En diciembre solo se **paga** lo ya provisionado. Por eso al pagar se descarga un pasivo, no se crea un gasto.

---

## La regla de oro que tu ERP ya cumple

En tu ERP, el **Generador de Asientos** (Módulo 2) crea cada asiento y verifica antes de guardarlo:

```javascript
totalDebe === totalHaber   // si no, el asiento se marca como "no cuadra"
```

Por eso en tus smoke tests viste siempre `Cuadra: ✓`. Eso es la partida doble aplicada por código: **ningún asiento desbalanceado entra al sistema**.

---

## Resumen visual

```text
        ┌─────────────────────────────┐
        │      TRANSACCIÓN            │
        └──────────────┬──────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
   ┌─────────────┐           ┌─────────────┐
   │    DEBE     │           │    HABER    │
   │  (destino)  │           │  (origen)   │
   └─────────────┘           └─────────────┘
          │                         │
          └───────────┬─────────────┘
                      ▼
              SUMAS IGUALES
              (siempre, sin excepción)
```
