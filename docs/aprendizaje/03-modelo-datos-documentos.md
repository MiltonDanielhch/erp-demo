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
