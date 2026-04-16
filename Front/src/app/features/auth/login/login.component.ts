import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DemoAppRole, DemoAuthService } from '../../../core/services/demo-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;

  constructor(
    private router: Router,
    private demoAuthService: DemoAuthService
  ) {}

  async onSubmit(event: Event) {
    event.preventDefault();
    const role: DemoAppRole = this.email.toLowerCase().includes('admin') ? 'ADMIN' : 'USER';
    await this.loginAs(role);
  }

  async loginAs(role: DemoAppRole) {
    this.isLoading = true;
    const fallbackEmail = role === 'ADMIN' ? 'admin@demo.local' : 'user@demo.local';
    await this.demoAuthService.login(this.email || fallbackEmail, role);
    this.isLoading = false;
    await this.router.navigateByUrl(role === 'ADMIN' ? '/learning/admin/trainings' : '/learning/user/trainings');
  }
}
