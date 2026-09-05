# ADR-001: Stack Vanilla JS sin Backend

**Fecha:** 2026-09-05
**Estado:** ✅ Aceptado
**Decisor:** Equipo de desarrollo

## Contexto

Necesitamos construir un ERP contable educativo adaptado a la legislación
boliviana. El objetivo principal es **comprender el dominio contable y
tributario**, no demostrar dominio de frameworks complejos. El proyecto
debe ser:

- Rápido de construir (un solo desarrollador).
- Fácil de explicar en una exposición.
- Fácil de mantener por alguien que recién aprende.
- Funcional sin necesidad de servidor ni base de datos real.

## Decisión

Usar **Vanilla JavaScript (ES6+) + HTML5 + CSS3 + LocalStorage**.

- **Sin frameworks frontend:** No React, no Vue, no Angular, no Svelte.
- **Sin backend:** No Node.js, no Express, no Django.
- **Sin base de datos real:** LocalStorage del navegador como persistencia.
- **Sin build tools complejos:** No webpack, no Vite (por ahora).

## Consecuencias

### Positivas
- ✅ Curva de aprendizaje mínima: solo HTML, CSS y JS puro.
- ✅ Cero configuración: abrir `index.html` y funciona.
- ✅ Fácil de depurar: las DevTools del navegador muestran todo.
- ✅ El enfoque está en el dominio contable, no en la tecnología.
- ✅ Funciona offline (una vez cargado en el navegador).
- ✅ Portátil: se puede llevar en un USB y abrir en cualquier PC.

### Negativas
- ❌ La "base de datos" vive en el navegador del usuario.
- ❌ No hay persistencia entre dispositivos ni entre navegadores.
- ❌ No hay multi-usuario ni autenticación.
- ❌ Si el usuario limpia el caché, pierde todos los datos.
- ❌ No se puede conectar al SIN real (requiere backend).

### Mitigación
- Para datos de ejemplo: se cargan desde `datos/ejemplo.json`.
- Para exportar: se puede agregar un botón "Exportar datos" que
  descargue el LocalStorage como JSON.
- Para el SaaS real: se migra en el **Módulo 8** (backend + DB).

## Alternativas Descartadas

| Alternativa | Por qué se descartó |
|---|---|
| React + Node + PostgreSQL | Demasiada complejidad para prototipo educativo. El tiempo se iría en configurar el stack, no en entender contabilidad. |
| Vue + Firebase | Similar a React: la curva de aprendizaje del framework distraería del dominio contable. |
| Excel / Google Sheets | Sin trazabilidad, sin validaciones automáticas, sin partida doble. No demuestra habilidad técnica. |
| Frameworks PHP (Laravel) | Requiere servidor local (XAMPP), configuración de PHP, curva de aprendizaje alta. |
| Python + Flask | Similar a PHP: requiere entorno de ejecución, no funciona con solo abrir un HTML. |

## Referencias

- Guía técnica del ERP (Sección 2: Arquitectura General).
- ROADMAP_MODULO_0_SETUP.md (Fase 0.1).
- ROADMAP_MODULO_8_MIGRACION_SAAS.md (migración futura).
