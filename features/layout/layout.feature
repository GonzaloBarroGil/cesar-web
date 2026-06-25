# language: es

Característica: Shell de aplicación y navegación
  Como administrador o contador
  Quiero una interfaz de navegación clara y adaptable
  Para acceder a los módulos según mi rol

  Antecedentes:
    Dado que el servidor MSW está configurado
    Y existe un consorcio "Torre Norte" en los datos de prueba

  @happy-path @role-guard
  Escenario: ADMIN ve todos los enlaces de navegación
    Dado que inicié sesión como ADMIN
    Cuando se carga la aplicación
    Entonces veo la barra lateral con los enlaces:
      | Inicio           |
      | Consorcios       |
      | Expensas         |
      | Facturación      |
      | Deuda            |
      | Pagos            |
      | Ingresos/Egresos |

  @happy-path @role-guard
  Escenario: ACCOUNTANT solo ve Facturación
    Dado que inicié sesión como ACCOUNTANT
    Cuando se carga la aplicación
    Entonces veo la barra lateral con un único enlace "Facturación"
    Y NO veo los enlaces de administración

  @happy-path
  Escenario: Navegación a un módulo resalta el enlace activo
    Dado que inicié sesión como ADMIN
    Cuando hago clic en "Expensas" en la barra lateral
    Entonces soy redirigido a la página "/expenses"
    Y el enlace "Expensas" aparece resaltado
    Y los demás enlaces no están resaltados

  @happy-path
  Escenario: Selector de consorcio muestra el consorcio activo
    Dado que inicié sesión como ADMIN
    Y tengo seleccionado el consorcio "Torre Norte"
    Cuando se carga la aplicación
    Entonces el selector de consorcio en el encabezado muestra "Torre Norte"

  @empty-state
  Escenario: Selector de consorcio vacío cuando no hay selección
    Dado que inicié sesión como ADMIN
    Y no tengo ningún consorcio seleccionado
    Cuando se carga la aplicación
    Entonces el selector de consorcio muestra el texto "Seleccionar consorcio"

  @display
  Escenario: Menú de usuario muestra nombre y rol
    Dado que inicié sesión como ADMIN
    Cuando se carga la aplicación
    Entonces veo "Administrador General" en el menú de usuario del encabezado

  @happy-path
  Escenario: Cerrar sesión desde el menú de usuario
    Dado que inicié sesión como ADMIN
    Y estoy en la página principal
    Cuando hago clic en el menú de usuario
    Y selecciono "Cerrar Sesión"
    Entonces soy redirigido a la página "/login"
    Y ya no puedo acceder a rutas protegidas

  @display
  Escenario: Ruta de navegación muestra las migas de pan correctas
    Dado que inicié sesión como ADMIN
    Cuando navego a "/expenses/550e8400-e29b-41d4-a716-446655440701"
    Entonces veo las migas de pan: "Inicio > Expensas > Detalle"

  @display
  Escenario: Barra lateral se abre y cierra en vista móvil
    Dado que la ventana tiene un ancho menor a 768 píxeles
    Y inicié sesión como ADMIN
    Cuando se carga la aplicación
    Entonces la barra lateral está oculta
    Y veo un botón de menú tipo hamburguesa en el encabezado
    Cuando hago clic en el botón de menú
    Entonces la barra lateral se desliza desde la izquierda
    Y el fondo se oscurece
    Cuando hago clic fuera de la barra lateral
    Entonces la barra lateral se cierra

  @display
  Escenario: Barra lateral móvil se cierra al seleccionar enlace
    Dado que la ventana tiene un ancho menor a 768 píxeles
    Y inicié sesión como ADMIN
    Y la barra lateral móvil está abierta
    Cuando hago clic en "Expensas"
    Entonces la barra lateral se cierra
    Y soy redirigido a "/expenses"

  @display
  Escenario: Indicador de salud muestra punto verde
    Dado que inicié sesión como ADMIN
    Y el endpoint "/api/v1/health" responde con estado "ok"
    Cuando estoy en cualquier página de la aplicación
    Entonces veo un punto verde en el pie de página
    Y al pasar el cursor sobre el punto veo el texto "Servicios operativos"

  @display
  Escenario: Diseño adaptable muestra barra lateral persistente en escritorio
    Dado que la ventana tiene un ancho de al menos 768 píxeles
    Y inicié sesión como ADMIN
    Cuando se carga la aplicación
    Entonces la barra lateral está visible de forma persistente
    Y NO veo el botón de menú tipo hamburguesa
