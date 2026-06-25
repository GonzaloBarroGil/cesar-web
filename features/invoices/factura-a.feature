# language: es

Característica: Factura A electrónica
  Como administrador o contador
  Quiero crear facturas A para responsables inscriptos
  Para cumplir con los requisitos fiscales de ARCA

  Antecedentes:
    Dado que el servidor MSW está configurado
    Y inicié sesión como ADMIN
    Y el consorcio "Torre Norte" tiene condición IVA "RI"

  @happy-path
  Escenario: Crear una Factura A con receptor RI
    Cuando navego a "/invoices/factura-a/new"
    Y completo el CUIT del receptor con "20123456781"
    Y completo el nombre del receptor con "Juan Carlos López"
    Y agrego un ítem con descripción "Mantenimiento ascensores", cantidad 1, precio unitario "45000", IVA "21%"
    Entonces veo el subtotal "$ 45.000,00" y el IVA "$ 9.450,00"
    Y veo el neto "$ 45.000,00", IVA "$ 9.450,00" y total "$ 54.450,00"
    Cuando hago clic en "Emitir Factura"
    Entonces soy redirigido a la página de detalle
    Y veo el CAE de 14 dígitos y su fecha de vencimiento
    Y veo el código QR

  @validation
  Escenario: CUIT inválido muestra error
    Cuando navego a "/invoices/factura-a/new"
    Y completo el CUIT del receptor con "123"
    Y completo los demás campos obligatorios
    Y hago clic en "Emitir Factura"
    Entonces veo un mensaje de error "CUIT inválido. Debe tener 11 dígitos"

  @validation
  Escenario: CUIT faltante muestra error
    Cuando navego a "/invoices/factura-a/new"
    Y dejo el CUIT del receptor vacío
    Y completo los demás campos obligatorios
    Y hago clic en "Emitir Factura"
    Entonces veo un mensaje de error "CUIT del receptor es requerido para Factura A"

  @display
  Escenario: Factura A muestra desglose de IVA por alícuota
    Cuando navego a "/invoices/factura-a/new"
    Y agrego ítems con diferentes alícuotas de IVA (21% y 10.5%)
    Entonces veo el desglose de IVA agrupado por alícuota
    Y el total de IVA es la suma de cada grupo

  @display
  Escenario: Detalle de Factura A muestra CAE y QR
    Dado que existe una Factura A emitida con CAE "12345678901234"
    Cuando navego a "/invoices/550e8400-e29b-41d4-a716-446655440801"
    Entonces veo el CAE "12345678901234"
    Y veo la fecha de vencimiento del CAE
    Y veo el QR como imagen o enlace

  @happy-path
  Escenario: Crear Factura A con múltiples ítems
    Cuando navego a "/invoices/factura-a/new"
    Y completo los datos del receptor
    Y agrego dos ítems con diferentes descripciones y montos
    Y hago clic en "Emitir Factura"
    Entonces el total es la suma de ambos subtotales más IVA
