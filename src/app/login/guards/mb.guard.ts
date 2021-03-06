import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ConstantsService } from "../../services/constants.service";

@Injectable({   providedIn: 'root' })
export class MbGuard implements CanActivate {

  constructor(private router: Router, private constantsService: ConstantsService) { }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    if (localStorage.getItem(this.constantsService.ISLOGGEDIN) && (localStorage.getItem('role') == "All" || localStorage.getItem('role') == "MarketingBoard")) {
      if (localStorage.getItem('mbopen')) {
        if (localStorage.getItem('mbopen') == "No") {
          localStorage.setItem('mbopen', 'Yes');
        } else {
          if (localStorage.getItem('embeddedUrl') == "No") {
            this.router.navigate(['/Unauthorised'], { queryParams: { returnUrl: "MarketingBoard" } });
          }
        }
      } else {
        localStorage.setItem('mbopen', 'Yes');
      }
      return true;
    }
    this.router.navigate(['/Login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
