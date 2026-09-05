# 📁 ROADMAP_MODULO_0_SETUP.md

**Proyecto:** ERP Contable Integral Boliviano (Prototipo Educativo / Portafolio)
**Arquitectura:** Frontend Vanilla JS + LocalStorage (sin backend real — enfoque didáctico)
**Versión:** 1.0.0 · **Formato:** Guía Arquitectónica Explicativa
**Tiempo estimado:** 4–6 horas · **Bloquea:** Todos los módulos posteriores (1→8)

> **Objetivo del Módulo:** Construir el andamio completo del ERP Contable adaptado a la legislación boliviana (Ley 843, NC del CTNAC, SIN). Se establecen las convenciones, la estructura de carpetas y los guardianes de calidad. **Aquí no se escribe lógica de negocio compleja** (como el cálculo del IUE o el Kardex PEPS): se prepara el terreno para que el **Plan de Cuentas** y el **Motor de Asientos** tengan una base sólida. Un error en este módulo (ej. mala nomenclatura de archivos o tipos de datos financieros) corromperá la contabilidad en los módulos siguientes.

> **Nota de alcance:** Este ERP nace como **prototipo educativo para exposición**. No usamos backend real (Node.js, bases de datos SQL) para mantener la curva de aprendizaje accesible: toda la persistencia se simula con `localStorage` del navegador. Esto permite enfocarse en **entender el dominio contable boliviano** sin distraerse con infraestructura compleja. En una versión profesional, el mismo frontend se conectaría a un backend real — la arquitectura está pensada para ese salto futuro.

---

## 🗺️ Mapa del Módulo

```text
Módulo 0
├── Fase 0.1 → Git + Estructura de carpetas del monorepo educativo
├── Fase 0.2 → HTML base + index.html + navegación inicial
├── Fase 0.3 → CSS global (estilos base + componentes)
├── Fase 0.4 → Núcleo JS (enrutador, almacenamiento, utilidades, validadores)
├── Fase 0.5 → Configuración del dominio boliviano (tasas, plan de cuentas)
├── Fase 0.6 → Datos de ejemplo precargados (empresa ficticia)
└── Fase 0.7 → Smoke test final y commit de cierre
```

---

## 🟥 Estado: `[ ] Pendiente`

---

# FASE 0.1 — Git y Estructura de Carpetas

## ¿Por qué esta estructura y no otra?
La estructura sigue directamente las **5 capas del ERP** descritas en la guía técnica (Sección 2). Cada carpeta en `js/capas/` corresponde a una capa conceptual. Así, cuando expliques el prototipo, puedes abrir la carpeta y decir: *"aquí vive la Capa 3: Motor Contable"*. La carpeta `docs/` es tan importante como el código: un prototipo educativo sin documentación es solo un demo.

## Estructura de carpetas objetivo

```text
erp-contable-bo/               ← Raíz del proyecto
│
├── 📄 index.html              ← Punto de entrada (dashboard inicial)
├── 📄 README.md               ← Documentación del proyecto
├── 📄 .gitignore              ← Archivos que Git ignora
├── 📄 .editorconfig           ← Reglas de formato de código
│
├── 📁 css/                    ← Estilos y diseño visual
│   ├── estilos.css
│   ├── componentes.css
│   ├── dashboard.css
│   └── reportes.css
│
├── 📁 js/                     ← Toda la lógica del sistema
│   ├── app.js                 ← Arranque + router
│   ├── 📁 nucleo/
│   │   ├── enrutador.js
│   │   ├── almacenamiento.js
│   │   ├── utilidades.js
│   │   └── validadores.js
│   ├── 📁 config/
│   │   ├── bolivia.js
│   │   └── plan-cuentas.js
│   ├── 📁 capas/
│   │   ├── capa1-documentos.js
│   │   ├── capa2-modulos.js
│   │   ├── capa3-motor.js
│   │   ├── capa4-estados.js
│   │   └── capa5-cumplimiento.js
│   └── 📁 modulos/
│       ├── compras.js
│       ├── ventas.js
│       ├── inventario.js
│       ├── nomina.js
│       ├── impuestos.js
│       ├── facturacion.js
│       ├── tesoreria.js
│       └── activos-fijos.js
│
├── 📁 vistas/                 ← HTML de cada pantalla
│   ├── dashboard.html
│   ├── compras.html
│   ├── ventas.html
│   ├── inventario.html
│   ├── nomina.html
│   ├── impuestos.html
│   ├── estados-financieros.html
│   └── cumplimiento.html
│
├── 📁 datos/                  ← Datos de ejemplo
│   └── ejemplo.json
│
└── 📁 docs/                   ← Material didáctico
    ├── roadmap/               ← Estos archivos ROADMAP_*.md
    ├── guia-aprendizaje.md
    ├── glosario.md
    ├── diagrama-flujo.md
    └── 📁 adr/                ← Architecture Decision Records
```

