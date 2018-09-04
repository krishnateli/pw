import { async, ComponentFixture, TestBed } from '@angular/core/testing';

// import { SharedModule } from '../../../shared/shared.module';

import { FilterComponent } from './filter.component';
import { UniquePipe } from '../../pipes/unique.pipe';

describe('FilterComponent', () => {
  let component: FilterComponent;
  let fixture: ComponentFixture<FilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [FilterComponent, UniquePipe]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should be created', () => {
  //   expect(component).toBeTruthy();
  // });
});
