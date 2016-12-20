import { Dictionary } from 'typescript-collections';

export class DateParser {

  expressions = new Dictionary<string, RegExp>();

  // is = (key: string, ) => {
  //   let expr = this.expressions.getValue(key);
  //   if (!expr) { 
  //     throw `${expr} is not a 'is' key`;
  //   }
  //   else {
  //     return expr.test()
  //   }
  // }
  constructor() {
    // expressions.getValue()
  }

  // is_ordinal = (string): boolean => {
    
  // }

  static parse = (date: Date): string => {
    if (date) {
      let parsedDate = date.toISOString().substring(0, 10).match(/^(\d{4})\-(\d{2})\-(\d{2})/);
      if (parsedDate) {
        let dateString = `${parsedDate[3]}/${parsedDate[2]}/${parsedDate[1]}`;
        return dateString;
      }
    }
    return null;
  }

}
