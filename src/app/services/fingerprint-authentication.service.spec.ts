import { TestBed } from '@angular/core/testing';

import { FingerprintAuthenticationService } from './fingerprint-authentication.service';

describe('FingerprintAuthenticationService', () => {
  let service: FingerprintAuthenticationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FingerprintAuthenticationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