## Tareas de la Fase 0.1

```text
[ ] Crear el directorio raíz e inicializar Git
    → mkdir erp-contable-bo && cd erp-contable-bo
    → git init && git branch -M main

[ ] Crear el árbol de directorios completo
    → Crear TODAS las carpetas listadas arriba.
    → Dentro de cada carpeta vacía, crear un archivo .gitkeep 
      para que Git las rastree (Git ignora carpetas vacías).

[ ] Crear el archivo .editorconfig en la raíz
    → Reglas: 2 espacios para JS/HTML/CSS/JSON. UTF-8, LF (saltos de línea Unix).
    → 🧠 Mini-Prompt para IA: "Genera un .editorconfig para un proyecto 
      educativo en HTML/CSS/JS vanilla, con 2 espacios de indentación, 
      UTF-8 y saltos de línea LF. Debe ser compatible con VS Code."

[ ] Crear el .gitignore unificado
    → Excluir: node_modules/ (si luego agregas Vite), dist/, .env, 
      *.db, *.sqlite, coverage/, .DS_Store, Thumbs.db, *.log
    → 🧠 Mini-Prompt para IA: "Genera un .gitignore robusto para un 
      proyecto frontend vanilla (HTML/CSS/JS) que puede crecer a usar 
      Vite más adelante. Excluir archivos de sistema operativo (.DS_Store, 
      Thumbs.db), archivos de entorno (.env), y archivos de build."

[ ] Crear el primer Architecture Decision Record (ADR)
    → docs/adr/ADR-001-stack-vanilla-sin-backend.md
    → Contexto: Necesitamos construir un ERP educativo rápido para 
      portafolio/exposición, priorizando comprensión del dominio 
      contable sobre complejidad técnica.
    → Decisión: Usar Vanilla JS (sin React/Vue/Angular) + LocalStorage.
      Cero frameworks pesados, cero backend real.
    → Consecuencia: La "base de datos" vive en el navegador del usuario.
      No hay persistencia entre dispositivos ni entre usuarios. Para un
      SaaS real, habría que migrar a backend + DB real en Módulo 8.
    → Alternativas descartadas: React+Node+PostgreSQL (demasiado para
      prototipo educativo), Excel (sin trazabilidad), frameworks PHP
      (curva de aprendizaje alta).

[ ] Crear el segundo ADR sobre Normativa Contable Boliviana
    → docs/adr/ADR-002-normas-contables-bolivianas.md
    → Contexto: Bolivia tiene su propio cuerpo normativo (NC del CTNAC)
      que difiere de las NIIF internacionales en aspectos clave.
    → Decisión: El sistema se regirá por las NC del CTNAC (no NIIF puras).
      El ajuste por inflación con UFV se programará como módulo 
      desactivable (suspendido desde diciembre 2020).
    → Consecuencia: Los estados financieros generados cumplen con lo 
      que exige el SIN y el CAUB, no con estándares internacionales.

[ ] Realizar el primer commit
    → git add . && git commit -m "chore: setup inicial del monorepo ERP Contable Bolivia"
```

---

# FASE 0.2 — HTML Base y Navegación Inicial

## ¿Qué hace esta fase?
Construye el **esqueleto visual** del ERP. Un solo `index.html` que carga un menú lateral y un área de contenido dinámico. Las vistas (compras, ventas, etc.) se cargan en esa área sin recargar la página — es una **SPA (Single Page Application) artesanal**, hecha a mano para entender cómo funcionan los frameworks modernos por dentro.

## Estructura objetivo de `index.html`

```text
index.html
├── <head> (meta, title, links a CSS)
├── <body>
│   ├── <aside> → Menú lateral (Capas 1-5 + Módulos)
│   ├── <main>  → Área de contenido dinámico (#contenido)
│   └── <script> → Carga de app.js (módulo ES6)
```

