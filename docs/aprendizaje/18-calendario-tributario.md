# Calendario Tributario Boliviano

**Módulo:** 5 — Impuestos y Cumplimiento Fiscal
**Tiempo de lectura:** 7 minutos
**Normativa aplicable:** RND del SIN, Ley 843, Ley General del Trabajo

---

## Introducción

El calendario tributario boliviano define las **fechas límite** para presentar declaraciones juradas y pagar impuestos ante el Servicio de Impuestos Nacionales (SIN). El incumplimiento genera **multas, intereses y recargos** que pueden ser significativos.

La particularidad del sistema boliviano es que los vencimientos **no son el mismo día para todos** los contribuyentes: dependen del **último dígito del NIT**. Este mecanismo escalona las presentaciones y evita la saturación de las oficinas del SIN.

---

## Calendario mensual: IVA, IT y RC-IVA

Los tres impuestos mensuales más comunes (IVA, IT y RC-IVA) comparten la misma regla de vencimiento: **entre el 10 y el 19 del mes siguiente al período fiscal**, según el último dígito del NIT.

### Tabla de vencimientos mensuales

| Último dígito NIT | Día de vencimiento | Formularios |
|---|---|---|
| **1** | 10 del mes siguiente | Form. 200 (IVA) + Form. 400 (IT) |
| **2** | 11 del mes siguiente | Form. 200 + Form. 400 |
| **3** | 12 del mes siguiente | Form. 200 + Form. 400 |
| **4** | 13 del mes siguiente | Form. 200 + Form. 400 |
| **5** | 14 del mes siguiente | Form. 200 + Form. 400 |
| **6** | 15 del mes siguiente | Form. 200 + Form. 400 |
| **7** | 16 del mes siguiente | Form. 200 + Form. 400 |
| **8** | 17 del mes siguiente | Form. 200 + Form. 400 |
| **9** | 18 del mes siguiente | Form. 200 + Form. 400 |
| **0** | 19 del mes siguiente | Form. 200 + Form. 400 |

**Ejemplos concretos:**

```text
Empresa con NIT 123456789-5 (último dígito: 5)
├─ Período fiscal: Septiembre 2026
├─ Vencimiento: 14 de octubre de 2026
└─ Formularios: Form. 200 (IVA) + Form. 400 (IT)

Empresa con NIT 987654321-0 (último dígito: 0)
├─ Período fiscal: Septiembre 2026
├─ Vencimiento: 19 de octubre de 2026
└─ Formularios: Form. 200 (IVA) + Form. 400 (IT)
```

---

## Cómo calcular la fecha de vencimiento

El cálculo es sencillo y sigue esta fórmula:

```text
Día de vencimiento = 10 + (último dígito del NIT) - 1
```

**Casos especiales:**
- Si el último dígito es **1**: día 10 (10 + 1 - 1 = 10)
- Si el último dígito es **0**: día 19 (se trata como si fuera 10, 10 + 10 - 1 = 19)

**Ajustes por fin de semana y feriados:**
- Si el día de vencimiento cae en **sábado, domingo o feriado**, se extiende al **siguiente día hábil**.
- El SIN publica un calendario oficial anual con los ajustes específicos.

### Ejemplo de cálculo

```text
Empresa: NIT terminado en 7
Período: Agosto 2026

Paso 1: Último dígito = 7
Paso 2: Día = 10 + 7 - 1 = 16
Paso 3: Mes siguiente = septiembre
Paso 4: Fecha = 16 de septiembre de 2026

Si el 16/09/2026 cae en domingo → se extiende al lunes 17/09/2026
```

---

## Plazos especiales

Además de los vencimientos mensuales, existen **plazos especiales** para obligaciones anuales o eventuales:

### 1. IUE — Impuesto sobre las Utilidades (Form. 500/510)

| Aspecto | Detalle |
|---|---|
| **Plazo** | 120 días calendario después del cierre de gestión |
| **Cierre típico** | 31 de diciembre |
| **Vencimiento típico** | 30 de abril del año siguiente |
| **Formulario** | Form. 500 (personas jurídicas) / Form. 510 (personas naturales) |

