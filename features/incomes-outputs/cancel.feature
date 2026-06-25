# language: es

Característica: Cancelación de entradas
  Como administrador
  Quiero cancelar entradas registradas por error
  Para mantener la integridad del libro de caja

  Antecedentes:
    Dado que el servidor MSW está configurado
    Y inicié sesión como ADMIN
    Y existe una entrada de alquiler ACTIVA por "$ 35.000,00"

  @happy-path @optimistic @confirmation
  Escenario: Cancelar una entrada con confirmación
    Cuando navego a la página de detalle de la entrada
    Y hago clic en "Cancelar"
    Entonces veo un diálogo de confirmación con campo de motivo opcional
    Cuando confirmo la cancelación
    Entonces el estado cambia inmediatamente a "CANCELLED"
    Y la entrada aparece tachada en la lista
    Y el botón "Cancelar" desaparece

  @error-state @optimistic
  Escenario: Rollback de cancelación ante error
    Dado que el endpoint de cancelación devuelve error
    Cuando intento cancelar una entrada y confirmo
    Entonces el estado vuelve a "ACTIVE"
    Y el botón "Cancelar" reaparece
    Y veo una notificación "No se pudo cancelar la entrada"

  @display
  Escenario: Entradas canceladas aparecen grises en la lista
    Dado que existe una entrada cancelada
    Cuando navego a "/incomes-outputs"
    Entonces la entrada cancelada aparece en gris y tachada
    Y NO muestra el botón de acciones

  @error-state
  Escenario: No se puede actualizar una entrada cancelada
    Dado que una entrada está en estado CANCELLED
    Cuando navego a su página de detalle
    Entonces el formulario de edición NO está disponible

  @error-state
  Escenario: No se puede crear entrada en período archivado
    Dado que el período "202605" está ARCHIVED
    Cuando intento registrar una entrada en ese período
    Y hago clic en "Registrar"
    Entonces veo una notificación "No se pueden crear entradas en un período archivado"
