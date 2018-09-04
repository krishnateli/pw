import { Component, OnInit, Output, Input, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { SharedDataService } from "../../../services/shared-data.service";
import { UtilsService } from '../../../shared/services/utils.service';
import { IbUtilsService } from '../../../services/ib-utils.service';
import { ConstantsService } from '../../../services/constants.service'

import { ElementselectionService } from '../../pages/element-selection/elementselection.service';
import { ProjectService } from "../../../services/project.service";
import { IndexedDBService } from '../../../db/indexeddb.service';
import { ProjectdtoService } from '../../../dto/projectdto.service';

@Component({
  selector: 'app-preview-box',
  templateUrl: './preview-box.component.html',
  styleUrls: ['./preview-box.component.scss']
})
export class PreviewBoxComponent implements OnInit {

  @Input() data;
  @Output() getElementImageEvent = new EventEmitter();
  _previewSubscribe;
  toggleBetwn: boolean = true;
  selectedImage: any;
  alternateTemplate: string;

  constructor(public constantsService: ConstantsService, public sharedDataService: SharedDataService, public utilsService: UtilsService, private ibUtilsService: IbUtilsService, private router: Router, public elementselectionService: ElementselectionService, public cd: ChangeDetectorRef, private indexedDBService: IndexedDBService) { }

  ngOnInit() {
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedDisplayValue = "";
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._selectedRow = "";
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._imageArray = [];
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].selectedImage = '';
  }

  ngDoCheck() {
    if (this.utilsService.isPresent(this.data.areaAssignment) && this.utilsService.isPresent(this.data.areaAssignment.selectedAlternateTemplateName)) {
      if (this.data.templateList) {
        let templateIndex = this.data.templateList.indexOf(this.data.areaAssignment.selectedAlternateTemplateName);
        this.alternateTemplate = this.data.templateList[templateIndex];
      }
    } else {
      if (this.data.templateList) {
        this.alternateTemplate = this.data.templateList[this.data.selectedIndex];
      }
    }
  }

  /*----------Switch Required Variables---------- */
  switchVariables() {
    this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._showRequiredVariables = !this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._showRequiredVariables;
    return this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._showRequiredVariables;
  }

  togglePageProp2QuickPrev() {
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._showProperties == 'stackbasket') {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._showProperties = 'page';
    } else {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._showProperties = 'stackbasket';
    }
  }

  loadTemplate(selectedTemplate) {
    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    currentPublication.previewStatus = true;
    currentPublication._image = "";
    this.indexedDBService.getProject(currentPublication._respondata.publication.project, (currentProjectdto) => {
      if (this.utilsService.isPresent(currentPublication._selectedRow) && currentPublication._selectedRow != undefined) {
        if (!this.utilsService.isPresent(currentProjectdto._stackElementPreview[currentPublication._selectedRow.stackId])) {
          currentProjectdto._stackElementPreview[currentPublication._selectedRow.stackId] = [];
        }
        if (selectedTemplate != "Quick_Preview") {
          currentPublication._isBuilderQuickPreview = false;
          if (this.utilsService.isPresent(currentProjectdto._stackElementPreview[currentPublication._selectedRow.stackId]) && Object.keys(currentProjectdto._stackElementPreview[currentPublication._selectedRow.stackId]).length != 0) {
            for (let tempStackElem of currentProjectdto._stackElementPreview[currentPublication._selectedRow.stackId]) {
              if (tempStackElem.id == currentPublication._selectedRow.id && tempStackElem.displayValue == currentPublication._selectedRow.displayValue) {
                if (this.utilsService.isPresent(tempStackElem[selectedTemplate])) {
                  currentPublication._image = tempStackElem[selectedTemplate];
                  currentPublication.previewStatus = false;
                  this.cd.detectChanges();
                  return;
                }
              }
            }
          }
          if (selectedTemplate.length > 0) {
            currentPublication.previewBuilderStatus = true;
            if (currentPublication.reqImage && !currentPublication.reqImage.closed) {
              currentPublication.reqImage.unsubscribe();
            }
            currentPublication.reqImage = this.elementselectionService.getTemplatePreview(currentPublication._respondata.publication.project, selectedTemplate, currentPublication._selectedRow.id).subscribe(
              (response) => {
                currentPublication.previewBuilderStatus = false;
                if (response.code == 100) {
                  currentPublication.previewStatus = false;
                  if (this.utilsService.isPresent(currentProjectdto._stackElementPreview[currentPublication._selectedRow.stackId]) && Object.keys(currentProjectdto._stackElementPreview[currentPublication._selectedRow.stackId]).length != 0) {
                    for (let tempStackElem of currentProjectdto._stackElementPreview[currentPublication._selectedRow.stackId]) {
                      if (tempStackElem.id == currentPublication._selectedRow.id && tempStackElem.displayValue == currentPublication._selectedRow.displayValue) {
                        tempStackElem[selectedTemplate] = response.StackElementPreviewResult.previewImageBytes;
                        currentPublication._image = response.StackElementPreviewResult.previewImageBytes;
                        this.cd.detectChanges();
                        return;
                      }
                    }
                  }
                  let tempStackElem: any = {};
                  tempStackElem[selectedTemplate] = response.StackElementPreviewResult.previewImageBytes;
                  tempStackElem.id = currentPublication._selectedRow.id;
                  tempStackElem.displayValue = currentPublication._selectedRow.displayValue;
                  currentProjectdto._stackElementPreview[currentPublication._selectedRow.stackId].push(tempStackElem);
                  let objProjectdtoService = new ProjectdtoService();
                  objProjectdtoService._stackElementPreview = currentProjectdto._stackElementPreview;
                  this.indexedDBService.addUpdateProject(currentProjectdto.name, objProjectdtoService, () => { });
                  currentPublication._image = response.StackElementPreviewResult.previewImageBytes;
                  this.cd.detectChanges();
                } else if (response.code == 105) {
                  currentPublication.previewStatus = false;
                  var params = [];
                  this.utilsService.notificationWithTranslation(response.message, params);
                  this.utilsService.redirectToHomePageWithDelay();
                } else if (response.code == 104) {
                  localStorage.removeItem(this.constantsService.ISLOGGEDIN);
                  this.router.navigate(['/']);
                } else if (response.code == 102) {
                  currentPublication._defaultBuilderImageName = "default.jpg";
                  this.utilsService.notificationWithTranslation(response.message, response.params);
                } else {
                  currentPublication._defaultBuilderImageName = "default.jpg";
                }
              })
          }
        } else {
          currentPublication._isBuilderQuickPreview = true;
          if (currentPublication._selectedRow.linkedImageExists) {
            let k = [currentPublication, currentProjectdto, currentPublication._selectedRow.stackId, currentPublication._selectedRow, currentPublication._selectedRow.templateIdFromRule]
            this.getElementImageEvent.emit(k);
          } else {
            currentPublication.previewBuilderStatus = false;
            this.cd.detectChanges();
            currentPublication._defaultBuilderImageName = "default.jpg";
          }
        }
      } else {
        currentPublication._defaultBuilderImageName = "default.jpg";
        this.utilsService.notificationWithTranslation('PLEASE_SELECT_A_STACK_ELEMENT', []);
      }
    });

  }

  showMultipleImages() {
    if (this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._displayImageArray.length > 1) {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].multipleFlag = true;
    }
  }

  setTemplateImage(imageIndex, selectedimageName) {//setTemplateImage(imageIndex,selectedimage){

    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    currentPublication.multipleFlag = false;

    if (this.utilsService.isPresent(currentPublication._selectedRow)) {
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex].selectedImage = selectedimageName;
      this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._isChange = true;
      this.saveMainImageMapping(currentPublication._selectedRow.stackId, currentPublication._selectedRow.id, selectedimageName);
    }
  }

  saveMainImageMapping(stackId, currentLink, selectedImage) {
    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];

    // let stackId = currentPublication._selectedRow.stackId;
    // let currentLink = currentPublication._selectedRow.id;
    // let selectedImage = currentPublication._selectedRow.displayValue;

    let imageStatus = false;
    for (let eachMainImageObject of currentPublication._respondata.publication.mainImageMappings) {
      if ((eachMainImageObject.stackId == stackId) && (eachMainImageObject.currentLink == currentLink)) {
        imageStatus = true;
        eachMainImageObject.selectedImage = selectedImage;
      }
    }
    if (!imageStatus) {
      let mainImageMapping = {
        stackId: stackId,
        currentLink: currentLink,
        selectedImage: selectedImage
      }

      currentPublication._respondata.publication.mainImageMappings.push(mainImageMapping);
    }

  }

  setAlternateTemplate($event) {
    $event = $event || null;
    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    currentPublication._pubItems[currentPublication._selectedArea.pageIndex].pagePlanItemAreaDetailsList[currentPublication._selectedArea.areaIndex].areaAssignment.selectedAlternateTemplateName = $event;
    let pageIndex = currentPublication._mainPubItems.map((el) => el.id).indexOf(currentPublication._pubItems[currentPublication._selectedArea.pageIndex].id);
    currentPublication._mainPubItems[pageIndex].pagePlanItemAreaDetailsList[currentPublication._selectedArea.areaIndex].areaAssignment.selectedAlternateTemplateName = $event;
    this.ibUtilsService.removePreviewedPages(currentPublication._selectedArea.pageId);
    currentPublication._isChange = true;
  }

}
