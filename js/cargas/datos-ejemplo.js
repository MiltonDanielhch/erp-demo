// ══════════════════════════════════════════════════════════════
// datos-ejemplo.js — ERP Contable Bolivia
// Carga inicial de datos de ejemplo desde datos/ejemplo.json
// ══════════════════════════════════════════════════════════════

/**
 * Carga datos de ejemplo en los catálogos maestros y colecciones base.
 *
 * Recibe los catálogos como PARÁMETROS (no depende de window).
 * Esto resuelve el problema de orden de ejecución.
 *
 * Colecciones cargadas:
 * - empresa (catálogo maestro)
 * - clientes, proveedores, productos (catálogos maestros)
 * - empleados (catálogo de RRHH)
 * - transacciones (eventos de negocio - Capa 2)
 * - documentos (documentos fuente - Capa 1)
 *
 * @param {Object} catalogs - { clientes, proveedores, productos, almacenamiento }
 * @returns {Promise<Object>} Resultado de la carga
 */
async function cargarDatosEjemplo(catalogs) {
    const { clientes, proveedores, productos, almacenamiento } = catalogs;

    console.log('🔄 Verificando si se necesitan datos de ejemplo...');

    // Validar que todos los catálogos estén disponibles
    if (!clientes || !proveedores || !productos || !almacenamiento) {
        console.error('❌ No se pueden cargar datos: catálogos no disponibles');
        return { cargado: false, mensaje: 'Catálogos no disponibles' };
    }

    const conteos = {
      clientes: clientes.contar(),
      proveedores: proveedores.contar(),
      productos: productos.contar(),
      empleados: almacenamiento.obtener('empleados')?.length || 0,
      transacciones: almacenamiento.obtener('transacciones')?.length || 0,
      documentos: almacenamiento.obtener('documentos')?.length || 0,
      solicitudes_compra: almacenamiento.obtener('solicitudes_compra')?.length || 0,
      ordenes_compra: almacenamiento.obtener('ordenes_compra')?.length || 0,
      cuentas_por_pagar: almacenamiento.obtener('cuentas_por_pagar')?.length || 0,
      cotizaciones: almacenamiento.obtener('cotizaciones')?.length || 0,
      pedidos_venta: almacenamiento.obtener('pedidos_venta')?.length || 0,
      cuentas_por_cobrar: almacenamiento.obtener('cuentas_por_cobrar')?.length || 0,
      capas_inventario: Object.keys(almacenamiento.obtener('capas_inventario') || {}).length,  // ← NUEVO
      centros_costo: almacenamiento.obtener('centros_costo')?.length || 0                      // ← NUEVO
    };

    console.log('📊 Conteos actuales:', conteos);

    // Si ya hay datos en todas las colecciones clave, no recargar
    if (conteos.clientes > 0 && conteos.proveedores > 0 && conteos.productos > 0
        && conteos.empleados > 0 && conteos.transacciones > 0 && conteos.documentos > 0) {
        console.log('✅ Todas las colecciones ya tienen datos. No se cargan ejemplos.');
        return { cargado: false, mensaje: 'Todas las colecciones ya tienen datos', conteos };
    }

    console.log('📥 Cargando datos de ejemplo desde datos/ejemplo.json...');

    try {
        const respuesta = await fetch('datos/ejemplo.json');

        if (!respuesta.ok) {
            throw new Error(`HTTP ${respuesta.status}: No se pudo cargar datos/ejemplo.json`);
        }

        const datos = await respuesta.json();
        const resultados = {
          empresa: false,
          clientes: { exitosos: 0, fallidos: 0 },
          proveedores: { exitosos: 0, fallidos: 0 },
          productos: { exitosos: 0, fallidos: 0 },
          empleados: { exitosos: 0, fallidos: 0 },
          transacciones: { exitosos: 0, fallidos: 0 },
          documentos: { exitosos: 0, fallidos: 0 },
          solicitudes_compra: { exitosos: 0, fallidos: 0 },
          ordenes_compra: { exitosos: 0, fallidos: 0 },
          cuentas_por_pagar: { exitosos: 0, fallidos: 0 },
          cotizaciones: { exitosos: 0, fallidos: 0 },
          pedidos_venta: { exitosos: 0, fallidos: 0 },
          cuentas_por_cobrar: { exitosos: 0, fallidos: 0 },
          capas_inventario: { exitosos: 0, fallidos: 0 },  // ← NUEVO
          centros_costo: { exitosos: 0, fallidos: 0 }      // ← NUEVO
        };

        // ── Mapeo de valores ──
        const mapeoRegimen = {
            'RG': 'REGIMEN_GENERAL',
            'RTS': 'REGIMEN_SIMPLIFICADO',
            'STI': 'REGIMEN_TRIBUTARIO_SIMPLIFICADO',
            'RAU': 'REGIMEN_AGRARIO'
        };

        const mapeoCondicionesPago = {
            'CONTADO': 'CONTADO',
            '15_DIAS': 'CREDITO_15',
            '30_DIAS': 'CREDITO_30',
            '60_DIAS': 'CREDITO_60',
            '90_DIAS': 'CREDITO_90'
        };

        // ── Cargar Empresa ──
        if (datos.empresa) {
            console.log('🏢 Cargando datos de la empresa...');
            try {
                almacenamiento.guardar('empresa', datos.empresa);
                resultados.empresa = true;
                console.log(`  ✅ ${datos.empresa.razonSocial} (NIT: ${datos.empresa.nit})`);
            } catch (error) {
                console.error('  ❌ Error al guardar empresa:', error.message);
            }
        }

        // ── Cargar Clientes ──
        if (datos.clientes && Array.isArray(datos.clientes) && conteos.clientes === 0) {
            console.log(`👤 Cargando ${datos.clientes.length} clientes...`);

            for (const cliente of datos.clientes) {
                try {
                    const clienteNormalizado = {
                        ...cliente,
                        regimenTributario: mapeoRegimen[cliente.regimenTributario] || cliente.regimenTributario || 'REGIMEN_GENERAL',
                        actualizadoEn: new Date().toISOString()
                    };

                    almacenamiento.guardar('clientes', clienteNormalizado);
                    resultados.clientes.exitosos++;
                    console.log(`  ✅ ${cliente.razonSocial} (NIT: ${cliente.nit}, saldo: Bs ${cliente.saldoActual || 0})`);
                } catch (error) {
                    resultados.clientes.fallidos++;
                    console.error(`  ❌ ${cliente.razonSocial}: ${error.message}`);
                }
            }
        }

        // ── Cargar Proveedores ──
        if (datos.proveedores && Array.isArray(datos.proveedores) && conteos.proveedores === 0) {
            console.log(`🏭 Cargando ${datos.proveedores.length} proveedores...`);

            for (const proveedor of datos.proveedores) {
                try {
                    const proveedorNormalizado = {
                        ...proveedor,
                        regimenTributario: mapeoRegimen[proveedor.regimenTributario] || proveedor.regimenTributario || 'REGIMEN_GENERAL',
                        condicionesPago: mapeoCondicionesPago[proveedor.condicionesPago] || proveedor.condicionesPago || 'CONTADO',
                        actualizadoEn: new Date().toISOString()
                    };

                    almacenamiento.guardar('proveedores', proveedorNormalizado);
                    resultados.proveedores.exitosos++;
                    console.log(`  ✅ ${proveedor.razonSocial} (NIT: ${proveedor.nit}, pago: ${proveedor.condicionesPago})`);
                } catch (error) {
                    resultados.proveedores.fallidos++;
                    console.error(`  ❌ ${proveedor.razonSocial}: ${error.message}`);
                }
            }
        }

        // ── Cargar Productos ──
        if (datos.productos && Array.isArray(datos.productos) && conteos.productos === 0) {
            console.log(`📦 Cargando ${datos.productos.length} productos...`);

            for (const producto of datos.productos) {
                try {
                    const productoNormalizado = {
                        ...producto,
                        actualizadoEn: new Date().toISOString()
                    };

                    almacenamiento.guardar('productos', productoNormalizado);
                    resultados.productos.exitosos++;
                    console.log(`  ✅ ${producto.nombre} (${producto.codigo}, stock: ${producto.stockActual}, precio: Bs ${producto.precioVenta})`);
                } catch (error) {
                    resultados.productos.fallidos++;
                    console.error(`  ❌ ${producto.nombre}: ${error.message}`);
                }
            }
        }

        // ── Cargar Empleados (Capa 2 / Módulo 4) ──
        if (datos.empleados && Array.isArray(datos.empleados) && conteos.empleados === 0) {
            console.log(`👥 Cargando ${datos.empleados.length} empleados...`);

            for (const empleado of datos.empleados) {
                try {
                    const empleadoNormalizado = {
                        ...empleado,
                        actualizadoEn: new Date().toISOString()
                    };

                    almacenamiento.guardar('empleados', empleadoNormalizado);
                    resultados.empleados.exitosos++;
                    console.log(`  ✅ ${empleado.nombres} ${empleado.apellidos} (${empleado.cargo}, Bs ${empleado.salarioBase})`);
                } catch (error) {
                    resultados.empleados.fallidos++;
                    console.error(`  ❌ ${empleado.nombres} ${empleado.apellidos}: ${error.message}`);
                }
            }
        }

        // ── Cargar Transacciones (Capa 2 - Módulos 2 y 4) ──
        if (datos.transacciones && Array.isArray(datos.transacciones) && conteos.transacciones === 0) {
            console.log(`💼 Cargando ${datos.transacciones.length} transacciones...`);

            for (const trx of datos.transacciones) {
                try {
                    const trxNormalizada = {
                        ...trx,
                        actualizadoEn: new Date().toISOString()
                    };

                    almacenamiento.guardar('transacciones', trxNormalizada);
                    resultados.transacciones.exitosos++;
                    console.log(`  ✅ ${trx.tipo} ${trx.documento} — Bs ${trx.montoTotal || trx.totalDepreciacion || 0}`);
                } catch (error) {
                    resultados.transacciones.fallidos++;
                    console.error(`  ❌ ${trx.documento}: ${error.message}`);
                }
            }
        }

        // ── Cargar Documentos Fuente (Capa 1) ──
        if (datos.documentos && Array.isArray(datos.documentos) && conteos.documentos === 0) {
            console.log(`📄 Cargando ${datos.documentos.length} documentos fuente...`);

            for (const doc of datos.documentos) {
                try {
                    const docNormalizado = {
                        ...doc,
                        actualizadoEn: new Date().toISOString()
                    };

                    almacenamiento.guardar('documentos', docNormalizado);
                    resultados.documentos.exitosos++;
                    console.log(`  ✅ ${doc.tipo} ${doc.numero} (${doc.estado}) — Bs ${doc.montoTotal}`);
                } catch (error) {
                    resultados.documentos.fallidos++;
                    console.error(`  ❌ ${doc.numero}: ${error.message}`);
                }
            }
        }

        // ── Cargar Solicitudes de Compra ──
        if (datos.solicitudes_compra && Array.isArray(datos.solicitudes_compra) && conteos.solicitudes_compra === 0) {
            console.log(`📋 Cargando ${datos.solicitudes_compra.length} solicitudes de compra...`);
            for (const sol of datos.solicitudes_compra) {
                try {
                    almacenamiento.guardar('solicitudes_compra', { ...sol, actualizadoEn: new Date().toISOString() });
                    resultados.solicitudes_compra.exitosos++;
                    console.log(`  ✅ ${sol.numero} (${sol.estado})`);
                } catch (error) {
                    resultados.solicitudes_compra.fallidos++;
                    console.error(`  ❌ ${sol.numero}: ${error.message}`);
                }
            }
        }

        // ── Cargar Órdenes de Compra ──
        if (datos.ordenes_compra && Array.isArray(datos.ordenes_compra) && conteos.ordenes_compra === 0) {
            console.log(`📝 Cargando ${datos.ordenes_compra.length} órdenes de compra...`);
            for (const oc of datos.ordenes_compra) {
                try {
                    almacenamiento.guardar('ordenes_compra', { ...oc, actualizadoEn: new Date().toISOString() });
                    resultados.ordenes_compra.exitosos++;
                    console.log(`  ✅ ${oc.numero} → ${oc.proveedorRazonSocial} (${oc.estado})`);
                } catch (error) {
                    resultados.ordenes_compra.fallidos++;
                    console.error(`  ❌ ${oc.numero}: ${error.message}`);
                }
            }
        }

        // ── Cargar Cuentas por Pagar ──
        if (datos.cuentas_por_pagar && Array.isArray(datos.cuentas_por_pagar) && conteos.cuentas_por_pagar === 0) {
            console.log(`💳 Cargando ${datos.cuentas_por_pagar.length} cuentas por pagar...`);
            for (const cp of datos.cuentas_por_pagar) {
                try {
                    almacenamiento.guardar('cuentas_por_pagar', { ...cp, actualizadoEn: new Date().toISOString() });
                    resultados.cuentas_por_pagar.exitosos++;
                    console.log(`  ✅ ${cp.numeroFactura} → ${cp.proveedorRazonSocial} (${cp.estado}, saldo: Bs ${cp.saldoPendiente})`);
                } catch (error) {
                    resultados.cuentas_por_pagar.fallidos++;
                    console.error(`  ❌ ${cp.numeroFactura}: ${error.message}`);
                }
            }
        }

        // ── Cargar Cotizaciones ──
        if (datos.cotizaciones && Array.isArray(datos.cotizaciones) && conteos.cotizaciones === 0) {
            console.log(`📄 Cargando ${datos.cotizaciones.length} cotizaciones...`);
            for (const cot of datos.cotizaciones) {
                try {
                    almacenamiento.guardar('cotizaciones', { ...cot, actualizadoEn: new Date().toISOString() });
                    resultados.cotizaciones.exitosos++;
                    console.log(`  ✅ ${cot.numero} → ${cot.clienteNombre} (${cot.estado})`);
                } catch (error) {
                    resultados.cotizaciones.fallidos++;
                    console.error(`  ❌ ${cot.numero}: ${error.message}`);
                }
            }
        }

        // ── Cargar Pedidos de Venta ──
        if (datos.pedidos_venta && Array.isArray(datos.pedidos_venta) && conteos.pedidos_venta === 0) {
            console.log(`🛍️ Cargando ${datos.pedidos_venta.length} pedidos de venta...`);
            for (const pv of datos.pedidos_venta) {
                try {
                    almacenamiento.guardar('pedidos_venta', { ...pv, actualizadoEn: new Date().toISOString() });
                    resultados.pedidos_venta.exitosos++;
                    console.log(`  ✅ ${pv.numero} → ${pv.clienteNombre} (${pv.estado})`);
                } catch (error) {
                    resultados.pedidos_venta.fallidos++;
                    console.error(`  ❌ ${pv.numero}: ${error.message}`);
                }
            }
        }

        // ── Cargar Cuentas por Cobrar ──
        if (datos.cuentas_por_cobrar && Array.isArray(datos.cuentas_por_cobrar) && conteos.cuentas_por_cobrar === 0) {
            console.log(`💳 Cargando ${datos.cuentas_por_cobrar.length} cuentas por cobrar...`);
            for (const cxc of datos.cuentas_por_cobrar) {
                try {
                    almacenamiento.guardar('cuentas_por_cobrar', { ...cxc, actualizadoEn: new Date().toISOString() });
                    resultados.cuentas_por_cobrar.exitosos++;
                    console.log(`  ✅ ${cxc.facturaNumero} → ${cxc.clienteNombre} (${cxc.estado}, saldo: Bs ${cxc.saldoPendiente})`);
                } catch (error) {
                    resultados.cuentas_por_cobrar.fallidos++;
                    console.error(`  ❌ ${cxc.facturaNumero}: ${error.message}`);
                }
            }
        }

        // ── Cargar Capas de Inventario (vía API del módulo) ──
        // Se usa la API del módulo porque guarda con su clave interna propia.
        if (window.inventarioCapas && datos.capas_inventario && typeof datos.capas_inventario === 'object') {
            const capasActuales = Object.keys(
                (window.inventarioCapas._leerCapas ? window.inventarioCapas._leerCapas() : {})
            ).length;

            if (capasActuales === 0) {
                console.log('📦 Cargando capas de inventario vía API...');
                for (const [productoId, data] of Object.entries(datos.capas_inventario)) {
                    (data.capas || []).forEach(capa => {
                        const res = window.inventarioCapas.agregarCapa(productoId, {
                            cantidad: capa.cantidadInicial,
                            costoUnitario: capa.costoUnitario,
                            fecha: capa.fechaEntrada,
                            documentoOrigen: capa.documentoOrigen,
                            metodo: data.metodo || 'FIFO'
                        });
                        if (res.exito) resultados.capas_inventario.exitosos++;
                        else resultados.capas_inventario.fallidos++;
                    });
                }
                console.log(`  ✅ ${resultados.capas_inventario.exitosos} capas en ${Object.keys(datos.capas_inventario).length} productos`);
            }
        }

        // ── Cargar Centros de Costo (vía API del módulo) ──
        if (window.centrosCosto && datos.centros_costo && Array.isArray(datos.centros_costo)) {
            const centrosActuales = (window.centrosCosto.obtenerTodos ? window.centrosCosto.obtenerTodos() : []).length;

            if (centrosActuales === 0) {
                console.log(`🏢 Cargando ${datos.centros_costo.length} centros de costo vía API...`);
                for (const cc of datos.centros_costo) {
                    const res = window.centrosCosto.crearCentro(cc);
                    if (res.exito) {
                        resultados.centros_costo.exitosos++;
                        console.log(`  ✅ ${cc.codigo} - ${cc.nombre} (Bs ${cc.presupuestoAnual})`);
                    } else {
                        resultados.centros_costo.fallidos++;
                        console.error(`  ❌ ${cc.codigo}: ${(res.errores || []).join(', ')}`);
                    }
                }
            }
        }

        // ── Resumen ──
        console.log('\n═══════════════════════════════════════════');
        console.log('📊 RESUMEN DE CARGA DE DATOS DE EJEMPLO');
        console.log('═══════════════════════════════════════════');
        console.log(`🏢 Empresa: ${resultados.empresa ? '✅' : '❌'}`);
        console.log(`👤 Clientes: ${resultados.clientes.exitosos}/${datos.clientes?.length || 0}`);
        console.log(`🏭 Proveedores: ${resultados.proveedores.exitosos}/${datos.proveedores?.length || 0}`);
        console.log(`📦 Productos: ${resultados.productos.exitosos}/${datos.productos?.length || 0}`);
        console.log(`👥 Empleados: ${resultados.empleados.exitosos}/${datos.empleados?.length || 0}`);
        console.log(`💼 Transacciones: ${resultados.transacciones.exitosos}/${datos.transacciones?.length || 0}`);
        console.log(`📄 Documentos: ${resultados.documentos.exitosos}/${datos.documentos?.length || 0}`);
        console.log(`📋 Solicitudes Compra: ${resultados.solicitudes_compra.exitosos}/${datos.solicitudes_compra?.length || 0}`);
        console.log(`📝 Órdenes Compra: ${resultados.ordenes_compra.exitosos}/${datos.ordenes_compra?.length || 0}`);
        console.log(`💳 Cuentas por Pagar: ${resultados.cuentas_por_pagar.exitosos}/${datos.cuentas_por_pagar?.length || 0}`);
        console.log('═══════════════════════════════════════════\n');
        console.log(`📋 Solicitudes Compra: ${resultados.solicitudes_compra.exitosos}/${datos.solicitudes_compra?.length || 0}`);
        console.log(`📝 Órdenes Compra: ${resultados.ordenes_compra.exitosos}/${datos.ordenes_compra?.length || 0}`);
        console.log(`💳 Cuentas por Pagar: ${resultados.cuentas_por_pagar.exitosos}/${datos.cuentas_por_pagar?.length || 0}`);
        console.log(`📄 Cotizaciones: ${resultados.cotizaciones.exitosos}/${datos.cotizaciones?.length || 0}`);
        console.log(`🛍️ Pedidos Venta: ${resultados.pedidos_venta.exitosos}/${datos.pedidos_venta?.length || 0}`);
        console.log(`💳 Cuentas por Cobrar: ${resultados.cuentas_por_cobrar.exitosos}/${datos.cuentas_por_cobrar?.length || 0}`);
        console.log('═══════════════════════════════════════════\n');
        console.log(`📋 Solicitudes Compra: ${resultados.solicitudes_compra.exitosos}/${datos.solicitudes_compra?.length || 0}`);
        console.log(`📝 Órdenes Compra: ${resultados.ordenes_compra.exitosos}/${datos.ordenes_compra?.length || 0}`);
        console.log(`💳 Cuentas por Pagar: ${resultados.cuentas_por_pagar.exitosos}/${datos.cuentas_por_pagar?.length || 0}`);
        console.log(`📄 Cotizaciones: ${resultados.cotizaciones.exitosos}/${datos.cotizaciones?.length || 0}`);
        console.log(`🛍️ Pedidos Venta: ${resultados.pedidos_venta.exitosos}/${datos.pedidos_venta?.length || 0}`);
        console.log(`💳 Cuentas por Cobrar: ${resultados.cuentas_por_cobrar.exitosos}/${datos.cuentas_por_cobrar?.length || 0}`);
        console.log(`📦 Capas Inventario: ${resultados.capas_inventario.exitosos}/${Object.keys(datos.capas_inventario || {}).length}`);  // ← NUEVO
        console.log(`🏢 Centros Costo: ${resultados.centros_costo.exitosos}/${datos.centros_costo?.length || 0}`);                      // ← NUEVO
        console.log('═══════════════════════════════════════════\n');

                // ── Generar asientos contables del período de ejemplo ──
        // Idempotente: solo si el Libro Diario está vacío (evita
        // duplicados en recargas). Flujo real: documento → asiento → libro.
        try {
            const asientosExistentes = JSON.parse(
                localStorage.getItem('erp_bolivia_asientos_contabilizados') || '[]'
            );
            if (asientosExistentes.length === 0) {
                              // ── 1) Asiento de apertura (evita saldos acreedores en activos) ──
                // Coherente con el capital social sembrado: 69.900 + 80.100 = 150.000
                if (window.motorContable) {
                    const apertura = window.motorContable.crearAsientoManual({
                        fecha: '2026-01-01',
                        concepto: 'Asiento de apertura — aporte de capital (Bancos + Inventario = Capital Social)',
                        lineas: [
                            { cuentaCodigo: '1.1.02', cuentaNombre: 'Bancos', debe: 69900, haber: 0 },
                            { cuentaCodigo: '1.1.06', cuentaNombre: 'Inventario de Mercancías', debe: 80100, haber: 0 },
                            { cuentaCodigo: '3.1.01', cuentaNombre: 'Capital Social', debe: 0, haber: 150000 }
                        ]
                    });
                    console.log(apertura.exito
                        ? `🏦 Asiento de apertura: ${apertura.asiento.numero} (Bs 150.000)`
                        : `⚠️ Apertura no generada: ${(apertura.errores || []).join(', ')}`);
                }
                // ── 2) Contabilización manual de Capa 1 ──
                // Crea asientos de compra y venta directamente (el generador automático
                // no valida correctamente los documentos sembrados).
                if (window.motorContable) {
                    const docs = JSON.parse(localStorage.getItem('erp_bolivia_documentos') || '[]');
                    let contabilizados = 0;

                    // FACTURAS DE COMPRA: Inventario + IVA Crédito Fiscal → Proveedores
                    docs.filter(d => d.tipo === 'FACTURA_COMPRA').forEach(doc => {
                        const montoTotal = Number(doc.montoTotal) || 0;
                        const montoNeto = Number(doc.montoNeto) || Math.round(montoTotal / 1.13 * 100) / 100;
                        const montoIVA = Number(doc.montoIVA) || Math.round((montoTotal - montoNeto) * 100) / 100;

                        const asiento = window.motorContable.crearAsientoManual({
                            fecha: doc.fechaEmision || '2026-09-01',
                            concepto: `Compra ${doc.numero} — ${doc.razonSocialProveedor || 'Proveedor'}`,
                            lineas: [
                                { cuentaCodigo: '1.1.06', cuentaNombre: 'Inventario de Mercancías', debe: montoNeto, haber: 0 },
                                { cuentaCodigo: '1.1.07', cuentaNombre: 'IVA Crédito Fiscal', debe: montoIVA, haber: 0 },
                                { cuentaCodigo: '2.1.01', cuentaNombre: 'Proveedores', debe: 0, haber: montoTotal }
                            ]
                        });

                        if (asiento.exito) {
                            contabilizados++;
                            console.log(`📄 Compra ${doc.numero}: ${asiento.asiento.numero} (Bs ${montoTotal})`);
                        } else {
                            console.warn(`⚠️ Compra ${doc.numero} no contabilizada: ${(asiento.errores || []).join(', ')}`);
                        }
                    });

                    // FACTURAS DE VENTA: Clientes → Ventas + IVA Débito Fiscal
                    docs.filter(d => d.tipo === 'FACTURA_VENTA').forEach(doc => {
                        const montoTotal = Number(doc.montoTotal) || 0;
                        const montoNeto = Number(doc.montoNeto) || Math.round(montoTotal / 1.13 * 100) / 100;
                        const montoIVA = Number(doc.montoIVA) || Math.round((montoTotal - montoNeto) * 100) / 100;

                        const asiento = window.motorContable.crearAsientoManual({
                            fecha: doc.fechaEmision || '2026-09-01',
                            concepto: `Venta ${doc.numero} — ${doc.razonSocialCliente || 'Cliente'}`,
                            lineas: [
                                { cuentaCodigo: '1.1.04', cuentaNombre: 'Clientes / Cuentas por Cobrar', debe: montoTotal, haber: 0 },
                                { cuentaCodigo: '4.1.01', cuentaNombre: 'Ventas', debe: 0, haber: montoNeto },
                                { cuentaCodigo: '2.1.03', cuentaNombre: 'IVA Débito Fiscal', debe: 0, haber: montoIVA }
                            ]
                        });

                        if (asiento.exito) {
                            contabilizados++;
                            console.log(`📄 Venta ${doc.numero}: ${asiento.asiento.numero} (Bs ${montoTotal})`);
                        } else {
                            console.warn(`⚠️ Venta ${doc.numero} no contabilizada: ${(asiento.errores || []).join(', ')}`);
                        }
                    });

                    console.log(`📚 Capa 1 contabilizada: ${contabilizados} asientos de facturas`);
                }
                if (window.moduloAsientosNomina) {
                    window.moduloAsientosNomina.generarAsientosMensuales('2026-09');
                }
                if (window.moduloImpuestos) {
                    window.moduloImpuestos.generarAsientosPeriodo('2026-09');
                }
                if (window.motorContable) {
                    window.motorContable.procesarAsientosPendientes();
                }
                console.log('📖 Asientos contables generados automáticamente para la demo');
            }
        } catch (e) {
            console.warn('⚠️ Auto-generación de asientos omitida:', e.message);
        }

        return { cargado: true, mensaje: 'Datos cargados exitosamente', resultados };

    } catch (error) {
        console.error('❌ Error al cargar datos de ejemplo:', error);
        return { cargado: false, mensaje: `Error: ${error.message}`, error };
    }
}

// Exponer globalmente para llamada manual si es necesario
window.cargarDatosEjemplo = cargarDatosEjemplo;
