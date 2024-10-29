import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RucService {
  private apiUrl = 'https://dniruc.apisperu.com/api/v1/ruc';
  private token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InRvYmFrZTQ4MjVAcmVnaXNodWIuY29tIn0.z7JWvGgC1VHjAv7P3FEVWJU283ExHPe8rI-aSDx41kY ';

  constructor(private http: HttpClient) {}

  getRucData(ruc: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    return this.http.get(`${this.apiUrl}/${ruc}`, { headers });
  }
}
