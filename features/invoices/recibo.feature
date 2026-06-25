# language: es

Característica: Recibos
  Como administrador o contador
  Quiero crear recibos de pago
  Para documentar los pagos recibidos

  Antecedentes:
    Dado que el servidor MSW está configurado
    Y inicié sesión como ADMIN
    Y el consorcio "Torre Norte" tiene condición IVA "RI"
    Y existe una Factura A por "$ 54.450,00"

  @happy-path
  Escenario: Crear un Recibo B vinculado a una factura
    Cuando navego a "/invoices/recibos/new"
    Y selecciono "Factura" como tipo de referencia
    Y busco y selecciono la factura de "$ 54.450,00"
    Y el monto se completa automáticamente con "$ 54.450,00"
    Y selecciono "TRANSFERENCIA" como medio de pago
    Y veo que el tipo de recibo es "Recibo B"
    Y hago clic en "Emitir Recibo"
    Entonces soy redirigido a la página de detalle del recibo

  @happy-path
  Escenario: Crear un Recibo vinculado a una liquidación
    Dado que existe una liquidación emitida
    Cuando navego a "/invoices/recibos/new"
    Y selecciono "Liquidación" como tipo de referencia
    Y busco y selecciono la liquidación
    Y completo el medio de pago
    Y hago clic en "Emitir Recibo"
    Entonces el recibo se crea exitosamente

  @display
  Escenario: Recibo C para consorcio exento
    Dado que el consorcio tiene condición IVA "EXENTO"
    Cuando navego a "/invoices/recibos/new"
    Y completo los datos del recibo
    Entonces veo que el tipo de recibo es "Recibo C"

  @happy-path @optimistic @confirmation
  Escenario: Anular un recibo con confirmación
    Dado que existe un recibo activo
    Cuando navego a su página de detalle
    Y hago clic en "Anular"
    Entonces veo un diálogo de confirmación
    Cuando confirmo la anulación
    Entonces el recibo cambia a estado "ANULADA" inmediatamente
