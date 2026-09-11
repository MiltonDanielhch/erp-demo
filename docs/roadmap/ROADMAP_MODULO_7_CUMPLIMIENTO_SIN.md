# 📁 ROADMAP_MODULO_7_CUMPLIMIENTO_SIN.md

**Proyecto:** ERP Contable Integral Boliviano (Prototipo Educativo / Portafolio)
**Arquitectura:** Frontend Vanilla JS + LocalStorage (sin backend real — enfoque didáctico)
**Versión:** 1.0.0 · **Formato:** Guía Arquitectónica Explicativa
**Tiempo estimado:** 4–6 horas · **Bloquea:** Módulo 8 (Migración a SaaS real)
**Depende de:** Módulo 0 (Setup) + Módulo 5 (Impuestos) + Módulo 6 (Estados Financieros)

> **Objetivo del Módulo:** Construir la **Capa 5: Cumplimiento y Reportería** — la capa donde el ERP deja de ser una herramienta interna y empieza a **"hablar" con el SIN, Fundempresa y los auditores externos**. Aquí se generan los **formularios oficiales del SIN** (200, 400, 500, 110, 601, 605), se gestiona el **calendario tributario** con alertas por vencimiento según el último dígito del NIT, se genera el **Libro de Compras y Ventas (LCV)** en el formato exigido por el SIN, se simulan los **códigos de facturación electrónica** (CUIS, CUFD, CUF), se registran las **obligaciones societarias ante Fundempresa**, y se construyen los **dashboards de cumplimiento** con semáforos de vencimiento.

> **Nota didáctica:** Este módulo es donde el prototipo demuestra que **no es solo un sistema contable, sino un sistema de cumplimiento tributario**. En una exposición, este es el momento de mostrar cómo el ERP genera automáticamente el Formulario 200 del IVA, el Formulario 400 del IT, el Formulario 500 del IUE, y el LCV en formato SIN — todo desde los datos que ya se registraron en los módulos anteriores. El contador ya no tiene que copiar números de un lado a otro: el ERP los consolida solo.

---

## 🗺️ Mapa del Módulo

```text
Módulo 7
├── Fase 7.1 → Teoría: Cumplimiento Tributario ante el SIN
├── Fase 7.2 → Calendario Tributario con alertas automáticas
├── Fase 7.3 → Generación de Formularios SIN (200, 400, 500, 110)
├── Fase 7.4 → Formulario 601: Operaciones con Partes Vinculadas
├── Fase 7.5 → Formulario 605: Estados Financieros vía SIAT
├── Fase 7.6 → Libro de Compras y Ventas (LCV) en formato SIN
├── Fase 7.7 → Facturación Electrónica: CUIS, CUFD, CUF (simulación)
├── Fase 7.8 → Fundempresa: Obligaciones societarias
├── Fase 7.9 → Auditoría externa: Trazabilidad y papeles de trabajo
├── Fase 7.10 → Dashboard de Cumplimiento (semáforos y alertas)
├── Fase 7.11 → Vista de Cumplimiento
└── Fase 7.12 → Smoke test final y commit de cierre
```

---

## 🟥 Estado: `[ ] Pendiente`

---

# FASE 7.1 — Teoría: Cumplimiento Tributario ante el SIN

## ¿Qué es el SIN y qué exige?

```text
╔══════════════════════════════════════════════════════════════════╗
║  SIN = Servicio de Impuestos Nacionales                         ║
║  Es la autoridad tributaria de Bolivia.                         ║
║                                                                  ║
║  EXIGE:                                                         ║
║  ✓ Declaraciones juradas mensuales (IVA, IT, retenciones)       ║
║  ✓ Declaración jurada anual (IUE)                               ║
║  ✓ Envío digital de Estados Financieros (Form. 605)             ║
║  ✓ Libro de Compras y Ventas (LCV) actualizado                  ║
║  ✓ Facturación electrónica validada (SIAT)                      ║
║  ✓ Trazabilidad completa: documento → asiento → estado          ║
║                                                                  ║
║  SI NO CUMPLES:                                                 ║
║  ✗ Multas por declaración tardía                                ║
║  ✗ Desconocimiento de crédito fiscal                            ║
║  ✗ Clausura del establecimiento                                 ║
║  ✗ Responsabilidad penal del representante legal                ║
╚══════════════════════════════════════════════════════════════════╝
```

## Formularios obligatorios ante el SIN

```text
╔══════════════════════════════════════════════════════════════════╗
║ FORMULARIO │ FRECUENCIA │ QUÉ DECLARA                          ║
║────────────┼────────────┼──────────────────────────────────────║
║ Form. 200  │ Mensual    │ IVA (débito/crédito) + RC-IVA       ║
║ Form. 400  │ Mensual    │ IT sobre ingresos brutos             ║
║ Form. 110  │ Mensual    │ Retenciones RC-IVA e IT              ║
║ Form. 500  │ Anual      │ IUE (contribuyentes con contabilidad)║
║ Form. 510  │ Anual      │ IUE (otros casos)                    ║
║ Form. 601  │ Anual*     │ Operaciones con partes vinculadas    ║
║ Form. 605  │ Anual      │ Estados Financieros vía SIAT         ║
║ Form. 530  │ Ocasional  │ IUE-BE (beneficiarios del exterior)  ║
║────────────┼────────────┼──────────────────────────────────────║
║ LCV        │ Mensual    │ Libro de Compras y Ventas IVA        ║
╚══════════════════════════════════════════════════════════════════╝
* Form. 601: solo si corresponde (operaciones con partes vinculadas)
```

## Tareas de la Fase 7.1

