# 📘 GUÍA MAESTRA — ERP CONTABLE BOLIVIA
### Prototipo educativo de contabilidad boliviana, de principio a fin

> **Para quién es esta guía:** para ti que quieres entender y explicar el sistema,
> para un estudiante de contabilidad, o para un reclutador que abre el repo.
> No requiere conocimientos previos: cada concepto se explica antes de usarse.

---

## 📑 ÍNDICE

**PARTE I — ENTENDER EL SISTEMA**
1. Qué es este ERP y qué NO es
2. Las 5 capas (con analogía del restaurante)
3. El ciclo contable completo en 7 pasos
4. La partida doble explicada con dinero real

**PARTE II — ARRANCAR EL SISTEMA**
5. Abrir la demo y cargar datos
6. El Dashboard como centro de mando
7. La regla de oro del sistema

**PARTE III — MÓDULO POR MÓDULO (paso a paso con datos)**
8. Documentos Fuente · 9. Catálogos · 10. Compras · 11. Ventas
12. Inventario · 13. RRHH y Nómina · 14. Impuestos
15. Contabilidad (Diario/Mayor/Balanza) · 16. Estados Financieros
17. Cumplimiento SIN · 18. Costos

**PARTE IV — CONTABILIDAD BOLIVIANA EXPLICADA**
19. IVA incluido en el precio · 20. IT y su compensación con IUE
21. RC-IVA · 22. Bono de antigüedad · 23. Aguinaldo y segundo aguinaldo
24. Indemnización · 25. Regímenes tributarios · 26. Calendario por NIT

**PARTE V — EJERCICIOS GUIADOS CON DATOS**
**PARTE VI — DEMO EN 10 MINUTOS (guion para explicar a otros)**
**PARTE VII — GLOSARIO Y COMANDOS ÚTILES**

---

# PARTE I — ENTENDER EL SISTEMA

## 1. Qué es este ERP y qué NO es

**ES:**
- Un sistema contable completo que simula una empresa boliviana real
  (*Distribuidora Mamoré SRL*, Trinidad, Beni).
- Un material educativo: cada pantalla enseña un concepto contable.
- Una aplicación web sin servidor: todo vive en tu navegador
  (LocalStorage), por eso funciona offline y en GitHub Pages.

**NO ES:**
- Un sistema para llevar contabilidad real de tu empresa
  (no envía formularios al SIN, no firma digitalmente).
- Un software con base de datos compartida: cada navegador tiene
  sus propios datos de demostración.

**La empresa de la demo:**

| Dato | Valor |
|---|---|
| Razón social | Distribuidora Mamoré SRL |
| NIT | 123456789-7 |
| Régimen | Régimen General (RG) |
| Actividad | Venta de productos de oficina y tecnología |
| Capital social | Bs 150.000 |
| Período de ejemplo | Septiembre 2026 |

## 2. Las 5 capas (analogía del restaurante)

Imagina un restaurante. El ERP está organizado igual:

| Capa | En el restaurante | En el ERP | Ejemplo |
|---|---|---|---|
| **1. Documentos** | El ticket/comprobante físico | Facturas, recibos, comprobantes | `FACTURA_COMPRA F-2026-001` |
| **2. Módulos** | Cocina, caja, almacén | Compras, Ventas, Nómina, Impuestos | "Registrar compra de laptops" |
| **3. Motor contable** | El libro donde el contador anota | Asientos con partida doble | `AD-2026-09-001` |
| **4. Estados** | El reporte para el dueño | Balance, Resultados, Flujo | "¿Ganamos o perdimos?" |
| **5. Cumplimiento** | Pagar impuestos y licencias | Form. 200/400/500, Fundempresa | "¿Qué vence este mes?" |

**Regla de arquitectura:** la información fluye hacia abajo.
Un documento (Capa 1) alimenta un módulo (Capa 2), que genera un
asiento (Capa 3), que alimenta los estados (Capa 4), que alimentan
los formularios (Capa 5). **Nunca al revés.**

## 3. El ciclo contable completo en 7 pasos

Todo lo que hace el sistema es repetir este ciclo:

