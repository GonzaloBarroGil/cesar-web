# language: es

Característica: Gestión de propietarios
  Como administrador
  Quiero registrar y consultar propietarios e inquilinos
  Para mantener actualizado el padrón de cada consorcio

  Antecedentes:
    Dado que el servidor MSW está configurado
    Y inicié sesión como ADMIN
    Y existe un consorcio "Torre Norte" con ID "550e8400-e29b-41d4-a716-446655440001"

  @happy-path
  Escenario: Registrar un propietario
    Cuando navego a "/consorcios/550e8400-e29b-41d4-a716-446655440001/propietarios/new"
    Y selecciono "CUIT" en el tipo de documento
    Y completo el campo "CUIT/CUIL/DNI" con "20111111111"
    Y completo el campo "Nombre Completo" con "Roberto Carlos Gómez"
    Y selecciono "RI" en "Condición IVA"
    Y completo el campo "Email" con "rgomez@email.com"
    Y completo el campo "Teléfono" con "1155550201"
    Y selecciono "UF 1A" en el selector de unidad
    Y marco la casilla "Es propietario"
    Y hago clic en "Registrar Propietario"
    Entonces soy redirigido a la lista de propietarios
    Y veo a "Roberto Carlos Gómez" en la tabla

  @validation
  Escenario: CUIT con formato inválido muestra error
    Cuando navego a "/consorcios/550e8400-e29b-41d4-a716-446655440001/propietarios/new"
    Y selecciono "CUIT" en el tipo de documento
    Y completo el campo "CUIT/CUIL/DNI" con "12345"
    Y completo los campos obligatorios restantes
    Y hago clic en "Registrar Propietario"
    Entonces veo un mensaje de error "CUIT inválido. Debe tener 11 dígitos" debajo del campo

  @happy-path
  Escenario: Listar propietarios de un consorcio
    Dado que existen propietarios registrados en "Torre Norte"
    Cuando navego a "/consorcios/550e8400-e29b-41d4-a716-446655440001"
    Y hago clic en la pestaña "Propietarios"
    Entonces veo una tabla con los propietarios registrados
    Y cada fila muestra nombre, CUIT, IVA, unidad y email

  @empty-state
  Escenario: Lista de propietarios vacía
    Dado que el consorcio no tiene propietarios registrados
    Cuando navego a la pestaña "Propietarios"
    Entonces veo el mensaje "No hay propietarios registrados"
    Y veo un botón "Registrar el primero"

  @happy-path
  Escenario: Buscar propietario por CUIT
    Dado que existe un propietario con CUIT "20123456781"
    Cuando en la pestaña "Propietarios" ingreso "20123456781" en el campo de búsqueda
    Y hago clic en "Buscar"
    Entonces veo al propietario "Juan Carlos López" en los resultados

  @error-state
  Escenario: Buscar propietario por CUIT no encontrado
    Dado que no existe un propietario con CUIT "20999999991"
    Cuando en la pestaña "Propietarios" ingreso "20999999991" en el campo de búsqueda
    Y hago clic en "Buscar"
    Entonces veo el mensaje "No se encontró propietario con ese CUIT/CUIL/DNI"

  @happy-path
  Escenario: Registrar un inquilino (no propietario)
    Cuando navego a "/consorcios/550e8400-e29b-41d4-a716-446655440001/propietarios/new"
    Y completo los datos de un inquilino
    Y NO marco la casilla "Es propietario"
    Y hago clic en "Registrar Propietario"
    Entonces el inquilino aparece en la tabla con la etiqueta "Inquilino"
