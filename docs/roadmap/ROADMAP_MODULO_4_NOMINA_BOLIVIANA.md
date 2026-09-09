# 📁 ROADMAP_MODULO_4_NOMINA_BOLIVIANA.md

**Proyecto:** ERP Contable Integral Boliviano (Prototipo Educativo / Portafolio)
**Arquitectura:** Frontend Vanilla JS + LocalStorage (sin backend real — enfoque didáctico)
**Versión:** 1.0.0 · **Formato:** Guía Arquitectónica Explicativa
**Tiempo estimado:** 6–8 horas · **Bloquea:** Módulos 5→8 (Impuestos, Estados Financieros)
**Depende de:** Módulo 0 (Setup) + Módulo 1 (Documentos) + Módulo 3 (Motor Contable)

> **Objetivo del Módulo:** Construir el **módulo de Nómina y Recursos Humanos** adaptado a la **Ley General del Trabajo (LGT) de Bolivia**. Aquí se calcula la planilla mensual de sueldos, las provisiones de aguinaldo (Navidad y segundo aguinaldo condicional), bono de antigüedad (sobre 3 SMN), indemnización por tiempo de servicio (que aplica **también a renuncia voluntaria** — particularidad boliviana), desahucio, y la compensación del RC-IVA con facturas de gastos personales. Este módulo genera los asientos contables que se procesan en el Motor Contable (Módulo 3).

> **Nota didáctica:** Este es el módulo **más boliviano** de todo el ERP. Si alguien te pregunta "¿qué hace que tu ERP sea para Bolivia y no genérico?", la respuesta está aquí: aguinaldo de Navidad, segundo aguinaldo condicional al crecimiento del PIB, bono de antigüedad sobre 3 salarios mínimos, indemnización incluso en renuncia voluntaria, y RC-IVA compensable con facturas. Ninguna de estas reglas existe en un ERP genérico de otro país.

---

## 🗺️ Mapa del Módulo

```text
Módulo 4
├── Fase 4.1 → Teoría: Nómina Boliviana y la LGT
├── Fase 4.2 → Modelo de datos: Catálogo de Empleados
├── Fase 4.3 → js/modulos/nomina.js — Cálculo mensual
├── Fase 4.4 → Aguinaldo de Navidad y Segundo Aguinaldo
├── Fase 4.5 → Bono de Antigüedad (3 SMN)
├── Fase 4.6 → Indemnización y Desahucio
├── Fase 4.7 → RC-IVA y compensación con facturas
├── Fase 4.8 → Generación de asientos contables de nómina
├── Fase 4.9 → Vista de Nómina (planilla + provisiones)
└── Fase 4.10 → Smoke test final y commit de cierre
```

---

## 🟥 Estado: `[ ] Pendiente`

---

# FASE 4.1 — Teoría: Nómina Boliviana y la LGT

## Diferencias clave con otros países

```text
╔══════════════════════════════════════════════════════════════════╗
║  EN BOLIVIA:                                                    ║
║                                                                  ║
║  ✗ NO hay impuesto a la renta personal como tal                 ║
║  ✗ NO hay cesantías ni prima semestral                          ║
║  ✓ SÍ hay aguinaldo de Navidad (obligatorio, siempre)           ║
║  ✓ SÍ hay segundo aguinaldo condicional (si PIB > 4.5%)         ║
║  ✓ SÍ hay bono de antigüedad (sobre 3 SMN, no sobre salario)    ║
║  ✓ SÍ hay indemnización INCLUSO EN RENUNCIA VOLUNTARIA          ║
║  ✓ SÍ hay desahucio (3 meses por falta de preaviso)             ║
║  ✓ SÍ hay RC-IVA compensable con facturas de gastos personales  ║
╚══════════════════════════════════════════════════════════════════╝
```

## Estructura de la planilla mensual

```text
DEVENGADOS (lo que el empleado gana):
─────────────────────────────────────────────────
  Salario base                          Bs 5,000.00
  Horas extras (si aplica)              Bs 500.00
  Comisiones (si aplica)                Bs 300.00
  Bonificaciones (si aplica)            Bs 200.00
  Bono de antigüedad                    Bs 375.00
  ─────────────────────────────────────────────────
  TOTAL DEVENGADO                       Bs 6,375.00

DEDUCCIONES (lo que se le descuenta):
─────────────────────────────────────────────────
  Aporte laboral AFP / Gestora (10%)    Bs 637.50
  RC-IVA (13%, si no compensa)          Bs 828.75
  Aportes patronales (los paga la empresa, no el empleado)
  ─────────────────────────────────────────────────
  TOTAL DEDUCCIONES                     Bs 1,466.25

NETO A PAGAR:
─────────────────────────────────────────────────
  Total Devengado − Total Deducciones   Bs 4,908.75

APORTES PATRONALES (los paga la empresa, adicional al salario):
─────────────────────────────────────────────────
  Salud (Gestora Pública) ~10%          Bs 637.50
  AFP / Gestora largo plazo ~10%        Bs 637.50
  Seguro de Riesgo del Trabajo           Bs 100.00
  ─────────────────────────────────────────────────
  TOTAL COSTO EMPLEADOR                 Bs 7,750.00
  (Total Devengado + Aportes Patronales)
```

## Tareas de la Fase 4.1

