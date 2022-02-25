import chalk from 'chalk';

export const printMainHeader = (packageName, version) => {
    console.clear();
    console.log(packageName);
    console.log(chalk.blue('DeFi Command-Line Interface') + ' v' + version);
};
export const printErrorHeading = G => {
    console.log(chalk.red('\n' + G));
};
export const printHeading = G => {
    console.log(chalk.yellow.inverse('\n' + G));
};
export const printSubHeading = G => {
    console.log(chalk.yellow('\n' + G));
};
export const printReason = G => {
    console.log(chalk.blue('Reason:'), G);
};
export const printLocation = G => {
    console.log('Location: ' + chalk.blue(G));
};
export const printInfoLine = (G, D) => {
    console.log(chalk.blue(G) + ': ' + D);
};
export const printSubInfoLine = (G, D) => {
    console.log(chalk.yellow(G) + ': ' + D);
};
export const printTxnCompleted = () => {
    console.log(chalk.blue('\nDONE!') + ' ' + chalk.yellow('Check Txn in Block Explorer'));
};