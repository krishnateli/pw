import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, HostListener, HostBinding, ViewContainerRef } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { SharedDataService } from '../../../services/shared-data.service';
import { UtilsService } from '../../../shared/services/utils.service';
import { ElementselectionService } from './elementselection.service';

import { SelectedColumnPipe } from '../../pipes/selectedcolumn.pipe';
import { CheckboxfilterPipe } from '../../pipes/checkboxfilter.pipe';
import { SearchPipe } from '../../pipes/search.pipe';
import { GetFiltersPipe } from '../../pipes/get-filters.pipe';
import { CustomfilterPipe } from '../../pipes/customfilter.pipe';

import { FilterComponent } from '../../components/filter/filter.component';
import { TableComponent } from '../../components/table/table.component';
import { ConstantsService } from '../../../services/constants.service'
import { IbUtilsService } from '../../../services/ib-utils.service';
import { ProjectService } from '../../../services/project.service';
import { IndexedDBService } from '../../../db/indexeddb.service';

import { HttpService } from '../../services/http.service';
import { ProjectdtoService } from '../../../dto/projectdto.service';

import * as $ from 'jquery';
window["$"] = $;
window["jQuery"] = $;

@Component({
  selector: 'app-element-selection',
  templateUrl: './element-selection.component.html',
  styleUrls: ['./element-selection.component.scss']
})
export class ElementSelectionComponent implements OnInit, AfterViewInit {

  @ViewChild(TableComponent) tableComponent: TableComponent;

  addFilter: any;
  addTextFilter: any;
  addCheckboxFilter: any;
  filterValue: any;
  draggedObject: any;
  presentId: any;
  flag: number;
  pressedBasket: boolean;
  selected_filter: any;
  loadStackElementConstant: number = 0;
  isOpen: boolean;
  isOpenBasket: boolean;
  searchQuery: any;
  searchQueryBasket: any;
  searchQuery1: any;
  addCheckFilter: any;
  change: any = 0;
  startBasket: any;
  startXBasket: any;
  startWidthBasket: any;
  _filterListObject: any = [];
  previewStatus: boolean;
  selectedRowsCount: any;
  tableBodyWidth: number;
  tableBodyWidthBasket: number;
  _divWidthBasket: number
  _divWidthStack: number;
  noOfStackElementsToDisplay: number = 50;
  scrollBasketStep: number = 10;
  noOfBasketElementsToDisplay: number = 50;
  offsetTableWidth: number;

  public _previewSubscribe: any;

  constructor(public sharedDataService: SharedDataService, private elementRef: ElementRef, private router: Router, private elementselectionService: ElementselectionService, private snackbar: MatSnackBar, public viewContainerRef: ViewContainerRef, private utilsService: UtilsService, private constantsService: ConstantsService, private ibUtilsService: IbUtilsService, private projectService: ProjectService, private indexedDBService: IndexedDBService, private httpService: HttpService) {
  }


