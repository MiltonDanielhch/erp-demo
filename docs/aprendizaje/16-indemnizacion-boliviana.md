# ⚖️ Indemnización por Tiempo de Servicio en Bolivia (DS 28699)

**Módulo:** 4 — Nómina Boliviana  
**Tiempo de lectura:** 10 minutos  
**Nivel:** Intermedio-Avanzado

---

## 🚨 La particularidad que casi nadie conoce

> **En Bolivia, la indemnización por tiempo de servicio se paga TAMBIÉN cuando el empleado RENUNCIA voluntariamente.** No solo en caso de despido.

Esto sorprende a contadores y empresarios de otros países, donde la indemnización suele asociarse únicamente al despido injustificado. En Bolivia es un **derecho adquirido por años de servicio**, independiente de quién termine la relación laboral.

---

## 📜 Base legal

### Decreto Supremo 28699 (2006)

Establece el pago de indemnización por tiempo de servicios:

- **Un (1) salario mensual por cada año de servicio** (o fracción mayor a 6 meses).
- Tope máximo: **5 años de salario** para el sector privado (salvo pacto en contrario).
- Aplica a **toda terminación de la relación laboral**, sin distinguir la causa.

### Confirmación del Tribunal Constitucional Plurinacional

El TCP ha ratificado en reiterada jurisprudencia que la indemnización es un **derecho patrimonial adquirido** por el tiempo de servicio prestado, y que **no puede condicionarse** a la forma de terminación del contrato. Por eso:

```text
┌─────────────────────────────────────────────────────────────┐
│  RENUNCIA VOLUNTARIA      →  SÍ hay indemnización          │
│  DESPIDO INJUSTIFICADO    →  SÍ hay indemnización          │
│  DESPIDO JUSTIFICADO      →  SÍ hay indemnización          │
│  MUTUO ACUERDO            →  SÍ hay indemnización          │
│  MUERTE DEL TRABAJADOR    →  SÍ (la cobran los herederos)  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧮 Fórmula de cálculo

```text
Indemnización = (Años de servicio) × (Último salario mensual)
```

**Reglas de cómputo:**
- Fracción **mayor a 6 meses** = 1 año completo.
- Fracción **menor o igual a 6 meses** = no se computa.
- Se usa el **último salario total ganado** (incluye bono de antigüedad y promedios de extras habituales).

---

## 📊 Ejemplo comparativo: Renuncia vs. Despido sin preaviso

### Datos del empleado

| Dato | Valor |
|------|-------|
| Nombre | Juan Carlos Menacho |
| Años de servicio | 6 años y 8 meses |
| Último salario total ganado | Bs 5.825 (básico 5.000 + bono antigüedad 825) |

### Caso 1: RENUNCIA VOLUNTARIA

```text
Años computables: 6 años y 8 meses → 7 años (fracción > 6 meses)

Indemnización = 7 × 5.825 = Bs 40.775

Desahucio:      NO aplica (el empleado avisa y se va por voluntad propia)

TOTAL A PAGAR:  Bs 40.775
```

### Caso 2: DESPIDO SIN PREAVISO

```text
Años computables: 7 años (igual que arriba)

Indemnización = 7 × 5.825 = Bs 40.775

Desahucio (DS 22138): 3 meses de salario por falta de preaviso
                      = 3 × 5.825 = Bs 17.475

TOTAL A PAGAR:  40.775 + 17.475 = Bs 58.250
```

### Comparación visual

```text
┌──────────────────────────────────────────────────────────────┐
│                    RENUNCIA          DESPIDO SIN PREAVISO    │
│  Indemnización      Bs 40.775              Bs 40.775         │
│  Desahucio          Bs 0                   Bs 17.475         │
│  ────────────────────────────────────────────────────────    │
│  TOTAL              Bs 40.775              Bs 58.250         │
│                                                              │
│  💡 La indemnización es IDÉNTICA en ambos casos.             │
│     La diferencia es solo el desahucio por falta de preaviso.│
└──────────────────────────────────────────────────────────────┘
```

---

## ⚠️ El error de parametrización más común en ERPs

Muchos sistemas contables (incluso comerciales) provisionan indemnización **solo cuando el empleado es despedido**, o peor: **no la provisionan nunca** y la registran como gasto recién al momento del pago.

### Por qué está mal

1. **Es un pasivo cierto:** Todo empleado activo acumula indemnización día a día. Al 31 de diciembre, la empresa **ya debe** ese dinero aunque nadie haya renunciado todavía.

2. **Distorsiona resultados:** Si no se provisiona, el año en que renuncia un empleado con 10 años de servicio absorbe de golpe un gasto enorme que en realidad se generó durante 10 años.

3. **Incumple NC del CTNAC:** Las Normas de Contabilidad exigen reconocer pasivos laborales devengados (principio de devengado y prudencia).

### Cómo lo hace bien este ERP

```javascript
// Provisiona indemnización para TODOS los empleados activos,
// todos los meses, sin importar si van a renunciar o ser despedidos.
function calcularProvisionIndemnizacion(empleado) {
  const anios = calcularAniosServicio(empleado.fechaIngreso);
  const salarioTotal = empleado.salarioBase + empleado.bonoAntiguedad;
  
  // Indemnización acumulada a la fecha
  const indemnizacionAcumulada = anios * salarioTotal;
  
  // Provisión del mes = acumulado / meses trabajados (suavizado)
  const provisionMensual = indemnizacionAcumulada / (anios * 12 || 1);
  
  return provisionMensual;
}

