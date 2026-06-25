# language: es

Característica: Certificados de deuda
  Como administrador
  Quiero generar y firmar certificados de deuda
  Para crear títulos ejecutivos sobre deudas impagas

  Antecedentes:
    Dado que el servidor MSW está configurado
    Y inicié sesión como ADMIN
    Y existe una liquidación ISSUED para UF 1A

  @happy-path
  Escenario: Generar un certificado de deuda
    Cuando navego a "/debt/certificados"
    Y hago clic en "Generar Certificado"
    Y selecciono la liquidación emitida de UF 1A
    Y hago clic en "Generar"
    Entonces soy redirigido a la página de detalle del certificado
    Y veo el estado "VIGENTE"
    Y veo el monto de la deuda
    Y veo la fecha de vencimiento

  @display
  Escenario: Ver detalle de certificado con fecha de vencimiento
    Dado que existe un certificado VIGENTE
    Cuando navego a su página de detalle
    Entonces veo la liquidación vinculada
    Y veo la fecha de vencimiento
    Y veo el estado "VIGENTE"
    Y veo el botón "Firmar"

  @happy-path @optimistic @confirmation
  Escenario: Firmar un certificado con confirmación
    Dado que existe un certificado VIGENTE
    Cuando navego a su página de detalle
    Y hago clic en "Firmar"
    Entonces veo un diálogo de confirmación "¿Firmar este certificado? Se convertirá en título ejecutivo"
    Cuando confirmo la firma
    Entonces el estado cambia inmediatamente a "EJECUTADO"
    Y el botón "Firmar" desaparece
    Y veo que es título ejecutivo

  @display
  Escenario: Certificado EJECUTADO oculta botón de firmar
    Dado que existe un certificado EJECUTADO
    Cuando navego a su página de detalle
    Entonces NO veo el botón "Firmar"
    Y veo el estado "EJECUTADO"

  @error-state @optimistic
  Escenario: Rollback de firma ante error del servidor
    Dado que existe un certificado VIGENTE
    Y el endpoint de firma devuelve error
    Cuando intento firmar el certificado y confirmo
    Entonces el estado vuelve a "VIGENTE"
    Y el botón "Firmar" reaparece
    Y veo una notificación "No se pudo firmar el certificado"

  @empty-state
  Escenario: Lista de certificados vacía
    Dado que no hay certificados generados
    Cuando navego a "/debt/certificados"
    Entonces veo el mensaje "No hay certificados de deuda"
    Y veo el botón "Generar Certificado"

  @error-state
  Escenario: Certificado no encontrado
    Cuando navego a "/debt/certificados/00000000-0000-0000-0000-000000000000"
    Entonces veo el mensaje "Certificado no encontrado"
    Y veo un enlace para volver a "/debt/certificados"
