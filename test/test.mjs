import * as ST from '../iso8601.mjs';

import chai from "chai";

describe("Parse ISO Datetime", function(){
    describe("#dateFromISODatetime()", function(){
        it("should pass if conformant ISO 8601 (ECMAScript subset) datetime syntax: YYYY-MM-DDTHH:mm:ss.sssZ", function(){
            chai.expect(ST.dateFromISODatetime("2020-01-01T00:00:00.000Z").getTime()).to.equal(Date.UTC(2020,0,1));
        });
        it("should throw SyntaxError if invalid ISO 8601 (ECMAScript subset) datetime syntax", function(){
            chai.expect(() => ST.dateFromISODatetime("2020-01-01Q00:00:00.000Z")).to.throw(SyntaxError);
        });        
    });
});

describe("ISOWeek", function(){
    describe("#formatDateAsISOWeek()", function(){
        it("should return correctly-formatted ISO 8601 week string", function(){
            chai.expect(ST.formatDateAsISOWeek(2020,1,1)).to.equal("2020-W01-3");
        });
        it("should return correctly-formatted ISO 8601 week string (short-form version)", function(){
            chai.expect(ST.formatDateAsISOWeek(2020,1,1, true)).to.equal("2020-W01");
        });
    });
    describe("#formatJSDateAsISOWeek()", function(){
        it("should return correctly-formatted ISO 8601 week string", function(){
            chai.expect(ST.formatJSDateAsISOWeek(new Date(Date.UTC(2020,0,1)))).to.equal("2020-W01-3");
        });
        it("should return correctly-formatted ISO 8601 week string (short-form version)", function(){
            chai.expect(ST.formatJSDateAsISOWeek(new Date(Date.UTC(2020,0,1)),true)).to.equal("2020-W01");
        });
    });
    describe("#dateFromISOWeek()", function(){        
        it("should pass if correct regex", function(){
            chai.expect(ST.dateFromISOWeek("2020-W01-3").getTime()).to.equal(Date.UTC(2020,0,1));
        });
        it("should pass if correct regex (short-form)", function(){
            chai.expect(ST.dateFromISOWeek("2020-W01").getTime()).to.equal(Date.UTC(2019,11,30));
        });
        it("should throw RangeError if week is out of range", function(){
            chai.expect(() => ST.dateFromISOWeek("2020-W59-3")).to.throw(RangeError);
        });
        it("should throw SyntaxError if bad ISO week string pattern (RegEx test)", function(){
            chai.expect(() => ST.dateFromISOWeek("20aa-W50-a")).to.throw(SyntaxError);
        });
    });    
});
describe("Ordinal dates", function(){
    describe("#formatDateAsISOOrdinalDate()", function(){
        it("should return correctly-formatted ISO 8601 ordinal date string", function(){
            chai.expect(ST.formatDateAsISOOrdinalDate(2020,1,1)).to.equal("2020-001");
        });
    });
    describe("#formatJSDateAsISOOrdinalDate()", function(){
        it("should return correctly-formatted ISO 8601 ordinal date string", function(){
            chai.expect(ST.formatJSDateAsISOOrdinalDate(new Date(Date.UTC(2020,0,1)))).to.equal("2020-001");
        });
    });
    describe("#dateFromISOOrdinalDate()", function(){
        it("should pass if conformant ISO 8601 ordinal date syntax (RegEx test)", function(){
            chai.expect(ST.dateFromISOOrdinalDate("2020-001").getTime()).to.equal(Date.UTC(2020,0,1));
        });
        it("should throw SyntaxError if invalid ISO 8601 ordinal date syntax (RegEx test)", function(){
            chai.expect(() => ST.dateFromISOOrdinalDate("20aa-999")).to.throw(SyntaxError);
        });        
        it("should throw RangeError if ordinal date's day is out of range", function(){
            chai.expect(() => ST.dateFromISOOrdinalDate("2020-999")).to.throw(RangeError);
        });
    });
});