# Los 6 Pasos del Ciclo Contable (Adaptado a Bolivia)

**Módulo:** 3 — Capa 3 (Motor Contable)
**Tiempo de lectura:** 10 minutos
**Nivel:** Continuación de `07-partida-doble-explicada.md`

---

## Vista general

```text
┌────────────────────────────────────────────────────────────┐
│                      CICLO CONTABLE                        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  1. IDENTIFICACIÓN        ← documento fuente (Capa 1)      │
│         ↓                                                  │
│  2. REGISTRO EN DIARIO    ← asiento cronológico (Capa 3)   │
│         ↓                                                  │
│  3. TRASLADO AL MAYOR     ← clasificar por cuenta          │
│         ↓                                                  │
│  4. BALANZA DE COMPROBACIÓN ← verificar que cuadra         │
│         ↓                                                  │
│  5. ASIENTOS DE AJUSTE    ← depreciación, provisiones BO   │
│         ↓                                                  │
│  6. CIERRE DEL EJERCICIO  ← cuentas de resultado a cero    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Paso 1 — Identificación: ¿qué pasó?

Nada se registra sin un **documento fuente** que lo respalde. En Bolivia esto es además una obligación legal (Ley 843 y Código Tributario): sin factura válida, no hay gasto deducible.

```text
Documento fuente          →  Hecho económico
─────────────────────────────────────────────
Factura de compra         →  Entró mercancía
Factura de venta          →  Salió mercancía, se facturó
Recibo de caja            →  Entró dinero
Comprobante de egreso     →  Salió dinero
Planilla de sueldos       →  Se devengaron salarios
```

**En tu ERP:** esto es la **Capa 1** (`capa1-documentos.js`). Valida NIT, CUF, fechas y duplicados antes de aceptar el documento. Si el documento no pasa, el hecho económico **no existe contablemente**.

---

## Paso 2 — Registro en el Libro Diario

El Diario es la **bitácora cronológica**: registra los hechos en el orden en que ocurrieron, cada uno como un asiento de partida doble.

```text
DIARIO — Septiembre 2026
──────────────────────────────────────────────────────
05/09  Inventario            5,000.00
       IVA Crédito Fiscal      650.00
           Proveedores                  5,650.00
       Glosa: Compra factura F-12345

08/09  Clientes             11,300.00
           Ventas                    10,000.00
           IVA Débito Fiscal          1,300.00
       Glosa: Venta factura FV-001
──────────────────────────────────────────────────────
```

**En tu ERP:** el **Generador de Asientos** (Módulo 2) produce estos asientos automáticamente desde los documentos fuente y los deja en `asientos_pendientes`. El Motor Contable (este módulo) los toma y los contabiliza en el Diario.

---

## Paso 3 — Traslado al Libro Mayor

El Diario cuenta la historia **por fecha**. Pero a ti te interesa saber, por ejemplo, **cuánto hay en Bancos** o **cuánto debo a proveedores**. Para eso existe el Mayor: reagrupa los mismos movimientos **por cuenta**.

```text
MAYOR — Cuenta: Bancos (1.1.02)
──────────────────────────────────────────────
Fecha   │ Detalle        │  Debe    │  Haber
05/09   │ Cobro cliente  │ 11,300   │
06/09   │ Pago prov.     │          │  5,650
────────┼────────────────┼──────────┼─────────
Saldo: 5,650 DEUDOR
──────────────────────────────────────────────
```

**Por qué importa:** sin el Mayor no podrías responder "¿cuánto tengo?" ni "¿cuánto debo?". El Mayor convierte la crónica del Diario en saldos útiles.

---

## Paso 4 — Balanza de Comprobación

Es una **verificación matemática**: lista todas las cuentas con sus saldos y comprueba que la suma de Debitos iguale a la suma de Créditos.

```text
BALANZA — Septiembre 2026
Cuenta            │  Debe    │  Haber
──────────────────┼──────────┼─────────
Inventario        │  5,000   │
IVA Crédito       │    650   │
Clientes          │ 11,300   │
Bancos            │  5,650   │
Proveedores       │          │  5,650
Ventas            │          │ 10,000
IVA Débito        │          │  1,300
──────────────────┼──────────┼─────────
TOTALES           │ 22,600   │ 22,600  ✓
```

Si no cuadra, hay un error de registro y **no se puede avanzar** al cierre. Es el control de calidad del sistema.

---

## Paso 5 — Asientos de Ajuste (el toque boliviano)

Antes de cerrar, hay que registrar hechos que ocurrieron pero que no tienen factura propia. En Bolivia los más importantes:

```text
AJUSTES TÍPICOS DE FIN DE MES
──────────────────────────────────────────────────────────
a) DEPRECIACIÓN de activos fijos
   Gasto Depreciación        xxx
       Depreciación Acumulada        xxx

b) PROVISIÓN DE AGUINALDO (1/12 del sueldo cada mes)
   Gasto Aguinaldo           xxx
       Provisión Aguinaldo           xxx

c) PROVISIÓN DE BONO DE ANTIGÜEDAD (según tabla DS 21060)
   Gasto Bono Antigüedad     xxx
       Provisión Bono Antigüedad     xxx

d) PROVISIÓN DE INDEMNIZACIÓN (aplica también a renuncia, DS 28699)
   Gasto Indemnización       xxx
       Provisión Indemnización       xxx
```

**Por qué cada mes y no en diciembre:** el aguinaldo se **devenga** mes a mes (principio de devengado, NC del CTNAC). Si lo registras solo en diciembre, tus estados de enero a noviembre mienten: muestran más utilidad de la real.

---

## Paso 6 — Cierre del Ejercicio

Al 31 de diciembre, las **cuentas de resultado** (Ingresos 4.x y Gastos 5.x) se llevan a cero transfiriendo su saldo al Patrimonio (Resultado del Ejercicio). Las cuentas de balance (1, 2, 3) **no** se cierran: arrastran su saldo al año siguiente.

```text
ANTES DEL CIERRE              DESPUÉS DEL CIERRE
Ventas:      100,000          Ventas:      0
Gastos:      (70,000)         Gastos:      0
                              Resultado:   30,000  → Patrimonio
```

**Por qué importa:** el cierre "reinicia" el contador de resultados para que el año siguiente mida solo lo suyo, y deja el Balance General listo para abrir el nuevo ejercicio.

---

## Cómo se ve esto en tu ERP

```text
Módulo 2 (operativo)              Módulo 3 (contable)
─────────────────────             ─────────────────────────────
Factura de compra  ──►  asiento pendiente
                                  │
                          [1] Diario (cronológico)
                                  │
                          [2] Mayor (por cuenta)
                                  │
                          [3] Balanza (verifica)
                                  │
                          [4] Ajustes (aguinaldo, depreciación)
                                  │
                          [5] Cierre (resultado a patrimonio)
```
