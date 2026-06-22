import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { Chart, registerables } from 'chart.js';
import { EvaluacionesService } from '../../services/evaluaciones.service';

Chart.register(...registerables);

@Component({
  selector: 'app-estadisticas-evaluaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estadisticas-evaluaciones.component.html',
  styleUrl: './estadisticas-evaluaciones.component.scss',
})
export class EstadisticasEvaluacionesComponent {
  @ViewChild('graficoCumplimiento', { static: false })
  graficoCumplimiento!: ElementRef<HTMLCanvasElement>;

  chart: any;

  archivoExcel: any;
  datosExcel: any[] = [];
  cursos: any[] = [];

  estadisticasCarrera: any[] = [];
  totalProgramas = 0;

  cumplenTotalU1 = 0;
  observadasTotalU1 = 0;

  cumplenTotalU2 = 0;
  observadasTotalU2 = 0;

  constructor(private evaluacionesService: EvaluacionesService) {}
  ngOnInit() {
    this.calcularEstadisticas();
  }

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
          programa: fila.CareerName,

          curso: fila.CourseCode + '-' + fila.CourseName,

          unidad1: 0,

          unidad2: 0,
        };
      }

      if (Number(fila.UnitNumber) === 1) {
        resumen[clave].unidad1 += Number(fila.Percentage);
      }

      if (Number(fila.UnitNumber) === 2) {
        resumen[clave].unidad2 += Number(fila.Percentage);
      }
    });

    this.cursos = Object.values(resumen);

    this.calcularEstadisticas();
  }

  calcularEstadisticas() {
    const resumen: any = {};

    // REPORTE 6
    this.evaluacionesService.reporte6.forEach((x: any) => {
      const carrera = x.facultad;

      if (!resumen[carrera]) {
        resumen[carrera] = {
          carrera,
          cumplenU1: 0,
          observadasU1: 0,
          cumplenU2: 0,
          observadasU2: 0,
        };
      }

      resumen[carrera].cumplenU1++;
      resumen[carrera].cumplenU2++;
    });

    // REPORTE 2
    this.evaluacionesService.reporte2.forEach((x: any) => {
      const carrera = x.facultad;

      if (!resumen[carrera]) {
        resumen[carrera] = {
          carrera,
          cumplenU1: 0,
          observadasU1: 0,
          cumplenU2: 0,
          observadasU2: 0,
        };
      }

      if (x.unidad1 === 100) {
        resumen[carrera].cumplenU1++;
        resumen[carrera].observadasU2++;
      }

      if (x.unidad2 === 100) {
        resumen[carrera].cumplenU2++;
        resumen[carrera].observadasU1++;
      }
    });
    this.evaluacionesService.reporte1.forEach((x: any) => {
      const carrera = x.facultad;

      if (!resumen[carrera]) {
        resumen[carrera] = {
          carrera,
          cumplenU1: 0,
          observadasU1: 0,
          cumplenU2: 0,
          observadasU2: 0,
        };
      }

      // U1
      resumen[carrera].cumplenU1 += Math.floor(x.unidad1 / 100);

      if (x.unidad1 % 100 !== 0) {
        resumen[carrera].observadasU1++;
      }

      // U2
      resumen[carrera].cumplenU2 += Math.floor(x.unidad2 / 100);

      if (x.unidad2 % 100 !== 0) {
        resumen[carrera].observadasU2++;
      }
    });
    this.evaluacionesService.reporte5.forEach((x: any) => {
      const carrera = x.facultad;

      if (!resumen[carrera]) {
        resumen[carrera] = {
          carrera,
          cumplenU1: 0,
          observadasU1: 0,
          cumplenU2: 0,
          observadasU2: 0,
        };
      }

      resumen[carrera].cumplenU1 += 2;
      resumen[carrera].cumplenU2 += 2;
    });
    this.estadisticasCarrera = Object.values(resumen).map((x: any) => ({
      carrera: x.carrera,

      cumplenU1: x.cumplenU1,

      observadasU1: x.observadasU1,

      porcentajeU1: (
        (x.cumplenU1 * 100) /
        (x.cumplenU1 + x.observadasU1)
      ).toFixed(1),

      cumplenU2: x.cumplenU2,

      observadasU2: x.observadasU2,

      porcentajeU2: (
        (x.cumplenU2 * 100) /
        (x.cumplenU2 + x.observadasU2)
      ).toFixed(1),
    }));
    this.totalProgramas = this.estadisticasCarrera.length;

    this.cumplenTotalU1 = this.estadisticasCarrera.reduce(
      (acc: any, x: any) => acc + x.cumplenU1,
      0,
    );

    this.observadasTotalU1 = this.estadisticasCarrera.reduce(
      (acc: any, x: any) => acc + x.observadasU1,
      0,
    );

    this.cumplenTotalU2 = this.estadisticasCarrera.reduce(
      (acc: any, x: any) => acc + x.cumplenU2,
      0,
    );

    this.observadasTotalU2 = this.estadisticasCarrera.reduce(
      (acc: any, x: any) => acc + x.observadasU2,
      0,
    );
  }

  crearGrafico() {
    const coloresU1 = this.estadisticasCarrera.map((x) => {
      if (x.porcentajeU1 >= 95) return '#28a745';

      if (x.porcentajeU1 >= 80) return '#ffc107';

      return '#dc3545';
    });
    const coloresU2 = this.estadisticasCarrera.map((x) => {
      if (x.porcentajeU2 >= 95) return '#28a745';

      if (x.porcentajeU2 >= 80) return '#ffc107';

      return '#dc3545';
    });
    backgroundColor: coloresU1;
    backgroundColor: coloresU2;
  }
}
