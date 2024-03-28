# @fervqz/just-a-stream

A light weight js library for creating, transforming and merging streams.

<a href="https://stackblitz.com/edit/vitejs-vite-dy1tvp?file=main.js&terminal=dev" target="_blank"><b>LIVE DEMO</b></a>

## Installation

**Via CDN:**

```html
<!-- Source script -->
<script src="https://cdn.jsdelivr.net/npm/@fervqz/just-a-stream@1.0.0/dist/index.js"></script>

<!-- TypeScript Types -->
<script src="https://cdn.jsdelivr.net/npm/@fervqz/just-a-stream@1.0.0/dist/index.d.ts"></script>
```

### Via package manager:
```sh
npm install @fervqz/just-a-stream
# or
yarn install @fervqz/just-a-stream
# or
pnpm install @fervqz/just-a-stream
# or
bun install @fervqz/just-a-stream
```

### Import:
```typescript
import { JAStream } from '@fervqz/just-a-stream';
// or
const { JAStream } = require('@fervqz/just-a-stream');
```


## Examples:
Move an element with arrow keys:
```typescript
import { JAStream } from '@fervqz/just-a-stream';

const movementKeys = [
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
];

const keyStrokes = new JAStream((next) => {
  document.addEventListener('keydown', next);
});

const arrowStrokes = keyStrokes
  .filter((eventKey) => movementKeys.includes(eventKey.code))
  .map((eventKey) => eventKey.code);

arrowStrokes.subscribe((arrowCode) => {
  console.log(arrowCode); // ArrowUp | ArrowDown | ArrowLeft | ArrowRight
  // Movement logic...
});


```

## Creating a Stream

You can create a stream by instantiating a new `JAStream` object or by using the `JAStream.from()` method.

### Using `new JAStream()`
Creates a stream of values of undefined length that will be received over time.

