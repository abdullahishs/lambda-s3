import fs from 'fs';
import { GetObjectCommand, GetObjectCommandInput, S3Client } from '@aws-sdk/client-s3';
import { Handler } from 'aws-lambda';

const client = new S3Client({
  region: process.env.S3_REGION || 'eu-west-1',
});

export const handler: Handler = async (event, context, callback) => {
  try {
    /**
     * Rather than retrieve these values from env vars, I would probably expect to get them from the event, but it
     * would depend on the task / use case in a real world environment.
     */
    const params: GetObjectCommandInput = {
      Bucket: process.env.S3_BUCKET || 'default',
      Key: process.env.S3_KEY || 'file.txt',
    };

    const command = new GetObjectCommand(params);
    const { Body } = await client.send(command);
    if (typeof Body === 'undefined') {
      throw new Error('Unable to retrieve the contents of the file');
    }

    const content = await Body.transformToString();
    fs.writeFileSync('/tmp/file.txt', content);
    callback(null, 'File written successfully');
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message, e.stack);
      callback(e);
      return;
    }

    callback('Something went wrong that didn\'t result in an Error being thrown', e);
  }
}