```text
[ ] Crear docs/aprendizaje/24-cumplimiento-sin-explicado.md
    → Explicación teórica del cumplimiento ante el SIN (máximo 3 páginas).
    → Incluir: qué es el SIN, qué exige, consecuencias de incumplir.
    → 🧠 Mini-Prompt para IA: "Escribe una explicación didáctica 
      del cumplimiento tributario ante el SIN de Bolivia. Incluye: 
      qué es el SIN, qué formularios se deben presentar (200, 400, 
      110, 500, 605), qué es el LCV, qué es el SIAT, y cuáles son 
      las consecuencias de no cumplir (multas, clausura, 
      responsabilidad penal). Máximo 700 palabras."

[ ] Crear docs/aprendizaje/25-formularios-sin-detallados.md
    → Tabla completa de formularios con frecuencia y contenido.
    → Incluir plazos de vencimiento según dígito del NIT.
    → 🧠 Mini-Prompt para IA: "Genera una tabla detallada de todos 
      los formularios del SIN boliviano: Form. 200 (IVA), Form. 400 
      (IT), Form. 110 (retenciones), Form. 500/510 (IUE), Form. 601 
      (partes vinculadas), Form. 605 (estados financieros), Form. 530 
      (IUE-BE). Para cada uno: frecuencia, qué declara, plazo de 
      vencimiento, y quién está obligado."

[ ] Crear docs/aprendizaje/26-consecuencias-incumplimiento.md
    → Explicar las multas, intereses y sanciones del Código Tributario.
    → Incluir la prescripción (4 años según Ley 1733, antes 8 años).
    → 🧠 Mini-Prompt para IA: "Explica las consecuencias del 
      incumplimiento tributario en Bolivia según el Código Tributario 
      (Ley 2492). Incluye: multas por declaración tardía, intereses 
      sobre deudas, clausura del establecimiento, responsabilidad 
      del representante legal, y la prescripción de facultades 
      (reducida de 8 a 4 años por la Ley 1733 de 2026). Máximo 
      500 palabras."
```

---

# FASE 7.2 — Calendario Tributario con Alertas Automáticas

## ¿Qué hace esta fase?
Implementa el **calendario tributario** — la herramienta que muestra todos los vencimientos del SIN y genera alertas antes de cada fecha límite. Los vencimientos varían según el **último dígito del NIT** del contribuyente.

## Lógica del calendario

```text
CÁLCULO DEL VENCIMIENTO:
─────────────────────────────────────────────────
Último dígito del NIT │ Día de vencimiento
──────────────────────┼──────────────────────
1                     │ 10 del mes siguiente
2                     │ 11 del mes siguiente
3                     │ 12 del mes siguiente
4                     │ 13 del mes siguiente
5                     │ 14 del mes siguiente
6                     │ 15 del mes siguiente
7                     │ 16 del mes siguiente
8                     │ 17 del mes siguiente
9                     │ 18 del mes siguiente
0                     │ 19 del mes siguiente

EJEMPLO:
─────────────────────────────────────────────────
Empresa: Distribuidora Mamoré SRL
NIT: 123456789-1 (último dígito: 1)

Período fiscal: Septiembre 2026
Vencimiento Form. 200: 10 de octubre de 2026
Vencimiento Form. 400: 10 de octubre de 2026
Vencimiento Form. 110: 10 de octubre de 2026

⚠️ Si el día 10 es feriado o fin de semana, 
   se corre al siguiente día hábil.

PLAZOS ESPECIALES:
─────────────────────────────────────────────────
• IUE (Form. 500): 120 días tras cierre de gestión.
• Form. 605 (EEFF): junto con el Form. 500.
• Segundo aguinaldo: 20 de diciembre.
• SIETE-RG: bimestral (días según dígito NIT).
```

## Tareas de la Fase 7.2

```text
[ ] Crear js/modulos/calendario-tributario.js
    → Clase CalendarioTributario con métodos de gestión.

[ ] Implementar calcularVencimientos(nit, periodo)
    → Extrae el último dígito del NIT.
    → Calcula el día de vencimiento para cada formulario.
    → Verifica si el día es feriado o fin de semana.
    → Si es feriado → corre al siguiente día hábil.
    → Devuelve array de { formulario, fechaVencimiento, diasRestantes }.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que calcule 
      los vencimientos tributarios en Bolivia según el último 
      dígito del NIT. Los días van del 10 al 19 del mes siguiente. 
      Si el día cae en feriado o fin de semana, se corre al 
      siguiente día hábil. Incluye los plazos especiales: IUE 
      (120 días tras cierre), segundo aguinaldo (20 de diciembre). 
      Devuelve array con cada formulario, fecha de vencimiento, 
      y días restantes."

[ ] Implementar generarAlertasVencimiento(diasAntes)
    → Recorre todos los vencimientos pendientes.
    → Si faltan ≤ diasAntes → genera alerta.
    → Niveles: 🟢 (>7 días), 🟡 (3-7 días), 🔴 (<3 días).
    → Devuelve array de alertas con nivel y mensaje.

[ ] Implementar obtenerProximosVencimientos(cantidad)
    → Devuelve los próximos N vencimientos ordenados por fecha.
    → Incluye: formulario, período, fecha, días restantes.
    → Para mostrar en el dashboard.

[ ] Implementar marcarDeclarado(formulario, periodo)
    → Marca un formulario como DECLARADO.
    → Registra la fecha de declaración.
    → Actualiza el estado del período fiscal.

[ ] Implementar marcarPagado(formulario, periodo)
    → Marca un formulario como PAGADO.
    → Registra la fecha de pago y el monto.
    → Genera el asiento contable de pago.

[ ] Crear docs/aprendizaje/27-calendario-tributario-completo.md
    → Calendario anual completo con todos los formularios.
    → Incluir feriados nacionales de Bolivia.
    → 🧠 Mini-Prompt para IA: "Genera un calendario tributario 
      anual completo para Bolivia 2026. Incluye: vencimientos 
      mensuales (Form. 200, 400, 110) según dígito del NIT, 
      vencimiento anual del IUE (120 días tras cierre), envío 
      del Form. 605, pago del segundo aguinaldo (20 de diciembre 
      si corresponde), y feriados nacionales de Bolivia. Formato 
      tabla por mes."
```

---

# FASE 7.3 — Generación de Formularios SIN (200, 400, 500, 110)

## ¿Qué hace esta fase?
Genera la **estructura completa** de los formularios mensuales y anuales del SIN. En el prototipo, se genera la estructura JSON con todos los campos; en un sistema productivo, esta estructura se enviaría al SIN vía API o se cargaría en el portal del SIN.

## Estructura del Formulario 200 (IVA)

