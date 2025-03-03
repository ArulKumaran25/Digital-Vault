import { Component } from '@angular/core';
import { FingerprintAuthenticationService } from '../../../services/fingerprint-authentication.service';

@Component({
  selector: 'app-fingerprint-authentication',
  templateUrl: './fingerprint-authentication.component.html',
  styleUrls: ['./fingerprint-authentication.component.css'],
})
export class FingerprintAuthenticationComponent {
  isSupported: boolean | null = null;

  constructor(private fingerprintAuthService: FingerprintAuthenticationService) {}

  authenticate() {
    this.fingerprintAuthService.authenticate()
      .then((result) => {
        alert('Authentication successful!');
        this.isSupported = true;
      })
      .catch((error) => {
        alert(error);
        this.isSupported = false;
      });
  }
}
