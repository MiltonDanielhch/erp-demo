# Funciones de cálculo IVA e IT — Bolivia

## 1. IVA incluido en el precio

En Bolivia, en el régimen general, las facturas suelen expresar importes con IVA incluido.

La alícuota del IVA es:

```text
IVA = 13%
```

Cuando el precio ya incluye IVA, no se calcula el IVA como:

```text
Total × 13%
```

Sino que primero se extrae el neto:

```text
Neto = Total ÷ 1.13
IVA  = Total − Neto
```

---

## 2. `extraerNetoDeTotal(montoTotal)`

Extrae el valor neto de un monto con IVA incluido.

### Fórmula

```text
Neto = Total ÷ 1.13
```

### Ejemplo

Si una factura tiene un total de Bs 5.650:

```text
Neto = 5.650 ÷ 1.13
Neto = 5.000
```

### Resultado

```javascript
window.BOLIVIA.extraerNetoDeTotal(5650)
// 5000
```

### Caso de uso

Se usa en:

- Facturas de compra para calcular el IVA Crédito Fiscal.
- Facturas de venta para calcular el IVA Débito Fiscal.
- Reportes tributarios y libros IVA.

---

## 3. `calcularIVADeTotal(montoTotal)`

Calcula el IVA contenido dentro de un monto total.

### Fórmula

```text
IVA = Total − Neto
```

Donde:

```text
Neto = Total ÷ 1.13
```

### Ejemplo

```text
Total = 5.650
Neto = 5.650 ÷ 1.13 = 5.000
IVA = 5.650 − 5.000 = 650
```

### Resultado

```javascript
window.BOLIVIA.calcularIVADeTotal(5650)
// 650
```

### Caso de uso

En compras:

```text
IVA Crédito Fiscal = IVA contenido en la factura del proveedor
```

En ventas:

```text
IVA Débito Fiscal = IVA contenido en la factura emitida al cliente
```

---

## 4. `calcularIT(montoBruto)`

Calcula el Impuesto a las Transacciones sobre el monto bruto.

### Fórmula

```text
IT = Total × 3%
```

o:

```text
IT = Total × 0.03
```

### Ejemplo

```text
Total = 11.300
IT = 11.300 × 0.03
IT = 339
```

### Resultado

```javascript
window.BOLIVIA.calcularIT(11300)
// 339
```

### Caso de uso

Se usa principalmente en ventas para calcular el impuesto a las transacciones generado por la operación.

---

## 5. `calcularIVASobreNeto(montoNeto)`

Calcula el IVA que se agrega sobre un monto neto.

Esta función representa el esquema de “IVA por fuera”, útil para escenarios futuros.

### Fórmula

```text
IVA = Neto × 13%
```

### Ejemplo

```text
Neto = 5.000
IVA = 5.000 × 0.13
IVA = 650
Total = 5.000 + 650 = 5.650
```

### Resultado

```javascript
window.BOLIVIA.calcularIVASobreNeto(5000)
// 650
```

---

## 6. Validación de redondeo

Todos los importes se redondean a 2 decimales:

```javascript
Math.round(monto * 100) / 100
```

Para validar que un desglose sea correcto:

```javascript
window.BOLIVIA.validarDesgloseIVA(5650)
```

Resultado esperado:

```javascript
{
  valido: true,
  total: 5650,
  neto: 5000,
  iva: 650,
  suma: 5650,
  diferencia: 0
}
```

La validación permite una tolerancia de ±0.01 por diferencias de redondeo.

---

## 7. Nota sobre posible cambio a “IVA por fuera”

La función `calcularIVASobreNeto()` queda preparada para un posible cambio normativo o de configuración donde el IVA se calcule “por fuera”, es decir:

```text
Total = Neto + IVA
IVA = Neto × 13%
```

Actualmente, el sistema trabaja principalmente con precios con IVA incluido:

```text
Neto = Total ÷ 1.13
IVA = Total − Neto
```

Esta separación permite adaptar el ERP sin reescribir toda la lógica tributaria.
```

