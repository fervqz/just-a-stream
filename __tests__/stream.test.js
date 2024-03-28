
const { JAStream } = require('../src/index.ts');

describe('JAStream', () => {

    describe('subscribe', () => {
        it('should call the listener function with each emitted value', () => {
            const mockGenerator = jest.fn((listener) => {
                listener(1);
                listener(2);
            });

            const stream = new JAStream(mockGenerator);
            const mockListener = jest.fn();

            stream.subscribe(mockListener);

            expect(mockListener).toHaveBeenCalledTimes(2);
            expect(mockListener).toHaveBeenCalledWith(1);
            expect(mockListener).toHaveBeenCalledWith(2);
        });
    });

    describe('filter', () => {
        it('should create a new stream with filtered values', () => {
            const generator = jest.fn((listener) => {
                listener(1);
                listener(2);
                listener(3);
            });

            const stream = new JAStream(generator);
            const filteredStream = stream.filter((x) => x % 2 === 0);

            const mockListener = jest.fn();
            filteredStream.subscribe(mockListener);

            expect(mockListener).toHaveBeenCalledTimes(1);
            expect(mockListener).toHaveBeenCalledWith(2);
        });
    });

    describe('map', () => {
        it('should create a new stream with mapped values', () => {
            const generator = jest.fn((listener) => {
                listener(1);
                listener(2);
            });

            const stream = new JAStream(generator);
            const mappedStream = stream.map((x) => x * 2);

            const mockListener = jest.fn();
            mappedStream.subscribe(mockListener);

            expect(mockListener).toHaveBeenCalledTimes(2);
            expect(mockListener).toHaveBeenCalledWith(2);
            expect(mockListener).toHaveBeenCalledWith(4);
        });
    });

    describe('reduce', () => {
        it('should create a new stream with the reduced value', () => {
            const generator = jest.fn((listener) => {
                listener(1);
                listener(2);
                listener(3);
            });

            const stream = new JAStream(generator);
            const reducedStream = stream.reduce((acc, x) => acc + x, 0);

            const mockListener = jest.fn();
            reducedStream.subscribe(mockListener);

            expect(mockListener).toHaveBeenCalledTimes(3);
            expect(mockListener).toHaveBeenCalledWith(1);
            expect(mockListener).toHaveBeenCalledWith(3);
            expect(mockListener).toHaveBeenCalledWith(6);
        });
    });


    describe('getLast', () => {
        it('should return the last emitted value', () => {
            const generator = jest.fn((listener) => {
                listener(1);
                listener(2);
                listener(3);
            });

            const stream = new JAStream(generator);
            stream.subscribe(() => { });

            expect(stream.getLast()).toBe(3);
        });

        it('should return undefined if no value has been emitted yet', () => {
            const generator = jest.fn(() => { });

            const stream = new JAStream(generator);

            expect(stream.getLast()).toBeUndefined();
        });
    });

    describe('getBuffer', () => {
        it('should return the last 10 emitted values', () => {
            const generator = jest.fn((listener) => {
                for (let i = 1; i <= 15; i++) {
                    listener(i);
                }
            });

            const options = {
                useBuffer: true,
                bufferSize: 3,
            }
            const stream = new JAStream(generator, options);
            stream.subscribe(() => { });

            expect(stream.getBuffer()).toEqual([13, 14, 15]);
        });

        it('should return an empty array if no value has been emitted yet', () => {
            const generator = jest.fn(() => { });
            const options = {
                useBuffer: true,
                bufferSize: 3,
            }
            const stream = new JAStream(generator, options);

            expect(stream.getBuffer()).toEqual([]);
        });
    });

    describe('from', () => {
        it('should create a new stream from the provided values', () => {
            const values = [1, 2, 3];

            const stream = JAStream.from(values);

            const mockListener = jest.fn();
            stream.subscribe(mockListener);

            expect(mockListener).toHaveBeenCalledTimes(3);
            expect(mockListener).toHaveBeenCalledWith(1);
            expect(mockListener).toHaveBeenCalledWith(2);
            expect(mockListener).toHaveBeenCalledWith(3);
        });
    });

    describe('merge', () => {
        it('should merge multiple streams into a single stream', () => {
            const generator1 = jest.fn((listener) => {
                listener(1);
                listener(2);
            });

            const generator2 = jest.fn((listener) => {
                listener('a');
                listener('b');
            });

            const stream1 = new JAStream(generator1);
            const stream2 = new JAStream(generator2);

            const mergedStream = JAStream.merge(stream1, stream2);

            const mockListener = jest.fn();
            mergedStream.subscribe(mockListener);

            expect(mockListener).toHaveBeenCalledTimes(4);
            expect(mockListener).toHaveBeenCalledWith(1);
            expect(mockListener).toHaveBeenCalledWith(2);
            expect(mockListener).toHaveBeenCalledWith('a');
            expect(mockListener).toHaveBeenCalledWith('b');
        });
    });

});
