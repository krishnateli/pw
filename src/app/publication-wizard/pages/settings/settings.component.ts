import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatDialog, MatDialogRef } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

import { SharedDataService } from '../../../services/shared-data.service';
import { PublicationdtoService } from '../../../dto/publicationdto.service';
import { SettingsService } from './settings.service';
import { ProjectdtoService } from '../../../dto/projectdto.service';
import { UtilsService } from '../../../shared/services/utils.service';
import { DialogPopup } from '../../../components/dialog/dialogpopup.component';
import { ConstantsService } from '../../../services/constants.service';
import { ProjectService } from '../../../services/project.service';
import { IbUtilsService } from '../../../services/ib-utils.service';
import { GetFiltersPipe } from '../../pipes/get-filters.pipe';
import { IndexedDBService } from '../../../db/indexeddb.service';
import { HttpService } from '../../services/http.service';
import { CommonService } from '../../../shared/services/common.service';
import { BuilderService } from '../builder/builder.service';

import * as moment from 'moment';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})


export class SettingsComponent implements OnInit, AfterViewInit {

  private _publicationList: PublicationdtoService[] = [];

  private mainPublicationObject = null;
  activePublicationIndex: number = -1;
  radioDisabled: any;
  checkStatus: boolean;
  button_enabled_style = {
    'background-color': this.sharedDataService._Customization.componentColor.bgColor,
    'color': this.sharedDataService._Customization.componentColor.color,
    'font-family': this.sharedDataService._Customization.font.style
  }

  private dataXMLUploadEnabled: boolean = false;

  private years: number[] = [];
  private today = new Date();

  currentLanguage: string;

  @ViewChild('myInput')
  myInputVariable: any;


  constructor(public sharedDataService: SharedDataService, private settingsService: SettingsService, private router: Router, private translateService: TranslateService, private utilsService: UtilsService, public dialog: MatDialog, private constantsService: ConstantsService, private projectService: ProjectService, private ibUtilsService: IbUtilsService, private indexedDBService: IndexedDBService, private httpService: HttpService, private elRef: ElementRef, private renderer: Renderer2, private commonService: CommonService, private builderService: BuilderService) {
  }


  ngOnInit() {
    window.setTimeout(() =>
      this.sharedDataService.setShowTabs(true));
    this.currentLanguage = this.translateService.currentLang.toUpperCase();

    this.ignoreProductState(this.currentLanguage);
    this.translateService.onLangChange
      .subscribe((event: LangChangeEvent) => {
        this.currentLanguage = this.translateService.currentLang.toUpperCase();
        this.ignoreProductState(this.currentLanguage);
      });

    this.sharedDataService.setTitle("SETTINGS");
    this.getYearRange();
    this.ibUtilsService.updateSelectedOrDefaultValueforVector(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._respondata.publication.variables);
    this.loadDataXMLUploadSetting();


    this.ibUtilsService.publicationChanged.subscribe(() => {
      this.updateRadioColor();
    });

  }

  ngAfterViewInit() {
    this.updateRadioColor();
  }

  updateRadioColor() {
    setTimeout(() => {
      for (let el of this.elRef.nativeElement.querySelectorAll('.mat-radio-button.mat-accent .mat-radio-outer-circle')) {
        this.renderer.removeStyle(el, 'border-color');
      }
      for (let el of this.elRef.nativeElement.querySelectorAll('.mat-radio-button.mat-accent.mat-radio-checked .mat-radio-outer-circle')) {
        this.renderer.setStyle(el, 'border-color', this.sharedDataService._Customization.componentColor.bgColor);
      }
      for (let el of this.elRef.nativeElement.querySelectorAll('.mat-radio-button.mat-accent.mat-radio-checked .mat-radio-inner-circle')) {
        this.renderer.setStyle(el, 'background-color', this.sharedDataService._Customization.componentColor.bgColor);
      }
      for (let el of this.elRef.nativeElement.querySelectorAll('.mat-radio-label')) {
        this.renderer.setStyle(el, 'font-family', this.sharedDataService._Customization.font.style);
      }
    })
  }

