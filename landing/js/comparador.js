// ══════════════════════════════════════════════════════════════
// COMPARADOR.JS — Demo interactiva FIFO/LIFO/Promedio (Fase 6)
// Versión básica para Fase 1, se completa en Fase 6
// ══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  renderizarComparadorPlaceholder();
});

function renderizarComparadorPlaceholder() {
  const contenedor = document.getElementById('comparador-contenido');
  if (!contenedor) return;

  contenedor.innerHTML = `
    <div class="card card-oscura texto-centrado" style="padding: var(--espacio-xl);">
      <h3 style="color: var(--texto-claro); margin-bottom: var(--espacio-sm);">
        🧪 Demo Interactiva
      </h3>
      <p style="color: var(--texto-en-oscuro); margin-bottom: var(--espacio-md);">
        El comparador de métodos de valuación (FIFO / LIFO / Promedio)
        se implementará en la <strong>Fase 6</strong>.
      </p>
      <p style="color: var(--texto-en-oscuro); font-size: var(--texto-sm);">
        Podrás simular compras y ventas en vivo y ver cómo cambia
        la utilidad, el IUE y el inventario con cada método.
      </p>
      <div class="comparador-grid mt-lg">
        <div class="metodo-card promedio">
          <div class="metodo-nombre">📘 PROMEDIO</div>
          <div class="metodo-estado">✅ Aceptado por SIN y NIIF</div>
          <p style="font-size: var(--texto-sm); color: var(--texto-secundario);">
            Costo promedio ponderado de todas las capas
          </p>
        </div>
        <div class="metodo-card fifo">
          <div class="metodo-nombre">📗 FIFO (PEPS)</div>
          <div class="metodo-estado">✅ Aceptado por SIN y NIIF</div>
          <p style="font-size: var(--texto-sm); color: var(--texto-secundario);">
            Primeras en entrar, primeras en salir
          </p>
        </div>
        <div class="metodo-card lifo">
          <div class="metodo-nombre">📕 LIFO (UEPS)</div>
          <div class="metodo-estado">❌ Prohibido por NIIF y SIN</div>
          <p style="font-size: var(--texto-sm); color: var(--texto-secundario);">
            Solo educativo: muestra por qué se prohibió
          </p>
        </div>
      </div>
    </div>
  `;
}
