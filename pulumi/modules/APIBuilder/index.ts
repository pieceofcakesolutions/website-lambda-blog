import { IDefaultError, IAPISpec, HTTPMethod, IAPISpecMethod, IAPISpecSchema, IAPISpecResource } from './interfaces'


class APIBuilder {

    private _defaultErrors: IDefaultError[] = [
        {
            code: 400,
            msg: "Bad Request",
            detail: "Required property \'comments\'"
        },
        {
            code: 401,
            msg: "Unauthorized",
            detail: "Token has expired"
        },
        {
            code: 403,
            msg: "Forbidden",
            detail: "Incorrect Access Rights"
        },
        {
            code: 404,
            msg: "Not Found",
            detail: "Blog Does Not Exist"
        },
        {
            code: 409,
            msg: "Conflict",
            detail: "Blog Already Exists"
        },
        {
            code: 429,
            msg: "Too Many Requests",
            detail: "Tier Throttle Enabled"
        },
        {
            code: 500,
            msg: "Server Error",
            detail: "Something went wrong"
        },
        {
            code: 503,
            msg: "Gateway Timeout",
            detail: "Unable to contact API Endpoint"
        },
    ]

    public apiSpec: IAPISpec = {
        paths: {},
        components: {
            schemas: {}
        }
    }

    constructor() {
        // Create the Inital Error Schemas
        this._buildErrors()
    }

    public static createMethod(method: HTTPMethod, path: string, description?: string): IAPISpecMethod {
        const parsedPath = path.replace('/','-').toLowerCase()
        const apiMethod: IAPISpecMethod = {
            description,
            operationId: `${(method.toString().toUpperCase())}_${parsedPath}`
        }
        
        return apiMethod
    }

    public static createResource(): IAPISpecResource {
        const apiResource: IAPISpecResource = {}
        return apiResource
    }

    public static createSchema(type?: string): IAPISpecSchema {
        const apiSchema: IAPISpecSchema = {
            type: type || "object"
        }

        return apiSchema
    }

    public static specToString(spec: IAPISpec): string {
        return JSON.stringify(spec)
    }

    public specToString(): string {
        return JSON.stringify(this.apiSpec)
    }

    // Runs when the class is instantiated
    private _buildErrors(): void {
        this._defaultErrors.forEach( (eItem) => {
            
            const errorSchema: IAPISpecSchema = {
                example: {
                    code: eItem.code,
                    message: eItem.msg,
                    detail: eItem.detail
                },
                properties: {
                    code: {
                        type: "integer"
                    },
                    message: {
                        type: "string"
                    },
                    detail: {
                        type: "string"
                    }
                },
                required: [
                    "code",
                    "message"
                ],
                type: "object"
            }

            this.apiSpec.components.schemas[eItem.msg.replace(' ','')] = errorSchema
        })
    }
}