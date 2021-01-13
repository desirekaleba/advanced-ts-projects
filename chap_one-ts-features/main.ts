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

// Combining types with intersection types

class Grid {
    Width: number = 0;
    Height: number = 0;
    Weight: number = 0;
    Padding: number = 0;
}

class Margin {
    Top: number = 0;
    Left: number = 0;
    Width: number = 10;
    Height: number = 20;
    Weight: string = "1";
    Padding?: number;
}

function consolidatedGrid (grid: Grid, margin: Margin): Grid & Margin {
    let consolidatedGrid = <Grid & Margin>{};
    consolidatedGrid.Width = grid.Width + margin.Width;
    consolidatedGrid.Height = grid.Height + margin.Height;
    consolidatedGrid.Left = margin.Left;
    consolidatedGrid.Top = margin.Top;
    consolidatedGrid.Padding = margin.Padding ? margin.Padding : grid.Padding;


    return consolidatedGrid;
}

// Simplifying type declarations with types aliases
// 'type' is used to create our type aliases
// eg: type stringOrNumber = string | number;
type stringOrNumber = string | number;
class UnionRangeValidationWithTypeAlias extends RangeValidationBase {
    isInRange(value: stringOrNumber): boolean {
        if (typeof value === 'number')
            return this.RangeCheck(value);
        return this.RangeCheck(this.getNumber(value));
    }
}
// we can combine type aliases with types
// to create more complex type aliases as well
// add null support to stringOrNumber

type NullableStringOrNumber = stringOrNumber | null;
let total: stringOrNumber = 10;
if (new UnionRangeValidationWithTypeAlias(0, 100).isInRange(total)) {
    console.log('This value is in range');
}

// Assigning properties using object spread
function ConsolidatedGrid (grid: Grid, margin: Margin): Grid & Margin {
    let consolidatedGrid = <Grid & Margin>{...margin};
    consolidatedGrid.Width += grid.Width;
    consolidatedGrid.Height += grid.Height;
    consolidatedGrid.Padding = margin.Padding ? margin.Padding : grid.Padding;

    return consolidatedGrid;
}

// Deconstructing objects with REST properties
let guitar = {
    manufacturer: 'Ibanes',
    type: 'Jem 888',
    strings: 8
};

// we could use
// which is not elegant as there's a lot of repetition
const manufacturerOne = guitar.manufacturer;
const typeOne = guitar.type;
const stringsOne = guitar.strings;

// using destructuring or deconstructing
let {manufacturer, type, strings} = guitar;

// if we wish to change the name of manufacturer to maker, type to typ and strings to wires
// we use
let {manufacturer: maker, type: typ, strings: wires} = guitar;

// using our REST operator
// The REST operator must appear at the end of the assignment list
// Typescript compiler complains if we add any properties after it
let {manufacturer: company, ...details} = guitar;
// note: arrays work the same apart from {} being replaced by []

// Coping with a variable number of parameters using REST
function PrintInstruments(log: string, ...instruments: string[]): void {
    console.log(log);
    instruments.forEach(instrument => {
        console.log(instrument);
    });
}
PrintInstruments('Music Shop Inventory', 'Guitar', 'Drums', 'Clarinet', 'Clavinova');

// AOP using decorators
interface IDecoratorExample {
    AnyoneCanRun(args: string): void;
    AdminOnly(args: string): void;
}

class NoRoleCheck implements IDecoratorExample {
    AnyoneCanRun(args: string): void {
        if (!isInRole('user')) {
            console.log(`${currentUser.user} is not in the user role`);
            return;
        }
        console.log(args);
    }
    AdminOnly(args: string): void {
        if (!isInRole('admin')) {
            console.log(`${currentUser.user} is not in the admin role`);
            return;
        }
        console.log(args);
    }
}

let currentUser = {
    user: 'Peter',
    roles: [
        {role: 'user'},
        {role: 'admin'}
    ]
};

function TestDecoratorExample(decoratorMethod: IDecoratorExample): void {
    console.log(`Current user ${currentUser.user}`);
    decoratorMethod.AnyoneCanRun(`Running as a user`);
    decoratorMethod.AdminOnly(`Running as admin`);
}
TestDecoratorExample(new NoRoleCheck());

function isInRole(role: string): boolean {
    return currentUser.roles.some(r => r.role === role);
}

// using decorator to ensure that a user belongs to the admin role
function Admin(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    let originalMethod = descriptor.value;
    descriptor.value = function() {
        if (isInRole('admin')) {
            originalMethod.apply(this, arguments);
            return;
        }
        console.log(`${currentUser.user} is not in the admin role`);
    }
    return descriptor;
}

class DecoratedExampleMethodDecoration implements IDecoratorExample {
    AnyoneCanRun(args: string): void {
        console.log(args);
    }

    @Admin
    AdminOnly(args: string): void {
        console.log(args);
    }
}
// using decorator factory
function Role(role: string) {
    return function(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        let originalMethod = descriptor.value;
        descriptor.value = function() {
            if (isInRole(role)) {
                originalMethod.apply(this, arguments);
                return;
            }
            console.log(`${currentUser.user} is not in the ${role} role`);
        }
        return descriptor;
    }
}

class DecoratedExampleMethodDecoration2 implements IDecoratorExample {
    @Role('user')
    AnyoneCanRun(args: string): void {
        console.log(args);
    }

    @Role('admin')
    AdminOnly(args: string): void {
        console.log(args);
    }
}

// Composing types using mixins
class ActiveRecord {
    Deleted = false;
}

class Person extends ActiveRecord {
    constructor(firstName: string, lastName: string) {
        super();
        this.FirstName = firstName;
        this.LastName = lastName;
    }
    FirstName: string;
    LastName: string;
}