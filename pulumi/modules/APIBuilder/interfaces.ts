enum HTTPMethod {
    GET = "get",
    POST = "post",
    PUT = "put",
    DELETE = "delete",
    PATCH = "patch"
}

enum ContentType {
    BIN = "application/octet-stream",
    TXT = "text/plain",
    HTML = "text/html",
    JSON = "application/json",
    XML = "application/xml",
    FORM = 'multipart/form-data',
    WWWFORM = "application/x-www-form-urlencoded"
}

interface IDefaultError {
    code: number,
    msg: string,
    detail: string
}

interface IAPISpecSchemaProperty {
    type: string,
    items?: {
        $ref: string
    }
}

interface IAPISpecSchema {
    example?: {
        [propertyName: string]: any
    },
    properties?: {
        [propertyName: string]: IAPISpecSchemaProperty
    },
    required?: string[],
    type: string
}

interface IAPISpec {
    paths: {
        [resourcePath: string]: IAPISpecPath
    },
    components: {
        schemas: {
            [schemaName: string]: IAPISpecSchema
        }
    }
}

interface IAPISpecMethodBody {
    [responseCode: string]: {
        description?: string,
        content?: {
            [contentType: string]: {
                schema: {
                    $ref: string
                }
            }
        }
    }
}

interface IAPISpecMethodResponse extends IAPISpecMethodBody {
    [responseCode: string]: {
        description: string
    }
}

interface IAPISpecMethod {
    requestBody?: IAPISpecMethodBody,
    responses?: IAPISpecMethodResponse,
    description?: string,
    operationId: string
}

interface IAPISpecResource {
    [httpMethod: string]: IAPISpecMethod
}

export {
    HTTPMethod,
    ContentType,
    IDefaultError,
    IAPISpecSchema,
    IAPISpec,
    IAPISpecMethodBody,
    IAPISpecMethodResponse,
    IAPISpecMethod,
    IAPISpecResource,
    IAPISpecSchemaProperty
}