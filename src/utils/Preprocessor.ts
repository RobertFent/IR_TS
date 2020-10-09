import { ISignalMediaEntry, ISignalMediaArray } from '../types/signalMedia';
import Logger from './Logger';
import LineReader from 'linereader';

export default class Preprocessor {

    private logger: Logger;
    // save num of parsed lines for calling parser method twice
    private parsedLines: number = 0;

    public constructor() {
        // init logger
        this.logger = new Logger('Preprocessor');
    }

    public parseJSONLToJSONArray = async (path: string, amountLines: number): Promise<ISignalMediaArray> => {
        const file: ISignalMediaArray = [];
        this.logger.info('Parsing jsonl file: ' + path);
        this.logger.info(`Parsing ${amountLines} lines...`);
        const finalLine = this.parsedLines + amountLines;
        // this.logger.debug(`Starting at line: ${this.parsedLines}`);
        try {
            await new Promise((res, rej) => {
                const lr = new LineReader(path);
                lr.on('line', (numLine, line) => {
                    if (numLine <= finalLine && numLine >= this.parsedLines) {
                        this.parsedLines++;
                        const entry: ISignalMediaEntry = JSON.parse(line);
                        file.push(entry);
                    } else if (numLine > finalLine) {
                        lr.close();
                    }
                });

                lr.on('end', () => {
                    // this.logger.debug(`Ended at line: ${finalLine}`);
                    // this.logger.debug(file.length.toString());
                    res();
                });

                // wait 100min before rejecting
                setTimeout(() => rej('Timeout after 100min has been thrown'), 600000);
            });
        } catch (error) {
            this.logger.error(error);
        }
        this.logger.info('done');
        return file;
    }

    public resetLineCounter = (): void => {
        this.parsedLines = 0;
    }
}