## Tareas de la Fase 0.2

```text
[ ] Crear el index.html base
    → Estructura HTML5 semántica: <header>, <aside>, <main>, <footer>.
    → Menú lateral con enlaces a cada módulo (aún sin funcionalidad).
    → Título: "ERP Contable Bolivia — Prototipo Educativo"

[ ] Crear el archivo vistas/dashboard.html
    → Contenido inicial: "Bienvenido al ERP Contable Bolivia"
    → 4 tarjetas vacías (pronto mostrarán: Ventas del mes, IVA por pagar,
      Utilidad neta, Empleados activos).

[ ] Crear plantillas vacías para las otras 7 vistas
    → vistas/compras.html, ventas.html, inventario.html, nomina.html,
      impuestos.html, estados-financieros.html, cumplimiento.html
    → Cada una con un <h1> y un <div id="contenido-modulo"> vacío.

[ ] Verificar que el HTML carga sin errores
    → Abrir index.html en el navegador (doble clic o Live Server).
    → Consola del navegador (F12) debe estar limpia.
    → 🧠 Mini-Prompt para IA: "Explica cómo abrir un archivo HTML local 
      en el navegador con Live Server de VS Code y por qué es mejor que 
      abrirlo con doble clic (tema de CORS y módulos ES6)."
```

---

# FASE 0.3 — CSS Global (Estilos Base + Componentes)

## ¿Qué hace esta fase?
Define la **identidad visual** del ERP. Usamos CSS puro (no Tailwind, no Bootstrap) para entender cómo funciona el diseño web desde cero. Los colores elegidos reflejan la bandera boliviana como guiño al dominio, pero con una paleta profesional apta para un SaaS.

## Paleta de colores propuesta

```text
🔴 Rojo Bolivia:  #D52B1E  (acento principal, alertas)
🟡 Amarillo:      #F9E300  (acento secundario, destacados)
🟢 Verde:         #007A33  (éxito, balances positivos)
⚫ Gris oscuro:   #1F2937  (texto principal)
⚪ Gris claro:    #F3F4F6  (fondos)
```

## Tareas de la Fase 0.3

```text
[ ] Crear css/estilos.css
    → Reset CSS básico (box-sizing: border-box, margin: 0).
    → Variables CSS (:root) con la paleta de colores arriba.
    → Tipografía: system-ui (fuente del sistema, sin descargas).
    → Layout base del dashboard (aside fijo + main fluido).

[ ] Crear css/componentes.css
    → Botones (.btn, .btn-primary, .btn-danger).
    → Tarjetas (.card) para los indicadores.
    → Tablas (.tabla) para listas de facturas/asientos.
    → Formularios (.form-group, .form-input, .form-label).

[ ] Crear css/dashboard.css
    → Grid de 4 columnas para las tarjetas del dashboard.
    → Estilos específicos del menú lateral.

[ ] Crear css/reportes.css
    → Estilos para impresión de estados financieros.
    → @media print para ocultar el menú lateral al imprimir.

[ ] Verificar visualmente
    → Abrir index.html y confirmar que el menú lateral se ve bien.
    → Probar en ancho de ventana reducido (responsive básico).
    → 🧠 Mini-Prompt para IA: "Genera un CSS minimalista para un 
      dashboard contable con paleta inspirada en la bandera boliviana 
      (rojo #D52B1E, amarillo #F9E300, verde #007A33), pero profesional 
      y apta para SaaS. Usa variables CSS y grid layout."
```

---

# FASE 0.4 — Núcleo JS (Las 4 Funciones Fundamentales)

## ¿Qué hace esta fase?
Construye los **cimientos de todo el sistema**. Son 4 archivos que TODOS los módulos usarán. Si estos 4 archivos están bien hechos, el resto del ERP se construye rápido. Si están mal, todo se rompe.

| Archivo | Responsabilidad | Por qué es crítico |
|---|---|---|
| `enrutador.js` | Carga vistas sin recargar | Sin él, cada clic recarga toda la página |
| `almacenamiento.js` | Guarda/lee de localStorage | Sin él, los datos se pierden al cerrar |
| `utilidades.js` | Formatea Bs, fechas, % | Sin él, cada módulo reinventa la rueda |
| `validadores.js` | Valida NIT, CUF, montos | Sin él, entra basura al sistema |

