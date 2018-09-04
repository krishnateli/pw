import { Pipe, PipeTransform } from '@angular/core';
import * as $ from 'jquery';

@Pipe({
  name: 'row'
})
export class RowPipe implements PipeTransform {
  transform(value: any, args?: any): any {


    let rowValues: any;
    if (value != null && value != undefined && value != '') {
      rowValues = Object.keys(value);
      this.changeMaxValueOnPageTag();
      let arrayFinal = [];

      for (var l = 0; l < rowValues.length; l++) {
        if (rowValues[l] == 'filters') {

          let filterarray = Object.keys(value['filters']);
          let filterMap = new Map<number, any>();

          for (let index = 0; index < filterarray.length; index++) {
            if (value[rowValues[l]][filterarray[index]]['values'] != null) {
              filterMap.set(value[rowValues[l]][filterarray[index]].index, value[rowValues[l]][filterarray[index]]['values'][0]);
            }else{
              filterMap.set(value[rowValues[l]][filterarray[index]].index, "");
            }
          }

          for (let index = 0; index < filterarray.length; index++) {
            arrayFinal.push(filterMap.get(index));
          }

        }
        else {
          arrayFinal.push(value[rowValues[l]]);
        }
      }
      return arrayFinal;

    }
  }

  changeMaxValueOnPageTag() {
    setTimeout(function () {
      $('mfpaginator>ul:last-child>li:last-child>a').each(function (element) {
        this.innerHTML = "ALL";
      });
    }, 1000);
  }

}
