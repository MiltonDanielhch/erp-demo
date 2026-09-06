# 📁 ROADMAP_MODULO_1_DOCUMENTOS_FUENTE.md

**Proyecto:** ERP Contable Integral Boliviano (Prototipo Educativo / Portafolio)
**Arquitectura:** Frontend Vanilla JS + LocalStorage (sin backend real — enfoque didáctico)
**Versión:** 1.0.0 · **Formato:** Guía Arquitectónica Explicativa
**Tiempo estimado:** 4–6 horas · **Bloquea:** Módulos 2→8 (Compras, Ventas, Motor Contable)
**Depende de:** Módulo 0 (Setup completo)

> **Objetivo del Módulo:** Construir la **Capa 1: Documentos Fuente** — el punto de entrada de toda la información al ERP. Aquí se implementa el registro, validación y almacenamiento de los documentos que originan cada transacción contable (facturas, recibos, notas de entrada/salida, extractos bancarios). Se establece la **regla de oro del sistema**: *"Sin documento, no hay asiento"*. Un documento mal validado aquí (NIT inválido, CUF duplicado, fecha fuera de período) corromperá toda la cadena contable posterior.

> **Nota didáctica:** Este módulo es donde el prototipo deja de ser "una estructura vacía" y empieza a **hacer algo real**: registrar documentos. Es el momento ideal para explicar en una exposición cómo un ERP garantiza la **trazabilidad completa** — desde el papel (o XML) hasta el estado financiero. Cada documento que se registra aquí será el "origen" que se mostrará al final de esa cadena.

---

## 🗺️ Mapa del Módulo

```text
Módulo 1
├── Fase 1.1 → Teoría: Qué son los Documentos Fuente y por qué importan
├── Fase 1.2 → Modelo de datos: Estructura de cada tipo de documento
├── Fase 1.3 → js/capas/capa1-documentos.js — Registro y validación
├── Fase 1.4 → Vista de registro de documentos (formulario + tabla)
├── Fase 1.5 → Validaciones bolivianas (NIT, CUF, períodos contables)
├── Fase 1.6 → Vinculación documento → período contable
└── Fase 1.7 → Smoke test final y commit de cierre
```

---

## 🟥 Estado: `[ ] Pendiente`

---

# FASE 1.1 — Teoría: Qué son los Documentos Fuente

## ¿Qué es un Documento Fuente y por qué es la base de todo?

Un **Documento Fuente** es la evidencia física o digital que respalda una transacción económica. Es el "papel" (o archivo digital) que dice: *"aquí pasó algo que afecta las finanzas de la empresa"*.

```text
📄 Factura de compra      → "Compramos mercancía"
📄 Factura de venta       → "Vendimos mercancía"
📄 Recibo de caja         → "Entró dinero"
📄 Comprobante de nómina  → "Pagamos salarios"
📄 Nota de entrada        → "Llegó mercancía al almacén"
📄 Extracto bancario      → "El banco movió nuestro dinero"
```

## La regla de oro del ERP

```text
╔══════════════════════════════════════════════════════════╗
║  SIN DOCUMENTO FUENTE → NO HAY ASIENTO CONTABLE        ║
║  SIN ASIENTO CONTABLE → NO HAY ESTADO FINANCIERO        ║
║  SIN ESTADO FINANCIERO → NO HAY CUMPLIMIENTO AL SIN     ║
╚══════════════════════════════════════════════════════════╝
```

## ¿Por qué esto es crítico en Bolivia?

El **Servicio de Impuestos Nacionales (SIN)** exige que toda transacción esté respaldada por un documento válido. En una fiscalización, si no puedes mostrar el documento fuente de un asiento contable, el SIN puede:

- Desconocer el crédito fiscal del IVA (no puedes descontar ese IVA)
- Considerar el gasto como no deducible para el IUE
- Aplicar multas por documentación insuficiente

## Tareas de la Fase 1.1

