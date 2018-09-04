import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarketingBoardRoutingModule } from './marketing-board-routing.module';
import { SharedModule } from '../shared/shared.module';

import { DashboardComponent } from './pages/dashboard/dashboard.component';

import { WidgetSettingComponent } from './components/widget-setting/widget-setting.component';
import { StatisticsOfProductStateComponent } from './components/statistics-of-product-state/statistics-of-product-state.component';

import { StatisticsOfProductStateService } from "./components/statistics-of-product-state/statistics-of-product-state.service";
import { MarketingBoardService } from '../dto/marketingBoard.service';
import { CoreComponent } from './core.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MarketingBoardRoutingModule
  ],
  entryComponents: [WidgetSettingComponent],
  declarations: [
    DashboardComponent,
    WidgetSettingComponent,
    StatisticsOfProductStateComponent,
    CoreComponent],
  providers: [StatisticsOfProductStateService,MarketingBoardService],
})
export class MarketingBoardModule { }
