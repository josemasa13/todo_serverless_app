import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import * as AWS  from 'aws-sdk'
const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const indexName = process.env.INDEX_NAME
import { getSingleTodo } from '../utils'


import { parseUserId } from '../../auth/utils'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]
    const userId = parseUserId(jwtToken)

    const itemToDelete = await getSingleTodo(docClient, todoId, todosTable, indexName)

    await docClient.delete({
        TableName: todosTable,
        Key: {
            'userId': userId,
            'createdAt': itemToDelete.createdAt
        }
    }).promise()

    return {
        statusCode: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({})
    }  
}