```text
[x] Crear docs/roadmap/ROADMAP_MODULO_1_DOCUMENTOS_FUENTE.md
    → Este mismo archivo (ya lo estás leyendo).

[x] Crear docs/aprendizaje/01-documentos-fuente.md
    → Explicación teórica para exposición (máximo 2 páginas).
    → Incluir: definición, tipos, regla de oro, por qué importa en Bolivia.
    → 🧠 Mini-Prompt para IA: "Escribe una explicación didáctica de 
      qué son los documentos fuente en contabilidad, adaptada para 
      Bolivia (SIN, Ley 843, Código Tributario). Máximo 500 palabras. 
      Incluye ejemplos concretos: factura de compra, recibo de caja, 
      nota de entrada. Explica la regla 'sin documento no hay asiento'."

[x] Crear docs/aprendizaje/02-tipos-documentos-tabla.md
    → Tabla con los 12 tipos de documentos de la guía original.
    → Columnas: Tipo | Origen | Módulo que lo recibe | Valida
    → 🧠 Mini-Prompt para IA: "Genera una tabla markdown con los 
      tipos de documentos fuente para un ERP boliviano: factura de 
      compra, factura de venta, recibo de caja, comprobante de nómina, 
      nota de entrada/salida, guía de remisión, extracto bancario, 
      orden de producción, acta de activo, nota de crédito/débito, 
      factura de gastos personales, comprobante de retención. 
      Para cada uno indica: origen (quién lo emite), módulo del ERP 
      que lo procesa, y qué validación requiere."
```

---

# FASE 1.2 — Modelo de Datos: Estructura de Cada Tipo de Documento

## ¿Qué hace esta fase?
Define **qué datos tiene cada documento** antes de escribir una sola línea de código. Esto es diseño de datos puro. Si aquí definimos mal los campos, después tendremos que migrar datos o romper el sistema.

## Modelo base (todos los documentos comparten esto)

```javascript
// Estructura base que TODOS los documentos tendrán
const documentoBase = {
  id: "doc-001",                    // Identificador único
  tipo: "FACTURA_COMPRA",           // Tipo de documento (enum)
  numero: "F-2026-001234",          // Número del documento
  fechaEmision: "2026-09-01",       // Fecha de emisión
  fechaRegistro: "2026-09-01",      // Fecha en que entra al sistema
  periodoContable: "2026-09",       // Período al que se asigna
  montoTotal: 5650.00,              // Monto total en Bs
  estado: "PENDIENTE",              // PENDIENTE | VALIDADO | RECHAZADO
  observaciones: "",                // Notas del usuario
  creadoPor: "usuario1",            // Quién lo registró
  creadoEn: "2026-09-01T10:30:00"   // Timestamp ISO
};
```

## Campos específicos por tipo de documento

```javascript
// FACTURA_COMPRA y FACTURA_VENTA agregan:
{
  ...documentoBase,
  nitProveedorCliente: "123456789-1",    // NIT de la contraparte
  razonSocial: "Comercial ABC SRL",      // Nombre de la empresa
  cuf: "B5A3C8D9E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S",  // 43 caracteres
  autorizacionSIN: "1234567890123",      // Número de autorización
  ivaIncluido: true,                      // ¿El IVA está dentro del precio?
  montoNeto: 5000.00,                     // Calculado: total / 1.13
  montoIVA: 650.00,                       // Calculado: total - neto
}

// RECIBO_CAJA agrega:
{
  ...documentoBase,
  origenFondos: "VENTA_CONTADO",          // De dónde vino el dinero
  referenciaBancaria: "",                 // Si aplica
}

// NOTA_ENTRADA / NOTA_SALIDA agrega:
{
  ...documentoBase,
  almacen: "ALMACEN_CENTRAL",             // Qué almacén
  productos: [                             // Lista de productos
    { codigo: "PROD-001", cantidad: 10, costoUnitario: 500.00 }
  ],
  motivo: "COMPRA_PROVEEDOR",             // Por qué entra/sale
}

// COMPROBANTE_NOMINA agrega:
{
  ...documentoBase,
  empleadoId: "emp-001",                  // ID del empleado
  periodoNomina: "2026-09",               // Mes de la nómina
  devengados: 5000.00,
  deducciones: 1250.00,
  netoPagado: 3750.00,
}
```