```text
FORMULARIO 200 — DECLARACIÓN JURADA DEL IVA
Período: Septiembre 2026
NIT: 123456789-1
─────────────────────────────────────────────────────────────────
VENTAS:
  Ventas netas gravadas:              Bs 15,000.00
  Ventas exentas:                     Bs 0.00
  Ventas no alcanzadas:               Bs 0.00
  ─────────────────────────────────────────────
  Total ventas:                       Bs 15,000.00

IVA DÉBITO FISCAL:                    Bs 1,950.00

COMPRAS:
  Compras netas gravadas:             Bs 7,000.00
  IVA Crédito Fiscal:                 Bs 910.00

LIQUIDACIÓN:
  IVA Débito Fiscal:                  Bs 1,950.00
  (-) IVA Crédito Fiscal:             (Bs 910.00)
  (-) Saldo a favor período anterior: Bs 0.00
  ─────────────────────────────────────────────
  IVA POR PAGAR:                      Bs 1,040.00
─────────────────────────────────────────────────────────────────
```

## Tareas de la Fase 7.3

```text
[ ] Implementar generarFormulario200(periodo)
    → Recopila: ventas, IVA débito, compras, IVA crédito.
    → Calcula: IVA por pagar o saldo a favor.
    → Genera la estructura JSON del Formulario 200.
    → Devuelve objeto con todos los campos del formulario.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que genere 
      la estructura del Formulario 200 del SIN boliviano (IVA). 
      Debe incluir: ventas netas gravadas, IVA débito fiscal, 
      compras netas, IVA crédito fiscal, saldo a favor del 
      período anterior, e IVA por pagar o saldo a favor del 
      contribuyente. Devuelve un objeto JSON con todos los 
      campos del formulario."

[ ] Implementar generarFormulario400(periodo)
    → Recopila: ingresos brutos del período.
    → Calcula: IT = ingresos brutos × 3%.
    → Genera la estructura JSON del Formulario 400.

[ ] Implementar generarFormulario110(periodo)
    → Recopila: retenciones de RC-IVA e IT del período.
    → Detalla por tipo: empleados, proveedores, profesionales.
    → Genera la estructura JSON del Formulario 110.

[ ] Implementar generarFormulario500(año)
    → Recopila: utilidad contable, ajustes, utilidad imponible.
    → Calcula: IUE determinado, IT compensado, IUE por pagar.
    → Genera la estructura JSON del Formulario 500.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que genere 
      la estructura del Formulario 500 del SIN boliviano (IUE). 
      Debe incluir: utilidad contable, ajustes fiscales, utilidad 
      imponible, IUE determinado (25%), IT pagado en el año 
      (compensación Art. 77), e IUE por pagar. Devuelve un 
      objeto JSON con todos los campos."

[ ] Implementar validarFormulario(formulario)
    → Verifica que todos los campos obligatorios estén presentes.
    → Verifica que los montos sean coherentes (no negativos).
    → Verifica que la liquidación cuadre.
    → Devuelve { valido, errores[] }.

[ ] Implementar exportarFormulario(formulario, formato)
    → Exporta el formulario a JSON o CSV.
    → En un sistema productivo, se exportaría al formato exacto 
      que exige el SIN (XML o JSON según el caso).
    → Devuelve el string del archivo exportado.
```

---

# FASE 7.4 — Formulario 601: Operaciones con Partes Vinculadas

## ¿Qué hace esta fase?
Implementa la estructura del **Formulario 601** — la declaración jurada informativa de operaciones con partes vinculadas (precios de transferencia). Solo aplica cuando la empresa tiene operaciones con empresas relacionadas (mismo grupo económico, socios comunes, etc.).

## ¿Cuándo se declara el Form. 601?

```text
CONDICIONES PARA DECLARAR:
─────────────────────────────────────────────────
• Operaciones con empresas del mismo grupo económico.
• Operaciones con socios o accionistas.
• Operaciones con empresas donde los directores son comunes.
• Operaciones con empresas en paraísos fiscales.
• Operaciones internacionales con empresas relacionadas.

⚠️ Desde la RND N° 102600000014 (2026), las empresas con 
   ventas ≥ Bs 1,700,000 enfrentan mayor trazabilidad entre 
   lo declarado y lo auditado.
```

## Tareas de la Fase 7.4

```text
[ ] Implementar detectarOperacionesPartesVinculadas(año)
    → Recorre todas las transacciones del año.
    → Identifica las que son con partes vinculadas.
    → En el prototipo, se marcan manualmente en el catálogo 
      de clientes/proveedores con un flag "esParteVinculada".
    → Devuelve lista de operaciones con partes vinculadas.

[ ] Implementar generarFormulario601(año)
    → Recopila las operaciones con partes vinculadas.
    → Genera la estructura JSON del Formulario 601.
    → Incluye: tipo de operación, monto, contraparte, 
      método de precios de transferencia aplicado.
    → Devuelve objeto con todos los campos.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que genere 
      la estructura del Formulario 601 del SIN boliviano 
      (operaciones con partes vinculadas). Debe incluir: 
      identificación de la contraparte, tipo de operación 
      (compra, venta, servicio, préstamo), monto, método de 
      precios de transferencia aplicado, y justificación. 
      Devuelve un objeto JSON."

[ ] Implementar validarUmbralForm601(ventasAnuales)
    → Verifica si la empresa supera el umbral de Bs 1,700,000.
    → Si supera → debe declarar Form. 601 con mayor detalle.
    → Si no supera → puede estar exenta (verificar normativa).
    → Devuelve { debeDeclarar, nivelDetalle }.
```

---

# FASE 7.5 — Formulario 605: Estados Financieros vía SIAT

## ¿Qué hace esta fase?
Implementa la estructura del **Formulario 605** — el envío digital de los Estados Financieros y la Memoria Anual vía el sistema SIAT. Este formulario se presenta junto con el Formulario 500 (IUE).

## Contenido del Form. 605

