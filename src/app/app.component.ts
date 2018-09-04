import { Component, HostListener } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { TranslateService } from '@ngx-translate/core';

import { SharedDataService } from './services/shared-data.service';
import { DialogPopup } from './components/dialog/dialogpopup.component';
import { ConstantsService } from './services/constants.service';
import { PingService } from './services/ping.service';
import { AppConfig } from './app.config';
import { WebSocketClient } from './socket/websocketclient.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private title: Title, private pingService: PingService, private translate: TranslateService, public sharedDataService: SharedDataService, public constantsService: ConstantsService, public appConfig: AppConfig, private webSocketClient: WebSocketClient) {
    translate.setDefaultLang("en");
    translate.addLangs(["en", "de"]);
    translate.use("en");
    this.title.setTitle(this.constantsService.INBETWEEN);
  }

  @HostListener('window:unload')
  unloadNotification() {
    this.webSocketClient.disconnect();
  }

}
