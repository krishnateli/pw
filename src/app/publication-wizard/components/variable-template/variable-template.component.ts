import { Component, Input } from '@angular/core';

import { UtilsService } from "../../../shared/services/utils.service";
import { IbUtilsService } from "../../../services/ib-utils.service";
import { SharedDataService } from "../../../services/shared-data.service";


@Component({
  selector: 'app-variable-template',
  templateUrl: './variable-template.component.html',
  styleUrls: ['./variable-template.component.scss']
})
export class VariableTemplateComponent {


  @Input() variableData: any;
  @Input() variableType: string;


  constructor(public utilsService: UtilsService, private ibUtilsService: IbUtilsService, public sharedDataService: SharedDataService) { }


  onChangeOfPageVariable(selectedValue, variable, pageId) {
    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    this.ibUtilsService.removePreviewedPages(pageId);
    var obj = {};
    obj['isSelected'] = true;
    variable.selectedValues = [];
    if (variable.valueType == 'Boolean') {
      if (selectedValue) {
        obj['value'] = "1";
      } else {
        obj['value'] = "0";
      }
      variable.selectedValues.push(obj);
    } else if (variable.type == "Vector" && !variable.withLOV) {
      if (selectedValue.length != 0) {
        for (let sValue of selectedValue) {
          obj['value'] = sValue;
          variable.selectedValues.push(this.utilsService.deepCopy(obj));
        }
      }
    } else {
      obj['value'] = selectedValue;
      variable.selectedValues.push(obj);
    }
    let pageIndex = currentPublication._pubItems.map((el) => el.id).indexOf(pageId);
    currentPublication._isChange = true;
    let tempVariables = this.utilsService.deepCopy(currentPublication._pageVariables);
    this.ibUtilsService.removeSelectedValueFromTempVariables(tempVariables);
    currentPublication._pubItems[pageIndex].variables = [];
    currentPublication._mainPubItems[pageIndex].variables = [];
    currentPublication._pubItems[pageIndex].variables = tempVariables;
    currentPublication._mainPubItems[pageIndex].variables = tempVariables;
  }

  onChangeOfVariable(selectedValue, variable, pageId, areaId, elemIndex) {
    let currentPublication = this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex];
    this.ibUtilsService.removePreviewedPages(pageId);
    var obj = {};
    obj['isSelected'] = true;
    variable.selectedValues = [];
    if (variable.valueType == 'Boolean') {
      if (selectedValue) {
        obj['value'] = "1";
      } else {
        obj['value'] = "0";
      }
      variable.selectedValues.push(obj);
    } else if (variable.type == "Vector" && !variable.withLOV) {
      if (selectedValue.length != 0) {
        for (let sValue of selectedValue) {
          obj['value'] = sValue;
          variable.selectedValues.push(this.utilsService.deepCopy(obj));
        }
      }
    } else {
      obj['value'] = selectedValue;
      variable.selectedValues.push(obj);
    }
    let pageIndex = currentPublication._pubItems.map((el) => el.id).indexOf(pageId);
    if (pageIndex > -1) {
      let areaIndex = currentPublication._pubItems[pageIndex].pagePlanItemAreaDetailsList.map((el) => el.id).indexOf(areaId);
      currentPublication._isChange = true;

      let tempVariables = this.utilsService.deepCopy(currentPublication._elemVariables.result);
      this.ibUtilsService.removeSelectedValueFromTempVariables(tempVariables);

      currentPublication._pubItems[pageIndex].pagePlanItemAreaDetailsList[areaIndex].areaAssignment.assignedElements[elemIndex].template.variableCollection = [];
      currentPublication._mainPubItems[pageIndex].pagePlanItemAreaDetailsList[areaIndex].areaAssignment.assignedElements[elemIndex].template.variableCollection = [];
      currentPublication._pubItems[pageIndex].pagePlanItemAreaDetailsList[areaIndex].areaAssignment.assignedElements[elemIndex].template.variableCollection = tempVariables;
      currentPublication._mainPubItems[pageIndex].pagePlanItemAreaDetailsList[areaIndex].areaAssignment.assignedElements[elemIndex].template.variableCollection = tempVariables;
    }
  }

}