```text
FORMULARIO 605 — ENVÍO DIGITAL DE ESTADOS FINANCIEROS
─────────────────────────────────────────────────────────────────
CONTENIDO:
  ✓ Balance General (Estado de Situación Financiera)
  ✓ Estado de Resultados (Pérdidas y Ganancias)
  ✓ Estado de Flujo de Efectivo
  ✓ Estado de Cambios en el Patrimonio Neto
  ✓ Notas a los Estados Financieros
  ✓ Memoria Anual (resumen de gestión)

PLAZO:
  • Junto con el Formulario 500.
  • 120 días tras el cierre de la gestión fiscal.

REQUISITOS:
  • Los estados deben estar auditados (si aplica).
  • El auditor debe estar registrado ante el CAUB.
  • La RND N° 102600000014 (2026) refuerza la trazabilidad 
    entre lo que entrega el auditor y lo que se declara.

⚠️ IMPORTANTE: El Form. 605 NO es el de partes vinculadas.
   Las partes vinculadas van en el Form. 601.
   (Este error estaba en la versión anterior de la guía.)
```

## Tareas de la Fase 7.5

```text
[ ] Implementar generarFormulario605(año)
    → Recopila todos los estados financieros del año.
    → Incluye: Balance, Resultados, Flujo, Cambios Patrimonio, Notas.
    → Genera la estructura JSON del Formulario 605.
    → Devuelve objeto con todos los estados y la memoria.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que prepare 
      el paquete del Formulario 605 del SIN boliviano. Debe incluir: 
      Balance General, Estado de Resultados, Estado de Flujo de 
      Efectivo, Estado de Cambios en el Patrimonio Neto, Notas a 
      los Estados Financieros, y Memoria Anual. Valida que el 
      Balance cuadre y que las Notas estén presentes. Devuelve 
      un objeto JSON listo para envío."

[ ] Implementar validarPaqueteForm605(paquete)
    → Verifica que todos los estados estén presentes.
    → Verifica que el Balance cuadre.
    → Verifica que las Notas incluyan las 12 secciones.
    → Verifica que no haya períodos cerrados pendientes.
    → Devuelve { valido, errores[] }.

[ ] Implementar generarMemoriaAnual(año, datosEmpresa)
    → Genera la estructura de la Memoria Anual.
    → Incluye: resumen de gestión, principales cifras, 
      perspectivas para el próximo año.
    → En el prototipo, es una estructura editable.

[ ] Implementar vincularConAuditoria(form605, dictamenAuditor)
    → Vincula el Form. 605 con el dictamen del auditor externo.
    → Registra: auditor, número de registro CAUB, fecha del dictamen.
    → ⚠️ La RND 102600000014 exige trazabilidad entre lo auditado 
      y lo declarado.
```

---

# FASE 7.6 — Libro de Compras y Ventas (LCV) en Formato SIN

## ¿Qué hace esta fase?
Genera el **Libro de Compras y Ventas IVA (LCV)** en el formato exigido por el SIN. Este reporte es obligatorio y lista todas las compras y ventas del mes con NIT, número de factura, monto e IVA.

## Estructura del LCV

```text
LIBRO DE COMPRAS Y VENTAS IVA — Septiembre 2026
─────────────────────────────────────────────────────────────────
SECCIÓN COMPRAS:
NIT Proveedor │ Razón Social │ Factura │ Fecha │ Total Bs │ Neto Bs │ IVA Bs │ CUF
──────────────┼──────────────┼─────────┼───────┼──────────┼─────────┼────────┼─────────
987654321-2   │ Import. XYZ  │ F-12345 │ 01/09 │ 5,650.00 │ 5,000.00│ 650.00 │ B5A3C8...
111222333-4   │ Distrib. ABC │ F-67890 │ 05/09 │ 2,260.00 │ 2,000.00│ 260.00 │ D9E1F2...
─────────────────────────────────────────────────────────────────
TOTAL COMPRAS:                              │ 7,910.00 │ 7,000.00│ 910.00 │

SECCIÓN VENTAS:
NIT Cliente │ Razón Social │ Factura │ Fecha │ Total Bs │ Neto Bs │ IVA Bs │ IT Bs │ CUF
────────────┼──────────────┼─────────┼───────┼──────────┼─────────┼────────┼───────┼─────────
123456789-1 │ Comercial XY │ F-11111 │ 03/09 │ 11,300.00│10,000.00│1,300.00│339.00│ G3H4I5...
444555666-7 │ Tienda MN    │ F-22222 │ 08/09 │ 5,650.00 │ 5,000.00│ 650.00│169.50│ J6K7L8...
─────────────────────────────────────────────────────────────────
TOTAL VENTAS:                               │ 16,950.00│15,000.00│1,950.00│508.50│

RESUMEN DEL PERÍODO:
─────────────────────────────────────────────────────────────────
IVA Débito (de ventas):     Bs 1,950.00
IVA Crédito (de compras):   Bs 910.00
IVA por Pagar:              Bs 1,040.00
IT por Pagar:               Bs 508.50
─────────────────────────────────────────────────────────────────
```

## Tareas de la Fase 7.6

```text
[ ] Implementar generarLCV(periodo)
    → Recopila todas las compras y ventas del período.
    → Para cada una: NIT, razón social, factura, fecha, 
      total, neto, IVA, CUF.
    → Calcula totales por sección.
    → Devuelve objeto estructurado con ambas secciones.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que genere 
      el Libro de Compras y Ventas IVA (LCV) en formato SIN 
      boliviano. Debe incluir dos secciones: compras y ventas. 
      Para cada transacción: NIT, razón social, número de 
      factura, fecha, monto total, monto neto, IVA, CUF. 
      Al final: totales de IVA débito, IVA crédito, IVA por 
      pagar, e IT por pagar. Devuelve objeto JSON estructurado."

[ ] Implementar validarLCV(lcv)
    → Verifica que todas las facturas tengan NIT y CUF válidos.
    → Verifica que los totales cuadren con el Form. 200.
    → Verifica que no haya facturas duplicadas.
    → Devuelve { valido, errores[] }.

[ ] Implementar exportarLCV(lcv, formato)
    → Exporta el LCV a CSV o JSON.
    → En un sistema productivo, se exportaría al formato exacto 
      que exige el SIN para carga en el portal.
    → Devuelve el string del archivo exportado.

[ ] Implementar conciliarLCVconForm200(lcv, form200)
    → Verifica que los totales del LCV coincidan con el Form. 200.
    → Si hay diferencias → devuelve las discrepancias.
    → ⚠️ El SIN fiscaliza activamente esta conciliación.
```

