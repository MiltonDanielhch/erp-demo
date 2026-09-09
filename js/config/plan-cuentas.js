// ══════════════════════════════════════════════════════════════
// plan-cuentas.js — ERP Contable Bolivia
// Plan de Cuentas según NC del CTNAC (Normas de Contabilidad)
// ══════════════════════════════════════════════════════════════

/**
 * Plan de Cuentas para una empresa comercial boliviana.
 *
 * Estructura según las NC del CTNAC (no NIIF puras):
 *
 * 1. ACTIVOS
 *   1.1 Activos Corrientes
 *   1.2 Activos No Corrientes
 * 2. PASIVOS
 *   2.1 Pasivos Corrientes
 *   2.2 Pasivos No Corrientes
 * 3. PATRIMONIO
 * 4. INGRESOS
 * 5. GASTOS Y COSTOS
 *
 * Código de cuenta: X.Y.ZZ
 *   X    → Grupo principal (1-5)
 *   Y    → Subgrupo (1-9)
 *   ZZ   → Cuenta específica (01-99)
 *
 * Naturaleza:
 * - "deudora": aumenta por el Debe (activos, gastos, costos)
 * - "acreedora": aumenta por el Haber (pasivos, patrimonio, ingresos)
 */

const PLAN_CUENTAS = {

  // ════════════════════════════════════════════════════════════
  // GRUPO 1: ACTIVOS
  // ════════════════════════════════════════════════════════════

  '1': {
    codigo: '1',
    nombre: 'ACTIVOS',
    naturaleza: 'deudora',
    subgrupos: {

      '1.1': {
        codigo: '1.1',
        nombre: 'Activos Corrientes',
        cuentas: {
          '1.1.01': {
            codigo: '1.1.01',
            nombre: 'Efectivo y Equivalentes de Efectivo',
            naturaleza: 'deudora',
            tipo: 'activo_corriente'
          },
          '1.1.02': {
            codigo: '1.1.02',
            nombre: 'Bancos',
            naturaleza: 'deudora',
            tipo: 'activo_corriente'
          },
          '1.1.03': {
            codigo: '1.1.03',
            nombre: 'Caja',
            naturaleza: 'deudora',
            tipo: 'activo_corriente'
          },
          '1.1.04': {
            codigo: '1.1.04',
            nombre: 'Clientes / Cuentas por Cobrar',
            naturaleza: 'deudora',
            tipo: 'activo_corriente'
          },
          '1.1.05': {
            codigo: '1.1.05',
            nombre: 'Provisión para Cuentas Incobrables',
            naturaleza: 'acreedora',  // Contracuenta del activo
            tipo: 'activo_corriente_contracuenta'
          },
          '1.1.06': {
            codigo: '1.1.06',
            nombre: 'Inventario de Mercancías',
            naturaleza: 'deudora',
            tipo: 'activo_corriente'
          },
          '1.1.07': {
            codigo: '1.1.07',
            nombre: 'IVA Crédito Fiscal',
            naturaleza: 'deudora',
            tipo: 'activo_corriente',
            descripcion: 'IVA de compras deducible contra débito fiscal'
          },
          '1.1.08': {
            codigo: '1.1.08',
            nombre: 'IVA Saldo a Favor',
            naturaleza: 'deudora',
            tipo: 'activo_corriente',
            descripcion: 'Cuando crédito fiscal > débito fiscal'
          },
          '1.1.09': {
            codigo: '1.1.09',
            nombre: 'Anticipos a Proveedores',
            naturaleza: 'deudora',
            tipo: 'activo_corriente'
          },
          '1.1.10': {
            codigo: '1.1.10',
            nombre: 'Otras Cuentas por Cobrar',
            naturaleza: 'deudora',
            tipo: 'activo_corriente'
          }
        }
      },

      '1.2': {
        codigo: '1.2',
        nombre: 'Activos No Corrientes',
        cuentas: {
          '1.2.01': {
            codigo: '1.2.01',
            nombre: 'Maquinaria y Equipo',
            naturaleza: 'deudora',
            tipo: 'activo_no_corriente'
          },
          '1.2.02': {
            codigo: '1.2.02',
            nombre: 'Depreciación Acumulada - Maquinaria y Equipo',
            naturaleza: 'acreedora',  // Contracuenta
            tipo: 'activo_no_corriente_contracuenta'
          },
          '1.2.03': {
            codigo: '1.2.03',
            nombre: 'Vehículos',
            naturaleza: 'deudora',
            tipo: 'activo_no_corriente'
          },
          '1.2.04': {
            codigo: '1.2.04',
            nombre: 'Depreciación Acumulada - Vehículos',
            naturaleza: 'acreedora',
            tipo: 'activo_no_corriente_contracuenta'
          },
          '1.2.05': {
            codigo: '1.2.05',
            nombre: 'Muebles y Útiles',
            naturaleza: 'deudora',
            tipo: 'activo_no_corriente'
          },
          '1.2.06': {
            codigo: '1.2.06',
            nombre: 'Depreciación Acumulada - Muebles y Útiles',
            naturaleza: 'acreedora',
            tipo: 'activo_no_corriente_contracuenta'
          },
          '1.2.07': {
            codigo: '1.2.07',
            nombre: 'Equipos de Computación',
            naturaleza: 'deudora',
            tipo: 'activo_no_corriente'
          },
          '1.2.08': {
            codigo: '1.2.08',
            nombre: 'Depreciación Acumulada - Equipos de Computación',
            naturaleza: 'acreedora',
            tipo: 'activo_no_corriente_contracuenta'
          },
          '1.2.09': {
            codigo: '1.2.09',
            nombre: 'Edificios',
            naturaleza: 'deudora',
            tipo: 'activo_no_corriente'
          },
          '1.2.10': {
            codigo: '1.2.10',
            nombre: 'Depreciación Acumulada - Edificios',
            naturaleza: 'acreedora',
            tipo: 'activo_no_corriente_contracuenta'
          },
          '1.2.11': {
            codigo: '1.2.11',
            nombre: 'Terrenos',
            naturaleza: 'deudora',
            tipo: 'activo_no_corriente',
            descripcion: 'Los terrenos NO se deprecian'
          }
        }
      }
    }
  },

  // ════════════════════════════════════════════════════════════
  // GRUPO 2: PASIVOS
  // ════════════════════════════════════════════════════════════

  '2': {
    codigo: '2',
    nombre: 'PASIVOS',
    naturaleza: 'acreedora',
    subgrupos: {

      '2.1': {
        codigo: '2.1',
        nombre: 'Pasivos Corrientes',
        cuentas: {
          '2.1.01': {
            codigo: '2.1.01',
            nombre: 'Proveedores',
            naturaleza: 'acreedora',
            tipo: 'pasivo_corriente'
          },
          '2.1.02': {
            codigo: '2.1.02',
            nombre: 'Cuentas por Pagar',
            naturaleza: 'acreedora',
            tipo: 'pasivo_corriente'
          },
          '2.1.03': {
            codigo: '2.1.03',
            nombre: 'IVA Débito Fiscal',
            naturaleza: 'acreedora',
            tipo: 'pasivo_corriente',
            descripcion: 'IVA de ventas a pagar al SIN'
          },
          '2.1.04': {
            codigo: '2.1.04',
            nombre: 'IVA por Pagar',
            naturaleza: 'acreedora',
            tipo: 'pasivo_corriente',
            descripcion: 'IVA Débito − IVA Crédito del período'
          },
          '2.1.05': {
            codigo: '2.1.05',
            nombre: 'IT por Pagar',
            naturaleza: 'acreedora',
            tipo: 'pasivo_corriente',
            descripcion: 'Impuesto a las Transacciones (3%)'
          },
          '2.1.06': {
            codigo: '2.1.06',
            nombre: 'RC-IVA por Pagar',
            naturaleza: 'acreedora',
            tipo: 'pasivo_corriente',
            descripcion: 'Régimen Complementario al IVA'
          },
          '2.1.07': {
            codigo: '2.1.07',
            nombre: 'Retenciones por Pagar',
            naturaleza: 'acreedora',
            tipo: 'pasivo_corriente'
          },
          '2.1.08': {
            codigo: '2.1.08',
            nombre: 'Nómina por Pagar',
            naturaleza: 'acreedora',
            tipo: 'pasivo_corriente'
          },
          '2.1.09': {
            codigo: '2.1.09',
            nombre: 'Aportes Laborales por Pagar',
            naturaleza: 'acreedora',
            tipo: 'pasivo_corriente'
          },
          '2.1.10': {
            codigo: '2.1.10',
            nombre: 'Aportes Patronales por Pagar',
            naturaleza: 'acreedora',
            tipo: 'pasivo_corriente'
          },
          '2.1.11': {
            codigo: '2.1.11',
            nombre: 'Aguinaldo por Pagar',
            naturaleza: 'acreedora',
            tipo: 'pasivo_corriente',
            descripcion: 'Provisión acumulada del aguinaldo'
          },
          '2.1.12': {
            codigo: '2.1.12',
            nombre: 'Segundo Aguinaldo por Pagar',
            naturaleza: 'acreedora',
            tipo: 'pasivo_corriente',
            descripcion: 'Solo si se activa (DS 1802)'
          },
          '2.1.13': {
            codigo: '2.1.13',
            nombre: 'Bono de Antigüedad por Pagar',
            naturaleza: 'acreedora',
            tipo: 'pasivo_corriente'
          },
          '2.1.14': {
            codigo: '2.1.14',
            nombre: 'Indemnización por Tiempo de Servicio por Pagar',
            naturaleza: 'acreedora',
            tipo: 'pasivo_corriente',
            descripcion: 'Aplica incluso a renuncia (DS 28699)'
          },
          '2.1.15': {
            codigo: '2.1.15',
            nombre: 'Desahucio por Pagar',
            naturaleza: 'acreedora',
            tipo: 'pasivo_corriente',
            descripcion: '3 meses por falta de preaviso (DS 22138)'
          },
          '2.1.16': {
            codigo: '2.1.16',
            nombre: 'Vacaciones por Pagar',
            naturaleza: 'acreedora',
            tipo: 'pasivo_corriente'
          },
          '2.1.17': {
            codigo: '2.1.17',
            nombre: 'Obligaciones Bancarias CP',
            naturaleza: 'acreedora',
            tipo: 'pasivo_corriente',
            descripcion: 'Porción de corto plazo de préstamos bancarios'
          },
          '2.1.18': {
            codigo: '2.1.18',
            nombre: 'Retención RC-IVA por Pagar (Proveedores)',
            naturaleza: 'acreedora',
            tipo: 'pasivo_corriente',
            descripcion: 'RC-IVA retenido a proveedores del régimen complementario'
          },
          '2.1.19': {
            codigo: '2.1.19',
            nombre: 'Retención IT por Pagar (Proveedores)',
            naturaleza: 'acreedora',
            tipo: 'pasivo_corriente',
            descripcion: 'IT retenido a proveedores no inscritos'
          }
        }
      },

      '2.2': {
        codigo: '2.2',
        nombre: 'Pasivos No Corrientes',
        cuentas: {
          '2.2.01': {
            codigo: '2.2.01',
            nombre: 'Obligaciones Bancarias LP',
            naturaleza: 'acreedora',
            tipo: 'pasivo_no_corriente',
            descripcion: 'Préstamos bancarios a largo plazo'
          },
          '2.2.02': {
            codigo: '2.2.02',
            nombre: 'IUE por Pagar',
            naturaleza: 'acreedora',
            tipo: 'pasivo_no_corriente',
            descripcion: 'Impuesto a las Utilidades (anual)'
          },
          '2.2.03': {
            codigo: '2.2.03',
            nombre: 'IUE-BE por Pagar',
            naturaleza: 'acreedora',
            tipo: 'pasivo_no_corriente',
            descripcion: 'IUE para Beneficiarios del Exterior'
          },
          '2.2.04': {
            codigo: '2.2.04',
            nombre: 'Provisión para Contingencias',
            naturaleza: 'acreedora',
            tipo: 'pasivo_no_corriente'
          }
        }
      }
    }
  },

  // ════════════════════════════════════════════════════════════
  // GRUPO 3: PATRIMONIO
  // ════════════════════════════════════════════════════════════

  '3': {
    codigo: '3',
    nombre: 'PATRIMONIO',
    naturaleza: 'acreedora',
    subgrupos: {

      '3.1': {
        codigo: '3.1',
        nombre: 'Capital',
        cuentas: {
          '3.1.01': {
            codigo: '3.1.01',
            nombre: 'Capital Social',
            naturaleza: 'acreedora',
            tipo: 'patrimonio'
          },
          '3.1.02': {
            codigo: '3.1.02',
            nombre: 'Aportes de Socios',
            naturaleza: 'acreedora',
            tipo: 'patrimonio'
          }
        }
      },

      '3.2': {
        codigo: '3.2',
        nombre: 'Reservas y Resultados',
        cuentas: {
          '3.2.01': {
            codigo: '3.2.01',
            nombre: 'Reserva Legal',
            naturaleza: 'acreedora',
            tipo: 'patrimonio'
          },
          '3.2.02': {
            codigo: '3.2.02',
            nombre: 'Utilidades Retenidas',
            naturaleza: 'acreedora',
            tipo: 'patrimonio'
          },
          '3.2.03': {
            codigo: '3.2.03',
            nombre: 'Pérdidas Acumuladas',
            naturaleza: 'deudora',  // Contracuenta del patrimonio
            tipo: 'patrimonio_contracuenta'
          },
          '3.2.04': {
            codigo: '3.2.04',
            nombre: 'Utilidad del Ejercicio',
            naturaleza: 'acreedora',
            tipo: 'patrimonio',
            descripcion: 'Resultado del cierre contable'
          }
        }
      }
    }
  },

  // ════════════════════════════════════════════════════════════
  // GRUPO 4: INGRESOS
  // ════════════════════════════════════════════════════════════

  '4': {
    codigo: '4',
    nombre: 'INGRESOS',
    naturaleza: 'acreedora',
    subgrupos: {

      '4.1': {
        codigo: '4.1',
        nombre: 'Ingresos por Ventas',
        cuentas: {
          '4.1.01': {
            codigo: '4.1.01',
            nombre: 'Ventas de Mercancías',
            naturaleza: 'acreedora',
            tipo: 'ingreso_operativo'
          },
          '4.1.02': {
            codigo: '4.1.02',
            nombre: 'Ventas de Servicios',
            naturaleza: 'acreedora',
            tipo: 'ingreso_operativo'
          },
          '4.1.03': {
            codigo: '4.1.03',
            nombre: 'Devoluciones en Ventas',
            naturaleza: 'deudora',  // Contracuenta
            tipo: 'ingreso_contracuenta'
          },
          '4.1.04': {
            codigo: '4.1.04',
            nombre: 'Descuentos en Ventas',
            naturaleza: 'deudora',  // Contracuenta
            tipo: 'ingreso_contracuenta'
          }
        }
      },

      '4.2': {
        codigo: '4.2',
        nombre: 'Otros Ingresos',
        cuentas: {
          '4.2.01': {
            codigo: '4.2.01',
            nombre: 'Ingresos por Intereses',
            naturaleza: 'acreedora',
            tipo: 'ingreso_no_operativo'
          },
          '4.2.02': {
            codigo: '4.2.02',
            nombre: 'Ganancia en Venta de Activos',
            naturaleza: 'acreedora',
            tipo: 'ingreso_no_operativo'
          },
          '4.2.03': {
            codigo: '4.2.03',
            nombre: 'Ingresos por Arrendamiento',
            naturaleza: 'acreedora',
            tipo: 'ingreso_no_operativo'
          },
          '4.2.04': {
            codigo: '4.2.04',
            nombre: 'Otros Ingresos',
            naturaleza: 'acreedora',
            tipo: 'ingreso_no_operativo'
          }
        }
      }
    }
  },

  // ════════════════════════════════════════════════════════════
  // GRUPO 5: GASTOS Y COSTOS
  // ════════════════════════════════════════════════════════════

  '5': {
    codigo: '5',
    nombre: 'GASTOS Y COSTOS',
    naturaleza: 'deudora',
    subgrupos: {

      '5.1': {
        codigo: '5.1',
        nombre: 'Costo de Ventas',
        cuentas: {
          '5.1.01': {
            codigo: '5.1.01',
            nombre: 'Costo de Mercancías Vendidas',
            naturaleza: 'deudora',
            tipo: 'costo_ventas'
          },
          '5.1.02': {
            codigo: '5.1.02',
            nombre: 'Costo de Servicios Prestados',
            naturaleza: 'deudora',
            tipo: 'costo_ventas'
          }
        }
      },

      '5.2': {
        codigo: '5.2',
        nombre: 'Gastos de Personal',
        cuentas: {
          '5.2.01': {
            codigo: '5.2.01',
            nombre: 'Sueldos y Salarios',
            naturaleza: 'deudora',
            tipo: 'gasto_operativo'
          },
          '5.2.02': {
            codigo: '5.2.02',
            nombre: 'Horas Extras',
            naturaleza: 'deudora',
            tipo: 'gasto_operativo'
          },
          '5.2.03': {
            codigo: '5.2.03',
            nombre: 'Comisiones',
            naturaleza: 'deudora',
            tipo: 'gasto_operativo'
          },
          '5.2.04': {
            codigo: '5.2.04',
            nombre: 'Bono de Antigüedad',
            naturaleza: 'deudora',
            tipo: 'gasto_operativo'
          },
          '5.2.05': {
            codigo: '5.2.05',
            nombre: 'Gasto de Aguinaldo',
            naturaleza: 'deudora',
            tipo: 'gasto_operativo'
          },
          '5.2.06': {
            codigo: '5.2.06',
            nombre: 'Gasto de Segundo Aguinaldo',
            naturaleza: 'deudora',
            tipo: 'gasto_operativo'
          },
          '5.2.07': {
            codigo: '5.2.07',
            nombre: 'Gasto de Indemnización',
            naturaleza: 'deudora',
            tipo: 'gasto_operativo'
          },
          '5.2.08': {
            codigo: '5.2.08',
            nombre: 'Gasto de Desahucio',
            naturaleza: 'deudora',
            tipo: 'gasto_operativo'
          },
          '5.2.09': {
            codigo: '5.2.09',
            nombre: 'Aportes Patronales',
            naturaleza: 'deudora',
            tipo: 'gasto_operativo'
          },
          '5.2.10': {
            codigo: '5.2.10',
            nombre: 'Vacaciones',
            naturaleza: 'deudora',
            tipo: 'gasto_operativo'
          }
        }
      },

      '5.3': {
        codigo: '5.3',
        nombre: 'Gastos Administrativos',
        cuentas: {
          '5.3.01': {
            codigo: '5.3.01',
            nombre: 'Alquileres',
            naturaleza: 'deudora',
            tipo: 'gasto_operativo'
          },
          '5.3.02': {
            codigo: '5.3.02',
            nombre: 'Servicios Básicos (Luz, Agua, Teléfono)',
            naturaleza: 'deudora',
            tipo: 'gasto_operativo'
          },
          '5.3.03': {
            codigo: '5.3.03',
            nombre: 'Internet y Comunicaciones',
            naturaleza: 'deudora',
            tipo: 'gasto_operativo'
          },
          '5.3.04': {
            codigo: '5.3.04',
            nombre: 'Papelería y Útiles de Oficina',
            naturaleza: 'deudora',
            tipo: 'gasto_operativo'
          },
          '5.3.05': {
            codigo: '5.3.05',
            nombre: 'Gastos Legales y Notariales',
            naturaleza: 'deudora',
            tipo: 'gasto_operativo'
          },
          '5.3.06': {
            codigo: '5.3.06',
            nombre: 'Gastos de Auditoría',
            naturaleza: 'deudora',
            tipo: 'gasto_operativo'
          },
          '5.3.07': {
            codigo: '5.3.07',
            nombre: 'Gastos por Servicios Profesionales',
            naturaleza: 'deudora',
            tipo: 'gasto_operativo',
            descripcion: 'Honorarios profesionales (abogados, contadores, consultores)'
          }
        }
      },

      '5.4': {
        codigo: '5.4',
        nombre: 'Gastos de Ventas',
        cuentas: {
          '5.4.01': {
            codigo: '5.4.01',
            nombre: 'Publicidad y Propaganda',
            naturaleza: 'deudora',
            tipo: 'gasto_operativo'
          },
          '5.4.02': {
            codigo: '5.4.02',
            nombre: 'Transporte y Fletes',
            naturaleza: 'deudora',
            tipo: 'gasto_operativo'
          },
          '5.4.03': {
            codigo: '5.4.03',
            nombre: 'Comisiones a Vendedores',
            naturaleza: 'deudora',
            tipo: 'gasto_operativo'
          }
        }
      },

      '5.5': {
        codigo: '5.5',
        nombre: 'Depreciaciones y Amortizaciones',
        cuentas: {
          '5.5.01': {
            codigo: '5.5.01',
            nombre: 'Depreciación de Maquinaria y Equipo',
            naturaleza: 'deudora',
            tipo: 'gasto_operativo'
          },
          '5.5.02': {
            codigo: '5.5.02',
            nombre: 'Depreciación de Vehículos',
            naturaleza: 'deudora',
            tipo: 'gasto_operativo'
          },
          '5.5.03': {
            codigo: '5.5.03',
            nombre: 'Depreciación de Muebles y Útiles',
            naturaleza: 'deudora',
            tipo: 'gasto_operativo'
          },
          '5.5.04': {
            codigo: '5.5.04',
            nombre: 'Depreciación de Equipos de Computación',
            naturaleza: 'deudora',
            tipo: 'gasto_operativo'
          },
          '5.5.05': {
            codigo: '5.5.05',
            nombre: 'Depreciación de Edificios',
            naturaleza: 'deudora',
            tipo: 'gasto_operativo'
          }
        }
      },

      '5.6': {
        codigo: '5.6',
        nombre: 'Impuestos',
        cuentas: {
          '5.6.01': {
            codigo: '5.6.01',
            nombre: 'IT (Impuesto a las Transacciones)',
            naturaleza: 'deudora',
            tipo: 'gasto_operativo',
            descripcion: '3% sobre ingresos brutos, compensable con IUE'
          },
          '5.6.02': {
            codigo: '5.6.02',
            nombre: 'IUE (Impuesto a las Utilidades)',
            naturaleza: 'deudora',
            tipo: 'gasto_operativo'
          },
          '5.6.03': {
            codigo: '5.6.03',
            nombre: 'IUE-BE (Beneficiarios del Exterior)',
            naturaleza: 'deudora',
            tipo: 'gasto_operativo'
          },
          '5.6.04': {
            codigo: '5.6.04',
            nombre: 'Impuestos Municipales',
            naturaleza: 'deudora',
            tipo: 'gasto_operativo'
          },
          '5.6.05': {
            codigo: '5.6.05',
            nombre: 'Multas y Recargos Tributarios',
            naturaleza: 'deudora',
            tipo: 'gasto_no_deducible',
            descripcion: 'NO deducible para IUE'
          }
        }
      },

      '5.7': {
        codigo: '5.7',
        nombre: 'Gastos Financieros',
        cuentas: {
          '5.7.01': {
            codigo: '5.7.01',
            nombre: 'Intereses Bancarios',
            naturaleza: 'deudora',
            tipo: 'gasto_no_operativo'
          },
          '5.7.02': {
            codigo: '5.7.02',
            nombre: 'Comisiones Bancarias',
            naturaleza: 'deudora',
            tipo: 'gasto_no_operativo'
          },
          '5.7.03': {
            codigo: '5.7.03',
            nombre: 'Pérdida en Venta de Activos',
            naturaleza: 'deudora',
            tipo: 'gasto_no_operativo'
          },
          '5.7.04': {
            codigo: '5.7.04',
            nombre: 'Diferencias de Cambio',
            naturaleza: 'deudora',
            tipo: 'gasto_no_operativo'
          }
        }
      }
    }
  }
};

