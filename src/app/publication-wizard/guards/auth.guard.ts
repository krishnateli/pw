import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { PublicationSelectionComponent } from '../pages/publication-selection/publication-selection.component';
import { SharedDataService } from "../../services/shared-data.service";
import {ConstantsService} from "../../services/constants.service";

@Injectable({   providedIn: 'root' })
export class AuthGuard implements CanActivate {

    loginUrlPath: string = '/';
    homeUrlPath: string = '/PublicationWizard/home';
    syncPath: string = '/PublicationWizard/sync';

    constructor(private router: Router, private sharedDataService: SharedDataService, private constantsService:ConstantsService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (localStorage.getItem(this.constantsService.ISLOGGEDIN)) {
            // logged in so return true
            if (state.url == this.syncPath) {
                return true;
            }
            if ((state.url == this.loginUrlPath) || ((route.component == PublicationSelectionComponent) && state.url != this.homeUrlPath)) {
                this.router.navigate([this.homeUrlPath]);
                return true;
            }
            if ((state.url != this.homeUrlPath) && (state.url != this.loginUrlPath)) {
                if (this.sharedDataService.publicationList.length == 0) {
                    this.router.navigate([this.homeUrlPath]);
                    return true;
                }
                if (this.sharedDataService.publicationList.length > 0) {
                    return true;
                }
                if ((sessionStorage.getItem('activepublication') != "null") && (sessionStorage.getItem('activepublication') != null) && (sessionStorage.getItem('activepublication') != undefined) && (sessionStorage.getItem('activepublication') != 'undefined')) {
                   let activePublicationObject = JSON.parse(sessionStorage.getItem('activepublication'));
                    if (activePublicationObject == null || activePublicationObject == undefined) {
                        this.router.navigate([this.homeUrlPath]);
                        return true;
                    }
                } else {
                    this.router.navigate([this.homeUrlPath]);
                    return true;
                }
            }
            return true;
        }

        if (state.url == this.loginUrlPath) {
            return true;
        }
        // not logged in so redirect to login page with the return url
        this.router.navigate(['/Login'], { queryParams: { returnUrl: state.url } });
        return false;
    }
}
