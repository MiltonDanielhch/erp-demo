# Estructura del Asiento Contable

**Módulo:** 3 — Capa 3 (Motor Contable)
**Tiempo de lectura:** 10 minutos
**Nivel:** Referencia técnica

---

## ¿Por qué esta estructura?

El asiento contable es la **unidad atómica** de toda la contabilidad. Cada transacción del ERP (compra, venta, nómina, ajuste) se convierte en uno o más asientos. Si la estructura es sólida, todo el sistema funciona; si es débil, todo se rompe.

Esta estructura fue diseñada para cumplir:
1. **Trazabilidad completa**: cada asiento se vincula a un documento fuente
2. **Validación automática**: no se puede guardar un asiento desbalanceado
3. **Periodicidad**: cada asiento pertenece a un período contable
4. **Auditoría**: cada asiento tiene número único y metadata de creación

---

## Estructura completa

```javascript
const asiento = {
  id: "asiento-1694736000-abc123",
  numero: "AD-2026-09-001",
  fecha: "2026-09-15",
  periodoContable: "2026-09",
  tipo: "COMPRA",
  concepto: "Compra de mercancía según Factura F-4521",
  documentoFuenteId: "doc-001",
  estado: "PROCESADO",
  lineas: [
    {
      id: "linea-1694736000-xyz789",
      cuentaCodigo: "1.1.05",
      cuentaNombre: "Inventario de Mercancías",
      debe: 5000.00,
      haber: 0.00,
      descripcion: "Entrada de mercancía PROD-001 x10"
    },
    {
      id: "linea-1694736000-def456",
      cuentaCodigo: "1.1.06",
      cuentaNombre: "IVA Crédito Fiscal",
      debe: 650.00,
      haber: 0.00,
      descripcion: "IVA de la factura F-4521"
    },
    {
      id: "linea-1694736000-ghi012",
      cuentaCodigo: "2.1.01",
      cuentaNombre: "Proveedores",
      debe: 0.00,
      haber: 5650.00,
      descripcion: "Cuenta por pagar a ABC SRL"
    }
  ],
  totalDebe: 5650.00,
  totalHaber: 5650.00,
  cuadra: true,
  creadoPor: "sistema",
  creadoEn: "2026-09-15T10:30:00.000Z"
};
```

---

## Campo por campo

### Metadatos del asiento

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Identificador único (UUID) |
| `numero` | string | Número correlativo (AD-2026-09-001) |
| `fecha` | string | Fecha de la transacción (YYYY-MM-DD) |
| `periodoContable` | string | Período al que pertenece (2026-09) |
| `tipo` | string | Tipo: COMPRA, VENTA, NOMINA, AJUSTE, CIERRE, MANUAL |
| `concepto` | string | Descripción del asiento (glosa) |
| `documentoFuenteId` | string/null | Vinculación a documento de Capa 1 |
| `estado` | string | PENDIENTE, PROCESADO, ANULADO |
| `totalDebe` | number | Suma de todos los Debe |
| `totalHaber` | number | Suma de todos los Haber |
| `cuadra` | boolean | true si totalDebe === totalHaber |
| `creadoPor` | string | Usuario que creó el asiento |
| `creadoEn` | string | Timestamp de creación (ISO 8601) |

### Líneas del asiento

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Identificador único de la línea |
| `cuentaCodigo` | string | Código del plan de cuentas (ej: "1.1.05") |
| `cuentaNombre` | string | Nombre descriptivo de la cuenta |
| `debe` | number | Monto en el Debe (0 si es Haber) |
| `haber` | number | Monto en el Haber (0 si es Debe) |
| `descripcion` | string | Descripción opcional de la línea |

---

## Numeración de asientos

El sistema usa prefijos según el tipo:

```text
Tipo      Prefijo  Ejemplo              Significado
───────────────────────────────────────────────────────────
Diario    AD       AD-2026-09-001       Asiento Diario
Ajuste    AJ       AJ-2026-09-001       Asiento de Ajuste
Cierre    CI       CI-2026-001          Asiento de Cierre
```

**Numeración por período**: los asientos de Diario y Ajuste se numeran dentro de cada período (mes). Los asientos de Cierre son anuales.

Ejemplo:
```text
AD-2026-09-001  Primer asiento de septiembre 2026
AD-2026-09-002  Segundo asiento de septiembre 2026
...
AD-2026-09-157  Asiento 157 de septiembre 2026

CI-2026-001     Primer (y único) cierre del año 2026
```

---

## Validaciones automáticas

El sistema valida cada asiento antes de guardarlo:

```text
✓ Mínimo 2 líneas (no puede haber asiento de 1 línea)
✓ totalDebe === totalHaber (con tolerancia ±0.01 por redondeo)
✓ Cada línea tiene una cuenta válida del plan de cuentas
✓ La fecha está dentro de un período contable abierto
✓ El documentoFuenteId existe en Capa 1 (si se proporciona)
✓ El número de asiento es único
```