```text
1. OCURRE UN HECHO        → Compramos 3 laptops por Bs 16.950
2. SE DOCUMENTA (Capa 1)  → Factura F-2026-001 con NIT y CUF
3. SE PROCESA (Capa 2)    → Módulo Compras: orden → recepción → factura
4. SE CONTABILIZA (Capa 3)→ Asiento: Inventario + IVA Crédito → Proveedores
5. SE RESUME (Capa 4)     → Balanza y Balance General
6. SE DECLARA (Capa 5)    → Form. 200 (IVA) y Form. 400 (IT)
7. SE ANALIZA             → Ratios, punto de equilibrio, márgenes
```

Si entiendes este ciclo, entiendes el 100% del sistema.

## 4. La partida doble explicada con dinero real

**Principio:** cada movimiento afecta AL MENOS dos cuentas, y el total
del DEBE siempre iguala al total del HABER.

**Analogía:** si compras una laptop con dinero del banco, cambian dos
cosas a la vez: tienes MÁS inventario y MENOS banco. Nada aparece de
la nada.

- **DEBE (izquierda):** lo que entra / el destino del valor
  (activos que aumentan, gastos).
- **HABER (derecha):** lo que sale / el origen del valor
  (pasivos que aumentan, ingresos, capital).

**Ejemplo real de la demo** (compra de 3 laptops, Bs 16.950 con IVA):

| Cuenta | Debe | Haber | Por qué |
|---|---:|---:|---|
| 1.1.06 Inventario | 15.000,00 | | Entra mercadería (sin IVA) |
| 1.1.07 IVA Crédito Fiscal | 1.950,00 | | IVA a favor nuestro |
| 2.1.01 Proveedores | | 16.950,00 | Quedamos debiendo al proveedor |
| **TOTAL** | **16.950,00** | **16.950,00** | ✅ Cuadra |

**Naturaleza de las cuentas** (qué lado les "gusta"):

| Grupo | Cuentas | Aumentan por |
|---|---|---|
| 1.x Activos | Caja, Bancos, Inventario, Clientes | DEBE |
| 2.x Pasivos | Proveedores, Impuestos por pagar | HABER |
| 3.x Patrimonio | Capital, Reservas, Resultado | HABER |
| 4.x Ingresos | Ventas | HABER |
| 5.x Gastos | Sueldos, Alquileres, Impuestos | DEBE |

---

# PARTE II — ARRANCAR EL SISTEMA

## 5. Abrir la demo y cargar datos

1. Abre `https://miltondanielhch.github.io/erp-demo/`
   (o `index.html` con Live Server en tu PC).
2. Verás el **banner de bienvenida**. Pulsa
   **"🚀 Cargar datos de ejemplo ahora"**.
3. El sistema siembra automáticamente:
   - 3 clientes, 3 proveedores, 5 productos, 2 empleados
   - 10 documentos fuente (3 compras, 3 ventas, egresos, recibos)
   - 10 transacciones, solicitudes y órdenes de compra
   - Capas de inventario, centros de costo
   - **21 asientos contables** (apertura, compras, ventas, nómina, impuestos)
4. En consola (F12) verás el resumen:
   `📖 Asientos contables generados automáticamente para la demo`.

> 💡 **Sin datos de ejemplo el sistema funciona igual**, pero todo
> aparece en cero. Los datos de ejemplo existen para que puedas
> *ver* la contabilidad ocurriendo.

## 6. El Dashboard como centro de mando

El Dashboard resume el estado de la empresa en un vistazo:

| KPI | Qué significa | Valor demo |
|---|---|---:|
| Ventas del mes | Total facturado (con IVA) | Bs 18.362,50 |
| Saldo a favor IVA | Crédito que arrastra al mes siguiente | Bs 778,30 |
| Cuentas por cobrar | Clientes que aún no pagan | Bs 15.797,50 |
| Cuentas por pagar | Deudas con proveedores | Bs 13.416,00 |
| Valor de inventario | Mercadería en almacén | Bs 80.100,00 |

También muestra **próximos vencimientos** y **acciones rápidas**.

## 7. La regla de oro del sistema

