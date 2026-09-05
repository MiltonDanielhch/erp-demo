# 📁 ROADMAP_MODULO_8_MIGRACION_SAAS.md

**Proyecto:** ERP Contable Integral Boliviano (Prototipo Educativo / Portafolio)
**Arquitectura:** Migración de Frontend Vanilla JS + LocalStorage → Full-Stack SaaS
**Versión:** 1.0.0 · **Formato:** Guía Arquitectónica Explicativa
**Tiempo estimado:** 10–15 horas · **Bloquea:** Nada (módulo opcional)
**Depende de:** Módulos 0–7 completados

> **⚠️ MÓDULO OPCIONAL:** Este módulo **NO es necesario** para completar el prototipo educativo. Si tu objetivo es aprender, exponer, o mostrar un portafolio funcional, los Módulos 0–7 son suficientes. Este módulo solo se aborda si quieres **transformar el prototipo en un SaaS productivo real** con backend, base de datos, autenticación, multi-usuario y conexión real con el SIN. Es un salto significativo en complejidad.

> **Objetivo del Módulo:** Migrar el ERP Contable Boliviano de un prototipo frontend (Vanilla JS + LocalStorage) a un **SaaS full-stack productivo** con backend Node.js, base de datos PostgreSQL, autenticación JWT, soporte multi-empresa (multi-NIT), integración real con la API del SIN para facturación electrónica, despliegue en la nube con Docker, y un modelo de suscripción. Este módulo transforma un proyecto de aprendizaje en un **emprendimiento comercial viable**.

> **Nota de alcance:** Este módulo es el más largo y complejo de toda la guía. No intentes hacerlo todo de golpe. Cada fase puede abordarse de forma independiente, y puedes detenerte en cualquier punto: un ERP con backend pero sin multi-empresa sigue siendo funcional; un ERP con multi-empresa pero sin conexión real al SIN sigue siendo útil. El objetivo es que **cada fase agregue valor incremental**.

---

## 🗺️ Mapa del Módulo

```text
Módulo 8 (Opcional — Migración a SaaS)
├── Fase 8.1 → Teoría: Por qué migrar y arquitectura objetivo
├── Fase 8.2 → ADRs: Decisiones arquitectónicas del SaaS
├── Fase 8.3 → Backend: Node.js + Express + estructura modular
├── Fase 8.4 → Base de datos: PostgreSQL + esquema contable
├── Fase 8.5 → Autenticación: JWT + roles y permisos
├── Fase 8.6 → Multi-empresa: Soporte para múltiples NITs
├── Fase 8.7 → API REST: Endpoints para cada módulo
├── Fase 8.8 → Migración del frontend: de LocalStorage a API
├── Fase 8.9 → Integración real con el SIN (SIAT)
├── Fase 8.10 → Seguridad: Encriptación, auditoría, backups
├── Fase 8.11 → Infraestructura: Docker + despliegue
├── Fase 8.12 → Modelo de negocio: Suscripción y facturación
├── Fase 8.13 → Smoke test final y commit de cierre
```

---

## 🟥 Estado: `[ ] Pendiente` · `[Opcional]`

---

# FASE 8.1 — Teoría: Por Qué Migrar y Arquitectura Objetivo

## ¿Por qué migrar de LocalStorage a un SaaS real?

```text
╔══════════════════════════════════════════════════════════════════╗
║  PROTOTIPO EDUCATIVO (Módulos 0-7)    │  SAAS PRODUCTIVO (Módulo 8) ║
║───────────────────────────────────────┼───────────────────────────────║
║  Datos en localStorage del navegador  │  Datos en PostgreSQL          ║
║  Un solo usuario                      │  Multi-usuario con roles      ║
║  Una sola empresa                     │  Multi-empresa (multi-NIT)    ║
║  Sin autenticación                    │  Login con JWT                ║
║  Sin conexión al SIN                  │  API real del SIN (SIAT)     ║
║  Sin backups                          │  Backups automáticos          ║
║  Sin auditoría                        │  Log de auditoría completo    ║
║  Funciona solo en un navegador        │  Funciona en cualquier device ║
║  Datos se pierden al limpiar caché    │  Datos persistentes y seguros ║
║  No se puede vender                   │  Modelo de suscripción        ║
╚═══════════════════════════════════════════════════════════════════╝
```

## Arquitectura objetivo del SaaS

```text
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTES (Navegadores)                   │
│  Empresa A (NIT 111)  │  Empresa B (NIT 222)  │  Empresa C  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (SPA)                           │
│  HTML + CSS + Vanilla JS (o migrar a React/Vue si se desea) │
│  Consume la API REST del backend                            │
│  Autenticación: JWT token en cada request                   │
└────────────────────────┬────────────────────────────────────┘
                         │ API REST (JSON)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)              │
│  ├── /api/auth       → Login, registro, JWT                │
│  ├── /api/empresas   → Gestión multi-NIT                   │
│  ├── /api/compras    → Ciclo de compras                    │
│  ├── /api/ventas     → Ciclo de ventas                     │
│  ├── /api/nomina     → Nómina boliviana                    │
│  ├── /api/impuestos  → IVA, IT, IUE, RC-IVA               │
│  ├── /api/contable   → Motor contable, asientos            │
│  ├── /api/estados    → Estados financieros                 │
│  ├── /api/sin        → Integración con el SIN              │
│  └── /api/auditoria  → Log de auditoría                    │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL / ORM
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS (PostgreSQL)               │
│  empresas, usuarios, clientes, proveedores, productos,      │
│  documentos, asientos, lineas_asiento, libro_mayor,         │
│  periodos_fiscales, nominas, empleados, impuestos,          │
│  facturas_electronicas, auditoria_log                       │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVICIOS EXTERNOS                       │
│  SIN (SIAT API)  │  Fundempresa  │  Bancos (Open Banking)  │
└─────────────────────────────────────────────────────────────┘
```

## Tareas de la Fase 8.1

```text
[ ] Crear docs/aprendizaje/28-migracion-saas-explicada.md
    → Explicación teórica de por qué migrar (máximo 2 páginas).
    → Comparativa: prototipo vs. SaaS productivo.
    → Riesgos y beneficios de la migración.
    → 🧠 Mini-Prompt para IA: "Escribe una explicación didáctica 
      de por qué migrar un prototipo educativo de ERP (frontend 
      vanilla + localStorage) a un SaaS productivo (backend + 
      base de datos + autenticación). Incluye: beneficios 
      (multi-usuario, persistencia, seguridad, conexión al SIN), 
      riesgos (complejidad, costo, tiempo), y una comparativa 
      clara entre ambas arquitecturas. Máximo 600 palabras."

[ ] Crear docs/aprendizaje/29-arquitectura-saas-detalle.md
    → Diagrama de arquitectura del SaaS objetivo.
    → Explicar cada capa: frontend, backend, DB, servicios externos.
    → 🧠 Mini-Prompt para IA: "Explica la arquitectura de un SaaS 
      de ERP contable para Bolivia. Incluye: frontend SPA, backend 
      Node.js + Express, base de datos PostgreSQL, autenticación 
      JWT, integración con la API del SIN (SIAT), y servicios 
      externos. Usa diagramas ASCII. Máximo 700 palabras."
```

---

# FASE 8.2 — ADRs: Decisiones Arquitectónicas del SaaS

