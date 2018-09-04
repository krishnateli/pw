import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SharedDataService } from '../../../services/shared-data.service';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { PublicationdtoService } from '../../../dto/publicationdto.service';
import { ProjectService } from '../../../services/project.service';
import { IndexedDBService } from '../../../db/indexeddb.service';
import { ConstantsService } from '../../../services/constants.service';
import { IbUtilsService } from '../../../services/ib-utils.service';
import { UtilsService } from '../../../shared/services/utils.service';


@Component({
  selector: 'new-publication',
  templateUrl: './new-publication.component.html',
  styleUrls: ['./new-publication.component.scss']
})
export class NewPublicationComponent implements OnInit {
  selectedProjectNewPublication: string;
  private _publicationList: PublicationdtoService[] = [];
  selectedlanguageList: any = [];
  selectedMasterPublication: string;

  @Output() loadStackList = new EventEmitter();
  @Output() showLoader = new EventEmitter();
  @Output() projectChangedNewPublication = new EventEmitter();
  @Input('projectsArrayNew') projects_array:any;
  @Input('masterpublicationArray') masterpublication_array:any;
  @Input()languageList:any;
  @Input()last:any;

  constructor(public fb: FormBuilder, public sharedDataService: SharedDataService, private projectService: ProjectService, private indexedDBService: IndexedDBService, private constantsService: ConstantsService, private ibUtilsService: IbUtilsService, private utilsService: UtilsService) { }

  ngOnInit() { 
  }

  public newPublicationForm = this.fb.group({
    project: ["", Validators.required],
    masterpublication: ["", Validators.required],
    publication: ["", this.utilsService.validateEmptyVal],
    description: [""]
  });

    setFocus(submit) {
    submit.focus();
  }

  checkIfSelected(loglang) {
    let langBorder = {
      'opacity': 1,
      'border': '2px solid ' + this.sharedDataService._Customization.icon.selectionColor
    }
    let langUnSelectBorder = {
      'opacity': 'inherit',
      'border': 'inherit'
    }
    let indexOfSelectedLang = this.selectedlanguageList.indexOf(loglang);

    if (indexOfSelectedLang === -1) {
      return langUnSelectBorder;
    } else {
      return langBorder;
    }
  }

  createPublication(event, valid) {
    if (valid) {
      this.showLoader.emit("show");
      let newPublicationFormObj = this.newPublicationForm.getRawValue();
      if (this.selectedlanguageList.length == 0) {
        for (let index in this.last) {
          this.selectedlanguageList.push(this.last[index]);
        }
      }
      var isPublicationNameExists = false;
      for (let index in newPublicationFormObj.project.publications) {
        if (newPublicationFormObj.project.publications[index].name.toUpperCase() == newPublicationFormObj.publication.toUpperCase()) {
          isPublicationNameExists = true;
        }
      }
      this._publicationList = this.sharedDataService.publicationList;
      if ((this._publicationList.length != undefined) && (this._publicationList.length > 0)) {
        for (let index in this._publicationList) {
          if ((this._publicationList[index]._respondata.publication.name.toUpperCase() == newPublicationFormObj.publication.toUpperCase()) && (this._publicationList[index]._respondata.publication.project == newPublicationFormObj.project.name)) {
            isPublicationNameExists = true;
          }
        }
      }

      if (!isPublicationNameExists) {
        this.projectService.createPublication(newPublicationFormObj.project.name, newPublicationFormObj.masterpublication, newPublicationFormObj.publication, newPublicationFormObj.description, this.selectedlanguageList).subscribe(
          (response) => {
            if (response.code == 100) {
              this.indexedDBService.addPublicationInProject(response.publication, newPublicationFormObj.project.name);
              // this.loadStackList(this.constantsService.CREATE_PUBLICATION, response, newPublicationFormObj);
              let requestType = this.constantsService.CREATE_PUBLICATION;
              this.loadStackList.emit({ requestType, response, publicationObject: newPublicationFormObj });
            } else {
              this.showLoader.emit("hide");
              this.ibUtilsService.showIBErrors(response);
            }
          })
      } else {
        this.showLoader.emit("hide");
        let params = [];
        params.push(newPublicationFormObj.publication);
        this.utilsService.notificationWithTranslation('PUBLICATION_ALREADY_EXISTS_ON_SERVER', params);
      }
    }
  }

    setbuttonstyleCreatenewPub() {
      let styles = {
        'background-color': !this.newPublicationForm.valid ? 'rgba(0, 0, 0, .12)' : this.sharedDataService._Customization.componentColor.bgColor,
        'color': !this.newPublicationForm.valid ? 'rgba(0, 0, 0, .38)' : this.sharedDataService._Customization.componentColor.color,
        'font-family': this.sharedDataService._Customization.font.style
      };
      return styles;
    }

    selected_log_lang(loglangid) {
      let indexOfSelectedLogLang = this.selectedlanguageList.indexOf(loglangid);
      if (indexOfSelectedLogLang === -1) {
        this.selectedlanguageList.push(loglangid);
      } else {
        this.selectedlanguageList.splice(indexOfSelectedLogLang, 1);
      }
    }

}
