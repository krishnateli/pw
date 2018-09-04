import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { SharedDataService } from '../../../services/shared-data.service';
import { PublicationdtoService } from '../../../dto/publicationdto.service';
import { ProjectService } from '../../../services/project.service';
import { IndexedDBService } from '../../../db/indexeddb.service';
import { ConstantsService } from '../../../services/constants.service';
import { IbUtilsService } from '../../../services/ib-utils.service';
import { UtilsService } from '../../../shared/services/utils.service';

@Component({
  selector: 'open-publication',
  templateUrl: './open-publication.component.html',
  styleUrls: ['./open-publication.component.scss']
})
export class OpenPublicationComponent implements OnInit {
  selectedPublication: string;
  selectedProject: string;
  author: string = "";
  date: any = "";
  description: any = "";  
  private _publicationList: PublicationdtoService[] = [];

  @Output() showLoader = new EventEmitter();
  @Output() loadStackList = new EventEmitter();
  @Output() loadPublicationSelectionData = new EventEmitter();
  @Input('projectsArray') projects_array:any;
  @Input('PublicationArray') Publication_array:any;

  constructor(public fb: FormBuilder, public sharedDataService: SharedDataService, private projectService: ProjectService, private indexedDBService: IndexedDBService, private constantsService: ConstantsService, private ibUtilsService: IbUtilsService, private utilsService: UtilsService, private router: Router) { }

  ngOnInit() {
   
  }

  projectChanged(project) {
      if ((!this.utilsService.isPresent(project.publications)) || (project.publications.length < 1)) {
        // this.loadPublicationSelectionData(project, this.constantsService.OPEN_PUBLICATION)
        let requestType = this.constantsService.OPEN_PUBLICATION;
        this.loadPublicationSelectionData.emit({ project, requestType });
      } else {
        this.Publication_array = project.publications;
        this.selectedPublication = "";
      }
  }

  publicationChanged(pub) {
    this.author = pub.redactionProperties.author;
    this.date = pub.redactionProperties.dateTime;
    this.description = pub.redactionProperties.subject;
  }

  setFocus(submit) {
    submit.focus();
  }

  openPublication(event, valid) {
    if (valid) {
      this.showLoader.emit("show");
      let openPublicationFormObj = this.openPublicationForm.getRawValue();
      let isNew = true;
      let objPublicationdtoService = null;

      this._publicationList = this.sharedDataService.publicationList;
      if (this._publicationList.length > 0) {
        for (let index in this._publicationList) {
          if ((this._publicationList[index]._respondata.publication.id == openPublicationFormObj.publication.id) && (this._publicationList[index]._respondata.publication.project == openPublicationFormObj.project.name)) {
            isNew = false;
            objPublicationdtoService = this._publicationList[index];
            break;
          }
        }
      }
      if (isNew) {
        this.projectService.openPublication(openPublicationFormObj.project.name, openPublicationFormObj.publication.id).subscribe(
          (response) => {
            if (response.code == 100) {
              this.indexedDBService.updatePublicationInProject(response.publication, openPublicationFormObj.project.name);
              // this.loadStackList(this.constantsService.OPEN_PUBLICATION, response, openPublicationFormObj)
              let requestType = this.constantsService.OPEN_PUBLICATION;
              this.loadStackList.emit({ requestType, response, publicationObject: openPublicationFormObj });
            } else {
              this.showLoader.emit("hide");
              this.ibUtilsService.showIBErrors(response);
            }
          })
      } else {
        objPublicationdtoService._image = "";
        this.sharedDataService.setActivePublication(objPublicationdtoService);
        let activePublicationObject = {
          projectName: "",
          publicationId: ""
        }
        activePublicationObject.publicationId = this.sharedDataService.activePublication._respondata.publication.id;
        activePublicationObject.projectName = this.sharedDataService.activePublication._respondata.publication.project;
        sessionStorage.setItem('activepublication', JSON.stringify(activePublicationObject));
        // sessionStorage.setItem('sessionPublicationList', JSON.stringify(this.sharedDataService.publicationList));
        var activePublicationIndex = this.sharedDataService.publicationList.indexOf(objPublicationdtoService);
        this.sharedDataService.setActivePublicationIndex(activePublicationIndex);
        this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._arrayLogLanguageFlagList = Object.keys(this.sharedDataService.activePublication._respondata.publication.logLanguageOutputFormats);
        this.showLoader.emit("hide");
        this.router.navigate(['/PublicationWizard/builder-elementlist']);
      }
    }
  }

  setbuttonstyleOpenPub() {
    let styles = {
      'background-color': !this.openPublicationForm.valid ? 'rgba(0, 0, 0, .12)' : this.sharedDataService._Customization.componentColor.bgColor,
      'color': !this.openPublicationForm.valid ? 'rgba(0, 0, 0, .38)' : this.sharedDataService._Customization.componentColor.color,
      'font-family': this.sharedDataService._Customization.font.style
    };
    return styles;
  }

  public openPublicationForm = this.fb.group({
    project: ["", Validators.required],
    publication: ["", Validators.required]
  });

}
