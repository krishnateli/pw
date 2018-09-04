import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { catchError } from 'rxjs/operators';

import { SharedDataService } from '../../../services/shared-data.service';
import { AppConfig } from '../../../app.config';
import { IbUtilsService } from '../../../services/ib-utils.service';
import { ConstantsService } from '../../../services/constants.service';


@Injectable({   providedIn: 'root' })
export class SettingsService {

  constructor(private http: HttpClient, private sharedDataService: SharedDataService, private appConfig: AppConfig, private ibUtilsService: IbUtilsService, private constantsService: ConstantsService) { }

  getDataSources(project: string) {
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, 'project=' + project + '&method=getDataSources')
      .pipe(catchError(this.ibUtilsService.handleError));
  }

  changeDataXML(fileName: string, project: string) {
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, 'project=' + project + '&fileName=' + encodeURIComponent(fileName) + '&method=changeDataXML')
      .pipe(catchError(this.ibUtilsService.handleError));
  }

  clearRefreshDataSourceResultHM() {
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, 'method=clearRefreshDataSourceResultHM')
      .pipe(catchError(this.ibUtilsService.handleError));
  }

  uploadDataSource(fileName, file, project) {
    let formData: FormData = new FormData();
    formData.append('Upload', file);
    formData.append('fileName', encodeURIComponent(fileName));
    formData.append('project', project);
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.UPLOAD_SERVLET + '/uploadDataSource', formData)
      .pipe(catchError(this.ibUtilsService.handleError));
  }

}