  ngOnInit() {
    this.sharedDataService.setTitle("ELEMENT_SELECTION");
    window.setTimeout(() =>
      this.sharedDataService.setShowTabs(true));
    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    for (let pub in this.sharedDataService.publicationList) {
      this.ibUtilsService.getStacklistFromProjectDTODB(this.sharedDataService.publicationList[pub]._respondata.publication.project, (stacklist) => {
        for (let stack1 in stacklist) {
          let stackElementId = stacklist[stack1].id;
          if (this.utilsService.isPresent(this.sharedDataService.publicationList[pub]._selectedStack)) {
            if (stackElementId == this.sharedDataService.publicationList[pub]._selectedStack.id) {
              this.sharedDataService.publicationList[pub]._selectedStack = stacklist[stack1];
            }
          }
        }
      });
      for (let index in this.sharedDataService.publicationList[pub]._allSelectedStackFilters) {
        let stackFilterId = this.sharedDataService.publicationList[pub]._allSelectedStackFilters[index].key;
        if (stackFilterId == this.sharedDataService.publicationList[pub]._selectedStackFilter.key) {
          this.sharedDataService.publicationList[pub]._selectedStackFilter = this.sharedDataService.publicationList[pub]._allSelectedStackFilters[index];
        }
      }
    }
    currentPublication._displayImageArray = [];
    currentPublication._ElementSelectedDisplayValue = '';
    currentPublication._elementSelectedRow = [];
    currentPublication._selectedBucketRows = [];
    currentPublication._selectedStackRows = [];

    if (this.utilsService.isPresent(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].searchQuery)) {
      this.toggleSelect();
    }
    if (this.utilsService.isPresent(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].searchQueryBasket)) {
      this.toggleSearchBasket();
    }
  }

  ngAfterViewInit() {
    this.offsetTableWidth = this.elementRef.nativeElement.querySelector('#StackTable').offsetWidth;
  }

  onScrollBasket(event): void {
    let target = event.target || event.srcElement;
    this.tableBodyWidthBasket = this.elementRef.nativeElement.querySelector('.divWidthBasket').clientWidth + target.scrollLeft;
  }

  getBasketScrollValue() {
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._elementlist_table.length > 0) {
      return -1 * this.elementRef.nativeElement.querySelector('.baskettable').scrollLeft;
    }
  }

  selectedFilterfromChild(event) {
    this.addFilter = event;

  }

  selectedStackRows(event) {
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedStackRows = event;
  }

  selectedTextFilterfromChild(event) {
    this.addTextFilter = event;
  }

  selectedCheckboxFilterfromChild(event) {

    this.addCheckFilter = event;
    this.change = this.change + 1;

  }

  toggleSelect() {
    this.isOpen = !this.isOpen;
  }

  clearSearch() {
    this.isOpen = !this.isOpen;
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].searchQuery = "";
  }

  toggleSearchBasket() {
    this.isOpenBasket = !this.isOpenBasket;
  }

  clearSearchBasket() {
    this.isOpenBasket = !this.isOpenBasket;
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].searchQueryBasket = "";
  }

  removeStackElementsFromBasket() {
    let activePublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    activePublication.previewStatus = false;
    if (this._previewSubscribe) {
      this._previewSubscribe.unsubscribe();
    }
    if (activePublication._selectedBucketRows.length != 0) {
      for (let stack in activePublication._selectedBucketRows) {
        let index: number = activePublication._elementlist_table.indexOf(activePublication._selectedBucketRows[stack]);
        if (index !== -1) {
          activePublication._elementlist_table.splice(index, 1);
        }
      }
      activePublication._isChange = true;
      activePublication._selectedBucketRows = [];
    } else {
      this.utilsService.notificationWithTranslation('PLEASE_SELECT_A_BASKET_ELEMENT', []);
    }
    activePublication._bucketflag = 0;
    var isStackElementSelected = 0;
    for (let key in activePublication._selectedBucketRows) {
      if ((activePublication._selectedBucketRows[key]['id'] == activePublication._elementSelectedRow['id']) && (activePublication._selectedBucketRows[key]['displayValue'] == activePublication._elementSelectedRow['displayValue'])) {
        isStackElementSelected = 1;
      }
    }
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedStackRows.length === 1 && (isStackElementSelected === 0)) {
      activePublication._defaultImageName = "default.jpg";
      activePublication._isQuickPreview = true;
      activePublication._displayImageArrayBasket = [];
      activePublication._selectedTemplate = "Quick_Preview";
    } else if (isStackElementSelected === 0) {
      activePublication._displayImageArray = [];
      activePublication._elementImage = "";
      activePublication._defaultImageName = "default.jpg";
      activePublication._elementSelectedRow = undefined;
      activePublication._ElementSelectedDisplayValue = "";
      activePublication._isQuickPreview = true;
      activePublication._displayImageArrayBasket = [];
      activePublication._selectedTemplate = "Quick_Preview";
    } else {
      this.tableComponent.setTableColumnWidth();
    }
  }

  stackChanged(stack, clearFilter?) {
    this.elementRef.nativeElement.querySelector('.divWidth').scrollLeft = 0;
    this.isOpen = true;
    this.clearSearch();

    let currentPublicationObject = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    currentPublicationObject.loaderStatus = true;
    var isBuckElementSelected = 0;
    currentPublicationObject._stackListPageNumber = 1;
    currentPublicationObject._selectedStackFilter = "";
    currentPublicationObject._selectedStackRows = [];
    currentPublicationObject._selectedBucketRows = [];
    if (currentPublicationObject._elementSelectedRow != undefined) {
      for (let key in currentPublicationObject._selectedBucketRows) {
        if ((currentPublicationObject._selectedBucketRows[key]['id'] == currentPublicationObject._elementSelectedRow['displayValue'])) {
          isBuckElementSelected = 1;
        }
      }
    }
    if (isBuckElementSelected == 0) {
      if (this._previewSubscribe) {
        this._previewSubscribe.unsubscribe();
      }
      currentPublicationObject._displayImageArray = [];
      currentPublicationObject._defaultImageName = "default.jpg";
      currentPublicationObject._elementSelectedRow = undefined;
      currentPublicationObject._ElementSelectedDisplayValue = "";

      currentPublicationObject._templateList = stack.templates;
      if (currentPublicationObject._templateList.indexOf("Quick_Preview") == -1) {
        currentPublicationObject._templateList.splice(0, 0, "Quick_Preview");
      }
      currentPublicationObject._isQuickPreview = true;
      currentPublicationObject._selectedTemplate = "Quick_Preview"
    }
    this.ibUtilsService.getStacklistFromProjectDTODB(currentPublicationObject._respondata.publication.project, (stackList) => {
      let fullStack = this.ibUtilsService.getStackFromStacklist(stackList, stack);
      if ((fullStack.isStackLoaded) || (this.utilsService.isPresent(fullStack.stackElements)) && fullStack.stackElements.length > 0) {
        currentPublicationObject._stacklist_table = fullStack.stackElements;
        currentPublicationObject._allSelectedStackFilters = fullStack.stackFilter;
        currentPublicationObject._elementSelectedFilters = [];
        this.addFilter = "";
        // this.ngAfterViewInit();
        currentPublicationObject.loaderStatus = false;
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
          currentPublicationObject._filterListObject = _getFilters.transform(currentPublicationObject._selectedStack.filters, currentPublicationObject._filterNames, currentPublicationObject._filterListObject);
        }
        for (let i = 0; i < currentPublicationObject._filterListObject.length; i++) {
          if (currentPublicationObject._filterListObject[i].filterObj.type == 'checkbox') {
            currentPublicationObject._filterListObject[i]._isOpen = true;
          }
        }
      } else {
        let getdefaultfilter: boolean = true;
        if(this.utilsService.isPresent(clearFilter) &&  clearFilter == "clearFilter") {
          getdefaultfilter = false;
        }
        this.projectService.getStackByIdForGrid(currentPublicationObject._respondata.publication.project, stack.id, currentPublicationObject._selectedStackFilter.key, this.loadStackElementConstant, 0, getdefaultfilter).subscribe(
          (response) => {
            if (response.code == 100) {
              this.indexedDBService.updateAStackInProject(currentPublicationObject._respondata.publication.project, stack, response.stack, () => {
                this.ibUtilsService.getStacklistFromProjectDTODB(currentPublicationObject._respondata.publication.project, (stackList) => {
                  currentPublicationObject._selectedStack = this.ibUtilsService.getStackByStackId(stackList, currentPublicationObject._selectedStack.id);
                  currentPublicationObject._stacklist_table = response.stack.stackElements;
                  currentPublicationObject._allSelectedStackFilters = response.stack.stackFilter;
                  for (let index in response.stack.stackFilter) {
                    let stackFilterId = response.stack.stackFilter[index].key;
                    if (stackFilterId == response.stack.activeFilter) {
                      currentPublicationObject._selectedStackFilter = response.stack.stackFilter[index];
                    }
                  }
                  currentPublicationObject._elementSelectedFilters = [];
                  this.addFilter = "";
                  currentPublicationObject.loaderStatus = false;
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
                    currentPublicationObject._filterListObject = _getFilters.transform(currentPublicationObject._selectedStack.filters, currentPublicationObject._filterNames, currentPublicationObject._filterListObject);
                  }
                  for (let i = 0; i < currentPublicationObject._filterListObject.length; i++) {
                    if (currentPublicationObject._filterListObject[i].filterObj.type == 'checkbox') {
                      currentPublicationObject._filterListObject[i]._isOpen = true;
                    }
                  }
                });
              });
            } else {
              currentPublicationObject.loaderStatus = false;
              this.ibUtilsService.showIBErrors(response);
            }
          })
      }
      this.tableComponent.setTableColumnWidth();
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.keyCode == 46 || (event.metaKey && event.keyCode == 8)) {
      this.removeStackElementsFromBasket();
    }
  }


  addStackElementsTobasket(event?) {
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].previewStatus = false;
    if (this._previewSubscribe) {
      this._previewSubscribe.unsubscribe();
    }
    var totalStacksInBucketCount = 0;
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedStackRows.length != 0) {
      for (let selectedStackRow in this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedStackRows) {
        this.flag = 0;
        let stackElementId = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedStackRows[selectedStackRow].id;
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
            this.utilsService.notificationWithTranslation('STACK_ELEMENT_ALREADY_EXIST_IN_BASKET', []);
          }
        }
      }
    } else {
      this.utilsService.notificationWithTranslation('PLEASE_SELECT_A_STACK_ELEMENT', []);
    }
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedStackRows.length == 1) {
      this.tableComponent.setStacklistRow(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedStackRows[0], event, "elementSelected");
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
    this.tableComponent.setTableColumnWidth();
  }

  checkIfBucketElementIsSelected(stack) {
    let indexOfSelectedStack = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedBucketRows.indexOf(stack);
    if (indexOfSelectedStack === -1) {
      return false;
    } else {
      return true;
    }
  }

  selectAllElementsFromStackTable() {
    let _selectedStackRowsLength = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedStackRows.length;
    let _stacklist_tableLength = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._stacklist_table.length;
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._stackflag == 0 && _selectedStackRowsLength == _stacklist_tableLength) {
      this.clearAllElementsFromStackTable();
    }
    else if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._stackflag == 0 || _selectedStackRowsLength < _stacklist_tableLength) {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedStackRows = [];
      var selectRowsOnPage = 1;
      let columnPipeFilter = new SelectedColumnPipe();
      let applyFilter = new CheckboxfilterPipe();
      let searchFilter = new SearchPipe();
      let stacklistFilter = applyFilter.transform(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._stacklist_table, this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._elementSelectedFilters, this.addFilter, this.addFilter, this.addFilter);
      let searchFilterarray = searchFilter.transform(stacklistFilter, this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].searchQuery, this.flag);
      let stacklistColumnFilter = columnPipeFilter.transform(searchFilterarray);
      if (selectRowsOnPage == 1) {
        for (let i = 0; i < stacklistColumnFilter.length; i++) {
          this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedStackRows.push(stacklistColumnFilter[i]);
        }
      }
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._stackflag = 1;
    }
    else {
      this.clearAllElementsFromStackTable();
    }
  }

  clearAllElementsFromStackTable(){
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedStackRows = [];
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._stackflag = 0;
  }

  selectAllElementsFromBasket() {
    let _selectedBucketRowsLength = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedBucketRows.length;
    let _elementlist_tableLength = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._elementlist_table.length;
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._bucketflag == 0 && _selectedBucketRowsLength == _elementlist_tableLength) {
      this.clearAllElementsFromBasket();
    }
    else if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._bucketflag == 0 || _selectedBucketRowsLength < _elementlist_tableLength) {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedBucketRows = [];
      var selectRowsOnPageBasket = 1;
      if (selectRowsOnPageBasket == 1) {
        for (let i = 0; i < this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._elementlist_table.length; i++) {
          this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedBucketRows.push(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._elementlist_table[i]);
        }
      }
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._bucketflag = 1;
    }
    else {
      this.clearAllElementsFromBasket();
    }
  }

  clearAllElementsFromBasket(){
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedBucketRows = [];
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._bucketflag = 0;
  }

  stackFilterChanged(stack) {
    this.elementRef.nativeElement.querySelector('.divWidth').scrollLeft = 0;
    let currentPublicationObject = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    currentPublicationObject.loaderStatus = true;
    var isBuckElementSelected = 0;
    currentPublicationObject._stackListPageNumber = 1;
    currentPublicationObject._selectedStackRows = [];
    for (let key in currentPublicationObject._selectedBucketRows) {
      if ((currentPublicationObject._selectedBucketRows[key]['id'] == currentPublicationObject._elementSelectedRow['id']) && (currentPublicationObject._selectedBucketRows[key]['displayValue'] == currentPublicationObject._elementSelectedRow['displayValue'])) {
        isBuckElementSelected = 1;
      }
    }
    if (isBuckElementSelected == 0) {
      if (this._previewSubscribe) {
        this._previewSubscribe.unsubscribe();
      }
      currentPublicationObject._elementImage = "";
      currentPublicationObject._defaultImageName = "default.jpg";
      currentPublicationObject._elementSelectedRow = undefined;
      currentPublicationObject._ElementSelectedDisplayValue = "";
      currentPublicationObject._isQuickPreview = true;
      currentPublicationObject._selectedTemplate = "Quick_Preview"
    }
    this.ibUtilsService.getStacklistFromProjectDTODB(currentPublicationObject._respondata.publication.project, (stackList) => {
      let stackElements = this.ibUtilsService.getStackFilterFromStacklist(stackList, stack, currentPublicationObject._selectedStackFilter.key);
      if ((this.utilsService.isPresent(stackElements)) && stackElements.length > 0) {
        currentPublicationObject.loaderStatus = false;
        currentPublicationObject._stacklist_table = stackElements;
        currentPublicationObject._elementSelectedFilters = [];
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
        this.projectService.getStackByIdForGrid(currentPublicationObject._respondata.publication.project, stack.id, currentPublicationObject._selectedStackFilter.key, this.loadStackElementConstant, 0).subscribe(
          (response) => {
            if (response.code == 100) {
              this.indexedDBService.updateStackFilterInProject(currentPublicationObject._respondata.publication.project, stack, currentPublicationObject._selectedStackFilter.key, response.stack, () => {
                this.ibUtilsService.getStacklistFromProjectDTODB(currentPublicationObject._respondata.publication.project, (stackList) => {
                  currentPublicationObject._selectedStack = this.ibUtilsService.getStackByStackId(stackList, currentPublicationObject._selectedStack.id);
                });
              });
              currentPublicationObject.loaderStatus = false;
              currentPublicationObject._stacklist_table = response.stack.stackElements;
              currentPublicationObject._elementSelectedFilters = [];
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
              currentPublicationObject.loaderStatus = false;
              this.ibUtilsService.showIBErrors(response);
            }
          })
      }
    });
  }

  loadTemplate(selectedTemplate) {
    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    currentPublication.previewStatus = true;
    currentPublication._elementImage = "";
    this.indexedDBService.getProject(currentPublication._respondata.publication.project, (project) => {
      if (this.utilsService.isPresent(currentPublication._elementSelectedRow) && !this.utilsService.isPresent(project._stackElementPreview[currentPublication._elementSelectedRow.stackId])) {
        project._stackElementPreview[currentPublication._elementSelectedRow.stackId] = [];
      }
      if (this.utilsService.isPresent(currentPublication._elementSelectedRow)) {
        if (selectedTemplate != "Quick_Preview") {
          currentPublication._isQuickPreview = false;
          if (this.utilsService.isPresent(project._stackElementPreview[currentPublication._elementSelectedRow.stackId]) && Object.keys(project._stackElementPreview[currentPublication._elementSelectedRow.stackId]).length != 0) {
            for (let tempStackElem of project._stackElementPreview[currentPublication._elementSelectedRow.stackId]) {
              if (tempStackElem.id == currentPublication._elementSelectedRow.id && tempStackElem.displayValue == currentPublication._elementSelectedRow.displayValue) {
                if (this.utilsService.isPresent(tempStackElem[selectedTemplate])) {
                  currentPublication._elementImage = tempStackElem[selectedTemplate];
                  currentPublication.previewStatus = false;
                  return;
                }
              }
            }
          }
          if (selectedTemplate.length > 0) {
            if (this._previewSubscribe) {
              this._previewSubscribe.unsubscribe();
            }
            this._previewSubscribe = this.elementselectionService.getTemplatePreview(currentPublication._respondata.publication.project, selectedTemplate, currentPublication._elementSelectedRow.id).subscribe(
              (response) => {
                currentPublication.previewStatus = false;
                if (response.code == 100) {
                  if (Object.keys(project._stackElementPreview[currentPublication._elementSelectedRow.stackId]).length != 0) {
                    for (let tempStackElem of project._stackElementPreview[currentPublication._elementSelectedRow.stackId]) {
                      if (tempStackElem.id == currentPublication._elementSelectedRow.id && tempStackElem.displayValue == currentPublication._elementSelectedRow.displayValue) {
                        tempStackElem[selectedTemplate] = response.StackElementPreviewResult.previewImageBytes;
                        currentPublication._elementImage = response.StackElementPreviewResult.previewImageBytes;
                        return;
                      }
                    }
                  }
                  let tempStackElem: any = {};
                  tempStackElem[selectedTemplate] = response.StackElementPreviewResult.previewImageBytes;
                  tempStackElem.id = currentPublication._elementSelectedRow.id;
                  tempStackElem.displayValue = currentPublication._elementSelectedRow.displayValue;
                  project._stackElementPreview[currentPublication._elementSelectedRow.stackId].push(tempStackElem);
                  let objProjectdtoService = new ProjectdtoService();
                  objProjectdtoService._stackElementPreview = project._stackElementPreview;
                  this.indexedDBService.addUpdateProject(project.name, objProjectdtoService, () => { });
                  currentPublication._elementImage = response.StackElementPreviewResult.previewImageBytes;
                } else {
                  currentPublication._defaultImageName = "default.jpg";
                  this.ibUtilsService.showIBErrors(response);
                }
              })
          }
        } else {
          currentPublication._isQuickPreview = true;
          if (currentPublication._elementSelectedRow.linkedImageExists) {
            this.getElementImage(currentPublication, project, currentPublication._elementSelectedRow.stackId, currentPublication._elementSelectedRow, currentPublication._elementSelectedRow.templateIdFromRule);
          } else {
            currentPublication.previewStatus = false;
            currentPublication._defaultImageName = "default.jpg";
          }
        }
      } else {
        currentPublication.previewStatus = false;
        currentPublication._defaultImageName = "default.jpg";
        this.utilsService.notificationWithTranslation('PLEASE_SELECT_A_STACK_ELEMENT', []);
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
      for (let tempStackElem of currentProjectdto._stackElementPreview[stackId]) {
        if (tempStackElem.id == dataID && tempStackElem.displayValue == currentPageAreaElement.displayValue) {
          if (this.utilsService.isPresent(tempStackElem)) {
            let currentDateTimeInMiliSecs = new Date().getTime();
            let dataRefreshInMiliSecs = tempStackElem.metaDataRefreshHours * (60000 * 60);
            if ((currentDateTimeInMiliSecs - tempStackElem.timeUpdated) < dataRefreshInMiliSecs) {
              currentPublication._displayImageArray = tempStackElem.images;
              if (this.utilsService.isPresent(currentlink)) {
                if (currentPublication._loaderStatus) {
                  currentPublication.previewStatus = false;
                } else {
                  currentPublication._loaderStatus = true;
                }
              } else {
                currentPublication.previewStatus = false;
              }
              return;
            }
          }
        }
      }
    }
    if (this._previewSubscribe) {
      this._previewSubscribe.unsubscribe();
    }
    this._previewSubscribe = this.elementselectionService.getDisplayedImageForStackElement(currentPublication._respondata.publication.project, stackId, templateId, dataID
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
              currentPublication._displayImageArray = response.StackElementPreviewResult.quickPreviewImageData.images;
              return;
            }
          }
        }
        let tempStackElem = response.StackElementPreviewResult.quickPreviewImageData;
        tempStackElem.id = dataID;
        tempStackElem.displayValue = currentPageAreaElement.displayValue;
        currentProjectdto._stackElementPreview[stackId].push(tempStackElem);
        currentPublication._displayImageArray = tempStackElem.images;
      } else {
        currentPublication._elementImage = "";
        this.ibUtilsService.showIBErrors(response);
      }
    });
  }

  clearStackFilter(selectedStack) {
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedStackFilter != '') {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedStackFilter = "";
      this.stackChanged(selectedStack, "clearFilter")
    }
  }

}
