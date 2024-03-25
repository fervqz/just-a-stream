# @fervqz/just-a-stream

## Creating a Stream

You can create a stream by instantiating a new `JAStream` object or by using the `JAStream.from()` method.

### Using `new JAStream()`
Creates a stream of values of undefined length that will be received over time.

```typescript
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

### Strating a Stream with a initial value
To set the initial value of a stream, you can either:
- Setting the initial value of accumulation with the reduce function **will not trigger** the listener function the initial value.
- Merging two streams, an initial stream with the offset value and the future values stream **will trigger** the listener function.

Initial value with `reduce()`:
```typescript

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

### Filtering JAStream

```typescript
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

```typescript
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
```typescript
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
// dogs say: first_woof first_woof
// dogs say: first_woof first_woof first_woof
// dogs say: first_woof first_woof first_woof first_woof
// dogs say: first_woof first_woof first_woof first_woof first_woof
// ...
```

## Combining Streams
You can combine multiple streams using the merge method.

```typescript
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
You can get the last emitted value of a stream using the getLast method.
<br/>
**IMPORTANT:** You must subscribe to the stream first in order to use `.getLast()`.

```typescript
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

This Markdown document provides usage examples for creating streams, subscribing to streams, transforming streams with `filter`, `map`, and `reduce`, combining streams with `merge`, and getting the last value of a stream.