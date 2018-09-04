import { Injectable } from '@angular/core';
import { SharedDataService } from '../../services/shared-data.service';

import { MatSnackBar, MatSnackBarConfig, MatDialog } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { ConstantsService } from '../../services/constants.service';
import { IndexedDBService } from '../../db/indexeddb.service';
import { AuthenticationService } from '../../login/authentication.service';
import { IbUtilsService } from '../../services/ib-utils.service';
import { ProjectService } from '../../services/project.service';
import { UtilsService } from './utils.service';

import { DialogPopup } from '../../components/dialog/dialogpopup.component';
import { WebSocketClient } from '../../socket/websocketclient.service'

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(private utilsService: UtilsService, private projectService: ProjectService, private ibUtilsService: IbUtilsService, private authenticationService: AuthenticationService, private sharedDataService: SharedDataService, private snackbar: MatSnackBar, public dialog: MatDialog, private router: Router, private constantsService: ConstantsService, private indexedDBService: IndexedDBService, private webSocketClient: WebSocketClient) {
  }

  selectedOption: string;
  savePublicationCounter: number = 0;
  activePublicationIndex: number = -1;
  closePublicationObject: any = null;
  private mainPublicationObject = null;

  logoutPopUp(event) {
    var changeInPublication = false;
    for (let pub of this.sharedDataService.publicationList) {
      if (pub._isChange) {
        changeInPublication = true;
      }
    }
    if (changeInPublication) {
      let dialogRef = this.dialog.open(DialogPopup);
      dialogRef.componentInstance.userQuery = "DO_YOU_WANT_TO_SAVE_CHANGES";
      dialogRef.componentInstance.dialogName = "LOGOUT_DIALOG";
      dialogRef.afterClosed().subscribe(result => {
        this.selectedOption = result;
        if (this.selectedOption == '1') {
          this.onLogoutSave(event);
        } else if (this.selectedOption == '0') {
          this.logout(event);
        }
      });
    }
    else {
      this.logout(event);
    }
  }

  logout(event?) {
    // if (this.currentlocation == "/" + this.constantsService.PUBLICATION_WIZARD + "/generate") {
    //   this.sharedDataService.publicationList.length = 0;
    // }
    if (this.utilsService.isPresent(this.sharedDataService.isLoggedIn)) {
      this.authenticationService.logout()
        .subscribe(
          (response) => {
            this.webSocketClient.disconnect();
            localStorage.clear();
            sessionStorage.clear();
            localStorage.setItem('mbopen', 'No');
            localStorage.setItem('pwopen', 'No');
            this.sharedDataService.setPublicationList([]);
            this.sharedDataService.setActivePublication(null);
            this.sharedDataService.isLoggedIn = null;
            this.sharedDataService.setStyleNames([]);
            this.indexedDBService.deleteAllPublication();
            this.indexedDBService.deleteAllProjects();
            this.indexedDBService.stacklistFromProject = new Map<string, any>();
            this.indexedDBService.projectMasterPages = new Map<string, Map<string, any>>();
            this.indexedDBService.projectStaticPages = new Map<string, Map<string, any>>();
            localStorage.setItem('PUB_ID', '0');
            this.router.navigate(['/']);
          }
        )
    }
  }

  onLogoutSave(event) {
    this.savePublicationCounter = 0;
    this.utilsService.notificationWithTranslation('SAVING');
    this.saveNextPublication(event);
  }

  saveNextPublication(event) {
    if (this.savePublicationCounter < this.sharedDataService.publicationList.length) {
      if (this.sharedDataService.publicationList[this.savePublicationCounter]._isChange) {
        this.sharedDataService.setActivePublicationIndex(this.savePublicationCounter);
        this.savePublication(event, true, this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]);
        this.savePublicationCounter++;
      } else {
        this.savePublicationCounter++;
        this.saveNextPublication(event);
      }
    } else {
      this.logout(event);
      this.snackbar.dismiss();
    }
  }


  savePublication(event, islogout: boolean, publicationObject, type?, counter?, innerCallback?) {
    /* For Builder Save */
    let tempVariablesArray = this.utilsService.deepCopy(publicationObject._respondata.publication.variables);
    if (publicationObject._mainPubItems.length != 0) {
      let tempArray = this.utilsService.deepCopy(publicationObject._mainPubItems);
      this.ibUtilsService.removeTempElement(tempArray);
      this.ibUtilsService.removeSelectedValueFromTempVariables(tempVariablesArray);
      publicationObject._respondata.publication.pages = this.utilsService.deepCopy(tempArray);
    } else {
      publicationObject._respondata.publication.pages = [];
    }
    publicationObject._respondata.publication.selectedStackElements = publicationObject._elementlist_table;

    let tempPub = this.utilsService.deepCopy(publicationObject._respondata.publication);
    tempPub.variables = this.utilsService.deepCopy(tempVariablesArray);

    this.projectService.savePublication(publicationObject._respondata.publication.project, tempPub).subscribe(
      (response) => {
        if (response.code == 100) {
          if (islogout) {
            this.saveNextPublication(event);
          } else {
            this.utilsService.notificationWithTranslation('SAVED', []);
            this.indexedDBService.updatePublicationInProject(publicationObject._respondata.publication, publicationObject._respondata.publication.project);
            publicationObject._isChange = false;
            this.indexedDBService.updatePublication(publicationObject._respondata.publication.project, publicationObject._respondata.publication.id, publicationObject, function (publicationId) {
            });
          }
        } else {
          this.ibUtilsService.showIBErrors(response);
        }
        if (this.utilsService.isPresent(type) && (type == this.constantsService.SAVE_ALL)) {
          counter++;
          this.saveAllPublicationOfAProject(event, publicationObject._respondata.publication.project, counter, (data) => {
            innerCallback(data);
          });
        }
        if (this.closePublicationObject != null) {
          this.closepublicationFinal(this.closePublicationObject);
          this.closePublicationObject = null;
        }
      });
  }


  closepublicationFinal(publication) {
    let indexOfPublication = this.sharedDataService.publicationList.indexOf(publication);
    this.sharedDataService.publicationList.splice(indexOfPublication, 1);
    this.projectService.unlockPublication(publication._respondata.publication.project, publication._respondata.publication.id).subscribe(
      (response) => {
        if (response.code == 100) {
          this.indexedDBService.deletePublication(publication._respondata.publication.id);
        } else {
          this.ibUtilsService.showIBErrors(response);
        }
      });

    if (this.sharedDataService.publicationList.length > 0) {
      if ((indexOfPublication == this.sharedDataService.activePublicationIndex)) {
        if (indexOfPublication >= 1) {
          this.mainPublicationObject = this.sharedDataService.publicationList[indexOfPublication - 1];
          this.ibUtilsService.activatePublication(this.mainPublicationObject)
        } else if (indexOfPublication == 0) {
          this.mainPublicationObject = this.sharedDataService.publicationList[indexOfPublication];
          this.ibUtilsService.activatePublication(this.mainPublicationObject)
        }
      } else {
        this.ibUtilsService.activatePublication(this.sharedDataService.activePublication)
      }
    } else {
      this.router.navigate(['/PublicationWizard/home']);
    }
  }

  /**
   * Saves all the unsaved publication for a particular project
   * 
   * @param event Save event
   * @param project Name of the project
   * @param counter To check if all the publications are saved
   * @param innerCallback this is a callback function giving number
   * @returns  callback value
   */
  saveAllPublicationOfAProject(event, project, counter, innerCallback) {
    if (counter < this.sharedDataService.publicationList.length) {
      if ((this.sharedDataService.publicationList[counter]._respondata.publication.project == project) && (this.sharedDataService.publicationList[counter]._isChange)) {
        this.utilsService.notificationWithTranslation('SAVING_PROJECT', [this.sharedDataService.publicationList[counter]._respondata.publication.id]);
        this.savePublication(event, false, this.sharedDataService.publicationList[counter], this.constantsService.SAVE_ALL, counter, innerCallback);
      } else {
        counter++;
        this.saveAllPublicationOfAProject(event, project, counter, (data) => {
          innerCallback(data);
        });
      }
    } else {
      this.snackbar.dismiss();
      innerCallback(1);
    }
  }
}
