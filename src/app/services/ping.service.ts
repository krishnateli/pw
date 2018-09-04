import { Injectable } from '@angular/core';
import { Observable, interval } from 'rxjs';
import { Router } from '@angular/router';

import { AuthenticationService } from '../login/authentication.service';
import { SharedDataService } from './shared-data.service';
import { WebSocketClient } from '../socket/websocketclient.service'

@Injectable({   providedIn: 'root' })
export class PingService {

  constructor(private authenticationService: AuthenticationService, private sharedDataService: SharedDataService, private router: Router, private webSocketClient: WebSocketClient) {
    if (this.sharedDataService.isLoggedIn) {
      this.webSocketClient.reconnect();
    }
    setTimeout(() => {
      this.callPingApi();
    }, 1000);

    interval(25000)
      .subscribe((data) => {
        this.callPingApi();
      });
  }

  callPingApi() {
    if ((this.sharedDataService.isLoggedIn !== null) && (this.sharedDataService.isLoggedIn != undefined) && (this.sharedDataService.isLoggedIn.length > 0)) {
      this.webSocketClient.connect();
      this.webSocketClient.ping();
    }
  }

}
