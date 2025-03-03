import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FingerprintAuthenticationService {
  constructor() {}

  authenticate(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const isSupported = Math.random() > 0.5;
      if (isSupported) {
        resolve(true);
      } else {
        reject('Fingerprint authentication not supported on this device.');
      }
    });
  }
}
