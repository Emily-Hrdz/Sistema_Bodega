import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  ngOnInit(): void {
    // Inicializar animaciones después de que la vista se renderice
    setTimeout(() => {
      this.animateNodes();
    }, 100);
  }

  private animateNodes(): void {
    const nodes = document.querySelectorAll('.node');
    nodes.forEach((node, index) => {
      (node as HTMLElement).style.animationDelay = `${index * 0.2}s`;
      node.classList.add('animate-in');
    });
  }
}