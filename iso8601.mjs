    //------------------------------------------------------------------------------
    // Constants
    //------------------------------------------------------------------------------
    const MIN_YEAR = 1;
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

    
    /**
     * validateFields validates datetime fields.
     */
    function validateFields(year, month, day, hour, minute, second) {
        if (year < MIN_YEAR || year > MAX_YEAR) {
            throw new RangeError(`Year must be >= ${MIN_YEAR} and <= ${MAX_YEAR}`);
        }
        if (month < MIN_MONTH || month > MAX_MONTH) {
            throw new RangeError(`Month must be >= ${MIN_MONTH} and <= ${MAX_MONTH}`);
        }
        let dayCount = monthDayCount(month, year);
        if (day < MIN_DAY || day > dayCount) {
            throw new RangeError(`Day must be >= ${MIN_DAY} and <= ${dayCount}`);
        }
        if (hour < MIN_HOUR || hour > MAX_HOUR) {
            throw new RangeError(`Hour must be >= ${MIN_HOUR} and <= ${MAX_HOUR}`);
        }
        if (minute < MIN_MINUTE || minute > MAX_MINUTE) {
            throw new RangeError(`Minutes must be >= ${MIN_MINUTE} and <= ${MAX_MINUTE}`);
        }
        if (second < MIN_SECOND || second > MAX_SECOND) {
            throw new RangeError(`Seconds  must be >= ${MIN_SECOND} and <= ${MAX_SECOND}`);
        }
    }


    /**
     * dateFromISODatetime creates a JavaScript date from a string that adheres to 
     * ECMAScript's specified format. The format: YYYY-MM-DDTHH:mm:ss.sssZ
     */
    let dateFromISODatetime = function (isoString) {
        const DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}.\d{3})Z$/;

        const matches = isoString.match(DATE_REGEX);
        if (matches === null) {
            throw new SyntaxError("Invalid date attribute");
        }

        validateFields(parseInt(matches[1]), parseInt(matches[2]), parseInt(matches[3]),
            parseInt(matches[4]), parseInt(matches[5]), parseInt(matches[6]),
            parseFloat(matches[7]));

        return new Date(isoString);
    }


    /**
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
            throw new RangeError(`Year must be > 0 and <= the ISO week count for the year in question.`);
        }

        let daysToAdd = (week - 1) * 7;

        if (matches[3] !== "") {
            let day = parseInt(matches[3]);
            daysToAdd += day - 1;
        }

        daysToAdd -= weekday(year, 1, 4);
        return new Date(Date.UTC(year, 0, 4 + daysToAdd, 0, 0, 0, 0));
    }


    /**
     * formatDateAsISOWeek formats a date to ISO 8601 week format specification.
     * By default, it returns the long form, YYYY-Www-d,  
     * but will return short form, YYYY-Www, if wantShortForm is set to true.
     */
    let formatDateAsISOWeek = function (year, month, day, wantShortForm) {

        // Returns a JavaScript Date representing the first day of ISO year
        function getFirstISODay(gregYear) {
            let firstISOMonday = 4 - weekday(gregYear, 1, 4);
            if (firstISOMonday <= 0) {
                return new Date(Date.UTC(gregYear - 1, 11, 31 + firstISOMonday));
            } else {
                return new Date(Date.UTC(gregYear, 0, firstISOMonday));
            }
        }

        // validate parameters
        if (year < MIN_YEAR || year > MAX_YEAR) {
            throw new RangeError(`Year must be >= ${MIN_YEAR} and <= ${MAX_YEAR}`);
        }
        if (month < MIN_MONTH || month > MAX_MONTH) {
            throw new RangeError(`Month must be >= ${MIN_MONTH} and <= ${MAX_MONTH}`);
        }
        const leapYear = isLeapYear(year);
        let dayCount = monthDayCount(month, leapYear);
        if (day < MIN_DAY || day > dayCount) {
            throw new RangeError(`Day must be >= ${MIN_DAY} and <= ${dayCount}`);
        }

        let jsDate = new Date(Date.UTC(year, month - 1, day));

        //determine first day of iso year 
        let firstISODate = getFirstISODay(year);
        let ISOYear;
        if (firstISODate > jsDate) {
            //example: jsDate is Jan 1, 2000. First ISO year day of 2000 is Jan 3.
            //         jsDate would then fall in the ISO year of 1999.
            ISOYear = year - 1;
            firstISODate = getFirstISODay(ISOYear);
        } else {
            ISOYear = year;
        }

        let ISOWeek = Math.floor((jsDate - firstISODate) / (1000 * 60 * 60 * 24 * 7)) + 1;

        ISOWeek = ISOWeek.toString().padStart(2, "0");
        if (wantShortForm) {
            return `${ISOYear}-W${ISOWeek}`;
        } else {
            return `${ISOYear}-W${ISOWeek}-${weekday(year,month,day)+1}`;
        }
    }


    /**
     * formatJSDateAsISOWeek formats a JavaScript Date instance 
     * to ISO 8601 week format specification.
     * By default, it returns the long form, YYYY-Www-d,  
     * but will return short form, YYYY-Www, if wantShortForm is set to true.
     * Note: to avoid all sorts of complications on your end, pass in a UTC date.
     */
    let formatJSDateAsISOWeek = function (jsDate, wantShortForm) {
        return formatDateAsISOWeek(jsDate.getUTCFullYear(), jsDate.getUTCMonth() + 1,
            jsDate.getUTCDate(), wantShortForm);
    }


    /**
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

        const leapYear = isLeapYear(year);

        const dayOfYear = parseInt(matches[2]);
        const maxDay = leapYear ? 366 : 365;
        if (dayOfYear <= 0 || dayOfYear > maxDay) {
            throw new RangeError(`Day must be >= 1 and <= ${maxDay}.`);
        }

        const moy = monthByDayOfYear(dayOfYear, leapYear);

        const monthDay1 = monthStartDay(moy, leapYear);
        const day = dayOfYear - monthDay1 + 1;
        return new Date(Date.UTC(year, moy - 1, day));
    }


    /**
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
        const dayOfYear = monthStartDay(month, leapYear) + day - 1;
        return year.toString().padStart(4, '0') + "-" + dayOfYear.toString().padStart(3, '0');
    }


    /**
     * formatJSDateAsISOOrdinalDate formats a JavaScript Date instance to an
     * ISO 8601 ordinal date string.
     * Note: to avoid all sorts of complications on your end, pass in a UTC date.
     */
    let formatJSDateAsISOOrdinalDate = function (jsDate) {
        return formatDateAsISOOrdinalDate(jsDate.getUTCFullYear(), jsDate.getUTCMonth() + 1,
            jsDate.getUTCDate());
    }


    /**
     * monthDayCount returns number of days in a given month.
     */
    let monthDayCount = function (month, leapYear) {
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


    /**
     * Zeller's congruence.  Computes day of week for any day.
     * Returns integer representing day of week (Monday=0...Sunday=6)
     */
    let weekday = function (year, month, day) {
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


    /**
     *  weeksInISOYear returns number of weeks in a given proleptic Gregorian year.
     */
    let weeksInISOYear = function (gregYear) {
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


    /**
     * isLeapYear determines whether a given proleptic Gregorian year is a leap year.    
     */
    let isLeapYear = function (year) {
        return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
    }


    /**
     * monthByDayOfYear returns the month that contains 
     * a given ordinal day (nth day of year).
     */
    let monthByDayOfYear = function (dayOfYear, leapYear) {
        if ((dayOfYear === 366 && !leapYear) || (dayOfYear > 366)) {
            throw new RangeError("day is out of range for the given year");
        }
        if (dayOfYear == -60) {
            if (leapYear) {
                return 2;
            } else {
                return 3;
            }
        }
        return Math.floor((dayOfYear - 1) / 31) + 1;
    }


    /**  
     * monthStartDay returns the ordinal day (nth day of year) 
     * on which a month begins.
     */
    let monthStartDay = function (month, leapYear) {
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
export {dateFromISODatetime, dateFromISOWeek, formatDateAsISOWeek, 
        formatJSDateAsISOWeek, dateFromISOOrdinalDate, dateFromISOOrdinalDate, 
        formatJSDateAsISOOrdinalDate}