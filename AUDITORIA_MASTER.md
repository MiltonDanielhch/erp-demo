# 🛠️ Auditoría de Software — erp-contable-bo

> Generado: `2026-09-08 18:33`

## Resumen

| Métrica | Valor |
| :--- | :--- |
| **Proyecto** | `erp-contable-bo` |
| **Líneas de Código (Netas)** | 23503 LoC |
| **Peso Total del Proyecto** | 1.23MB |
| **Archivos analizados** | 82 |
| **Timestamp** | 2026-09-08 18:33 |
| **Estado** | Activa |

## Breakdown por Capa

| Capa | Archivos | LoC | Comentarios | Peso | % LoC |
| :--- | ---: | ---: | ---: | ---: | ---: |
| `roadmap` | 10 | 7286 | 0 | 407.46KB | 31.0% ██████ |
| `vistas` | 9 | 2973 | 0 | 154.73KB | 12.6% ██ |
| `config` | 7 | 2493 | 0 | 134.77KB | 10.6% ██ |
| `vistas` | 14 | 2153 | 220 | 122.12KB | 9.2% █ |
| `modulos` | 5 | 1747 | 0 | 102.43KB | 7.4% █ |
| `aprendizaje` | 12 | 1489 | 0 | 69.14KB | 6.3% █ |
| `capas` | 2 | 1401 | 0 | 72.99KB | 6.0% █ |
| `css` | 4 | 1114 | 145 | 40.13KB | 4.7%  |
| `nucleo` | 4 | 660 | 0 | 47.19KB | 2.8%  |
| `datos` | 1 | 392 | 0 | 12.10KB | 1.7%  |
| `js` | 1 | 242 | 60 | 16.34KB | 1.0%  |
| `cargas` | 1 | 127 | 0 | 8.29KB | 0.5%  |
| `adr` | 2 | 121 | 0 | 6.51KB | 0.5%  |
| `practica` | 3 | 94 | 12 | 3.08KB | 0.4%  |
| `docs` | 1 | 59 | 0 | 4.19KB | 0.3%  |
| **TOTAL** | — | **23503** | — | **1.23MB** | 100% |

## Desglose por Extensión

| Extensión | Archivos | LoC | Peso |
| :--- | ---: | ---: | ---: |
| `.js` | 30 | 9699 | 539.01KB |
| `.md` | 28 | 9452 | 507.85KB |
| `.html` | 15 | 2329 | 132.21KB |
| `.css` | 4 | 1114 | 40.13KB |
| `.py` | 1 | 435 | 23.00KB |
| `.json` | 3 | 430 | 12.92KB |
| `(sin extensión)` | 1 | 44 | 3.19KB |

## Top 10 Archivos por LoC

| Archivo | LoC | Comentarios | En blanco | Peso |
| :--- | ---: | ---: | ---: | ---: |
| `docs/roadmap/ROADMAP_MODULO_8_MIGRACION_SAAS.md` | 1240 | 0 | 255 | 62.90KB |
| `js/capas/capa3-motor.js` | 905 | 366 | 209 | 51.04KB |
| `docs/roadmap/ROADMAP_MODULO_5_IMPUESTOS.md` | 819 | 0 | 193 | 46.53KB |
| `docs/roadmap/ROADMAP_MODULO_7_CUMPLIMIENTO_SIN.md` | 817 | 0 | 178 | 51.15KB |
| `docs/roadmap/ROADMAP_MODULO_4_NOMINA_BOLIVIANA.md` | 768 | 0 | 170 | 43.76KB |
| `docs/roadmap/ROADMAP_MODULO_6_ESTADOS_FINANCIEROS.md` | 739 | 0 | 179 | 43.68KB |
| `js/config/plan-cuentas.js` | 737 | 80 | 39 | 26.00KB |
| `docs/roadmap/ROADMAP_MODULO_3_MOTOR_CONTABLE.md` | 716 | 0 | 154 | 42.99KB |
| `js/config/catalogos.js` | 687 | 277 | 134 | 32.95KB |
| `docs/roadmap/ROADMAP_MODULO_2_COMPRAS_VENTAS.md` | 665 | 0 | 160 | 35.90KB |

