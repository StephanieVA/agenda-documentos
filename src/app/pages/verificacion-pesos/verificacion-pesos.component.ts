import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verificacion-pesos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verificacion-pesos.component.html',
  styleUrl: './verificacion-pesos.component.scss',
})
export class VerificacionPesosComponent {
  archivo!: File;

  tab = 1;

  reporteMenor100: any[] = [];

  reporteCorrecto100: any[] = [];

  reporteCero: any[] = [];

  seleccionarArchivo(event: any) {
    this.archivo = event.target.files[0];
  }

  procesarExcel() {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });

      const hoja = workbook.Sheets[workbook.SheetNames[0]];

      const datos = XLSX.utils.sheet_to_json(hoja);

      this.generarReportes(datos);
    };

    reader.readAsBinaryString(this.archivo);
  }

  generarReportes(datos: any[]) {
    const agrupados: any = {};

    datos.forEach((fila: any) => {
      const clave =
        fila.CareerName + '_' + fila.CourseCode + '_' + fila.CourseName;

      if (!agrupados[clave]) {
        agrupados[clave] = {
          facultad: fila.CareerName,

          curso: fila.CourseCode + ' - ' + fila.CourseName,

          docente: fila.CoordinatorFullName,

          unidad1: 0,
          unidad2: 0,
        };
      }

      const unidad = Number(fila.UnitNumber);

      const peso = Number(fila.UnitWeighing || 0);

      if (unidad === 1) {
        agrupados[clave].unidad1 += peso;
      }

      if (unidad === 2) {
        agrupados[clave].unidad2 += peso;
      }
    });

    this.reporteMenor100 = [];
    this.reporteCorrecto100 = [];
    this.reporteCero = [];

    Object.values(agrupados).forEach((curso: any) => {
      const total = curso.unidad1 + curso.unidad2;

      // REPORTE 3
      if (curso.unidad1 === 0 && curso.unidad2 === 0) {
        this.reporteCero.push(curso);
        return;
      }

      // REPORTE 2
      if (curso.unidad1 > 0 && curso.unidad2 > 0 && total === 100) {
        this.reporteCorrecto100.push(curso);
        return;
      }

      // REPORTE 1
      this.reporteMenor100.push({
        ...curso,
        observacion:
          'Unidad I: ' +
          curso.unidad1 +
          '% | Unidad II: ' +
          curso.unidad2 +
          '%',
      });
    });
  }
  exportarExcel() {
    const workbook = XLSX.utils.book_new();

    // REPORTE 1
    const hoja1 = XLSX.utils.json_to_sheet(
      this.reporteMenor100.map((x) => ({
        Programa: x.facultad,
        Asignatura: x.curso,
        Docente: x.docente,
        'Unidad I': x.unidad1 + '%',
        'Unidad II': x.unidad2 + '%',
        Observacion: x.observacion,
      })),
    );

    // REPORTE 2
    const hoja2 = XLSX.utils.json_to_sheet(
      this.reporteCorrecto100.map((x) => ({
        Programa: x.facultad,
        Asignatura: x.curso,
        Docente: x.docente,
        'Unidad I': x.unidad1 + '%',
        'Unidad II': x.unidad2 + '%',
      })),
    );

    // REPORTE 3
    const hoja3 = XLSX.utils.json_to_sheet(
      this.reporteCero.map((x) => ({
        Programa: x.facultad,
        Asignatura: x.curso,
        Docente: x.docente,
        'Unidad I': x.unidad1 + '%',
        'Unidad II': x.unidad2 + '%',
      })),
    );

    XLSX.utils.book_append_sheet(workbook, hoja1, 'Observados');

    XLSX.utils.book_append_sheet(workbook, hoja2, 'Correctos');

    XLSX.utils.book_append_sheet(workbook, hoja3, 'Sin Evaluacion');

    XLSX.writeFile(workbook, 'Verificacion_Pesos.xlsx');
  }
}
