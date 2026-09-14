# 🧵 Un Mes Completo en la Vida de Distribuidora Mamoré SRL

**Módulo:** Transversal — integra las 29 guías anteriores  
**Tiempo de lectura:** 15 minutos  
**Nivel:** Síntesis final

---

## La idea

Septiembre de 2026. Una empresa comercial en Trinidad, Beni, con 2 empleados,
3 clientes y 3 proveedores. Vamos a seguir **cada hecho económico del mes** a
través de las 5 capas del ERP, con los números reales que genera el sistema.

Al final entenderás no solo *qué* hace cada módulo, sino **por qué están
conectados en ese orden**.

---

## 📅 Día 1 — La compra que inicia todo

**Hecho:** Compramos 3 laptops a Importadora Beni SA por **Bs 16.950** (factura F-2026-001).

| Capa | Qué ocurre |
|---|---|
| 1. Documentos | Se registra la factura; el sistema valida NIT (dígito verificador) y CUF |
| 2. Módulos | Compras la convierte en entrada de almacén y cuenta por pagar |
| 3. Motor | Asiento: Inventario 15.000 + IVA Crédito 1.950 → Proveedores 16.950 |
| 4. Estados | El inventario crece en el Balance; aún no toca el Resultados |

> 📖 Profundiza: [Guía 04](04-ciclo-compra-venta.md) · [Guía 07](07-partida-doble-explicada.md)

**Lección:** comprar **no es gastar**. El dinero se convirtió en activo (inventario).

---

## 📅 Días 3, 8 y 15 — Las tres ventas del mes

| Fecha | Cliente | Factura | Total | Neto | IVA | IT |
|---|---|---|---:|---:|---:|---:|
| 03/09 | Constructora del Beni | F-2026-V-001 | 13.560,00 | 12.000 | 1.560 | 406,80 |
| 08/09 | Ganadera Yacuma | F-2026-V-002 | 4.237,50 | 3.750 | 487,50 | 127,13 |
| 15/09 | Restaurante El Vaqueño | F-2026-V-003 | 565,00 | 500 | 65 | 16,95 |
| **Total** | | | **18.362,50** | **16.250** | **2.112,50** | **550,88** |

Cada venta dispara **cuatro efectos simultáneos**:

1. **LCV:** la fila de ventas con NIT, CUF, neto, IVA e IT.
2. **Cuentas por cobrar:** nace un derecho (o un cobro, como el día 15 al contado).
3. **Inventario:** salen unidades; se libera su costo como **costo de ventas**.
4. **Motor:** asiento de venta + asiento de costo de ventas.

> 📖 Profundiza: [Guía 05](05-iva-boliviano-explicado.md) (IVA dentro del precio) · [Guía 22 de costos](22-metodos-valuacion-inventarios.md) (¿a qué costo salen?)

**Lección:** el precio que ves incluye IVA (÷1,13 para el neto) y genera IT (×3%)
aunque la empresa pierda dinero.

---

## 📅 Día 20 — El pago que cierra un ciclo

Pagamos a Tecnología Beni la factura F-2026-003 con comprobante de egreso
**CE-2026-001 por Bs 5.650**.

```text
Proveedores (pasivo)  5.650  ← disminuye (DEBE)
Bancos (activo)       5.650  ← disminuye (HABER)
```

**Lección:** pagar una deuda **no es un gasto**: es intercambiar un pasivo por un activo.

---

## 📅 Día 30 — La nómina y las 5 provisiones

| Concepto | Juan Carlos | Ana Lucía | Total |
|---|---:|---:|---:|
| Salario básico | 5.000 | 4.500 | 9.500 |
| Bono antigüedad (DS 21060) | 825 | 375 | 1.200 |
| AFP 10% (deducción) | (500) | (450) | (950) |
| **Neto a pagar** | | | **8.265** |

Y el sistema provisiona, aunque nadie haya renunciado ni sea diciembre:

| Provisión mensual | Monto | Norma |
|---|---:|---|
| Aguinaldo (1/12) | 891,67 | LGT |
| Indemnización | 4.913,38 | DS 28699 |
| Bono antigüedad del mes | 1.200,00 | DS 21060 |

> 📖 Profundiza: [Guía 15](15-bono-antiguedad-explicado.md) (base = 3 SMN) · [Guía 16](16-indemnizacion-boliviana.md) (aplica también en renuncia)

**Lección:** el costo real de un empleado es muy superior a su salario en boleta.

---

## 📅 Cierre del mes — Impuestos y estados

**Conciliación IVA (Form. 200):**
```text
Débito fiscal (ventas):    Bs 2.112,50
Crédito fiscal (compras): (Bs   941,15)
──────────────────────────────────────
IVA a pagar:               Bs 1.171,35   → vence el día 16 (NIT dígito 7)
```

**IT (Form. 400):** 18.362,50 × 3% = **Bs 550,88**

**Estado de Resultados del mes:** pérdida de **Bs 4.787,93**
(las provisiones laborales superan la utilidad bruta de un mes flojo).

**Balance al 30/09:**
```text
ACTIVO  190.829,92  =  PASIVO 45.617,85  +  PATRIMONIO 145.212,07
                                            (150.000 − 4.787,93)
```

> 📖 Profundiza: [Guía 19](19-compensacion-it-iue.md) y [20](20-compensacion-it-iue-ejemplos.md) · [Guía 21](21-estados-financieros-explicados.md) · [Guía 18](18-calendario-tributario.md)

**Lección:** la pérdida del Resultados viaja al Patrimonio del Balance.
Por eso la ecuación **siempre** cuadra: es el mismo número visto dos veces.

---

## 🧭 El mapa completo del mes

```text
Día 1   Compra ──→ Inventario + CxP + asiento
Días 3-15  Ventas ──→ LCV + CxC + costo de ventas + asientos
Día 20  Pago ──→ baja CxP y Bancos
Día 30  Nómina + provisiones ──→ 5 asientos laborales
Cierre  IVA + IT ──→ Forms. 200/400 con vencimiento día 16
Cierre  Resultados + Balance ──→ la pérdida cierra el patrimonio
```

**21 asientos. 10 documentos. 3 formularios. 2 estados. Un solo hilo.**

---

## 🎓 La conclusión de las 30 guías

Ningún número de este mes se escribió a mano: cada uno es **consecuencia** de un
documento validado en la Capa 1. Por eso el Balance cuadra, el LCV coincide con
el Form. 200 y el Form. 200 coincide con el Libro Diario.

> Esa es la diferencia entre un sistema que *muestra* contabilidad y uno que
> **la produce**. Y ahora tú sabes leerla, explicarla y auditarla.

**Felicitaciones: completaste las 30 guías del ERP Contable Bolivia.** 🎓🇧🇴
```
