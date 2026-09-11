# 📁 ROADMAP_LANDING_PAGE_PORTAFOLIO.md

**Proyecto:** ERP Contable Integral Boliviano — Landing Page de Presentación
**Arquitectura:** HTML + CSS + Vanilla JS (sin frameworks, coherente con el ERP)
**Versión:** 1.0.0 · **Formato:** Guía de Diseño y Desarrollo
**Tiempo estimado:** 6–8 horas · **Deploy:** GitHub Pages / Netlify (gratis)
**Depende de:** Módulos 0-8 completados + documentación existente

> **Objetivo:** Construir una **landing page de portafolio profesional** que presente el ERP Contable Boliviano como proyecto de aprendizaje. La página debe cumplir tres funciones: (1) **impresionar** con métricas y diseño, (2) **educar** explicando conceptos contables bolivianos, y (3) **demostrar** dominio técnico y normativo. Es la puerta de entrada para reclutadores, clientes o jurados de portafolio.

> **Filosofía de diseño:** La landing NO es un catálogo de features. Es una **historia**: "Cómo construí un ERP que entiende la contabilidad boliviana real". Cada sección responde a una pregunta que un visitante se haría: ¿Qué es? ¿Qué hace? ¿Por qué es diferente? ¿Cómo lo hiciste? ¿Qué aprendiste?

---

## 🗺️ Mapa del Roadmap

```text
Landing Page
├── Fase 1  → Setup del proyecto landing + sistema de diseño
├── Fase 2  → Hero Section + métricas de impacto
├── Fase 3  → Sección "Los 8 Módulos" (cards interactivas)
├── Fase 4  → Modo Aprendizaje (las 17 guías como contenido)
├── Fase 5  → Particularidades Bolivianas (EL DIFERENCIADOR)
├── Fase 6  → Demo Interactiva (comparador FIFO/LIFO/Promedio)
├── Fase 7  → Arquitectura Técnica + Documentación
├── Fase 8  → Animaciones, responsive y pulido final
└── Fase 9  → Deploy + SEO + README del repositorio
```

---

## 🟥 Estado: `[ ] Pendiente`

---

# FASE 1 — Setup del Proyecto Landing + Sistema de Diseño

## ¿Qué hace esta fase?
Crea la estructura de carpetas independiente de la landing y define el **sistema de diseño** (colores, tipografía, espaciados, componentes) que dará coherencia visual a toda la página.

## Estructura de carpetas

```text
landing/
├── index.html              ← Página principal (single page)
├── css/
│   ├── variables.css       ← Tokens de diseño (colores, fuentes)
│   ├── base.css            ← Reset, tipografía, utilidades
│   ├── componentes.css     ← Botones, cards, badges, tabs
│   └── secciones.css       ← Estilos específicos por sección
├── js/
│   ├── landing.js          ← Lógica principal (scroll, animaciones)
│   ├── comparador.js       ← Demo interactiva FIFO/LIFO/Promedio
│   └── datos.js            ← Datos del ERP (métricas, módulos)
└── assets/
    ├── logo.svg            ← Logo del ERP
    ├── favicon.ico
    └── imagenes/           ← Screenshots del ERP
```

## Sistema de diseño (tokens)

```css
/* variables.css */
:root {
  /* Paleta inspirada en Bolivia + profesionalismo contable */
  --color-primario: #1e40af;        /* Azul profundo (confianza) */
  --color-secundario: #d97706;      /* Ámbar (acento boliviano) */
  --color-exito: #059669;           /* Verde (correcto) */
  --color-error: #dc2626;           /* Rojo (error) */
  --color-advertencia: #d97706;     /* Ámbar (alerta) */

  /* Fondos (modo claro por defecto, oscuro opcional) */
  --fondo-principal: #ffffff;
  --fondo-alternado: #f8fafc;
  --fondo-oscuro: #0f172a;          /* Para hero y footer */

  /* Texto */
  --texto-principal: #1e293b;
  --texto-secundario: #64748b;
  --texto-claro: #f8fafc;

  /* Tipografía */
  --fuente-titulos: 'Inter', system-ui, sans-serif;
  --fuente-codigo: 'JetBrains Mono', monospace;

  /* Espaciados (escala 8px) */
  --espacio-xs: 8px;
  --espacio-sm: 16px;
  --espacio-md: 24px;
  --espacio-lg: 48px;
  --espacio-xl: 96px;

  /* Bordes y sombras */
  --radio-sm: 6px;
  --radio-md: 12px;
  --radio-lg: 24px;
  --sombra-suave: 0 2px 8px rgba(0,0,0,0.08);
  --sombra-media: 0 8px 24px rgba(0,0,0,0.12);
}
```

