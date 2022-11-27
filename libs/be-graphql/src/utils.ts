export const emptyAsyncIterator = <T>(): AsyncIterableIterator<T> => ({
    // @ts-expect-error Typing is not very perfect for these
    [Symbol.asyncIterator]() {
        console.log('async iterator called');
        return {
            next() {
                console.log('iteration called');
                return Promise.resolve({ done: true, value: null });
            },
        };
    },
});
