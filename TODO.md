# TODO - Exportar reporte agrupado a Word

- [ ] Revisar cómo se ingresa/carga el Excel en el flujo actual.
- [ ] Crear nuevo componente standalone para exportar Word (no usar Control de Evaluaciones).
- [ ] Implementar lectura de Excel con `xlsx` desde el nuevo componente.
- [ ] Transformar filas del Excel a:
  - agrupación por `Departamento Académico`
  - tabla base con columnas `N° | Docente Principal | Curso | Sección | Ciclo | Eva. con Notas | Total Eva. | Estado`
  - tablas especiales para departamentos: Ciencias Agrarias, Ciencias Aplicadas, Antropología, Ingeniería Química, Educación (con encabezado `N° | Carrera | Docente Principal | Curso | Sección | Ciclo | Eva. con Notas | Total Eva. | Estado`).
- [ ] Normalizar `Estado`: si está vacío/pendiente => `Sin evaluación`.
- [ ] Implementar exportación Word horizontal (orientación horizontal) con título por departamento y debajo sus asignaturas.
- [x] Conectar la nueva vista al router (`app.routes.ts`).

- [ ] Validar con un Excel real:
  - orden/agrupación por departamento
  - encabezados especiales
  - estado
- [ ] Documentar cómo usar el nuevo componente.
