import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'

import * as AWS  from 'aws-sdk'
const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const indexName = process.env.INDEX_NAME

import { parseUserId } from '../../auth/utils'
import { getSingleTodo } from '../utils'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]
    const userId = parseUserId(jwtToken)
    const todoId = event.pathParameters.todoId
    const parsedBody = JSON.parse(event.body)

    const itemToUpdate = await getSingleTodo(docClient, todoId, todosTable, indexName)

    await docClient.update({
        TableName: todosTable,
        Key: {
            'userId': userId,
            'createdAt': itemToUpdate.createdAt,
        },
        UpdateExpression: "set #name = :name, dueDate = :dueDate, done = :done",
        ExpressionAttributeValues: {
            ":name": parsedBody.name,
            ":dueDate": parsedBody.dueDate,
            ":done": parsedBody.done
        },
        ExpressionAttributeNames: {
            "#name": "name"
        }
    }).promise()

    return {
        statusCode: 204,
        headers: {
            'Access-Control-Allow-Origin' : '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({})
    }

}