import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Title } from '@angular/platform-browser';

import { ProjectService } from '../../../services/project.service';
import { SharedDataService } from '../../../services/shared-data.service';
import { UtilsService } from '../../../shared/services/utils.service';
import { PublicationdtoService } from '../../../dto/publicationdto.service';
import { ProjectdtoService } from '../../../dto/projectdto.service';
import { SettingsService } from '../settings/settings.service';
import { ConstantsService } from '../../../services/constants.service';
import { MasterPublicationdtoService } from '../../../dto/masterPublicationdto.service';
import { Publication } from '../../../dto/projectdto.service';
import { IbUtilsService } from '../../../services/ib-utils.service';
import { IndexedDBService } from '../../../db/indexeddb.service';
import { BuilderService } from '../builder/builder.service';

import { HttpService } from '../../services/http.service';


@Component({
  selector: 'app-publication-selection',
  templateUrl: './publication-selection.component.html',
  styleUrls: ['./publication-selection.component.scss']
})

export class PublicationSelectionComponent implements OnInit {
  projects_array = [];
  Publication_array = [];
  masterpublication_array = [];
  selectedPublication: string;
  selectedDuplicateProject: string;
  selectedDuplicatePublication: string;
  selectedProjectNewPublication: string;
  selectedMasterPublication: string;
  returnUrl: string;
  author: string = "";
  languageList: any;
  last: any;
  selectedlanguageList: any = [];
  date: any = "";
  description: any = "";
  private _publicationList: PublicationdtoService[] = [];
  duplicatePublicationName: string = "";
  duplicatePublication_array = [];
  publicationStatus: boolean;


  setFocus(submit) {
    submit.focus();
  }

  showLoader(val) {
    if (val == "show") {
      this.publicationStatus = true;
    } else {
      this.publicationStatus = false;
    }
  }

  projectChangedNewPublication(project) {
    if ((!this.utilsService.isPresent(project._arrayLogLanguageFlagList)) || (project._arrayLogLanguageFlagList.length < 1)) {
      this.languageList = [];
      this.last = [];
    } else {
      this.languageList = project._arrayLogLanguageFlagList;
      this.last = Object.keys(this.languageList);
    }
    if ((!this.utilsService.isPresent(project.masterPublications)) || (project.masterPublications.length < 1)) {
      this.loadPublicationSelection(project, this.constantsService.CREATE_PUBLICATION);
    } else {
      this.masterpublication_array = project.masterPublications;
      this.selectedMasterPublication = "";
    }
  }


  constructor(private title: Title, public fb: FormBuilder, private projectService: ProjectService, public sharedDataService: SharedDataService, private router: Router, private settingsService: SettingsService, private utilsService: UtilsService, private constantsService: ConstantsService, private ibUtilsService: IbUtilsService, private indexedDBService: IndexedDBService, private builderService: BuilderService, private httpService: HttpService) {
  }

