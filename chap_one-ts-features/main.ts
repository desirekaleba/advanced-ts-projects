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

// mixin type
type Constructor<T = {}> = new (...args: any[]) => T;

function RecordStatus<T extends Constructor>(base: T) {
    return class extends base {
        Deleted: boolean = false;
    }
}

// merging or mixing
const ActivePerson = RecordStatus(Person);
let activePerson = new ActivePerson('Peter', 'Hanlon');
activePerson.Deleted = true;

// adding details about when the record was last updated
function Timestamp<T extends Constructor>(base: T) {
    return class extends base {
        Updated: Date = new Date();
    }
}

// Adding Timestamp to our ActivePerson
const ActivePerson2 = RecordStatus(Timestamp(Person));

// the order here does not matter we can either start with Timestamp or RecordStatus
// we could as well use 
// const ActivePerson2 = Timestamp(RecordStatus(Person));

// using constructors in our mixins
function RecordStatus2<T extends Constructor>(base: T) {
    return class extends base {
        private deleted: boolean = false;
        get Deleted(): boolean {
            return this.deleted;
        }
        Delete(): void {
            this.deleted = true;
            console.log(`The record has beeb marked as deleted`);
        }
    }
}

// Using the same code with different
// types and using generics
class QueueOfInt {
    private queue: number[] = [];

    public Push(value: number): void {
        this.queue.push(value);
    }

    public Pop(): number | undefined {
        return this.queue.shift();
    }
}

const intQueue: QueueOfInt = new QueueOfInt();
intQueue.Push(10);
intQueue.Push(35);
console.log(intQueue.Pop()); // prints 10
console.log(intQueue.Pop()); // prints 35

class QueueOfString {
    private queue: string[] = [];

    public Push(value: string): void {
        this.queue.push(value);
    }
    public Pop(): string | undefined {
        return this.queue.shift();
    }

}

// (a queue operates as First In First Out (or FIFO)). 
// If we had forgotten the shift operation, 
// we would have implemented a stack operation instead 
// (Last In First Out (or LIFO)). 
// This could lead to subtle and dangerous bugs in our code.

// Rewriting our queue using generic
class Queue<T> {
    private queue: T[] = [];

    public Push(value: T): void {
        this.queue.push(value);
    }

    public Pop(): T | undefined {
        return this.queue.shift();
    }
}

const numberQueue: Queue<number> = new Queue<number>();
const stringQueue: Queue<string> = new Queue<string>();

numberQueue.Push(10);
numberQueue.Push(35);
console.log(numberQueue.Pop());
console.log(numberQueue.Pop());

stringQueue.Push(`Hello`);
stringQueue.Push(`Generics`);
console.log(stringQueue.Pop());
console.log(stringQueue.Pop());

//

interface IStream {
    ReadStream(): Int8Array;
}

class Data<T extends IStream> {
    ReadStream(stream: T) {
        let output = stream.ReadStream();
        console.log(output.byteLength);
    }
}
class WebStream implements IStream {
    ReadStream(): Int8Array {
        let array: Int8Array = new Int8Array(8);
        for (let index: number = 0; index < array.length; index++) {
            array[index] = index + 3;
        }
        return array;
    }
}

class DiskStream implements IStream {
    ReadStream(): Int8Array {
        let array: Int8Array = new Int8Array(20);
        for (let index: number = 0; index < array.length; index++) {
            array[index] = index + 3;
        }
        return array;
    }
}

const webStream = new Data<WebStream>();
const diskStream = new Data<DiskStream>();

// Mapping values using maps

enum Genre {
    Rock,
    CountryAndWestern,
    Classical,
    Pop,
    HeavyMetal
}

class MusicCollection {
    private readonly collection: Map<Genre, string[]>;
    constructor() {
        this.collection = new Map<Genre, string[]>();
    }
    public Add(genre: Genre, artist: string[]): void {
        for (let individual of artist) {
            this.AddArtist(genre, individual);
        }
        
    }
    public Get(genre: Genre): string[] | undefined {
        return this.collection.get(genre);
    }
    public AddArtist(genre: Genre, artist: string): void {
    if (this.collection.has(genre)) {
        this.collection.set(genre, []);
    }
    let artists = this.collection.get(genre);
    if (artists) {
        artists.push(artist);
    }
}
}

let collection = new MusicCollection();
collection.Add(Genre.Classical, ['Debussy', 'Bach', 'Elgar', 'Beethoven']);
collection.Add(Genre.CountryAndWestern, [`Dolly Parton`, `Toby Keith`, `Willie Nelson`]);
collection.Add(Genre.HeavyMetal, [`Tygers of Pan Tang`, `Saxon`, `Doro`]);
collection.Add(Genre.Pop, [`Michael Jackson`, `Abba`, `The Spice Girls`]);
collection.Add(Genre.Rock, [`Deep Purple`, `Led Zeppelin`, `The Dixie Dregs`]);

// Creating asynchronous code with promises and async/await
function ExpensiveWebCall (time: number): Promise<void> {
    return new Promise((resolve, reject) => setTimeout(resolve, time));
}
class MyWebService {
    callExpensiveWebOperation(): void {
        ExpensiveWebCall(4000)
        .then(() => console.log(`Finished web service`))
        .catch(() => console.log(`Expensive web call failure`));
    }
}

console.log(`Calling service`);
new MyWebService().callExpensiveWebOperation();
console.log(`Precessing continues until the web service returns`);

// using async and await
function ExpensiveWebCall2(time: number) {
    return new Promise((resolve, reject) => setTimeout(resolve, time));
}
class MyWebService2 {
    async callExpensiveWebOperation() {
        await ExpensiveWebCall2(4000);
        console.log(`Finished web service`);
    }
}
// catching errors using async/await
class MyWebService3 {
    async callExpensiveWebOperation() {
        try {
            await ExpensiveWebCall2(4000);
            console.log(`Finished web service`);
        } catch (error) {
            console.log(`Caught ${error}`);
        }
    }
}