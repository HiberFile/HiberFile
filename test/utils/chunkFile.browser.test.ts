/**
 * @jest-environment jsdom
 */

import fs from "fs";
import path from "path";
import chunkFile, { countChunks } from "~/utils/chunkFile";

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

  it('should not make chunks smaller than the minimal chunk size allows', () => {
    const file = new Blob([]);
    const fileSize = 8 * 1024 ** 2;

    Object.defineProperty(file, 'size', { value: fileSize });

    const chunkNumber = countChunks(file, { minChunkSize: 5 * 1024 ** 2 });

    expect(chunkNumber).toBe(1);
  })
})

describe('chunkFile', () => {
  it('should correctly chunk file of 100MB', () => {
    const file = new Blob([fs.readFileSync(path.join(__dirname, 'test_image.jpeg'))]);

    const chunkNumber = countChunks(file);
    const chunks = chunkFile(file);

    expect(chunks.length).toBe(chunkNumber);

    const mergedFile = new Blob(chunks);

    expect(mergedFile.size).toBe(file.size);
  });
})
