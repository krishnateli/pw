import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef, ViewContainerRef, DoCheck, ViewChild, ElementRef, HostListener, HostBinding } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Observable, timer } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { DeviceDetectorService } from 'ngx-device-detector';

import { DialogPopup } from '../../../components/dialog/dialogpopup.component';

import { SharedDataService } from "../../../services/shared-data.service";
import { BuilderService } from "./builder.service";
import { UtilsService } from '../../../shared/services//utils.service';
import { ElementselectionService } from '../element-selection/elementselection.service';
import { ProjectdtoService } from '../../../dto/projectdto.service';

import { SelectedColumnPipe } from '../../pipes/selectedcolumn.pipe';
import { SearchPipe } from '../../pipes/search.pipe';
import { CheckboxfilterPipe } from '../../pipes/checkboxfilter.pipe';
import { GetFiltersPipe } from '../../pipes/get-filters.pipe';
import { FilterPipe } from '../../pipes/filter.pipe';
import { LangStackFilterPipe } from '../../pipes/lang-stack-filter.pipe';

import { SliderComponent } from '../../components/slider/slider.component';
import { TableComponent } from '../../components/table/table.component';
import { ConstantsService } from '../../../services/constants.service'
import { IbUtilsService } from '../../../services/ib-utils.service';
import { ProjectService } from '../../../services/project.service';
import { IndexedDBService } from '../../../db/indexeddb.service';

import * as $ from 'jquery';
window["$"] = $;
window["jQuery"] = $;

