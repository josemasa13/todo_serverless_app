import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { updateTodo } from "../../Logic/todos";
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger';

const logger = createLogger('uploadTodoUrl');


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

    await updateTodo(todoId, updatedTodo)
    logger.info(`updating todo item with id ${todoId}`)

    return {
        statusCode: 204,
        headers: {
            'Access-Control-Allow-Origin' : '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({})
    }

}