# 📐 Modelo de Datos de Documentos Fuente

**Módulo:** 1 — Capa 1 (Documentos Fuente)  
**Tiempo de lectura:** 5 minutos  
**Nivel:** Intermedio

---

## ¿Por qué definir un modelo de datos estructurado?

Antes de escribir la lógica de registro, **definimos qué datos tiene cada documento**. Esto evita:

- ❌ Documentos con campos faltantes (NIT vacío, monto negativo)
- ❌ Datos inconsistentes (IVA que no cuadra con el total)
- ❌ Duplicados (mismo CUF registrado dos veces)
- ❌ Migraciones de datos en el futuro (porque ya diseñamos bien desde el inicio)

---

## Modelo Base: Lo que TODOS los documentos comparten

Cada documento fuente, sin importar su tipo, tiene estos 11 campos base:

```javascript
{
  id: "doc-001",                    // UUID único (auto-generado)
  tipo: "FACTURA_COMPRA",           // Enum de 14 tipos
  numero: "F-2026-001234",          // Número visible del documento
  fechaEmision: "2026-09-01",       // Fecha del documento (ISO)
  fechaRegistro: "2026-09-01",      // Fecha en que se captura en ERP
  periodoContable: "2026-09",       // Derivado de fechaEmision (auto)
  montoTotal: 5650.00,              // Bs con IVA incluido
  estado: "PENDIENTE",              // Estado del documento
  observaciones: "",                // Notas del usuario
  creadoPor: "usuario1",            // Auditoría
  creadoEn: "2026-09-01T10:30:00"   // Timestamp ISO
}
```

---

## Campos Específicos por Tipo de Documento

Cada tipo de documento tiene **campos adicionales** según su naturaleza:

### 📄 Facturas (Compra y Venta)

```javascript
{
  // ... campos base ...
  
  // Identificación fiscal
  nitEmisor: "400888777-5",         // NIT de quien emite
  razonSocialEmisor: "Importadora Beni SA",
  cuf: "Z9Y8X7W6...77caracteres",   // Código Único de Factura (SIAT)
  
  // Desglose de montos (calculado automáticamente)
  desglose: {
    neto: 5000.00,                  // montoTotal ÷ 1.13
    iva: 650.00,                    // neto × 0.13
    it: 169.50                      // montoTotal × 0.03 (solo ventas)
  },
  
  // Detalle de productos/servicios
  detalle: [
    {
      codigo: "LAP-001",
      descripcion: "Laptop HP ProBook",
      cantidad: 1,
      precioUnitario: 5000.00,
      subtotal: 5000.00
    }
  ],
  
  // Vinculación a contraparte
  contraparteId: "prov-123",        // ID del proveedor o cliente
  contraparteTipo: "PROVEEDOR"      // o "CLIENTE"
}
```

### 💰 Recibos de Caja (Ingresos)

```javascript
{
  // ... campos base ...
  
  // Vinculación a factura original
  facturaId: "doc-045",             // ID de la factura que se cobra
  facturaNumero: "F-2026-V-001",    // Número visible para referencia
  
  // Medio de pago
  medioPago: "TRANSFERENCIA",       // EFECTIVO, CHEQUE, TRANSFERENCIA, TARJETA
  bancoOrigen: "Banco Unión",       // Solo si aplica
  numeroReferencia: "TRF-789456",   // Número de transacción bancaria
  
  // Cuenta contable afectada
  cuentaBancaria: "1.1.02.001",     // Código de cuenta en el plan
  moneda: "BOB"                     // BOB, USD, EUR
}
```

### 📤 Comprobantes de Egreso (Pagos)

```javascript
{
  // ... campos base ...
  
  // Vinculación a factura del proveedor
  facturaId: "doc-012",             // ID de la factura que se paga
  facturaNumero: "F-2026-001",      // Número visible
  
  // Medio de pago
  medioPago: "CHEQUE",
  numeroCheque: "0001234",
  bancoEmisor: "Banco Mercantil Santa Cruz",
  
  // Autorización
  autorizadoPor: "Gerente Financiero",
  fechaAutorizacion: "2026-08-30",
  
  // Cuenta contable afectada
  cuentaBancaria: "1.1.02.001",
  
  // Retenciones aplicadas (si aplica)
  retenciones: {
    it: 169.50,                     // 3% sobre montoTotal
    iva: 0,                         // Solo si es agente de retención
    totalRetenido: 169.50
  }
}
```

