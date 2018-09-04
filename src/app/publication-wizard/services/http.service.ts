import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

import { AppConfig } from '../../app.config';
import { IbUtilsService } from '../../services/ib-utils.service';
import { ConstantsService } from '../../services/constants.service';


@Injectable({   providedIn: 'root' })
export class HttpService {
    constructor(private http: HttpClient, private appConfig: AppConfig, private constantsService: ConstantsService, private ibUtilsService: IbUtilsService) { }

    getOutputFormats() {
        return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, 'method=getOutputFormats')
            .pipe(catchError(this.ibUtilsService.handleError));
    }

    isStaticPageLicensed() {
        return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, 'method=isStaticPageLicensed')
            .pipe(catchError(this.ibUtilsService.handleError));
    }

    canUploadDataXML() {
        return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, 'method=canUploadDataXML')
            .pipe(catchError(this.ibUtilsService.handleError));
    }

}