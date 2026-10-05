import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (!req.url.startsWith(environment.apiUrl + '/')) return next(req);

  // No interceptar requests a login/register
  if (req.url.includes('/auth/')) {
    return next(req);
  }

  const token = authService.getToken();
  
  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    
    return next(authReq).pipe(
      catchError(error => {
        if (error.status === 401 && authService.getToken() === token) {
          authService.logout();
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};
