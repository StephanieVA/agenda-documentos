import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlEvaluacionesComponent } from './control-evaluaciones.component';

describe('ControlEvaluacionesComponent', () => {
  let component: ControlEvaluacionesComponent;
  let fixture: ComponentFixture<ControlEvaluacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlEvaluacionesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ControlEvaluacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