## Tareas de la Fase 1

```text
[x] Crear estructura de carpetas landing/
[x] Crear css/variables.css con tokens de diseño
[x] Crear css/base.css con reset y tipografía
[x] Crear css/componentes.css (botones, cards, badges)
[x] Crear index.html con estructura de secciones vacías
[x] Cargar fuentes de Google Fonts (Inter + JetBrains Mono)
    → 🧠 Mini-Prompt para IA: "Genera un sistema de diseño CSS
      para una landing page de portafolio de un ERP contable.
      Incluye paleta de colores profesional con acentos bolivianos,
      tipografía Inter para texto y JetBrains Mono para código,
      escala de espaciados de 8px, y componentes reutilizables
      (botones, cards, badges). Usa variables CSS."
```

---

# FASE 2 — Hero Section + Métricas de Impacto

## ¿Qué hace esta fase?
Construye la **primera impresión**: un hero oscuro e impactante que presenta el proyecto con su nombre, tagline, y las métricas que demuestran su magnitud.

## Estructura del Hero

```text
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   🇧🇴 ERP CONTABLE BOLIVIA                                       ║
║                                                                  ║
║   Un sistema contable integral que entiende la normativa        ║
║   boliviana real: Ley 843, NC del CTNAC, SIN y Fundempresa.     ║
║   Construido desde cero con Vanilla JavaScript.                 ║
║                                                                  ║
║   [🚀 Ver el ERP en vivo]  [📖 Ver documentación]               ║
║                                                                  ║
║   ───────────────────────────────────────────────────────────   ║
║   41,090        127          8           17                      ║
║   Líneas de     Archivos     Módulos     Guías de               ║
║   código        totales      completos   aprendizaje            ║
║   ───────────────────────────────────────────────────────────   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

## Tareas de la Fase 2

```text
[ ] Crear sección hero con fondo oscuro y gradiente
[ ] Título principal + tagline descriptivo
[ ] Dos CTAs: "Ver ERP en vivo" y "Ver documentación"
[ ] Barra de métricas con 4 números de impacto
[ ] Animación de contador (los números suben al hacer scroll)
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que anime
      contadores numéricos cuando entran en el viewport usando
      IntersectionObserver. Los números deben subir desde 0 hasta
      su valor final en 1.5 segundos con easing."
