import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DataTableModule } from "angular2-datatable";
import { DndModule } from 'ng2-dnd';
import { MaterialModule } from './material/material.module';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HeaderComponent } from './components/header/header.component';
import { SideBarComponent } from './components/side-bar/side-bar.component';
// import { AppErrorHandler } from './error-handler/app-error-handler';

import { OrderByPipe } from './pipes/order-by.pipe';
import { SpinnerComponent } from './components/spinner/spinner.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    DataTableModule,
    DndModule.forRoot(),
    TranslateModule,
    RouterModule
  ],
  declarations: [HeaderComponent, SideBarComponent, OrderByPipe, SpinnerComponent],
  exports: [
    HeaderComponent,
    SideBarComponent,
    SpinnerComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    DataTableModule,
    DndModule,
    TranslateModule,
    RouterModule,
    OrderByPipe
  ],
  providers: []
  
})
export class SharedModule { }
// {provide: ErrorHandler, useClass: AppErrorHandler}