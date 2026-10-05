import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { FeatureName, isFeatureEnabled } from '../config/feature-flags';

export const featureAvailabilityGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
) => {
  const router = inject(Router);
  const feature = route.data['feature'] as FeatureName;

  if (isFeatureEnabled(feature)) {
    return true;
  }

  return router.createUrlTree(['/pendiente'], {
    queryParams: { modulo: route.data['featureLabel'] ?? feature },
  });
};