[ ] Badge flotante "Prototipo Educativo v1.0"
```

---

# FASE 3 — Sección "Los 8 Módulos" (Cards Interactivas)

## ¿Qué hace esta fase?
Presenta los **8 módulos completados** como cards interactivas. Cada card muestra: número, nombre, descripción breve, tecnologías clave, y LoC. Al hacer hover o click, se expande con más detalle.

## Estructura de una card de módulo

```text
┌─────────────────────────────────────────┐
│  05  🧾 IMPUESTOS BOLIVIANOS            │
│  ─────────────────────────────────────  │
│  IVA, IT, IUE, RC-IVA, IUE-BE con       │
│  compensación IT-IUE (Art. 77 Ley 843)  │
│                                         │
│  [Vanilla JS] [LocalStorage] [SIN]      │
│                                         │
│  2,024 LoC  ·  13 fases  ·  ✅ Completo │
└─────────────────────────────────────────┘
```

## Datos de los 8 módulos (para `js/datos.js`)

```javascript
const MODULOS_ERP = [
  {
    numero: '00',
    nombre: 'Setup y Configuración',
    icono: '⚙️',
    descripcion: 'Base del sistema: almacenamiento, utilidades, validadores y configuración boliviana (IVA 13%, SMN, feriados).',
    tecnologias: ['LocalStorage', 'Vanilla JS'],
    loc: 660,
    fases: 5,
    destacado: 'Configuración normativa boliviana centralizada'
  },
  {
    numero: '01',
    nombre: 'Documentos Fuente',
    icono: '📄',
    descripcion: 'Capa 1: registro de facturas, notas de débito/crédito con validación de NIT y CUF según SIAT.',
    tecnologias: ['Capas', 'Validadores'],
    loc: 496,
    fases: 4,
    destacado: 'Validación de NIT con dígito verificador'
  },
  {
    numero: '02',
    nombre: 'Compras y Ventas',
    icono: '🛒',
    descripcion: 'Ciclo completo: solicitud → orden → recepción → factura → pago. Inventario con kardex.',
    tecnologias: ['Módulos', 'Kardex'],
    loc: 1382,
    fases: 8,
    destacado: 'Ciclo de compras con cuentas por pagar'
  },
  {
    numero: '03',
    nombre: 'Motor Contable',
    icono: '⚙️',
    descripcion: 'Capa 3: partida doble, libro diario, mayor, balanza y cierre de ejercicio con validaciones.',
    tecnologias: ['Partida doble', 'Plan de cuentas'],
    loc: 905,
    fases: 10,
    destacado: 'Detección automática de errores contables'
  },
  {
    numero: '04',
    nombre: 'Nómina Boliviana',
    icono: '👥',
    descripcion: 'Aguinaldo, bono de antigüedad, indemnización, desahucio, RC-IVA con facturas y aportes patronales.',
    tecnologias: ['LGT', 'DS 28699', 'DS 22138'],
    loc: 1405,
    fases: 8,
    destacado: 'Las 5 provisiones laborales bolivianas'
  },
  {
    numero: '05',
    nombre: 'Impuestos Bolivianos',
    icono: '🧾',
    descripcion: 'IVA, IT, IUE, RC-IVA e IUE-BE. Compensación IT-IUE del Art. 77 y calendario por dígito de NIT.',
    tecnologias: ['Ley 843', 'Formularios SIN'],
    loc: 2024,
    fases: 13,
    destacado: 'Compensación IT-IUE (la joya del módulo)'
  },
  {
    numero: '06',
    nombre: 'Estados Financieros',
    icono: '📊',
    descripcion: 'Balance, resultados, flujo de efectivo, notas (12), comparativos y razones financieras.',
    tecnologias: ['NC CTNAC', 'Ratios'],
    loc: 950,
    fases: 10,
    destacado: '12 notas según NC del CTNAC'
  },
  {
    numero: '07',
    nombre: 'Cumplimiento SIN',
    icono: '✅',
    descripcion: 'Formularios 200/400/500/110/601/605, LCV, facturación electrónica (CUIS/CUFD/CUF) y Fundempresa.',
    tecnologias: ['SIAT', 'Fundempresa'],
    loc: 2091,
    fases: 12,
    destacado: 'Trazabilidad documento → asiento → estado'
  },
  {
    numero: '08',
    nombre: 'Contabilidad de Costos',
    icono: '🏭',
    descripcion: 'FIFO/LIFO/Promedio con comparador visual, centros de costo, órdenes de trabajo y punto de equilibrio.',
    tecnologias: ['NIC 2', 'CVP'],
    loc: 3010,
    fases: 13,
    destacado: 'Comparador de 3 métodos (herramienta didáctica)'
  }
];
```

## Tareas de la Fase 3

```text
[ ] Crear js/datos.js con el array MODULOS_ERP
[ ] Crear sección con grid de 9 cards (00-08)
[ ] Renderizar cards dinámicamente desde datos.js
[ ] Efecto hover: elevación + borde de color
[ ] Click en card → modal o expansión con detalle
[ ] Badge de estado "✅ Completo" en cada card
    → 🧠 Mini-Prompt para IA: "Genera HTML/CSS para un grid de
      cards de módulos de un ERP. Cada card tiene número, icono,
      nombre, descripción, badges de tecnología, y métricas (LoC,
      fases). Al hacer hover se eleva con sombra. Usa CSS Grid
      responsive (3 columnas desktop, 2 tablet, 1 móvil)."