  ngOnInit() {
    this.title.setTitle("Publication Wizard");
    if (this.utilsService.isPresent(sessionStorage.getItem('refreshlocation')) && sessionStorage.getItem('refreshlocation') != "/") {
      let navPath = JSON.parse(sessionStorage.getItem('refreshlocation'));
      sessionStorage.removeItem('refreshlocation')
      this.router.navigate([navPath]);
    }
    this.publicationStatus = true;
    //this.sharedDataService._maskStatus = true;
    window.setTimeout(() =>
      this.sharedDataService.setShowTabs(false));

    this.sharedDataService.setTitle("PUBLICATION_SELECTION");
    // this.indexedDBService.getAllPublications(function(returnedVal){
    //   console.log("list",returnedVal );
    // });
    // this._publicationList = JSON.parse(sessionStorage.getItem('sessionPublicationList'));
    // if ((this._publicationList == null) || (this._publicationList.length == 0)) {
    //   if (this._publicationList != undefined) {
    //     this.sharedDataService.setPublicationList(this._publicationList);
    //   }
    // }

    this.returnUrl = '/';
    this.indexedDBService.getAllProjects((_projectList) => {
      if ((!this.utilsService.isPresent(_projectList)) || (this.utilsService.isPresent(_projectList) && _projectList.length < 1) || (sessionStorage.getItem(this.constantsService.REFRESH_STATUS) == "1")) {
        sessionStorage.removeItem(this.constantsService.REFRESH_STATUS);
        this.projectService.fetchProjectList().subscribe(
          (data) => {
            if (data.code == this.constantsService.SUCCESS) {
              this.publicationStatus = false;
              this.sharedDataService.setWorkflows(data.workFlowStates);
              for (let project of data.projects) {
                let objProjectdtoService = new ProjectdtoService();
                objProjectdtoService.name = project;
                this.indexedDBService.addUpdateProject(project, objProjectdtoService, () => { });
              }
              this.indexedDBService.getAllProjects((finalProjects) => {
                this.projects_array = finalProjects;
              }
              );
            } else {
              this.publicationStatus = false;
              this.ibUtilsService.showIBErrors(data);
            }
          }
        )
      } else {
        this.publicationStatus = false;
        this.projects_array = _projectList;
      }
    });

    this.setOutputFormats();
    this.setStaticPageLicensed();
  }
  setOutputFormats() {
    if (!this.utilsService.isPresent(localStorage.getItem('OutputFormats'))) {
      this.httpService.getOutputFormats().subscribe(
        (response) => {
          if (response.code == 100) {
            localStorage.setItem('OutputFormats', response.outputFormats);
          } else {
            this.ibUtilsService.showIBErrors(response);
          }
        })
    }
  }

  setStaticPageLicensed() {
    if (!this.utilsService.isPresent(localStorage.getItem('isStaticPageLicensed'))) {
      this.httpService.isStaticPageLicensed().subscribe(
        (response) => {
          if (response.code == 100) {
            localStorage.setItem('isStaticPageLicensed', response.isStaticPageLicensed);
          } else {
            this.ibUtilsService.showIBErrors(response);
          }
        })
    }
  }

  getDataSources(): any {
    let currentPublicationObject = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    currentPublicationObject.showSettingsDataSourceLoader = true;
    let objProjectdtoService = null;
    return this.settingsService.getDataSources(currentPublicationObject._respondata.publication.project).subscribe(
      (response) => {
        currentPublicationObject.showSettingsDataSourceLoader = false;
        if (response.code == 100) {
          objProjectdtoService = new ProjectdtoService();
          objProjectdtoService._currentDSFile = response.CurrentDataSourceObject.currentDSFile;
          objProjectdtoService._dataFiles = response.CurrentDataSourceObject.dataFiles;
          objProjectdtoService._dataSourceFetchtime = this.utilsService.getValidDate(response.CurrentDataSourceObject.LastRefreshedDateTime);
          objProjectdtoService.name = currentPublicationObject._respondata.publication.project;
          this.indexedDBService.addUpdateProject(objProjectdtoService.name, objProjectdtoService, () => { });
          return 1;
        } else {
          this.ibUtilsService.showIBErrors(response);
          return 0;
        }
      });
  }

