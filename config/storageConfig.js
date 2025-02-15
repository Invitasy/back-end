import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';

const R2_CLIENT = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME;

export const saveFile = async (fileName, data) => {
  try {
    let upload;
    if (data instanceof Buffer || data instanceof Readable) {
      upload = new Upload({
        client: R2_CLIENT,
        params: {
          Bucket: BUCKET_NAME,
          Key: fileName,
          Body: data,
        },
      });
    } else if (typeof data === 'string') {
      // Handle base64 or text data
      upload = new Upload({
        client: R2_CLIENT,
        params: {
          Bucket: BUCKET_NAME,
          Key: fileName,
          Body: Buffer.from(data),
        },
      });
    } else {
      throw new Error('Unsupported data type for upload');
    }

    await upload.done();
    return `https://${BUCKET_NAME}.${new URL(process.env.R2_ENDPOINT).hostname}/${fileName}`;
  } catch (error) {
    console.error('File upload failed:', error);
    throw new Error('File upload failed');
  }
};

export const getFile = async (fileName) => {
  try {
    const { Body } = await R2_CLIENT.getObject({
      Bucket: BUCKET_NAME,
      Key: fileName,
    });
    
    // Convert stream to buffer
    const chunks = [];
    for await (const chunk of Body) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch (error) {
    console.error('File download failed:', error);
    throw new Error('File download failed');
  }
};

export const deleteFile = async (fileName) => {
  try {
    await R2_CLIENT.deleteObject({
      Bucket: BUCKET_NAME,
      Key: fileName,
    });
  } catch (error) {
    console.error('File deletion failed:', error);
    throw new Error('File deletion failed');
  }
};