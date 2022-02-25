import BN from 'bn.js';
import chalk from 'chalk';
import ora from 'ora';
import {
    fetchTrustWalletTokens
} from './components/fetch/index.js';
import {
    castFiglet
} from './components/figlet/index.js';
import {
    agreeDisclaimer,
    chainSelectionChoices,
    confirmProceed,
    confirmReload,
    contractAddressInput,
    exchangeMenuSelection,
    exchangeSelection,
    fastestAlertsTelegramConfiguration,
    telegramScannerInput,
    temporaryUnavailable
} from './components/inquirer/index.js';
import {
    initializeWeb3
} from './components/web3/index.js';
import {
    fileLogger,
    somethingWentWrong
} from './components/winston/index.js';
import {
    printErrorHeading,
    printHeading,
    printInfoLine,
    printLocation,
    printMainHeader,
    printReason,
    printSubHeading,
    printSubInfoLine,
    printTxnCompleted
} from './console/index.js';
import {
    initializeEthereum
} from './ethereum/index.js';
import {
    getAmountsOut,
    getBalance,
    getNative,
    getSymbol,
    getUsd,
    initializeExchange
} from './exchange/index.js';
import {
    formatEther,
    formatGWei,
    formatWei,
    getPrimaryBlock,
    getPrimaryGas,
    getSecondaryBlock,
    getUserAddress,
    initializeHelper,
    numberWithCommas,
    regexFastestAlertsMessage,
    regexMessageForCa,
    runPrimaryLatencyTests,
    runSecondaryLatencyTests,
} from './helper/index.js';
import {
    executePredictionBot,
    executePresaleContribution,
    executeSniperSwap,
    initializePresaleContract
} from './parser/index.js';
import {
    initializeTelegram,
    stopTelegram
} from './telegram/index.js';
import {
    getCoreLocation,
    readFile,
    validateConfigs,
    validateSettings,
    validateTelegram,
    writeFile
} from './utilities/index.js';

const Package = {
    name: "defi-cli",
    version: "0.1.0"
}

let settings;
let configs;
let telegram;
let chain;
let exchange;
let exchangeName;

async function disclaimer() {
    castFiglet(Package.name.toUpperCase()).then(G => {
        printMainHeader(G, Package.version);
        printErrorHeading('DISCLAIMER');
        console.log('All investment strategies and investments involve risk of loss.');
        console.log('By using DEFI-CLI, you agree to accept all liabilities, and that');
        console.log('no claims can be made against the developers.');
        console.log('\nDEFI-CLI is ' + chalk.yellow('FREE') + ' to download.');
        console.log('If you paid someone to download DEFI-CLI, you have been ' + chalk.red('SCAMMED') + '!');

        agreeDisclaimer().then(() => {
            initializeFiles();
        });
    });
}

function start() {
    return disclaimer();
}

(async () => {
    await start();
})();

const initializeFiles = () => {
    readFile('settings').then(G => {
        settings = G;

        readFile('configs').then(D => {
            configs = D;

            readFile('telegram').then(J => {
                telegram = J;
                return chainSelection();
            }).catch(() => {
                writeFile('telegram', {
                    'API_ID': '',
                    'API_HASH': ''
                }).then(() => initializeFiles());
            });
        }).catch(() => {
            writeFile('configs', {
                'AMT_MODE': 'USD',
                'AMOUNT': '10',
                'SLIPPAGE': '100',
                'ITERATION': '1',
                'GAS_PRICE': '0',
                'PRIORITY_GAS': '1',
                'HONEYPOT_CHECK': 'false',
                'BLOCK_SEVERE_FEE': 'false',
                'DELAY_EXECUTION': '0',
                'DELAY_ITERATION': '0',
                'RUG_PULL_CHECK': 'false',
                'SELL_MANAGEMENT': 'false'
            }).then(() => initializeFiles());
        });
    }).catch(() => {
        writeFile('settings', {
            'EVM_NODE': 'GA',
            'PRIVATE_KEY': ''
        }).then(() => initializeFiles());
    });
};

