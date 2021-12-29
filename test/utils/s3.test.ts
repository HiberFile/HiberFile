import { S3Client } from "@aws-sdk/client-s3";
import {createS3MultipartUpload, s3Client} from "~/utils/s3";

describe('s3Client', () => {
  it('should create a new S3 client', () => {
    expect(s3Client).toBeInstanceOf(S3Client);
  });

  it('should create a list of presigned urls', async () => {
    const chunkNumber = 10;

    const s3MultipartUpload = await createS3MultipartUpload(chunkNumber, {
      Key: 'test-key',
      Expires: new Date(Date.now() + 1000),
    });

    expect(s3MultipartUpload.length).toBe(chunkNumber);

    s3MultipartUpload.forEach((s3PartUpload, i) => {
      expect(s3PartUpload).toBeDefined();
      expect(s3PartUpload.url).toContain(process.env.AWS_BUCKET_NAME);
      expect(s3PartUpload.url).toContain('test-key');
      expect(s3PartUpload.url).toContain('X-Amz-Expires');
      expect(s3PartUpload.url).toContain('X-Amz-Credential');
      expect(s3PartUpload.url).toContain('X-Amz-Signature');
      expect(s3PartUpload.partNumber).toBe(i + 1);
    });
  });
})
