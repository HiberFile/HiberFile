// import CryptoJS from 'crypto-js';
// import WordArray from 'crypto-js/lib-typedarrays';

// const iv = CryptoJS.enc.Hex.parse('101112131415161718191a1b1c1d1e1f');

// const readSlice = async (
// 	file: File,
// 	start: number,
// 	size: number
// ): Promise<Uint8Array> => {
// 	const slice = file.slice(start, start + size);
// 	return new Uint8Array(await slice.arrayBuffer());
// };

// const encrypt = async (file: File, password: string) => {
// 	console.log(file);

// 	let aesEncryptor = CryptoJS.algo.AES.createEncryptor(
// 		CryptoJS.enc.Utf8.parse(password),
// 		{
// 			iv
// 		}
// 	);

// 	let bits = WordArray.create([]);

// 	const sliceSize = 1024 * 1024; // 1 MiB
// 	let start = 0;

// 	while (start < file.size) {
// 		console.log(start);
// 		const slice: Uint8Array = await readSlice(file, start, sliceSize);
// 		const wordArray = WordArray.create(Array.from(slice));
// 		console.log(aesEncryptor.process(wordArray));
// 		bits.concat(aesEncryptor.process(wordArray));
// 		start += sliceSize;
// 	}

// 	bits.concat(aesEncryptor.finalize());

// 	return new File([new Uint8Array(bits.words)], file.name);
// };

// const decrypt = async (file: File, password: string) => {
// 	let aesDecryptor = CryptoJS.algo.AES.createDecryptor(
// 		CryptoJS.enc.Utf8.parse(password),
// 		{
// 			iv
// 		}
// 	);

// 	let bits = WordArray.create([]);

// 	const sliceSize = 16777216; // 16 MiB
// 	let start = 0;

// 	while (start < file.size) {
// 		const slice: Uint8Array = await readSlice(file, start, sliceSize);
// 		const wordArray = WordArray.create(Array.from(slice));
// 		console.log(aesDecryptor.process(wordArray));
// 		bits.concat(aesDecryptor.process(wordArray));
// 		start += sliceSize;
// 	}

// 	bits.concat(aesDecryptor.finalize());

// 	return new File([new Uint8Array(bits.words)], file.name);
// };

// export { encrypt, decrypt };
