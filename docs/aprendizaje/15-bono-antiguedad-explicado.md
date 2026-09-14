# 🎖️ Bono de Antigüedad en Bolivia (DS 21060)

**Módulo:** 4 — Nómina Boliviana  
**Tiempo de lectura:** 8 minutos  
**Nivel:** Intermedio

---

## ¿Qué es el bono de antigüedad?

El **bono de antigüedad** es un beneficio laboral obligatorio en Bolivia que reconoce los años de servicio de un trabajador en una empresa. Se paga mensualmente junto con el salario básico.

**Base legal:** Decreto Supremo 21060 (1985), artículo 60.

---

## ⚠️ La regla más importante (y la más confundida)

> **El bono de antigüedad se calcula sobre 3 veces el Salario Mínimo Nacional (SMN), NO sobre el salario real del empleado.**

Esto significa que dos empleados con salarios muy distintos pero la misma antigüedad cobran **exactamente el mismo bono**.

---

## 📊 Ejemplo numérico: dos empleados, mismo bono

Supongamos que el **SMN vigente es Bs 2.500** (2026).

**Base de cálculo:** 3 × Bs 2.500 = **Bs 7.500**

### Empleado A: Juan Carlos
- Salario básico: **Bs 3.000**
- Antigüedad: **8 años**
- Porcentaje aplicable: **18%**
- Bono de antigüedad: 7.500 × 18% = **Bs 1.350**

### Empleado B: María Elena
- Salario básico: **Bs 10.000**
- Antigüedad: **8 años**
- Porcentaje aplicable: **18%**
- Bono de antigüedad: 7.500 × 18% = **Bs 1.350**

### Resultado

```text
┌─────────────────────────────────────────────────────────────┐
│  Empleado A (salario Bs 3.000):  bono = Bs 1.350           │
│  Empleado B (salario Bs 10.000): bono = Bs 1.350           │
│                                                              │
│  💡 Mismo bono aunque María gana 3 veces más que Juan      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Tabla completa de porcentajes (DS 21060)

| Años de servicio | Porcentaje | Bono mensual (SMN Bs 2.500) |
|------------------|:----------:|-----------------------------:|
| Menos de 2 años  | 0%         | Bs 0                         |
| 2 a 4 años       | 5%         | Bs 375                       |
| 5 a 7 años       | 11%        | Bs 825                       |
| 8 a 10 años      | 18%        | Bs 1.350                     |
| 11 a 14 años     | 26%        | Bs 1.950                     |
| 15 a 19 años     | 34%        | Bs 2.550                     |
| 20 a 24 años     | 42%        | Bs 3.150                     |
| 25 años o más    | 50%        | Bs 3.750                     |

**Fórmula general:**
```text
Bono = (3 × SMN) × porcentaje_correspondiente
```

---

## 🧮 Ejemplo práctico completo

### Caso: Ana Lucía, 6 años de antigüedad, salario Bs 4.500

**Paso 1:** Determinar la base
```text
Base = 3 × SMN = 3 × 2.500 = Bs 7.500
```

**Paso 2:** Buscar el porcentaje en la tabla
```text
6 años → tramo "5 a 7 años" → 11%
```

**Paso 3:** Calcular el bono
```text
Bono = 7.500 × 11% = Bs 825 por mes
```

**Paso 4:** Impacto anual
```text
Bono anual = 825 × 12 = Bs 9.900
```

---

## 💻 Implementación en el ERP

```javascript
// Tabla de porcentajes según DS 21060
const TABLA_BONO_ANTIGUEDAD = [
  { min: 0,  max: 1,  porcentaje: 0   },
  { min: 2,  max: 4,  porcentaje: 5   },
  { min: 5,  max: 7,  porcentaje: 11  },
  { min: 8,  max: 10, porcentaje: 18  },
  { min: 11, max: 14, porcentaje: 26  },
  { min: 15, max: 19, porcentaje: 34  },
  { min: 20, max: 24, porcentaje: 42  },
  { min: 25, max: 99, porcentaje: 50  }
];

function calcularBonoAntiguedad(anios, salarioMinimoNacional = 2500) {
  // Base: 3 veces el SMN (NO el salario del empleado)
  const base = 3 * salarioMinimoNacional;
  
  // Buscar tramo correspondiente
  const tramo = TABLA_BONO_ANTIGUEDAD.find(t => 
    anios >= t.min && anios <= t.max
  );
  
  if (!tramo) {
    return { bono: 0, porcentaje: 0, tramo: 'No encontrado' };
  }
  
  const bono = base * (tramo.porcentaje / 100);
  
  return {
    bono: Math.round(bono * 100) / 100,
    porcentaje: tramo.porcentaje,
    base: base,
    tramo: `${tramo.min}-${tramo.max} años`
  };
}