// Asiento mensual de provisión
{
  fecha: '2026-09-30',
  concepto: 'Provisión indemnización por tiempo de servicio',
  lineas: [
    { cuenta: '5.2.07', debe: 485,  haber: 0 },   // Gasto indemnización
    { cuenta: '2.1.14', debe: 0,    haber: 485 }  // Indemnización por pagar
  ]
}
```

**Regla de oro:**

> Si tu ERP solo provisiona indemnización "en caso de despido", **está mal parametrizado para Bolivia**. Debe provisionar para todos los activos, siempre.

---

## 🧾 El desahucio (DS 22138) — el complemento del despido

El **desahucio** es un pago distinto de la indemnización:

| Concepto | Indemnización | Desahucio |
|----------|---------------|-----------|
| Norma | DS 28699 | DS 22138 |
| Causa | Terminación de la relación (cualquiera) | Falta de preaviso |
| Monto | 1 salario por año | 3 meses de salario |
| En renuncia con preaviso | ✅ Sí | ❌ No |
| En despido sin preaviso | ✅ Sí | ✅ Sí |

**Preaviso:** 30 días de anticipación. Si el empleador despide sin darlos, paga el desahucio. Si el empleado renuncia sin darlos, el empleador **puede descontarle** el desahucio de su finiquito.

---

## 📋 Finiquito completo: ejemplo de despido sin preaviso

Empleado: 7 años computables, salario total Bs 5.825

| Concepto | Cálculo | Monto |
|----------|---------|------:|
| Indemnización (DS 28699) | 7 × 5.825 | Bs 40.775,00 |
| Desahucio (DS 22138) | 3 × 5.825 | Bs 17.475,00 |
| Aguinaldo proporcional | 5.825 × 9/12 | Bs 4.368,75 |
| Bono de antigüedad del mes | Tabla DS 21060 | Bs 825,00 |
| Vacación proporcional | Según contrato | Bs 2.912,50 |
| **TOTAL FINIQUITO** | | **Bs 66.356,25** |

---

## 🔍 Preguntas frecuentes

### ¿Hay tope de años para la indemnización?

Sí: **5 años** en el sector privado según DS 28699, salvo que el contrato o convenio colectivo establezca un tope mayor o no establezca tope. Muchas empresas pactan sin tope como beneficio.

### ¿La indemnización paga impuestos?

La indemnización por tiempo de servicios está **exenta del IUE/RC-IVA** hasta el monto legal. Los excesos pactados sí pueden estar gravados.

### ¿Qué pasa si el empleado renuncia sin preaviso?

El empleador puede descontar el equivalente al desahucio (hasta 3 meses) del finiquito, pero **nunca puede descontar la indemnización**: es un derecho adquirido intocable.

### ¿Se provisiona también para empleados con menos de 1 año?

Sí. Aunque aún no tengan derecho a cobrar (fracción menor a 6 meses no computa), la provisión contable comienza desde el primer mes porque el pasivo se está generando.

---

## 📚 Resumen ejecutivo

| Concepto | Valor |
|----------|-------|
| Norma principal | DS 28699 (2006) |
| Confirmación | Tribunal Constitucional Plurinacional |
| Monto | 1 salario por año de servicio |
| Tope legal | 5 años (sector privado) |
| ¿Aplica en renuncia? | **SÍ** (particularidad boliviana) |
| Desahucio | 3 meses (DS 22138), solo sin preaviso |
| Provision contable | Mensual, para TODOS los activos |
| Cuenta de gasto | 5.2.07 Gasto de Indemnización |
| Cuenta de pasivo | 2.1.14 Indemnización por Pagar |

---

## 🎓 Lo que aprendiste

1. En Bolivia la indemnización **no depende de quién termina el contrato**: renuncia o despido, se paga igual.
2. El **desahucio** es un concepto aparte que solo aparece cuando falta el preaviso de 30 días.
3. Un ERP bien parametrizado para Bolivia **provisiona indemnización mensualmente para todos los empleados activos**, no solo al momento del despido.
4. El pasivo por indemnización es **cierto y devengado**: ignorarlo distorsiona los estados financieros y viola las NC del CTNAC.

---
