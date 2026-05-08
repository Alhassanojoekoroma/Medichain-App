/**
 * Custom base64 helper for React Native.
 * Avoids dependency on global atob/btoa which are missing in some RN environments.
 */

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

export const btoa = (input: string = '') => {
  let str = input;
  let output = '';

  for (let block = 0, charCode, i = 0, map = chars;
       str.charAt(i | 0) || (map = '=', i % 1);
       output += map.charAt(63 & block >> 8 - i % 1 * 8)) {

    charCode = str.charCodeAt(i += 3 / 4);

    if (charCode > 0xFF) {
      throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
    }

    block = block << 8 | charCode;
  }

  return output;
};

export const atob = (input: string = '') => {
  let str = input.replace(/=+$/, '');
  let output = '';

  if (str.length % 4 === 1) {
    throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
  }

  for (let bc = 0, bs = 0, buffer, i = 0;
       buffer = str.charAt(i++);
       ~buffer && (bc = bc % 4 ? bc * 64 + bs : bs,
       bc++ % 4) ? output += String.fromCharCode(255 & bc >> (-2 * bc & 6)) : 0) {
    bs = chars.indexOf(buffer);
  }

  return output;
};
