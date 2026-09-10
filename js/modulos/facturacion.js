// ══════════════════════════════════════════════════════════════
// facturacion.js — Módulo 7.7: Facturación Electrónica (SIAT)
// ══════════════════════════════════════════════════════════════

/**
 * Módulo de Facturación Electrónica — Sistema SIAT del SIN
 *
 * En el prototipo educativo, SIMULAMOS los códigos CUIS, CUFD, CUF.
 * En un sistema productivo real, estos códigos se solicitarían
 * vía API al SIN y se firmaría digitalmente el XML.
 *
 * Códigos:
 * - CUIS: Código Único de Inicio de Sistema (cada 8 horas)
 * - CUFD: Código Único de Facturación Diaria (cada 24 horas)
 * - CUF: Código Único de Factura (uno por cada factura, 43 caracteres)
 * - QR: Código QR para validación en impuestos.gob.bo
 *
 * Modalidad: Electrónica en Línea (la más común en Bolivia)
 */
class ModuloFacturacion {

  constructor(deps = {}) {
    this.almacenamiento = deps.almacenamiento || null;
    this.nitEmpresa = deps.nitEmpresa || '123456789-1';

    this.KEY_CUIS = 'erp_facturacion_cuis';
    this.KEY_CUFD = 'erp_facturacion_cufd';
    this.KEY_FACTURAS = 'erp_facturacion_facturas';
    this.KEY_CONFIG = 'erp_facturacion_config';

    this.VALIDEZ_CUIS_MS = 8 * 60 * 60 * 1000;   // 8 horas
    this.VALIDEZ_CUFD_MS = 24 * 60 * 60 * 1000;  // 24 horas

    console.log('🧾 Módulo de Facturación Electrónica inicializado (SIAT simulado)');
  }

  // ══════════════════════════════════════════════════════════
  // CUIS — Código Único de Inicio de Sistema
  // ══════════════════════════════════════════════════════════

  /**
   * Genera un CUIS simulado.
   *
   * El CUIS real se solicita al SIN cada 8 horas.
   * Habilita la facturación del sistema para el día.
   *
   * @param {boolean} [forzarNuevo=false]
   * @returns {Object}
   */
  generarCUIS(forzarNuevo = false) {
    // Si hay uno vigente y no se fuerza nuevo, usarlo
    if (!forzarNuevo) {
      const cuisExistente = this._obtenerCUISVigente();
      if (cuisExistente) return cuisExistente;
    }

    const ahora = new Date();
    const cuis = this._generarCodigoAleatorio(8);
    const expiracion = new Date(ahora.getTime() + this.VALIDEZ_CUIS_MS);

    const registro = {
      cuis,
      codigo: cuis,
      fechaGeneracion: ahora.toISOString(),
      fechaExpiracion: expiracion.toISOString(),
      nitEmisor: this.nitEmpresa,
      sistemaId: 'ERP_BOLIVIA_EDU',
      valido: true,
      mensaje: '⚠️ CUIS SIMULADO para prototipo educativo. En producción se solicita al SIN.'
    };

    this._guardarJSON(this.KEY_CUIS, registro);

    console.log(`🔑 CUIS generado: ${cuis} (vigente ${this.VALIDEZ_CUIS_MS / 3600000}h)`);
    return registro;
  }

  /**
   * Valida un CUIS.
   * @param {string} cuis
   * @returns {Object}
   */
  validarCUIS(cuis) {
    if (!cuis || typeof cuis !== 'string') {
      return { valido: false, errores: ['CUIS vacío o inválido'] };
    }

    if (cuis.length !== 8) {
      return { valido: false, errores: ['CUIS debe tener 8 caracteres'] };
    }

    if (!/^[A-Z0-9]+$/.test(cuis)) {
      return { valido: false, errores: ['CUIS debe ser alfanumérico'] };
    }

    const vigente = this._obtenerCUISVigente();
    if (!vigente || vigente.cuis !== cuis) {
      return { valido: false, errores: ['CUIS no coincide con el vigente'] };
    }

    if (new Date(vigente.fechaExpiracion) < new Date()) {
      return { valido: false, errores: ['CUIS expirado'] };
    }

    return { valido: true, cuis: vigente };
  }

