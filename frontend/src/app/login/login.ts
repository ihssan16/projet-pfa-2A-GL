import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  constructor(private router: Router) {}
  
  selectProfile(profile: string) {
    // Redirige vers le dashboard correspondant
    this.router.navigate([`/${profile}`]);
  }
}