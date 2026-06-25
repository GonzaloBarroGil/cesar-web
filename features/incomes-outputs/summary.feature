# language: es

Característica: Resúmenes financieros
  Como administrador
  Quiero ver resúmenes financieros por período y acumulados
  Para conocer el flujo de caja del consorcio

  Antecedentes:
    Dado que el servidor MSW está configurado
    Y inicié sesión como ADMIN
    Y existen entradas de ingresos y egresos en "Torre Norte"

  @display
  Escenario: Resumen por período muestra ingresos, egresos y neto
    Cuando navego a "/incomes-outputs"
    Y hago clic en la pestaña "Resumen"
    Y selecciono el período "202606"
    Entonces veo el total de ingresos formateado en pesos
    Y veo el total de egresos formateado en pesos
    Y veo el resultado neto
    Y el neto se muestra en verde si es positivo o rojo si es negativo

  @display
  Escenario: Resumen acumulado muestra saldo inicial y final
    Cuando navego a "/incomes-outputs"
    Y hago clic en la pestaña "Resumen"
    Y hago clic en la subpestaña "Acumulado"
    Entonces veo el saldo inicial
    Y veo los ingresos totales
    Y veo los egresos totales
    Y veo el saldo final calculado

  @empty-state
  Escenario: Resumen vacío para período sin entradas
    Dado que el período "202607" no tiene entradas
    Cuando selecciono "202607" en el resumen
    Entonces veo los totales en "$ 0,00"
    Y el resultado neto es "$ 0,00"

  @display
  Escenario: Resumen con múltiples entradas suma correctamente
    Dado que existen entradas de ingreso por "$ 35.000" y egreso por "$ 85.000"
    Cuando consulto el resumen del período "202606"
    Entonces el total de ingresos es "$ 35.000,00"
    Y el total de egresos es "$ 85.000,00"
    Y el resultado neto es "-$ 50.000,00" en rojo

  @display
  Escenario: Selector de período muestra todos los períodos disponibles
    Cuando navego a la pestaña "Resumen"
    Y abro el selector de período
    Entonces veo los períodos "202605" y "202606" como opciones
