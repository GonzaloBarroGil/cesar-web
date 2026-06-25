# language: es

Característica: Autenticación y gestión de sesión
  Como administrador o contador de un consorcio
  Quiero iniciar sesión con mi usuario y contraseña
  Para acceder a las funciones del sistema según mi rol

  Antecedentes:
    Dado que el servidor MSW está configurado
    Y existe un usuario "admin" con contraseña "admin123" y rol ADMIN
    Y existe un usuario "contador" con contraseña "contador123" y rol ACCOUNTANT

  @happy-path
  Escenario: Inicio de sesión exitoso como ADMIN
    Cuando visito la página "/login"
    Y completo el campo "Usuario" con "admin"
    Y completo el campo "Contraseña" con "admin123"
    Y hago clic en el botón "Iniciar Sesión"
    Entonces veo que el botón se deshabilita y muestra un indicador de carga
    Y soy redirigido a la página "/"
    Y la barra lateral muestra los enlaces de navegación para ADMIN

  @happy-path @role-guard
  Escenario: Inicio de sesión exitoso como ACCOUNTANT
    Cuando visito la página "/login"
    Y completo el campo "Usuario" con "contador"
    Y completo el campo "Contraseña" con "contador123"
    Y hago clic en el botón "Iniciar Sesión"
    Entonces soy redirigido a la página "/invoices"
    Y la barra lateral NO muestra enlaces de administración

  @validation
  Escenario: Inicio de sesión con credenciales inválidas
    Cuando visito la página "/login"
    Y completo el campo "Usuario" con "admin"
    Y completo el campo "Contraseña" con "contraseña_incorrecta"
    Y hago clic en el botón "Iniciar Sesión"
    Entonces veo un mensaje de error "Credenciales inválidas. Verifique usuario y contraseña."
    Y el botón "Iniciar Sesión" vuelve a estar habilitado
    Y el campo "Usuario" conserva el valor "admin"
    Y el campo "Contraseña" está vacío

  @error-state @offline
  Escenario: Inicio de sesión con error de conexión
    Dado que el endpoint "/api/v1/auth/login" devuelve un error de red
    Cuando visito la página "/login"
    Y completo el formulario con credenciales válidas
    Y hago clic en el botón "Iniciar Sesión"
    Entonces veo una notificación "Error de conexión. Intente nuevamente."
    Y la notificación incluye un botón "Reintentar"
    Y el botón "Iniciar Sesión" vuelve a estar habilitado

  @happy-path
  Escenario: Restauración de sesión al recargar la página
    Dado que inicié sesión como ADMIN
    Y tengo un token JWT válido en sessionStorage
    Cuando recargo la página
    Entonces veo un indicador de carga mientras se valida la sesión
    Y el sistema llama a GET "/api/v1/auth/me"
    Y al recibir respuesta exitosa soy redirigido a la página actual
    Y la barra lateral muestra mi nombre de usuario

  @error-state
  Escenario: Token expirado al recargar la página
    Dado que tengo un token JWT expirado en sessionStorage
    Cuando recargo la página
    Entonces el sistema llama a GET "/api/v1/auth/me"
    Y recibe un error 401
    Y el token es eliminado de sessionStorage
    Y soy redirigido a la página "/login"
    Y NO veo ninguna notificación de error

  @happy-path
  Escenario: Cierre de sesión
    Dado que inicié sesión como ADMIN
    Y estoy en la página principal
    Cuando hago clic en el botón "Cerrar Sesión" en el menú de usuario
    Entonces el token es eliminado de sessionStorage
    Y el caché de consultas es limpiado
    Y soy redirigido a la página "/login"
    Y NO puedo navegar a rutas protegidas sin iniciar sesión nuevamente

  @error-state
  Escenario: Token expirado durante la sesión activa
    Dado que inicié sesión como ADMIN
    Y estoy en la página de gastos
    Cuando el token expira y cualquier llamada a la API devuelve 401
    Entonces veo una notificación "Su sesión ha expirado. Inicie sesión nuevamente."
    Y el token es eliminado de sessionStorage
    Y el caché de consultas es limpiado
    Y soy redirigido a la página "/login"

  @role-guard
  Escenario: Contador intenta acceder a ruta de administrador
    Dado que inicié sesión como ACCOUNTANT
    Cuando intento navegar a "/consorcios"
    Entonces soy redirigido a "/invoices"
    Y NO veo ninguna notificación de error

  @role-guard
  Escenario: Usuario no autenticado accede a ruta protegida
    Dado que NO he iniciado sesión
    Cuando intento navegar a "/expenses"
    Entonces soy redirigido a "/login?redirect=/expenses"
    Y después de iniciar sesión exitosamente soy redirigido a "/expenses"

  @happy-path
  Escenario: Restauración de URL después de inicio de sesión
    Dado que NO he iniciado sesión
    Cuando visito la URL "/debt"
    Y soy redirigido a "/login?redirect=/debt"
    Y completo el formulario con credenciales válidas de ADMIN
    Y hago clic en "Iniciar Sesión"
    Entonces soy redirigido a "/debt"

  @display
  Escenario: Indicador de salud muestra servicios en línea
    Dado que inicié sesión como ADMIN
    Y el endpoint "/api/v1/health" responde con estado "ok"
    Cuando estoy en cualquier página de la aplicación
    Entonces veo un indicador verde en el pie de página
    Y al pasar el cursor sobre el indicador veo el texto "Servicios operativos"
