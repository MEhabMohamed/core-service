export interface PresignedUpload {
    uploadUrl: string;  // presigned PUT url the client uploads the file to
    publicUrl: string;  // final url of the object once uploaded
    key: string;        // object key inside the bucket
}

export interface IStorageProvider {
    getPresignedUploadUrl(key: string, contentType: string, expiresInSeconds?: number): Promise<PresignedUpload>;
    getPublicUrl(key: string): string;
    deleteObject(key: string): Promise<void>;
}
