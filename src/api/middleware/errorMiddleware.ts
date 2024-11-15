import { Request, Response, NextFunction } from 'express';
import { ILogger } from '@utils/loggerInterface';
import { ApiError } from '@utils/errors';


export const errorMiddleware = (logger: ILogger) => (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err);

    let error: ApiError;

    if (err instanceof ApiError) {
        error = err;
    } else {
        error = new ApiError(500, 'Internal Server Error');
    }

    res.status(error.statusCode).json({
        status: error.statusCode,
        message: error.message
    });
};

```