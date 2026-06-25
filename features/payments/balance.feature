# language: es

Característica: Balance e historial por unidad
  Como administrador
  Quiero consultar el balance y el historial de pagos por unidad
  Para conocer el estado de cuenta de cada propietario

  Antecedentes:
    Dado que el servidor MSW está configurado
    Y inicié sesión como ADMIN

  @display
  Escenario: Ver balance de una unidad con pagos
    Dado que la UF "1A" tiene un pago registrado
    Cuando navego a "/payments"
    Y hago clic en la pestaña "Balances"
    Y selecciono la UF "1A"
    Entonces veo el total pagado formateado en pesos
    Y veo la cantidad de pagos registrados
    Y veo la tabla de historial debajo

  @display
  Escenario: Historial de pagos en orden descendente
    Dado que la UF "1A" tiene múltiples pagos en distintas fechas
    Cuando navego a la pestaña "Balances"
    Y selecciono la UF "1A"
    Entonces el historial muestra los pagos del más reciente al más antiguo
    Y cada fila muestra fecha, monto, medio de pago y estado

  @empty-state
  Escenario: Balance vacío para unidad sin pagos
    Dado que la UF "2A" no tiene pagos registrados
    Cuando navego a la pestaña "Balances"
    Y selecciono la UF "2A"
    Entonces veo el total pagado en "$ 0,00"
    Y veo "Sin historial de pagos para esta unidad"

  @display
  Escenario: Balance con múltiples pagos muestra suma correcta
    Dado que la UF "1A" tiene pagos por "$ 18.000,00" y "$ 10.000,00"
    Cuando consulto el balance de la UF "1A"
    Entonces el total pagado es "$ 28.000,00"

  @happy-path
  Escenario: Filtrar historial por período
    Dado que la UF "1A" tiene pagos en los períodos "202605" y "202606"
    Cuando en la pestaña "Balances" filtro por período "202605"
    Entonces el historial muestra solo los pagos de "202605"