const chainSelection = () => {
    castFiglet(Package.name.toUpperCase()).then(packageName => {
        printMainHeader(packageName, Package.version);
        printHeading('Ethereum Virtual Machine');

        chainSelectionChoices().then(chainSelection => {
            if (chainSelection === 0)
                return process.exit();
            else {
                chain = chainSelection;

                exchangeSelection(chain).then(exchangeSelection => {
                    if (exchangeSelection === 0) return process.exit();
                    else return exchangeSelection === 1 ? chainSelection() : (exchange = exchangeSelection, preloadEthereum());
                });
            }
        });
    });
};

const preloadEthereum = () => {
    const spinner = ora({ text: ('Connecting'), spinner: "aesthetic" }).start();
    validateSettings(settings).then(() => {
        initializeWeb3(chain, settings.EVM_NODE).then(nodeList => {
            initializeEthereum(nodeList).then(() => {
                initializeHelper().then(() => {
                    initializeExchange(chain, exchange).then(() => {
                        spinner.stop();
                        return bootstrapExchange();
                    });
                });
            });
        }).catch(nodeList => {
            spinner.stop();
            printErrorHeading('ERROR ESTABLISHING CONNECTION');
            printReason(nodeList);
            printLocation(getCoreLocation('settings.json'));

            confirmReload().then(() => {
                readFile('settings').then(J => {
                    settings = J;
                    return preloadEthereum();
                }).catch(() => {
                    fileLogger.error('CORE: readFile(): Not Found');
                    return somethingWentWrong();
                });
            });
        });
    }).catch(nodeList => {
        spinner.stop();
        printErrorHeading('MISCONFIGURED SETTINGS');
        printReason(nodeList);
        printLocation(getCoreLocation('settings.json'));

        confirmReload().then(() => {
            readFile('settings').then(J => {
                settings = J;
                return preloadEthereum();
            }).catch(() => {
                fileLogger.error('CORE: readFile(): Not Found');
                return somethingWentWrong();
            });
        });
    });
};

const bootstrapExchange = () => {
    readFile('configs').then(G => {
        configs = G;

        switch (exchange) {
            case 'UNI':
                exchangeName = 'Uniswap';
                break;

            case 'SUSHI':
                exchangeName = 'SushiSwap';
                break;

            case 'PANCAKE':
                exchangeName = 'PancakeSwap';
                break;

            case 'APE':
                exchangeName = 'ApeSwap';
                break;

            case 'CANDLE':
                exchangeName = 'Candle Genie';
                break;

            case 'QUICK':
                exchangeName = 'QuickSwap';
                break;

            case 'SPOOKY':
                exchangeName = 'SpookySwap';
                break;

            case 'SPIRIT':
                exchangeName = 'SpiritSwap';
                break;

            case 'KOFFEE':
                exchangeName = 'KoffeeSwap';
                break;

            case 'KU':
                exchangeName = 'KuSwap';
                break;

            case 'TRADER':
                exchangeName = 'Trader Joe';
                break;

            case 'LAUNCH':
                exchangeName = 'Launchpad';
                break;

            default:
                exchangeName = '';
                break;
        }

        castFiglet(exchangeName).then(D => {
            printMainHeader(D, Package.version);

            parseUserDetails().then(() => {
                parseChainDetails().then(() => parseConfiguration());
            });
        });
    }).catch(() => {
        fileLogger.error('CORE: readFile(): Not Found');
        return somethingWentWrong();
    });
};

const parseUserDetails = async () => {
    printHeading('User Details');
    const G = getUserAddress(settings.PRIVATE_KEY);
    printInfoLine('Wallet Address', '0x...' + G.slice(38));
    const J = await getBalance(G);
    let l = await getAmountsOut(J);
    if (chain !== 56 && chain !== 321) l = formatWei(l.toString(), 'szabo');
    printInfoLine(getSymbol() + ' Balance', numberWithCommas(Number(formatEther(J)).toFixed(4)) + ' ' + getSymbol() + ' (' + numberWithCommas(Number(formatEther(l)).toFixed(2)) + ' USD)');
};