## ¿Qué hace esta fase?
Documenta las **decisiones arquitectónicas clave** del SaaS. Cada ADR registra el contexto, la decisión tomada, y las consecuencias. Esto es crítico para un emprendimiento: si en 6 meses alguien pregunta "¿por qué usamos PostgreSQL y no MySQL?", la respuesta está documentada.

## Tareas de la Fase 8.2

```text
[ ] Crear docs/adr/ADR-003-backend-node-express.md
    → Contexto: Necesitamos un backend para el SaaS.
    → Decisión: Node.js + Express (no Django, no Rails, no Spring).
    → Razón: El equipo ya conoce JavaScript del frontend.
      Express es ligero y fácil de aprender. Gran ecosistema npm.
    → Alternativas descartadas: Django (Python, curva de aprendizaje),
      Spring (Java, excesivo para este tamaño).

[ ] Crear docs/adr/ADR-004-base-datos-postgresql.md
    → Contexto: Necesitamos una base de datos relacional.
    → Decisión: PostgreSQL (no MySQL, no MongoDB).
    → Razón: Soporte nativo para transacciones ACID (crítico para 
      contabilidad), tipos de datos JSON para flexibilidad, 
      y mejor manejo de concurrencia que MySQL.
    → Alternativas descartadas: MongoDB (NoSQL no es ideal para 
      partida doble), MySQL (menos features que PostgreSQL).

[ ] Crear docs/adr/ADR-005-autenticacion-jwt.md
    → Contexto: Necesitamos autenticación multi-usuario.
    → Decisión: JWT (JSON Web Tokens) con refresh tokens.
    → Razón: Stateless (no requiere sesión en servidor), 
      fácil de implementar, estándar de la industria.
    → Alternativas descartadas: Sesiones con cookies (requiere 
      estado en servidor), OAuth2 completo (excesivo para MVP).

[ ] Crear docs/adr/ADR-006-multi-empresa-multi-nit.md
    → Contexto: El SaaS debe soportar múltiples empresas.
    → Decisión: Arquitectura multi-tenant con columna empresa_id 
      en cada tabla (no bases de datos separadas).
    → Razón: Más simple de mantener, permite compartir catálogo 
      de cuentas, más barato en infraestructura.
    → Alternativas descartadas: Una DB por empresa (complejo 
      de mantener), esquema por empresa (PostgreSQL no lo 
      maneja tan bien como tabla por tenant).

[ ] Crear docs/adr/ADR-007-integracion-sin-api.md
    → Contexto: Necesitamos conectarnos al SIN para facturación.
    → Decisión: Usar la API pública del SIAT con certificado digital.
    → Razón: Es el método oficial del SIN. Permite emitir facturas 
      electrónicas en tiempo real.
    → Alternativas descartadas: Portal web manual (no escala), 
      facturación offline (el SIN la está descontinuando).
```

---

# FASE 8.3 — Backend: Node.js + Express + Estructura Modular

## ¿Qué hace esta fase?
Construye el **esqueleto del backend** con Node.js y Express. La estructura sigue el mismo principio modular del frontend: cada módulo del ERP tiene su propia carpeta en el backend.

## Estructura de carpetas del backend

```text
backend/
├── package.json
├── .env.example
├── tsconfig.json
│
├── src/
│   ├── server.js              ← Entry point (Express app)
│   ├── app.js                 ← Configuración de middleware
│   │
│   ├── config/
│   │   ├── database.js        ← Conexión a PostgreSQL
│   │   ├── env.js             ← Variables de entorno
│   │   └── bolivia.js         ← Constantes bolivianas (IVA, IT, etc.)
│   │
│   ├── middleware/
│   │   ├── auth.js            ← Verifica JWT en cada request
│   │   ├── empresa.js         ← Verifica que el usuario pertenece a la empresa
│   │   ├── errores.js         ← Manejador global de errores
│   │   └── validacion.js      ← Valida esquemas con Zod
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   └── auth.model.js
│   │   │
│   │   ├── empresas/
│   │   │   ├── empresas.routes.js
│   │   │   ├── empresas.controller.js
│   │   │   ├── empresas.service.js
│   │   │   └── empresas.model.js
│   │   │
│   │   ├── contabilidad/
│   │   │   ├── contabilidad.routes.js
│   │   │   ├── contabilidad.controller.js
│   │   │   ├── contabilidad.service.js
│   │   │   └── contabilidad.model.js
│   │   │
│   │   ├── compras/
│   │   ├── ventas/
│   │   ├── inventario/
│   │   ├── nomina/
│   │   ├── impuestos/
│   │   ├── estados-financieros/
│   │   └── sin-integracion/
│   │
│   └── utils/
│       ├── logger.js          ← Logs del sistema
│       ├── auditoria.js       ← Log de auditoría
│       └── helpers.js         ← Funciones auxiliares
│
├── tests/
│   ├── unit/
│   └── integration/
│
└── prisma/                    ← Esquema de base de datos
    └── schema.prisma
```

## Tareas de la Fase 8.3

```text
[ ] Inicializar proyecto Node.js
    → cd backend && npm init -y
    → npm install express cors dotenv zod jsonwebtoken bcryptjs
    → npm install -D nodemon typescript @types/node @types/express ts-node jest

[ ] Configurar TypeScript
    → npx tsc --init
    → Configurar: outDir: ./dist, rootDir: ./src, strict: true
    → Configurar: esModuleInterop: true, resolveJsonModule: true

[ ] Crear la estructura de carpetas descrita arriba
    → Cada módulo tiene: routes, controller, service, model.
    → Patrón: Routes → Controller → Service → Model → DB.
    → 🧠 Mini-Prompt para IA: "Genera la estructura de carpetas 
      para un backend Node.js + Express + TypeScript de un ERP 
      contable. Cada módulo debe tener: routes (endpoints), 
      controller (lógica HTTP), service (lógica de negocio), 
      model (acceso a datos). Incluye middleware de autenticación, 
      manejo de errores, y validación con Zod."

[ ] Crear el entry point (server.js)
    → Configura Express con middleware: cors, json, urlencoded.
    → Monta las rutas de cada módulo.
    → Configura el manejador global de errores.
    → Escucha en el puerto definido en .env.

[ ] Crear el middleware de autenticación (auth.js)
    → Verifica el header Authorization: Bearer {token}.
    → Valida el JWT con la clave secreta.
    → Extrae el userId y empresaId del token.
    → Si el token es inválido → responde 401 Unauthorized.
    → 🧠 Mini-Prompt para IA: "Escribe un middleware de 
      autenticación JWT para Express.js. Debe: extraer el 
      token del header Authorization, validarlo con 
      jsonwebtoken, extraer userId y empresaId, y adjuntarlos 
      al request. Si el token es inválido o expiró, responder 
      401 con mensaje descriptivo."

[ ] Crear el middleware de empresa (empresa.js)
    → Verifica que el usuario autenticado pertenece a la empresa 
      que está intentando acceder.
    → Previene que un usuario de la Empresa A acceda a datos 
      de la Empresa B.
    → Si no pertenece → responde 403 Forbidden.

[ ] Crear el manejador global de errores (errores.js)
    → Captura errores de todos los módulos.
    → Devuelve respuestas JSON consistentes: 
      { error: true, mensaje: "...", codigo: 400/401/403/500 }.
    → Loguea el error en consola y en el sistema de logs.

[ ] Crear el sistema de logs (logger.js)
    → Registra: fecha, nivel (INFO/WARN/ERROR), módulo, mensaje.
    → En desarrollo: loguea a consola.
    → En producción: loguea a archivo o servicio externo.

[ ] Crear el log de auditoría (auditoria.js)
    → Registra cada acción del usuario: quién, qué, cuándo.
    → Ejemplo: "Usuario juan@empresa.com creó asiento AD-2026-09-001".
    → Se guarda en la tabla auditoria_log de la DB.
    → ⚠️ Crítico para cumplimiento ante el SIN y auditorías externas.
```