## Mapa de Arquitectura

```text
erp-contable-bo/
├── .editorconfig (44 LoC | 3.19KB)
├── audit.py (435 LoC | 23.00KB) [157 comentarios]
├── AUDITORIA_MASTER.md (116 LoC | 6.04KB)
├── index.html (176 LoC | 10.09KB) [34 comentarios]
├── README.md (25 LoC | 1.25KB)
├── siguiente.md (356 LoC | 13.26KB)
├── css/ [40.13KB]
│   ├── componentes.css (505 LoC | 16.99KB) [50 comentarios]
│   ├── dashboard.css (235 LoC | 8.42KB) [22 comentarios]
│   ├── estilos.css (180 LoC | 8.16KB) [42 comentarios]
│   └── reportes.css (194 LoC | 6.56KB) [31 comentarios]
├── datos/ [12.10KB]
│   └── ejemplo.json (392 LoC | 12.10KB)
├── docs/ [487.30KB]
│   ├── estructura.md (59 LoC | 4.19KB)
│   ├── adr/ [6.51KB]
│   │   ├── ADR-001-stack-vanilla-sin-backend.md (50 LoC | 2.69KB)
│   │   └── ADR-002-normas-contables-bolivianas.md (71 LoC | 3.82KB)
│   ├── aprendizaje/ [69.14KB]
│   │   ├── 01-documentos-fuente.md (76 LoC | 5.88KB)
│   │   ├── 02-tipos-documentos-tabla.md (14 LoC | 706.00B)
│   │   ├── 03-modelo-datos-documentos.md (28 LoC | 1.37KB)
│   │   ├── 04-ciclo-compra-venta.md (158 LoC | 8.78KB)
│   │   ├── 05-iva-boliviano-explicado.md (180 LoC | 7.66KB)
│   │   ├── 06-funciones-iva-it.md (150 LoC | 3.42KB)
│   │   ├── 07-partida-doble-explicada.md (86 LoC | 5.43KB)
│   │   ├── 08-ciclo-contable-pasos.md (134 LoC | 8.20KB)
│   │   ├── 09-cuentas-naturaleza.md (97 LoC | 5.35KB)
│   │   ├── 10-estructura-asiento.md (268 LoC | 8.30KB)
│   │   ├── 11-provisiones-bolivianas.md (131 LoC | 6.31KB)
│   │   └── 12-cierre-ejercicio.md (167 LoC | 7.75KB)
│   └── roadmap/ [407.46KB]
│       ├── ROADMAP_MODULO_0_SETUP.md (421 LoC | 22.55KB)
│       ├── ROADMAP_MODULO_1_DOCUMENTOS_FUENTE.md (478 LoC | 25.03KB)
│       ├── ROADMAP_MODULO_2_COMPRAS_VENTAS.md (665 LoC | 35.90KB)
│       ├── ROADMAP_MODULO_3_MOTOR_CONTABLE.md (716 LoC | 42.99KB)
│       ├── ROADMAP_MODULO_4_NOMINA_BOLIVIANA.md (768 LoC | 43.76KB)
│       ├── ROADMAP_MODULO_5_IMPUESTOS.md (819 LoC | 46.53KB)
│       ├── ROADMAP_MODULO_6_ESTADOS_FINANCIEROS.md (739 LoC | 43.68KB)
│       ├── ROADMAP_MODULO_7_CUMPLIMIENTO_SIN.md (817 LoC | 51.15KB)
│       ├── ROADMAP_MODULO_8_MIGRACION_SAAS.md (1240 LoC | 62.90KB)
│       └── ROADMAP_RESUMEN_FINAL.md (623 LoC | 32.97KB)
├── js/ [536.74KB]
│   ├── app.js (242 LoC | 16.34KB) [60 comentarios]
│   ├── capas/ [72.99KB]
│   │   ├── capa1-documentos.js (496 LoC | 21.95KB) [53 comentarios]
│   │   └── capa3-motor.js (905 LoC | 51.04KB) [366 comentarios]
│   ├── cargas/ [8.29KB]
│   │   └── datos-ejemplo.js (127 LoC | 8.29KB) [22 comentarios]
│   ├── config/ [134.77KB]
│   │   ├── bolivia.js (192 LoC | 24.99KB) [376 comentarios]
│   │   ├── campos-documentos.js (299 LoC | 19.07KB) [47 comentarios]
│   │   ├── catalogos.js (687 LoC | 32.95KB) [277 comentarios]
│   │   ├── estructura-asiento.js (189 LoC | 9.69KB) [73 comentarios]
│   │   ├── periodos-contables.js (118 LoC | 7.84KB) [94 comentarios]
│   │   ├── plan-cuentas.js (737 LoC | 26.00KB) [80 comentarios]
│   │   └── tipos-documentos.js (271 LoC | 14.22KB) [86 comentarios]
│   ├── modulos/ [102.43KB]
│   │   ├── asientos-contables.js (240 LoC | 15.66KB) [102 comentarios]
│   │   ├── compras.js (567 LoC | 31.01KB) [163 comentarios]
│   │   ├── inventario.js (342 LoC | 21.26KB) [133 comentarios]
│   │   ├── lcv.js (125 LoC | 8.74KB) [58 comentarios]
│   │   └── ventas.js (473 LoC | 25.75KB) [109 comentarios]
│   ├── nucleo/ [47.19KB]
│   │   ├── almacenamiento.js (190 LoC | 11.46KB) [124 comentarios]
│   │   ├── enrutador.js (126 LoC | 7.80KB) [69 comentarios]
│   │   ├── utilidades.js (173 LoC | 14.40KB) [181 comentarios]
│   │   └── validadores.js (171 LoC | 13.53KB) [135 comentarios]
│   └── vistas/ [154.73KB]
│       ├── balanza-vista.js (166 LoC | 7.99KB) [4 comentarios]
│       ├── catalogos-vista.js (447 LoC | 20.90KB) [15 comentarios]
│       ├── compras-vista.js (441 LoC | 22.57KB) [43 comentarios]
│       ├── documentos-vista.js (541 LoC | 34.42KB) [118 comentarios]
│       ├── inventario-vista.js (350 LoC | 19.25KB) [37 comentarios]
│       ├── lcv-vista.js (157 LoC | 7.74KB) [13 comentarios]
│       ├── libro-diario-vista.js (295 LoC | 12.92KB) [16 comentarios]
│       ├── libro-mayor-vista.js (170 LoC | 8.48KB) [13 comentarios]
│       └── ventas-vista.js (406 LoC | 20.47KB) [33 comentarios]
├── practica/ [3.08KB]
│   ├── package-lock.json (22 LoC | 542.00B)
│   ├── package.json (16 LoC | 296.00B)
│   └── practica.js (56 LoC | 2.26KB) [12 comentarios]
└── vistas/ [122.12KB]
    ├── balanza.html (105 LoC | 6.13KB) [18 comentarios]
    ├── catalogos.html (220 LoC | 14.02KB) [25 comentarios]
    ├── compras.html (297 LoC | 17.32KB) [30 comentarios]
    ├── cumplimiento.html (20 LoC | 1.33KB) [4 comentarios]
    ├── dashboard.html (224 LoC | 10.09KB) [7 comentarios]
    ├── documentos.html (369 LoC | 19.24KB) [24 comentarios]
    ├── estados-financieros.html (19 LoC | 1.23KB) [4 comentarios]
    ├── impuestos.html (20 LoC | 1.34KB) [4 comentarios]
    ├── inventario.html (171 LoC | 11.95KB) [24 comentarios]
    ├── lcv.html (103 LoC | 5.84KB) [14 comentarios]
    ├── libro-diario.html (225 LoC | 10.58KB) [18 comentarios]
    ├── libro-mayor.html (109 LoC | 6.49KB) [16 comentarios]
    ├── nomina.html (19 LoC | 1.29KB) [4 comentarios]
    └── ventas.html (252 LoC | 15.27KB) [28 comentarios]
```