@Component({
  selector: 'app-builder',
  templateUrl: './builder.component.html',
  styleUrls: ['./builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuilderComponent implements OnInit, DoCheck {

  @ViewChild(SliderComponent) sliderComponent: SliderComponent;
  @ViewChild(TableComponent) tableComponent: TableComponent;

  selectedRow: number;
  selectedCollection: string;
  selectedProduct: string;
  selectedDisplayValue: string = 'DisplayValue';
  selectedlangurl: any;
  rows: any;
  itemsPerRow: number;
  selectedElem = [];
  isOpenFilter: boolean;
  isOpenBasketFilter: boolean;
  addTextFilter: any;
  addCheckFilter: any;
  change: any = 0;
  isOpen: boolean;
  isOpenBasket: boolean;
  isOpenStack: boolean;
  searchQueryBasket: any;
  searchQueryStack: any;
  pressed: boolean;
  startBasket: any;
  startXBasket: any;
  startWidthBasket: any;
  startWidthBRendererasket: any;
  darFlag: any = 0;
  dataStatus: boolean;
  previewStatus: boolean;
  pagePreview: boolean;
  LatestIndex: any;
  shiftSelectIndex: any;
  ifPresentFlag: boolean = false;
  isPresentIndex: any;
  infinity: any = "empty";
  tableBodyWidthBasket: number;
  tableBodyWidth: number;
  selectedOption: string;



  selectedZoom = "1";
  elemZoom: number = 1;
  selectedPageFilter = "all";
  qty_val: number = 1;
  prev_qty_val: number = 1;
  showDummyPage: boolean = false;
  selectAllPagesFlag = false;
  currEditTitleIndex;
  postdata = {};
  addStaticPageImportedToPlayArea: boolean = false;
  addStaticPageImportedToPlayAreaEvent: any;
  pageScopeType: string;
  workFlowStates: any = [];
  pageDragged: boolean = true;
  public reqVariable;
  bottomScroll: boolean = false;
  topScroll: boolean = false;
  private interval: number;
  statusFromBasket: any;

  _divWidth: number;

  scrollStackStep: number = 10;
  noOfStackElementsToDisplay: number = 50;
  scrollBasketStep: number = 10;
  noOfBasketElementsToDisplay: number = 50;
  deviceInfo: any;
  setPadd: number = 15;

  ngOnInit() {
    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    currentPublication._selectedArea = {};
    // currentPublication._selectedPages = [];
    currentPublication._selectedElem = [];
    currentPublication._selectedBuilderStackRows = [];
    currentPublication._selectedBuilderBucketRows = [];
    this.ibUtilsService.getStaticPagesDBHTML(currentPublication);
    this.ibUtilsService.getMasterPagesDBHTML(currentPublication);
    this.deviceInfo = this.deviceDetectorService.getDeviceInfo();
    this.sharedDataService.setTitle("Builder");
    window.setTimeout(() =>
      this.sharedDataService.setShowTabs(true)
    );
    this.ibUtilsService.publicationChanged.subscribe(() => {
      if (!this.cd['destroyed']) {
        this.cd.detectChanges();
      }
    });
    for (let pub in this.sharedDataService.publicationList) {
      this.ibUtilsService.getStacklistFromProjectDTODB(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._respondata.publication.project, (stackList) => {
        for (let stack1 in stackList) {
          let stackElementId = stackList[stack1].id;
          if (this.utilsService.isPresent(this.sharedDataService.publicationList[pub]._selectedStack)) {
            if (stackElementId == this.sharedDataService.publicationList[pub]._selectedStack.id) {
              this.sharedDataService.publicationList[pub]._selectedStack = stackList[stack1];
            }
          }
        }
      });
    }

    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mPreviewAll = true;
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._showProperties = 'stackbasket';
    this.ibUtilsService.configureLanguage();

    if (currentPublication._selectedPages.length == 1) {
      this.showPageProperties(0);
    }

    this.updatePubitems();
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._elementlist_table.length == 0) {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._bucketToggle = false;
    }

    // this.resizeOnInit();
    currentPublication._visitedBuilderPage = true;
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._displayImageArray = [];

    if (this.utilsService.isPresent(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].searchQueryBuilderBasket)) {
      this.toggleSearchBasket();
    }
    if (this.utilsService.isPresent(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].searchQueryStack)) {
      this.toggleSearchStack();
    }
    this.checkPreviewConversionInProgress()
  }


  checkPreviewConversionInProgress() {
    let currrentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    let pagesToPreview = [];
    for (let page of currrentPublication._pubItems) {
      if (page._preview) {
        if (page.type == "CONVERTING") {
          page._preview = true;
          page.type = this.constantsService.INBETWEEN;
        } else {
          if (page.type != 'InBetween') {
            pagesToPreview.push(page);
          } else if (page.type == 'InBetween') {
            page._preview = true;
          }
          else {
            page._preview = false;
          }
        }
      }
    }
    if (pagesToPreview.length != 0) {
      this.builderService.updateCachedPreview(currrentPublication, pagesToPreview);
    }
  }

  updateHeightInFatScrollBrowsers(pagePlanningToolBar) {
    if (this.deviceInfo.browser == 'firefox') {
      this.setPadd = 5;
    } else {
      this.setPadd = 15;
    }
    if ((this.deviceInfo.browser == 'ie' || this.deviceInfo.browser == 'firefox' || this.deviceInfo.browser == 'ms-edge') && pagePlanningToolBar._elementRef.nativeElement.scrollWidth > pagePlanningToolBar._elementRef.nativeElement.offsetWidth) {
      return true;
    }
    return false;
  }

  ngAfterViewInit() {
    this.sliderComponent.updateSliderState();
  }

  onVerResize() {
    this.sliderComponent.updateSliderState();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.keyCode == 46 || (event.metaKey && event.keyCode == 8)) {
      let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
      if (currentPublication._selectedElem.length != 0) {
        for (let k = currentPublication._selectedElem.length - 1; k >= 0; k--)
        // for(let elem of this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedElem)
        {
          this.removeElements(currentPublication._selectedElem[k].pageId, currentPublication._selectedElem[k].pgIndx, currentPublication._selectedElem[k].araIndx, currentPublication._selectedElem[k].elemIndx);
        }
        this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedElem = [];
        // { pageId: pItemid, areaId: pAreaid, assigmentIndex: assigmentIndex, pgIndx: indx, araIndx: i, elemIndx: ind };
        // 
      } else {
        this.utilsService.notificationWithTranslation("ERROR_NO_ELEMENTS_SELECTED", "");
      }
    }
  }

  getBasketScrollValue() {
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._elementlist_table.length > 0) {
      return -1 * this.elementRef.nativeElement.querySelector('.baskettable').scrollLeft;
    }
  }

  getStackScrollValue() {
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._stacklist_table.length > 0) {
      return -1 * this.elementRef.nativeElement.querySelector('.stacktable').scrollLeft;
    }
  }

  verticalStackScroll($event) {
    let target = $event.target || $event.srcElement;
    if (target) {
      if (target.offsetHeight < target.scrollHeight) {
        if ((target.offsetHeight + target.scrollTop) > target.scrollHeight - 100) {
          if (Object.keys(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._stacklist_table).length > this.noOfStackElementsToDisplay) {
            this.noOfStackElementsToDisplay += this.scrollStackStep;
          }
        }
      }
    }
  }

  verticalBasketScroll($event) {
    let target = $event.target || $event.srcElement;
    if (target) {
      if (target.offsetHeight < target.scrollHeight) {
        if ((target.offsetHeight + target.scrollTop) > target.scrollHeight - 100) {
          if (Object.keys(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._elementlist_table).length > this.noOfBasketElementsToDisplay) {
            this.noOfBasketElementsToDisplay += this.scrollBasketStep;
          }
        }
      }
    }
  }

  validateColor(color) {
    if (color.length > 6) {
      return "#" + color.slice(2);
    }
    return "#" + color;
  }

  updatePageState(pageId, stateName) {
    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    let copyArrayIndx = currentPublication._mainPubItems.map((el) => el.id).indexOf(pageId);
    if (copyArrayIndx != -1) {
      currentPublication._mainPubItems[copyArrayIndx].pageStatus = stateName;
    }
    let pubIndx = currentPublication._pubItems.map((el) => el.id).indexOf(pageId);
    if (pubIndx != -1 && currentPublication._pubItems[pubIndx].type == "InBetween") {
      currentPublication._pubItems[pubIndx].pageStatus = stateName;
    }
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._isChange = true;
  }

  checkPageStatus(pageId) {
    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    let pageIndx = currentPublication._mainPubItems.map((el) => el.id).indexOf(pageId);
    if (this.utilsService.isPresent(this.sharedDataService._workflows)) {
      this.workFlowStates = this.sharedDataService._workflows.states;
      for (let state of this.workFlowStates) {
        if ((pageIndx != -1) && this.utilsService.isPresent(currentPublication._mainPubItems[pageIndx].pageStatus)) {
          if (state.name == currentPublication._mainPubItems[pageIndx].pageStatus) {
            return this.validateColor(state.hexColor);
          }
        } else {
          if (state.defaultValue == 1) {
            return this.validateColor(state.hexColor);
          }
        }
      }
    }
  }

  onClickImportStaticPages() {
    this.elementRef.nativeElement.querySelector('#importStaticPages').click();
  }

  importStatticFile(event) {
    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    let currPub = currentPublication._respondata.publication;
    if (this.utilsService.isPresent(event) && this.utilsService.isPresent(this.elementRef.nativeElement.querySelector('#importStaticPages').value)) {
      currentPublication.showLoaderInSlider = true;
      this.sliderComponent.addLoaderToSlider();
      this.builderService.postStaticFile(event, currPub.project, currPub.masterPublication).subscribe((response) => {
        if (response.code == 100) {
          if (response.alreadyExists) {
            currentPublication.showLoaderInSlider = false;
            this.sliderComponent.removeLoaderFromSlider();
            this.utilsService.notificationWithTranslation(this.constantsService.STATIC_PAGE_ALREADY_EXISTS_ON_SERVER, [response.resultFilename]);
          } else {
            let objProjectdtoService = new ProjectdtoService();
            objProjectdtoService.name = currPub.project;
            this.ibUtilsService.addNewStaticPageToMasterPublicationObj(currPub.project, currPub.masterPublication, response.resultFilename, (masterPublications) => {
              objProjectdtoService.masterPublications = masterPublications;
              this.indexedDBService.addUpdateProject(currPub.project, objProjectdtoService, () => { });
              this.getMasterPages(currentPublication);
            });
          }
        } else {
          currentPublication.showLoaderInSlider = false;
          this.sliderComponent.removeLoaderFromSlider();
          this.ibUtilsService.showIBErrors(response);
        }
        this.elementRef.nativeElement.querySelector('#importStaticPages').value = "";
      });
    }
  }

  getMasterPages(currentPublication) {
    let currPub = currentPublication._respondata.publication;
    this.projectService.getMasterPages(currPub.project, currPub.id).subscribe((response) => {
      let staticPages = []
      this.sliderComponent.updateSliderState();
      if (response.code == 100) {
        this.ibUtilsService.getStaticPagesDB(currentPublication, (staticPages) => {
          for (let mPage of response.masterPages) {
            if (staticPages.map((el) => el.id).indexOf(mPage.id) == -1) {
              if (mPage.type != "InBetween") {
                staticPages.push(mPage);
                this.cd.detectChanges();
                this.getStaticPagePreview(mPage);
              }
            }
          }
          let objProjectdtoService = new ProjectdtoService();
          objProjectdtoService.name = currPub.project;
          objProjectdtoService._staticPages = staticPages;
          this.indexedDBService.addUpdateProject(currPub.project, objProjectdtoService, () => {
            this.sliderComponent.updateSliderState();
          });
        });
      } else {
        this.ibUtilsService.showIBErrors(response);
      }
      currentPublication.showLoaderInSlider = false;
      this.sliderComponent.removeLoaderFromSlider();
    });
  }

  getStaticPagePreview(mPage) {
    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    let currPub = currentPublication._respondata.publication;
    currentPublication.showPreviewLoaderInSlider = true;
    currentPublication.activePageIdForStaticPagePreview = mPage.id;
    currentPublication.pagePreviewLoaderStatus.push({ "id": mPage.id, "currentPublication": currentPublication });
    if (currentPublication._selectedBuilderLanguage) {
      this.projectService.getStaticPagePreview(currPub.project, currPub.id, mPage.id, '', this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedBuilderLanguage, "true", mPage.type).subscribe((response) => {
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
                this.cd.detectChanges();
                this.sliderComponent.updateSliderState();
              });

              for (let page of this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mainPubItems) {
                if (page.pageDetails.pageId == mPage.id) {
                  let previewObj = {
                    fileName: null, fileData: null, downloadURL: null, project: page.project, pageId: page.id, jobId: null, html5Preview: false, areaId: null, pageIds: null, generationStatus: null, templateBoundsList: null, contentFromXMPParsing: response.staticDocumentPreviewPagesObject.contentFromXMPParsing, publication: page.publication, progress: 0, step: 0, stepCount: 5, masterPageId: null, previewImage: response.staticDocumentPreviewPagesObject.data
                  }
                  this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._previewedPages[response.language].push(previewObj);
                }
              }
            }
          }
          if (this.addStaticPageImportedToPlayArea) {
            this.addStaticPageImportedToPlayAreaEvent.dragData = this.utilsService.deepCopy(this.addStaticPageImportedToPlayAreaEvent.dragData);
            this.addStaticPageImportedToPlayAreaEvent.dragData.dropType = null;
            this.ibUtilsService.getStaticPagesDB(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex], (staticPages) => {
              this.addStaticPageImportedToPlayAreaEvent.dragData.data = staticPages[staticPages.length - 1];
              this.onMasterPageDrop(this.addStaticPageImportedToPlayAreaEvent);
              this.addStaticPageImportedToPlayArea = false;
            });
          }
          currentPublication.showPreviewLoaderInSlider = false;
          this.cd.detectChanges();
        } else {
          this.ibUtilsService.showIBErrors(response);
        }
      });
    } else {
      currentPublication.showPreviewLoaderInSlider = false;
      currentPublication.pagePreviewLoaderStatus.splice(0, 1);
      this.utilsService.notificationWithTranslation("NO_ALLOWED_LANGUAGE_FOR_PUBLICATION", []);
    }
    this.cd.detectChanges();
  }

  updateStaticPagePreview() {
    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];

    if (this.utilsService.isPresent(currentPublication.selectedStack) && currentPublication.selectedStack.logLanguageConfigured) {
      currentPublication._selectedBuilderStackRows = [];
    }

    this.ibUtilsService.getStaticPagesDB(currentPublication, (staticPages) => {
      for (let sPage of staticPages) {
        if (!this.utilsService.isPresent(sPage._staticPreview) || !this.utilsService.isPresent(sPage._staticPreview[currentPublication._selectedBuilderLanguage]) || sPage._staticPreview[currentPublication._selectedBuilderLanguage].length == 0) {
          this.getStaticPagePreview(sPage);
        }
      }
      let currPub = currentPublication._respondata.publication;
      let objProjectdtoService = new ProjectdtoService();
      objProjectdtoService.name = currPub.project;
      objProjectdtoService._staticPages = staticPages;
      this.indexedDBService.addUpdateProject(currPub.project, objProjectdtoService, () => { });
      this.loadPreviewOnLanguageChange();
    });
  }

  loadPreviewOnLanguageChange() {
    let pagesToPreview = [];
    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    let pageIdList = [];
    for (let page of currentPublication._pubItems) {
      if (page._type == "preview") {
        page._previewLangChange = true;
        pageIdList.push(page.id);
      }
    }
    //filtering unique page IDs
    pageIdList = pageIdList.filter((x, i, a) => a.indexOf(x) == i);
    for (let page of currentPublication._mainPubItems) {
      for (let pageId of pageIdList) {
        if (page.id == pageId) {
          pagesToPreview.push(page);
        }
      }
    }
    this.builderService.updateCachedPreview(currentPublication, pagesToPreview);
  }

  updateElementZoom(sZoom) {
    if (sZoom == 1) {
      this.elemZoom = 1;
      return;
    }
    this.elemZoom = 1 - sZoom / 100 * 20;
  }

  qtyUpdated(event) {
    this.prev_qty_val = event ? event : this.prev_qty_val;
  }
  quantityValidate() {
    this.prev_qty_val = (this.prev_qty_val > 9) ? 9 : this.prev_qty_val
    this.prev_qty_val = (this.prev_qty_val < 0) ? 1 : this.prev_qty_val
    this.qty_val = (typeof this.prev_qty_val === "number") ? Math.trunc(this.prev_qty_val) : this.qty_val
  }
  increment() {
    this.qty_val++;
  }

  decrement() {
    this.qty_val--;
  }

  pagesViewToggle() {
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._toggleStaticMasterPages = !this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._toggleStaticMasterPages;
    this.cd.detectChanges();
  }

  onBlur(indx) {
    this.sharedDataService
      .publicationList[this.sharedDataService.activePublicationIndex]
      ._pubItems[indx].pageName = this.elementRef.nativeElement.querySelector('#title' + indx).value.trim();
    this.sharedDataService
      .publicationList[this.sharedDataService.activePublicationIndex]
      ._mainPubItems[indx].pageName = this.elementRef.nativeElement.querySelector('#title' + indx).value.trim();
    this.sharedDataService
      .publicationList[this.sharedDataService.activePublicationIndex]
      ._isChange = true;
    this.currEditTitleIndex = null;
  }

  switchEditTitle(indx) {
    this.currEditTitleIndex = indx;
    setTimeout(_ => {
      this.elementRef.nativeElement.querySelector('#title' + indx).focus();
      this.elementRef.nativeElement.querySelector('#title' + indx).select();
      if (this.utilsService.isPresent(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[indx].pageName)) {
        this.elementRef.nativeElement.querySelector('#title' + indx).value = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[indx].pageName;
      }
    });
  }

  checkEditTitle(indx) {
    if (this.currEditTitleIndex == indx) {
      return true;
    }
    return false;
  }

  ngDoCheck() {
    this.updatePubitems();
  }

  qtyChange(event) {
    this.qty_val = event;
  }

  toggleFilter() {
    this.isOpenFilter = !this.isOpenFilter;
  }

  toggleBasketFilter() {
    this.isOpenBasketFilter = !this.isOpenBasketFilter;
  }

  selectedFilterfromChild(event) {
    this.addFilter = event;
  }

  selectedTextFilterfromChild(event) {
    this.addTextFilter = event;
  }

  selectedCheckboxFilterfromChild(event) {
    this.addCheckFilter = event;
    this.change = this.change + 1;
  }

  scrollBottomStart() {
    // let timer: Observable<number>;
    let timerr = timer(0, this.interval);
    this.bottomScroll = true;
    timerr
      .pipe(takeWhile(() => this.bottomScroll))
      .subscribe(() => {
        this.elementRef.nativeElement.querySelector('#playAreaContainer').scrollTop += 20;
      });
    // this.elementRef.nativeElement.querySelector('#playAreaContainer').scrollHeight * 100;
  }

  scrollBottomStop() {
    this.bottomScroll = false;
  }

  scrollTopStart() {
    this.topScroll = true;
    // let timer: Observable<number>;
    let timerr = timer(0, this.interval);
    timerr
      .pipe(takeWhile(() => this.topScroll))
      .subscribe(() => {
        this.elementRef.nativeElement.querySelector('#playAreaContainer').scrollTop -= 20;
      });
  }

  scrollTopStop() {
    this.topScroll = false;
  }

  filterPubItem() {

    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems = [];

    for (let i = 0; i < this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mainPubItems.length; i++) {
      if (this.selectedPageFilter == "flow") {
        if ((this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mainPubItems[i].unlimited == "1") && (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mainPubItems[i].parentId == "")) {
          this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems.push(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mainPubItems[i]);
        }
      }
      else if (this.selectedPageFilter == "single") {
        if ((this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mainPubItems[i].unlimited == "0") && (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mainPubItems[i].maximum == "1")) {
          this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems.push(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mainPubItems[i]);
        }
      }
      else if (this.selectedPageFilter == "dynamic") {

        if ((this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mainPubItems[i].unlimited == "1") && (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mainPubItems[i].parentId.split('.')[0] == "DPS")) {
          this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems.push(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mainPubItems[i]);
        }

      } else {
        this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems = [];
        this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems = this.utilsService.deepCopy(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mainPubItems);
      }
    }
  }

  selectAllPages() {
    this.selectAllPagesFlag = !this.selectAllPagesFlag;
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._showProperties = 'stackbasket';
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedPages = [];
    if (this.selectAllPagesFlag) {
      for (let i = 0; i < this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems.length; i++) {
        let selectedPagesArrayIndex = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedPages.indexOf(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[i].id);
        if (selectedPagesArrayIndex == -1) {
          this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedPages.push(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[i].id);
        }
      }
    }
    this.showSelectedPageNumbers();
  }

  checkPublicationPagesLength() {
    let activePublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    if (activePublication._pubItems.length == 0) {
      let styles = {
        'cursor': 'not-allowed',
        'pointer-events': 'none',
        /*Button disabled - CSS color class*/
        'color': '#c0c0c0',
      };
      return styles;
    }
  }

  checkBasketLength() {
    if (!this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._bucketToggle) {
      let style_stack = this.ibUtilsService.checkStackTableLength();
      return style_stack;
    } else {
      let style_basket = this.ibUtilsService.checkBasketTableLength();
      return style_basket;
    }
  }

  checkSelectedPage(indx) {
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedPages.indexOf(indx) === -1) {
      if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedPages.length == -1) {
        this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._isGenerateSelectedPageSelected = false;
      }
      return false;
    }
    return true;
  }

  checkMPreview() {
    let _temp = [];
    for (let page of this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems) {
      if ((this.utilsService.isPresent(page)) && (this.utilsService.isPresent(page._mPreviewUri))) {
        _temp.push(page)
      }
    }
    if (_temp.length == 0) {
      return false;
    } else {
      return true
    }
  }

  checkPrevew() {
    let t = [];
    for (let page of this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems) {
      if (this.utilsService.isPresent(page)) {
        if (!page._preview) {
          t.push(page);
        }
      }
    }
    if (t.length == 0) {
      return false;
    } else {
      return true
    }
  }

  previewMpage() {
    let __mPre = [];
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedPages.length != 0) {
      for (let selIndx of this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedPages) {
        let index = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems.findIndex(x => x.id === selIndx);
        if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[index]) {
          if (this.utilsService.isPresent(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[index]._mPreviewUri)) {
            this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[index]._mPreview = !this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[index]._mPreview;
          }
          if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[index]._mPreview) {
            __mPre.push(index)
          }
        }
      }
      if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedPages.length == __mPre.length) {
        this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mPreviewAll = true;
      } else {
        this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mPreviewAll = false;
      }
    } else {
      for (let pubIndx of this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems) {
        if (pubIndx._mPreviewUri) {
          pubIndx._mPreview = !pubIndx._mPreview;
        }
        if (pubIndx._mPreview) {
          __mPre.push(pubIndx)
        }
      }
      if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems.length == __mPre.length) {
        this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mPreviewAll = true;
      } else {
        this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mPreviewAll = false;
      }
    }
  }

  checkPagePreviewState(): boolean {
    let __pre = [];
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedPages.length != 0) {
      for (let selIndx of this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedPages) {
        let index = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems.findIndex(x => x.id === selIndx);
        if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[index]) {
          if ((this.utilsService.isPresent(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[index])) && (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[index]._preview)) {
            __pre.push(index)
          }
        }
      }
      if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedPages.length == __pre.length) {
        return this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._previewAll = false;
      } else {
        return this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._previewAll = true;
      }
    } else {
      for (let pubIndx of this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems) {
        if ((this.utilsService.isPresent(pubIndx)) && (pubIndx._preview)) {
          __pre.push(pubIndx)
        }
      }
      if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems.length == __pre.length) {
        return this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._previewAll = false;
      } else {
        return this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._previewAll = true;
      }
    }
  }

  checkSelectedElem(pItemid, pAreaid, ind, currParentElem, currElem) {
    if (currElem.scrollWidth <= currElem.offsetWidth) {
      currParentElem.title = "";
    }
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedElem.length != 0) {
      for (let sElm of this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedElem) {
        if ((sElm.pageId == pItemid) && (sElm.areaId == pAreaid) && (sElm.elemIndx == ind)) {
          return true;
        }
      }
    }
  }


  addToSelectionArray(pItemid, indx, pAreaid, i, assigmentIndex, ind, event) {
    let __Obj = { pageId: pItemid, areaId: pAreaid, assigmentIndex: assigmentIndex, pgIndx: indx, araIndx: i, elemIndx: ind };
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedElem.length == 0) {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedElem.push(__Obj);
    } else {
      if (event) {
        if (event.ctrlKey) {
          if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedElem.findIndex(item => item.pageId === pItemid) == -1) {
            this.utilsService.notificationWithTranslation("ERROR_SELECTING_ELEMENT_FROM_DIFFERENT_PAGE", "");
            this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].previewBuilderStatus = false;
            this.cd.detectChanges();
            return;
          } else {
            if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedElem.findIndex(item => item.areaId === pAreaid) == -1) {
              this.utilsService.notificationWithTranslation("ERROR_SELECTING_ELEMENT_FROM_DIFFERENT_AREA", "");
              this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].previewBuilderStatus = false;
              this.cd.detectChanges();
              return;
            } else {
              if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedElem.findIndex(item => item.elemIndx === ind) == -1) {
                this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedElem.push(__Obj);
              } else {
                for (let i = 0; i < this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedElem.length; i++) {
                  if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedElem[i].pageId === pItemid && this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedElem[i].areaId === pAreaid && this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedElem[i].elemIndx === ind) {
                    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedElem.splice(i, 1);
                  }
                }
              }
            }
          }
        } else {
          if ((this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedElem.findIndex(item => item.pageId === pItemid) != -1) && (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedElem.findIndex(item => item.areaId === pAreaid) != -1) && (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedElem.findIndex(item => item.elemIndx === ind) != -1)) {
            if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedElem.length > 1) {
              this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedElem = [];
              this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedElem.push(__Obj);
            } else {
              this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedElem = [];
            }
          } else {
            this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedElem = [];
            this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedElem.push(__Obj);
          }
        }
      } else {
        this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedElem = [];
        this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedElem.push(__Obj);
      }
    }
  }


  loaderStatus = false;
  showElemProperties(pItemid, indx, pAreaid, i, assigmentIndex, ind, event) {
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].multipleFlag = false;
    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    currentPublication.previewBuilderStatus = true;
    this.cd.detectChanges();
    event.stopPropagation();

    currentPublication._selectedArea = {};
    currentPublication._selectedPages = [];
    currentPublication._selectedBuilderStackRows = [];
    currentPublication._selectedBuilderBucketRows = [];
    currentPublication._displayImageArray = [];
    currentPublication.selectedImage = "";

    currentPublication._image = "";
    currentPublication._isBuilderQuickPreview = false;
    currentPublication._selectedRow = "";
    this.loaderStatus = false;

    let elemLen = currentPublication._pubItems[indx].pagePlanItemAreaDetailsList[i].areaAssignment.assignedElements.length;

    this.addToSelectionArray(pItemid, indx, pAreaid, i, assigmentIndex, ind, event);

    if (currentPublication._selectedElem.length == 1) {
      currentPublication._showProperties = 'element';
      currentPublication._selectedElement = currentPublication._pubItems[indx].pagePlanItemAreaDetailsList[i].areaAssignment.assignedElements[ind];
    } else {
      currentPublication._showProperties = 'stackbasket';
      currentPublication._selectedElement = null;
      currentPublication.previewBuilderStatus = false;
    }

    let pIndex, aIndex, eIndex = "-1";
    let variablesResult: any = {};
    if (this.utilsService.isPresent(currentPublication._respondata.publication.pages)) {
      pIndex = currentPublication._respondata.publication.pages.map((el) => el.id).indexOf(pItemid);
      if (pIndex != "-1") {
        aIndex = currentPublication._respondata.publication.pages[pIndex].pagePlanItemAreaDetailsList.map((el) => el.id).indexOf(pAreaid);
        if (currentPublication._respondata.publication.pages[pIndex].pagePlanItemAreaDetailsList[aIndex].areaAssignment.assignedElements != null) {
          eIndex = currentPublication._respondata.publication.pages[pIndex].pagePlanItemAreaDetailsList[aIndex].areaAssignment.assignedElements.map((el) => el.assigmentIndex).indexOf(assigmentIndex);
        }
      }
    }
    if (currentPublication._selectedElem.length == 1) {
      currentPublication.previewBuilderStatus = true;
      if (this.reqVariable) {
        this.reqVariable.unsubscribe();
      }
      if (eIndex != "-1") {
        let currPub = currentPublication._respondata.publication;
        if ((currentPublication._selectedElem[0].pageId != pItemid) && (currentPublication._selectedElem[0].areaId != pAreaid) && (currentPublication._selectedElem[0].assigmentIndex != assigmentIndex)) {
          return;
        }
        if (currentPublication._selectedElement && currentPublication._selectedElement.template && currentPublication._selectedElement.template.variableCollection && currentPublication._selectedElement.template.variableCollection.length > 0 && currentPublication._selectedElement.template.variableCollection[0].values) {
          if (this.loaderStatus) {
            currentPublication.previewBuilderStatus = false;
          } else {
            this.loaderStatus = true;
          }
          variablesResult.pIndex = indx;
          variablesResult.elemLen = elemLen;
          variablesResult.result = currentPublication._selectedElement.template.variableCollection;
          variablesResult.publication = currentPublication._respondata.publication.id;
          variablesResult.project = currentPublication._respondata.publication.project;
          variablesResult.masterPageId = currentPublication._respondata.publication.pages[indx].pageDetails.pageId;
          variablesResult.dataElementIndex = eIndex;
          variablesResult.areaId = pAreaid;
          variablesResult.assignmentIndex = assigmentIndex;
          variablesResult.pageId = pItemid;
          variablesResult.pageIds = null;
          currentPublication._elemVariables = variablesResult;
          this.ibUtilsService.updateSelectedOrDefaultValueforVector(currentPublication._elemVariables.result);
        } else {
          this.reqVariable = this.builderService.getVariables(currPub.project, currPub.id, currPub.pages[indx].id, currPub.pages[indx].pageDetails.pageId, pAreaid, assigmentIndex, ind).subscribe((response) => {
            if (this.loaderStatus) {
              currentPublication.previewBuilderStatus = false;
            } else {
              this.loaderStatus = true;
            }
            if (response.code == 100) {
              response.variablesResult.pIndex = indx;
              response.variablesResult.elemLen = elemLen;

              currentPublication._elemVariables = response.variablesResult;
              this.ibUtilsService.updateSelectedOrDefaultValueforVector(currentPublication._elemVariables.result);
            } else {
              this.ibUtilsService.showIBErrors(response);
            }
            this.cd.detectChanges();
          });
        }
      } else {
        let currPage = currentPublication._pubItems[indx];
        if ((currentPublication._selectedElem[0].pageId != pItemid) && (currentPublication._selectedElem[0].areaId != pAreaid) && (currentPublication._selectedElem[0].elemIndx != ind)) {
          return;
        }
        if (currentPublication._selectedElement && currentPublication._selectedElement.template && currentPublication._selectedElement.template.variableCollection && currentPublication._selectedElement.template.variableCollection.length > 0 && currentPublication._selectedElement.template.variableCollection[0].values) {
          if (this.loaderStatus) {
            currentPublication.previewBuilderStatus = false;
          } else {
            this.loaderStatus = true;
          }
          variablesResult.pIndex = indx;
          variablesResult.elemLen = elemLen;
          variablesResult.result = currentPublication._selectedElement.template.variableCollection;
          variablesResult.publication = currentPublication._respondata.publication.id;
          variablesResult.project = currentPublication._respondata.publication.project;
          variablesResult.masterPageId = currPage.pageDetails.pageId;
          variablesResult.dataElementIndex = eIndex;
          variablesResult.areaId = pAreaid;
          variablesResult.assignmentIndex = assigmentIndex;
          variablesResult.pageId = pItemid;
          variablesResult.pageIds = null;
          currentPublication._elemVariables = variablesResult;
          this.ibUtilsService.updateSelectedOrDefaultValueforVector(currentPublication._elemVariables.result);
        } else {
          let aelem = currPage.pagePlanItemAreaDetailsList[i].areaAssignment.assignedElements;
          this.reqVariable = this.builderService.getDefaultVariables(currPage.project, currPage.publication, currPage.pageDetails.pageId, pAreaid, ind, aelem[ind].template.name, aelem[ind].linkDataValue).subscribe((response) => {
            if (this.loaderStatus) {
              currentPublication.previewBuilderStatus = false;
              this.cd.detectChanges();
            } else {
              this.loaderStatus = true;
            }
            if (response.code == 100) {
              response.variablesResult.pIndex = indx;
              response.variablesResult.elemLen = elemLen;
              if (!this.utilsService.isPresent(response.variablesResult.pageId) && this.utilsService.isPresent(currPage.id)) {
                response.variablesResult.pageId = currPage.id;
              }
              if (!this.utilsService.isPresent(response.variablesResult.areaId)) {
                response.variablesResult.areaId = pAreaid;
              }
              if (ind) {
                response.variablesResult.dataElementIndex = ind;
              }
              currentPublication._elemVariables = response.variablesResult;
              this.ibUtilsService.updateSelectedOrDefaultValueforVector(currentPublication._elemVariables.result);
            } else {
              this.ibUtilsService.showIBErrors(response);
            }
          });
        }
      }
    }
    else {
      if (this.loaderStatus) {
        currentPublication.previewBuilderStatus = false;
        this.cd.detectChanges();
      } else {
        this.loaderStatus = true;
      }
    }
    let currentPageArea = currentPublication._pubItems[indx].pagePlanItemAreaDetailsList[i];
    let currentPageAreaElement = currentPageArea.areaAssignment.assignedElements[ind];
    this.indexedDBService.getProject(currentPublication._respondata.publication.project, (currentProjectdto) => {
      if (currentPageAreaElement.linkedImageExists) {
        currentPublication.previewBuilderStatus = true;
        this.getElementImage(currentPublication, currentProjectdto, currentPageArea.areaAssignment.stackId, currentPageAreaElement, currentPageAreaElement.template.name, "Currentlink");
      } else {
        if (currentPublication._previewSubscribe && !currentPublication._previewSubscribe.closed) {
          currentPublication._previewSubscribe.unsubscribe();
        }
        currentPublication._imageArray = "";
        currentPublication._image = "";
        if (this.loaderStatus) {
          currentPublication.previewBuilderStatus = false;
          this.cd.detectChanges();
        } else {
          this.loaderStatus = true;
        }
      }
    });
  }

  getElementImage(currentPublication, currentProjectdto, stackId, currentPageAreaElement, templateId, currentlink?) {
    let dataID = "";
    if (this.utilsService.isPresent(currentlink)) {
      dataID = currentPageAreaElement.linkDataValue;
    } else {
      dataID = currentPageAreaElement.id;
    }
    if (!this.utilsService.isPresent(currentProjectdto._stackElementPreview[stackId])) {
      currentProjectdto._stackElementPreview[stackId] = [];
    }
    if (this.utilsService.isPresent(currentProjectdto._stackElementPreview[stackId]) && Object.keys(currentProjectdto._stackElementPreview[stackId]).length != 0) {
      for (let tempStackPreview of currentProjectdto._stackElementPreview[stackId]) {
        if (tempStackPreview.id == dataID && tempStackPreview.displayValue == currentPageAreaElement.displayValue) {
          if (this.utilsService.isPresent(tempStackPreview)) {
            let currentDateTimeInMiliSecs = new Date().getTime();
            if (!this.utilsService.isPresent(tempStackPreview.metaDataRefreshHours)) {
              tempStackPreview.metaDataRefreshHours = 0;
            }
            let dataRefreshInMiliSecs = tempStackPreview.metaDataRefreshHours * (60000 * 60);
            if ((currentDateTimeInMiliSecs - tempStackPreview.timeUpdated) < dataRefreshInMiliSecs) {
              currentPublication._imageArray = tempStackPreview.images;
              currentPublication._displayImageArray = tempStackPreview.images;
              currentPublication.selectedImage = this.ibUtilsService.getMainImageMapping(stackId, dataID);
              if (this.utilsService.isPresent(currentlink)) {
                if (this.loaderStatus) {
                  currentPublication.previewBuilderStatus = false;
                } else {
                  this.loaderStatus = true;
                }
              } else {
                currentPublication.previewBuilderStatus = false;
              }
              this.cd.detectChanges();
              return;
            }
          }
        }
      }
    }

    if (currentPublication._previewSubscribe && !currentPublication._previewSubscribe.closed) {
      currentPublication._previewSubscribe.unsubscribe();
    }
    currentPublication._previewSubscribe = this.elementselectionService.getDisplayedImageForStackElement(currentPublication._respondata.publication.project, stackId, templateId, dataID
    ).subscribe((response) => {
      if (this.utilsService.isPresent(currentlink)) {
        if (this.loaderStatus) {
          currentPublication.previewBuilderStatus = false;
        } else {
          this.loaderStatus = true;
        }
      } else {
        currentPublication.previewBuilderStatus = false;
      }
      if (response.code == 100) {
        if (this.utilsService.isPresent(currentProjectdto._stackElementPreview[stackId]) && Object.keys(currentProjectdto._stackElementPreview[stackId]).length != 0) {
          for (let tempStackPreview of currentProjectdto._stackElementPreview[stackId]) {
            if (tempStackPreview.id == dataID && tempStackPreview.displayValue == currentPageAreaElement.displayValue) {
              // tempStackPreview = Object.assign(tempStackPreview, response.StackElementPreviewResult.quickPreviewImageData);
              currentPublication._imageArray = response.StackElementPreviewResult.quickPreviewImageData.images;
              currentPublication._displayImageArray = response.StackElementPreviewResult.quickPreviewImageData.images;
              this.cd.detectChanges();
              return;
            }
          }
        }

        let tempStackPreview = response.StackElementPreviewResult.quickPreviewImageData.images;
        tempStackPreview.id = dataID;
        tempStackPreview.displayValue = currentPageAreaElement.displayValue;
        currentProjectdto._stackElementPreview[stackId].push(tempStackPreview);
        let objProjectdtoService = new ProjectdtoService();
        objProjectdtoService._stackElementPreview = currentProjectdto._stackElementPreview;
        this.indexedDBService.addUpdateProject(currentProjectdto.name, objProjectdtoService, () => { });
        currentPublication.selectedImage = this.ibUtilsService.getMainImageMapping(stackId, dataID);
        currentPublication._imageArray = tempStackPreview;
        currentPublication._displayImageArray = tempStackPreview;
      } else {
        currentPublication._imageArray = [];
        this.ibUtilsService.showIBErrors(response);
      }
      this.cd.detectChanges();
    });
  }

  propertiesToggle() {
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._showProperties == 'stackbasket') {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._showProperties = 'element';
    } else {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._showProperties = 'stackbasket';
    }
  }

  addItemSelection(indx, event, type) {
    let selectionArray;
    let pageId = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[indx].id;
    if (type == "page") {
      selectionArray = this.utilsService.deepCopy(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedPages);
    }
    if (selectionArray.indexOf(pageId) == -1) {
      if (event) {
        if (!event.ctrlKey && !event.metaKey) {
          selectionArray = [];
        }
      }
      selectionArray.push(pageId);
    } else {
      if (event) {
        if (event.ctrlKey || event.metaKey) {
          selectionArray.splice(selectionArray.indexOf(pageId), 1);
        } else {
          if (selectionArray.length > 1) {
            selectionArray = [];
            selectionArray.push(pageId);
          } else {
            selectionArray = [];
          }
        }
      }
    }
    if (type == "page") {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedPages = this.utilsService.deepCopy(selectionArray);
    }
    let firstPage = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedPages[0];
    let selectedArray = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedPages;
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].firstSelectedPageIndex = selectedArray.indexOf(firstPage);

    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].selectedPubPage = indx;
  }

  showPageProperties(indx, event?) {
    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];


    currentPublication._selectedArea = {};
    currentPublication._selectedElem = [];
    currentPublication._selectedBuilderStackRows = [];
    currentPublication._selectedBuilderBucketRows = [];

    currentPublication.previewBuilderStatus = true;
    this.cd.detectChanges();
    currentPublication._selectedElem = [];
    if (event) {
      this.addItemSelection(indx, event, 'page');
    }
    currentPublication._selectedPages.length == 1 ? currentPublication._showProperties = 'page' : currentPublication._showProperties = 'stackbasket';
    if (currentPublication._selectedPages.length == 1) {
      currentPublication._mainPubIndex = currentPublication._mainPubItems.map((el) => el.id).indexOf(currentPublication._selectedPages[0]);
      let currPub = currentPublication._respondata.publication;
      if ((currPub.pages != null) && (currPub.pages[indx])) {
        this.builderService.getVariables(currPub.project, currPub.id, currPub.pages[indx].id, currPub.pages[indx].pageDetails.pageId, "", "", "").subscribe((response) => {
          currentPublication.previewBuilderStatus = false;
          if (response.code == 100) {
            currentPublication._pageVariables = response.variablesResult.result;
            this.ibUtilsService.updateSelectedOrDefaultValueforVector(currentPublication._pageVariables);
          } else {
            this.ibUtilsService.showIBErrors(response);
          }
          this.cd.detectChanges();
        });
      } else if (currPub.pages != null) {
        let currPage = currentPublication._pubItems[indx];
        if (currPage != null) {
          this.builderService.getDefaultVariables(currPub.project, currPub.id, currPage.pageDetails.pageId, "", "", "", "").subscribe((response) => {
            currentPublication.previewBuilderStatus = false;
            if (response.code == 100) {
              currentPublication._pageVariables = response.variablesResult.result;
              this.ibUtilsService.updateSelectedOrDefaultValueforVector(currentPublication._pageVariables);
            } else {
              this.ibUtilsService.showIBErrors(response);
            }
            this.cd.detectChanges();
          });
        }
      }
    }
    else {
      currentPublication.previewBuilderStatus = false;
      this.cd.detectChanges();
    }
    this.showSelectedPageNumbers();
  }

  getPagesToPreview() {
    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    /* Checking if preview is of selected pages or of all pages and removing the pages which are in preview state currently. */
    let pagesToPreview = [];
    if (currentPublication._selectedPages.length == 0) {
      for (let i = 0; i < currentPublication._pubItems.length; i++) {
        if (!currentPublication._pubItems[i]._type) {
          if ((!currentPublication._pubItems[i].toggleOverFlowPage) && (currentPublication._pubItems[i]._show)) {
            /* checks if overflow pages are hidden */
            this.addOverFlowPAges(i);
          }
          currentPublication._pubItems[i]._preview = true;
          pagesToPreview.push(currentPublication._pubItems[i]);
        }
      }
    } else {
      for (let page of currentPublication._selectedPages) {
        let index = currentPublication._pubItems.findIndex(x => x.id === page);
        if (!currentPublication._pubItems[index]._type) {
          currentPublication._pubItems[index]._preview = true;
          pagesToPreview.push(currentPublication._pubItems[index]);
        }
      }
    }
    if (pagesToPreview.length == 0) {
      this.ibUtilsService.unPreviewPages(currentPublication);
    } else {
      this.builderService.updateCachedPreview(currentPublication, pagesToPreview);
    }
  }



  previewPage() {
    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    currentPublication.pagePreview = true;
    if (currentPublication._showProperties == 'area') {
      currentPublication._showProperties = 'stackbasket';
    }
    /*  For MPreview(Cover Page Image) Removal on preview */
    if (currentPublication._selectedPages.length != 0) {
      for (let pageIndx of currentPublication._selectedPages) {
        let index = currentPublication._pubItems.findIndex(x => x.id === pageIndx);
        currentPublication._pubItems[index]._mPreview = false;
      }
    } else {
      for (let page of currentPublication._pubItems) {
        page._mPreview = false;
      }
      currentPublication._mPreviewAll = false;
    }

    this.getPagesToPreview();
  }

  checkAndConvert() {
    let activePublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    let _selPages = [];
    let _selPageIds = [];
    let _conversionInprogressIds = [];
    let convertCount: boolean = false;
    let multipleSelectionInProgress: boolean = false;

    for (let selectedPage of activePublication._selectedPages) {
      let index = activePublication._pubItems.findIndex(item => item.id === selectedPage);
      if (this.utilsService.isPresent(activePublication._pubItems[index].type) && activePublication._pubItems[index].type == this.constantsService.INBETWEEN && activePublication._pubItems[index].type != "CONVERTING" && this.matchMasterPages(activePublication._pubItems[index].pageDetails.pageId)) {
        let pubPageIndex = activePublication._pubItems.map((el) => el.id).indexOf(activePublication._pubItems[index].id);
        let mainPageIndex = activePublication._mainPubItems.map((el) => el.id).indexOf(activePublication._pubItems[index].id);
        if (!this.utilsService.isPresent(activePublication._httpQueue[activePublication._selectedBuilderLanguage])) {
          activePublication._httpQueue[activePublication._selectedBuilderLanguage] = [];
        }
        if (this.utilsService.isPresent(activePublication._pubItems[index]._type)) {
          this.ibUtilsService.removeOverFlowPages(activePublication);
          activePublication._pubItems[pubPageIndex] = this.utilsService.deepCopy(activePublication._mainPubItems[mainPageIndex]);
          _selPages.push(activePublication._pubItems[pubPageIndex]);
        } else {
          _selPages.push(activePublication._pubItems[index]);
        }
        activePublication._httpQueue[activePublication._selectedBuilderLanguage][activePublication._pubItems[pubPageIndex].id] = "Convert";
        activePublication._pubItems[index].type = "CONVERTING";
        activePublication._pubItems[index]._preview = true;
      }
      else if (this.utilsService.isPresent(activePublication._pubItems[index].type) && activePublication._pubItems[index].type != "CONVERTING" && this.matchMasterPages(activePublication._pubItems[index].pageDetails.pageId)) {
        _selPageIds.push(activePublication._pubItems[index].id);
      }
      else if (this.utilsService.isPresent(activePublication._pubItems[index].type) && this.matchStaticPages(activePublication._pubItems[index].pageDetails.pageId)) {
        if (this.checkIbConversionInProgress()) {
          multipleSelectionInProgress = true;
          this.utilsService.notificationWithTranslation("CONVERT_STATIC_PAGES", "", 3500);
        }
        else {
          multipleSelectionInProgress = false;
          this.utilsService.notificationWithTranslation("CONVERT_STATIC_PAGES", "", 3500);
        }

      }
      else if (activePublication._pubItems[index].type == "CONVERTING") {
        _conversionInprogressIds.push(activePublication._pubItems[index].pageDetails.pageId);
      }
    }
    _selPageIds = _selPageIds.filter((x, i, a) => a.indexOf(x) == i);

    if (_selPages.length != 0) {
      this.builderService.processQueue(activePublication);
    }

    if (_conversionInprogressIds.length != 0 && multipleSelectionInProgress == false) {
      let str = _conversionInprogressIds.join(", ");
      _conversionInprogressIds = [];
      _conversionInprogressIds.push(str);
      this.utilsService.notificationWithTranslation("CONVERSION_IN_PROGRESS", _conversionInprogressIds, 3500);
    }

    if (_conversionInprogressIds.length != 0 && multipleSelectionInProgress == true) {
      let str = _conversionInprogressIds.join(", ");
      _conversionInprogressIds = [];
      _conversionInprogressIds.push(str);
      this.utilsService.notificationWithTranslation("MULTIPLE_SELECTION_IN_PROGRESS", _conversionInprogressIds, 4500);
    }

    if (_selPageIds.length != 0) {
      let dialogRef = this.dialog.open(DialogPopup);
      dialogRef.componentInstance.userQuery = "CONVERSION_OF_INDESIGN_PAGE_TO_IB";
      dialogRef.componentInstance.dialogName = "CONVERT";
      dialogRef.afterClosed().subscribe(result => {
        this.selectedOption = result;
        if (this.selectedOption == '1') {
          for (let selPage of _selPageIds) {
            let mPageIndx = activePublication._mainPubItems.map((el) => el.id).indexOf(selPage);
            if (mPageIndx != -1) {
              this.ibUtilsService.getMasterPagesDB(activePublication, (masterPages) => {
                for (let masterPage of masterPages) {
                  if (masterPage.id == activePublication._mainPubItems[mPageIndx].pageDetails.pageId) {
                    this.convertToInBetweenPage(activePublication._mainPubItems[mPageIndx], activePublication);
                  }
                }
              });
            }
          }
        }
      });
    }
  }

  matchMasterPages(selectedMasterPage) {
    let exists = false;
    let activePublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    let materPages = this.ibUtilsService.getMasterPagesDBHTML(activePublication);
    materPages.map((item) => {
      if (item.id == selectedMasterPage) {
        exists = true;
      }
    });
    return exists;
  }

  matchStaticPages(selectedStaticPage) {
    let exists = false;
    let activePublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    let staticPages = this.ibUtilsService.getStaticPagesDBHTML(activePublication);
    staticPages.map((item) => {
      if (item.id == selectedStaticPage) {
        exists = true;
      }
    });
    return exists;
  }

  checkIbConversionInProgress() {
    let multipleSelection = false;
    let activePublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    let selectedPages = activePublication._selectedPages;
    selectedPages.map((item) => {
      let index = activePublication._pubItems.findIndex(x => x.id === item);
      if (activePublication._pubItems[index].type == "CONVERTING") {
        multipleSelection = true;
      }
    });
    return multipleSelection;
  }

  convertToInBetweenPage(page, activePublication) {
    activePublication._isChange = true;
    page.type = this.constantsService.INBETWEEN;
    page._preview = false;
    let pageIndex = activePublication._pubItems.map((el) => el.id).indexOf(page.id);
    for (let i = activePublication._pubItems.length - 1; i >= 0; i--) {
      if (activePublication._pubItems[i].id == page.id) {
        activePublication._pubItems.splice(i, 1)
      }
    }
    activePublication._pubItems.splice(pageIndex, 0, this.utilsService.deepCopy(page));
    this.updatePubitems();
    this.cd.detectChanges();
  }

  checkPageStart(i) {
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._respondata.publication.doublePage) {
      let k = this.getStartPage();
      if ((i + k) % 2 == 0) {
        return "dPageLeft";
      } else {
        return "dPageRight";
      }
    } else {
      return "sPage";
    }
  }

  toggleSearchStack() {
    this.isOpenStack = !this.isOpenStack;
  }

  clearSearchStack() {
    this.isOpenStack = !this.isOpenStack;
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].searchQueryStack = "";
  }

  toggleSearchBasket() {
    this.isOpenBasket = !this.isOpenBasket;
  }

  clearSearchBasket() {
    this.isOpenBasket = !this.isOpenBasket;
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].searchQueryBuilderBasket = "";
  }

  moveElementToArea($event: any) {
    this.darFlag = 0;
    let tarId;
    if ($event.mouseEvent.target.id) {
      tarId = $event.mouseEvent.target.id;
    } else {
      tarId = $event.mouseEvent.target.offsetParent.id;
    }
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._isChange = true;
    // FAR CAR DAR SAR
    let elementsData = [];
    for (let elem of this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedElem) {
      elementsData.push(this.utilsService.deepCopy(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[elem.pgIndx].pagePlanItemAreaDetailsList[elem.araIndx].areaAssignment.assignedElements[elem.elemIndx]));
    }
    if ((this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedElem.findIndex(item => item.pgIndx === $event.dragData.pIndx) == -1) ||
      (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedElem.findIndex(item => item.araIndx === $event.dragData.aIndx) == -1) ||
      (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedElem.findIndex(item => item.elemIndx === $event.dragData.eIndx) == -1)) {
      elementsData = [];
      elementsData.push($event.dragData.data);
    }
    if (tarId.split('_')[2].split('.')[0] == "CAR") {
      let params = [];
      this.utilsService.notificationWithTranslation("DROP_NOT_ALLOWED_CONTINUE_AREA", params);
    } else if (tarId.split('_')[2].split('.')[0] == "SAR") {
      let params = [];
      this.utilsService.notificationWithTranslation("DROP_NOT_ALLOWED_STATIC_AREA", params);
    } else {
      let mainPubItemNo = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mainPubItems.map((el) => el.id).indexOf(tarId.split('_')[0]);
      for (let tarData of elementsData) {
        this.addElementToArea(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[tarId.split('_')[1]].pagePlanItemAreaDetailsList, tarData, tarId, $event.dragData.stackId, $event.dragData);
      }
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mainPubItems[mainPubItemNo].pagePlanItemAreaDetailsList = this.utilsService.deepCopy(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[tarId.split('_')[1]].pagePlanItemAreaDetailsList);
    }
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedElem = [];
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._showProperties = "stackbasket";
  }

  onBucketElementDrop($event: any) {
    this.darFlag = 0;
    let slectedElements: any, tarId;
    if (!this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._bucketToggle) {
      slectedElements = this.utilsService.deepCopy(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedBuilderStackRows);
    } else {
      slectedElements = this.utilsService.deepCopy(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedBuilderBucketRows);
    }
    if ($event.mouseEvent.target.id) {
      tarId = $event.mouseEvent.target.id;
    } else {
      tarId = $event.mouseEvent.target.offsetParent.id;
    }

    let indexOfSelectedBucketRow = slectedElements.map((el) => el.id).indexOf($event.dragData.data.id);
    if (indexOfSelectedBucketRow === -1) {
      slectedElements = [];
      slectedElements.push($event.dragData.data);
    }
    for (let elem of slectedElements) {
      this.buildElement(elem, tarId);
    }
  }

  buildElement(dragData, tarId) {
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._isChange = true;
    // FAR CAR DAR SAR
    let tarData = {
      assigmentIndex: "",
      dataSubType: dragData.dataSubType,
      dataType: dragData.dataType,
      displayImage: dragData.displayImage,
      displayValue: dragData.displayValue,
      linkDataValue: dragData.id,
      filters: dragData.filters,
      linkedImageExists: dragData.linkedImageExists,
      productState: dragData.productState,
      productStateColorCode: dragData.productStateColorCode,
      productStateDisplayValue: dragData.productStateDisplayValue,
      productStateValid: dragData.productStateValid,
      template: { name: dragData.templateName, variableCollection: null },
      variableStatus: null
    }

    if (this.utilsService.isPresent(tarId.split('_')[2])) {
      if (this.utilsService.isPresent(tarId.split('_')[2].split('.')[0])) {
        if (tarId.split('_')[2].split('.')[0] == "CAR") {
          let params = [];
          this.utilsService.notificationWithTranslation("DROP_NOT_ALLOWED_CONTINUE_AREA", params);
        } else if (tarId.split('_')[2].split('.')[0] == "SAR") {
          let params = [];
          this.utilsService.notificationWithTranslation("DROP_NOT_ALLOWED_STATIC_AREA", params);
        } else {
          let mainPubItemNo = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mainPubItems.map((el) => el.id).indexOf(tarId.split('_')[0]);
          this.addElementToArea(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[tarId.split('_')[1]].pagePlanItemAreaDetailsList, tarData, tarId, dragData.stackId, dragData);
          this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mainPubItems[mainPubItemNo].pagePlanItemAreaDetailsList = this.utilsService.deepCopy(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[tarId.split('_')[1]].pagePlanItemAreaDetailsList);
        }
      }
    }
  }

  addElementToArea(pubItemArea, tarData, tarId, stackId, dragData) {
    let areaType = tarId.split('_')[2].split('.')[0];
    for (let areaI = 0; areaI < pubItemArea.length; areaI++) {
      if (pubItemArea[areaI].id == tarId.split('_')[2]) {
        if (areaType == "DAR" && this.darFlag == 0) {
          if (pubItemArea[areaI].areaAssignment.stackId == stackId) {
            if (dragData.dropType == "areaChange") {
              let elmInd = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[dragData.pIndx].pagePlanItemAreaDetailsList[dragData.aIndx].areaAssignment.assignedElements.map((el) => el.assigmentIndex).indexOf(tarData.assigmentIndex);
              this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[dragData.pIndx].pagePlanItemAreaDetailsList[dragData.aIndx].areaAssignment.assignedElements.splice(elmInd, 1);
              this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mainPubItems[dragData.pIndx].pagePlanItemAreaDetailsList[dragData.aIndx].areaAssignment.assignedElements.splice(elmInd, 1);
              this.ibUtilsService.removePreviewedPages(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[dragData.pIndx].id);
            }
            pubItemArea[areaI].areaAssignment.assignedElements = [];
            pubItemArea[areaI].areaAssignment.stackId = stackId;
            tarData.assigmentIndex = "A" + pubItemArea[areaI].areaAssignment.assignedElements.length;
            pubItemArea[areaI].areaAssignment.assignedElements.push(tarData);
            this.ibUtilsService.removePreviewedPages(tarId.split('_')[0]);
            this.darFlag = 1;
            return;
          } else {
            let params = [];
            let stackName = this.ibUtilsService.getStackNameFromProjectDTO(stackId, this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._respondata.publication.project);
            params.push(stackName);
            this.utilsService.notificationWithTranslation("ITEM_DROPPED_DOES_NOT_BELONG_TO_STACK_AREA_MAPPED_TO", params);
            return;
          }
        } else if (areaType == "DAR" && this.darFlag == 1) {
          this.utilsService.notificationWithTranslation("ONLY_ONE_ELEMENT_CAN_BE_DROPPED", '');
        }
        if (areaType == "FAR") {
          if (pubItemArea[areaI].areaAssignment.assignedElements == null) {
            pubItemArea[areaI].areaAssignment.assignedElements = [];
          }
          if (pubItemArea[areaI].areaAssignment.assignedElements.length == 0) {
            pubItemArea[areaI].areaAssignment.stackId = stackId;
          }
          if (pubItemArea[areaI].areaAssignment.stackId == stackId) {
            if (dragData.dropType == "areaChange") {
              let elmInd = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[dragData.pIndx].pagePlanItemAreaDetailsList[dragData.aIndx].areaAssignment.assignedElements.map((el) => el.assigmentIndex).indexOf(tarData.assigmentIndex);
              this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[dragData.pIndx].pagePlanItemAreaDetailsList[dragData.aIndx].areaAssignment.assignedElements.splice(elmInd, 1);
              this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mainPubItems[dragData.pIndx].pagePlanItemAreaDetailsList[dragData.aIndx].areaAssignment.assignedElements.splice(elmInd, 1);
              this.ibUtilsService.removePreviewedPages(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[dragData.pIndx].id);
            }
            tarData.assigmentIndex = "A" + pubItemArea[areaI].areaAssignment.assignedElements.length;
            pubItemArea[areaI].areaAssignment.assignedElements.push(tarData);
          } else {
            let params = [];
            let stackName = this.ibUtilsService.getStackNameFromProjectDTO(stackId, this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._respondata.publication.project);
            params.push(stackName);
            this.utilsService.notificationWithTranslation("ITEM_DROPPED_DOES_NOT_BELONG_TO_STACK_AREA_MAPPED_TO", params);
          }
        }
      }
    }
    this.ibUtilsService.removePreviewedPages(tarId.split('_')[0]);
  }

  sortDrop($event) {
    if ($event.data) {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mainPubItems[this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mainPubItems.map((el) => el.id).indexOf($event.data)].pagePlanItemAreaDetailsList = this.utilsService.deepCopy(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems.map((el) => el.id).indexOf($event.data)].pagePlanItemAreaDetailsList);
      this.ibUtilsService.removePreviewedPages($event.data);
    }
  }

  ondragStart($event) {
    this.pageDragged = false;
  }

  removeElements(pgId, pg, ara, ele) {
    // event.stopPropagation();
    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    /* To show change done in project */
    currentPublication._isChange = true;
    /* Remove From Main Array */
    currentPublication._pubItems[pg].pagePlanItemAreaDetailsList[ara].areaAssignment.assignedElements.splice(ele, 1);
    /* Get Index of Copy of Main Array based on page id to remove element from Copy of Main Array */
    let mainPubItemNo = currentPublication._mainPubItems.map((el) => el.id).indexOf(pgId);
    /* Remove From Copy of Main Array */
    currentPublication._mainPubItems[mainPubItemNo].pagePlanItemAreaDetailsList[ara].areaAssignment.assignedElements.splice(ele, 1);
    /* Remove _previewPages based on pageId */
    this.ibUtilsService.removePreviewedPages(pgId);
    event.stopPropagation();
    /* Remove Elements from selection array if present */
    if (currentPublication._selectedElem.length == 1) {
      if (currentPublication._selectedElem[0].pgIndx == pg && currentPublication._selectedElem[0].araIndx == ara && currentPublication._selectedElem[0].elemIndx == ele) {
        currentPublication._selectedElem = [];
        currentPublication._showProperties = "stackbasket";
      }
    }
  }

  reorderPage($event: any) {
    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    let tarIndx = -1, sorIndx = null, tarCopyIndx = null, pgId = null;
    if (this.utilsService.isObjNotEmpty($event.mouseEvent.path)) {
      for (let path of $event.mouseEvent.path) {
        if (this.utilsService.isPresent(path.id)) {
          pgId = path.id.split('_')[0];
          break;
        }
      }
    } else {
      if (this.utilsService.isPresent($event.mouseEvent.target.id)) {
        if ($event.mouseEvent.target.id != "playArea") {
          pgId = $event.mouseEvent.target.id.split('_')[0];
        }
      } else {
        if ($event.mouseEvent.target.offsetParent.id != "playArea") {
          pgId = $event.mouseEvent.target.offsetParent.id.split('_')[0];
        }
      }
    }
    tarIndx = currentPublication._pubItems.map((el) => el.id).lastIndexOf(pgId);
    tarCopyIndx = currentPublication._mainPubItems.map((el) => el.id).lastIndexOf(pgId);
    if (tarIndx != -1) {
      this.ibUtilsService.removeOverFlowPages(currentPublication);
      let sorIndex = currentPublication._pubItems.map((el) => el.id).indexOf($event.dragData.data);
      let sorCopyIndex = currentPublication._mainPubItems.map((el) => el.id).indexOf($event.dragData.data);
      if (sorIndex != -1) {
        let movedPage = currentPublication._pubItems[sorIndex];
        let movedCopyPage = currentPublication._mainPubItems[sorCopyIndex];
        currentPublication._pubItems.splice(sorIndex, 1);
        currentPublication._mainPubItems.splice(sorCopyIndex, 1);
        currentPublication._pubItems.splice(tarCopyIndx, 0, movedPage);
        currentPublication._mainPubItems.splice(tarCopyIndx, 0, movedCopyPage);
      }
    }
  }

  showDroppedData($event: any) {
    if (this.utilsService.isPresent($event.dragData)) {
      if (this.utilsService.isPresent($event.dragData.dropType)) {
        if ($event.dragData.dropType == "stackelement") {
          this.onBucketElementDrop($event);
        } else if ($event.dragData.dropType == "reorder") {
          this.reorderPage($event);
        } else if ($event.dragData.dropType == "areaChange") {
          this.pageDragged = true;
          this.moveElementToArea($event);
        } else {
          this.onMasterPageDrop($event, 'Drag');
        }
      }
    }
  }

  onMasterPageDrop($event: any, callType?) {
    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    currentPublication._isChange = true;
    if (!this.utilsService.isPresent($event.dragData)) {
      return;
    }
    if ($event.dragData.dropType == "importStaticPages") {
      this.addStaticPageImportedToPlayArea = true;
      this.addStaticPageImportedToPlayAreaEvent = $event;
      this.onClickImportStaticPages();
      return;
    }
    for (let i = 0; i < this.qty_val; i++) {
      let pNo = this.getPageNo();
      let pageObject = {
        alternatePage: "", countryVersion: [null], editableInWebClient: true,
        externalTdclPage: [null], firstPageAreasStatus: 0, firstPageStatus: 0,
        hasOverFlowPage: false, id: "PGS." + pNo, countryDependent: false,
        maximum: $event.dragData.data.maximum, minimum: $event.dragData.data.minimum,
        pageDetails: { hasOverflowPage: "0", masterPagePosition: "any", orientation: $event.dragData.data.orientation, overflowPagePosition: "any", pageId: $event.dragData.data.id, pageNumber: "0", pageOccurence: "1 - 1", pageSize: $event.dragData.data.size, useRight: $event.dragData.data.useRight },
        pageName: null, pageNumber: null, pagePlanItemAreaDetailsList: $event.dragData.data.areas,
        pageStatus: null, parentId: "", postProcess: $event.dragData.data.postProcess,
        postProcessPriority: $event.dragData.data.postProcessPriority,
        project: currentPublication._respondata.publication.project, publication: currentPublication._respondata.publication.id,
        renameStylesIfConflict: $event.dragData.data.renameStylesIfConflict,
        staticPage: false, staticPageStatus: null, status: 0, type: $event.dragData.data.type,
        unlimited: $event.dragData.data.unlimited, variables: null, _preview: false, _mPreview: false, _mPreviewUri: null
      }
      let _mainPubItemIndx = null;
      let _pubItemIndx = null;

      if ($event.dragData.data.type != this.constantsService.INBETWEEN) {
        if (this.utilsService.isPresent($event.dragData.data._staticPreview) && this.utilsService.isPresent($event.dragData.data._staticPreview[currentPublication._selectedBuilderLanguage])) {

          let previewObj = {
            fileName: null, fileData: null, downloadURL: null, project: pageObject.project, pageId: pageObject.id, jobId: null, html5Preview: false, areaId: null, pageIds: null, generationStatus: null, templateBoundsList: null, contentFromXMPParsing: false, publication: pageObject.publication, progress: 0, step: 0, stepCount: 5, masterPageId: null, previewImage: $event.dragData.data._staticPreview[currentPublication._selectedBuilderLanguage]
          }
          if (!this.utilsService.isPresent(currentPublication._previewedPages[currentPublication._selectedBuilderLanguage])) {
            currentPublication._previewedPages[currentPublication._selectedBuilderLanguage] = [];
          }
          currentPublication._previewedPages[currentPublication._selectedBuilderLanguage].push(previewObj);

        }
      }

      if (this.utilsService.isObjNotEmpty($event.mouseEvent.path)) {
        for (let path of $event.mouseEvent.path) {
          if (this.utilsService.isPresent(path.id)) {
            if (path.id != "playArea") {
              let pageScope = path.id.split('_')[0];
              _mainPubItemIndx = currentPublication._mainPubItems.map((el) => el.id).indexOf(pageScope);
              _pubItemIndx = currentPublication._pubItems.map((el) => el.id).indexOf(pageScope);
            }
            break;
          }
        }
      } else {
        if ($event.mouseEvent.target.id) {
          if ($event.mouseEvent.target.id != "playArea") {
            let pageScope = $event.mouseEvent.target.id.split('_')[0];
            _mainPubItemIndx = currentPublication._mainPubItems.map((el) => el.id).indexOf(pageScope);
            _pubItemIndx = currentPublication._pubItems.map((el) => el.id).indexOf(pageScope);
          }
        } else {
          if ($event.mouseEvent.target.offsetParent.id != "playArea" && $event.mouseEvent.target.offsetParent.id != "") {
            let pageScope = $event.mouseEvent.target.offsetParent.id.split('_')[0];
            _mainPubItemIndx = currentPublication._mainPubItems.map((el) => el.id).indexOf(pageScope);
            _pubItemIndx = currentPublication._pubItems.map((el) => el.id).indexOf(pageScope);
          }
          if ($event.mouseEvent.target.offsetParent.id == "") {
            let pageScope = $event.mouseEvent.target.offsetParent.offsetParent.id.split('_')[0];
            _mainPubItemIndx = currentPublication._mainPubItems.map((el) => el.id).indexOf(pageScope);
            _pubItemIndx = currentPublication._pubItems.map((el) => el.id).indexOf(pageScope);
          }
        }
      }
      if (_mainPubItemIndx == -1) {
        this.builderService.addToPlayArea(currentPublication, pageObject, null, null, callType);
      } else {
        this.builderService.addToPlayArea(currentPublication, pageObject, _mainPubItemIndx, _pubItemIndx, callType);
      }
    }
    this.updatePubitems();
    this.qty_val = 1;
  }

  getPageNo() {
    let maxId: number = 0;
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mainPubItems.length == 0) {
      return 0;
    } else {
      for (let page of this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mainPubItems) {

        if (maxId < parseInt(page.id.split('.')[1])) {
          maxId = parseInt(page.id.split('.')[1]);
        }
      }
      return maxId + 1;
    }
  }

  addOverFlowPAges(arryindx) {
    if (arryindx != null) {
      let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
      if (currentPublication._pubItems[arryindx]._preview) {
        let prevIndex = currentPublication._previewedPages[currentPublication._selectedBuilderLanguage].map((el) => el.pageId).indexOf(currentPublication._pubItems[arryindx].id);
        this.builderService.updateResponseData(currentPublication._previewedPages[currentPublication._selectedBuilderLanguage][prevIndex]);
      } else {
        let count = 1;
        for (let _i = 0; _i < currentPublication._mainPubItems.length; _i++) {
          if (currentPublication._pubItems[arryindx].id != currentPublication._mainPubItems[_i].id) {
            if (currentPublication._pubItems[arryindx].parentId == currentPublication._mainPubItems[_i].parentId) {
              if ((currentPublication._mainPubItems[_i]._preview) && (this.sharedDataService.publicationList
              [this.sharedDataService.activePublicationIndex]._previewedPages[currentPublication._selectedBuilderLanguage])) {
                let prevIndex = this.sharedDataService.publicationList
                [this.sharedDataService.activePublicationIndex]._previewedPages[currentPublication._selectedBuilderLanguage].map((el) => el.pageId).indexOf(currentPublication._mainPubItems[_i].id);
                let k = arryindx + count;
                this.builderService.updateResponseData(currentPublication._previewedPages[currentPublication._selectedBuilderLanguage][prevIndex], k);
                count = count + currentPublication._previewedPages[currentPublication._selectedBuilderLanguage][prevIndex].previewImage.length - 1;
              } else {
                currentPublication._pubItems.splice(arryindx + count, 0, currentPublication._mainPubItems[_i]);
                currentPublication._pubItems[arryindx].toggleOverFlowPage = true;
              }
              count++;

            }
          }
        }
        if (this.utilsService.isPresent(currentPublication._pubItems[arryindx].toggleOverFlowPage)) {
          currentPublication._pubItems[arryindx].toggleOverFlowPage = true;
        }
      }
    }
    this.updatePubitems();
  }

  removePubItem(pageid, index) {
    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    if (currentPublication._pubItems[index].type != "CONVERTING") {
      currentPublication._isChange = true;
      if (currentPublication._selectedArea.pageIndex == index) {
        currentPublication._selectedArea = {};
        currentPublication._showProperties = 'stackbasket';
      }
      if (currentPublication._selectedPages.indexOf(pageid) != 1) {
        currentPublication._selectedPages.splice(currentPublication._selectedPages.indexOf(pageid), 1);
        currentPublication._showProperties = 'stackbasket';
      }
      if (this.utilsService.isPresent(currentPublication._pubItems[index].toggleOverFlowPage) && !currentPublication._pubItems[index].toggleOverFlowPage && this.utilsService.isPresent(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[index].parentId)) {
        this.removeGroupedDynamicPageScopes(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[index].parentId);
      }
      for (let _i = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems.length - 1; _i >= 0; _i--) {
        if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[_i].id == pageid) {
          this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems.splice(_i, 1);
        }
      }
      for (let _i = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mainPubItems.length - 1; _i >= 0; _i--) {
        if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mainPubItems[_i].id == pageid) {
          this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mainPubItems.splice(_i, 1);
        }
      }
      this.ibUtilsService.removePreviewedPages(pageid);
      this.updatePubitems();
    } else {
      this.utilsService.notificationWithTranslation("DELETE_NOT_ALLOWED", '');
    }
    this.updateSelectedPages(pageid);
  }

  updateSelectedPages(pageid) {
    if (this.utilsService.isPresent(pageid)) {
      let selectedPagesArrayIndex = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedPages.indexOf(pageid);
      if (selectedPagesArrayIndex != -1) {
        this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedPages.splice(selectedPagesArrayIndex, 1);
      }
    }
  }

  removeGroupedDynamicPageScopes(parentId) {
    this.removeDataFromArray(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems, "parentId", parentId);
    this.removeDataFromArray(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mainPubItems, "parentId", parentId);
  }

  /**
   * @param {any} DataArray from which elements need to be removed
   * @param {string} key in the array to which below value needs to match
   * @param {string} value to which element in the array need tp match
   * @returns Remove the matching elements in array for the given key with value
   */
  removeDataFromArray(dataArray, arrayKey, parentId) {
    for (let _i = dataArray.length - 1; _i >= 0; _i--) {
      if (dataArray[_i][arrayKey] == parentId) {
        dataArray.splice(_i, 1);
      }
    }
  }

  updatePubitems() {
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._respondata.publication.doublePage) {
      if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._respondata.publication.startOnLeftPage) {
        if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems.length % 2 == 0) {
          this.showDummyPage = false;
        } else {
          this.showDummyPage = true;
        }
      } else {
        if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems.length % 2 == 0) {
          this.showDummyPage = true;
        } else {
          this.showDummyPage = false;
        }
      }
    } else {
      this.showDummyPage = false;
    }
  }

  getStartPage() {
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._respondata.publication.startOnLeftPage) {
      return 0;
    } else {
      return 1;
    }
  }

  constructor(public deviceDetectorService: DeviceDetectorService, private cd: ChangeDetectorRef, public dialog: MatDialog, public sharedDataService: SharedDataService, public utilsService: UtilsService, private elementselectionService: ElementselectionService, public builderService: BuilderService, public viewContainerRef: ViewContainerRef, private elementRef: ElementRef, public constantsService: ConstantsService, public ibUtilsService: IbUtilsService, private projectService: ProjectService, private indexedDBService: IndexedDBService) {
    this.itemsPerRow = 2;
    this.interval = 50;
  }


  /**** Stack & Basket Code from Here On */
  @Input() searchQuery: string;
  addFilter: any;
  flag: number;
  public _previewSubscribe: any;
  presentId: any;
  loadStackElementConstant: number = 50;

  bucketViewToggle() {
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._bucketToggle) {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._bucketToggle = false;
    } else {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._bucketToggle = true;
    }
  }

  selectAllElementsFromBasketStack() {
    if (!this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._bucketToggle) {
      this.selectAllElementsFromStackTable();
    } else {
      this.selectAllElementsFromBasket();
    }
  }

  selectAllElementsFromStackTable() {
    let selectedBuilderStackRowsLength = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedBuilderStackRows.length;
    let _stacklist_tableLength = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._stacklist_table.length;
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._stackflag == 0 && selectedBuilderStackRowsLength == _stacklist_tableLength) {
      this.clearAllSelectedElementsFromStackTable()
    }
    else if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._stackflag == 0 || selectedBuilderStackRowsLength < _stacklist_tableLength) {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedBuilderStackRows = [];
      let selectRowsOnPage = 1;
      let selectPagination = 1;

      $('#stackpaginator1>mfBootstrapPaginator>mfpaginator>ul:nth-child(1)>li.active>a').each(function (element) {
        this.selectslot = this.innerHTML;
        selectPagination = +this.selectslot;
      });

      $('#stackpaginator1>mfBootstrapPaginator>mfpaginator>ul:nth-child(2)>li.active>a').each(function (element) {
        this.selectfew = this.innerHTML;
        selectRowsOnPage = +this.selectfew;
      });

      let currentPublicationObject = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
      let applyFilter = new FilterPipe();
      let searchFilter = new SearchPipe();
      let languageFilter = new LangStackFilterPipe();
      let stacklistFilter = applyFilter.transform(currentPublicationObject._stacklist_table, this.addFilter, currentPublicationObject._selectedFilter);
      let stacklistColumnFilter = [];
      if (currentPublicationObject.selectedStack && currentPublicationObject.selectedStack.logLanguageConfigured) {
        let languageFilterStackList = languageFilter.transform(stacklistFilter, currentPublicationObject._selectedBuilderLanguage, currentPublicationObject.selectedStack.logLanguageConfigured);
        stacklistColumnFilter = searchFilter.transform(languageFilterStackList, this.searchQuery, this.flag);
      } else {
        stacklistColumnFilter = searchFilter.transform(stacklistFilter, this.searchQuery, this.flag);
      }

      if (selectRowsOnPage == 1) {
        for (let i = 0; i < stacklistColumnFilter.length; i++) {
          this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedBuilderStackRows.push(stacklistColumnFilter[i]);

        }
      } else {
        for (let i = ((selectPagination * selectRowsOnPage) - selectRowsOnPage); i < selectRowsOnPage * selectPagination; i++) {
          if (i < this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._stacklist_table.length) {
            this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedBuilderStackRows.push(stacklistColumnFilter[i]);
          }
        }
      }

      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._stackflag = 1;
    } else {
      this.clearAllSelectedElementsFromStackTable();
    }
  }

  clearAllSelectedElementsFromStackTable() {
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedBuilderStackRows = [];
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._stackflag = 0;
  }

  selectAllElementsFromBasket() {
    let selectedBuilderBucketRowsLength = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedBuilderBucketRows.length;
    let _elementlist_tableLength = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._elementlist_table.length;
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._bucketflag == 0 && selectedBuilderBucketRowsLength == _elementlist_tableLength) {
      this.clearAllSelectedElementsFromBasket()
    }
    else if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._bucketflag == 0 || selectedBuilderBucketRowsLength < _elementlist_tableLength) {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedBuilderBucketRows = [];
      let selectRowsOnPageBasket = 1;
      let selectPaginationBasket = 1;

      $('#basketpaginator>mfBootstrapPaginator>mfpaginator>ul:nth-child(1)>li.active>a').each(function (element) {
        this.selectslot = this.innerHTML;
        selectPaginationBasket = +this.selectslot;
      });

      $('#basketpaginator>mfBootstrapPaginator>mfpaginator>ul:nth-child(2)>li.active>a').each(function (element) {
        this.selectfew = this.innerHTML;
        selectRowsOnPageBasket = +this.selectfew;
      });

      let searchFilter = new SearchPipe();
      let stacklistColumnFilter = searchFilter.transform(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._elementlist_table, this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].searchQueryBuilderBasket, this.flag);

      if (selectRowsOnPageBasket == 1) {
        for (let i = 0; i < stacklistColumnFilter.length; i++) {
          this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedBuilderBucketRows.push(stacklistColumnFilter[i]);
        }
      }
      else {
        for (let i = ((selectPaginationBasket * selectRowsOnPageBasket) - selectRowsOnPageBasket); i < selectRowsOnPageBasket * selectPaginationBasket; i++) {
          if (i < this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._elementlist_table.length) {
            this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedBuilderBucketRows.push(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._elementlist_table[i]);
          }
        }
      }
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._bucketflag = 1;
    } else {
      this.clearAllSelectedElementsFromBasket();
    }
  }

  clearAllSelectedElementsFromBasket() {
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedBuilderBucketRows = [];
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._bucketflag = 0;
  }

  checkIfBucketElementIsSelected(stack) {
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedBuilderBucketRows.map((el) => el.id).indexOf(stack.id) == -1) {
      return false;
    } else {
      return true;
    }
  }

  checkIfStackElementIsSelected(stack) {
    for (let stack1 in this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedBuilderStackRows) {
      this.flag = 0;
      let stackElementId = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedBuilderStackRows[stack1].id;
      if (stackElementId == stack.id) {
        return true;
      }
    }
    return false;
  }

  callGetElementImage($event) {
    this.getElementImage($event[0], $event[1], $event[2], $event[3], $event[4])
  }

  stackChanged(stack) {
    try {
      this.elementRef.nativeElement.querySelector('#StackTable').scrollLeft = 0;
    } catch (error) {
    }
    let currentPublicationObject = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    currentPublicationObject.dataStatus = true;
    this.cd.detectChanges();
    let isBuckElementSelected = 0;
    currentPublicationObject._stackListPageNumber = 1;
    currentPublicationObject._selectedStackFilter = "";
    currentPublicationObject._selectedBuilderStackRows = [];

    for (let key in currentPublicationObject._selectedBuilderBucketRows) {
      if ((currentPublicationObject._selectedBuilderBucketRows[key]['id'] == currentPublicationObject._selectedRow['id']) && (currentPublicationObject._selectedBuilderBucketRows[key]['displayValue'] == currentPublicationObject._selectedRow['displayValue'])) {
        isBuckElementSelected = 1;
      }
    }
    if (isBuckElementSelected == 0) {
      if (this._previewSubscribe) {
        this._previewSubscribe.unsubscribe();
      }
      currentPublicationObject._image = "";
      currentPublicationObject._displayImageArrayBasket = [];
      currentPublicationObject._displayImageArrayStack = [];
      // currentPublicationObject._defaultImageName = "default.jpg";
      currentPublicationObject._selectedRow = undefined;
      currentPublicationObject._selectedDisplayValue = "";
      currentPublicationObject._templateList = stack.templates;
      if (currentPublicationObject._templateList.indexOf("Quick_Preview") == -1) {
        currentPublicationObject._templateList.splice(0, 0, "Quick_Preview");
      }
      currentPublicationObject._isBuilderQuickPreview = true;
      currentPublicationObject._builderSelectedTemplate = "Quick_Preview"
    }
    this.ibUtilsService.getStacklistFromProjectDTODB(currentPublicationObject._respondata.publication.project, (stackList) => {
      let fullStack = this.ibUtilsService.getStackFromStacklist(stackList, stack);
      if ((fullStack.isStackLoaded) || (this.utilsService.isPresent(fullStack.stackElements)) && fullStack.stackElements.length > 0) {
        currentPublicationObject.dataStatus = false;
        currentPublicationObject._stacklist_table = fullStack.stackElements;
        currentPublicationObject._allSelectedStackFilters = fullStack.stackFilter;
        currentPublicationObject._stackSelectedFilters = [];
        this.addFilter = "";
        if (currentPublicationObject._stacklist_table.length < this.loadStackElementConstant) {
          currentPublicationObject._checkMoreStackElementsAvailable = true;
        } else {
          currentPublicationObject._checkMoreStackElementsAvailable = false;
          if (currentPublicationObject._rowsOnPageSetLocalValues.indexOf(currentPublicationObject._stacklist_table.length) === -1) {
            currentPublicationObject._rowsOnPageSetLocalValues.splice(currentPublicationObject._rowsOnPageSetLocalValues.length - 1, 1, currentPublicationObject._stacklist_table.length);
          }
        }
        currentPublicationObject._filterListObject = [];
        let _getFilters = new GetFiltersPipe();
        if (this.utilsService.isPresent(currentPublicationObject._stacklist_table[0])) {
          currentPublicationObject._filterListObject = _getFilters.transform(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedStack.filters, currentPublicationObject._filterNames, currentPublicationObject._filterListObject);
        }
        for (let i = 0; i < currentPublicationObject._filterListObject.length; i++) {
          if (currentPublicationObject._filterListObject[i].filterObj.type == 'checkbox') {
            currentPublicationObject._filterListObject[i]._isOpen = true;
          }
        }
        this.cd.detectChanges();
      } else {
        this.projectService.getStackByIdForGrid(currentPublicationObject._respondata.publication.project, stack.id, currentPublicationObject._selectedStackFilter.key, this.loadStackElementConstant, 0).subscribe(
          (response) => {
            currentPublicationObject.dataStatus = false;
            if (response.code == 100) {
              this.indexedDBService.updateAStackInProject(currentPublicationObject._respondata.publication.project, stack, response.stack, () => {
                this.ibUtilsService.getStacklistFromProjectDTODB(currentPublicationObject._respondata.publication.project, (stackList) => {
                  currentPublicationObject._selectedStack = this.ibUtilsService.getStackByStackId(stackList, currentPublicationObject._selectedStack.id);
                  currentPublicationObject._stacklist_table = response.stack.stackElements;
                  currentPublicationObject._allSelectedStackFilters = response.stack.stackFilter;
                  currentPublicationObject._selectedFilter = [];
                  this.addFilter = "";
                  if (currentPublicationObject._stacklist_table.length < this.loadStackElementConstant) {
                    currentPublicationObject._checkMoreStackElementsAvailable = true;
                  } else {
                    currentPublicationObject._checkMoreStackElementsAvailable = false;
                    if (currentPublicationObject._rowsOnPageSetLocalValues.indexOf(currentPublicationObject._stacklist_table.length) === -1) {
                      currentPublicationObject._rowsOnPageSetLocalValues.splice(currentPublicationObject._rowsOnPageSetLocalValues.length - 1, 1, currentPublicationObject._stacklist_table.length);
                    }
                  }
                  currentPublicationObject._filterListObject = [];
                  let _getFilters = new GetFiltersPipe();
                  if (this.utilsService.isPresent(currentPublicationObject._stacklist_table[0])) {
                    currentPublicationObject._filterListObject = _getFilters.transform(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedStack.filters, currentPublicationObject._filterNames, currentPublicationObject._filterListObject);
                  }
                  for (let i = 0; i < currentPublicationObject._filterListObject.length; i++) {
                    if (currentPublicationObject._filterListObject[i].filterObj.type == 'checkbox') {

                      currentPublicationObject._filterListObject[i]._isOpen = true;
                    }
                  }
                });
              });
            } else {
              currentPublicationObject.dataStatus = false;
              this.ibUtilsService.showIBErrors(response);
            }
            this.cd.detectChanges();
          })
      }
    });
  }

  stackFilterChanged(stack) {
    this.elementRef.nativeElement.querySelector('.divWidth').scrollLeft = 0;
    let isBuckElementSelected = 0;
    let currentPublicationObject = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    currentPublicationObject._stackListPageNumber = 1;
    currentPublicationObject._selectedBuilderStackRows = [];
    for (let key in currentPublicationObject._selectedBuilderBucketRows) {
      if ((currentPublicationObject._selectedBuilderBucketRows[key]['id'] == currentPublicationObject._selectedRow['id']) && (currentPublicationObject._selectedBuilderBucketRows[key]['displayValue'] == currentPublicationObject._selectedRow['displayValue'])) {
        isBuckElementSelected = 1;
      }
    }
    if (isBuckElementSelected == 0) {
      if (this._previewSubscribe) {
        this._previewSubscribe.unsubscribe();
      }
      currentPublicationObject._image = "";
      currentPublicationObject._defaultBuilderImageName = "default.jpg";
      currentPublicationObject._selectedRow = undefined;
      currentPublicationObject._selectedDisplayValue = "";
      currentPublicationObject._isBuilderQuickPreview = true;
      currentPublicationObject._builderSelectedTemplate = "Quick_Preview"
    }
    this.ibUtilsService.getStacklistFromProjectDTODB(currentPublicationObject._respondata.publication.project, (stackList) => {
      let stackElements = this.ibUtilsService.getStackFilterFromStacklist(stackList, stack, currentPublicationObject._selectedStackFilter.key);
      if ((this.utilsService.isPresent(stackElements)) && stackElements.length > 0) {
        currentPublicationObject._stacklist_table = stackElements;
        currentPublicationObject._selectedFilter = [];
        this.addFilter = "";
        if (currentPublicationObject._stacklist_table.length < this.loadStackElementConstant) {
          currentPublicationObject._checkMoreStackElementsAvailable = true;
        } else {
          currentPublicationObject._checkMoreStackElementsAvailable = false;
          if (currentPublicationObject._rowsOnPageSetLocalValues.indexOf(currentPublicationObject._stacklist_table.length) === -1) {
            currentPublicationObject._rowsOnPageSetLocalValues.splice(currentPublicationObject._rowsOnPageSetLocalValues.length - 1, 1, currentPublicationObject._stacklist_table.length);
          }
        }
        this.cd.detectChanges();
      } else {
        this.projectService.getStackByIdForGrid(currentPublicationObject._respondata.publication.project, stack.id, currentPublicationObject._selectedStackFilter.key, this.loadStackElementConstant, 0).subscribe(
          (response) => {
            if (response.code == 100) {
              this.indexedDBService.updateStackFilterInProject(currentPublicationObject._respondata.publication.project, stack, currentPublicationObject._selectedStackFilter.key, response.stack, () => {
                this.ibUtilsService.getStacklistFromProjectDTODB(currentPublicationObject._respondata.publication.project, (stackList) => {
                  currentPublicationObject._selectedStack = this.ibUtilsService.getStackByStackId(stackList, currentPublicationObject._selectedStack.id);
                });
              });
              currentPublicationObject._stacklist_table = response.stack.stackElements;
              currentPublicationObject._selectedFilter = [];
              this.addFilter = "";
              if (currentPublicationObject._stacklist_table.length < this.loadStackElementConstant) {
                currentPublicationObject._checkMoreStackElementsAvailable = true;
              } else {
                currentPublicationObject._checkMoreStackElementsAvailable = false;
                if (currentPublicationObject._rowsOnPageSetLocalValues.indexOf(currentPublicationObject._stacklist_table.length) === -1) {
                  currentPublicationObject._rowsOnPageSetLocalValues.splice(currentPublicationObject._rowsOnPageSetLocalValues.length - 1, 1, currentPublicationObject._stacklist_table.length);
                }
              }
            } else {
              this.ibUtilsService.showIBErrors(response);
            }
            this.cd.detectChanges();
          })
      }
      this.tableComponent.setTableColumnWidth();
    });
  }

  showSelectedPageNumbers() {
    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    let tempSelectectedPages = this.utilsService.deepCopy(currentPublication._selectedPages);
    let tempData: Array<number> = [];
    for (let i of tempSelectectedPages) {
      let index = currentPublication._pubItems.findIndex(item => item.id === i);
      if (currentPublication._pubItems[index]._length) {
        for (let j = 0; j < currentPublication._pubItems[index]._length; j++) {
          tempData.push(index + j);
        }
      }
      else {
        tempData.push(index);
      }
    }
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].selectedPubPages = tempData;
    tempData.sort((n1, n2) => n1 - n2);
    let currentSelectedPagesNumber = "";
    let pageNumberToAppend = 0;
    let tempNumber = 0;
    let endPageNumber = 0;
    let previousAppendedValue = 0;

    if (tempData.length > 0) {
      pageNumberToAppend = tempData[0];
      tempNumber = pageNumberToAppend + 1;
      previousAppendedValue = tempNumber;
      currentSelectedPagesNumber = currentSelectedPagesNumber + tempNumber;

      for (let i of tempData) {
        endPageNumber = 0;
        if (pageNumberToAppend == i) {
          endPageNumber = 1;
          pageNumberToAppend++;
        } else {
          if (pageNumberToAppend != previousAppendedValue) {
            previousAppendedValue = pageNumberToAppend;
            currentSelectedPagesNumber = currentSelectedPagesNumber + "-" + pageNumberToAppend;
          }
          pageNumberToAppend = i + 1;
          if (pageNumberToAppend != previousAppendedValue) {
            previousAppendedValue = pageNumberToAppend;
            currentSelectedPagesNumber = currentSelectedPagesNumber + "/" + pageNumberToAppend;
          }
        }
      }
      if (endPageNumber == 1) {
        if (pageNumberToAppend != previousAppendedValue) {
          currentSelectedPagesNumber = currentSelectedPagesNumber + "-" + pageNumberToAppend;
        }
      }
    }
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._currentSelectedPagesNumber = currentSelectedPagesNumber;
  }

  // onChangeOfPageVariable(selectedValue, variable, pageId) {
  //   let obj = {};
  //   obj['isSelected'] = true;
  //   if (variable.valueType == 'Boolean') {
  //     if (selectedValue) {
  //       obj['value'] = "1";
  //     } else {
  //       obj['value'] = "0";
  //     }
  //   } else {
  //     obj['value'] = selectedValue;
  //   }
  //   variable.selectedValues = [];
  //   variable.selectedValues.push(obj);
  //   let pageIndex = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems.map((el) => el.id).indexOf(pageId);

  //   this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._isChange = true;

  //   if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[pageIndex].variables != null) {
  //     // return;
  //   } else {
  //     this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[pageIndex].variables = [];
  //     this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mainPubItems[pageIndex].variables = [];
  //   }
  //   this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[pageIndex].variables.push(variable);
  //   this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._mainPubItems[pageIndex].variables.push(variable);
  // }

  alternativeTemplateResult = {};
  showAreaStack(pIndex, aIndex, pArea, event) {
    event.stopPropagation();
    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    currentPublication._selectedArea = {};
    currentPublication._selectedPages = [];
    currentPublication._selectedElem = [];
    currentPublication._selectedBuilderStackRows = [];
    currentPublication._selectedBuilderBucketRows = [];

    currentPublication._displayImageArray = [];
    currentPublication.selectedImage = "";

    currentPublication._image = "";
    currentPublication._isBuilderQuickPreview = false;
    currentPublication._selectedRow = "";
    this.loaderStatus = false;

    if ((pArea.type !== this.constantsService.STATIC_AREA) && (pArea.type !== this.constantsService.CONTINUE_AREA)) {
      currentPublication._selectedArea = { pageIndex: pIndex, areaIndex: aIndex, pageId: currentPublication._pubItems[pIndex].id, areaId: pArea.id, areaName: pArea.name };
      if (this.utilsService.isPresent(pArea.areaAssignment.stackId)) {
        this.builderService.getAlternativeTemplateList(currentPublication._respondata.publication.project, currentPublication._respondata.publication.id, currentPublication._pubItems[pIndex].id, pArea.id, currentPublication._pubItems[pIndex].pageDetails.pageId, "false").subscribe((response) => {
          if (response.code == this.constantsService.SUCCESS) {
            this.alternativeTemplateResult = Object.assign(response.alternativeTemplateResult, pArea);
            if (Object(response.alternativeTemplateResult.templateList).length > 1) {
              currentPublication._showProperties = "area";
            } else {
              currentPublication._showProperties = "stackbasket";
            }
          } else {
            this.ibUtilsService.showIBErrors(response);
          }
          this.cd.detectChanges();
        });

        if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._bucketToggle) {
          this.bucketViewToggle();
        }
        if (currentPublication._selectedStack.id != pArea.areaAssignment.stackId) {
          this.ibUtilsService.getStacklistFromProjectDTODB(currentPublication._respondata.publication.project, (stackList) => {
            currentPublication._selectedStack = this.ibUtilsService.getStackByStackId(stackList, pArea.areaAssignment.stackId);
            this.stackChanged(currentPublication._selectedStack);
          });
        }
      }
    }
    this.cd.detectChanges();
  }

  checkSelectedArea(pItemid, pAreaid) {
    let selectedArea = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedArea;
    if (this.utilsService.isPresent(selectedArea)) {
      if ((selectedArea.pageId == pItemid) && (selectedArea.areaId == pAreaid)) {
        return true;
      }
    }
  }

  deleteStaticMasterPage(filename) {
    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    this.builderService.deleteStaticMasterPage(currentPublication._respondata.publication.project, filename).subscribe((response) => {
      if (response.code == this.constantsService.SUCCESS) {
        this.indexedDBService.deletStaticPageInProject(currentPublication._respondata.publication.project, currentPublication._respondata.publication.masterPublication, filename, () => {
          this.sliderComponent.updateSliderState();
        });
        this.removeStaticPageScopesFromProject(this.getAllOpenPublicationsForProject(currentPublication._respondata.publication.project), filename)
      } else {
        this.ibUtilsService.showIBErrors(response);
      }
      this.sliderComponent.updateSliderState();
      this.cd.detectChanges();
    });
  }

  getAllOpenPublicationsForProject(project) {
    let openPublicationIndexes = [];
    for (let publicationIndex in this.sharedDataService.publicationList) {
      if (this.sharedDataService.publicationList[publicationIndex]._respondata.publication.project == project) {
        openPublicationIndexes.push(publicationIndex);
      }
    }
    return openPublicationIndexes;
  }

  removeStaticPageScopesFromProject(openPublicationIndexes, filename) {
    for (let publicationIndex of openPublicationIndexes) {
      if (openPublicationIndexes.length != 0) {
        for (let i = this.sharedDataService.publicationList[publicationIndex]._pubItems.length; i >= 0; i--) {
          if (this.sharedDataService.publicationList[publicationIndex]._pubItems[i] && this.sharedDataService.publicationList[publicationIndex]._pubItems[i].pageDetails.pageId == filename) {
            this.sharedDataService.publicationList[publicationIndex]._pubItems.splice(i, 1);
            this.sharedDataService.publicationList[publicationIndex]._isChange = true;
          }
        }
        for (let i = this.sharedDataService.publicationList[publicationIndex]._mainPubItems.length; i >= 0; i--) {
          if (this.sharedDataService.publicationList[publicationIndex]._mainPubItems[i] && this.sharedDataService.publicationList[publicationIndex]._mainPubItems[i].pageDetails.pageId == filename) {
            this.sharedDataService.publicationList[publicationIndex]._mainPubItems.splice(i, 1);
            this.sharedDataService.publicationList[publicationIndex]._isChange = true;
          }
        }
      }
    }
  }

}