// Ejemplos de uso:
calcularBonoAntiguedad(8);   // → { bono: 1350, porcentaje: 18 }
calcularBonoAntiguedad(3);   // → { bono: 375,  porcentaje: 5 }
calcularBonoAntiguedad(1);   // → { bono: 0,    porcentaje: 0 }
```

---

## 🤔 ¿Por qué la base es 3 × SMN y no el salario real?

### Razón histórica y social

El DS 21060 (1985) estableció esta fórmula para:

1. **Evitar discriminación:** Si el bono dependiera del salario, los empleadores tendrían incentivo a no contratar personal con alta antigüedad porque serían "más caros".

2. **Uniformidad:** Todos los trabajadores con la misma antigüedad reciben el mismo reconocimiento, independientemente de su cargo o salario.

3. **Control de costos:** Al fijar la base en función del SMN (no del salario real), el Estado controla el impacto económico del beneficio.

4. **Simplicidad administrativa:** Es fácil de calcular y auditar.

### Crítica común

Muchos argumentan que esta fórmula **no reconoce adecuadamente** la antigüedad de empleados altamente calificados con salarios elevados. Un gerente con 25 años de servicio recibe el mismo bono que un asistente con 25 años, aunque sus responsabilidades y aportes sean muy distintos.

**Respuesta del sistema:** Para compensar esto, las empresas suelen incluir **aumentos salariales por antigüedad** en sus políticas internas (fuera del bono obligatorio).

---

## 📌 Consideraciones prácticas

### 1. Cómputo de años

- Se cuenta desde la **fecha de ingreso** hasta la fecha actual.
- Los años pueden ser **completos o fraccionados** (se redondea al tramo correspondiente).
- Ejemplo: 7 años y 8 meses → se considera dentro del tramo "5 a 7 años" (11%).

### 2. Base imponible

El bono de antigüedad:
- ✅ **SÍ** se incluye en el total ganado para calcular aportes a la AFP (10%).
- ✅ **SÍ** se incluye para calcular el aguinaldo.
- ✅ **SÍ** se incluye para calcular indemnización por tiempo de servicios.
- ❌ **NO** se incluye en el cálculo del RC-IVA (es un beneficio, no salario gravable para este impuesto).

### 3. Provisiones contables

El ERP provisiona el bono mensualmente:

```javascript
// Asiento mensual de provisión
{
  fecha: '2026-09-30',
  concepto: 'Provisión bono de antigüedad septiembre',
  lineas: [
    { cuenta: '5.2.04', debe: 825, haber: 0 },     // Gasto bono antigüedad
    { cuenta: '2.1.13', debe: 0, haber: 825 }      // Bono antigüedad por pagar
  ]
}
```

---

## 🎯 Casos especiales

### Empleados a tiempo parcial

Si el empleado trabaja menos de 8 horas diarias, el bono se calcula **proporcionalmente**:

```text
Bono = (3 × SMN × porcentaje) × (horas_trabajadas / 8)
```

**Ejemplo:** Empleado con 6 años, medio tiempo (4 horas/día)
```text
Bono = 7.500 × 11% × (4/8) = Bs 412,50
```

### Cambios de SMN durante el año

Si el SMN cambia durante el año (ej: sube de Bs 2.500 a Bs 2.700 en julio):

- **Enero-Junio:** bono calculado con SMN antiguo
- **Julio-Diciembre:** bono calculado con SMN nuevo
- **Aguinaldo:** se calcula con el SMN vigente en diciembre

---

## 🔍 Preguntas frecuentes

### ¿El bono se paga si el empleado renuncia?

**Sí.** Se paga proporcionalmente hasta el último día trabajado.

### ¿Se puede negociar un bono mayor?

**Sí.** El DS 21060 establece el **mínimo legal**. Las empresas pueden pagar más si lo desean (por convenio colectivo o política interna).

### ¿Qué pasa si el empleador no paga el bono?

Es una **infracción laboral**. El empleado puede reclamar ante el Ministerio de Trabajo y el empleador deberá pagar el bono adeudado más una multa.

---

## 📚 Resumen

| Concepto | Valor |
|----------|-------|
| Base legal | DS 21060, artículo 60 |
| Base de cálculo | 3 × SMN (no el salario real) |
| Frecuencia de pago | Mensual |
| ¿Se provisiona? | Sí, mensualmente |
| ¿Incluido en AFP? | Sí |
| ¿Incluido en aguinaldo? | Sí |
| SMN 2026 (ejemplo) | Bs 2.500 |
| Base típica | Bs 7.500 |
| Porcentaje máximo | 50% (25+ años) |
| Bono máximo mensual | Bs 3.750 |

---

## 🎓 Lo que aprendiste

1. El bono de antigüedad se calcula sobre **3 × SMN**, no sobre el salario real.
2. Dos empleados con salarios distintos pero misma antigüedad cobran **el mismo bono**.
3. La tabla de porcentajes va del **5% (2-4 años)** al **50% (25+ años)**.
4. El bono se provisiona mensualmente y se incluye en el cálculo de AFP y aguinaldo.
5. Esta fórmula busca **uniformidad** y **control de costos**, aunque tiene críticas por no diferenciar por nivel salarial.

---

