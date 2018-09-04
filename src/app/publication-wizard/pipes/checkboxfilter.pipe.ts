import { Pipe, PipeTransform } from '@angular/core';
import { SharedDataService } from '../../services/shared-data.service';

@Pipe({
  name: 'checkboxfilter'
})
export class CheckboxfilterPipe implements PipeTransform {

  filterText: any;
  valueArray: any[];
  _tempArray: any[];
  tempArray: any[];
  filterLength: any;

  transform(values: any[], filterArray: any[], filterT: any, filterT1: any, change: any): any {

    this.valueArray = values;
    if (!values || !values.length) return [];

    for (let key in filterArray) {
      if (typeof filterArray[key] == "string") {
        this.filterLength = 1;
      }
      else {
        this._tempArray = this.valueArray;
        this.filterLength = filterArray[key].length;
      }

      if (this.valueArray.length > 0) {
        for (let i = 0; i < this.filterLength; i++) {
          if (i < 1) {
            if (typeof filterArray[key] == "string") {
              this.filterText = filterArray[key];
              this.filterText = this.filterText.toUpperCase();
            }
            else {
              this.filterText = filterArray[key][i];
              this.filterText = this.filterText.toUpperCase();
            }
            if (this.filterText && Array.isArray(this.valueArray)) {
              const keys = Object.keys(this.valueArray[0]);
              this.valueArray = this.valueArray.filter(v => v && keys.some(k => {
                if (k == 'filters') {
                  if (v[k] !== null && v[k] !== undefined && v[k] !== [] && v[k][key] !== null && v[k][key] !== undefined && v[k][key] !== []) {
                    if (v[k][key]['values'] !== null && v[k][key]['values'] !== undefined && v[k][key]['values'] !== []) {
                      return (v[k][key]['values'][0].toUpperCase() === this.filterText)
                    }
                  }
                }
                else if (k == 'productStateValid' && key == "status") {
                  if (v[k] !== null && v[k] !== undefined && v[k] !== []) {
                    return (v[k].toUpperCase() === this.filterText)
                  }
                }
              }));
            }
          }

          else {
            if (this.valueArray.length > 0 && (this._tempArray[0] != null || this._tempArray[0] != undefined)) {
              this.filterText = filterArray[key][i];
              this.filterText = this.filterText.toUpperCase();
              if (this.filterText && Array.isArray(this._tempArray)) {
                const keys = Object.keys(this._tempArray[0]);
                this.tempArray = (this._tempArray.filter(v => v && keys.some(k => {
                  if (k == 'filters') {
                    if (v[k] !== null && v[k] !== undefined && v[k] !== [] && v[k][key] !== null && v[k][key] !== undefined && v[k][key] !== []) {
                      if (!(v[k] && (Object.keys(v[k]).length === 0))) {
                        if (v[k][key]['values'] !== null && v[k][key]['values'] !== undefined && v[k][key]['values'] !== []) {
                          return (v[k][key]['values'][0].toUpperCase() === this.filterText)
                        }
                      }
                    }
                  }
                })));
                for (let row of this.tempArray) {
                  this.valueArray.push(row);
                }
              }
            }
          }
        }
      }
    }
    return this.valueArray;
  }
}
