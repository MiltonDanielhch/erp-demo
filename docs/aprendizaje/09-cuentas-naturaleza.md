# Naturaleza de las Cuentas: Deudora vs. Acreedora

**Módulo:** 3 — Capa 3 (Motor Contable)
**Tiempo de lectura:** 8 minutos
**Nivel:** Continuación de `08-ciclo-contable-pasos.md`

---

## La pregunta que responde este documento

> Cuando una cuenta **aumenta**, ¿se registra en el Debe o en el Haber?

La respuesta depende de su **naturaleza**. Hay dos familias:

- **Naturaleza DEUDORA:** aumenta por el **Debe**.
- **Naturaleza ACREEDORA:** aumenta por el **Haber**.

---

## La clasificación del plan de cuentas boliviano

```text
GRUPO │ NOMBRE        │ NATURALEZA │ AUMENTA POR
──────┼───────────────┼──────────────────────────
1     │ ACTIVOS       │ DEUDORA    │ DEBE
2     │ PASIVOS       │ ACREEDORA  │ HABER
3     │ PATRIMONIO    │ ACREEDORA  │ HABER
4     │ INGRESOS      │ ACREEDORA  │ HABER
5     │ GASTOS/COSTOS │ DEUDORA    │ DEBE
```

### Regla mnemotécnica

```text
        AUMENTAN POR EL DEBE          AUMENTAN POR EL HABER
        ────────────────────          ─────────────────────
        • Activos                     • Pasivos
        • Gastos                      • Patrimonio
        • Costos                      • Ingresos

        (lo que TIENES y lo que GASTAS)   (lo que DEBES y lo que GANAS)
```

---

## Por qué tiene lógica

La ecuación contable es:

```text
ACTIVOS = PASIVOS + PATRIMONIO
```

El lado izquierdo (Activos) es de naturaleza deudora. El lado derecho (Pasivos + Patrimonio) es acreedor. Para que la ecuación se mantenga, cada lado debe moverse en direcciones opuestas:

- Si **compras** algo (activo sube), lo anotas al **Debe**.
- Si **debes** algo (pasivo sube), lo anotas al **Haber**.

Los **Ingresos** aumentan el patrimonio, por eso heredan naturaleza acreedora (Haber). Los **Gastos** lo disminuyen, por eso son deudores (Debe).

---

## Ejemplos con cuentas reales de tu plan

```text
CUENTA                      │ GRUPO │ NATURALEZA │ SUBE POR
────────────────────────────┼───────┼────────────┼───────────
1.1.01 Caja                 │   1   │ DEUDORA    │ DEBE
1.1.02 Bancos               │   1   │ DEUDORA    │ DEBE
1.1.03 Clientes             │   1   │ DEUDORA    │ DEBE
1.1.05 Inventario           │   1   │ DEUDORA    │ DEBE
1.1.06 IVA Crédito Fiscal   │   1   │ DEUDORA    │ DEBE
2.1.01 Proveedores          │   2   │ ACREEDORA  │ HABER
2.1.02 IVA Débito Fiscal    │   2   │ ACREEDORA  │ HABER
2.2.01 Provisión Aguinaldo  │   2   │ ACREEDORA  │ HABER
3.1.01 Capital Social       │   3   │ ACREEDORA  │ HABER
4.1.01 Ventas               │   4   │ ACREEDORA  │ HABER
5.1.01 Costo de Ventas      │   5   │ DEUDORA    │ DEBE
5.2.01 Gasto Sueldos        │   5   │ DEUDORA    │ DEBE
```

---

## Cómo se lee un saldo

El **saldo** de una cuenta es la diferencia acumulada entre su lado natural y el lado contrario:

```text
Cuenta de naturaleza DEUDORA (ej. Bancos):
   Saldo = Σ Debe − Σ Haber      → saldo normal DEUDOR (positivo)

Cuenta de naturaleza ACREEDORA (ej. Proveedores):
   Saldo = Σ Haber − Σ Debe      → saldo normal ACREEDOR
```

Si una cuenta aparece con saldo "al revés" (ej. Bancos con saldo acreedor), es una **señal de alerta**: probablemente un error, o un sobregiro que debería reclasificarse como pasivo.

---

## Caso práctico: el IVA en Bolivia

Fíjate qué elegante es la naturaleza aplicada al IVA:

```text
IVA Crédito Fiscal (1.1.06)  → ACTIVO  → DEUDORA  → aumenta al DEBE
   (es un saldo a tu favor: lo puedes descontar)

IVA Débito Fiscal (2.1.02)   → PASIVO  → ACREEDORA → aumenta al HABER
   (es una deuda con el SIN: lo debes pagar)
```

Por eso en tu asiento de compra el IVA Crédito va al **Debe**, y en tu asiento de venta el IVA Débito va al **Haber**. No es arbitrario: es su naturaleza.

Al fin del mes:

```text
IVA a pagar = IVA Débito (Haber) − IVA Crédito (Debe)
```

Si el resultado es negativo, tienes **saldo a favor** (un activo).

---

## Resumen en una tabla

```text
─────────────────────────────────────────────────────────
 NATURALEZA   │  AUMENTA  │  DISMINUYE  │  SALDO NORMAL
──────────────┼───────────┼─────────────┼───────────────
 DEUDORA      │   DEBE    │    HABER    │    DEUDOR
 (1, 5)       │           │             │
──────────────┼───────────┼─────────────┼───────────────
 ACREEDORA    │   HABER   │    DEBE     │    ACREEDOR
 (2, 3, 4)    │           │             │
─────────────────────────────────────────────────────────
```

Con esta tabla puedes construir **cualquier** asiento correctamente: identifica el grupo de cada cuenta, mira su naturaleza, y sabrás en qué lado va.
