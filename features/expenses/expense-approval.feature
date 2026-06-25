# language: es

Característica: Aprobación y rechazo de gastos extraordinarios
  Como administrador
  Quiero aprobar o rechazar gastos extraordinarios
  Para controlar los gastos que requieren autorización

  Antecedentes:
    Dado que el servidor MSW está configurado
    Y inicié sesión como ADMIN
    Y existe un gasto extraordinario "Reparación de cubierta terraza" en estado PENDING
    Y existe un gasto ordinario "Mantenimiento ascensores" en estado APPROVED

  @happy-path @optimistic
  Escenario: Aprobar un gasto extraordinario
    Cuando navego a "/expenses/550e8400-e29b-41d4-a716-446655440705"
    Y veo los botones "Aprobar" y "Rechazar"
    Y hago clic en "Aprobar"
    Entonces el estado cambia inmediatamente a "APPROVED"
    Y los botones de aprobación y rechazo desaparecen

  @happy-path
  Escenario: Rechazar un gasto extraordinario con confirmación
    Cuando navego a "/expenses/550e8400-e29b-41d4-a716-446655440705"
    Y hago clic en "Rechazar"
    Entonces veo un diálogo de confirmación "¿Rechazar este gasto extraordinario?"
    Cuando confirmo el rechazo
    Entonces el estado cambia a "REJECTED"
    Y los botones de aprobación y rechazo desaparecen

  @error-state @optimistic
  Escenario: Rollback de aprobación ante error del servidor
    Dado que el endpoint "/api/v1/expenses/550e8400-e29b-41d4-a716-446655440705/approve" devuelve error 422
    Cuando hago clic en "Aprobar"
    Entonces el estado cambia momentáneamente a "APPROVED"
    Y al recibir el error vuelve a "PENDING"
    Y los botones de aprobación y rechazo reaparecen
    Y veo una notificación "No se pudo aprobar el gasto"

  @error-state @optimistic
  Escenario: Rollback de rechazo ante error del servidor
    Dado que el endpoint "/api/v1/expenses/550e8400-e29b-41d4-a716-446655440705/reject" devuelve error 422
    Cuando hago clic en "Rechazar" y confirmo
    Entonces al recibir el error el estado vuelve a "PENDING"
    Y los botones reaparecen
    Y veo una notificación "No se pudo rechazar el gasto"

  @display
  Escenario: Gasto ordinario no muestra botones de aprobación
    Cuando navego a "/expenses/550e8400-e29b-41d4-a716-446655440701"
    Entonces veo el estado "APPROVED"
    Y NO veo botones de "Aprobar" ni "Rechazar"

  @display
  Escenario: Gasto rechazado no muestra botón de aprobar
    Dado que el gasto extraordinario está en estado REJECTED
    Cuando navego a su página de detalle
    Entonces veo el estado "REJECTED"
    Y NO veo el botón "Aprobar"
