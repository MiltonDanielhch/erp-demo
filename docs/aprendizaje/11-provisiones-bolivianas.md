# Provisiones Contables Obligatorias en Bolivia

**Módulo:** 3 — Motor Contable
**Tiempo de lectura:** 12 minutos
**Normativa aplicable:** LGT, DS 28699, DS 1802, DS 21060, NC del CTNAC

---

## ¿Qué es una provisión contable?

Una **provisión** es un registro contable que reconoce un gasto que **ya ocurrió** pero cuyo pago ocurrirá en el futuro. Se basa en el **principio de devengado**: los gastos se registran cuando se incurren, no cuando se pagan.

```text
EJEMPLO CONCRETO
─────────────────────────────────────────────────
En enero un empleado trabaja todo el mes.
En diciembre recibirá su aguinaldo.

❌ INCORRECTO: registrar el gasto solo en diciembre
✓  CORRECTO: provisionar 1/12 cada mes (enero a noviembre)
```

Esto cumple con la **NC 3 (Norma de Contabilidad generalmente aceptada)** sobre el principio del devengado.

---

## Las 5 provisiones obligatorias en Bolivia

### 1. Provisión de Aguinaldo de Navidad

**Base legal:** Ley General del Trabajo Art. 56

- **Beneficio:** 1 sueldo mensual en diciembre
- **Cálculo:** promedio del total ganado en los últimos 3 meses
- **Provisión mensual:** 1/12 del monto estimado anual
- **Condición:** 1 año de servicio mínimo (pero se provisiona desde el ingreso)

**Ejemplo numérico:**

```text
Empleado: Juan Pérez
Sueldo mensual: Bs 6,000
Total ganado últimos 3 meses: Bs 18,000
Promedio mensual: Bs 6,000
Aguinaldo estimado: Bs 6,000 (1 mes)
Provisión mensual: Bs 6,000 ÷ 12 = Bs 500

Asiento mensual (enero a noviembre):
  Gasto de Aguinaldo            Bs 500   (Debe)
      Aguinaldo por Pagar                Bs 500  (Haber)

En diciembre: se PAGA el aguinaldo acumulado (Bs 5,500) y se
devenga el último mes (Bs 500). Total pagado: Bs 6,000.
```

### 2. Segundo Aguinaldo "Esfuerzo por Bolivia"

**Base legal:** DS 1802 (diciembre 2013)

- **Condición:** solo se paga si el **PIB nacional supera el 4.5%**
- **Beneficio:** 1 sueldo adicional en diciembre (total 2 aguinaldos)
- **Estado actual:** el INE publica anualmente si aplica
- **Provisión:** solo cuando el gobierno confirma que aplica (generalmente en octubre/noviembre)

**⚠️ Importante:** NO se provisiona de forma automática porque es condicional. El sistema debe incluir un flag `segundoAguinaldoHabilitado` que el contador active manualmente cuando se publique el dato oficial.

### 3. Bono de Antigüedad

**Base legal:** DS 21060

- **Base de cálculo:** 3 × SMN vigente (Salario Mínimo Nacional)
- **Condición:** 2 o más años de servicio
- **Porcentajes:**

```text
Años de servicio │ Porcentaje
─────────────────┼──────────
2 años           │   5%
4 años           │   9%
6 años           │  11%
8 años           │  15%
10 años          │  20%
15 años          │  25%
20 años          │  30%
25+ años         │  50%
```

**Ejemplo numérico:**

```text
SMN vigente: Bs 2,500
Base de cálculo: Bs 7,500

Empleado con 8 años: bono = 7,500 × 15% = Bs 1,125/mes
Empleado con 10 años: bono = 7,500 × 20% = Bs 1,500/mes
Empleado con 1 año: bono = Bs 0 (no aplica)
```

**Provisión mensual:** el bono se paga mensualmente, pero si hay retrasos se provisiona.

### 4. Indemnización por Tiempo de Servicios

**Base legal:** DS 28699 (modificó la LGT)

- **Beneficio:** 1 sueldo por año de servicio + proporcional por fracción
- **⚠️ PARTICULARIDAD BOLIVIANA:** aplica incluso a **renuncia voluntaria**
- **Provisión mensual:** acumulada ÷ 12 cada mes

**Ejemplo numérico:**

```text
Empleado: María López
Sueldo promedio últimos 3 meses: Bs 8,000
Años de servicio: 5 años 6 meses = 5.5 años

Indemnización acumulada: Bs 8,000 × 5.5 = Bs 44,000
Provisión mensual del año actual: Bs 8,000 ÷ 12 = Bs 666.67

Asiento mensual:
  Gasto de Indemnización        Bs 666.67  (Debe)
      Indemnización por Pagar              Bs 666.67 (Haber)
```

**Importante:** El DS 28699 eliminó la "inamovilidad" del trabajador estable, pero extendió la indemnización a la renuncia. Esto significa que el empleador SIEMPRE debe provisionar la indemnización, sin importar si el empleado renuncia o es despedido.

### 5. Depreciación de Activos Fijos

**Base legal:** NC 6 (Activos Fijos) y Ley 843 (IUE)

- **Método más usado:** línea recta
- **Fórmula:** (Costo − Valor Residual) ÷ Vida útil en meses

**Vidas útiles comunes en Bolivia (según reglamento IUE):**

```text
Activo                     │ Vida útil (años)
───────────────────────────┼─────────────────
Edificios                  │ 40
Muebles y enseres          │ 10
Equipo de computación      │  4
Vehículos                  │  5
Maquinaria                 │  8
Herramientas               │  4
```

**Ejemplo numérico:**

```text
Laptop Lenovo ThinkPad
Costo: Bs 8,000
Valor residual: Bs 0
Vida útil: 4 años = 48 meses

Depreciación mensual: (8,000 − 0) ÷ 48 = Bs 166.67

Asiento mensual:
  Gasto de Depreciación       Bs 166.67  (Debe)
      Depreciación Acumulada           Bs 166.67 (Haber)
```

---

## ⚠️ Sobre la AITB (Ajuste por Inflación y Tenencia de Bienes)

Desde **diciembre 2020**, Bolivia **suspendió** la obligatoriedad del ajuste por inflación (NC 6 reemplazada parcialmente). Por eso el ERP NO debe generar asientos de reexpresión por inflación. El sistema usa valores históricos para activos fijos.

---

## Resumen visual

```text
PROVISIÓN MENSUAL (diciembre = mes 12, pago)
─────────────────────────────────────────────────────────
Ene Feb Mar Abr May Jun Jul Ago Sep Oct Nov | Dic
 │   │   │   │   │   │   │   │   │   │   │  │
 P   P   P   P   P   P   P   P   P   P   P  │ PAGO
 │   │   │   │   │   │   │   │   │   │   │  │
 └───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴──┘
         11 provisiones mensuales         └ 1 pago
         (1/12 cada una)                   del total
```

**Lectura:** Cada mes se provisiona 1/12 del beneficio anual. En diciembre se paga el beneficio y se registra el último mes como gasto directo.
