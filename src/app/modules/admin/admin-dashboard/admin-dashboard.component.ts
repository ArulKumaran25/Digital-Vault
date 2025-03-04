import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CouchdbService } from '../../../services/couchdb.service';
import { Router } from '@angular/router';

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

  isReplyModalOpen = false;
  replyToEmail: string = '';
  replySubject: string = '';
  replyMessage: string = '';
  emailError: string = '';

  constructor(private readonly couchdbService: CouchdbService, private readonly router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchUsers();
    this.fetchActivityLogs();
    this.fetchContactForms();
  }

  fetchUsers() {
    this.couchdbService.getAllRegisteredUser().subscribe(response => {
      if (response.rows) {
        this.users = response.rows.map((row: any) => row.value);
      }
    }, error => {
      console.error("Error fetching users:", error);
    });
  }

  fetchActivityLogs() {
    this.couchdbService.getUserActivityLogs().subscribe(response => {
      if (response.rows) {
        this.activityLogs = response.rows.map((row: any) => row.value);
      }
    }, error => {
      console.error("Error fetching user activity logs:", error);
    });
  }

  fetchContactForms() {
    this.couchdbService.fetchContactForms().subscribe(response => {
      this.contactForms = response.rows.map((row: any) => row.value);
    }, error => {
      console.error("Error fetching contact forms:", error);
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

  openReplyModal(email: string) {
    this.replyToEmail = email;
    this.isReplyModalOpen = true;
    this.emailError = ''; // Clear previous error
  }

  closeReplyModal() {
    this.isReplyModalOpen = false;
    this.replyToEmail = '';
    this.replySubject = '';
    this.replyMessage = '';
    this.emailError = '';
  }

  sendReply() {
    if (!this.replySubject.trim()) {
      this.emailError = 'Subject is required!';
      return;
    }
    if (!this.replyMessage.trim()) {
      this.emailError = 'Message cannot be empty!';
      return;
    }

    const emailData = {
      toEmail: this.replyToEmail,
      subject: this.replySubject,
      message: this.replyMessage,
    };

    this.http.post('http://localhost:4000/send-email', emailData).subscribe(
      (response: any) => {
        if (response.success) {
          alert('Email sent successfully!');
          this.closeReplyModal();
        } else {
          this.emailError = response.message || 'Failed to send email';
        }
      },
      (error) => {
        this.emailError = 'Failed to send email. Please try again.';
        console.error('Error sending email:', error);
      }
    );
  }
}
