import {parseUserId} from "../auth/utils";
import {CreateTodoRequest} from "../requests/CreateTodoRequest";
import {UpdateTodoRequest} from "../requests/UpdateTodoRequest";
import {TodoUpdate} from "../models/TodoUpdate";
import {ToDoAPI} from "../dataLayer/ToDoAPI";
import {TodoItem} from "../models/TodoItem";

const uuid = require('uuid/v4');
const getToDoAccess = new ToDoAPI();

export async function getAllToDo(jwt: string): Promise<TodoItem[]> {
    const userId = parseUserId(jwt);
    return getToDoAccess.getAllToDo(userId);
}

export function createToDo(createTodoRequest: CreateTodoRequest, jwt: string): Promise<TodoItem> {
    const userId = parseUserId(jwt);
    const todoId =  uuid();
    const s3BucketName = process.env.S3_BUCKET_NAME;
    
    return getToDoAccess.createToDo({
        userId: userId,
        todoId: todoId,
        attachmentUrl:  `https://${s3BucketName}.s3.amazonaws.com/${todoId}`, 
        createdAt: new Date().getTime().toString(),
        done: false,
        ...createTodoRequest,
    });
}

export function updateToDo(updateTodoRequest: UpdateTodoRequest, todoId: string, jwt: string): Promise<TodoUpdate> {
    const userId = parseUserId(jwt);
    return getToDoAccess.updateToDo(updateTodoRequest, todoId, userId);
}

export function deleteToDo(todoId: string, jwt: string): Promise<string> {
    const userId = parseUserId(jwt);
    return getToDoAccess.deleteToDo(todoId, userId);
}

export function generateUploadUrl(todoId: string): Promise<string> {
    return getToDoAccess.generateUploadUrl(todoId);
}