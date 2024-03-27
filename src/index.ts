/**
 * Represents a function that emits values overt time.
 */
export type DataGenerator<T> = (listener: Listener<T>) => void;

/**
 * Represents a function that listens for emitted values.
 */
export type Listener<T> = (value: T) => void;

/**
 * Represents a predicate function to filter values.
 */
export type Predicate<T> = (value: T) => boolean;

/**
 * Represents a mapper function to transform values.
 */
export type Mapper<T, U> = (value: T) => U;

/**
 * Represents a reducer function to reduce values.
 */
export type Reducer<T, U> = (accumulator: U, currentValue: T) => U;

/**
 * Represents a stream of values.
 */
export class JAStream<T> {

    generator: DataGenerator<T>; // Function that generates values
    last: T | undefined = undefined; // Last emitted value in the stream
    buffer: T[] = [];

    /**
     * Creates an instance of Stream with the provided generator function.
     * @param {Function} generator Function that generates values for the stream.
     */
    constructor(generator: DataGenerator<T>) {
        this.generator = generator;
    }

    /**
     * Subscribes a listener function to the stream to receive emitted values.
     * @param {Listener<T>} listener Function to be called with each emitted value.
     * @returns {void}
     */
    subscribe(listener: Listener<T>): void {
        this.generator((x: T) => {
            this.last = x;
            this.buffer.push(x)
            this.buffer = this.buffer.slice(0, 10);
            listener(x)
        });
    }

    /**
     * Filters values in the stream based on a predicate function.
     * @param {Predicate<T>} pred Predicate function to filter values.
     * @returns {JAStream<T>} New stream with filtered values.
     */
    filter(pred: Predicate<T>): JAStream<T> {
        return new JAStream<T>((next: Listener<T>) => {
            this.generator((x: T) => {
                if (pred(x)) next(x);
            });
        });
    }

    /**
     * Maps values in the stream to a different type using a mapper function.
     * @param {Mapper<T, U>} mapFn Mapper function to transform values.
     * @returns {JAStream<U>} New stream with mapped values.
     */
    map<U>(mapFn: Mapper<T, U>): JAStream<U> {
        return new JAStream<U>((next: Listener<U>) => {
            this.generator((x: T) => {
                next(mapFn(x));
            });
        });
    }

    /**
     * Reduces values in the stream to a single value using a reducer function.
     * @param {Reducer<T, U>} fn Reducer function to accumulate values.
     * @param {U} initialValue Initial value for the accumulator.
     * @returns {Stream<U>} New stream with the reduced value.
     */
    reduce<U>(fn: Reducer<T, U>, initialValue: U): JAStream<U> {
        return new JAStream<U>((next: Listener<U>) => {
            let acc: U = initialValue;
            this.generator((x: T) => {
                acc = fn(acc, x);
                next(acc);
            });
        });
    }

    /**
     * Combines this stream with another stream and emits a tuple of the latest values from both streams.
     * @param {JAStream<U>} otherStream The other stream to combine with.
     * @returns {JAStream<[T | undefined, U]>} New stream with combined values.
     */
    withLatestFrom<U>(otherStream: JAStream<U>): JAStream<[T | undefined, U]> {
        return new JAStream<[T | undefined, U]>((next: Listener<[T | undefined, U]>) => {
            let latest: U;
            otherStream.subscribe((x: U) => {
                latest = x;
            });
            this.generator((y: T) => {
                next([this.last, latest]);
            });
        });
    }

    /**
     * Gets the last emitted value in the stream.
     * @returns {T | undefined} The last emitted value, or undefined if no value has been emitted yet.
     */
    getLast(): T | undefined {
        return this.last;
    }

    /**
     * (BETA)
     * Gets the buffer values for the last 10 elements.
     * @returns {T[]} The last 10 emitted value, or [] if no value has been emitted yet.
     */
    getBuffer(): T[] {
        return this.buffer;
    }
}

/**
 * Namespace containing static methods for creating and merging streams.
 */
export namespace JAStream {

    /**
     * Creates a new stream from the provided values.
     * @param {...T[]} xs Array of values or promises to include in the stream.
     * @returns {JAStream<T>} New stream with the provided values.
     */
    export const from = <T>(xs: T[]): JAStream<T> => {
        return new JAStream<T>((next: Listener<T>) => {
            xs.forEach((x: T) => next(x));
        });
    }

    /**
     * Merges multiple streams into a single stream.
     * @param {...JAStream<T>[]} streams Streams to merge.
     * @returns {JAStream<T>} New stream with values from all input streams.
     */
    export const merge = <T>(...streams: JAStream<T>[]): JAStream<T> => {
        return new JAStream<T>((next: Listener<T>) => {
            streams.forEach((stream: JAStream<T>) => {
                stream.subscribe(next);
            });
        });
    }
}