### 👥 Comprobantes de Nómina

```javascript
{
  // ... campos base ...
  
  // Identificación del empleado
  empleadoId: "emp-001",
  empleadoCI: "9876543",
  empleadoNombre: "Juan Carlos Menacho Vaca",
  
  // Período de la planilla
  periodoNomina: "2026-09",
  
  // Desglose de haberes
  devengado: {
    salarioBase: 5000.00,
    bonoAntiguedad: 825.00,         // Calculado con DS 21060
    horasExtras: 0,
    totalDevengado: 5825.00
  },
  
  // Desglose de deducciones
  deducciones: {
    afp: 582.50,                    // 10% del devengado
    rcIva: 757.25,                  // 13% del devengado
    totalDeducciones: 1339.75
  },
  
  // Neto a pagar
  netoPagar: 4485.25,               // devengado - deducciones
  
  // Aportes patronales (no se descuentan al empleado)
  aportesPatronales: 1689.25        // ~29% del devengado
}
```

### 📦 Notas de Almacén (Entrada y Salida)

```javascript
{
  // ... campos base ...
  
  // Tipo de movimiento
  tipoMovimiento: "ENTRADA",        // o "SALIDA"
  
  // Vinculación a orden
  ordenId: "oc-2026-004",           // Orden de compra o pedido de venta
  ordenNumero: "OC-2026-004",
  
  // Detalle de productos
  productos: [
    {
      productoId: "prod-001",
      codigo: "LAP-001",
      descripcion: "Laptop HP ProBook",
      cantidad: 3,
      costoUnitario: 5000.00,       // Solo para entradas
      lote: "L-2026-09-001",        // Trazabilidad
      fechaVencimiento: null        // Solo si aplica
    }
  ],
  
  // Ubicación en almacén
  almacenOrigen: "ALMACEN-PRINCIPAL",
  almacenDestino: "ALMACEN-PRINCIPAL",
  
  // Responsable
  recibidoPor: "Carlos Pérez",      // Solo para entradas
  despachadoPor: "María López"      // Solo para salidas
}
```

### 🔁 Notas de Crédito y Débito

```javascript
{
  // ... campos base ...
  
  // Vinculación obligatoria a factura original
  facturaOriginalId: "doc-045",
  facturaOriginalNumero: "F-2026-V-001",
  
  // Motivo de la nota
  motivo: "DEVOLUCION",             // DEVOLUCION, DESCUENTO, ERROR, OTRO
  descripcionMotivo: "Cliente devuelve 1 laptop por defecto de fábrica",
  
  // Monto de ajuste
  montoAjuste: 5650.00,             // Puede ser parcial o total
  
  // Desglose
  desglose: {
    neto: 5000.00,
    iva: 650.00
  }
}
```

---

## Relaciones entre Documentos

Los documentos no están aislados: se **vinculan** entre sí para mantener trazabilidad:

```text
Solicitud de Compra (intención)
  └─→ Orden de Compra (compromiso)
       └─→ Nota de Entrada (recepción física)
            └─→ Factura de Compra (obligación de pago)
                 └─→ Comprobante de Egreso (pago)

Cotización (intención)
  └─→ Pedido de Venta (compromiso)
       └─→ Nota de Salida (despacho físico)
            └─→ Factura de Venta (obligación de cobro)
                 └─→ Recibo de Caja (cobro)

Factura de Venta
  └─→ Nota de Crédito (devolución o descuento)
```

### Implementación de vinculaciones

