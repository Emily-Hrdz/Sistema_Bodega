import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from '../app/app.component';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from '../app/app.routes';
import { provideHttpClient } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withHashLocation()), // hash routing para GitHub Pages
    provideHttpClient()                        // HttpClient
  ]
}).catch(err => console.error(err));
