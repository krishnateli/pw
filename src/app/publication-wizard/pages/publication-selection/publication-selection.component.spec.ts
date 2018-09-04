import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedModule } from '../../../shared/shared.module';
import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TranslateLoader, TranslateModule, TranslateService } from "@ngx-translate/core";
import { createTranslateLoader } from "../../../app.module";

import { RouterTestingModule } from '@angular/router/testing';

import { PublicationSelectionComponent } from './publication-selection.component';
import { DuplicatePublicationComponent } from '../../components/duplicate-publication/duplicate-publication.component';
import { OpenPublicationComponent } from '../../components/open-publication/open-publication.component';
import { NewPublicationComponent } from '../../components/new-publication/new-publication.component';

describe('PublicationSelectionComponent', () => {
  let component: PublicationSelectionComponent;
  let fixture: ComponentFixture<PublicationSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule, HttpClientTestingModule, TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient]
        }
      })],
      declarations: [PublicationSelectionComponent, DuplicatePublicationComponent, OpenPublicationComponent, NewPublicationComponent],
      providers: [TranslateService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicationSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should be created', () => {
  //   expect(component).toBeTruthy();
  // });
});
