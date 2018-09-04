import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

import { SharedDataService } from '../services/shared-data.service';
import { AppConfig } from '../app.config';
import { IbUtilsService } from '../services/ib-utils.service';
import { ConstantsService } from '../services/constants.service';


@Injectable({ providedIn: 'root' })
export class AuthenticationService {

  constructor(private http: HttpClient, private sharedDataService: SharedDataService, private appConfig: AppConfig, private ibUtilsService: IbUtilsService, private constantsService: ConstantsService) { }

  login(username: string, password: string) {
    let body: string = 'username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password) + '&method=login';
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.AUTHENTICATION_SERVLET, body)
      .pipe(catchError(this.ibUtilsService.handleError));
  }

  logout() {
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.AUTHENTICATION_SERVLET, 'method=logout')
      .pipe(catchError(this.ibUtilsService.handleError));
  }
}
