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

export { countChunks }
