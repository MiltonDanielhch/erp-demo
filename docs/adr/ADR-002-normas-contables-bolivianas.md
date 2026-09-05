# ADR-002: Normas Contables Bolivianas (NC del CTNAC)

**Fecha:** 2026-09-05
**Estado:** ✅ Aceptado
**Decisor:** Equipo de desarrollo

## Contexto

Bolivia tiene su propio cuerpo normativo contable: las **NC (Normas de
Contabilidad)** emitidas por el **CTNAC (Consejo Técnico Nacional de
Auditoría y Contabilidad)**, dependiente del **CAUB (Colegio de Auditores
o Contadores Públicos de Bolivia)**.

Históricamente, Bolivia avanzó en un proceso de convergencia hacia las
NIIF (Normas Internacionales de Información Financiera) con apoyo del BID,
concluido técnicamente en 2013. Sin embargo, ese marco **no llegó a entrar
en vigencia plena** por consideraciones fiscales. En la práctica:

- Las **NC del CTNAC** son el cuerpo normativo vigente (16 normas + marco
  conceptual, vigentes desde el 1 de enero de 2011).
- Las **NIIF y NIA internacionales** se usan solo de forma **supletoria**
  cuando no existe un pronunciamiento nacional (NC/NA) específico.

Además, el **ajuste por inflación con UFV** (Unidad de Fomento a la
Vivienda) estuvo vigente hasta el **10 de diciembre de 2020**, cuando el
CTNAC instruyó su suspensión hasta nuevo pronunciamiento.

## Decisión

El sistema se regirá por las **NC del CTNAC**, no por NIIF puras.

Específicamente:

1. **Plan de cuentas:** Estructura según las NC (1-Activos, 2-Pasivos,
   3-Patrimonio, 4-Ingresos, 5-Gastos/Costos).

2. **Ajuste por inflación (UFV):** Se programará como un módulo
   **desactivable**, con un toggle `UFV_ACTIVO: false` por defecto.
   Si en el futuro el CTNAC reactiva el ajuste, se puede activar
   sin reescribir la lógica.

3. **Métodos de valuación de inventario:** PEPS (FIFO) y Costo Promedio
   Ponderado. **NO se implementará UEPS (LIFO)** porque las NC no lo
   aceptan.

4. **Métodos de depreciación:** Línea recta y unidades de producción.
   No se implementarán métodos acelerados (no aceptados por las NC).

5. **Estados financieros:** Se generarán los 5 estados requeridos:
   - Balance General (Estado de Situación Financiera).
   - Estado de Resultados (Pérdidas y Ganancias).
   - Estado de Flujo de Efectivo.
   - Estado de Cambios en el Patrimonio Neto.
   - Notas a los Estados Financieros.

## Consecuencias

### Positivas
- ✅ Los estados financieros cumplen con lo que exige el **SIN** y el
  **CAUB**, no con estándares internacionales que no aplican en Bolivia.
- ✅ El sistema refleja la realidad contable boliviana.
- ✅ El módulo UFV desactivable permite adaptarse si el CTNAC cambia
  la normativa.

### Negativas
- ❌ Los estados financieros NO serán compatibles con NIIF puras.
- ❌ Si un usuario necesita reportes bajo NIIF, tendrá que hacer
  ajustes manuales.
- ❌ La documentación contable debe referirse a NC, no a NIIF.

### Mitigación
- En las Notas a los Estados Financieros, se indicará explícitamente:
  *"Estos estados financieros fueron preparados conforme a las Normas
  de Contabilidad (NC) emitidas por el CTNAC/CAUB de Bolivia."*
- Si un usuario necesita NIIF, se puede agregar un módulo de conversión
  en una versión futura.

## Alternativas Descartadas

| Alternativa | Por qué se descartó |
|---|---|
| NIIF puras | No son el cuerpo normativo vigente en Bolivia. El SIN y el CAUB exigen NC del CTNAC. |
| NIIF para PYMES | Similar a NIIF puras: no son el estándar vigente. |
| Normas contables de otro país | No aplican en Bolivia. Cada país tiene su propio cuerpo normativo. |
| Sin normas (contabilidad libre) | El SIN exige cumplimiento de normas contables. No es opcional. |

## Referencias

- NC del CTNAC: 16 normas + marco conceptual (vigentes desde 01/01/2011).
- Suspensión del ajuste UFV: instrucción del CTNAC, 10 de diciembre de 2020.
- Ley 843, Art. 5: IVA incluido en el precio (hasta que entre en vigencia
  la modificación de la Ley 1733).
- Guía técnica del ERP (Sección 1: ¿Qué es un ERP Contable?).
