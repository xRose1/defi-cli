import abiDecoder from 'abi-decoder';
import BN from 'bn.js';
import chalk from 'chalk';
import readline from 'readline';
import {
    sleep
} from '@mtproto/core/src/utils/common/index.js';
import ora from 'ora';
import {
    fetchBinancePrice
} from '../components/fetch/index.js';
import {
    fileLogger
} from '../components/winston/index.js';
import {
    printErrorHeading,
    printSubHeading
} from '../console/index.js';
import {
    getPrimary,
    getSecondary,
} from '../ethereum/index.js';
import {
    formatEther,
    formatWei,
    getDeadline,
    getPrimaryGas,
    getSecondaryBlock,
    maxUint256,
    numberWithCommas,
    signThenSendPrimaryTxn
} from '../helper/index.js';
import {
    abiDecoder_abis,
    getAmountsOut_abi,
    predictionCg_abis,
    predictionPcs_abis,
    predictionPcsLatestRoundData_abi,
    swapExactAVAXForTokens_abi,
    swapExactETHForTokens_abi,
    swapExactKCSForTokens_abi,
    swapExactTokensForAVAXSupportingFeeOnTransferTokens_abi,
    swapExactTokensForETHSupportingFeeOnTransferTokens_abi,
    swapExactTokensForKCSSupportingFeeOnTransferTokens_abi
} from './abiItem.js';

let web3;
let secondary;
let contract;
let symbol;
let native;
let usd;

