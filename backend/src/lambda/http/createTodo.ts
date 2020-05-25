'use strict';
import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { parseUserId } from '../../auth/utils'
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'
const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)

  const todoId = uuid.v4()

  const parsedBody = JSON.parse(event.body)
  
  const newItem = {
    todoId: todoId,
    userId: userId,
    done: false,
    createdAt: new Date().toISOString(),
    ...parsedBody
  }

  await docClient.put({
    TableName: todosTable,
    Item: newItem
  }).promise()


  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin':'*',
      'Access-Control-Allow-Credentials':true
    },
    body: JSON.stringify({
        "item": newItem
    })
  }
}