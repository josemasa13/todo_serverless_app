import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { parseUserId } from '../auth/utils'

const todoAccess = new TodoAccess()

export async function getAllGroups(): Promise<TodoItem[]> {
  return todoAccess.getAllGroups()
}

export async function createToDo(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {

  const itemId = uuid.v4()
  const userId = parseUserId(jwtToken)

  return await todoAccess.createGroup({
    id: itemId,
    userId: userId,
    name: createTodoRequest.name,
    description: createTodoRequest.description,
    timestamp: new Date().toISOString(),
  })
}
