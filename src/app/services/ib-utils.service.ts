
import { throwError as observableThrowError, Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { ProjectdtoService, Publication } from '../dto/projectdto.service';
import { SharedDataService } from './shared-data.service';
import { UtilsService } from '../shared/services/utils.service';
import { ConstantsService } from '../services/constants.service';
import { IndexedDBService } from '../db/indexeddb.service';
import { MasterPublicationdtoService } from '../dto/masterPublicationdto.service';
import { TranslateService } from '@ngx-translate/core';

import { AppError } from '../shared/error-handler/app-error';

@Injectable({   providedIn: 'root' })
export class IbUtilsService {

  private randomNumber = new BehaviorSubject<number>(0);
  publicationChanged = this.randomNumber.asObservable();

  constructor(private translateService: TranslateService, private sharedDataService: SharedDataService, private utilsService: UtilsService, private constantsService: ConstantsService, private indexedDBService: IndexedDBService, public router: Router) { }

  showIBErrors(error, actionMsg?) {
    if (error.code == this.constantsService.FAIL || error.code == this.constantsService.MISSING_PARAMETER) {
      this.utilsService.notificationWithTranslation(error.message, []);
    } else if (error.code == this.constantsService.EXCEPTION) {
      this.utilsService.notificationWithTranslation(error.message, error.params);
    } else if ((error.code == this.constantsService.USER_NOT_LOGGEDIN_EXCEPTION) || (error.code == this.constantsService.CONNECTION_REFUSED)) {
      if (error.code == this.constantsService.CONNECTION_REFUSED) {
        this.utilsService.notificationWithTranslation(error.message, []);
      }
      localStorage.clear();
      sessionStorage.clear();
      this.sharedDataService.setPublicationList([]);
      this.sharedDataService.setActivePublication(null);
      this.sharedDataService.isLoggedIn = null;
      this.indexedDBService.deleteAllPublication();
      this.indexedDBService.deleteAllProjects();
      this.indexedDBService.stacklistFromProject = new Map<string, any>();
      this.indexedDBService.projectMasterPages = new Map<string, Map<string, any>>();
      this.indexedDBService.projectStaticPages = new Map<string, Map<string, any>>();
      this.utilsService.redirectToHomePageWithDelay();
    } else {
      if (this.utilsService.isPresent(actionMsg)) {
        this.utilsService.notificationWithTranslation(actionMsg, error.params);
      } else {
        this.utilsService.notificationWithTranslation('PLEASE_CHECK_LOGS', error.params);
      }
    }
  }

  handleError(error: Response) {
    console.error(error);
    return observableThrowError(new AppError(error));
  }

  activatePublication(publicationdto) {
    this.sharedDataService.setActivePublicationIndex(this.sharedDataService.publicationList.indexOf(publicationdto));
    this.detectChangesInBuilderPage();
    let activePublicationObject = {
      projectName: "",
      publicationId: ""
    }
    activePublicationObject.publicationId = this.sharedDataService.activePublication._respondata.publication.id;
    activePublicationObject.projectName = this.sharedDataService.activePublication._respondata.publication.project;
    sessionStorage.setItem('activepublication', JSON.stringify(activePublicationObject));
    this.sharedDataService.setActivePublication(publicationdto);
    let currentPublicationObject = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    this.indexedDBService.getProject(currentPublicationObject._respondata.publication.project, (objProjectdtoService) => {
      if (objProjectdtoService != null) {
        currentPublicationObject._dataSourceFetchtime = objProjectdtoService._dataSourceFetchtime;
        currentPublicationObject._currentDSFile = objProjectdtoService._currentDSFile;
        currentPublicationObject._dataFiles = objProjectdtoService._dataFiles;
        currentPublicationObject._selectedDataSouce = objProjectdtoService._selectedDataSouce;
      }
      if (this.utilsService.isPresent(publicationdto._selectedStack)) {
        this.getStacklistFromProjectDTODB(currentPublicationObject._respondata.publication.project, (stackList) => {
          this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedStack = this.getStackByStackId(stackList, publicationdto._selectedStack.id);
        });
      }
    });
    for (let i = 0; i < this.sharedDataService._routeData.length; i++) {
      if (this.sharedDataService.activePublication._respondata.publication.id === this.sharedDataService._routeData[i].id) {
        this.router.navigate([this.sharedDataService._routeData[i].path]);
      }
    }

  }

  getStacklistFromProjectDTODB(projectName, callback) {
    if (this.utilsService.isPresent(this.indexedDBService.stacklistFromProject) && this.utilsService.isPresent(this.indexedDBService.stacklistFromProject.get(projectName))) {
      callback(this.indexedDBService.stacklistFromProject.get(projectName));
    } else {
      this.indexedDBService.getProject(projectName, (projectdto) => {
        if (this.utilsService.isPresent(projectdto)) {
          if (this.utilsService.isPresent(projectdto._allStacks)) {
            if (!this.utilsService.isPresent(this.indexedDBService.stacklistFromProject)) {
              this.indexedDBService.stacklistFromProject = new Map<string, any>();
            }
            this.indexedDBService.stacklistFromProject.set(projectName, projectdto._allStacks);
            callback(this.indexedDBService.stacklistFromProject.get(projectName));
          }
        } else {
          callback([]);
        }
      });
    }
  }

  getStacklistFromProjectDTOHTML(projectName) {
    let stackList = [];
    if (!this.utilsService.isPresent(this.indexedDBService.stacklistFromProject) || !this.utilsService.isPresent(this.indexedDBService.stacklistFromProject.get(projectName))) {
      this.getStacklistFromProjectDTODB(projectName, (data) => {
        if (!this.utilsService.isPresent(this.indexedDBService.stacklistFromProject)) {
          this.indexedDBService.stacklistFromProject = new Map<string, any>();
        }
        this.indexedDBService.stacklistFromProject.set(projectName, data);
        return data;
      });
    } else {
      stackList = this.indexedDBService.stacklistFromProject.get(projectName);
    }
    return stackList;
  }


  /** fetch stack from stacklist*/
  getStackFromStacklist(stackList, selectedStack) {
    let stack = [];
    for (let eachStack of stackList) {
      if ((eachStack.id == selectedStack.id) && (eachStack.name == selectedStack.name)) {
        return eachStack;
      }
    }
    return stack;
  }

  /** fetch stackElements from stacklist*/
  getStackFilterFromStacklist(stackList, selectedStack, selectedStackFilter) {
    let stackElements = [];
    for (let eachStack of stackList) {
      if ((eachStack.id == selectedStack.id) && (eachStack.name == selectedStack.name)) {
        if (this.utilsService.isPresent(selectedStackFilter)) {
          if (this.utilsService.isPresent(eachStack.stackFilter)) {
            for (let eachStackFilter of eachStack.stackFilter) {
              if ((eachStackFilter.key == selectedStackFilter)) {
                if (this.utilsService.isPresent(eachStackFilter.stackElements) && (eachStackFilter.stackElements.length > 0)) {
                  return eachStackFilter.stackElements;
                }
              }
            }
          }
        } else {
          return eachStack.stackElements;
        }
      }
    }
    return stackElements;
  }

  getStackNameFromProjectDTO(stackId, projectName) {
    let stackName = stackId;
    let stackList = this.getStacklistFromProjectDTOHTML(projectName);
    for (let stack of stackList) {
      if (stackId == stack.id) {
        stackName = stack.name;
        break;
      }
    }
    return stackName;
  }

  getMainImageMapping(stackId, currentLink) {
    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];

    for (let eachMainImageObject of currentPublication._respondata.publication.mainImageMappings) {
      if ((eachMainImageObject.stackId == stackId) && (eachMainImageObject.currentLink == currentLink)) {
        return eachMainImageObject.selectedImage;
      }
    }
    return "";
  }

  /** fetch stack from stacklist*/
  getStackByStackId(stackList, stackId) {
    let stack = [];
    for (let eachStack of stackList) {
      if ((eachStack.id == stackId)) {
        return eachStack;
      }
    }
    return stack;
  }

  calculateZoomFac(masterPages) {
    let pageHeight: number;
    let pageWidth: number;
    let zmFacMP: number;
    let zmFac: number;
    let splitStr: any = [];

    for (let i = 0; i < masterPages.length; i++) {
      if (masterPages[i].areas) {

        if (masterPages[i].size == "A4" && masterPages[i].orientation == "Portrait") {
          pageHeight = 297;
          pageWidth = 210;
        }

        else if (masterPages[i].size == "A3" && masterPages[i].orientation == "Portrait") {
          pageHeight = 420;
          pageWidth = 297;
        }

        else if (masterPages[i].size == "A2" && masterPages[i].orientation == "Portrait") {
          pageHeight = 594;
          pageWidth = 420;
        }

        else if (masterPages[i].size == "A1" && masterPages[i].orientation == "Portrait") {
          pageHeight = 841;
          pageWidth = 594;
        }

        else if (masterPages[i].size == "A0" && masterPages[i].orientation == "Portrait") {
          pageHeight = 1189;
          pageWidth = 841;
        }

        else if (masterPages[i].size == "A5" && masterPages[i].orientation == "Portrait") {
          pageHeight = 210;
          pageWidth = 148;
        }

        else if (masterPages[i].size == "A6" && masterPages[i].orientation == "Portrait") {
          pageHeight = 148;
          pageWidth = 105;
        }

        else if (masterPages[i].size == "A4" && masterPages[i].orientation == "Landscape") {
          pageHeight = 210;
          pageWidth = 297;
        }

        else if (masterPages[i].size == "A3" && masterPages[i].orientation == "Landscape") {
          pageHeight = 297;
          pageWidth = 420;
        }

        else if (masterPages[i].size == "A2" && masterPages[i].orientation == "Landscape") {
          pageHeight = 420;
          pageWidth = 594;
        }

        else if (masterPages[i].size == "A1" && masterPages[i].orientation == "Landscape") {
          pageHeight = 594;
          pageWidth = 841;
        }

        else if (masterPages[i].size == "A0" && masterPages[i].orientation == "Landscape") {
          pageHeight = 841;
          pageWidth = 1189;
        }

        else if (masterPages[i].size == "A5" && masterPages[i].orientation == "Landscape") {
          pageHeight = 148;
          pageWidth = 210;
        }

        else if (masterPages[i].size == "A6" && masterPages[i].orientation == "Landscape") {
          pageHeight = 105;
          pageWidth = 148;
        }

        else {
          splitStr = masterPages[i].size.split("x");
          pageHeight = splitStr[1];
          pageWidth = splitStr[0];
        }

        if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].pageHeight < pageHeight) {
          this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].pageHeight = pageHeight;
        }

        if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].pageWidth < pageWidth) {
          this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].pageWidth = pageWidth;
        }

      }
    }
  }

  updateMasterPageData(currentPublicationObject, masterPages, projectName?, updateDB?) {
    for (let page of masterPages) {
      if (page.pagePlanItemAreaDetailsList) {
        this.updateAreaDetails(currentPublicationObject, page.pagePlanItemAreaDetailsList);
      }
      if (page.areas) {
        this.updateAreaDetails(currentPublicationObject, page.areas);
      }
    }
    if (updateDB) {
      let objProjectdtoService = new ProjectdtoService();
      objProjectdtoService.name = projectName;
      objProjectdtoService._masterPages = masterPages;
      this.indexedDBService.addUpdateProject(projectName, objProjectdtoService, () => { });
    }
  }


  updateAreaDetails(currentPublicationObject, areas) {
    let zmFacMP = (currentPublicationObject.pageWidth / 74) * 3.8;
    let zmFac = (currentPublicationObject.pageWidth / 150) * 3.8;
    for (let area of areas) {
      area._temp = {};
      area._temp._x = this.utilsService.mmToPixel(area.x) / zmFacMP;
      area._temp._y = this.utilsService.mmToPixel(area.y) / zmFacMP;
      area._temp._width = this.utilsService.mmToPixel(area.width) / zmFacMP;
      area._temp._height = this.utilsService.mmToPixel(area.height) / zmFacMP;
      area._temp.x = this.utilsService.mmToPixel(area.x) / zmFac;
      area._temp.y = this.utilsService.mmToPixel(area.y) / zmFac;
      area._temp.width = this.utilsService.mmToPixel(area.width) / zmFac;
      area._temp.height = this.utilsService.mmToPixel(area.height) / zmFac;

      if (area.type == this.constantsService.STATIC_AREA) {
        area._temp.color = this.constantsService.STATICAREACOLOR;
      } else if (area.type == this.constantsService.FLOW_AREA) {
        area._temp.color = this.constantsService.FLOWAREACOLOR;
      } else if (area.type == this.constantsService.DYNAMIC_AREA) {
        area._temp.color = this.constantsService.DYNAMICAREACOLOR;
      } else if (area.type == this.constantsService.CONTINUE_AREA) {
        area._temp.color = this.constantsService.CONTINUEAREACOLOR;
      }
    }
  }

  configureLanguage() {
    let currentPublicationObject = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    currentPublicationObject._selectedBuilderLanguage = "";
    if (this.utilsService.isPresent(currentPublicationObject._respondata.publication.redactionProperties.propertiesLogLanguageLists.propertiesLoglanguage)) {
      let languagesWithRights = Object.keys(currentPublicationObject._respondata.publication.logLanguageOutputFormats);
      for (let languageKey of Object.keys(currentPublicationObject._respondata.publication.redactionProperties.propertiesLogLanguageLists.propertiesLoglanguage)) {
        let lang = currentPublicationObject._respondata.publication.redactionProperties.propertiesLogLanguageLists.propertiesLoglanguage[languageKey].loglanguage;
        if (languagesWithRights.indexOf(lang) != -1) {
          currentPublicationObject._selectedBuilderLanguage = lang;
          break;
        }
      }
    }
  }

  getMasterPagesDB(currentPublication, callback) {
    let currPub = currentPublication._respondata.publication;
    let masterPages = [];
    if (this.utilsService.isPresent(this.indexedDBService.projectMasterPages) && this.utilsService.isPresent(this.indexedDBService.projectMasterPages.get(currPub.project)) && this.utilsService.isPresent(this.indexedDBService.projectMasterPages.get(currPub.project).get(currPub.masterPublication))) {
      callback(this.indexedDBService.projectMasterPages.get(currPub.project).get(currPub.masterPublication));
    } else {
      this.indexedDBService.getProject(currPub.project, (projectdto) => {
        let allowedMasterPages = this.getAllowedMasterPages(projectdto, currPub.masterPublication);
        if ((projectdto._masterPages != undefined) && (projectdto._masterPages.length > 0) && (allowedMasterPages != undefined) && (allowedMasterPages.length > 0)) {
          for (let masterPage of projectdto._masterPages) {
            if (allowedMasterPages.indexOf(masterPage.id) > -1) {
              masterPages.push(masterPage);
            }
          }
          if (!this.utilsService.isPresent(this.indexedDBService.projectMasterPages)) {
            this.indexedDBService.projectMasterPages = new Map<string, Map<string, any>>();
          }
          if (!this.utilsService.isPresent(this.indexedDBService.projectMasterPages.get(currPub.project))) {
            let masterPageMap = new Map<string, any>();
            this.indexedDBService.projectMasterPages.set(currPub.project, masterPageMap.set(currPub.masterPublication, masterPages))
          }
          else {
            this.indexedDBService.projectMasterPages.get(currPub.project).set(currPub.masterPublication, masterPages);
          }

        }
        this.detectChangesInBuilderPage();
        callback(masterPages);
      });
    }
  }

  getMasterPagesDBHTML(currentPublication) {
    let currPub = currentPublication._respondata.publication;
    let masterPages = [];
    if (!this.utilsService.isPresent(this.indexedDBService.projectMasterPages) || !this.utilsService.isPresent(this.indexedDBService.projectMasterPages.get(currPub.project)) || !this.utilsService.isPresent(this.indexedDBService.projectMasterPages.get(currPub.project).get(currPub.masterPublication))) {
      this.getMasterPagesDB(currentPublication, (updatedMasterPages) => {
        if (!this.utilsService.isPresent(this.indexedDBService.projectMasterPages)) {
          this.indexedDBService.projectMasterPages = new Map<string, Map<string, any>>();
        }
        if (!this.utilsService.isPresent(this.indexedDBService.projectMasterPages.get(currPub.project))) {
          let masterPageMap = new Map<string, any>();
          this.indexedDBService.projectMasterPages.set(currPub.project, masterPageMap.set(currPub.masterPublication, updatedMasterPages))
        }
        else {
          this.indexedDBService.projectMasterPages.get(currPub.project).set(currPub.masterPublication, updatedMasterPages);
        }
        return updatedMasterPages;
      });
    } else {
      masterPages = this.indexedDBService.projectMasterPages.get(currPub.project).get(currPub.masterPublication);
    }
    return masterPages;
  }

  getStaticPagesDB(currentPublication, callback) {
    let currPub = currentPublication._respondata.publication;
    let staticPages = [];
    if (this.utilsService.isPresent(this.indexedDBService.projectStaticPages) && this.utilsService.isPresent(this.indexedDBService.projectStaticPages.get(currPub.project)) && this.utilsService.isPresent(this.indexedDBService.projectStaticPages.get(currPub.project).get(currPub.masterPublication))) {
      callback(this.indexedDBService.projectStaticPages.get(currPub.project).get(currPub.masterPublication));
    } else {
      this.indexedDBService.getProject(currPub.project, (projectdto) => {
        let allowedMasterPages = this.getAllowedMasterPages(projectdto, currPub.masterPublication);
        if ((projectdto._staticPages != undefined) && (projectdto._staticPages.length > 0) && (allowedMasterPages != undefined) && (allowedMasterPages.length > 0)) {
          for (let staticPage of projectdto._staticPages) {
            if (allowedMasterPages.indexOf(staticPage.id) > -1) {
              staticPages.push(staticPage);
            }
          }
          if (!this.utilsService.isPresent(this.indexedDBService.projectStaticPages)) {
            this.indexedDBService.projectStaticPages = new Map<string, Map<string, any>>();
          }
          if (!this.utilsService.isPresent(this.indexedDBService.projectStaticPages.get(currPub.project))) {
            let staticPageMap = new Map<string, any>();
            this.indexedDBService.projectStaticPages.set(currPub.project, staticPageMap.set(currPub.masterPublication, staticPages))
          }
          else {
            this.indexedDBService.projectStaticPages.get(currPub.project).set(currPub.masterPublication, staticPages);
          }

        }
        this.detectChangesInBuilderPage();
        callback(staticPages);
      });
    }
  }

  getStaticPagesDBHTML(currentPublication) {
    let currPub = currentPublication._respondata.publication;
    let staticPages = [];
    if (!this.utilsService.isPresent(this.indexedDBService.projectStaticPages) || !this.utilsService.isPresent(this.indexedDBService.projectStaticPages.get(currPub.project)) || !this.utilsService.isPresent(this.indexedDBService.projectStaticPages.get(currPub.project).get(currPub.masterPublication))) {
      this.getStaticPagesDB(currentPublication, (updatedStaticPages) => {
        if (!this.utilsService.isPresent(this.indexedDBService.projectStaticPages)) {
          this.indexedDBService.projectStaticPages = new Map<string, Map<string, any>>();
        }
        if (!this.utilsService.isPresent(this.indexedDBService.projectStaticPages.get(currPub.project))) {
          let staticPageMap = new Map<string, any>();
          this.indexedDBService.projectStaticPages.set(currPub.project, staticPageMap.set(currPub.masterPublication, updatedStaticPages))
        }
        else {
          this.indexedDBService.projectStaticPages.get(currPub.project).set(currPub.masterPublication, updatedStaticPages);
        }
        return updatedStaticPages;
      });
    } else {
      staticPages = this.indexedDBService.projectStaticPages.get(currPub.project).get(currPub.masterPublication);
    }
    return staticPages;
  }

  getAllowedMasterPages(projectdto: ProjectdtoService, masterPublicationId: string): any[] {
    let masterPublications = projectdto.masterPublications;
    for (let masterPublication of masterPublications) {
      if (masterPublication.masterPublicationId == masterPublicationId) {
        if (masterPublication.isPagesLoaded) {
          return masterPublication.allowedMasterPages;
        } else {
          return [];
        }
      }
    }
    return [];
  }

  updateMasterPublicationPagesLoadedStatus(projectName: string, masterPublicationId: string, callback) {
    let masterPages = [];
    this.indexedDBService.getProject(projectName, (projectdto) => {
      let masterPublications = projectdto.masterPublications;
      for (let masterPublication of masterPublications) {
        if (masterPublication.masterPublicationId == masterPublicationId) {
          masterPublication.isPagesLoaded = true;
          break;
        }
      }
      callback(masterPublications);
    });
  }

  addNewStaticPageToMasterPublicationObj(projectName: string, masterPublicationId: string, staticPageName: string, callback) {
    this.indexedDBService.getProject(projectName, (projectdto) => {
      let masterPublications = projectdto.masterPublications;
      for (let masterPublication of masterPublications) {
        if (masterPublication.masterPublicationId == masterPublicationId) {
          if (masterPublication.allowedMasterPages.indexOf(staticPageName) == -1) {
            masterPublication.allowedMasterPages.push(staticPageName);
          }
          break;
        }
      }
      callback(masterPublications);
    });
  }

  isStaticPageLicensed() {
    let staticPageLicensed = localStorage.getItem('isStaticPageLicensed');
    return staticPageLicensed == 'false' ? false : true;
  }

  detectChangesInBuilderPage() {
    this.randomNumber.next(1);
  }

  removePreviewedPages(pgId) {
    for (let key in this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].previewedPages) {
      if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].previewedPages[key].map((el) => el.pageId).indexOf(pgId) != -1) {
        this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].previewedPages[key].splice(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].previewedPages[key].map((el) => el.pageId).indexOf(pgId), 1);
      }
    }
  }

  removeTempElement(previewPages) {
    for (let i = 0; i < previewPages.length; i++) {
      delete previewPages[i].toggleOverFlowPage;
      delete previewPages[i]._preview;
      delete previewPages[i]._mPreview;
      delete previewPages[i]._mPreviewUri;
      if (this.utilsService.isPresent(previewPages[i]._show)) {
        delete previewPages[i]._show;
      }
      if (this.utilsService.isPresent(previewPages[i]._hasGrp)) {
        delete previewPages[i]._hasGrp;
      }
      if (this.utilsService.isPresent(previewPages[i]._length)) {
        delete previewPages[i]._length;
      }
      if (this.utilsService.isPresent(previewPages[i]._type)) {
        delete previewPages[i]._type;
      }
      if (previewPages[i].pagePlanItemAreaDetailsList) {
        for (let j = 0; j < previewPages[i].pagePlanItemAreaDetailsList.length; j++) {
          delete previewPages[i].pagePlanItemAreaDetailsList[j]._temp;
        }
      }
    }
  }

  removeSelectedValueFromTempVariables(tempVariablesArray) {
    if (this.utilsService.isPresent(tempVariablesArray)) {
      for (let variable of tempVariablesArray) {
        if (variable.type == 'Vector' && !variable.withLOV) {
          delete variable._selValue;
          delete variable._allValues;
        }
      }
    }
  }

  updateSelectedOrDefaultValueforVector(variables) {
    for (let variable of variables) {
      if (variable.type == 'Vector' && !variable.withLOV) {
        variable._selValue = [];
        let obj = {};
        obj['isSelected'] = true;
        variable._allValues = variable.values;
        for (let selVar of variable.selectedValues) {
          if (variable._allValues.map((el) => el.value).indexOf(selVar.value) == -1) {
            obj['value'] = selVar.value;
            variable._allValues.push(this.utilsService.deepCopy(obj));
          }
          variable._selValue.push(selVar.value);
        }
      }
    }
  }


  /*---------Show default or selected values for element, page and document level variables-----*/
  showSelectedOrDefaultValue(variable) {
    if (this.utilsService.isObjNotEmpty(variable.selectedValues[0])) {
      if (this.utilsService.isPresent(variable.selectedValues[0].value)) {
        return variable.selectedValues[0].value;
      }
    }
    else {
      var values = variable.values;
      for (let value of values) {
        if (value.isSelected) {
          return value.value;
        }
      }
      if (this.utilsService.isObjNotEmpty(variable.values[0])) {
        return variable.values[0].value;
      }
    }
    return "";
  }

  findValueOfProperty(obj, propertyName) {
    let reg = new RegExp(propertyName, "i"); // "i" to make it case insensitive
    return Object.keys(obj).reduce((result, key) => {
      if (reg.test(key)) result.push(obj[key]);
      return result;
    }, []);
  }

  unPreviewPages(currentPublicationObject) {
    if (currentPublicationObject._selectedPages.length == 0) {
      for (let page of currentPublicationObject._mainPubItems) {
        if (page.type == this.constantsService.INBETWEEN) {
          let pageInd = currentPublicationObject._pubItems.map((el) => el.id).indexOf(page.id);
          for (let k = currentPublicationObject._pubItems.length - 1; k >= 0; k--) {
            if (currentPublicationObject._pubItems[k].id == page.id) {
              currentPublicationObject._pubItems.splice(k, 1)
            }
          }
          if (pageInd != -1) {
            page._preview = false;
            currentPublicationObject._pubItems.splice(pageInd, 0, page)
          }
        }
      }
      // this.removeOverFlowPages(currentPublicationObject);
    } else {
      let tempPubitems = this.utilsService.deepCopy(currentPublicationObject._pubItems);
      for (let pgId of currentPublicationObject._selectedPages) {
        for (let mainPage of currentPublicationObject._mainPubItems) {
          if (mainPage.id == pgId && mainPage.type == this.constantsService.INBETWEEN) {
            let pageInd = currentPublicationObject._pubItems.map((el) => el.id).indexOf(pgId);
            for (let k = currentPublicationObject._pubItems.length - 1; k >= 0; k--) {
              if (currentPublicationObject._pubItems[k].id == pgId) {
                currentPublicationObject._pubItems.splice(k, 1)
              }
            }
            if (pageInd != -1) {
              mainPage._preview = false;
              currentPublicationObject._pubItems.splice(pageInd, 0, this.utilsService.deepCopy(mainPage))
            }
          }

        }
      }
      if (currentPublicationObject._selectedPages.length == currentPublicationObject._pubItems.length) {
        // this.removeOverFlowPages(currentPublicationObject);
      }
      currentPublicationObject._showProperties = 'stackbasket';
      currentPublicationObject._selectedPages = [];
    }
  }

  removeOverFlowPages(currentPublicationObject, arryindx?) {
    if (this.utilsService.isPresent(arryindx)) {
      if (currentPublicationObject._pubItems[arryindx]._type) {
        for (let i = currentPublicationObject._pubItems.length - 1; i >= 0; i--) {
          if (currentPublicationObject._pubItems[i].uid) {
            if (currentPublicationObject._pubItems[arryindx].uid != currentPublicationObject._pubItems[i].uid) {
              if (currentPublicationObject._pubItems[arryindx].id == currentPublicationObject._pubItems[i].id) {
                currentPublicationObject._pubItems.splice(i, 1);
              }
            }
          }
        }
        if (this.utilsService.isPresent(currentPublicationObject._pubItems[arryindx].toggleOverFlowPage)) {
          currentPublicationObject._pubItems[arryindx].toggleOverFlowPage = false;
        }
      } else {
        for (let i = currentPublicationObject._pubItems.length - 1; i >= 0; i--) {
          if (currentPublicationObject._pubItems[arryindx].id != currentPublicationObject._pubItems[i].id) {
            if (currentPublicationObject._pubItems[arryindx].parentId == currentPublicationObject._pubItems[i].parentId) {
              currentPublicationObject._pubItems.splice(i, 1);
            }
          }
        }
        if (this.utilsService.isPresent(currentPublicationObject._pubItems[arryindx].toggleOverFlowPage)) {
          currentPublicationObject._pubItems[arryindx].toggleOverFlowPage = false;
        }
      }
    } else {
      for (let page = currentPublicationObject._pubItems.length - 1; page >= 0; page--) {
        currentPublicationObject._pubItems[page].toggleOverFlowPage = false;
        if (currentPublicationObject._pubItems[page]._hasGrp) {
          if (!currentPublicationObject._pubItems[page]._show && currentPublicationObject._pubItems[page]._length != 1) {
            currentPublicationObject._pubItems.splice(page, 1);
          }
        }
      }
    }
  }

  checkStackTableLength() {
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._stacklist_table.length == 0) {
      let styles = {
        'cursor': 'not-allowed',
        'pointer-events': 'none',
        /*Button disabled - CSS color class*/
        'color': '#c0c0c0',
      };
      return styles;
    }
  }

  checkBasketTableLength() {
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._elementlist_table.length == 0) {
      let styles = {
        'cursor': 'not-allowed',
        'pointer-events': 'none',
        /*Button disabled - CSS color class*/
        'color': '#c0c0c0',
      };
      return styles;
    }
  }

  getSortedLanguageList(currentPublication): any {
    let languagesWithRights = Object.keys(currentPublication._respondata.publication.logLanguageOutputFormats);
    let allowedLanguagesWithRights = [];
    if (this.utilsService.isPresent(currentPublication._respondata.publication.redactionProperties.propertiesLogLanguageLists.propertiesLoglanguage)) {
      for (let lang of currentPublication._respondata.publication.redactionProperties.propertiesLogLanguageLists.propertiesLoglanguage) {
        if (lang.loglanguage && languagesWithRights.indexOf(lang.loglanguage) != -1) {
          allowedLanguagesWithRights.push(lang.loglanguage)
        }
      }
    }
    return allowedLanguagesWithRights.sort();
  }

}
