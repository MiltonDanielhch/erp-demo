# 🛠️ Auditoría de Software — erp-contable-bo

> Generado: `2026-09-09 11:38`

## Resumen

| Métrica | Valor |
| :--- | :--- |
| **Proyecto** | `erp-contable-bo` |
| **Líneas de Código (Netas)** | 28401 LoC |
| **Peso Total del Proyecto** | 1.50MB |
| **Archivos analizados** | 102 |
| **Timestamp** | 2026-09-09 11:38 |
| **Estado** | Activa |

## Breakdown por Capa

| Capa | Archivos | LoC | Comentarios | Peso | % LoC |
| :--- | ---: | ---: | ---: | ---: | ---: |
| `roadmap` | 11 | 8277 | 0 | 459.19KB | 29.1% █████ |
| `vistas` | 14 | 4061 | 0 | 210.76KB | 14.3% ██ |
| `modulos` | 12 | 3384 | 0 | 200.84KB | 11.9% ██ |
| `vistas` | 18 | 2834 | 263 | 159.15KB | 10.0% █ |
| `config` | 8 | 2544 | 0 | 138.51KB | 9.0% █ |
| `aprendizaje` | 14 | 1768 | 0 | 84.73KB | 6.2% █ |
| `capas` | 2 | 1401 | 0 | 72.99KB | 4.9%  |
| `css` | 4 | 1114 | 145 | 40.13KB | 3.9%  |
| `nucleo` | 4 | 660 | 0 | 47.19KB | 2.3%  |
| `datos` | 1 | 392 | 0 | 12.10KB | 1.4%  |
| `js` | 1 | 342 | 67 | 22.42KB | 1.2%  |
| `cargas` | 1 | 127 | 0 | 8.29KB | 0.4%  |
| `adr` | 2 | 121 | 0 | 6.51KB | 0.4%  |
| `practica` | 3 | 94 | 12 | 3.08KB | 0.3%  |
| `docs` | 1 | 59 | 0 | 4.19KB | 0.2%  |
| **TOTAL** | — | **28401** | — | **1.50MB** | 100% |

## Desglose por Extensión

| Extensión | Archivos | LoC | Peso |
| :--- | ---: | ---: | ---: |
| `.js` | 43 | 12575 | 703.26KB |
| `.md` | 31 | 10760 | 577.66KB |
| `.html` | 19 | 3043 | 170.77KB |
| `.css` | 4 | 1114 | 40.13KB |
| `.py` | 1 | 435 | 23.00KB |
| `.json` | 3 | 430 | 12.92KB |
| `(sin extensión)` | 1 | 44 | 3.19KB |

## Top 10 Archivos por LoC

| Archivo | LoC | Comentarios | En blanco | Peso |
| :--- | ---: | ---: | ---: | ---: |
| `docs/roadmap/ROADMAP_MODULO_9_MIGRACION_SAAS.md` | 1240 | 0 | 255 | 62.90KB |
| `docs/roadmap/ROADMAP_MODULO_8_COSTOS.md` | 991 | 0 | 208 | 53.62KB |
| `js/capas/capa3-motor.js` | 905 | 366 | 209 | 51.04KB |
| `docs/roadmap/ROADMAP_MODULO_5_IMPUESTOS.md` | 819 | 0 | 193 | 45.54KB |
| `docs/roadmap/ROADMAP_MODULO_7_CUMPLIMIENTO_SIN.md` | 817 | 0 | 178 | 51.15KB |
| `docs/roadmap/ROADMAP_MODULO_4_NOMINA_BOLIVIANA.md` | 768 | 0 | 170 | 42.85KB |
| `docs/roadmap/ROADMAP_MODULO_6_ESTADOS_FINANCIEROS.md` | 739 | 0 | 179 | 43.68KB |
| `js/config/plan-cuentas.js` | 737 | 80 | 39 | 26.00KB |
| `docs/roadmap/ROADMAP_MODULO_3_MOTOR_CONTABLE.md` | 716 | 0 | 154 | 42.99KB |
| `js/config/catalogos.js` | 687 | 277 | 134 | 32.95KB |

## Mapa de Arquitectura