const parseChainDetails = async () => {
    let chainName;

    switch (chain) {
        case 1:
            chainName = 'Ethereum Mainnet';
            break;

        case 4:
            chainName = 'Rinkeby Test Network';
            break;

        case 56:
            chainName = 'Binance Smart Chain';
            break;

        case 137:
            chainName = 'Polygon Mainnet';
            break;

        case 250:
            chainName = 'Fantom Opera';
            break;

        case 321:
            chainName = 'KCC Mainnet';
            break;

        case 43_114:
            chainName = 'Avalanche Mainnet';
            break;

        default:
            chainName = '';
            break;
    }

    printHeading('Chain Details');
    const evmNode = settings.EVM_NODE;
    evmNode.toLowerCase().startsWith('https') || evmNode.toLowerCase().startsWith('wss') ? printInfoLine('Network', evmNode) : printInfoLine('Network', chainName + ' (' + evmNode.toUpperCase() + ')');
    const J = await getPrimaryGas();
    printInfoLine('Network Gas', formatGWei(J) + ' GWei');
    const l = await getPrimaryBlock();
    printInfoLine('Node Block', chalk.yellow(l));
    const X = await getSecondaryBlock();
    printInfoLine('Chain Block', chalk.yellow(X));
    let u = chalk.red('OUT-OF-SYNC');
    if (l >= X || l - X >= -5) u = chalk.green('IN-SYNC');
    printInfoLine('Status', u);
};

const parseConfiguration = () => {
    validateConfigs(configs, settings, chain).then(() => {
        printHeading('Loaded Configs');
        printInfoLine('Transactions', chalk.bold(configs.AMOUNT) + ' ' + configs.AMT_MODE.toUpperCase() + ' * ' + chalk.bold(configs.ITERATION) + ' Iteration (' + chalk.bold(configs.GAS_PRICE === '0' ? 'Auto' : configs.GAS_PRICE) + ' / ' + chalk.bold(configs.PRIORITY_GAS) + ' GWei)');
        printInfoLine('Honeypot Check', 'Enable ' + chalk.bold('' + configs.HONEYPOT_CHECK.charAt(0).toUpperCase() + configs.HONEYPOT_CHECK.slice(1).toLowerCase()) + ' / Block Severe Fee ' + chalk.bold('' + configs.BLOCK_SEVERE_FEE.charAt(0).toUpperCase() + configs.BLOCK_SEVERE_FEE.slice(1).toLowerCase()));
        printInfoLine('Sniper Swap Delay', 'Execution ' + chalk.bold(configs.DELAY_EXECUTION) + ' Sec / Iteration ' + chalk.bold(configs.DELAY_ITERATION) + ' Sec');
        printInfoLine('After Sniper Swap', 'Rug Pull Check ' + chalk.bold('' + configs.RUG_PULL_CHECK.charAt(0).toUpperCase() + configs.RUG_PULL_CHECK.slice(1).toLowerCase()) + ' / Sell Mgn ' + chalk.bold('' + configs.SELL_MANAGEMENT.charAt(0).toUpperCase() + configs.SELL_MANAGEMENT.slice(1).toLowerCase()));
        return exchangeMenu();
    }).catch(G => {
        printErrorHeading('MISCONFIGURED CONFIGS');
        printReason(G);
        printLocation(getCoreLocation('configs.json'));
        confirmReload().then(() => bootstrapExchange());
    });
};

const exchangeMenu = () => {
    printHeading(exchangeName + ' Menu');

    exchangeMenuSelection(exchange).then(menu => {
        if (menu.option === 0) return process.exit();
        else {
            if (menu.option === 1) return chainSelection();
            else {
                if (menu.option === 2) return latencyPingTests();
                else {
                    if (menu.option === 3 || menu.selection && menu.selection === 1) return bootstrapExchange();
                    else {
                        if (menu.option === 60 || menu.option === 70) {
                            if (chain === 250 && menu.option === 70) {
                                printErrorHeading('NOT SUPPORTED');
                                printReason('PinkSale does not support Fantom Opera.');
                                temporaryUnavailable().then(() => bootstrapExchange());
                            } else
                                return estimatedSpendingRouter(menu.option);
                        } else {
                            if (menu.selection) {
                                if (menu.selection === 130 || menu.selection === 342) temporaryUnavailable().then(() => bootstrapExchange());
                                else return estimatedSpendingRouter(menu.option, menu.selection);
                            } else temporaryUnavailable().then(() => bootstrapExchange());
                        }
                    }
                }
            }
        }
    });
};

