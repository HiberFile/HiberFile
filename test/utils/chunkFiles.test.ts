import { countChunks } from "~/utils/chunkFiles";

describe('countChunks', () => {
  it('should not make more chunks than the maximum', () => {
    const maxChunksNumber = 1000;

    const file = new Blob([]);
    const fileSize = 100 * 1024 ** 3;

    Object.defineProperty(file, 'size', { value: fileSize });

    const chunkNumber = countChunks(file, { maxChunksNumber });

    expect(chunkNumber).not.toBeGreaterThan(maxChunksNumber);
  })

  it('should not make chunks larger than the max chunk size', () => {
    const maxChunkSize = 1024 ** 3;

    const file = new Blob([]);
    const fileSize = 200 * 1024 ** 3;

    Object.defineProperty(file, 'size', { value: fileSize });

    const chunkNumber = countChunks(file, { maxChunkSize });

    expect(fileSize / chunkNumber).not.toBeGreaterThan(maxChunkSize);
  })

  it('should not make more chunks than the minimal chunk size allows', () => {
    const file = new Blob([]);
    const fileSize = 1024 * 2;

    Object.defineProperty(file, 'size', { value: fileSize });

    const chunkNumber = countChunks(file, { minChunkSize: fileSize * 2 });

    expect(chunkNumber).toBe(1);
  })
})