- `params`:
  - `generator: DataGenerator<T>`:  A [DataGenerator](#section-types) function. This is the value emitter.
  - `options?: JAStreamOptions`:  [JAStreamOptions](#section-types) options object for defining stream properties.
- `return`:
  - `JAStream<U>`:  New [JAStream](#section-types).


```typescript
constructor(generator: DataGenerator<T>, options?: JAStreamOptions)
```

```typescript
import { JAStream } from '@fervqz/just-a-stream';

// Bark every second
const bark = () => console.log('woof!');

const stream = new JAStream((next) => {
    setInterval(next, 1000);
});

stream.subscribe(bark);
// Output:
// woof!      <- after 1s
// woof!      <- after 2s
// woof!      <- after 3s
// ...
```

### Using `JAStream.from()`
Creates a stream of defined values to be able to transform the data with the JAStream methods.

```typescript
import { JAStream } from '@fervqz/just-a-stream';

// Times barked
const barked = (event) => console.log(`Barked ${event} times!`);

const stream = JAStream.from([1, 2, 3, 4, 5]);

stream.subscribe(barked);
// Output (all console.log happens at the same time):
// Barked 1 times!
// Barked 2 times!
// Barked 3 times!
// Barked 4 times!
// Barked 5 times!
```

### Strating a Stream with an initial value
To set the initial value of a stream, you can either:
- Set the initial value of accumulation with the reduce function, this **will not trigger** the listener function for initial value.
- Merge two streams, an initial stream with the offset value and the future values stream, this **will trigger** the listener function for the initial value.

Initial value with `reduce()`:
```typescript
import { JAStream } from '@fervqz/just-a-stream';

const INITIAL_VALUE = 'P';

// Will send 'A' every second
const stream = new JAStream((next) => {
    setInterval(() => next('A'), 1000);
});

// Suming the new value with the accumulated.
const accSecondsStream = stream.reduce(
    (acc, curr) => acc + curr,
    INITIAL_VALUE // <= starts at P
);

accSecondsStream.subscribe(event => console.log(`${event}`));

// Output:
// PA     <- First value ignored and processed with second value (first of stream)   
// PAA
// PAAA
// PAAAA
// PAAAAA
// ...
```

Offset initial value with initial stream merge:
```typescript
import { JAStream } from '@fervqz/just-a-stream';

// Initial offset, starting from P
const initialValue = JAStream.from(['P']);

const futureValues = new JAStream((next) => {
    setInterval(() => next('A'), 1000);
});

const stream = JAStream.merge(initialValue, futureValues);

const accumulatedSecondsStream = stream.reduce((acc, curr) => {
    return acc + curr;
}, '');

accumulatedSecondsStream.subscribe(event => console.log(`${event}`));

// Output:
// P     <- First value processed by subscribe listener.
// PA
// PAA
// PAAA
// PAAAA
// PAAAAA
// ...

```

## Subscribing to a Stream
Once you have a stream, you can subscribe to it to listen for emitted values.

```typescript
import { JAStream } from '@fervqz/just-a-stream';

const stream = JAStream.from([1, 2, 3, 4, 5]);

stream.subscribe((event) => {
    console.log(`Dog says: ${"woof ".repeat(event)}`);
});

// Output:
// Dog says: woof
// Dog says: woof woof
// Dog says: woof woof woof
// Dog says: woof woof woof woof
// Dog says: woof woof woof woof woof

```

```typescript
import { JAStream } from '@fervqz/just-a-stream';

const randomNumberStream = new JAStream((next) => {
    setInterval(() => {
        // Random number between 0-9
        const randomNumber = Math.floor(Math.random() * 10);
        next(randomNumber);
    }, 1000);
});

randomNumberStream.subscribe((event) => {
    console.log(`Dog says: ${"woof ".repeat(event)}`);
});

// Output:
// Dog says: woof woof woof woof woof
// Dog says: woof
// Dog says: woof woof woof
// Dog says: woof woof woof woof
// Dog says: woof woof woof
// Dog says: woof woof
// Dog says: woof woof woof woof woof woof woof
```
## Transforming Streams
You can transform streams using methods like `filter`, `map`, and `reduce`.

### Filtering Stream

Filters values in the stream based on a predicate function.

```typescript
filter(pred: Predicate<T>): JAStream<T>
```

- `params`:
  - `pred: Predicate<T>`:  [Predicate](#section-types) function to filter values.
- `return`:
  - `JAStream<T>`:  New [JAStream](#section-types) with filtered values.

<br/>

```typescript
import { JAStream } from '@fervqz/just-a-stream';

const stream = JAStream.from([1, 2, 3, 4, 5]);

const isOdd = (value) => (value % 2) > 0;
const isEven = (value) => (value % 2) === 0;
const oddNumbersStream = stream.filter(isOdd);
const evenNumbersStream = stream.filter(isEven);

oddNumbersStream.subscribe((e) => console.log(`odd: ${e}`));
evenNumbersStream.subscribe((e) => console.log(`even: ${e}`));

// Output:
// odd: 1
// odd: 3
// odd: 5
// even: 2
// even: 4

```

```typescript
import { JAStream } from '@fervqz/just-a-stream';

const stream = new JAStream((next) => {

    let counter = 0;

    setInterval(() => {
        next(counter);
        counter++;
    }, 1000);

});

const isOdd = (value) => (value % 2) > 0;
const isEven = (value) => (value % 2) === 0;
const oddNumbersStream = stream.filter(isOdd);
const evenNumbersStream = stream.filter(isEven);

oddNumbersStream.subscribe((e) => console.log(`odd: ${e}`));
evenNumbersStream.subscribe((e) => console.log(`even: ${e}`));

// Output:
// odd: 1
// even: 2
// odd: 3
// even: 4
// odd: 5

```

### Mapping Stream
Maps values in the stream to a different type using a mapper function.

```typescript
map<U>(mapFn: Mapper<T, U>): JAStream<U> 
```

- `params`:
  - `mapFn: Mapper<T, U>`:  [Mapper](#section-types) function to transform values.
- `return`:
  - `JAStream<U>`:  New [JAStream](#section-types) with mapped values.

<br/>

```typescript
import { JAStream } from '@fervqz/just-a-stream';

const disrtyDogsStream = JAStream.from([
    'dirty dog 1',
    'dirty dog 2',
    'dirty dog 3',
    'dirty dog 4',
    'dirty dog 5',
]);

const batheDog = (dog) => dog.replace('dirty', 'clean');
const cleanDogsStream = disrtyDogsStream.map(batheDog);

cleanDogsStream.subscribe((dog) => console.log(dog));

// Output:
// cleaned dog 1
// cleaned dog 2
// cleaned dog 3
// cleaned dog 4
// cleaned dog 5
```

```typescript
import { JAStream } from '@fervqz/just-a-stream';

// Random dirty and cleaned dogs
const dirtyCleanDogsStream = new JAStream((next) => {

    setInterval(() => {
        next(`${Math.random() > 0.5 ? 'dirty' : 'cleaned'} dog`);
    }, 1000);

});

const batheDog = (dog) => dog.includes('dirty') ? dog.replace('dirty', 'cleaned') : dog;
const cleanDogsStream = dirtyCleanDogsStream.map(batheDog);

cleanDogsStream.subscribe((dog) => console.log(dog));

// Output:
// cleaned dog 1      <- after 1s
// cleaned dog 2      <- after 2s
// cleaned dog 3      <- after 3s
// cleaned dog 4      <- after 4s
// cleaned dog 5      <- after 5s
// ...
```

### Reducing Stream
Reduces values in the stream to a single value using a reducer function.

```typescript
reduce<U>(fn: Reducer<T, U>, initialValue: U): JAStream<U>
```

- `params`:
  - `fn: Reducer<T, U>`:  Reducer function to accumulate values.
  - `initialValue: {U}`:  Initial value for the accumulator.
- `return`:
  - `Stream<U>`: New [JAStream](#section-types) with the reduced value.

<br/>

```typescript
import { JAStream } from '@fervqz/just-a-stream';

const initialValue = JAStream.from(['frist_woof']);

const stream = new JAStream((next) => {
    setInterval(() => next('woof!'), 1000);
});

const woofsStream = JAStream
    .merge(initialValue, stream)
    .reduce((acc, curr) => {
        return `${acc} ${curr}`;
    }, 'dogs say:');

woofsStream.subscribe(event => console.log(event));

// Output:
// dogs say: first_woof
// dogs say: first_woof woof
// dogs say: first_woof woof woof
// dogs say: first_woof woof woof woof
// dogs say: first_woof woof woof woof woof
// ...
```

## Combining Streams
Merges multiple streams into a single stream.

```typescript
JAStream.merge = <T>(...streams: JAStream<T>[]): JAStream<T>
```

- `params`:
  - `streams: {...JAStream<T>[]}`:  Streams to merge.
- `return`:
  - `JAStream<T>`: New [JSAtream](#section-types) with values from all input streams.

<br/>

```typescript
import { JAStream } from '@fervqz/just-a-stream';

const keysDownStream = new JAStream((next) => {
    document.addEventListener("keydown", next)
});

const clicksStream = new JAStream((next) => {
    document.addEventListener("click", next)
});

const keysClickStream = JAStream.merge(keysDownStream, clicksStream);

keysClickStream.subscribe(event => {
    console.log("You are either clicking or typing");
});
// Output:
// You are either clicking or typing
// You are either clicking or typing
// You are either clicking or typing
// You are either clicking or typing
// You are either clicking or typing
```
## Getting the Last Value
Gets the last emitted value in the stream.
<br/>
**IMPORTANT:** You must subscribe to the stream before calling `.getLast()`.

```typescript
getLast(): T | undefined
```

- `return`
  - `T | undefined`:  The last emitted value, or undefined if no value has been emitted yet.

<br/>

```typescript
import { JAStream } from '@fervqz/just-a-stream';

const stream = JAStream.from([
    'first dog',
    'second dog',
    'third dog',
    'fourth dog',
    'fifth dog',
]);

// You must subscribe to the stream first
stream.subscribe(() => {
    // ...
});
const lastDog = stream.getLast();


console.log(lastDog);
// Output:
// fifth dog
```

## Getting Buffered Values
Gets the buffer values for the last N elements or all values emitted.
Usages of buffer must be specified in the options object when creating the stream:

Setting usage of buffer:

```typescript
import { JAStream } from '@fervqz/just-a-stream';

const generator = (next) => {...}

const options = {
  useBuffer: true,
  bufferSize: 10, // default value = 1
}

const stream = new JAStream(generator, options)
```

<br/>

Using buffer:

```typescript
getBuffer(): T[]
```

- `return`
  - `T[]`:  The last emitted values, or [] if no value has been emitted yet.

<br/>

```typescript
import { JAStream } from '@fervqz/just-a-stream';

const generator = next => {
    setInterval(() => next((Math.random() * 10).toFixed()), 1000);
};

const options = {
    useBuffer: true,
    bufferSize: 3,
}
const stream = new JAStream(generator, options);

stream.subscribe(event => {
    console.log(event, ' - ', stream.getBuffer());
});

// Output:
// 2 - [2]
// 4 - [2, 4]
// 1 - [2, 4, 1]
// 5 - [4, 1, 5]
// 5 - [1, 5, 5]
```

## <a id="section-types"></a>TypeScript Types

### JAStreamOptions
- **useBuffer:** Default value `false`. You can use `getBuffer()` when `true`.
- **bufferSize:** Maximum number of elements to store. If not setted the default value is `1`.
```typescript
/**
 * Represents the options that can be passed to the JAStream class.
 */
export interface JAStreamOptions {
    useBuffer: boolean;
    bufferSize: number;
}
```

<br/>

### Other Types
```typescript
/**
 * Represents a function that emits values overt time.
 */
type DataGenerator<T> = (listener: Listener<T>) => void;

/**
 * Represents a function that listens for emitted values.
 */
type Listener<T> = (value: T) => void;

/**
 * Represents a predicate function to filter values.
 */
type Predicate<T> = (value: T) => boolean;

/**
 * Represents a mapper function to transform values.
 */
type Mapper<T, U> = (value: T) => U;

/**
 * Represents a reducer function to reduce values.
 */
type Reducer<T, U> = (accumulator: U, currentValue: T) => U;
```