const latencyPingTests = async () => {
    printHeading('Latency Ping Tests');
    const spinner = ora({ text: ('Pinging'), spinner: "aesthetic" }).start();
    const D = await runPrimaryLatencyTests();
    const J = await runSecondaryLatencyTests();
    spinner.stop();
    console.log('Results are in milliseconds.\n');
    printInfoLine('Primary Node', '' + chalk.yellow(Number(D).toFixed(4)));
    printInfoLine('Secondary Node', '' + chalk.yellow(Number(J).toFixed(4)));
    confirmReload().then(() => bootstrapExchange());
};

const estimatedSpendingRouter = async (menuOption, menuSelection = 0) => {
    printHeading('Estimated Spending');
    let J;
    let l;
    const X = menuSelection !== 130 && menuSelection !== 120 && menuSelection !== 110 ? parseFloat(configs.AMOUNT) : parseFloat(configs.AMOUNT) * parseInt(configs.ITERATION);

    if (configs.AMT_MODE.toLowerCase() === 'usd') {
        const p = chain !== 56 && chain !== 321 ? formatWei(X.toString(), 'mwei') : formatWei(X.toString());
        J = await getAmountsOut(p, getUsd(), getNative());
        l = new BN(formatWei(X.toString()));
    } else {
        if (configs.AMT_MODE.toLowerCase() === 'eth') {
            J = new BN(formatWei(X.toString()));
            l = await getAmountsOut(formatWei(X.toString()));
            if (chain !== 56 && chain !== 321) l = formatWei(l.toString(), 'szabo');
        } else {
            fileLogger.error('CORE: estimatedSpendingRouter(): Native Error');
            return somethingWentWrong();
        }
    }

    const u = getUserAddress(settings.PRIVATE_KEY);
    printInfoLine(getSymbol() + ' Spending', '~' + numberWithCommas(Number(formatEther(J)).toFixed(4)) + ' ' + getSymbol() + ' (' + numberWithCommas(Number(formatEther(l)).toFixed(2)) + ' USD)');
    if (menuSelection !== 130 && menuSelection !== 120 && menuSelection !== 110) console.log(chalk.bold('Per Transaction') + ' (Iteration Excluded)');
    console.log('\nPlease make sure you have more than enough ' + getSymbol() + ' balance');
    console.log('in your wallet, otherwise the transaction will not be submitted.');
    const x = await getBalance(u)
    x.lt(J.mul(new BN('20')).div(new BN('100')).add(J)) ? (printErrorHeading('INSUFFICIENT BALANCE'), console.log('You do not have enough ' + getSymbol() + '.'), confirmReload().then(() => bootstrapExchange())) : confirmProceed().then(() => {
        if (menuOption === 60 || menuOption === 70) return dxPinkPresaleBot(menuOption);
        else {
            if (menuSelection === 110) return telegramScanner();
            else {
                if (menuSelection === 120) return manualInputAddress();
                else {
                    if (menuSelection === 341) return fastestAlertsTelegram(menuOption, menuSelection);
                    else return menuSelection === 591 || menuSelection === 592 || menuSelection === 593 ? predictionBot(menuOption, menuSelection) : (fileLogger.error('CORE: estimatedSpendingRouter(): Router Error'), somethingWentWrong());
                }
            }
        }
    }).catch(() => bootstrapExchange());
};

