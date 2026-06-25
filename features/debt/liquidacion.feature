# language: es

Característica: Liquidaciones de expensas
  Como administrador
  Quiero generar y consultar liquidaciones
  Para determinar cuánto debe pagar cada unidad funcional

  Antecedentes:
    Dado que el servidor MSW está configurado
    Y inicié sesión como ADMIN
    Y existe un consorcio "Torre Norte" con período "202606" OPEN
    Y existen gastos registrados para el período

  @happy-path
  Escenario: Generar liquidación para una unidad
    Cuando navego a "/debt"
    Y hago clic en "Generar Liquidación"
    Y selecciono "Torre Norte" como consorcio
    Y selecciono "202606" como período
    Y selecciono "UF 1A" como unidad funcional
    Y hago clic en "Generar"
    Entonces soy redirigido a la página de detalle
    Y veo el estado "DRAFT"
    Y veo el código de unidad "1A"
    Y veo la tabla de asignación de gastos

  @happy-path @confirmation
  Escenario: Generar liquidaciones para todas las unidades
    Cuando navego a "/debt"
    Y hago clic en "Generar Todas"
    Entonces veo un diálogo de confirmación con el período
    Cuando confirmo la acción
    Entonces la lista se actualiza con las nuevas liquidaciones
    Y cada liquidación está en estado DRAFT

  @happy-path
  Escenario: Listar liquidaciones con filtros
    Dado que existen liquidaciones para diferentes períodos
    Cuando navego a "/debt"
    Y aplico el filtro de período "202606"
    Entonces veo solo las liquidaciones del período "202606"
    Y cada fila muestra UF, período, estado y saldo actual formateado

  @empty-state
  Escenario: Lista de liquidaciones vacía
    Dado que no hay liquidaciones generadas
    Cuando navego a "/debt"
    Entonces veo el mensaje "No hay liquidaciones. Genere la primera"
    Y veo el botón "Generar Liquidación" destacado

  @display
  Escenario: Ver detalle con desglose financiero
    Dado que existe una liquidación DRAFT para UF 1A
    Cuando navego a "/debt/550e8400-e29b-41d4-a716-446655440901"
    Entonces veo la tabla de gastos con columnas de descripción, costo y porcentaje
    Y veo la tarjeta de resumen financiero con saldo anterior, gastos, pagos e intereses
    Y el saldo actual está destacado

  @display
  Escenario: Ver código QR en detalle de liquidación
    Dado que existe una liquidación
    Cuando navego a su página de detalle
    Entonces veo el código QR como imagen o enlace
    Y veo el hash SHA-256 con opción de copiar

  @display
  Escenario: Liquidación DRAFT muestra botón de emitir
    Dado que existe una liquidación en estado DRAFT
    Cuando navego a su página de detalle
    Entonces veo el botón "Emitir"
    Y el botón de PDF está deshabilitado con mensaje "Emita la liquidación primero"

  @display
  Escenario: Liquidación ISSUED oculta botón de emitir
    Dado que existe una liquidación en estado ISSUED
    Cuando navego a "/debt/550e8400-e29b-41d4-a716-446655440902"
    Entonces NO veo el botón "Emitir"
    Y el botón de PDF está deshabilitado con mensaje "Descarga de PDF no disponible próximamente"

  @display
  Escenario: Los montos se muestran formateados en pesos argentinos
    Dado que existe una liquidación con total de expensas "25.954,55"
    Cuando navego a su página de detalle
    Entonces veo "$ 25.954,55" en el total de expensas

  @error-state
  Escenario: Liquidación no encontrada
    Cuando navego a "/debt/00000000-0000-0000-0000-000000000000"
    Entonces veo el mensaje "Liquidación no encontrada"
    Y veo un enlace para volver a "/debt"