  // ══════════════════════════════════════════════════════════
  // CUFD — Código Único de Facturación Diaria
  // ══════════════════════════════════════════════════════════

  /**
   * Genera un CUFD simulado.
   *
   * El CUFD real se solicita al SIN cada 24 horas.
   * Identifica al punto de venta por día.
   *
   * @param {boolean} [forzarNuevo=false]
   * @returns {Object}
   */
  generarCUFD(forzarNuevo = false) {
    // Verificar que haya CUIS vigente
    const cuis = this._obtenerCUISVigente();
    if (!cuis) {
      return {
        exito: false,
        errores: ['No hay CUIS vigente. Genera un CUIS primero.']
      };
    }

    if (!forzarNuevo) {
      const cufdExistente = this._obtenerCUFDVigente();
      if (cufdExistente) return cufdExistente;
    }

    const ahora = new Date();
    const cufd = this._generarCodigoAleatorio(12);
    const expiracion = new Date(ahora.getTime() + this.VALIDEZ_CUFD_MS);

    const registro = {
      cufd,
      codigo: cufd,
      codigoControl: this._generarCodigoAleatorio(8),
      cuis,
      cuisCodigo: cuis.cuis,
      fechaGeneracion: ahora.toISOString(),
      fechaExpiracion: expiracion.toISOString(),
      nitEmisor: this.nitEmpresa,
      puntoVenta: '0001',
      valido: true,
      mensaje: '⚠️ CUFD SIMULADO para prototipo educativo.'
    };

    this._guardarJSON(this.KEY_CUFD, registro);

    console.log(`📋 CUFD generado: ${cufd} (vigente ${this.VALIDEZ_CUFD_MS / 3600000}h)`);
    return registro;
  }

  /**
   * Valida un CUFD.
   * @param {string} cufd
   * @returns {Object}
   */
  validarCUFD(cufd) {
    if (!cufd || typeof cufd !== 'string') {
      return { valido: false, errores: ['CUFD vacío o inválido'] };
    }

    if (cufd.length !== 12) {
      return { valido: false, errores: ['CUFD debe tener 12 caracteres'] };
    }

    if (!/^[A-Z0-9]+$/.test(cufd)) {
      return { valido: false, errores: ['CUFD debe ser alfanumérico'] };
    }

    const vigente = this._obtenerCUFDVigente();
    if (!vigente || vigente.cufd !== cufd) {
      return { valido: false, errores: ['CUFD no coincide con el vigente'] };
    }

    if (new Date(vigente.fechaExpiracion) < new Date()) {
      return { valido: false, errores: ['CUFD expirado'] };
    }

    return { valido: true, cufd: vigente };
  }

  // ══════════════════════════════════════════════════════════
  // CUF — Código Único de Factura
  // ══════════════════════════════════════════════════════════

  /**
   * Genera un CUF simulado de 43 caracteres alfanuméricos.
   *
   * El CUF identifica UNÍVOCAMENTE cada factura.
   * En producción, lo devuelve el SIN tras validar el XML.
   *
   * Estructura real del CUF (simplificada):
   *   [NIT 12] + [Fecha 8] + [Modalidad 2] + [Tipo Emisión 1] +
   *   [Código Documento Sector 1] + [Tipo Factura 1] +
   *   [Código Control 12] + [Dígito verificador 1]
   *
   * @param {string} nit - NIT del emisor
   * @param {string} fecha - Fecha de emisión (YYYY-MM-DD)
   * @param {string} numeroFactura - Número de factura
   * @returns {Object}
   */
  generarCUF(nit, fecha, numeroFactura) {
    if (!nit || !fecha || !numeroFactura) {
      return {
        exito: false,
        errores: ['NIT, fecha y número de factura son obligatorios']
      };
    }

    const nitLimpio = String(nit).replace(/\D/g, '');
    const fechaLimpia = String(fecha).replace(/-/g, '');

    // Generar CUF de 43 caracteres
    const parte1 = nitLimpio.padEnd(12, '0').slice(0, 12);
    const parte2 = fechaLimpia.padEnd(8, '0').slice(0, 8);
    const parte3 = '13';  // Modalidad Electrónica en Línea
    const parte4 = '1';   // Tipo Emisión Normal
    const parte5 = '0';   // Código Documento Sector (0 para estándar)
    const parte6 = '1';   // Tipo Factura (1 = con NIT)
    const parte7 = this._generarCodigoAleatorio(17);
    const parte8 = this._calcularDigitoVerificador(
      parte1 + parte2 + parte3 + parte4 + parte5 + parte6 + parte7
    );

    const cuf = (parte1 + parte2 + parte3 + parte4 + parte5 + parte6 + parte7 + parte8)
      .toUpperCase()
      .padEnd(43, '0')
      .slice(0, 43);

    const registro = {
      cuf,
      codigo: cuf,
      nit,
      fecha,
      numeroFactura,
      fechaGeneracion: new Date().toISOString(),
      valido: true,
      mensaje: '⚠️ CUF SIMULADO para prototipo educativo.'
    };

    console.log(`📄 CUF generado: ${cuf} (Factura ${numeroFactura})`);
    return registro;
  }