```text
[ ] Crear docs/aprendizaje/13-nomina-boliviana-explicada.md
    → Explicación teórica de la nómina boliviana (máximo 3 páginas).
    → Incluir: devengados, deducciones, aportes patronales.
    → Explicar las diferencias con otros países de la región.
    → 🧠 Mini-Prompt para IA: "Escribe una explicación didáctica 
      de la nómina boliviana según la Ley General del Trabajo. 
      Incluye: devengados (salario base, horas extras, comisiones, 
      bono antigüedad), deducciones (AFP 10%, RC-IVA 13%), 
      aportes patronales (salud 10%, AFP 10%, riesgo laboral). 
      Explica que en Bolivia NO hay impuesto a la renta personal 
      como tal, y que el RC-IVA se compensa con facturas. 
      Máximo 700 palabras."

[ ] Crear docs/aprendizaje/14-particularidades-bolivianas.md
    → Las 5 particularidades que hacen única la nómina boliviana.
    → Con referencias legales (LGT, DS 1802, DS 21060, DS 28699).
    → 🧠 Mini-Prompt para IA: "Explica las 5 particularidades 
      de la nómina boliviana que no existen en otros países: 
      1) aguinaldo de Navidad obligatorio, 2) segundo aguinaldo 
      condicional al PIB (DS 1802), 3) bono de antigüedad sobre 
      3 SMN (DS 21060), 4) indemnización en renuncia voluntaria 
      (DS 28699), 5) RC-IVA compensable con facturas. Incluye 
      referencias legales y ejemplos numéricos."
```

---

# FASE 4.2 — Modelo de Datos: Catálogo de Empleados

## ¿Qué hace esta fase?
Define la **estructura del empleado** en el ERP. Cada empleado tiene datos personales, datos laborales (fecha de ingreso, cargo, salario), y datos para el cálculo de beneficios sociales (antigüedad, provisiones acumuladas).

## Estructura del empleado

```javascript
const empleado = {
  id: "emp-001",
  ci: "12345678",                     // Cédula de Identidad
  nit: "123456789-1",                 // NIT personal (para RC-IVA)
  nombres: "Juan Carlos",
  apellidos: "Mamani Quispe",
  fechaNacimiento: "1990-05-15",
  genero: "MASCULINO",
  estadoCivil: "CASADO",
  
  // Datos laborales
  fechaIngreso: "2020-03-01",         // Para calcular antigüedad
  fechaRetiro: null,                  // Si ya no trabaja
  cargo: "Vendedor Senior",
  departamento: "VENTAS",
  tipoContrato: "INDEFINIDO",         // INDEFINIDO, PLAZO_FIJO, CONSULTORIA
  salarioBase: 5000.00,               // Salario mensual en Bs
  
  // Datos para beneficios sociales
  antiguedadAnios: 6,                 // Calculado desde fechaIngreso
  bonoAntiguedadPorcentaje: 0.15,     // 15% según tabla (6 años)
  bonoAntiguedadMonto: 375.00,        // 15% × 3 SMN
  
  // Datos de RC-IVA
  facturasGastosPersonales: [],       // Facturas para compensar RC-IVA
  saldoRCIVACompensado: 0.00,         // Cuánto ya compensó este mes
  
  // Provisiones acumuladas
  aguinaldoAcumulado: 4167.00,        // Provisión acumulada del año
  indemnizacionAcumulada: 15000.00,   // Provisión acumulada total
  
  estado: "ACTIVO",                   // ACTIVO, RETIRADO, SUSPENDIDO
  motivoRetiro: null,                 // RENUNCIA, DESPIDO, JUBILACION
  creadoEn: "2026-09-01T10:00:00"
};
```

## Tabla de bono de antigüedad

```text
AÑOS DE SERVICIO │ PORCENTAJE │ BASE DE CÁLCULO
─────────────────┼────────────┼─────────────────
2 – 4 años       │ 5%         │ 3 × SMN vigente
5 – 7 años       │ 11%        │ 3 × SMN vigente
8 – 10 años      │ 18%        │ 3 × SMN vigente
11 – 14 años     │ 26%        │ 3 × SMN vigente
15 – 19 años     │ 34%        │ 3 × SMN vigente
20 – 24 años     │ 42%        │ 3 × SMN vigente
25+ años         │ 50%        │ 3 × SMN vigente

⚠️ La base SIEMPRE es 3 × SMN, NO el salario real del empleado.
   Por eso dos personas con distinto sueldo pero la misma 
   antigüedad cobran el mismo bono.

SMN 2026 (verificar): Bs 2,500
Base de cálculo: 3 × 2,500 = Bs 7,500
Ejemplo: 6 años → 11% × 7,500 = Bs 825.00
```

## Tareas de la Fase 4.2

```text
[x] Crear js/config/tabla-bono-antiguedad.js
    → Exportar constante TABLA_BONO_ANTIGUEDAD con los tramos.
    → Función obtenerPorcentajeBono(aniosServicio): devuelve el %.
    → Función calcularBonoAntiguedad(aniosServicio, smnVigente): 
      devuelve el monto en Bs.
    → ⚠️ El ERP debe traer esta tabla como parámetro editable.
    → 🧠 Mini-Prompt para IA: "Genera la tabla del bono de 
      antigüedad en Bolivia según el DS 21060. Los tramos son 
      aproximadamente: 2-4 años (5%), 5-7 (11%), 8-10 (18%), 
      11-14 (26%), 15-19 (34%), 20-24 (42%), 25+ (50%). 
      La base de cálculo es 3 veces el Salario Mínimo Nacional, 
      NO el salario del empleado. Incluye una función JS que 
      calcule el bono dado años de servicio y SMN vigente."

[x] Crear js/modulos/catalogo-empleados.js
    → Clase CatalogoEmpleados con métodos CRUD.
    → crear(datos): valida y guarda un nuevo empleado.
    → obtenerTodos(filtros): lista empleados activos/inactivos.
    → obtenerPorId(id): busca uno específico.
    → obtenerPorCI(ci): busca por Cédula de Identidad.
    → calcularAntiguedad(empleado): años desde fechaIngreso.
    → actualizar(id, datos): modifica un registro.
    → retirar(id, motivo, fechaRetiro): marca como RETIRADO.

[x] Implementar calcularAntiguedad(empleado)
    → Calcula años y meses desde fechaIngreso hasta hoy.
    → Devuelve { anios, meses, dias }.
    → Este dato alimenta el bono de antigüedad y la indemnización.

[x] Implementar validarEmpleado(datos)
    → CI válido y único.
    → Salario base > 0.
    → Fecha de ingreso no futura.
    → Si tiene fecha de retiro, debe ser posterior al ingreso.

[x] Crear vistas/empleados.html
    → Formulario para agregar/editar empleados.
    → Tabla con lista de empleados activos.
    → Búsqueda por nombre o CI.
    → Botón "Retirar" que abre diálogo de motivo.
```

