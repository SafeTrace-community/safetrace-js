export const throttle = jest.fn().mockImplementation((callback, timeout) => {
    let timeoutId;

    const throttled = jest.fn((...args) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => callback(...args), timeout);
    });

    return throttled;
});

export default throttle;
