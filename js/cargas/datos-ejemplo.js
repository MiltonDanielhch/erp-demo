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
        cuentas_por_pagar: almacenamiento.obtener('cuentas_por_pagar')?.length || 0
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
            cuentas_por_pagar: { exitosos: 0, fallidos: 0 }
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

        return { cargado: true, mensaje: 'Datos cargados exitosamente', resultados };

    } catch (error) {
        console.error('❌ Error al cargar datos de ejemplo:', error);
        return { cargado: false, mensaje: `Error: ${error.message}`, error };
    }
}

// Exponer globalmente para llamada manual si es necesario
window.cargarDatosEjemplo = cargarDatosEjemplo;
