# 📉 El Ajuste por Inflación con UFV: suspendido desde diciembre 2020

**Módulo:** 6 — Estados Financieros  
**Tiempo de lectura:** 4 minutos  
**Nivel:** Teórico-Práctico

---

## ¿Qué era el ajuste por inflación?

Durante décadas, Bolivia exigió **reexpresar los estados financieros** para reflejar el efecto de la inflación sobre la moneda. El mecanismo usaba la **UFV** (Unidad de Fomento de Vivienda), un índice publicado por el Banco Central que sube según la inflación acumulada.

La idea: un boliviano de 2019 no compra lo mismo que uno de 2021, entonces comparar cifras de distintos años sin ajustarlas era comparar "peras con manzanas". El ajuste convertía todos los saldos a "bolivianos de poder adquisitivo constante" a la fecha de cierre.

---

## ¿Por qué se suspendió?

Por instrucción del **CTNAC**, el ajuste por inflación estuvo vigente **hasta el 10 de diciembre de 2020**. Desde esa fecha quedó **suspendido hasta nuevo pronunciamiento**, debido a que Bolivia mantuvo tasas de inflación bajas y estables que hacían innecesaria (y distorsionante) la reexpresión.

Consecuencia directa: los estados financieros de las gestiones **2021 en adelante se presentan en valores nominales**, en bolivianos corrientes, sin ningún factor de actualización.

---

## ⚠️ Advertencia de parametrización para sistemas

> Un ERP configurado con **reexpresión automática por inflación** para gestiones posteriores a 2020 estaría aplicando un ajuste que **ya no corresponde**. Generaría estados financieros incorrectos frente a las NC vigentes.

```javascript
// Configuración CORRECTA para Bolivia (2021 en adelante)
const CONFIG_REEXPRESION = {
  vigenteHasta: '2020-12-10',
  suspendidaDesde: '2020-12-11',
  reexpresarEstados: false,   // ← NO reexpresar gestiones > 2020
  indice: 'UFV',
  nota: 'Suspendido por instrucción del CTNAC hasta nuevo pronunciamiento'
};
```

### El matiz que confunde a todos

Aunque el ajuste **contable** está suspendido, el **SIN sigue considerando el ajuste por inflación tributario (AITB)** para ciertos cálculos del IUE. Es decir: contablemente no se reexpresa, pero tributariamente puede corresponder. Un buen ERP maneja **ambos escenarios por separado** y nunca mezcla uno con el otro.

---

## 🎓 Lo que aprendiste

1. La UFV servía para reexpresar estados por inflación; estuvo vigente hasta el **10/12/2020**.
2. Desde entonces está **suspendida**: los estados se presentan en valores nominales.
3. Un sistema con reexpresión automática post-2020 está **mal parametrizado**.
4. Ojo con la dualidad: suspendido en lo **contable**, pero el AITB sigue vivo en lo **tributario**.

---
