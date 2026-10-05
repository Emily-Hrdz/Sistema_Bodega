import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { FEATURE_FLAGS } from '../../../core/config/feature-flags';

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
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard', enabled: FEATURE_FLAGS.dashboard },
    { icon: 'warehouse', label: 'Bodegas', route: '/bodegas/list', enabled: FEATURE_FLAGS.bodegas },
    { icon: 'inventory_2', label: 'Productos', route: '/productos/list', enabled: FEATURE_FLAGS.productos },
    { icon: 'swap_horiz', label: 'Kardex', route: '/kardex/list', enabled: FEATURE_FLAGS.kardex },
    { icon: 'local_shipping', label: 'Contenedores', route: '/containers', enabled: FEATURE_FLAGS.containers },
    { icon: 'sell', label: 'Lotes', route: '/lotes', enabled: FEATURE_FLAGS.lotes },
    { icon: 'people', label: 'Clientes', route: '/clientes', enabled: FEATURE_FLAGS.clientes },
    { icon: 'list_alt', label: 'Auditoría', route: '/audit-logs', enabled: FEATURE_FLAGS.auditoria },
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