```

---

# FASE 4 — Modo Aprendizaje (Las 17 Guías como Contenido)

## ¿Qué hace esta fase?
Convierte las **17 guías de aprendizaje** en contenido navegable de la landing. Esta sección demuestra que el proyecto no solo funciona, sino que **enseña**. Es el corazón del "modo aprendizaje".

## Estructura de la sección

```text
╔══════════════════════════════════════════════════════════════════╗
║  📚 MODO APRENDIZAJE                                             ║
║                                                                  ║
║  El ERP incluye 17 guías que explican la contabilidad           ║
║  boliviana desde cero. Cada concepto tiene su implementación.   ║
║                                                                  ║
║  ┌──────────────────────────────────────────────────────────┐   ║
║  │ FUNDAMENTOS (1-10)                                       │   ║
║  │  01 Documentos fuente        06 Funciones IVA e IT       │   ║
║  │  02 Tipos de documentos      07 Partida doble            │   ║
║  │  03 Modelo de datos          08 Ciclo contable           │   ║
║  │  04 Ciclo compra-venta       09 Cuentas y naturaleza     │   ║
║  │  05 IVA boliviano            10 Estructura de asiento    │   ║
║  ├──────────────────────────────────────────────────────────┤   ║
║  │ NORMATIVA BOLIVIANA (11-19)                              │   ║
║  │  11 Provisiones laborales    17 Impuestos explicados     │   ║
║  │  12 Cierre de ejercicio      18 Calendario tributario    │   ║
║  │  13 Nómina boliviana         19 Compensación IT-IUE      │   ║
║  │  14 Particularidades BO                                  │   ║
║  └──────────────────────────────────────────────────────────┘   ║
║                                                                  ║
║  [📖 Leer guía 05: IVA boliviano explicado →]                   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

## Tareas de la Fase 4

```text
[ ] Crear sección "Modo Aprendizaje" con 2 grupos de guías
[ ] Renderizar las 17 guías como lista clickeable
[ ] Cada guía enlaza al archivo .md en el repositorio GitHub
[ ] Destacar 3 guías "imprescindibles" con badge ⭐
[ ] Agregar buscador/filtro de guías (opcional)
    → 🧠 Mini-Prompt para IA: "Genera HTML/CSS para una sección
      de documentación educativa con 17 guías agrupadas en 2
      categorías (Fundamentos y Normativa Boliviana). Cada guía
      es un enlace con número, título y descripción breve.
      Destaca 3 guías con badge de estrella."
```

---

# FASE 5 — Particularidades Bolivianas (EL DIFERENCIADOR)

## ¿Qué hace esta fase?
Esta es **LA sección más importante** de la landing. Muestra lo que hace único al proyecto: no es un ERP genérico, entiende la normativa boliviana real. Cada particularidad se presenta como una "joya" con explicación y código.

## Las 6 particularidades a destacar

