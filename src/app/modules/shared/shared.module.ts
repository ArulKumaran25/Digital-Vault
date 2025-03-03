import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FingerprintAuthenticationComponent } from './fingerprint-authentication/fingerprint-authentication.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [FingerprintAuthenticationComponent, LandingPageComponent],
  imports: [CommonModule, RouterModule],
  exports: [FingerprintAuthenticationComponent,LandingPageComponent],
})
export class SharedModule {}
