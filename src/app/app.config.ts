import { Inject, Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { SharedDataService } from './services/shared-data.service';

@Injectable({   providedIn: 'root' })
export class AppConfig {

  private baseURLWithContextPath: string = "http://localhost:8080/InBetween";

  constructor(private http: HttpClient, private sharedDataService: SharedDataService) { }

  public getBaseURLWithContextPath() {
    return this.baseURLWithContextPath;
  }

  public load() {
    return new Promise((resolve, reject) => {
      var path = 'assets/configuration.properties';
      var urlPath = '/GenericServlet';
      this.http.get(path, { responseType: 'text', observe: 'response' }).pipe(catchError((error: any): any => {
        resolve(true);
        return throwError(error || 'Server error');
      }))
      .subscribe((envResponse: any) => {
        var keyValuePairs = envResponse['body'].split("\n");
        var properties = {}
        for (var i = 0; i < keyValuePairs.length; i++) {
          var keyValueArr = keyValuePairs[i].trim().split("=");
          var key = keyValueArr[0];
          var value = keyValueArr[1];
          properties[key] = value
        }
        this.baseURLWithContextPath = properties['application.base.uri'];
        if ((this.baseURLWithContextPath == undefined) || (this.baseURLWithContextPath == null) || (this.baseURLWithContextPath.length <= 0)) {
          this.baseURLWithContextPath = window.location.origin + window.location.pathname;
          this.baseURLWithContextPath = this.baseURLWithContextPath.replace(/\/$/, "")
          if ((this.baseURLWithContextPath.indexOf("localhost:4200") > -1) && (isDevMode())) {
            this.baseURLWithContextPath = "http://localhost:8080/InBetween"; 
          }
        }  
        this.http.post(this.getBaseURLWithContextPath()+ urlPath,'method=getCustomizationData')
        .pipe(catchError((error: any): any => {
          error(true);
          return throwError(error || 'Server error');
          }))
          .subscribe((resp: any) => {
            if(resp['code'] == 100) {
              this.sharedDataService._Customization = resp.customization;
              // console.log(resp.customization,"customization-resp");
              resolve(true);
            }else{
              console.log("failed");
              this.http.get('assets/defaultConfig.json')
              .pipe(catchError((error:any):any => {
               console.log("failed again");
               error(true);
              }))
              .subscribe((defaultResp: any) => {
                this.sharedDataService._Customization = defaultResp;
                resolve(true);
              })
              //this.sharedDataService._Customization = [];
              //return throwError('INVALID_DATA.');
            }  
            resolve(true);
          }); 
        return throwError('Server error');
      });
    });
  }
}