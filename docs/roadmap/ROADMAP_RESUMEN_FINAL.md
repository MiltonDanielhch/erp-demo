# 📁 ROADMAP_RESUMEN_FINAL.md

**Proyecto:** ERP Contable Integral Boliviano (Prototipo Educativo / Portafolio / SaaS)
**Versión:** 1.0.0 · **Formato:** Documento Maestro de Referencia
**Propósito:** Consolidación completa del proyecto para ejecución, exposición y consulta rápida

---

## 🎯 Visión del Proyecto

```text
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║  Construir un ERP Contable adaptado a la legislación            ║
║  boliviana (Ley 843, NC del CTNAC, LGT, SIN) que:               ║
║                                                                  ║
║  1. Enseñe contabilidad y tributación boliviana                 ║
║  2. Sirva como portafolio profesional                           ║
║  3. Pueda evolucionar a un SaaS comercial                       ║
║  4. Demuestre dominio técnico + dominio de negocio              ║
║                                                                  ║
║  Stack: HTML + CSS + JavaScript Vanilla + LocalStorage          ║
║  (Prototipo educativo → SaaS opcional en Módulo 8)              ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 📊 Resumen Ejecutivo de Módulos

| # | Módulo | Tema | Duración | Bloquea | Estado |
|---|---|---|---|---|---|
| 0 | Setup | Estructura, Git, núcleo JS, configuración | 4–6 h | Todos | `[ ]` |
| 1 | Documentos Fuente | Capa 1: registro y validación de documentos | 4–6 h | Mód. 2–8 | `[ ]` |
| 2 | Compras y Ventas | Ciclos completos, IVA ÷1.13, IT ×3%, kardex | 6–8 h | Mód. 3–8 | `[ ]` |
| 3 | Motor Contable | Partida doble, diario, mayor, balanza, ajustes, cierre | 8–10 h | Mód. 4–8 | `[ ]` |
| 4 | Nómina Boliviana | Aguinaldo, bono antigüedad, indemnización, RC-IVA | 6–8 h | Mód. 5–8 | `[ ]` |
| 5 | Impuestos | IVA, IT, IUE, compensación Art. 77, retenciones | 6–8 h | Mód. 6–8 | `[ ]` |
| 6 | Estados Financieros | Balance, resultados, flujo, notas, ratios | 5–7 h | Mód. 7–8 | `[ ]` |
| 7 | Cumplimiento SIN | Formularios, LCV, calendario, SIAT, Fundempresa | 4–6 h | Mód. 8 | `[ ]` |
| 8 | Migración SaaS *(opcional)* | Backend, DB, auth, multi-empresa, Docker | 10–15 h | Nada | `[ ]` |
| | | **TOTAL** | **53–74 h** | | |

---

## 🗺️ Orden de Ejecución (Diagrama de Dependencias)

```text
Módulo 0 (Setup)
    │
    ├──▶ Módulo 1 (Documentos Fuente)
    │       │
    │       ├──▶ Módulo 2 (Compras y Ventas)
    │       │       │
    │       │       ├──▶ Módulo 3 (Motor Contable)
    │       │       │       │
    │       │       │       ├──▶ Módulo 4 (Nómina Boliviana)
    │       │       │       │       │
    │       │       │       │       └──▶ Módulo 5 (Impuestos)
    │       │       │       │               │
    │       │       │       │               └──▶ Módulo 6 (Estados Financieros)
    │       │       │       │                       │
    │       │       │       │                       └──▶ Módulo 7 (Cumplimiento SIN)
    │       │       │       │                               │
    │       │       │       │                               └──▶ Módulo 8 (SaaS) [OPCIONAL]
    │       │       │       │
    │       │       │       └──▶ Módulo 5 (Impuestos) [también depende de Mód. 3]
    │       │       │
    │       │       └──▶ Módulo 3 (Motor Contable) [recibe asientos de Mód. 2]
    │       │
    │       └──▶ Módulo 2 (Compras y Ventas) [usa documentos de Mód. 1]
    │
    └──▶ Todos los módulos dependen del Setup