## Tareas de la Fase 1.2

```text
[x] Crear js/config/tipos-documentos.js
    → Exportar constante TIPOS_DOCUMENTO con todos los tipos:
      - FACTURA_COMPRA
      - FACTURA_VENTA
      - NOTA_CREDITO
      - NOTA_DEBITO
      - RECIBO_CAJA
      - COMPROBANTE_NOMINA
      - NOTA_ENTRADA
      - NOTA_SALIDA
      - GUIA_REMISION
      - EXTRACTO_BANCARIO
      - ORDEN_PRODUCCION
      - ACTA_COMPRA_ACTIVO
      - FACTURA_GASTOS_PERSONALES
      - COMPROBANTE_RETENCION
    → 🧠 Mini-Prompt para IA: "Genera un objeto JavaScript que exporte 
      una constante TIPOS_DOCUMENTO con todos los tipos de documentos 
      fuente de un ERP boliviano. Cada tipo debe tener: codigo, nombre, 
      descripcion, camposRequeridos (array), y validacionesEspeciales."

[x] Crear js/config/campos-documentos.js
    → Para cada tipo de documento, definir qué campos requiere.
    → Ejemplo: FACTURA_COMPRA requiere: nitProveedorCliente, cuf, 
      autorizacionSIN, montoTotal, fechaEmision
    → 🧠 Mini-Prompt para IA: "Genera un objeto JavaScript que mapee 
      cada tipo de documento fuente (factura compra, factura venta, 
      recibo caja, nota entrada, etc.) con sus campos requeridos 
      específicos. Incluye validación condicional: si tipo es FACTURA, 
      requiere CUF; si es NOTA_ENTRADA, requiere lista de productos."

[x] Crear docs/aprendizaje/03-modelo-datos-documentos.md
    → Explicar por qué se eligió esta estructura.
    → Mostrar diagrama de cómo se relacionan los campos.
    → 🧠 Mini-Prompt para IA: "Explica de forma didáctica por qué 
      un ERP necesita un modelo de datos estructurado para los 
      documentos fuente. Usa como ejemplo una factura de compra 
      boliviana con NIT, CUF, IVA incluido. Explica qué pasa si 
      no validamos estos campos antes de guardar."
```

---

# FASE 1.3 — js/capas/capa1-documentos.js: Registro y Validación

## ¿Qué hace esta fase?
Aquí vive la **lógica principal de la Capa 1**. Es el archivo que recibe documentos, los valida, y los guarda. Es el "portero" del ERP: si un documento no pasa por aquí, no entra al sistema.

## Arquitectura del archivo

```text
js/capas/capa1-documentos.js
│
├── Clase CapaDocumentos
│   ├── registrarDocumento(datos)      ← Punto de entrada
│   ├── validarDocumento(datos)        ← Valida antes de guardar
│   ├── validarNIT(nit)                ← Algoritmo módulo 11
│   ├── validarCUF(cuf)                ← Estructura de 43 caracteres
│   ├── validarFechas(datos)           ← Período contable abierto
│   ├── validarDuplicado(datos)        ← No repetir documentos
│   ├── guardarDocumento(datos)        ← Persiste en localStorage
│   ├── obtenerDocumentos(filtros)     ← Lista documentos
│   ├── obtenerDocumentoPorId(id)      ← Busca uno específico
│   └── cambiarEstado(id, nuevoEstado) ← PENDIENTE → VALIDADO
│
└── Exportación al objeto window para las vistas
```

## Tareas de la Fase 1.3

