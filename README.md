###date-cruncher

date-cruncher is a string-centric date calculator class.

###installation

```code
npm i --save typescript-collections
npm i --save date-cruncher
```

###example usage

```typescript
import {DateCruncher as dc} from 'date-cruncher';

//
// math expressions
//

// add one day to 10/7/2016 and round up to the nearest business day
// ( a business day is neither a weekend nor a U.S. federal holiday).
// per 5 USC 6103 http://uscode.house.gov/view.xhtml?edition=prelim&req=granuleid%3AUSC-prelim-title5-section6103&f=treesort&fq=true&num=0
let date: Date = dc.evaluate('10/07/2016 + 1 day round up');

// sets date to a date object 10/11/2016

// add one day to 10/7/2016 and round up to the nearest business day
// and print the steps taken along the way.

date = dc.evaluate('10/07/2016 + 1 day round up', (e) => { console.log(e); });      // <-- use this callback function to populate an explanation

// sets date to a date object 10/11/2016
// prints the following:
/*
10/7/2016 + 1 day is 10/8/2016
10/8/2016 is a Saturday
10/9/2016 is a Sunday
10/10/2016 is Columbus Day
the next business day is 10/11/2016
*/

date = dc.evaluate('10/07/2016 + 1 day round up', (e) => { console.log(e); });

// sets date to a date object 4/3/2017
// prints the following:
/*
10/7/2016 + 6 calendar months is 5/1/2017
5/1/2017 - 30 days is 4/1/2017
4/1/2017 is a Saturday
4/2/2017 is a Sunday
the next business day is 4/3/2017
*/

date = dc.evaluate('10/07/2016 + 3 business days');
// sets date to a date object 10/13/2016

//
// ordinal expressions
//

date = dc.evaluate('10/07/2016 third thursday');

// sets date to a date object 10/20/2016, the 3rd thursday in October 2016

date = dc.evaluate('10/07/2016 2nd fri');

// sets date to a date object 10/14/2016, the 2nd friday in October 2016

date = dc.evaluate('10/07/2016 first tue');

// sets date to a date object 10/4/2016, the 1st tuesday in October 2016

date = dc.evaluate('10/07/2016 last thursday');

// sets date to a date object 10/27/2016, the last thursday in October 2016
```

###fyi

####no locale support

this lib does not support locales. it only supports U.S. dates and holidays.


avoid saying:

```typescript
import {DateCruncher as dc} from 'date-cruncher';

let d = new Date();
let expression = d.toLocaleDateString() + ' 3rd wednesday';
```

internet explorer 11 likes to throw in U+200E text-direction marks around the month day and year and date-cruncher doesn't accommodate this behavior.

instead, say:

```typescript
import {DateCruncher as dc} from 'date-cruncher';

let d = new Date();
let expression = dc.resolveDateString(d) + ' 3rd wednesday';
```
