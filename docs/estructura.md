erp-contable-bo/
│
├── 📄 index.html                    ← Punto de entrada (dashboard inicial)
├── 📄 README.md                     ← Documentación del proyecto
│
├── 📁 css/                          ← Estilos y diseño visual
│   ├── 📄 estilos.css               ← Estilos globales (colores, tipografía, layout)
│   ├── 📄 componentes.css           ← Botones, tarjetas, tablas, formularios
│   ├── 📄 dashboard.css             ← Estilos del panel principal
│   └── 📄 reportes.css              ← Estilos de estados financieros e impresiones
│
├── 📁 js/                           ← Toda la lógica del sistema
│   │
│   ├── 📄 app.js                    ← Arranque del sistema + router (conecta todo)
│   │
│   ├── 📁 nucleo/                   ← Funciones base (se usan en todo el sistema)
│   │   ├── 📄 enrutador.js          ← Navega entre vistas sin recargar (SPA simple)
│   │   ├── 📄 almacenamiento.js     ← Guarda datos en LocalStorage (sin backend)
│   │   ├── 📄 utilidades.js         ← Funciones auxiliares (formatos, fechas, cálculos)
│   │   └── 📄 validadores.js        ← Valida NIT, CUF, montos, formularios
│   │
│   ├── 📁 config/                   ← Parámetros configurables (¡clave para Bolivia!)
│   │   ├── 📄 bolivia.js            ← Constantes: IVA 13%, IT 3%, IUE 25%, SMN, etc.
│   │   └── 📄 plan-cuentas.js       ← Estructura del plan contable (1-Activos, 2-Pasivos...)
│   │
│   ├── 📁 capas/                    ← Las 5 capas del ERP (arquitectura principal)
│   │   ├── 📄 capa1-documentos.js   ← Capa 1: Documentos fuente (facturas, recibos)
│   │   ├── 📄 capa2-modulos.js      ← Capa 2: Módulos operativos
│   │   ├── 📄 capa3-motor.js        ← Capa 3: Motor contable (asientos, mayor, balanza)
│   │   ├── 📄 capa4-estados.js      ← Capa 4: Estados financieros
│   │   └── 📄 capa5-cumplimiento.js ← Capa 5: Reportería al SIN
│   │
│   └── 📁 modulos/                  ← Módulos operativos específicos (Capa 2)
│       ├── 📄 compras.js            ← Ciclo de compras + proveedores
│       ├── 📄 ventas.js             ← Ciclo de ventas + clientes
│       ├── 📄 inventario.js         ← Kardex valorado (PEPS / Promedio Ponderado)
│       ├── 📄 nomina.js             ← Nómina boliviana (aguinaldo, bono antigüedad)
│       ├── 📄 impuestos.js          ← IVA, IT, IUE, RC-IVA + compensaciones
│       ├── 📄 facturacion.js        ← Facturación electrónica (CUIS, CUFD, CUF)
│       ├── 📄 tesoreria.js          ← Cajas, bancos, conciliación
│       └── 📄 activos-fijos.js      ← Activos + depreciación
│
├── 📁 vistas/                       ← HTML de cada pantalla (vistas del usuario)
│   ├── 📄 dashboard.html            ← Panel principal con indicadores
│   ├── 📄 compras.html              ← Formulario y lista de compras
│   ├── 📄 ventas.html               ← Formulario y lista de ventas
│   ├── 📄 inventario.html           ← Kardex y movimientos
│   ├── 📄 nomina.html               ← Planilla de sueldos
│   ├── 📄 impuestos.html            ← Liquidación IVA/IT/IUE
│   ├── 📄 estados-financieros.html  ← Balance + Estado de Resultados
│   └── 📄 cumplimiento.html         ← Formularios SIN + calendario tributario
│
├── 📁 datos/                        ← Datos de ejemplo para demostración
│   └── 📄 ejemplo.json              ← Empresa ficticia con transacciones precargadas
│
└── 📁 docs/                         ← Material didáctico (¡ideal para exponer!)
    ├── 📄 guia-aprendizaje.md       ← Explicación didáctica de cada capa
    ├── 📄 glosario.md               ← Términos contables bolivianos
    └── 📄 diagrama-flujo.md         ← Diagramas de flujo entre módulos