> **Todo dato entra por la Capa 1 (un documento) o por un catálogo.
> Nunca se "inventa" un número en los reportes.**

Por eso los reportes siempre cuadran: son *consecuencia* de los
documentos y asientos, no datos escritos a mano.

---

# PARTE III — MÓDULO POR MÓDULO

## 8. 📄 Documentos Fuente (Capa 1)

**Qué hace:** guarda el "papel" digital de cada operación con los
requisitos del SIN: NIT del emisor, CUF (código único de factura),
montos desglosados.

**Concepto clave:** sin documento válido **no hay crédito fiscal**.
El SIN rechaza facturas sin NIT o sin CUF.

**Paso a paso:**
1. Menú → *Documentos*.
2. Verás los 10 documentos sembrados con su estado
   (`PENDIENTE → VALIDADO → PROCESADO`).
3. Pulsa **"Registrar documento"** y prueba con estos datos:

```text
Tipo:            FACTURA_COMPRA
Número:          F-2026-010
Fecha emisión:   2026-09-25
NIT proveedor:   400888777-5   (Importadora Beni SA)
Razón social:    Importadora Beni SA
CUF:             Z9Y8X7W6V5U4T3S2R1Q0P9O8N7M6L5K4J3I2H1G0F
Monto total:     2260
```

4. El sistema valida el NIT (algoritmo módulo 11) y el CUF.
   Si algo falla, te dice exactamente qué.

**Fíjate en:** el documento `FGP-2026-001` está `RECHAZADO` porque su
CUF no coincide. Es un ejemplo didáctico de control del SIN.

## 9. 🗂️ Catálogos

**Qué hace:** la "libreta de contactos" maestra: clientes,
proveedores, productos y empleados.

**Paso a paso:** registra un cliente nuevo con estos datos:

```text
Razón social:   Ferretería El Trompillo SRL
NIT:            700444555-2
Teléfono:       591-3-4651122
Email:          ventas@eltrompillo.bo
Límite crédito: 30000
Régimen:        RG
```

**Concepto clave:** el **límite de crédito** bloquea ventas que lo
excedan (control interno). El **régimen tributario** determina si el
cliente/proveedor emite crédito fiscal (solo el RG lo hace).

## 10. 🛒 Compras (ciclo completo)

**Qué hace:** gestiona el flujo *solicitud → orden → recepción →
factura → pago*.

**Los 5 estados de una compra:**

```text
SOLICITADA → APROBADA → ORDENADA → RECIBIDA → FACTURADA → PAGADA
```

**Paso a paso con datos:**
1. Menú → *Compras* → **"Nueva solicitud"**:

```text
Solicitante:    Ana Lucía Justiniano Torrez
Departamento:   CONTABILIDAD
Producto:       PAP-001 (Resma Papel Bond A4)
Cantidad:       30
Justificación:  Reposición mensual de papelería
```

2. **Aprueba** la solicitud (botón Aprobar).
3. **Genera la orden de compra** → el sistema asigna `OC-2026-0004`.
4. **Registra recepción** (entra al inventario).
5. **Registra factura del proveedor** → crea la cuenta por pagar.
6. **Registra pago parcial** (ej. Bs 1.000) → la cuenta queda `PARCIAL`.

**Qué ocurre por detrás:** al facturar, el Motor Contable crea el
asiento *Inventario + IVA Crédito → Proveedores* automáticamente.

**Verificación:** en *Compras → Cuentas por pagar* verás el saldo
pendiente; en *Libro Diario* verás el asiento nuevo.

## 11. 💼 Ventas (ciclo completo)

**Qué hace:** *cotización → pedido → despacho → factura → cobro*.

**Paso a paso con datos:**
1. Menú → *Ventas* → **"Nueva cotización"**:

```text
Cliente:        Ganadera Yacuma SRL
Producto 1:     SIL-001 (Silla Ergonómica)  × 2  @ Bs 1.695
Producto 2:     CAR-001 (Cartucho HP 664)    × 4  @ Bs 169,50
```

2. **Convierte a pedido** → descuenta stock al despachar.
3. **Factura** → el sistema calcula solo:
   - Neto = Total ÷ 1,13
   - IVA = Total − Neto
   - IT = Total × 3%
