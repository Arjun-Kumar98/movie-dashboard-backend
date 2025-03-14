import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export const uploadToS3 = async (fileBuffer: Buffer, fileName: string, mimetype: string): Promise<string> => {
  const uniqueFileName = `${uuidv4()}-${fileName}`;

  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: uniqueFileName,
    Body: fileBuffer,
    ContentType: mimetype,
  };

  const result = await s3.upload(params).promise();
  return result.Location; 
};
