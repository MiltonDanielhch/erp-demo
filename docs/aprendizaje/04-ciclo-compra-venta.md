## Paso 1: Crear `docs/aprendizaje/04-ciclo-compra-venta.md`

# 🔄 Ciclos de Compra y Venta en un ERP Boliviano

**Módulo:** 2 — Capa 2 (Módulos Operativos)  
**Tiempo de lectura:** 8 minutos  
**Nivel:** Fundamental para entender el corazón del ERP

---

## ¿Por qué son importantes los ciclos de compra y venta?

Los ciclos de compra y venta son el **corazón operativo** de cualquier empresa comercial. Cada compra o venta mueve simultáneamente:

1. **Inventario** (sube o baja el stock)
2. **Impuestos** (IVA crédito/débito, IT)
3. **Cuentas por pagar/cobrar** (deudas con proveedores o de clientes)
4. **Contabilidad** (asientos contables)
5. **Libros tributarios** (Libro de Compras, Libro de Ventas)

Un ERP hace esto **automáticamente en una sola operación**. Varios Excel conectados a mano requieren 5 actualizaciones separadas (y con riesgo de error).

---

## 📥 El Ciclo de Compra (desde la necesidad hasta el pago)

```text
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ 1. Solicitud │────▶│ 2. Orden de  │────▶│ 3. Recepción │
│    de Compra │     │    Compra    │     │  en Almacén  │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
┌──────────────┐     ┌──────────────┐     ┌──────▼───────┐
│ 6. Pago al   │◀────│ 5. Cuenta    │◀────│ 4. Factura   │
│   Proveedor  │     │  por Pagar   │     │  Proveedor   │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Paso 1: Solicitud de Compra
- **Qué es:** Un área de la empresa necesita algo (ej: ventas necesita laptops).
- **Documento:** Solicitud de Compra.
- **Estado:** Solicitado.

### Paso 2: Orden de Compra
- **Qué es:** Autorización formal para comprar al proveedor seleccionado.
- **Documento:** Orden de Compra.
- **Información:** Proveedor, productos, precios, condiciones de pago.

### Paso 3: Recepción en Almacén
- **Qué es:** Llega físicamente la mercadería.
- **Documento:** Nota de Entrada.
- **Efecto:** El inventario sube (cantidad y costo).

### Paso 4: Factura del Proveedor
- **Qué es:** El proveedor emite la factura legal.
- **Documento:** Factura de Compra (Capa 1).
- **Validaciones:** NIT válido, CUF de 43 caracteres, IVA coherente.
- **Efecto:** Se calcula el IVA crédito fiscal.

### Paso 5: Cuenta por Pagar
- **Qué es:** La deuda con el proveedor aparece en el sistema.
- **Estado:** Pendiente de pago.
- **Efecto:** Se actualiza el saldo del proveedor.

### Paso 6: Pago al Proveedor
- **Qué es:** Se paga la deuda (contado o crédito).
- **Documento:** Comprobante de Egreso.
- **Efecto:** La cuenta por pagar desaparece.

---

## 📤 El Ciclo de Venta (desde la cotización hasta el cobro)

```text
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ 1. Cotización│────▶│ 2. Pedido /  │────▶│ 3. Despacho  │
│   al Cliente │     │  Orden Venta │     │  de Almacén  │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
┌──────────────┐     ┌──────────────┐     ┌──────▼───────┐
│ 6. Cobro del │◀────│ 5. Cuenta    │◀────│ 4. Factura   │
│   Cliente    │     │  por Cobrar  │     │  de Venta    │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Paso 1: Cotización al Cliente
- **Qué es:** Se le muestra al cliente precios y disponibilidad.
- **Documento:** Cotización.
- **Estado:** No es un compromiso legal.

### Paso 2: Pedido / Orden de Venta
- **Qué es:** El cliente confirma la compra.
- **Documento:** Pedido de Venta.
- **Estado:** Compromiso formal.

### Paso 3: Despacho de Almacén
- **Qué es:** Se entrega físicamente la mercadería.
- **Documento:** Nota de Salida.
- **Efecto:** El inventario baja, se calcula el costo de venta.

### Paso 4: Factura de Venta
- **Qué es:** Se emite la factura legal al cliente.
- **Documento:** Factura de Venta (Capa 1).
- **Efectos:**
  - IVA Débito Fiscal (13% incluido en el precio)
  - IT del 3% sobre el monto bruto
  - Venta registrada en ingresos

