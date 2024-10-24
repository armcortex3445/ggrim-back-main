import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import * as winstonDaily from 'winston-daily-rotate-file';
import * as winston from 'winston';
import { basename } from 'path';
import { APP_NAME_KEY } from 'src/_common/const/env-keys.const';

//ref : https://pypystory.tistory.com/80

const isProduction = process.env['NODE_ENV'] === 'production';
const logDir = `${process.cwd()}/logs`;

const dailyOptions = (level: string) => {
  return {
    level,
    datePattern: 'YYYY-MM-DD-HH',
    dirname: logDir + `/${level}`,
    filename: `%DATE%.${level}.log`,
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  };
};

/* Use replacing the Nest logger to winston logger ( also for bootstrapping)
#ref : https://www.npmjs.com/package/nest-winston#replacing-the-nest-logger-also-for-bootstrapping


# level     - Logger function
  error: 0, - Logger.error()
  warn: 1,  - Logger.warn()
  info: 2,  - Logger.log() ** becareful with this level*
  http: 3,  -  Not used
  verbose: 4, - Logger.verbose()
  debug: 5,   - Logger.debug()
  silly: 6
};
*/

const appName = process.env[APP_NAME_KEY] || 'App_NAME_UNDEFINED';

export const winstonLogger = WinstonModule.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(
      (info) => `[${info.label}] ${info.timestamp} ${info.level} [${info.context}] ${info.message}`,
    ),
  ),
  transports: [
    new winston.transports.Console({
      level: isProduction ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.ms(),
        winston.format.json(),
        nestWinstonModuleUtilities.format.nestLike(appName, {
          colors: true,
          prettyPrint: true,
          processId: true,
          appName: true,
        }),
      ),
    }),

    new winstonDaily(dailyOptions('info')),
    new winstonDaily(dailyOptions('warn')),
    new winstonDaily(dailyOptions('error')),
  ],
});
