// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'node... Remove this comment to see the full error message
import fetch from 'node-fetch';
import {
    fileLogger,
} from '../winston/index.js';

export const fetchTrustWalletTokens = (G: any) => {
    return new Promise(D => {
        let J;

        switch (G) {
            case 1:
                J = 'https://raw.githubusercontent.com/trustwallet/assets/7becc3825c0ba4ea209d921f6ab6081a1ecbd023/blockchains/ethereum/allowlist.json';
                break;

            case 56:
                J = 'https://raw.githubusercontent.com/trustwallet/assets/7becc3825c0ba4ea209d921f6ab6081a1ecbd023/blockchains/smartchain/allowlist.json';
                break;

            case 137:
                J = 'https://raw.githubusercontent.com/trustwallet/assets/7becc3825c0ba4ea209d921f6ab6081a1ecbd023/blockchains/polygon/allowlist.json';
                break;

            default:
                J = '';
                break;
        }

        const l: any = [];
        if (J) fetch(J).then((X: any) => {
            if (X.ok) X.json().then((u: any) => {
                for (const E of u) {
                    l.push(E);
                }

                return D(l);
            });
            else {
                fileLogger.error('CORE: fetchTrustWalletTokens(): ' + X.statusText);
                return D(l);
            }
        });
        else return D(l);
    });
};

export const checkForHoneypot = (G: any, D: any, J: any) => {
    return new Promise((l, X) => {
        let u;

        switch (J) {
            case 1:
                u = 'eth';
                break;

            case 56:
                u = 'bsc';
                break;

            case 137:
                u = 'poly';
                break;

            case 250:
                u = 'ftm';
                break;

            case 43114:
                u = 'avax';
                break;

            default:
                u = '';
                break;
        }

        if (u) fetch('https://honeypot.api.rugdoc.io/api/honeypotStatus.js?address=' + G + '&chain=' + u).then((E: any) => {
            if (E.ok) E.json().then((s: any) => {
                if (s.status === 'UNKNOWN') return l('The status of this token is unknown.');
                else {
                    if (s.status === 'NO_PAIRS') return l('Could not find any trading pair for this token.');
                    else {
                        if (s.status === 'OK') return l('Honeypot tests passed.');
                        else {
                            if (s.status === 'MEDIUM_FEE') return l('A trading fee of over 10% but less then 20% was detected when trading.');
                            else {
                                if (s.status === 'HIGH_FEE') return l('A high trading fee (Between 20% and 50%) was detected when trading.');
                                else {
                                    if (s.status === 'SEVERE_FEE') {
                                        if (D === 'true') return X('A severely high trading fee (over 50%) was detected when trading.');
                                        return l('A severely high trading fee (over 50%) was detected when trading.');
                                    } else {
                                        if (s.status === 'APPROVE_FAILED') return X('Failed to approve the token. This is very likely a honeypot.');
                                        else {
                                            if (s.status === 'SWAP_FAILED') return X('Failed to sell the token. This is very likely a honeypot.');
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            else {
                fileLogger.error('CORE: checkForHoneypot(): ' + E.statusText);
                return l('Skipping for now... RugDoc is down...');
            }
        });
        else return l('Skipping for now... Unsupported EVM Chain');
    });
};

export const fetchBinancePrice = (G: any) => {
    return new Promise(D => {
        fetch('https://api.binance.com/api/v3/ticker/price?symbol=' + G).then((J: any) => {
            if (J.ok) J.json().then((l: any) => {
                return D(l.price);
            });
            else {
                fileLogger.error('CORE: fetchBinancePrice(): ' + J.statusText);
                return D('0');
            }
        });
    });
};