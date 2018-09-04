import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedModule } from '../../../shared/shared.module';
import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TranslateLoader, TranslateModule, TranslateService } from "@ngx-translate/core";
import { RouterTestingModule } from '@angular/router/testing';
import { createTranslateLoader } from "../../../app.module";

import { VariableTemplateComponent } from './variable-template.component';

describe('VariableTemplateComponent', () => {
  let component: VariableTemplateComponent;
  let fixture: ComponentFixture<VariableTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedModule, HttpClientTestingModule, TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient]
        }
      })],
      declarations: [VariableTemplateComponent],
      providers: [TranslateService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VariableTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
