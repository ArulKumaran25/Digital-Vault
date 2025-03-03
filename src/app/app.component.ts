import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Digital Vault';
  currentuser: string | null = "";
  isMenuOpen = false;
  logoutDropdown = false;
  showLogoutModal = false; // State for modal visibility
  showNavbar=false;
  contactForms: any;
  activityLogs: any;
  users: any;

  constructor(private router: Router) {}

  ngAfterContentChecked() {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.currentuser=localStorage.getItem('loggedUser');
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleLogoutDropdown() {
    this.logoutDropdown = !this.logoutDropdown;
  }

  openLogoutDialog() {
    this.showLogoutModal = true;
  }

  closeLogoutDialog() {
    this.showLogoutModal = false;
  }

  logout() {
    localStorage.removeItem('loggedUser');
    this.currentuser = "";
    this.logoutDropdown = false;
    this.showLogoutModal = false;
    console.log("User Logged Out...");
    this.router.navigate(['/home']); // Redirect to home page
  }

 
}
