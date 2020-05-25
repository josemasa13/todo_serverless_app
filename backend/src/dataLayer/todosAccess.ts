import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { TodoItem } from "../models/TodoItem";
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS);

export class TodosAccess {
  constructor(
      private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
      private readonly todosTable = process.env.TODOS_TABLE,
      private readonly indexName = process.env.INDEX_NAME
  ) {}

    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem
        }).promise()
        return todoItem;
    }

    async getAllTodos(userId: string): Promise<TodoItem[]> {
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId= :userId',
            ExpressionAttributeValues: {
              ':userId': userId
            }
          }).promise()

        return result.Items as TodoItem[];
    }

    async getTodo(id: string): Promise<TodoItem>{
        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.indexName,
            KeyConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues:{
                ':todoId': id
            }
        }).promise()

        const item = result.Items[0];
        return item as TodoItem;
    }

    async deleteTodo(userId: string, createdAt: string): Promise<void> {
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                'userId': userId,
                'createdAt': createdAt
            }
        }).promise()
    }

    async updateTodo(userId:string, createdAt:string, updatedTodo:UpdateTodoRequest){
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                'userId': userId,
                'createdAt': createdAt,
            },
            UpdateExpression: "set #name = :name, dueDate = :dueDate, done = :done",
            ExpressionAttributeValues: {
                ":name": updatedTodo.name,
                ":dueDate": updatedTodo.dueDate,
                ":done": updatedTodo.done
            },
            ExpressionAttributeNames: {
                "#name": "name"
            }
        }).promise()
    }

    public async setAttachmentUrl(userId: string, createdAt: string, attachmentUrl: string,): Promise<void> {
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                'userId': userId,
                'createdAt': createdAt,
            },
            UpdateExpression: "set attachmentUrl = :attachmentUrl",
            ExpressionAttributeValues: {
                ":attachmentUrl":attachmentUrl
            }
        }).promise()
    }

}