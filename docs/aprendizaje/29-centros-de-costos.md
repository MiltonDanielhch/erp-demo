# 🏢 Centros de Costo: asignación y control gerencial

**Módulo:** 8 — Contabilidad de Costos  
**Tiempo de lectura:** 10 minutos  
**Nivel:** Intermedio

---

## ¿Qué es un centro de costo?

Un **centro de costo** es una unidad de la organización (departamento, área o proyecto) a la que se le **asignan costos** para medir su consumo de recursos y evaluar su desempeño. Es la respuesta a la pregunta: *¿dónde se gastó el dinero?*

---

## 🗂️ Tipos de centros

| Tipo | Función | Ejemplo |
|---|---|---|
| **Productivo** | Transforma directamente el producto | Taller de carpintería, línea de ensamblaje |
| **De servicio** | Apoya a los productivos sin tocar el producto | Mantenimiento, almacén, control de calidad |
| **Administrativo** | Gestiona la empresa, no produce | Gerencia, contabilidad, RRHH |

Los productivos cargan su costo **al producto**; los de servicio y administrativos se **reparten** entre los productivos o se tratan como gasto del período.

---

## 🧮 Asignación de indirectos: la tasa de absorción de CIF

Los costos indirectos (electricidad, alquiler, supervisión) no se pueden asignar directamente a cada unidad. Se reparten con una **tasa de absorción**:

```text
Tasa de absorción = CIF estimados del centro ÷ Base de asignación estimada
```

La base puede ser **horas máquina**, **horas de mano de obra directa** o **unidades producidas**.

### Ejemplo numérico

El taller estima **Bs 120.000** de CIF anuales y **6.000 horas máquina**:

```text
Tasa = 120.000 ÷ 6.000 = Bs 20 por hora máquina
```

Un producto que usa **4 horas máquina** absorbe **Bs 80** de CIF, que se suman a su MP y MOD para formar el costo total.

---

## 📊 Evaluación de desempeño por departamento

Cada centro tiene un **presupuesto anual** y se compara contra su **ejecución real**:

```text
% Ejecución = Gasto acumulado ÷ Presupuesto × 100
```

| Centro | Presupuesto | Ejecutado | % | Semáforo |
|---|---:|---:|---:|:---:|
| Producción | Bs 180.000 | Bs 95.000 | 53% | 🟢 |
| Almacén | Bs 80.000 | Bs 61.000 | 76% | 🟡 |
| Administración | Bs 120.000 | Bs 118.000 | 98% | 🔴 |

El semáforo alerta antes de que el sobregasto sea irreversible: ese es el valor gerencial del centro de costo.

---

## 💻 En el ERP

```javascript
// centros-costo.js: cada centro registra presupuesto y gastos
centrosCosto.asignarGasto('ALMACEN', { monto: 4500, concepto: 'Electricidad' });
centrosCosto.calcularEjecucionPresupuestal('ALMACEN');
// → { porcentajeEjecucion: 76, estado: 'ADVERTENCIA' }
```

---

## 🎓 Lo que aprendiste

1. Un centro de costo es una unidad de asignación y control, no un asiento contable.
2. Productivos cargan al producto; servicio y administrativos se reparten o gastan.
3. La tasa de absorción (CIF ÷ base) es el puente entre lo indirecto y el costo unitario.
4. Presupuesto vs ejecución con semáforos convierte el costo en herramienta de decisión.

---
