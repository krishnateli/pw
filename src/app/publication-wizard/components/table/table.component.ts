import { Component, OnInit, Renderer2, ElementRef, ChangeDetectorRef, Output, Input, EventEmitter, ViewContainerRef } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

import { SharedDataService } from '../../../services/shared-data.service';
import { TranslateService } from '@ngx-translate/core';
import { UtilsService } from '../../../shared/services/utils.service';
import { IbUtilsService } from '../../../services/ib-utils.service';
import { ElementselectionService } from '../../pages/element-selection/elementselection.service';

import { SelectedColumnPipe } from '../../pipes/selectedcolumn.pipe';
import { SearchPipe } from '../../pipes/search.pipe';
import { GetFiltersPipe } from '../../pipes/get-filters.pipe';
import { CustomfilterPipe } from '../../pipes/customfilter.pipe';
import { CheckboxfilterPipe } from '../../pipes/checkboxfilter.pipe';
import { IndexedDBService } from '../../../db/indexeddb.service';
import { ProjectdtoService } from '../../../dto/projectdto.service';

import * as $ from 'jquery';
window["$"] = $;
window["jQuery"] = $;

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  start: any;
  pressed: boolean;
  startX: any;
  startWidth: any;
  addFilter: any;
  noOfStackElementsToDisplay: number = 50;
  scrollStackStep: number = 10;
  _divWidthStack: number;
  shiftSelectIndex: any;
  infinity: any = "empty";
  LatestIndex: any;
  flag: number;
  presentId: any;
  ifPresentFlag: boolean = false;
  isPresentIndex: any;
  draggedId: any;
  clickSort:boolean = false;

  constructor(private cd: ChangeDetectorRef, private ibUtilsService: IbUtilsService, public sharedDataService: SharedDataService, private router: Router, public renderer: Renderer2, private elementselectionService: ElementselectionService, private utilsService: UtilsService, private elementRef: ElementRef, private translateService: TranslateService, private snackbar: MatSnackBar, public viewContainerRef: ViewContainerRef, private indexedDBService: IndexedDBService) { }

  @Input() containerWidth;
  @Input() mainTable;

  @Input('tableType') tableType: string;

  _selectedRows: any[];
  @Input('selectedRows') set model1(selectedRows: any) {
    this._selectedRows = selectedRows;
  }
  get model1() {
    return this._selectedRows;
  }

  @Input() page: any;
  @Input() tableWidth: string;
  @Input() draggableColumn: boolean;
  @Input() searchQuery: any;
  @Input() searchQueryBasket: any;

  columnsInTable: any = [];


  ngOnInit() {
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].previewStatus = false;
    if (this.page == "builderBasket") {
      let currentPublicationObject = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
      currentPublicationObject._filterListObject = [];
      let _getFilters = new GetFiltersPipe();
      if (this.utilsService.isPresent(this.mainTable)) {
        for (let index = 0; index < this.mainTable.length; index++) {
          currentPublicationObject._filterListObject = _getFilters.transform(this.mainTable[index].filters, currentPublicationObject._filterNames, currentPublicationObject._filterListObject);
        }
      }
    }
  }

  columnSorter(n) {
    let table, rows, switching, i, x, y, shouldSwitch, dir, switchCount = 0;
    switching = true;
    this.clickSort = !this.clickSort
    dir = "asc";
    if(this.tableType == 'Stack'){
      if(this.tableWidth === 'small'){
        table = document.querySelector('.smallTable');
      }else{
        table = document.querySelector('.bigTable');
      } 
    }else{
      table = document.querySelector('.smallTable');
    }
    while (switching) {
      switching = false;
      rows = table.rows;
      for (i = 0; i < (rows.length - 1); i++) {
        shouldSwitch = false;
        x = rows[i].getElementsByTagName("TD")[n];
        y = rows[i + 1].getElementsByTagName("TD")[n];
        if (dir == 'asc') {
          if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
            shouldSwitch = true;
            break;
          }
        } else if (dir == 'desc') {
          if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
            shouldSwitch = true;
            break;
          }
        }
      }
      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        switchCount++;
      } else {
        if (switchCount == 0 && dir == 'asc') {
          dir = 'desc';
          switching = true;
        }
      }
    }
  }

  getColumns() {
    let _getColumnsData = new CustomfilterPipe();
    this.columnsInTable = _getColumnsData.transform(this.mainTable, this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._filterListObject, this.tableType)
  }

  setTableColumnWidth() {
    this.getColumns();
    let noOfColumns = this.columnsInTable.length + 2;
    if (this.containerWidth / noOfColumns < 200) {
      return 200;
    } else {
      return this.containerWidth / noOfColumns;
    }
  }

  onMouseDown(event) {
    this.start = event.target;
    this.pressed = true;
    this.startX = event.clientX;
    this.startWidth = $(this.start).parent().width();
    this.initResizableColumns(this.tableType);
  }

  private initResizableColumns(tableType) {
    this.renderer.listen('window', 'mousemove', (event) => {
      if (this.pressed) {
        let width = this.startWidth + (event.clientX - this.startX);
        $(this.start).parent().css({ 'min-width': width, 'max-width': width });
        let index = $(this.start).parent().index() + 1;
        if (tableType == 'Stack') {
          $('#StackTable .stacktable tr td:nth-child(' + index + ')').css({ 'min-width': width, 'max-width': width, 'width': width });
        }
        else {
          $('#BasketTable .stacktable tr td:nth-child(' + index + ')').css({ 'min-width': width, 'max-width': width, 'width': width });
        }
      }
    });
    this.renderer.listen('window', 'mouseup', (event) => {
      if (this.pressed) {
        let _lastColumnNo = this.columnsInTable.length + 2;
        this.pressed = false;
        if (this.containerWidth > this.elementRef.nativeElement.querySelector('#tableHead').scrollWidth) {
          let colWidth = 0;
          for (let i = 1; i < _lastColumnNo; i++) {
            colWidth += $('#tableBody tr td:nth-child(' + i + ')').width() + 20;
          }
          let increseWidth = this.containerWidth - colWidth;
          $('#tableBody tr td:nth-child(' + _lastColumnNo + ')').css({ 'min-width': increseWidth, 'max-width': increseWidth, 'width': increseWidth });
          $('#tableHead tr th:nth-child(' + _lastColumnNo + ')').css({ 'min-width': increseWidth, 'max-width': increseWidth, 'width': increseWidth });
        }
      }
    });
  }

  verticalStackScroll($event) {
    let target = $event.target || $event.srcElement;
    if (target) {
      if (target.offsetHeight < target.scrollHeight) {
        if ((target.offsetHeight + target.scrollTop) > target.scrollHeight - 100) {
          if (Object.keys(this.mainTable).length > this.noOfStackElementsToDisplay) {
            this.noOfStackElementsToDisplay += this.scrollStackStep;
          }
        }
      }
    }
  }

  getStackScrollValue() {
    if (this.mainTable.length > 0) {
      return -1 * this.elementRef.nativeElement.querySelector('.stacktable').scrollLeft;
    }
  }

  setStacklistRow(stack, event, elementSelected?) {
    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    this.shiftSelectIndex = this.infinity;
    this.LatestIndex = this.infinity;
    currentPublication._eBasketCheckPointClick = {};
    currentPublication.previewStatus = true;
    currentPublication._isQuickPreview = true;
    currentPublication._selectedBucketRows = [];
    let idSelectedStack = stack.id
    currentPublication._elementImage = "";
    currentPublication._displayImageArray = [];
    currentPublication._defaultImageName = "default.jpg";
    currentPublication._selectedTemplate = "Quick_Preview";
    currentPublication._isQuickPreview = true;

    for (let key in this.mainTable) {
      this.presentId = this.mainTable[key].id;
      if (idSelectedStack === this.presentId) {
        currentPublication._elementSelectedRow = this.mainTable[key];
      }
    }

    if (event.shiftKey) {
      currentPublication._shiftStack = stack;

      let columnPipeFilter = new SelectedColumnPipe();
      let checkBoxFilter = new CheckboxfilterPipe();
      let searchFilter = new SearchPipe();
      let stacklistFilter = checkBoxFilter.transform(this.mainTable, currentPublication._elementSelectedFilters, this.addFilter, this.addFilter, this.addFilter);
      let searchFilterarray = searchFilter.transform(stacklistFilter, this.searchQuery, this.flag);
      let stacklistColumnFilter = columnPipeFilter.transform(searchFilterarray);
      // let stacklistColumnFilter = columnPipeFilter.transform(this.mainTable);
      for (let index = 0; index < stacklistColumnFilter.length; index++) {
        if (stacklistColumnFilter[index].id == currentPublication._shiftStack.id) {
          this.shiftSelectIndex = index;
          break;
        }
      }
      for (let index = 0; index < stacklistColumnFilter.length; index++) {
        if (stacklistColumnFilter[index].id == currentPublication._eStacklistCheckPointClick.id) {
          this.LatestIndex = index;
          break;
        }
      }
      let smallIndex = this.shiftSelectIndex;
      if (this.LatestIndex < smallIndex) {
        smallIndex = this.LatestIndex;
      }
      this._selectedRows = [];
      if (smallIndex != this.infinity) {
        for (let k = 0; k <= (Math.abs(this.LatestIndex - this.shiftSelectIndex)); k++) {
          if (this._selectedRows.indexOf(this.mainTable[k + smallIndex]) === -1) {
            this._selectedRows.push(this.mainTable[k + smallIndex]);
          } else {
            this._selectedRows.splice(this._selectedRows.indexOf(this.mainTable[k + smallIndex]), 1);
          }
        }
      }
    }

    else if (event.ctrlKey || event.metaKey) {
      for (let z = 0; z < this._selectedRows.length; z++) {
        if (this._selectedRows[z].id == stack.id) {
          this.ifPresentFlag = true;
          this.isPresentIndex = z;
        }
      }

      if (this.ifPresentFlag) {
        this.ifPresentFlag = false;
        this._selectedRows.splice(this.isPresentIndex, 1);

      } else {
        this._selectedRows.push(stack);
        currentPublication._eStacklistCheckPointClick = stack;
      }
    }

    else {
      this._selectedRows = [];
      this._selectedRows.push(stack);
      currentPublication._eStacklistCheckPointClick = this._selectedRows[0];
    }

    if (this.tableType == "Stack") {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedBucketRows = [];
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedStackRows = this._selectedRows;
    } else if (this.tableType == "Basket") {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedStackRows = [];
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedBucketRows = this._selectedRows;
    }
    if (elementSelected) {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedBucketRows = this._selectedRows;
    }
    if (this._selectedRows.length == 1) {
      currentPublication._elementSelectedRow = stack;
      currentPublication._ElementSelectedDisplayValue = currentPublication._elementSelectedRow.displayValue;
      this.indexedDBService.getProject(currentPublication._respondata.publication.project, (currentProjectdto) => {
        if (currentPublication._elementSelectedRow.linkedImageExists) {
          if (currentPublication._previewSubscribe) {
            currentPublication._previewSubscribe.unsubscribe();
          }
          this.getElementImage(currentPublication, currentProjectdto, currentPublication._elementSelectedRow.stackId, currentPublication._elementSelectedRow, currentPublication._elementSelectedRow.templateIdFromRule);
        } else {
          if (currentPublication._previewSubscribe) {
            currentPublication._previewSubscribe.unsubscribe();
          }
          if (!this.utilsService.isPresent(currentPublication._elementSelectedRow.dataType)) {
            this.utilsService.notificationWithTranslation('BASKET_ELEMENT_NOT_EXISTS', [currentPublication._elementSelectedRow.id]);
          }
          currentPublication.previewStatus = false;
          currentPublication._defaultImageName = "default.jpg";
        }
        currentPublication._templateList = currentPublication._selectedStack.templates;
        if (currentPublication._templateList.indexOf("Quick_Preview") == -1) {
          currentPublication._templateList.splice(0, 0, "Quick_Preview");
        }
      });
    } else {
      currentPublication.previewStatus = false;
      currentPublication._elementSelectedRow = undefined;
      currentPublication._ElementSelectedDisplayValue = "";
      currentPublication._displayImageArray = [];
      currentPublication._defaultImageName = "default.jpg";
    }
  }

  setbuilderRow(stack, event) {
    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    currentPublication.multipleFlag = false;
    currentPublication.previewStatus = true;
    this.cd.detectChanges();

    this.shiftSelectIndex = this.infinity;
    this.LatestIndex = this.infinity;
    currentPublication._selectedPages = [];
    currentPublication._selectedElem = [];
    currentPublication._selectedBuilderBucketRows = [];
    currentPublication._isBuilderQuickPreview = true;

    currentPublication._bBasketCheckPointClick = {};
    currentPublication._showProperties = 'stackbasket';

    let idSelectedStack = stack.id
    currentPublication._image = "";
    currentPublication._defaultBuilderImageName = "default.jpg";
    currentPublication._builderSelectedTemplate = "Quick_Preview";
    if (this.tableType == "Stack") {
      for (let key in currentPublication._stacklist_table) {
        this.presentId = currentPublication._stacklist_table[key].id;
        if (idSelectedStack === this.presentId) {
          currentPublication._selectedRow = currentPublication._stacklist_table[key];
        }
      }
    }

    if (event.shiftKey) {
      currentPublication._shiftStack = stack;
      let columnPipeFilter = new SelectedColumnPipe();
      let applyFilter = new CheckboxfilterPipe();
      let searchFilter = new SearchPipe();
      let stacklistFilter = applyFilter.transform(currentPublication._stacklist_table, currentPublication._stackSelectedFilters, this.addFilter, this.addFilter, this.addFilter);
      let searchFilterarray = searchFilter.transform(stacklistFilter, this.searchQuery, this.flag);
      let stacklistColumnFilter = columnPipeFilter.transform(searchFilterarray);

      for (let i = 0; i < stacklistColumnFilter.length; i++) {
        if (stacklistColumnFilter[i].id == currentPublication._shiftStack.id) {
          this.shiftSelectIndex = i;
        }
        if (stacklistColumnFilter[i].id == currentPublication._bStacklistCheckPointClick.id) {
          this.LatestIndex = i;
        }
      }

      let smallIndex = this.shiftSelectIndex;
      if (this.LatestIndex < smallIndex) {
        smallIndex = this.LatestIndex;
      }

      this._selectedRows = [];
      if (smallIndex != this.infinity) {
        for (let k = 0; k <= (Math.abs(this.LatestIndex - this.shiftSelectIndex)); k++) {
          if (this._selectedRows.indexOf(this.mainTable[k + smallIndex]) === -1) {
            this._selectedRows.push(this.mainTable[k + smallIndex]);
          } else {
            this._selectedRows.splice(this._selectedRows.indexOf(this.mainTable[k + smallIndex]), 1);
          }
        }
      }

    }

    else if (event.ctrlKey || event.metaKey) {
      for (let z = 0; z < this._selectedRows.length; z++) {
        if (this._selectedRows[z].id == stack.id) {
          this.ifPresentFlag = true;
          this.isPresentIndex = z;
        }
      }

      if (this.ifPresentFlag) {
        this.ifPresentFlag = false;
        this._selectedRows.splice(this.isPresentIndex, 1);

      } else {
        this._selectedRows.push(stack);
        currentPublication._bStacklistCheckPointClick = stack;
      }
    }

    else {
      this._selectedRows = [];
      this._selectedRows.push(stack);
      currentPublication._bStacklistCheckPointClick = this._selectedRows[0];

    }

    if (this.tableType == "Stack") {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedBuilderStackRows = this._selectedRows;
    } else if (this.tableType == "Basket") {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedBuilderBucketRows = this._selectedRows;
      currentPublication._selectedRow = this._selectedRows[0];
    }

    if (this._selectedRows.length == 1) {
      currentPublication._selectedDisplayValue = currentPublication._selectedRow.displayValue;
      this.indexedDBService.getProject(currentPublication._respondata.publication.project, (currentProjectdto) => {
        if (currentPublication._selectedRow.linkedImageExists) {
          if (currentPublication._previewSubscribe) {
            currentPublication._previewSubscribe.unsubscribe();
          }
          this.getElementImage(currentPublication, currentProjectdto, currentPublication._selectedRow.stackId, currentPublication._selectedRow, currentPublication._selectedRow.templateIdFromRule);
        } else {
          if (currentPublication._previewSubscribe) {
            currentPublication._previewSubscribe.unsubscribe();
          }
          currentPublication.previewStatus = false;
          currentPublication._displayImageArray = [];
          currentPublication._defaultBuilderImageName = "default.jpg";
          this.cd.detectChanges();
        }
        currentPublication._templateList = currentPublication._selectedStack.templates;
        if (currentPublication._templateList.indexOf("Quick_Preview") == -1) {
          currentPublication._templateList.splice(0, 0, "Quick_Preview");
        }
      });
    } else {
      currentPublication.previewStatus = false;
      currentPublication._selectedRow = undefined;
      currentPublication._selectedDisplayValue = "";
      currentPublication._imageArray = [];
      currentPublication._defaultBuilderImageName = "default.jpg";
      this.cd.detectChanges();
    }
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
      for (let tempStackElem of currentProjectdto._stackElementPreview[stackId]) {
        if (tempStackElem.id == dataID && tempStackElem.displayValue == currentPageAreaElement.displayValue) {
          if (this.utilsService.isPresent(tempStackElem)) {
            let currentDateTimeInMiliSecs = new Date().getTime();
            let dataRefreshInMiliSecs = tempStackElem.metaDataRefreshHours * (60000 * 60);
            if ((currentDateTimeInMiliSecs - tempStackElem.timeUpdated) < dataRefreshInMiliSecs) {
              currentPublication._displayImageArray = tempStackElem.images;
              currentPublication.selectedImage = this.ibUtilsService.getMainImageMapping(stackId, dataID);
              if (currentPublication.selectedImage == "") {
                currentPublication.selectedImage = currentPublication._displayImageArray[0].imageId;
              }
              if (this.utilsService.isPresent(currentlink)) {
                if (currentPublication._loaderStatus) {
                  currentPublication.previewStatus = false;
                } else {
                  currentPublication._loaderStatus = true;
                }
              } else {
                currentPublication.previewStatus = false;
              }
              this.ibUtilsService.detectChangesInBuilderPage();
              return;
            }
          }
        }
      }
    }
    if (currentPublication._previewSubscribe) {
      currentPublication._previewSubscribe.unsubscribe();
    }
    currentPublication._previewSubscribe = this.elementselectionService.getDisplayedImageForStackElement(currentPublication._respondata.publication.project, stackId, templateId, dataID
    ).subscribe((response) => {
      if (this.utilsService.isPresent(currentlink)) {
        if (currentPublication._loaderStatus) {
          currentPublication.previewStatus = false;
        } else {
          currentPublication._loaderStatus = true;
        }
      } else {
        currentPublication.previewStatus = false;
      }
      if (response.code == 100) {
        if (this.utilsService.isPresent(currentProjectdto._stackElementPreview[stackId]) && Object.keys(currentProjectdto._stackElementPreview[stackId]).length != 0) {
          for (let tempStackElem of currentProjectdto._stackElementPreview[stackId]) {
            if (tempStackElem.id == dataID && tempStackElem.displayValue == currentPageAreaElement.displayValue) {
              tempStackElem = Object.assign(tempStackElem, response.StackElementPreviewResult.quickPreviewImageData);
              currentPublication._displayImageArray = response.StackElementPreviewResult.quickPreviewImageData.images;
              currentPublication.selectedImage = this.ibUtilsService.getMainImageMapping(stackId, dataID);
              if (currentPublication.selectedImage == "") {
                currentPublication.selectedImage = currentPublication._displayImageArray[0].imageId;
              }
            }
          }
        }
        let tempStackElem = response.StackElementPreviewResult.quickPreviewImageData;
        tempStackElem.id = dataID;
        tempStackElem.displayValue = currentPageAreaElement.displayValue;
        currentProjectdto._stackElementPreview[stackId].push(tempStackElem);
        let objProjectdtoService = new ProjectdtoService();
        objProjectdtoService._stackElementPreview = currentProjectdto._stackElementPreview;
        this.indexedDBService.addUpdateProject(currentProjectdto.name, objProjectdtoService, () => { });
        currentPublication._displayImageArray = tempStackElem.images;
        currentPublication.selectedImage = this.ibUtilsService.getMainImageMapping(stackId, dataID);
        if (currentPublication.selectedImage == "") {
          currentPublication.selectedImage = currentPublication._displayImageArray[0].imageId;
        }
      } else {
        currentPublication._elementImage = "";
        currentPublication._displayImageArray = [];
        this.ibUtilsService.showIBErrors(response);
      }
      this.ibUtilsService.detectChangesInBuilderPage();
    });
  }

  checkIfStackElementIsSelected(stack, tableType) {
    let tableSelectStyle = {
      'background-color': this.sharedDataService._Customization.tableSelection.bgColor,
      'color': this.sharedDataService._Customization.tableSelection.color
    }
    let tableInheritStyle = {
      'background-color': 'inherit',
      'color': 'inherit'
    }
    if (this._selectedRows.length > 0) {
      for (let stack1 in this._selectedRows) {
        this.flag = 0;
        let stackElementId = this._selectedRows[stack1].id;
        if (stackElementId === stack.id) {
          return tableSelectStyle;
        }
      }
    }
    return tableInheritStyle;
  }


  onElementDrop($event: any) {
    if ((this.page != "Element") || (this.page == "Element" && this.tableType == "Stack")) {
      return;
    }
    this.flag = 0;
    let checkDragRange = 0;

    this.draggedId = $event['dragData'].id;

    for (let stack1 in this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedStackRows) {
      let stackElementId = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedStackRows[stack1].id;
      if (stackElementId == this.draggedId) {
        checkDragRange = 1;
      }
    }
    if (checkDragRange == 1) {
      this.addStackElementsTobasket();
    } else {
      for (let key in this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._elementlist_table) {
        this.presentId = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._elementlist_table[key].id;
        if (this.draggedId === this.presentId) {
          this.flag = 1;
        }
      }
      if (this.flag === 0) {

        for (let key in this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._stacklist_table) {
          this.presentId = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._stacklist_table[key].id;
          if (this.draggedId === this.presentId) {
            this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._isChange = true;
            this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._elementlist_table.push(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._stacklist_table[key]);
          }
        }
      }
      else {
        this.utilsService.notificationWithTranslation('STACK_ELEMENT_ALREADY_EXIST_IN_BASKET');
      }
    }
    this.setStacklistRow($event.dragData, $event);
  }


  addStackElementsTobasket() {
    //this.setBasketColumnWidth(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._elementlist_table);
    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].previewStatus = false;
    if (currentPublication._previewSubscribe) {
      currentPublication._previewSubscribe.unsubscribe();
    }
    var totalStacksInBucketCount = 0;
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedStackRows.length != 0) {
      for (let stack1 in this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedStackRows) {
        this.flag = 0;
        let stackElementId = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedStackRows[stack1].id;
        for (let stack2 in this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._elementlist_table) {
          let basketElementId = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._elementlist_table[stack2].id;
          if (stackElementId == basketElementId) {
            totalStacksInBucketCount++;
            this.flag = 1;
          }
        }
        if (this.flag === 0) {
          for (let key in this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._stacklist_table) {
            this.presentId = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._stacklist_table[key].id;
            if (stackElementId === this.presentId) {
              this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._isChange = true;
              this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._elementlist_table.push(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._stacklist_table[key]);
            }
          }
        } else {
          if (totalStacksInBucketCount === this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedStackRows.length) {
            this.utilsService.notificationWithTranslation('STACK_ELEMENT_ALREADY_EXIST_IN_BASKET');
          }
        }
      }
    } else {
      this.utilsService.notificationWithTranslation('PLEASE_SELECT_A_STACK_ELEMENT');
    }
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedStackRows = [];
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._stackflag = 0;
    var isBuckElementSelected = 0;
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._elementSelectedRow != undefined) {
      for (let key in this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedBucketRows) {
        if ((this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedBucketRows[key]['id'] == this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._elementSelectedRow['id']) && (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedBucketRows[key]['displayValue'] == this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._elementSelectedRow['displayValue'])) {
          isBuckElementSelected = 1;
        }
      }
    }
    if (isBuckElementSelected == 0) {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._elementImage = "";
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._defaultImageName = "default.jpg";
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._elementSelectedRow = undefined;
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._ElementSelectedDisplayValue = "";
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._displayImageArray = [];
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._isQuickPreview = true;
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedTemplate = "Quick_Preview"
    }
  }

  checkIfElementAddedtopage(element) {
    let elementPages = [];
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedPages.length != 0) {
      for (let indx of this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedPages) {
        let index = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems.findIndex(x => x.id=== indx);
        if (this.utilsService.isPresent(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[index])) {
          elementPages.push(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems[index]);
        }
      }
    } else {
      elementPages = this.utilsService.deepCopy(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._pubItems);
    }
    if (((this.page == 'builderBasket') && (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._elementlist_table.length != 0)) || ((this.page == 'builderStack') && (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._stacklist_table.length != 0))) {
      for (let page of elementPages) {
        if (!this.utilsService.isPresent(page._type)) {
          if ((this.utilsService.isPresent(page.pagePlanItemAreaDetailsList))) {
            for (let pItem of page.pagePlanItemAreaDetailsList) {
              if (pItem.areaAssignment.assignedElements != null) {
                for (let ele of pItem.areaAssignment.assignedElements) {
                  if ((ele.linkDataValue == element.id) && (ele.displayValue == element.displayValue)) {
                    return true;
                  }
                }
              }
            }
          }
        }
      }
    }
    return false;
  }

}



