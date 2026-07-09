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
    // Si el usuario ya cargó un Control, en ese caso vienen los reportes desde EvaluacionesService.
    if (
      (this.evaluacionesService.reporte1?.length || 0) +
        (this.evaluacionesService.reporte2?.length || 0) +
        (this.evaluacionesService.reporte3?.length || 0) +
        (this.evaluacionesService.reporte5?.length || 0) +
        (this.evaluacionesService.reporte6?.length || 0) >
      0
    ) {
      this.calcularEstadisticasDesdeReportes();
    }
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

      // NOTA: en Estadísticas debemos usar los reportes que se generan en ControlEvaluaciones.
      // Si el usuario abre aquí un archivo, esos reportes NO existen en EvaluacionesService,
      // por eso inicialmente quedaban en 0. Sin embargo, para que SÍ veas estadísticas,
      // calculamos usando el Excel cargado.
      // (Los métodos de abajo ya contemplan eso vía generarResumen.)
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

    this.calcularEstadisticasDesdeReportes();
  }

  calcularEstadisticasDesdeReportes() {
    // Si no hay reportes cargados por Control, no hay nada que estadisticamente reportar.
    // En ese caso, se llenarán con la ejecución de `generarResumen()` sobre el Excel.
    const totalReportes =
      (this.evaluacionesService.reporte1?.length || 0) +
      (this.evaluacionesService.reporte2?.length || 0) +
      (this.evaluacionesService.reporte3?.length || 0) +
      (this.evaluacionesService.reporte5?.length || 0) +
      (this.evaluacionesService.reporte6?.length || 0);

    if (totalReportes === 0) {
      // Si no hay reportes del Control, calculamos estadística directamente desde el Excel cargado.
      // Reutilizamos `datosExcel` (viene de sheet_to_json en procesarExcel()).
      const resumen: any = {};

      const asegurarCarrera = (carrera: string) => {
        if (!resumen[carrera]) {
          resumen[carrera] = {
            carrera,
            cumplenU1: 0,
            observadasU1: 0,
            cumplenU2: 0,
            observadasU2: 0,
          };
        }
      };

      // Lógica directa por unidad: si Percentage sumada por unidad da 100 => cumple.
      // En el Excel normalmente viene por fila (UnitNumber=1/2 con Percentage).
      // Aquí sumamos por curso+unidad y luego contamos por carrera.
      const mapCursoUnidad: Record<
        string,
        { unidad1: number; unidad2: number }
      > = {};

      for (const fila of this.datosExcel) {
        const claveCurso = `${fila.CareerName}|${fila.CourseCode}-${fila.CourseName}`;
        if (!mapCursoUnidad[claveCurso]) {
          mapCursoUnidad[claveCurso] = { unidad1: 0, unidad2: 0 };
        }

        if (Number(fila.UnitNumber) === 1) {
          mapCursoUnidad[claveCurso].unidad1 += Number(fila.Percentage);
        }
        if (Number(fila.UnitNumber) === 2) {
          mapCursoUnidad[claveCurso].unidad2 += Number(fila.Percentage);
        }
      }

      for (const key in mapCursoUnidad) {
        const [carrera] = key.split('|');
        asegurarCarrera(carrera);

        const { unidad1, unidad2 } = mapCursoUnidad[key];

        if (unidad1 === 100) resumen[carrera].cumplenU1 += 1;
        else resumen[carrera].observadasU1 += 1;

        if (unidad2 === 100) resumen[carrera].cumplenU2 += 1;
        else resumen[carrera].observadasU2 += 1;
      }

      this.estadisticasCarrera = Object.values(resumen).map((x: any) => {
        const totalU1 = x.cumplenU1 + x.observadasU1;
        const totalU2 = x.cumplenU2 + x.observadasU2;

        return {
          carrera: x.carrera,
          cumplenU1: x.cumplenU1,
          observadasU1: x.observadasU1,
          porcentajeU1:
            totalU1 === 0 ? '0.0' : ((x.cumplenU1 * 100) / totalU1).toFixed(1),
          cumplenU2: x.cumplenU2,
          observadasU2: x.observadasU2,
          porcentajeU2:
            totalU2 === 0 ? '0.0' : ((x.cumplenU2 * 100) / totalU2).toFixed(1),
        };
      });

      this.totalProgramas = this.estadisticasCarrera.length;
      this.cumplenTotalU1 = this.estadisticasCarrera.reduce(
        (acc: number, x: any) => acc + x.cumplenU1,
        0,
      );
      this.observadasTotalU1 = this.estadisticasCarrera.reduce(
        (acc: number, x: any) => acc + x.observadasU1,
        0,
      );
      this.cumplenTotalU2 = this.estadisticasCarrera.reduce(
        (acc: number, x: any) => acc + x.cumplenU2,
        0,
      );
      this.observadasTotalU2 = this.estadisticasCarrera.reduce(
        (acc: number, x: any) => acc + x.observadasU2,
        0,
      );

      this.crearGrafico();
      return;
    }

    const resumen: any = {};

    const asegurarCarrera = (carrera: string) => {
      if (!resumen[carrera]) {
        resumen[carrera] = {
          carrera,
          cumplenU1: 0,
          observadasU1: 0,
          cumplenU2: 0,
          observadasU2: 0,
        };
      }
    };

    // Tu clasificación base:
    // - Reporte 1 y 3: incumplieron (para ambos, no cumplen U1 y/o U2 según el caso)
    //   En el Excel de Control, unidad1/unidad2 traen porcentaje sumado por unidad.
    // - Reporte 2: cumplió solo la Unidad I (y no Unidad II) => U1=100, U2=0
    // - Reporte 5 y 6: cumplieron todo => U1=100 y U2=100

    // REPORTE 5 (cumple todo)
    this.evaluacionesService.reporte5.forEach((x: any) => {
      const carrera = x.facultad;
      asegurarCarrera(carrera);
      // por regla: cumple U1 y cumple U2
      resumen[carrera].cumplenU1 += 1;
      resumen[carrera].cumplenU2 += 1;
    });

    // REPORTE 6 (cumple todo)
    this.evaluacionesService.reporte6.forEach((x: any) => {
      const carrera = x.facultad;
      asegurarCarrera(carrera);
      resumen[carrera].cumplenU1 += 1;
      resumen[carrera].cumplenU2 += 1;
    });

    // REPORTE 2 (cumple solo U1 => U1=100, U2=0)
    this.evaluacionesService.reporte2.forEach((x: any) => {
      const carrera = x.facultad;
      asegurarCarrera(carrera);

      if (Number(x.unidad1) === 100) {
        resumen[carrera].cumplenU1 += 1;
        resumen[carrera].observadasU2 += 1;
      }

      if (Number(x.unidad2) === 100) {
        // Por si existiera el caso complementario en el dataset
        resumen[carrera].cumplenU2 += 1;
        resumen[carrera].observadasU1 += 1;
      }
    });

    // REPORTE 1 y 3: incumplimiento.
    // Interpretación robusta: contamos cumplimiento por unidad según si la unidad = 100.
    const procesarIncumplimiento = (reporte: any[]) => {
      reporte.forEach((x: any) => {
        const carrera = x.facultad;
        asegurarCarrera(carrera);

        if (Number(x.unidad1) === 100) {
          resumen[carrera].cumplenU1 += 1;
        } else {
          resumen[carrera].observadasU1 += 1;
        }

        if (Number(x.unidad2) === 100) {
          resumen[carrera].cumplenU2 += 1;
        } else {
          resumen[carrera].observadasU2 += 1;
        }
      });
    };

    procesarIncumplimiento(this.evaluacionesService.reporte1);
    procesarIncumplimiento(this.evaluacionesService.reporte3);

    // REPORTE 4 no se usa para U1/U2 en tu pedido; lo dejamos fuera.

    this.estadisticasCarrera = Object.values(resumen).map((x: any) => {
      const totalU1 = x.cumplenU1 + x.observadasU1;
      const totalU2 = x.cumplenU2 + x.observadasU2;

      return {
        carrera: x.carrera,
        cumplenU1: x.cumplenU1,
        observadasU1: x.observadasU1,
        porcentajeU1:
          totalU1 === 0 ? '0.0' : ((x.cumplenU1 * 100) / totalU1).toFixed(1),
        cumplenU2: x.cumplenU2,
        observadasU2: x.observadasU2,
        porcentajeU2:
          totalU2 === 0 ? '0.0' : ((x.cumplenU2 * 100) / totalU2).toFixed(1),
      };
    });

    this.totalProgramas = this.estadisticasCarrera.length;

    this.cumplenTotalU1 = this.estadisticasCarrera.reduce(
      (acc: number, x: any) => acc + x.cumplenU1,
      0,
    );

    this.observadasTotalU1 = this.estadisticasCarrera.reduce(
      (acc: number, x: any) => acc + x.observadasU1,
      0,
    );

    this.cumplenTotalU2 = this.estadisticasCarrera.reduce(
      (acc: number, x: any) => acc + x.cumplenU2,
      0,
    );

    this.observadasTotalU2 = this.estadisticasCarrera.reduce(
      (acc: number, x: any) => acc + x.observadasU2,
      0,
    );

    this.crearGrafico();
  }

  crearGrafico() {
    if (!this.graficoCumplimiento) return;

    const ctx = this.graficoCumplimiento.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.estadisticasCarrera.map((x: any) => x.carrera);

    const pctU1 = this.estadisticasCarrera.map((x: any) =>
      Number(x.porcentajeU1),
    );
    const pctU2 = this.estadisticasCarrera.map((x: any) =>
      Number(x.porcentajeU2),
    );

    const colorPorPct = (pct: number) => {
      if (pct >= 95) return '#28a745';
      if (pct >= 80) return '#ffc107';
      return '#dc3545';
    };

    const coloresU1 = pctU1.map(colorPorPct);
    const coloresU2 = pctU2.map(colorPorPct);

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Porcentaje U1',
            data: pctU1,
            backgroundColor: coloresU1,
            borderWidth: 0,
          },
          {
            label: 'Porcentaje U2',
            data: pctU2,
            backgroundColor: coloresU2,
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: (value) => `${value}%`,
            },
          },
        },
      },
    });
  }
}
