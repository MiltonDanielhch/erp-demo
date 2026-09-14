# 🛠️ Auditoría de Software — erp-contable-bo

> Generado: `2026-09-13 23:38`

## Resumen

| Métrica | Valor |
| :--- | :--- |
| **Proyecto** | `erp-contable-bo` |
| **Líneas de Código (Netas)** | 48175 LoC |
| **Peso Total del Proyecto** | 2.43MB |
| **Archivos analizados** | 141 |
| **Timestamp** | 2026-09-13 23:38 |
| **Estado** | Activa |

## Breakdown por Capa

| Capa | Archivos | LoC | Comentarios | Peso | % LoC |
| :--- | ---: | ---: | ---: | ---: | ---: |
| `modulos` | 26 | 10554 | 0 | 541.90KB | 21.9% ████ |
| `roadmap` | 12 | 8817 | 0 | 490.72KB | 18.3% ███ |
| `vistas` | 18 | 6627 | 0 | 342.07KB | 13.8% ██ |
| `vistas` | 20 | 4440 | 309 | 231.93KB | 9.2% █ |
| `config` | 10 | 2944 | 0 | 160.42KB | 6.1% █ |
| `capas` | 3 | 2369 | 0 | 117.12KB | 4.9%  |
| `aprendizaje` | 17 | 2263 | 0 | 111.15KB | 4.7%  |
| `css` | 4 | 1886 | 0 | 63.71KB | 3.9%  |
| `css` | 4 | 1253 | 165 | 44.29KB | 2.6%  |
| `datos` | 1 | 1099 | 0 | 37.91KB | 2.3%  |
| `js` | 3 | 1099 | 0 | 57.96KB | 2.3%  |
| `nucleo` | 5 | 743 | 0 | 51.74KB | 1.5%  |
| `docs` | 2 | 536 | 0 | 27.73KB | 1.1%  |
| `js` | 1 | 484 | 91 | 30.21KB | 1.0%  |
| `cargas` | 1 | 412 | 0 | 28.38KB | 0.9%  |
| `adr` | 2 | 121 | 0 | 6.51KB | 0.3%  |
| `practica` | 3 | 94 | 12 | 3.08KB | 0.2%  |
| `assets` | 1 | 14 | 0 | 791.00B | 0.0%  |
| **TOTAL** | — | **48175** | — | **2.43MB** | 100% |

## Desglose por Extensión

| Extensión | Archivos | LoC | Peso |
| :--- | ---: | ---: | ---: |
| `.js` | 68 | 25288 | 1.30MB |
| `.md` | 36 | 12509 | 674.96KB |
| `.html` | 23 | 5609 | 302.84KB |
| `.css` | 8 | 3139 | 108.00KB |
| `.json` | 3 | 1137 | 38.72KB |
| `.py` | 1 | 435 | 23.00KB |
| `(sin extensión)` | 1 | 44 | 3.19KB |
| `.svg` | 1 | 14 | 791.00B |

## Top 10 Archivos por LoC

| Archivo | LoC | Comentarios | En blanco | Peso |
| :--- | ---: | ---: | ---: | ---: |
| `js/modulos/impuestos.js` | 2028 | 717 | 401 | 101.10KB |
| `landing/css/secciones.css` | 1364 | 113 | 240 | 40.24KB |
| `docs/roadmap/ROADMAP_MODULO_9_MIGRACION_SAAS.md` | 1240 | 0 | 255 | 62.90KB |
| `js/modulos/modulo-cumplimiento.js` | 1228 | 166 | 271 | 51.36KB |
| `datos/ejemplo.json` | 1099 | 0 | 13 | 37.91KB |
| `docs/roadmap/ROADMAP_MODULO_8_COSTOS.md` | 991 | 0 | 208 | 53.62KB |
| `js/capas/capa4-estados.js` | 968 | 133 | 161 | 44.13KB |
| `js/capas/capa3-motor.js` | 905 | 366 | 209 | 51.04KB |
| `docs/roadmap/ROADMAP_MODULO_7_CUMPLIMIENTO_SIN.md` | 835 | 0 | 179 | 51.71KB |
| `docs/roadmap/ROADMAP_MODULO_5_IMPUESTOS.md` | 819 | 0 | 193 | 45.54KB |