---

# FASE 8.4 — Base de Datos: PostgreSQL + Esquema Contable

## ¿Qué hace esta fase?
Diseña el **esquema de base de datos** para el ERP contable. Este es el paso más crítico del Módulo 8: si el esquema está mal diseñado, todo lo demás se complica. El esquema debe soportar la partida doble, la trazabilidad completa, y el multi-tenant.

## Esquema Prisma (ORM para Node.js)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// MULTI-TENANT: Empresa es la raíz de todo
// ============================================
model Empresa {
  id            String   @id @default(uuid())
  nit           String   @unique
  razonSocial   String
  regimenTributario String  // RG, RTS, STI, RAU, SIETE-RG
  direccion     String?
  telefono      String?
  email         String?
  activo        Boolean  @default(true)
  creadoEn      DateTime @default(now())
  
  usuarios      Usuario[]
  clientes      Cliente[]
  proveedores   Proveedor[]
  productos     Producto[]
  documentos    Documento[]
  asientos      Asiento[]
  periodosFiscales PeriodoFiscal[]
  empleados     Empleado[]
}

// ============================================
// AUTENTICACIÓN Y USUARIOS
// ============================================
model Usuario {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String
  nombres       String
  apellidos     String
  rol           String   // ADMIN, CONTADOR, CAJERO, AUDITOR, RRHH
  activo        Boolean  @default(true)
  ultimoAcceso  DateTime?
  creadoEn      DateTime @default(now())
  
  empresaId     String
  empresa       Empresa  @relation(fields: [empresaId], references: [id])
  
  auditoriaLogs AuditoriaLog[]
}

// ============================================
// CATÁLOGOS
// ============================================
model Cliente {
  id            String   @id @default(uuid())
  nit           String
  razonSocial   String
  telefono      String?
  email         String?
  direccion     String?
  limiteCredito Float    @default(0)
  saldoActual   Float    @default(0)
  estado        String   @default("ACTIVO")
  regimenTributario String @default("REGIMEN_GENERAL")
  creadoEn      DateTime @default(now())
  
  empresaId     String
  empresa       Empresa  @relation(fields: [empresaId], references: [id])
  
  ventas        Venta[]
  
  @@unique([empresaId, nit])
}

model Proveedor {
  id            String   @id @default(uuid())
  nit           String
  razonSocial   String
  condicionesPago String  @default("CONTADO")
  saldoPorPagar Float    @default(0)
  estado        String   @default("ACTIVO")
  esAgenteRetencion Boolean @default(false)
  creadoEn      DateTime @default(now())
  
  empresaId     String
  empresa       Empresa  @relation(fields: [empresaId], references: [id])
  
  compras       Compra[]
  
  @@unique([empresaId, nit])
}

model Producto {
  id            String   @id @default(uuid())
  codigo        String
  nombre        String
  categoria     String?
  unidadMedida  String   @default("UNIDAD")
  precioVenta   Float
  costoUltimo   Float
  stockActual   Int      @default(0)
  stockMinimo   Int      @default(0)
  activo        Boolean  @default(true)
  creadoEn      DateTime @default(now())
  
  empresaId     String
  empresa       Empresa  @relation(fields: [empresaId], references: [id])
  
  kardex        Kardex[]
  
  @@unique([empresaId, codigo])
}

// ============================================
// CAPA 1: DOCUMENTOS FUENTE
// ============================================
model Documento {
  id            String   @id @default(uuid())
  tipo          String   // FACTURA_COMPRA, FACTURA_VENTA, RECIBO_CAJA, etc.
  numero        String
  fechaEmision  DateTime
  fechaRegistro DateTime @default(now())
  periodoContable String  // "2026-09"
  montoTotal    Float
  estado        String   @default("PENDIENTE")  // PENDIENTE, VALIDADO, RECHAZADO
  nitContraparte String?
  cuf           String?
  observaciones String?
  creadoEn      DateTime @default(now())
  
  empresaId     String
  empresa       Empresa  @relation(fields: [empresaId], references: [id])
  
  creadoPorId   String
  creadoPor     Usuario  @relation(fields: [creadoPorId], references: [id])
  
  asientos      Asiento[]
  
  @@unique([empresaId, tipo, numero])
}

// ============================================
// CAPA 3: MOTOR CONTABLE
// ============================================
model Asiento {
  id            String   @id @default(uuid())
  numero        String   // "AD-2026-09-001"
  fecha         DateTime
  periodoContable String
  tipo          String   // COMPRA, VENTA, NOMINA, AJUSTE, CIERRE
  concepto      String
  estado        String   @default("PROCESADO")
  totalDebe     Float
  totalHaber    Float
  cuadra        Boolean  @default(true)
  creadoEn      DateTime @default(now())
  
  empresaId     String
  empresa       Empresa  @relation(fields: [empresaId], references: [id])
  
  documentoFuenteId String?
  documentoFuente   Documento? @relation(fields: [documentoFuenteId], references: [id])
  
  lineas        LineaAsiento[]
  
  @@unique([empresaId, numero])
}

model LineaAsiento {
  id            String   @id @default(uuid())
  cuentaCodigo  String   // "1.1.03"
  cuentaNombre  String
  debe          Float    @default(0)
  haber         Float    @default(0)
  descripcion   String?
  
  asientoId     String
  asiento       Asiento  @relation(fields: [asientoId], references: [id])
}

model LibroMayor {
  id            String   @id @default(uuid())
  cuentaCodigo  String
  fecha         DateTime
  asientoId     String
  debe          Float    @default(0)
  haber         Float    @default(0)
  saldoAcumulado Float
  periodoContable String
  
  empresaId     String
  
  @@index([empresaId, cuentaCodigo, periodoContable])
}

// ============================================
// NÓMINA BOLIVIANA
// ============================================
model Empleado {
  id            String   @id @default(uuid())
  ci            String
  nombres       String
  apellidos     String
  fechaIngreso  DateTime
  fechaRetiro   DateTime?
  cargo         String
  salarioBase   Float
  estado        String   @default("ACTIVO")
  motivoRetiro  String?
  creadoEn      DateTime @default(now())
  
  empresaId     String
  empresa       Empresa  @relation(fields: [empresaId], references: [id])
  
  nominas       Nomina[]
  
  @@unique([empresaId, ci])
}

model Nomina {
  id            String   @id @default(uuid())
  periodo       String   // "2026-09"
  totalDevengado Float
  totalDeducciones Float
  netoAPagar    Float
  aporteAFP     Float
  rcIVA         Float
  aportesPatronales Float
  estado        String   @default("CALCULADA")
  creadoEn      DateTime @default(now())
  
  empleadoId    String
  empleado      Empleado @relation(fields: [empleadoId], references: [id])
  
  empresaId     String
}

