# language: es

Característica: Factura C electrónica
  Como administrador o contador
  Quiero crear facturas C para consumidores finales
  Para facturar cuando el consorcio actúa como consumidor final

  Antecedentes:
    Dado que el servidor MSW está configurado
    Y inicié sesión como ADMIN

  @happy-path
  Escenario: Crear una Factura C simple
    Cuando navego a "/invoices/factura-c/new"
    Y completo el nombre del receptor con "Consumidor Final"
    Y agrego un ítem con descripción "Servicio mensual", cantidad 1, precio unitario "5000"
    Y hago clic en "Emitir Factura"
    Entonces soy redirigido a la página de detalle
    Y NO veo campos de IVA discriminado
    Y NO veo campos de CUIT del receptor

  @display
  Escenario: Formulario de Factura C oculta campos de IVA y CUIT
    Cuando navego a "/invoices/factura-c/new"
    Entonces NO veo el campo de CUIT del receptor
    Y NO veo selectores de alícuota de IVA
    Y NO veo desglose de IVA en el resumen

  @happy-path
  Escenario: Factura C calcula total desde ítems
    Cuando navego a "/invoices/factura-c/new"
    Y agrego dos ítems con precios "10000" y "5000"
    Entonces el total mostrado es "$ 15.000,00"
