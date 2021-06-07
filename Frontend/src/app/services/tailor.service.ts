import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TailorService {
  private url = 'http://localhost:3000/users';
  constructor(private http: HttpClient) {}
  get_tailors_info() {
    return this.http.get(this.url, { observe: 'response' });
  }
  get_tailor_info(id: any) {
    return this.http.get(`${this.url}/${id}`, { observe: 'response' });
  }
  update_tailor_info(id: any, body: any) {
    return this.http.put(`${this.url}/${id}`, body, { observe: 'response' });
  }
}
