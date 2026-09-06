# 📋 Tipos de Documentos Fuente en el ERP

**Módulo:** 1 — Capa 1 (Documentos Fuente)  
**Tiempo de lectura:** 3 minutos  
**Nivel:** Referencia rápida

---

## Tabla de los 12 Tipos de Documentos

El ERP maneja 12 tipos de documentos fuente, cada uno con validaciones específicas y vinculación a un módulo operativo.

| # | Tipo de Documento | Origen | Módulo que lo Recibe | Validaciones Críticas |
|---|---|---|---|---|
| 1 | **Factura de Compra** | Proveedor | Compras, Inventario | NIT válido, CUF válido, IVA correcto (÷1.13), fecha en período |
| 2 | **Factura de Venta** | Empresa (emitida) | Ventas, Inventario | CUF único, NIT cliente válido, IVA débito, IT (×3%) |
| 3 | **Recibo de Caja (Ingreso)** | Tesorería | Tesorería | Número correlativo, monto > 0, vinculación a factura |
| 4 | **Comprobante de Egreso** | Tesorería | Tesorería | Autorización, vinculación a factura/pago |
| 5 | **Comprobante de Nómina** | RRHH | Nómina | Cálculo AFP 10%, RC-IVA, bono antigüedad, aguinaldo |
| 6 | **Nota de Entrada (Almacén)** | Almacén | Inventario | Producto existe, cantidad > 0, costo válido |
| 7 | **Nota de Salida (Almacén)** | Almacén | Inventario | Stock suficiente, producto existe, despacho autorizado |
| 8 | **Guía de Remisión** | Almacén/Transporte | Inventario, Ventas | Origen-destino válidos, motivo de traslado |
| 9 | **Extracto Bancario** | Banco | Tesorería | Conciliación con libro banco, fecha válida |
| 10 | **Nota de Crédito** | Proveedor / Empresa | Compras, Ventas | Vinculación a factura original, motivo válido |
| 11 | **Nota de Débito** | Proveedor / Empresa | Compras, Ventas | Vinculación a factura original, recargo justificado |
| 12 | **Acta de Activo Fijo** | Administración | Activos Fijos | Valor de adquisición, vida útil, método depreciación |

---

## Clasificación por Naturaleza Contable

### Documentos que generan asiento en el DEBE (cargos)

- Factura de compra → Activo (inventario) o Gasto
- Recibo de caja (cuando es contrapartida de un cobro)
- Nota de entrada (si es compra de mercadería)
- Extracto bancario (cuando entra dinero)
- Acta de activo fijo (adquisición)

### Documentos que generan asiento en el HABER (abonos)

- Factura de venta → Ingreso
- Comprobante de egreso → Salida de caja/banco
- Nota de salida → Costo de venta
- Extracto bancario (cuando sale dinero)

### Documentos que NO generan asiento contable directo

- Guía de remisión (solo mueve inventario entre almacenes)
- Cotización (es un documento comercial, no contable)
- Orden de compra (es una intención, no una transacción)

---

## Flujo de Validación de un Documento

Cada documento pasa por un pipeline de validación antes de ser aceptado:

```text
┌──────────────────────────────────────────────────────────┐
│  1. CAPTURA                                               │
│     Usuario ingresa datos del documento en formulario    │
└──────────────────────┬───────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────┐
│  2. VALIDACIÓN SINTÁCTICA                                │
│     • Formato de campos (NIT, CUF, fechas, montos)       │
│     • Campos obligatorios completos                      │
│     • Tipos de datos correctos                           │
└──────────────────────┬───────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────┐
│  3. VALIDACIÓN SEMÁNTICA                                 │
│     • NIT válido (algoritmo módulo 11)                   │
│     • CUF único en el sistema (no duplicado)             │
│     • Fecha en período contable abierto                  │
│     • Montos coherentes (IVA = Total ÷ 1.13)             │
└──────────────────────┬───────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────┐
│  4. VALIDACIÓN DE NEGOCIO                                │
│     • Proveedor/Cliente existe en catálogo               │
│     • Productos existen y tienen stock suficiente        │
│     • No excede límite de crédito del cliente            │
└──────────────────────┬───────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────┐
│  5. APROBACIÓN / RECHAZO                                │
│     ✓ VÁLIDO → Guardar en colección documentos           │
│                Disparar evento 'documento-registrado'    │
│     ✗ INVÁLIDO → Mostrar errores específicos al usuario  │
│                  NO guardar nada                         │
└──────────────────────────────────────────────────────────┘
