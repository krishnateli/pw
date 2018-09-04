import { TestBed, async, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MbGuard } from './mb.guard';

describe('MbGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [MbGuard]
    });
  });

  it('should ...', inject([MbGuard], (guard: MbGuard) => {
    expect(guard).toBeTruthy();
  }));
});