// ============================================
// IMPUESTOS
// ============================================
model PeriodoFiscal {
  id            String   @id @default(uuid())
  periodo       String   // "2026-09"
  tipo          String   @default("MENSUAL")
  estado        String   @default("ABIERTO")
  
  // IVA
  ivaDebito     Float    @default(0)
  ivaCredito    Float    @default(0)
  ivaPorPagar   Float    @default(0)
  
  // IT
  ingresosBrutos Float   @default(0)
  itPorPagar    Float    @default(0)
  itAcumuladoAnual Float @default(0)
  
  // Fechas
  fechaVencimiento DateTime?
  fechaDeclaracion DateTime?
  fechaPago     DateTime?
  
  empresaId     String
  empresa       Empresa  @relation(fields: [empresaId], references: [id])
  
  @@unique([empresaId, periodo])
}

// ============================================
// AUDITORÍA
// ============================================
model AuditoriaLog {
  id            String   @id @default(uuid())
  accion        String   // "CREAR_ASIENTO", "DECLARAR_FORM200", etc.
  modulo        String   // "contabilidad", "impuestos", etc.
  detalle       String
  ipOrigen      String?
  fecha         DateTime @default(now())
  
  usuarioId     String
  usuario       Usuario  @relation(fields: [usuarioId], references: [id])
  
  empresaId     String
  
  @@index([empresaId, fecha])
}
```

## Tareas de la Fase 8.4

```text
[ ] Instalar PostgreSQL localmente o usar Docker
    → Opción 1: Instalar PostgreSQL desde postgresql.org
    → Opción 2: Usar Docker (ver Fase 8.11)
    → Crear base de datos: erp_contable_bolivia

[ ] Instalar y configurar Prisma
    → npm install prisma @prisma/client
    → npx prisma init
    → Configurar el provider como "postgresql" en schema.prisma
    → Configurar DATABASE_URL en .env

[ ] Crear el esquema Prisma descrito arriba
    → Copiar el schema.prisma completo.
    → Ejecutar: npx prisma migrate dev --name init
    → Verificar que las tablas se crearon correctamente.
    → 🧠 Mini-Prompt para IA: "Genera un esquema Prisma completo 
      para un ERP contable boliviano multi-tenant. Incluye: 
      Empresa (tenant raíz), Usuario, Cliente, Proveedor, 
      Producto, Documento, Asiento, LineaAsiento, LibroMayor, 
      Empleado, Nomina, PeriodoFiscal, y AuditoriaLog. Cada 
      tabla debe tener empresaId como foreign key para 
      multi-tenancy. Incluye índices para consultas frecuentes."

[ ] Ejecutar la migración inicial
    → npx prisma migrate dev --name init
    → npx prisma generate
    → Verificar que Prisma Client se generó correctamente.

[ ] Crear seeds de datos de ejemplo
    → prisma/seed.js
    → Cargar: 1 empresa, 1 usuario admin, 3 clientes, 
      3 proveedores, 5 productos, 10 documentos.
    → Ejecutar: npx prisma db seed
```

---

# FASE 8.5 — Autenticación: JWT + Roles y Permisos

## ¿Qué hace esta fase?
Implementa la **autenticación con JWT** y el sistema de **roles y permisos**. Cada usuario tiene un rol que determina qué puede hacer dentro del ERP.

## Roles y permisos

```text
╔══════════════════════════════════════════════════════════════════╗
║ ROL       │ PERMISOS                                            ║
║───────────┼─────────────────────────────────────────────────────║
║ ADMIN     │ Todo: configuración, usuarios, empresa, módulos     ║
║ CONTADOR  │ Contabilidad, impuestos, estados financieros,       ║
║           │ cumplimiento, asientos manuales                     ║
║ CAJERO    │ Ventas, compras, tesorería, facturación             ║
║ RRHH      │ Nómina, empleados, provisiones                      ║
║ AUDITOR   │ Solo lectura: libros, balanzas, estados, auditoría  ║
╚═══════════════════════════════════════════════════════════════════╝
```

## Tareas de la Fase 8.5

```text
[ ] Crear el módulo de autenticación (auth)
    → auth.routes.js: POST /api/auth/login, POST /api/auth/registro, 
      POST /api/auth/refresh, POST /api/auth/logout
    → auth.controller.js: maneja las peticiones HTTP.
    → auth.service.js: lógica de negocio (validar credenciales, 
      generar tokens).
    → auth.model.js: acceso a la tabla Usuario.

[ ] Implementar login
    → Recibe: email, password.
    → Busca el usuario en la DB.
    → Compara el password con bcrypt.
    → Si válido → genera JWT con: userId, empresaId, rol.
    → Devuelve: { token, refreshToken, usuario }.
    → 🧠 Mini-Prompt para IA: "Escribe un endpoint de login en 
      Express.js con JWT. Debe: recibir email y password, 
      buscar el usuario en PostgreSQL con Prisma, comparar 
      el password con bcryptjs, generar un JWT con userId, 
      empresaId y rol, y devolver el token más un refresh 
      token. Maneja errores: usuario no existe, password 
      incorrecto, usuario inactivo."

[ ] Implementar registro de usuario
    → Solo el ADMIN puede crear nuevos usuarios.
    → Recibe: email, password, nombres, apellidos, rol.
    → Hashea el password con bcrypt antes de guardar.
    → Verifica que el email no exista.

[ ] Implementar refresh token
    → El access token expira en 15 minutos.
    → El refresh token expira en 7 días.
    → Cuando el access token expira, el frontend usa el 
      refresh token para obtener uno nuevo.

[ ] Implementar el middleware de roles
    → verificarRol(rolesPermitidos): middleware que verifica 
      que el usuario tiene uno de los roles permitidos.
    → Ejemplo: solo ADMIN y CONTADOR pueden registrar asientos 
      manuales.
    → Ejemplo: solo AUDITOR puede acceder a papeles de trabajo.

[ ] Implementar el log de auditoría en autenticación
    → Cada login exitoso → registra en auditoria_log.
    → Cada login fallido → registra en auditoria_log.
    → Cada cambio de password → registra en auditoria_log.
```

---

# FASE 8.6 — Multi-Empresa: Soporte para Múltiples NITs

## ¿Qué hace esta fase?
Implementa el **soporte multi-empresa** (multi-tenant). Cada empresa es un "tenant" independiente con sus propios datos, usuarios, y configuración. Un usuario puede pertenecer a una sola empresa (para simplificar), pero el sistema está diseñado para soportar múltiples empresas simultáneamente.

## Arquitectura multi-tenant

```text
ESTRATEGIA: Columna empresa_id en cada tabla (shared database, 
            shared schema, tenant_id column)

VENTAJAS:
✓ Simple de implementar y mantener
✓ Una sola base de datos (más barato)
✓ Migraciones y backups centralizados
✓ Fácil de escalar horizontalmente

DESVENTAJAS:
✗ Hay que filtrar por empresa_id en CADA query
✗ Un error en el filtro puede exponer datos de otra empresa
✗ No hay aislamiento físico de datos

MITIGACIÓN:
• Middleware de empresa en CADA request
• Prisma con where: { empresaId } obligatorio
• Tests de integración que verifican el aislamiento
```

## Tareas de la Fase 8.6

```text
[ ] Implementar el middleware de empresa
    → Extrae empresaId del JWT.
    → Lo adjunta al request como req.empresaId.
    → Todos los servicios deben usar este empresaId para filtrar.

[ ] Implementar el service de empresas
    → crearEmpresa(datos): registra una nueva empresa (NIT, razón social).
    → obtenerEmpresa(empresaId): obtiene los datos de la empresa.
    → actualizarEmpresa(empresaId, datos): modifica la configuración.
    → obtenerEmpresasDelUsuario(userId): lista las empresas del usuario.

