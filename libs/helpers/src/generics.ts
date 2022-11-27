type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
/**
 * Allow to specify type that is either T or either U, not both.
 */
export type XOR<T, U> = (T | U) extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;

export const forceType = <Expected>() => <Actual extends Expected>(arg: Actual): Actual => arg;
