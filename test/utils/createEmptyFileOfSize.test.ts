import createEmptyFileOfSize from "~/utils/createEmptyFileOfSize";

describe('createEmptyFileOfSize', () => {
  it('should create an empty file of the specified size',  () => {
    const fileSize = 10 * 1024 ** 2;

    const file = createEmptyFileOfSize(fileSize);
    expect(file.size).toBe(fileSize);
  });
});
