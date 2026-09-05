# 🇧🇴 ERP Contable Integral Bolivia

> Prototipo educativo de un ERP Contable adaptado a la legislación boliviana
> (Ley 843, NC del CTNAC, LGT, SIN).

## 🎯 Propósito

Este proyecto es un **prototipo educativo** que demuestra cómo construir un
sistema ERP contable adaptado específicamente para Bolivia. No es un ERP
genérico traducido: fue diseñado desde cero con las reglas tributarias,
laborales y contables bolivianas.

## 🏗️ Stack Técnico

- **Frontend:** HTML5 + CSS3 + JavaScript Vanilla (ES6+)
- **Persistencia:** LocalStorage del navegador
- **Sin frameworks:** Cero React, cero Vue, cero Angular
- **Sin backend:** Toda la lógica vive en el navegador

## 📚 Estructura del Proyecto

```text
erp-contable-bo/
├── css/          → Estilos visuales
├── js/           → Toda la lógica del sistema
│   ├── nucleo/   → Funciones base (router, storage, utilidades)
│   ├── config/   → Constantes bolivianas (IVA, IT, IUE, SMN)
│   ├── capas/    → Las 5 capas del ERP
│   └── modulos/  → Módulos operativos (compras, ventas, nómina)
├── vistas/       → HTML de cada pantalla
├── datos/        → Datos de ejemplo precargados
└── docs/         → Documentación didáctica y ADRs
