# Cierre del Ejercicio Contable

**Módulo:** 3 — Motor Contable
**Tiempo de lectura:** 10 minutos
**Normativa:** NC del CTNAC, Código de Comercio

---

## ¿Qué es el cierre contable?

El **cierre del ejercicio** es el proceso mediante el cual las cuentas de resultado (ingresos y gastos) se llevan a **saldo cero** al final de un período contable, y el resultado neto (utilidad o pérdida) se transfiere a una cuenta de **Patrimonio**.

```text
ANTES DEL CIERRE                    DESPUÉS DEL CIERRE
─────────────────                   ─────────────────
Ingresos:    Bs 100,000             Ingresos:    Bs 0
Gastos:      Bs  70,000             Gastos:      Bs 0
                                    Utilidad:    Bs 30,000 → Patrimonio
```

---

## ¿Por qué se hace el cierre?

### 1. Principio de periodicidad

La contabilidad se divide en períodos (mensuales, trimestrales, anuales). Cada período debe medir **solo** los resultados de ese período, sin arrastrar saldos del período anterior.

### 2. Medición de resultados

El cierre permite determinar la **utilidad o pérdida** del ejercicio, que es la base para:
- Calcular el Impuesto a las Utilidades (IUE, 25%)
- Determinar dividendos a distribuir
- Actualizar el patrimonio de la empresa

### 3. Preparar el siguiente ejercicio

Al cerrar, las cuentas de resultado quedan en cero, listas para acumular los movimientos del nuevo período.

---

## El proceso de cierre (paso a paso)

### Paso 1: Identificar cuentas de resultado

Las cuentas de resultado son las que miden ingresos y gastos durante el período:

```text
GRUPO 4: INGRESOS (naturaleza acreedora)
  4.1.01 Ventas de Mercancías
  4.1.02 Ventas de Servicios
  4.2.01 Ingresos por Intereses
  ...

GRUPO 5: GASTOS Y COSTOS (naturaleza deudora)
  5.1.01 Costo de Mercancías Vendidas
  5.2.01 Sueldos y Salarios
  5.3.01 Alquileres
  5.5.01 Depreciación de Maquinaria
  ...
```

### Paso 2: Sumar ingresos y gastos

```text
Total Ingresos = Σ (saldos de cuentas 4.x)
Total Gastos   = Σ (saldos de cuentas 5.x)
```

### Paso 3: Calcular utilidad o pérdida

```text
Utilidad = Total Ingresos − Total Gastos

Si Utilidad > 0 → hay ganancia
Si Utilidad < 0 → hay pérdida
Si Utilidad = 0 → punto de equilibrio
```

### Paso 4: Generar asiento de cierre

El asiento de cierre lleva todas las cuentas de resultado a cero:

**Ejemplo: Utilidad de Bs 30,000**

```text
ASIENTO DE CIERRE — Diciembre 2026
─────────────────────────────────────────────────────────
Cuenta                          │ Debe      │ Haber
─────────────────────────────────────────────────────────
Ventas de Mercancías            │ 100,000   │
Costo de Mercancías Vendidas    │           │  40,000
Sueldos y Salarios              │           │  20,000
Alquileres                      │           │   5,000
Depreciación                    │           │   5,000
Utilidad del Ejercicio          │           │  30,000
─────────────────────────────────────────────────────────
TOTALES                         │ 100,000   │ 100,000 ✓
```

**Lectura:**
- Debitamos Ventas (Bs 100,000) para llevarla de Bs 100,000 a Bs 0
- Acreditamos los gastos (Bs 70,000 total) para llevarlos a cero
- La diferencia (Bs 30,000) se acredita a Utilidad del Ejercicio

### Paso 5: Transferir a Patrimonio

La cuenta **Utilidad del Ejercicio** (3.2.04) es una cuenta de Patrimonio. Al final del año, puede:

1. **Distribuirse como dividendos** a los socios
2. **Capitalizarse** (aumentar el capital social)
3. **Retenerse** como Utilidades Retenidas (3.2.02)

