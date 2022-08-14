
// [c: Boolean, e: *] => throw e || [a]=>[a]
export const ifThrow = (c, e) => c === true ? (()=>{throw e})() : a => a;

// [c: Boolean, fn: * => *] fn || [a]=>a[]
// export const ifDo = (c,fn) => c===true?fn: a=>a;