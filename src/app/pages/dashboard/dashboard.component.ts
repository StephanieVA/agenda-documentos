import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { DocumentoService } from '../../services/documento.service';

interface Seguimiento {
  fecha: Date;
  detalle: string;
}

interface Documento {
  id: number;
  numero: string;
  asunto: string;
  descripcion: string;
  estado: 'pendiente' | 'atencion' | 'finalizado';
  fechaCreacion?: Date;
  fechaInicio?: Date;
  fechaFin?: Date;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  numero = '';
  asunto = '';
  descripcion = '';
  documentos: Documento[] = [];
  seguimientos: any[] = [];
  documentoSeleccionado: any = null;
  nuevoSeguimiento = '';
  modalHistorial = false;

  ngOnInit(): void {
    this.cargarDocumentos();
  }

  cargarDocumentos() {
    this.documentoService.obtenerDocumentos().subscribe((respuesta: any) => {
      this.documentos = respuesta;
    });
  }

  guardarLocalStorage() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('documentos', JSON.stringify(this.documentos));
    }
  }

  agregarDocumento() {
    const documento = {
      numero: this.numero,
      asunto: this.asunto,
      descripcion: this.descripcion,
    };

    this.documentoService.guardarDocumento(documento).subscribe(() => {
      this.numero = '';
      this.asunto = '';
      this.descripcion = '';

      this.cargarDocumentos();
    });
  }

  atender(doc: any) {
    this.documentoService.actualizarEstado(doc.id, 'atencion').subscribe(() => {
      this.cargarDocumentos();
    });
  }

  finalizar(doc: any) {
    this.documentoService
      .actualizarEstado(doc.id, 'finalizado')
      .subscribe(() => {
        this.cerrarModal();

        this.cargarDocumentos();
      });
  }
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private documentoService: DocumentoService,
  ) {}

  abrirSeguimiento(doc: any) {
    this.documentoSeleccionado = doc;

    this.documentoService
      .obtenerSeguimientos(doc.id)
      .subscribe((respuesta: any) => {
        this.seguimientos = respuesta;
      });
  }
  cerrarModal() {
    this.documentoSeleccionado = null;
    this.nuevoSeguimiento = '';
  }
  agregarSeguimiento() {
    if (!this.nuevoSeguimiento.trim()) {
      return;
    }

    this.documentoService
      .guardarSeguimiento(this.documentoSeleccionado.id, this.nuevoSeguimiento)
      .subscribe(() => {
        this.nuevoSeguimiento = '';

        this.documentoService
          .obtenerSeguimientos(this.documentoSeleccionado.id)
          .subscribe((respuesta: any) => {
            this.seguimientos = respuesta;
          });
      });
  }
  eliminarSeguimiento(seg: any) {
    console.log('Eliminar', seg);

    if (!confirm('¿Eliminar seguimiento?')) {
      return;
    }

    this.documentoService.eliminarSeguimiento(seg.id).subscribe(() => {
      this.abrirSeguimiento(this.documentoSeleccionado);
    });
  }
  editarSeguimiento(seg: any) {
    console.log('Editar', seg);

    const texto = prompt('Editar seguimiento', seg.detalle);

    if (!texto) return;

    this.documentoService.editarSeguimiento(seg.id, texto).subscribe(() => {
      this.abrirSeguimiento(this.documentoSeleccionado);
    });
  }
  volverPendiente(doc: any) {
    this.documentoService
      .actualizarEstado(doc.id, 'pendiente')
      .subscribe(() => {
        this.cargarDocumentos();
      });
  }
  verHistorial(doc: any) {
    this.documentoSeleccionado = doc;

    this.documentoService.obtenerSeguimientos(doc.id).subscribe((data: any) => {
      this.seguimientos = data;

      this.modalHistorial = true;
    });
  }
  cerrarHistorial() {
    this.modalHistorial = false;
    this.documentoSeleccionado = null;
  }
}
