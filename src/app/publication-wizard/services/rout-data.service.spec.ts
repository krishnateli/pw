import { TestBed, inject } from '@angular/core/testing';

import { RouterTestingModule } from '@angular/router/testing';
import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TranslateLoader, TranslateModule, TranslateService } from "@ngx-translate/core";
import { createTranslateLoader } from "../../app.module";
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { OverlayModule } from '@angular/cdk/overlay';

import { RoutDataService } from './rout-data.service';

describe('RoutDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, OverlayModule, HttpClientTestingModule, TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient]
        }
      })],
      providers: [RoutDataService, MatSnackBar, MatSnackBarConfig]
    });
  });

  it('should be created', inject([RoutDataService], (service: RoutDataService) => {
    expect(service).toBeTruthy();
  }));
});
