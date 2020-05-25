import 'source-map-support/register'
import { getAllTodos } from "../../Logic/todos";
import { parseUserId } from '../../auth/utils';
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger';

const logger = createLogger('uploadTodoUrl');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  console.log('Processing event ', event)
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)

  const items = await getAllTodos(userId)
  logger.info(`retrieving all todo items for user ${userId}`)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin' : '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      items: items
    })
  }
}

