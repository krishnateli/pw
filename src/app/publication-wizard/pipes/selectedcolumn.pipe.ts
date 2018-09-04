import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'selectedcolumn'
})
export class SelectedColumnPipe implements PipeTransform {

  transform(value: any): any {
    let columnNames = [];
    let columnToIgnore = [];
    for (let i = 0; i < value.length; i++) {
      for (let key in value[i]) {
        if (columnNames.indexOf(key) === -1) {
          if (key !== 'compositeKey' && key !== 'dataSubType' && key !== 'dataType' && key !== 'additionalInfos' && key !== 'displayImage' && key !== 'pageIdFromRule' && key !== 'pk' && key !== 'stackId' && key !== 'templateIdFromRule'
            && key !== 'templateName' && key !== 'toBeSortedBy' && key !== 'linkedImageExists') {
            if (key === 'id') {
              columnNames.splice(0, 0, key);
            } else if (key === 'displayValue') {
              columnNames.splice(0, 0, key);
            } else {
              columnNames.push(key);
            }
          }
        }
      }
    }

    for (let k = 0; k < columnNames.length; k++) {
      let flag = 0;
      for (let j = 0; j < value.length; j++) {
        if ((value[j][columnNames[k]] == null) || (value[j][columnNames[k]].length == 0)) {
          flag++;
        }
      }
      if (value.length == flag) {
        columnToIgnore.push(columnNames[k]);
      }
    }

    for (let l = 0; l < columnToIgnore.length; l++) {
      let index: number = columnNames.indexOf(columnToIgnore[l]);
      if (index !== -1) {
        columnNames.splice(index, 1);
      }
    }

    let arrayFinal = [];
    for (let j = 0; j < value.length; j++) {
      let objectEach = {};
      for (let l = 0; l < columnNames.length; l++) {
        objectEach[columnNames[l]] = value[j][columnNames[l]];
      }
      arrayFinal.push(objectEach);
    }

    return arrayFinal;
  }
}