Si alguna validación falla, el asiento **no se guarda** y se devuelven los errores específicos.

---

## Ejemplo: asiento válido

```javascript
const asientoValido = {
  fecha: "2026-09-15",
  tipo: "COMPRA",
  concepto: "Compra de laptops según Factura F-12345",
  documentoFuenteId: "doc-001",
  lineas: [
    {
      cuentaCodigo: "1.1.05",
      cuentaNombre: "Inventario de Mercancías",
      debe: 5000,
      haber: 0,
      descripcion: "Laptops Lenovo x5"
    },
    {
      cuentaCodigo: "1.1.06",
      cuentaNombre: "IVA Crédito Fiscal",
      debe: 650,
      haber: 0,
      descripcion: "IVA 13% incluido"
    },
    {
      cuentaCodigo: "2.1.01",
      cuentaNombre: "Proveedores",
      debe: 0,
      haber: 5650,
      descripcion: "Proveedor ABC SRL"
    }
  ]
};

const resultado = estructuraAsiento.crearAsiento(asientoValido);
// → { exito: true, asiento: {...}, errores: [] }
```

**Resultado:**
```text
Asiento AD-2026-09-001 creado correctamente
Total Debe: 5,650.00
Total Haber: 5,650.00
Cuadra: ✓
```

---

## Ejemplo: asiento inválido

```javascript
const asientoInvalido = {
  fecha: "2026-09-15",
  tipo: "VENTA",
  concepto: "Venta de productos",
  lineas: [
    {
      cuentaCodigo: "1.1.03",
      cuentaNombre: "Clientes",
      debe: 1000,
      haber: 0
    }
    // ❌ Falta la segunda línea
  ]
};

const resultado = estructuraAsiento.crearAsiento(asientoInvalido);
// → { exito: false, asiento: null, errores: [...] }
```

**Errores devueltos:**
```text
❌ El asiento debe tener al menos 2 líneas (tiene 1)
```

Otro ejemplo con desbalance:

```javascript
const asientoDesbalanceado = {
  fecha: "2026-09-15",
  tipo: "MANUAL",
  concepto: "Asiento manual con error",
  lineas: [
    {
      cuentaCodigo: "1.1.01",
      cuentaNombre: "Caja",
      debe: 1000,
      haber: 0
    },
    {
      cuentaCodigo: "4.1.01",
      cuentaNombre: "Ventas",
      debe: 0,
      haber: 900  // ❌ Debería ser 1000
    }
  ]
};

const resultado = estructuraAsiento.crearAsiento(asientoDesbalanceado);
```

**Errores devueltos:**
```text
❌ El asiento no cuadra: Debe 1000.00 ≠ Haber 900.00 (diferencia: 100.00)
```

---

## Uso en el ERP

### Desde el Generador de Asientos (Módulo 2)

```javascript
// En asientos-contables.js
generarAsientoCompra(detalle) {
  const lineas = [
    estructuraAsiento.crearLinea({
      cuentaCodigo: '1.1.05',
      cuentaNombre: 'Inventario de Mercancías',
      debe: detalle.neto,
      haber: 0,
      descripcion: 'Compra de mercancía'
    }),
    estructuraAsiento.crearLinea({
      cuentaCodigo: '1.1.06',
      cuentaNombre: 'IVA Crédito Fiscal',
      debe: detalle.iva,
      haber: 0,
      descripcion: 'IVA de la compra'
    }),
    estructuraAsiento.crearLinea({
      cuentaCodigo: '2.1.01',
      cuentaNombre: 'Proveedores',
      debe: 0,
      haber: detalle.total,
      descripcion: `Proveedor ${detalle.proveedorNombre}`
    })
  ];

  const resultado = estructuraAsiento.crearAsiento({
    fecha: detalle.fecha,
    tipo: 'COMPRA',
    concepto: `Compra según factura ${detalle.numeroFactura}`,
    documentoFuenteId: detalle.documentoId,
    lineas: lineas
  });

  if (resultado.exito) {
    almacenamiento.guardar('asientos_pendientes', resultado.asiento);
  }
}
```

### Desde el Motor Contable (Módulo 3)

```javascript
// En capa3-motor.js
procesarAsientosPendientes() {
  const pendientes = almacenamiento.obtener('asientos_pendientes');
  
  pendientes.forEach(asiento => {
    const validacion = estructuraAsiento.validarEstructuraAsiento(asiento);
    
    if (validacion.valido) {
      // Mover a asientos_contabilizados
      almacenamiento.guardar('asientos_contabilizados', asiento);
      almacenamiento.eliminar('asientos_pendientes', asiento.id);
      
      // Actualizar saldos en el Libro Mayor
      this.actualizarMayor(asiento);
    } else {
      console.error(`Asiento ${asiento.numero} inválido:`, validacion.errores);
    }
  });
}
```
