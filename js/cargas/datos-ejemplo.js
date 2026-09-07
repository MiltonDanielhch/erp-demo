// ══════════════════════════════════════════════════════════════
// datos-ejemplo.js — ERP Contable Bolivia
// Carga inicial de datos de ejemplo desde datos/ejemplo.json
// ══════════════════════════════════════════════════════════════

/**
 * Carga datos de ejemplo en los catálogos maestros.
 * 
 * Recibe los catálogos como PARÁMETROS (no depende de window).
 * Esto resuelve el problema de orden de ejecución.
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
        productos: productos.contar()
    };

    console.log('📊 Conteos actuales:', conteos);

    if (conteos.clientes > 0 && conteos.proveedores > 0 && conteos.productos > 0) {
        console.log('✅ Los catálogos ya tienen datos. No se cargan ejemplos.');
        return { cargado: false, mensaje: 'Los catálogos ya tienen datos', conteos };
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
            productos: { exitosos: 0, fallidos: 0 }
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

        // ── Guardar datos pendientes (transacciones y empleados) ──
        if (datos.transacciones || datos.empleados) {
            console.log('⏭️  Transacciones y empleados se cargarán en los Módulos 2 y 4.');
            console.log(`  📋 ${datos.transacciones?.length || 0} transacciones disponibles`);
            console.log(`  👥 ${datos.empleados?.length || 0} empleados disponibles`);
        }

        // ── Resumen ──
        console.log('\n═══════════════════════════════════════════');
        console.log('📊 RESUMEN DE CARGA DE DATOS DE EJEMPLO');
        console.log('═══════════════════════════════════════════');
        console.log(`🏢 Empresa: ${resultados.empresa ? '✅' : '❌'}`);
        console.log(`👤 Clientes: ${resultados.clientes.exitosos}/${datos.clientes?.length || 0}`);
        console.log(`🏭 Proveedores: ${resultados.proveedores.exitosos}/${datos.proveedores?.length || 0}`);
        console.log(`📦 Productos: ${resultados.productos.exitosos}/${datos.productos?.length || 0}`);
        console.log('═══════════════════════════════════════════\n');

        return { cargado: true, mensaje: 'Datos cargados exitosamente', resultados };

    } catch (error) {
        console.error('❌ Error al cargar datos de ejemplo:', error);
        return { cargado: false, mensaje: `Error: ${error.message}`, error };
    }
}

// Exponer globalmente para llamada manual si es necesario
window.cargarDatosEjemplo = cargarDatosEjemplo;