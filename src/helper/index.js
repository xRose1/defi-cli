import BN from 'bn.js';
import net from 'net';
import emoji from 'node-emoji';
import {
    getPrimary,
    getSecondary,
} from '../ethereum/index.js';

let primary;
let secondary;

export const initializeHelper = () => {
    return new Promise(G => {
        primary = getPrimary();
        secondary = getSecondary();
        return G();
    });
};
export const getUserAddress = G => primary.eth.accounts.privateKeyToAccount(G).address;
export const formatEther = (G, D) => {
    return primary.utils.fromWei(G.toString(), D);
};
export const formatWei = (G, D) => {
    return new BN(primary.utils.toWei(G, D));
};
export const formatGWei = G => {
    return Number(formatEther(G, 'gwei')).toFixed(2);
};
export const getPrimaryGas = async () => {
    const G = new BN(await primary.eth.getGasPrice());
    return G.mul(new BN('125')).div(new BN('100'));
};
export const getSecondaryGas = async () => {
    const G = new BN(await secondary.eth.getGasPrice());
    return G.mul(new BN('125')).div(new BN('100'));
};

export const getPrimaryBlock = async () => {
    return await primary.eth.getBlockNumber();
};
export const getSecondaryBlock = async () => {
    return await secondary.eth.getBlockNumber();
};

export const runPrimaryLatencyTests = () => {
    return new Promise(G => {
        const D = primary._provider.url || ((primary._provider.host || null));
        runLatencyTests(D).then(J => {
            return G(J.min);
        });
    });
};
export const runSecondaryLatencyTests = () => {
    return new Promise(G => {
        const D = secondary._provider.url || ((secondary._provider.host || null));
        runLatencyTests(D).then(J => {
            return G(J.min);
        });
    });
};

const runLatencyTests = G => {
    return new Promise(D => {
        let J = 0;

        const l = [];

        const X = () => {
            const E = new net.Socket();
            const s = process.hrtime();
            const j = new URL(G).hostname;
            const x = new URL(G).port ? Number(new URL(G).port) : 443;

            E.connect(x, j, () => {
                const Q = process.hrtime(s);
                const p = (Q[0] * 1000000000 + Q[1]) / 1000000;

                l.push({
                    'seq': J,
                    'time': p
                });

                E.destroy();
                J++;
                u();
            });

            E.on('error', Q => {
                l.push({
                    'seq': J,
                    'time': 'error',
                    'error': Q
                });

                E.destroy();
                J++;
                u();
            });

            E.setTimeout(1500, () => {
                l.push({
                    'seq': J,
                    'time': 'error',
                    'error': 'timeout'
                });

                E.destroy();
                J++;
                u();
            });
        };

        const u = () => {
            if (J < 10) X();
            else return D({
                'max': l.reduce((E, s) => E > s.time ? E : s.time, l[0].time),
                'min': l.reduce((E, s) => E < s.time ? E : s.time, l[0].time)
            });
        };

        X();
    });
};

export const signThenSendPrimaryTxn = (G, D) => signThenSendTxn(primary, G, D);
export const signThenSendSecondaryTxn = (G, D) => signThenSendTxn(secondary, G, D);

const signThenSendTxn = (G, D, J) => {
    return new Promise((l, X) => {
        G.eth.accounts.signTransaction(D, J, (u, E) => {
            if (!u && E.rawTransaction) G.eth.sendSignedTransaction(E.rawTransaction, (s, j) => !s ? l(j) : X(s)).catch(() => {});
            else return X(u);
        }).catch(() => {});
    });
};

export const isPrimaryContract = G => isContract(primary, G);
export const isSecondaryContract = G => isContract(secondary, G);

const isContract = (G, D) => {
    return new Promise((J, l) => {
        if (G.utils.isAddress(D)) G.eth.getCode(D).then(X => {
            if (X !== '0x') return J();
            return l();
        });
        else return l();
    });
};

export const numberWithCommas = G => {
    return G.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
};

let regexMessageForCa_memory;

export const regexMessageForCa = (G, D = []) => {
    return new Promise(J => {
        const l = {
            'zero': '0',
            'one': '1',
            'two': '2',
            'three': '3',
            'four': '4',
            'five': '5',
            'six': '6',
            'seven': '7',
            'eight': '8',
            'nine': '9'
        };

        for (let p = 0; p <= Object.keys(l).length - 1; p++) {
            G = G.replace(new RegExp(Object.keys(l)[p], 'gi'), Object.values(l)[p]);
        }

        G = G.replace(/[^\da-fx]/gi, '').toLowerCase();
        const X = /outputcurrency=0x([\da-f]{40})\s?/i;
        const u = /tokens\/0x([\da-f]{40})\s?/i;
        const E = /0x([\da-f]{40})\s?/i;
        const s = /0x([\da-f]+)\s?/i;
        const j = /[\da-f]+\s?/i;
        let x = '';
        let Q;
        if (X.test(G)) {
            x = '0x' + G.match(X)[1];
            regexMessageForCa_memory = '';
        } else {
            if (u.test(G)) {
                x = '0x' + G.match(u)[1];
                regexMessageForCa_memory = '';
            } else {
                if (E.test(G)) {
                    x = '0x' + G.match(E)[1];
                    regexMessageForCa_memory = '';
                } else
                    s.test(G) && (regexMessageForCa_memory = '0x' + G.match(s)[1], Q = regexMessageForCa_memory);
            }
        }

        if (regexMessageForCa_memory && regexMessageForCa_memory !== Q && j.test(G)) {
            regexMessageForCa_memory += G.match(j)[0];
            if (regexMessageForCa_memory.length === 42) x = regexMessageForCa_memory;
        }

        x && (D.findIndex(U => x.toLowerCase() === U.toLowerCase()) === -1 || x.toLowerCase() === '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82') && isPrimaryContract(x).then(() => J(x)).catch(() => {
            regexMessageForCa_memory = '';
        });
    });
};

export const regexFastestAlertsMessage = (G, D) => {
    return new Promise(J => {
        const l = new RegExp(emoji.get('red_circle'));
        const X = /Liquidity(.*)BNB/i;
        const u = /[\d.]+%(.*)buy(.*)/i;
        const E = /[\d.]+%(.*)sell(.*)/i;
        const s = /[\d.]+/i;

        if (l.test(G) && X.test(G) && u.test(G) && E.test(G)) {
            let j = 0;
            const x = G.match(X)[1];
            if (s.test(x)) j = parseFloat(x.match(s)[0]);
            let Q = 0;
            const [p] = G.match(u);
            if (s.test(p)) Q = parseFloat(p.match(s)[0]);
            let U = 0;
            const [z] = G.match(E);
            if (s.test(z)) U = parseFloat(z.match(s)[0]);
            j >= D.minLiq && j <= D.maxLiq && Q >= D.minTax && Q <= D.maxTax && U >= D.minTax && U <= D.maxTax && regexMessageForCa(G).then(O => J(O));
        }
    });
};

export const getDeadline = () => {
    return Math.round(new Date(new Date().getTime() + 600000).getTime() / 1000);
};

export const maxUint256 = () => '115792089237316195423570985008687907853269984665640564039457584007913129639935';