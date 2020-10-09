import winston from 'winston';

const generateTimestamp = (): string => {
    return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
};

export default class Logger {

    private route: string;
    private logger: winston.Logger;

    // route: filename
    constructor(route: string) {
        this.route = route;

        this.logger = winston.createLogger({
            // generating file + log to console
            transports: [
                new winston.transports.Console({
                    level: 'debug'
                }),
                new winston.transports.File({
                    // does not save debug logs
                    level: 'info',
                    filename: `./logs/${route}.log`
                })
            ],
            format: winston.format.combine(
                winston.format.errors({stack: true}),
                winston.format.printf((info) => {
                    let message = `${generateTimestamp()} | ${info.level.toUpperCase()} | ${route} | ${info.message}`;
                    message = info.infoObj ? message + ` | data: ${JSON.stringify(info.infoObj)} | ` : message;
                    if(info.meta && info.meta instanceof Error){
                        return message = message + ` | ${info.meta.stack}`;
                    }
                    return message;
                }),
                winston.format.colorize({all: true})
            )   
            
        });
    }

    public info(message: string, infoObj?: {}): void {
        if (infoObj) {
            this.logger.log('info', message, { infoObj });
        } else {
            this.logger.log('info', message);
        }
    }

    public debug(message: string, infoObj?: {}): void {
        if (infoObj) {
            this.logger.log('debug', message, { infoObj });
        } else {
            this.logger.log('debug', message);
        }
    }

    public error(message: string, infoObj?: {}): void {
        if (infoObj) {
            this.logger.log('error', message, { infoObj });
        } else {
            this.logger.log('error', message);
        }
    }
}
