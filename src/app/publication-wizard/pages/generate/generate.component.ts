import { Component, OnInit, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { Observable, interval, of } from 'rxjs';
import { tap, switchMap, filter, take, startWith, map } from 'rxjs/operators';

import * as moment from 'moment';

import { AppConfig } from '../../../app.config';
import { SharedDataService } from '../../../services/shared-data.service';
import { GenerateService } from './generate.service';
import { JoblistService } from '../../../dto/joblist.service';
import { UtilsService } from '../../../shared/services/utils.service';
import { ConstantsService } from '../../../services/constants.service';
import { IbUtilsService } from '../../../services/ib-utils.service';

@Component({
  selector: 'app-generate',
  templateUrl: './generate.component.html',
  styleUrls: ['./generate.component.scss']
})
export class GenerateComponent implements OnInit, AfterViewInit {

  outputFormats: string[];
  port: string;
  ip: string;
  stateCtrl: FormControl = new FormControl();
  filteredPageSettingValue: any;
  appendMode: string[] = ['APPEND_PAGES', 'USE_EXISTING_PAGES'];
  additionalParamsKey: string[] = ['RendererMode', 'OutputFormat', 'StyleName'];
  binaryStringEncoded = "";
  imageQualityList: number[] = [72, 96, 150, 200, 300];
  button_enabled_style = {
    'background-color': this.sharedDataService._Customization.componentColor.bgColor,
    'color': this.sharedDataService._Customization.componentColor.color,
    'font-family': this.sharedDataService._Customization.font.style
  }

  constructor(public appConfig: AppConfig, public sharedDataService: SharedDataService, public fb: FormBuilder, private generateService: GenerateService, private utilsService: UtilsService, private constantsService: ConstantsService, private ibUtilsService: IbUtilsService, private elRef: ElementRef, private renderer: Renderer2) {
    this.stateCtrl = new FormControl();
    this.filteredPageSettingValue = this.stateCtrl.valueChanges
      .pipe(startWith(null),
        map(name => { return this.filterPageSetting(name) }));
  }

  getColumnClass() {
    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    if (((currentPublication._selectedOutpuFormat == 'INT-PDF') || (currentPublication._selectedOutpuFormat == 'INDD') ||
      (currentPublication._selectedOutpuFormat == 'HQ-PDF') || (currentPublication._selectedOutpuFormat == 'FLIB') || (currentPublication._selectedOutpuFormat == 'HTML5')) && this.sharedDataService._Customization.selectedPages.visible == 'true') {
      return 'col-sm-4';
    } else if (((currentPublication._selectedOutpuFormat == 'INT-PDF') || (currentPublication._selectedOutpuFormat == 'INDD') ||
      (currentPublication._selectedOutpuFormat == 'HQ-PDF') || (currentPublication._selectedOutpuFormat == 'FLIB') || (currentPublication._selectedOutpuFormat == 'HTML5')) && this.sharedDataService._Customization.selectedPages.visible !== 'true') {
      return 'col-sm-4';
    } else if (((currentPublication._selectedOutpuFormat != 'INT-PDF') && (currentPublication._selectedOutpuFormat != 'INDD') &&
      (currentPublication._selectedOutpuFormat != 'HQ-PDF') && (currentPublication._selectedOutpuFormat != 'FLIB') && (currentPublication._selectedOutpuFormat != 'HTML5')) && this.sharedDataService._Customization.selectedPages.visible !== 'true') {
      return 'col-sm-4';
    } else if (((currentPublication._selectedOutpuFormat != 'INT-PDF') && (currentPublication._selectedOutpuFormat != 'INDD') &&
      (currentPublication._selectedOutpuFormat != 'HQ-PDF') && (currentPublication._selectedOutpuFormat != 'FLIB') && (currentPublication._selectedOutpuFormat != 'HTML5')) && this.sharedDataService._Customization.selectedPages.visible == 'true') {
      return 'col-sm-4';
    }
  }

  ngOnInit() {
    window.setTimeout(() =>
      this.sharedDataService.setShowTabs(true));
    this.sharedDataService.setTitle("GENERATE");
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._isSingleFileMode = true;

    if (localStorage.getItem('OutputFormats') != undefined || localStorage.getItem('OutputFormats') != null) {
      this.outputFormats = Object.keys(JSON.parse(localStorage.getItem('OutputFormats')));
    }

    if (this.sharedDataService.isLoggedIn != undefined) {
      this.setDefaultOnInit();
    }
    this.validateIgnoreProductState();


    this.ibUtilsService.publicationChanged.subscribe(() => {
      this.updateCheckboxColor();
      this.updateRadioColorGen();
    });

  }

  ngAfterViewInit() {
    this.updateCheckboxColor();
    this.updateRadioColorGen();
  }

  updateCheckboxColor() {
    setTimeout(() => {
      for (let el of this.elRef.nativeElement.querySelectorAll('.mat-checkbox.mat-accent .mat-checkbox-background')) {
        this.renderer.setStyle(el, 'background-color', 'transparent');
      }
      for (let el of this.elRef.nativeElement.querySelectorAll('.mat-checkbox-checked.mat-accent .mat-checkbox-background')) {
        this.renderer.setStyle(el, 'background-color', this.sharedDataService._Customization.componentColor.bgColor);
      }
      for (let el of this.elRef.nativeElement.querySelectorAll('.mat-checkbox-checked.mat-accent.mat-checkbox-disabled .mat-checkbox-background')) {
        this.renderer.setStyle(el, 'background-color', '#b0b0b0');
      }
      for (let el of this.elRef.nativeElement.querySelectorAll('.mat-checkbox-label')) {
        this.renderer.setStyle(el, 'font-family', this.sharedDataService._Customization.font.style);
      }
    })
  }

  updateRadioColorGen() {
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

  setbuttonStyleGenerate() {
    let styles = {
      'background-color': !this.generatePublicationForm.valid || this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._incorrectImageQualityError || this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._ignoreProductStateEnable ? 'rgba(0, 0, 0, .12)' : this.sharedDataService._Customization.componentColor.bgColor,
      'color': !this.generatePublicationForm.valid || this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._incorrectImageQualityError || this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._ignoreProductStateEnable ? 'rgba(0, 0, 0, .38)' : this.sharedDataService._Customization.componentColor.color,
      'font-family': this.sharedDataService._Customization.font.style
    };
    return styles;
  }


  validateIgnoreProductState() {
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._ignoreProductStateFlag && !this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._ignoreProductStateData) {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._ignoreProductStateEnable = true;
    } else {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._ignoreProductStateEnable = false;
    }
    for (let variable of this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._respondata.publication.variables) {
      if (variable.name == this.constantsService.IGNORE_PRODUCT_STATE) {
        if (variable.selectedValues.length > 0) {
          if (variable.selectedValues[0].value == 1 && !this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._ignoreProductStateData) {
            this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._ignoreProductStateEnable = true;
            this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._ignoreProductStateFlag = true;
          }
        }
      }
    }
  }

  uploadAppendPage() {
    document.getElementById('uploadappendpage').click();
  }

  includeAll() {
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._isIncludeFonts = true;
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._isIncludeGraphics = true;
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._isIncludeProfiles = true;
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._isUpdateGraphicslinks = true;
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._isIncludeHiddenLayers = true;
    this.updateCheckboxColor();
  }

  public generatePublicationForm = this.fb.group({
    ouputformat: ["", Validators.required],
    language: ["", Validators.required],
    styleName: [""],
    imageJPEGQuality: [],
    imagePNGQuality: []
  });

  generatePublication() {
    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];

    let tempPub = this.utilsService.deepCopy(currentPublication._respondata.publication);
    let tempVariablesArray = this.utilsService.deepCopy(currentPublication._respondata.publication.variables);
    this.ibUtilsService.removeSelectedValueFromTempVariables(tempVariablesArray);
    tempPub.variables = this.utilsService.deepCopy(tempVariablesArray);
    if (currentPublication._visitedBuilderPage) {
      if (currentPublication._mainPubItems.length != 0) {
        let tempPubPages = this.utilsService.deepCopy(currentPublication._mainPubItems);
        this.ibUtilsService.removeTempElement(tempPubPages);
        tempPub.pages = this.deepCopy(tempPubPages);
      } else {
        this.utilsService.notificationWithTranslation('ERROR_NO_PAGES_IN_PAGE_PLANNING_FOR_GENERATION', []);
        return;
      }
    } else {
      if (currentPublication._respondata.publication.pages.length == 0) {
        this.utilsService.notificationWithTranslation('ERROR_NO_PAGES_IN_PAGE_PLANNING_FOR_GENERATION', []);
        return;
      }
    }

    let generatePublicationFormObj = this.generatePublicationForm.getRawValue();
    let starttime = new Date();
    let filenameFormatedTime = moment(starttime).isValid() ? moment(starttime).format("YYYY_MM_DD_HH_mm_ss") : starttime;
    let outputfilename = currentPublication._respondata.publication.project + "_" + currentPublication._respondata.publication.name + "_" + filenameFormatedTime + this.setFileExtension(currentPublication, JSON.parse(localStorage.getItem('OutputFormats'))[generatePublicationFormObj.ouputformat][0]);
    let projectName = currentPublication._respondata.publication.project;
    let publicationId = currentPublication._respondata.publication.id;
    let additionalparams = "";

    if ((currentPublication._selectedOutpuFormat == 'IMG-JPEG')) {
      additionalparams = this.setAdditionalParams(currentPublication._selectedOutpuFormat, generatePublicationFormObj.imageJPEGQuality);
    }
    else if ((currentPublication._selectedOutpuFormat == 'IMG-PNG')) {
      additionalparams = this.setAdditionalParams(currentPublication._selectedOutpuFormat, generatePublicationFormObj.imagePNGQuality);
    }
    else {
      additionalparams = this.setAdditionalParams(currentPublication._selectedOutpuFormat, generatePublicationFormObj.styleName);
    }
    this.binaryStringEncoded = "";
    let previewOption = false;
    previewOption = this.setPreviewOption(currentPublication._selectedOutpuFormat);

    let objJoblistService = new JoblistService();
    objJoblistService._starttime = starttime;
    objJoblistService._fileName = outputfilename;
    objJoblistService._outputmedium = generatePublicationFormObj.ouputformat;
    objJoblistService._html5Preview = previewOption;
    currentPublication._jobList.unshift(objJoblistService);

    if (currentPublication._isGenerateSelectedPageSelected) {
      let pageScopeId = [];
      for (let i of currentPublication._selectedPages) {
        let index = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems.findIndex(x => x.id === i)
        pageScopeId.push(currentPublication._pubItems[index].id);
      }
      this.generateService.generatePublicationForPageScopes(currentPublication._respondata.publication.project, generatePublicationFormObj.language, tempPub, generatePublicationFormObj.ouputformat, outputfilename, pageScopeId, additionalparams, this.binaryStringEncoded).subscribe(
        (data) => {
          if (data.code == 100) {
            objJoblistService._jobId = data.generationResultdataObject.jobId;
            this.generatePublicationStatus(objJoblistService, data.generationResultdataObject, projectName, publicationId);
          } else {
            objJoblistService._generationStatus = -104;
            this.ibUtilsService.showIBErrors(data, 'GENERATION_FAILED_PLEASE_CHECK_LOGS');
          }
        }
      );
    } else {
      this.generateService.generatePublication(currentPublication._respondata.publication.project, generatePublicationFormObj.language, tempPub, generatePublicationFormObj.ouputformat, outputfilename, additionalparams, this.binaryStringEncoded).subscribe(
        (data) => {
          if (data.code == 100) {
            objJoblistService._jobId = data.generationResultdataObject.jobId;
            this.generatePublicationStatus(objJoblistService, data.generationResultdataObject, projectName, publicationId);
          } else {
            objJoblistService._generationStatus = -104;
            this.ibUtilsService.showIBErrors(data, 'GENERATION_FAILED_PLEASE_CHECK_LOGS');
          }
        }
      );
    }

  }

  generatePublicationStatus(generationJob, generationResultdataObject, projectName, publicationId) {
    let statGen = 10;
    interval(3000).pipe(tap(() => {
      if ((this.sharedDataService.isLoggedIn !== null) && (this.sharedDataService.isLoggedIn != undefined) && (this.sharedDataService.isLoggedIn.length > 0)) {
        this.generateService.generatePublicationStatus(generationJob._jobId, generationResultdataObject, generationJob._outputmedium, generationJob._html5Preview)
          .subscribe(
            (response) => {
              if (response.code == 100) {
                generationJob._progress = response.generationResultdataObject.progress;
                generationJob._step = response.generationResultdataObject.step;
                generationJob._stepCount = response.generationResultdataObject.stepCount;
                generationJob._generationStatus = response.generationResultdataObject.generationStatus;
                if (response.generationResultdataObject.generationStatus == 0) {

                  generationJob._fileName = response.generationResultdataObject.fileName;
                  if (generationJob._html5Preview) {
                    generationJob._downloadURL = response.generationResultdataObject.downloadURL;
                    if (generationJob._firstPreview == 0) {
                      generationJob._firstPreview = 1;
                      let that = this;
                      setTimeout(function () {
                        that.submitDownloadForm(generationJob._jobId);
                      }, 1000);
                    }
                  } else {
                    generationJob._downloadURL = response.generationResultdataObject.downloadURL;
                  }

                  generationJob._downloadStatus = true;
                }
                statGen = response.generationResultdataObject.generationStatus;
              } else {
                statGen = -104;
                generationJob._generationStatus = -104;
                this.ibUtilsService.showIBErrors(response);
              }
            }
          )
      }
    }),
      switchMap(() => this.intervalCheckingStatus(statGen)),
      filter(statGen => Boolean(statGen)), // your logic if the status is valid, currently just a boolean-cast
      take(1))
      .subscribe((data) => {
      });
  }

  intervalCheckingStatus(statGen) {
    if (statGen == 0) {
      return of(true);
    } else if (statGen == -125) {
      this.utilsService.notificationWithTranslation('GENERATION_CANCELLED', []);
      return of(true);
    } else if (statGen < 0) {
      this.utilsService.notificationWithTranslation('GENERATION_FAILED_PLEASE_CHECK_LOGS', []);
      return of(true);
    }
    return of(false);
  }

  deleteJoblist(job) {
    let index = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._jobList.indexOf(job);
    if (index !== -1) {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._jobList.splice(index, 1);
    }
  }

  deleteAllJoblist() {
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._jobList = [];
  }

  deepCopy(o) {
    let copy = o, k;
    if (o && typeof o === 'object') {
      copy = Object.prototype.toString.call(o) === '[object Array]' ? [] : {};
      for (k in o) {
        copy[k] = this.deepCopy(o[k]);
      }
    }
    return copy;
  }

  getIfGenerateSelectedPageSelected() {
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._isGenerateSelectedPageSelected = !this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._isGenerateSelectedPageSelected;
    this.updateCheckboxColor();
  }

  setDefaultOnInit() {
    // DEV-12040 && DEV-12077
    // this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._isGenerateSelectedPageSelected = false;
    // this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._isAppendMode = false;
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._incorrectImageQualityError = false;
    this.initPdfStyle();
    this.updateCheckboxColor();
    this.updateRadioColorGen();
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedOutpuFormat == 'IMG-JPEG') {
      this.validateImageQuality(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._imageJPEGQualitySetting);
    }
    else if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedOutpuFormat == 'IMG-PNG') {
      this.validateImageQuality(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._imagePNGQualitySetting);
    }
  }

  initPdfStyle() {
    if ((this.sharedDataService.styleNames == undefined || (this.sharedDataService.styleNames == null) || (this.sharedDataService.styleNames.length < 1))) {
      this.generateService.getPdfStylesList().subscribe(
        (data) => {
          if (data.code == 100) {
            let format = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedOutpuFormat;
            if (data.pdfStylesList.length == 0 && format == 'HQ-PDF') {
              this.utilsService.notificationWithTranslation('SET_PRESET_PATH', []);
            }
            else {
              this.sharedDataService.setStyleNames(data.pdfStylesList);
            }
          } else {
            this.ibUtilsService.showIBErrors(data);
          }
        }
      );
    }
  }

  filterPageSetting(val: string) {
    return val ? this.sharedDataService.styleNames.filter(s => s.toLowerCase().indexOf(val.toLowerCase()) === 0) : this.sharedDataService.styleNames;
  }

  loadPageSettingFirstTime() {
    this.stateCtrl.setValue("");
  }



  uploadAppendFile(evt) {
    let publicationObject = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    let files = evt.target.files;
    let file = files[0];
    if (files && file) {
      publicationObject._appendFileName = file.name;
      let fileExtention = publicationObject._appendFileName.split(".").pop();
      if (fileExtention == "indd") {
        this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].generateDataStatus = true;
        this.generateService.uploadAppendFile(evt, publicationObject._respondata.publication.project, publicationObject._selectedOutpuFormat).subscribe((response) => {
          this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].generateDataStatus = false;
          if (response.code == 100) {
            publicationObject._serverAppendFilePath = response.resultFilename;
          }
          else {
            publicationObject._appendFileName = "";
            publicationObject._serverAppendFilePath = "";
            this.binaryStringEncoded = "";
            this.ibUtilsService.showIBErrors(response);
          }
        });
      } else {
        this.utilsService.notificationWithTranslation('PLEASE_SELECT_CORRECT_FILE_FORMAT', []);
      }
    }
  }

  setAdditionalParams(outputFormats, propertyValue) {
    let publicationObject = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    let additionalparams = "";
    switch (outputFormats) {
      case 'HQ-PDF': {
        if (this.stateCtrl.value == null) {
          this.stateCtrl.setValue("");
        }
        additionalparams = "-RendererMode INDD -OutputFormat HQ-PDF -StyleName " + propertyValue;
        break;
      }
      case 'INT-PDF': {
        additionalparams = "-RendererMode INDD -OutputFormat INT-PDF";
        break;
      }
      case 'INDD': {

        additionalparams = "-pureUpdateInfo " + publicationObject._isIncludeUpdateInformation + " -bidirectionalUpdateInfo " + publicationObject._isIncludeBidirectionalUpdate + " -variablesUpdateInfo " + publicationObject._isIncludeUpdateVariables
        if (publicationObject._isCreateIndesignPackage) {
          // including ignorePreflights (32) and createReport (64)
          let packagingOptions = 96;
          if (publicationObject._isIncludeFonts) {
            packagingOptions += 1;
          }
          if (publicationObject._isIncludeGraphics) {
            packagingOptions += 2;
          }
          if (publicationObject._isIncludeProfiles) {
            packagingOptions += 4;
          }
          if (publicationObject._isUpdateGraphicslinks) {
            packagingOptions += 8;
          }
          if (publicationObject._isIncludeHiddenLayers) {
            packagingOptions += 16;
          }
          additionalparams = additionalparams + " -packagingRequired true -packagingOption " + packagingOptions;
          additionalparams = additionalparams + " -packagingOutputFile Package zip=true"
        }
        break;
      }

      case 'HTML5': {

        additionalparams = "-HTML5SingleFileMode " + publicationObject._isSingleFileMode;
        if (publicationObject._isCopyImages) {
          additionalparams = additionalparams + " -HTML5CopyImages " + publicationObject._isCopyImages;
        } else {
          additionalparams = additionalparams + " -HTML5CopyImages " + publicationObject._isCopyImages + " -HTML5EmbedImages true";
        }
        break;
      }
      case 'FLIB': {
        let flippingValue = publicationObject._isFlippingEffect ? 1 : 0;
        additionalparams = "-FLIBFlipping " + flippingValue;

        break;
      }
      case 'IMG-PNG':
      case 'IMG-JPEG': {
        if (this.stateCtrl.value == null) {
          this.stateCtrl.setValue("");
        }
        additionalparams = "-dpi " + propertyValue;
        break;
      }
      default: {
        break;
      }
    }
    if (publicationObject._isAppendMode) {
      let appendValue = 1;
      if (publicationObject._selectedAppendMode === 'USE_EXISTING_PAGES') {
        appendValue = 2;
      }
      if (this.utilsService.isPresent(publicationObject._serverAppendFilePath)) {
        additionalparams = additionalparams + ' -appendMode ' + appendValue + ' -appendFile \\\"' + publicationObject._serverAppendFilePath + '\\\"';
      }
    }
    return additionalparams;
  }

  setSelectedDataToformControl(data) {
    this.stateCtrl.setValue(data);
  }

  validateImageQuality(data) {
    if (data) {
      if (data < 72 || data > 1600 || isNaN(data)) {
        this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._incorrectImageQualityError = true;
      }
      else {
        this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._incorrectImageQualityError = false;
      }
    }
    else {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._incorrectImageQualityError = false;
    }
    this.stateCtrl.setValue(data);
  }

  setFlippingEffect() {

    //    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._isFLIBHTML5 =event;
    //     if (format == 'HTML5') {
    //       if (!this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._isFLIBFlash) {
    //         this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._isFLIBHTML5 = true;
    //         // return true;
    //       } else {
    //         this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._isFLIBHTML5 =event;
    //         // return booleanVal;
    //       }


    //     }

    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._isFlippingEffect = true;
    this.updateCheckboxColor();
  }

  setPreviewOption(outputFormats) {
    let publicationObject = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    let previewOption = false;
    switch (outputFormats) {
      case 'HTML5': {
        if (publicationObject._isSingleFileMode) {
          previewOption = publicationObject._isPreview;
        }
        break;
      }
      case 'FLIB': {
        previewOption = publicationObject._isPreview;
        break;
      }
      default: {
        break;
      }
    }
    return previewOption;
  }

  submitDownloadForm(jobId) {
    this.sharedDataService._isCallfromSubmit = true;
    document.forms[jobId].submit();
    return false;
  }

  uncheckCopyImage() {
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._isCopyImages = false;
    this.updateCheckboxColor();
  }

  unCheckPreview() {
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._isPreview = false;
    this.updateCheckboxColor();
  }

  setFileExtension(currentPublication, outputFormat) {
    let extension = "." + outputFormat;
    switch (currentPublication._selectedOutpuFormat) {
      case this.constantsService.INDD: {
        if (currentPublication._isCreateIndesignPackage) {
          extension = ".zip";
        }
        break;
      }
      default: {
        break;
      }
    }
    return extension;
  }
  getAllowedOutputFormats(currentPublication): any {
    let finalOutputformats = [];
    Object.keys(currentPublication._respondata.publication.logLanguageOutputFormats).forEach(key => {
      let arrayOutputFormats = currentPublication._respondata.publication.logLanguageOutputFormats[key];
      arrayOutputFormats.forEach(format => {
        if (finalOutputformats.indexOf(format) == -1) {
          if (this.outputFormats.indexOf(format) != -1) {
            finalOutputformats.push(format);
          }
        }
      });
    });
    return finalOutputformats;
  }

  getAllowedLogLanguage(currentPublication): any {
    let finalLogLanguageList = [];
    let allowedLanguages = [];
    let propertiesLoglanguage = currentPublication._respondata.publication.redactionProperties.propertiesLogLanguageLists.propertiesLoglanguage;
    if (propertiesLoglanguage) {
      for (let lang of propertiesLoglanguage) {
        if (allowedLanguages.indexOf(lang.loglanguage) == -1) {
          allowedLanguages.push(lang.loglanguage);
        }
      }
      if (currentPublication._selectedOutpuFormat) {
        Object.keys(currentPublication._respondata.publication.logLanguageOutputFormats).forEach(lang => {
          if (allowedLanguages.indexOf(lang) != -1) {
            let arrayOutputFormats = currentPublication._respondata.publication.logLanguageOutputFormats[lang];
            arrayOutputFormats.forEach(format => {
              if (format === currentPublication._selectedOutpuFormat) {
                if (finalLogLanguageList.indexOf(lang) == -1) {
                  finalLogLanguageList.push(lang);
                }
              }
            });
          }
        });
      }
    }
    return finalLogLanguageList.sort();
  }

}
