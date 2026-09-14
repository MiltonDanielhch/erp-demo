// ══════════════════════════════════════════════════════════════
// COMPARADOR.JS — Demo interactiva FIFO/LIFO/Promedio (Fase 6)
// La joya didáctica del Módulo 8
// ══════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────
// ESTADO DEL SIMULADOR
// ────────────────────────────────────────────────────────────────
const SimuladorInventario = {
  compras: [],  // { cantidad, costoUnitario, total }
  ventas: [],   // { cantidad, precioUnitario, total }

  // Agregar una compra al inventario
  agregarCompra(cantidad, costoUnitario) {
    cantidad = Number(cantidad);
    costoUnitario = Number(costoUnitario);

    if (cantidad <= 0 || costoUnitario < 0) {
      return { exito: false, error: 'Cantidad y costo deben ser positivos' };
    }

    this.compras.push({
      cantidad,
      costoUnitario,
      total: this._r2(cantidad * costoUnitario)
    });

    return { exito: true };
  },

  // Agregar una venta
  agregarVenta(cantidad, precioUnitario) {
    cantidad = Number(cantidad);
    precioUnitario = Number(precioUnitario);

    if (cantidad <= 0 || precioUnitario < 0) {
      return { exito: false, error: 'Cantidad y precio deben ser positivos' };
    }

    // Verificar que haya stock suficiente
    const totalComprado = this.compras.reduce((s, c) => s + c.cantidad, 0);
    const totalVendido = this.ventas.reduce((s, v) => s + v.cantidad, 0);
    const stockDisponible = totalComprado - totalVendido;

    if (cantidad > stockDisponible) {
      return {
        exito: false,
        error: `Stock insuficiente. Disponible: ${stockDisponible} unidades`
      };
    }

    this.ventas.push({
      cantidad,
      precioUnitario,
      total: this._r2(cantidad * precioUnitario)
    });

    return { exito: true };
  },

  // Resetear el simulador
  resetear() {
    this.compras = [];
    this.ventas = [];
  },

  // Calcular con método PROMEDIO PONDERADO
  calcularPromedio() {
    let totalCantidad = 0;
    let totalCosto = 0;

    // Construir el inventario promedio
    this.compras.forEach(c => {
      totalCantidad += c.cantidad;
      totalCosto += c.total;
    });

    const costoPromedio = totalCantidad > 0 ? totalCosto / totalCantidad : 0;

    // Costo de venta = unidades vendidas × costo promedio
    const unidadesVendidas = this.ventas.reduce((s, v) => s + v.cantidad, 0);
    const costoVenta = this._r2(unidadesVendidas * costoPromedio);

    // Ingreso total de ventas
    const ingresoVentas = this.ventas.reduce((s, v) => s + v.total, 0);

    // Inventario final
    const unidadesFinales = totalCantidad - unidadesVendidas;
    const inventarioFinal = this._r2(unidadesFinales * costoPromedio);

    return this._construirResultado(costoVenta, ingresoVentas, inventarioFinal, unidadesFinales);
  },

  // Calcular con método FIFO (Primeras en Entrar, Primeras en Salir)
  calcularFIFO() {
    // Crear capas de inventario (copiar para no mutar)
    const capas = this.compras.map(c => ({
      cantidad: c.cantidad,
      costoUnitario: c.costoUnitario
    }));

    let costoVenta = 0;
    let unidadesPorVender = this.ventas.reduce((s, v) => s + v.cantidad, 0);
    const ingresoVentas = this.ventas.reduce((s, v) => s + v.total, 0);

    // Consumir capas desde la más antigua
    while (unidadesPorVender > 0 && capas.length > 0) {
      const capa = capas[0]; // Primera capa (más antigua)

      if (capa.cantidad <= unidadesPorVender) {
        // Consumir toda la capa
        costoVenta += capa.cantidad * capa.costoUnitario;
        unidadesPorVender -= capa.cantidad;
        capas.shift(); // Eliminar la capa
      } else {
        // Consumir parcialmente
        costoVenta += unidadesPorVender * capa.costoUnitario;
        capa.cantidad -= unidadesPorVender;
        unidadesPorVender = 0;
      }
    }

    // Inventario final = capas restantes
    const inventarioFinal = capas.reduce((s, c) => s + c.cantidad * c.costoUnitario, 0);
    const unidadesFinales = capas.reduce((s, c) => s + c.cantidad, 0);

    return this._construirResultado(this._r2(costoVenta), ingresoVentas, this._r2(inventarioFinal), unidadesFinales);
  },

  // Calcular con método LIFO (Últimas en Entrar, Primeras en Salir)
  calcularLIFO() {
    // Crear capas de inventario (copiar para no mutar)
    const capas = this.compras.map(c => ({
      cantidad: c.cantidad,
      costoUnitario: c.costoUnitario
    }));

    let costoVenta = 0;
    let unidadesPorVender = this.ventas.reduce((s, v) => s + v.cantidad, 0);
    const ingresoVentas = this.ventas.reduce((s, v) => s + v.total, 0);

    // Consumir capas desde la más reciente
    while (unidadesPorVender > 0 && capas.length > 0) {
      const capa = capas[capas.length - 1]; // Última capa (más reciente)

      if (capa.cantidad <= unidadesPorVender) {
        // Consumir toda la capa
        costoVenta += capa.cantidad * capa.costoUnitario;
        unidadesPorVender -= capa.cantidad;
        capas.pop(); // Eliminar la capa
      } else {
        // Consumir parcialmente
        costoVenta += unidadesPorVender * capa.costoUnitario;
        capa.cantidad -= unidadesPorVender;
        unidadesPorVender = 0;
      }
    }

    // Inventario final = capas restantes
    const inventarioFinal = capas.reduce((s, c) => s + c.cantidad * c.costoUnitario, 0);
    const unidadesFinales = capas.reduce((s, c) => s + c.cantidad, 0);

    return this._construirResultado(this._r2(costoVenta), ingresoVentas, this._r2(inventarioFinal), unidadesFinales);
  },

  // Construir resultado con utilidad e IUE
  _construirResultado(costoVenta, ingresoVentas, inventarioFinal, unidadesFinales) {
    const utilidadBruta = this._r2(ingresoVentas - costoVenta);
    const iue = utilidadBruta > 0 ? this._r2(utilidadBruta * 0.25) : 0;

    return {
      costoVenta,
      ingresoVentas,
      utilidadBruta,
      iue,
      inventarioFinal,
      unidadesFinales
    };
  },

  // Redondear a 2 decimales
  _r2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }
};

