import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-feature-pending',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './feature-pending.component.html',
  styleUrl: './feature-pending.component.scss',
})
export class FeaturePendingComponent {
  private readonly route = inject(ActivatedRoute);
  readonly moduleName = this.route.snapshot.queryParamMap.get('modulo') ?? 'Este módulo';
}
