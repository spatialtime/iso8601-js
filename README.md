# iso8601-js

[![NPM version][npm-image]][npm-url]
[![License][license-image]][license-url]
![Top Language](https://img.shields.io/github/languages/top/spatialtime/iso8601-js?style=flat-square)

## ISO 8601 formatter and parser
Supports all ISO 8601 categories except durations and intervals.

* `YYYY-MM-DDThh:mm:ss.sssZ ` (date/times)
* `YYYY-DDD` (ordinal dates)
* `YYYY-Www-D`, `YYYY-Www` (ISO weeks)

## Installation
You can install **iso8601-js** as an NPM package:

```shell
npm install @spatialtime/iso8601
```

Or link directly to the CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/@spatialtime/iso8601@latest/iso8601.js"></script>
```

## Usage

Methods used for formatting have this naming scheme `'ST.format*'`, while methods used for parsing have this naming scheme `'ST.dateFrom*'`.  All methods are static and as such are to be called without instanciating any classes.

### Datetime strings

Parse ISO 8601 strings into JavaScript Date instances via the function `ST.dateFromISODatetime`.  Pass in a fully-expressed ISO 8601 datetime string adhering ***precisely*** to ECMAScript's simplified extended ISO 8601 format **YYYY-MM-DDTHH:mm:ss.sssZ**, where YYYY is a four-digit year, MM is a zero-padded month (Jan = 01, Dec = 12), DD is a zero-padded month day, HH is a zero-padded hour (0-24), mm represents zero-padded minutes (0-59) and ss.sss represents zero-padded seconds (to three digits after decimal point).  Your ISO string must represent a UTC time.  A `SyntaxError` is thrown if the argument passed to the function fails regular expression matching.

```javascript
const isoString = "2020-02-01T12:12:12.111Z";
let date;
try{
    date = ST.dateFromISODatetime(isoString);
} catch (e) {
    // would be a SyntaxError
    console.error(e); 
    return;
}

console.log("Year", date.getUTCFullYear().toString()); // 2020
console.log("Day of month", date.getUTCDate().toString()); // 1
```

### Ordinal dates

Ordinal dates represent the *n*th day of the year.  For example, the 50th day of 2001 is expressed as **2001-050**.

To parse an ISO 8601 ordinal date string (formatted as **YYYY-DDD**), pass the string into `ST.dateFromISOOrdinalDate(isoOrdinalDate)`. If the string is conformant, a JavaScript Date object will be returned.  If the string is not conformant to ISO 8601, a `SyntaxError` will be thrown. If the string contains date fields that are out of range (valid years are from 1 to 9999 inclusive), a `RangeError` will be thrown.

```javascript
const isoString = "2012-022";
let date;
try{
    date = ST.dateFromISOOrdinalDate(isoString); 
} catch (e) {
    // either a SyntaxError or RangeError
    console.error(e); 
    return;
}
console.log(date.toISOString()); // 2012-01-22T00:00:00.000Z
```

Format a date to an ISO ordinal date string by calling one of two functions—`ST.formatDateAsISOOrdinalDate(year, month, day)` or `formatJSDateAsISOOrdinalDate(jsDate)`, where *jsDate* is a JavaScript Date instance.

```javascript
const jsDate = new Date(Date.UTC(2020,2,1));

let isoString;
try{
    isoString = ST.formatJSDateAsISOOrdinalDate(jsDate); 
} catch (e) {
    // would be a RangeError
    console.error(e); 
    return;
}
console.log(isoString); // 2020-061


let isoString2;
try{
    isoString2 = ST.formatDateAsISOOrdinalDate(2020,12,31); 
} catch (e) {
    // would be a RangeError
    console.error(e); 
    return;
}

console.log(isoString2); // 2020-366
```

### ISO Weeks

ISO 8601 weeks begin on Monday (day 1) and end on Sunday (day 7).  The first ISO week of a year is the first week with a Thursday.  Valid ISO 8601 week syntax is as follows:  **YYYY-Www-d**, where YYYY is a four-digit year (valid year range is 1 to 9999), W is a literal "W", ww is a zero-padded ISO week number (1-53), and d is the ISO day of the week.  A shorter form exists without the day of the week: **YYYY-Www**.

Parse an ISO 8601 week string into a JavaScript Date object by passing it in a call to `ST.dateFromISOWeek(isoWeek)`, where *isoWeek* is of either the long or short form.  If the short form is passed in (and thereby not specifiying a weekday), the date returned will be the Monday of the week submitted.

```javascript
const isoString = "2300-W11-1";
let date;
try{
    date = ST.dateFromISOWeek(isoString); 
} catch (e) {
    // either a SyntaxError or RangeError
    console.error(e); 
    return;
}
console.log(date.toISOString()); // 2300-03-12T00:00:00.000Z
```

Format a date to an ISO week string by calling one of two functions—`ST.formatDateAsISOWeek(year, month, day, wantShortForm)` or `formatJSDateAsISOWeek(jsDate, wantShortForm)`, where *jsDate* is a JavaScript Date instance, and *wantShortForm* is a boolean that controls whether a short-form or a long-form string is emitted.

```javascript
const jsDate = new Date(Date.UTC(2020,2,1));

let isoString;
try{
    isoString = ST.formatJSDateAsISOWeek(jsDate, false); 
} catch (e) {
    // would be a RangeError
    console.error(e); 
    return;
}
console.log(isoString); // 2020-W09-7


let isoString2;
try{
    isoString2 = ST.formatDateAsISOWeek(2020,12,31, true); 
} catch (e) {
    // would be a RangeError
    console.error(e); 
    return;
}

console.log(isoString2); // 2020-W53
```

[npm-image]: https://img.shields.io/npm/v/@spatialtime/iso8601?style=flat-square
[npm-url]: https://www.npmjs.com/package/@spatialtime/iso8601
[license-image]: https://img.shields.io/:license-mit-blue.svg?style=flat-square
[license-url]: LICENSE



[npm-image]: https://img.shields.io/npm/v/pikaday.svg?style=flat-square
[npm-url]: https://npmjs.org/package/pikaday
[license-image]: https://img.shields.io/:license-mit-blue.svg?style=flat-square
[license-url]: LICENSE.md
[downloads-image]: http://img.shields.io/npm/dm/pikaday.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/pikaday
