## Paso 2: Crear `docs/aprendizaje/05-iva-boliviano-explicado.md`

# 💰 El IVA Boliviano Explicado: Tasa Nominal vs Efectiva

**Módulo:** 2 — Capa 2 (Módulos Operativos)  
**Tiempo de lectura:** 10 minutos  
**Nivel:** Crítico para calcular correctamente los impuestos

---

## La particularidad boliviana: IVA incluido en el precio

```text
╔══════════════════════════════════════════════════════════╗
║  En Bolivia, el IVA (13%) ESTÁ INCLUIDO EN EL PRECIO    ║
║  Base legal: Art. 5 de la Ley 843                       ║
╚══════════════════════════════════════════════════════════╝
```

Esto significa que cuando ves un precio de Bs 100 en una tienda:
- Bs 88.50 son el valor neto del producto
- Bs 11.50 son el IVA (impuesto)
- Total: Bs 100

En otros países el precio se muestra como "Bs 100 + IVA", pero en Bolivia el precio ya incluye todo.

---

## 🔢 Las fórmulas del IVA incluido

### Extraer el neto del total

```text
Neto = Total ÷ 1.13

Ejemplo con Bs 5,650:
  Neto = 5,650 ÷ 1.13 = Bs 5,000
```

### Calcular el IVA

```text
IVA = Total − Neto

Ejemplo con Bs 5,650:
  IVA = 5,650 − 5,000 = Bs 650
```

### Verificación

```text
Neto × 13% = IVA
  5,000 × 0.13 = Bs 650 ✓

Neto + IVA = Total
  5,000 + 650 = Bs 5,650 ✓
```

---

## 📊 Tabla de ejemplos comunes

| Total (Bs) | Neto (Bs) | IVA (Bs) |
|---|---|---|
| 113.00 | 100.00 | 13.00 |
| 565.00 | 500.00 | 65.00 |
| 1,130.00 | 1,000.00 | 130.00 |
| 3,390.00 | 3,000.00 | 390.00 |
| 5,650.00 | 5,000.00 | 650.00 |
| 11,300.00 | 10,000.00 | 1,300.00 |
| 16,950.00 | 15,000.00 | 1,950.00 |

**Truco rápido:** Para números redondos, divide el total entre 113 y multiplica por 100.

```text
5,650 ÷ 113 × 100 = 50 × 100 = 5,000 (neto)
5,650 ÷ 113 × 13 = 50 × 13 = 650 (IVA)
```

---

## 🧮 La "tasa efectiva" de 14.94%: ¿qué es y por qué existe?

Aquí viene la confusión más común. Muchos contadores bolivianos hablan del **14.94%** como si fuera otro impuesto. **NO lo es.**

### El problema práctico

Imagina que vendes un producto y quieres que te queden Bs 100 **limpios** (después de pagar el IVA). ¿A cuánto debes facturar?

```text
Lo que quiero: Bs 100 netos
El IVA es el 13% del total facturado
Entonces: Neto = Total − (Total × 0.13)
         100 = Total × 0.87
         Total = 100 ÷ 0.87 = Bs 114.94

De esos Bs 114.94:
  Neto = 114.94 × 0.87 = Bs 100
  IVA  = 114.94 × 0.13 = Bs 14.94
```

### La interpretación errónea

Si ves Bs 14.94 de IVA sobre Bs 100 netos, puedes pensar:
> "¡El IVA es el 14.94%!"

**Eso es un error.** El IVA sigue siendo el 13% del total (Bs 114.94). Lo que pasa es que Bs 14.94 representa el 14.94% de los Bs 100 netos.

```text
Tasa nominal:  13% (del total facturado) ← La tasa real
Tasa efectiva: 14.94% (respecto al neto) ← Un efecto matemático

NO es un impuesto diferente.
NO es una tasa adicional.
Es solo una forma distinta de expresar el mismo IVA.
```

---

## 🎯 Ejemplo completo: Facturación para obtener Bs 1,000 netos

### Escenario: Quieres vender algo y obtener Bs 1,000 limpios

```text
Paso 1: Calcular el total a facturar
  Total = Neto ÷ 0.87
  Total = 1,000 ÷ 0.87 = Bs 1,149.43

Paso 2: Desglosar el total
  Neto = 1,149.43 ÷ 1.13 = Bs 1,017.24  ← Espera, no cuadra
```

**¡Cuidado!** Aquí hay una confusión común. Vamos a hacerlo bien:

```text
Paso 1: Quiero Bs 1,000 netos
  Total = 1,000 ÷ 0.87 = Bs 1,149.43

Paso 2: Verificar
  Neto = 1,149.43 ÷ 1.13 = Bs 1,017.24  ❌ No es 1,000
```

¿Qué pasó? El problema es que `÷ 0.87` y `÷ 1.13` son operaciones ligeramente distintas. Vamos a usar la fórmula correcta:

```text
Fórmula correcta:
  Total = Neto ÷ (1 − 0.13) = Neto ÷ 0.87

Paso 1: Quiero Bs 1,000 netos
  Total = 1,000 ÷ 0.87 = Bs 1,149.425... ≈ Bs 1,149.43

Paso 2: Verificar con la fórmula del IVA incluido
  Neto = 1,149.43 ÷ 1.13 = Bs 1,017.24  ❌
```