  /**
   * Valida un CUF.
   *
   * @param {string} cuf
   * @returns {Object}
   */
  validarCUF(cuf) {
    if (!cuf || typeof cuf !== 'string') {
      return { valido: false, errores: ['CUF vacío o inválido'] };
    }

    if (cuf.length !== 43) {
      return {
        valido: false,
        errores: [`CUF debe tener 43 caracteres (tiene ${cuf.length})`]
      };
    }

    if (!/^[A-Z0-9]+$/.test(cuf)) {
      return { valido: false, errores: ['CUF debe ser alfanumérico [A-Z0-9]'] };
    }

    // Verificar estructura
    const nit = cuf.slice(0, 12);
    const fecha = cuf.slice(12, 20);
    const modalidad = cuf.slice(20, 22);
    const digitoVerificador = cuf.slice(42);

    const errores = [];

    if (!/^\d{12}$/.test(nit)) {
      errores.push(`NIT inválido en CUF: ${nit}`);
    }

    if (!/^\d{8}$/.test(fecha)) {
      errores.push(`Fecha inválida en CUF: ${fecha}`);
    }

    if (modalidad !== '13' && modalidad !== '11' && modalidad !== '12') {
      errores.push(`Modalidad desconocida: ${modalidad}`);
    }

    // Verificar dígito verificador
    const esperado = this._calcularDigitoVerificador(cuf.slice(0, 42));
    if (digitoVerificador !== esperado) {
      errores.push(`Dígito verificador incorrecto: ${digitoVerificador} vs esperado ${esperado}`);
    }

    return {
      valido: errores.length === 0,
      errores,
      cuf: {
        nit: cuf.slice(0, 12),
        fecha: `${cuf.slice(12, 16)}-${cuf.slice(16, 18)}-${cuf.slice(18, 20)}`,
        modalidad: cuf.slice(20, 22),
        digitoVerificador: cuf.slice(42)
      }
    };
  }

  // ══════════════════════════════════════════════════════════
  // FACTURA ELECTRÓNICA COMPLETA
  // ══════════════════════════════════════════════════════════

