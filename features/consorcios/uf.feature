# language: es

Característica: Configuración de unidades funcionales
  Como administrador
  Quiero configurar las unidades funcionales con sus porcentajes
  Para que el prorrateo de expensas se calcule correctamente

  Antecedentes:
    Dado que el servidor MSW está configurado
    Y inicié sesión como ADMIN
    Y existe un consorcio "Torre Norte" con ID "550e8400-e29b-41d4-a716-446655440001"

  @happy-path
  Escenario: Agregar una unidad funcional
    Cuando navego a "/consorcios/550e8400-e29b-41d4-a716-446655440001/ufs"
    Y hago clic en "Agregar UF"
    Y completo el código con "3B"
    Y completo el piso con "3"
    Y completo la unidad con "B"
    Y completo el porcentaje del grupo A con "25.00"
    Y completo el porcentaje del grupo B con "30.00"
    Y completo el porcentaje del grupo C con "30.00"
    Y hago clic en "Guardar"
    Entonces veo la nueva UF "3B" en la tabla
    Y la suma del grupo A es 100%
    Y la suma del grupo B es 100%
    Y la suma del grupo C es 95%

  @validation
  Escenario: Porcentajes que exceden 100% muestran advertencia
    Cuando navego a "/consorcios/550e8400-e29b-41d4-a716-446655440001/ufs"
    Y edito la UF "1A" cambiando el porcentaje del grupo A a "80.00"
    Entonces veo una advertencia "Grupo A: 140%. La suma debe ser 100%"
    Y el botón "Guardar" está deshabilitado

  @validation
  Escenario: Porcentajes debajo de 100% muestran advertencia
    Cuando navego a "/consorcios/550e8400-e29b-41d4-a716-446655440001/ufs"
    Y edito la UF "1A" cambiando el porcentaje del grupo A a "10.00"
    Entonces veo una advertencia "Grupo A: 70%. La suma debe ser 100%"
    Y el botón "Guardar" está deshabilitado

  @happy-path
  Escenario: Editar porcentajes de una UF
    Dado que las UFs están configuradas con porcentajes que suman 100%
    Cuando navego a "/consorcios/550e8400-e29b-41d4-a716-446655440001/ufs"
    Y cambio el porcentaje del grupo A de UF "1A" de "40.00" a "45.00"
    Y cambio el porcentaje del grupo A de UF "2A" de "25.00" a "20.00"
    Y hago clic en "Guardar"
    Entonces las UFs se actualizan exitosamente
    Y las sumas de cada grupo siguen siendo 100%

  @happy-path
  Escenario: Marcar UF como exenta de un grupo
    Dado que las UFs están configuradas
    Cuando navego a "/consorcios/550e8400-e29b-41d4-a716-446655440001/ufs"
    Y activo la exención del grupo C para la UF "1B"
    Y hago clic en "Guardar"
    Entonces la UF "1B" muestra el indicador de exención en el grupo C

  @validation
  Escenario: Eliminar la única UF no exenta de un grupo
    Dado que solo la UF "1B" contribuye al grupo C
    Cuando intento marcar la UF "1B" como exenta del grupo C
    Entonces veo un error "Al menos una UF debe contribuir al grupo C"
    Y la exención no se aplica