export const initializeExchange = (chain, exchange) => {
    return new Promise(J => {
        web3 = getPrimary();
        secondary = getSecondary();

        switch (chain) {
            case 1:
                symbol = 'ETH';
                native = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
                usd = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
                if (exchange === 'LAUNCH') exchange = 'UNI';
                break;

            case 4:
                symbol = 'ETH';
                native = '0xc778417E063141139Fce010982780140Aa0cD5Ab';
                usd = '0xA6Cc591f2Fd8784DD789De34Ae7307d223Ca3dDc';
                break;

            case 56:
                symbol = 'BNB';
                native = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
                usd = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56';
                if (exchange === 'LAUNCH' || exchange === 'CANDLE') exchange = 'PANCAKE';
                break;

            case 137:
                symbol = 'MATIC';
                native = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270';
                usd = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
                if (exchange === 'LAUNCH') exchange = 'QUICK';
                break;

            case 250:
                symbol = 'FTM';
                native = '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83';
                usd = '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75';
                if (exchange === 'LAUNCH') exchange = 'SPOOKY';
                break;

            case 321:
                symbol = 'KCS';
                native = '0x4446fc4eb47f2f6586f9faab68b3498f86c07521';
                usd = '0x0039f574ee5cc39bdd162e9a88e3eb1f111baf48';
                if (exchange === 'LAUNCH') exchange = 'KOFFEE';
                break;

            case 43114:
                symbol = 'AVAX';
                native = '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7';
                usd = '0xc7198437980c041c805A1EDcbA50c1Ce5db95118';
                if (exchange === 'LAUNCH') exchange = 'TRADER';
                break;

            default:
                break;
        }

        switch (exchange) {
            case 'UNI':
                contract = {
                    'router': new web3.eth.Contract([getAmountsOut_abi, swapExactETHForTokens_abi, swapExactTokensForETHSupportingFeeOnTransferTokens_abi], '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D')
                };
                break;

            case 'SUSHI':
                contract = {
                    'router': new web3.eth.Contract([getAmountsOut_abi, swapExactETHForTokens_abi, swapExactTokensForETHSupportingFeeOnTransferTokens_abi], '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F')
                };
                break;

            case 'PANCAKE':
                contract = {
                    'router': new web3.eth.Contract([getAmountsOut_abi, swapExactETHForTokens_abi, swapExactTokensForETHSupportingFeeOnTransferTokens_abi], '0x10ED43C718714eb63d5aA57B78B54704E256024E'),
                    'predictionPcsBNB': new web3.eth.Contract(predictionPcs_abis, '0x18B2A687610328590Bc8F2e5fEdDe3b582A49cdA'),
                    'predictionPcsBNB_oracle': new web3.eth.Contract([predictionPcsLatestRoundData_abi], '0xD276fCF34D54A926773c399eBAa772C12ec394aC'),
                    'predictionCgBTC': new web3.eth.Contract(predictionCg_abis, '0x995294CdBfBf7784060BD3Bec05CE38a5F94A0C5'),
                    'predictionCgBNB': new web3.eth.Contract(predictionCg_abis, '0x4d85b145344f15B4419B8afa1CbB2A9d00B17935'),
                    'predictionCgETH': new web3.eth.Contract(predictionCg_abis, '0x65669Dcd4813341ACACF51b261F560c92d40A632')
                };
                break;

            case 'APE':
                contract = {
                    'router': new web3.eth.Contract([getAmountsOut_abi, swapExactETHForTokens_abi, swapExactTokensForETHSupportingFeeOnTransferTokens_abi], '0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7')
                };
                break;

            case 'QUICK':
                contract = {
                    'router': new web3.eth.Contract([getAmountsOut_abi, swapExactETHForTokens_abi, swapExactTokensForETHSupportingFeeOnTransferTokens_abi], '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff')
                };
                break;

            case 'SPOOKY':
                contract = {
                    'router': new web3.eth.Contract([getAmountsOut_abi, swapExactETHForTokens_abi, swapExactTokensForETHSupportingFeeOnTransferTokens_abi], '0xF491e7B69E4244ad4002BC14e878a34207E38c29')
                };
                break;

            case 'SPIRIT':
                contract = {
                    'router': new web3.eth.Contract([getAmountsOut_abi, swapExactETHForTokens_abi, swapExactTokensForETHSupportingFeeOnTransferTokens_abi], '0x16327E3FbDaCA3bcF7E38F5Af2599D2DDc33aE52')
                };
                break;

            case 'KOFFEE':
                contract = {
                    'router': new web3.eth.Contract([getAmountsOut_abi, swapExactKCSForTokens_abi, swapExactTokensForKCSSupportingFeeOnTransferTokens_abi], '0xc0ffee0000c824d24e0f280f1e4d21152625742b')
                };
                break;

            case 'KU':
                contract = {
                    'router': new web3.eth.Contract([getAmountsOut_abi, swapExactETHForTokens_abi, swapExactTokensForETHSupportingFeeOnTransferTokens_abi], '0xa58350d6dee8441aa42754346860e3545cc83cda')
                };
                break;

            case 'TRADER':
                contract = {
                    'router': new web3.eth.Contract([getAmountsOut_abi, swapExactAVAXForTokens_abi, swapExactTokensForAVAXSupportingFeeOnTransferTokens_abi], '0x60aE616a2155Ee3d9A68541Ba4544862310933d4')
                };
                break;

            default:
                break;
        }

        if (abiDecoder.getABIs() !== []) abiDecoder.removeABI(abiDecoder_abis);
        abiDecoder.addABI(abiDecoder_abis);
        return J();
    });
};
export const getSymbol = () => symbol;
export const getNative = () => native;
export const getUsd = () => usd;
export const getBalance = async G => {
    return new BN(await web3.eth.getBalance(G));
};
export const getAmountsOut = async (G, D = native, J = usd) => {
    const l = new BN('0');
    if (G.lte(l)) return l;
    const X = (await contract.router.methods.getAmountsOut(G.toString(), [D, J]).call()) || [G.toString(), '0'];
    return new BN(X[1]);
};
export const contributeToPresale = (userAddress, privateKey, presaleAddress, startTime, menuOption, configs, chain, amountsOut) => {
    return new Promise(async (x, p) => {
        const spinner = ora({ text: ('Pending'), spinner: "aesthetic" }).start();
        const txConfig = chain !== 1 && chain !== 4 ? {
            'from': userAddress,
            'to': presaleAddress,
            'value': web3.utils.toHex(amountsOut),
            'gasLimit': undefined,
            'gasPrice': web3.utils.toHex(configs.GAS_PRICE === '0' ? (await getPrimaryGas()).mul(new BN('2')) : formatWei(configs.GAS_PRICE, 'gwei')),
            'data': undefined,
            'nonce': undefined,
            'chainId': chain
        } : {
            'from': userAddress,
            'to': presaleAddress,
            'value': web3.utils.toHex(amountsOut),
            'gasLimit': undefined,
            'maxFeePerGas': web3.utils.toHex(configs.GAS_PRICE === '0' ? (await getPrimaryGas()).mul(new BN('2')) : formatWei(configs.GAS_PRICE, 'gwei')),
            'maxPriorityFeePerGas': web3.utils.toHex(formatWei(configs.PRIORITY_GAS, 'gwei')),
            'type': web3.utils.toHex('2'),
            'data': undefined,
            'nonce': undefined,
            'chainId': chain
        };

        await executeSwap();

        async function executeSwap() {
            const A = Math.floor(Date.now() / 1000);
            if (A <= +startTime) return spinner.start('Pending / Time Now: ' + new Date().toUTCString()), await sleep(1000), await executeSwap();
            else web3.eth.getTransactionCount(userAddress, 'pending').then(nonce => {
                if (menuOption === 60) web3.eth.estimateGas(txConfig, async (err, estimatedGas) => {
                    if (!err) {
                        txConfig.gasLimit = web3.utils.toHex(Math.round(estimatedGas * 2.5))
                        txConfig.nonce = nonce;
                        signThenSendPrimaryTxn(txConfig, privateKey).then(g => {
                            spinner.succeed('Contribute Tx: ' + g);
                            spinner.stop();
                            return x();
                        }).catch(g => {
                            spinner.stop();
                            fileLogger.error('LAUNCHPAD: contributeToPresale().signThenSendPrimaryTxn(): ' + g);
                            return p('Something went wrong... Check logs...');
                        });
                    } else {
                        fileLogger.error('LAUNCHPAD: contributeToPresale().estimateGas(): ' + err);
                        sleep(500);
                        return await executeSwap();
                    }
                });
                else {
                    if (menuOption === 70) {
                        const w = new web3.eth.Contract([{
                            'inputs': [],
                            'name': 'contribute',
                            'outputs': [],
                            'payable': true,
                            'stateMutability': 'payable',
                            'type': 'function'
                        }], presaleAddress);
                        w.methods.contribute().estimateGas(txConfig, async (err, estimatedGas) => {
                            if (!err) {
                                txConfig.gasLimit = web3.utils.toHex(Math.round(parseInt(estimatedGas) * 2.5));
                                txConfig.data = w.methods.contribute().encodeABI();
                                txConfig.nonce = nonce;
                                signThenSendPrimaryTxn(txConfig, privateKey).then(b => {
                                    spinner.succeed('Contribute Tx: ' + b);
                                    spinner.stop();
                                    return x();
                                }).catch(b => {
                                    spinner.stop();
                                    fileLogger.error('LAUNCHPAD: contributeToPresale().signThenSendPrimaryTxn(): ' + b);
                                    return p('Something went wrong... Check logs...');
                                });
                            } else {
                                fileLogger.error('LAUNCHPAD: contributeToPresale().estimateGas(): ' + err);
                                sleep(500);
                                return await executeSwap();
                            }
                        });
                    } else return p('Launchpad EOFError');
                }
            });
        }
    });
};
export const swapExactETHForTokens = (userAddress, privateKey, contractAddress, configs, chain, exchange) => {
    return new Promise((j, x) => {
        const spinner = ora({ text: ('Pending'), spinner: "aesthetic" }).start();
        let iteration;
        let U;
        let amountsOut;
        if (configs.AMT_MODE.toLowerCase() === 'usd') amountsOut = getAmountsOut(chain !== 56 && chain !== 321 ? formatWei(configs.AMOUNT, 'mwei') : formatWei(configs.AMOUNT), usd, native);
        else {
            if (configs.AMT_MODE.toLowerCase() === 'eth') amountsOut = new BN(formatWei(configs.AMOUNT));
            else {
                fileLogger.error('CORE: swapExactETHForTokens(): Native Error');
                throw 'Native Error';
            }
        }
        const txConfig = chain !== 1 && chain !== 4 ? {
            'to': contract.router._address,
            'value': web3.utils.toHex(amountsOut),
            'gasLimit': undefined,
            'gasPrice': web3.utils.toHex(configs.GAS_PRICE === '0' ? (getPrimaryGas()).mul(new BN('3')) : formatWei(configs.GAS_PRICE, 'gwei')),
            'data': undefined,
            'nonce': undefined,
            'chainId': chain
        } : {
            'to': contract.router._address,
            'value': web3.utils.toHex(amountsOut),
            'gasLimit': undefined,
            'maxFeePerGas': web3.utils.toHex(configs.GAS_PRICE === '0' ? (getPrimaryGas()).mul(new BN('3')) : formatWei(configs.GAS_PRICE, 'gwei')),
            'maxPriorityFeePerGas': web3.utils.toHex(formatWei(configs.PRIORITY_GAS, 'gwei')),
            'type': web3.utils.toHex('2'),
            'data': undefined,
            'nonce': undefined,
            'chainId': chain
        };
        iteration = 0;
        return executeSwap();

        function executeSwap() {
            web3.eth.getTransactionCount(userAddress, 'pending').then(nonce => {
                contract.router.methods.getAmountsOut(amountsOut.toString(), [native, contractAddress]).call({}, async (err, amountsOutMin) => {
                    if (!err) {
                        let amountsOut = new BN(amountsOutMin[1]);
                        amountsOut = amountsOut.sub(amountsOut.mul(new BN(configs.SLIPPAGE)).div(new BN('100'))).toString();
                        const swapExactForTokens = exchange === 'KOFFEE' ? contract.router.methods.swapExactKCSForTokens : exchange === 'TRADER' ? contract.router.methods.swapExactAVAXForTokens : contract.router.methods.swapExactETHForTokens;
                        swapExactForTokens(amountsOut, [native, contractAddress], userAddress, getDeadline()).estimateGas({
                            'from': userAddress,
                            'gas': 100000000,
                            'value': txConfig.value
                        }, async (err, estimatedGas) => {
                            if (!err) {
                                txConfig.gasLimit = web3.utils.toHex(Math.round(parseInt(estimatedGas) * 3));
                                txConfig.data = swapExactForTokens(amountsOut, [native, contractAddress], userAddress, getDeadline()).encodeABI();
                                if (iteration === 0) await sleep(parseFloat(configs.DELAY_EXECUTION) * 1000);
                                approveToken(nonce).then(i => {
                                    i && (spinner.succeed('Approve() Tx: ' + i), U = process.hrtime(), ++nonce);
                                    spinner.stop();
                                    console.log('\nExecuting swapExactETHForTokens() # ' + iteration);
                                    txConfig.nonce = nonce;

                                    signThenSendPrimaryTxn(txConfig, privateKey).then(async M => {
                                        spinner.succeed('Swap Tx: ' + M);
                                        ++iteration;
                                        if (iteration !== parseInt(configs.ITERATION)) return spinner.start(), await sleep(parseFloat(configs.DELAY_ITERATION) * 1000), executeSwap();
                                        spinner.stop();
                                        const N = process.hrtime(U);
                                        console.log('\nSubmitted at: ' + (await getSecondaryBlock()) + ' / Took: ' + (Number((N[0] * 1000000000 + N[1]) / 1000000) / 1000).toFixed(4) + ' seconds');
                                        return j();
                                    }).catch(M => {
                                        spinner.stop();
                                        fileLogger.error('SWAP: swapExactETHForTokens().signThenSendPrimaryTxn(): ' + M);
                                        return x('Something went wrong... Check logs...');
                                    });
                                }).catch(i => {
                                    spinner.stop();
                                    fileLogger.error('SWAP: swapExactETHForTokens().approve(): ' + i);
                                    return x('Failed to approve the token. This is very likely a honeypot.');
                                });
                            } else return fileLogger.error('SWAP: swapExactETHForTokens().estimateGas(): ' + err), await sleep(500), executeSwap();
                        });
                    } else return fileLogger.error('SWAP: getAmountsOut(): ' + err), await sleep(500), executeSwap();
                });
            });
        }

        function approveToken(nonce) {
            return new Promise((C, H) => {
                if (iteration !== 0) return C();
                const g = new web3.eth.Contract([{
                    'inputs': [{
                        'internalType': 'address',
                        'name': 'spender',
                        'type': 'address'
                    }, {
                        'internalType': 'uint256',
                        'name': 'amount',
                        'type': 'uint256'
                    }],
                    'name': 'approve',
                    'outputs': [{
                        'internalType': 'bool',
                        'name': '',
                        'type': 'bool'
                    }],
                    'stateMutability': 'nonpayable',
                    'type': 'function'
                }], contractAddress);
                g.methods.approve(contract.router._address, maxUint256()).estimateGas({
                    'from': userAddress,
                    'gas': 100000000,
                    'value': 0
                }, async (err, estimatedGas) => {
                    if (!err) signThenSendPrimaryTxn(chain !== 1 && chain !== 4 ? {
                        'to': contractAddress,
                        'value': web3.utils.toHex('0'),
                        'gasLimit': web3.utils.toHex(Math.round(parseInt(estimatedGas) * 2.5)),
                        'gasPrice': web3.utils.toHex(configs.GAS_PRICE === '0' ? (await getPrimaryGas()).mul(new BN('2')) : formatWei(configs.GAS_PRICE, 'gwei')),
                        'data': g.methods.approve(contract.router._address, maxUint256()).encodeABI(),
                        'nonce': nonce,
                        'chainId': chain
                    } : {
                        'to': contractAddress,
                        'value': web3.utils.toHex('0'),
                        'gasLimit': web3.utils.toHex(Math.round(parseInt(estimatedGas) * 2.5)),
                        'maxFeePerGas': web3.utils.toHex(configs.GAS_PRICE === '0' ? (await getPrimaryGas()).mul(new BN('2')) : formatWei(configs.GAS_PRICE, 'gwei')),
                        'maxPriorityFeePerGas': web3.utils.toHex(formatWei(configs.PRIORITY_GAS, 'gwei')),
                        'type': web3.utils.toHex('2'),
                        'data': g.methods.approve(contract.router._address, maxUint256()).encodeABI(),
                        'nonce': nonce,
                        'chainId': chain
                    }, privateKey).then(y => C(y)).catch(y => H(y));
                    else return H(err);
                });
            });
        }
    });
};

