class RangeValidationBase {
    constructor(private start: number, private end: number ) {
        
    }

    protected RangeCheck (value: number): boolean {
        return value >= this.start && value <= this.end;
    }

    protected getNumber (value: string): number {
        return new Number(value).valueOf();
    }

}

// The following technique could work
// but it's not very elegant and it certainly does not
// take advantage of the power of typescript

class SeparateTypeRangeValidation extends RangeValidationBase {

    isInRangeString(value: string): boolean {
        return this.RangeCheck(this.getNumber(value));
    }

    isInRangeNumber(value: number): boolean {
        return this.RangeCheck(value);
    }

}

// Instead a technique that allows us to pass
// in the value without constraining it
class AnyRangeValidation extends RangeValidationBase {
    isInRange(value: any): boolean {
        if (typeof value === 'number') {
            return this.RangeCheck(value);
        } else if (typeof value === 'string') {
            return this.RangeCheck(this.getNumber(value));
        }
        return false;
    }
}

// If we want to constrain our validation so that
// it only accepts strings or numbers, then we can use a union type
class UnionRangeValidation extends RangeValidationBase {
    isInRange (value: number | string): boolean {
        if (typeof value === 'number') {
            return this.RangeCheck(value);
        } 
        return this.RangeCheck(this.getNumber(value));
    }
}