import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UnauthorisedComponent } from './components/unauthorised/unauthorised.component';

import { AuthGuard } from './login/guards/auth.guard';
import { MbGuard } from './login/guards/mb.guard';
import { PwGuard } from './login/guards/pw.guard'; 

const routes: Routes = [
  { path: '', redirectTo: '/Login', pathMatch: 'full' },
  { path: 'Login', loadChildren: 'app/login/login.module#LoginModule', canActivate: [AuthGuard]},
  { path: 'PublicationWizard', loadChildren: 'app/publication-wizard/publication-wizard.module#PublicationWizardModule', canActivate: [PwGuard] },
  { path: 'MarketingBoard', loadChildren: 'app/marketing-board/marketing-board.module#MarketingBoardModule', canActivate: [MbGuard] },
  { path: 'Unauthorised', component: UnauthorisedComponent },  
  { path: '**', redirectTo: '/Login' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: true })
  ],
  exports: [
    RouterModule
  ]
})

export class AppRoutingModule { }