```

---

## 📁 Estructura Completa del Proyecto

```text
erp-contable-bo/
│
├── 📄 index.html                          ← Punto de entrada
├── 📄 README.md                           ← Documentación principal
├── 📄 .gitignore                          ← Archivos ignorados por Git
├── 📄 .editorconfig                       ← Reglas de formato
│
├── 📁 css/
│   ├── estilos.css                        ← Estilos globales + paleta boliviana
│   ├── componentes.css                    ← Botones, tarjetas, tablas, formularios
│   ├── dashboard.css                      ← Panel principal
│   └── reportes.css                       ← Impresión de estados financieros
│
├── 📁 js/
│   ├── app.js                             ← Arranque + router + conexión módulos
│   │
│   ├── 📁 nucleo/                         ← Funciones base (todo el sistema las usa)
│   │   ├── enrutador.js                   ← Navegación SPA sin recargar
│   │   ├── almacenamiento.js              ← LocalStorage como "base de datos"
│   │   ├── utilidades.js                  ← formatearBs(), calcularIVA(), etc.
│   │   └── validadores.js                 ← validarNIT(), validarCUF(), etc.
│   │
│   ├── 📁 config/                         ← Parámetros bolivianos (¡clave!)
│   │   ├── bolivia.js                     ← IVA 13%, IT 3%, IUE 25%, SMN, zona horaria
│   │   ├── plan-cuentas.js                ← Árbol del plan contable (1-5)
│   │   ├── tipos-documentos.js            ← 14 tipos de documentos fuente
│   │   ├── tabla-bono-antiguedad.js       ← Tramos del bono (5% a 50%)
│   │   ├── regimenes-tributarios.js       ← RG, RTS, STI, RAU, SIETE-RG
│   │   └── periodos-fiscales.js           ← Gestión de períodos contables
│   │
│   ├── 📁 capas/                          ← Las 5 capas del ERP
│   │   ├── capa1-documentos.js            ← Capa 1: Registro y validación
│   │   ├── capa2-modulos.js               ← Capa 2: Orquestación de módulos
│   │   ├── capa3-motor.js                 ← Capa 3: Motor contable (partida doble)
│   │   ├── capa4-estados.js               ← Capa 4: Estados financieros
│   │   └── capa5-cumplimiento.js          ← Capa 5: Reportería al SIN
│   │
│   ├── 📁 modulos/                        ← Módulos operativos específicos
│   │   ├── compras.js                     ← Ciclo de compras (5 pasos)
│   │   ├── ventas.js                      ← Ciclo de ventas (5 pasos)
│   │   ├── inventario.js                  ← Kardex valorado (promedio ponderado)
│   │   ├── nomina.js                      ← Nómina boliviana completa
│   │   ├── impuestos.js                   ← IVA, IT, IUE, RC-IVA, retenciones
│   │   ├── facturacion.js                 ← Facturación electrónica (CUIS, CUFD, CUF)
│   │   ├── tesoreria.js                   ← Cajas, bancos, conciliación
│   │   ├── activos-fijos.js               ← Activos + depreciación
│   │   ├── calendario-tributario.js       ← Vencimientos según dígito NIT
│   │   ├── catalogo-empleados.js          ← CRUD de empleados
│   │   ├── catalogo-clientes.js           ← CRUD de clientes (o en catalogos.js)
│   │   ├── catalogo-proveedores.js        ← CRUD de proveedores
│   │   ├── catalogo-productos.js          ← CRUD de productos
│   │   ├── generador-asientos.js          ← Genera asientos desde módulos
│   │   ├── lcv.js                         ← Libro de Compras y Ventas
│   │   └── fundempresa.js                 ← Obligaciones societarias
│   │
│   └── 📁 vistas/                         ← Lógica específica de cada vista
│       ├── dashboard-vista.js
│       ├── documentos-vista.js
│       ├── compras-vista.js
│       ├── ventas-vista.js
│       ├── nomina-vista.js
│       ├── impuestos-vista.js
│       ├── estados-vista.js
│       ├── cumplimiento-vista.js
│       └── motor-vista.js
│
├── 📁 vistas/                             ← HTML de cada pantalla
│   ├── dashboard.html
│   ├── documentos.html
│   ├── compras.html
│   ├── ventas.html
│   ├── inventario.html
│   ├── nomina.html
│   ├── impuestos.html
│   ├── estados-financieros.html
│   ├── cumplimiento.html
│   ├── empleados.html
│   ├── catalogos.html
│   ├── libro-diario.html
│   ├── libro-mayor.html
│   ├── balanza-comprobacion.html
│   ├── asientos.html
│   └── lcv.html
│
├── 📁 datos/
│   └── ejemplo.json                       ← Empresa ficticia precargada
│
└── 📁 docs/
    ├── 📁 roadmap/                        ← Estos archivos ROADMAP_*.md
    │   ├── ROADMAP_MODULO_0_SETUP.md
    │   ├── ROADMAP_MODULO_1_DOCUMENTOS_FUENTE.md
    │   ├── ROADMAP_MODULO_2_COMPRAS_VENTAS.md
    │   ├── ROADMAP_MODULO_3_MOTOR_CONTABLE.md
    │   ├── ROADMAP_MODULO_4_NOMINA_BOLIVIANA.md
    │   ├── ROADMAP_MODULO_5_IMPUESTOS.md
    │   ├── ROADMAP_MODULO_6_ESTADOS_FINANCIEROS.md
    │   ├── ROADMAP_MODULO_7_CUMPLIMIENTO_SIN.md
    │   ├── ROADMAP_MODULO_8_MIGRACION_SAAS.md
    │   └── ROADMAP_RESUMEN_FINAL.md       ← Este archivo
    │
    ├── 📁 aprendizaje/                    ← Material didáctico (29 documentos)
    │   ├── 01-documentos-fuente.md
    │   ├── 02-tipos-documentos-tabla.md
    │   ├── 03-modelo-datos-documentos.md
    │   ├── 04-ciclo-compra-venta.md
    │   ├── 05-iva-boliviano-explicado.md
    │   ├── 06-funciones-iva-it.md
    │   ├── 07-partida-doble-explicada.md
    │   ├── 08-ciclo-contable-pasos.md
    │   ├── 09-cuentas-naturaleza.md
    │   ├── 10-estructura-asiento.md
    │   ├── 11-provisiones-bolivianas.md
    │   ├── 12-cierre-ejercicio.md
    │   ├── 13-nomina-boliviana-explicada.md
    │   ├── 14-particularidades-bolivianas.md
    │   ├── 15-bono-antiguedad-explicado.md
    │   ├── 16-indemnizacion-boliviana.md
    │   ├── 17-impuestos-bolivianos-explicados.md
    │   ├── 18-calendario-tributario.md
    │   ├── 19-compensacion-it-iue.md
    │   ├── 20-compensacion-it-iue-ejemplos.md
    │   ├── 21-estados-financieros-explicados.md
    │   ├── 22-normas-contables-bolivianas.md
    │   ├── 23-ufv-inflacion-suspendida.md
    │   ├── 24-cumplimiento-sin-explicado.md
    │   ├── 25-formularios-sin-detallados.md
    │   ├── 26-consecuencias-incumplimiento.md
    │   ├── 27-calendario-tributario-completo.md
    │   ├── 28-migracion-saas-explicada.md
    │   └── 29-arquitectura-saas-detalle.md
    │
    ├── 📁 adr/                            ← Architecture Decision Records (7)
    │   ├── ADR-001-stack-vanilla-sin-backend.md
    │   ├── ADR-002-normas-contables-bolivianas.md
    │   ├── ADR-003-backend-node-express.md
    │   ├── ADR-004-base-datos-postgresql.md
    │   ├── ADR-005-autenticacion-jwt.md
    │   ├── ADR-006-multi-empresa-multi-nit.md
    │   └── ADR-007-integracion-sin-api.md
    │
    ├── glosario.md                        ← Términos contables bolivianos
    ├── guia-aprendizaje.md                ← Guía general de estudio
    └── diagrama-flujo.md                  ← Diagramas de flujo entre módulos