```text
[x] Crear el archivo js/capas/capa1-documentos.js
    → Estructura de clase ES6 con todos los métodos listados arriba.
    → Por ahora, los métodos de validación pueden devolver true (stub).
    → El método guardarDocumento usa window.Almacenamiento.guardar().

[x] Implementar registrarDocumento(datos)
    → Recibe un objeto con los datos del documento.
    → Genera un id único con crypto.randomUUID() o Date.now().
    → Asigna estado inicial: "PENDIENTE".
    → Asigna periodoContable basado en fechaEmision.
    → Llama a validarDocumento() antes de guardar.
    → Si valida OK → guardarDocumento().
    → Si falla → devuelve error descriptivo.
    → 🧠 Mini-Prompt para IA: "Escribe el método registrarDocumento 
      de una clase JS para un ERP boliviano. Debe: generar ID único, 
      asignar período contable según fecha de emisión, validar antes 
      de guardar, y devolver un objeto { exito: boolean, mensaje: string, 
      documento: object }. Usa localStorage para persistencia."

[x] Implementar obtenerDocumentos(filtros)
    → Recibe filtros opcionales: { tipo, estado, periodoContable }.
    → Devuelve array de documentos filtrados.
    → Ordenados por fechaRegistro descendente.

[x] Implementar obtenerDocumentoPorId(id)
    → Busca en localStorage por id.
    → Devuelve el documento o null si no existe.

[x] Implementar cambiarEstado(id, nuevoEstado)
    → Estados válidos: PENDIENTE, VALIDADO, RECHAZADO.
    → Registra quién y cuándo cambió el estado.
    → 🧠 Mini-Prompt para IA: "Escribe un método cambiarEstado en JS 
      que actualice el estado de un documento en localStorage. Los 
      estados válidos son PENDIENTE, VALIDADO, RECHAZADO. Debe registrar 
      historial de cambios (quién, cuándo, de qué estado a cuál)."

[x] Exponer la clase al objeto window
    → En app.js: window.CapaDocumentos = new CapaDocumentos()
    → Esto permite que las vistas HTML usen: 
      window.CapaDocumentos.registrarDocumento({...})
```

---

# FASE 1.4 — Vista de Registro de Documentos (Formulario + Tabla)

## ¿Qué hace esta fase?
Construye la **interfaz visual** donde el usuario registra documentos. Es la primera pantalla "real" del ERP que el usuario ve. Aquí se materializa la teoría: el usuario llena un formulario, hace clic en "Registrar", y el documento entra al sistema.

## Estructura de la vista

```text
vistas/documentos.html
│
├── <h1> Documentos Fuente
├── <div class="acciones">
│   ├── <button> Nuevo Documento
│   ├── <select> Filtrar por tipo
│   └── <select> Filtrar por estado
│
├── <div id="formulario-documento" class="oculto">
│   ├── <select> Tipo de documento
│   ├── <input> Número de documento
│   ├── <input> Fecha de emisión
│   ├── <input> NIT (si aplica)
│   ├── <input> CUF (si aplica)
│   ├── <input> Monto total
│   ├── <textarea> Observaciones
│   └── <button> Registrar
│
├── <table id="tabla-documentos">
│   ├── <thead> (Tipo, Número, Fecha, Monto, Estado, Acciones)
│   └── <tbody> (filas dinámicas)
│
└── <div id="mensaje-error" class="oculto">
```

## Tareas de la Fase 1.4

