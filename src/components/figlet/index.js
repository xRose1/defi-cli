import figlet from 'figlet';

import {
    fileLogger,
    somethingWentWrong
} from '../winston/index.js';

export const castFiglet = G => {
    return new Promise(D => {
        figlet(G, { font: "ANSI Regular" }, (J, l) => {
            if (!J) return D(l || '');
            fileLogger.error('CORE: castFiglet(): ' + J);
            return somethingWentWrong();
        });
    });
};