export const afterSwapMonitor = (userAddress, privateKey, contractAddress, configs, chain, exchange, menuSelection) => {
    return new Promise(async (s, j) => {
        let balance;
        let decimals;
        let symbol;
        const spinner = ora({ text: ('Indexing'), spinner: "aesthetic" }).start();

        const z = process.hrtime();

        const O = new secondary.eth.Contract([{
            'constant': true,
            'inputs': [{
                'name': '',
                'type': 'address'
            }],
            'name': 'balanceOf',
            'outputs': [{
                'name': '',
                'type': 'uint256'
            }],
            'payable': false,
            'stateMutability': 'view',
            'type': 'function'
        }, {
            'inputs': [],
            'name': 'decimals',
            'outputs': [{
                'internalType': 'uint8',
                'name': '',
                'type': 'uint8'
            }],
            'stateMutability': 'view',
            'type': 'function'
        }, {
            'constant': true,
            'inputs': [],
            'name': 'symbol',
            'outputs': [{
                'name': '',
                'type': 'string'
            }],
            'payable': false,
            'stateMutability': 'view',
            'type': 'function'
        }], contractAddress);

        return await A();

        async function A() {
            balance = new BN(await O.methods.balanceOf(userAddress).call());
            decimals = await O.methods.decimals().call();
            symbol = await O.methods.symbol().call();
            return await e();
        }

        async function e() {
            const w = new BN('0');
            const C = new BN(await O.methods.balanceOf(userAddress).call());
            if (C.lte(balance)) return await e();
            let H = false;
            let g;
            let b = false;
            let R;
            let y;
            let i = w;
            let c = true;
            let M = false;
            const N = process.hrtime(z);
            spinner.succeed('Indexed at: ' + (await getSecondaryBlock()) + ' / Took: ' + (Number((N[0] * 1000000000 + N[1]) / 1000000) / 1000).toFixed(4) + ' seconds');

            if (configs.RUG_PULL_CHECK.toLowerCase() === 'true' && menuSelection !== 341 && menuSelection !== 342) {
                H = true;
                printSubHeading('Liquidity Rug Pull Checker');
                const d = 'Listening for `removeLiquidity` transaction in the background.';
                configs.SELL_MANAGEMENT.toLowerCase() === 'true' ? spinner.info(d) : spinner.start(d);

                g = web3.eth.subscribe('pendingTransactions', async (a, K) => {
                    const S = await web3.eth.getTransaction(K);

                    if (S != null && S.to === contract.router._address && S.input !== '0x') {
                        const q = abiDecoder.decodeMethod(S.input);
                        const F = ['removeLiquidity', 'removeLiquidityETH', 'removeLiquidityKCS', 'removeLiquidityAVAX', 'removeLiquidityETHSupportingFeeOnTransferTokens', 'removeLiquidityKCSSupportingFeeOnTransferTokens', 'removeLiquidityAVAXSupportingFeeOnTransferTokens', 'removeLiquidityETHWithPermit', 'removeLiquidityKCSWithPermit', 'removeLiquidityAVAXWithPermit', 'removeLiquidityETHWithPermitSupportingFeeOnTransferTokens', 'removeLiquidityKCSWithPermitSupportingFeeOnTransferTokens', 'removeLiquidityAVAXWithPermitSupportingFeeOnTransferTokens', 'removeLiquidityWithPermit'];
                        q && F.includes(q.name) && (q.params[0].value && q.params[0].value.toLowerCase() === contractAddress.toLowerCase() || q.params[1].value && q.params[1].value.toLowerCase() === contractAddress.toLowerCase()) && (configs.SELL_MANAGEMENT.toLowerCase() === 'true' && (clearInterval(R), spinner.fail('Closed Value: ' + y)), spinner.warn('Detected `removeLiquidity` Tx: ' + S.hash), r('100', new BN(S.gasPrice).mul(new BN('125')).div(new BN('100'))).then(Y => {
                            spinner.succeed('Swap Tx: ' + Y + '\n');
                            T().then(() => s());
                        }).catch(Y => {
                            spinner.stop();
                            fileLogger.error('SWAP: swapExactTokensForETHSupportingFeeOnTransferTokens().signThenSendPrimaryTxn(): ' + Y);
                            T().then(() => j('Something went wrong... Check logs...'));
                        }));
                    }
                });
            }

            configs.SELL_MANAGEMENT.toLowerCase() === 'true' && menuSelection !== 341 && menuSelection !== 342 && (b = true, printSubHeading('Sell Management'), console.log('Press the <Q> key to sell 25% of your bag.'), console.log('Press the <W> key to sell 50% of your bag.'), console.log('Press the <E> key to sell 75% of your bag.'), console.log('Press the <R> key to sell 100% of your bag.\n'), spinner.start('Loading'), R = B());

            function B() {
                return setInterval(async () => {
                    let a = new BN(await O.methods.balanceOf(userAddress).call());

                    if (a.gt(w)) {
                        i.gt(w) && a.lt(i) && (i = w, c = true);
                        const K = await getAmountsOut(a, contractAddress, native);
                        let S = await getAmountsOut(K);
                        if (chain !== 56 && chain !== 321) S = formatWei(S.toString(), 'szabo');
                        if (decimals === 18) a = formatEther(a);
                        else {
                            if (decimals === 15) a = formatEther(a, 'kwei');
                            else {
                                if (decimals === 12) a = formatEther(a, 'mwei');
                                else {
                                    if (decimals === 9) a = formatEther(a, 'gwei');
                                    else {
                                        if (decimals === 6) a = formatEther(a, 'szabo');
                                        else decimals === 3 ? a = formatEther(a, 'finney') : a = a.div(new BN('10').pow(new BN(decimals))).toString();
                                    }
                                }
                            }
                        }
                        let q = configs.AMT_MODE.toLowerCase() === 'eth' ? K : S;
                        q = Number(formatEther(q)) / (parseFloat(configs.AMOUNT) * parseInt(configs.ITERATION));
                        q = q > 1 ? chalk.bgGreen.bold(' ' + Number(q).toFixed(2) + ' ') : q < 1 ? chalk.bgRed.bold(' ' + Number(q).toFixed(2) + ' ') : Number(q).toFixed(4);
                        y = numberWithCommas(Number(a).toFixed(4)) + ' ' + symbol.toUpperCase() + ' (' + numberWithCommas(Number(formatEther(K)).toFixed(4)) + ' ' + symbol + ' / ' + numberWithCommas(Number(formatEther(S)).toFixed(2)) + ' USD) @ ' + q + ' x Multiplier';
                        spinner.start('Live Value: ' + y);
                    } else {
                        c = false;
                        spinner.start('Loading - ' + numberWithCommas(Number(a).toFixed(4)) + ' ' + symbol.toUpperCase());
                    }
                }, 1500);
            }

            (H || b) && (readline.emitKeypressEvents(process.stdin), process.stdin.setRawMode(true), process.stdin.resume(), process.stdin.on('keypress', L));

            async function L(a, K) {
                if (c && b && K && (K.name === 'q' || K.name === 'w' || K.name === 'e' || K.name === 'r')) {
                    const S = K.name === 'q' ? '25' : K.name === 'w' ? '50' : K.name === 'e' ? '75' : '100';
                    clearInterval(R);
                    spinner.fail('Closed Value: ' + y);
                    console.log('Executing swapExactTokensForETHSupportingFeeOnTransferTokens() with ' + S + '%');
                    spinner.start('Pending');
                    c = false;

                    r(S, await getPrimaryGas()).then(q => {
                        spinner.succeed('Swap Tx: ' + q + '\n');
                        K.name === 'r' ? T().then(() => s()) : (spinner.start('Loading'), R = B());
                    }).catch(q => {
                        spinner.stop();
                        fileLogger.error('SWAP: swapExactTokensForETHSupportingFeeOnTransferTokens().signThenSendPrimaryTxn(): ' + q);
                        T().then(() => j('Something went wrong... Check logs...'));
                    });
                } else K?.ctrl && K.name === 'c' && T().then(() => {
                    if (M) return process.exit();
                    return s();
                });
            }

            function r(a, K) {
                return new Promise((S, q) => {
                    web3.eth.getTransactionCount(userAddress, 'pending').then(async nonce => {
                        const swapExactForTokens = exchange === 'KOFFEE' ? contract.router.methods.swapExactTokensForKCSSupportingFeeOnTransferTokens : exchange === 'TRADER' ? contract.router.methods.swapExactTokensForAVAXSupportingFeeOnTransferTokens : contract.router.methods.swapExactTokensForETHSupportingFeeOnTransferTokens;
                        i = new BN(await O.methods.balanceOf(userAddress).call());
                        const P = i.mul(new BN(a)).div(new BN('100')).toString();
                        swapExactForTokens(P, '0', [contractAddress, native], userAddress, getDeadline()).estimateGas({
                            'from': userAddress,
                            'gas': 100000000,
                            'value': 0
                        }, async (err, estimatedGas) => {
                            if (!err) signThenSendPrimaryTxn(chain !== 1 && chain !== 4 ? {
                                'to': contract.router._address,
                                'value': web3.utils.toHex('0'),
                                'gasLimit': web3.utils.toHex(Math.round(parseInt(estimatedGas) * 2.5)),
                                'gasPrice': web3.utils.toHex(K),
                                'data': swapExactForTokens(P, '0', [contractAddress, native], userAddress, getDeadline()).encodeABI(),
                                'nonce': nonce,
                                'chainId': chain
                            } : {
                                'to': contract.router._address,
                                'value': web3.utils.toHex('0'),
                                'gasLimit': web3.utils.toHex(Math.round(parseInt(estimatedGas) * 2.5)),
                                'maxFeePerGas': web3.utils.toHex(K),
                                'maxPriorityFeePerGas': web3.utils.toHex(formatWei(configs.PRIORITY_GAS, 'gwei')),
                                'type': web3.utils.toHex('2'),
                                'data': swapExactForTokens(P, '0', [contractAddress, native], userAddress, getDeadline()).encodeABI(),
                                'nonce': nonce,
                                'chainId': chain
                            }, privateKey).then(o => {
                                M = false;
                                return S(o);
                            }).catch(o => q(o));
                            else return M = true, fileLogger.error('SWAP: swapExactTokensForETHSupportingFeeOnTransferTokens().estimateGas(): ' + err), await sleep(500), r(a, K);
                        });
                    });
                });
            }

            function T() {
                return new Promise(a => {
                    if (b) clearInterval(R);
                    spinner.stop();
                    printErrorHeading('Closing Sniper Events');
                    H && (g.unsubscribe(), spinner.fail('Unsubscribed to `removeLiquidity` transaction.'));
                    b && spinner.fail('Unsubscribed to the sniped token price feed.');
                    process.stdin.setRawMode(false);
                    process.stdin.removeListener('keypress', L);
                    spinner.clear();
                    return a();
                });
            }

            if (configs.RUG_PULL_CHECK.toLowerCase() !== 'true' && configs.SELL_MANAGEMENT.toLowerCase() !== 'true' || menuSelection === 341 || menuSelection === 342) return s();
        }
    });
};