```

---

## 🇧🇴 Constantes Bolivianas del Sistema

Estas son las constantes que viven en `js/config/bolivia.js` y que **todo el sistema usa**:

```javascript
const BOLIVIA = {
  // Impuestos
  IVA_PORCENTAJE: 13,
  IT_PORCENTAJE: 3,
  IUE_PORCENTAJE: 25,
  RC_IVA_PORCENTAJE: 13,
  IUE_BE_PORCENTAJE_EFECTIVO: 12.5,  // 25% sobre base presunta del 50%
  
  // Factor IVA
  FACTOR_IVA_DENTRO: 1.13,           // Total ÷ 1.13 = Neto
  FACTOR_IVA_FUERA: 0.13,            // Neto × 0.13 = IVA (futuro Ley 1733)
  
  // Salario Mínimo Nacional (verificar vigencia)
  SMN_VIGENTE: 2500,                  // Bs - actualizar anualmente
  
  // Moneda y zona horaria
  MONEDA: "BOB",
  SIMBOLO_MONEDA: "Bs",
  ZONA_HORARIA: "America/La_Paz",
  
  // Formatos
  FORMATO_FECHA: "DD/MM/AAAA",
  FORMATO_MONTA: "#.##0,00",         // Bs 1.234,56
  
  // Regímenes tributarios
  REGIMENES: ["RG", "RTS", "STI", "RAU", "SIETE-RG"],
  
  // Aportes laborales
  APORTE_LABORAL_AFP: 0.10,           // 10% del total devengado
  APORTE_PATRONAL_SALUD: 0.10,        // ~10% del total devengado
  APORTE_PATRONAL_AFP: 0.10,          // ~10% del total devengado
  APORTE_RIESGO_LABORAL: 0.02,        // ~2% (varía por actividad)
  
  // Vacaciones (días hábiles)
  VACACIONES: {
    "1-5": 15,
    "5-10": 20,
    "10+": 30
  },
  
  // Aguinaldo
  AGUINALDO_FECHA_LIMITE: "12-20",    // 20 de diciembre
  SEGUNDO_AGUINALDO_UMBRAL_PIB: 4.5,  // % de crecimiento del PIB
  
  // Indemnización
  INDEMNIZACION_MINIMO_DIAS: 90,      // Aplica desde 90 días
  INDEMNIZACION_APLICA_RENUNCIA: true, // DS 28699
  
  // Desahucio
  DESAHUCIO_MESES: 3,                 // 3 meses de salario
  DESAHUCIO_PREAVISO_DIAS: 90,        // Si no avisa con 90 días
  
  // IUE
  IUE_PLAZO_DIAS: 120,                // 120 días tras cierre de gestión
  
  // UFV (ajuste por inflación)
  UFV_SUSPENDIDO: true,               // Suspendido desde dic/2020
  UFV_FECHA_SUSPENSION: "2020-12-10"
};
```

---

## 📋 Checklist de Exposición

Si vas a exponer el prototipo, esta es la secuencia recomendada:

### 🎤 Apertura (2 minutos)

```text
[ ] "Este es un ERP Contable adaptado a la legislación boliviana."
[ ] "No es un ERP genérico traducido: fue diseñado desde cero 
     para Bolivia, con la Ley 843, las NC del CTNAC, y la LGT."
