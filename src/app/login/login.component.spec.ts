import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '../shared/shared.module';

import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TranslateLoader, TranslateModule, TranslateService } from "@ngx-translate/core";
import { createTranslateLoader } from "../app.module";

import { RouterTestingModule } from '@angular/router/testing';

import { LoginComponent } from './login.component';
import { HeaderComponent } from '../shared/components/header/header.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let componentHeader: HeaderComponent;
  let fixtureHeader: ComponentFixture<HeaderComponent>;

  let translate: TranslateService;
  let http: HttpTestingController;
  let title: Title;

  const fakeActivatedRoute = {
    snapshot: {
      queryParams: {
        embeddedUrl: true,
        returnUrl: ""
      }
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule, RouterTestingModule, HttpClientTestingModule, TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient]
        }
      })],
      declarations: [LoginComponent],
      providers: [{ provide: ActivatedRoute, useValue: fakeActivatedRoute }, TranslateService, { provide: Title, useClass: Title }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    fixtureHeader = TestBed.createComponent(HeaderComponent);
    componentHeader = fixtureHeader.componentInstance;
    fixtureHeader.detectChanges();
  });

  it('should create', () => {
    component.customPanelBgColor = "#000";
    component.customPanelColor = "#fff";
    component.customPanelFontStyle = "'Roboto', sans-serif";
    fixture.detectChanges();
    componentHeader.customPanelBgColor = "#000";
    componentHeader.customPanelColor = "#fff";
    componentHeader.customPanelFontStyle = "'Roboto', sans-serif";
    fixtureHeader.detectChanges();
    expect(component).toBeTruthy();
  });

  it('Browser tab title should be set to InBetween', () => {
    title = TestBed.get(Title);
    expect(title.getTitle()).toBe("InBetween");
  });

});