// ────────────────────────────────────────────────────────────────
// RENDERIZADO DE LA INTERFAZ
// ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Precargar datos demo con 2 compras a precios DISTINTOS
  // para que FIFO ≠ Promedio ≠ LIFO sea visible desde el inicio
  SimuladorInventario.compras = [
    { cantidad: 50, costoUnitario: 40, total: 2000 },   // Compra barata (antigua)
    { cantidad: 50, costoUnitario: 80, total: 4000 }    // Compra cara (reciente)
  ];
  SimuladorInventario.ventas = [
    { cantidad: 60, precioUnitario: 100, total: 6000 }  // Venta de 60u
  ];

  renderizarComparador();
  actualizarComparador();  // ← Calcular resultados al cargar
});

function renderizarComparador() {
  const contenedor = document.getElementById('comparador-contenido');
  if (!contenedor) return;

  contenedor.innerHTML = `
    <div class="comparador-panel">
      <!-- Controles de entrada -->
      <div class="comparador-controles">
        <div class="comparador-control-grupo">
          <h4 class="comparador-control-titulo">📥 Agregar Compra</h4>
          <div class="comparador-inputs">
            <input type="number" id="compra-cantidad" class="input-comparador"
                   placeholder="Cantidad" min="1" value="100">
            <input type="number" id="compra-costo" class="input-comparador"
                   placeholder="Costo unit. Bs" min="0" step="0.01" value="50">
            <button id="btn-agregar-compra" class="btn btn-primario btn-pequenio">+ Compra</button>
          </div>
        </div>

        <div class="comparador-control-grupo">
          <h4 class="comparador-control-titulo">📤 Agregar Venta</h4>
          <div class="comparador-inputs">
            <input type="number" id="venta-cantidad" class="input-comparador"
                   placeholder="Cantidad" min="1" value="100">
            <input type="number" id="venta-precio" class="input-comparador"
                   placeholder="Precio unit. Bs" min="0" step="0.01" value="100">
            <button id="btn-agregar-venta" class="btn btn-secundario btn-pequenio">+ Venta</button>
          </div>
        </div>

        <div class="comparador-acciones">
          <button id="btn-resetear" class="btn btn-fantasma btn-pequenio" style="color: var(--texto-claro);">
            🔄 Resetear
          </button>
        </div>
      </div>

      <!-- Historial de movimientos -->
      <div class="comparador-historial" id="comparador-historial">
        <p style="color: var(--texto); font-size: var(--texto-sm);">
          Sin movimientos aún. Agrega compras y ventas para comparar.
        </p>
      </div>

      <!-- Resultados comparativos -->
      <div class="comparador-grid" id="comparador-resultados">
        ${renderizarMetodoVacio('PROMEDIO', '📘', '✅ Aceptado SIN/NIIF', 'info')}
        ${renderizarMetodoVacio('FIFO', '📗', '✅ Aceptado SIN/NIIF', 'exito')}
        ${renderizarMetodoVacio('LIFO', '📕', '❌ Prohibido NIC 2', 'error')}
      </div>

      <!-- Mensaje educativo -->
      <div class="comparador-mensaje" id="comparador-mensaje">
        <p>💡 Agrega compras y ventas para ver cómo el <strong>mismo inventario</strong>
        produce resultados diferentes según el método de valuación.</p>
      </div>
    </div>
  `;

  conectarEventosComparador();
}

