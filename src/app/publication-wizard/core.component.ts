import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarConfig, MatDialog } from '@angular/material';
import { Observable } from 'rxjs';
import { Title } from '@angular/platform-browser';

import { TranslateService } from '@ngx-translate/core';

import { DialogPopup } from '../components/dialog/dialogpopup.component';

import { UtilsService } from '../shared/services/utils.service';
import { SharedDataService } from '../services/shared-data.service';
import { IbUtilsService } from '../services/ib-utils.service';
import { IndexedDBService } from '../db/indexeddb.service';
import { CommonService } from '../shared/services/common.service';
import { ProjectService } from '../services/project.service';
import { ConstantsService } from '../services/constants.service';
import { PublicationdtoService } from '../dto/publicationdto.service';


@Component({
  selector: 'app-core',
  templateUrl: './core.component.html',
  styleUrls: ['./core.component.scss']
})
export class CoreComponent implements OnInit {

  navigationPW = [
    {
      'title': "PUBLICATION_SELECTION",
      'navigate': "/PublicationWizard/home",
      'icon': 'folder_open'
    }, {
      'title': "ELEMENT_SELECTION",
      'navigate': "/PublicationWizard/element-selection",
      'icon': 'list'
    }, {
      'title': "BUILDER",
      'navigate': "/PublicationWizard/builder-elementlist",
      'icon': 'build'
    }, {
      'title': "SETTINGS",
      'navigate': "/PublicationWizard/settings",
      'icon': 'settings'
    }, {
      'title': "GENERATE",
      'navigate': "/PublicationWizard/generate",
      'icon': 'slow_motion_video'
    }
  ];

  selectedOption: string;
  closePublicationObject: any = null;
  activePublicationIndex: number = -1;
  private mainPublicationObject = null;
  savePublicationCounter: number = 0;
  private _publicationList: PublicationdtoService[] = [];
  currentlocation: any;

  constructor(private translate: TranslateService, private projectService: ProjectService, private router: Router, private commonService: CommonService, private indexedDBService: IndexedDBService, public dialog: MatDialog, public ibUtilsService: IbUtilsService, public utilsService: UtilsService, public sharedDataService: SharedDataService, public constantsService: ConstantsService) {
    let publicationIds = sessionStorage.getItem(this.constantsService.PUBLICATION_IDS);
    if (this.utilsService.isPresent(publicationIds)) {
      this.projectService.lockALLPublications(publicationIds).subscribe();
      sessionStorage.removeItem(this.constantsService.PUBLICATION_IDS);
    }

    this.router.events.subscribe((data: any) => { this.currentlocation = data.url; });

    if (this.utilsService.isObjNotEmpty(sessionStorage.getItem('workflows'))) {
      this.sharedDataService.setWorkflows(JSON.parse(sessionStorage.getItem('workflows')));
    }
    if (this.sharedDataService.activePublication == undefined) {
      if ((sessionStorage.getItem('activepublication') != "null") && (sessionStorage.getItem('activepublication') != null) && (sessionStorage.getItem('activepublication') != undefined) && (sessionStorage.getItem('activepublication') != 'undefined')) {
        this.mainPublicationObject = {};
        let activePublicationObject = JSON.parse(sessionStorage.getItem('activepublication'));
        let self = this;
        this.indexedDBService.getAllPublications(function (publicationList) {
          self._publicationList = publicationList;
          // self._publicationList = JSON.parse(sessionStorage.getItem('sessionPublicationList'));
          self.sharedDataService.setPublicationList(self._publicationList);
          for (let index in self._publicationList) {
            if ((self._publicationList[index]._respondata.publication.id == activePublicationObject.publicationId) && (self._publicationList[index]._respondata.publication.project == activePublicationObject.projectName)) {
              self.mainPublicationObject = self._publicationList[index];
            }
          }
          self.sharedDataService.setActivePublication(self.mainPublicationObject);

          self.activePublicationIndex = self._publicationList.indexOf(self.mainPublicationObject);
          self.sharedDataService.setActivePublicationIndex(self.activePublicationIndex);
        });

      }

    } else {
      this.mainPublicationObject = this.sharedDataService.activePublication;
      this._publicationList = this.sharedDataService.publicationList;

      this.activePublicationIndex = this._publicationList.indexOf(this.mainPublicationObject);
      this.sharedDataService.setActivePublicationIndex(this.activePublicationIndex);
    }

    if (this.utilsService.isPresent(sessionStorage.getItem('refreshlocation')) && sessionStorage.getItem('refreshlocation') != "/") {
      let navPath = JSON.parse(sessionStorage.getItem('refreshlocation'));
      sessionStorage.removeItem('refreshlocation')
      if (navPath.includes('/PublicationWizard/')) {
        this.router.navigate(['/PublicationWizard/home']);
      }
    }
  }

  ngOnInit() {
  }

  isActivatePublication(publicationdto) {
    let index = this.sharedDataService.publicationList.indexOf(publicationdto);
    return this.sharedDataService.activePublicationIndex == index;
  }

  closepublication(publication, event) {
    if (publication._isChange) {
      let dialogRef = this.dialog.open(DialogPopup);
      dialogRef.componentInstance.userQuery = "DO_YOU_WANT_TO_SAVE_CHANGES";
      dialogRef.componentInstance.dialogName = "CLOSE_PUBLICATION";
      dialogRef.afterClosed().subscribe(result => {
        this.selectedOption = result;
        if (this.selectedOption == '1') {
          this.closePublicationObject = publication
          this.commonService.savePublication(event, false, publication);
          //  this.closepublicationFinal(publication);
        } else if (this.selectedOption == '0') {
          this.commonService.closepublicationFinal(publication);
        }
      });
    } else {
      this.commonService.closepublicationFinal(publication);
    }
  }

