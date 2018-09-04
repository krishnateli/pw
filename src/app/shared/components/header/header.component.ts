import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { SharedDataService } from '../../../services/shared-data.service';
import { UtilsService } from '../../services/utils.service';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Input() currentApp: string;
  @Input() isLogin: boolean;
  @Output() synchronize = new EventEmitter();

  isOpenUserDropdown: boolean;
  originPath = window.location.origin;
  appLanguage: string = "en";
  languages = [
    { key: 'English', value: 'en' },
    { key: 'German', value: 'de' },
  ];

  customPanelBgColor: string;
  customPanelColor: string;
  customPanelFontStyle: string;

  constructor(public commonService: CommonService, public utilsService: UtilsService, public sharedDataService: SharedDataService) { }

  ngOnInit() {
    this.customPanelBgColor = this.sharedDataService._Customization.topPagePanel ? this.sharedDataService._Customization.topPagePanel.bgColor : '';
    this.customPanelColor = this.sharedDataService._Customization.topPagePanel ? this.sharedDataService._Customization.topPagePanel.color : '';
    this.customPanelFontStyle = this.sharedDataService._Customization.font ? this.sharedDataService._Customization.font.style : '';
  }

  sync() {
    this.synchronize.emit();
  }

  toggleUserDropdown() {
    this.isOpenUserDropdown = !this.isOpenUserDropdown;
  }

  navigateTo(path) {
    if (path == "PublicationWizard") {
      if (localStorage.getItem('pwopen') == "No") {
        window.open(this.originPath + '/InBetween/#/PublicationWizard', '_blank');
      } else {
        this.utilsService.notificationWithTranslation('PW_TAB_ALREADY_OPEN');
      }
    } else {
      if (localStorage.getItem('mbopen') == "No") {
        window.open(this.originPath + '/InBetween/#/MarketingBoard', '_blank')
      } else {
        this.utilsService.notificationWithTranslation('MB_TAB_ALREADY_OPEN');
      }
    }
  }

}