```text
[x] Crear vistas/documentos.html
    → Estructura semántica HTML5.
    → Formulario con campos que aparecen según el tipo de documento.
    → Tabla para listar documentos registrados.
    → Botones de acción: Nuevo, Filtrar, Registrar.

[x] Agregar estilos en css/componentes.css
    → Estilos para el formulario (form-group, form-input).
    → Estilos para la tabla (tabla, tabla-fila, tabla-celda).
    → Estilos para badges de estado (PENDIENTE=amarillo, 
      VALIDADO=verde, RECHAZADO=rojo).
    → 🧠 Mini-Prompt para IA: "Genera CSS para un formulario de 
      registro de documentos contables con campos que se muestran/
      ocultan según el tipo seleccionado. Incluye estilos para badges 
      de estado (pendiente, validado, rechazado) con colores 
      semánticos. Usa variables CSS de una paleta boliviana."

[ ] Crear js/vistas/documentos-vista.js
    → Lógica específica de esta vista (separada de la capa).
    → Funcion mostrarFormulario(): toggle visibility.
    → Funcion cargarTabla(documentos): renderiza filas.
    → Funcion manejarSubmit(): llama a window.CapaDocumentos.registrarDocumento().
    → Funcion manejarFiltros(): filtra la tabla sin recargar.

[ ] Conectar el formulario con la Capa 1
    → Al hacer clic en "Registrar":
      1. Leer valores del formulario.
      2. Construir objeto documento según tipo.
      3. Llamar window.CapaDocumentos.registrarDocumento(documento).
      4. Si éxito: mostrar toast verde, limpiar formulario, refrescar tabla.
      5. Si error: mostrar toast rojo con mensaje específico.

[ ] Agregar enlace en el menú lateral
    → En index.html, agregar: <a href="#/documentos">📄 Documentos</a>
    → El enrutador debe poder cargar vistas/documentos.html.
```

---

# FASE 1.5 — Validaciones Bolivianas (NIT, CUF, Períodos)

## ¿Qué hace esta fase?
Implementa las **validaciones específicas de Bolivia**. Esto es lo que diferencia un ERP genérico de uno adaptado a la legislación boliviana. Sin estas validaciones, el SIN rechazaría los documentos en una fiscalización.

## Validación del NIT (Número de Identificación Tributaria)

```text
Formato: 123456789-1
         ├────────┤ ├─ Dígito verificador
         └─ 8-9 dígitos base

Algoritmo (módulo 11 con pesos cíclicos 2-9):
1. Tomar los dígitos base (sin el guión ni el verificador)
2. Multiplicar cada dígito por pesos: 2, 3, 4, 5, 6, 7, 8, 9, 2, 3...
3. Sumar todos los productos
4. Calcular: residuo = suma % 11
5. Dígito verificador = 11 - residuo
6. Si resultado es 10 → usar 0; si es 11 → usar 0
```

## Validación del CUF (Código Único de Factura)

```text
Estructura: 43 caracteres alfanuméricos
B5A3C8D9E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S
├──┤├──────────────────────────────────┤
NIT    Código único generado por el SIN

Validación básica:
- Longitud exacta: 43 caracteres
- Solo caracteres alfanuméricos [A-Z0-9]
- Los primeros caracteres deben corresponder a un NIT válido
```

## Validación del Período Contable

```text
Regla: Un documento solo puede registrarse en un período contable abierto.
Período contable: formato "AAAA-MM" (ej: "2026-09")

Validaciones:
1. La fechaEmision debe estar dentro del período actual o anterior.
2. El período no puede estar "cerrado" (ya se hizo el cierre mensual).
3. No se permiten fechas futuras (salvo excepciones configurables).
```

## Tareas de la Fase 1.5

