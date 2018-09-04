import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CoreComponent } from './core.component';
import { PublicationSelectionComponent } from './pages/publication-selection/publication-selection.component';
import { ElementSelectionComponent } from './pages/element-selection/element-selection.component';
import { BuilderComponent } from './pages/builder/builder.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { SyncComponent } from './pages/sync/sync.component';
import { GenerateComponent } from './pages/generate/generate.component';

import { AuthGuard } from './guards/auth.guard';
import { RoutDataService } from './services/rout-data.service';

const routes: Routes = [
  {
    path: '', component: CoreComponent, children: [
      { path: '', redirectTo: '/PublicationWizard/home', pathMatch: 'full' },
      { path: 'sync', component: SyncComponent, resolve:{activePub: RoutDataService} },
      { path: 'home', component: PublicationSelectionComponent, resolve:{activePub: RoutDataService} },
      { path: 'element-selection', component: ElementSelectionComponent, resolve:{activePub: RoutDataService} },
      { path: 'builder-elementlist', component: BuilderComponent, resolve:{activePub: RoutDataService} },
      { path: 'settings', component: SettingsComponent, resolve:{activePub: RoutDataService} },
      { path: 'generate', component: GenerateComponent, resolve:{activePub: RoutDataService} },
      { path: '**', component: PublicationSelectionComponent, resolve:{activePub: RoutDataService} }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [RoutDataService]
})
export class PublicationWizardRoutingModule { }
