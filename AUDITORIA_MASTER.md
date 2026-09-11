# 🛠️ Auditoría de Software — erp-contable-bo

> Generado: `2026-09-10 22:50`

## Resumen

| Métrica | Valor |
| :--- | :--- |
| **Proyecto** | `erp-contable-bo` |
| **Líneas de Código (Netas)** | 41090 LoC |
| **Peso Total del Proyecto** | 2.09MB |
| **Archivos analizados** | 127 |
| **Timestamp** | 2026-09-10 22:50 |
| **Estado** | Activa |

## Breakdown por Capa

| Capa | Archivos | LoC | Comentarios | Peso | % LoC |
| :--- | ---: | ---: | ---: | ---: | ---: |
| `modulos` | 26 | 10509 | 0 | 539.54KB | 25.6% █████ |
| `roadmap` | 11 | 8295 | 0 | 458.85KB | 20.2% ████ |
| `vistas` | 18 | 6466 | 0 | 334.20KB | 15.7% ███ |
| `vistas` | 19 | 3880 | 300 | 205.58KB | 9.4% █ |
| `config` | 10 | 2944 | 0 | 160.15KB | 7.2% █ |
| `capas` | 3 | 2351 | 0 | 116.16KB | 5.7% █ |
| `aprendizaje` | 17 | 2263 | 0 | 111.15KB | 5.5% █ |
| `css` | 4 | 1183 | 157 | 42.07KB | 2.9%  |
| `nucleo` | 4 | 660 | 0 | 47.19KB | 1.6%  |
| `js` | 1 | 485 | 89 | 30.13KB | 1.2%  |
| `datos` | 1 | 392 | 0 | 12.10KB | 1.0%  |
| `cargas` | 1 | 127 | 0 | 8.29KB | 0.3%  |
| `adr` | 2 | 121 | 0 | 6.51KB | 0.3%  |
| `practica` | 3 | 94 | 12 | 3.08KB | 0.2%  |
| `docs` | 1 | 59 | 0 | 4.19KB | 0.1%  |
| **TOTAL** | — | **41090** | — | **2.09MB** | 100% |

## Desglose por Extensión

| Extensión | Archivos | LoC | Peso |
| :--- | ---: | ---: | ---: |
| `.js` | 64 | 23598 | 1.21MB |
| `.md` | 34 | 11293 | 605.18KB |
| `.html` | 20 | 4107 | 218.24KB |
| `.css` | 4 | 1183 | 42.07KB |
| `.py` | 1 | 435 | 23.00KB |
| `.json` | 3 | 430 | 12.92KB |
| `(sin extensión)` | 1 | 44 | 3.19KB |

## Top 10 Archivos por LoC

| Archivo | LoC | Comentarios | En blanco | Peso |
| :--- | ---: | ---: | ---: | ---: |
| `js/modulos/impuestos.js` | 2024 | 717 | 401 | 100.59KB |
| `docs/roadmap/ROADMAP_MODULO_9_MIGRACION_SAAS.md` | 1240 | 0 | 255 | 62.90KB |
| `js/modulos/modulo-cumplimiento.js` | 1228 | 166 | 271 | 51.36KB |
| `docs/roadmap/ROADMAP_MODULO_8_COSTOS.md` | 991 | 0 | 208 | 53.62KB |
| `js/capas/capa4-estados.js` | 950 | 130 | 158 | 43.17KB |
| `js/capas/capa3-motor.js` | 905 | 366 | 209 | 51.04KB |
| `docs/roadmap/ROADMAP_MODULO_7_CUMPLIMIENTO_SIN.md` | 835 | 0 | 179 | 51.71KB |
| `docs/roadmap/ROADMAP_MODULO_5_IMPUESTOS.md` | 819 | 0 | 193 | 45.54KB |
| `js/vistas/cumplimiento-vista.js` | 819 | 48 | 124 | 39.72KB |
| `docs/roadmap/ROADMAP_MODULO_4_NOMINA_BOLIVIANA.md` | 768 | 0 | 170 | 42.85KB |

## Mapa de Arquitectura