  /**
   * Genera una factura electrónica completa.
   *
   * Simula el flujo completo de emisión:
   * 1. Verifica CUIS vigente
   * 2. Verifica CUFD vigente
   * 3. Genera CUF
   * 4. Genera código QR
   * 5. Construye la estructura completa
   *
   * @param {Object} datosVenta - Datos de la venta
   * @returns {Object} Factura electrónica completa
   */
  generarFacturaElectronica(datosVenta = {}) {
    const errores = [];

    // 1. Validar datos mínimos
    if (!datosVenta.clienteNit) errores.push('Falta NIT del cliente');
    if (!datosVenta.razonSocialCliente) errores.push('Falta razón social del cliente');
    if (!datosVenta.total) errores.push('Falta monto total');

    if (errores.length > 0) {
      return { exito: false, errores };
    }

    // 2. Verificar CUIS
    const cuis = this._obtenerCUISVigente();
    if (!cuis) {
      return {
        exito: false,
        errores: ['No hay CUIS vigente. Llama a generarCUIS() primero.']
      };
    }

    // 3. Verificar CUFD
    const cufd = this._obtenerCUFDVigente();
    if (!cufd) {
      return {
        exito: false,
        errores: ['No hay CUFD vigente. Llama a generarCUFD() primero.']
      };
    }

    // 4. Generar número de factura correlativo
    const numeroFactura = this._siguienteNumeroFactura();
    const fecha = datosVenta.fecha || new Date().toISOString().split('T')[0];

    // 5. Generar CUF
    const cufObj = this.generarCUF(this.nitEmpresa, fecha, numeroFactura);

    // 6. Calcular IVA e IT
    const total = Number(datosVenta.total) || 0;
    const neto = this._r2(total / 1.13);
    const iva = this._r2(total - neto);
    const it = this._r2(total * 0.03);

    // 7. Generar código QR
    const qr = this.generarCodigoQR(cufObj.cuf);

    // 8. Construir estructura completa
    const factura = {
      exito: true,
      id: 'fact-' + Date.now().toString(36) + '-' + this._generarCodigoAleatorio(6),
      tipoDocumento: 'FACTURA_ELECTRONICA',
      numeroFactura,
      cuf: cufObj.cuf,
      cufd: cufd.cufd,
      cuis: cuis.cuis,
      codigoControl: cufd.codigoControl,
      codigoQR: qr.url,

      // Datos del emisor
      emisor: {
        nit: this.nitEmpresa,
        razonSocial: datosVenta.razonSocialEmisor || 'EMPRESA S.A.',
        direccion: datosVenta.direccionEmisor || 'Av. Principal 123',
        telefono: datosVenta.telefonoEmisor || '',
        actividadEconomica: datosVenta.actividadEconomica || 'Comercio al por mayor y menor'
      },

      // Datos del receptor
      receptor: {
        nit: datosVenta.clienteNit,
        razonSocial: datosVenta.razonSocialCliente,
        direccion: datosVenta.direccionCliente || '',
        correo: datosVenta.correoCliente || ''
      },

      // Datos de la factura
      factura: {
        fecha,
        hora: datosVenta.hora || new Date().toTimeString().slice(0, 8),
        metodoPago: datosVenta.metodoPago || 'EFECTIVO',
        moneda: 'BOB',
        tipoCambio: 1,
        leyenda: 'Ley 453: El proveedor de servicios está obligado a entregar factura'
      },

      // Detalle de productos/servicios
      detalle: datosVenta.detalle || [],

      // Totales
      totales: {
        subtotal: neto,
        descuento: 0,
        baseImponible: neto,
        iva,
        it,
        total,
        totalLetras: this._numeroALetras(total) + ' 00/100 BOLIVIANOS'
      },

      // Información adicional
      infoAdicional: {
        leyendaIva: 'IVA incluido en el precio (Art. 5 Ley 843)',
        leyendaIT: 'IT 3% incluido en el precio',
        mensaje: 'Factura válida para crédito fiscal'
      },

      // Metadatos
      metadatos: {
        modalidad: 'ELECTRONICA_EN_LINEA',
        tipoEmision: 'NORMAL',
        tipoFactura: 'CON_NIT',
        version: '2026',
        fechaGeneracion: new Date().toISOString(),
        simulado: true,
        mensajeSimulacion: '⚠️ Factura generada en modo SIMULACIÓN. En producción se firmaría digitalmente y se enviaría al SIN.'
      }
    };

    // 9. Guardar factura en colección
    this._agregarFactura(factura);

    console.log(`📄 Factura electrónica generada: #${numeroFactura} | CUF: ${cufObj.cuf} | Total: Bs ${total}`);
    return factura;
  }

  // ══════════════════════════════════════════════════════════
  // CÓDIGO QR
  // ══════════════════════════════════════════════════════════

