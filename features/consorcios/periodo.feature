# language: es

Característica: Gestión de períodos fiscales
  Como administrador
  Quiero abrir, cerrar y archivar períodos fiscales
  Para controlar el ciclo de vida de las expensas

  Antecedentes:
    Dado que el servidor MSW está configurado
    Y inicié sesión como ADMIN
    Y existe un consorcio "Torre Norte" con ID "550e8400-e29b-41d4-a716-446655440001"

  @happy-path
  Escenario: Abrir un nuevo período fiscal
    Cuando navego a la pestaña "Períodos" del consorcio "Torre Norte"
    Y hago clic en "Abrir Período"
    Y completo el código con "202607"
    Y completo la fecha de inicio con "2026-07-01"
    Y completo la fecha de fin con "2026-07-31"
    Y confirmo la acción
    Entonces veo el nuevo período "202607" en la lista con estado OPEN

  @validation
  Escenario: Período duplicado muestra error
    Dado que existe un período "202606" para "Torre Norte"
    Cuando intento abrir un período con código "202606"
    Y confirmo la acción
    Entonces veo un mensaje de error "El período ya existe"

  @happy-path
  Escenario: Cerrar un período abierto con confirmación
    Dado que el período "202606" está en estado OPEN
    Cuando hago clic en "Cerrar" en el período "202606"
    Entonces veo un diálogo de confirmación "¿Cerrar el período 202606? No se podrán agregar nuevos gastos"
    Cuando confirmo el cierre
    Entonces el período "202606" cambia a estado CLOSED
    Y el botón "Cerrar" desaparece
    Y aparece el botón "Archivar"

  @happy-path
  Escenario: Archivar un período cerrado con confirmación
    Dado que el período "202605" está en estado CLOSED
    Cuando hago clic en "Archivar" en el período "202605"
    Entonces veo un diálogo de confirmación "¿Archivar el período 202605? Será de solo lectura"
    Cuando confirmo el archivado
    Entonces el período "202605" cambia a estado ARCHIVED
    Y el botón "Archivar" desaparece

  @error-state
  Escenario: Botón de cerrar no visible para período ya cerrado
    Dado que el período "202605" está en estado CLOSED
    Cuando veo la lista de períodos
    Entonces NO veo el botón "Cerrar" en el período "202605"
    Y veo el botón "Archivar" en el período "202605"

  @empty-state
  Escenario: Lista de períodos vacía
    Dado que el consorcio no tiene períodos fiscales
    Cuando navego a la pestaña "Períodos"
    Entonces veo el mensaje "Abra el primer período fiscal"
    Y veo un botón "Abrir Período" destacado