---

# FASE 7.7 — Facturación Electrónica: CUIS, CUFD, CUF (Simulación)

## ¿Qué hace esta fase?
Simula los **códigos de facturación electrónica** del sistema SIAT del SIN. En un sistema productivo, estos códigos se obtendrían vía API del SIN; en el prototipo, se generan localmente para demostrar el flujo.

## Códigos del sistema de facturación

```text
╔══════════════════════════════════════════════════════════════════╗
║ CÓDIGO │ SIGNIFICADO │ FUNCIÓN                                  ║
║────────┼─────────────┼──────────────────────────────────────────║
║ CUIS   │ Código Único│ Se solicita cada 8 horas para habilitar  ║
║        │ de Inicio   │ la facturación del día                   ║
║────────┼─────────────┼──────────────────────────────────────────║
║ CUFD   │ Código Único│ Se solicita cada 24 horas. Identifica    ║
║        │ de Facturación│ al punto de venta por día              ║
║────────┼─────────────┼──────────────────────────────────────────║
║ CUF    │ Código Único│ Identificador único de CADA factura      ║
║        │ de Factura  │ (incluye NIT, fecha, número)             ║
║────────┼─────────────┼──────────────────────────────────────────║
║ QR     │ Código QR   │ En la factura impresa, para validación   ║
║        │             │ por el cliente en el portal del SIN      ║
╚══════════════════════════════════════════════════════════════════╝

FLUJO DE EMISIÓN (modalidad Electrónica en Línea):
─────────────────────────────────────────────────
1. El ERP solicita CUIS al SIN (cada 8 horas)
2. El ERP solicita CUFD al SIN (cada 24 horas)
3. El usuario genera una factura de venta
4. El ERP genera el XML según el estándar del SIN
5. El ERP firma digitalmente con certificado
6. El ERP envía el XML al SIN
7. El SIN valida y responde con acuse de recibo
8. El ERP imprime la factura con CUF y código QR
9. El cliente escanea el QR y valida en impuestos.gob.bo
```

## Tareas de la Fase 7.7

```text
[ ] Crear js/modulos/facturacion.js
    → Clase ModuloFacturacion con métodos de facturación.

[ ] Implementar generarCUIS(simulado)
    → Genera un CUIS simulado de 8 caracteres alfanuméricos.
    → En el prototipo, se genera localmente.
    → En un sistema productivo, se solicitaría al SIN vía API.
    → Tiene validez de 8 horas.
    → Devuelve { cuis, fechaGeneracion, fechaExpiracion }.

[ ] Implementar generarCUFD(simulado)
    → Genera un CUFD simulado de 12 caracteres alfanuméricos.
    → Tiene validez de 24 horas.
    → Devuelve { cufd, fechaGeneracion, fechaExpiracion }.

[ ] Implementar generarCUF(nit, fecha, numeroFactura)
    → Genera un CUF simulado de 43 caracteres alfanuméricos.
    → Combina: NIT + fecha + número de factura + hash.
    → Debe ser único para cada factura.
    → Devuelve { cuf, fechaGeneracion }.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que genere 
      un CUF (Código Único de Factura) simulado de 43 caracteres 
      alfanuméricos para el sistema SIAT boliviano. El CUF debe 
      combinar: NIT del emisor, fecha de emisión, número de 
      factura, y un hash aleatorio. Debe ser único para cada 
      factura. Devuelve el CUF de 43 caracteres."

[ ] Implementar validarCUF(cuf)
    → Verifica que el CUF tenga 43 caracteres.
    → Verifica que solo contenga [A-Z0-9].
    → Verifica que los primeros caracteres correspondan a un NIT válido.
    → Devuelve { valido, errores[] }.

[ ] Implementar generarFacturaElectronica(datosVenta)
    → Genera la estructura completa de una factura electrónica.
    → Incluye: CUIS, CUFD, CUF, datos del emisor, datos del 
      receptor, detalle de productos, IVA, IT, código QR.
    → Devuelve objeto con la factura completa.

[ ] Implementar generarCodigoQR(cuf)
    → Genera un código QR simulado (texto que representa el QR).
    → En un sistema productivo, se usaría una librería de QR.
    → El QR contiene la URL de validación: 
      impuestos.gob.bo/validar?cuf={CUF}

[ ] Crear vista parcial en cumplimiento.html
    → Sección "Facturación Electrónica".
    → Muestra: CUIS activo, CUFD activo, últimas facturas emitidas.
    → Botón "Generar CUIS" y "Generar CUFD" (simulados).
```

---

# FASE 7.8 — Fundempresa: Obligaciones Societarias

## ¿Qué hace esta fase?
Registra las **obligaciones societarias ante Fundempresa** (Registro de Comercio de Bolivia). Además del SIN, las sociedades comerciales (SRL, S.A., sucursales) tienen obligaciones específicas ante Fundempresa.

## Obligaciones ante Fundempresa

```text
╔══════════════════════════════════════════════════════════════════╗
║ OBLIGACIÓN │ FRECUENCIA │ DESCRIPCIÓN                          ║
║────────────┼────────────┼──────────────────────────────────────║
║ Matrícula  │ Anual      │ Renovación de la Matrícula de Comercio║
║ de Comercio│            │                                      ║
║────────────┼────────────┼──────────────────────────────────────║
║ Depósito   │ Anual      │ Ciertas sociedades deben depositar   ║
║ de EEFF    │            │ sus EEFF en Fundempresa              ║
║────────────┼────────────┼──────────────────────────────────────║
║ Registro   │ Ocasional  │ Aumentos de capital, cambios de      ║
║ de actas   │            │ directorio, modificaciones de estatutos║
║────────────┼────────────┼──────────────────────────────────────║
║ RUPS       │ Anual      │ Registro de la Reunión de Socios /   ║
║            │            │ Junta de Accionistas                 ║
╚══════════════════════════════════════════════════════════════════╝
```

## Tareas de la Fase 7.8

