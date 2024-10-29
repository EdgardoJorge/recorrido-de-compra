import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Comprobante } from '../models/comprobante';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComprobanteService {

  constructor(private http: HttpClient) { }

  list(): Observable<Comprobante[]> {
    return this.http.get<Comprobante[]>(
      `${environment.backendBaseUrl}/api/store/comprobante`);
  }

  getById(idComprobante: number): Observable<Comprobante> {
    return this.http.get<Comprobante>(`${environment.backendBaseUrl}/api/store/comprobante/${idComprobante}`);
  }
}
