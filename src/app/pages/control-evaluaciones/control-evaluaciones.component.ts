import { Component } from '@angular/core';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-control-evaluaciones',
  standalone: true,
  imports: [],
  templateUrl: './control-evaluaciones.component.html',
  styleUrl: './control-evaluaciones.component.scss',
})
export class ControlEvaluacionesComponent {
  archivoExcel: any;
  tab = 1;
  datosExcel: any[] = [];

  resultado: any[] = [];

  // Reporte 1
  reporteDiferente100: any[] = [];

  // Reporte 2
  reporteUnidad2Cero: any[] = [];

  // Reporte 3
  reporteDosUnidadesCero: any[] = [];

  // Reporte 4
  reporteTresUnidades: any[] = [];

  seleccionarArchivo(event: any) {
    this.archivoExcel = event.target.files[0];
  }
  procesarExcel() {
    const reader = new FileReader();

    reader.readAsArrayBuffer(this.archivoExcel);

    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);

      const workbook = XLSX.read(data, { type: 'array' });

      const hoja = workbook.Sheets[workbook.SheetNames[0]];

      this.datosExcel = XLSX.utils.sheet_to_json(hoja);

      console.log(this.datosExcel);

      this.generarResumen();
    };
  }
  generarResumen() {
    const resumen: any = {};

    this.datosExcel.forEach((fila: any) => {
      const clave =
        fila.CareerName + '|' + fila.CourseCode + '-' + fila.CourseName;

      if (!resumen[clave]) {
        resumen[clave] = {
          facultad: fila.CareerName,

          curso: fila.CourseCode + '-' + fila.CourseName,

          docente: fila.CoordinatorFullName,

          unidad1: 0,

          unidad2: 0,

          unidad3: 0,
        };
      }

      if (Number(fila.UnitNumber) === 1) {
        resumen[clave].unidad1 += Number(fila.Percentage);
      }

      if (Number(fila.UnitNumber) === 2) {
        resumen[clave].unidad2 += Number(fila.Percentage);
      }
      if (Number(fila.UnitNumber) === 3) {
        resumen[clave].unidad3 += Number(fila.Percentage);
      }
    });

    this.resultado = Object.values(resumen);
    const cursos = Object.values(resumen) as any[];
    // REPORTE 1
    this.reporteDiferente100 = cursos.filter(
      (x) =>
        (x.unidad1 !== 100 || x.unidad2 !== 100) &&
        !(x.unidad1 === 100 && x.unidad2 === 0) &&
        !(x.unidad1 === 0 && x.unidad2 === 0),
    );

    // REPORTE 2
    this.reporteUnidad2Cero = cursos.filter(
      (x: any) =>
        (x.unidad1 === 100 && x.unidad2 === 0) ||
        (x.unidad1 === 0 && x.unidad2 === 100),
    );

    // REPORTE 3
    this.reporteDosUnidadesCero = cursos.filter(
      (x: any) => x.unidad1 === 0 && x.unidad2 === 0,
    );

    // REPORTE 4
    this.reporteTresUnidades = cursos.filter((x: any) => x.unidad3 > 0);

    this.resultado = this.resultado.filter(
      (x: any) => x.unidad1 !== 100 || x.unidad2 !== 100,
    );
    cursos.forEach((curso: any) => {
      let observacion = '';

      if (curso.unidad1 === 100 && curso.unidad2 === 0) {
        observacion = 'Unidad II sin evaluaciones';
      } else if (curso.unidad1 === 0 && curso.unidad2 === 100) {
        observacion = 'Unidad I sin evaluaciones';
      } else if (curso.unidad1 === 0 && curso.unidad2 === 0) {
        observacion = 'Sin evaluaciones';
      } else if (curso.unidad3 > 0) {
        observacion = 'Asignatura con tres unidades';
      } else if (curso.unidad1 !== 100 || curso.unidad2 !== 100) {
        observacion = 'Porcentaje diferente a 100%';
      }

      curso.observacion = observacion;
    });
    console.log(this.resultado);
  }
  exportarExcel() {
    const reporte1Excel = this.reporteDiferente100.map((x) => ({
      Programa: x.facultad,
      Asignatura: x.curso,
      Docente: x.docente,
      'Unidad I (%)': x.unidad1,
      'Unidad II (%)': x.unidad2,
      Observación: x.observacion,
    }));

    const reporte2Excel = this.reporteUnidad2Cero.map((x) => ({
      Programa: x.facultad,
      Asignatura: x.curso,
      Docente: x.docente,
      'Unidad I (%)': x.unidad1,
      'Unidad II (%)': x.unidad2,
      Observación: x.observacion,
    }));

    const reporte3Excel = this.reporteDosUnidadesCero.map((x) => ({
      Programa: x.facultad,
      Asignatura: x.curso,
      Docente: x.docente,
      'Unidad I (%)': x.unidad1,
      'Unidad II (%)': x.unidad2,
      Observación: x.observacion,
    }));

    const reporte4Excel = this.reporteTresUnidades.map((x) => ({
      Programa: x.facultad,
      Asignatura: x.curso,
      Docente: x.docente,
      'Unidad I (%)': x.unidad1,
      'Unidad II (%)': x.unidad2,
      'Unidad III (%)': x.unidad3,
      Observación: x.observacion,
    }));

    const wb = XLSX.utils.book_new();

    const ws1 = XLSX.utils.json_to_sheet(reporte1Excel);
    const ws2 = XLSX.utils.json_to_sheet(reporte2Excel);
    const ws3 = XLSX.utils.json_to_sheet(reporte3Excel);
    const ws4 = XLSX.utils.json_to_sheet(reporte4Excel);

    XLSX.utils.book_append_sheet(wb, ws1, 'Reporte_1');
    XLSX.utils.book_append_sheet(wb, ws2, 'Reporte_2');
    XLSX.utils.book_append_sheet(wb, ws3, 'Reporte_3');
    XLSX.utils.book_append_sheet(wb, ws4, 'Reporte_4');

    XLSX.writeFile(wb, 'Control_Evaluaciones.xlsx');
  }
}
