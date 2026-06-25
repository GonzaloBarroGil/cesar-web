# language: es

Característica: Gestión de proveedores
  Como administrador
  Quiero registrar y gestionar proveedores
  Para asociarlos a los gastos del consorcio

  Antecedentes:
    Dado que el servidor MSW está configurado
    Y inicié sesión como ADMIN

  @happy-path
  Escenario: Registrar un proveedor
    Cuando navego a "/expenses/providers/new"
    Y completo el campo "CUIT" con "30666666661"
    Y completo el campo "Nombre" con "PINTURAS DEL PLATA SA"
    Y selecciono "RI" en "Condición IVA"
    Y completo el campo "Email" con "facturas@pinturasdelplata.com.ar"
    Y completo el campo "Teléfono" con "1144440401"
    Y hago clic en "Registrar Proveedor"
    Entonces soy redirigido a la lista de proveedores
    Y veo "PINTURAS DEL PLATA SA" en la tabla

  @validation
  Escenario: CUIT duplicado muestra error
    Dado que existe un proveedor con CUIT "30555555551"
    Cuando navego a "/expenses/providers/new"
    Y completo el campo "CUIT" con "30555555551"
    Y completo los campos obligatorios restantes
    Y hago clic en "Registrar Proveedor"
    Entonces veo un mensaje de error "El CUIT ya está registrado como proveedor"

  @happy-path
  Escenario: Listar proveedores activos
    Dado que existen proveedores registrados
    Cuando navego a "/expenses/providers"
    Entonces veo una tabla con CUIT, nombre, condición IVA y email de cada proveedor
    Y solo se muestran los proveedores no anulados

  @empty-state
  Escenario: Lista de proveedores vacía
    Dado que no hay proveedores registrados
    Cuando navego a "/expenses/providers"
    Entonces veo el mensaje "Registre su primer proveedor"
    Y veo un botón "Registrar Proveedor"

  @happy-path
  Escenario: Editar un proveedor
    Dado que existe un proveedor "ELEVADORES SRL"
    Cuando navego a "/expenses/providers"
    Y hago clic en el proveedor "ELEVADORES SRL"
    Y cambio el email a "nuevo@elevadoressrl.com.ar"
    Y hago clic en "Guardar Cambios"
    Entonces el proveedor se actualiza con el nuevo email

  @happy-path
  Escenario: Anular un proveedor con confirmación
    Dado que existe un proveedor activo
    Cuando navego a "/expenses/providers"
    Y hago clic en "Anular" en el proveedor
    Entonces veo un diálogo de confirmación
    Cuando confirmo la anulación
    Entonces el proveedor desaparece de la lista activa
