import { Dictionary } from 'typescript-collections';

export class Expression {

  static regex = new Dictionary<string, RegExp>();

  static is(key: string, str: string): boolean {
    let expr = Expression.regex.getValue(key);
    if (!Expression.regex.containsKey(key)) { throw `${key} is not a valid key in regex`; }
    return Expression.regex.getValue(key).test(str);
  }

}

// ugly regexp init goes here
(() => {
  let ordinal_dict = new Dictionary<string, string>();

  // todo: refactor unit arrays into enums ?
  let days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  let months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  let ordinal_suffixes = ['st', 'nd', 'rd', 'th'];
  let ordinals = [
    'first',
    'second',
    'third',
    'fourth',
    'fifth',
    'last'
  ];

  let units = days.concat(['day', 'week', 'month']);

  // 'abc'                        'abc'        ['a', 'b', 'c']                     /(?:a(?:b(?:c/                ')?)?)?'

  let str_to_subexpression = (str: string) => {
    if (str !== '') {
      return '(?:' + str.split('').reduce((a, b) => `${a}(?:${b}`) + str.split('').map(() => ')?').reduce((a, b) => `${a}${b}`)   // /(?:a(?:b(?:c)?)?)/
    } else return '';
  }

  let abbreviate_unit = (str: string) => {
    str = str.replace(/day$/, '');
    let abbreviation = str.substr(0, 3);
    let remainder = str_to_subexpression(str.substr(3));

    return abbreviation + remainder;
  };

  let day_of_the_week_expression = new RegExp(
    '(' + days.reduce((day_1: string, day_2: string) => {
      let a = day_1.match(/\|/) ? day_1 : abbreviate_unit(day_1);
      let b = abbreviate_unit(day_2);
      // console.log('a:', a, 'b:', b);
      return `${a}|${b}`;
    }) + ')(?:d(?:a(?:y)?)?)?\\s*$'
    , 'i');

  let subject_unit_expression = new RegExp(
    '(' + units.reduce((a, b) => `${a}|${b}`) + ')'
    , 'i');

  let ordinal_expression = new RegExp(
    `((?:[1-5l](?:${ordinal_suffixes.reduce((a, b) => `${a}|${b}`)}))|(${ordinals.reduce((a, b) => `${a}|${b}`)}))`, 'i');

  let scope_unit_expression = new RegExp(
    '(?:^|\\s)((?:' + months.reduce( (a, b) => `${a}|${b}`) + ')|(?:(?:\\d{2}\/)?\\d{4}|0?[1-9]|1[0-2]))(?:$|\\s)'
    , 'i');

  // console.dir(scope_unit_expression);
  Expression.regex.setValue('day of the week', day_of_the_week_expression); // /(sun|mon|tue(?:s)?|wed(?:n(?:e(?:s)?)?)?|thu(?:r(?:s)?)?|fri|sat(?:u(?:r)?)?)(?:d(?:a(?:y)?)?)?\s*$/i
  Expression.regex.setValue('ordinal', ordinal_expression); // /((?:[1-5l]st|nd|rd|th)|(first|second|third|fourth|fifth|last))/i
  Expression.regex.setValue('ordinal unit', subject_unit_expression); // /(sunday|monday|tuesday|wednesday|thursday|friday|saturday|day|week|month)/i
  Expression.regex.setValue('scope unit', scope_unit_expression); // /(?:^|\s)((?:january|february|march|april|may|june|july|august|september|october|november|december)|(?:(?:\d{2}\/)?\d{4}|0?[1-9]|1[0-2]))(?:$|\s)/i
})();
