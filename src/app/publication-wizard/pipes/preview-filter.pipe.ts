import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'previewFilter'
})
export class PreviewFilterPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    let columnNames = [];
      for (let key in value) {
        if (columnNames.indexOf(key) === -1) { 
              let filterarray = Object.keys(value);
              let filterMap = new Map<number, any>();

              for (let index = 0; index < filterarray.length; index++) {
                filterMap.set(value[filterarray[index]].index, filterarray[index]);
              }

              for (let index = 0; index < filterarray.length; index++) {
                columnNames.push(filterMap.get(index));
              }          
        }
    }
    return columnNames;
  }

}
