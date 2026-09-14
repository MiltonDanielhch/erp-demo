# ⚖️ Métodos de Valuación de Inventarios: Promedio, FIFO y LIFO

**Módulo:** 8 — Contabilidad de Costos  
**Tiempo de lectura:** 14 minutos  
**Nivel:** Intermedio

---

## El problema que resuelven

Si compraste el mismo producto a precios distintos en fechas distintas, **¿a qué costo sale cada unidad vendida?** Los tres métodos responden esa pregunta con lógicas distintas, y la respuesta cambia la utilidad, el impuesto y el valor del inventario.

---

## 📘 Promedio Ponderado

Calcula un **costo medio** de todas las unidades disponibles y lo aplica a cada salida.

```text
Costo promedio = Valor total del inventario ÷ Unidades totales
```

Suaviza las fluctuaciones de precio: ni las compras caras ni las baratas dominan el resultado.

## 📗 FIFO / PEPS (Primeras en Entrar, Primeras en Salir)

Asume que **lo primero comprado es lo primero vendido**. Las salidas consumen las capas más antiguas; el inventario final queda valorado a los precios **más recientes**.

## 📕 LIFO / UEPS (Últimas en Entrar, Primeras en Salir)

Asume que **lo último comprado es lo primero vendido**. Las salidas consumen las capas más recientes; el inventario final queda a precios **antiguos**. En inflación, esto infla el costo de ventas y **reduce artificialmente la utilidad**.

---

## 🔢 Ejemplo numérico: el mismo inventario, tres respuestas

**Movimientos del mes:**

| Operación | Unidades | Costo unit. | Total |
|---|---:|---:|---:|
| Compra 1 (día 5) | 50 | Bs 40 | Bs 2.000 |
| Compra 2 (día 20) | 50 | Bs 80 | Bs 4.000 |
| **Venta (día 28)** | **60** | **Bs 100 (precio)** | **Bs 6.000** |

**Resultado según el método:**

| Concepto | 📘 Promedio | 📗 FIFO | 📕 LIFO |
|---|---:|---:|---:|
| Costo de venta | Bs 3.600 | Bs 2.800 | Bs 4.400 |
| **Utilidad bruta** | **Bs 2.400** | **Bs 3.200** | **Bs 1.600** |
| IUE (25%) | Bs 600 | Bs 800 | Bs 400 |
| Inventario final (40 u) | Bs 2.400 | Bs 3.200 | Bs 1.600 |

**Verificación FIFO:** consume 50 u @ 40 + 10 u @ 80 = 2.800. Quedan 40 u @ 80 = 3.200.  
**Verificación LIFO:** consume 50 u @ 80 + 10 u @ 40 = 4.400. Quedan 40 u @ 40 = 1.600.  
**Verificación Promedio:** costo medio = 6.000 ÷ 100 = Bs 60; venta 60 × 60 = 3.600.

> ⚠️ Con los **mismos datos**, la utilidad varía en **Bs 1.600** y el IUE en **Bs 400** según el método elegido.

---

## ✅❌ Ventajas y desventajas

| Método | Ventajas | Desventajas |
|---|---|---|
| **Promedio** | Simple, estable, aceptado universalmente | Diluye señales de precio reciente |
| **FIFO** | Inventario final a valores actuales; refleja flujo físico real | En inflación, muestra utilidades "paper" más altas |
| **LIFO** | En inflación, reduce utilidad y por tanto el impuesto | Inventario final desactualizado; manipulable |

---

## 🚫 Por qué las NIIF prohibieron LIFO en 2005

La **NIC 2** eliminó LIFO porque en entornos inflacionarios permite **manipular la utilidad**: comprando caro a fin de mes se infla el costo de venta y se paga menos impuesto, sin que cambie nada en la operación real. Además, el inventario resultante queda valorado a precios obsoletos, distorsionando el Balance.

## 🇧 Qué acepta Bolivia

El **SIN solo acepta Promedio Ponderado y FIFO** para valuación de inventarios. LIFO aparece en este ERP **exclusivamente como herramienta didáctica**, con una advertencia visible: usarlo en una declaración real sería una observación de fiscalización.

---

## 🎓 Lo que aprendiste

1. Los tres métodos reparten el mismo costo total entre "vendido" y "en inventario" de forma distinta.
2. En inflación: FIFO → más utilidad; LIFO → menos utilidad; Promedio → punto medio.
3. NIC 2 prohibió LIFO en 2005 por manipulable; Bolivia acepta solo Promedio y FIFO.
4. El método elegido es una **política contable**: debe declararse en las Notas y mantenerse consistente.

---