[ ] "Voy a mostrar cómo una sola transacción de compra viaja 
     por todo el sistema: desde el documento fuente hasta 
     el estado financiero."
```

### 📄 Demostración de Trazabilidad (5 minutos)

```text
[ ] Abrir vistas/documentos.html
    → "Aquí registramos una factura de compra con NIT y CUF."
    → Mostrar la validación del NIT (algoritmo módulo 11).
    → Mostrar la validación del CUF (43 caracteres).

[ ] Abrir vistas/compras.html
    → "Esta factura entra al ciclo de compras."
    → Mostrar cómo se calcula el IVA: 5,650 ÷ 1.13 = 5,000 neto.
    → Mostrar cómo se genera el asiento contable automáticamente.

[ ] Abrir vistas/libro-diario.html
    → "El asiento aparece en el Libro Diario."
    → Mostrar las líneas: Inventario (Debe), IVA CF (Debe), Proveedores (Haber).
    → Verificar que Debe = Haber.

[ ] Abrir vistas/libro-mayor.html
    → "Y se clasifica en el Libro Mayor por cuenta."
    → Mostrar la cuenta Inventario con sus movimientos.

[ ] Abrir vistas/balanza-comprobacion.html
    → "La Balanza de Comprobación verifica que todo cuadra."
    → Mostrar el indicador ✓ verde.

[ ] Abrir vistas/estados-financieros.html
    → "Y finalmente, llega al Estado de Resultados y al Balance General."
    → Mostrar cómo la compra afecta la utilidad y el activo.

[ ] "Esa es la trazabilidad completa: documento → asiento → mayor → 
     balanza → estado financiero. En Excel, esto tomaría 4 registros 
     manuales. Aquí es una sola transacción."
```

### 🇧🇴 Particularidades Bolivianas (5 minutos)

```text
[ ] Abrir vistas/nomina.html
    → "La nómina boliviana tiene 5 particularidades únicas:"
    → 1. Aguinaldo de Navidad obligatorio.
    → 2. Segundo aguinaldo condicional al PIB (DS 1802).
    → 3. Bono de antigüedad sobre 3 SMN, no sobre el salario real.
    → 4. Indemnización aplicable a RENUNCIA voluntaria (DS 28699).
    → 5. RC-IVA compensable con facturas de gastos personales.