4. **Cobra** (efectivo o transferencia) → crea recibo de caja.

**Ejemplo numérico que verás:** total Bs 4.068,00 →
neto Bs 3.600,00 → IVA Bs 468,00 → IT Bs 122,04.

**Verificación:** *Libro de Compras y Ventas* muestra la fila nueva
con NIT, CUF, neto, IVA e IT.

## 12. 📦 Inventario (Kardex)

**Qué hace:** registra entradas y salidas y valora el stock.

**Concepto clave — métodos de valuación:**

| Método | Cómo valora las salidas | ¿Permitido? |
|---|---|---|
| Promedio ponderado | Costo promedio de todas las capas | ✅ SIN y NIIF |
| FIFO (PEPS) | Sale primero lo más antiguo | ✅ SIN y NIIF |
| LIFO (UEPS) | Sale primero lo más reciente | ❌ Prohibido (NIC 2) |

**Paso a paso:**
1. Menú → *Costos* → pestaña *Capas*.
2. Selecciona `prod-001` (Laptop): verás 3 capas
   (2 u @ 4.800 / 3 u @ 5.000 / 5 u @ 5.200).
3. Pulsa **"Comparar los 3"**: el sistema vende 5 unidades simuladas
   y muestra:

```text
PROMEDIO: costo venta Bs 25.300 → utilidad Bs 12.650 → IUE Bs 3.162,50
FIFO:     costo venta Bs 24.600 → utilidad Bs 13.350 → IUE Bs 3.337,50
LIFO:     costo venta Bs 26.000 → utilidad Bs 11.950 → IUE Bs 2.987,50
```

**La lección:** elegir método cambia la utilidad y el impuesto.
Por eso NIC 2 prohibió LIFO: permitía "maquillar" utilidades.

## 13. 👥 RRHH y Nómina (Módulo 4)

**Qué hace:** empleados, planilla mensual, provisiones y liquidaciones.

**Los 2 empleados sembrados:**

| Empleado | CI | Salario | Antigüedad | Bono (DS 21060) |
|---|---|---:|---:|---:|
| Juan Carlos Menacho Vaca | 9876543 | 5.000 | 6 años | 11% → Bs 825 |
| Ana Lucía Justiniano Torrez | 8765432 | 4.500 | 4 años | 5% → Bs 375 |

**Paso a paso:**
1. Menú → *Nómina* → **"Calcular planilla 2026-09"**.
2. Verás por empleado: devengado (sueldo + bono), deducciones
   (AFP 10% + RC-IVA), aportes patronales (~29%) y neto a pagar.
3. Pulsa **"Generar asientos"** → crea 5 asientos:
   planilla, patronales, provisión bono, provisión aguinaldo,
   provisión indemnización.

**Conceptos que debes saber explicar:**

- **Bono de antigüedad (DS 21060):** se calcula sobre **3 × SMN**
  (Bs 7.500), NO sobre el sueldo real. Tabla: 2-4 años 5%,
  5-7 años 11%, 8-10 años 19%, 11-14 años 29%, 15-19 años 41%,
  20-24 años 55%, 25+ años 71%.
- **Aguinaldo:** 1 sueldo en diciembre; se provisiona 1/12 cada mes.
- **Segundo aguinaldo (DS 1802):** solo si el PIB crece > 4,5%.
  En el sistema es un **toggle manual** (está apagado, como en la
  realidad desde 2018).
- **Indemnización (DS 28699):** 1 sueldo por año. **Aplica también
  a la renuncia voluntaria**, no solo al despido. Por eso se
  provisiona mensualmente para todos los empleados.
- **RC-IVA:** el empleado compensa su RC-IVA teórico (13% del
  devengado) con facturas personales a su nombre. En *RC-IVA*
  puedes registrar esas facturas y ver cuánto baja su retención.

**Ejercicio rápido:** en *Liquidaciones*, pulsa "Calcular liquidación"
de Juan Carlos con motivo `RENUNCIA` y verás indemnización +
desahucio + aguinaldo proporcional + bono proporcional.

## 14. 🧾 Impuestos (Módulo 5)

