import axios from 'axios';
import queue from 'queue';
import createChunks from './createChunks';

export default async (
  file: File,
  expire: number,
  apiUrl: string,
  storeHiberfileId: (hiberfileId: string) => unknown,
  onUploadProgress: (
    progress: number,
    remaining: Date | null,
    elapsed: Date
  ) => void,
  token?: string,
  privateFile?: boolean,
  webhooks?: {
    uploading: string | null;
    uploaded: string | null;
    downloading: string | null;
  }
): Promise<string> => {
  const minChunksSize = 10_000_000;
  const maxChunksSize = 10_000_000;
  const minChunksNumber = 20;

  const chunksSize =
    file.size / minChunksNumber <= minChunksSize
      ? minChunksSize
      : file.size / minChunksNumber >= maxChunksSize
      ? maxChunksSize
      : file.size / minChunksNumber;
  const chunksNumber = Math.ceil(file.size / chunksSize);

  const chunks = createChunks(file, chunksSize);

  const createFilePromise = new Promise<{
    uploadUrls: string[];
    uploadId: string;
    hiberfileId: string;
  }>((resolve) => {
    (async () => {
      resolve(
        (
          await axios.post<{
            uploadUrls: string[];
            uploadId: string;
            hiberfileId: string;
          }>(
            `${apiUrl}/files/create`,
            {
              name: file.name,
              chunksNumber,
              private: privateFile,
              webhooks
            },
            token
              ? {
                  headers: { authorization: `Basic ${token}` }
                }
              : {}
          )
        ).data
      );
    })();
  });

  const data = await createFilePromise;
  const { uploadUrls, uploadId, hiberfileId } = data!;

  storeHiberfileId(hiberfileId);

  let uploadProgress = 0;
  let remainingTime: Date | null = null;
  let uploadTimer = 0;

  setInterval(() => {
    uploadTimer++;
    remainingTime = new Date(((100 * uploadTimer) / uploadProgress) * 1000);
  }, 1000);

  const q = queue({
    concurrency: Math.ceil(2_500_000_000 / chunksSize),
    autostart: true
  });

  const uploadResults: { ETag: any; PartNumber: number }[] = [];

  q.push(
    ...chunks.map((chunk, i) => {
      return async () => {
        let chunkProgressing = 0;

        const response = await axios.put(uploadUrls[i], chunk, {
          onUploadProgress: (progressEvent) => {
            uploadProgress -= chunkProgressing;

            chunkProgressing =
              Math.round((progressEvent.loaded * 100) / progressEvent.total) *
              (chunk.size / file.size);

            uploadProgress += chunkProgressing;

            onUploadProgress(
              uploadProgress,
              remainingTime,
              new Date(uploadTimer * 1000)
            );
          }
        });

        uploadResults.push({
          ETag: response.headers.etag,
          PartNumber: i + 1
        });
      };
    })
  );

  const uploadPromise = new Promise((resolve) => {
    q.on('end', async () => {
      await axios.post(
        `${apiUrl}/files/${hiberfileId}/finish`,
        {
          // parts: uploadResults.map((result, i) => ({
          //   ETag: result.,
          //   PartNumber: result.PartNumber
          // })),
          parts: uploadResults.sort((a, b) => a.PartNumber - b.PartNumber),
          uploadId,
          expire
        },
        privateFile
          ? { headers: { authorization: `Basic ${token}` } }
          : undefined
      );

      resolve(null);
    });
  });

  await uploadPromise;
  return hiberfileId;
};