---

# FASE 4.3 — js/modulos/nomina.js: Cálculo Mensual

## ¿Qué hace esta fase?
Implementa el **cálculo de la planilla mensual** para todos los empleados activos. Es el proceso que se ejecuta una vez al mes (generalmente el último día hábil) y genera los devengados, deducciones y neto a pagar de cada empleado.

## Flujo del cálculo mensual

```text
┌──────────────────────────────────────────────────────────────┐
│                    CÁLCULO DE NÓMINA MENSUAL                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Obtener todos los empleados ACTIVOS                     │
│         ↓                                                    │
│  2. Para cada empleado:                                     │
│     ├── Calcular devengados (salario + extras + bono)       │
│     ├── Calcular deducciones (AFP + RC-IVA)                 │
│     ├── Calcular neto a pagar                               │
│     └── Calcular aportes patronales                         │
│         ↓                                                    │
│  3. Generar planilla resumen                                │
│         ↓                                                    │
│  4. Generar asientos contables (Módulo 3)                   │
│         ↓                                                    │
│  5. Generar comprobantes de pago individuales               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Tareas de la Fase 4.3

```text
[ ] Crear js/modulos/nomina.js
    → Clase ModuloNomina con métodos de cálculo.

[ ] Implementar calcularNominaMensual(periodo)
    → Obtiene todos los empleados activos.
    → Para cada uno, llama a calcularDevengados() y calcularDeducciones().
    → Genera la planilla mensual.
    → Devuelve objeto con todos los cálculos.

[ ] Implementar calcularDevengados(empleado)
    → Salario base.
    → Horas extras (si aplica):
      - Diurnas: 100% recargo sobre hora normal.
      - Nocturnas: 200% recargo.
      - Feriados: 300% recargo.
    → Comisiones (si aplica).
    → Bonificaciones (si aplica).
    → Bono de antigüedad (según tabla de la Fase 4.2).
    → Devuelve { salarioBase, horasExtras, comisiones, 
      bonificaciones, bonoAntiguedad, totalDevengado }.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que calcule 
      los devengados de un empleado boliviano. Incluye: salario 
      base, horas extras (diurnas 100% recargo, nocturnas 200%, 
      feriados 300%), comisiones, bonificaciones, y bono de 
      antigüedad (porcentaje según años de servicio × 3 SMN). 
      Devuelve un objeto desglosado con cada concepto y el total."

[ ] Implementar calcularDeducciones(empleado, totalDevengado)
    → Aporte laboral AFP / Gestora: 10% del total devengado.
    → RC-IVA: 13% del total devengado, MENOS las facturas 
      de gastos personales presentadas por el empleado.
    → Si el empleado presenta facturas suficientes → RC-IVA = 0.
    → Devuelve { aporteAFP, rcIVA, totalDeducciones }.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que calcule 
      las deducciones de un empleado boliviano. El aporte laboral 
      a la AFP/Gestora es 10% del total devengado. El RC-IVA es 
      13% del total devengado, PERO se compensa con facturas de 
      gastos personales presentadas por el empleado. Si las 
      facturas cubren el 13%, el RC-IVA es 0. Devuelve objeto 
      desglosado."

[ ] Implementar calcularNetoAPagar(totalDevengado, totalDeducciones)
    → Neto = Total Devengado − Total Deducciones.
    → Redondear a 2 decimales.

[ ] Implementar calcularAportesPatronales(empleado, totalDevengado)
    → Salud (Gestora Pública): ~10% del total devengado.
    → AFP / Gestora largo plazo: ~10% del total devengado.
    → Seguro de Riesgo del Trabajo: según actividad (usar 2% por defecto).
    → Devuelve { salud, afp, riesgoLaboral, totalPatronal }.
    → ⚠️ Los aportes patronales los paga la EMPRESA, no se 
      descuentan al empleado. Son un costo adicional.

[ ] Implementar generarPlanillaResumen(periodo)
    → Tabla resumen de todos los empleados del período.
    → Columnas: Empleado, Devengado, Deducciones, Neto, Costo Empresa.
    → Fila de totales al final.
    → Este resumen es la base para el asiento contable.
```

---

# FASE 4.4 — Aguinaldo de Navidad y Segundo Aguinaldo

## ¿Qué hace esta fase?
Implementa el cálculo del **aguinaldo de Navidad** (obligatorio, siempre) y el **segundo aguinaldo "Esfuerzo por Bolivia"** (condicional, solo si el PIB creció más de 4.5%). Ambos se pagan en diciembre, antes del día 20.

## Reglas del aguinaldo

```text
AGUINALDO DE NAVIDAD (obligatorio, siempre):
─────────────────────────────────────────────────
• Monto: 1 mes del "total ganado" (promedio últimos 3 meses).
• Pago: antes del 20 de diciembre.
• Proporcional: si trabajó menos de 1 año, se paga proporcional.
• Provisión: se acumula 1/12 cada mes desde enero.
• Asiento mensual de provisión:
    Gasto de Aguinaldo              Bs X    (Debe)
        Aguinaldo por Pagar                 Bs X    (Haber)

