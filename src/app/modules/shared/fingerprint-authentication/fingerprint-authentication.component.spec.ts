import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FingerprintAuthenticationComponent } from './fingerprint-authentication.component';

describe('FingerprintAuthenticationComponent', () => {
  let component: FingerprintAuthenticationComponent;
  let fixture: ComponentFixture<FingerprintAuthenticationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FingerprintAuthenticationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FingerprintAuthenticationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
