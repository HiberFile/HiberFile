export default (file: File, chunkSize: number) => {
	let startPointer = 0;
	let endPointer = file.size;
	let chunks = [];
	while (startPointer < endPointer) {
		let newStartPointer = startPointer + chunkSize;
		chunks.push(file.slice(startPointer, newStartPointer));
		startPointer = newStartPointer;
	}
	return chunks;
};
