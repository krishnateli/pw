import { Injectable } from '@angular/core';
import { AppConfig } from '../../app.config';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { ConstantsService } from '../../services/constants.service';
import { FormControl } from '@angular/forms';
import * as moment from 'moment';


@Injectable({   providedIn: 'root' })
export class UtilsService {

  constructor(private translate: TranslateService, private appConfig: AppConfig, private translateService: TranslateService, private snackbar: MatSnackBar, private router: Router, private constantsService: ConstantsService) {
  }

  redirectToHomePageWithDelay() {
    setTimeout(this.router.navigate(['/']), 2500);
  }

  /* --- Check Object is blank or null or undefined --- */
  isObjNotEmpty(obj) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        return true;
      }
    }
    return JSON.stringify(obj) != undefined && JSON.stringify(obj) != null;
  }

  /* --- Deep Copy Function --- */
  deepCopy(o) {
    var copy = o, k;
    if (o && typeof o === 'object') {
      copy = Object.prototype.toString.call(o) === '[object Array]' ? [] : {};
      for (k in o) {
        copy[k] = this.deepCopy(o[k]);
      }
    }
    return copy;
  }

  /* --- Check String is blank or null or undefined --- */
  isPresent(str: any) {
    return str !== undefined && str !== null && str !== "";
  }

  /* --- Tooltip check for dropdown --- */
  checkTooltip(currElem) {
    if (currElem._element.nativeElement.offsetWidth != 0) {
      if (currElem._element.nativeElement.scrollWidth <= currElem._element.nativeElement.offsetWidth) {
        currElem._element.nativeElement.title = "";
      }
    }
  }

  /* --- Show notification bar in the ui with translation--- */
  notificationWithTranslation(messageKey, params?, duration?) {
    let config = new MatSnackBarConfig();
    if(duration){
      config.duration = duration;
    }
    else{
      config.duration = 2500;
    }
    
    var paramsObject = {};
    if (this.isObjNotEmpty(params)) {
      for (let index in params) {
        paramsObject[index] = params[index];
      }
    }
    this.translateService.get(messageKey, paramsObject).subscribe((res: string) => {
      this.snackbar.open(res, '', config);
    });
    if (messageKey == "CODE_DISCONNECTED") {
      localStorage.removeItem(this.constantsService.ISLOGGEDIN);
      this.router.navigate(['/']);
    }
  }



  /*---------------checks if a file name is valid-------------------*/
  isValidFileName(fileName) {
    var rg1 = /^[^\\/:\*\?"<>\|]+$/; // forbidden characters \ / : * ? " < > |
    var rg2 = /^\./; // cannot start with dot (.)
    var rg3 = /^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i; // forbidden file names
    return rg1.test(fileName) && !rg2.test(fileName) && !rg3.test(fileName);
  }

  getValidDate(dateString) {
    var validDate = "";
    if (this.isPresent(dateString)) {
      validDate = moment(dateString, "DD.MM.YYYY HH:mm:ss").format("DD.MM.YY HH:mm");
    }
    return validDate;
  }

  /* --- mm to Pixel Conversion Function --- */
  mmToPixel(mm) {
    let dpi: number = 96;
    return dpi / 25.4 * mm;
  }

  isLogged() {
    if (localStorage.getItem(this.constantsService.ISLOGGEDIN)) {
      return true;
    }
    return false;
  }

  changeLang(event) {
    this.translate.use(event);
  }

  isAllLicense() {
    if (localStorage.getItem('role') && localStorage.getItem('role') == 'All') {
      return true;
    }
    return false;
  }

  
  validateEmptyVal(input: FormControl) {
    if (!input.value.length) {
      return null;
    }
    if (input.value != undefined && !input.value.replace(/\s/g, '').length) {
      return input;
    }
    return null;
  }

}
