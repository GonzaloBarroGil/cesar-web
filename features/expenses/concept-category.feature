# language: es

Característica: Conceptos y categorías
  Como administrador
  Quiero gestionar conceptos y categorías de gastos
  Para organizar y clasificar los gastos del consorcio

  Antecedentes:
    Dado que el servidor MSW está configurado
    Y inicié sesión como ADMIN

  @happy-path
  Escenario: Crear un concepto
    Cuando navego a "/expenses/concepts"
    Y hago clic en "Nuevo Concepto"
    Y completo el nombre con "Pintura de fachada"
    Y selecciono el grupo "C"
    Y completo la descripción con "Mantenimiento de pintura exterior"
    Y hago clic en "Crear"
    Entonces el concepto aparece en la tabla bajo el grupo C
    Y veo la descripción en la fila

  @happy-path
  Escenario: Listar conceptos agrupados
    Dado que existen conceptos en los grupos A, B y C
    Cuando navego a "/expenses/concepts"
    Entonces veo los conceptos agrupados por grupo
    Y cada grupo muestra su letra (A, B, C) como encabezado

  @happy-path
  Escenario: Filtrar conceptos por grupo
    Dado que existen conceptos en varios grupos
    Cuando navego a "/expenses/concepts"
    Y hago clic en la pestaña "A"
    Entonces veo solo los conceptos del grupo A
    Y NO veo conceptos de los grupos B o C

  @happy-path
  Escenario: Crear una categoría
    Cuando navego a "/expenses/categories"
    Y hago clic en "Nueva Categoría"
    Y completo el nombre con "Jardinería"
    Y selecciono el grupo "A"
    Y hago clic en "Crear"
    Entonces la categoría aparece en la tabla bajo el grupo A

  @happy-path
  Escenario: Listar categorías agrupadas
    Dado que existen categorías en los grupos A y B
    Cuando navego a "/expenses/categories"
    Entonces veo las categorías agrupadas por grupo

  @empty-state
  Escenario: Lista de conceptos vacía
    Dado que no hay conceptos registrados
    Cuando navego a "/expenses/concepts"
    Entonces veo el mensaje "Cree su primer concepto"
    Y veo un botón "Nuevo Concepto" destacado
