import axios from 'axios';
import createChunks from './createChunks';

export default async (
	file: File,
	expire: number,
	apiUrl: string,
	storeHiberfileId: (hiberfileId: string) => unknown,
	onUploadProgress: (progress: number) => void
) => {
	const minChunksSize = 10_000_000;
	const maxChunksSize = 500_000_000;
	const maxChunksNumber = 20;

	const chunksSize =
		file.size / maxChunksNumber <= minChunksSize
			? minChunksSize
			: file.size / maxChunksNumber >= maxChunksSize
			? maxChunksSize
			: file.size / maxChunksNumber;
	const chunksNumber = Math.ceil(file.size / chunksSize);

	const chunks = createChunks(file, chunksSize);

	const { data } = await axios.post<{
		uploadUrls: string[];
		uploadId: string;
		hiberfileId: string;
	}>(`${apiUrl}/files/create`, {
		name: file.name,
		expire,
		chunksNumber
	});
	const { uploadUrls, uploadId, hiberfileId } = data;

	storeHiberfileId(hiberfileId);

	let uploadProgress = 0;

	const uploadResults = await Promise.all(
		chunks.map((chunk, i) =>
			axios.put(uploadUrls[i], chunk, {
				onUploadProgress: (progressEvent) => {
					const percentCompleted =
						Math.round((progressEvent.loaded * 100) / progressEvent.total) *
						Math.round((chunk.size * 100) / file.size);
					uploadProgress += percentCompleted;

					onUploadProgress(uploadProgress);
				}
			})
		)
	);

	await axios.post(`${apiUrl}/files/${hiberfileId}/finish`, {
		parts: uploadResults.map((result, i) => ({
			ETag: result.headers.etag,
			PartNumber: i + 1
		})),
		uploadId
	});

	return hiberfileId;
};