  /**
   * Genera un código QR simulado.
   *
   * El QR real apunta a:
   *   https://siat.impuestos.gob.bo/consultasQR/{CUF}
   *
   * @param {string} cuf
   * @returns {Object}
   */
  generarCodigoQR(cuf) {
    const urlBase = 'https://siat.impuestos.gob.bo/consultasQR';
    const url = `${urlBase}/${cuf}`;

    return {
      url,
      datosQR: {
        nit: this.nitEmpresa,
        cuf,
        numeroFactura: this._ultimoNumeroFactura(),
        fechaEmision: new Date().toISOString().split('T')[0],
        razonSocial: 'EMPRESA S.A.'
      },
      mensaje: '⚠️ Código QR simulado. En producción se generaría la imagen del QR.'
    };
  }

  // ══════════════════════════════════════════════════════════
  // UTILIDADES PRIVADAS
  // ══════════════════════════════════════════════════════════

  _generarCodigoAleatorio(longitud) {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < longitud; i++) {
      codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return codigo;
  }

  _calcularDigitoVerificador(texto) {
    // Algoritmo simplificado módulo 11
    const caracteres = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let suma = 0;
    let factor = 2;

    for (let i = texto.length - 1; i >= 0; i--) {
      const indice = caracteres.indexOf(texto[i].toUpperCase());
      suma += (indice >= 0 ? indice : 0) * factor;
      factor = factor === 7 ? 2 : factor + 1;
    }

    const residuo = suma % 11;
    const digito = 11 - residuo;

    if (digito === 10) return '1';
    if (digito === 11) return '0';
    return String(digito);
  }

  _obtenerCUISVigente() {
    const cuis = this._leerJSON(this.KEY_CUIS);
    if (!cuis) return null;
    if (new Date(cuis.fechaExpiracion) < new Date()) return null;
    return cuis;
  }

  _obtenerCUFDVigente() {
    const cufd = this._leerJSON(this.KEY_CUFD);
    if (!cufd) return null;
    if (new Date(cufd.fechaExpiracion) < new Date()) return null;
    return cufd;
  }

  _siguienteNumeroFactura() {
    const facturas = this._leerJSON(this.KEY_FACTURAS, []);
    const numeros = facturas.map(f => Number(f.numeroFactura) || 0);
    const maximo = numeros.length > 0 ? Math.max(...numeros) : 0;
    return String(maximo + 1).padStart(6, '0');
  }

  _ultimoNumeroFactura() {
    const facturas = this._leerJSON(this.KEY_FACTURAS, []);
    if (facturas.length === 0) return '000000';
    return facturas[facturas.length - 1].numeroFactura;
  }

  _agregarFactura(factura) {
    const facturas = this._leerJSON(this.KEY_FACTURAS, []);
    facturas.push(factura);
    this._guardarJSON(this.KEY_FACTURAS, facturas);
  }

  _leerJSON(key, fallback = null) {
    try {
      return JSON.parse(localStorage.getItem(key) || 'null') || fallback;
    } catch (e) {
      return fallback;
    }
  }

  _guardarJSON(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  _r2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }

  _numeroALetras(n) {
    // Simplificado: en producción usar librería num2words
    const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const numero = Math.floor(Number(n) || 0);
    if (numero === 0) return 'CERO';
    if (numero < 10) return unidades[numero];
    if (numero < 100) return 'DECENA DE';
    if (numero < 1000) return 'CENTENAR DE';
    return 'MILES DE';
  }

  /**
   * Obtiene el estado actual del sistema de facturación.
   * @returns {Object}
   */
  obtenerEstado() {
    const cuis = this._obtenerCUISVigente();
    const cufd = this._obtenerCUFDVigente();
    const facturas = this._leerJSON(this.KEY_FACTURAS, []);

    return {
      cuis: {
        vigente: !!cuis,
        codigo: cuis?.cuis || null,
        expiracion: cuis?.fechaExpiracion || null
      },
      cufd: {
        vigente: !!cufd,
        codigo: cufd?.cufd || null,
        expiracion: cufd?.fechaExpiracion || null
      },
      facturas: {
        total: facturas.length,
        ultima: facturas.length > 0 ? facturas[facturas.length - 1] : null
      }
    };
  }
}

window.ModuloFacturacionClase = ModuloFacturacion;
