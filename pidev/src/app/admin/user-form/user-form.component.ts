import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../shared/user.service';
import { User, UserRole, UserCreate, UserUpdate } from '../../shared/user';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  user: any = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: UserRole.FREELANCER
  };
  
  roles = Object.values(UserRole);
  isEditMode = false;
  userId?: number;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId = Number(id);
      this.isEditMode = true;
      this.loadUser();
    }
  }

  loadUser(): void {
    if (!this.userId) return;
    
    this.userService.getUserById(this.userId).subscribe({
      next: (data: User) => {
        this.user = { ...data };
        delete this.user.password;
      },
      error: (err: any) => console.error('Erreur chargement:', err)
    });
  }

  onSubmit(): void {
    if (this.isEditMode && this.userId) {
      const updateData: UserUpdate = {
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        phone: this.user.phone
      };
      this.userService.updateUser(this.userId, updateData).subscribe({
        next: () => this.router.navigate(['/admin/users']),
        error: (err: any) => console.error('Erreur mise à jour:', err)
      });
    } else {
      const createData: UserCreate = {
        email: this.user.email,
        password: this.user.password,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        phone: this.user.phone,
        role: this.user.role
      };
      this.userService.createUser(createData).subscribe({
        next: () => this.router.navigate(['/admin/users']),
        error: (err: any) => console.error('Erreur création:', err)
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/users']);
  }
}