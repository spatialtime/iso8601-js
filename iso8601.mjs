//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------
const MIN_YEAR =1;
const MAX_YEAR = 9999;
const MIN_MONTH = 1;
const MAX_MONTH = 12;
const MIN_DAY = 1;
const MIN_HOUR = 0;
const MAX_HOUR = 24;
const MIN_MINUTE = 0;
const MAX_MINUTE = 59;
const MIN_SECOND = 0;
const MAX_SECOND = 60;

const MILLISECONDS_PER_DAY = 86400000

/*
 * dateFromISODatetime creates a JavaScript date from a string that adheres to 
 * ECMAScript's specified syntax:
 *  Zulu/UTC time:   
 *      YYYY-MM-DDTHH:mm:ss.sssZ  
 *  Specified time zone offset: 
 *      YYYY-MM-DDTHH:mm:ss.sss±HH:mm
 *  Local time (no time zone specification): 
 *      YYYY-MM-DDTHH:mm:ss.sss
 */
let dateFromISODatetime = function (isoString) {
    const DATE_REGEX =   /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}.\d{3})(Z|(?:(?:-|\+)\d{2}:\d{2}))?$/;

    const matches = isoString.match(DATE_REGEX);
    if (matches === null) {
        throw new SyntaxError("Invalid date attribute");
    }

    let year = parseInt(matches[1]);
    if (year < MIN_YEAR || year > MAX_YEAR) {
        throw new RangeError(`Year must be >= ${MIN_YEAR} and <= ${MAX_YEAR}`);
    }

    let month = parseInt(matches[2]);
    if (month < MIN_MONTH || month > MAX_MONTH) {
        throw new RangeError(`Month must be >= ${MIN_MONTH} and <= ${MAX_MONTH}`);
    }

    let dayCount = monthDayCount(month, year);
    let day = parseInt(matches[3]);
    if (day < MIN_DAY || day > dayCount) {
        throw new RangeError(`Day must be >= ${MIN_DAY} and <= ${dayCount}`);
    }

    let hour = parseInt(matches[4]);
    if (hour < MIN_HOUR || hour > MAX_HOUR) {
        throw new RangeError(`Hour must be >= ${MIN_HOUR} and <= ${MAX_HOUR}`);
    }

    let minute = parseInt(matches[5]);
    if (minute < MIN_MINUTE || minute > MAX_MINUTE) {
        throw new RangeError(`Minutes must be >= ${MIN_MINUTE} and <= ${MAX_MINUTE}`);
    }

    let second = parseInt(matches[6]);
    if (second < MIN_SECOND || second > MAX_SECOND) {
        throw new RangeError(`Seconds  must be >= ${MIN_SECOND} and <= ${MAX_SECOND}`);
    }

    return new Date(isoString);
}


/*
 * dateFromISOWeek creates a JavaScript date from a string 
 * that adheres to either of ISO 8601'S ISO week formats: 
 * [a] short: YYYY-Www, [b] long: YYYY-Www-d 
 */
let dateFromISOWeek = function (isoWeek) {
    const ISOWEEK_REGEX = /^(\d{4})-W([0-5]\d)(?:-([1-7]))?$/;

    let matches = isoWeek.match(ISOWEEK_REGEX);
    if (matches === null) {
        throw new SyntaxError("Invalid ISO week syntax");
    }

    let year = parseInt(matches[1]);
    if (year < MIN_YEAR || year > MAX_YEAR) {
        throw new RangeError(`Year must be >= ${MIN_YEAR} and <= ${MAX_YEAR}`);
    }

    let week = parseInt(matches[2])
    if (week <= 0 || week > weeksInISOYear(year)) {
        throw new RangeError(`Week must be > 0 and <= the ISO week count for the year in question.`);
    }

    let day
    if (matches[3]) {
        day = parseInt(matches[3]);
    } else {
        day = 1
    }

    let ordinalDate = ordinalDateFromWeekDate(year, week, day);
    let time = timeFromYear(year) + (ordinalDate -1)*MILLISECONDS_PER_DAY;
    return new Date(time)    
}


/*
 * formatDateAsISOWeek formats a date to ISO 8601 week format specification.
 * By default, it returns the long form, YYYY-Www-d,  
 * but will return short form, YYYY-Www, if wantShortForm is set to true.
 */