const dxPinkPresaleBot = menuOption => {
    printHeading((menuOption === 60 ? 'DxSale' : 'PinkSale') + ' Presale Sniper');

    contractAddressInput('Presale').then(async contractAddress => {
        if (contractAddress.length === 42) {
            const spinner = ora({ text: ('Loading'), spinner: "aesthetic" }).start();

            try {
                await initializePresaleContract(contractAddress, menuOption).then(async l => {
                    spinner.stop();
                    printSubHeading('Presale Information');
                    console.log('Make sure all the fetched data are correct.');

                    console.table({
                        'Presale Address': l.presaleAddress,
                        'Token Address': l.tokenAddress,
                        'Token Name': l.tokenName + ' (' + l.tokenSymbol + ')',
                        'Min Contribution': numberWithCommas(Number(formatEther(l.minContribution)).toFixed(4)) + ' ' + getSymbol(),
                        'Max Contribution': numberWithCommas(Number(formatEther(l.maxContribution)).toFixed(4)) + ' ' + getSymbol(),
                        'Soft/Hard Cap': numberWithCommas(Number(formatEther(l.softCap)).toFixed(0)) + '/' + numberWithCommas(Number(formatEther(l.hardCap)).toFixed(0)) + ' ' + getSymbol(),
                        'Start Time': new Date(+l.startTime * 1000).toUTCString(),
                        'End Time': new Date(+l.endTime * 1000).toUTCString()
                    });

                    const X = Math.floor(Date.now() / 1000);

                    if (X < +l.endTime) {
                        if (X < +l.startTime) console.log('Not yet started, but you can set pending orders.');
                        let amountsOut;
                        if (configs.AMT_MODE.toLowerCase() === 'usd') amountsOut = await getAmountsOut(chain !== 56 && chain !== 321 ? formatWei(configs.AMOUNT, 'mwei') : formatWei(configs.AMOUNT), getUsd(), getNative());
                        else {
                            if (configs.AMT_MODE.toLowerCase() === 'eth') amountsOut = new BN(formatWei(configs.AMOUNT));
                            else {
                                fileLogger.error('CORE: dxPinkPresaleBot(): Native Error');
                                throw 'Native Error';
                            }
                        }
                        if (amountsOut.gte(l.minContribution) && amountsOut.lte(l.maxContribution)) {
                            printSubInfoLine('Contribution Amount', formatEther(amountsOut) + ' ' + getSymbol());

                            confirmProceed().then(async () => {
                                await executePresaleContribution(getUserAddress(settings.PRIVATE_KEY), settings.PRIVATE_KEY, l.presaleAddress, l.startTime, menuOption, configs, chain, amountsOut).then(() => {
                                    printTxnCompleted();
                                    confirmReload().then(() => bootstrapExchange());
                                });
                            }).catch(E => {
                                if (!E) return bootstrapExchange();
                                printErrorHeading('PRESALE SNIPER ERROR');
                                printReason(E);
                                confirmReload().then(() => bootstrapExchange());
                            });
                        } else
                            throw 'Contribution amount does not meet the min/max.';
                    } else throw 'The entered presale address has already ended.';
                });
            } catch (l) {
                spinner.stop();
                printErrorHeading('PRESALE SNIPER ERROR');
                printReason(l);
                confirmReload().then(() => bootstrapExchange());
            }
        } else return bootstrapExchange();
    });
};

const telegramScanner = () => {
    validateTelegram(telegram).then(() => {
        printHeading('Telegram Scanner');

        fetchTrustWalletTokens(chain).then(D => {
            telegramScannerInput().then(J => {
                if (J.toLowerCase() === 'c') return bootstrapExchange();
                else {
                    const spinner = ora({ text: ('Listening'), spinner: "aesthetic" });
                    let contractAddress;
                    let u;
                    initializeTelegram(telegram, J, async E => {
                        if (typeof E === 'object') return u = E;

                        if (!contractAddress) {
                            spinner.info(E ? 'Received Message: { ' + E + ' }' : '< Service Message/Media File >');
                            spinner.start();
                            E && (await regexMessageForCa(E, D).then(s => {
                                spinner.stop();
                                printSubInfoLine('\nFound CA', s);
                                contractAddress = s;
                            }));

                            if (contractAddress) {
                                stopTelegram();

                                try {
                                    await executeSniperSwap(getUserAddress(settings.PRIVATE_KEY), settings.PRIVATE_KEY, contractAddress, configs, chain, exchange).then(() => {
                                        printTxnCompleted();
                                        confirmReload().then(() => bootstrapExchange());
                                    });
                                } catch (s) {
                                    printErrorHeading('SNIPER SWAP ERROR');
                                    printReason(s);
                                    confirmReload().then(() => bootstrapExchange());
                                }
                            }
                        }
                    }).catch(() => {
                        printErrorHeading('TELEGRAM ERROR ' + u.error_code);
                        printReason(u.error_message);
                        confirmReload().then(() => telegramScanner());
                    });
                }
            });
        });
    }).catch(G => {
        printErrorHeading('MISCONFIGURED TELEGRAM');
        printReason(G);
        printLocation(getCoreLocation('telegram.json'));

        confirmReload().then(() => {
            readFile('telegram').then(D => {
                telegram = D;
                return telegramScanner();
            }).catch(() => {
                fileLogger.error('CORE: readFile(): Not Found');
                return somethingWentWrong();
            });
        });
    });
};

