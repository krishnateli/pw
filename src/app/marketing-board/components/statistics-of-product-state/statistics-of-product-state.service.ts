import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { catchError } from 'rxjs/operators';

import { SharedDataService } from '../../../services/shared-data.service';
import { AppConfig } from '../../../app.config';
import { IbUtilsService } from '../../../services/ib-utils.service';
import { ConstantsService } from '../../../services/constants.service';


@Injectable({   providedIn: 'root' })
export class StatisticsOfProductStateService {

  constructor(private http: HttpClient, private sharedDataService: SharedDataService, private appConfig: AppConfig, private ibUtilsService: IbUtilsService, private constantsService: ConstantsService) { }

  getStatisticsData() {
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MARKETING_BOARD_SERVLET, 'method=getMarketingBoardStatistics')
      .pipe(catchError(this.ibUtilsService.handleError));
  }

  getStatisticsPublicationDetails(projectName: string, masterPublication: string) {
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MARKETING_BOARD_SERVLET, 'projectName=' + projectName + '&masterPublicationId=' + masterPublication + '&method=getPublicationWithProductStateInformation')
      .pipe(catchError(this.ibUtilsService.handleError));
  }

}