```text
╔══════════════════════════════════════════════════════════════════╗
║  🇧🇴 POR QUÉ ESTE ERP ES DIFERENTE                               ║
║                                                                  ║
║  La mayoría de ERPs son genéricos. Este entiende Bolivia.       ║
║                                                                  ║
║  ┌────────────────────────────────────────────────────────────┐ ║
║  │ 1️⃣ IVA INCLUIDO EN EL PRECIO (Art. 5 Ley 843)              │ ║
║  │    En Bolivia el IVA está dentro del precio, no se agrega. │ ║
║  │    IVA = Total - (Total ÷ 1.13)                            │ ║
║  └────────────────────────────────────────────────────────────┘ ║
║  ┌────────────────────────────────────────────────────────────┐ ║
║  │ 2️⃣ COMPENSACIÓN IT-IUE (Art. 77 Ley 843)                  │ ║
║  │    El IT pagado mensualmente se descuenta del IUE anual.   │ ║
║  │    Si IT > IUE, el exceso SE PIERDE (no se devuelve).      │ ║
║  └────────────────────────────────────────────────────────────┘ ║
║  ┌────────────────────────────────────────────────────────────┐ ║
║  │ 3️⃣ LIFO PROHIBIDO (NIC 2 + SIN)                           │ ║
║  │    Implementado solo para enseñar por qué se prohibió.    │ ║
║  └────────────────────────────────────────────────────────────┘ ║
║  ┌────────────────────────────────────────────────────────────┐ ║
║  │ 4️⃣ CALENDARIO POR DÍGITO DE NIT                           │ ║
║  │    Los vencimientos van del 10 al 19 según el último      │ ║
║  │    dígito del NIT del contribuyente.                       │ ║
║  └────────────────────────────────────────────────────────────┘ ║
║  ┌────────────────────────────────────────────────────────────┐ ║
║  │ 5️⃣ 5 PROVISIONES LABORALES (LGT + Decretos)               │ ║
║  │    Aguinaldo, bono antigüedad, indemnización, desahucio,  │ ║
║  │    y segundo aguinaldo condicional (DS 1802).             │ ║
║  └────────────────────────────────────────────────────────────┘ 
║  ┌────────────────────────────────────────────────────────────┐ ║
║  │ 6️⃣ UFV SUSPENDIDO DESDE DIC/2020                         │ ║
║  │    El ERP no aplica reexpresión por inflación porque      │ ║
║  │    está suspendida (un ERP genérico la aplicaría mal).    │ ║
║  └────────────────────────────────────────────────────────────┘ 
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

## Tareas de la Fase 5

```text
[ ] Crear sección con las 6 particularidades bolivianas
[ ] Cada una como card expandible con explicación + código
[ ] Incluir snippet de código real del ERP en cada una
[ ] Badge "🇧🇴 Normativa boliviana" en cada card
[ ] Destacar la #2 (compensación IT-IUE) como "la joya"
    → 🧠 Mini-Prompt para IA: "Genera HTML/CSS para 6 cards que
      expliquen particularidades de la normativa contable
      boliviana. Cada card tiene icono, título, explicación breve
      y un snippet de código. La card de compensación IT-IUE debe
      destacarse visualmente como la más importante."
```

---

# FASE 6 — Demo Interactiva (Comparador FIFO/LIFO/Promedio)

## ¿Qué hace esta fase?
Porta a la landing la **joya didáctica del Módulo 8**: el comparador de los 3 métodos de valuación. El visitante puede simular compras y ventas en vivo y ver cómo cambia la utilidad, el IUE y el inventario con cada método. Es la prueba interactiva de que el proyecto enseña.

## Estructura de la demo

```text
╔══════════════════════════════════════════════════════════════════╗
║  🧪 PRUÉBALO TÚ MISMO: Comparador de Métodos de Valuación       ║
║                                                                  ║
║  Simula una compra y una venta, y mira cómo el mismo            ║
║  inventario tiene 3 valores diferentes según el método.         ║
║                                                                  ║
║  [Compra: 100 u @ Bs 50] [Compra: 100 u @ Bs 70]                ║
║  [Venta: 100 u @ Bs 100]  [🔄 Reset]                            ║
║                                                                  ║
║  ┌──────────────┬──────────────┬──────────────┐                 ║
║  │  PROMEDIO    │    FIFO      │    LIFO      │                 ║
║  │  ✅ Aceptado │  ✅ Aceptado │  ❌ Prohibido│                 ║
║  ├──────────────┼──────────────┼──────────────┤                 
║  │ Costo: 6,000 │ Costo: 5,000 │ Costo: 7,000 │                 ║
║  │ Util: 4,000  │ Util: 5,000  │ Util: 3,000  │                 ║
║  │ IUE: 1,000   │ IUE: 1,250   │ IUE: 750     │                 ║
║  │ Inv: 7,000   │ Inv: 7,000   │ Inv: 5,000   │                 ║
║  └──────────────┴──────────────┴──────────────┘                 
║                                                                  ║
║  ⚠️ Con los MISMOS datos, el método cambia la utilidad en       ║
║     Bs 2,000 y el IUE en Bs 500. Por eso NIIF prohibió LIFO.    ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

