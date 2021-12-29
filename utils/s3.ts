import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CreateMultipartUploadCommandInput
} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";

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
    ...customCreateMultipartUploadOptions,
  };

  const createMultipartUploadCommand = new CreateMultipartUploadCommand(createMultipartUploadOptions);
  const {UploadId} = await s3Client.send(createMultipartUploadCommand);

  return await Promise.all(
    Array.from(Array(chunkNumber).keys()).map(async (i) => {
      const uploadPartCommand = new UploadPartCommand({
        ...createMultipartUploadOptions,
        UploadId,
        PartNumber: i + 1,
      });

      const url = await getSignedUrl(s3Client, uploadPartCommand);

      return {
        url,
        partNumber: i + 1,
      };
    })
  );
}