SEGUNDO AGUINALDO "ESFUERZO POR BOLIVIA" (condicional):
─────────────────────────────────────────────────
• Creado por: Decreto Supremo N° 1802 (20/11/2013).
• Condición: solo si el INE confirma que el PIB creció > 4.5% 
  en el período julio-junio.
• Monto: 1 mes adicional del "total ganado".
• Pago: también antes del 20 de diciembre, junto con el de Navidad.
• Se activó para: 2013, 2014, 2015, 2018.
• NO se ha vuelto a activar desde 2018.
• ⚠️ NO programar como automático. Debe ser un botón que 
  RRHH activa solo cuando el Gobierno confirma el umbral.

PROVISIÓN MENSUAL (para ambos):
─────────────────────────────────────────────────
• Aguinaldo de Navidad: 1/12 del estimado anual (siempre).
• Segundo aguinaldo: 1/12 del estimado (solo si está activado).
• El ERP debe tener un toggle: "Segundo aguinaldo activado: SÍ/NO".
```

## Tareas de la Fase 4.4

```text
[ ] Implementar calcularAguinaldoNavidad(empleado, periodo)
    → Calcula el promedio del total ganado de los últimos 3 meses.
    → Si el empleado trabajó menos de 1 año → proporcional.
    → Fórmula: (mes1 + mes2 + mes3) ÷ 3 × (meses trabajados ÷ 12).
    → Devuelve el monto del aguinaldo.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que calcule 
      el aguinaldo de Navidad en Bolivia. Es 1 mes del 'total 
      ganado' (promedio de los últimos 3 meses). Si el empleado 
      trabajó menos de 1 año, es proporcional: (promedio × meses 
      trabajados ÷ 12). Incluye la provisión mensual: 1/12 del 
      estimado anual."

[ ] Implementar calcularSegundoAguinaldo(empleado, periodo)
    → Solo se ejecuta si el toggle "segundoAguinaldoActivado" es true.
    → Mismo cálculo que el aguinaldo de Navidad (1 mes adicional).
    → Si el toggle está desactivado → devuelve 0.
    → ⚠️ NO debe ser automático. RRHH lo activa manualmente.

[ ] Implementar provisionAguinaldoMensual(empleado, periodo)
    → Calcula 1/12 del aguinaldo estimado anual.
    → Genera el asiento de provisión:
      Gasto de Aguinaldo / Aguinaldo por Pagar.
    → Si segundo aguinaldo activado → provisiona 2/12.

[ ] Implementar pagarAguinaldo(empleado, periodo)
    → Se ejecuta en diciembre (antes del día 20).
    → Calcula el monto final del aguinaldo.
    → Genera el asiento de pago:
      Aguinaldo por Pagar / Bancos.
    → Verifica que la provisión acumulada sea suficiente.

[ ] Implementar toggleSegundoAguinaldo(activado)
    → Función que RRHH usa para activar/desactivar.
    → Guarda el estado en localStorage.
    → Si se activa en noviembre → provisiona retroactivo 
      de los meses anteriores del año.
    → 🧠 Mini-Prompt para IA: "Escribe un toggle en JS para 
      activar/desactivar el segundo aguinaldo en Bolivia. 
      Cuando se activa (normalmente en noviembre cuando el 
      Gobierno confirma PIB > 4.5%), debe calcular la provisión 
      retroactiva de los meses anteriores del año. Cuando está 
      desactivado, la provisión mensual es solo 1/12 del 
      aguinaldo de Navidad."
```

---

# FASE 4.5 — Bono de Antigüedad (3 SMN)

## ¿Qué hace esta fase?
Implementa el cálculo del **bono de antigüedad** — un beneficio social que se paga mensualmente a todos los empleados con más de 2 años de servicio. La base de cálculo es **3 veces el Salario Mínimo Nacional**, no el salario real del empleado.

## Lógica del cálculo

```text
PASO 1: Obtener años de servicio del empleado
  fechaIngreso: 2020-03-01
  fechaActual: 2026-09-15
  antiguedad: 6 años, 6 meses

PASO 2: Buscar el porcentaje en la tabla
  6 años → tramo 5-7 años → 11%

PASO 3: Calcular la base
  SMN vigente: Bs 2,500
  Base: 3 × 2,500 = Bs 7,500

PASO 4: Calcular el bono
  Bono = 11% × 7,500 = Bs 825.00

⚠️ IMPORTANTE: Dos empleados con distinto salario pero la misma 
   antigüedad cobran el MISMO bono, porque la base es 3 SMN, 
   no el salario real.
```

## Tareas de la Fase 4.5

```text
[ ] Implementar calcularBonoAntiguedad(empleado)
    → Obtiene la antigüedad del empleado.
    → Busca el porcentaje en la tabla (Fase 4.2).
    → Calcula: porcentaje × (3 × SMN vigente).
    → Si antigüedad < 2 años → bono = 0.
    → Devuelve { porcentaje, base, montoBono }.

[ ] Implementar provisionBonoAntiguedadMensual(empleado)
    → El bono se paga mensualmente con el salario.
    → Pero la empresa debe provisionar su costo.
    → Genera el asiento de provisión:
      Gasto de Bono de Antigüedad / Bono por Pagar.
    → Este asiento ya se genera en Módulo 3, aquí se calcula el monto.

