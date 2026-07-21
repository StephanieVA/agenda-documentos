import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { CommonModule } from '@angular/common';
import { EvaluacionesService } from '../../services/evaluaciones.service';

@Component({
  selector: 'app-control-evaluaciones',
  standalone: true,
  imports: [CommonModule],
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

  // Reporte 5 (Sumatoria 200% = Unidad I + Unidad II)
  reporteSumatoria200: any[] = [];

  // Reporte 6 (Sumatoria 100% = Unidad I + Unidad II) - asignaturas bien configuradas
  reporteSumatoria100: any[] = [];

  // Modal docente
  modalDocenteOpen = false;
  docenteSeleccionado = '';
  evaluacionesDocente: any[] = [];

  //DATOS ESTADISTICOS
  estadisticaUnidad1: any[] = [];
  estadisticaUnidad2: any[] = [];

  cumplenU1 = 0;
  faltanU1 = 0;

  cumplenU2 = 0;
  faltanU2 = 0;

  porcentajeU1 = 0;
  porcentajeU2 = 0;
  constructor(private evaluacionesService: EvaluacionesService) {}

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
    //DATOS ESTADISTICOS
    let totalEsperadoU1 = 0;
    let totalEsperadoU2 = 0;

    this.estadisticaUnidad1 = [];
    this.estadisticaUnidad2 = [];

    cursos.forEach((curso: any) => {
      // cantidad real de asignaturas
      totalEsperadoU1 += curso.unidad1 / 100;
      totalEsperadoU2 += curso.unidad2 / 100;

      if (curso.unidad1 === 100) {
        this.estadisticaUnidad1.push({
          curso: curso.curso,
          programa: curso.facultad,
          estado: 'Correcto',
        });
      } else {
        this.estadisticaUnidad1.push({
          curso: curso.curso,
          programa: curso.facultad,
          estado: 'Falta completar',
        });
      }

      if (curso.unidad2 === 100) {
        this.estadisticaUnidad2.push({
          curso: curso.curso,
          programa: curso.facultad,
          estado: 'Correcto',
        });
      } else {
        this.estadisticaUnidad2.push({
          curso: curso.curso,
          programa: curso.facultad,
          estado: 'Falta completar',
        });
      }
    });

    this.cumplenU1 = this.estadisticaUnidad1.filter(
      (x) => x.estado === 'Correcto',
    ).length;
    this.faltanU1 = this.estadisticaUnidad1.length - this.cumplenU1;

    this.cumplenU2 = this.estadisticaUnidad2.filter(
      (x) => x.estado === 'Correcto',
    ).length;
    this.faltanU2 = this.estadisticaUnidad2.length - this.cumplenU2;

    this.porcentajeU1 = (this.cumplenU1 * 100) / this.estadisticaUnidad1.length;
    this.porcentajeU2 = (this.cumplenU2 * 100) / this.estadisticaUnidad2.length;
    // REPORTE 1
    this.reporteDiferente100 = cursos.filter(
      (x: any) =>
        (x.unidad1 !== 100 || x.unidad2 !== 100) &&
        !(x.unidad1 === 100 && x.unidad2 === 0) &&
        !(x.unidad1 === 0 && x.unidad2 === 0) &&
        x.unidad1 + x.unidad2 !== 400,
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

    // REPORTE 5 (exactamente 200% en unidad1+unidad2)
    this.reporteSumatoria200 = cursos.filter(
      (x: any) => x.unidad1 + x.unidad2 === 400,
    );

    // REPORTE 6 (exactamente 100% en unidad1+unidad2)
    this.reporteSumatoria100 = cursos.filter(
      (x: any) => x.unidad1 + x.unidad2 === 200,
    );

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
  abrirModalDocente(docente: string, programa: string, curso: string) {
  this.docenteSeleccionado = docente;

  this.evaluacionesDocente = this.datosExcel
    .filter((f: any) =>
      f.CoordinatorFullName === docente &&
      f.CareerName === programa &&
      `${f.CourseCode}-${f.CourseName}` === curso
    )
    .map((f: any) => ({
      programa: f.CareerName,
      asignatura: `${f.CourseCode}-${f.CourseName}`,
      unidad: Number(f.UnitNumber),
      porcentaje: Number(f.Percentage)
    }))
    .sort((a, b) => a.unidad - b.unidad);

  this.modalDocenteOpen = true;
}

  cerrarModalDocente() {
    this.modalDocenteOpen = false;
    this.docenteSeleccionado = '';
    this.evaluacionesDocente = [];
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

    const reporte5Excel = this.reporteSumatoria200.map((x) => ({
      Programa: x.facultad,
      Asignatura: x.curso,
      Docente: x.docente,
      'Unidad I (%)': x.unidad1,
      'Unidad II (%)': x.unidad2,
      Sumatoria: x.unidad1 + x.unidad2,
    }));

    const reporte6Excel = this.reporteSumatoria100.map((x) => ({
      Programa: x.facultad,
      Asignatura: x.curso,
      Docente: x.docente,
      'Unidad I (%)': x.unidad1,
      'Unidad II (%)': x.unidad2,
      Sumatoria: x.unidad1 + x.unidad2,
    }));

    const wb = XLSX.utils.book_new();

    const ws1 = XLSX.utils.json_to_sheet(reporte1Excel);
    const ws2 = XLSX.utils.json_to_sheet(reporte2Excel);
    const ws3 = XLSX.utils.json_to_sheet(reporte3Excel);
    const ws4 = XLSX.utils.json_to_sheet(reporte4Excel);
    const ws5 = XLSX.utils.json_to_sheet(reporte5Excel);
    const ws6 = XLSX.utils.json_to_sheet(reporte6Excel);

    XLSX.utils.book_append_sheet(wb, ws1, 'Reporte_1');
    XLSX.utils.book_append_sheet(wb, ws2, 'Reporte_2');
    XLSX.utils.book_append_sheet(wb, ws3, 'Reporte_3');
    XLSX.utils.book_append_sheet(wb, ws4, 'Reporte_4');
    XLSX.utils.book_append_sheet(wb, ws5, 'Reporte_5');
    XLSX.utils.book_append_sheet(wb, ws6, 'Reporte_6');

    XLSX.writeFile(wb, 'Control_Evaluaciones.xlsx');
    this.evaluacionesService.reporte1 = this.reporteDiferente100;
    this.evaluacionesService.reporte2 = this.reporteUnidad2Cero;
    this.evaluacionesService.reporte3 = this.reporteDosUnidadesCero;
    this.evaluacionesService.reporte4 = this.reporteTresUnidades;
    this.evaluacionesService.reporte5 = this.reporteSumatoria200;
    this.evaluacionesService.reporte6 = this.reporteSumatoria100;
  }
}
