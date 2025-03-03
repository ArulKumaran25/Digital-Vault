import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CouchdbService } from '../../../services/couchdb.service';
import { FingerprintAuthenticationService } from '../../../services/fingerprint-authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  welcomeMessage:string='';
  
  readonly adminEmail: string = 'admin123@gmail.com'; // Set the admin's email here
  readonly adminPassword: string = 'Admin@123'; // Set the admin's password here

  constructor(
    readonly couchService: CouchdbService,
    readonly fingerprintService: FingerprintAuthenticationService,
    readonly router: Router
  ) {}


  loginWithEmailPassword() {
    if (this.email === this.adminEmail && this.password === this.adminPassword) {
        alert("Logged-in Successfully as Admin");
        if (typeof window !== 'undefined') {
            localStorage.setItem("loggedUser", "Admin");
        }
        this.router.navigate(['/admin/dashboard']);
        return;
    }

    // Check if the email and password match any user in the database with type 'register-details'
    this.couchService.getAllRegisteredUser().subscribe((users: any) => {
        console.log(users);
        console.log(this.email);
        console.log(this.password);
        
        const user = users.rows.find((u: any) => 
            u.value.email === this.email && 
            u.value.password === this.password && 
            u.value.type === 'registerdetails'  
        );

        if (user) {
            console.log("Valid user");
            users.rows.forEach((e: any) => {
                if (e.value.email === this.email) {
                    this.couchService.currentUser = e.value.name;
                    if (typeof window !== 'undefined') {
                        localStorage.setItem("loggedUser", e.value.name);
                        localStorage.setItem("userId", e.value.email);
                        localStorage.setItem("userRevId", e.value._rev);
                        localStorage.setItem("userDocumentId", e.value.email + '_documents');
                    }

                    // **Log Only Regular User Login Activity**
                    if (e.value.email !== this.adminEmail) {
                        const activityLog = {
                            userId: e.value.email,
                            type: "activitylogs",
                            timestamp: new Date().toISOString()
                        };
                        this.couchService.logUserActivity(activityLog).subscribe({
                            next:() => console.log("User login activity logged successfully."),
                            error:(err) => console.error("Error logging activity:", err)
                        });
                    }
                }
            });
            alert("Logged-in Successfully");
            this.router.navigate(['./user/dashboard']);
        } else {
            this.errorMessage = 'Invalid email or password';
            alert("Invalid Credentials");
        }
    });
}
}

  // Login with fingerprint
  // loginWithFingerprint() {
  //   this.fingerprintService.authenticate().then(
  //     (isAuthenticated: boolean) => {
  //       if (isAuthenticated) {
  //         // Assuming fingerprint data is matched, let's use the email for simplicity here
  //         this.couchService.getData().subscribe((users: any) => {
  //           const user = users.rows.find((u: any) => u.doc.fingerprint === 'fingerprint123'); // Replace 'fingerprint123' with actual scanned fingerprint data
  //           if (user) {
  //             this.router.navigate(['/user/dashboard']);
  //           } else {
  //             this.errorMessage = 'Fingerprint authentication failed';
  //           }
  //         });
  //       } else {
  //         this.errorMessage = 'Fingerprint authentication failed';
  //       }
  //     },
  //     (error: any) => {
  //       this.errorMessage = error;
  //     }
  //   );
  // }

