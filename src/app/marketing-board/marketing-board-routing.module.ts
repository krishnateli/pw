import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CoreComponent } from './core.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

const routes: Routes = [
  { 
    path: '', component: CoreComponent, children: [
      { path: '', redirectTo: '/MarketingBoard/Dashboard', pathMatch: 'full' },
      { path: 'Dashboard', component: DashboardComponent },
      { path: '**', redirectTo: '/MarketingBoard/Dashboard' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketingBoardRoutingModule { }
