# 🛠️ Auditoría de Software — erp-contable-bo

> Generado: `2026-09-06 15:31`

## Resumen

| Métrica | Valor |
| :--- | :--- |
| **Proyecto** | `erp-contable-bo` |
| **Líneas de Código (Netas)** | 13428 LoC |
| **Peso Total del Proyecto** | 732.79KB |
| **Archivos analizados** | 48 |
| **Timestamp** | 2026-09-06 15:31 |
| **Estado** | Activa |

## Breakdown por Capa

| Capa | Archivos | LoC | Comentarios | Peso | % LoC |
| :--- | ---: | ---: | ---: | ---: | ---: |
| `roadmap` | 10 | 7286 | 0 | 409.12KB | 54.3% ██████████ |
| `config` | 4 | 1445 | 0 | 78.15KB | 10.8% ██ |
| `vistas` | 12 | 1082 | 75 | 58.37KB | 8.1% █ |
| `css` | 4 | 1064 | 140 | 38.47KB | 7.9% █ |
| `nucleo` | 4 | 627 | 0 | 45.55KB | 4.7%  |
| `capas` | 2 | 471 | 0 | 27.72KB | 3.5%  |
| `datos` | 1 | 392 | 0 | 12.10KB | 2.9%  |
| `adr` | 2 | 121 | 0 | 6.51KB | 0.9%  |
| `aprendizaje` | 3 | 118 | 0 | 7.95KB | 0.9%  |
| `js` | 1 | 104 | 46 | 8.04KB | 0.8%  |
| `docs` | 1 | 59 | 0 | 4.19KB | 0.4%  |
| `modulos` | 0 | 0 | 0 | 0.00B | 0.0%  |
| `vistas` | 0 | 0 | 0 | 0.00B | 0.0%  |
| **TOTAL** | — | **13428** | — | **732.79KB** | 100% |

## Desglose por Extensión

| Extensión | Archivos | LoC | Peso |
| :--- | ---: | ---: | ---: |
| `.md` | 17 | 7609 | 429.02KB |
| `.js` | 11 | 2647 | 159.47KB |
| `.html` | 13 | 1237 | 67.55KB |
| `.css` | 4 | 1064 | 38.47KB |
| `.py` | 1 | 435 | 23.00KB |
| `.json` | 1 | 392 | 12.10KB |
| `(sin extensión)` | 1 | 44 | 3.19KB |

## Top 10 Archivos por LoC

| Archivo | LoC | Comentarios | En blanco | Peso |
| :--- | ---: | ---: | ---: | ---: |
| `docs/roadmap/ROADMAP_MODULO_8_MIGRACION_SAAS.md` | 1240 | 0 | 255 | 62.90KB |
| `docs/roadmap/ROADMAP_MODULO_5_IMPUESTOS.md` | 819 | 0 | 193 | 46.53KB |
| `docs/roadmap/ROADMAP_MODULO_7_CUMPLIMIENTO_SIN.md` | 817 | 0 | 178 | 51.15KB |
| `docs/roadmap/ROADMAP_MODULO_4_NOMINA_BOLIVIANA.md` | 768 | 0 | 170 | 43.76KB |
| `docs/roadmap/ROADMAP_MODULO_6_ESTADOS_FINANCIEROS.md` | 739 | 0 | 179 | 43.68KB |
| `js/config/plan-cuentas.js` | 737 | 80 | 39 | 26.00KB |
| `docs/roadmap/ROADMAP_MODULO_3_MOTOR_CONTABLE.md` | 716 | 0 | 154 | 43.84KB |
| `vistas/documentos.html` | 694 | 28 | 110 | 36.81KB |
| `docs/roadmap/ROADMAP_MODULO_2_COMPRAS_VENTAS.md` | 665 | 0 | 160 | 36.71KB |
| `docs/roadmap/ROADMAP_RESUMEN_FINAL.md` | 623 | 0 | 116 | 32.97KB |

## Mapa de Arquitectura