function renderizarMetodoVacio(nombre, icono, estado, tipo) {
  return `
    <div class="metodo-card ${nombre.toLowerCase()}" data-metodo="${nombre}">
      <div class="metodo-nombre">${icono} ${nombre}</div>
      <div class="metodo-estado metodo-estado-${tipo}">${estado}</div>
      <div class="metodo-metrica"><span>Costo de venta:</span><span class="valor">—</span></div>
      <div class="metodo-metrica"><span>Utilidad bruta:</span><span class="valor">—</span></div>
      <div class="metodo-metrica"><span>IUE (25%):</span><span class="valor">—</span></div>
      <div class="metodo-metrica"><span>Inventario final:</span><span class="valor">—</span></div>
    </div>
  `;
}

// ────────────────────────────────────────────────────────────────
// EVENTOS DEL COMPARADOR
// ────────────────────────────────────────────────────────────────
function conectarEventosComparador() {
  const btnCompra = document.getElementById('btn-agregar-compra');
  const btnVenta = document.getElementById('btn-agregar-venta');
  const btnReset = document.getElementById('btn-resetear');

  btnCompra?.addEventListener('click', () => {
    const cantidad = document.getElementById('compra-cantidad').value;
    const costo = document.getElementById('compra-costo').value;
    const resultado = SimuladorInventario.agregarCompra(cantidad, costo);

    if (resultado.exito) {
      actualizarComparador();
    } else {
      mostrarErrorComparador(resultado.error);
    }
  });

  btnVenta?.addEventListener('click', () => {
    const cantidad = document.getElementById('venta-cantidad').value;
    const precio = document.getElementById('venta-precio').value;
    const resultado = SimuladorInventario.agregarVenta(cantidad, precio);

    if (resultado.exito) {
      actualizarComparador();
    } else {
      mostrarErrorComparador(resultado.error);
    }
  });

  btnReset?.addEventListener('click', () => {
    SimuladorInventario.resetear();
    actualizarComparador();
  });
}

function mostrarErrorComparador(mensaje) {
  const historial = document.getElementById('comparador-historial');
  if (historial) {
    historial.innerHTML = `<p style="color: var(--color-error); font-size: var(--texto-sm);">⚠️ ${mensaje}</p>`;
  }
}

