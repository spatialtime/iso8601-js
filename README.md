# iso8601-js

[![NPM version][npm-image]][npm-url]
[![License][license-image]][license-url]
![Top Language](https://img.shields.io/github/languages/top/spatialtime/iso8601-js?style=flat-square)

iso8601-js is a formatter and parser for ISO 8601 (extended format version).  It is published as an ES6 module.


## Contents

- [iso8601-js](#iso8601-js)
  - [Contents](#contents)
  - [Installation](#installation)
  - [Datetimes](#datetimes)
    - [Parsing datetimes](#parsing-datetimes)
    - [Formatting datetimes](#formatting-datetimes)
  - [Ordinal dates](#ordinal-dates)
    - [Parsing ordinal dates](#parsing-ordinal-dates)
    - [Formatting ordinal dates](#formatting-ordinal-dates)
  - [ISO weeks](#iso-weeks)
    - [Parsing ISO weeks](#parsing-iso-weeks)
    - [Formatting ISO weeks](#formatting-iso-weeks)
  - [Author](#author)

## Installation

You can install **iso8601-js** as an NPM package:

```shell
npm install @spatialtime/iso8601
```
```html
<script type="module">
    import {dateFromISOOrdinalDate} from './node_modules/@spatialtime/iso8601/iso8601.mjs';
    ...
</script>
```

Or link directly to the CDN:

```html
<script type="module">
    import {dateFromISOOrdinalDate}  from 'https://cdn.jsdelivr.net/npm/@spatialtime/iso8601@latest/iso8601.mjs';
    ...
</script>
```

## Datetimes

ECMAScript standardized on a simplified extended ISO 8601 format with four (sometimes subtle) variations:

    1.  Zulu/UTC time:
            YYYY-MM-DDTHH:mm:ss.sssZ
    2.  Specified time zone offset:
            YYYY-MM-DDTHH:mm:ss.sss±HH:mm
    3.  Local time (no time zone specification):
            YYYY-MM-DDTHH:mm:ss.sss
    4.  Extended years (year field expanded to six digits):
            ±YYYYYY
            (note: this is not supported in my parser)

Where:

    - YYYY = 4-digit year between year 0001 and 9999 inclusive
    - MM = 2-digit month numbered from 01 (Jan) to 12 (Dec)
    - DD = 2-digit day numbering from 01 to 31
    - T = literal "T"
    - HH = 2-digit hours numbering from 00 to 24 (24 being midnight of next day)
    - mm = 2-digit minutes numbering from 00 to 59
    - ss = 2-digit seconds numbering from 00 to 60 (60 used for leap seconds)
    - sss = milliseconds specified to three digits
    - Z = literal "Z" (represents UTC or "zulu" time)

    Punctuation characters (dashes, colons, decimal—are required).


### Parsing datetimes

The argument passed to the parser must match the above syntax ***precisely***.  If it deviates at all, a `SyntaxError` will be thrown.

```javascript
import {dateFromISODatetime} from 'https://cdn.jsdelivr.net/npm/@spatialtime/iso8601@latest/iso8601.mjs';

const isoString = "2020-02-01T12:12:12.111Z";
let date;
try{
    date = dateFromISODatetime(isoString);
} catch (e) {
    // would be a SyntaxError
    console.error(e); 
    return;
}

console.log("Year", date.getUTCFullYear().toString()); // 2020
console.log("Day of month", date.getUTCDate().toString()); // 1
```

### Formatting datetimes


```javascript
// Passing a string to new Date() is cross-implementation-safe only if the 
// format of the string conforms to ECMAScript's specified format.
// From the specification (https://tc39.es/ecma262/#sec-date.parse):
// " If the String does not conform to that format the function may fall 
// back to any implementation-specific heuristics or implementation-specific date formats. "
// As such, we are good to go here with passing it a correct ISO 8601 date/time string.

let d = new Date("2020-04-02T13:00:00.000Z");

// Extracting date/time fields from a fixed-width ISO 8601 string is a breeze!

// isoDateTime will be formatted as: YYYY-MM-DDTHH:mm:ss.sssZ
let isoDateTime = d.toISOString();

let isoYear = isoDateTime.substr(0,4) // "2020"
let isoYearMonth = isoDateTime.substr(0,7); // "2020-04"
let isoDate =  isoDateTime.substr(0,10); // "2020-04-02"
let isoHourMinute = isoDateTime.substr(11,5); // "13:00"
let isoTime = isoDateTime.substr(11);  // "13:00:00.000Z"
```

## Ordinal dates

Ordinal dates represent the *n*th day of the year.  For example, the first day of 2020 is expressed as **2020-001**, while the last day of 2020 is expressed as **2020-366** (366 because 2020 is a leap year). 

The official ISO 8601 ordinal format is **YYYY-DDD**, with:

    - YYYY = 4-digit year between years 0001 and 9999 inclusive
    - DDD = 3-digit day between 001 and last day of year (365 or 366)


### Parsing ordinal dates

```javascript
import {dateFromISOOrdinalDate}  from 'https://cdn.jsdelivr.net/npm/@spatialtime/iso8601@latest/iso8601.mjs';

const isoString = "2012-022";
let date;
try{
    date = dateFromISOOrdinalDate(isoString); 
} catch (e) {
    // either a SyntaxError or RangeError
    console.error(e); 
    return;
}
console.log(date.toISOString()); // 2012-01-22T00:00:00.000Z
```


### Formatting ordinal dates

```javascript
import {formatJSDateAsISOOrdinalDate, formatDateAsISOOrdinalDate}  from 'https://cdn.jsdelivr.net/npm/@spatialtime/iso8601@latest/iso8601.mjs';

// method 1:  pass in a JavaScript Date 
const jsDate = new Date(Date.UTC(2020,0,1));

let isoString;
try{
    isoString = formatJSDateAsISOOrdinalDate(jsDate); 
} catch (e) {
    // would be a RangeError
    console.error(e); 
    return;
}
console.log(isoString); // 2020-001

// method 2:  pass in year, month and day
let isoString2;
try{
    isoString2 = formatDateAsISOOrdinalDate(2020,1,1); // 1-based months
} catch (e) {
    // would be a RangeError
    console.error(e); 
    return;
}
console.log(isoString2); // 2020-001
```

## ISO weeks

ISO 8601 weeks begin on Monday (day 1) and end on Sunday (day 7).  The first ISO week of a year is the week that contains January 4th.

The official ISO 8601 week syntax comes in a long form **YYYY-Www-D**, and a short form **YYYY-Www**, with:

    - YYYY = 4-digit year between years 0001 and 9999 inclusive
    - W = literal "W"
    - ww = 2-digit ISO week number that ranges from 01 to 53 (most years have 52 ISO weeks)
    - D = ISO day of week, starting at 1 (Monday) and ending at 7 (Sunday)

The parsers and formatters below support both the long and short forms.  

### Parsing ISO weeks

```javascript
import {dateFromISOWeek}  from 'https://cdn.jsdelivr.net/npm/@spatialtime/iso8601@latest/iso8601.mjs';

const isoString = "2300-W11-1";
let date;
try{
    date = dateFromISOWeek(isoString); 
} catch (e) {
    // either a SyntaxError or RangeError
    console.error(e); 
    return;
}
console.log(date.toISOString()); // 2300-03-12T00:00:00.000Z
```

### Formatting ISO weeks

```javascript
import {formatJSDateAsISOWeek, formatDateAsISOWeek}  from 'https://cdn.jsdelivr.net/npm/@spatialtime/iso8601@latest/iso8601.mjs';

const jsDate = new Date(Date.UTC(2020,2,1));

let isoString;
try{
    isoString = formatJSDateAsISOWeek(jsDate, false); 
} catch (e) {
    // would be a RangeError
    console.error(e); 
    return;
}
console.log(isoString); // 2020-W09-7


let isoString2;
try{
    isoString2 = formatDateAsISOWeek(2020,12,31, true); 
} catch (e) {
    // would be a RangeError
    console.error(e); 
    return;
}
console.log(isoString2); // 2020-W53
```

## Author

* Matt Savage matt@spatialtime.com 

Copyright © 2020 Matt Savage | MIT license

[npm-image]: https://img.shields.io/npm/v/@spatialtime/iso8601?style=flat-square
[npm-url]: https://www.npmjs.com/package/@spatialtime/iso8601
[license-image]: https://img.shields.io/:license-mit-blue.svg?style=flat-square
[license-url]: LICENSE
