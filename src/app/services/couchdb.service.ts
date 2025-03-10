import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, timestamp } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class CouchdbService {
  readonly baseUrl = 'https://192.168.57.185:5984/digital-vault';  // CouchDB URL
  readonly username = 'd_couchdb';  // CouchDB Username
  readonly password = 'Welcome#2'; // CouchDB Password

  currentUser: string = "";  // User name in the dashboard
 
  constructor(private readonly http: HttpClient) {}

  private getHeaders() {
    return new HttpHeaders({
      'Authorization': 'Basic ' + btoa(`${this.username}:${this.password}`),
      'Content-Type': 'application/json',
    });
  }


   // Check if an email already exists
   checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<any>(`${this.baseUrl}/_design/user/_view/registered_user?key="${email}"`, { headers: this.getHeaders() })
      .pipe(map(response => response.rows.length > 0)); // Returns true if email exists
  }

   // Add a new user only if email is unique
   addData(data: any): Observable<any> {
    const docId = `registerdetails_2_${uuidv4()}`; 
    return this.http.put(`${this.baseUrl}/${docId}`, data, { headers: this.getHeaders() });
  }

 
  // Get all registered users (optional)
  getAllRegisteredUser(): Observable<any> {
   return this.http.get<any>(`${this.baseUrl}/_design/views/_view/registered_users`, { headers: this.getHeaders() });
  }
 
  // login user
  getData(): Observable<any> {
    const docId = `registerdetails_2_${uuidv4()}`; 
    const data = { type: 'user' };
    return this.http.put(`${this.baseUrl}/${docId}`, data, { headers: this.getHeaders() });
  }
  
   // Contact forms
   submitContactForm(data: any): Observable<any> {
    const timestamp=new Date().toISOString();
    data = { ...data, type: 'contact',timestamp}; // Add type and ensure submittedDate is included
    const docId = `contact_2_${uuidv4()}`; 
    return this.http.put(`${this.baseUrl}/${docId}`, data, { headers: this.getHeaders() });
  }

  // Get all contact form submissions
  fetchContactForms(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/_design/views/_view/contact_forms`, { headers: this.getHeaders() });
  }

   // Add login activity to activity_logs view (Login)
   logUserActivity(activityLog: any): Observable<any> {
    const activityId = `activitylogs_2_${uuidv4()}`; 
    activityLog={...activityLog, _id:activityId}
    return this.http.post(`${this.baseUrl}`,activityLog,{headers : this.getHeaders()});
  }

// Get all user activity logs
getUserActivityLogs(): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/_design/views/_view/activity_logs`, { headers: this.getHeaders() });
}
 


//
  // Fetch a specific user by email
  // getUserByEmail(email: string): Observable<any> {
  //   const query = {
  //     selector: {
  //       'data.email': email, // Search by email
  //     },
  //   };
  //   return this.http.post<any>(`${this.baseUrl}/_find`, query, { headers: this.getHeaders() });
  // }

  // Get all users (for admin)
  // getUsers(role: string): Observable<any> {
  //   const query = {
  //     selector: {
  //       'data.role':role, // Filter by role (admin or user)
  //     },
  //   };
  //   return this.http.post<any>(`${this.baseUrl}/_find`, query, { headers: this.getHeaders() });
  // }

 
// Inside couchdb.service.ts
// getData(): Observable<any> {
//   return this.http.get<any>(`${this.baseUrl}/_design/User/_view/user`, { headers: this.getHeaders() });
// }



  // Fetch all files from CouchDB
  getFiles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/_design/views/_view/uploaded_files`, { headers: this.getHeaders() });
  }


  uploadFile(payload: any, _id : string, _rev : string): Observable<any> {
    // Add any necessary metadata for CouchDB
    const document = {
      file_data: payload.file_data, // Base64 file content
      created_at: payload.created_at,
      type: payload.type,
      username: payload.username,
    };
    console.log(_id, _rev);
    console.log("In the couch");
    
    return this.http.put(`${this.baseUrl}/${_id}`,{_id : _id, _rev : _rev, documents : payload.documents, type : "documents"}, { headers: this.getHeaders() });  }

  // Rename a file in CouchDB
  renameFile(id: string, newName: string): Observable<any> {
    const fileDoc = { _id: id, name: newName };
    return this.http.put(`${this.baseUrl}/${id}`, fileDoc, { headers: this.getHeaders() });
  }

  // Delete a file from CouchDB
  deleteFile(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Delete a document by its ID and revision (for user data, activity logs, etc.)
  // deleteData(docId: string, docRev: string): Observable<any> {
  //   return this.http.delete<any>(`${this.baseUrl}/${docId}?rev=${docRev}`, { headers: this.getHeaders() });
  // }

  // Restore deleted files (mock function for now)
  // restoreDeletedFiles(): Observable<any> {
  //   return this.http.post(`${this.baseUrl}/restore`, {}, { headers: this.getHeaders() });
  // }



  // Function to add a new fingerprint entry for registration
  // registerFingerprint(email: string, fingerprintData: string): Observable<any> {
  //   const userData = {
  //     email: email,
  //     fingerprint: fingerprintData,  // Storing fingerprint as a hash
  //   };
  //   return this.http.put<any>(`${this.baseUrl}/fingerprints/${email}`, userData, { headers: this.getHeaders() });
  // }

  // // Fetch fingerprint for the user
  // getFingerprint(email: string): Observable<any> {
  //   return this.http.get<any>(`${this.baseUrl}/fingerprints/${email}`, { headers: this.getHeaders() });
  // }
  
  // // Check if fingerprint already exists for a specific user
  // fingerprintExists(email: string): Observable<any> {
  //   return this.http.get<any>(`${this.baseUrl}/fingerprints/${email}`,{ headers: this.getHeaders() });
  // }
}