**Qué hace:** liquida IVA, IT, IUE, retenciones y muestra el
calendario de vencimientos.

**Pestañas y qué ver en cada una:**

| Pestaña | Qué muestra | Dato demo |
|---|---|---|
| IVA (Form. 200) | Débito − Crédito = a pagar o saldo a favor | 2.112,50 − 941,15 = **1.171,35 a pagar** |
| IT (Form. 400) | 3% sobre ingresos brutos | 18.362,50 × 3% = **550,88** |
| IUE (Form. 500) | 25% sobre utilidad imponible | Utilidad ≤ 0 → **Bs 0** |
| Compensación IT-IUE | Art. 77: el IT pagado descuenta del IUE | Ver ejercicio Parte V |
| Retenciones (Form. 110) | RC-IVA retenido a empleados | **Bs 1.391,00** |
| Regímenes | Los 5 regímenes del SIN | RG, RTS, STI, RAU, SIETE-RG |
| Calendario | Vencimientos por dígito del NIT | Form. 200/400/110 + LCV |

**Paso a paso:**
1. Pestaña *IVA* → elige período `2026-09` → **"Conciliar IVA"**.
2. Pestaña *IT* → **"Calcular"** y luego **"Generar Form. 400"**.
3. Pestaña *Calendario* → verás los vencimientos con semáforo.

**Concepto estrella — compensación IT-IUE (Art. 77 Ley 843):**
el IT que pagas cada mes se descuenta del IUE anual.
Si el IT supera al IUE, **el exceso se pierde** (no se devuelve).
Es la particularidad boliviana más contraintuitiva y el sistema la
explica con advertencias en pantalla.

## 15. 📖 Contabilidad: Diario, Mayor y Balanza (Capa 3)

**Qué hace:** convierte todo lo anterior en libros contables.

**Los 3 libros y su pregunta:**

| Libro | Pregunta que responde |
|---|---|
| **Diario** | ¿Qué pasó, en orden cronológico? |
| **Mayor** | ¿Cuánto se movió cada cuenta? |
| **Balanza** | ¿Todo cuadra? (Debe = Haber) |

**Paso a paso:**
1. Menú → *Libro Diario*: verás ~21 asientos, desde el
   **asiento de apertura** (Capital Bs 150.000) hasta el pago de
   impuestos.
2. Menú → *Libro Mayor*: elige la cuenta `1.1.02 Bancos` y verás su
   ficha: entrada de apertura, salidas por pagos, saldo final.
3. Menú → *Balanza*: verifica las dos igualdades:

```text
Σ Movimientos Debe = Σ Movimientos Haber = Bs 218.365,96 ✓
Σ Saldos Deudores  = Σ Saldos Acreedores = Bs 211.867,85 ✓
```

**Cómo explicar la balanza a alguien:** "es la prueba de que no se
perdió ni un centavo en el registro: todo lo que entró por un lado
salió por el otro".

## 16. 📊 Estados Financieros (Capa 4)

**Qué hace:** responde las dos preguntas del dueño.

| Estado | Pregunta |
|---|---|
| Balance General | ¿Qué tengo y qué debo en este momento? |
| Estado de Resultados | ¿Gané o perdí en el período? |
| Flujo de Efectivo | ¿Por dónde entró y salió la plata? |
| Notas | Los detalles que explican los números |
| Ratios | ¿Qué tan sana está la empresa? |

**Paso a paso:**
1. Menú → *Estados Financieros* → pestaña *Balance* → **Generar**.
2. Verifica el semáforo: `✅ Ecuación contable verificada`.
3. Pestaña *Resultados*: la demo muestra **pérdida de Bs 4.787,93**
   (los gastos de nómina y provisiones superan la utilidad bruta).
   Es un resultado *realista* para un mes con poca venta.
4. Pestaña *Ratios*: liquidez corriente 4,18 (excelente),
   endeudamiento 23,9% (bajo), margen neto −29,5% (pérdida).

**Cómo leer el Balance de la demo:**