// ══════════════════════════════════════════════════════════════
// FUNCIONES AUXILIARES DEL PLAN DE CUENTAS
// ══════════════════════════════════════════════════════════════

const PlanCuentasUtilidades = {

  /**
   * Obtiene la cuenta por su código.
   * @param {string} codigo - Código de la cuenta (ej: "1.1.01")
   * @returns {Object|null} La cuenta o null si no existe
   */
  obtenerCuenta(codigo) {
    const partes = codigo.split('.');
    if (partes.length < 3) return null;

    const grupo = PLAN_CUENTAS[partes[0]];
    if (!grupo) return null;

    const subgrupoCodigo = `${partes[0]}.${partes[1]}`;
    const subgrupo = grupo.subgrupos[subgrupoCodigo];
    if (!subgrupo) return null;

    return subgrupo.cuentas[codigo] || null;
  },

  /**
   * Obtiene todas las cuentas del plan en un array plano.
   * @returns {Array} Array de todas las cuentas
   */
  obtenerTodasLasCuentas() {
    const cuentas = [];
    for (const grupo of Object.values(PLAN_CUENTAS)) {
      for (const subgrupo of Object.values(grupo.subgrupos)) {
        for (const cuenta of Object.values(subgrupo.cuentas)) {
          cuentas.push({
            ...cuenta,
            grupo: grupo.nombre,
            subgrupo: subgrupo.nombre
          });
        }
      }
    }
    return cuentas;
  },

  /**
   * Obtiene las cuentas de un tipo específico.
   * @param {string} tipo - Tipo de cuenta (ej: "activo_corriente")
   * @returns {Array} Cuentas del tipo especificado
   */
  obtenerCuentasPorTipo(tipo) {
    return this.obtenerTodasLasCuentas().filter(c => c.tipo === tipo);
  },

  /**
   * Obtiene las cuentas por naturaleza (deudora o acreedora).
   * @param {string} naturaleza - "deudora" o "acreedora"
   * @returns {Array} Cuentas de esa naturaleza
   */
  obtenerCuentasPorNaturaleza(naturaleza) {
    return this.obtenerTodasLasCuentas().filter(c => c.naturaleza === naturaleza);
  },

  /**
   * Verifica si una cuenta existe en el plan.
   * @param {string} codigo - Código de la cuenta
   * @returns {boolean} true si existe
   */
  cuentaExiste(codigo) {
    return this.obtenerCuenta(codigo) !== null;
  },

  /**
   * Determina si un monto en el Debe aumenta o disminuye la cuenta.
   * @param {string} codigo - Código de la cuenta
   * @returns {string} "aumenta" o "disminuye"
   */
  efectoDebe(codigo) {
    const cuenta = this.obtenerCuenta(codigo);
    if (!cuenta) return null;
    return cuenta.naturaleza === 'deudora' ? 'aumenta' : 'disminuye';
  },

  /**
   * Determina si un monto en el Haber aumenta o disminuye la cuenta.
   * @param {string} codigo - Código de la cuenta
   * @returns {string} "aumenta" o "disminuye"
   */
  efectoHaber(codigo) {
    const cuenta = this.obtenerCuenta(codigo);
    if (!cuenta) return null;
    return cuenta.naturaleza === 'acreedora' ? 'aumenta' : 'disminuye';
  }
};
