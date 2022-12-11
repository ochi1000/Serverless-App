import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Types } from 'aws-sdk/clients/s3';
import { TodoItem } from "../models/TodoItem";
import * as AWSSDK from "aws-sdk";
import { TodoUpdate } from "../models/TodoUpdate";


export class ToDoAPI {
    constructor(
        private readonly docsClient: DocumentClient = new AWSSDK.DynamoDB.DocumentClient(),
        private readonly s3BucketClient: Types = new AWSSDK.S3({ signatureVersion: 'v4' }),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly s3BucketName = process.env.S3_BUCKET_NAME) {
    }

    async getAllToDo(userId: string): Promise<TodoItem[]> {
        const params = {
            TableName: this.todosTable,
            KeyConditionExpression: "#userId = :userId",
            ExpressionAttributeNames: {
                "#userId": "userId"
            },
            ExpressionAttributeValues: {
                ":userId": userId
            }
        };

        const result = await this.docsClient.scan(params).promise();
        const items = result.Items;

        return items as TodoItem[];
    }

    async createToDo(todoItem: TodoItem): Promise<TodoItem> {
        const params = {
            TableName: this.todosTable,
            Item: todoItem,
        };
        await this.docsClient.put(params).promise();
        return todoItem as TodoItem;
    }

    async updateToDo(todoUpdate: TodoUpdate, todoId: string, userId: string): Promise<TodoUpdate> {
        const params = {
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            UpdateExpression: "set #a = :a, #b = :b, #c = :c",
            ExpressionAttributeNames: {
                "#a": "name",
                "#b": "dueDate",
                "#c": "done"
            },
            ExpressionAttributeValues: {
                ":a": todoUpdate['name'],
                ":b": todoUpdate['dueDate'],
                ":c": todoUpdate['done']
            },
            ReturnValues: "ALL_NEW"
        };

        const result = await this.docsClient.update(params).promise();
        const attributes = result.Attributes;

        return attributes as TodoUpdate;
    }

    async deleteToDo(todoId: string, userId: string): Promise<string> {
        const params = {
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
        };

        await this.docsClient.delete(params).promise();

        return "" as string;
    }

    async generateUploadUrl(todoId: string): Promise<string> {
        const url = this.s3BucketClient.getSignedUrl('putObject', {
            Bucket: this.s3BucketName,
            Key: todoId,
            Expires: 1000,
        });

        return url as string;
    }
}
