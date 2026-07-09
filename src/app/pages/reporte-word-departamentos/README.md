Componente: ReporteWordDepartamentosComponent

- Lee un Excel vía `xlsx`.
- Agrupa por `Departamento Académico`.
- Si el departamento (ignorando tildes/mayúsculas) pertenece a:
  Ciencias Agrarias, Ciencias Aplicadas, Antropología, Ingeniería Química, Educación,
  usa encabezado con `Carrera`.
- Si `Estado` está vacío o contiene patrones tipo “Pendiente”, muestra `Sin evaluación`.

Exporta a Word generando un HTML con `@page { size: landscape; }` y lo guarda como `.doc`.
