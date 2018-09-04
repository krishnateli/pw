import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {


  transform(values: any[], filter: any, flag: number): any {

    // if (!values || !values.length) return [];
    if (!filter) return values;

    filter = filter.toUpperCase();

    if (filter && Array.isArray(values)) {

      if (flag === 2) {
        const keys = ['displayValue', 'collection', 'id']
        return values.filter(v => v && keys.some(k => {
          if ((v[k] !== null) && (v[k] !== undefined) && (v[k] !== "")) {
            return v[k].toUpperCase().indexOf(filter) >= 0
          }
        }));
      }
      else {
        const keys = Object.keys(values[0]);

        return values.filter(v => v && keys.some(k => {

          if ((v[k] !== null) && (v[k] !== undefined) && (v[k] !== "")) {

            if (k == 'filters') {
              var flag = 0;
              for (let keyfilter in v[k]) {
                if (v[k][keyfilter]['values'] != null) {
                  if (v[k][keyfilter]['values'][0] != null) {
                    if (v[k][keyfilter]['values'][0].toUpperCase().indexOf(filter) >= 0) {
                      flag = 1;
                    }
                  }
                }
              }

              return flag == 1
            }

            else if (k == 'id' || k == 'displayValue') {

              return v[k].toUpperCase().indexOf(filter) >= 0
            }

          }
        }));
      }
    }
  }

}
