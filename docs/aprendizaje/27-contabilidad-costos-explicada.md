# 🏭 Contabilidad de Costos: Fundamentos para un ERP

**Módulo:** 8 — Contabilidad de Costos  
**Tiempo de lectura:** 12 minutos  
**Nivel:** Fundamental

---

## ¿Qué es y para qué sirve?

La **contabilidad de costos** mide cuánto cuesta producir un bien o prestar un servicio. Mientras la contabilidad financiera mira hacia afuera (SIN, bancos), la de costos mira **hacia adentro**: le dice al gerente qué producto gana, cuál pierde y dónde se fuga el dinero.

Su respuesta central es una fórmula:

```text
Costo Total = Materia Prima (MP) + Mano de Obra Directa (MOD) + Costos Indirectos (CIF)
```

---

## 🗂️ Clasificación de costos

### Por su identificación con el producto

| Tipo | Definición | Ejemplo |
|---|---|---|
| **Directo** | Se mide y asigna fácilmente a cada unidad | Madera de una silla, salario del carpintero |
| **Indirecto** | Beneficia a varios productos y debe prorratearse | Electricidad de la fábrica, alquiler del taller |

### Por su comportamiento con el volumen

| Tipo | Comportamiento | Ejemplo |
|---|---|---|
| **Fijo** | No cambia con el volumen (en el corto plazo) | Alquiler, salario del supervisor, seguros |
| **Variable** | Crece o decrece con cada unidad producida | Materia prima, empaques, comisiones |
| **Mixto (semivariable)** | Tiene una parte fija y una variable | Electricidad: cargo fijo + consumo por producción |

Esta última clasificación es la que alimenta el **análisis de punto de equilibrio**: solo separando fijos de variables puede calcularse cuántas unidades se necesitan para no perder.

---

## 🔄 El ciclo contable de costos

El costo no se "gasta" al comprar: **viaja** por la empresa hasta convertirse en gasto al venderse.

```text
1. COMPRA          2. PRODUCCIÓN         3. INVENTARIO        4. VENTA
Materia prima  →   + MOD + CIF      →    Producto        →    Costo de
entra al almacén    se incorporan         terminado en         ventas
                    al producto           balance              (resultado)
```

**La clave conceptual:** mientras el producto está en inventario, su costo es un **ACTIVO**. Solo cuando se vende se convierte en **GASTO** (costo de ventas). Por eso vender más no siempre es ganar más: depende del costo que liberas.

---

## 🆚 Diferencias con la contabilidad financiera

| Aspecto | Contabilidad Financiera | Contabilidad de Costos |
|---|---|---|
| Audiencia | Externa: SIN, bancos, socios | Interna: gerencia, producción |
| Normativa | NC del CTNAC, Ley 843 | Sin norma obligatoria: es gerencial |
| Frecuencia | Mensual / anual | Diaria, por orden o por lote |
| Precisión | Exactitud legal | Utilidad para decidir (estimaciones válidas) |
| Enfoque | El pasado (qué pasó) | El futuro (cuánto costará, qué precio fijar) |

---

## 💻 Cómo se refleja en el ERP

```javascript
// El ciclo de costos en el sistema:
// 1. Compra: entra capa de inventario (inventario-capas.js)
// 2. Producción: orden de trabajo acumula MP + MOD + CIF (ordenes-trabajo.js)
// 3. Inventario: producto terminado valorado (método Promedio o FIFO)
// 4. Venta: se libera el costo como costo de ventas (asientos-costos.js)
```

---

## 🎓 Lo que aprendiste

1. El costo suma tres elementos: MP, MOD y CIF.
2. Directo/indirecto define **cómo se asigna**; fijo/variable/mixto define **cómo se comporta**.
3. El costo es activo mientras está en inventario y gasto al venderse.
4. La contabilidad de costos es interna y gerencial; la financiera es externa y normativa.

---