## Tareas de la Fase 0.4

```text
[ ] Crear js/nucleo/enrutador.js
    → Función navegarA(vista): carga vistas/{vista}.html en #contenido
    → Función iniciarRouter(): escucha clicks en el menú lateral
    → Usar fetch() para cargar las vistas (o import dinámico).
    → 🧠 Mini-Prompt para IA: "Escribe un enrutador simple en Vanilla 
      JS (sin frameworks) que cargue fragmentos HTML desde una carpeta 
      /vistas/ usando fetch() y los inserte en un div #contenido. Debe 
      manejar el evento popstate para el botón atrás del navegador."

[ ] Crear js/nucleo/almacenamiento.js
    → Función guardar(coleccion, datos): guarda en localStorage
    → Funcion obtener(coleccion): lee de localStorage
    → Funcion eliminar(coleccion, id): borra un registro
    → Usar JSON.stringify/parse para serializar.
    → 🧠 Mini-Prompt para IA: "Escribe una clase Almacenamiento en JS 
      que use localStorage como base de datos. Debe tener métodos: 
      guardar(coleccion, datos), obtener(coleccion), 
      obtenerPorId(coleccion, id), eliminar(coleccion, id). 
      Maneja errores de JSON inválido."

[ ] Crear js/nucleo/utilidades.js
    → formatearBs(monto): "Bs 1.234,56" (formato boliviano)
    → formatearFecha(fecha): "15/09/2026" (DD/MM/AAAA)
    → formatearNIT(nit): "123456789-1" (con guión)
    → calcularIVA(monto): usa monto / 1.13 (o monto * 0.13 si "IVA por fuera")
    → 🧠 Mini-Prompt para IA: "Escribe funciones JS puras para formato 
      boliviano: formatear montos en bolivianos (Bs 1.234,56), 
      fechas en DD/MM/AAAA, NIT con guión verificador. Incluye la 
      función calcularIVA(montoBruto) que divida entre 1.13 para 
      extraer el neto (método 'IVA por dentro' vigente en Bolivia)."

[ ] Crear js/nucleo/validadores.js
    → validarNIT(nit): algoritmo oficial del SIN (módulo 11)
    → validarCUF(cuf): estructura de 43 caracteres
    → validarMonto(monto): positivo, máximo 2 decimales
    → validarFechaNoFutura(fecha): no se pueden registrar 
      asientos en fechas futuras
    → 🧠 Mini-Prompt para IA: "Escribe el algoritmo de validación 
      del NIT boliviano en JavaScript. El NIT tiene formato 
      123456789-1 donde el último dígito es verificador calculado 
      con módulo 11 (pesos del 2 al 9 cíclicos). Incluye validación 
      básica de CUF (Código Único de Factura del SIN)."

[ ] Crear js/app.js (punto de entrada)
    → Importar los 4 módulos del núcleo
    → Llamar a iniciarRouter()
    → Cargar dashboard.html por defecto
    → Exponer funciones globales al objeto window (para las vistas)

[ ] Verificar funcionamiento básico
    → Navegar entre vistas del menú lateral sin recargar.
    → Abrir consola y ejecutar: window.utilidades.formatearBs(1234.5)
    → Debe devolver: "Bs 1.234,50"
```

---

# FASE 0.5 — Configuración del Dominio Boliviano

## ¿Qué hace esta fase?
Aquí vive la **ley boliviana traducida a código**. Si mañana el SIN cambia el IVA del 13% al 15%, solo tocamos `bolivia.js` — ningún otro archivo del sistema. Esto es el principio de **Separación de Responsabilidades** (SRP) aplicado al dominio contable.

## Tareas de la Fase 0.5

