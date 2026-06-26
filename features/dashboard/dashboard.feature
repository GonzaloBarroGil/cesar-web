# language: es

Característica: Panel de control
  Como administrador
  Quiero ver un resumen de métricas del consorcio
  Para tomar decisiones informadas sobre la administración

  Antecedentes:
    Dado que el servidor MSW está configurado
    Y inicié sesión como ADMIN
    Y existe un consorcio "Torre Norte" con período "202606" OPEN
    Y existen gastos, liquidaciones y pagos registrados

  @happy-path
  Escenario: El panel carga todas las tarjetas de métricas
    Cuando navego a "/"
    Entonces veo seis tarjetas de métricas en una grilla
    Y cada tarjeta muestra su valor formateado

  @display
  Escenario: Deuda total muestra la suma de saldos de liquidaciones
    Dado que existen liquidaciones activas para el período "202606"
    Cuando navego a "/"
    Entonces la tarjeta "Deuda Total" muestra la suma de los saldos actuales
    Y el monto está formateado en pesos argentinos
    Y NO incluye liquidaciones en estado DRAFT ni ISSUED de otro período

  @display
  Escenario: Tasa de cobranza muestra porcentaje con color
    Dado que la tasa de cobranza es mayor al 80%
    Cuando navego a "/"
    Entonces la tarjeta "Tasa de Cobranza" muestra el porcentaje en verde
    Y el valor se calcula como pagos sobre deuda más pagos

  @display
  Escenario: Pendientes de aprobación muestra conteo correcto
    Dado que existe un gasto EXTRAORDINARIA en estado PENDING
    Cuando navego a "/"
    Entonces la tarjeta "Pendientes" muestra "1"

  @happy-path
  Escenario: Cambiar período actualiza todas las métricas
    Cuando navego a "/"
    Y selecciono un período diferente en el selector
    Entonces las tarjetas muestran esqueletos temporalmente
    Y los valores se actualizan con los datos del nuevo período

  @display
  Escenario: Panel muestra esqueletos durante la carga inicial
    Cuando navego a "/" por primera vez
    Y las consultas aún no respondieron
    Entonces veo seis tarjetas con esqueletos de carga

  @empty-state
  Escenario: Estado vacío cuando no hay consorcio seleccionado
    Dado que no hay ningún consorcio seleccionado
    Cuando navego a "/"
    Entonces veo el mensaje "Seleccione un consorcio para ver el panel"

  @empty-state
  Escenario: Estado vacío para consorcio nuevo sin datos
    Dado que el consorcio no tiene gastos, liquidaciones ni pagos
    Cuando navego a "/"
    Entonces cada tarjeta muestra un mensaje contextual
    Y veo un botón "Comenzar" destacado

  @error-state
  Escenario: Tarjeta con error muestra botón de reintentar
    Dado que la consulta de liquidaciones falla
    Cuando navego a "/"
    Entonces la tarjeta "Deuda Total" muestra "No se pudo cargar"
    Y veo un botón "Reintentar" en esa tarjeta
    Y las demás tarjetas se cargan normalmente

  @display
  Escenario: Actividad reciente muestra últimos 5 pagos
    Dado que existen múltiples pagos registrados
    Cuando navego a "/"
    Entonces la tarjeta de actividad muestra los últimos 5 pagos
    Y los pagos están ordenados del más reciente al más antiguo

  @display
  Escenario: Ingresos y egresos muestra flujo neto coloreado
    Dado que los egresos superan a los ingresos
    Cuando navego a "/"
    Entonces la tarjeta de ingresos/egresos muestra el neto en rojo
    Y los ingresos y egresos se muestran por separado

  @display
  Escenario: Todas las tarjetas visibles en grilla en escritorio
    Dado que la ventana tiene un ancho de al menos 768 píxeles
    Cuando navego a "/"
    Entonces veo 2 filas de 3 tarjetas cada una
