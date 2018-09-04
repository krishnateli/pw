import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedModule } from '../../../shared/shared.module';

import { RouterTestingModule } from '@angular/router/testing';
import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TranslateLoader, TranslateModule, TranslateService } from "@ngx-translate/core";
import { createTranslateLoader } from "../../../app.module";

import { ElementSelectionComponent } from './element-selection.component';
import { FilterComponent } from '../../components/filter/filter.component';
import { TableComponent } from '../../components/table/table.component';
import { CheckboxfilterPipe } from '../../pipes/checkboxfilter.pipe';
import { SearchPipe } from '../../pipes/search.pipe';
import { PreviewFilterPipe } from '../../pipes/preview-filter.pipe';
import { DisplaydataPipe } from '../../pipes/displaydata.pipe';
import { UniquePipe } from '../../pipes/unique.pipe';
import { CustomfilterPipe } from '../../pipes/customfilter.pipe';

describe('ElementSelectionComponent', () => {
  let component: ElementSelectionComponent;
  let fixture: ComponentFixture<ElementSelectionComponent>;
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
      declarations: [ElementSelectionComponent, FilterComponent, TableComponent, CheckboxfilterPipe, SearchPipe, PreviewFilterPipe, DisplaydataPipe, UniquePipe, CustomfilterPipe],
      providers: [TranslateService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElementSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should be created', () => {
  //   expect(component).toBeTruthy();
  // });
});
