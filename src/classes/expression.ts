import { Dictionary } from 'typescript-collections';

export class Expression {

  static regex = new Dictionary<string, RegExp>();

  static is(key: string, str: string): boolean {
    let expr = Expression.regex.getValue(key);
    if (!Expression.regex.containsKey(key)) { throw `${key} is not a valid key in regex`; }
    return Expression.regex.getValue(key).test(str);
  }
  static expressions = ['today' , 'date' , 'yesterday' , 'tomorrow' , 'day of the week' , 'ordinal expression' , 'ordinal unit' , 'scope unit' , 'ordinal date expression' , 'date math expression'];
}

// ugly regexp init goes here
(() => {
  let ordinal_dict = new Dictionary<string, string>();

  // todo: refactor unit arrays into enums ?
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const units = days.concat(['day', 'week', 'month', 'year']);
  const ordinal_units = units.filter( x => x != 'year');
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const ordinal_suffixes = ['st', 'nd', 'rd', 'th'];
  const ordinals = [
    'first',
    'second',
    'third',
    'fourth',
    'fifth',
    'last'
  ];


  console.dir
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

  /**
   * turn ['a', 'b', 'c', 'd']
   * into a|b|c|d
   */
  let orify = (arr: string[]) => arr.reduce((a, b) => `${a}|${b}`);


  const today_expression = /(?:today|now)/
  const yesterday_expression = /yesterday/;
  const tomorrow_expression = /tomorrow/;

  const date_expression = new RegExp(
  `^(${today_expression.source}|(?:(?:\\d{2}[\\.\\-\\/]\\d{2}[\\.\\-\\/]\\d{4})|(?:\\d{4}[\\.\\-\\/]\\d{2}[\\.\\-\\/]\\d{2})))`
  , 'i');

  const operator_expression = new RegExp(
  `([\\+\\-])`
  , 'i');

  const type_of_day_expression = new RegExp(
  `(calendar|work|business)`
  ,'i');

  const day_of_the_week_expression = new RegExp(
    '(' + days.reduce((day_1: string, day_2: string) => {
      const a = day_1.match(/\|/) ? day_1 : abbreviate_unit(day_1);
      const b = abbreviate_unit(day_2);
      // console.log('a:', a, 'b:', b);
      return `${a}|${b}`;
    }) + ')(?:d(?:a(?:y)?)?)?\\s*$'
    , 'i');

  const expressions_expression = new RegExp(`(?:${orify(Expression.expressions)})`)

  const subject_unit_expression = new RegExp(
    `(?:${orify(ordinal_units)})`
    , 'i');

  const ordinal_expression = new RegExp(`((?:[1-5l](?:${orify(ordinal_suffixes)}))|(${orify(ordinals)}))`, 'i');

  const unit_expression = new RegExp(
    `(?:${orify(units)})s?`
  , 'i');

  const scope_unit_expression = new RegExp(
    `((?:${orify(months)})|(?:(?:\\d{2}\\/)?\\d{4}|0?[1-9]|1[0-2]))`
    , 'i');

  const ordinal_date_expression = RegExp(
    // `(?:the\\s+)?${ordinal_expression.source}\\s+${subject_unit_expression.source}\\s+(?:(?:in|of)\\s+)?${scope_unit_expression.source}`
    `(?:the\\s+)?${ordinal_expression.source}\\s+${subject_unit_expression.source}\\s+(?:(?:in|of)\\s+)?${scope_unit_expression.source}$`
  , 'i');

  const date_math_expression = RegExp(
    `${date_expression.source}\\s+${operator_expression.source}\\s+\\d+\\s+?(${type_of_day_expression.source}\\s+)?${unit_expression.source}$`
  , 'i');

  // console.dir(scope_unit_expression);
  // console.dir(ordinal_date_expression);
  // console.log(date_expression.source);
  Expression.regex.setValue('today', today_expression);
  Expression.regex.setValue('date', date_expression);
  Expression.regex.setValue('yesterday', yesterday_expression);
  Expression.regex.setValue('tomorrow', tomorrow_expression);
  Expression.regex.setValue('day of the week', day_of_the_week_expression); // /(sun|mon|tue(?:s)?|wed(?:n(?:e(?:s)?)?)?|thu(?:r(?:s)?)?|fri|sat(?:u(?:r)?)?)(?:d(?:a(?:y)?)?)?\s*$/i
  Expression.regex.setValue('ordinal expression', ordinal_expression); // /((?:[1-5l]st|nd|rd|th)|(first|second|third|fourth|fifth|last))/i
  Expression.regex.setValue('ordinal unit', subject_unit_expression); // /(sunday|monday|tuesday|wednesday|thursday|friday|saturday|day|week|month)/i
  Expression.regex.setValue('scope unit', scope_unit_expression); // /(?:^|\s)((?:january|february|march|april|may|june|july|august|september|october|november|december)|(?:(?:\d{2}\/)?\d{4}|0?[1-9]|1[0-2]))(?:$|\s)/i
  Expression.regex.setValue('ordinal date expression', ordinal_date_expression); // /(?:the\s+)?((?:[1-5l](?:st|nd|rd|th))|(first|second|third|fourth|fifth|last))\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday|day|week|month)\s+(?:(?:in|of)\s+)?(?:^|\s)((?:january|february|march|april|may|june|july|august|september|october|november|december)|(?:(?:\d{2}\/)?\d{4}|0?[1-9]|1[0-2]))(?:$|\s)\$/i
  Expression.regex.setValue('date math expression', date_math_expression); 
})();
