# language: es

Característica: Gestión de consorcios
  Como administrador
  Quiero crear, ver y editar consorcios
  Para administrar las entidades legales del sistema

  Antecedentes:
    Dado que el servidor MSW está configurado
    Y inicié sesión como ADMIN

  @happy-path
  Escenario: Crear un consorcio exitosamente
    Cuando navego a "/consorcios/new"
    Y completo el campo "CUIT" con "30711111112"
    Y completo el campo "Razón Social" con "Consorcio Torre Sur"
    Y completo el campo "Nombre Fantasía" con "Torre Sur"
    Y completo el campo "Matrícula CABA" con "MAT-2024-001235"
    Y completo el campo "Domicilio" con "Av. Rivadavia 8500, CABA"
    Y selecciono "RI" en el campo "Condición IVA"
    Y hago clic en "Crear Consorcio"
    Entonces soy redirigido a la página de detalle del nuevo consorcio
    Y veo los datos ingresados en la sección General
    Y el estado del consorcio es "ACTIVE"

  @validation
  Escenario: CUIT duplicado muestra error
    Dado que existe un consorcio con CUIT "30711111111"
    Cuando navego a "/consorcios/new"
    Y completo el campo "CUIT" con "30711111111"
    Y completo los campos obligatorios restantes
    Y hago clic en "Crear Consorcio"
    Entonces veo un mensaje de error "El CUIT ya está registrado" debajo del campo CUIT
    Y el formulario conserva los datos ingresados

  @validation
  Escenario: CUIT inválido muestra error de formato
    Cuando navego a "/consorcios/new"
    Y completo el campo "CUIT" con "123"
    Y completo el campo "Razón Social" con "Test"
    Y hago clic en "Crear Consorcio"
    Entonces veo un mensaje de error "CUIT inválido. Debe tener 11 dígitos" debajo del campo CUIT

  @happy-path
  Escenario: Ver detalle de un consorcio
    Dado que existe un consorcio "Torre Norte"
    Cuando navego a "/consorcios/550e8400-e29b-41d4-a716-446655440001"
    Entonces veo la sección General con los datos del consorcio
    Y veo las pestañas "Unidades Funcionales", "Propietarios" y "Períodos"
    Y veo el botón "Editar" en la sección General

  @happy-path
  Escenario: Editar un consorcio
    Dado que existe un consorcio "Torre Norte"
    Cuando navego a "/consorcios/550e8400-e29b-41d4-a716-446655440001/edit"
    Y cambio el campo "Nombre Fantasía" a "Torre Norte Modificado"
    Y hago clic en "Guardar Cambios"
    Entonces soy redirigido a la página de detalle
    Y veo "Torre Norte Modificado" en el nombre

  @error-state
  Escenario: Consorcio no encontrado muestra error
    Cuando navego a "/consorcios/00000000-0000-0000-0000-000000000000"
    Entonces veo el mensaje "Consorcio no encontrado"
    Y veo un enlace para volver a "/consorcios"
