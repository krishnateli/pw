import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'displaydata'
})
export class DisplaydataPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    let rowValues: any;
    let columnNames = [];
    let columnToIgnore = [];
    if (value != null) {
      for (let key in value) {
        if (columnNames.indexOf(key) === -1) {
          if (key !== 'id' && key !== 'displayValue' && key !== 'compositeKey' && key !== 'dataSubType' && key !== 'dataType' && key !== 'displayImage' && key !== 'pageIdFromRule' && key !== 'pk' && key !== 'stackId' && key !== 'templateIdFromRule'
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

      for (let k = 0; k < columnNames.length; k++) {
        if ((value[columnNames[k]] == null) || (value[columnNames[k]].length == 0)) {
          columnToIgnore.push(columnNames[k]);
        }
      }

      for (let l = 0; l < columnToIgnore.length; l++) {
        let index: number = columnNames.indexOf(columnToIgnore[l]);
        if (index !== -1) {
          columnNames.splice(index, 1);
        }
      }
      if((columnNames!=undefined)&&(columnNames!=null)&&(columnNames.length>0)){
        if(columnNames[0]=='additionalInfos'){
          columnNames.push(columnNames.shift());
        }
        
            }

      let objectEach = {};
      for (let l = 0; l < columnNames.length; l++) {
        objectEach[columnNames[l]] = value[columnNames[l]];
      }
      
      rowValues = Object.keys(objectEach);
          return rowValues;
    }
  }

}