```text
[ ] Crear js/modulos/fundempresa.js
    → Clase ModuloFundempresa con métodos de gestión.

[ ] Implementar registrarObligacionSocietaria(tipo, fecha, datos)
    → Registra una obligación societaria.
    → Tipos: MATRICULA, DEPOSITO_EEFF, ACTA, RUPS.
    → Devuelve el registro con estado PENDIENTE.

[ ] Implementar obtenerObligacionesPendientes()
    → Lista todas las obligaciones societarias pendientes.
    → Ordenado por fecha de vencimiento ascendente.

[ ] Implementar generarAlertasFundempresa(diasAntes)
    → Genera alertas para obligaciones próximas.
    → Similar a las alertas del SIN pero para Fundempresa.

[ ] Implementar marcarCumplida(obligacionId)
    → Marca una obligación como CUMPLIDA.
    → Registra la fecha de cumplimiento.

[ ] Crear vista parcial en cumplimiento.html
    → Sección "Fundempresa".
    → Lista de obligaciones pendientes y cumplidas.
    → Botón "Marcar como Cumplida".
```

---

# FASE 7.9 — Auditoría Externa: Trazabilidad y Papeles de Trabajo

## ¿Qué hace esta fase?
Implementa la **trazabilidad completa** que un auditor externo necesita para revisar la contabilidad. La RND N° 102600000014 (2026) refuerza explícitamente la trazabilidad entre lo que entrega el auditor externo y lo que se declara en el F-605.

## Papeles de trabajo que el ERP debe exportar

```text
PAPELES DE TRABAJO PARA AUDITORÍA:
─────────────────────────────────────────────────
1. Libro Diario completo del período
2. Libro Mayor por cuenta
3. Balanza de Comprobación
4. Conciliación bancaria
5. Detalle de cuentas por cobrar (antigüedad)
6. Detalle de cuentas por pagar (vencimiento)
7. Kardex valorado de inventario
8. Detalle de activos fijos y depreciación
9. Detalle de provisiones (aguinaldo, indemnización)
10. Conciliación de IVA (Form. 200)
11. Conciliación de IT (Form. 400)
12. Liquidación de IUE (Form. 500)
13. LCV completo
14. Estados Financieros con Notas
```

## Tareas de la Fase 7.9

```text
[ ] Implementar generarPapelesTrabajo(periodo)
    → Genera todos los papeles de trabajo listados arriba.
    → Cada uno en formato exportable (JSON o CSV).
    → Devuelve objeto con todos los papeles.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que genere 
      los papeles de trabajo para una auditoría externa en Bolivia. 
      Debe incluir: libro diario, libro mayor, balanza de 
      comprobación, conciliación bancaria, detalle de cuentas por 
      cobrar y pagar, kardex de inventario, activos fijos, 
      provisiones, conciliación de IVA, liquidación de IUE, LCV, 
      y estados financieros. Devuelve un objeto con todos los 
      papeles en formato exportable."

[ ] Implementar generarTrazabilidadDocumento(documentoId)
    → Dado un documento fuente, muestra toda la cadena:
      Documento → Asiento → Cuenta en Mayor → Saldo en Balanza 
      → Estado Financiero.
    → Devuelve la cadena completa de trazabilidad.
    → ⚠️ Esta es la función "wow" del ERP: poder rastrear 
      cualquier número desde el estado financiero hasta el 
      documento fuente original.

[ ] Implementar exportarParaAuditor(periodo, formato)
    → Genera un paquete ZIP (simulado) con todos los papeles.
    → En el prototipo, genera un JSON con todos los datos.
    → En un sistema productivo, generaría archivos descargables.

[ ] Implementar vincularDictamenAuditor(año, auditor, dictamen)
    → Registra el dictamen del auditor externo.
    → Incluye: nombre del auditor, registro CAUB, fecha, 
      opinión (limpia, con salvedades, adversa).
    → Se vincula al Form. 605 del año.
```

---

# FASE 7.10 — Dashboard de Cumplimiento (Semáforos y Alertas)

## ¿Qué hace esta fase?
Construye el **dashboard de cumplimiento** — el panel visual que muestra el estado de todas las obligaciones tributarias y societarias. Es la primera pantalla que el contador debería ver al inicio del día.

## Componentes del dashboard

```text
┌─────────────────────────────────────────────────────────────────┐
│ DASHBOARD DE CUMPLIMIENTO                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                │
│ 🟢 Form. 200 (IVA) — Septiembre: DECLARADO y PAGADO           │
│ 🟡 Form. 400 (IT) — Septiembre: DECLARADO, pago vence en 5 días│
│ 🔴 Form. 110 (Retenciones) — Septiembre: NO DECLARADO,        │
│    vence en 2 días                                             │
│ 🟢 Form. 500 (IUE) — 2025: DECLARADO y PAGADO                 │
│ 🟡 Form. 605 (EEFF) — 2026: PENDIENTE, vence en 45 días       │
│                                                                │
│ PRÓXIMOS VENCIMIENTOS:                                         │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ Form. 110 │ Sep 2026 │ 12/10/2026 │ 🔴 2 días restantes │   │
│ │ Form. 400 │ Sep 2026 │ 12/10/2026 │ 🟡 2 días restantes │   │
│ │ Form. 200 │ Oct 2026 │ 10/11/2026 │ 🟢 31 días restantes│   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                │
│ INDICADORES:                                                   │
│ • % de facturas validadas contra padrón SIN: 98.5%            │
│ • Facturas observadas por el SIN este mes: 2                  │
│ • Antigüedad de partidas sin conciliar: 12 días               │
│                                                                │
│ FUND EMPRESA:                                                  │
│ 🟢 Matrícula de Comercio 2026: RENOVADA                       │
│ 🟡 Depósito EEFF 2026: PENDIENTE, vence en 60 días            │
│                                                                │
└─────────────────────────────────────────────────────────────────┘
```

## Tareas de la Fase 7.10