---

## Tipos de cierre

### Cierre mensual

Se hace al final de cada mes para generar estados financieros mensuales. Las cuentas de resultado se cierran mensualmente, pero la utilidad se acumula en **Utilidad del Ejercicio** hasta fin de año.

### Cierre anual (31 de diciembre)

Es el cierre definitivo del año fiscal. Después de este cierre:
- La utilidad del año se transfiere a **Utilidades Retenidas** o se distribuye
- Se prepara el Balance General de cierre
- Se abre el nuevo ejercicio (1 de enero)

---

## Ejemplo completo con datos del ERP

Supongamos estos saldos al 30 de septiembre 2026:

```text
CUENTA                    │ SALDO
──────────────────────────┼──────────
4.1.01 Ventas             │  48,000 (acreedor)
5.1.01 Costo Ventas       │  36,896 (deudor)
5.2.04 Bono Antigüedad    │   3,000 (deudor)
5.2.05 Aguinaldo          │   1,583 (deudor)
5.2.07 Indemnización      │  13,250 (deudor)
5.5.02 Depreciación Veh.  │   2,667 (deudor)
5.5.03 Depreciación Mueb. │      20 (deudor)
5.5.04 Depreciación Eq.   │     167 (deudor)
──────────────────────────┼──────────
Total Ingresos:           │  48,000
Total Gastos:             │  57,583
Utilidad/(Pérdida):       │  (9,583) ← PÉRDIDA
```

**Asiento de cierre:**

```text
ASIENTO CI-2026-001 — Cierre septiembre 2026
─────────────────────────────────────────────────────────
Ventas de Mercancías            │  48,000   │
Costo de Mercancías Vendidas    │           │  36,896
Bono de Antigüedad              │           │   3,000
Gasto de Aguinaldo              │           │   1,583
Gasto de Indemnización          │           │  13,250
Depreciación de Vehículos       │           │   2,667
Depreciación de Muebles         │           │      20
Depreciación de Equipos         │           │     167
Utilidad del Ejercicio (pérdida)│   9,583   │
─────────────────────────────────────────────────────────
TOTALES                         │  57,583   │  57,583 ✓
```

**Resultado:** La empresa tuvo una **pérdida de Bs 9,583** en septiembre.

---

## ¿Qué pasa después del cierre?

### Si hay utilidad

```text
Utilidad del Ejercicio: Bs 30,000

Opciones:
1. Distribuir dividendos (paga IUE 25% primero)
2. Capitalizar (aumentar Capital Social)
3. Retener (pasar a Utilidades Retenidas)
```

### Si hay pérdida

```text
Pérdida del Ejercicio: Bs 9,583

La pérdida se acumula en "Pérdidas Acumuladas" (3.2.03)
y se compensa con utilidades futuras.
```

---

## Consideraciones fiscales en Bolivia

### Impuesto a las Utilidades (IUE)

- **Tasa:** 25% sobre la utilidad neta
- **Base:** utilidad contable ajustada por diferencias permanentes
- **Fecha de pago:** hasta el 30 de abril del año siguiente
- **Compensación:** el IT pagado durante el año es crédito contra el IUE

### Distribución de utilidades

- Requiere aprobación de la junta de socios
- Se paga después de cubrir:
  1. Reserva legal (5% de la utilidad hasta alcanzar 50% del capital)
  2. Impuestos (IUE)
  3. Pérdidas acumuladas de años anteriores

---

## Resumen

```text
CIERRE CONTABLE — PASOS CLAVE
─────────────────────────────────────────────────
1. Sumar ingresos (cuentas 4.x)
2. Sumar gastos (cuentas 5.x)
3. Calcular utilidad = Ingresos − Gastos
4. Generar asiento de cierre (llevar cuentas a cero)
5. Transferir resultado a Patrimonio (3.2.04)
6. Marcar período como cerrado
7. Preparar estados financieros
```