```text
[ ] Crear js/config/bolivia.js
    → Constantes exportadas:
      - IVA_PORCENTAJE = 13
      - IT_PORCENTAJE = 3
      - IUE_PORCENTAJE = 25
      - RC_IVA_PORCENTAJE = 13
      - SMN_VIGENTE = 2500  // Salario Mínimo Nacional 2026 (verificar)
      - FACTOR_IVA_DENTRO = 1.13
      - MONEDA = "BOB"
      - ZONA_HORARIA = "America/La_Paz"
    → Funcion estaVigente(fecha): compara con fecha actual
    → 🧠 Mini-Prompt para IA: "Genera un archivo JS que exporte todas 
      las constantes tributarias de Bolivia 2026: IVA 13%, IT 3%, 
      IUE 25%, RC-IVA 13%, Salario Mínimo Nacional vigente, factor 
      IVA-por-dentro (1.13), moneda BOB, zona horaria America/La_Paz. 
      Incluye comentarios citando la ley (Ley 843, Art. X)."

[ ] Crear js/config/plan-cuentas.js
    → Árbol del Plan de Cuentas según NC del CTNAC:
      1. ACTIVOS
        1.1 Activos Corrientes
          1.1.01 Efectivo y equivalentes
          1.1.02 Clientes
          1.1.03 Inventario de Mercancías
          1.1.04 IVA Crédito Fiscal
        1.2 Activos No Corrientes
          1.2.01 Maquinaria y Equipo
          1.2.02 Depreciación Acumulada
      2. PASIVOS
        2.1 Pasivos Corrientes
          2.1.01 Proveedores
          2.1.02 Impuestos por Pagar
          2.1.03 Nómina por Pagar
          2.1.04 Aguinaldo por Pagar
      3. PATRIMONIO
      4. INGRESOS
      5. GASTOS Y COSTOS
    → 🧠 Mini-Prompt para IA: "Genera la estructura JSON del Plan 
      de Cuentas para una empresa comercial boliviana según las 
      Normas de Contabilidad del CTNAC. Incluye 5 grupos principales 
      (Activos, Pasivos, Patrimonio, Ingresos, Gastos) con subcuentas 
      típicas: IVA Crédito Fiscal, Aguinaldo por Pagar, IT por Pagar, 
      etc. Formato jerárquico con códigos tipo 1.1.01."

[ ] Crear js/capas/capa3-motor.js (SOLO estructura vacía)
    → Clase MotorContable con métodos stub:
      - registrarAsiento(asiento) { /* pendiente */ }
      - validarPartidaDoble(asiento) { /* pendiente */ }
      - calcularBalanza(periodo) { /* pendiente */ }
    → Este archivo se completará en el Módulo 3, pero ya debe existir.

[ ] Verificar importaciones
    → Desde app.js, importar bolivia.js y plan-cuentas.js
    → Ejecutar en consola: window.BOLIVIA.IVA_PORCENTAJE
    → Debe devolver: 13
```

---

# FASE 0.6 — Datos de Ejemplo Precargados

## ¿Qué hace esta fase?
Para que al abrir el ERP ya haya **algo que mostrar**. Una empresa ficticia ("Comercial Los Andes SRL") con 10 transacciones de ejemplo: 3 compras, 3 ventas, 2 pagos, 1 asiento de nómina, 1 depreciación. Esto permite exponer el prototipo sin tener que cargar datos a mano.

## Tareas de la Fase 0.6

```text
[ ] Crear datos/ejemplo.json
    → Empresa ficticia: Comercial Los Andes SRL
    → NIT: 123456789-1 (de prueba, no real)
    → 3 clientes de ejemplo
    → 3 proveedores de ejemplo
    → 5 productos en inventario
    → 10 transacciones precargadas
    → 🧠 Mini-Prompt para IA: "Genera un JSON de datos de ejemplo 
      para un ERP contable boliviano. Incluye: una empresa ficticia 
      (Comercial Los Andes SRL), 3 clientes con NIT válido de prueba, 
      3 proveedores, 5 productos de inventario con precios en Bs, 
      y 10 transacciones variadas (compras con IVA, ventas con IVA, 
      pagos, asiento de nómina simple). Usar NITs ficticios pero con 
      formato boliviano válido (módulo 11)."

[ ] Crear función cargarDatosEjemplo() en almacenamiento.js
    → Lee datos/ejemplo.json con fetch()
    → Guarda cada colección en localStorage si está vacía
    → Botón "Cargar datos de ejemplo" en dashboard.html

[ ] Verificar carga de datos
    → Abrir dashboard.html
    → Hacer clic en "Cargar datos de ejemplo"
    → Abrir DevTools → Application → LocalStorage
    → Debe haber colecciones: clientes, proveedores, productos, transacciones
```

---

# FASE 0.7 — Smoke Test Final y Commit de Cierre

## ¿Qué es un smoke test?
Una prueba rápida que verifica que **lo esencial funciona**. No probamos cada detalle, solo que el sistema arranca, navega y lee datos.

