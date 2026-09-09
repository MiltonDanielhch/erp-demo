# Las 5 Particularidades Únicas de la Nómina Boliviana

**Módulo:** 4 — Nómina y Recursos Humanos
**Tiempo de lectura:** 10 minutos
**Normativa:** LGT, DS 1802, DS 21060, DS 28699, DS 22138, Ley 843

---

Si alguien te pregunta *"¿qué hace que tu ERP sea para Bolivia y no un ERP genérico?"*, la respuesta está en estas **5 particularidades**. Ninguna de ellas existe en un ERP de otro país. Un contador que vea que tu sistema las maneja correctamente sabrá que entiende Bolivia.

---

## 1. Aguinaldo de Navidad (obligatorio, siempre)

**Base legal:** Ley General del Trabajo, Art. 56

El **aguinaldo de Navidad** es un beneficio obligatorio que se paga en diciembre, equivalente a **un mes completo del "total ganado"** del trabajador. Se paga antes del 20 de diciembre.

```text
EJEMPLO
─────────────────────────────────────────────────
Empleado: Juan Pérez
Total ganado últimos 3 meses: Bs 6,375, 6,400, 6,375
Promedio: Bs 6,383.33
Antigüedad: 3 años (más de 1 año)

Aguinaldo: Bs 6,383.33 (pago íntegro)
```

**Proporcional:** Si el empleado tiene menos de un año de servicio, se paga proporcional a los meses trabajados.

```text
Empleado: María López
Ingresó el 1 de julio (6 meses trabajados)
Promedio últimos 3 meses: Bs 6,000

Aguinaldo proporcional: Bs 6,000 × (6/12) = Bs 3,000
```

**Provisión mensual:** La empresa debe acumular **1/12 del aguinaldo cada mes** desde enero. En diciembre se paga la provisión acumulada más la parte del mes en curso.

```text
Asiento mensual (enero a noviembre):
  Gasto de Aguinaldo           Bs 532   (Debe)
      Aguinaldo por Pagar               Bs 532   (Haber)
```

---

## 2. Segundo Aguinaldo "Esfuerzo por Bolivia" (condicional al PIB)

**Base legal:** Decreto Supremo N° 1802 (20/11/2013)

El segundo aguinaldo es un beneficio **condicional** que solo se paga cuando el **INE confirma que el PIB nacional creció más del 4.5%** en el período julio-junio. Es idéntico al aguinaldo de Navidad: un mes adicional del total ganado.

```text
AÑOS EN QUE SE ACTIVÓ EL SEGUNDO AGUINALDO
─────────────────────────────────────────────────
2013 ✓  PIB creció 6.5%
2014 ✓  PIB creció 5.5%
2015 ✓  PIB creció 4.8%
2016 ✗  PIB creció 4.3% (no se activó)
2017 ✗  PIB creció 4.2% (no se activó)
2018 ✓  PIB creció 4.6%
2019-2025 ✗ No se ha vuelto a activar
```

**⚠️ No es automático:** Un ERP correcto NO debe calcularlo nunca de forma automática. Debe haber un **toggle manual** que RRHH activa solo cuando el Gobierno confirma el dato oficial (usualmente en noviembre). Cuando se activa, la empresa debe provisionar retroactivamente desde enero.

---

## 3. Bono de antigüedad sobre 3 SMN (no sobre salario)

**Base legal:** Decreto Supremo N° 21060 (DS de la relocalización)

El bono de antigüedad es un beneficio mensual para empleados con más de 2 años de servicio. La particularidad es que se calcula sobre **3 veces el Salario Mínimo Nacional**, no sobre el salario real del empleado.

```text
TABLA DE PORCENTAJES (DS 21060)
─────────────────────────────────────────────────
2 – 4 años      5%
5 – 7 años     11%
8 – 10 años    18%
11 – 14 años   26%
15 – 19 años   34%
20 – 24 años   42%
25+ años       50%

SMN vigente 2026: Bs 2,500
Base de cálculo: 3 × 2,500 = Bs 7,500
```

**La consecuencia más importante:** Dos empleados con **salarios distintos pero la misma antigüedad cobran el mismo bono.**

```text
EJEMPLO: Ambos empleados tienen 8 años de servicio
─────────────────────────────────────────────────
Empleado A: Salario Bs 3,000  → Bono = 18% × 7,500 = Bs 1,350
Empleado B: Salario Bs 15,000 → Bono = 18% × 7,500 = Bs 1,350
                                                    ─────────────
                                                    MISMO BONO
```

Esto es único en Latinoamérica. En otros países el bono se calcula sobre el salario real.

---

## 4. Indemnización aplicable a RENUNCIA VOLUNTARIA

**Base legal:** Decreto Supremo N° 28699 (2006), confirmado por el **Tribunal Constitucional Plurinacional** (Sentencia 0058/2012)

Esta es **la particularidad más única de Bolivia**. En la mayoría de los países, la indemnización por tiempo de servicio solo se paga en caso de **despido injustificado**. En Bolivia, se paga también en caso de **renuncia voluntaria**.