**Ejemplo:**
```text
Gestión fiscal: 1 enero 2026 - 31 diciembre 2026
Cierre: 31 de diciembre de 2026
Plazo: 120 días calendario
Vencimiento: 30 de abril de 2027

Cálculo de los 120 días:
├─ Enero 2027:     31 días  (acumulado: 31)
├─ Febrero 2027:   28 días  (acumulado: 59)  [año no bisiesto]
├─ Marzo 2027:     31 días  (acumulado: 90)
└─ Abril 2027:     30 días  (acumulado: 120) ✓
```

### 2. Segundo Aguinaldo "Esfuerzo por Bolivia"

| Aspecto | Detalle |
|---|---|
| **Plazo de pago** | Antes del 20 de diciembre |
| **Condición** | Solo si INE confirma PIB > 4.5% |
| **Base legal** | DS 1802 (2013) |

**Ejemplo:**
```text
Año 2026: INE confirma PIB > 4.5% en noviembre
└─ Pago obligatorio antes del 20 de diciembre de 2026
```

### 3. Envío de Estados Financieros (Form. 605)

| Aspecto | Detalle |
|---|---|
| **Plazo** | 120 días calendario después del cierre de gestión |
| **Formulario** | Form. 605 (Estados Financieros Digitalizados) |
| **Vencimiento típico** | 30 de abril del año siguiente |
| **Obligación** | Todas las empresas con NIT activo |

**Importante:** El Form. 605 se presenta junto con el IUE (Form. 500), en la misma fecha límite.

### 4. Libro de Compras y Ventas (LCV)

| Aspecto | Detalle |
|---|---|
| **Plazo** | Mismo día que el Form. 200 (IVA) |
| **Envío** | Electrónico al SIN (Sistema Modular) |
| **Contenido** | Detalle de todas las facturas emitidas y recibidas |

---

## Calendario anual resumido

| Mes | Obligación | Plazo |
|---|---|---|
| **Enero - Diciembre** | IVA + IT + LCV | 10-19 del mes siguiente |
| **Enero - Diciembre** | RC-IVA (empleados) | 10-19 del mes siguiente |
| **Diciembre** | Segundo aguinaldo (si aplica) | Antes del 20 de diciembre |
| **Diciembre** | Aguinaldo de Navidad | Antes del 20 de diciembre |
| **Abril** | IUE + Form. 605 (gestión anterior) | 120 días tras cierre |

---

## Multas y recargos por presentación tardía

El SIN aplica sanciones automáticas por presentación fuera de plazo:

### Tipos de sanciones

| Concepto | Cálculo | Ejemplo |
|---|---|---|
| **Multa por presentación tardía** | 5% del impuesto por mes o fracción | IVA Bs 1,000 → Bs 50/mes de retraso |
| **Intereses** | Tasa pasiva del BCB + recargo | Variable según tasa vigente |
| **Multa por no presentación** | 10 UFVs por cada mes sin declarar | ≈ Bs 2,400/mes (UFV ≈ Bs 2.40) |
| **Multa por omisión de pago** | 10% del impuesto omitido | IVA Bs 5,000 → Bs 500 adicional |

### Ejemplo de cálculo de multa

```text
Empresa con NIT terminado en 3
Período: Septiembre 2026
Vencimiento: 12 de octubre de 2026
Presentación real: 15 de noviembre de 2026 (34 días tarde)

IVA a pagar: Bs 2,000
IT a pagar: Bs 450
─────────────────────────────────
Total impuestos: Bs 2,450

Multa por presentación tardía:
├─ Mes 1 (oct 12 - nov 12): 5% × 2,450 = Bs 122.50
├─ Mes 2 (nov 12 - nov 15): fracción = Bs 122.50
└─ Subtotal multa: Bs 245.00

Intereses: ~1% mensual × Bs 2,450 × (34/30) ≈ Bs 27.76

TOTAL A PAGAR CON MORA: Bs 2,450 + 245 + 27.76 = Bs 2,722.76
```

