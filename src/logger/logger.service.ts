import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import { AxiosError } from 'axios';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends ConsoleLogger {
    error(error: Error | AxiosError | any) {
        if (error instanceof AxiosError) {
            super.error(`${error.message}`, this.context);
            super.error(`Response.Body: ${error.response.data}`, this.context);
        } else if (error instanceof Error) {
            const [, path] = error.stack.split('\n')[1].split(' (');
            const message = `${path.replace(')', '')} ${error.message}`;

            super.error(message, this.context);
        } else {
            super.error(`Unknow Error: ${error}`, this.context);
        }
    }

    // TODO: add new type of logging
}