[ ] Implementar la gestión de usuarios por empresa
    → El ADMIN de una empresa puede crear usuarios para esa empresa.
    → Un usuario no puede acceder a datos de otra empresa.
    → Verificación en cada query: WHERE empresa_id = {empresaId}.

[ ] Implementar el plan de cuentas por empresa
    → Cada empresa puede tener su propio plan de cuentas.
    → O usar el plan de cuentas estándar boliviano.
    → Se carga al crear la empresa.

[ ] Crear tests de aislamiento multi-tenant
    → Test: crear 2 empresas con datos distintos.
    → Test: usuario de Empresa A intenta acceder a datos de Empresa B.
    → Test: verificar que la respuesta es 403 Forbidden.
    → Test: verificar que los datos de Empresa B no se filtran.
    → 🧠 Mini-Prompt para IA: "Escribe tests de integración en 
      Jest para verificar el aislamiento multi-tenant en un ERP. 
      Crea 2 empresas con datos distintos. Verifica que un usuario 
      de la Empresa A no puede acceder a datos de la Empresa B. 
      Verifica que las queries siempre filtran por empresa_id. 
      Incluye tests para: asientos, clientes, productos, impuestos."
```

---

# FASE 8.7 — API REST: Endpoints para Cada Módulo

## ¿Qué hace esta fase?
Define los **endpoints de la API REST** para cada módulo del ERP. El frontend consumirá estos endpoints en lugar de usar localStorage.

## Endpoints principales

```text
AUTENTICACIÓN:
  POST   /api/auth/login          → Login
  POST   /api/auth/registro       → Registro (solo ADMIN)
  POST   /api/auth/refresh        → Refresh token
  POST   /api/auth/logout         → Logout

EMPRESAS:
  GET    /api/empresas             → Listar empresas del usuario
  POST   /api/empresas             → Crear empresa (solo ADMIN)
  GET    /api/empresas/:id         → Obtener empresa
  PUT    /api/empresas/:id         → Actualizar empresa

CATÁLOGOS:
  GET    /api/clientes             → Listar clientes
  POST   /api/clientes             → Crear cliente
  GET    /api/proveedores          → Listar proveedores
  POST   /api/proveedores          → Crear proveedor
  GET    /api/productos            → Listar productos
  POST   /api/productos            → Crear producto

COMPRAS:
  POST   /api/compras/solicitud    → Crear solicitud de compra
  POST   /api/compras/orden        → Generar orden de compra
  POST   /api/compras/recepcion    → Registrar recepción
  POST   /api/compras/factura      → Registrar factura proveedor
  POST   /api/compras/pago         → Registrar pago
  GET    /api/compras/cuentas-por-pagar → Listar cuentas por pagar

VENTAS:
  POST   /api/ventas/cotizacion    → Crear cotización
  POST   /api/ventas/pedido        → Confirmar pedido
  POST   /api/ventas/despacho      → Registrar despacho
  POST   /api/ventas/factura       → Emitir factura de venta
  POST   /api/ventas/cobro         → Registrar cobro
  GET    /api/ventas/cuentas-por-cobrar → Listar cuentas por cobrar

CONTABILIDAD:
  POST   /api/contable/asientos    → Registrar asiento
  GET    /api/contable/diario      → Obtener libro diario
  GET    /api/contable/mayor/:cuenta → Obtener libro mayor
  GET    /api/contable/balanza     → Obtener balanza de comprobación
  POST   /api/contable/ajustes     → Registrar asientos de ajuste
  POST   /api/contable/cierre      → Cerrar ejercicio

IMPUESTOS:
  GET    /api/impuestos/iva/:periodo → Conciliación IVA
  GET    /api/impuestos/it/:periodo  → Cálculo IT
  GET    /api/impuestos/iue/:año     → Cálculo IUE
  POST   /api/impuestos/compensar-it → Compensar IT vs IUE
  GET    /api/impuestos/formulario/:tipo/:periodo → Generar formulario

ESTADOS FINANCIEROS:
  GET    /api/estados/resultados/:periodo → Estado de resultados
  GET    /api/estados/balance/:fecha      → Balance general
  GET    /api/estados/flujo/:periodo      → Flujo de efectivo
  GET    /api/estados/ratios/:periodo     → Razones financieras

SIN:
  POST   /api/sin/factura          → Emitir factura electrónica
  GET    /api/sin/cuis             → Obtener CUIS
  GET    /api/sin/cufd             → Obtener CUFD
  POST   /api/sin/lcv              → Generar LCV
```

## Tareas de la Fase 8.7

```text
[ ] Crear los routes para cada módulo
    → Cada módulo tiene su archivo de routes.
    → Las rutas usan el middleware de autenticación.
    → Las rutas usan el middleware de empresa.
    → Las rutas usan el middleware de validación (Zod).

[ ] Crear los controllers para cada módulo
    → Cada controller maneja las peticiones HTTP.
    → Extrae los parámetros del request.
    → Llama al service correspondiente.
    → Devuelve la respuesta JSON.

[ ] Crear los services para cada módulo
    → Cada service contiene la lógica de negocio.
    → Accede a la DB a través de Prisma.
    → Aplica las reglas bolivianas (IVA ÷ 1.13, IT × 3%, etc.).
    → Genera los asientos contables.
    → Loguea en auditoría.

[ ] Implementar validación con Zod
    → Cada endpoint valida el input con Zod.
    → Ejemplo: crearCliente valida que el NIT sea válido.
    → Si la validación falla → responde 400 con los errores.
    → 🧠 Mini-Prompt para IA: "Escribe esquemas de validación 
      Zod para un ERP contable boliviano. Incluye: crearCliente 
      (NIT válido, razón social requerida), crearAsiento 
      (mínimo 2 líneas, Debe = Haber), calcularNomina 
      (salario > 0, fecha válida). Devuelve mensajes de error 
      descriptivos en español."

[ ] Crear tests de integración para la API
    → Test: login con credenciales válidas.
    → Test: crear un cliente y verificar que aparece.
    → Test: registrar una compra y verificar el asiento.
    → Test: generar el Form. 200 y verificar los montos.
```

---

# FASE 8.8 — Migración del Frontend: de LocalStorage a API

## ¿Qué hace esta fase?
Modifica el **frontend** para que consuma la API REST en lugar de usar localStorage. La lógica de negocio se mueve al backend; el frontend solo muestra datos y envía formularios.

## Cambios principales

```text
ANTES (localStorage):
─────────────────────────────────────────────────
window.Almacenamiento.guardar("clientes", datos)
window.Almacenamiento.obtener("clientes")
window.MotorContable.registrarAsiento(asiento)

DESPUÉS (API):
─────────────────────────────────────────────────
fetch("/api/clientes", { method: "POST", body: JSON.stringify(datos) })
fetch("/api/clientes").then(r => r.json())
fetch("/api/contable/asientos", { method: "POST", body: JSON.stringify(asiento) })
```

## Tareas de la Fase 8.8

```text
[ ] Crear js/nucleo/api-client.js
    → Función apiGet(endpoint): GET a la API con JWT.
    → Función apiPost(endpoint, datos): POST a la API con JWT.
    → Función apiPut(endpoint, datos): PUT a la API con JWT.
    → Función apiDelete(endpoint): DELETE a la API con JWT.
    → Maneja errores: 401 (token expirado), 403 (sin permisos), 
      500 (error del servidor).
    → 🧠 Mini-Prompt para IA: "Escribe un cliente de API en 
      JavaScript vanilla para un ERP. Debe incluir funciones 
      genéricas: apiGet, apiPost, apiPut, apiDelete. Cada 
      función debe: agregar el JWT al header Authorization, 
      manejar errores HTTP (401, 403, 404, 500), y devolver 
      la respuesta JSON. Si el token expiró (401), debe 
      intentar refrescarlo automáticamente."