---

## Consejos prácticos para cumplir el calendario

### 1. Calendario interno con alertas

Implementa un sistema de alertas **7, 3 y 1 día antes** de cada vencimiento. Esto da tiempo para:
- Reconciliar los libros
- Preparar los formularios
- Asegurar disponibilidad de fondos

### 2. Automatización del cálculo de vencimientos

```javascript
// Fórmula general en JavaScript
function calcularVencimiento(nit, periodo) {
  const ultimoDigito = parseInt(nit.slice(-2, -1)) || 0;
  const [anio, mes] = periodo.split('-').map(Number);
  
  // Día de vencimiento (10-19)
  const dia = ultimoDigito === 0 ? 19 : 9 + ultimoDigito;
  
  // Mes siguiente
  const fecha = new Date(anio, mes, dia);  // mes ya es 0-indexed
  
  // Ajustar por fin de semana
  while (fecha.getDay() === 0 || fecha.getDay() === 6) {
    fecha.setDate(fecha.getDate() + 1);
  }
  
  return fecha.toISOString().split('T')[0];
}

// Ejemplo: NIT terminado en 5, período 2026-09
calcularVencimiento('123456789-5', '2026-09');
// → '2026-10-14'
```

### 3. Revisión del calendario oficial del SIN

Cada año el SIN publica la **RND (Resolución Normativa de Directorio)** con el calendario oficial de vencimientos, que incluye:
- Días feriados nacionales y departamentales
- Ajustes específicos por actividades económicas
- Plazos especiales para nuevos regímenes

---

## Resumen visual del calendario

```text
╔══════════════════════════════════════════════════════════════════╗
║  CALENDARIO TRIBUTARIO BOLIVIANO — RESUMEN                      ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  MENSUAL (10-19 del mes siguiente):                             ║
║    ✓ IVA (Form. 200)         ✓ RC-IVA (Form. 200)               ║
║    ✓ IT (Form. 400)          ✓ Libro Compras/Ventas             ║
║                                                                  ║
║  ANUAL (120 días tras cierre):                                  ║
║    ✓ IUE (Form. 500/510)     ✓ Estados Financieros (Form. 605)  ║
║                                                                  ║
║  DICIEMBRE (antes del 20):                                      ║
║    ✓ Aguinaldo de Navidad    ✓ Segundo Aguinaldo (si aplica)    ║
║                                                                  ║
║  REGLA CLAVE:                                                   ║
║    Día vencimiento = 10 + (último dígito NIT) - 1               ║
║    Si cae en fin de semana → siguiente día hábil                ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Referencias legales

| Norma | Tema | Año |
|---|---|---|
| **RND del SIN** | Calendario anual de vencimientos | Anual |
| **Ley 843, Art. 70** | Plazos generales de presentación | 1986 |
| **Código Tributario, Art. 75** | Sanciones por incumplimiento | 1999 |
| **DS 1802** | Segundo aguinaldo (plazo 20 diciembre) | 2013 |
| **Ley General del Trabajo, Art. 56** | Aguinaldo de Navidad | 1939 |

---

## Conclusión

El calendario tributario boliviano es **estricto y automático**: cada mes hay vencimientos obligatorios según el NIT de la empresa. Un contador o sistema que lleve un control riguroso del calendario evita multas significativas que pueden acumularse rápidamente (5% mensual + intereses).

Las claves para cumplir son:

1. **Conocer el último dígito del NIT** → define el día de vencimiento.
2. **Monitorear días feriados** → pueden extender el plazo.
3. **Reservar fondos con anticipación** → el pago debe hacerse antes o el mismo día.
4. **Presentar aunque sea en cero** → evita la multa por no presentación (10 UFVs).

En un ERP, el módulo de impuestos debe **calcular automáticamente** el próximo vencimiento y **generar alertas** para que el contador nunca pierda una fecha.

---
