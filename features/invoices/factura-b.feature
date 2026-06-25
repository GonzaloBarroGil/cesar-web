# language: es

Característica: Factura B electrónica
  Como administrador o contador
  Quiero crear facturas B para consumidores finales y exentos
  Para facturar servicios a receptores no inscriptos

  Antecedentes:
    Dado que el servidor MSW está configurado
    Y inicié sesión como ADMIN
    Y el consorcio "Torre Norte" tiene condición IVA "RI"

  @happy-path
  Escenario: Crear una Factura B para consumidor final sin CUIT
    Cuando navego a "/invoices/factura-b/new"
    Y completo el nombre del receptor con "Consumidor Final"
    Y selecciono "CF" en condición IVA del receptor
    Y agrego un ítem con descripción "Limpieza general", cantidad 1, precio unitario "35000"
    Y el total es menor a "$ 5.000"
    Entonces el campo CUIT no es obligatorio
    Y veo el iva_contenido calculado
    Cuando hago clic en "Emitir Factura"
    Entonces soy redirigido a la página de detalle

  @validation
  Escenario: CUIT requerido para montos iguales o mayores a $5.000
    Cuando navego a "/invoices/factura-b/new"
    Y completo los ítems con un total de "$ 5.000" o más
    Y dejo el CUIT del receptor vacío
    Y hago clic en "Emitir Factura"
    Entonces veo un mensaje de error "CUIT requerido para montos ≥ $5.000"

  @happy-path
  Escenario: CUIT opcional para montos menores a $5.000
    Cuando navego a "/invoices/factura-b/new"
    Y completo los ítems con un total de "$ 3.000"
    Entonces el campo CUIT es opcional
    Y puedo emitir la factura sin completar el CUIT

  @display
  Escenario: Factura B muestra IVA contenido
    Cuando navego a "/invoices/factura-b/new"
    Y agrego ítems con precios que incluyen IVA
    Entonces veo la etiqueta "IVA Contenido" en el resumen
    Y el monto del IVA contenido se calcula automáticamente

  @display
  Escenario: Factura B no discrimina IVA por ítem
    Cuando navego a "/invoices/factura-b/new"
    Y agrego un ítem
    Entonces NO veo un selector de alícuota de IVA por ítem
    Y el precio unitario es el precio final