[ ] Migrar las vistas de localStorage a API
    → Reemplazar window.Almacenamiento.obtener() con apiGet().
    → Reemplazar window.Almacenamiento.guardar() con apiPost().
    → Reemplazar window.MotorContable.registrarAsiento() con 
      apiPost("/api/contable/asientos", asiento).

[ ] Implementar la pantalla de login
    → Formulario: email, password.
    → Al enviar → llama a apiPost("/api/auth/login").
    → Si éxito → guarda el token en localStorage (solo el token).
    → Si error → muestra mensaje de error.
    → Redirige al dashboard.

[ ] Implementar el selector de empresa
    → Si el usuario pertenece a una sola empresa → se selecciona 
      automáticamente.
    → Si pertenece a varias → muestra un selector.
    → El empresaId se incluye en el JWT.

[ ] Implementar el manejo de sesión expirada
    → Si la API responde 401 → intenta refrescar el token.
    → Si el refresh también falla → redirige a la pantalla de login.
    → Muestra un mensaje: "Tu sesión expiró, por favor inicia sesión".
```

---

# FASE 8.9 — Integración Real con el SIN (SIAT)

## ¿Qué hace esta fase?
Implementa la **conexión real con la API del SIN** para facturación electrónica. Esto requiere un certificado digital registrado ante el SIN y credenciales de acceso.

## Flujo de integración

```text
1. El ERP solicita CUIS al SIN (cada 8 horas)
   → POST https://siatinfo.impuestos.gob.bo/api/cuis
   → Body: { nit, sistema }
   → Response: { cuis, fechaExpiracion }

2. El ERP solicita CUFD al SIN (cada 24 horas)
   → POST https://siatinfo.impuestos.gob.bo/api/cufd
   → Body: { nit, cuis, puntoVenta }
   → Response: { cufd, fechaExpiracion }

3. El ERP emite una factura electrónica
   → Genera el XML según el estándar del SIN.
   → Firma digitalmente con el certificado.
   → Envía al SIN: POST https://siatinfo.impuestos.gob.bo/api/factura
   → Response: { cuf, estado, mensaje }

4. El ERP consulta el estado de una factura
   → GET https://siatinfo.impuestos.gob.bo/api/factura?cuf={CUF}
   → Response: { estado: "VALIDADA" | "RECHAZADA" | "ANULADA" }
```

## Tareas de la Fase 8.9

```text
[ ] Crear el módulo de integración SIN (sin-integracion)
    → sin.routes.js: endpoints para facturación electrónica.
    → sin.controller.js: maneja las peticiones HTTP.
    → sin.service.js: lógica de integración con la API del SIN.
    → sin.certificado.js: manejo del certificado digital.

[ ] Implementar la solicitud de CUIS
    → Solicita un CUIS al SIN cada 8 horas.
    → Guarda el CUIS en la DB con fecha de expiración.
    → Si el CUIS expiró → solicita uno nuevo automáticamente.
    → ⚠️ En el prototipo, se simula. En producción, se conecta 
      a la API real del SIN.

[ ] Implementar la solicitud de CUFD
    → Solicita un CUFD al SIN cada 24 horas.
    → Guarda el CUFD en la DB con fecha de expiración.
    → Si el CUFD expiró → solicita uno nuevo automáticamente.

[ ] Implementar la emisión de factura electrónica
    → Genera el XML según el estándar del SIN.
    → Firma digitalmente con el certificado.
    → Envía al SIN vía API.
    → Recibe el CUF y el estado de la factura.
    → Guarda la factura en la DB con el CUF.
    → 🧠 Mini-Prompt para IA: "Escribe el flujo de emisión de 
      una factura electrónica en Bolivia usando la API del SIAT. 
      Incluye: solicitud de CUIS, solicitud de CUFD, generación 
      del XML, firma digital, envío al SIN, y recepción del CUF. 
      Maneja errores: conexión caída, CUIS expirado, factura 
      rechazada. Incluye reintentos automáticos."

[ ] Implementar la consulta de estado de factura
    → Consulta al SIN si una factura fue validada o rechazada.
    → Actualiza el estado en la DB.
    → Si fue rechazada → notifica al usuario.

[ ] Implementar la anulación de factura
    → Genera una nota de crédito/débito electrónica.
    → Envía al SIN vía API.
    → Actualiza el estado de la factura original.

[ ] Implementar el manejo de contingencia
    → Si la conexión al SIN falla → activa modo contingencia.
    → En contingencia: permite facturar offline con talonarios físicos.
    → Cuando vuelve la conexión → sincroniza las facturas pendientes.
    → ⚠️ El SIN permite contingencia por un máximo de 48 horas.
```

---

# FASE 8.10 — Seguridad: Encriptación, Auditoría, Backups

## ¿Qué hace esta fase?
Implementa las **medidas de seguridad** necesarias para un SaaS productivo que maneja datos contables y financieros sensibles.

## Medidas de seguridad

```text
1. ENCRYPTACIÓN:
   • Contraseñas: bcrypt con salt (ya implementado en auth).
   • Datos sensibles en la DB: encriptación AES-256.
   • Comunicación: HTTPS (TLS 1.3) obligatorio.
   • JWT: firmados con clave secreta fuerte (256 bits mínimo).

2. AUDITORÍA:
   • Log de cada acción: quién, qué, cuándo, desde dónde.
   • Logs inmutables: no se pueden editar ni eliminar.
   • Retención: mínimo 5 años (por normativa contable).

3. BACKUPS:
   • Backup diario automático de la base de datos.
   • Backup semanal completo (DB + archivos).
   • Retención: 30 días de backups diarios, 12 meses de semanales.
   • Verificación: restaurar un backup mensualmente para verificar.

4. PROTECCIÓN CONTRA ATAQUES:
   • Rate limiting: máximo 100 requests por minuto por IP.
   • Sanitización de inputs: prevenir SQL injection y XSS.
   • CORS configurado: solo dominios autorizados.
   • Headers de seguridad: Content-Security-Policy, X-Frame-Options.
```

## Tareas de la Fase 8.10

```text
[ ] Implementar rate limiting
    → Usar express-rate-limit.
    → Máximo 100 requests por minuto por IP.
    → Para login: máximo 5 intentos por minuto.
    → Si supera el límite → responde 429 Too Many Requests.

[ ] Implementar headers de seguridad
    → Usar helmet.js.
    → Configura: Content-Security-Policy, X-Frame-Options, 
      X-Content-Type-Options, Strict-Transport-Security.

[ ] Implementar sanitización de inputs
    → Usar express-mongo-sanitize o similar.
    → Previene SQL injection y NoSQL injection.
    → Valida todos los inputs con Zod antes de procesar.

[ ] Implementar el sistema de backups
    → Script que ejecuta pg_dump diariamente.
    → Guarda el backup en un almacenamiento externo (S3, GCS).
    → Verifica la integridad del backup.
    → Programa la ejecución con cron o similar.
    → 🧠 Mini-Prompt para IA: "Escribe un script de backup 
      automático para PostgreSQL en Node.js. Debe: ejecutar 
      pg_dump, comprimir el archivo, subirlo a un almacenamiento 
      externo (S3 o similar), y registrar el log. Incluye 
      verificación de integridad y notificación por email 
      si el backup falla."

