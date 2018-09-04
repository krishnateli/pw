import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { catchError } from 'rxjs/operators';

import { SharedDataService } from '../../../services/shared-data.service';
import { AppConfig } from '../../../app.config';
import { IbUtilsService } from '../../../services/ib-utils.service';
import { ConstantsService } from '../../../services/constants.service';


@Injectable({   providedIn: 'root' })
export class GenerateService {

  constructor(private http: HttpClient, private sharedDataService: SharedDataService, private appConfig: AppConfig, private ibUtilsService: IbUtilsService, private constantsService: ConstantsService) { }


  generatePublication(project: string, language: string, publication: any, outputmedium: string, outputfilename: string, additionalparams: string, appendFileContent: string) {
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, 'language=' + language + '&project=' + encodeURIComponent(project) + '&publication=' + encodeURIComponent(JSON.stringify(publication)) + '&outputmedium=' + outputmedium + '&outputfilename=' + encodeURIComponent(outputfilename) + '&additionalparams=' +
      encodeURIComponent(additionalparams) + '&method=generatePublication' + '&appendfilecontent=' + appendFileContent)
      .pipe(catchError(this.ibUtilsService.handleError));
  }

  generatePublicationStatus(jobid: string, generationresult: any, outputmedium: string, isHTML5Preview: string) {
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, 'isHTML5Preview=' + isHTML5Preview + '&jobid=' + jobid + '&generationresult=' + encodeURIComponent(JSON.stringify(generationresult)) + '&outputmedium=' + outputmedium + '&method=generatePublicationStatus')
      .pipe(catchError(this.ibUtilsService.handleError));
  }

  generatePublicationForPageScopes(project: string, language: string, publication: any, outputmedium: string, outputfilename: string, pagescopeid: any, additionalparams: string, appendFileContent: string) {
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, 'language=' + language + '&project=' + encodeURIComponent(project) + '&publication=' + encodeURIComponent(JSON.stringify(publication)) + '&outputmedium=' + outputmedium + '&outputfilename=' + encodeURIComponent(outputfilename) + '&pagescopeid=' + encodeURIComponent(JSON.stringify(pagescopeid)) + '&additionalparams=' + encodeURIComponent(additionalparams) + '&method=generatePublicationForPageScopes')
      .pipe(catchError(this.ibUtilsService.handleError));
  }

  getPdfStylesList() {
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, 'method=getPdfStylesList')
      .pipe(catchError(this.ibUtilsService.handleError));
  }

  uploadAppendFile(event, projectName, outputMedium) {
    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      let file: File = fileList[0];
      let formData: FormData = new FormData();
      formData.append('Upload', new Blob([file], { type: 'application/x-indesign' }), encodeURIComponent(file.name));
      formData.append('outputMedium', outputMedium);
      formData.append('projectName', projectName);
      return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.UPLOAD_SERVLET + '/appendFile', formData)
        .pipe(catchError(this.ibUtilsService.handleError));
    }
  }
}
