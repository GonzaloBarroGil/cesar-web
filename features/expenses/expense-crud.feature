# language: es

Característica: CRUD de gastos
  Como administrador
  Quiero registrar, consultar y eliminar gastos
  Para mantener el control de las expensas del consorcio

  Antecedentes:
    Dado que el servidor MSW está configurado
    Y inicié sesión como ADMIN
    Y existe un consorcio "Torre Norte" con período "202606" OPEN

  @happy-path
  Escenario: Crear un gasto ordinario
    Cuando navego a "/expenses/new"
    Y selecciono "Torre Norte" en el selector de consorcio
    Y selecciono "202606" en el selector de período
    Y selecciono "A" en el grupo
    Y selecciono "Mantenimiento de ascensores" en concepto
    Y selecciono "Mantenimiento" en categoría
    Y selecciono "ELEVADORES SRL" en proveedor
    Y completo la descripción con "Mantenimiento mensual ascensores"
    Y completo el costo total con "45000"
    Y verifico que el tipo está en "ORDINARIA"
    Y hago clic en "Registrar Gasto"
    Entonces soy redirigido a "/expenses/:id"
    Y veo el estado "APPROVED"
    Y NO veo botones de aprobación o rechazo

  @happy-path
  Escenario: Crear un gasto extraordinario
    Cuando navego a "/expenses/new"
    Y cambio el tipo a "EXTRAORDINARIA"
    Y completo todos los campos obligatorios
    Y hago clic en "Registrar Gasto"
    Entonces soy redirigido a la página de detalle
    Y veo el estado "PENDING"
    Y veo información sobre la necesidad de aprobación

  @happy-path
  Escenario: Listar gastos con filtros
    Dado que existen gastos registrados para "Torre Norte"
    Cuando navego a "/expenses"
    Entonces veo una tabla de gastos con columnas de descripción, grupo, tipo y costo
    Y veo filtros para consorcio, período, tipo y estado
    Y el costo se muestra formateado en pesos argentinos

  @empty-state
  Escenario: Lista de gastos vacía
    Dado que no hay gastos para el período seleccionado
    Cuando navego a "/expenses"
    Entonces veo el mensaje "No hay gastos registrados para este período"
    Y veo un botón "Registrar Gasto"

  @happy-path
  Escenario: Ver detalle de un gasto
    Dado que existe un gasto ordinario de mantenimiento de ascensores
    Cuando navego a "/expenses/550e8400-e29b-41d4-a716-446655440701"
    Entonces veo el costo total "$ 45.000,00"
    Y veo el proveedor "ELEVADORES SRL"
    Y veo la pestaña "Historial de Versiones"

  @happy-path
  Escenario: Eliminar un gasto con confirmación
    Dado que existe un gasto activo
    Cuando navego a la página de detalle del gasto
    Y hago clic en "Eliminar"
    Entonces veo un diálogo de confirmación con un campo opcional de motivo
    Cuando confirmo la eliminación
    Entonces el gasto aparece como anulado
    Y ya no se muestra en la lista de gastos activos

  @happy-path
  Escenario: Ver historial de versiones
    Dado que existe un gasto con al menos una versión
    Cuando navego a la página de detalle
    Y hago clic en la pestaña "Historial de Versiones"
    Entonces veo una tabla con número de versión, fecha y hash SHA-256
    Y el hash se puede copiar al portapapeles
