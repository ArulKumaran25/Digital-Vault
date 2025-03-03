import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CouchdbService } from '../../../services/couchdb.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  users: any[] = [];
  activityLogs: any[] = [];
  contactForms: any[] = [];

  showAllUsers = false;
  showAllLogs = false;
  showAllContacts = false;

  visibleUsers = 5;
  visibleLogs = 5;
  visibleContacts = 5;

  constructor(private readonly couchdbService: CouchdbService, private readonly router: Router) {}

  ngOnInit(): void {
    this.fetchUsers();
    this.fetchActivityLogs();
    this.fetchContactForms();
  }

  fetchUsers() {
    this.couchdbService.getAllRegisteredUser().subscribe(response => {
      if (response.rows) {
        this.users = response.rows.map((row: any) => row.value); // Extract user details
      }
    }, error => {
      console.error("Error fetching users:", error);
    });
  }

  fetchActivityLogs(){
    this.couchdbService.getUserActivityLogs().subscribe(response => {
      if (response.rows) {
        this.activityLogs = response.rows.map((row: any) => row.value); // Extracting log details
      }
    }, error => {
      console.error("Error fetching user activity logs:", error);
    });
  }

  fetchContactForms() {
    this.couchdbService.fetchContactForms().subscribe(response => {
      this.contactForms = response.rows.map((row: any) => row.value);
    });
  }

  toggleUsers() {
    this.showAllUsers = !this.showAllUsers;
    this.visibleUsers = this.showAllUsers ? this.users.length : 5;
  }
  
  toggleLogs() {
    this.showAllLogs = !this.showAllLogs;
    this.visibleLogs = this.showAllLogs ? this.activityLogs.length : 5;
  }
  
  toggleContacts() {
    this.showAllContacts = !this.showAllContacts;
    this.visibleContacts = this.showAllContacts ? this.contactForms.length : 5;
  }
  
}