[ ] Abrir vistas/impuestos.html
    → "El sistema tributario boliviano tiene una regla que muchos 
       sistemas genéricos no implementan:"
    → La compensación IT-IUE (Art. 77 Ley 843).
    → Mostrar cómo el IT pagado mes a mes se acumula.
    → Mostrar cómo se descuenta del IUE anual.
    → Mostrar la advertencia si el IT supera el IUE (exceso se pierde).

[ ] Abrir vistas/cumplimiento.html
    → "El ERP genera automáticamente los formularios del SIN:"
    → Form. 200 (IVA), Form. 400 (IT), Form. 500 (IUE).
    → Mostrar el calendario de vencimientos según dígito del NIT.
    → Mostrar el LCV conciliado con el Form. 200.
```

### 🏗️ Arquitectura Técnica (3 minutos)

```text
[ ] Mostrar la estructura de carpetas
    → "Cada carpeta corresponde a un concepto del ERP."
    → js/capas/ = las 5 capas del ERP.
    → js/config/ = la ley boliviana traducida a código.
    → js/modulos/ = los módulos operativos.

[ ] Mostrar js/config/bolivia.js
    → "Aquí viven todas las constantes bolivianas."
    → "Si mañana el SIN cambia el IVA del 13% al 15%, 
       solo tocamos este archivo."

[ ] Mostrar js/capas/capa3-motor.js
    → "Aquí vive la partida doble."
    → "El motor valida que Debe = Haber en cada asiento."
    → "Sin esta validación, la contabilidad se corrompe."

[ ] Mostrar docs/adr/
    → "Cada decisión arquitectónica está documentada."
    → "Si alguien pregunta por qué usamos vanilla JS y no React, 
       la respuesta está en el ADR-001."
```

### 🎓 Cierre (2 minutos)

```text
[ ] "Este prototipo demuestra tres cosas:"
    → 1. Entendimiento del dominio contable boliviano.
    → 2. Capacidad de traducir leyes a código.
    → 3. Arquitectura limpia y escalable.

[ ] "El siguiente paso sería el Módulo 8: migrar a un SaaS real 
     con backend, base de datos, y conexión al SIN."