```text
erp-contable-bo/
├── .editorconfig (44 LoC | 3.19KB)
├── audit.py (435 LoC | 23.00KB) [157 comentarios]
├── AUDITORIA_MASTER.md (174 LoC | 9.98KB)
├── index.html (227 LoC | 12.66KB) [35 comentarios]
├── README.md (25 LoC | 1.25KB)
├── siguiente.md (356 LoC | 13.26KB)
├── css/ [42.07KB]
│   ├── componentes.css (505 LoC | 16.99KB) [50 comentarios]
│   ├── dashboard.css (235 LoC | 8.42KB) [22 comentarios]
│   ├── estilos.css (180 LoC | 8.16KB) [42 comentarios]
│   └── reportes.css (263 LoC | 8.49KB) [43 comentarios]
├── datos/ [12.10KB]
│   └── ejemplo.json (392 LoC | 12.10KB)
├── docs/ [580.70KB]
│   ├── estructura.md (59 LoC | 4.19KB)
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
│   └── roadmap/ [458.85KB]
│       ├── ROADMAP_MODULO_0_SETUP.md (421 LoC | 22.55KB)
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
├── js/ [1.21MB]
│   ├── app.js (485 LoC | 30.13KB) [89 comentarios]
│   ├── capas/ [116.16KB]
│   │   ├── capa1-documentos.js (496 LoC | 21.95KB) [53 comentarios]
│   │   ├── capa3-motor.js (905 LoC | 51.04KB) [366 comentarios]
│   │   └── capa4-estados.js (950 LoC | 43.17KB) [130 comentarios]
│   ├── cargas/ [8.29KB]
│   │   └── datos-ejemplo.js (127 LoC | 8.29KB) [22 comentarios]
│   ├── config/ [160.15KB]
│   │   ├── bolivia.js (192 LoC | 24.99KB) [376 comentarios]
│   │   ├── campos-documentos.js (299 LoC | 19.07KB) [47 comentarios]
│   │   ├── catalogos.js (687 LoC | 32.95KB) [277 comentarios]
│   │   ├── estructura-asiento.js (189 LoC | 9.69KB) [73 comentarios]
│   │   ├── periodos-contables.js (118 LoC | 7.84KB) [94 comentarios]
│   │   ├── periodos-fiscales.js (319 LoC | 17.64KB) [160 comentarios]
│   │   ├── plan-cuentas.js (758 LoC | 26.82KB) [80 comentarios]
│   │   ├── regimenes-tributarios.js (60 LoC | 3.19KB) [3 comentarios]
│   │   ├── tabla-bono-antiguedad.js (51 LoC | 3.73KB) [37 comentarios]
│   │   └── tipos-documentos.js (271 LoC | 14.22KB) [86 comentarios]
│   ├── modulos/ [539.54KB]
│   │   ├── analisis-clientes.js (305 LoC | 13.93KB) [63 comentarios]
│   │   ├── analisis-margen.js (360 LoC | 16.74KB) [65 comentarios]
│   │   ├── asientos-contables.js (240 LoC | 15.66KB) [102 comentarios]
│   │   ├── asientos-costos.js (285 LoC | 14.66KB) [91 comentarios]
│   │   ├── asientos-nomina.js (235 LoC | 13.48KB) [115 comentarios]
│   │   ├── bono-antiguedad.js (177 LoC | 10.43KB) [83 comentarios]
│   │   ├── calendario-tributario.js (301 LoC | 12.31KB) [62 comentarios]
│   │   ├── catalogo-empleados.js (252 LoC | 14.85KB) [105 comentarios]
│   │   ├── centros-costo.js (318 LoC | 14.97KB) [82 comentarios]
│   │   ├── compras.js (567 LoC | 31.01KB) [163 comentarios]
│   │   ├── costos-cif.js (283 LoC | 12.87KB) [82 comentarios]
│   │   ├── dashboard-costos.js (297 LoC | 14.02KB) [43 comentarios]
│   │   ├── facturacion.js (383 LoC | 19.44KB) [135 comentarios]
│   │   ├── fundempresa.js (179 LoC | 11.49KB) [93 comentarios]
│   │   ├── impuestos.js (2024 LoC | 100.59KB) [717 comentarios]
│   │   ├── inventario-capas.js (480 LoC | 23.62KB) [116 comentarios]
│   │   ├── inventario.js (342 LoC | 21.26KB) [133 comentarios]
│   │   ├── lcv.js (125 LoC | 8.74KB) [58 comentarios]
│   │   ├── liquidaciones.js (298 LoC | 15.80KB) [122 comentarios]
│   │   ├── modulo-cumplimiento.js (1228 LoC | 51.36KB) [166 comentarios]
│   │   ├── nomina.js (202 LoC | 14.77KB) [125 comentarios]
│   │   ├── ordenes-trabajo.js (352 LoC | 17.31KB) [96 comentarios]
│   │   ├── provisiones.js (306 LoC | 19.20KB) [149 comentarios]
│   │   ├── punto-equilibrio.js (330 LoC | 15.37KB) [59 comentarios]
│   │   ├── rc-iva.js (167 LoC | 9.89KB) [83 comentarios]
│   │   └── ventas.js (473 LoC | 25.75KB) [109 comentarios]
│   ├── nucleo/ [47.19KB]
│   │   ├── almacenamiento.js (190 LoC | 11.46KB) [124 comentarios]
│   │   ├── enrutador.js (126 LoC | 7.80KB) [69 comentarios]
│   │   ├── utilidades.js (173 LoC | 14.40KB) [181 comentarios]
│   │   └── validadores.js (171 LoC | 13.53KB) [135 comentarios]
│   └── vistas/ [334.20KB]
│       ├── asientos-vista.js (192 LoC | 8.89KB) [12 comentarios]
│       ├── balanza-vista.js (166 LoC | 7.99KB) [4 comentarios]
│       ├── bono-antiguedad-vista.js (173 LoC | 8.90KB) [12 comentarios]
│       ├── catalogos-vista.js (447 LoC | 20.90KB) [15 comentarios]
│       ├── compras-vista.js (441 LoC | 22.57KB) [43 comentarios]
│       ├── costos-vista.js (665 LoC | 33.38KB) [42 comentarios]
│       ├── cumplimiento-vista.js (819 LoC | 39.72KB) [48 comentarios]
│       ├── documentos-vista.js (541 LoC | 34.42KB) [118 comentarios]
│       ├── empleados-vista.js (250 LoC | 12.17KB) [15 comentarios]
│       ├── estados-vista.js (463 LoC | 25.61KB) [41 comentarios]
│       ├── impuestos-vista.js (440 LoC | 24.49KB) [41 comentarios]
│       ├── inventario-vista.js (350 LoC | 19.25KB) [37 comentarios]
│       ├── lcv-vista.js (157 LoC | 7.74KB) [13 comentarios]
│       ├── libro-diario-vista.js (295 LoC | 12.92KB) [16 comentarios]
│       ├── libro-mayor-vista.js (170 LoC | 8.48KB) [13 comentarios]
│       ├── nomina-vista.js (316 LoC | 17.65KB) [39 comentarios]
│       ├── rc-iva-vista.js (175 LoC | 8.67KB) [10 comentarios]
│       └── ventas-vista.js (406 LoC | 20.47KB) [33 comentarios]
├── practica/ [3.08KB]
│   ├── package-lock.json (22 LoC | 542.00B)
│   ├── package.json (16 LoC | 296.00B)
│   └── practica.js (56 LoC | 2.26KB) [12 comentarios]
└── vistas/ [205.58KB]
    ├── asientos.html (71 LoC | 3.76KB) [8 comentarios]
    ├── balanza.html (105 LoC | 6.13KB) [18 comentarios]
    ├── bono-antiguedad.html (110 LoC | 6.29KB) [10 comentarios]
    ├── catalogos.html (220 LoC | 14.02KB) [25 comentarios]
    ├── compras.html (297 LoC | 17.32KB) [30 comentarios]
    ├── costos.html (318 LoC | 12.90KB) [12 comentarios]
    ├── cumplimiento.html (221 LoC | 11.27KB) [13 comentarios]
    ├── dashboard.html (224 LoC | 10.09KB) [7 comentarios]
    ├── documentos.html (369 LoC | 19.24KB) [24 comentarios]
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
