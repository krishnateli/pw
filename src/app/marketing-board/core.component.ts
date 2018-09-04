import { Component, OnInit, HostListener } from '@angular/core';

import { UtilsService } from '../shared/services/utils.service';

@Component({
  selector: 'app-core',
  templateUrl: './core.component.html',
  styleUrls: ['./core.component.scss']
})
export class CoreComponent implements OnInit {

  navigationMB = [{
    'title': "DASHBOARD",
    'navigate': "/MarketingBoard/Dashboard",
    'icon': 'dashboard'
  }];

  constructor(public utilsService: UtilsService) { }

  ngOnInit() {
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    localStorage.setItem("mbopen", "No");
  }

}
