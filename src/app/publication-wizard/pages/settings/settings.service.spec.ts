import { TestBed, inject } from '@angular/core/testing';
import { SettingsService } from './settings.service';

import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TranslateLoader, TranslateModule, TranslateService } from "@ngx-translate/core";
import { createTranslateLoader } from "../../../app.module";
import { RouterTestingModule } from '@angular/router/testing';

import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { OverlayModule } from '@angular/cdk/overlay';

describe('SettingsService', () => {
  
  let translate: TranslateService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, OverlayModule, TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient]
        }
      })],
      providers: [SettingsService, TranslateService, MatSnackBar, MatSnackBarConfig]
    });
  });

  it('should ...', inject([SettingsService], (service: SettingsService) => {
    expect(service).toBeTruthy();
  }));
});