let formatDateAsISOWeek = function (year, month, day, wantShortForm) {

    // validate parameters
    if (year < MIN_YEAR || year > MAX_YEAR) {
        throw new RangeError(`Year must be >= ${MIN_YEAR} and <= ${MAX_YEAR}`);
    }
    if (month < MIN_MONTH || month > MAX_MONTH) {
        throw new RangeError(`Month must be >= ${MIN_MONTH} and <= ${MAX_MONTH}`);
    }
    const leapYear = isLeapYear(year);
    const dayCount = monthDayCount(month, leapYear);
    if (day < MIN_DAY || day > dayCount) {
        throw new RangeError(`Day must be >= ${MIN_DAY} and <= ${dayCount}`);
    }

    const doy = monthStartDay(month, isLeapYear(year)) + day - 1;
    const dow = weekday(year, month,day)+1
    let woy = Math.floor((doy-dow+10)/7)
    if(woy ===0){
        --year;
        woy = weeksInISOYear(year);
    } else if (woy===53){
        if(weeksInISOYear(year) === 52){
            ++year;
            woy = 1;
        }
    } 
    const woyString = woy.toString().padStart(2,"0");
    if (wantShortForm) {
        return `${year}-W${woyString}`;
    } else {
        return `${year}-W${woyString}-${dow}`;
    }
}


/*
 * formatJSDateAsISOWeek formats a JavaScript Date instance 
 * to ISO 8601 week format specification.
 * By default, it returns the long form, YYYY-Www-d,  
 * but will return short form, YYYY-Www, if wantShortForm is set to true.
 * Note: to avoid all sorts of complications on your end, pass in a UTC date.
 */
let formatJSDateAsISOWeek = function (jsDate, wantShortForm) {
    return formatDateAsISOWeek(jsDate.getUTCFullYear(), jsDate.getUTCMonth()+1,
        jsDate.getUTCDate(), wantShortForm);
}


/*
 * dateFromISOOrdinalDate parses and validates 
 * an ISO 8601 ordinal date string and returns a JavaScript Date.
 * ISO 8601 ordinal date format:  YYYY-ddd
 */
let dateFromISOOrdinalDate = function (isoOrdinalDate) {
    const ORDINALDATE_REGEX = /^(\d{4})-(\d{3})$/;

    const matches = isoOrdinalDate.match(ORDINALDATE_REGEX);
    if (matches === null) {
        throw new SyntaxError("Invalid ordinal date string");
    }

    const year = parseInt(matches[1]);

    const doy = parseInt(matches[2]);
    const maxDay = daysInYear(year);
    if (doy <= 0 || doy > maxDay) {
        throw new RangeError(`Day must be >= 1 and <= ${maxDay}.`);
    }

    return new Date(timeFromYear(year) + (doy-1)*MILLISECONDS_PER_DAY)
}


/*
 * formatDateAsISOOrdinalDate formats a date to an 
 * ISO 8601 ordinal date string.  
 * Note: month is 1-based (as opposed to JavaScript's 0-based).
 * January is month 1...December is month 12.
 */
let formatDateAsISOOrdinalDate = function (year, month, day) {
    if (year < MIN_YEAR || year > MAX_YEAR) {
        throw new RangeError(`Year must be >= ${MIN_YEAR} and <= ${MAX_YEAR}`);
    }
    if (month < MIN_MONTH || month > MAX_MONTH) {
        throw new RangeError(`Month must be >= ${MIN_MONTH} and <= ${MAX_MONTH}`);
    }
    const leapYear = isLeapYear(year);
    const dayCount = monthDayCount(month, leapYear);
    if (day < MIN_DAY || day > dayCount) {
        throw new RangeError(`Day must be >= ${MIN_DAY} and <= ${dayCount}`);
    }
    const doy = monthStartDay(month, leapYear) + day - 1;
    return year.toString().padStart(4, '0') + "-" + doy.toString().padStart(3, '0');
}


/*
 * formatJSDateAsISOOrdinalDate formats a JavaScript Date instance to an
 * ISO 8601 ordinal date string.
 * Note: to avoid all sorts of complications on your end, pass in a UTC date.
 */
