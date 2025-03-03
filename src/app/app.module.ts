import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserModule } from './modules/user/user.module'; // User Module
import { CouchdbService } from './services/couchdb.service';
import { FingerprintAuthenticationService } from './services/fingerprint-authentication.service';
import { SharedModule } from './modules/shared/shared.module'; // Import Shared Module
import { LoginComponent } from './modules/user/login/login.component';
import { DashboardComponent } from './modules/user/dashboard/dashboard.component';
import { RouterModule } from '@angular/router';
import { AdminModule } from './modules/admin/admin.module';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

@NgModule({
  declarations: [
    AppComponent // Root Component
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    CommonModule,
    SharedModule,
    AdminModule,
    RouterModule, 
    
  ],
  providers: [CouchdbService, FingerprintAuthenticationService, provideAnimationsAsync()],
  bootstrap: [AppComponent]
})
export class AppModule {}