  reloadDataSources() {
    let currentPublicationObject = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    currentPublicationObject.showSettingsDataSourceLoader = true;
    this.settingsService.getDataSources(currentPublicationObject._respondata.publication.project).subscribe(
      (response) => {
        currentPublicationObject.showSettingsDataSourceLoader = false;
        if (response.code == 100) {
          currentPublicationObject._currentDSFile = response.CurrentDataSourceObject.currentDSFile;
          currentPublicationObject._dataFiles = response.CurrentDataSourceObject.dataFiles;
          currentPublicationObject._dataSourceFetchtime = this.utilsService.getValidDate(response.CurrentDataSourceObject.LastRefreshedDateTime);
          this.indexedDBService.updatePublicationParams(currentPublicationObject._respondata.publication.project, currentPublicationObject._respondata.publication.id, currentPublicationObject, function (publicationId) {

          });

          let objProjectdtoService = new ProjectdtoService();
          objProjectdtoService._currentDSFile = response.CurrentDataSourceObject.currentDSFile;
          objProjectdtoService._dataFiles = response.CurrentDataSourceObject.dataFiles;
          objProjectdtoService._dataSourceFetchtime = this.utilsService.getValidDate(response.CurrentDataSourceObject.LastRefreshedDateTime);
          objProjectdtoService.name = currentPublicationObject._respondata.publication.project;
          this.indexedDBService.addUpdateProject(objProjectdtoService.name, objProjectdtoService, () => { });
        } else {
          this.ibUtilsService.showIBErrors(response);
        }
      })
  }
  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    // insert logic to check if there are pending changes here;
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away
    sessionStorage.setItem(this.constantsService.REFRESH_STATUS, "1");
    return true;
  }

  loadStackList(event) {
    let operation = event.requestType;
    let response = event.response;
    let publicationFormObj = event.publicationObject;
    var projectName = publicationFormObj.project.name;
    this.ibUtilsService.getStacklistFromProjectDTODB(publicationFormObj.project.name, (stackList) => {
      if (stackList.length > 0) {
        this.setPublicationObject(stackList, operation, response, publicationFormObj);
      } else {
        this.projectService.getStackListForProject(projectName).subscribe(
          (responseStackList) => {
            if (responseStackList.code == 100) {
              this.indexedDBService.updateStacksInProject(responseStackList.stacklist, projectName, () => {
                this.loadStackList(event);
              });
            } else {
              this.setPublicationObject([], operation, response, publicationFormObj);
              this.ibUtilsService.showIBErrors(responseStackList);
            }
          });
      }
    });
  }

  setPublicationObject(stacklist, operation, response, publicationFormObj) {
    let objPublicationdtoService = new PublicationdtoService();
    objPublicationdtoService.setRespondata(response);
    objPublicationdtoService.setIsChange(false);
    objPublicationdtoService._logLanguageFlagList = publicationFormObj.project._arrayLogLanguageFlagList;
    // objPublicationdtoService.setAllStacks(stacklist);
    if (stacklist.length > 0) {
      if (this.utilsService.isPresent(stacklist[0].activeFilter)) {
        for (let eachStackFilter of stacklist[0].stackFilter) {
          if ((eachStackFilter.key == stacklist[0].activeFilter)) {
            objPublicationdtoService.setStacklist_table(eachStackFilter['stackElements'])
            break;
          }
        }
      } else {
        objPublicationdtoService.setStacklist_table(stacklist[0].stackElements);
      }
      objPublicationdtoService.setSelectedStack(stacklist[0]);
      objPublicationdtoService.setAllSelectedStackFilters(stacklist[0].stackFilter);
      for (let index in stacklist[0].stackFilter) {
        let stackFilterId = stacklist[0].stackFilter[index].key;
        if (stackFilterId == stacklist[0].activeFilter) {
          objPublicationdtoService.setSelectedStackFilter(stacklist[0].stackFilter[index]);
        }
      }
      let templateList = stacklist[0].templates;
      if (templateList.indexOf("Quick_Preview") == -1) {
        templateList.splice(0, 0, "Quick_Preview");
      }
      objPublicationdtoService.setTemplateList(templateList);
      objPublicationdtoService.setSelectedTemplate("Quick_Preview");
    }
    if (objPublicationdtoService.stacklist_table.length < 50) {
      objPublicationdtoService.setCheckMoreStackElementsAvailable(true);
    } else {
      objPublicationdtoService.setCheckMoreStackElementsAvailable(false);
      let rowsOnPageSetLocalValues = objPublicationdtoService.rowsOnPageSetLocalValues;
      if (rowsOnPageSetLocalValues.indexOf(objPublicationdtoService.stacklist_table.length) === -1) {
        rowsOnPageSetLocalValues.splice(rowsOnPageSetLocalValues.length - 1, 1, objPublicationdtoService.stacklist_table.length);
      }
      objPublicationdtoService.setRowsOnPageSetLocalValues(rowsOnPageSetLocalValues);
    }
    objPublicationdtoService.setElementlist_table(response.publication.selectedStackElements);
    objPublicationdtoService._image = "";
    this.sharedDataService.setPublication(objPublicationdtoService);
    this.sharedDataService.setActivePublication(objPublicationdtoService);
    let activePublicationObject = {
      projectName: "",
      publicationId: ""
    }
    activePublicationObject.publicationId = this.sharedDataService.activePublication._respondata.publication.id;
    activePublicationObject.projectName = this.sharedDataService.activePublication._respondata.publication.project;
    sessionStorage.setItem('activepublication', JSON.stringify(activePublicationObject));
    var activePublicationIndex = this.sharedDataService.publicationList.indexOf(objPublicationdtoService);
    this.sharedDataService.setActivePublicationIndex(activePublicationIndex);
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._arrayLogLanguageFlagList = Object.keys(response.publication.logLanguageOutputFormats);
    this.indexedDBService.getProject(publicationFormObj.project.name, (project) => {
      if (project == null) {
        this.getDataSources();
      } else {
        this.reloadDataSources();
      }
    });

    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    currentPublication.pageHeight = 0;
    currentPublication.pageWidth = 0;

    this.ibUtilsService.configureLanguage();
    this.getMasterPages(currentPublication, () => {

      this.ibUtilsService.getMasterPagesDB(currentPublication, (masterPages) => {
        this.publicationStatus = false;
        this.ibUtilsService.calculateZoomFac(masterPages);
        this.ibUtilsService.updateMasterPageData(currentPublication, masterPages, publicationFormObj.project.name, true);
        this.ibUtilsService.updateSelectedOrDefaultValueforVector(currentPublication._respondata.publication.variables);
        if (currentPublication._pubItems.length == 0) {
          currentPublication._mainPubItems = [];
          if ((currentPublication._respondata.publication.pages != null) && (currentPublication._respondata.publication.pages.length != 0)) {
            this.builderService.loadPages(currentPublication, currentPublication._respondata.publication.pages, masterPages);
          }
        }
        this.indexedDBService.addPublication(response.publication.id, response.publication.name, currentPublication, publicationFormObj.project.name);
        if ((operation == this.constantsService.OPEN_PUBLICATION) || (operation == this.constantsService.DUPLICATE_PUBLICATION)) {
          this.router.navigate(['/PublicationWizard/builder-elementlist']);
        }
        if ((operation == this.constantsService.CREATE_PUBLICATION)) {
          this.router.navigate(['/PublicationWizard/element-selection']);
        }
      });
    });
  }

  getStaticPagePreview(mPage) {
    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    let currPub = currentPublication._respondata.publication;
    if (currentPublication._selectedBuilderLanguage) {
      this.projectService.getStaticPagePreview(currPub.project, currPub.id, mPage.id, '', currentPublication._selectedBuilderLanguage, "true", mPage.type).subscribe((response) => {
        if (response.code == 100) {
          if (this.utilsService.isPresent(response.staticDocumentPreviewPagesObject.data)) {
            if (response.staticDocumentPreviewPagesObject.data.length > 0) {
              if (!this.utilsService.isPresent(mPage._staticPreview)) {
                mPage._staticPreview = {};
              }
              if (this.utilsService.isPresent(mPage._staticPreview[response.language])) {
                mPage._staticPreview[response.language] = [];
              }
              mPage._staticPreview[response.language] = response.staticDocumentPreviewPagesObject.data;
              this.indexedDBService.updateProjectStaticPreview(currPub.project, currPub.masterPublication, mPage, response.language, () => {
                this.ibUtilsService.detectChangesInBuilderPage();
              });
            }
          }
        } else {
          this.ibUtilsService.showIBErrors(response);
        }
      });
    } else {
      this.utilsService.notificationWithTranslation("NO_ALLOWED_LANGUAGE_FOR_PUBLICATION", []);
    }
  }

  loadPublicationSelectionData(event) {
    let project = event.project;
    let type = event.requestType;
    this.loadPublicationSelection(project, type);
  }

  private loadPublicationSelection(project: any, type: any) {
    this.publicationStatus = true;
    this.projectService.getPublicationSelectionData(project.name).subscribe((data) => {
      if (data.code == this.constantsService.SUCCESS) {
        this.publicationStatus = false;
        let publicationList: Publication[] = [];
        for (let publicationObject of data.publications) {
          let publication = new Publication();
          publication.id = publicationObject.id;
          publication.name = publicationObject.name;
          publication.redactionProperties = publicationObject.redactionProperties;
          publication.masterPublicationId = publicationObject.masterPublicationId;
          publicationList.push(publication);
        }
        project.publications = publicationList;
        let masterpublicationList: MasterPublicationdtoService[] = [];
        for (let masterPublicationObj of data.masterpublications) {
          let masterpublication = new MasterPublicationdtoService();
          masterpublication.masterPublicationId = masterPublicationObj.masterPublicationId;
          masterpublication.masterPublicationName = masterPublicationObj.masterPublicationName;
          masterpublication.allowedMasterPages = masterPublicationObj.allowedMasterPages;
          masterpublicationList.push(masterpublication);
        }
        project.masterPublications = masterpublicationList;
        project._arrayLogLanguageFlagList = data.loglanguageflag;
        this.indexedDBService.addUpdateProject(project.name, project, () => { });
        if (type == this.constantsService.OPEN_PUBLICATION) {
          this.Publication_array = project.publications;
          this.selectedPublication = "";
        }
        else if (type == this.constantsService.DUPLICATE_PUBLICATION) {
          this.duplicatePublication_array = project.publications;
          this.selectedDuplicatePublication = "";
        }
        else if (type == this.constantsService.CREATE_PUBLICATION) {
          this.masterpublication_array = project.masterPublications;
          this.selectedMasterPublication = "";
          this.languageList = project._arrayLogLanguageFlagList;
          this.last = Object.keys(this.languageList);
        }
      }
      else {
        this.publicationStatus = false;
        this.ibUtilsService.showIBErrors(data);
      }
    });
  }

  getMasterPages(currentPublication, callback) {
    let currPub = currentPublication._respondata.publication;
    this.ibUtilsService.getMasterPagesDB(currentPublication, (masterPages) => {
      this.ibUtilsService.getStaticPagesDB(currentPublication, (staticPages) => {
        if ((staticPages != undefined && staticPages.length > 0) || (masterPages != undefined && masterPages.length > 0)) {
          callback();
        } else {
          this.projectService.getMasterPages(currPub.project, currPub.id).subscribe((response) => {
            if (response.code == this.constantsService.SUCCESS) {
              let masterPages = [];
              let staticPages = [];
              for (let mPage of response.masterPages) {
                if (mPage.type == this.constantsService.INBETWEEN) {
                  masterPages.push(mPage);
                } else {
                  this.getStaticPagePreview(mPage)
                  staticPages.push(mPage);
                }
              }
              let objProjectdtoService = new ProjectdtoService();
              objProjectdtoService.name = currPub.project;
              objProjectdtoService._masterPages = masterPages;
              objProjectdtoService._staticPages = staticPages;
              this.ibUtilsService.updateMasterPublicationPagesLoadedStatus(currPub.project, currPub.masterPublication, (masterPublication) => {
                objProjectdtoService.masterPublications = masterPublication;
                this.indexedDBService.addUpdateProject(currPub.project, objProjectdtoService, () => { });
                callback();
              });
            } else if (response.code == this.constantsService.USER_NOT_LOGGEDIN_EXCEPTION) {
              localStorage.removeItem(this.constantsService.ISLOGGEDIN);
              this.router.navigate([this.returnUrl]);
            }
          });
        }
      });
    });
  }
}