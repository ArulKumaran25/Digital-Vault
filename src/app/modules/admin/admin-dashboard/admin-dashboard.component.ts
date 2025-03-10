import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CouchdbService } from '../../../services/couchdb.service';
import { Router } from '@angular/router';
import * as d3 from 'd3'; // Import D3.js

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

  constructor(private readonly couchdbService: CouchdbService, private readonly router: Router, private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.fetchUsers();
    this.fetchActivityLogs();
    this.fetchContactForms();
  }

  fetchUsers() {
    this.couchdbService.getAllRegisteredUser().subscribe(response => {
      if (response.rows) {
        this.users = response.rows.map((row: any) => row.value);
        this.renderUserChart(); // Render chart after fetching users
      }
    }, error => {
      console.error("Error fetching users:", error);
    });
  }

  fetchActivityLogs() {
    this.couchdbService.getUserActivityLogs().subscribe(response => {
      if (response.rows) {
        this.activityLogs = response.rows.map((row: any) => row.value);
        this.renderActivityChart(); // Render chart after fetching logs
      }
    }, error => {
      console.error("Error fetching user activity logs:", error);
    });
  }

  fetchContactForms() {
    this.couchdbService.fetchContactForms().subscribe(response => {
      this.contactForms = response.rows.map((row: any) => row.value);
      this.renderContactChart(); // Render chart after fetching contact forms
    }, error => {
      console.error("Error fetching contact forms:", error);
    });
  }

  // Render User Registration Chart
  renderUserChart() {
    const userDates = this.users.map(user => new Date(user.timestamp).toLocaleDateString());
    const userCounts = this.groupByDate(userDates);

    const data = Object.keys(userCounts).map(date => ({
      date,
      count: userCounts[date]
    }));

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select('#userChart')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(data.map(d => d.date))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d: { count: any; }) => d.count)!])
      .nice()
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append('g')
      .call(d3.axisLeft(y));

    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: { date: any; }) => x(d.date)!)
      .attr('y', (d: { count: any; }) => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', (d: { count: any; }) => height - y(d.count))
      .attr('fill', '#806F40');
  }

  // Render User Activity Chart
  renderActivityChart() {
    const activityDates = this.activityLogs.map(log => new Date(log.timestamp).toLocaleDateString());
    const activityCounts = this.groupByDate(activityDates);

    const data = Object.keys(activityCounts).map(date => ({
      date,
      count: activityCounts[date]
    }));

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select('#activityChart')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(data.map(d => d.date))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d: { count: any; }) => d.count)!])
      .nice()
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append('g')
      .call(d3.axisLeft(y));

    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: { date: any; }) => x(d.date)!)
      .attr('y', (d: { count: any; }) => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', (d: { count: any; }) => height - y(d.count))
      .attr('fill', '#5C4B31');
  }

  // Render Contact Form Chart
  renderContactChart() {
    const contactDates = this.contactForms.map(form => new Date(form.date).toLocaleDateString());
    const contactCounts = this.groupByDate(contactDates);

    const data = Object.keys(contactCounts).map(date => ({
      date,
      count: contactCounts[date]
    }));

    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select('#contactChart')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.date))
      .range(['#806F40', '#5C4B31', '#D5C4A1', '#E7DAC6']);

    const pie = d3.pie<any>()
      .value((d: { count: any; }) => d.count);

    const arc = d3.arc<any, d3.PieArcDatum<any>>()
      .innerRadius(0)
      .outerRadius(radius);

    const arcs = svg.selectAll('arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

  //     arcs.append('path')
  // .attr('d', arc)
  // .attr('fill', (d: { data: { date: string | number } }) => color(String(d.data.date)));


    arcs.append('text')
      .attr('transform', (d: any) => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .text((d: { data: { date: any; }; }) => d.data.date);
  }

  // Helper function to group data by date
  groupByDate(dates: string[]): { [key: string]: number } {
    return dates.reduce((acc, date) => {
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  // Toggle visibility of users
  toggleUsers() {
    this.showAllUsers = !this.showAllUsers;
    this.visibleUsers = this.showAllUsers ? this.users.length : 5;
  }

  // Toggle visibility of activity logs
  toggleLogs() {
    this.showAllLogs = !this.showAllLogs;
    this.visibleLogs = this.showAllLogs ? this.activityLogs.length : 5;
  }

  // Toggle visibility of contact forms
  toggleContacts() {
    this.showAllContacts = !this.showAllContacts;
    this.visibleContacts = this.showAllContacts ? this.contactForms.length : 5;
  }

  // Open reply modal
  openReplyModal(email: string) {
    this.replyToEmail = email;
    this.isReplyModalOpen = true;
    this.emailError = ''; // Clear previous error
  }

  // Close reply modal
  closeReplyModal() {
    this.isReplyModalOpen = false;
    this.replyToEmail = '';
    this.replySubject = '';
    this.replyMessage = '';
    this.emailError = '';
  }

  // Send reply email
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