# language: es

Característica: Registro de pagos
  Como administrador
  Quiero registrar los pagos recibidos de propietarios
  Para mantener actualizado el estado de cuenta de cada unidad

  Antecedentes:
    Dado que el servidor MSW está configurado
    Y inicié sesión como ADMIN
    Y existe un consorcio "Torre Norte" con período "202606"
    Y existe la UF "1A" con propietario

  @happy-path
  Escenario: Registrar un pago por transferencia
    Cuando navego a "/payments"
    Y hago clic en "Registrar Pago"
    Y selecciono la UF "1A"
    Y selecciono el período "202606"
    Y completo el monto con "25000"
    Y selecciono "TRANSFER" como medio de pago
    Y hago clic en "Registrar"
    Entonces el modal se cierra
    Y veo el nuevo pago en la tabla con monto "$ 25.000,00"
    Y el medio de pago es "TRANSFER"
    Y el estado es "ACTIVE"

  @happy-path
  Escenario: Registrar un pago en efectivo con comprobante
    Cuando navego a "/payments"
    Y hago clic en "Registrar Pago"
    Y selecciono "CASH" como medio de pago
    Entonces veo el campo "Número de comprobante"
    Y completo el comprobante con "REC-001"
    Y completo los demás campos obligatorios
    Y hago clic en "Registrar"
    Entonces el pago se registra sin advertencia

  @display
  Escenario: Pago en efectivo sin comprobante muestra advertencia
    Cuando navego a "/payments"
    Y hago clic en "Registrar Pago"
    Y selecciono "CASH" como medio de pago
    Y NO completo el campo de comprobante
    Y completo los demás campos obligatorios
    Y hago clic en "Registrar"
    Entonces el pago se registra exitosamente
    Y veo una advertencia "Sin comprobante" en la fila del pago

  @validation
  Escenario: El monto debe ser mayor a cero
    Cuando navego a "/payments"
    Y hago clic en "Registrar Pago"
    Y completo el monto con "0"
    Y completo los demás campos obligatorios
    Y hago clic en "Registrar"
    Entonces veo un mensaje de error "El monto debe ser mayor a 0"

  @display
  Escenario: Campo de comprobante oculto para medios que no son efectivo
    Cuando navego a "/payments"
    Y hago clic en "Registrar Pago"
    Y selecciono "TRANSFER" como medio de pago
    Entonces NO veo el campo "Número de comprobante"

  @display
  Escenario: Campo de comprobante visible para efectivo
    Cuando navego a "/payments"
    Y hago clic en "Registrar Pago"
    Y selecciono "CASH" como medio de pago
    Entonces veo el campo "Número de comprobante"

  @empty-state
  Escenario: Lista de pagos vacía
    Dado que no hay pagos registrados
    Cuando navego a "/payments"
    Entonces veo el mensaje "No hay pagos registrados"
    Y veo el botón "Registrar Pago" destacado

  @happy-path
  Escenario: Filtrar pagos por período
    Dado que existen pagos en diferentes períodos
    Cuando navego a "/payments"
    Y selecciono "202606" en el filtro de período
    Entonces veo solo los pagos del período "202606"
