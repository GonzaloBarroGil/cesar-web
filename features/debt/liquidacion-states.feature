# language: es

Característica: Estados de liquidación
  Como administrador
  Quiero gestionar los estados de las liquidaciones
  Para controlar el ciclo de vida de las expensas

  Antecedentes:
    Dado que el servidor MSW está configurado
    Y inicié sesión como ADMIN

  @happy-path @optimistic @confirmation
  Escenario: Emitir una liquidación con confirmación
    Dado que existe una liquidación DRAFT para UF 1A
    Cuando navego a "/debt/550e8400-e29b-41d4-a716-446655440901"
    Y hago clic en "Emitir"
    Entonces veo un diálogo "¿Emitir esta liquidación? Una vez emitida no podrá modificarse"
    Cuando confirmo la emisión
    Entonces el estado cambia a "ISSUED" inmediatamente
    Y el botón "Emitir" desaparece

  @error-state @optimistic
  Escenario: Rollback de emisión ante error
    Dado que existe una liquidación DRAFT
    Y el endpoint de emisión devuelve error
    Cuando intento emitir y confirmo
    Entonces el estado vuelve a "DRAFT"
    Y el botón "Emitir" reaparece
    Y veo una notificación "No se pudo emitir la liquidación"

  @display
  Escenario: Liquidación DRAFT muestra aviso de recalculable
    Dado que existe una liquidación DRAFT
    Cuando navego a su página de detalle
    Entonces veo un aviso "Esta liquidación puede ser recalculada"

  @display
  Escenario: Liquidación ISSUED muestra aviso de inmutable
    Dado que existe una liquidación ISSUED
    Cuando navego a su página de detalle
    Entonces veo una insignia "EMITIDA" con texto "No puede modificarse"

  @display
  Escenario: Batch omite unidades con liquidación ya emitida
    Dado que la UF 1A tiene una liquidación ISSUED para "202606"
    Y las demás UFs no tienen liquidación
    Cuando ejecuto una generación batch para "202606"
    Entonces la UF 1A no recibe una nueva liquidación
    Y las demás UFs reciben liquidaciones DRAFT