export const predictionBotMethodology = (userAddress, privateKey, configs, menuOption, menuSelection) => {
    return new Promise(async (s, j) => {
        const contractAddress = menuOption === 50 ? contract.predictionPcsBNB._address : menuOption === 90 ? contract.predictionCgBTC._address : menuOption === 91 ? contract.predictionCgBNB._address : menuOption === 92 ? contract.predictionCgETH._address : null;
        const rounds = menuOption === 50 ? contract.predictionPcsBNB.methods.rounds : menuOption === 90 ? contract.predictionCgBTC.methods.Rounds : menuOption === 91 ? contract.predictionCgBNB.methods.Rounds : menuOption === 92 ? contract.predictionCgETH.methods.Rounds : null;
        const betBear = menuOption === 50 ? contract.predictionPcsBNB.methods.betBear : menuOption === 90 ? contract.predictionCgBTC.methods.user_BetBear : menuOption === 91 ? contract.predictionCgBNB.methods.user_BetBear : menuOption === 92 ? contract.predictionCgETH.methods.user_BetBear : null;
        const betBull = menuOption === 50 ? contract.predictionPcsBNB.methods.betBull : menuOption === 90 ? contract.predictionCgBTC.methods.user_BetBull : menuOption === 91 ? contract.predictionCgBNB.methods.user_BetBull : menuOption === 92 ? contract.predictionCgETH.methods.user_BetBull : null;
        const claimable = menuOption === 50 ? contract.predictionPcsBNB.methods.claimable : menuOption === 90 ? contract.predictionCgBTC.methods.claimable : menuOption === 91 ? contract.predictionCgBNB.methods.claimable : menuOption === 92 ? contract.predictionCgETH.methods.claimable : null;
        const refundable = menuOption === 50 ? contract.predictionPcsBNB.methods.refundable : menuOption === 90 ? contract.predictionCgBTC.methods.refundable : menuOption === 91 ? contract.predictionCgBNB.methods.refundable : menuOption === 92 ? contract.predictionCgETH.methods.refundable : null;
        const ledger = menuOption === 50 ? contract.predictionPcsBNB.methods.ledger : menuOption === 90 ? contract.predictionCgBTC.methods.Bets : menuOption === 91 ? contract.predictionCgBNB.methods.Bets : menuOption === 92 ? contract.predictionCgETH.methods.Bets : null;
        const claim = menuOption === 50 ? contract.predictionPcsBNB.methods.claim : menuOption === 90 ? contract.predictionCgBTC.methods.user_Claim : menuOption === 91 ? contract.predictionCgBNB.methods.user_Claim : menuOption === 92 ? contract.predictionCgETH.methods.user_Claim : null;
        if (rounds === null || betBear === null || betBull === null || claimable === null || refundable === null || ledger === null || claim === null) return j('Prediction EOFError');
        const spinner = ora({ text: ('Pending Round'), spinner: "aesthetic" }).start();
        let C;
        let H;
        let g;
        let b;
        let R;

        async function y() {
            H = menuOption === 50 ? await contract.predictionPcsBNB.methods.currentEpoch().call() : menuOption === 90 ? await contract.predictionCgBTC.methods.currentEpoch().call() : menuOption === 91 ? await contract.predictionCgBNB.methods.currentEpoch().call() : menuOption === 92 ? await contract.predictionCgETH.methods.currentEpoch().call() : 0;
            g = +H - 1;
            b = await rounds(H).call();
        }

        const i = {
            'lastBet': null,
            'lastAmt': null
        };

        function c(T, d, a = false) {
            (!i.lastBet && !i.lastAmt || a) && (i.lastBet = T, i.lastAmt = d);
        }

        return await M();

        async function M() {
            if (menuOption === 50 ? await contract.predictionPcsBNB.methods.paused().call() : menuOption === 90 ? await contract.predictionCgBTC.methods.paused().call() : menuOption === 91 ? await contract.predictionCgBNB.methods.paused().call() : menuOption === 92 ? await contract.predictionCgETH.methods.paused().call() : true) {
                spinner.stop();
                return j('Market Paused');
            }
            await y();
            if (C === H) return await M();
            else C = H;
            R = N();
        }

        function N() {
            return setInterval(async () => {
                const T = Math.floor(Date.now() / 1000);
                const d = T - +b.startTimestamp;
                const a = +b.lockTimestamp - T;

                if (d === 288 && a === 12) {
                    clearInterval(R);
                    let K = true;
                    let S = false;
                    let q;
                    if (configs.AMT_MODE.toLowerCase() === 'usd') q = await getAmountsOut(formatWei(configs.AMOUNT), usd, native);
                    else {
                        if (configs.AMT_MODE.toLowerCase() === 'eth') q = new BN(formatWei(configs.AMOUNT));
                        else {
                            fileLogger.error('CORE: predictionBotMethodology(): Native Error');
                            throw 'Native Error';
                        }
                    }
                    const txConfig = {
                        'to': contractAddress,
                        'value': web3.utils.toHex(q),
                        'gasLimit': undefined,
                        'gasPrice': web3.utils.toHex(configs.GAS_PRICE === '0' ? (await getPrimaryGas()).mul(new BN('2')) : formatWei(configs.GAS_PRICE, 'gwei')),
                        'data': undefined,
                        'nonce': undefined
                    };
                    let Y = await rounds(H).call();
                    const P = new BN(Y.bullAmount);
                    const f = new BN(Y.bearAmount);
                    const V = P.gt(new BN('0')) && f.gt(new BN('0')) && P.gt(f) && P.div(f).lt(new BN('5')) || P.lt(f) && f.div(P).gt(new BN('5'));
                    let o = 0;
                    let Z = 0;
                    const n = [];

                    for (let I = 1; I <= 2; I++) {
                        Y = await rounds(+H - I).call();
                        let v = new BN(Y.closePrice);
                        const W = new BN(Y.lockPrice);
                        const t = await B();
                        if (+H - I === +H - 1) v = t;
                        if (v.gt(W)) {
                            o++;
                            n.push(' ' + (+H - I) + ' BULL');
                        } else
                            v.lt(W) && (Z++, n.push(' ' + (+H - I) + ' BEAR'));
                    }

                    const k = o === 2 ? betBull : Z === 2 ? betBear : false;
                    !k && menuSelection === 591 && (spinner.fail('Skipping Round ' + H + ' / Past Results: {' + n + ' }'), K = false, S = true);

                    if (i.lastBet && i.lastAmt) {
                        Y = await rounds(+H - 1).call();
                        const m = new BN(Y.lockPrice);
                        const G0 = await B();
                        if (i.lastBet === 'BULL' && G0.gt(m) || i.lastBet === 'BEAR' && G0.lt(m)) {
                            txConfig.value = web3.utils.toHex(q);
                            c(null, null, true);
                            spinner.stop();
                            console.log(chalk.yellow('Won') + ' Previous Round ' + (+H - 1));
                        } else {
                            if (G0.eq(m)) {
                                spinner.stop();
                                console.log(chalk.red('Refunded') + ' Previous Round ' + (+H - 1));
                            } else {
                                if (menuSelection === 593) {
                                    const G1 = i.lastAmt.mul(new BN('2'));
                                    txConfig.value = web3.utils.toHex(G1);
                                    i.lastAmt = G1;
                                    spinner.stop();
                                    console.log(chalk.yellow('Martingale Betting') + ' for Round ' + H + ' / Doubling to: ' + numberWithCommas(Number(formatEther(G1)).toFixed(4)) + ' ' + symbol);
                                }
                            }
                        }
                    }

                    if (K) {
                        if (k) await L(H, k, txConfig).then(G2 => {
                            spinner.stop();
                            console.log(chalk.yellow('Streak') + ' Betting ' + chalk.bold(o === 2 ? 'BULL' : 'BEAR') + ' for Round ' + H + ' / Past Results: {' + n + ' }');
                            spinner.succeed('BSC Credit Tx: ' + G2.credit);
                            spinner.succeed('Betting Tx: ' + G2.prediction);
                            c(o === 2 ? 'BULL' : 'BEAR', q);
                            i.lastBet = o === 2 ? 'BULL' : 'BEAR';
                            S = true;
                        }).catch(G2 => {
                            spinner.stop();
                            return j(G2);
                        });
                        else (menuSelection === 592 || menuSelection === 593) && (V ? await L(H, betBear, txConfig).then(G2 => {
                            spinner.stop();
                            console.log('Betting ' + chalk.bold('BEAR') + ' for Round ' + H);
                            spinner.succeed('BSC Credit Tx: ' + G2.credit);
                            spinner.succeed('Betting Tx: ' + G2.prediction);
                            c('BEAR', q);
                            i.lastBet = 'BEAR';
                            S = true;
                        }).catch(G2 => {
                            spinner.stop();
                            return j(G2);
                        }) : await L(H, betBull, txConfig).then(G2 => {
                            spinner.stop();
                            console.log('Betting ' + chalk.bold('BULL') + ' for Round ' + H);
                            spinner.succeed('BSC Credit Tx: ' + G2.credit);
                            spinner.succeed('Betting Tx: ' + G2.prediction);
                            c('BULL', q);
                            i.lastBet = 'BULL';
                            S = true;
                        }).catch(G2 => {
                            spinner.stop();
                            return j(G2);
                        }));
                    }

                    const h = [];

                    for (let G2 = 1; G2 <= 10; G2++) {
                        const G3 = +H - G2;

                        const [G4, G5, {
                            claimed: G6,
                            amount: G7
                        }] = await Promise.all([claimable(G3, userAddress).call(), refundable(G3, userAddress).call(), ledger(G3, userAddress).call()]);

                        if (G7 > 0 && (G4 || G5) && !G6) h.push(G3);
                    }

                    h.length ? web3.eth.getTransactionCount(userAddress, 'pending').then(G8 => {
                        claim(h).estimateGas({
                            'from': userAddress,
                            'gas': 100000000,
                            'value': 0
                        }, (G9, GG) => {
                            !G9 ? (txConfig.value = web3.utils.toHex('0'), txConfig.gasLimit = web3.utils.toHex(Math.round(parseInt(GG) * 2.5)), txConfig.data = claim(h).encodeABI(), txConfig.nonce = G8, signThenSendPrimaryTxn(txConfig, privateKey).then(GD => {
                                spinner.succeed('Claim Tx: ' + GD + '\n');
                            }).catch(GD => {
                                fileLogger.error('PREDICTION: Claim().signThenSendPrimaryTxn(): ' + GD);
                                spinner.stop();
                                console.log();
                            })) : (fileLogger.error('PREDICTION: Claim().estimateGas(): ' + G9), spinner.stop(), console.log());
                        });
                    }) : (spinner.stop(), console.log());
                    if (S) R = r();
                } else spinner.start('Waiting Round: ' + g + ' / Betting Round: ' + H + ' (Left: ' + (+a - 12) + ')');
            }, 1000);
        }

        async function B() {
            if (menuOption === 50) {
                const {
                    answer: T
                } = await contract.predictionPcsBNB_oracle.methods.latestRoundData().call();
                return new BN(T);
            }

            if (menuOption === 90) return formatWei(await fetchBinancePrice('BTCUSDT')).div(new BN('10').pow(new BN('10')));
            if (menuOption === 91) return formatWei(await fetchBinancePrice('BNBUSDT')).div(new BN('10').pow(new BN('10')));
            if (menuOption === 92) return formatWei(await fetchBinancePrice('ETHUSDT')).div(new BN('10').pow(new BN('10')));
            return new BN('0');
        }

        function L(T, d, txData) {
            return new Promise((K, S) => {
                web3.eth.getTransactionCount(userAddress, 'pending').then(nonce => {
                    d(T).estimateGas({
                        'from': userAddress,
                        'gas': 100000000,
                        'value': txData.value
                    }, (err, estimatedGas) => {
                        if (!err) {
                            txData.gasLimit = web3.utils.toHex(Math.round(parseInt(estimatedGas) * 2.5));
                            txData.data = d(T).encodeABI();
                            const f = {
                                'prediction': ''
                            };

                            txData.nonce = nonce;

                            signThenSendPrimaryTxn(txData, privateKey).then(V => {
                                f.prediction = V;
                                return K(f);
                            }).catch(V => {
                                fileLogger.error('PREDICTION: betMethod().signThenSendPrimaryTxn(): ' + V);
                                return S('Something went wrong... Check logs...');
                            });
                        } else {
                            fileLogger.error('PREDICTION: betMethod().estimateGas(): ' + err);
                            return S(err);
                        }
                    });
                });
            });
        }

        function r() {
            return setInterval(async () => {
                if (+b.lockTimestamp - Math.floor(Date.now() / 1000) < -8) {
                    clearInterval(R);
                    return await M();
                } else
                    spinner.start('Pending Next Round');
            }, 1000);
        }
    });
};