```javascript
// js/capas/capa1-documentos.js
class CapaDocumentos {
  vincularDocumentos(documentoId, documentoPadreId) {
    const documento = this.obtenerDocumento(documentoId);
    const padre = this.obtenerDocumento(documentoPadreId);
    
    if (!documento || !padre) {
      throw new Error('Documento no encontrado');
    }
    
    // Agregar referencia al documento hijo
    documento.documentoPadreId = documentoPadreId;
    documento.documentoPadreNumero = padre.numero;
    
    // Guardar cambios
    this.almacenamiento.actualizar('documentos', documento.id, documento);
  }
  
  obtenerDocumentosHijos(documentoPadreId) {
    const todos = this.obtenerDocumentos();
    return todos.filter(doc => doc.documentoPadreId === documentoPadreId);
  }
  
  obtenerCadenaCompleta(documentoId) {
    const documento = this.obtenerDocumento(documentoId);
    const cadena = [documento];
    
    // Subir hacia el padre
    let actual = documento;
    while (actual.documentoPadreId) {
      actual = this.obtenerDocumento(actual.documentoPadreId);
      cadena.unshift(actual);
    }
    
    return cadena;
  }
}

// Ejemplo de uso:
const cadena = window.capaDocumentos.obtenerCadenaCompleta('doc-078');
// → [
//     { tipo: 'SOLICITUD_COMPRA', numero: 'SC-2026-012' },
//     { tipo: 'ORDEN_COMPRA', numero: 'OC-2026-004' },
//     { tipo: 'NOTA_ENTRADA', numero: 'NE-2026-015' },
//     { tipo: 'FACTURA_COMPRA', numero: 'F-2026-001' },
//     { tipo: 'COMPROBANTE_EGRESO', numero: 'CE-2026-001' }
//   ]
```

---

## Validaciones del Modelo

Cada campo tiene reglas de validación definidas en `js/config/campos-documentos.js`:

```javascript
const CAMPOS_DOCUMENTO = {
  FACTURA_COMPRA: {
    requeridos: ['numero', 'fechaEmision', 'nitEmisor', 'cuf', 'montoTotal'],
    validaciones: {
      numero: {
        tipo: 'string',
        patron: /^F-\d{4}-\d{3,6}$/,
        mensaje: 'Formato: F-AAAA-NNNNN'
      },
      fechaEmision: {
        tipo: 'fecha',
        noFutura: true,
        periodoAbierto: true,
        mensaje: 'Fecha inválida o período cerrado'
      },
      nitEmisor: {
        tipo: 'nit',
        algoritmo: 'modulo11',
        mensaje: 'NIT inválido (dígito verificador incorrecto)'
      },
      cuf: {
        tipo: 'string',
        longitud: 77,
        patron: /^[A-Z0-9]{77}$/,
        unico: true,
        mensaje: 'CUF inválido o duplicado'
      },
      montoTotal: {
        tipo: 'numero',
        minimo: 0.01,
        mensaje: 'Monto debe ser mayor a cero'
      }
    }
  },
  
  COMPROBANTE_EGRESO: {
    requeridos: ['numero', 'fechaEmision', 'facturaId', 'medioPago', 'montoTotal'],
    validaciones: {
      facturaId: {
        tipo: 'referencia',
        coleccion: 'documentos',
        existe: true,
        mensaje: 'Factura original no encontrada'
      },
      medioPago: {
        tipo: 'enum',
        valores: ['EFECTIVO', 'CHEQUE', 'TRANSFERENCIA', 'TARJETA'],
        mensaje: 'Medio de pago no válido'
      },
      numeroCheque: {
        tipo: 'string',
        requeridoSi: 'medioPago === "CHEQUE"',
        patron: /^\d{7}$/,
        mensaje: 'Número de cheque inválido'
      }
    }
  }
  // ... más tipos de documentos
};
```

---

## Almacenamiento en LocalStorage

Todos los documentos se guardan en una sola colección:

```javascript
// Estructura en localStorage
{
  "erp_bolivia_documentos": [
    {
      "id": "doc-001",
      "tipo": "FACTURA_COMPRA",
      "numero": "F-2026-001",
      // ... todos los campos
    },
    {
      "id": "doc-002",
      "tipo": "RECIBO_CAJA",
      "numero": "RC-2026-001",
      // ... todos los campos
    }
  ]
}
```

### Operaciones CRUD