  loadDataXMLUploadSetting() {
    if (!this.utilsService.isPresent(localStorage.getItem('DataXMLUploadEnabled'))) {
      this.httpService.canUploadDataXML().subscribe(
        (response) => {
          if (response.code == 100) {
            localStorage.setItem('DataXMLUploadEnabled', response.dataXMLUploadEnabled);
            this.dataXMLUploadEnabled = response.dataXMLUploadEnabled;
          } else {
            this.ibUtilsService.showIBErrors(response);
          }
        })
    } else {
      this.dataXMLUploadEnabled = JSON.parse(localStorage.getItem('DataXMLUploadEnabled'));
    }
  }

  uploadDocument() {
    document.getElementById('file').click();
  }

  setbuttonstyleUpload() {
    let styles = {
      'background-color': !this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._dataSourceUploadStatus ? 'rgba(0, 0, 0, .12)' : this.sharedDataService._Customization.componentColor.bgColor,
      'color': !this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._dataSourceUploadStatus ? 'rgba(0, 0, 0, .38)' : this.sharedDataService._Customization.componentColor.color,
      'font-family': this.sharedDataService._Customization.font.style
    }
    return styles;
  }

  //active log languages of the publication
  checkIfSelected(loglang) {
    let langBorder = {
      'opacity': 1,
      'border': '2px solid ' + this.sharedDataService._Customization.icon.selectionColor
    }
    let langUnSelect = {
      'opacity': 'inherit',
      'border': 'inherit'
    }
    let propertiesLoglanguage = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._respondata.publication.redactionProperties.propertiesLogLanguageLists.propertiesLoglanguage;
    let flag = -1;
    if (this.utilsService.isPresent(propertiesLoglanguage)) {
      for (let language in propertiesLoglanguage) {
        if (propertiesLoglanguage[language]['loglanguage'] == loglang) {
          flag = 1;
        }
      }
    }
    if (flag === -1) {
      return langUnSelect;
    } else {
      return langBorder;
    }

  }
  //onclick  log language select
  selected_log_lang(loglang) {
    let propertiesLoglanguage = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._respondata.publication.redactionProperties.propertiesLogLanguageLists.propertiesLoglanguage;
    let flag = -1;
    let object = {};
    if (propertiesLoglanguage != null) {
      for (let language in propertiesLoglanguage) {
        if (propertiesLoglanguage[language]['loglanguage'] == loglang) {
          flag = 1;
        }
      }
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._isChange = true;

      object['loglanguage'] = loglang;
      if (flag === -1) {

        this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._respondata.publication.redactionProperties.propertiesLogLanguageLists.propertiesLoglanguage.push(object);

      } else {
        //  this._publicationList[this.activePublicationIndex]._respondata.publication.redactionProperties.propertiesLogLanguageLists.propertiesLoglanguage.pop(object);
        for (let language2 in propertiesLoglanguage) {
          if (propertiesLoglanguage[language2]['loglanguage'] == loglang) {
            this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._respondata.publication.redactionProperties.propertiesLogLanguageLists.propertiesLoglanguage.splice(language2, 1);
          }
        }
      }
    } else {
      object['loglanguage'] = loglang;
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._respondata.publication.redactionProperties.propertiesLogLanguageLists['propertiesLoglanguage'] = [];
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._respondata.publication.redactionProperties.propertiesLogLanguageLists.propertiesLoglanguage.push(object);

    }
    this.ibUtilsService.configureLanguage();
  }