## Tareas de la Fase 6

```text
[ ] Crear js/comparador.js con lógica FIFO/LIFO/Promedio
[ ] Implementar capas de inventario en memoria
[ ] Botones: agregar compra, agregar venta, reset
[ ] Renderizar 3 columnas comparativas en vivo
[ ] Calcular utilidad bruta e IUE (25%) por método
[ ] Mensaje educativo final sobre por qué LIFO está prohibido
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que simule
      inventario con 3 métodos de valuación (Promedio, FIFO, LIFO)
      usando capas. Recibe compras y ventas, y devuelve costo de
      venta, utilidad e inventario final por método. Renderiza
      3 columnas comparativas en HTML."
[ ] Animación de transición al recalcular
```

---

# FASE 7 — Arquitectura Técnica + Documentación

## ¿Qué hace esta fase?
Muestra el **cómo** técnico: la arquitectura por capas, el stack sin frameworks, y la documentación completa (11 roadmaps + 2 ADRs). Esta sección habla al reclutador técnico.

## Estructura de la sección

```text
╔══════════════════════════════════════════════════════════════════╗
║  🏗️ ARQUITECTURA TÉCNICA                                        ║
║                                                                  ║
║  Vanilla JavaScript + LocalStorage. Sin frameworks.             ║
║  Cada decisión tiene un porqué (ver ADRs).                      ║
║                                                                  ║
║  ┌─────────────────────────────────────────────────────────┐    ║
║  │  CAPA 5: CUMPLIMIENTO  (formularios SIN, LCV, SIAT)     │    ║
║  ├─────────────────────────────────────────────────────────┤    ║
║  │  CAPA 4: ESTADOS      (balance, resultados, notas)      │    ║
║  ├─────────────────────────────────────────────────────────┤    ║
║  │  CAPA 3: MOTOR CONTABLE  (partida doble, mayor)         │    ║
║  ├─────────────────────────────────────────────────────────┤    ║
║  │  CAPA 2: MÓDULOS  (compras, ventas, nómina, costos)     │    ║
║  ├─────────────────────────────────────────────────────────┤    ║
║  │  CAPA 1: DOCUMENTOS  (facturas, notas, validación)      │    ║
║  ├─────────────────────────────────────────────────────────┤    ║
║  │  NÚCLEO  (almacenamiento, utilidades, validadores)      │    ║
║  └─────────────────────────────────────────────────────────┘    ║
║                                                                  ║
║  📄 DOCUMENTACIÓN                                               ║
║  11 roadmaps · 2 ADRs · 17 guías · 41,090 LoC documentados      ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

## Tareas de la Fase 7

```text
[ ] Crear diagrama de arquitectura por capas (CSS puro)
[ ] Listar stack técnico con badges
[ ] Enlazar los 2 ADRs con resumen de cada decisión
[ ] Enlazar los 11 roadmaps como lista descargable
[ ] Sección "Decisiones de diseño" (por qué Vanilla JS, por qué
    LocalStorage, por qué no backend)
    → 🧠 Mini-Prompt para IA: "Genera HTML/CSS para un diagrama
      de arquitectura por capas usando solo CSS (flexbox/grid).
      6 capas apiladas con nombre y descripción. Al hacer hover
      en cada capa se resalta y muestra su responsabilidad."
```

---

# FASE 8 — Animaciones, Responsive y Pulido Final

## ¿Qué hace esta fase?
Da el acabado profesional: animaciones de scroll (reveal), modo oscuro opcional, responsive completo, y micro-interacciones que hacen la página memorable sin sacrificar rendimiento.

## Tareas de la Fase 8

```text
[ ] Animaciones reveal-on-scroll con IntersectionObserver
[ ] Smooth scroll para navegación interna
[ ] Navbar fija con enlaces a secciones + indicador activo
[ ] Modo oscuro con toggle (persistido en localStorage)
[ ] Responsive: móvil (1 col), tablet (2 col), desktop (3-4 col)
[ ] Optimizar imágenes (WebP, lazy loading)
[ ] Meta tags Open Graph para compartir en redes
[ ] Favicon y logo SVG
    → 🧠 Mini-Prompt para IA: "Genera CSS y JS para animaciones
      reveal-on-scroll usando IntersectionObserver. Los elementos
      con clase .reveal aparecen con fade+slide al entrar en el
      viewport. Incluye navbar fija con indicador de sección
      activa y toggle de modo oscuro persistido."
