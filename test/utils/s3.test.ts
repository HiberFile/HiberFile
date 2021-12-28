import { S3Client } from "@aws-sdk/client-s3";
import { s3Client } from "~/utils/s3";

describe('s3Client', () => {
  it('should create a new S3 client', () => {
    expect(s3Client).toBeInstanceOf(S3Client);
  });
})
