import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CouchdbService } from '../../../services/couchdb.service';
import { HttpClient } from '@angular/common/http';

import { FingerprintService } from '../../../services/fingerprint.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  // fingerprintData: string = '';
  // fingerprintRegistered: boolean = false;
  emailExists: boolean = false;

  // Regular expressions for validations
  emailPattern: RegExp = /^[a-z][a-z0-9._%+-]{5,}@[a-z0-9.-]+\.[a-z]{2,}$/; 
  passwordPattern: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/; 

  constructor(private couchService: CouchdbService, private router: Router, readonly http : HttpClient, private fingerprintService:FingerprintService) {}

  // Check if passwords match
  passwordsMatch(): boolean {
    return this.password === this.confirmPassword;
  }

  // Validate if email is in a valid format
  isEmailValid(): boolean {
    return this.emailPattern.test(this.email);
  }

  // Validate if the password is strong
  isPasswordStrong(): boolean {
    return this.passwordPattern.test(this.password);
  }

  // Register user
  register() {
    this.emailExists = false;
    if (this.name && this.email && this.password && this.confirmPassword) {
      if (!this.isEmailValid()) {
        this.errorMessage = 'Invalid email format. Ensure it contains no uppercase letters.';
        return;
      }
      if (!this.passwordsMatch()) {
        this.errorMessage = 'Passwords do not match.';
        return;
      }
      if (!this.isPasswordStrong()) {
        this.errorMessage = 'Password must be at least 6 characters long, include one uppercase letter, one lowercase letter, one number, and one special character.';
        return;
      }

      const userData = {
        name: this.name,
        email: this.email,
        password: this.password,
        // fingerprint: this.fingerprintData || null,
        type : "registerdetails"
      };
      this.findEmailUniqueness(userData); 
        
    } else {
      this.errorMessage = 'Please fill in all fields.';
    }
  }

  // Register with fingerprint functionality
  // registerWithFingerprint() {
  //   if (this.fingerprintRegistered) {
  //     if (!this.isEmailValid()) {
  //       this.errorMessage = 'Invalid email format. Ensure it contains no uppercase letters.';
  //       return;
  //     }
  //     if (!this.passwordsMatch()) {
  //       this.errorMessage = 'Passwords do not match.';
  //       return;
  //     }
  //     if (!this.isPasswordStrong()) {
  //       this.errorMessage =
  //         'Password must be at least 6 characters long, include one uppercase letter, one lowercase letter, one number, and one special character.';
  //       return;
  //     }


  //     // Check if email exists
  //     this.emailExistsOrNot().then(emailExists => {
  //       if (emailExists) {
  //         alert('Email already exists.');
  //         return;
  //       }

  //       const fingerprintUserData = {
  //         name: this.name,
  //         email: this.email,
  //         password: this.password,
  //         fingerprint: this.fingerprintData
  //       };

  //       this.couchService.addData(fingerprintUserData).subscribe({
  //         next: ()=>{
  //           alert("Registration with Fingerprint is Success")
  //           this.router.navigate(['/user/login']);
  //           this.clearForm();
  //         },
  //         error: () => {
  //           this.errorMessage='Registration Failed with Fingerprint.';
  //         }
  //       });
  //     });
  //   } else {
  //     this.errorMessage = 'Please scan your fingerprint first.';
  //   }
  // }

  // Simulate fingerprint scanning
  // startFingerprintScan() {
  //   setTimeout(() => {
  //     this.fingerprintRegistered = true;
  //     this.fingerprintData = 'fingerprint123'; // Simulated fingerprint data
  //     alert('Fingerprint scanned successfully!');
  //   }, 2000);
  // }

  // Check if the email already exists
  // async emailExistsOrNot(): Promise<boolean> {
  //   try {
  //     const users = await this.couchService.getUsers('user').toPromise();
  //     let emailExists = false;
  //     users.rows.forEach((user: any) => {
  //       if (user.value.data.email === this.email) {
  //         emailExists = true;
  //       }
  //     });
  //     return emailExists;
  //   } catch (error) {
  //     alert('Error fetching users.');
  //     return false;
  //   }
  // }

  findEmailUniqueness(userData : any){
    this.couchService.getAllRegisteredUser().subscribe({
      next : (response) =>{
        console.log("Inside email");
        console.log(response);
        response.rows.forEach((e : any) => {
          if(e.value.email === this.email)
            this.emailExists = true;
        })
        if(this.emailExists){
          console.log("already Exist");
          alert("Email already exists. Please use a different email.");
          return;
        }
           
        else {
          this.couchService.addData(userData).subscribe({
            next: () => {
              alert('Registration Successful!');
              this.router.navigate(['/user/login']);
              this.clearForm();
            },
            error: () => {
              this.errorMessage='Registration Failed.';
            }
          });
        }
           
      },
      error : (error) => {
        console.log(error); 
      }
    });
  }

  clearForm() {
    this.name = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    // this.fingerprintData = '';
    // this.fingerprintRegistered = false;
    this.errorMessage = '';
  }
}


