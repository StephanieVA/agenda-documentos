import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DocumentoService {
  api = 'https://agenda-api-production-c2ba.up.railway.app';

  constructor(private http: HttpClient) {}

  obtenerDocumentos() {
    return this.http.get(`${this.api}/documentos`);
  }

  guardarDocumento(documento: any) {
    return this.http.post(`${this.api}/documentos`, documento);
  }

  actualizarEstado(id: number, estado: string) {
    return this.http.put(`${this.api}/documentos/${id}/estado`, {
      estado,
    });
  }
  guardarSeguimiento(documentoId: number, detalle: string) {
    return this.http.post(`${this.api}/seguimientos`, {
      documento_id: documentoId,
      detalle: detalle,
    });
  }

  obtenerSeguimientos(documentoId: number) {
    return this.http.get(`${this.api}/seguimientos/${documentoId}`);
  }

  editarSeguimiento(id: number, detalle: string) {
    return this.http.put(`${this.api}/seguimientos/${id}`, { detalle });
  }

  eliminarSeguimiento(id: number) {
    return this.http.delete(`${this.api}/seguimientos/${id}`);
  }
}
