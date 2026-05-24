import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/login/';

  constructor(private http: HttpClient) { }

  login(email: string, mot_de_passe: string): Observable<any> {
    return this.http.post(this.apiUrl, {
      email: email,
      password: mot_de_passe
    }).pipe(
      tap((reponse: any) => {
        localStorage.setItem('access_token', reponse.access);
        localStorage.setItem('refresh_token', reponse.refresh);
      })
    );
  }

  estConnecte(): boolean {
    return !!localStorage.getItem('access_token');
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}