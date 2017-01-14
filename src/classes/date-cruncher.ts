import { DateParser } from './date-parser';
import { IExpression } from './iexpression';
import { Expression } from './expression';
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
      // console.log('ordinal:', ordinal);
      // console.log('unit:', unit);
      // console.log('container:', container);      
    }
  }

  identify_expression = (str_in: string): IExpression => {
    if (['today', 'now'].includes(str_in)) { return 'today'; }
    else if (str_in == 'yesterday') { return 'yesterday'; }
    else if (str_in == 'tomorrow') { return 'tomorrow'; }
    else if (Expression.regex.getValue('date').test(str_in)) { return 'date'; }
    return null;
  }

  evaluate = (str_in: string): Date => {
    let exp_type = this.identify_expression(str_in);
    let date = new Date();
    switch(exp_type) {
      case 'today': return date;
      case 'tomorrow': date.setDate(date.getDate() + 1); return date;
      case 'yesterday': date.setDate(date.getDate() - 1); return date;
      case 'date': console.log('date!', str_in); break;
      case 'day of the week': break;
      case 'ordinal expression': break;
      case 'ordinal unit': break;
      case 'scope unit': break;
      case 'ordinal date expression': break;
      default: date = null;
    }
    return date;
  }
}
