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

- **Factura de compra** → Activo (inventario) o Gasto
- **Recibo de caja** (cuando es contrapartida de un cobro)
- **Nota de entrada** (si es compra de mercadería)
- **Extracto bancario** (cuando entra dinero)
- **Acta de activo fijo** (adquisición)

### Documentos que generan asiento en el HABER (abonos)

- **Factura de venta** → Ingreso
- **Comprobante de egreso** → Salida de caja/banco
- **Nota de salida** → Costo de venta
- **Extracto bancario** (cuando sale dinero)

### Documentos que NO generan asiento contable directo

- **Guía de remisión** (solo mueve inventario entre almacenes)
- **Cotización** (es un documento comercial, no contable)
- **Orden de compra** (es una intención, no una transacción)

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
```

---

## Validación de NIT con Dígito Verificador

El algoritmo de validación del NIT boliviano usa **módulo 11**:

```javascript
// js/nucleo/validadores.js
function validarNIT(nit) {
  // Formato: 123456789-0 (9 dígitos + guion + verificador)
  const limpio = nit.replace(/[-\s]/g, '');
  
  if (!/^\d{10}$/.test(limpio)) {
    return { valido: false, error: 'Formato inválido' };
  }

  const digitos = limpio.slice(0, 9).split('').map(Number);
  const verificador = parseInt(limpio[9]);

  // Coeficientes del algoritmo módulo 11
  const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2, 1];
  
  const suma = digitos.reduce((acc, dig, i) => {
    return acc + (dig * coeficientes[i]);
  }, 0);

  const resto = suma % 11;
  const digitoCalculado = resto === 0 ? 0 : 11 - resto;

  if (digitoCalculado !== verificador) {
    return { 
      valido: false, 
      error: `Dígito verificador incorrecto. Esperado: ${digitoCalculado}` 
    };
  }

  return { valido: true };
}

// Ejemplos:
validarNIT('123456789-7');  // → { valido: true }
validarNIT('123456789-1');  // → { valido: false, error: '...' }
```

---

## Validación de CUF (Código Único de Factura)

El **CUF** es un código de 77 caracteres que identifica unívocamente cada factura en el sistema SIAT del SIN.

```javascript
// js/nucleo/validadores.js
function validarCUF(cuf) {
  // Formato: 77 caracteres alfanuméricos
  if (!/^[A-Z0-9]{77}$/.test(cuf)) {
    return { valido: false, error: 'Formato CUF inválido (77 caracteres)' };
  }

  // Verificar que no esté duplicado en el sistema
  const documentos = window.capaDocumentos.obtenerDocumentos();
  const duplicado = documentos.find(d => d.cuf === cuf);

  if (duplicado) {
    return { 
      valido: false, 
      error: `CUF duplicado. Ya existe en documento ${duplicado.id}` 
    };
  }

  return { valido: true };
}
```

---

## Estados de un Documento

Cada documento tiene un ciclo de vida con estados:

| Estado | Descripción | Acciones permitidas |
|---|---|---|
| **BORRADOR** | Documento en edición, no validado | Editar, Eliminar, Validar |
| **PENDIENTE** | Validado pero no procesado | Procesar, Anular |
| **PROCESADO** | Generó asiento contable | Ver asiento, Anular (con reversa) |
| **ANULADO** | Documento cancelado | Solo consulta |

```javascript
// js/capas/capa1-documentos.js
class CapaDocumentos {
  registrarDocumento(datos) {
    // 1. Validar sintaxis
    const validacionSintactica = this.validarSintaxis(datos);
    if (!validacionSintactica.valido) {
      return { exito: false, errores: validacionSintactica.errores };
    }

    // 2. Validar semántica (NIT, CUF, etc.)
    const validacionSemantica = this.validarSemantica(datos);
    if (!validacionSemantica.valido) {
      return { exito: false, errores: validacionSemantica.errores };
    }

    // 3. Validar negocio (catálogos, stock, etc.)
    const validacionNegocio = this.validarNegocio(datos);
    if (!validacionNegocio.valido) {
      return { exito: false, errores: validacionNegocio.errores };
    }

    // 4. Crear documento con estado PENDIENTE
    const documento = {
      id: Utilidades.generarId(),
      ...datos,
      estado: 'PENDIENTE',
      fechaRegistro: new Date().toISOString(),
      numeroAsiento: null  // Se llena al procesar
    };

    // 5. Guardar en localStorage
    this.almacenamiento.agregar('documentos', documento);

    // 6. Disparar evento para que otros módulos reaccionen
    document.dispatchEvent(new CustomEvent('documento-registrado', {
      detail: { documento }
    }));

    return { exito: true, documento };
  }
}
```

---

## Ejemplo: Registro de Factura de Compra

```javascript
// Registrar una factura de compra
const resultado = window.capaDocumentos.registrarDocumento({
  tipo: 'FACTURA_COMPRA',
  numero: 'F-2026-001',
  fecha: '2026-09-01',
  proveedor: 'Importadora Beni SA',
  nit: '400888777-5',
  cuf: 'Z9Y8X7W6V5U4T3S2R1Q0P9O8N7M6L5K4J3I2H1G0F9E8D7C6B5A4Z3Y2X1W0V9U8T7S6R5Q4P3O2N1M0',
  montoTotal: 16950,
  desglose: {
    neto: 15000,
    iva: 1950,
    it: 508.50
  },
  productos: [
    { codigo: 'LAP-001', nombre: 'Laptop HP', cantidad: 3, precioUnitario: 5000 }
  ]
});

if (resultado.exito) {
  console.log('✅ Factura registrada:', resultado.documento.id);
  // El motor contable procesará automáticamente y creará el asiento:
  // DEBE: Inventario 15.000 + IVA Crédito 1.950
  // HABER: Proveedores 16.950
} else {
  console.error('❌ Error:', resultado.errores);
}
```

---

## Resumen

| Aspecto | Valor |
|---|---|
| Tipos de documentos | 12 |
| Validaciones por documento | Sintáctica + Semántica + Negocio |
| Estados del ciclo de vida | Borrador → Pendiente → Procesado → Anulado |
| Algoritmo de validación NIT | Módulo 11 |
| Formato CUF | 77 caracteres alfanuméricos únicos |
| Eventos disparados | `documento-registrado`, `documento-procesado` |

---

## 🎓 Lo que aprendiste

1. El ERP maneja **12 tipos de documentos**, cada uno con validaciones específicas.
2. Cada documento pasa por **3 niveles de validación**: sintáctica, semántica y de negocio.
3. El **NIT se valida con módulo 11** y el **CUF debe ser único** en el sistema.
4. Los documentos tienen un **ciclo de vida** con estados que controlan qué acciones están permitidas.
5. Al registrarse un documento válido, se dispara un **evento** que otros módulos escuchan para reaccionar.
