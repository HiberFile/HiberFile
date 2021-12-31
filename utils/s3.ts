import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CreateMultipartUploadCommandInput,
  CompleteMultipartUploadCommandInput,
  CompleteMultipartUploadCommand,
  GetObjectCommandInput, GetObjectCommand,
} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import queue from 'queue';
import moment from "moment";
import axios, {AxiosRequestConfig} from "axios";

require('dotenv').config();

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_BUCKET_NAME) {
  throw new Error('AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY and AWS_BUCKET_NAME environment variables must be set');
}

export const s3Client = new S3Client({
  region: "fr-par",
  endpoint: "https://s3.fr-par.scw.cloud",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

export const createS3MultipartUpload = async (chunkNumber: number, customCreateMultipartUploadOptions: Partial<CreateMultipartUploadCommandInput> & { Key: string }) => {
  const createMultipartUploadOptions: CreateMultipartUploadCommandInput = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Expires: moment().add(1, 'hour').toDate(),
    ...customCreateMultipartUploadOptions,
  };

  const expiration = moment(customCreateMultipartUploadOptions.Expires);

  const createMultipartUploadCommand = new CreateMultipartUploadCommand(createMultipartUploadOptions);
  const {UploadId: uploadId} = await s3Client.send(createMultipartUploadCommand);

  return {
    uploadId,
    parts: await Promise.all(
      Array.from(Array(chunkNumber).keys()).map(async (i) => {
        const uploadPartCommand = new UploadPartCommand({
          ...createMultipartUploadOptions,
          UploadId: uploadId,
          PartNumber: i + 1,
        });

        const url = await getSignedUrl(s3Client, uploadPartCommand, {
          expiresIn: expiration.diff(moment(), 'seconds'),
        });

        return {
          url,
          partNumber: i + 1,
        };
      })
    )
  };
}

export const uploadFileS3Multipart = (
  chunks: Blob[],
  s3MultipartUpload: Awaited<ReturnType<typeof createS3MultipartUpload>>,
  options: Partial<AxiosRequestConfig & {concurrency: number}> = {}
) => {
  return new Promise<{parts: {partNumber: number, eTag: string}[]}>(((resolve, reject) => {
    const {concurrency = 6, ...axiosOptions} = options;

    const {parts} = s3MultipartUpload;

    const queueUpload = queue({concurrency, autostart: true});
    const uploadResults: {partNumber: number, eTag: string}[] = [];

    queueUpload.push(...parts.map(({url, partNumber}, i) => async () => {
      const axiosResponse = await axios.put(url, chunks[i], axiosOptions);

      if (axiosResponse.status.toString()[0] !== '2') {
        reject(axiosResponse);
      } else {
        uploadResults.push({
          partNumber,
          eTag: axiosResponse.headers.etag,
        });
      }
    }));

    queueUpload.on('end', () => {
      resolve({
        parts: uploadResults.sort((a, b) => a.partNumber - b.partNumber),
      });
    });
  }))
}

export const completeS3MultipartUpload = (uploadId: string,
                                          parts: {PartNumber: number, ETag: string}[],
                                          customCompleteMultipartUploadOptions: Partial<CompleteMultipartUploadCommandInput> & { Key: string }) => {
  const completeMultipartUploadOptions: CompleteMultipartUploadCommandInput = {
    Bucket: process.env.AWS_BUCKET_NAME,
    UploadId: uploadId,
    MultipartUpload: {Parts: parts},
    ...customCompleteMultipartUploadOptions,
  };

  const completeMultipartUploadCommand = new CompleteMultipartUploadCommand(completeMultipartUploadOptions);
  return s3Client.send(completeMultipartUploadCommand);
}

export const getS3FileDownloadUrl = (key: string, customGetObjectCommandOptions: Partial<GetObjectCommandInput> = {}) => {
  const getObjectCommandOptions: GetObjectCommandInput = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    ...customGetObjectCommandOptions,
  };

  return getSignedUrl(s3Client, new GetObjectCommand(getObjectCommandOptions), {
    expiresIn: moment().add(1, 'hour').second(),
  });
}
