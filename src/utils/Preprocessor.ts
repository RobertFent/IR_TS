import { ISignalMedia, ISginalMediaEntry, ISignalMediaArray } from '../types/signalMedia';
import Logger from './Logger';
import LineReader from 'line-reader';

/*
in kibana dev console:
PUT /signal-media
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_custom_analyzer": {
          "type": "custom",
          "tokenizer": "whitespace",
          "filter": ["lowercase"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "id": { "type": "text" },
      "source": {
        "type": "text",
        "analyzer": "my_custom_analyzer"
      },
      "published": { "type": "text" },
      "title": {
        "type": "text",
        "analyzer": "my_custom_analyzer"
      },
      "media-type": {
        "type": "text",
        "analyzer": "my_custom_analyzer"
      },
      "content": {
        "type": "text",
        "analyzer": "my_custom_analyzer"
      }
    }
  }
}
*/

/*
RangeError [ERR_FS_FILE_TOO_LARGE]: File size (2741147514) is greater than 2 GB
    at tryCreateBuffer (fs.js:343:13)
    at Object.readFileSync (fs.js:379:14)
    at Object.Module._extensions..json (internal/modules/cjs/loader.js:1103:22)
    at Module.load (internal/modules/cjs/loader.js:941:32)
    at Function.Module._load (internal/modules/cjs/loader.js:782:14)
    at Module.require (internal/modules/cjs/loader.js:965:19)
    at require (internal/modules/cjs/helpers.js:88:18)
    at Object.<anonymous> (/home/robert/repos/IR_TS/dist/Preprocessor.js:7:42)
    at Module._compile (internal/modules/cjs/loader.js:1076:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1097:10) {
  code: 'ERR_FS_FILE_TOO_LARGE'
}

todo https://github.com/dominictarr/JSONStream

*/

export default class Preprocessor {

    // private typedData: ISignalMedia = {};
    private logger: Logger;

    public constructor() {
        // this.typedData = data as ISignalMedia;
        // init logger
        this.logger = new Logger('Server');
    }

    public parseJSON = async (): Promise<void> => {

    }

    public parseJSONLToJSON = async (path: string): Promise<ISignalMediaArray> => {
        const file: ISignalMediaArray = [];
        this.logger.info('Parsing jsonl file: ' + path);
        let i = 0;
    try {
        await new Promise((res, rej) => {
            LineReader.eachLine(path, (line, last) => {
                const entry: ISginalMediaEntry = JSON.parse(line);
                file[i] = entry;
                // todo currently only parsing first 100k entries
                if (i === 99999) res();
                /* if(last) {
                    this.logger.debug('last');
                    this.logger.debug(i.toString());
                    res();
                } */
                i++;
            });
            // wait 100min before rejecting
            setTimeout(() => rej('Timeout after 10min has been thrown'), 600000);
        });
    } catch (error) {
        this.logger.error(error);
    }
        this.logger.info('done');
        return file;
    }
}
