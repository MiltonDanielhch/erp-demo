# 🧾 Formularios del SIN: Tabla Completa y Plazos

**Módulo:** 7 — Cumplimiento SIN  
**Tiempo de lectura:** 8 minutos  
**Nivel:** Referencia rápida

---

## 📋 Tabla maestra de formularios

| Form. | Nombre | Frecuencia | Qué declara | Vencimiento | Obligados |
|:-----:|--------|------------|-------------|-------------|-----------|
| **200** | Declaración Jurada del IVA | Mensual | Débito fiscal de ventas menos crédito fiscal de compras; saldo a pagar o a favor | Día 10 al 19 del mes siguiente, según último dígito del NIT | Contribuyentes del Régimen General |
| **400** | Declaración Jurada del IT | Mensual | Ingresos brutos del mes × 3% | Día 10 al 19 del mes siguiente, según dígito del NIT | Contribuyentes del Régimen General |
| **110** | Declaración de Retenciones (RC-IVA) | Mensual | Retenciones de RC-IVA practicadas a empleados y terceros | Día 10 al 19 del mes siguiente, según dígito del NIT | Agentes de retención y percepción |
| **500** | Declaración Jurada del IUE | Anual | Utilidad imponible × 25%, con ajustes y compensación de IT (Art. 77) | Dentro de los 6 meses del cierre de gestión, según calendario por dígito | Personas jurídicas y empresas unipersonales del RG |
| **510** | IUE — regímenes especiales | Anual | Utilidad de contribuyentes de regímenes específicos vinculados al IUE | Con el calendario anual del IUE | Contribuyentes alcanzados por el régimen |
| **530** | IUE-BE (Beneficiarios del Exterior) | Por operación / anual | Remuneraciones pagadas a beneficiarios del exterior × 12,5% | Según calendario del SIN para operaciones con el exterior | Pagadores bolivianos a sujetos del exterior |
| **601** | Partes Vinculadas | Anual | Operaciones con empresas relacionadas y precios de transferencia | Junto con la DJ del IUE | Contribuyentes con operaciones con vinculadas |
| **605** | Estados Financieros (SIAT) | Anual | Balance General, Estado de Resultados, Notas y dictamen | Junto con la DJ del IUE | Personas jurídicas obligadas a presentar EEFF |

---

## 📅 Calendario mensual por dígito del NIT

Los formularios **200, 400 y 110** y el **LCV** vencen el mes siguiente al período declarado, en el día que corresponde al **último dígito del NIT**:

| Último dígito del NIT | Día de vencimiento |
|:---------------------:|:------------------:|
| 1 | 10 |
| 2 | 11 |
| 3 | 12 |
| 4 | 13 |
| 5 | 14 |
| 6 | 15 |
| 7 | 16 |
| 8 | 17 |
| 9 | 18 |
| 0 | 19 |

**Ejemplo:** NIT `123456789-7` → último dígito **7** → vence el **día 16** de cada mes.

> 💡 Si el día de vencimiento cae en feriado o fin de semana, se traslada al siguiente día hábil según resolución del SIN.

---

## 📖 El LCV como anexo permanente

Aunque no es un "formulario", el **Libro de Compras y Ventas** se cierra **mensualmente** y sustenta los Forms. 200 y 400. Debe conservarse digitalizado y disponible para fiscalización durante todo el plazo de prescripción.

---

## 💻 Cómo lo automatiza el ERP

```javascript
// Calendario de vencimientos según dígito del NIT
function diaVencimiento(nit) {
  const digito = parseInt(nit.slice(-1), 10);
  return digito === 0 ? 19 : 9 + digito;   // 1→10 ... 9→18, 0→19
}

// Obligaciones mensuales generadas automáticamente
function obligacionesMensuales(periodo, nit) {
  const dia = diaVencimiento(nit);
  return ['200', '400', '110', 'LCV'].map(form => ({
    formulario: form,
    periodo,
    vencimiento: `${periodoSiguiente(periodo)}-${String(dia).padStart(2, '0')}`,
    estado: 'PENDIENTE'
  }));
}
```

---

## 📋 Resumen de frecuencias

| Frecuencia | Formularios |
|---|---|
| Mensual | 200, 400, 110 + cierre LCV |
| Anual | 500/510, 601, 605 |
| Por operación con exterior | 530 |

---

## 🎓 Lo que aprendiste

1. Cada formulario tiene frecuencia, contenido y plazo propios.
2. El calendario mensual se escalona por dígito del NIT (días 10 a 19).
3. El IUE y sus anexos (601, 605) se presentan dentro de los 6 meses del cierre.
4. El 530 captura el IUE-BE del 12,5% sobre pagos al exterior.

---
