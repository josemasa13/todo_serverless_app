import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { setAttachmentUrl } from "../../Logic/todos";
import { createLogger } from '../../utils/logger';
import * as uuid from 'uuid'

const logger = createLogger('uploadTodoUrl');


import * as AWS from 'aws-sdk'

const s3 = new AWS.S3({
    signatureVersion: 'v4'
})
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const attachmentId = uuid.v4()
    const url = getUploadUrl(attachmentId)
    const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${attachmentId}`
    await setAttachmentUrl(todoId, attachmentUrl)
    logger.info(`attaching url to the ${todoId} todo item`)

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            uploadUrl: url
        })
    }
}

function getUploadUrl(attachmentId: string){
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: attachmentId,
        Expires: +urlExpiration
    })
}