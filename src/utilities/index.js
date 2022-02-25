import fs from 'fs';
import {
    homedir
} from 'os';
import path from 'path';
import {
    fileLogger,
    somethingWentWrong
} from '../components/winston/index.js';
import {
    formatGWei,
    getPrimaryGas
} from '../helper/index.js';

export const getCoreLocation = G => {
    if (G) return path.join(homedir(), 'Documents', 'defi-cli-configs', G);
    return path.join(homedir(), 'Documents', 'defi-cli-configs');
};
export const readFile = G => {
    return new Promise((D, J) => {
        fs.readFile(getCoreLocation(G + '.json'), (l, X) => {
            if (!l) return D(JSON.parse(X.toString()));
            return J();
        });
    });
};
export const writeFile = (G, D) => {
    return new Promise(J => {
        if (!fs.existsSync(getCoreLocation())) fs.mkdirSync(getCoreLocation());
        fs.writeFile(getCoreLocation(G + '.json'), JSON.stringify(D, null, '\t'), l => {
            if (!l) return J();
            fileLogger.error('CORE: writeFile(): ' + l);
            return somethingWentWrong();
        });
    });
};
export const validateSettings = G => {
    return new Promise((D, J) => {
        const l = G.EVM_NODE.toUpperCase();
        if (!['GA', 'SG'].includes(l) && !l.startsWith('HTTPS') && !l.startsWith('WSS')) return J('Unsupported EVM Endpoint');
        if (G.PRIVATE_KEY.length !== 64) return J('Invalid Private Key');
        return D();
    });
};
export const validateConfigs = async (G, D, J) => {
    const l = await getPrimaryGas();
    return new Promise((X, u) => {
        if (G.AMT_MODE.toLowerCase() !== 'usd' && G.AMT_MODE.toLowerCase() !== 'eth') return u('The `AMT_MODE` option must be `USD` or `ETH` only.');
        if (!parseFloat(G.AMOUNT) || parseFloat(G.AMOUNT) < 0) return u('The `AMOUNT` option must be a positive number.');
        if (!parseInt(G.SLIPPAGE) || parseInt(G.SLIPPAGE) < 1 || parseInt(G.SLIPPAGE) > 100) return u('The `SLIPPAGE` option must be between 1 and 100.');
        if (!parseInt(G.ITERATION) || parseInt(G.ITERATION) < 1) return u('The `ITERATION` option must be a positive number.');
        if (!parseFloat(G.GAS_PRICE) && G.GAS_PRICE !== '0' || parseFloat(G.GAS_PRICE) < parseFloat(formatGWei(l)) && G.GAS_PRICE !== '0') return u('The `GAS_PRICE` option must be greater than ' + formatGWei(l) + '.');
        if (!parseFloat(G.PRIORITY_GAS) || parseFloat(G.PRIORITY_GAS) < 1 || parseFloat(G.PRIORITY_GAS) > parseFloat(formatGWei(l))) return u('The `PRIORITY_GAS` option must be greater than 1 and lesser than ' + formatGWei(l) + '.');
        if (G.HONEYPOT_CHECK.toLowerCase() !== 'true' && G.HONEYPOT_CHECK.toLowerCase() !== 'false') return u('The `HONEYPOT_CHECK` option must be `true` or `false` only.');
        if (G.BLOCK_SEVERE_FEE.toLowerCase() !== 'true' && G.BLOCK_SEVERE_FEE.toLowerCase() !== 'false') return u('The `BLOCK_SEVERE_FEE` option must be `true` or `false` only.');
        if (G.BLOCK_SEVERE_FEE.toLowerCase() === 'true' && G.HONEYPOT_CHECK.toLowerCase() === 'false') return u('The `HONEYPOT_CHECK` must be `true` for `BLOCK_SEVERE_FEE` to work.');
        if (!parseFloat(G.DELAY_EXECUTION) && G.DELAY_EXECUTION !== '0' || parseFloat(G.DELAY_EXECUTION) < 0) return u('The `DELAY_EXECUTION` option must be a number.');
        if (!parseFloat(G.DELAY_ITERATION) && G.DELAY_ITERATION !== '0' || parseFloat(G.DELAY_ITERATION) < 0) return u('The `DELAY_ITERATION` option must be a number.');
        if (G.RUG_PULL_CHECK.toLowerCase() !== 'true' && G.RUG_PULL_CHECK.toLowerCase() !== 'false') return u('The `RUG_PULL_CHECK` option must be `true` or `false` only.');
        if (G.SELL_MANAGEMENT.toLowerCase() !== 'true' && G.SELL_MANAGEMENT.toLowerCase() !== 'false') return u('The `SELL_MANAGEMENT` option must be `true` or `false` only.');
        const E = D.EVM_NODE.toUpperCase();
        if (G.RUG_PULL_CHECK.toLowerCase() === 'true' && (J === 56 && (E === 'GA' || E === 'SG') || J === 43114 && E === 'GA')) return u('The `RUG_PULL_CHECK` option is not supported on this endpoint.');
        if (G.SELL_MANAGEMENT.toLowerCase() === 'true' && J === 43114 && E === 'GA') return u('The `SELL_MANAGEMENT` option is not supported on this endpoint.');
        return X();
    });
};
export const validateTelegram = G => {
    return new Promise((D, J) => {
        if (G.API_ID === '') return J('The `API_ID` is missing.');
        if (G.API_HASH === '') return J('The `API_HASH` is missing.');
        return D();
    });
};