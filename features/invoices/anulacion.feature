# language: es

Característica: Anulación de documentos
  Como administrador
  Quiero anular facturas, notas y recibos
  Para corregir errores y mantener el cumplimiento fiscal

  Antecedentes:
    Dado que el servidor MSW está configurado
    Y existe un usuario ADMIN
    Y existe un usuario ACCOUNTANT

  @happy-path @optimistic @confirmation
  Escenario: ADMIN anula una factura con confirmación
    Dado que inicié sesión como ADMIN
    Y existe una Factura A activa
    Cuando navego a la página de detalle de la factura
    Y hago clic en "Anular"
    Entonces veo un diálogo con mensaje "¿Anular esta factura?" y un campo de motivo opcional
    Cuando confirmo la anulación
    Entonces la factura muestra estado "ANULADA" inmediatamente
    Y el botón "Anular" desaparece
    Y la factura aparece tachada en la lista

  @role-guard
  Escenario: ACCOUNTANT no ve el botón de anular
    Dado que inicié sesión como ACCOUNTANT
    Y existe una Factura A activa
    Cuando navego a la página de detalle de la factura
    Entonces NO veo el botón "Anular"

  @error-state @optimistic
  Escenario: Rollback de anulación ante error del servidor
    Dado que inicié sesión como ADMIN
    Y el endpoint de anulación de factura devuelve error
    Cuando intento anular una factura y confirmo
    Entonces la factura vuelve a estado "ACTIVA"
    Y el botón "Anular" reaparece
    Y veo una notificación "No se pudo anular el documento"
