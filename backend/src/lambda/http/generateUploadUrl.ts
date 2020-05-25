import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getSingleTodo } from '../utils'


import * as AWS from 'aws-sdk'

const s3 = new AWS.S3({
    signatureVersion: 'v4'
})
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const todosTable = process.env.TODOS_TABLE
const indexName = process.env.INDEX_NAME
const docClient = new AWS.DynamoDB.DocumentClient()


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const url = getUploadUrl(todoId)
    const itemToUpdate = await getSingleTodo(docClient, todoId, todosTable, indexName)

    await docClient.update({
        TableName: todosTable,
        Key: {
            'userId': itemToUpdate.userId,
            'createdAt': itemToUpdate.createdAt,
        },
        UpdateExpression: "set attachmentUrl = :attachmentUrl",
        ExpressionAttributeValues: {
            ":attachmentUrl":`https://${bucketName}.s3.amazonaws.com/${todoId}` 
        }
    }).promise()


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

function getUploadUrl(todoId: string){
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: todoId,
        Expires: +urlExpiration
    })
}