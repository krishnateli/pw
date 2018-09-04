import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { AuthenticationService } from '../login/authentication.service';
import { SharedDataService } from '../services/shared-data.service';
import { UtilsService } from '../shared/services/utils.service';
import { IbUtilsService } from '../services/ib-utils.service';
import { ConstantsService } from '../services/constants.service';
import { IndexedDBService } from '../db/indexeddb.service';
import { WebSocketClient } from '../socket/websocketclient.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {
  public loginForm = this.fb.group({
    username: ["", Validators.required],
    password: ["", Validators.required]
  });
  error: string;
  returnUrl: string;
  loginInprogress: boolean = false;
  embeddedUrl: boolean;
  customPanelBgColor: string;
  customPanelColor: string;
  customPanelFontStyle: string;

  constructor(private title: Title, private ibUtilsService: IbUtilsService, private route: ActivatedRoute, public fb: FormBuilder, public authenticationService: AuthenticationService, private router: Router, public sharedDataService: SharedDataService, public utilsService: UtilsService, private constantsService: ConstantsService, private indexedDBService: IndexedDBService, private webSocketClient: WebSocketClient) { }

  ngOnInit() {
    this.title.setTitle("InBetween");
    this.loginInprogress = false;
    window.setTimeout(() =>
    this.sharedDataService.setShowTabs(false));
    this.sharedDataService.setTitle("LOGIN_TITLE");
    this.sharedDataService.setUsername("");
    sessionStorage.removeItem('activepublication');
    sessionStorage.removeItem('sessionPublicationList');
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'];
    this.embeddedUrl = this.route.snapshot.queryParams['embeddedUrl'];
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('pwopen', 'No');
    localStorage.setItem('mbopen', 'No');
    localStorage.setItem('embeddedUrl', 'No');
    if (this.utilsService.isPresent(this.embeddedUrl)) {
      localStorage.setItem('embeddedUrl', 'Yes');
    }
    this.customPanelBgColor = this.sharedDataService._Customization.headerPanel ? this.sharedDataService._Customization.headerPanel.bgColor : '';
    this.customPanelColor = this.sharedDataService._Customization.headerPanel ? this.sharedDataService._Customization.headerPanel.color : '';
    this.customPanelFontStyle = this.sharedDataService._Customization.font ? this.sharedDataService._Customization.font.style : '';
  }

  doLogin(event) {
    this.loginInprogress = true;
    this.sharedDataService.setPublicationList([]);
    this.sharedDataService.setActivePublication(null);
    this.indexedDBService.deleteAllPublication();
    this.indexedDBService.deleteAllProjects();
    this.indexedDBService.stacklistFromProject = new Map<string, any>();
    this.indexedDBService.projectMasterPages = new Map<string, Map<string, any>>();
    this.indexedDBService.projectStaticPages = new Map<string, Map<string, any>>();
    localStorage.setItem('PUB_ID', '0');
    let loginFormObj = this.loginForm.getRawValue();

    this.authenticationService.login(loginFormObj.username, loginFormObj.password)
      .subscribe(
        (response) => {
          if (response.code == this.constantsService.SUCCESS && response.authenticateResult == 0) {
            this.sharedDataService.setUsername(response.userName);
            this.sharedDataService.isLoggedIn = "true";
            localStorage.setItem('username', response.userName);
            localStorage.setItem(this.constantsService.ISLOGGEDIN, "true");
            localStorage.setItem('role', response.role);
            if (response.role == this.constantsService.MARKETING_BOARD) {
              this.router.navigate(['/' + this.constantsService.MARKETING_BOARD]);
            } else if (response.role == "All") {
              if (this.utilsService.isPresent(this.returnUrl) && this.returnUrl.includes('MarketingBoard')) {
                this.router.navigate(['/MarketingBoard']);
              } else {
                this.router.navigate(['/PublicationWizard']);
              }
            } else {
              this.router.navigate(['/' + this.constantsService.PUBLICATION_WIZARD]);
            }
            this.webSocketClient.reconnect();
          } else if (response.code == this.constantsService.FAIL) {
            this.error = 'INCORRECT_USERNAME_PASSWORD';
            this.loginInprogress = false;
          } else {
            this.loginInprogress = false;
            this.ibUtilsService.showIBErrors(response);
          }
        },
        // (error: AppError) => {          
        //   if(error instanceof NotFoundError) {
        //     alert("Data Not Found");
        //   } else if(error instanceof BadInputError){
        //     alert(error.originalError);
        //   } else {
        //     throw error;
        //   }
        //   this.loginInprogress = false;
        // }
      )
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.which === 13) {
      event.preventDefault();
      this.doLogin(event);
    }
  }

  setbuttonstyle() {
    let styles = {
      'background-color': !this.loginForm.valid ? 'rgba(0, 0, 0, .12)' : this.sharedDataService._Customization.componentColor.bgColor,
      'color': !this.loginForm.valid ? 'rgba(0, 0, 0, .38)' : this.sharedDataService._Customization.componentColor.color,
      'font-family': this.sharedDataService._Customization.font ? this.sharedDataService._Customization.font.style : ''
    };
    return styles;
  }

}