[ ] Implementar la política de contraseñas
    → Mínimo 8 caracteres.
    → Al menos 1 mayúscula, 1 minúscula, 1 número, 1 carácter especial.
    → Expiración cada 90 días (opcional, según política de la empresa).
    → Bloqueo después de 5 intentos fallidos.

[ ] Implementar el log de auditoría inmutable
    → Cada registro de auditoría tiene un hash del registro anterior.
    → Esto crea una cadena de bloques (blockchain-like) que 
      impide la modificación de registros anteriores.
    → ⚠️ Crítico para cumplimiento ante el SIN y auditorías externas.
```

---

# FASE 8.11 — Infraestructura: Docker + Despliegue

## ¿Qué hace esta fase?
Empaqueta el SaaS en **contenedores Docker** para facilitar el despliegue en cualquier entorno (local, staging, producción).

## Docker Compose para desarrollo local

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Backend Node.js
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://erp_user:erp_pass@db:5432/erp_contable
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
    volumes:
      - ./backend/src:/app/src
    command: npm run dev

  # Frontend (servidor estático)
  frontend:
    build: ./frontend
    ports:
      - "8080:80"
    depends_on:
      - backend

  # Base de datos PostgreSQL
  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=erp_user
      - POSTGRES_PASSWORD=erp_pass
      - POSTGRES_DB=erp_contable
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infrastructure/docker/init.sql:/docker-entrypoint-initdb.d/init.sql

  # pgAdmin (interfaz gráfica para la DB)
  pgadmin:
    image: dpage/pgadmin4
    ports:
      - "5050:80"
    environment:
      - PGADMIN_DEFAULT_EMAIL=admin@erp.com
      - PGADMIN_DEFAULT_PASSWORD=admin
    depends_on:
      - db

volumes:
  postgres_data:
```

## Tareas de la Fase 8.11

```text
[ ] Crear el Dockerfile del backend
    → FROM node:20-alpine
    → WORKDIR /app
    → COPY package*.json ./
    → RUN npm ci --only=production
    → COPY . .
    → RUN npm run build
    → EXPOSE 3000
    → CMD ["node", "dist/server.js"]

[ ] Crear el Dockerfile del frontend
    → FROM nginx:alpine
    → COPY . /usr/share/nginx/html
    → EXPOSE 80
    → CMD ["nginx", "-g", "daemon off;"]

[ ] Crear el docker-compose.yml descrito arriba
    → Define los servicios: backend, frontend, db, pgadmin.
    → Configura las variables de entorno.
    → Configura los volúmenes para persistencia.

[ ] Crear el script de inicialización de la DB
    → infrastructure/docker/init.sql
    → Crea la base de datos si no existe.
    → Ejecuta las migraciones de Prisma.
    → Carga los seeds de datos de ejemplo.

[ ] Probar el despliegue local
    → docker-compose up --build
    → Verificar que el backend arranca en http://localhost:3000
    → Verificar que el frontend arranca en http://localhost:8080
    → Verificar que la DB arranca en localhost:5432
    → Verificar que pgAdmin arranca en http://localhost:5050

[ ] Configurar CI/CD con GitHub Actions
    → .github/workflows/deploy.yml
    → En cada push a main:
      1. Ejecutar tests.
      2. Build de Docker.
      3. Push a Docker Hub o GitHub Container Registry.
      4. Deploy al servidor de producción.
    → 🧠 Mini-Prompt para IA: "Genera un workflow de GitHub 
      Actions para un SaaS de ERP contable. Debe: ejecutar 
      tests de unidad e integración, build de Docker del 
      backend y frontend, push a GitHub Container Registry, 
      y deploy a un servidor vía SSH. Incluye notificación 
      por Slack si el deploy falla."
```

---

# FASE 8.12 — Modelo de Negocio: Suscripción y Facturación

## ¿Qué hace esta fase?
Define el **modelo de negocio** del SaaS: planes de suscripción, facturación, y gestión de pagos. Esto transforma el proyecto de un prototipo educativo a un **emprendimiento comercial**.

## Planes de suscripción propuestos

```text
╔══════════════════════════════════════════════════════════════════╗
║ PLAN      │ PRECIO/MES │ INCLUYE                                ║
║───────────┼────────────┼────────────────────────────────────────║
║ GRATUITO  │ Bs 0       │ 1 empresa, 1 usuario, 100 facturas/mes ║
║           │            │ Módulos: compras, ventas, inventario   ║
║───────────┼────────────┼────────────────────────────────────────║
║ BÁSICO    │ Bs 199     │ 1 empresa, 3 usuarios, 500 facturas   ║
║           │            │ + Nómina, impuestos, LCV               ║
║───────────┼────────────┼────────────────────────────────────────║
║ PROFESIONAL│ Bs 499    │ 1 empresa, 10 usuarios, facturas ilim. ║
║           │            │ + Estados financieros, cumplimiento    ║
║           │            │ + Integración SIN, auditoría           ║
║───────────┼────────────┼────────────────────────────────────────║
║ ENTERPRISE│ Bs 1,499   │ 5 empresas, usuarios ilimitados        ║
║           │            │ Todo lo anterior + soporte prioritario ║
║           │            │ + API personalizada + capacitación     ║
╚═══════════════════════════════════════════════════════════════════╝
```

## Tareas de la Fase 8.12

```text
[ ] Crear el módulo de suscripciones
    → Modelo: Suscripcion con campos: plan, estado, fechaInicio, 
      fechaVencimiento, metodoPago.
    → Service: crearSuscripcion, renovarSuscripcion, cancelarSuscripcion.
    → Middleware: verificarSuscripcion (bloquea features según el plan).

[ ] Implementar la verificación de límites por plan
    → GRATUITO: máximo 100 facturas por mes.
    → BÁSICO: máximo 500 facturas por mes.
    → Si supera el límite → muestra mensaje de upgrade.
    → No bloquea abruptamente: permite terminar el mes.

[ ] Implementar la integración con pasarela de pago
    → Opciones para Bolivia:
      - Pago en efectivo / transferencia bancaria (más común).
      - QR Simple (bancos bolivianos).
      - Stripe (si se acepta tarjeta internacional).
    → En el MVP: registro manual del pago (el admin confirma).
    → En versión avanzada: integración con QR Simple o Stripe.

[ ] Crear la página de planes y precios
    → vistas/planes.html
    → Comparativa de los 4 planes.
    → Botón "Suscribirse" que lleva al formulario de registro.
    → FAQ: preguntas frecuentes sobre el servicio.

[ ] Implementar la facturación del servicio
    → El SaaS emite factura por la suscripción (irónico, pero necesario).
    → Genera una factura electrónica por el monto de la suscripción.
    → La envía al cliente por email.
```

---

# FASE 8.13 — Smoke Test Final y Commit de Cierre

## Checklist de humo (smoke test)

