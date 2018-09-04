import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'column'
})
export class ColumnPipe implements PipeTransform {
  transform(value: any, Id: string, DisplayValue: string): any {

    let columnNames = [];

    if (value.length > 0) {
      for (let key in value[0]) {
        if (columnNames.indexOf(key) === -1) {
          if (key !== Id && key !== DisplayValue) {

            if (key == 'filters') {

              let filterarray = Object.keys(value[0]['filters']);
              let filterMap = new Map<number, any>();

              for (let index = 0; index < filterarray.length; index++) {
                filterMap.set(value[0][key][filterarray[index]].index, filterarray[index]);
              }

              for (let index = 0; index < filterarray.length; index++) {
                columnNames.push(filterMap.get(index));
              }

            } else {
              columnNames.push(key);
            }
          }
        }
      }

    }

    return columnNames;
  }

}
