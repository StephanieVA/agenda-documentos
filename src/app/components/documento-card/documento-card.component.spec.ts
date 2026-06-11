import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentoCardComponent } from './documento-card.component';

describe('DocumentoCardComponent', () => {
  let component: DocumentoCardComponent;
  let fixture: ComponentFixture<DocumentoCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentoCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DocumentoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