[ ] Implementar actualizarSMN(nuevoSMN)
    → Función para actualizar el Salario Mínimo Nacional.
    → Cuando el Gobierno cambia el SMN (generalmente en mayo),
      todos los bonos de antigüedad se recalculan.
    → Recalcula el bono de todos los empleados activos.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que 
      actualice el Salario Mínimo Nacional en un ERP boliviano. 
      Cuando cambia el SMN, debe recalcular automáticamente 
      el bono de antigüedad de todos los empleados activos 
      (porque la base es 3 × SMN). Incluye validación de que 
      el nuevo SMN sea mayor al anterior."

[ ] Crear docs/aprendizaje/15-bono-antiguedad-explicado.md
    → Explicar con ejemplos numéricos.
    → Mostrar por qué la base es 3 SMN y no el salario real.
    → Incluir la tabla de porcentajes por tramos.
    → 🧠 Mini-Prompt para IA: "Explica el bono de antigüedad 
      en Bolivia con ejemplos numéricos. La base es 3 veces 
      el Salario Mínimo Nacional (no el salario del empleado). 
      Muestra dos empleados con salarios distintos (Bs 3,000 
      y Bs 10,000) pero la misma antigüedad (8 años → 18%), 
      y demuestra que ambos cobran el mismo bono. Incluye 
      la tabla completa de tramos."
```

---

# FASE 4.6 — Indemnización y Desahucio

## ¿Qué hace esta fase?
Implementa el cálculo de la **indemnización por tiempo de servicio** y el **desahucio**. La indemnización es la particularidad más única de Bolivia: **aplica también a renuncia voluntaria**, no solo a despido.

## Indemnización por tiempo de servicio

```text
REGLAS:
─────────────────────────────────────────────────
• Monto: 1 mes del "total ganado" (promedio últimos 3 meses) 
  POR CADA AÑO de servicio, proporcional por fracción.
• SIN TOPE (no hay límite de años).
• Aplica a partir de 90 días de trabajo continuo.
• Se provisiona mes a mes como obligación acumulada.
• Se paga al momento del retiro (renuncia o despido).

⚠️ PARTICULARIDAD BOLIVIANA:
─────────────────────────────────────────────────
• En la mayoría de países, la indemnización solo aplica 
  a despido injustificado.
• En Bolivia, aplica TAMBIÉN A RENUNCIA VOLUNTARIA.
• Base legal: DS 28699, confirmado por el Tribunal 
  Constitucional Plurinacional.
• Un ERP que solo provisione indemnización en "despido" 
  está MAL PARAMETRIZADO.

EJEMPLO:
─────────────────────────────────────────────────
Empleado: Juan Carlos Mamani
Salario promedio últimos 3 meses: Bs 6,375
Antigüedad: 6 años, 6 meses

Indemnización = 6.5 × Bs 6,375 = Bs 41,437.50

Si renuncia → recibe Bs 41,437.50
Si lo despiden → recibe Bs 41,437.50
(Mismo monto, sin importar el motivo)
```

## Desahucio (falta de preaviso)

```text
REGLAS:
─────────────────────────────────────────────────
• Monto: 3 meses de salario.
• Aplica cuando el empleador NO avisa el retiro con 
  90 días de anticipación.
• Es ADICIONAL a la indemnización, no la reemplaza.
• Base legal: DS 22138.

EJEMPLO:
─────────────────────────────────────────────────
Empleado despedido sin preaviso de 90 días:
  Salario mensual: Bs 6,375
  Desahucio: 3 × Bs 6,375 = Bs 19,125
  Indemnización (6.5 años): Bs 41,437.50
  TOTAL A PAGAR: Bs 60,562.50
```

## Tareas de la Fase 4.6

```text
[ ] Implementar calcularIndemnizacion(empleado)
    → Calcula el promedio del total ganado de los últimos 3 meses.
    → Calcula la antigüedad en años (con fracción).
    → Indemnización = promedio × antigüedad.
    → Si antigüedad < 90 días → indemnización = 0.
    → NO aplica tope (sin límite de años).
    → Devuelve { promedioSalario, antiguedad, montoIndemnizacion }.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que calcule 
      la indemnización por tiempo de servicio en Bolivia. Es 1 mes 
      del 'total ganado' (promedio últimos 3 meses) por cada año 
      de servicio, proporcional por fracción, SIN TOPE. Aplica 
      a partir de 90 días. IMPORTANTE: aplica también a renuncia 
      voluntaria (DS 28699), no solo a despido. Devuelve objeto 
      desglosado."

[ ] Implementar calcularDesahucio(empleado, tienePreaviso)
    → Si tienePreaviso es false → desahucio = 3 × salario mensual.
    → Si tienePreaviso es true → desahucio = 0.
    → Es adicional a la indemnización.

[ ] Implementar calcularLiquidacion(empleado, motivoRetiro)
    → Calcula todo lo que se le debe pagar al retiro:
      - Salario pendiente del mes.
      - Vacaciones no gozadas.
      - Indemnización (siempre, si > 90 días).
      - Desahucio (si es despido sin preaviso).
      - Aguinaldo proporcional del año en curso.
    → Devuelve el desglose completo.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que calcule 
      la liquidación completa de un empleado boliviano al retiro. 
      Incluye: salario pendiente, vacaciones no gozadas, 
      indemnización por tiempo de servicio (aplica a renuncia 
      también), desahucio (si es despido sin preaviso de 90 días), 
      y aguinaldo proporcional del año en curso. Devuelve desglose 
      completo con cada concepto y el total."

