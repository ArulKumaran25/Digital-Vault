import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FingerprintService {
  private apiUrl = 'http://127.0.0.1:11100/capture';

  constructor(private http: HttpClient) {}

  captureFingerprint(): Observable<any> {
    const requestData = {
      "Timeout": 10000,
      "Quality": 60,
      "Format": "ISO"
    };
    return this.http.post<any>(this.apiUrl, requestData);
  }
}
