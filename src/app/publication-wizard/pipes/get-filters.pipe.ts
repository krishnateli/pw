import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getFilters'
})
export class GetFiltersPipe implements PipeTransform {

  transform(filterList: any, filterNames: any, filterListObject: any): any {

    let filterarray = Object.keys(filterList);
    for (var i = 0; i < filterarray.length; i++) {
      if (filterList != undefined) {
        for (let z = 0; z < filterarray.length; z++) {
          if ((filterList[filterarray[z]].index == i) && (filterListObject.map((el) => el.filterName).indexOf(filterarray[z]) == -1)) {
            filterNames.push(filterarray[z]);
            filterListObject.push({ filterName: filterarray[z], filterObj: filterList[filterarray[z]] });
          }
        }
      }
    }
    return filterListObject;
  }
}
