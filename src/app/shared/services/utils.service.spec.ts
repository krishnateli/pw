import { TestBed, inject } from '@angular/core/testing';

import { RouterTestingModule } from '@angular/router/testing';
import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TranslateLoader, TranslateModule, TranslateService } from "@ngx-translate/core";
import { createTranslateLoader } from "../../app.module";
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { OverlayModule } from '@angular/cdk/overlay';
import { UtilsService } from './utils.service';

describe('UtilsService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, OverlayModule, HttpClientTestingModule, TranslateModule.forRoot({
                loader: {
                    provide: TranslateLoader,
                    useFactory: createTranslateLoader,
                    deps: [HttpClient]
                }
            })],
            providers: [UtilsService, TranslateService, MatSnackBar, MatSnackBarConfig]
        });
    });

    it('should be created', inject([UtilsService], (service: UtilsService) => {
        expect(service).toBeTruthy();
    }));
});