```text
ACTIVO  Bs 190.829,92
  Bancos 68.177,77 + Inventario 102.340,00
  + IVA Crédito 1.949,65 + Clientes 18.362,50
PASIVO  Bs  45.617,85   (proveedores, salarios e impuestos por pagar)
PATRIMONIO Bs 145.212,07 (capital 150.000 − pérdida 4.787,93)
→ 190.829,92 = 45.617,85 + 145.212,07 ✅
```

## 17. ✅ Cumplimiento SIN y Fundempresa (Capa 5)

**Qué hace:** te dice **qué debes presentar, cuándo y cuánto**.

**Paso a paso:**
1. Menú → *Cumplimiento* → verás el dashboard con alertas.
2. Pestaña *Formularios*: genera el **Form. 200** del período y
   verás el JSON estructurado como lo espera el SIN.
3. Pestaña *Calendario*: vencimientos según el último dígito del NIT.
4. Pestaña *Fundempresa*: obligaciones societarias anuales
   (matrícula de comercio, junta de socios, depósito de EEFF).
5. Pestaña *Papeles de trabajo*: 14/14 documentos listos para un
   auditor.

**Las alertas vencidas de Fundempresa en la demo son intencionales:**
demuestran que el sistema detecta incumplimientos, que es su trabajo.

## 18. 🏭 Costos (Módulo 8)

**Qué hace:** analiza rentabilidad: punto de equilibrio, márgenes,
centros de costo y análisis ABC.

**Paso a paso:**
1. Menú → *Costos* → pestaña *Punto de Equilibrio*:

```text
Precio promedio:        Bs 1.020,14
Costo variable promedio: Bs   750,00
Margen de contribución:  Bs   270,14 (26,48%)
Punto de equilibrio:     186 unidades = Bs 188.821,75
```

2. Usa el **simulador What-If**: "¿qué pasa si subo el precio 10%?"
3. Pestaña *Centros de costo*: ADMIN, VENTAS y ALMACÉN con
   presupuesto y ejecución.
4. Pestaña *Análisis de clientes*: rentabilidad real por cliente
   (venta − costo de venta − costo de atención).

**Cómo explicar el punto de equilibrio:** "es cuántas unidades debo
vender para no perder ni ganar. Por debajo de 186 unidades pierdo;
por encima, empiezo a ganar".

---

# PARTE IV — CONTABILIDAD BOLIVIANA EXPLICADA

## 19. IVA incluido en el precio (Art. 5 Ley 843)

**Particularidad:** en Bolivia el precio ya incluye el IVA.
Para separarlo:

```text
Neto = Total ÷ 1,13        IVA = Total − Neto
Ejemplo: Bs 1.130 → Neto Bs 1.000 + IVA Bs 130
```

El sistema lo hace automático en cada factura.

## 20. IT y su compensación con IUE

- **IT = 3%** sobre el monto **bruto** de cada venta (no el neto).
- **IUE = 25%** sobre la utilidad anual.
- **Art. 77:** el IT pagado en el año se resta del IUE.
  Si IT > IUE, **el exceso se pierde para siempre**.

## 21. RC-IVA

Es el IVA que pagan los consumidores finales y los empleados.
Un empleado con devengado Bs 5.000 tiene RC-IVA teórico de Bs 575
(13% del neto), que baja si presenta facturas personales a su nombre.

## 22. Bono de antigüedad (DS 21060)

Base = **3 × SMN = Bs 7.500** (no el sueldo). Porcentaje por tramo
de años de servicio (5% a 71%). Se provisiona mensualmente.

## 23. Aguinaldo y segundo aguinaldo

Aguinaldo = 1 sueldo en diciembre (provisión 1/12 mensual).
Segundo aguinaldo = solo con PIB > 4,5% (toggle manual, apagado).

## 24. Indemnización (DS 28699)

1 sueldo por año de servicio. **También en renuncia voluntaria.**
Por eso el sistema la provisiona cada mes para todos los activos.

## 25. Regímenes tributarios (5)

| Código | Nombre | Crédito fiscal | Límite ingresos |
|---|---|:---:|---:|
| RG | Régimen General | ✅ | Sin límite |
| RTS | Tributario Simplificado | ❌ | Bs 1.200.000 |
| STI | Sistema Tributario Integrado | ❌ | — |
| RAU | Agropecuario Unificado | ❌ | — |
| SIETE-RG | Integral de Emprendedores (2026) | ❌ (acumula) | Bs 600.000 |

