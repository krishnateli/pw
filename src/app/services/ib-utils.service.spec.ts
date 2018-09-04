import { TestBed, inject } from '@angular/core/testing';

import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TranslateLoader, TranslateModule, TranslateService } from "@ngx-translate/core";
import { createTranslateLoader } from "../app.module";
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { OverlayModule } from '@angular/cdk/overlay';
import { RouterTestingModule } from '@angular/router/testing';

import { IbUtilsService } from './ib-utils.service';

describe('IbUtilsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OverlayModule, RouterTestingModule, HttpClientTestingModule, TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient]
        }
      })],
      providers: [IbUtilsService, TranslateService, MatSnackBar, MatSnackBarConfig]
    });
  });

  it('should be created', inject([IbUtilsService], (service: IbUtilsService) => {
    expect(service).toBeTruthy();
  }));
});