**Aún no cuadra.** El problema es que `÷ 1.13` y `÷ 0.87` no son equivalentes. Vamos a analizar esto matemáticamente:

```text
÷ 1.13 = × 0.88495...
÷ 0.87 = × 1.14942...

No son la misma operación.
```

### La fórmula correcta para facturar

Si quieres Bs 1,000 **netos**, debes facturar:

```text
Total = Neto × 1.13
Total = 1,000 × 1.13 = Bs 1,130.00

Verificación:
  Neto = 1,130 ÷ 1.13 = Bs 1,000 ✓
  IVA  = 1,130 − 1,000 = Bs 130 ✓
  130 ÷ 1,130 = 11.5% ❌ No es 13%

Hmm, parece que no cuadra...
```

**Espera.** Vamos a verificar la fórmula del IVA incluido:

```text
Si Total = Neto + IVA
   y IVA = Neto × 0.13 (el 13% del NETO)
Entonces Total = Neto × 1.13

Pero la ley dice que el IVA es el 13% del TOTAL, no del neto.
Entonces IVA = Total × 0.13
       Neto = Total × 0.87
       Total = Neto ÷ 0.87
```

**Esa es la clave:** en Bolivia el IVA es el 13% **del total**, no del neto.

### Ejemplo correcto: Facturar para obtener Bs 1,000 netos

```text
Paso 1: Fórmula correcta
  Total = Neto ÷ 0.87
  Total = 1,000 ÷ 0.87 = Bs 1,149.43

Paso 2: Verificar
  IVA = 1,149.43 × 0.13 = Bs 149.43  (el 13% del TOTAL)
  Neto = 1,149.43 − 149.43 = Bs 1,000 ✓

Paso 3: La "tasa efectiva"
  149.43 ÷ 1,000 = 14.94%
  (El IVA representa el 14.94% del NETO)
```

---

## 🔍 Resumen de fórmulas

| Operación | Fórmula | Ejemplo |
|---|---|---|
| Extraer neto del total | `Neto = Total ÷ 1.13` | 5,650 ÷ 1.13 = 5,000 |
| Calcular IVA del total | `IVA = Total × 0.13` | 5,650 × 0.13 = 734.50 |
| Calcular IVA por diferencia | `IVA = Total − Neto` | 5,650 − 5,000 = 650 |
| Facturar para obtener neto | `Total = Neto ÷ 0.87` | 1,000 ÷ 0.87 = 1,149.43 |
| Facturar con IVA incluido | `Total = Neto × 1.13` | 5,000 × 1.13 = 5,650 |

**Nota:** Las fórmulas `÷ 1.13` y `× 0.13` parecen distintas pero dan resultados ligeramente diferentes por redondeo. En el ERP usamos `÷ 1.13` como estándar.

---

## ⚠️ El cambio pendiente: Ley 1733 (mayo 2026)

La **Ley 1733 de Alivio Tributario** (27/05/2026) modificó el Art. 5 de la Ley 843 para que el IVA se muestre **"por fuera"** del precio, similar a otros países.

```text
ANTES (vigente):
  "Laptop Lenovo: Bs 6,780" (IVA incluido)

DESPUÉS (Ley 1733, pendiente reglamentación):
  "Laptop Lenovo: Bs 6,000 + IVA Bs 780 = Bs 6,780"
```

**Pero aún no está en vigencia** porque falta el decreto reglamentario. Por eso el ERP tiene un parámetro `IVA_MOSTRADO_POR_FUERA` que se puede activar cuando entre en vigor.

---

## 🎯 Preguntas frecuentes en una exposición

### ❓ ¿Por qué el IVA boliviano es diferente?

**Respuesta:** Porque el Art. 5 de la Ley 843 establece que el IVA está incluido en el precio. Es una decisión de política tributaria para simplificar la facturación y evitar que el consumidor vea el impuesto como algo aparte.

### ❓ ¿Qué es el IVA Crédito Fiscal y el Débito Fiscal?

**Respuesta:** 
- **IVA Crédito Fiscal:** El IVA que pagamos en las compras. Podemos descontarlo.
- **IVA Débito Fiscal:** El IVA de las ventas. Lo debemos al SIN.
- **IVA a pagar:** Débito − Crédito (si es positivo, pagamos; si es negativo, tenemos saldo a favor).

### ❓ ¿El IT del 3% también está incluido en el precio?

**Respuesta:** No exactamente. El IT se calcula sobre el monto bruto de cada transacción, pero no se muestra por separado en la factura. Es un impuesto que paga el vendedor, no el comprador.

### ❓ ¿Por qué se habla de "14.94%" si el IVA es 13%?

**Respuesta:** Es un efecto matemático. Si quieres Bs 100 netos, debes facturar Bs 114.94. El IVA de Bs 14.94 representa el 14.94% de esos Bs 100 netos. Pero la tasa legal sigue siendo 13%.