### Paso 5: Cuenta por Cobrar
- **Qué es:** La deuda del cliente aparece en el sistema.
- **Estado:** Pendiente de cobro.
- **Efecto:** Se actualiza el saldo del cliente.

### Paso 6: Cobro del Cliente
- **Qué es:** El cliente paga (contado o crédito).
- **Documento:** Recibo de Caja.
- **Efecto:** La cuenta por cobrar desaparece, entra efectivo/banco.

---

## 💰 Ejemplo completo: Compra y venta de laptops

### La compra

```text
Compramos 3 laptops a Bs 5,000 cada una (sin IVA)
Precio total: 3 × 5,000 = Bs 15,000 (neto)
IVA (13%): Bs 15,000 × 0.13 = Bs 1,950
Total factura: Bs 16,950

Efectos en el sistema:
├── Inventario: +3 laptops, costo Bs 5,000 cada una
├── IVA Crédito Fiscal: +Bs 1,950 (podemos descontar esto del IVA de ventas)
├── Cuenta por Pagar: Bs 16,950 (debemos al proveedor)
└── Asiento contable:
    Inventario de Mercancías      Bs 15,000 (Debe)
    IVA Crédito Fiscal            Bs  1,950 (Debe)
        Proveedores                       Bs 16,950 (Haber)
```

### La venta

```text
Vendemos 2 laptops a Bs 6,780 cada una (IVA incluido)
Total factura: 2 × 6,780 = Bs 13,560 (IVA incluido)
Neto = 13,560 ÷ 1.13 = Bs 12,000
IVA = 13,560 − 12,000 = Bs 1,560
IT (3% sobre bruto): 13,560 × 0.03 = Bs 406.80

Efectos en el sistema:
├── Inventario: −2 laptops (quedan 1)
├── Costo de Ventas: 2 × 5,000 = Bs 10,000 (sale del inventario)
├── IVA Débito Fiscal: +Bs 1,560 (debemos al SIN)
├── IT: Bs 406.80 (impuesto del 3%)
├── Cuenta por Cobrar: Bs 13,560 (el cliente nos debe)
└── Asientos contables:
    Clientes                    Bs 13,560 (Debe)
        Ventas                          Bs 12,000 (Haber)
        IVA Débito Fiscal               Bs  1,560 (Haber)
    
    Costo de Ventas             Bs 10,000 (Debe)
        Inventario de Mercancías        Bs 10,000 (Haber)
    
    Gasto IT                    Bs    406.80 (Debe)
        IT por Pagar                    Bs    406.80 (Haber)
```

---

## 📊 Resultado de la operación

```text
Ventas:          Bs 12,000 (neto)
Costo de ventas: Bs 10,000
─────────────────────────────────────
Utilidad bruta:  Bs  2,000

Gasto IT:        Bs    406.80
─────────────────────────────────────
Utilidad neta:   Bs  1,593.20

IVA a pagar:
  IVA Débito:    Bs  1,560
  IVA Crédito:   Bs −1,950 (de la compra)
─────────────────────────────────────
Saldo a favor:   Bs   −390 (usamos todo el crédito y queda saldo)
```

**Ese es el poder de un ERP:** una compra y una venta actualizaron automáticamente inventario, impuestos, cuentas por pagar/cobrar, contabilidad y libros tributarios. Sin errores, sin doble captura.

---

## 🎯 Preguntas frecuentes en una exposición

### ❓ ¿Por qué el IVA está incluido en el precio?

**Respuesta:** Porque el Art. 5 de la Ley 843 lo establece así. Es una particularidad boliviana. En otros países el IVA se muestra aparte ("IVA por fuera"), pero en Bolivia el precio que ves ya incluye el IVA. La Ley 1733 (mayo 2026) cambió esto, pero está pendiente de reglamentación.

### ❓ ¿Qué es el IVA Crédito Fiscal?

**Respuesta:** Es el IVA que pagamos en las compras. Podemos descontarlo del IVA de las ventas (IVA Débito Fiscal). Si el crédito es mayor que el débito, tenemos saldo a favor para el próximo mes.

### ❓ ¿Por qué el IT se calcula sobre el monto bruto?

**Respuesta:** Porque la ley lo establece así (Art. 72 Ley 843). Es el 3% del total de cada transacción, sin descontar IVA. Es un impuesto a las transacciones, no a la utilidad.

### ❓ ¿Qué pasa si el cliente paga en efectivo vs transferencia?

**Respuesta:** En el ERP se registra la forma de pago (EFECTIVO, TRANSFERENCIA, CHEQUE, TARJETA). Esto alimenta el Libro Bancario y la conciliación bancaria.
