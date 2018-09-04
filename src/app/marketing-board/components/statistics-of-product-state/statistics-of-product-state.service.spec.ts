import { TestBed, inject } from '@angular/core/testing';

import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TranslateLoader, TranslateModule, TranslateService } from "@ngx-translate/core";
import { createTranslateLoader } from "../../../app.module";

import { StatisticsOfProductStateService } from '../statistics-of-product-state/statistics-of-product-state.service';

import { RouterTestingModule } from '@angular/router/testing';

import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { OverlayModule } from '@angular/cdk/overlay';

describe('StatisticsOfProductStateService', () => {

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
      providers: [StatisticsOfProductStateService, TranslateService, MatSnackBar, MatSnackBarConfig]
    });
  });

  it('should be created', inject([StatisticsOfProductStateService], (service: StatisticsOfProductStateService) => {
    expect(service).toBeTruthy();
  }));
});
