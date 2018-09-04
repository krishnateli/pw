import { Component, OnInit, EventEmitter, Output, Input, ElementRef } from '@angular/core';

import { SharedDataService } from '../../../services/shared-data.service';
import { SelectedColumnPipe } from '../../pipes/selectedcolumn.pipe';
import { SearchPipe } from '../../pipes/search.pipe';
import { GetFiltersPipe } from '../../pipes/get-filters.pipe';
import { CustomfilterPipe } from '../../pipes/customfilter.pipe';


import * as $ from 'jquery';
window["$"] = $;
window["jQuery"] = $;

@Component({
	selector: 'app-filter',
	templateUrl: './filter.component.html',
	styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
	addFilter: any;
	addCheckboxFilter: any;
	filter: any
	searchQuery: any;
	filterNames: any = [];
	selectedItems: any = [];
	__tempArr: any[] = [];
	selectedFilter: any;
	selectedStatus: any;
	BasketStatus: any;

	@Output() addFilterEvent: EventEmitter<any> = new EventEmitter<any>();
	@Output() addFilterCheckbox: EventEmitter<any> = new EventEmitter<any>();
	@Output() addFilterText: EventEmitter<any> = new EventEmitter<any>();

	@Input() offsetTableWidth: number;

	//main table
	mainTable: any[];
	@Input('mainTable1') set model(mainTable1: any) {
		this.mainTable = mainTable1;
	}
	get model() {
		return this.mainTable;
	}

	//Element selected filter array
	selectedFilters: any[];
	@Input('elementSelectedFilters') set model1(elementSelectedFilters: any) {
		this.selectedFilters = elementSelectedFilters;
	}
	get model1() {
		return this.selectedFilters;
	}

	//Builder Basket selected filter array
	@Input('builderBasketSelectedFilters') set model2(builderBasketSelectedFilters: any) {
		this.selectedFilters = builderBasketSelectedFilters;
	}
	get model2() {
		return this.selectedFilters;
	}

	//Builder stack selected filter array
	@Input('builderStackSelectedFilters') set model3(builderStackSelectedFilters: any) {
		this.selectedFilters = builderStackSelectedFilters;
	}
	get model3() {
		return this.selectedFilters;
	}

	//check status from basket
	@Input('statusFromBasket') set basketModel(statusFromBasket: any) {
		this.BasketStatus = statusFromBasket;
	}
	get basketModel() {
		return this.BasketStatus;
	}

	@Input() switchFilterArray: any;

	constructor(public sharedDataService: SharedDataService, private elementRef: ElementRef) {

	}

	ngOnInit() {
		this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._filterListObject = [];
		let _getFilters = new GetFiltersPipe();

		if (this.mainTable.length > 0) {
			this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._filterListObject = _getFilters.transform(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedStack.filters, this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._filterNames, this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._filterListObject);

		}

		for (let i = 0; i < this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._filterListObject.length; i++) {
			if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._filterListObject[i].filterObj.type == 'checkbox') {

				this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._filterListObject[i]._isOpen = true;
			}

			if (this.switchFilterArray == "element") {
				for (let key in this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._elementSelectedFilters) {
					if (key == this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._filterListObject[i].filterName) {
						if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._filterListObject[i].filterObj.type == "textfield") {
							window.setTimeout(() => this.elementRef.nativeElement.querySelector("#" + key.split(' ').join('_')).value = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._elementSelectedFilters[key]);

						}
					}
				}
			}
			if (this.switchFilterArray == "stack") {
				for (let key in this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._stackSelectedFilters) {
					if (key == this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._filterListObject[i].filterName) {
						if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._filterListObject[i].filterObj.type == "textfield") {
							window.setTimeout(() => this.elementRef.nativeElement.querySelector("#" + key.split(' ').join('_')).value = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._stackSelectedFilters[key]);

						}
					}
				}
			}
			if (this.switchFilterArray == "basket") {
				for (let key in this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._basketSelectedFilters) {
					if (key == this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._filterListObject[i].filterName) {
						if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._filterListObject[i].filterObj.type == "textfield") {
							window.setTimeout(() => this.elementRef.nativeElement.querySelector("#" + key.split(' ').join('_')).value = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._basketSelectedFilters[key]);

						}
					}
				}
			}
		}

	}

	checkIfStatusConfigured() {
		if (this.BasketStatus == 'true') {
			for (let index = 0; index < this.mainTable.length; index++) {
				if (this.mainTable[index].productStateValid != '') {
					return true;
				}
			}
		}
		else {
			if (this.mainTable.length > 0) {
				if (this.mainTable[0].productStateValid != '') {
					return true;
				}
			}
		}
	}


	statusArray = [{ state: 'Complete', valid: 'true' },
	{ state: 'Incomplete', valid: 'false' }];

	setFilter(filterValue, value) {
		this.selectedFilters[filterValue] = value;
		// if (this.switchFilterArray == "basket"){
		// 	this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._basketSelectedFilters=this.selectedFilters;
		// }
		// if (this.switchFilterArray == "stack") {
		// 	this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._stackSelectedFilters=this.selectedFilters;
		// }

		this.addFilter = this.selectedFilters[filterValue];
		this.addFilterText.emit("ok");
		this.addFilterEvent.emit(this.addFilter);
		this.tablecolumnWidth();
	}

	clearFilter(colValues, type) {
		if (type == 'textfield') {
			this.elementRef.nativeElement.querySelector("#" + colValues.split(' ').join('_')).value = "";
		}
		delete this.selectedFilters[colValues];

		if ((Object.keys(this.selectedFilters).length == 0)) {
			this.clearList();
		}
		this.addFilterCheckbox.emit(colValues);
		this.addFilterEvent.emit(colValues);
		this.addFilterText.emit(colValues);
		this.tablecolumnWidth();
	}

	tablecolumnWidth() {
		if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._stacklist_table.length > 0) {
			let FilterCount = Object.keys(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._stacklist_table[0]['filters']).length;
			if (FilterCount == 1) {
				this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._ElementcolumnWidth = this.offsetTableWidth / 3;
			}
			else {
				$('#StackTable tr th').css({ 'min-width': 200, 'man-width': 200, });
				$('#StackTable tr td').css({ 'min-width': 200, 'man-width': 200, });
				$('#BasketTable tr th').css({ 'min-width': 200, 'man-width': 200, });
				$('#BasketTable tr td').css({ 'min-width': 200, 'man-width': 200, });
			}
		}
	}

	clearList() {
		for (let key in this.selectedFilters) {
			if (this.elementRef.nativeElement.querySelector("#" + key.split(' ').join('_')) != undefined) {
				this.elementRef.nativeElement.querySelector("#" + key.split(' ').join('_')).value = "";
			}
		}
		this.selectedFilters = [];
		if (this.switchFilterArray === "element") {
			this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._elementSelectedFilters = [];
		}
		if (this.switchFilterArray === "stack") {
			this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._stackSelectedFilters = [];
		}
		if (this.switchFilterArray === "basket") {
			this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._basketSelectedFilters = [];
		}
		this.addFilterText.emit("");
		this.tablecolumnWidth();
	}

	textFilter(searchQuery, filterColumn) {
		this.selectedFilters[filterColumn] = searchQuery;
		this.addFilterText.emit(searchQuery);
	}

	toggleSelect(j) {
		if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._filterListObject[j]._isOpen) {
			this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._filterListObject[j]._isOpen = false;
		}
		else {
			this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._filterListObject[j]._isOpen = true;
		}
	}

	checkIfSelected(item, colValues) {
		if (this.selectedFilters[colValues]) {
			for (let _item = 0; _item < this.selectedFilters[colValues].length; _item++) {
				if (this.selectedFilters[colValues][_item] == item) {
					return true;
				}
			}
		}
		return false;
	}

	checkIfNotSelected(item, colValues) {
		if (this.selectedFilters[colValues]) {
			for (let _item = 0; _item < this.selectedFilters[colValues].length; _item++) {
				if (this.selectedFilters[colValues][_item] == item) {
					return false;
				}
			}
		}
		return true;
	}


	selectcheck(item, colValues) {

		let keyName = colValues;

		if ((!this.selectedFilters[keyName]) && (keyName != "")) {
			this.selectedFilters[keyName] = [];
		}
		if ((keyName != "") && (this.selectedFilters[keyName].length != 0)) {
			for (let _item = 0; _item < this.selectedFilters[keyName].length; _item++) {
				if (this.selectedFilters[keyName][_item] == item) {
					this.selectedFilters[keyName].splice(_item, 1);
					this.addFilterCheckbox.emit(keyName);

					return;
				}
			}
		}
		this.selectedFilters[keyName].push(item);
		this.addFilterText.emit("ok");
		this.addFilterCheckbox.emit(keyName);

	}


}