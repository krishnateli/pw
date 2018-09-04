import { Component, OnChanges, Input, Output, ElementRef, EventEmitter, SimpleChange } from '@angular/core';

import { SharedDataService } from "../../../services/shared-data.service";
import { UtilsService } from "../../../shared/services/utils.service";
import { IbUtilsService } from "../../../services/ib-utils.service";

@Component({
	selector: 'app-slider',
	templateUrl: './slider.component.html',
	styleUrls: ['./slider.component.scss']
})
export class SliderComponent implements OnChanges {
	private _masterPagesData: any[];
	@Input() dataType;
	@Input() showLoader;
	current_project: any;

	@Input()
	set masterPagesData(masterPagesData: any) {
		this._masterPagesData = masterPagesData;
	}
	get masterPagesData(): any { return this._masterPagesData; }

	@Output() deleteStaticPage = new EventEmitter();

	qty_val: number = 1;
	showSlider: boolean = false;
	currentElement: number = 0;
	isPrevious: boolean = true;
	isNext: boolean = false;
	PreviewLoader: boolean = false;
	currPubProject: any;
	currPubID: any;
	mPageID: any;

	constructor(private ibUtilsService: IbUtilsService, private elementRef: ElementRef, private utilsService: UtilsService, public sharedDataService: SharedDataService) { }

	ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
		for (let propName in changes) {
			if (propName == "masterPagesData") {
				let changedProp = changes[propName];
				let to = JSON.stringify(changedProp.currentValue);
				let from = JSON.stringify(changedProp.previousValue);
				if (from != to) {
					if (this.utilsService.isPresent(changedProp.currentValue) && this.utilsService.isPresent(changedProp.previousValue)) {
						if (changedProp.currentValue.length >= changedProp.previousValue.length) {
							this.updateSliderState();
						} else {
							this.updateSliderState(true);
							this.updateButtonState();
						}
					}
				}
			}
		}
	}

	ngAfterViewInit() {
		this.removeLoaderFromSlider();
		this.updateSliderState();
	}

	updateSliderState(removePage?) {
		let noOfItemsvisible = this.getTotalItemsInView();
		if (!this.utilsService.isPresent(noOfItemsvisible)) {
			noOfItemsvisible = 1;
		}
		if (this.masterPagesData.length > noOfItemsvisible) {
			this.showSlider = true;
			if (removePage) {
				if (this.currentElement != 0) {
					this.previousItem();
				}
			} else {
				if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].showLoaderInSlider) {
					this.lastItem();
				}
			}
		} else {
			this.currentElement = 0;
			this.showSlider = false;
		}
		this.updateButtonState();
		this.ibUtilsService.detectChangesInBuilderPage();
	}

	deleteStaticMasterPage(filename) {
		this.deleteStaticPage.emit(filename);
	}

	addLoaderToSlider() {
		if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].showLoaderInSlider) {
			let loaderIndex = this.masterPagesData.map((el) => el.type).indexOf("IBLoader");
			if (this.dataType == "StaticPages" && loaderIndex == -1) {
				let loader = {
					type: "IBLoader"
				}
				this.masterPagesData.push(loader);
				this.updateSliderState();
			}
		}
	}
	removeLoaderFromSlider() {
		if (!this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].showLoaderInSlider) {
			let loaderIndex = this.masterPagesData.map((el) => el.type).indexOf("IBLoader");
			if (this.dataType == "StaticPages" && loaderIndex > -1) {
				this.masterPagesData.splice(loaderIndex, 1);
				this.updateSliderState();
			}
		}
	}

	checkPreviewLoaderState(mPage) {
		let preview = false;		
		let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
		let projectName = currentPublication._respondata.publication.project;
		let publicationName = currentPublication._respondata.publication.name;
		let staticPages = currentPublication.pagePreviewLoaderStatus;
		staticPages.map(function(item) {
			if(item.id == mPage.id && item.currentPublication._respondata.publication.project == projectName && item.currentPublication._respondata.publication.name == publicationName) {
			  preview =  true;
			}
		});
		return preview;
	}

	onStaticPageLoad(mPage) {
		let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
		let projectName = currentPublication._respondata.publication.project;
		let mPageIndex = currentPublication.pagePreviewLoaderStatus.findIndex(x => x.id === mPage.id);
		let Publication = currentPublication.pagePreviewLoaderStatus.findIndex(x => x.currentPublication._respondata.publication.project === projectName);
		if(mPageIndex !== -1 && Publication !== -1){
			currentPublication.pagePreviewLoaderStatus.splice(mPageIndex, 1);
		}
	}

	getTotalItemsInView() {
		// let itemWidth = this.elementRef.nativeElement.querySelector(".mContainer").offsetWidth;
		let itemWidth = 102;
		let contWidth = this.elementRef.nativeElement.querySelector(".mPC").clientWidth - 98;
		for (let i = 0; i < this.masterPagesData.length; i++) {
			let k = this.masterPagesData.length - i;
			if (contWidth > k * itemWidth) {
				return k;
			}
		}
		return this.masterPagesData.length;
	}

	nextItem() {
		this.currentElement++;
		this.updateButtonState();
	}

	previousItem() {
		this.currentElement--;
		this.updateButtonState();
	}

	lastItem() {
		let noOfItemsvisible = this.getTotalItemsInView();
		this.currentElement = this._masterPagesData.length - noOfItemsvisible;
		this.updateButtonState();
	}

	updateButtonState() {
		let noOfItemsvisible = this.getTotalItemsInView();
		if (!this.utilsService.isPresent(noOfItemsvisible)) {
			noOfItemsvisible = 1;
		}
		this.currentElement == 0 ? this.isPrevious = true : this.isPrevious = false;
		this.currentElement + noOfItemsvisible == this.masterPagesData.length ? this.isNext = true : this.isNext = false;
	}

}

