import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot, Data } from '@angular/router';
import { SharedDataService } from "../../services/shared-data.service";
import { ProjectdtoService, Publication } from '../../dto/projectdto.service';
import { UtilsService } from "../../shared/services/utils.service";


@Injectable({   providedIn: 'root' })
export class RoutDataService implements Resolve<any>{

  constructor(private router: Router, public sharedDataService: SharedDataService, public utilsService: UtilsService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): any {
    let url: string = state.url;
    let activePub = this.sharedDataService.activePublication;
    let routdataId: any;
    if (url !== '/PublicationWizard/home') {
      if (this.utilsService.isPresent(this.sharedDataService.activePublication) && this.utilsService.isPresent(this.sharedDataService.activePublication._respondata.publication)) {
        let index = -1;
        for (let i = 0; i < this.sharedDataService._routeData.length; i++) {
          if (this.sharedDataService.activePublication._respondata.publication.id === this.sharedDataService._routeData[i].id) {
            index = i;
            break;
          }
        }
        if (index != -1) {
          this.sharedDataService._routeData.splice(index, 1);
        }
        this.sharedDataService._routeData.push({ id: this.sharedDataService.activePublication._respondata.publication.id, path: url });
        return "";
      }
    }
  }
}