  handleFileSelect(event) {
    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      let file: File = fileList[0];
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._uploadedFileName = file.name;
      let fileExtension = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._uploadedFileName.split(".").pop();
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._uploadedFileName = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._uploadedFileName.substring(0, this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._uploadedFileName.lastIndexOf('.'));
      if (fileExtension == "xml") {
        this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._dataSourceFile = file;
        this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._dataSourceUploadStatus = true;
      } else {
        this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._dataSourceUploadStatus = false;
        this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._uploadedFileName = "";
        this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._dataSourceFile = null;
        this.utilsService.notificationWithTranslation('PLEASE_SELECT_CORRECT_FILE_FORMAT', []);
      }
      this.myInputVariable.nativeElement.value = "";
    }
  }


  uploadDataSourceXMLFile() {
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].showSettingsDataSourceLoader = true;
    if ((this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._uploadedFileName.length != 0) && (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._dataSourceFile != null)) {
      let uploadedDataXMLFileName = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._uploadedFileName + ".xml";
      if (this.utilsService.isValidFileName(uploadedDataXMLFileName)) {
        this.settingsService.uploadDataSource(uploadedDataXMLFileName, this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._dataSourceFile, this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._respondata.publication.project).subscribe(
          (response) => {
            this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].showSettingsDataSourceLoader = false;
            if (response.code == 100) {
              let params = [];
              this.utilsService.notificationWithTranslation(response.message, params);
              this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._dataSourceUploadStatus = false;
              this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._uploadedFileName = "";
              this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._dataSourceFile = null;
              this.getDataSources(0);
            } else {
              this.ibUtilsService.showIBErrors(response);
            }
          })
      } else {
        this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].showSettingsDataSourceLoader = false;
        this.utilsService.notificationWithTranslation("PLEASE_PROVIDE_A_VALID_NAME", []);
      }
    } else {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].showSettingsDataSourceLoader = false;
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._dataSourceUploadStatus = false;
      this.utilsService.notificationWithTranslation("PLEASE_SELECT_A_FILE", []);
    }
  }

  getDataSources(messageStatus) {
    let currentPublicationObject = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    currentPublicationObject.showSettingsDataSourceLoader = true;
    this.settingsService.getDataSources(currentPublicationObject._respondata.publication.project).subscribe(
      (response) => {
        if (response.code == 100) {
          currentPublicationObject._currentDSFile = response.CurrentDataSourceObject.currentDSFile;
          currentPublicationObject._dataFiles = response.CurrentDataSourceObject.dataFiles;
          currentPublicationObject._dataSourceFetchtime = this.utilsService.getValidDate(response.CurrentDataSourceObject.LastRefreshedDateTime);
          let objProjectdtoService = new ProjectdtoService();
          objProjectdtoService._currentDSFile = response.CurrentDataSourceObject.currentDSFile;
          objProjectdtoService._dataFiles = response.CurrentDataSourceObject.dataFiles;
          objProjectdtoService._dataSourceFetchtime = this.utilsService.getValidDate(response.CurrentDataSourceObject.LastRefreshedDateTime);
          objProjectdtoService.name = currentPublicationObject._respondata.publication.project;
          this.indexedDBService.addUpdateProject(objProjectdtoService.name, objProjectdtoService, () => { });
          currentPublicationObject.showSettingsDataSourceLoader = false;
          if (messageStatus != 0) {
            this.utilsService.notificationWithTranslation("DATA_REFRESH_SUCCESSFUL", []);
          }
        } else {
          currentPublicationObject.showSettingsDataSourceLoader = false;
          this.ibUtilsService.showIBErrors(response);
        }
      })
  }

  dataSourceChanged(selectedDataSouce) {
    let currentPublicationObject = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    if (selectedDataSouce != currentPublicationObject._currentDSFile) {
      currentPublicationObject.showSettingsDataSourceLoader = true;
      this.popupForRefreshData(currentPublicationObject._respondata.publication.project, (data) => {
        if (data == 1) {
          this.settingsService.changeDataXML(selectedDataSouce, currentPublicationObject._respondata.publication.project).subscribe(
            (response) => {
              if (response.code == 100) {
                currentPublicationObject._currentDSFile = selectedDataSouce;
                let objProjectdtoService = new ProjectdtoService();
                objProjectdtoService._currentDSFile = selectedDataSouce;
                objProjectdtoService.name = currentPublicationObject._respondata.publication.project;
                objProjectdtoService._stackElementPreview = {};
                this.indexedDBService.addUpdateProject(objProjectdtoService.name, objProjectdtoService, () => { });

                currentPublicationObject._selectedDataSouce = "";
                currentPublicationObject.showSettingsDataSourceLoader = false;
                this.updateStacksStackFilters(currentPublicationObject);
                this.getPublicationWithUpdatedProductState(currentPublicationObject._respondata.publication.project);
                this.utilsService.notificationWithTranslation('DATASOURCE_CHANGED', []);
              } else {
                currentPublicationObject.showSettingsDataSourceLoader = false;
                currentPublicationObject._selectedDataSouce = "";
                this.ibUtilsService.showIBErrors(response);
              }
            })
        }
        else{
          currentPublicationObject.showSettingsDataSourceLoader = false;
          currentPublicationObject._selectedDataSouce = "";
        }
      });
    } else {
      setTimeout(function () { currentPublicationObject._selectedDataSouce = ""; }, 0);
    }

  }

  clearCacheData(currentPublicationObject) {
    this.ibUtilsService.unPreviewPages(currentPublicationObject);
    currentPublicationObject._previewedPages = {};
    currentPublicationObject.selectedImage = "";
    currentPublicationObject._imageArray = [];
    currentPublicationObject._displayImageArray = [];
    currentPublicationObject._image = "";
    currentPublicationObject._elementImage = [];
  }

  changePageView(data) {

    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._respondata.publication.doublePage = data;
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._isChange = true;
    this.updateRadioColor();
  }
  changePageStart(data) {
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._respondata.publication.doublePage) {

      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._respondata.publication.startOnLeftPage = data;
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._isChange = true;
      this.updateRadioColor();
    }
  }


  ignoreProductState(currentLanguage) {
    if (this.utilsService.isPresent(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex])) {
      for (let variable of this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._respondata.publication.variables) {
        if (variable.name == this.constantsService.IGNORE_PRODUCT_STATE) {
          if (variable.selectedValues.length > 0) {
            this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._ignoreProductStateFlag = variable.selectedValues[0].value == 1 ? true : false;
          }
          this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._ignoreProductStateLang = variable.translations[this.translateService.currentLang.toUpperCase()] ? variable.translations[this.translateService.currentLang.toUpperCase()] : variable.name;
        }
        if (variable.parentId == this.constantsService.IGNORE_PRODUCT_STATE_PARENT_ID) {
          this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._ignoreProductStateTextVariable = variable;
          this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._ignoreProductStateText =
            variable.translations[this.translateService.currentLang.toUpperCase()] ? variable.translations[this.translateService.currentLang.toUpperCase()] : variable.name;
        }
      }
    }
  }

  resetDateValue(variable) {
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._variableDate = "";
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._variableYear = null;
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._variableMonth = null;
    this.onChangeOfVariable("", variable);
  }


  /**
   * Creates year range from current year
   * 
   * @returns list of year
   */
  getYearRange() {
    let year_min = this.today.getFullYear() - 100;
    let year_max = this.today.getFullYear() + 3;
    for (let year = year_max; year >= year_min; year--) {
      this.years.push(year);
    }
  }


  onChangeOfDate(data, variable) {
    let dateFormat = variable.dateFormat.toUpperCase();
    let dateMonth;
    if (data.value >= 1 && data.value < 13) {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._variableMonth = data.value;
      if (!this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._variableYear) {
        this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._variableYear = this.today.getFullYear();
      }
    }
    else {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._variableYear = data.value;
      if (!this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._variableMonth || this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._variableMonth == null) {
        dateMonth = this.today.getMonth() + 1;
        this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._variableMonth = dateMonth.toString();
      }
    }
    if (data.value == null) {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._variableDate = null;
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._variableYear = null;
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._variableMonth = null;
    }
    else {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._variableDate = moment(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._variableYear + "-" + this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._variableMonth).format(dateFormat);
    }
    this.onChangeOfVariable(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._variableDate, variable)

  }

  onChangeOfVariable(selectedValue, variable) {
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._previewedPages = {};
    let obj = {};
    obj['isSelected'] = true;

    if (variable.valueType == 'Boolean') {
      if (selectedValue) {
        obj['value'] = "1";
      } else {
        obj['value'] = "0";
      }
    } else if (variable.valueType == 'Date' && selectedValue != null) {
      let dateFormat = variable.dateFormat.toUpperCase();
      if (!variable.dateFormat.includes('dd')) {
        obj['value'] = selectedValue;
      } else {
        obj['value'] = moment(selectedValue).format(dateFormat);
        if (selectedValue != "") {
          this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._variableDate = obj['value'];
        }
        else {
          this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._variableDate = null;
          obj['value'] = "";
        }
      }
    } else if (variable.type == "Vector" && !variable.withLOV) {
      variable.selectedValues = [];
      if (selectedValue.length != 0) {
        for (let sValue of selectedValue) {
          obj['value'] = sValue;
          variable.selectedValues.push(this.utilsService.deepCopy(obj));
        }
      }
      return;
    } else {
      obj['value'] = selectedValue;
    }

    if (variable.name == this.constantsService.IGNORE_PRODUCT_STATE && variable.parentId !== this.constantsService.IGNORE_PRODUCT_STATE_PARENT_ID) {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._ignoreProductStateFlag = selectedValue;
    }

    if (variable.selectedValues) {
      variable.selectedValues = [];
      if (variable.name !== this.constantsService.IGNORE_PRODUCT_STATE && variable.parentId !== this.constantsService.IGNORE_PRODUCT_STATE_PARENT_ID) {
        if (variable.valueType != 'Date') {
          this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._isChange = true;
        }
      }
    } else {
      if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._ignoreProductStateFlag) {
        if (selectedValue) {
          this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._ignoreProductStateData = selectedValue;
        } else {
          this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._ignoreProductStateData = null;
        }
      }
      variable = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._ignoreProductStateTextVariable;
      variable.selectedValues = [];
    }

    variable.selectedValues.push(obj);
  }


  onChangeProperties() {
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._isChange = true;
  }

  refreshDataSources() {
    let publicationObject = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    publicationObject.showSettingsDataSourceLoader = true;
    this.popupForRefreshData(publicationObject._respondata.publication.project, (data) => {
      if (data == 1) {
        this.projectService.refreshDataSources(publicationObject._respondata.publication.project).subscribe(
          (response) => {
            if (response.code == 100) {
              if (response.refreshDataSources == '0' || response.refreshDataSources == 'SERVER_ERROR') {
                publicationObject._currentDSFile = response.CurrentDataSourceObject.currentDSFile;
                publicationObject._dataFiles = response.CurrentDataSourceObject.dataFiles;
                publicationObject._dataSourceFetchtime = this.utilsService.getValidDate(response.CurrentDataSourceObject.LastRefreshedDateTime);
                let objProjectdtoService = new ProjectdtoService();
                objProjectdtoService._currentDSFile = response.CurrentDataSourceObject.currentDSFile;
                objProjectdtoService._dataFiles = response.CurrentDataSourceObject.dataFiles;
                objProjectdtoService._dataSourceFetchtime = this.utilsService.getValidDate(response.CurrentDataSourceObject.LastRefreshedDateTime);
                objProjectdtoService.name = publicationObject._respondata.publication.project;
                objProjectdtoService._stackElementPreview = {};
                this.indexedDBService.addUpdateProject(objProjectdtoService.name, objProjectdtoService, () => { });

                publicationObject.showSettingsDataSourceLoader = false;
                this.updateStacksStackFilters(publicationObject);
                this.getPublicationWithUpdatedProductState(publicationObject._respondata.publication.project);
                if (response.refreshDataSources == 'SERVER_ERROR') {
                  publicationObject._dataRefreshMessege = response.refreshDataSources;
                  let paramsObject = {};
                  paramsObject[0] = response.failedCurrentLinks;
                  publicationObject._params = paramsObject;
                } else {
                  publicationObject._dataRefreshMessege = 'DATA_REFRESH_SUCCESSFUL';
                }
                publicationObject._dataRefreshFlag = true;
                publicationObject._messageClass = "alert-info alert alert-dismissible show";
              } else if (response.refreshDataSources === "-131") {
                publicationObject.showSettingsDataSourceLoader = false;
                let dialogRef = this.dialog.open(DialogPopup);
                dialogRef.componentInstance.userQuery = "FAILED_TO_REFRESH";
                dialogRef.componentInstance.dialogName = "ERROR";
                dialogRef.afterClosed().subscribe(result => {
                  if (result == '1') {
                    this.refreshDataSources();
                  } else {
                    this.settingsService.clearRefreshDataSourceResultHM().subscribe(
                      (response) => { });
                  }
                });

              } else {
                publicationObject.showSettingsDataSourceLoader = false;
                publicationObject._dataRefreshMessege = 'ERROR_OCCURED';
                publicationObject._dataRefreshFlag = true;
                publicationObject._messageClass = "alert-danger alert alert-dismissible show";
              }
            } else if (response.code == 105) {
              publicationObject.showSettingsDataSourceLoader = false;
              this.utilsService.notificationWithTranslation(response.message, []);
              this.utilsService.redirectToHomePageWithDelay();
            } else if (response.code == 104) {
              publicationObject.showSettingsDataSourceLoader = false;
              localStorage.removeItem(this.constantsService.ISLOGGEDIN);
              this.router.navigate(['/PublicationWizard/']);
            }
            else if (response.code == this.constantsService.EXCEPTION) {
              publicationObject.showSettingsDataSourceLoader = false;
              if (response.message == 'CODE_REFRESH_DATA_IN_PROGRESS' ||
                response.message == 'REST_SERVICE_EXPORT_API_ERROR') {
                publicationObject._dataRefreshMessege = response.message;
                publicationObject._params = this.getParams(response.params);
                publicationObject._dataRefreshFlag = true;
                publicationObject._messageClass = "alert-danger alert alert-dismissible show";
              }
              else {
                this.utilsService.notificationWithTranslation(response.message, response.params);
              }
            } else {
              publicationObject.showSettingsDataSourceLoader = false;
              publicationObject._dataRefreshMessege = 'ERROR_OCCURED';
              publicationObject._dataRefreshFlag = true;
              publicationObject._messageClass = "alert-danger alert alert-dismissible show";
            }
          });
      } else {
        publicationObject.showSettingsDataSourceLoader = false;
      }
    });

  }

  getParams(params) {
    let paramsObject = {};
    if (this.utilsService.isObjNotEmpty(params)) {
      for (let index in params) {
        paramsObject[index] = params[index];
      }
    }
    return paramsObject;
  }

  updateStacksStackFilters(currentPublicationObject) {
    for (let pub of this.sharedDataService.publicationList) {
      if (pub._respondata.publication.project == currentPublicationObject._respondata.publication.project) {
        this.clearCacheData(pub);
        pub.loaderStatus = true;
        pub.dataStatus = true;
      }
    }
    this.projectService.getStackListForProject(currentPublicationObject._respondata.publication.project).subscribe(
      (responseStackList) => {
        if (responseStackList.code == 100) {
          this.indexedDBService.updateStacksInProject(responseStackList.stacklist, currentPublicationObject._respondata.publication.project, () => {
            this.ibUtilsService.getStacklistFromProjectDTODB(currentPublicationObject._respondata.publication.project, (mainStackList) => {
              currentPublicationObject._selectedStack = this.ibUtilsService.getStackByStackId(mainStackList, currentPublicationObject._selectedStack.id);
              for (let pub of this.sharedDataService.publicationList) {
                if (pub._respondata.publication.project == currentPublicationObject._respondata.publication.project) {
                  /*update new stack elements */
                  pub.loaderStatus = true;
                  pub.dataStatus = true;
                  pub._selectedStackFilter = "";
                  this.ibUtilsService.getStacklistFromProjectDTODB(pub._respondata.publication.project, (stackList) => {
                    let fullStack = this.ibUtilsService.getStackFromStacklist(stackList, pub._selectedStack);
                    if ((fullStack.isStackLoaded) || (this.utilsService.isPresent(fullStack.stackElements)) && fullStack.stackElements.length > 0) {
                      pub._stacklist_table = fullStack.stackElements;
                      pub._allSelectedStackFilters = fullStack.stackFilter;
                      pub._elementSelectedFilters = [];
                      pub._filterListObject = [];
                      let _getFilters = new GetFiltersPipe();
                      pub.loaderStatus = false;
                      pub.dataStatus = false;
                      if (this.utilsService.isPresent(pub._stacklist_table[0])) {
                        pub._filterListObject = _getFilters.transform(currentPublicationObject._selectedStack.filters, pub._filterNames, pub._filterListObject);
                      }
                      for (let i = 0; i < pub._filterListObject.length; i++) {
                        if (pub._filterListObject[i].filterObj.type == 'checkbox') {
                          pub._filterListObject[i]._isOpen = true;
                        }
                      }
                    } else {
                      this.projectService.getStackByIdForGrid(pub._respondata.publication.project, pub._selectedStack.id, pub._selectedStackFilter.key, 0, 0).subscribe(
                        (response) => {
                          if (response.code == 100) {
                            pub.loaderStatus = true;
                            pub.dataStatus = true;
                            this.indexedDBService.updateAStackInProject(pub._respondata.publication.project, pub._selectedStack, response.stack, () => {
                              this.ibUtilsService.getStacklistFromProjectDTODB(pub._respondata.publication.project, (stackList) => {
                                pub._selectedStack = this.ibUtilsService.getStackByStackId(stackList, pub._selectedStack.id);
                                pub._stacklist_table = response.stack.stackElements;
                                pub._allSelectedStackFilters = response.stack.stackFilter;
                                pub._elementSelectedFilters = [];
                                for (let stack1 in stackList) {
                                  let stackElementId = stackList[stack1].id;
                                  if (stackElementId == pub._selectedStack.id) {
                                    pub._selectedStack = stackList[stack1];
                                  }
                                }
                                pub._filterListObject = [];
                                let _getFilters = new GetFiltersPipe();
                                if (this.utilsService.isPresent(pub._stacklist_table[0])) {
                                  pub._filterListObject = _getFilters.transform(currentPublicationObject._selectedStack.filters, pub._filterNames, pub._filterListObject);
                                }
                                for (let i = 0; i < pub._filterListObject.length; i++) {
                                  if (pub._filterListObject[i].filterObj.type == 'checkbox') {
                                    pub._filterListObject[i]._isOpen = true;
                                  }
                                }
                              });
                            });
                            pub.loaderStatus = false;
                            pub.dataStatus = false;
                          } else {
                            pub.loaderStatus = false;
                            pub.dataStatus = false;
                          }
                        })
                    }
                  });
                }
              }
              this.ibUtilsService.detectChangesInBuilderPage();
            });
          });
        }
      });
  }

  /**
  * get updated product state for assigned elements and basket elements
  * 
  * @param project Name of the project
  */
  getPublicationWithUpdatedProductState(project) {
    for (let pub of this.sharedDataService.publicationList) {
      if (pub._respondata.publication.project == project) {
        pub._reloadBasketLoader = true;
      }
    }

    for (let pub of this.sharedDataService.publicationList) {
      if (pub._respondata.publication.project == project) {
        pub._reloadBasketLoader = true;
        if ((this.utilsService.isPresent(pub._elementlist_table) && pub._elementlist_table.length > 0) || (this.utilsService.isPresent(pub._pubItems) && pub._pubItems.length > 0) || (this.utilsService.isPresent(pub._mainPubItems) && pub._mainPubItems.length > 0)) {
          this.projectService.getPublicationWithUpdatedProductState(pub._respondata.publication.project, pub._respondata.publication.id).subscribe((response) => {
            if (response.code == 100) {
              pub._elementlist_table = response.basketStackElements;
              pub._reloadBasketLoader = false;
              pub._pubItems = [];
              pub._mainPubItems = [];
              this.ibUtilsService.getMasterPagesDB(pub, (masterPages) => {
                if ((response.pages != null) && (response.pages.length != 0)) {
                  this.builderService.loadPages(pub, response.pages, masterPages);
                }
                pub._reloadBasketLoader = false;
              });
            } else {
              pub._reloadBasketLoader = false;
            }
            this.ibUtilsService.detectChangesInBuilderPage();
          });
        } else {
          pub._reloadBasketLoader = false;
        }
      }
    }
  }

  /**
  * Popup for refresh or change data XML
  * 
  * @param project Name of the project
  * @param callback this is a callback function giving number
  * @returns  returns the value of action to be performed for cancel or carry the operation
  */
  popupForRefreshData(project, callback) {
    var changeInPublication = false;
    for (let pub of this.sharedDataService.publicationList) {
      if (pub._respondata.publication.project == project) {
        if (pub._isChange) {
          changeInPublication = true;
          break;
        }
      }
    }
    if (changeInPublication) {
      let dialogRef = this.dialog.open(DialogPopup);
      dialogRef.componentInstance.userQuery = "DO_YOU_WANT_TO_SAVE_CHANGES";
      dialogRef.componentInstance.dialogName = "SAVE_CHANGES";
      dialogRef.afterClosed().subscribe(result => {
        let selectedOption = result;
        if (selectedOption == '1') {
          let counter = 0;

          this.commonService.saveAllPublicationOfAProject(null, project, counter, (data) => {
            callback(data);
          });
        } else if (selectedOption == '0') {
          callback(1);
        } else if (selectedOption == '2') {
          callback(2);
        }
      });
    } else {
      callback(1);
    }
  }
}
