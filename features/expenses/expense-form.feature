# language: es

Característica: Validación del formulario de gastos
  Como administrador
  Quiero que el formulario de gastos valide los datos correctamente
  Para evitar errores al registrar gastos

  Antecedentes:
    Dado que el servidor MSW está configurado
    Y inicié sesión como ADMIN

  @validation
  Escenario: Campos obligatorios requeridos
    Cuando navego a "/expenses/new"
    Y hago clic en "Registrar Gasto" sin completar ningún campo
    Entonces veo errores de validación en los campos obligatorios
    Y el formulario NO se envía

  @validation
  Escenario: Costo debe ser positivo
    Cuando navego a "/expenses/new"
    Y completo el costo con "-500"
    Y completo los demás campos obligatorios
    Y hago clic en "Registrar Gasto"
    Entonces veo un error de validación en el campo de costo

  @display
  Escenario: Cambiar tipo muestra aviso de aprobación
    Cuando navego a "/expenses/new"
    Y el tipo está en "ORDINARIA"
    Entonces NO veo ningún aviso sobre aprobación
    Cuando cambio el tipo a "EXTRAORDINARIA"
    Entonces veo un aviso "Este gasto requerirá aprobación del administrador"

  @display
  Escenario: Campos de multiperíodo visibles con más de 1 término
    Cuando navego a "/expenses/new"
    Y el campo "Cantidad de períodos" está en 1
    Entonces NO veo el campo "Período actual"
    Cuando cambio "Cantidad de períodos" a 3
    Entonces veo el campo "Período actual" con valor 1

  @happy-path
  Escenario: Formulario se reinicia después de crear un gasto exitosamente
    Cuando navego a "/expenses/new"
    Y completo y envío el formulario exitosamente
    Y navego nuevamente a "/expenses/new"
    Entonces el formulario está vacío y sin errores
