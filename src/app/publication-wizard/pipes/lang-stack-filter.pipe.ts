import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'langStackFilter'
})
export class LangStackFilterPipe implements PipeTransform {

  transform(stackElements: any, language: string, logLanguageConfigured: boolean): any {
    if (logLanguageConfigured) {
      let filteredStackElements: any = [];
      stackElements.map(val => {
        if (val.language == language) {
          filteredStackElements.push(val);
        }
      });
      return filteredStackElements;
    } else {
      return stackElements;
    }
  }

}