## 26. Calendario por dígito del NIT

El día de vencimiento del mes siguiente depende del último dígito:

```text
1→10  2→11  3→12  4→13  5→14
6→15  7→16  8→17  9→18  0→19
```

---

# PARTE V — EJERCICIOS GUIADOS CON DATOS

### Ejercicio 1 — Compra completa (10 min)
Registra la solicitud del §10, apruébala, ordénala, recíbela,
factúrala y paga Bs 1.000. Luego verifica el asiento en el Diario
y el saldo en Cuentas por Pagar.

### Ejercicio 2 — Venta con cotización (10 min)
Cotiza 2 sillas y 4 cartuchos a Ganadera Yacuma (§11), convierte a
pedido, factura y cobra el 50%. Verifica la fila nueva en el LCV.

### Ejercicio 3 — Nómina y RC-IVA (10 min)
Calcula la planilla de 2026-09. Luego en *RC-IVA* registra una
factura personal de Bs 800 a nombre de Ana Lucía y recalcula:
su retención de RC-IVA debe bajar.

### Ejercicio 4 — Compensación IT-IUE (5 min)
En *Impuestos → Compensación*, pon utilidad contable `25000`:

```text
IUE determinado:  25.000 × 25% = Bs 6.250,00
(−) IT acumulado:                Bs   550,88
= IUE a pagar:                   Bs 5.699,12
```

Ahora prueba utilidad `1500`: IUE = 375 < IT 550,88 →
**IUE = 0 y el exceso de Bs 175,88 SE PIERDE**. Observa la advertencia.

### Ejercicio 5 — Cierre contable (10 min)
Genera Balance, Resultados y Balanza. Explica en voz alta por qué
`Activo = Pasivo + Patrimonio` y por qué la pérdida aparece en el
patrimonio con signo negativo.

---

# PARTE VI — DEMO EN 10 MINUTOS (guion)

1. **Min 1:** Dashboard → "así ve el gerente la empresa hoy".
2. **Min 2:** Documentos → "todo empieza con un papel válido".
3. **Min 4:** Compras → ciclo completo en vivo (solicitud→pago).
4. **Min 6:** Nómina → planilla + bono DS 21060 + provisión indemnización.
5. **Min 7:** Impuestos → conciliación IVA y calendario con semáforo.
6. **Min 8:** Diario y Balanza → "21 asientos, partida doble cuadrada".
7. **Min 9:** Balance → ecuación contable en verde.
8. **Min 10:** Costos → comparador FIFO/LIFO/Promedio y punto de equilibrio.

**Frase de cierre:** *"Ningún número está escrito a mano: todo es
consecuencia de documentos y asientos. Por eso siempre cuadra."*

---

# PARTE VII — GLOSARIO Y COMANDOS

| Término | Significado |
|---|---|
| CUF | Código Único de Factura (identidad digital del documento) |
| NIT | Número de Identificación Tributaria |
| LCV | Libro de Compras y Ventas |
| SMN | Salario Mínimo Nacional (Bs 2.500 en la demo) |
| PEPS/FIFO | Primero en Entrar, Primero en Salir |
| NC CTNAC | Normas de Contabilidad del Consejo Técnico Nacional |

**Comandos de consola útiles (F12):**

```javascript
window.motorContable.obtenerDiario({})            // todos los asientos
window.moduloImpuestos.conciliarIVA('2026-09')    // conciliación IVA
window.moduloNomina.calcularNominaMensual('2026-09')
window.capaEstadosFinancieros.generarBalanceGeneral('2026-09-30')
window.TablaBonoAntiguedad.obtenerTablaConMontos()
localStorage.clear(); location.reload();          // reiniciar la demo
```

---

*Guía maestra v1.0 — ERP Contable Bolivia.
Normativa de referencia: Ley 843, Ley 1733, DS 21060, DS 1802,
DS 28699, LGT y NC del CTNAC. Prototipo educativo.*