```text
erp-contable-bo/
├── .editorconfig (44 LoC | 3.19KB)
├── audit.py (435 LoC | 23.00KB) [157 comentarios]
├── index.html (155 LoC | 9.18KB) [34 comentarios]
├── README.md (25 LoC | 1.25KB)
├── css/ [38.47KB]
│   ├── componentes.css (455 LoC | 15.33KB) [45 comentarios]
│   ├── dashboard.css (235 LoC | 8.42KB) [22 comentarios]
│   ├── estilos.css (180 LoC | 8.16KB) [42 comentarios]
│   └── reportes.css (194 LoC | 6.56KB) [31 comentarios]
├── datos/ [12.10KB]
│   └── ejemplo.json (392 LoC | 12.10KB)
├── docs/ [427.76KB]
│   ├── estructura.md (59 LoC | 4.19KB)
│   ├── adr/ [6.51KB]
│   │   ├── ADR-001-stack-vanilla-sin-backend.md (50 LoC | 2.69KB)
│   │   └── ADR-002-normas-contables-bolivianas.md (71 LoC | 3.82KB)
│   ├── aprendizaje/ [7.95KB]
│   │   ├── 01-documentos-fuente.md (76 LoC | 5.88KB)
│   │   ├── 02-tipos-documentos-tabla.md (14 LoC | 706.00B)
│   │   └── 03-modelo-datos-documentos.md (28 LoC | 1.37KB)
│   └── roadmap/ [409.12KB]
│       ├── ROADMAP_MODULO_0_SETUP.md (421 LoC | 22.55KB)
│       ├── ROADMAP_MODULO_1_DOCUMENTOS_FUENTE.md (478 LoC | 25.03KB)
│       ├── ROADMAP_MODULO_2_COMPRAS_VENTAS.md (665 LoC | 36.71KB)
│       ├── ROADMAP_MODULO_3_MOTOR_CONTABLE.md (716 LoC | 43.84KB)
│       ├── ROADMAP_MODULO_4_NOMINA_BOLIVIANA.md (768 LoC | 43.76KB)
│       ├── ROADMAP_MODULO_5_IMPUESTOS.md (819 LoC | 46.53KB)
│       ├── ROADMAP_MODULO_6_ESTADOS_FINANCIEROS.md (739 LoC | 43.68KB)
│       ├── ROADMAP_MODULO_7_CUMPLIMIENTO_SIN.md (817 LoC | 51.15KB)
│       ├── ROADMAP_MODULO_8_MIGRACION_SAAS.md (1240 LoC | 62.90KB)
│       └── ROADMAP_RESUMEN_FINAL.md (623 LoC | 32.97KB)
├── js/ [159.47KB]
│   ├── app.js (104 LoC | 8.04KB) [46 comentarios]
│   ├── capas/ [27.72KB]
│   │   ├── capa1-documentos.js (408 LoC | 22.61KB) [181 comentarios]
│   │   └── capa3-motor.js (63 LoC | 5.11KB) [96 comentarios]
│   ├── config/ [78.15KB]
│   │   ├── bolivia.js (138 LoC | 18.85KB) [279 comentarios]
│   │   ├── campos-documentos.js (299 LoC | 19.07KB) [47 comentarios]
│   │   ├── plan-cuentas.js (737 LoC | 26.00KB) [80 comentarios]
│   │   └── tipos-documentos.js (271 LoC | 14.22KB) [86 comentarios]
│   ├── modulos/ [0.00B]
│   ├── nucleo/ [45.55KB]
│   │   ├── almacenamiento.js (190 LoC | 11.46KB) [124 comentarios]
│   │   ├── enrutador.js (102 LoC | 7.20KB) [73 comentarios]
│   │   ├── utilidades.js (173 LoC | 14.40KB) [181 comentarios]
│   │   └── validadores.js (162 LoC | 12.49KB) [122 comentarios]
│   └── vistas/ [0.00B]
└── vistas/ [58.37KB]
    ├── balanza.html (11 LoC | 954.00B) [4 comentarios]
    ├── compras.html (18 LoC | 1.23KB) [4 comentarios]
    ├── cumplimiento.html (20 LoC | 1.33KB) [4 comentarios]
    ├── dashboard.html (224 LoC | 10.09KB) [7 comentarios]
    ├── documentos.html (694 LoC | 36.81KB) [28 comentarios]
    ├── estados-financieros.html (19 LoC | 1.23KB) [4 comentarios]
    ├── impuestos.html (20 LoC | 1.34KB) [4 comentarios]
    ├── inventario.html (17 LoC | 1.12KB) [4 comentarios]
    ├── libro-diario.html (11 LoC | 939.00B) [4 comentarios]
    ├── libro-mayor.html (11 LoC | 896.00B) [4 comentarios]
    ├── nomina.html (19 LoC | 1.29KB) [4 comentarios]
    └── ventas.html (18 LoC | 1.20KB) [4 comentarios]
```
