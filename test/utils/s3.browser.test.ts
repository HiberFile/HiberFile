/**
 * @jest-environment jsdom
 */

import fs from "fs";
import path from "path";
import axios from "axios";
import moment from "moment";
import chunkFile from "~/utils/chunkFile";
import {
  completeS3MultipartUpload,
  createS3MultipartUpload,
  getS3FileDownloadUrl,
  uploadFileS3Multipart
} from "~/utils/s3";

describe('uploadFileS3Multipart', () => {
  it('should upload a file to S3', async () => {
    const file = new Blob([fs.readFileSync(path.join(__dirname, 'test_image.jpeg'))]);
    const chunks = chunkFile(file);

    const s3MultipartUpload = await createS3MultipartUpload(chunks.length, {
      Key: 'test-key',
      Expires: moment().add(3, 'minute').toDate(),
    });

    const s3MultipartUploading = await uploadFileS3Multipart(chunks, s3MultipartUpload);

    expect(s3MultipartUploading).toBeDefined();
    expect(s3MultipartUploading.parts.length).toBe(chunks.length);

    const eTags: string[] = [];

    s3MultipartUploading.parts.forEach((s3PartUpload, i) => {
      expect(s3PartUpload).toBeDefined();
      expect(s3PartUpload.partNumber).toBe(i + 1);
      expect(s3PartUpload.eTag).toBeDefined();

      expect(eTags).not.toContain(s3PartUpload.eTag);

      eTags.push(s3PartUpload.eTag);
    });
  });
})

describe('completeS3MultipartUpload', () => {
  it('should complete a multipart upload', async () => {
    const fileToUpload = new Blob([fs.readFileSync(path.join(__dirname, 'test_image.jpeg'))]);
    const chunks = chunkFile(fileToUpload);

    const expiration = moment().add(3, 'minute').toDate();
    const key = 'test-key'

    const s3MultipartUpload = await createS3MultipartUpload(chunks.length, {
      Key: key,
      Expires: expiration,
    });

    expect(s3MultipartUpload.uploadId).toBeDefined();

    if (s3MultipartUpload.uploadId) {
      const s3MultipartUploading = await uploadFileS3Multipart(chunks, s3MultipartUpload);

      const s3CompleteMultipartUpload = await completeS3MultipartUpload(
        s3MultipartUpload.uploadId,
        s3MultipartUploading.parts.map(s3PartUpload => ({
          ETag: s3PartUpload.eTag,
          PartNumber: s3PartUpload.partNumber,
        })),
        {Key: key}
      );

      expect(s3CompleteMultipartUpload.$metadata.httpStatusCode).toBe(200);

      expect(s3CompleteMultipartUpload.Location).toContain(process.env.AWS_BUCKET_NAME);
      expect(s3CompleteMultipartUpload.Location).toContain(key);
      expect(s3CompleteMultipartUpload.Key).toBe(key);
    }
  });
})

describe('getS3FileDownloadUrl', () => {
  it('should create a presigned url', async () => {
    const fileToUpload = new Blob([fs.readFileSync(path.join(__dirname, 'test_image.jpeg'))]);
    const chunks = chunkFile(fileToUpload);

    const expiration = moment().add(3, 'minute').toDate();
    const key = 'test-key'

    const s3MultipartUpload = await createS3MultipartUpload(chunks.length, {
      Key: key,
      Expires: expiration,
    });

    expect(s3MultipartUpload.uploadId).toBeDefined();

    if (s3MultipartUpload.uploadId) {
      const s3MultipartUploading = await uploadFileS3Multipart(chunks, s3MultipartUpload);

      await completeS3MultipartUpload(
        s3MultipartUpload.uploadId,
        s3MultipartUploading.parts.map(s3PartUpload => ({
          ETag: s3PartUpload.eTag,
          PartNumber: s3PartUpload.partNumber,
        })),
        {Key: key}
      );

      const url = await getS3FileDownloadUrl(key);

      expect(url).toContain(process.env.AWS_BUCKET_NAME);
      expect(url).toContain(key);
      expect(url).toContain('X-Amz-Expires');
      expect(url).toContain('X-Amz-Credential');
      expect(url).toContain('X-Amz-Signature');

      const file = (await axios.get(url, {responseType: 'blob'})).data;
      expect(file.size).toBe(fileToUpload.size);
    }
  });
})