let formatJSDateAsISOOrdinalDate = function (jsDate) {
    return formatDateAsISOOrdinalDate(jsDate.getUTCFullYear(), jsDate.getUTCMonth()+1,
        jsDate.getUTCDate());
}


/*
 * monthDayCount returns number of days in a given month.
 */
function monthDayCount(month, leapYear) {
    switch (month) {
        case 1:
        case 3:
        case 5:
        case 7:
        case 8:
        case 10:
        case 12:
            return 31;
        case 4:
        case 6:
        case 9:
        case 11:
            return 30;
        case 2:
            return leapYear ? 29 : 28;
        default:
            throw new RangeError(`Month must be >= ${MIN_MONTH} and <= ${MAX_MONTH}`);
    }
}

/*
 * Zeller's congruence.  Computes day of week for any day.
 * Returns integer representing day of week (Monday=0...Sunday=6).
 */
function weekday(year, month, day) {
    if (month === 1) {
        month = 13;
        year--;
    } else if (month === 2) {
        month = 14;
        year--;
    }

    let dow = Math.floor(day + (13 * (month + 1) / 5) + year +
        Math.floor(year / 4) - Math.floor(year / 100) +
        Math.floor(year / 400)) % 7;

    return (7 + (dow - 2)) % 7;
}

/*
 *  weeksInISOYear returns number of weeks in a given proleptic Gregorian year.
 */
function weeksInISOYear(gregYear) {
    function calcP(y) {
        return y + Math.floor(y / 4) - Math.floor(y / 100) +
            Math.floor(y / 400);
    }
    if ((calcP(gregYear) % 7 === 4) ||
        (calcP(gregYear - 1) % 7 === 3)) {
        return 53;
    } else {
        return 52;
    }
}

/*
 * isLeapYear determines whether a given proleptic Gregorian year is a leap year.    
 */
function isLeapYear(year) {
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
}

/*
 * monthByDayOfYear returns the numerical month that contains 
 * a given ordinal day (nth day of year).
 * January = month 1, December = month 12.
 */
function monthByDayOfYear(dayOfYear, leapYear) {
    if ((dayOfYear === 366 && !leapYear) || (dayOfYear > 366)) {
        throw new RangeError("day is out of range for the given year");
    }
    if (dayOfYear === 60) {
        if (leapYear) {
            return 2;
        } else {
            return 3;
        }
    }
    return Math.floor((dayOfYear - 1) / 31) + 1;
}


/*
 * monthStartDay returns the ordinal day (nth day of year) 
 * on which a month begins.
 */
function monthStartDay(month, leapYear) {
    const leapOffset = leapYear ? 1 : 0;

    switch (month) {
        case 1:
            return 1;
        case 2:
            return 32;
        case 3:
            return 60 + leapOffset;
        case 4:
            return 91 + leapOffset;
        case 5:
            return 121 + leapOffset;
        case 6:
            return 152 + leapOffset;
        case 7:
            return 182 + leapOffset;
        case 8:
            return 213 + leapOffset;
        case 9:
            return 244 + leapOffset;
        case 10:
            return 274 + leapOffset;
        case 11:
            return 305 + leapOffset;
        case 12:
            return 335 + leapOffset;
        default:
            throw new RangeError("month must be >=1 and <= 12");
    }
}

/*
 *  How many days in a year?
 */
function daysInYear(y){
    return isLeapYear(y)?366:365;
}

/*
 * Given a year, how many days since or before 1970.
 */
function dayFromYear(y){
    return (365 * (y - 1970) + Math.floor((y - 1969) / 4) - 
    Math.floor((y - 1901) / 100) + Math.floor((y - 1601) / 400))
}

/*
 * Convert daysFromYear into milleseconds...can feed into new Date()
 */
function timeFromYear(y){
    return dayFromYear(y)*MILLISECONDS_PER_DAY
}

/*
 * Given a weekdate, compute the ordinal date.
 */
function ordinalDateFromWeekDate(year, woy,dow){
    return (woy*7)+dow - (weekday(year,1,4)+1+3);
}

export {
    dateFromISODatetime,
    dateFromISOWeek,
    formatDateAsISOWeek,
    formatJSDateAsISOWeek,
    dateFromISOOrdinalDate,
    formatJSDateAsISOOrdinalDate,
    formatDateAsISOOrdinalDate
};