[ ] "Gracias. ¿Preguntas?"
```

---

## 📚 Índice de Documentos Didácticos

| # | Archivo | Tema | Módulo |
|---|---|---|---|
| 01 | `01-documentos-fuente.md` | Qué son los documentos fuente | 1 |
| 02 | `02-tipos-documentos-tabla.md` | Tabla de 14 tipos de documentos | 1 |
| 03 | `03-modelo-datos-documentos.md` | Estructura de datos | 1 |
| 04 | `04-ciclo-compra-venta.md` | Ciclos de compra y venta | 2 |
| 05 | `05-iva-boliviano-explicado.md` | IVA ÷1.13 y tasa efectiva 14.94% | 2 |
| 06 | `06-funciones-iva-it.md` | Funciones de cálculo IVA e IT | 2 |
| 07 | `07-partida-doble-explicada.md` | Teoría de partida doble | 3 |
| 08 | `08-ciclo-contable-pasos.md` | 6 pasos del ciclo contable | 3 |
| 09 | `09-cuentas-naturaleza.md` | Naturaleza deudora vs acreedora | 3 |
| 10 | `10-estructura-asiento.md` | Estructura del asiento contable | 3 |
| 11 | `11-provisiones-bolivianas.md` | Aguinaldo, bono, indemnización | 3 |
| 12 | `12-cierre-ejercicio.md` | Cierre del ejercicio contable | 3 |
| 13 | `13-nomina-boliviana-explicada.md` | Teoría de la nómina boliviana | 4 |
| 14 | `14-particularidades-bolivianas.md` | 5 particularidades únicas | 4 |
| 15 | `15-bono-antiguedad-explicado.md` | Bono sobre 3 SMN | 4 |
| 16 | `16-indemnizacion-boliviana.md` | Indemnización en renuncia | 4 |
| 17 | `17-impuestos-bolivianos-explicados.md` | Los 5 impuestos principales | 5 |
| 18 | `18-calendario-tributario.md` | Vencimientos por dígito NIT | 5 |
| 19 | `19-compensacion-it-iue.md` | Art. 77 Ley 843 | 5 |
| 20 | `20-compensacion-it-iue-ejemplos.md` | 3 ejemplos numéricos | 5 |
| 21 | `21-estados-financieros-explicados.md` | Los 5 estados financieros | 6 |
| 22 | `22-normas-contables-bolivianas.md` | NC del CTNAC vs NIIF | 6 |
| 23 | `23-ufv-inflacion-suspendida.md` | UFV suspendido desde dic/2020 | 6 |
| 24 | `24-cumplimiento-sin-explicado.md` | Teoría del cumplimiento SIN | 7 |
| 25 | `25-formularios-sin-detallados.md` | Tabla de formularios SIN | 7 |
| 26 | `26-consecuencias-incumplimiento.md` | Multas y sanciones | 7 |
| 27 | `27-calendario-tributario-completo.md` | Calendario anual completo | 7 |
| 28 | `28-migracion-saas-explicada.md` | Por qué migrar a SaaS | 8 |
| 29 | `29-arquitectura-saas-detalle.md` | Arquitectura del SaaS | 8 |

---

## 📐 Índice de ADRs (Architecture Decision Records)

| # | ADR | Decisión | Módulo |
|---|---|---|---|
| 001 | Stack Vanilla sin Backend | Vanilla JS + LocalStorage, sin frameworks pesados | 0 |
| 002 | Normas Contables Bolivianas | NC del CTNAC, no NIIF puras; UFV desactivable | 0 |
| 003 | Backend Node + Express | Node.js + Express para el SaaS | 8 |
| 004 | Base de Datos PostgreSQL | PostgreSQL por transacciones ACID | 8 |
| 005 | Autenticación JWT | JWT stateless con refresh tokens | 8 |
| 006 | Multi-Empresa Multi-NIT | Columna empresa_id en cada tabla | 8 |
| 007 | Integración SIN API | API pública del SIAT con certificado digital | 8 |

---

## 🔑 Conceptos Clave por Módulo

### Módulo 0: Setup
- **Regla de oro:** Separar configuración de lógica.
- **Archivo clave:** `js/config/bolivia.js`
- **Concepto:** Un solo cambio en la ley = un solo archivo a tocar.

### Módulo 1: Documentos Fuente
- **Regla de oro:** Sin documento, no hay asiento.
- **Archivo clave:** `js/capas/capa1-documentos.js`
- **Concepto:** Validación de NIT (módulo 11) y CUF (43 caracteres).

### Módulo 2: Compras y Ventas
- **Regla de oro:** IVA incluido → dividir entre 1.13.
- **Archivo clave:** `js/modulos/compras.js`, `js/modulos/ventas.js`
- **Concepto:** Una transacción actualiza 5 cosas simultáneamente.

### Módulo 3: Motor Contable
- **Regla de oro:** Debe = Haber. Siempre. Sin excepción.
- **Archivo clave:** `js/capas/capa3-motor.js`
- **Concepto:** Partida doble, libro diario, libro mayor, balanza.

### Módulo 4: Nómina Boliviana
- **Regla de oro:** Indemnización aplica a renuncia voluntaria.
- **Archivo clave:** `js/modulos/nomina.js`
- **Concepto:** Bono sobre 3 SMN, aguinaldo condicional al PIB.

### Módulo 5: Impuestos
- **Regla de oro:** IT pagado se compensa contra IUE (Art. 77).
- **Archivo clave:** `js/modulos/impuestos.js`
- **Concepto:** Si IT > IUE, el exceso se pierde.

### Módulo 6: Estados Financieros
- **Regla de oro:** Activo = Pasivo + Patrimonio. Siempre.
- **Archivo clave:** `js/capas/capa4-estados.js`
- **Concepto:** UFV suspendido desde dic/2020. NC, no NIIF.

### Módulo 7: Cumplimiento SIN
- **Regla de oro:** El LCV debe cuadrar con el Form. 200.
- **Archivo clave:** `js/capas/capa5-cumplimiento.js`
- **Concepto:** Vencimientos según dígito del NIT (10 al 19).

### Módulo 8: Migración SaaS (Opcional)
- **Regla de oro:** Cada fase agrega valor incremental.
- **Archivo clave:** `backend/src/` (nuevo)
- **Concepto:** Multi-tenant con empresa_id en cada tabla.

---

## ⚡ Referencia Rápida: Fórmulas Bolivianas

```text
IVA (incluido en el precio):
  Neto = Total ÷ 1.13
  IVA  = Total − Neto
  Verificación: Neto × 13% = IVA

IT:
  IT = Ingresos Brutos × 3%

