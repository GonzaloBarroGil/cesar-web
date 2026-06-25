# language: es

Característica: Notas de Crédito y Débito
  Como administrador o contador
  Quiero crear notas de crédito y débito vinculadas a facturas
  Para ajustar los montos facturados

  Antecedentes:
    Dado que el servidor MSW está configurado
    Y inicié sesión como ADMIN
    Y existe una Factura A por "$ 54.450,00" con ID "550e8400-e29b-41d4-a716-446655440801"

  @happy-path
  Escenario: Crear una Nota de Crédito vinculada
    Cuando navego a "/invoices/550e8400-e29b-41d4-a716-446655440801/nc/new"
    Y veo la información de la factura original
    Y selecciono el motivo "Devolución parcial"
    Y completo el monto con "10000"
    Y el disponible mostrado es "$ 54.450,00"
    Y hago clic en "Emitir Nota de Crédito"
    Entonces soy redirigido a la página de detalle de la NC
    Y veo el CAE y QR de la NC

  @validation
  Escenario: Monto de NC excede el disponible
    Cuando navego a "/invoices/550e8400-e29b-41d4-a716-446655440801/nc/new"
    Y completo el monto con "60000"
    Y el disponible mostrado es "$ 54.450,00"
    Y hago clic en "Emitir Nota de Crédito"
    Entonces veo un mensaje de error "El monto supera el disponible ($ 54.450,00)"

  @happy-path
  Escenario: Crear una Nota de Débito vinculada
    Cuando navego a "/invoices/550e8400-e29b-41d4-a716-446655440801/nd/new"
    Y selecciono el motivo "Intereses punitorios"
    Y completo el monto con "5000"
    Y hago clic en "Emitir Nota de Débito"
    Entonces soy redirigido a la página de detalle de la ND
    Y veo el CAE y QR de la ND

  @display
  Escenario: ND no tiene límite superior de monto
    Cuando navego a "/invoices/550e8400-e29b-41d4-a716-446655440801/nd/new"
    Y completo el monto con un valor cualquiera
    Entonces NO veo ninguna restricción de monto máximo
    Y puedo emitir la ND sin errores de límite

  @display
  Escenario: Selector de motivo muestra opciones adecuadas
    Cuando navego al formulario de Nota de Crédito
    Y abro el selector de motivo
    Entonces veo opciones como "Devolución parcial" y "Anulación total"
    Cuando navego al formulario de Nota de Débito
    Y abro el selector de motivo
    Entonces veo opciones como "Intereses punitorios" y "Ajuste"

  @happy-path @optimistic @confirmation
  Escenario: Anular una Nota de Crédito con confirmación
    Dado que existe una NC activa
    Cuando navego a su página de detalle
    Y hago clic en "Anular"
    Entonces veo un diálogo de confirmación
    Cuando confirmo la anulación
    Entonces el estado cambia inmediatamente a "ANULADA"

  @error-state @optimistic
  Escenario: Rollback al anular ante error
    Dado que el endpoint de anulación devuelve error
    Cuando intento anular una NC
    Y confirmo la acción
    Entonces el estado vuelve a "ACTIVA"
    Y veo una notificación "No se pudo anular el documento"
