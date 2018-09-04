import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';

import { AppConfig } from './app.config';

import { HeaderInterceptor } from './interceptor/header-interceptor'

import { AppComponent } from './app.component';
import { DialogPopup } from './components/dialog/dialogpopup.component';
import { UnauthorisedComponent } from './components/unauthorised/unauthorised.component';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DeviceDetectorModule } from 'ngx-device-detector';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function loadConfig(config: AppConfig) {
  return () => config.load();
}


@NgModule({
  declarations: [
    AppComponent,
    DialogPopup,
    UnauthorisedComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    HttpClientModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    DeviceDetectorModule.forRoot()
  ],
  entryComponents: [DialogPopup],
  exports: [TranslateModule],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }, { provide: APP_INITIALIZER, useFactory: loadConfig, deps: [AppConfig], multi: true }, { provide: HTTP_INTERCEPTORS, useClass: HeaderInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