```text
[ ] Implementar validarNIT(nit) en validadores.js
    → Remover guión y espacios.
    → Aplicar algoritmo módulo 11 con pesos 2-9 cíclicos.
    → Devolver true si el dígito verificador coincide.
    → 🧠 Mini-Prompt para IA: "Implementa en JavaScript el algoritmo 
      de validación del NIT boliviano. El NIT tiene formato 
      123456789-1. El dígito verificador se calcula con módulo 11 
      usando pesos cíclicos del 2 al 9. Devuelve true/false. 
      Incluye ejemplos de NITs válidos e inválidos para probar."

[ ] Implementar validarCUF(cuf) en validadores.js
    → Verificar longitud exacta de 43 caracteres.
    → Verificar que solo contiene [A-Z0-9].
    → Extraer los primeros caracteres y validar que sean un NIT válido.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS para validar 
      un CUF (Código Único de Factura) del sistema SIAT boliviano. 
      El CUF tiene 43 caracteres alfanuméricos. Valida longitud, 
      caracteres permitidos, y que los primeros dígitos correspondan 
      a un NIT válido. Devuelve objeto { valido, errores[] }."

[ ] Implementar validarPeriodoContable(fechaEmision) en capa1-documentos.js
    → Convertir fechaEmision a formato "AAAA-MM".
    → Verificar que el período esté abierto.
    → Verificar que no sea una fecha futura.
    → Devolver true/false con mensaje explicativo.

[ ] Implementar validarDuplicado(datos) en capa1-documentos.js
    → Buscar si ya existe un documento con el mismo:
      tipo + numero + nitProveedorCliente (para facturas)
      tipo + numero (para otros documentos)
    → Si existe → devolver error: "Documento duplicado: ya se 
      registró con el número X para el NIT Y".

[ ] Integrar todas las validaciones en validarDocumento()
    → Ejecutar en orden: NIT → CUF → Período → Duplicado.
    → Si alguna falla, detener y devolver el error específico.
    → Si todas pasan, devolver { valido: true }.
```

---

# FASE 1.6 — Vinculación Documento → Período Contable

## ¿Qué hace esta fase?
Asigna automáticamente cada documento a un **período contable** (mes/año). Esto es crítico porque el SIN exige declaraciones mensuales (Form. 200, Form. 400) por período. Un documento de septiembre no puede aparecer en la declaración de octubre.

## Lógica de asignación

```text
Documento registrado el 15/09/2026:
├── fechaEmision: "2026-09-15"
├── periodoContable: "2026-09"  ← Se deriva de la fecha de emisión
└── declaraciónCorresponde: "Form. 200 de septiembre 2026"

⚠️ Excepción: Si la factura es del 31/08 pero se registra el 02/09,
   el período contable sigue siendo "2026-08" (fecha de emisión manda).
```

## Tareas de la Fase 1.6

```text
[ ] Implementar asignarPeriodoContable(fechaEmision)
    → Extraer año y mes de la fecha.
    → Devolver string "AAAA-MM".
    → Ejemplo: "2026-09-15" → "2026-09"

[ ] Crear js/config/periodos-contables.js
    → Objeto que trackea qué períodos están abiertos/cerrados.
    → Por defecto: solo el mes actual está abierto.
    → Función abrirPeriodo(aaaaMM) para contadores admin.
    → Función cerrarPeriodo(aaaaMM) para cierre mensual.

[ ] Agregar campo periodoContable al modelo de documento
    → Se calcula automáticamente al registrar.
    → Se muestra en la tabla de documentos.
    → Se usa como filtro en la vista.

[ ] Implementar filtro por período en la vista
    → <select> con los últimos 12 meses.
    → Al seleccionar, filtra la tabla de documentos.
    → Muestra un contador: "X documentos en este período".
```

---

# FASE 1.7 — Smoke Test Final y Commit de Cierre

## Checklist de humo (smoke test)

