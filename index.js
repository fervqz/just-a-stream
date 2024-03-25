/**
 * Represents a stream of values.
 */
var JAStream = /** @class */ (function () {
    /**
     * Creates an instance of Stream with the provided generator function.
     * @param {Function} generator Function that generates values for the stream.
     */
    function JAStream(generator) {
        this.last = undefined; // Last emitted value in the stream
        this.generator = generator;
    }
    /**
     * Subscribes a listener function to the stream to receive emitted values.
     * @param {Listener<T>} listener Function to be called with each emitted value.
     * @returns {void}
     */
    JAStream.prototype.subscribe = function (listener) {
        var _this = this;
        this.generator(function (x) {
            _this.last = x;
            listener(x);
        });
    };
    /**
     * Filters values in the stream based on a predicate function.
     * @param {Predicate<T>} pred Predicate function to filter values.
     * @returns {JAStream<T>} New stream with filtered values.
     */
    JAStream.prototype.filter = function (pred) {
        var _this = this;
        return new JAStream(function (next) {
            _this.generator(function (x) {
                if (pred(x))
                    next(x);
            });
        });
    };
    /**
     * Maps values in the stream to a different type using a mapper function.
     * @param {Mapper<T, U>} mapFn Mapper function to transform values.
     * @returns {JAStream<U>} New stream with mapped values.
     */
    JAStream.prototype.map = function (mapFn) {
        var _this = this;
        return new JAStream(function (next) {
            _this.generator(function (x) {
                next(mapFn(x));
            });
        });
    };
    /**
     * Reduces values in the stream to a single value using a reducer function.
     * @param {Reducer<T, U>} fn Reducer function to accumulate values.
     * @param {U} initialValue Initial value for the accumulator.
     * @returns {Stream<U>} New stream with the reduced value.
     */
    JAStream.prototype.reduce = function (fn, initialValue) {
        var _this = this;
        return new JAStream(function (next) {
            var acc = initialValue;
            _this.generator(function (x) {
                acc = fn(acc, x);
                next(acc);
            });
        });
    };
    /**
     * Combines this stream with another stream and emits a tuple of the latest values from both streams.
     * @param {JAStream<U>} otherStream The other stream to combine with.
     * @returns {JAStream<[T | undefined, U]>} New stream with combined values.
     */
    JAStream.prototype.withLatestFrom = function (otherStream) {
        var _this = this;
        return new JAStream(function (next) {
            var latest;
            otherStream.subscribe(function (x) {
                latest = x;
            });
            _this.generator(function (y) {
                next([_this.last, latest]);
            });
        });
    };
    /**
     * Gets the last emitted value in the stream.
     * @returns {T | undefined} The last emitted value, or undefined if no value has been emitted yet.
     */
    JAStream.prototype.getLast = function () {
        return this.last;
    };
    return JAStream;
}());
/**
 * Namespace containing static methods for creating and merging streams.
 */
(function (JAStream) {
    /**
     * Creates a new stream from the provided values.
     * @param {...T[]} xs Array of values or promises to include in the stream.
     * @returns {JAStream<T>} New stream with the provided values.
     */
    JAStream.from = function (xs) {
        return new JAStream(function (next) {
            xs.forEach(function (x) { return next(x); });
        });
    };
    /**
     * Merges multiple streams into a single stream.
     * @param {...JAStream<T>[]} streams Streams to merge.
     * @returns {JAStream<T>} New stream with values from all input streams.
     */
    JAStream.merge = function () {
        var streams = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            streams[_i] = arguments[_i];
        }
        return new JAStream(function (next) {
            streams.forEach(function (stream) {
                stream.subscribe(next);
            });
        });
    };
})(JAStream || (JAStream = {}));