IUE:
  IUE = Utilidad Imponible × 25%
  Si Utilidad ≤ 0 → IUE = 0

Compensación IT-IUE:
  IUE por Pagar = IUE − IT Acumulado
  Si IT ≥ IUE → IUE = 0 (exceso se pierde)

Bono de Antigüedad:
  Bono = Porcentaje × (3 × SMN)
  Base: 3 SMN, NO el salario real

Indemnización:
  Indemnización = Promedio 3 meses × Años de servicio
  Aplica desde 90 días, SIN TOPE
  Aplica a RENUNCIA voluntaria

Desahucio:
  Desahucio = 3 × Salario mensual
  Solo si despido sin preaviso de 90 días

Aguinaldo:
  Aguinaldo = Promedio 3 meses × (meses trabajados ÷ 12)
  Provisión mensual = Aguinaldo estimado ÷ 12

RC-IVA:
  RC-IVA = 13% × Total Devengado − IVA Facturas
  Si IVA Facturas ≥ 13% → RC-IVA = 0

IUE-BE:
  IUE-BE = Monto Remesado × 12.5%
  (25% sobre base presunta del 50%)
```

---

## 🎓 Lo Que Aprendiste (Resumen para tu CV / Portafolio)

```text
╔══════════════════════════════════════════════════════════════════╗
║  AL COMPLETAR ESTE PROYECTO, DEMOSTRASTE:                       ║
║                                                                  ║
║  📊 CONTABILIDAD:                                               ║
║  • Partida doble y ciclo contable completo                      ║
║  • Libro Diario, Libro Mayor, Balanza de Comprobación           ║
║  • Asientos de ajuste y cierre del ejercicio                    ║
║  • Estados financieros según NC del CTNAC                       ║
║                                                                  ║
║  🇧🇴 LEGISLACIÓN BOLIVIANA:                                     ║
║  • Ley 843: IVA (13%), IT (3%), IUE (25%), RC-IVA              ║
║  • Compensación IT-IUE (Art. 77)                                ║
║  • Código Tributario (Ley 2492) y Ley 1733                      ║
║  • Ley General del Trabajo: aguinaldo, bono, indemnización      ║
║  • DS 1802 (segundo aguinaldo), DS 21060 (bono antigüedad)      ║
║  • DS 28699 (indemnización en renuncia)                         ║
║  • Normas de Contabilidad del CTNAC (no NIIF puras)             ║
║  • UFV suspendido desde diciembre 2020                          ║
║                                                                  ║
║  💻 DESARROLLO WEB:                                             ║
║  • HTML5 semántico, CSS3 con variables, JavaScript ES6+         ║
║  • SPA artesanal (enrutador sin frameworks)                     ║
║  • LocalStorage como base de datos del navegador                ║
║  • Validaciones complejas (NIT módulo 11, CUF 43 chars)         ║
║  • Arquitectura en capas y separación de responsabilidades      ║
║                                                                  ║
║  🏗️ ARQUITECTURA DE SOFTWARE:                                  ║
║  • Monorepo educativo con estructura por capas                  ║
║  • ADRs para documentar decisiones                              ║
║  • Configuración separada de lógica (bolivia.js)                ║
║  • Trazabilidad completa: documento → asiento → estado          ║
║  • (Opcional) Migración a SaaS: Node.js, PostgreSQL, JWT        ║
║                                                                  ║
║  📋 CUMPLIMIENTO TRIBUTARIO:                                    ║
║  • Formularios SIN: 200, 400, 500, 110, 601, 605                ║
║  • Libro de Compras y Ventas (LCV)                              ║
║  • Calendario tributario según dígito del NIT                   ║
║  • Facturación electrónica: CUIS, CUFD, CUF                     ║
║  • Regímenes: RG, RTS, STI, RAU, SIETE-RG                      ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 🚀 Próximos Pasos Después de Completar

```text
1. 🎓 EXPOSICIÓN
   → Usa el checklist de exposición de este documento.
   → Practica la demostración de trazabilidad (5 minutos).
   → Practica las particularidades bolivianas (5 minutos).

2. 💼 PORTAFOLIO
   → Sube el proyecto a GitHub con un README profesional.
   → Incluye capturas de pantalla del dashboard.
   → Vincula los ADRs y la documentación didáctica.
   → Agrega un video de 3 minutos mostrando el sistema.

3. 🔄 ITERACIÓN
   → Agrega más módulos: Presupuestos, CRM, Proyectos.
   → Mejora la UI/UX con más componentes visuales.
   → Agrega tests automatizados (Jest para JS).

4. 🌐 SAAS (si quieres comercializar)
   → Completa el Módulo 8: backend, DB, auth, Docker.
   → Registra el dominio y configura el hosting.
   → Implementa el modelo de suscripción.
   → Busca los primeros 5 clientes beta.

5. 📚 CONTRIBUIR
   → Publica la guía en un blog o Medium.
   → Comparte los documentos didácticos.
   → Contribuye a la comunidad de desarrolladores bolivianos.
```

