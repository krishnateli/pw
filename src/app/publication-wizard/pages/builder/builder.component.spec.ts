import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SplitPaneModule } from 'ng2-split-pane/lib/ng2-split-pane';

import { SharedModule } from '../../../shared/shared.module';
import { DeviceDetectorModule, DeviceDetectorService } from 'ngx-device-detector';
import { RouterTestingModule } from '@angular/router/testing';

import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TranslateLoader, TranslateModule, TranslateService } from "@ngx-translate/core";
import { createTranslateLoader } from "../../../app.module";

import { BuilderComponent } from './builder.component';
import { SliderComponent } from '../../components/slider/slider.component';
import { FilterComponent } from '../../components/filter/filter.component';
import { TableComponent } from '../../components/table/table.component';
import { PreviewBoxComponent } from '../../components/preview-box/preview-box.component';
import { VariableTemplateComponent } from '../../components/variable-template/variable-template.component';
import { SafeHTMLPipe } from '../../pipes/safe-html.pipe';
import { CheckboxfilterPipe } from '../../pipes/checkboxfilter.pipe';
import { SearchPipe } from '../../pipes/search.pipe';
import { LangStackFilterPipe } from '../../pipes/lang-stack-filter.pipe';
import { UniquePipe } from '../../pipes/unique.pipe';
import { CustomfilterPipe } from '../../pipes/customfilter.pipe';
import { DisplaydataPipe } from '../../pipes/displaydata.pipe';
import { PreviewFilterPipe } from '../../pipes/preview-filter.pipe';

describe('BuilderComponent', () => {
  let component: BuilderComponent;
  let fixture: ComponentFixture<BuilderComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule, SplitPaneModule, DeviceDetectorModule, HttpClientTestingModule, TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient]
        }
      })],
      declarations: [BuilderComponent, SliderComponent, FilterComponent, TableComponent, PreviewBoxComponent, VariableTemplateComponent, CheckboxfilterPipe, SearchPipe, LangStackFilterPipe, SafeHTMLPipe, UniquePipe, CustomfilterPipe, DisplaydataPipe, PreviewFilterPipe],
      providers: [DeviceDetectorService, TranslateService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should be created', () => {
  //   expect(component).toBeTruthy();
  // });
});
