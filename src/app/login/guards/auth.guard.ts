import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UtilsService } from "../../shared/services/utils.service";
import { ConstantsService } from "../../services/constants.service"


@Injectable({   providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private utilsService: UtilsService, private router: Router, private constantsService: ConstantsService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (localStorage.getItem(this.constantsService.ISLOGGEDIN)) {
      if (localStorage.getItem('role')) {
        if (localStorage.getItem('role') == 'All') {
          if (this.utilsService.isPresent(state.url) && state.url.includes('MarketingBoard')) {
            this.router.navigate(['/MarketingBoard']);
          } else {
            this.router.navigate(['/PublicationWizard']);
          }
        } else if (localStorage.getItem('role') == 'MarketingBoard') {
          this.router.navigate(['/MarketingBoard']);
        } else {
          this.router.navigate(['/PublicationWizard']);
        }
      }
      return false;
    }
    return true;
  }
}
