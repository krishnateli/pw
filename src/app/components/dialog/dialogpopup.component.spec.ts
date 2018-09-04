import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TranslateLoader, TranslateModule, TranslateService } from "@ngx-translate/core";
import { createTranslateLoader } from "../../app.module";
import { SharedModule } from '../../shared/shared.module';


import { SharedDataService } from '../../services/shared-data.service';

import { DialogPopup } from './dialogpopup.component';


describe('DialogPopup', () => {
    let component: DialogPopup;
    let fixture: ComponentFixture<DialogPopup>;
    let translate: TranslateService;
    let http: HttpTestingController;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DialogPopup],
            imports: [SharedModule,
                HttpClientTestingModule,
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useFactory: createTranslateLoader,
                        deps: [HttpClient]
                    }
                })
            ],
            providers: [TranslateService]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DialogPopup);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        component.customFontStyle = "'Roboto', sans-serif";
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });
});
