import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  filterText: any;
  tempArray: any[];

  transform(values: any[], filterT: any, filterArray: any[]): any {

    this.tempArray = values;
    if (!values || !values.length) return [];

    for (let key in filterArray) {
      if (this.tempArray.length > 0) {

        this.filterText = filterArray[key];
        this.filterText = this.filterText.toUpperCase();
        if (this.filterText && Array.isArray(this.tempArray)) {
          const keys = Object.keys(this.tempArray[0]);

          this.tempArray = this.tempArray.filter(v => v && keys.some(k => {

            if (k == key) {
              if (v[k] !== null) {

                return (v[k].toUpperCase() === this.filterText)
              }
            }
            if (k == 'filters') {
              if (v[k] !== null) {
                if (v[k][key]['values'] !== null) {
                  return (v[k][key]['values'][0].toUpperCase() === this.filterText)
                }
              }

            }
          }));
        }
      }
    }
    return this.tempArray;
  }
}
