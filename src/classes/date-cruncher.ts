import { DateParser } from './date-parser';
import { Dictionary } from 'typescript-collections';

export class DateCruncher {
  
  expressions = new Dictionary<string, RegExp>();
  
  constructor() {
    // setup RegExps
    this.expressions.setValue('ordinal expression', /(?:the\s+)?([1-5l](?:st|nd|rd|th))\s+(sun|mon|tues?|wed(?:n?e?s?)?|thu(?:r?s?)?|fri|sat(?:u?r?)|day|week|month)\s+(?:in\s+)?(\d{2}|\d{2}\/\d{4})/i);
  }

  parse_expression = (expression: string) => {
    if (this.expressions.getValue('ordinal expression').test(expression)) {
      let results = this.expressions.getValue('ordinal expression').exec(expression);
      let ordinal = results[1];
      let unit = results[2];
      let container = results[3];
      console.log('ordinal:', ordinal);
      console.log('unit:', unit);
      console.log('container:', container);
      
    }
  }

  evaluate = (expression: string): Date => {
    this.parse_expression(expression);
    console.log('expression', 'ordinal expression', this.expressions.getValue('ordinal expression').test(expression));
    return null;
  }
  


}
