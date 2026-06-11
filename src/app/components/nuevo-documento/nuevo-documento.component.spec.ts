import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevoDocumentoComponent } from './nuevo-documento.component';

describe('NuevoDocumentoComponent', () => {
  let component: NuevoDocumentoComponent;
  let fixture: ComponentFixture<NuevoDocumentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevoDocumentoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NuevoDocumentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
