import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerificacionPesosComponent } from './verificacion-pesos.component';

describe('VerificacionPesosComponent', () => {
  let component: VerificacionPesosComponent;
  let fixture: ComponentFixture<VerificacionPesosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerificacionPesosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerificacionPesosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