```text
[ ] Smoke test #1: Despliegue con Docker
    → docker-compose up --build
    → Verificar que todos los servicios arrancan correctamente
    → Backend en http://localhost:3000
    → Frontend en http://localhost:8080
    → DB en localhost:5432
    → pgAdmin en http://localhost:5050

[ ] Smoke test #2: Registro y login
    → Registrar un usuario admin vía API
    → Login con las credenciales
    → Verificar que se recibe un JWT válido
    → Verificar que el token incluye userId, empresaId, rol

[ ] Smoke test #3: Multi-empresa
    → Crear 2 empresas con NITs distintos
    → Crear un usuario para cada empresa
    → Verificar que el usuario de Empresa A no accede a datos de Empresa B
    → Verificar que la respuesta es 403 Forbidden

[ ] Smoke test #4: Flujo completo de compra
    → Login como CONTADOR de Empresa A
    → Crear proveedor → Orden de compra → Recepción → Factura → Pago
    → Verificar que el asiento contable se generó en la DB
    → Verificar que el libro mayor se actualizó

[ ] Smoke test #5: Flujo completo de venta
    → Crear cliente → Cotización → Pedido → Despacho → Factura → Cobro
    → Verificar que el IVA débito se calculó (÷1.13)
    → Verificar que el IT se calculó (×3%)
    → Verificar que el kardex se actualizó

[ ] Smoke test #6: Nómina boliviana
    → Crear empleado con 6 años de antigüedad
    → Calcular nómina mensual
    → Verificar bono de antigüedad (11% × 3 SMN)
    → Verificar provisión de aguinaldo (1/12)
    → Verificar indemnización (aplica a renuncia)

[ ] Smoke test #7: Impuestos
    → Conciliar IVA del mes
    → Calcular IT del mes
    → Calcular IUE anual
    → Compensar IT contra IUE
    → Verificar que los formularios 200, 400, 500 se generan

[ ] Smoke test #8: Estados financieros
    → Generar Estado de Resultados
    → Generar Balance General
    → Verificar que Activo = Pasivo + Patrimonio
    → Generar Flujo de Efectivo
    → Calcular ratios financieros

[ ] Smoke test #9: Cumplimiento SIN
    → Generar LCV del período
    → Verificar que cuadra con el Form. 200
    → Generar calendario de vencimientos
    → Verificar que los semáforos son correctos

[ ] Smoke test #10: Seguridad
    → Intentar acceder sin token → 401
    → Intentar acceder con token expirado → 401
    → Intentar acceder a otra empresa → 403
    → Verificar que el log de auditoría registra las acciones
    → Verificar que las contraseñas están hasheadas con bcrypt

[ ] Smoke test #11: Backups
    → Ejecutar el script de backup manualmente
    → Verificar que el archivo .sql se generó
    → Restaurar el backup en una DB de prueba
    → Verificar que los datos se restauraron correctamente

[ ] Commit de cierre del Módulo 8
    → git add .
    → git commit -m "feat(modulo-8): Migración a SaaS productivo
    
      - Backend Node.js + Express + TypeScript
      - Base de datos PostgreSQL con Prisma
      - Autenticación JWT con roles y permisos
      - Multi-empresa (multi-NIT) con aislamiento de datos
      - API REST completa para todos los módulos
      - Integración con SIN (SIAT) para facturación electrónica
      - Seguridad: rate limiting, headers, auditoría inmutable
      - Infraestructura Docker con CI/CD
      - Modelo de suscripción con 4 planes
      - Smoke test: todos los tests pasan
      
      🎉 ERP Contable Bolivia: de prototipo educativo a SaaS productivo"
```

---

## 🎯 Criterios de Aceptación del Módulo 8

El Módulo 8 se considera **completado** cuando:

- [x] El backend arranca y responde a peticiones HTTP
- [x] La base de datos PostgreSQL tiene el esquema completo
- [x] El login con JWT funciona correctamente
- [x] Los roles y permisos se aplican correctamente
- [x] El multi-empresa aísla los datos correctamente
- [x] La API REST cubre todos los módulos del ERP
- [x] El frontend consume la API en lugar de localStorage
- [x] La integración con el SIN funciona (o se simula correctamente)
- [x] Las medidas de seguridad están implementadas
- [x] El despliegue con Docker funciona
- [x] El modelo de suscripción está definido
- [x] Los tests de integración pasan

---

## 📚 Material de Exposición Generado en Este Módulo

| Archivo | Contenido | Uso en exposición |
|---|---|---|
| `28-migracion-saas-explicada.md` | Por qué migrar | Explicar la evolución |
| `29-arquitectura-saas-detalle.md` | Arquitectura del SaaS | Mostrar el diseño |
| `docs/adr/ADR-003 a ADR-007` | Decisiones arquitectónicas | Justificar elecciones |

---

## ⚠️ Advertencia final

La tentación aquí es **intentar hacer todo el Módulo 8 de golpe**. *"Si voy a migrar, migro todo: backend, DB, auth, multi-empresa, SIN, Docker, suscripciones"*. **No lo hagas.** Este módulo es el más largo y complejo de toda la guía, y cada fase puede abordarse de forma independiente. Un ERP con backend pero sin multi-empresa sigue siendo funcional. Un ERP con multi-empresa pero sin conexión real al SIN sigue siendo útil. Un ERP con Docker pero sin modelo de suscripción sigue siendo desplegables.

**Elige tu punto de corte:**

- Si tu objetivo es **aprender full-stack** → llega hasta la Fase 8.8 (frontend conectado a API).
- Si tu objetivo es **vender el SaaS** → llega hasta la Fase 8.12 (modelo de suscripción).
- Si tu objetivo es **conectar al SIN real** → enfócate en la Fase 8.9.
- Si tu objetivo es **desplegar en la nube** → enfócate en la Fase 8.11.

Cada fase agrega valor incremental. No necesitas completar todas para que el proyecto sea valioso.

---

## 🎓 Cierre del Proyecto

Si llegaste hasta aquí, has construido algo extraordinario: **un ERP Contable Integral adaptado a la legislación boliviana**, desde la estructura de carpetas hasta la migración a SaaS productivo. Eso no es solo un proyecto de aprendizaje — es un **portafolio profesional**, una **base para un emprendimiento**, y una **demostración de que entiendes contabilidad, tributación y tecnología boliviana**.

```text
╔══════════════════════════════════════════════════════════════════╗
║  🎉 FELICITACIONES                                             ║
║                                                                  ║
║  Completaste el roadmap del ERP Contable Bolivia:               ║
║                                                                  ║
║  ✅ Módulo 0: Setup y estructura                                ║
║  ✅ Módulo 1: Documentos Fuente (Capa 1)                        ║
║  ✅ Módulo 2: Compras y Ventas (Capa 2)                         ║
║  ✅ Módulo 3: Motor Contable (Capa 3)                           ║
║  ✅ Módulo 4: Nómina Boliviana                                  ║
║  ✅ Módulo 5: Impuestos (IVA, IT, IUE)                          ║
║  ✅ Módulo 6: Estados Financieros (Capa 4)                      ║
║  ✅ Módulo 7: Cumplimiento SIN (Capa 5)                         ║
║  ✅ Módulo 8: Migración a SaaS (Opcional)                       ║
║                                                                  ║
║  Total: 8 módulos, 50+ fases, 300+ tareas, 29 documentos        ║
║  didácticos, 7 ADRs, y un ERP funcional adaptado a Bolivia.     ║
║                                                                  ║
║  Ahora ve y constrúyelo. 🚀                                     ║
╚═══════════════════════════════════════════════════════════════════╝
```

**¿Siguiente paso?** Si quieres, puedo generar un **ROADMAP_RESUMEN_FINAL.md** que consolide todo el proyecto en un solo documento de referencia, con el orden de ejecución, los tiempos estimados, y una checklist final de exposición. 🎓