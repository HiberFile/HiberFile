const countChunks = (file: Blob, opts: {
    maxChunksNumber?: number,
    simultaneouslyRequests?: number,
    minChunkSize?: number
    maxChunkSize?: number,
  } = {}) => {
  const {maxChunksNumber = 1000, simultaneouslyRequests = 6, minChunkSize = 5 * 1024 ** 2, maxChunkSize = 5 * 1024 ** 3} = opts;

  let chunkNumber = file.size / minChunkSize < simultaneouslyRequests ?
    Math.ceil(file.size / minChunkSize) :
    simultaneouslyRequests;

  while (minChunkSize < file.size / chunkNumber && file.size / chunkNumber >= maxChunkSize && chunkNumber < maxChunksNumber) {
    chunkNumber++;
  }

  return chunkNumber;
}

const chunkFile = (file: Blob) => {
  const chunkNumber = countChunks(file);
  const chunks = [];

  for (let i = 0; i < chunkNumber; i++) {
    const offset = i * (file.size / chunkNumber);
    const chunk = file.slice(offset, offset + file.size / chunkNumber);
    chunks.push(chunk);
  }

  return chunks;
}

export { countChunks }
export default chunkFile
