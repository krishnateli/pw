import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TranslateLoader, TranslateModule, TranslateService } from "@ngx-translate/core";
import { createTranslateLoader } from "../../app.module";

import { UnauthorisedComponent } from './unauthorised.component';
import { SharedModule } from '../../shared/shared.module';

const TRANSLATIONS_EN = require('../../../assets/i18n/en.json');
const TRANSLATIONS_DE = require('../../../assets/i18n/de.json');


describe('UnauthorisedComponent', () => {
  let component: UnauthorisedComponent;
  let fixture: ComponentFixture<UnauthorisedComponent>;

  let translate: TranslateService;
  let http: HttpTestingController;

  const fakeActivatedRoute = {
    snapshot: { data: {} }
  } as ActivatedRoute;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UnauthorisedComponent],
      imports: [SharedModule,
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: createTranslateLoader,
            deps: [HttpClient]
          }
        })
      ],
      providers: [{ provide: ActivatedRoute, useValue: fakeActivatedRoute }, TranslateService]
    })
      .compileComponents();

    translate = TestBed.get(TranslateService);
    http = TestBed.get(HttpTestingController);
  }));

  // beforeEach(() => {
  //   fixture = TestBed.createComponent(UnauthorisedComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();
  // });

  it('should be created', () => {

    const fixture = TestBed.createComponent(UnauthorisedComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
    // expect(component).toBeTruthy();
  });

  // it('should load translations', async(() => {
  //   spyOn(translate, 'getBrowserLang').and.returnValue('en');
  //   const fixture = TestBed.createComponent(UnauthorisedComponent);
  //   const compiled = fixture.debugElement.nativeElement;

  //   // the DOM should be empty for now since the translations haven't been rendered yet
  //   expect(compiled.querySelector('span').textContent).toEqual('');

  //   http.expectOne('../../../assets/i18n/en.json').flush(TRANSLATIONS_EN);
  //   http.expectNone('../../../assets/i18n/de.json');

  //   // Finally, assert that there are no outstanding requests.
  //   http.verify();

  //   fixture.detectChanges();
  //   // the content should be translated to english now
  //   expect(compiled.querySelector('span').textContent).toEqual(TRANSLATIONS_EN.MB_TAB_ALREADY_OPEN);

  //   translate.use('de');
  //   http.expectOne('../../../assets/i18n/de.json').flush(TRANSLATIONS_DE);

  //   // Finally, assert that there are no outstanding requests.
  //   http.verify();

  //   // the content has not changed yet
  //   expect(compiled.querySelector('span').textContent).toEqual(TRANSLATIONS_EN.MB_TAB_ALREADY_OPEN);

  //   fixture.detectChanges();
  //   // the content should be translated to french now
  //   expect(compiled.querySelector('span').textContent).toEqual(TRANSLATIONS_DE.MB_TAB_ALREADY_OPEN);
  // }));

});
