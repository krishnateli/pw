import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { catchError } from 'rxjs/operators';

import { SharedDataService } from '../../../services/shared-data.service';
import { AppConfig } from '../../../app.config';
import { IbUtilsService } from '../../../services/ib-utils.service';
import { ConstantsService } from '../../../services/constants.service';


@Injectable({   providedIn: 'root' })
export class ElementselectionService {

  constructor(private http: HttpClient, private sharedDataService: SharedDataService, private appConfig: AppConfig, private ibUtilsService: IbUtilsService, private constantsService: ConstantsService) { }

  getDisplayedImageForStackElement(project: string, stackId: string, templateId: string, currentlink: string) {
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, 'project=' + encodeURIComponent(project) + '&stackid=' + encodeURIComponent(stackId) + '&currentlink=' + encodeURIComponent(currentlink) + '&templateId=' + encodeURIComponent(templateId) + '&method=getDisplayedImageForStackElement')
      .pipe(catchError(this.ibUtilsService.handleError));
  }

  getTemplatePreview(project: string, templateId: string, currentlink: string) {
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, 'project=' + encodeURIComponent(project) + '&templateid=' + encodeURIComponent(templateId) +  '&currentlink=' + encodeURIComponent(currentlink) + '&method=getTemplatePreview')
      .pipe(catchError(this.ibUtilsService.handleError));
  }

}