  synchronizeWithServerPopUp() {
    if (this.sharedDataService.publicationList.length > 0) {
      let dialogRef = this.dialog.open(DialogPopup);
      dialogRef.componentInstance.userQuery = "OPEN_PUBLICATION_TO_BE_CLOSED_PROCEED";
      dialogRef.componentInstance.dialogName = "SYNCHRONIZE_WITH_SERVER";

      for (let pub of this.sharedDataService.publicationList) {
        if (pub._isChange) {
          dialogRef.componentInstance.userQuery = "OPEN_PUBLICATION_TO_BE_CLOSED_UNSAVED_PUBLICATION_PRESENT_PROCEED";
        }
      }
      dialogRef.afterClosed().subscribe(result => {
        this.selectedOption = result;
        if (this.selectedOption == '1') {
          this.synchronizeWithServer();
        }
      });
    } else {
      this.synchronizeWithServer();
    }
  }

  synchronizeWithServer() {
    this.projectService.synchronizeWithServer().subscribe(
      (response) => {
        this.sharedDataService.setPublicationList([]);
        this.sharedDataService.setActivePublicationIndex(-1);
        this.sharedDataService.setWorkflows([]);
        this.sharedDataService.setStyleNames([]);
        this.indexedDBService.deleteAllPublication();
        this.indexedDBService.deleteAllProjects();
        this.indexedDBService.stacklistFromProject = new Map<string, any>();
        this.indexedDBService.projectMasterPages = new Map<string, Map<string, any>>();
        this.indexedDBService.projectStaticPages = new Map<string, Map<string, any>>();
        localStorage.setItem('PUB_ID', '0');
        if (response.code == 100) {
          if ((window.location.hash.indexOf('home') > -1)) {
            this.router.navigate(['/PublicationWizard/sync']);
          } else {
            this.router.navigate(['/PublicationWizard/home']);
          }
        } else {
          this.ibUtilsService.showIBErrors(response);
        }
      });
  }


  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if ((event.key == 's' && event.ctrlKey) || (event.keyCode == 83 && event.metaKey)) {
      this.commonService.savePublication(event, false, this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]);
      return false;
    }
    if (event.which == 13) {
      event.preventDefault();
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.sharedDataService._isCallfromSubmit) {
      this.sharedDataService._isCallfromSubmit = false;
      return;
    }
    if (!this.canDeactivate()) {
      this.translate.get("ARE_YOU_SURE_YOU_WANT_TO_LEAVE").subscribe((res: string) => {
        $event.returnValue = res;
      });
    }
  }

  canDeactivate(): Observable<boolean> | boolean {
    let projectPublicationIds = [];
    for (let index in this.sharedDataService.publicationList) {
      let projectPublicationObject = {};
      projectPublicationObject[this.constantsService.PROJECT_ID] = this.sharedDataService.publicationList[index]._respondata.publication.project;
      projectPublicationObject[this.constantsService.PUBLICATION_ID] = this.sharedDataService.publicationList[index]._respondata.publication.id;
      projectPublicationIds.push(projectPublicationObject);
      this.sharedDataService.publicationList[index]._stackListPageNumber = 1;
      this.sharedDataService.publicationList[index]._selectedStackFilter = "";
      this.sharedDataService.publicationList[index]._selectedBucketRows = [];
      this.sharedDataService.publicationList[index]._selectedStackRows = [];

      this.sharedDataService.publicationList[index]._image = "";
      this.sharedDataService.publicationList[index]._defaultImageName = "default.jpg";
      this.sharedDataService.publicationList[index]._selectedRow = undefined;
      this.sharedDataService.publicationList[index]._selectedDisplayValue = "";
      this.sharedDataService.publicationList[index]._isQuickPreview = true;
      this.sharedDataService.publicationList[index]._selectedTemplate = "Quick_Preview";
      // this.indexedDBService.updatePublication(this.sharedDataService.publicationList[index]._respondata.publication.project, this.sharedDataService.publicationList[index]._respondata.publication.id, this.sharedDataService.publicationList[index], function (publicationId) {

      // });
    }

    localStorage.setItem("pwopen", "No");
    let activePublicationObject = {
      projectName: "",
      publicationId: ""
    }
    if (this.sharedDataService.publicationList.length > 0) {
      activePublicationObject.publicationId = this.sharedDataService.activePublication._respondata.publication.id;
      activePublicationObject.projectName = this.sharedDataService.activePublication._respondata.publication.project;
    }
    sessionStorage.setItem('activepublication', JSON.stringify(activePublicationObject));
    sessionStorage.setItem('workflows', JSON.stringify(this.sharedDataService._workflows));
    sessionStorage.setItem('refreshlocation', JSON.stringify(this.currentlocation));
    if (projectPublicationIds.length > 0) {
      let projectPublicatonIdsJsonString = JSON.stringify(projectPublicationIds);
      sessionStorage.setItem(this.constantsService.PUBLICATION_IDS, projectPublicatonIdsJsonString);
      this.projectService.unlockALLPublications(projectPublicatonIdsJsonString);
    }
    if (!this.utilsService.isPresent(this.sharedDataService.isLoggedIn)) {
      return true;
    }
    return false;
  }


}