```text
FÓRMULA DE LA INDEMNIZACIÓN
─────────────────────────────────────────────────
Indemnización = Promedio últimos 3 meses × Años de servicio
                (con fracción proporcional por meses)

⚠️ SIN TOPE: No hay límite de años
⚠️ A partir de 90 días de trabajo continuo
⚠️ Aplica a: renuncia, despido, mutuo acuerdo
```

**Ejemplo comparativo:**

```text
Empleado: Juan Mamani
Salario promedio últimos 3 meses: Bs 6,375
Antigüedad: 6 años y 6 meses (6.5 años)
Indemnización = Bs 6,375 × 6.5 = Bs 41,437.50

┌─────────────────────────────────────────────────────┐
│ SI RENUNCIA voluntariamente:                        │
│   Indemnización: Bs 41,437.50                       │
│   Desahucio:   Bs 0 (no aplica)                     │
│   TOTAL:         Bs 41,437.50                       │
├─────────────────────────────────────────────────────┤
│ SI LO DESPIDEN sin preaviso de 90 días:             │
│   Indemnización: Bs 41,437.50                       │
│   Desahucio:   Bs 19,125.00 (3 meses, DS 22138)     │
│   TOTAL:         Bs 60,562.50                       │
└─────────────────────────────────────────────────────┘
```

**⚠️ Un ERP que solo provisione indemnización en "despido" está MAL PARAMETRIZADO para Bolivia.** Debe provisionar mensualmente para TODOS los empleados activos, porque en cualquier momento uno puede renunciar y cobrar el acumulado.

---

## 5. RC-IVA compensable con facturas de gastos personales

**Base legal:** Ley 843, Art. 16 y reglamento del RC-IVA

En Bolivia **no hay impuesto a la renta personal** como tal. En su lugar, existe el **Régimen Complementario al IVA (RC-IVA)** del 13%, pero el empleado puede reducirlo (hasta cero) presentando facturas con NIT de gastos personales.

```text
CÁLCULO DEL RC-IVA
─────────────────────────────────────────────────
Paso 1: Calcular el 13% del total ganado
  Total ganado: Bs 6,375
  RC-IVA teórico: 13% × 6,375 = Bs 828.75

Paso 2: Restar el IVA de las facturas presentadas
  (IVA = monto factura − monto/1.13)

Paso 3: RC-IVA a pagar = max(0, RC-IVA teórico − IVA facturas)
```

**Ejemplo:**

```text
Empleado: Juan Mamani
Total ganado: Bs 6,375
RC-IVA teórico: Bs 828.75

Facturas presentadas:
  Supermercado Bs 2,000 → IVA: Bs 230.09
  Farmacia     Bs 1,500 → IVA: Bs 172.57
  Restaurante  Bs 3,500 → IVA: Bs 402.65
                              ──────────
                              Bs 805.31

RC-IVA a pagar = 828.75 − 805.31 = Bs 23.44
(Solo paga Bs 23.44 de RC-IVA, no los Bs 828.75 completos)
```

**Si las facturas cubren el 100%:** RC-IVA = 0. El empleado no paga nada.
**Si no presenta facturas:** RC-IVA = 13% completo (Bs 828.75).

Esto incentiva la formalización: los empleados piden factura en sus compras para reducir su carga tributaria.

---

## Bonus: Desahucio por falta de preaviso (DS 22138)

Cuando el empleador despide sin avisar con **90 días de anticipación**, debe pagar además **3 meses de salario** como desahucio. Es adicional a la indemnización.

```text
Desahucio = 3 × salario mensual
Ejemplo: Salario Bs 6,375 → Desahucio = Bs 19,125
```

El empleado tiene el mismo derecho: si renuncia sin preaviso de 30 días, debe pagar él 1 mes de desahucio (aunque en la práctica rara vez se aplica).

---

## Resumen visual

```text
╔════════════════════════════════════════════════════════╗
║  PARTICULARIDADES ÚNICAS DE LA NÓMINA BOLIVIANA       ║
╠════════════════════════════════════════════════════════╣
║  1. Aguinaldo Navidad      Obligatorio siempre        ║
║  2. Segundo Aguinaldo      Condicional PIB > 4.5%     ║
║  3. Bono Antigüedad        Base 3 SMN (no salario)    ║
║  4. Indemnización          Aplica en renuncia también ║
║  5. RC-IVA                 Compensable con facturas   ║
║  6. Desahucio              3 meses sin preaviso 90d   ║
╚════════════════════════════════════════════════════════╝
```

---

## Referencias legales clave

| Norma | Tema | Año |
|---|---|---|
| LGT | Base general de beneficios | 1939 |
| DS 21060 | Bono de antigüedad | 1986 |
| DS 22138 | Desahucio (90 días preaviso) | 1989 |
| Ley 843 | Reforma tributaria, RC-IVA | 1986 |
| Ley 065 | Pensiones (Gestora Pública) | 2010 |
| DS 1802 | Segundo aguinaldo condicional | 2013 |
| DS 28699 | Indemnización en renuncia | 2006 |
| Sentencia TCP 0058/2012 | Confirma indemnización en renuncia | 2012 |