```text
erp-contable-bo/
├── .editorconfig (44 LoC | 3.19KB)
├── audit.py (435 LoC | 23.00KB) [157 comentarios]
├── AUDITORIA_MASTER.md (154 LoC | 8.53KB)
├── index.html (209 LoC | 11.62KB) [34 comentarios]
├── README.md (25 LoC | 1.25KB)
├── siguiente.md (356 LoC | 13.26KB)
├── css/ [40.13KB]
│   ├── componentes.css (505 LoC | 16.99KB) [50 comentarios]
│   ├── dashboard.css (235 LoC | 8.42KB) [22 comentarios]
│   ├── estilos.css (180 LoC | 8.16KB) [42 comentarios]
│   └── reportes.css (194 LoC | 6.56KB) [31 comentarios]
├── datos/ [12.10KB]
│   └── ejemplo.json (392 LoC | 12.10KB)
├── docs/ [554.62KB]
│   ├── estructura.md (59 LoC | 4.19KB)
│   ├── adr/ [6.51KB]
│   │   ├── ADR-001-stack-vanilla-sin-backend.md (50 LoC | 2.69KB)
│   │   └── ADR-002-normas-contables-bolivianas.md (71 LoC | 3.82KB)
│   ├── aprendizaje/ [84.73KB]
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
│   │   ├── 12-cierre-ejercicio.md (167 LoC | 7.75KB)
│   │   ├── 13-nomina-boliviana-explicada.md (107 LoC | 5.72KB)
│   │   └── 14-particularidades-bolivianas.md (172 LoC | 9.87KB)
│   └── roadmap/ [459.19KB]
│       ├── ROADMAP_MODULO_0_SETUP.md (421 LoC | 22.55KB)
│       ├── ROADMAP_MODULO_1_DOCUMENTOS_FUENTE.md (478 LoC | 25.03KB)
│       ├── ROADMAP_MODULO_2_COMPRAS_VENTAS.md (665 LoC | 35.90KB)
│       ├── ROADMAP_MODULO_3_MOTOR_CONTABLE.md (716 LoC | 42.99KB)
│       ├── ROADMAP_MODULO_4_NOMINA_BOLIVIANA.md (768 LoC | 42.85KB)
│       ├── ROADMAP_MODULO_5_IMPUESTOS.md (819 LoC | 45.54KB)
│       ├── ROADMAP_MODULO_6_ESTADOS_FINANCIEROS.md (739 LoC | 43.68KB)
│       ├── ROADMAP_MODULO_7_CUMPLIMIENTO_SIN.md (817 LoC | 51.15KB)
│       ├── ROADMAP_MODULO_8_COSTOS.md (991 LoC | 53.62KB)
│       ├── ROADMAP_MODULO_9_MIGRACION_SAAS.md (1240 LoC | 62.90KB)
│       └── ROADMAP_RESUMEN_FINAL.md (623 LoC | 32.97KB)
├── js/ [701.00KB]
│   ├── app.js (342 LoC | 22.42KB) [67 comentarios]
│   ├── capas/ [72.99KB]
│   │   ├── capa1-documentos.js (496 LoC | 21.95KB) [53 comentarios]
│   │   └── capa3-motor.js (905 LoC | 51.04KB) [366 comentarios]
│   ├── cargas/ [8.29KB]
│   │   └── datos-ejemplo.js (127 LoC | 8.29KB) [22 comentarios]
│   ├── config/ [138.51KB]
│   │   ├── bolivia.js (192 LoC | 24.99KB) [376 comentarios]
│   │   ├── campos-documentos.js (299 LoC | 19.07KB) [47 comentarios]
│   │   ├── catalogos.js (687 LoC | 32.95KB) [277 comentarios]
│   │   ├── estructura-asiento.js (189 LoC | 9.69KB) [73 comentarios]
│   │   ├── periodos-contables.js (118 LoC | 7.84KB) [94 comentarios]
│   │   ├── plan-cuentas.js (737 LoC | 26.00KB) [80 comentarios]
│   │   ├── tabla-bono-antiguedad.js (51 LoC | 3.73KB) [37 comentarios]
│   │   └── tipos-documentos.js (271 LoC | 14.22KB) [86 comentarios]
│   ├── modulos/ [200.84KB]
│   │   ├── asientos-contables.js (240 LoC | 15.66KB) [102 comentarios]
│   │   ├── asientos-nomina.js (235 LoC | 13.48KB) [115 comentarios]
│   │   ├── bono-antiguedad.js (177 LoC | 10.43KB) [83 comentarios]
│   │   ├── catalogo-empleados.js (252 LoC | 14.85KB) [105 comentarios]
│   │   ├── compras.js (567 LoC | 31.01KB) [163 comentarios]
│   │   ├── inventario.js (342 LoC | 21.26KB) [133 comentarios]
│   │   ├── lcv.js (125 LoC | 8.74KB) [58 comentarios]
│   │   ├── liquidaciones.js (298 LoC | 15.80KB) [122 comentarios]
│   │   ├── nomina.js (202 LoC | 14.77KB) [125 comentarios]
│   │   ├── provisiones.js (306 LoC | 19.20KB) [149 comentarios]
│   │   ├── rc-iva.js (167 LoC | 9.89KB) [83 comentarios]
│   │   └── ventas.js (473 LoC | 25.75KB) [109 comentarios]
│   ├── nucleo/ [47.19KB]
│   │   ├── almacenamiento.js (190 LoC | 11.46KB) [124 comentarios]
│   │   ├── enrutador.js (126 LoC | 7.80KB) [69 comentarios]
│   │   ├── utilidades.js (173 LoC | 14.40KB) [181 comentarios]
│   │   └── validadores.js (171 LoC | 13.53KB) [135 comentarios]
│   └── vistas/ [210.76KB]
│       ├── asientos-vista.js (192 LoC | 8.89KB) [12 comentarios]
│       ├── balanza-vista.js (166 LoC | 7.99KB) [4 comentarios]
│       ├── bono-antiguedad-vista.js (173 LoC | 8.90KB) [12 comentarios]
│       ├── catalogos-vista.js (447 LoC | 20.90KB) [15 comentarios]
│       ├── compras-vista.js (441 LoC | 22.57KB) [43 comentarios]
│       ├── documentos-vista.js (541 LoC | 34.42KB) [118 comentarios]
│       ├── empleados-vista.js (250 LoC | 12.17KB) [15 comentarios]
│       ├── inventario-vista.js (350 LoC | 19.25KB) [37 comentarios]
│       ├── lcv-vista.js (157 LoC | 7.74KB) [13 comentarios]
│       ├── libro-diario-vista.js (295 LoC | 12.92KB) [16 comentarios]
│       ├── libro-mayor-vista.js (170 LoC | 8.48KB) [13 comentarios]
│       ├── nomina-vista.js (298 LoC | 17.40KB) [38 comentarios]
│       ├── rc-iva-vista.js (175 LoC | 8.67KB) [10 comentarios]
│       └── ventas-vista.js (406 LoC | 20.47KB) [33 comentarios]
├── practica/ [3.08KB]
│   ├── package-lock.json (22 LoC | 542.00B)
│   ├── package.json (16 LoC | 296.00B)
│   └── practica.js (56 LoC | 2.26KB) [12 comentarios]
└── vistas/ [159.15KB]
    ├── asientos.html (71 LoC | 3.76KB) [8 comentarios]
    ├── balanza.html (105 LoC | 6.13KB) [18 comentarios]
    ├── bono-antiguedad.html (110 LoC | 6.29KB) [10 comentarios]
    ├── catalogos.html (220 LoC | 14.02KB) [25 comentarios]
    ├── compras.html (297 LoC | 17.32KB) [30 comentarios]
    ├── cumplimiento.html (20 LoC | 1.33KB) [4 comentarios]
    ├── dashboard.html (224 LoC | 10.09KB) [7 comentarios]
    ├── documentos.html (369 LoC | 19.24KB) [24 comentarios]
    ├── empleados.html (192 LoC | 11.03KB) [10 comentarios]
    ├── estados-financieros.html (19 LoC | 1.23KB) [4 comentarios]
    ├── impuestos.html (20 LoC | 1.34KB) [4 comentarios]
    ├── inventario.html (171 LoC | 11.95KB) [24 comentarios]
    ├── lcv.html (103 LoC | 5.84KB) [14 comentarios]
    ├── libro-diario.html (225 LoC | 10.58KB) [18 comentarios]
    ├── libro-mayor.html (109 LoC | 6.49KB) [16 comentarios]
    ├── nomina.html (208 LoC | 10.80KB) [10 comentarios]
    ├── rc-iva.html (119 LoC | 6.44KB) [9 comentarios]
    └── ventas.html (252 LoC | 15.27KB) [28 comentarios]
```
