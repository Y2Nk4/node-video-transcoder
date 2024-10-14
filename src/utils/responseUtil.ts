import koa from 'koa';

export const success = function (this: koa.Context, data: any, statusCode?: number) {
    this.status = statusCode || 200;
    this.body = {
        success: true,
        data: (data !== null) ? data : undefined,
    };
}

export const error = function (this: koa.Context, data: any, statusCode?: number) {
    this.status = statusCode || 500;
    this.body = {
        success: false,
        error: (data !== null) ? data : undefined,
    };
}

export type ResponseUtilFn = (this: koa.Context, data: any, statusCode?: number) => void;