## Mapa de Arquitectura

```text
erp-contable-bo/
├── .editorconfig (44 LoC | 3.19KB)
├── audit.py (435 LoC | 23.00KB) [157 comentarios]
├── AUDITORIA_MASTER.md (219 LoC | 12.91KB)
├── erp.html (359 LoC | 19.62KB) [41 comentarios]
├── guia.html (611 LoC | 38.56KB) [13 comentarios]
├── index.html (199 LoC | 12.73KB) [44 comentarios]
├── README.md (197 LoC | 12.70KB)
├── siguiente.md (356 LoC | 13.26KB)
├── css/ [44.29KB]
│   ├── componentes.css (505 LoC | 16.99KB) [50 comentarios]
│   ├── dashboard.css (235 LoC | 8.42KB) [22 comentarios]
│   ├── estilos.css (250 LoC | 10.38KB) [50 comentarios]
│   └── reportes.css (263 LoC | 8.49KB) [43 comentarios]
├── datos/ [37.91KB]
│   └── ejemplo.json (1099 LoC | 37.91KB)
├── docs/ [636.10KB]
│   ├── estructura.md (59 LoC | 4.19KB)
│   ├── GUIA_MAESTRA.md (477 LoC | 23.54KB)
│   ├── adr/ [6.51KB]
│   │   ├── ADR-001-stack-vanilla-sin-backend.md (50 LoC | 2.69KB)
│   │   └── ADR-002-normas-contables-bolivianas.md (71 LoC | 3.82KB)
│   ├── aprendizaje/ [111.15KB]
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
│   │   ├── 14-particularidades-bolivianas.md (172 LoC | 9.87KB)
│   │   ├── 17-impuestos-bolivianos-explicados.md (163 LoC | 8.62KB)
│   │   ├── 18-calendario-tributario.md (214 LoC | 10.76KB)
│   │   └── 19-compensacion-it-iue.md (118 LoC | 7.04KB)
│   └── roadmap/ [490.72KB]
│       ├── ROADMAP_LANDING_PAGE_PORTAFOLIO.md (522 LoC | 31.86KB)
│       ├── ROADMAP_MODULO_0_SETUP.md (421 LoC | 22.56KB)
│       ├── ROADMAP_MODULO_1_DOCUMENTOS_FUENTE.md (478 LoC | 25.03KB)
│       ├── ROADMAP_MODULO_2_COMPRAS_VENTAS.md (665 LoC | 35.90KB)
│       ├── ROADMAP_MODULO_3_MOTOR_CONTABLE.md (716 LoC | 42.99KB)
│       ├── ROADMAP_MODULO_4_NOMINA_BOLIVIANA.md (768 LoC | 42.85KB)
│       ├── ROADMAP_MODULO_5_IMPUESTOS.md (819 LoC | 45.54KB)
│       ├── ROADMAP_MODULO_6_ESTADOS_FINANCIEROS.md (739 LoC | 42.78KB)
│       ├── ROADMAP_MODULO_7_CUMPLIMIENTO_SIN.md (835 LoC | 51.71KB)
│       ├── ROADMAP_MODULO_8_COSTOS.md (991 LoC | 53.62KB)
│       ├── ROADMAP_MODULO_9_MIGRACION_SAAS.md (1240 LoC | 62.90KB)
│       └── ROADMAP_RESUMEN_FINAL.md (623 LoC | 32.97KB)
├── js/ [1.24MB]
│   ├── app.js (484 LoC | 30.21KB) [91 comentarios]
│   ├── capas/ [117.12KB]
│   │   ├── capa1-documentos.js (496 LoC | 21.95KB) [53 comentarios]
│   │   ├── capa3-motor.js (905 LoC | 51.04KB) [366 comentarios]
│   │   └── capa4-estados.js (968 LoC | 44.13KB) [133 comentarios]
│   ├── cargas/ [28.38KB]
│   │   └── datos-ejemplo.js (412 LoC | 28.38KB) [51 comentarios]
│   ├── config/ [160.42KB]
│   │   ├── bolivia.js (192 LoC | 24.99KB) [376 comentarios]
│   │   ├── campos-documentos.js (299 LoC | 19.07KB) [47 comentarios]
│   │   ├── catalogos.js (687 LoC | 32.95KB) [277 comentarios]
│   │   ├── estructura-asiento.js (189 LoC | 9.69KB) [73 comentarios]
│   │   ├── periodos-contables.js (118 LoC | 7.84KB) [94 comentarios]
│   │   ├── periodos-fiscales.js (319 LoC | 17.64KB) [160 comentarios]
│   │   ├── plan-cuentas.js (758 LoC | 26.82KB) [80 comentarios]
│   │   ├── regimenes-tributarios.js (60 LoC | 3.19KB) [3 comentarios]
│   │   ├── tabla-bono-antiguedad.js (51 LoC | 4.00KB) [40 comentarios]
│   │   └── tipos-documentos.js (271 LoC | 14.22KB) [86 comentarios]
│   ├── modulos/ [541.90KB]
│   │   ├── analisis-clientes.js (313 LoC | 14.32KB) [63 comentarios]
│   │   ├── analisis-margen.js (366 LoC | 16.97KB) [65 comentarios]
│   │   ├── asientos-contables.js (240 LoC | 15.66KB) [102 comentarios]
│   │   ├── asientos-costos.js (285 LoC | 14.66KB) [91 comentarios]
│   │   ├── asientos-nomina.js (235 LoC | 13.48KB) [115 comentarios]
│   │   ├── bono-antiguedad.js (177 LoC | 10.43KB) [83 comentarios]
│   │   ├── calendario-tributario.js (301 LoC | 12.31KB) [62 comentarios]
│   │   ├── catalogo-empleados.js (252 LoC | 14.85KB) [105 comentarios]
│   │   ├── centros-costo.js (318 LoC | 14.97KB) [82 comentarios]
│   │   ├── compras.js (567 LoC | 31.01KB) [163 comentarios]
│   │   ├── costos-cif.js (283 LoC | 12.87KB) [82 comentarios]
│   │   ├── dashboard-costos.js (310 LoC | 14.59KB) [43 comentarios]
│   │   ├── facturacion.js (383 LoC | 19.44KB) [135 comentarios]
│   │   ├── fundempresa.js (179 LoC | 11.49KB) [93 comentarios]
│   │   ├── impuestos.js (2028 LoC | 101.10KB) [717 comentarios]
│   │   ├── inventario-capas.js (480 LoC | 23.62KB) [116 comentarios]
│   │   ├── inventario.js (342 LoC | 21.26KB) [133 comentarios]
│   │   ├── lcv.js (125 LoC | 8.74KB) [58 comentarios]
│   │   ├── liquidaciones.js (298 LoC | 15.80KB) [122 comentarios]
│   │   ├── modulo-cumplimiento.js (1228 LoC | 51.36KB) [166 comentarios]
│   │   ├── nomina.js (202 LoC | 14.77KB) [125 comentarios]
│   │   ├── ordenes-trabajo.js (352 LoC | 17.31KB) [96 comentarios]
│   │   ├── provisiones.js (306 LoC | 19.20KB) [149 comentarios]
│   │   ├── punto-equilibrio.js (344 LoC | 16.03KB) [59 comentarios]
│   │   ├── rc-iva.js (167 LoC | 9.89KB) [83 comentarios]
│   │   └── ventas.js (473 LoC | 25.75KB) [109 comentarios]
│   ├── nucleo/ [51.74KB]
│   │   ├── almacenamiento.js (206 LoC | 12.62KB) [128 comentarios]
│   │   ├── enrutador.js (126 LoC | 7.80KB) [69 comentarios]
│   │   ├── sidebar-colapsable.js (67 LoC | 3.39KB) [8 comentarios]
│   │   ├── utilidades.js (173 LoC | 14.40KB) [181 comentarios]
│   │   └── validadores.js (171 LoC | 13.53KB) [135 comentarios]
│   └── vistas/ [342.07KB]
│       ├── asientos-vista.js (192 LoC | 8.89KB) [12 comentarios]
│       ├── balanza-vista.js (166 LoC | 7.99KB) [4 comentarios]
│       ├── bono-antiguedad-vista.js (173 LoC | 8.90KB) [12 comentarios]
│       ├── catalogos-vista.js (508 LoC | 25.39KB) [49 comentarios]
│       ├── compras-vista.js (441 LoC | 22.57KB) [43 comentarios]
│       ├── costos-vista.js (665 LoC | 33.38KB) [42 comentarios]
│       ├── cumplimiento-vista.js (819 LoC | 39.72KB) [48 comentarios]
│       ├── documentos-vista.js (630 LoC | 36.81KB) [84 comentarios]
│       ├── empleados-vista.js (250 LoC | 12.17KB) [15 comentarios]
│       ├── estados-vista.js (463 LoC | 25.64KB) [41 comentarios]
│       ├── impuestos-vista.js (451 LoC | 25.45KB) [47 comentarios]
│       ├── inventario-vista.js (350 LoC | 19.25KB) [37 comentarios]
│       ├── lcv-vista.js (157 LoC | 7.74KB) [13 comentarios]
│       ├── libro-diario-vista.js (295 LoC | 12.92KB) [16 comentarios]
│       ├── libro-mayor-vista.js (170 LoC | 8.48KB) [13 comentarios]
│       ├── nomina-vista.js (316 LoC | 17.65KB) [39 comentarios]
│       ├── rc-iva-vista.js (175 LoC | 8.67KB) [10 comentarios]
│       └── ventas-vista.js (406 LoC | 20.47KB) [33 comentarios]
├── landing/ [122.44KB]
│   ├── assets/ [791.00B]
│   │   ├── logo.svg (14 LoC | 791.00B)
│   │   └── imagenes/ [0.00B]
│   ├── css/ [63.71KB]
│   │   ├── base.css (169 LoC | 6.86KB) [21 comentarios]
│   │   ├── componentes.css (258 LoC | 9.22KB) [27 comentarios]
│   │   ├── secciones.css (1364 LoC | 40.24KB) [113 comentarios]
│   │   └── variables.css (95 LoC | 7.39KB) [38 comentarios]
│   └── js/ [57.96KB]
│       ├── comparador.js (304 LoC | 15.99KB) [44 comentarios]
│       ├── datos.js (370 LoC | 19.30KB) [37 comentarios]
│       └── landing.js (425 LoC | 22.67KB) [59 comentarios]
├── practica/ [3.08KB]
│   ├── package-lock.json (22 LoC | 542.00B)
│   ├── package.json (16 LoC | 296.00B)
│   └── practica.js (56 LoC | 2.26KB) [12 comentarios]
└── vistas/ [231.93KB]
    ├── asientos.html (71 LoC | 3.76KB) [8 comentarios]
    ├── balanza.html (105 LoC | 6.13KB) [18 comentarios]
    ├── bono-antiguedad.html (110 LoC | 6.29KB) [10 comentarios]
    ├── catalogos.html (220 LoC | 14.02KB) [25 comentarios]
    ├── compras.html (297 LoC | 17.32KB) [30 comentarios]
    ├── costos-fundamentos.html (406 LoC | 18.63KB) [8 comentarios]
    ├── costos.html (364 LoC | 15.17KB) [13 comentarios]
    ├── cumplimiento.html (221 LoC | 11.27KB) [13 comentarios]
    ├── dashboard.html (346 LoC | 16.26KB) [7 comentarios]
    ├── documentos.html (355 LoC | 18.51KB) [24 comentarios]
    ├── empleados.html (192 LoC | 11.03KB) [10 comentarios]
    ├── estados-financieros.html (211 LoC | 9.91KB) [12 comentarios]
    ├── impuestos.html (355 LoC | 16.26KB) [12 comentarios]
    ├── inventario.html (171 LoC | 11.95KB) [24 comentarios]
    ├── lcv.html (103 LoC | 5.84KB) [14 comentarios]
    ├── libro-diario.html (225 LoC | 10.58KB) [18 comentarios]
    ├── libro-mayor.html (109 LoC | 6.49KB) [16 comentarios]
    ├── nomina.html (208 LoC | 10.80KB) [10 comentarios]
    ├── rc-iva.html (119 LoC | 6.44KB) [9 comentarios]
    └── ventas.html (252 LoC | 15.27KB) [28 comentarios]
```