[ ] Implementar provisionIndemnizacionMensual(empleado)
    → Calcula 1/12 de la indemnización acumulada.
    → Genera el asiento de provisión:
      Gasto de Indemnización / Indemnización por Pagar.
    → Se acumula mes a mes durante toda la relación laboral.

[ ] Implementar registrarRetiro(empleadoId, motivoRetiro, fechaRetiro)
    → Marca al empleado como RETIRADO.
    → Calcula la liquidación completa.
    → Genera los asientos contables de la liquidación.
    → Motivos: RENUNCIA, DESPIDO, JUBILACION, MUTUO_ACUERDO.
    → ⚠️ En TODOS los motivos (excepto jubilación) se paga 
      indemnización si antigüedad > 90 días.

[ ] Crear docs/aprendizaje/16-indemnizacion-boliviana.md
    → Explicar la particularidad de la indemnización en renuncia.
    → Incluir referencias legales (DS 28699, Tribunal Constitucional).
    → Mostrar ejemplos numéricos de renuncia vs. despido.
    → 🧠 Mini-Prompt para IA: "Explica la indemnización por 
      tiempo de servicio en Bolivia, enfatizando que aplica 
      TAMBIÉN a renuncia voluntaria (DS 28699, confirmado por 
      el Tribunal Constitucional Plurinacional). Muestra un 
      ejemplo numérico comparando renuncia vs. despido sin 
      preaviso (donde se agrega el desahucio de 3 meses). 
      Explica que un ERP que solo provisiona indemnización 
      en 'despido' está mal parametrizado."
```

---

# FASE 4.7 — RC-IVA y Compensación con Facturas

## ¿Qué hace esta fase?
Implementa el **RC-IVA (Régimen Complementario al IVA)** para empleados. En Bolivia, los empleados no pagan un impuesto a la renta personal como tal, sino el RC-IVA del 13%, que pueden **compensar presentando facturas de gastos personales**.

## Lógica del RC-IVA

```text
CÁLCULO DEL RC-IVA:
─────────────────────────────────────────────────
1. Calcular el 13% del total devengado.
   Ejemplo: 13% × Bs 6,375 = Bs 828.75

2. El empleado presenta facturas de gastos personales.
   Cada factura tiene un IVA incluido.
   Para extraer el IVA: monto factura ÷ 1.13 → neto
   IVA de la factura = monto factura − neto

3. Sumar el IVA de todas las facturas presentadas.
   Ejemplo: facturas con IVA total de Bs 828.75

4. Compensar: RC-IVA a pagar = 13% devengado − IVA facturas.
   Si IVA facturas ≥ 13% devengado → RC-IVA = 0
   Si IVA facturas < 13% devengado → paga la diferencia

EJEMPLO:
─────────────────────────────────────────────────
Empleado: Juan Carlos Mamani
Total devengado: Bs 6,375
RC-IVA teórico: 13% × 6,375 = Bs 828.75

Facturas presentadas:
  Factura supermercado: Bs 2,000 → IVA: 2,000 - 2,000/1.13 = Bs 230.09
  Factura farmacia: Bs 1,500 → IVA: 1,500 - 1,500/1.13 = Bs 172.57
  Factura restaurante: Bs 3,500 → IVA: 3,500 - 3,500/1.13 = Bs 402.65
  ─────────────────────────────────────────────────
  Total IVA facturas: Bs 805.31

RC-IVA a pagar: 828.75 − 805.31 = Bs 23.44
(El empleado solo paga Bs 23.44 de RC-IVA)
```

## Tareas de la Fase 4.7

```text
[ ] Implementar calcularRCIVA(empleado, totalDevengado)
    → Calcula el 13% del total devengado.
    → Devuelve el monto teórico del RC-IVA.

[ ] Implementar registrarFacturasGastosPersonales(empleadoId, facturas)
    → Registra las facturas que el empleado presenta para compensar.
    → Valida que cada factura tenga NIT y CUF válidos.
    → Calcula el IVA de cada factura (monto − monto/1.13).
    → Suma el IVA total de las facturas.
    → 🧠 Mini-Prompt para IA: "Escribe una función JS que registre 
      facturas de gastos personales de un empleado boliviano para 
      compensar el RC-IVA. Cada factura tiene un monto total con 
      IVA incluido. El IVA se extrae con: monto − (monto ÷ 1.13). 
      Valida que el NIT y CUF de cada factura sean válidos. 
      Devuelve el IVA total acumulable para compensación."

[ ] Implementar calcularRCIVAPagar(empleado, totalDevengado)
    → Calcula el RC-IVA teórico (13% del devengado).
    → Resta el IVA acumulado de las facturas presentadas.
    → Si el resultado es negativo → RC-IVA = 0 (no se devuelve).
    → Devuelve { rcIVATeorico, ivaFacturas, rcIVAPagar }.

[ ] Implementar resetearFacturasMensuales(empleadoId)
    → Al inicio de cada mes, se reinicia el acumulado de facturas.
    → Las facturas del mes anterior no se arrastran.
    → Genera un log de las facturas usadas el mes anterior.

[ ] Crear vista parcial en nomina.html
    → Sección "Facturas de Gastos Personales" por empleado.
    → Formulario para agregar facturas (NIT, CUF, monto).
    → Muestra el IVA extraído de cada factura.
    → Muestra el RC-IVA resultante después de compensar.
