import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customfilter'
})
export class CustomfilterPipe implements PipeTransform {

  transform(value: any, filterIndex: any, tableType: any): any {
    let columnNames = [];
    if (tableType == "Stack") {
      for (let i = 0; i < filterIndex.length; i++) {
        columnNames.push(filterIndex[i].filterName);
      }
    }
    else {
      for (let i = 0; i < value.length; i++) {
        for (let filtersKey in value[i].filters) {
          if (columnNames.indexOf(filtersKey) === -1) {
            columnNames.splice(value[i].filters[filtersKey]['index'], 0, filtersKey);
          }
        }
      }
    }
    return columnNames;
  }

}
