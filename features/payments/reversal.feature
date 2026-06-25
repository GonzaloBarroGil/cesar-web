# language: es

Característica: Reversión de pagos
  Como administrador
  Quiero revertir pagos registrados por error
  Para mantener la integridad contable del sistema

  Antecedentes:
    Dado que el servidor MSW está configurado
    Y inicié sesión como ADMIN
    Y existe un pago ACTIVO por "$ 18.000,00" con ID "550e8400-e29b-41d4-a716-446655441001"

  @happy-path @optimistic @confirmation
  Escenario: Revertir un pago con confirmación
    Cuando navego a "/payments"
    Y hago clic en "Revertir" en el pago de "$ 18.000,00"
    Entonces veo un diálogo de confirmación con campo de motivo opcional
    Cuando confirmo la reversión
    Entonces el estado del pago cambia a "REVERSED" inmediatamente
    Y el botón "Revertir" desaparece
    Y aparece un nuevo registro compensatorio en la lista

  @error-state @optimistic
  Escenario: Rollback de reversión ante error
    Dado que el endpoint de reversión devuelve error
    Cuando intento revertir un pago y confirmo
    Entonces el estado vuelve a "ACTIVE"
    Y el botón "Revertir" reaparece
    Y veo una notificación "No se pudo revertir el pago"

  @display
  Escenario: Pago REVERSED oculta botón de revertir
    Dado que existe un pago en estado REVERSED
    Cuando navego a "/payments"
    Entonces NO veo el botón "Revertir" en ese pago

  @display
  Escenario: Reversión crea registro compensatorio en la lista
    Dado que se revierte un pago exitosamente
    Cuando navego a "/payments"
    Entonces veo el pago original como "REVERSED"
    Y veo una nueva entrada compensatoria en la lista

  @error-state
  Escenario: No se puede revertir un pago ya revertido
    Dado que un pago ya está en estado REVERSED
    Cuando el sistema intenta revertirlo nuevamente
    Entonces el endpoint devuelve error 422
    Y veo una notificación "El pago ya fue revertido"
