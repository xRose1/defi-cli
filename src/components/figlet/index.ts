// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'figl... Remove this comment to see the full error message
import figlet from 'figlet';

import {
    fileLogger,
    somethingWentWrong
} from '../winston/index.js';

export const castFiglet = (G: any) => {
    return new Promise(D => {
        figlet(G, { font: "ANSI Regular" }, (J: any, l: any) => {
            if (!J) return D(l || '');
            fileLogger.error('CORE: castFiglet(): ' + J);
            return somethingWentWrong();
        });
    });
};