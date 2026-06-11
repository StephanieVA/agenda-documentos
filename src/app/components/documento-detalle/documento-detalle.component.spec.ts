import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentoDetalleComponent } from './documento-detalle.component';

describe('DocumentoDetalleComponent', () => {
  let component: DocumentoDetalleComponent;
  let fixture: ComponentFixture<DocumentoDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentoDetalleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DocumentoDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
