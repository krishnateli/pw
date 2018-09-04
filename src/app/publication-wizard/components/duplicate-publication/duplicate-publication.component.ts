import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { ProjectService } from '../../../services/project.service';
import { SharedDataService } from '../../../services/shared-data.service';
import { UtilsService } from '../../../shared/services/utils.service';
import { IbUtilsService } from '../../../services/ib-utils.service';
import { IndexedDBService } from '../../../db/indexeddb.service';
import { ConstantsService } from '../../../services/constants.service';


@Component({
  selector: 'duplicate-publication',
  templateUrl: './duplicate-publication.component.html',
  styleUrls: ['./duplicate-publication.component.scss']
})
export class DuplicatePublicationComponent implements OnInit {
  selectedDuplicatePublication: string;
  selectedDuplicateProject: string;
  duplicatePublicationName: string = "";
  @Output() showLoader = new EventEmitter();
  @Output() loadStackList = new EventEmitter();
  @Output() loadPublicationSelectionData = new EventEmitter();
  @Input('projectsArrayDuplicate') projects_array:any;
  @Input('duplicatePublicationArray') duplicatePublication_array:any;


  constructor(public fb: FormBuilder, private projectService: ProjectService, private ibUtilsService: IbUtilsService, public sharedDataService: SharedDataService, private utilsService: UtilsService, private indexedDBService: IndexedDBService, private constantsService: ConstantsService) { }

  ngOnInit() {
  }

  createDuplicatePublication(event, valid) {
    if (valid) {
      this.showLoader.emit("show");
      var createDuplicatePublicationFormObj = this.createDuplicatePublicationForm.getRawValue();
      var isPublicationNameExists = false;

      if ((createDuplicatePublicationFormObj.newpublication != null) && (createDuplicatePublicationFormObj.newpublication.length > 0)) {
        for (let index in createDuplicatePublicationFormObj.project.publications) {
          if (createDuplicatePublicationFormObj.project.publications[index].name.toUpperCase() == createDuplicatePublicationFormObj.newpublication.toUpperCase()) {
            isPublicationNameExists = true;
          }
        }
      }

      if (!isPublicationNameExists) {
        this.projectService.createDuplicatePublication(createDuplicatePublicationFormObj.project.name, createDuplicatePublicationFormObj.publication.id, createDuplicatePublicationFormObj.publication.name, createDuplicatePublicationFormObj.newpublication).subscribe(
          (response) => {
            if (response.code == 100) {
              this.utilsService.notificationWithTranslation('DUPLICATE_PUBLICATION_IS_CREATIED', []);
              this.indexedDBService.addPublicationInProject(response.publication, createDuplicatePublicationFormObj.project.name);
              // this.loadStackList(this.constantsService.DUPLICATE_PUBLICATION, response, createDuplicatePublicationFormObj);
              let requestType = this.constantsService.DUPLICATE_PUBLICATION;
              this.loadStackList.emit({ requestType, response, publicationObject: createDuplicatePublicationFormObj });
            } else {
              this.showLoader.emit("hide");
              this.ibUtilsService.showIBErrors(response);
            }
          })
      } else {
        this.showLoader.emit("hide");
        let params = [];
        params.push(createDuplicatePublicationFormObj.newpublication);
        this.utilsService.notificationWithTranslation('PUBLICATION_ALREADY_EXISTS_ON_SERVER', params);
      }
    }
  }

  projectChangedDuplicateProject(project) {
    if ((!this.utilsService.isPresent(project.publications)) || (project.publications.length < 1)) {
      // this.loadPublicationSelectionData(project, this.constantsService.DUPLICATE_PUBLICATION)
      let requestType = this.constantsService.DUPLICATE_PUBLICATION;
      this.loadPublicationSelectionData.emit({project, requestType})
    } else {
      this.duplicatePublication_array = project.publications;
      this.selectedDuplicatePublication = "";
    }
  }

    setbuttonstyleDuplicatePub() {
    let styles = {
      'background-color': !this.createDuplicatePublicationForm.valid ? 'rgba(0, 0, 0, .12)' : this.sharedDataService._Customization.componentColor.bgColor,
      'color': !this.createDuplicatePublicationForm.valid ? 'rgba(0, 0, 0, .38)' : this.sharedDataService._Customization.componentColor.color,
      'font-family': this.sharedDataService._Customization.font.style
    };
    return styles;
  }

    setFocus(submit) {
    submit.focus();
  }

  public createDuplicatePublicationForm = this.fb.group({
    project: ["", Validators.required],
    publication: ["", Validators.required],
    newpublication: ["", this.utilsService.validateEmptyVal]
  });
}
