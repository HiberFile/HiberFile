import { countChunks } from "~/utils/chunkFiles";

describe('countChunks', () => {
  it('should not make more chunks than the maximum', () => {
    const maxChunksNumber = 1000;

    const file = new File([], 'test.js');
    const fileSize = 100 * 1024 ** 3;

    Object.defineProperty(file, 'size', { value: fileSize });

    const chunksCount = countChunks(file, { maxChunksNumber });

    expect(chunksCount).not.toBeGreaterThan(maxChunksNumber);
  })

  it('should not make chunks larger than the max chunk size', () => {
    const maxChunkSize = 1024 ** 3;

    const file = new File([], 'test.js');
    const fileSize = 200 * 1024 ** 3;

    Object.defineProperty(file, 'size', { value: fileSize });

    const chunksCount = countChunks(file, { maxChunkSize });

    expect(fileSize / chunksCount).not.toBeGreaterThan(maxChunkSize);
  })

  it('should not make more chunks than the minimal chunk size allows', () => {
    const file = new File([], 'test.js');
    const fileSize = 1024 * 2;

    Object.defineProperty(file, 'size', { value: fileSize });

    const chunksCount = countChunks(file, { minChunkSize: fileSize * 2 });

    expect(chunksCount).toBe(1);
  })
})
