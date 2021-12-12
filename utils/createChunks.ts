export default (file: File, chunkSize: number) => {
  let startPointer = 0;
  const endPointer = file.size;
  const chunks = [];
  while (startPointer < endPointer) {
    const newStartPointer = startPointer + chunkSize;
    chunks.push(file.slice(startPointer, newStartPointer));
    startPointer = newStartPointer;
  }
  return chunks;
};