```

---

# FASE 4.8 — Generación de Asientos Contables de Nómina

## ¿Qué hace esta fase?
Genera los **asientos contables** que el Motor Contable (Módulo 3) procesará. Cada mes se genera el asiento de la planilla, y las provisiones de aguinaldo, bono de antigüedad e indemnización.

## Asientos que se generan

```text
ASIENTO DE NÓMINA MENSUAL:
─────────────────────────────────────────────────
  Gastos de Nómina (devengados)     Bs 50,000  (Debe)
      Aportes Patronales Salud              Bs 5,000  (Haber)
      Aportes Patronales AFP                Bs 5,000  (Haber)
      Seguro Riesgo por Pagar               Bs 1,000  (Haber)
      RC-IVA por Pagar (si aplica)          Bs 2,000  (Haber)
      Nómina por Pagar (neto)               Bs 37,000  (Haber)

ASIENTO DE PROVISIÓN DE AGUINALDO (mensual):
─────────────────────────────────────────────────
  Gasto de Aguinaldo                Bs 4,167   (Debe)
      Aguinaldo por Pagar                   Bs 4,167   (Haber)

ASIENTO DE PROVISIÓN DE BONO ANTIGÜEDAD (mensual):
─────────────────────────────────────────────────
  Gasto de Bono de Antigüedad       Bs 2,500   (Debe)
      Bono de Antigüedad por Pagar          Bs 2,500   (Haber)

ASIENTO DE PROVISIÓN DE INDEMNIZACIÓN (mensual):
─────────────────────────────────────────────────
  Gasto de Indemnización            Bs 1,000   (Debe)
      Indemnización por Pagar               Bs 1,000   (Haber)

ASIENTO DE PAGO DE NÓMINA:
─────────────────────────────────────────────────
  Nómina por Pagar                  Bs 37,000  (Debe)
      Bancos                                Bs 37,000  (Haber)

ASIENTO DE LIQUIDACIÓN POR RETIRO:
─────────────────────────────────────────────────
  Indemnización por Pagar           Bs 41,437  (Debe)
  Desahucio por Pagar (si aplica)   Bs 19,125  (Debe)
  Aguinaldo por Pagar (proporcional) Bs 3,000  (Debe)
      Bancos                                Bs 63,562  (Haber)
```

## Tareas de la Fase 4.8

```text
[ ] Implementar generarAsientoNomina(planilla)
    → Genera el asiento de la planilla mensual.
    → Debe: Gastos de Nómina (total devengados).
    → Haber: Aportes patronales, RC-IVA, Nómina por Pagar.
    → Verifica que Debe = Haber.

[ ] Implementar generarAsientoPagoNomina(planilla)
    → Genera el asiento de pago:
      Nómina por Pagar / Bancos.
    → Se ejecuta cuando tesorería paga la planilla.

[ ] Implementar generarAsientoLiquidacion(empleado, liquidacion)
    → Genera el asiento de liquidación por retiro.
    → Debe: Indemnización, Desahucio, Aguinaldo proporcional.
    → Haber: Bancos.
    → Verifica que las provisiones acumuladas sean suficientes.

[ ] Conectar con el Motor Contable (Módulo 3)
    → Los asientos generados se guardan en "asientosPendientes".
    → El Motor Contable los procesa y valida la partida doble.
    → Verificar que los asientos aparecen en el Libro Diario.
```

---

# FASE 4.9 — Vista de Nómina (Planilla + Provisiones)

## ¿Qué hace esta fase?
Construye las **pantallas** donde el usuario gestiona la nómina: planilla mensual, provisiones, facturas de RC-IVA, y liquidaciones por retiro.

## Tareas de la Fase 4.9

```text
[ ] Crear vistas/nomina.html
    → Secciones:
      ├── <h1> Nómina y Recursos Humanos
      ├── <div class="tabs">
      │   ├── Planilla Mensual
      │   ├── Empleados
      │   ├── Provisiones
      │   ├── Facturas RC-IVA
      │   └── Liquidaciones
      ├── <div id="contenido-tab">
      └── <table> para listar registros

[ ] Crear js/vistas/nomina-vista.js
    → Lógica de la vista de nómina.
    → Manejar cambio de tabs.
    → Formulario de planilla mensual (botón "Calcular Nómina").
    → Tabla de empleados con búsqueda.
    → Vista de provisiones acumuladas por empleado.
    → Formulario de facturas de gastos personales.
    → Formulario de liquidación por retiro.

[ ] Implementar la vista de planilla mensual
    → Botón "Calcular Nómina del Mes".
    → Tabla con todos los empleados: Devengado, Deducciones, Neto.
    → Fila de totales al final.
    → Botón "Generar Asientos" que crea los asientos contables.

[ ] Implementar la vista de provisiones
    → Tabla por empleado: Aguinaldo acumulado, Bono acumulado, 
      Indemnización acumulada.
    → Totales de la empresa.
    → Alerta si algún empleado tiene provisión insuficiente.

[ ] Implementar la vista de liquidación
    → Formulario: seleccionar empleado, motivo de retiro, fecha.
    → Botón "Calcular Liquidación".
    → Muestra el desglose: indemnización, desahucio, aguinaldo.
    → Botón "Registrar Retiro" que genera los asientos.

[ ] Conectar con el menú lateral
    → Agregar enlace "👥 Nómina" en index.html.
    → Verificar que el enrutador carga vistas/nomina.html.
```

---

# FASE 4.10 — Smoke Test Final y Commit de Cierre

## Checklist de humo (smoke test)

```text
[ ] Smoke test #1: Calcular la planilla mensual
    → Ejecutar window.ModuloNomina.calcularNominaMensual("2026-09")
    → Verificar que todos los empleados activos aparecen
    → Verificar que los devengados incluyen salario + bono antigüedad
    → Verificar que las deducciones incluyen AFP 10% + RC-IVA

