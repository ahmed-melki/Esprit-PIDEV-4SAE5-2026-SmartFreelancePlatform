import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../shared/user.service';
import { User } from '../../shared/user';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  searchKeyword: string = '';

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data: User[]) => this.users = data,
      error: (err: any) => console.error('Erreur chargement:', err)
    });
  }

  search(): void {
    if (this.searchKeyword.trim()) {
      this.userService.searchUsers(this.searchKeyword).subscribe({
        next: (data: User[]) => this.users = data,
        error: (err: any) => console.error('Erreur recherche:', err)
      });
    } else {
      this.loadUsers();
    }
  }

  editUser(id: number): void {
    this.router.navigate(['/admin/users/edit', id]);
  }

  deleteUser(id: number): void {
    if (confirm('Supprimer cet utilisateur ?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => this.loadUsers(),
        error: (err: any) => console.error('Erreur suppression:', err)
      });
    }
  }

  addUser(): void {
    this.router.navigate(['/admin/users/add']);
  }
}