## Checklist de humo (smoke test)

```text
[ ] Smoke test #1: El sistema arranca
    → Abrir index.html en el navegador
    → Ver el menú lateral y el dashboard de bienvenida
    → Consola del navegador (F12) sin errores rojos

[ ] Smoke test #2: La navegación funciona
    → Hacer clic en "Compras" en el menú
    → Debe cargar vistas/compras.html en el área principal
    → Hacer clic en "Ventas" → debe cargar vistas/ventas.html
    → Usar botón "Atrás" del navegador → debe funcionar

[ ] Smoke test #3: Las utilidades funcionan
    → Abrir consola del navegador
    → Ejecutar: window.utilidades.formatearBs(5650)
    → Debe devolver: "Bs 5.650,00"
    → Ejecutar: window.utilidades.calcularIVA(5650)
    → Debe devolver: 650 (el IVA de 5650 con IVA incluido)

[ ] Smoke test #4: Los validadores funcionan
    → Ejecutar: window.validadores.validarNIT("123456789")
    → Debe devolver: true o false (según el dígito verificador)
    → Ejecutar: window.validadores.validarMonto(-100)
    → Debe devolver: false (no permite negativos)

[ ] Smoke test #5: La configuración boliviana está cargada
    → Ejecutar: window.BOLIVIA.IVA_PORCENTAJE
    → Debe devolver: 13
    → Ejecutar: window.BOLIVIA.MONEDA
    → Debe devolver: "BOB"

[ ] Commit de cierre del Módulo 0
    → git add .
    → git commit -m "feat(modulo-0): andamio completo del ERP Contable Bolivia
    
      - Estructura de carpetas alineada con las 5 capas del ERP
      - Núcleo JS: enrutador, almacenamiento, utilidades, validadores
      - Configuración del dominio boliviano (Ley 843, NC CTNAC)
      - Datos de ejemplo precargados (Comercial Los Andes SRL)
      - Smoke test: todos los tests pasan
      
      Próximo paso: Módulo 1 - Capa 1 (Documentos Fuente)"
```

---

## 🎯 Criterios de Aceptación del Módulo 0

El Módulo 0 se considera **completado** cuando:

- [x] El proyecto está en GitHub (o Git local) con commits limpios
- [x] La estructura de carpetas coincide exactamente con la Fase 0.1
- [x] El smoke test de 5 puntos pasa sin errores
- [x] Los dos ADRs están escritos y versionados
- [x] Se puede explicar en 2 minutos por qué se eligió cada decisión

---

## 🚀 Próximos Módulos (adelanto)

Una vez completado el Módulo 0, estos son los siguientes:

| Módulo | Tema | Duración | Depende de |
|---|---|---|---|
| **Módulo 1** | Capa 1 — Documentos Fuente | 3–4 h | Módulo 0 |
| **Módulo 2** | Capa 2 — Compras y Ventas | 6–8 h | Módulo 1 |
| **Módulo 3** | Capa 3 — Motor Contable (Partida Doble) | 8–10 h | Módulo 2 |
| **Módulo 4** | Capa 2 — Nómina Boliviana | 6–8 h | Módulo 3 |
| **Módulo 5** | Capa 2 — Impuestos (IVA, IT, IUE) | 6–8 h | Módulo 3 |
| **Módulo 6** | Capa 4 — Estados Financieros | 5–7 h | Módulo 5 |
| **Módulo 7** | Capa 5 — Cumplimiento SIN | 4–6 h | Módulo 6 |
| **Módulo 8** | Migración a SaaS real (opcional) | 10–15 h | Módulo 7 |

---

## ⚠️ Advertencia final

Este módulo es **aburrido pero crítico**. La tentación es saltarlo y empezar a programar lógica de negocio ("quiero ver el Kardex funcionando ya"). **Resiste esa tentación.** Un ERP construido sobre cimientos débiles se cae en el Módulo 3, cuando el motor contable empieza a registrar asientos y descubre que los NITs no se validan o los montos se redondean mal. Dedica las 4-6 horas completas a este módulo — te ahorrarás 40 horas de debugging más adelante.

---

**¿Siguiente paso?** Cuando completes este Módulo 0, avísame y generamos el **ROADMAP_MODULO_1_DOCUMENTOS_FUENTE.md** con el mismo formato. 🚀