import * as fs from "fs";
import * as path from "path";
import {S3Client} from "@aws-sdk/client-s3";
import moment from "moment";
import {s3Client, createS3MultipartUpload, uploadFileS3Multipart, completeS3MultipartUpload} from "~/utils/s3";
import chunkFile from "~/utils/chunkFile";

jest.setTimeout(30000);

describe('s3Client', () => {
  it('should create a new S3 client', () => {
    expect(s3Client).toBeInstanceOf(S3Client);
  });
})

describe('createS3MultipartUpload', () => {
  it('should create a list of presigned urls', async () => {
    const chunkNumber = 10;
    const expiration = moment().add(1, 'minute').toDate();

    const s3MultipartUpload = await createS3MultipartUpload(chunkNumber, {
      Key: 'test-key',
      Expires: expiration,
    });

    expect(s3MultipartUpload.uploadId).toBeDefined();

    expect(s3MultipartUpload.parts.length).toBe(chunkNumber);

    s3MultipartUpload.parts.forEach((s3PartUpload, i) => {
      expect(s3PartUpload).toBeDefined();
      expect(s3PartUpload.url).toContain(process.env.AWS_BUCKET_NAME);
      expect(s3PartUpload.url).toContain('test-key');
      expect(s3PartUpload.url).toContain('X-Amz-Expires');
      expect(s3PartUpload.url).toContain('X-Amz-Credential');
      expect(s3PartUpload.url).toContain('X-Amz-Signature');
      expect(s3PartUpload.partNumber).toBe(i + 1);

      const date = moment(s3PartUpload.url.match(/X-Amz-Date=(\d+T\d+Z)/)?.[1]);
      const expiresAt = date.add(parseFloat(s3PartUpload.url.match(/X-Amz-Expires=(\d+)/)?.[1]  ?? '0'), 's');

      expect(expiresAt.diff(expiration, 's')).toBeLessThanOrEqual(1);
    });
  });
})

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