// ────────────────────────────────────────────────────────────────
// ACTUALIZAR RESULTADOS
// ────────────────────────────────────────────────────────────────
function actualizarComparador() {
  // Actualizar historial
  actualizarHistorial();

  // Calcular con los 3 métodos
  const promedio = SimuladorInventario.calcularPromedio();
  const fifo = SimuladorInventario.calcularFIFO();
  const lifo = SimuladorInventario.calcularLIFO();

  // Renderizar resultados
  renderizarResultadoMetodo('PROMEDIO', promedio);
  renderizarResultadoMetodo('FIFO', fifo);
  renderizarResultadoMetodo('LIFO', lifo);

  // Mostrar mensaje educativo si hay datos
  if (SimuladorInventario.compras.length > 0 || SimuladorInventario.ventas.length > 0) {
    mostrarMensajeEducativo(promedio, fifo, lifo);
  }
}

function actualizarHistorial() {
  const historial = document.getElementById('comparador-historial');
  if (!historial) return;

  const compras = SimuladorInventario.compras;
  const ventas = SimuladorInventario.ventas;

  if (compras.length === 0 && ventas.length === 0) {
    historial.innerHTML = `<p style="color: var(--texto); font-size: var(--texto-sm);">
      Sin movimientos aún. Agrega compras y ventas para comparar.</p>`;
    return;
  }

  let html = '<div class="historial-lista">';

  compras.forEach((c, i) => {
    html += `<span class="historial-item historial-compra">
      📥 Compra ${i + 1}: ${c.cantidad}u @ Bs ${c.costoUnitario}
    </span>`;
  });

  ventas.forEach((v, i) => {
    html += `<span class="historial-item historial-venta">
      📤 Venta ${i + 1}: ${v.cantidad}u @ Bs ${v.precioUnitario}
    </span>`;
  });

  html += '</div>';
  historial.innerHTML = html;
}

function renderizarResultadoMetodo(nombre, datos) {
  const card = document.querySelector(`.metodo-card[data-metodo="${nombre}"]`);
  if (!card) return;

  const metricas = card.querySelectorAll('.metodo-metrica .valor');

  // Animar la actualización
  card.classList.add('actualizando');
  setTimeout(() => card.classList.remove('actualizando'), 300);

  if (metricas.length >= 4) {
    metricas[0].textContent = formatearBolivianos(datos.costoVenta);
    metricas[1].textContent = formatearBolivianos(datos.utilidadBruta);
    metricas[2].textContent = formatearBolivianos(datos.iue);
    metricas[3].textContent = formatearBolivianos(datos.inventarioFinal);
  }
}

function mostrarMensajeEducativo(promedio, fifo, lifo) {
  const mensaje = document.getElementById('comparador-mensaje');
  if (!mensaje) return;

  const maxUtilidad = Math.max(promedio.utilidadBruta, fifo.utilidadBruta, lifo.utilidadBruta);
  const minUtilidad = Math.min(promedio.utilidadBruta, fifo.utilidadBruta, lifo.utilidadBruta);
  const diferenciaUtilidad = maxUtilidad - minUtilidad;

  const maxIUE = Math.max(promedio.iue, fifo.iue, lifo.iue);
  const minIUE = Math.min(promedio.iue, fifo.iue, lifo.iue);
  const diferenciaIUE = maxIUE - minIUE;

  mensaje.innerHTML = `
    <div class="mensaje-destacado">
      <p>⚠️ Con los <strong>MISMOS datos</strong>, el método elegido cambia:</p>
      <ul class="mensaje-lista">
        <li>La utilidad bruta en <strong>${formatearBolivianos(diferenciaUtilidad)}</strong></li>
        <li>El IUE a pagar en <strong>${formatearBolivianos(diferenciaIUE)}</strong></li>
      </ul>
      <p style="margin-top: var(--espacio-sm); font-size: var(--texto-sm); color: var(--texto);">
        💡 <strong>Por esto las NIIF prohibieron LIFO en 2005:</strong>
        en entornos inflacionarios permite manipular utilidades reduciendo impuestos artificialmente.
        En Bolivia, el SIN solo acepta <strong>Promedio Ponderado</strong> y <strong>FIFO</strong>.
      </p>
    </div>
  `;
}

function formatearBolivianos(n) {
  return 'Bs ' + Number(n).toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