```

---

# FASE 9 — Deploy + SEO + README del Repositorio

## ¿Qué hace esta fase?
Publica la landing y la conecta con el repositorio. Configura SEO básico, despliega en GitHub Pages o Netlify, y actualiza el README del repo para que la landing sea la puerta de entrada.

## Tareas de la Fase 9

```text
[ ] Crear rama gh-pages o configurar Netlify
[ ] Deploy de la landing (URL pública)
[ ] Meta tags: title, description, og:image, twitter:card
[ ] Actualizar README.md del repositorio:
    → Badge con URL de la landing
    → Tabla de contenido con enlaces
    → Screenshots del ERP
    → Instrucciones para ejecutar localmente
[ ] Agregar enlace a la landing en el footer del ERP
[ ] Probar en móvil real y en Lighthouse (objetivo >90)
    → 🧠 Mini-Prompt para IA: "Genera un README.md de GitHub para
      un ERP contable boliviano de portafolio. Incluye badges,
      tabla de módulos con estado, screenshots placeholder,
      instrucciones de instalación, enlace a landing page y
      sección de documentación."
```

---

## 🎯 Criterios de Aceptación de la Landing

La landing se considera **completada** cuando:

- [x] El hero muestra las 4 métricas de impacto animadas
- [x] Los 9 módulos (00-08) están como cards interactivas
- [x] Las 17 guías de aprendizaje son navegables
- [x] Las 6 particularidades bolivianas están explicadas con código
- [x] El comparador FIFO/LIFO/Promedio funciona en vivo
- [x] El diagrama de arquitectura por capas es interactivo
- [x] La página es responsive (móvil, tablet, desktop)
- [x] Puntaje Lighthouse > 90 en Performance y Accesibilidad
- [x] Está deployada con URL pública
- [x] El README del repo enlaza a la landing

---

## 📚 Orden de Trabajo Recomendado

```text
1. Fase 1 (setup)          → 1 hora    [base sólida]
2. Fase 2 (hero)           → 45 min    [primera impresión]
3. Fase 3 (módulos)        → 1 hora    [contenido principal]
4. Fase 5 (bolivianas)     → 1.5 horas [EL DIFERENCIADOR]
5. Fase 6 (demo)           → 1.5 horas [interactividad]
6. Fase 4 (aprendizaje)    → 45 min    [modo educativo]
7. Fase 7 (arquitectura)   → 45 min    [para técnicos]
8. Fase 8 (pulido)         → 1 hora    [acabado]
9. Fase 9 (deploy)         → 30 min    [publicación]
```

**Nota:** Se recomienda hacer la Fase 5 (particularidades) ANTES que la 4 y 7, porque es el contenido que más valor aporta y conviene tenerlo listo temprano por si el tiempo se acorta.

---

## ⚠️ Advertencia final

La tentación aquí es hacer una landing **genérica de portafolio** (hero + features + contacto). **No lo hagas.** Lo que hace valioso a este proyecto no es que sea un ERP — hay miles — sino que **entiende la contabilidad boliviana real** y que **enseña mientras funciona**. La landing debe comunicar eso en los primeros 5 segundos (hero con "normativa boliviana real") y demostrarlo en los primeros 30 segundos (comparador interactivo). Un reclutador que ve el comparador FIFO/LIFO/Promedio funcionando en vivo entiende en 10 segundos que quien hizo esto **domina contabilidad, no solo programación**. Esa es la historia que la landing debe contar.

---

**¿Comenzamos?** Cuando estés listo, dime **"iniciar Fase 1"** y genero el setup completo de la landing (estructura de carpetas + sistema de diseño + index.html base). 🚀
