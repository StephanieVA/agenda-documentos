import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';

type FilaExcel = Record<string, any>;

type FilaReporte = {
  carrera: string;
  docente: string;
  curso: string;
  seccion: string;
  ciclo: string;
  evaConNotas: string;
  totalEva: string;
  estado: string;
};

@Component({
  selector: 'app-reporte-word-departamentos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reporte-word-departamentos.component.html',
  styleUrl: './reporte-word-departamentos.component.scss',
})
export class ReporteWordDepartamentosComponent {
  archivoExcel: File | null = null;
  filas: FilaExcel[] = [];

  departamentos: string[] = [];

  reporteDepartamentos = new Map<string, FilaReporte[]>();

  departamentoSeleccionado = '';

  filasDepartamento: FilaReporte[] = [];

  // Lista que indicaste con encabezado especial
  departamentosConCarreraEspecial = new Set<string>([
    'CIENCIAS AGRARIAS',
    'CIENCIAS APLICADAS',
    'ANTROPOLOGIA',
    'INGENIERIA QUIMICA',
    'EDUCACION',
  ]);

  seleccionarArchivo(event: any) {
    this.archivoExcel = event.target.files?.[0] ?? null;
  }

  procesarExcel() {
    if (!this.archivoExcel) return;

    const reader = new FileReader();
    reader.readAsArrayBuffer(this.archivoExcel);

    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const hoja = workbook.Sheets[workbook.SheetNames[0]];
      this.filas = XLSX.utils.sheet_to_json(hoja, {
        defval: '',
      }) as FilaExcel[];

      // Agrupar datos
      this.reporteDepartamentos = this.agruparPorDepartamento(this.filas);

      // Crear botones
      this.departamentos = Array.from(this.reporteDepartamentos.keys());
    };
  }

  seleccionarDepartamento(dep: string) {
    this.departamentoSeleccionado = dep;

    this.filasDepartamento = this.reporteDepartamentos.get(dep) || [];
  }

  exportarWord() {
    if (!this.filas?.length) return;

    const agrupado = this.agruparPorDepartamento(this.filas);

    // En Word, la “pestaña” real del navegador no aplica.
    // La equivalencia es crear páginas/secciones nuevas por departamento.
    const html = this.generarHtmlWord(agrupado);

    const blob = new Blob(
      [
        `<!doctype html><html><head><meta charset='utf-8'/>\n</head><body>${html}</body></html>`,
      ],
      { type: 'application/msword;charset=utf-8' },
    );

    const fileName = 'Reporte_Departamentos.doc';
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  private normalizarTexto(s: any): string {
    return String(s ?? '').trim();
  }

  private normalizarKeyDepartamento(dep: string): string {
    // Quita acentos/variantes y pasa a mayúsculas para comparar.
    // Nota: no usamos librerías externas; es heurístico.
    const base = dep
      .toString()
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return base;
  }

  private tomarCampo(fila: FilaExcel, keys: string[]): any {
    for (const k of keys) {
      if (fila[k] !== undefined) return fila[k];
    }
    return '';
  }

  private normalizarEstado(estado: any): string {
    const e = this.normalizarTexto(estado);
    if (!e) return 'Sin evaluación';

    // Si el Excel trae algo como "Pendiente" o "Pend." lo tratamos como sin evaluación.
    const up = e.toUpperCase();
    if (
      up === 'PENDIENTE' ||
      up.includes('PEND') ||
      (up.includes('SIN') && up.includes('EVAL'))
    ) {
      return 'Sin evaluación';
    }

    return e;
  }

  private agruparPorDepartamento(
    filas: FilaExcel[],
  ): Map<string, FilaReporte[]> {
    const map = new Map<string, FilaReporte[]>();

    for (const fila of filas) {
      const departamento = this.normalizarTexto(
        this.tomarCampo(fila, [
          'Departamento Académico',
          'Departamento Academico',
          'Departamento',
        ]),
      );

      if (!departamento) continue;

      const docente = this.normalizarTexto(
        this.tomarCampo(fila, [
          'Docente Principal',
          'Docente',
          'Coordinador',
          'Coordinador Docente',
        ]),
      );

      const carrera = this.normalizarTexto(this.tomarCampo(fila, ['Carrera']));
      const curso = this.normalizarTexto(
        this.tomarCampo(fila, ['Curso', 'Course']),
      );
      const seccion = this.normalizarTexto(
        this.tomarCampo(fila, ['Sección', 'Seccion']),
      );
      const ciclo = this.normalizarTexto(this.tomarCampo(fila, ['Ciclo']));
      const evaConNotas = this.normalizarTexto(
        this.tomarCampo(fila, [
          'Eva. con Notas',
          'Eva. con notas',
          'Eva con Notas',
          'Eva con notas',
          'Eva. con',
        ]),
      );
      const totalEva = this.normalizarTexto(
        this.tomarCampo(fila, ['Total Eva.', 'Total Eva', 'Total']),
      );

      const estado = this.normalizarEstado(this.tomarCampo(fila, ['Estado']));

      const item: FilaReporte = {
        docente,
        curso,
        seccion,
        ciclo,
        evaConNotas,
        totalEva,
        estado,
        carrera: carrera || '',
      };

      if (!map.has(departamento)) map.set(departamento, []);
      map.get(departamento)!.push(item);
    }

    // Orden por departamento y luego por curso/ciclo/sección
    const sorted = new Map<string, FilaReporte[]>();
    const depsOrdenados = Array.from(map.keys()).sort((a, b) =>
      a.localeCompare(b, 'es'),
    );

    for (const dep of depsOrdenados) {
      const rows = map.get(dep)!;
      rows.sort((a, b) => {
        const k1 = a.curso.localeCompare(b.curso, 'es');
        if (k1 !== 0) return k1;
        const k2 = a.seccion.localeCompare(b.seccion, 'es');
        if (k2 !== 0) return k2;
        return a.ciclo.localeCompare(b.ciclo, 'es');
      });
      sorted.set(dep, rows);
    }

    return sorted;
  }

  private generarHtmlWord(agrupado: Map<string, FilaReporte[]>) {
    const departamentosEspeciales = this.departamentosConCarreraEspecial;

    const css = `
      <style>
        @page { size: landscape; margin: 12mm; }
        body { font-family: Arial, Helvetica, sans-serif; }
        h2 { margin: 0 0 6px 0; font-size: 14pt; }
        .block { page-break-after: always; }
        .block:last-child { page-break-after: auto; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 10px; }
        th, td { border: 1px solid #000; padding: 4px 6px; font-size: 10.5pt; }
        th { background: #f2f2f2; font-weight: bold; text-align: left; }
        td { vertical-align: top; }
        .center { text-align: center; }
      </style>
    `;

    let html = css;

    for (const [departamento, rows] of agrupado.entries()) {
      const depKey = this.normalizarKeyDepartamento(departamento);
      const esEspecial = departamentosEspeciales.has(depKey);

      html += `<div class='block'>`;
      html += `<h2>DEPARTAMENTO: ${this.escapeHtml(departamento)}</h2>`;

      if (!rows.length) {
        html += `<p>No existen asignaturas.</p>`;
        html += `</div>`;
        continue;
      }

      const headers = esEspecial
        ? [
            'N°',
            'Carrera',
            'Docente Principal',
            'Curso',
            'Sección',
            'Ciclo',
            'Eva. con Notas',
            'Total Eva.',
            'Estado',
          ]
        : [
            'N°',
            'Docente Principal',
            'Curso',
            'Sección',
            'Ciclo',
            'Eva. con Notas',
            'Total Eva.',
            'Estado',
          ];

      html += '<table><thead><tr>';
      for (const h of headers) html += `<th>${this.escapeHtml(h)}</th>`;
      html += '</tr></thead><tbody>';

      rows.forEach((r, idx) => {
        html += '<tr>';
        if (esEspecial) {
          html += `<td class='center'>${idx + 1}</td>`;
          html += `<td>${this.escapeHtml(r.carrera ?? '')}</td>`;
          html += `<td>${this.escapeHtml(r.docente)}</td>`;
          html += `<td>${this.escapeHtml(r.curso)}</td>`;
          html += `<td>${this.escapeHtml(r.seccion)}</td>`;
          html += `<td>${this.escapeHtml(r.ciclo)}</td>`;
          html += `<td>${this.escapeHtml(r.evaConNotas)}</td>`;
          html += `<td>${this.escapeHtml(r.totalEva)}</td>`;
          html += `<td>${this.escapeHtml(r.estado)}</td>`;
        } else {
          html += `<td class='center'>${idx + 1}</td>`;
          html += `<td>${this.escapeHtml(r.docente)}</td>`;
          html += `<td>${this.escapeHtml(r.curso)}</td>`;
          html += `<td>${this.escapeHtml(r.seccion)}</td>`;
          html += `<td>${this.escapeHtml(r.ciclo)}</td>`;
          html += `<td>${this.escapeHtml(r.evaConNotas)}</td>`;
          html += `<td>${this.escapeHtml(r.totalEva)}</td>`;
          html += `<td>${this.escapeHtml(r.estado)}</td>`;
        }
        html += '</tr>';
      });

      html += '</tbody></table>';
      html += `</div>`;
    }

    return html;
  }

  private escapeHtml(s: any): string {
    return String(s ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '<')
      .replaceAll('>', '>')
      .replaceAll('"', '"')

      .replaceAll("'", '&#039;');
  }
}