---

## ⚠️ Errores Comunes a Evitar

```text
1. ❌ Usar la sigla "NBCHs" para normas contables.
   ✅ Correcto: NC (Normas de Contabilidad) del CTNAC.

2. ❌ Declarar el IUE en el "Formulario 610".
   ✅ Correcto: Formulario 500 (o 510).

3. ❌ Usar el Form. 605 para partes vinculadas.
   ✅ Correcto: Form. 605 es para EEFF. Partes vinculadas = Form. 601.

4. ❌ Pagar el segundo aguinaldo 50% en diciembre y 50% en junio.
   ✅ Correcto: Cada aguinaldo se paga COMPLETO en diciembre.

5. ❌ Decir que hay 3 modalidades de facturación.
   ✅ Correcto: Son 5 (Electrónica, Computarizada, Portal, Manual, Prevalorada).

6. ❌ Calcular la indemnización solo en caso de despido.
   ✅ Correcto: Aplica TAMBIÉN a renuncia voluntaria (DS 28699).

7. ❌ Aplicar ajuste por inflación con UFV después de 2020.
   ✅ Correcto: UFV suspendido desde diciembre 2020.

8. ❌ Calcular el bono de antigüedad sobre el salario real.
   ✅ Correcto: Base = 3 × SMN, sin importar el salario.

9. ❌ Calcular el IT sobre el neto (después de IVA).
   ✅ Correcto: IT = 3% sobre ingresos BRUTOS (monto total).

10. ❌ Devolver el exceso de IT sobre el IUE.
    ✅ Correcto: El exceso se PIERDE. No se devuelve.
```

---

## 📞 Fuentes de Referencia

```text
NORMATIVA:
• Ley 843 (impuestos nacionales)
• Código Tributario Boliviano (Ley 2492)
• Ley General del Trabajo (LGT)
• Ley 1733 de Alivio Tributario (2026)
• DS 1802 (segundo aguinaldo)
• DS 21060 (bono de antigüedad)
• DS 28699 (indemnización)
• DS 22138 (desahucio)
• DS 1592 (vacaciones)
• DS 4709 (vacaciones, actualización)
• RND 102600000014 (2026, trazabilidad)

ENTIDADES:
• SIN: impuestos.gob.bo / siatinfo.impuestos.gob.bo
• CAUB: auditores.org.bo
• Fundempresa: fundempresa.gob.bo
• Ministerio de Trabajo: trabajo.gob.bo
• INE: ine.gob.bo

NORMATIVA CONTABLE:
• NC del CTNAC (16 normas + marco conceptual)
• Vigentes desde el 1 de enero de 2011
• UFV suspendido desde el 10 de diciembre de 2020
```

---

## 🏁 Palabras Finales

```text
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║  Este proyecto no es solo código.                               ║
║                                                                  ║
║  Es la demostración de que puedes entender un dominio            ║
║  complejo (contabilidad + tributación boliviana),                ║
║  traducirlo a arquitectura de software,                         ║
║  y construirlo con tus propias manos.                           ║
║                                                                  ║
║  Cuando alguien te pregunte "¿qué sabes hacer?",                ║
║  no digas "sé JavaScript".                                      ║
║                                                                  ║
║  Di: "Construí un ERP contable adaptado a la legislación        ║
║  boliviana, con partida doble, nómina según la LGT,             ║
║  impuestos según la Ley 843, y cumplimiento ante el SIN.        ║
║  Aquí está el código, aquí está la documentación,               ║
║  y aquí está la demostración en vivo."                          ║
║                                                                  ║
║  Eso no lo dice cualquiera.                                     ║
║                                                                  ║
║  Ahora ve y constrúyelo. 🚀                                     ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

**Documento generado como cierre del roadmap completo del ERP Contable Integral Boliviano.**
**Versión 1.0.0 · Todos los módulos documentados · Listo para ejecución.**