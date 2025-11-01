import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  currentUser: User | null = null;
  isCollapsed = false;

  menuItems = [
    //{ icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
    { icon: 'warehouse', label: 'Bodegas', route: '/bodegas/list' },
    { icon: 'inventory_2', label: 'Productos', route: '/productos/list' },
    { icon: 'swap_horiz', label: 'Kardex', route: '/kardex/list' },
    { icon: 'local_shipping', label: 'Containers', route: '/containers' },
    { icon: 'sell', label: 'Lotes', route: '/lotes' },
    { icon: 'people', label: 'Clientes', route: '/clientes' },
    { icon: 'list_alt', label: 'Auditoría', route: '/audit-logs' },
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  logout(): void {
    this.authService.logout();
  }
}