```text
[ ] Implementar generarDashboardCumplimiento()
    → Recopila el estado de todos los formularios pendientes.
    → Recopila las alertas del calendario tributario.
    → Recopila las obligaciones de Fundempresa.
    → Calcula los indicadores de cumplimiento.
    → Devuelve objeto con todo el contenido del dashboard.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que genere 
      un dashboard de cumplimiento tributario para Bolivia. Debe 
      incluir: estado de cada formulario SIN (declarado, pagado, 
      pendiente), próximos vencimientos con semáforo (verde >7 
      días, amarillo 3-7 días, rojo <3 días), obligaciones de 
      Fundempresa, e indicadores de cumplimiento (% facturas 
      validadas, facturas observadas, antigüedad de partidas 
      sin conciliar). Devuelve objeto estructurado."

[ ] Implementar calcularIndicadoresCumplimiento()
    → % de facturas de compra validadas contra el padrón SIN.
    → Cantidad de facturas observadas o rechazadas por el SIN.
    → Antigüedad de partidas pendientes de conciliar.
    → Cantidad de períodos fiscales cerrados vs. pendientes.
    → Devuelve objeto con todos los indicadores.

[ ] Implementar generarSemaforo(diasRestantes)
    → Si díasRestantes > 7 → 🟢 verde.
    → Si díasRestantes 3-7 → 🟡 amarillo.
    → Si díasRestantes < 3 → 🔴 rojo.
    → Si díasRestantes < 0 → ⚫ negro (vencido).
    → Devuelve { nivel, color, icono }.

[ ] Implementar generarAlertasConsolidadas()
    → Combina alertas del SIN, Fundempresa, y auditoría.
    → Ordena por urgencia (días restantes ascendente).
    → Devuelve array de alertas con nivel y mensaje.

[ ] Crear vista parcial en cumplimiento.html
    → Sección "Dashboard de Cumplimiento".
    → Tarjetas con semáforo para cada formulario.
    → Tabla de próximos vencimientos.
    → Indicadores de cumplimiento.
    → Alertas consolidadas.
```

---

# FASE 7.11 — Vista de Cumplimiento

## ¿Qué hace esta fase?
Construye la **pantalla principal** de cumplimiento — donde el usuario gestiona todas las obligaciones tributarias y societarias, genera formularios, y monitorea el estado de cumplimiento.

## Tareas de la Fase 7.11

```text
[ ] Crear vistas/cumplimiento.html
    → Secciones:
      ├── <h1> Cumplimiento y Reportería
      ├── <div class="tabs">
      │   ├── Dashboard de Cumplimiento
      │   ├── Calendario Tributario
      │   ├── Formularios SIN
      │   ├── Libro de Compras y Ventas (LCV)
      │   ├── Facturación Electrónica
      │   ├── Fundempresa
      │   ├── Auditoría
      │   └── Alertas
      ├── <div id="contenido-tab">
      └── Botones de exportación

[ ] Crear js/vistas/cumplimiento-vista.js
    → Lógica de la vista de cumplimiento.
    → Manejar cambio de tabs.
    → Botón "Generar Form. 200" → generarFormulario200().
    → Botón "Generar LCV" → generarLCV().
    → Botón "Exportar Papeles de Trabajo" → generarPapelesTrabajo().
    → Filtros por período y tipo de formulario.

[ ] Implementar la vista del Calendario Tributario
    → Calendario mensual con vencimientos marcados.
    → Colores según semáforo.
    → Click en un vencimiento → muestra detalle del formulario.

[ ] Implementar la vista de Formularios SIN
    → Selector de formulario (200, 400, 110, 500, 601, 605).
    → Selector de período.
    → Vista previa del formulario generado.
    → Botón "Exportar JSON" y "Exportar CSV".
    → Botón "Marcar como Declarado" y "Marcar como Pagado".

[ ] Implementar la vista del LCV
    → Tabla con las secciones de compras y ventas.
    → Filtro por período.
    → Totales al final.
    → Botón "Exportar LCV" en formato SIN.

[ ] Implementar la vista de Facturación Electrónica
    → Muestra: CUIS activo, CUFD activo.
    → Lista de últimas facturas emitidas con CUF.
    → Botón "Generar CUIS" y "Generar CUFD" (simulados).

[ ] Implementar la vista de Auditoría
    → Lista de papeles de trabajo disponibles.
    → Botón "Exportar Paquete de Auditoría".
    → Registro de dictámenes de auditoría.

[ ] Conectar con el menú lateral
    → Agregar enlace "✅ Cumplimiento" en index.html.
    → Verificar que el enrutador carga vistas/cumplimiento.html.
```

---

# FASE 7.12 — Smoke Test Final y Commit de Cierre

## Checklist de humo (smoke test)

```text
[ ] Smoke test #1: Generar Formulario 200
    → Ejecutar window.ModuloCumplimiento.generarFormulario200("2026-09")
    → Verificar que incluye: ventas, IVA débito, compras, IVA crédito, 
      IVA por pagar
    → Verificar que los montos coinciden con el Módulo 5

[ ] Smoke test #2: Generar Formulario 400
    → Ejecutar window.ModuloCumplimiento.generarFormulario400("2026-09")
    → Verificar que IT = 3% × ingresos brutos
    → Verificar que coincide con el Módulo 5

[ ] Smoke test #3: Generar Formulario 500
    → Ejecutar window.ModuloCumplimiento.generarFormulario500(2026)
    → Verificar que incluye: utilidad contable, ajustes, 
      utilidad imponible, IUE, IT compensado
    → Verificar que la compensación IT-IUE es correcta

[ ] Smoke test #4: Generar LCV
    → Ejecutar window.ModuloCumplimiento.generarLCV("2026-09")
    → Verificar que incluye todas las compras y ventas del período
    → Verificar que los totales cuadran con el Form. 200
    → Verificar que cada factura tiene NIT y CUF

[ ] Smoke test #5: Generar códigos de facturación
    → Ejecutar window.ModuloFacturacion.generarCUIS()
    → Verificar que el CUIS tiene el formato correcto
    → Ejecutar window.ModuloFacturacion.generarCUF("123456789", "2026-09-15", "F-001")
    → Verificar que el CUF tiene 43 caracteres

[ ] Smoke test #6: Verificar calendario tributario
    → Ejecutar window.CalendarioTributario.calcularVencimientos("123456789-1", "2026-09")
    → Verificar que el vencimiento es el día 10 (dígito 1)
    → Verificar que las alertas se generan correctamente

[ ] Smoke test #7: Generar papeles de trabajo
    → Ejecutar window.ModuloCumplimiento.generarPapelesTrabajo("2026")
    → Verificar que incluye: diario, mayor, balanza, kardex, 
      activos, provisiones, LCV, estados financieros
    → Verificar que la trazabilidad es completa

[ ] Smoke test #8: Verificar dashboard de cumplimiento
    → Verificar que muestra el estado de todos los formularios
    → Verificar que los semáforos son correctos
    → Verificar que las alertas están ordenadas por urgencia

[ ] Smoke test #9: Verificar Fundempresa
    → Registrar una obligación de Matrícula de Comercio
    → Verificar que aparece en las obligaciones pendientes
    → Marcar como cumplida → verificar que cambia de estado

[ ] Smoke test #10: Persistencia
    → Recargar la página (F5)
    → Los formularios, LCV, calendario deben seguir ahí
    → Abrir DevTools → LocalStorage → verificar colecciones

[ ] Commit de cierre del Módulo 7
    → git add .
    → git commit -m "feat(modulo-7): Cumplimiento SIN completo
    
      - Calendario tributario con alertas por dígito del NIT
      - Formularios SIN: 200, 400, 500, 110, 601, 605
      - Libro de Compras y Ventas (LCV) en formato SIN
      - Facturación electrónica: CUIS, CUFD, CUF (simulación)
      - Fundempresa: obligaciones societarias
      - Auditoría: papeles de trabajo y trazabilidad completa
      - Dashboard de cumplimiento con semáforos
      - Smoke test: todos los tests pasan
      
      Próximo paso: Módulo 8 - Migración a SaaS real (opcional)"
```

