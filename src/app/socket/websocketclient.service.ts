import { Injectable } from '@angular/core';
import { AppConfig } from '../app.config';
import { Router } from '@angular/router';
import { SharedDataService } from '../services/shared-data.service';

@Injectable({ providedIn: 'root' })
export class WebSocketClient {
    private webSocket;
 
    private websocketUrl;

    constructor(private appConfig: AppConfig, private router: Router, private sharedDataService: SharedDataService) {
        this.websocketUrl = appConfig.getBaseURLWithContextPath();
        if (this.websocketUrl) {
            this.websocketUrl = this.websocketUrl.replace("http", "ws") + "/endpoint"
        }      
    }

   /**
   * connects to websocket and waits for the message
   */
    connect() {
        try {     
            this.webSocket.onmessage = (event) => {
                var response = event.data;
                let jsonData = JSON.parse(response);
                if (jsonData.code == 104 || jsonData.code == 103) {
                    localStorage.clear();
                    sessionStorage.clear();
                    this.sharedDataService.isLoggedIn = null;
                    this.router.navigate(['/']);
                }
            }
        } catch (exception) {
            console.error(exception);
        }
    }

  /**
   * sends ping request
   */
    ping() {
        if (this.webSocket && this.webSocket.readyState == WebSocket.OPEN) {
            this.webSocket.send("ping");
        }
    }

   /**
   * disconnects from websocket if connected
   */
    disconnect() {
        if (this.webSocket && this.webSocket.readyState == WebSocket.OPEN) {
            this.webSocket.close();
        }
    }

   /**
   * reconnects to websocket
   */
    reconnect() {
        this.disconnect();
        this.webSocket = new WebSocket(this.websocketUrl);
    }
}
