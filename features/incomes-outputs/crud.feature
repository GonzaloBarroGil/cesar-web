# language: es

Característica: CRUD de ingresos y egresos
  Como administrador
  Quiero registrar y consultar entradas de ingresos y egresos
  Para llevar el control de caja del consorcio

  Antecedentes:
    Dado que el servidor MSW está configurado
    Y inicié sesión como ADMIN
    Y existe un consorcio "Torre Norte" con período "202606" OPEN

  @happy-path
  Escenario: Registrar un ingreso por alquiler con factura vinculada
    Cuando navego a "/incomes-outputs"
    Y hago clic en "Registrar Entrada"
    Y selecciono "INCOME" como dirección
    Y selecciono "Alquiler" como subtipo
    Entonces veo el campo para vincular una factura
    Y completo el monto con "35000"
    Y completo la fecha con "2026-06-10"
    Y completo la descripción con "Alquiler espacio publicitario"
    Y hago clic en "Registrar"
    Entonces la entrada aparece en la tabla como INGRESO

  @happy-path
  Escenario: Registrar un egreso temporal con etiqueta de migración
    Cuando navego a "/incomes-outputs"
    Y hago clic en "Registrar Entrada"
    Y selecciono "OUTPUT" como dirección
    Y selecciono "Salario (temp)" como subtipo
    Entonces NO veo el campo de factura vinculada
    Y completo el monto con "85000"
    Y completo la fecha con "2026-06-05"
    Y completo la descripción con "Aportes SUTERH"
    Y hago clic en "Registrar"
    Entonces la entrada aparece en la tabla como EGRESO
    Y veo una etiqueta "Migración pendiente"

  @happy-path
  Escenario: Filtrar entradas por dirección
    Dado que existen entradas de ingreso y egreso
    Cuando navego a "/incomes-outputs"
    Y hago clic en la pestaña "INGRESOS"
    Entonces veo solo las entradas de tipo INCOME

  @happy-path
  Escenario: Filtrar entradas por rango de fechas
    Dado que existen entradas en junio y mayo
    Cuando navego a "/incomes-outputs"
    Y selecciono el rango de fechas "2026-06-01" a "2026-06-30"
    Entonces veo solo las entradas de junio

  @display
  Escenario: Ver detalle de entrada con historial de versiones
    Dado que existe una entrada de alquiler por "$ 35.000,00"
    Cuando navego a "/incomes-outputs/550e8400-e29b-41d4-a716-446655441101"
    Entonces veo el monto "$ 35.000,00" con dirección "INGRESO"
    Y veo la etiqueta de subtipo "Alquiler"
    Y veo el hash SHA-256 con opción de copiar
    Y veo la pestaña "Historial de Versiones"

  @happy-path
  Escenario: Actualizar una entrada crea nueva versión
    Dado que existe una entrada de alquiler
    Cuando navego a su página de detalle
    Y cambio la descripción a "Alquiler modificado"
    Y hago clic en "Guardar Cambios"
    Entonces la descripción se actualiza
    Y el historial muestra una nueva versión

  @empty-state
  Escenario: Lista de entradas vacía
    Dado que no hay entradas registradas
    Cuando navego a "/incomes-outputs"
    Entonces veo el mensaje "No hay entradas registradas"
    Y veo el botón "Registrar Entrada" destacado

  @validation
  Escenario: Fecha fuera del rango del período
    Dado que el período "202606" tiene rango 2026-06-01 a 2026-06-30
    Cuando intento registrar una entrada con fecha "2026-07-15"
    Entonces veo un error "La fecha debe estar dentro del período"