---

## 🎯 Criterios de Aceptación del Módulo 7

El Módulo 7 se considera **completado** cuando:

- [x] El calendario tributario calcula vencimientos según dígito del NIT
- [x] Las alertas se generan con semáforo (verde/amarillo/rojo)
- [x] Los formularios 200, 400, 500, 110 se generan correctamente
- [x] El Form. 601 detecta operaciones con partes vinculadas
- [x] El Form. 605 incluye todos los estados financieros
- [x] El LCV cuadra con el Form. 200
- [x] Los códigos CUIS, CUFD, CUF se generan con formato correcto
- [x] Las obligaciones de Fundempresa se registran y alertan
- [x] Los papeles de trabajo se generan completos
- [x] La trazabilidad es completa: documento → asiento → mayor → estado
- [x] El dashboard muestra el estado de cumplimiento en tiempo real
- [x] Se puede explicar en 5 minutos el cumplimiento ante el SIN

---

╔═══════════════════════════════════════════════════════════╗
║  MÓDULO 7 — CUMPLIMIENTO SIN — COMPLETADO ✅             ║
╠═══════════════════════════════════════════════════════════╣
║  [] Fase 7.1 Teoría (4 docs)                              ║
║  ✅ Fase 7.2 Calendario Tributario                        ║
║  ✅ Fase 7.3 Formularios SIN (200, 400, 110, 500)        ║
║  ✅ Fase 7.4 Form. 601 Partes Vinculadas                  ║
║  ✅ Fase 7.5 Form. 605 EEFF SIAT                          ║
║  ✅ Fase 7.6 LCV formato SIN                              ║
║  ✅ Fase 7.7 Facturación Electrónica                      ║
║  ✅ Fase 7.8 Fundempresa                                  ║
║  ✅ Fase 7.9 Auditoría                                    ║
║  ✅ Fase 7.10 Dashboard Cumplimiento                      ║
║  ✅ Fase 7.11 Vista de Cumplimiento                       ║
║  [] Fase 7.12 Smoke test final                            ║
║                                                            ║
║  Progreso: 12/12 fases (100%) ✅                          ║
╚═══════════════════════════════════════════════════════════╝

## 📚 Material de Exposición Generado en Este Módulo

| Archivo | Contenido | Uso en exposición |
|---|---|---|
| `24-cumplimiento-sin-explicado.md` | Teoría del SIN | Abrir la explicación |
| `25-formularios-sin-detallados.md` | Tabla de formularios | Mostrar la variedad |
| `26-consecuencias-incumplimiento.md` | Multas y sanciones | Demostrar urgencia |
| `27-calendario-tributario-completo.md` | Calendario anual | Herramienta práctica |

---

## 🚀 Próximos Módulos (adelanto)

| Módulo | Tema | Duración | Depende de |
|---|---|---|---|
| **Módulo 8** | Migración a SaaS real (opcional) | 10–15 h | Módulo 7 |

El Módulo 8 es **opcional** y solo se aborda si el prototipo educativo evoluciona a un SaaS productivo real. Incluiría: backend Node.js, base de datos PostgreSQL, autenticación JWT, multi-empresa, multi-usuario, despliegue en la nube, y conexión real con la API del SIN.

---

## ⚠️ Advertencia final

La tentación aquí es **generar los formularios pero no validarlos**. *"Total, es un prototipo y no se envían al SIN real"*. **No lo hagas.** La validación de que el LCV cuadra con el Form. 200, de que el Balance cuadra antes de enviar el Form. 605, y de que la compensación IT-IUE es correcta — esas validaciones son exactamente lo que el SIN fiscaliza en la vida real. En una exposición, poder decir *"este ERP valida automáticamente que el LCV cuadre con el Formulario 200 antes de permitir la exportación, porque el SIN fiscaliza activamente esa conciliación"* es lo que demuestra que entendiste el cumplimiento tributario, no solo la generación de reportes. Y la trazabilidad completa (poder rastrear cualquier número del estado financiero hasta el documento fuente original) es el argumento definitivo de por qué un ERP vale más que varios Excel conectados a mano.

---

**¿Siguiente paso?** Cuando completes este Módulo 7, avísame y generamos el **ROADMAP_MODULO_8_MIGRACION_SAAS.md** con el mismo formato. Este módulo es opcional y solo se aborda si el prototipo evoluciona a un SaaS productivo real. 🚀

Alternativamente, si quieres cerrar el proyecto aquí, puedo generar un **ROADMAP_RESUMEN_FINAL.md** que consolide todo lo aprendido, prepare el material de exposición, y sugiera próximos pasos. 🎓
