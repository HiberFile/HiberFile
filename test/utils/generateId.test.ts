import generateId from "~/utils/generateId";

describe('generateId', () => {
  it('should return a string', () => {
    expect(typeof generateId(8)).toBe('string');
  });

  it('should return a string of length 32', () => {
    expect(generateId(8).length).toBe(8);
  });
});
