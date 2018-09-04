import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'unique'
})
export class UniquePipe implements PipeTransform {

	transform(value: any[], col: string): any {
		let obj = {};

		for (let i = 0; i < value.length; i++) {
			var getVal = value[i]['filters'][col] ? value[i]['filters'][col]['values']?value[i]['filters'][col]['values'][0]:"": "";

			obj[getVal] = true;

		}
		value = [];

		for (let key in obj) {
			if ((key !== 'null') && (key !== null)) {
				if (key !== "") {
					value.push(key);
				}

			}
		}

		if (value.length != 0) {

			return Object.assign([], value);
		}

	}

}
