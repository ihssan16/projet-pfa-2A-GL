import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  private getHeaders() {
    let headers = new HttpHeaders();
    
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && token.trim() !== '') {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    
    return { headers: headers };
  }


  login(email: string, mot_de_passe: string): Observable<any> {
    return this.http.post('http://localhost:8000/api/login/', {
      email: email,
      password: mot_de_passe
    }).pipe(
      tap((reponse: any) => {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('access_token', reponse.access);
          localStorage.setItem('refresh_token', reponse.refresh);
        }
      })
    );
  }

  estConnecte(): boolean {
    if (typeof localStorage === 'undefined') return false;
    return !!localStorage.getItem('access_token');
  }

  logout() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  listerUtilisateurs(role?: string): Observable<any[]> {
    let url = 'http://localhost:8000/api/utilisateurs/';
    if (role) {
      url += `?role=${role}`;
    }
    return this.http.get<any[]>(url, this.getHeaders());
  }

  creerUtilisateur(data: any): Observable<any> {
    return this.http.post<any>('http://localhost:8000/api/utilisateurs/', data, this.getHeaders());
  }

  desactiverUtilisateur(id: string): Observable<any> {
    return this.http.delete(`http://localhost:8000/api/utilisateurs/${id}/`, this.getHeaders());
  }

  supprimerUtilisateur(userId: number) {
    const headers = this.getHeaders();
    return this.http.delete(`http://localhost:8000/api/utilisateurs/${userId}/`, this.getHeaders());
  }
}