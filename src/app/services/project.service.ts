import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

import { SharedDataService } from './shared-data.service';
import { AppConfig } from '../app.config';
import { IbUtilsService } from './ib-utils.service';
import { ConstantsService } from '../services/constants.service';


@Injectable({   providedIn: 'root' })
export class ProjectService {

  constructor(private http: HttpClient, private sharedDataService: SharedDataService, private appConfig: AppConfig, private ibUtilsService: IbUtilsService, private constantsService: ConstantsService) {
  }

  unlockPublication(project: string, publication: string) {
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, 'project=' + project + '&publication=' + encodeURIComponent(publication) + '&method=unlockPublication')
      .pipe(catchError(this.ibUtilsService.handleError));
  }

  refreshDataSources(project: string) {
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, 'project=' + project + '&method=refreshDataSources')
      .pipe(catchError(this.ibUtilsService.handleError));
  }

  createPublication(project: string, masterpublication: string, newpublication: string, description: string, langlist: string) {
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, 'project=' + encodeURIComponent(project) + '&masterpublication=' + encodeURIComponent(masterpublication) + '&newpublication=' + encodeURIComponent(newpublication) + '&description=' + encodeURIComponent(description) + '&loglanguage=' + encodeURIComponent(langlist) + '&method=createpublication')
      .pipe(catchError(this.ibUtilsService.handleError));
  }

  openPublication(project: string, publication: string) {
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, 'project=' + encodeURIComponent(project) + '&publication=' + encodeURIComponent(publication) + '&method=openpublication')
      .pipe(catchError(this.ibUtilsService.handleError));
  }

  savePublication(project: string, publicationData: any) {
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, 'project=' + encodeURIComponent(project) + '&publicationData=' + encodeURIComponent(JSON.stringify(publicationData)) + '&method=savepublication')
      .pipe(catchError(this.ibUtilsService.handleError));
  }

  createDuplicatePublication(project: string, publication: string, publicationName: string, newpublicationname: string) {
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, 'project=' + encodeURIComponent(project) + '&publicationname=' + encodeURIComponent(publicationName) + '&publication=' + encodeURIComponent(publication) + '&newpublicationname=' + encodeURIComponent(newpublicationname) + '&method=createDuplicatePublication')
      .pipe(catchError(this.ibUtilsService.handleError));
  }

  synchronizeWithServer() {
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, 'method=synchronizeWithServer')
      .pipe(catchError(this.ibUtilsService.handleError));
  }

  getStackListForProject(project: string) {
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, 'project=' + encodeURIComponent(project) + '&method=getStackListForProject')
      .pipe(catchError(this.ibUtilsService.handleError));
  }

  getStackByIdForGrid(project: string, stackId: string, stackFilter: string, count: number, offset: number, getdefaultfilter?: boolean) {
    if(stackFilter == undefined || stackFilter == "undefined" || stackFilter == null) {
      stackFilter = "";
    }
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, 'project=' + encodeURIComponent(project) + '&stackid=' + encodeURIComponent(stackId) + '&stackfilter=' + encodeURIComponent(stackFilter) + '&count=' + count + '&offset=' + offset + '&getdefaultfilter=' + getdefaultfilter + '&method=getStackByIdForGrid')
      .pipe(catchError(this.ibUtilsService.handleError));
  }

  checkProjectSynchronization(project: string) {
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, 'project=' + encodeURIComponent(project) + '&method=checkProjectSynchronization')
      .pipe(catchError(this.ibUtilsService.handleError));
  }

  unlockALLPublications(projectpublicatonids: string) {
    let xhr = new XMLHttpRequest()
    xhr.open("POST", this.appConfig.getBaseURLWithContextPath() + "/MiddlewareServlet?projectpublicatonids=" + encodeURIComponent(projectpublicatonids) + "&method=unlockALLPublications", false);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');
    xhr.send();
  }

  lockALLPublications(projectpublicatonids: string) {
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, "projectpublicatonids=" + encodeURIComponent(projectpublicatonids) + '&method=lockALLPublications')
      .pipe(catchError(this.ibUtilsService.handleError));
  }

  fetchProjectList() {
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, 'method=getProjectList')
      .pipe(catchError(this.ibUtilsService.handleError));
  }

  getStaticPagePreview(project: string, publicationid: string, masterid: string, pagescopeid: string, language: string, newcopy: string, pageType: string) {
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, 'project=' + encodeURIComponent(project) + '&publicationid=' + encodeURIComponent(publicationid) + '&masterid=' + encodeURIComponent(masterid) + '&pagescopeid=' + encodeURIComponent(pagescopeid) + '&language=' + encodeURIComponent(language) + '&newcopy=' + encodeURIComponent(newcopy)+ '&pagetype=' + encodeURIComponent(pageType) + '&method=getStaticDocumentPreviewPages')
      .pipe(catchError(this.ibUtilsService.handleError));
  }

  getPublicationSelectionData(project: string) {
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, 'project=' + encodeURIComponent(project) + '&method=getPublicationSelectionData')
      .pipe(catchError(this.ibUtilsService.handleError));
  }

  getMasterPages(project: string, publication: string) {
    var headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + '/MiddlewareServlet', 'project=' + encodeURIComponent(project) + '&publication=' + encodeURIComponent(publication) + '&method=getMasterPages')
      .pipe(catchError(this.ibUtilsService.handleError));
  }

  getPublicationWithUpdatedProductState(project: string, publication: string) {
    var headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + '/MiddlewareServlet', 'project=' + encodeURIComponent(project) + '&publication=' + encodeURIComponent(publication) + '&method=getPublicationWithUpdatedProductState')
      .pipe(catchError(this.ibUtilsService.handleError));
  }

}
