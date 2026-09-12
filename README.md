<div align="center">

# 🇧🇴 ERP Contable Bolivia

### Sistema contable integral que entiende la normativa boliviana real

*Construido desde cero con Vanilla JavaScript · Sin frameworks · Sin backend*

[![Demo en vivo](https://img.shields.io/badge/🚀_Demo_en_vivo-Probar_ahora-1e40af?style=for-the-badge)](https://miltondanielhch.github.io/erp-demo/)
[![Estado](https://img.shields.io/badge/Estado-Activo-success?style=for-the-badge)]()
[![Versión](https://img.shields.io/badge/Versión-1.0.0-blue?style=for-the-badge)]()
[![Licencia](https://img.shields.io/badge/Licencia-MIT-green?style=for-the-badge)](LICENSE)
[![Hecho en](https://img.shields.io/badge/Hecho_en-Bolivia_🇧🇴-D52B1E?style=for-the-badge)]()

<br>

**[🎯 Ver Demo](https://miltondanielhch.github.io/erp-demo/)** · **[📖 Documentación](#-documentación)** · **[⚡ Inicio rápido](#-inicio-rápido)**

</div>

---

## 📌 ¿Qué es esto?

Un **ERP contable completo** adaptado al 100% a la normativa boliviana: Ley 843, Normas de Contabilidad del CTNAC, SIN, LGT y Fundempresa. No es un ERP genérico traducido — fue construido desde cero para que un contador boliviano lo use sin fricciones legales.

```text
┌─────────────────────────────────────────────────────────────┐
│  🏢 Empresa demo: Distribuidora Mamoré SRL (Trinidad, Beni)│
│  📊 45,059 líneas de código · 138 archivos · 2.27 MB       │
│  🧩 8 módulos completos · 17 guías de aprendizaje          │
└─────────────────────────────────────────────────────────────┘
```

> **💡 Dato**: la mayoría de ERPs educativos ignoran particularidades bolivianas como la compensación IT-IUE (Art. 77 Ley 843) o que el ajuste UFV está suspendido desde diciembre 2020. Este ERP las maneja correctamente.

---

## ✨ Por qué es diferente

La mayoría de ERPs aplican reglas contables genéricas. Este entiende Bolivia:

| # | Particularidad | Normativa | Impacto |
|---|---|---|---|
| 1️⃣ | **IVA incluido en el precio** | Art. 5 Ley 843 | `IVA = Total - (Total ÷ 1.13)` |
| 2️⃣ | **Compensación IT-IUE** | Art. 77 Ley 843 | Si IT > IUE, el exceso **se pierde** |
| 3️⃣ | **LIFO prohibido** | NIC 2 + SIN | Solo educativo; SIN no lo acepta |
| 4️⃣ | **Calendario por dígito de NIT** | RND del SIN | Vencimientos del 10 al 19 del mes |
| 5️⃣ | **5 provisiones laborales** | LGT + DS 28699 + DS 1802 | Aguinaldo, desahucio, 2° aguinaldo... |
| 6️⃣ | **UFV suspendido dic/2020** | Res. CTNAC 03/2020 | NO aplicar reexpresión por inflación |
| 7️⃣ | **Conciliación IVA mensual** | Form. 200 + Art. 8 | Saldo a favor se arrastra al mes siguiente |

---

## 🧩 Módulos del sistema

| # | Módulo | Estado | LoC | Descripción |
|---|--------|:------:|----:|-------------|
| 0 | [Setup y Configuración](docs/roadmap/ROADMAP_MODULO_0_SETUP.md) | ✅ | 421 | Base del sistema, utilidades, validadores |
| 1 | [Documentos Fuente](docs/roadmap/ROADMAP_MODULO_1_DOCUMENTOS_FUENTE.md) | ✅ | 478 | Facturas, NIT, CUF, validación SIAT |
| 2 | [Compras y Ventas](docs/roadmap/ROADMAP_MODULO_2_COMPRAS_VENTAS.md) | ✅ | 665 | Ciclo completo + kardex |
| 3 | [Motor Contable](docs/roadmap/ROADMAP_MODULO_3_MOTOR_CONTABLE.md) | ✅ | 716 | Partida doble, libro diario, mayor, balanza |
| 4 | [Nómina Boliviana](docs/roadmap/ROADMAP_MODULO_4_NOMINA_BOLIVIANA.md) | ✅ | 768 | Aguinaldo, bono antigüedad, indemnización |
| 5 | [Impuestos](docs/roadmap/ROADMAP_MODULO_5_IMPUESTOS.md) | ✅ | 819 | IVA, IT, IUE, RC-IVA, IUE-BE |
| 6 | [Estados Financieros](docs/roadmap/ROADMAP_MODULO_6_ESTADOS_FINANCIEROS.md) | ✅ | 739 | Balance, resultados, 12 notas |
| 7 | [Cumplimiento SIN](docs/roadmap/ROADMAP_MODULO_7_CUMPLIMIENTO_SIN.md) | ✅ | 835 | Formularios 200/400/500, LCV, SIAT |
| 8 | [Contabilidad de Costos](docs/roadmap/ROADMAP_MODULO_8_COSTOS.md) | ✅ | 991 | FIFO/Promedio, PE, ABC, Pareto |
| 9 | [Migración a SaaS](docs/roadmap/ROADMAP_MODULO_9_MIGRACION_SAAS.md) | ⏳ | 1240 | Roadmap futuro |

**Total: 8 módulos completos + 1 planeado** · **6,689 LoC documentados en roadmaps**

---

## 🏗️ Arquitectura

```text
┌──────────────────────────────────────────────────────────────┐
│  CAPA 5: CUMPLIMIENTO   SIN · Fundempresa · SIAT · LCV       │
├──────────────────────────────────────────────────────────────┤
│  CAPA 4: ESTADOS        Balance · Resultados · Notas · Ratios │
├──────────────────────────────────────────────────────────────┤
│  CAPA 3: MOTOR CONTABLE Partida doble · Diario · Mayor       │
├──────────────────────────────────────────────────────────────┤
│  CAPA 2: MÓDULOS        Compras · Ventas · Nómina · Impuestos │
│                         Costos · Provisiones · Inventario     │
├──────────────────────────────────────────────────────────────┤
│  CAPA 1: DOCUMENTOS     Facturas · Notas · Validación NIT/CUF │
├──────────────────────────────────────────────────────────────┤
│  NÚCLEO               Almacenamiento · Utilidades · Enrutador │
└──────────────────────────────────────────────────────────────┘
```

### Stack técnico

![Vanilla JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![LocalStorage](https://img.shields.io/badge/LocalStorage-API-4B32C3?style=flat-square)
![Sin frameworks](https://img.shields.io/badge/Sin-Frameworks-red?style=flat-square)
![Sin backend](https://img.shields.io/badge/Sin-Backend-orange?style=flat-square)

> **Decisiones de diseño** documentadas en [ADR-001](docs/adr/ADR-001-stack-vanilla-sin-backend.md) (stack Vanilla sin backend) y [ADR-002](docs/adr/ADR-002-normas-contables-bolivianas.md) (NC del CTNAC sobre NIIF).

---

## ⚡ Inicio rápido

### Opción 1: Probar online (recomendado)

👉 **https://miltondanielhch.github.io/erp-demo/**

### Opción 2: Correr localmente

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/erp-demo.git
cd erp-demo

# 2. Servir con cualquier servidor HTTP estático
# Opción A: con VSCode + Live Server (recomendado)
#   Click derecho en index.html → "Open with Live Server"

# Opción B: con Python
python -m http.server 8000
#   Abre http://localhost:8000

# Opción C: con Node.js
npx serve
```

**No necesitas instalar nada más.** Todo funciona con abrir `index.html` en un navegador moderno.

### Acceso rápido

| URL | Qué verás |
|-----|-----------|
| `/` | Landing page del proyecto |
| `/erp.html` | ERP completo |
| `/erp.html#/dashboard` | Dashboard |
| `/erp.html#/costos` | Comparador FIFO/LIFO/Promedio |
| `/erp.html#/impuestos` | Conciliación IVA + IT-IUE |

---

## 📚 Documentación

### 🎓 Guías de aprendizaje (17)

Explicaciones paso a paso de cada concepto contable boliviano:

**Fundamentos (01-10)**
- [01. Documentos fuente](docs/aprendizaje/01-documentos-fuente.md)
- [02. Tipos de documentos](docs/aprendizaje/02-tipos-documentos-tabla.md)
- [03. Modelo de datos](docs/aprendizaje/03-modelo-datos-documentos.md)
- [04. Ciclo compra-venta](docs/aprendizaje/04-ciclo-compra-venta.md)
- [05. IVA boliviano](docs/aprendizaje/05-iva-boliviano-explicado.md) ⭐
- [06. Funciones IVA e IT](docs/aprendizaje/06-funciones-iva-it.md)
- [07. Partida doble](docs/aprendizaje/07-partida-doble-explicada.md)
- [08. Ciclo contable](docs/aprendizaje/08-ciclo-contable-pasos.md)
- [09. Cuentas y naturaleza](docs/aprendizaje/09-cuentas-naturaleza.md)
- [10. Estructura de asiento](docs/aprendizaje/10-estructura-asiento.md)

**Normativa boliviana (11-19)**
- [11. Provisiones laborales](docs/aprendizaje/11-provisiones-bolivianas.md)
- [12. Cierre de ejercicio](docs/aprendizaje/12-cierre-ejercicio.md)
- [13. Nómina boliviana](docs/aprendizaje/13-nomina-boliviana-explicada.md)
- [14. Particularidades BO](docs/aprendizaje/14-particularidades-bolivianas.md) ⭐
- [17. Impuestos explicados](docs/aprendizaje/17-impuestos-bolivianos-explicados.md)
- [18. Calendario tributario](docs/aprendizaje/18-calendario-tributario.md)
- [19. Compensación IT-IUE](docs/aprendizaje/19-compensacion-it-iue.md) ⭐

### 🗺️ Roadmaps por módulo

Cada módulo tiene su roadmap detallado en [`docs/roadmap/`](docs/roadmap/).

---

## 🗂️ Estructura del proyecto

```text
erp-contable-bo/
├── index.html              ← 🏠 Landing page (puerta de entrada)
├── erp.html                ← 🚀 ERP completo
├── landing/                ← Assets de la landing
│   ├── css/                ← Variables, componentes, secciones
│   ├── js/                 ← Lógica, datos, comparador
│   └── assets/             ← Logo e imágenes
├── css/                    ← Estilos del ERP
├── js/
│   ├── nucleo/             ← Almacenamiento, enrutador, utilidades
│   ├── config/             ← Bolivia, plan cuentas, períodos
│   ├── capas/              ← Capas 1, 3, 4 (infraestructura)
│   ├── modulos/            ← Capas 2 y 5 (26 módulos de dominio)
│   ├── cargas/             ← Datos de ejemplo
│   └── vistas/             ← Lógica de cada vista
├── vistas/                 ← Plantillas HTML por módulo
├── datos/
│   └── ejemplo.json        ← Distribuidora Mamoré SRL (demo)
└── docs/
    ├── aprendizaje/        ← 17 guías educativas
    ├── roadmap/            ← 11 roadmaps de módulos
    └── adr/                ← 2 decisiones de arquitectura
```

---

## 📊 Estadísticas del proyecto

| Métrica | Valor |
|---|---|
| Líneas de código (netas) | **45,059** |
| Archivos totales | **138** |
| Módulos completados | **8 de 9** |
| Guías de aprendizaje | **17** |
| Roadmaps documentados | **11** |
| ADRs | **2** |
| Peso total | **2.27 MB** |

*Datos del 11/09/2026 — ver [AUDITORIA_MASTER.md](AUDITORIA_MASTER.md)*

---

## 🎯 Casos de uso

- 🎓 **Estudiantes de contabilidad**: aprende Ley 843, nómina boliviana y estados financieros con implementación real.
- 👨‍💼 **Contadores bolivianos**: valida conceptos y cálculos antes de aplicarlos en sistemas productivos.
- 💻 **Desarrolladores**: referencia de arquitectura por capas, Vanilla JS y persistencia con LocalStorage.
- 📚 **Profesores**: material didáctico con 17 guías y comparadores interactivos (FIFO/LIFO/Promedio).

---

## 🚧 Próximos pasos

- [ ] **Módulo 9: Migración a SaaS** — backend real con PostgreSQL, autenticación, multi-tenant
- [ ] Facturación electrónica real (conexión a SIAT en producción)
- [ ] App móvil con React Native
- [ ] Integración con Bancos (extractos bancarios)
- [ ] API REST para terceros

Ver [ROADMAP_MODULO_9_MIGRACION_SAAS.md](docs/roadmap/ROADMAP_MODULO_9_MIGRACION_SAAS.md) para el plan detallado.

---

## 🤝 Contribuir

Este es un proyecto educativo. Las contribuciones son bienvenidas:

1. Haz un fork del repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -m 'feat: agrega X'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📜 Licencia

Este proyecto está bajo la [Licencia MIT](LICENSE) — úsalo, modifícalo y compártelo libremente.

**Nota**: este es un **prototipo educativo**. No está certificado para declaraciones fiscales reales ante el SIN. Siempre consulta con un contador público autorizado.

---

<div align="center">

**Hecho con ❤️ desde Trinidad, Beni — Bolivia 🇧🇴**

[🚀 Probar demo](https://miltondanielhch.github.io/erp-demo/) · [⭐ Dar estrella](#) · [🐛 Reportar bug](issues)

</div>
