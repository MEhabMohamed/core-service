import { S3StorageProvider } from "../../pkg/storage/s3";
import { env } from "../config/env";

export const storageProvider = new S3StorageProvider({
    region: env.aws.region,
    bucket: env.aws.s3Bucket,
    accessKeyId: env.aws.accessKeyId,
    secretAccessKey: env.aws.secretAccessKey,
    cdnUrl: env.aws.cdnUrl,
});
