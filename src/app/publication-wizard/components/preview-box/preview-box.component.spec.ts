import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedModule } from '../../../shared/shared.module';
import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TranslateLoader, TranslateModule, TranslateService } from "@ngx-translate/core";
import { createTranslateLoader } from "../../../app.module";

import { RouterTestingModule } from '@angular/router/testing';
import { PreviewBoxComponent } from './preview-box.component';
import { VariableTemplateComponent } from '../variable-template/variable-template.component';
import { DisplaydataPipe } from '../../pipes/displaydata.pipe';
import { PreviewFilterPipe } from '../../pipes/preview-filter.pipe';

describe('PreviewBoxComponent', () => {
  let component: PreviewBoxComponent;
  let fixture: ComponentFixture<PreviewBoxComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule, HttpClientTestingModule, TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient]
        }
      })],
      declarations: [PreviewBoxComponent, DisplaydataPipe, VariableTemplateComponent, PreviewFilterPipe],
      providers: [TranslateService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should be created', () => {
  //   expect(component).toBeTruthy();
  // });
});