```text
[ ] Smoke test #1: Registrar una factura de compra válida
    → Abrir vistas/documentos.html
    → Seleccionar tipo: FACTURA_COMPRA
    → Llenar: NIT "123456789-1", CUF de 43 chars, monto 5650
    → Hacer clic en "Registrar"
    → Debe mostrar toast verde y aparecer en la tabla

[ ] Smoke test #2: Rechazar un documento con NIT inválido
    → Intentar registrar con NIT "999999999-9" (verificador incorrecto)
    → Debe mostrar toast rojo: "NIT inválido: dígito verificador incorrecto"
    → El documento NO debe guardarse

[ ] Smoke test #3: Rechazar un documento duplicado
    → Registrar el mismo documento dos veces (mismo tipo + número + NIT)
    → Segunda vez debe mostrar: "Documento duplicado"
    → Solo debe aparecer una vez en la tabla

[ ] Smoke test #4: Filtrar por período contable
    → Registrar documentos en meses distintos
    → Seleccionar un mes en el filtro
    → Solo deben mostrarse los documentos de ese mes

[ ] Smoke test #5: Persistencia en localStorage
    → Registrar un documento
    → Recargar la página (F5)
    → El documento debe seguir apareciendo en la tabla
    → Abrir DevTools → Application → LocalStorage
    → Debe existir la colección "documentos"

[ ] Smoke test #6: El menú lateral incluye Documentos
    → Verificar que hay un enlace "📄 Documentos" en el aside
    → Al hacer clic, carga vistas/documentos.html correctamente

[ ] Commit de cierre del Módulo 1
    → git add .
    → git commit -m "feat(modulo-1): Capa 1 - Documentos Fuente completo
    
      - Modelo de datos para 14 tipos de documentos fuente
      - Validaciones bolivianas: NIT (módulo 11), CUF (43 chars)
      - Asignación automática de período contable
      - Vista de registro con formulario dinámico y tabla
      - Persistencia en localStorage
      - Smoke test: todos los tests pasan
      
      Próximo paso: Módulo 2 - Compras y Ventas (Capa 2)"
```

---

## 🎯 Criterios de Aceptación del Módulo 1

El Módulo 1 se considera **completado** cuando:

- [x] Se pueden registrar documentos de al menos 3 tipos distintos
- [x] La validación de NIT rechaza dígitos verificadores incorrectos
- [x] La validación de CUF rechaza códigos con longitud incorrecta
- [x] No se pueden registrar documentos duplicados
- [x] Los documentos se asignan al período contable correcto
- [x] Los datos persisten después de recargar la página
- [x] La vista tiene feedback visual claro (toast verde/rojo)
- [x] Se puede explicar en 3 minutos cómo funciona la Capa 1

---

## 📚 Material de Exposición Generado en Este Módulo

Al finalizar, tendrás estos documentos en `docs/aprendizaje/`:

| Archivo | Contenido | Uso en exposición |
|---|---|---|
| `01-documentos-fuente.md` | Teoría de documentos fuente | Abrir la explicación |
| `02-tipos-documentos-tabla.md` | Tabla de 14 tipos | Mostrar la variedad |
| `03-modelo-datos-documentos.md` | Estructura de datos | Explicar el diseño |

---

## 🚀 Próximos Módulos (adelanto)

Una vez completado el Módulo 1, estos son los siguientes:

| Módulo | Tema | Duración | Depende de |
|---|---|---|---|
| **Módulo 2** | Capa 2 — Compras y Ventas (IVA, IT) | 6–8 h | Módulo 1 |
| **Módulo 3** | Capa 3 — Motor Contable (Partida Doble) | 8–10 h | Módulo 2 |
| **Módulo 4** | Capa 2 — Nómina Boliviana | 6–8 h | Módulo 3 |
| **Módulo 5** | Capa 2 — Impuestos (IVA, IT, IUE) | 6–8 h | Módulo 3 |
| **Módulo 6** | Capa 4 — Estados Financieros | 5–7 h | Módulo 5 |
| **Módulo 7** | Capa 5 — Cumplimiento SIN | 4–6 h | Módulo 6 |
| **Módulo 8** | Migración a SaaS real (opcional) | 10–15 h | Módulo 7 |

---

## ⚠️ Advertencia final

La tentación aquí es saltar las validaciones y decir *"total, es un prototipo"*. **No lo hagas.** Las validaciones de NIT y CUF son exactamente lo que hace que un ERP boliviano sea diferente de un ERP genérico. En una exposición, poder decir *"este sistema rechaza NITs con dígito verificador incorrecto usando el algoritmo oficial del SIN"* es lo que demuestra que entendiste el dominio, no solo la tecnología. Dedica tiempo a que las validaciones funcionen perfectamente — son tu credibilidad.

---

**¿Siguiente paso?** Cuando completes este Módulo 1, avísame y generamos el **ROADMAP_MODULO_2_COMPRAS_VENTAS.md** con el mismo formato. 🚀
