import { TestBed, async, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { PwGuard } from './pw.guard';

describe('PwGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [PwGuard]
    });
  });

  it('should ...', inject([PwGuard], (guard: PwGuard) => {
    expect(guard).toBeTruthy();
  }));
});