[ ] Smoke test #2: Verificar el bono de antigüedad
    → Empleado con 6 años de antigüedad → bono = 11% × 3 SMN
    → Empleado con 1 año de antigüedad → bono = 0
    → Dos empleados con distinta salario pero misma antigüedad 
      → mismo bono

[ ] Smoke test #3: Verificar la provisión de aguinaldo
    → Ejecutar la provisión mensual
    → Verificar que se acumula 1/12 del estimado
    → Verificar que el asiento contable se generó

[ ] Smoke test #4: Verificar el segundo aguinaldo condicional
    → Con toggle desactivado → provisión es solo 1/12
    → Activar el toggle → provisión pasa a 2/12
    → Desactivar → vuelve a 1/12

[ ] Smoke test #5: Calcular indemnización en renuncia
    → Registrar retiro con motivo "RENUNCIA"
    → Verificar que la indemnización se calcula 
      (NO debe ser 0 por ser renuncia)
    → Verificar que el desahucio es 0 (no aplica en renuncia)

[ ] Smoke test #6: Calcular liquidación con despido sin preaviso
    → Registrar retiro con motivo "DESPIDO" y preaviso = false
    → Verificar que se calcula indemnización + desahucio (3 meses)
    → Verificar que el total es la suma de ambos

[ ] Smoke test #7: Compensar RC-IVA con facturas
    → Registrar facturas de gastos personales para un empleado
    → Verificar que el IVA de las facturas se extrae correctamente
    → Verificar que el RC-IVA a pagar disminuye
    → Si las facturas cubren el 13% → RC-IVA = 0

[ ] Smoke test #8: Persistencia
    → Recargar la página (F5)
    → La planilla, provisiones y liquidaciones deben seguir ahí
    → Abrir DevTools → LocalStorage → verificar colecciones

[ ] Commit de cierre del Módulo 4
    → git add .
    → git commit -m "feat(modulo-4): Nómina Boliviana completa
    
      - Cálculo de planilla mensual (devengados, deducciones, neto)
      - Aguinaldo de Navidad + Segundo Aguinaldo condicional
      - Bono de antigüedad sobre 3 SMN (tabla de tramos)
      - Indemnización aplicable a renuncia voluntaria (DS 28699)
      - Desahucio por falta de preaviso (DS 22138)
      - RC-IVA compensable con facturas de gastos personales
      - Generación automática de asientos contables
      - Provisiones mensuales: aguinaldo, bono, indemnización
      - Smoke test: todos los tests pasan
      
      Próximo paso: Módulo 5 - Impuestos (IVA, IT, IUE)"
```

---

## 🎯 Criterios de Aceptación del Módulo 4

El Módulo 4 se considera **completado** cuando:

- [x] La planilla mensual calcula correctamente devengados y deducciones
- [x] El bono de antigüedad usa la base de 3 SMN (no el salario real)
- [x] El aguinaldo de Navidad se provisiona 1/12 cada mes
- [x] El segundo aguinaldo es condicional (toggle manual)
- [x] La indemnización se calcula también en renuncia voluntaria
- [x] El desahucio solo aplica en despido sin preaviso de 90 días
- [x] El RC-IVA se compensa con facturas de gastos personales
- [x] Los asientos contables se generan y procesan correctamente
- [x] Las provisiones se acumulan mes a mes
- [x] Se puede explicar en 5 minutos las particularidades bolivianas

---

## 📚 Material de Exposición Generado en Este Módulo

| Archivo | Contenido | Uso en exposición |
|---|---|---|
| `13-nomina-boliviana-explicada.md` | Teoría de la nómina | Abrir la explicación |
| `14-particularidades-bolivianas.md` | 5 particularidades únicas | Demostrar conocimiento |
| `15-bono-antiguedad-explicado.md` | Bono sobre 3 SMN | Ejemplo numérico |
| `16-indemnizacion-boliviana.md` | Indemnización en renuncia | Caso único boliviano |

---

## 🚀 Próximos Módulos (adelanto)

| Módulo | Tema | Duración | Depende de |
|---|---|---|---|
| **Módulo 5** | Capa 2 — Impuestos (IVA, IT, IUE) | 6–8 h | Módulo 3 |
| **Módulo 6** | Capa 4 — Estados Financieros | 5–7 h | Módulo 5 |
| **Módulo 7** | Capa 5 — Cumplimiento SIN | 4–6 h | Módulo 6 |
| **Módulo 8** | Migración a SaaS real (opcional) | 10–15 h | Módulo 7 |

---

## ⚠️ Advertencia final

La tentación aquí es **tratar la indemnización como un gasto solo en caso de despido**. *"Total, en la práctica nadie renuncia y cobra indemnización"*. **No lo hagas.** La indemnización en renuncia voluntaria es **la particularidad más distintiva** de la legislación laboral boliviana. En una exposición, poder decir *"este ERP provisiona indemnización para todos los empleados activos mes a mes, porque en Bolivia la indemnización aplica incluso si el empleado renuncia voluntariamente — esto lo confirmó el Tribunal Constitucional Plurinacional"* es lo que separa un prototipo genérico de uno que realmente entiende Bolivia. Dedica tiempo a que la lógica de liquidación maneje correctamente todos los motivos de retiro (renuncia, despido, jubilación, mutuo acuerdo) con las reglas específicas de cada uno.

---

**¿Siguiente paso?** Cuando completes este Módulo 4, avísame y generamos el **ROADMAP_MODULO_5_IMPUESTOS.md** con el mismo formato. 🚀
