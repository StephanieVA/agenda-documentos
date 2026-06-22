import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ControlEvaluacionesComponent } from './pages/control-evaluaciones/control-evaluaciones.component';
import { VerificacionPesosComponent } from './pages/verificacion-pesos/verificacion-pesos.component';
import { EstadisticasEvaluacionesComponent } from './pages/estadisticas-evaluaciones/estadisticas-evaluaciones.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'seguimiento',
    pathMatch: 'full',
  },

  {
    path: 'seguimiento',
    component: DashboardComponent,
  },

  {
    path: 'evaluaciones',
    component: ControlEvaluacionesComponent,
  },
  {
    path: 'estadisticas',
    component: EstadisticasEvaluacionesComponent,
  },

  {
    path: 'pesos',
    component: VerificacionPesosComponent,
  },
];
