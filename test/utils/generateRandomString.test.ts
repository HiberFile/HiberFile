import generateRandomString from "~/utils/generateRandomString";

describe('generateRandomString', () => {
  it('should return a string', () => {
    expect(typeof generateRandomString(8)).toBe('string');
  });

  it('should return a string of length 32', () => {
    expect(generateRandomString(8).length).toBe(8);
  });

  it('should return a string with only special characters', () => {
    expect(/^[a-zA-Z0-9]+$/.test(generateRandomString(8, '.!@#$%^&*()_+=-'))).toBe(false);
  });
});
