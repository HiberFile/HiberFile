import { S3Client } from "@aws-sdk/client-s3";
import moment from "moment";
import {createS3MultipartUpload, s3Client} from "~/utils/s3";

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
