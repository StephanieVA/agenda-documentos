import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadisticasEvaluacionesComponent } from './estadisticas-evaluaciones.component';

describe('EstadisticasEvaluacionesComponent', () => {
  let component: EstadisticasEvaluacionesComponent;
  let fixture: ComponentFixture<EstadisticasEvaluacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadisticasEvaluacionesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EstadisticasEvaluacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
