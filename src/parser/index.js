import ora from 'ora';
import {
    checkForHoneypot
} from '../components/fetch/index.js';
import {
    printHeading,
    printSubHeading
} from '../console/index.js';
import {
    afterSwapMonitor,
    contributeToPresale,
    predictionBotMethodology,
    swapExactETHForTokens
} from '../exchange/index.js';
import {
    isSecondaryContract
} from '../helper/index.js';
import {
    fetchPresaleContract
} from '../launchpad/index.js';

export const initializePresaleContract = (contractAddress, menuOption) => {
    return new Promise((J, l) => {
        isSecondaryContract(contractAddress).then(() => {
            fetchPresaleContract(contractAddress, menuOption).then(X => J(X)).catch(X => l(X));
        }).catch(() => l('Invalid Contract Address'));
    });
};
export const executePresaleContribution = async (userAddress, privateKey, presaleAddress, startTime, menuOption, configs, chain, amountsOut) => {
    printSubHeading('Blockchain Transaction');
    await contributeToPresale(userAddress, privateKey, presaleAddress, startTime, menuOption, configs, chain, amountsOut).catch(Q => {
        throw Q;
    });
};
export const executeSniperSwap = async (userAddress, privateKey, contractAddress, configs, chain, exchange, menuSelection = 1) => {
    printHeading('Sniper Execution');

    if (configs.HONEYPOT_CHECK.toLowerCase() === 'true') {
        printSubHeading(`RugDoc's Honeypot Token Checker`);
        const spinner = ora({ text: ('Checking'), spinner: "aesthetic" }).start();
        await checkForHoneypot(contractAddress, configs.BLOCK_SEVERE_FEE.toLowerCase(), chain).then(Q => {
            spinner.stop();
            console.log(Q);
        }).catch(Q => {
            spinner.stop();
            console.log(Q);
            throw 'Rejected by Honeypot Token Checker';
        });
    }

    printSubHeading('Blockchain Transaction');
    await swapExactETHForTokens(userAddress, privateKey, contractAddress, configs, chain, exchange).catch(Q => {
        throw Q;
    }), printSubHeading('Monitoring Transaction'), await afterSwapMonitor(userAddress, privateKey, contractAddress, configs, chain, exchange, menuSelection).catch(Q => {
        throw Q;
    });
};
export const executePredictionBot = async (userAddress, privateKey, configs, menuOption, menuSelection) => {
    printSubHeading('Blockchain Transaction');
    console.log('Press the <CTRL+C> key to quit.\n');
    await predictionBotMethodology(userAddress, privateKey, configs, menuOption, menuSelection).catch(s => {
        throw s;
    });
};