const manualInputAddress = () => {
    printHeading('Manual Sniper');

    contractAddressInput('Token').then(async contractAddress => {
        if (contractAddress.length === 42) try {
            await executeSniperSwap(getUserAddress(settings.PRIVATE_KEY), settings.PRIVATE_KEY, contractAddress, configs, chain, exchange).then(() => {
                printTxnCompleted();
                confirmReload().then(() => bootstrapExchange());
            });
        } catch (D) {
            printErrorHeading('SNIPER SWAP ERROR');
            printReason(D);
            confirmReload().then(() => bootstrapExchange());
        } else return bootstrapExchange();
    });
};

const fastestAlertsTelegram = (menuOption, menuSelection) => {
    validateTelegram(telegram).then(() => {
        const listing = {
            'name': '',
            'telegram': ''
        };

        switch (menuOption) {
            case 30:
                listing.name = 'CoinMarketCap';
                listing.telegram = 'CMC_fastest_alerts';
                break;

            case 40:
                listing.name = 'CoinGecko';
                listing.telegram = 'CG_fastest_alerts';
                break;

            default:
                fileLogger.error('CORE: fastestAlertsTelegram(): EOFError');
                return somethingWentWrong();
        }

        printHeading(' Fastest Alerts');

        fastestAlertsTelegramConfiguration().then(async u => {
            const spinner = ora({ text: ('Listening'), spinner: "aesthetic" });
            const E = [];
            let contractAddress;
            let j;
            return initializeTelegram(telegram, 'https://t.me/' + listing.telegram, async x => {
                if (typeof x === 'object') return j = x;

                if (!contractAddress) {
                    spinner.info(x ? 'Received Message: { ' + x + ' }' : '< Service Message/Media File >');
                    spinner.start();
                    x && (await regexFastestAlertsMessage(x, u).then(Q => {
                        spinner.stop();
                        printSubInfoLine('\nFound Red CA', Q);
                        E.includes(Q) ? (printErrorHeading('Skipping! History: ' + E), spinner.start()) : contractAddress = Q;
                    }));
                    if (contractAddress) try {
                        await executeSniperSwap(getUserAddress(settings.PRIVATE_KEY), settings.PRIVATE_KEY, contractAddress, configs, chain, exchange, menuSelection).then(() => {
                            printTxnCompleted();
                            printHeading(' Fastest Alerts');
                            spinner.start();
                            E.push(contractAddress);
                            contractAddress = null;
                        });
                    } catch (Q) {
                        printErrorHeading('SNIPER SWAP ERROR');
                        printReason(Q);
                        printHeading(' Fastest Alerts');
                        spinner.start();
                        E.push(contractAddress);
                        contractAddress = null;
                    }
                }
            }).catch(() => {
                printErrorHeading('TELEGRAM ERROR ' + j.error_code);
                printReason(j.error_message);
                confirmReload().then(() => fastestAlertsTelegram(menuOption, menuSelection));
            });
        });
    }).catch(listing => {
        printErrorHeading('MISCONFIGURED TELEGRAM');
        printReason(listing);
        printLocation(getCoreLocation('telegram.json'));

        confirmReload().then(() => {
            readFile('telegram').then(l => {
                telegram = l;
                return fastestAlertsTelegram(menuOption, menuSelection);
            }).catch(() => {
                fileLogger.error('CORE: readFile(): Not Found');
                return somethingWentWrong();
            });
        });
    });
};

const predictionBot = (menuOption, menuSelection) => {
    printHeading('Prediction Bot');
    console.log('The methodology behind the bot is to calculate the mathematical');
    console.log('expectation and bet strategically.');

    confirmProceed().then(async () => {
        try {
            await executePredictionBot(getUserAddress(settings.PRIVATE_KEY), settings.PRIVATE_KEY, configs, menuOption, menuSelection);
        } catch (J) {
            printErrorHeading('PREDICTION BOT ERROR');
            printReason(J);
            confirmReload().then(() => bootstrapExchange());
        }
    }).catch(() => bootstrapExchange());
};