```javascript
class CapaDocumentos {
  constructor(almacenamiento) {
    this.almacenamiento = almacenamiento;
    this.coleccion = 'documentos';
  }
  
  // CREATE
  registrarDocumento(datos) {
    const documento = {
      id: Utilidades.generarId(),
      ...datos,
      estado: 'PENDIENTE',
      fechaRegistro: new Date().toISOString()
    };
    
    this.almacenamiento.agregar(this.coleccion, documento);
    return documento;
  }
  
  // READ
  obtenerDocumentos(filtros = {}) {
    let documentos = this.almacenamiento.obtenerTodos(this.coleccion);
    
    // Aplicar filtros
    if (filtros.tipo) {
      documentos = documentos.filter(d => d.tipo === filtros.tipo);
    }
    if (filtros.periodo) {
      documentos = documentos.filter(d => d.periodoContable === filtros.periodo);
    }
    if (filtros.estado) {
      documentos = documentos.filter(d => d.estado === filtros.estado);
    }
    
    return documentos;
  }
  
  obtenerDocumento(id) {
    return this.almacenamiento.obtenerPorId(this.coleccion, id);
  }
  
  // UPDATE
  actualizarDocumento(id, cambios) {
    return this.almacenamiento.actualizar(this.coleccion, id, cambios);
  }
  
  cambiarEstado(id, nuevoEstado) {
    return this.actualizarDocumento(id, { estado: nuevoEstado });
  }
  
  // DELETE (solo en estado BORRADOR)
  eliminarDocumento(id) {
    const documento = this.obtenerDocumento(id);
    
    if (documento.estado !== 'BORRADOR') {
      throw new Error('Solo se pueden eliminar documentos en estado BORRADOR');
    }
    
    return this.almacenamiento.eliminar(this.coleccion, id);
  }
  
  // Utilidades
  contarDocumentos(filtros = {}) {
    return this.obtenerDocumentos(filtros).length;
  }
  
  obtenerPorNumero(numero) {
    const documentos = this.obtenerDocumentos();
    return documentos.find(d => d.numero === numero);
  }
}
```

---

## Ejemplo Completo: Ciclo de una Compra

```javascript
// 1. Registrar factura de compra
const factura = window.capaDocumentos.registrarDocumento({
  tipo: 'FACTURA_COMPRA',
  numero: 'F-2026-001',
  fechaEmision: '2026-09-01',
  nitEmisor: '400888777-5',
  razonSocialEmisor: 'Importadora Beni SA',
  cuf: 'Z9Y8X7W6V5U4T3S2R1Q0P9O8N7M6L5K4J3I2H1G0F9E8D7C6B5A4Z3Y2X1W0V9U8T7S6R5Q4P3O2N1M0',
  montoTotal: 16950,
  desglose: {
    neto: 15000,
    iva: 1950
  },
  detalle: [
    { codigo: 'LAP-001', descripcion: 'Laptop HP', cantidad: 3, precioUnitario: 5000 }
  ]
});

console.log('✅ Factura registrada:', factura.id);

// 2. Registrar pago (comprobante de egreso)
const pago = window.capaDocumentos.registrarDocumento({
  tipo: 'COMPROBANTE_EGRESO',
  numero: 'CE-2026-001',
  fechaEmision: '2026-09-15',
  facturaId: factura.id,              // ← Vinculación
  facturaNumero: factura.numero,
  medioPago: 'TRANSFERENCIA',
  bancoEmisor: 'Banco Unión',
  numeroReferencia: 'TRF-789456',
  montoTotal: 16950
});

console.log('✅ Pago registrado:', pago.id);

// 3. Consultar cadena completa
const cadena = window.capaDocumentos.obtenerCadenaCompleta(pago.id);
console.log('Cadena de documentos:', cadena.map(d => d.numero));
// → ['F-2026-001', 'CE-2026-001']

// 4. Consultar documentos del período
const docsSeptiembre = window.capaDocumentos.obtenerDocumentos({
  periodo: '2026-09'
});
console.log(`Total documentos en septiembre: ${docsSeptiembre.length}`);
```

---

## Resumen

| Aspecto | Valor |
|---|---|
| Campos base comunes | 11 (id, tipo, numero, fechas, monto, estado, etc.) |
| Tipos de documentos | 12 (facturas, recibos, notas, etc.) |
| Campos específicos | Variables según tipo (5-15 adicionales) |
| Vinculaciones | documentoPadreId para trazabilidad |
| Validaciones | Sintáctica + Semántica + Negocio |
| Almacenamiento | Colección única `documentos` en localStorage |
| Operaciones CRUD | Completas con validación de estado |

---

## 🎓 Lo que aprendiste

1. Todos los documentos comparten **11 campos base** (id, tipo, fechas, monto, estado).
2. Cada tipo tiene **campos específicos** según su naturaleza (facturas tienen CUF, recibos tienen medio de pago).
3. Los documentos se **vinculan** entre sí para mantener trazabilidad completa.
4. Las **validaciones** se definen declarativamente en `CAMPOS_DOCUMENTO`.
5. Todo se almacena en una **colección única** en localStorage con operaciones CRUD completas.

