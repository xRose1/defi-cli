# DEFI-CLI

[![Node.js CI](https://github.com/jayohf/defi-cli/actions/workflows/build.yml/badge.svg)](https://github.com/jayohf/defi-cli/actions/workflows/build.yml)

**DEFI-CLI** is free to download. 

Binaries are built using GitHub Actions and are available for Linux (x64, arm), macOS (x64, arm), and Windows (x64). Check the [![releases page](https://github.com/jayohf/defi-cli/releases/)](https://github.com/jayohf/defi-cli/releases/) for the latest version.

Donations: Reach out to @jayohf on Telegram.

### Supported Blockchain

[![Ethereum Mainnet](https://user-images.githubusercontent.com/94490774/151673025-9788678c-3271-4d18-9d25-930e8f745316.png)](https://ethereum.org/)
[![Binance Smart Chain](https://user-images.githubusercontent.com/94490774/151673046-263ef09e-a1e7-49a0-8e34-e61009e36a7c.png)](https://www.binance.com/)
[![Polygon Mainnet](https://user-images.githubusercontent.com/94490774/151673042-84736953-bee8-41b0-aa5f-5ee7524a3631.png)](https://polygon.technology/)
[![Fantom Opera](https://user-images.githubusercontent.com/94490774/151673044-ed7d1cae-0a0a-4d11-a199-c58f6fcb656c.png)](https://fantom.foundation/)
[![KCC Mainnet](https://user-images.githubusercontent.com/94490774/151673043-e886eaf6-1a5b-4fb8-b3f3-e11f3f2d7bb3.png)](https://www.kcc.io/)
[![Avalanche Mainnet](https://user-images.githubusercontent.com/94490774/151673048-76d4b397-c669-44ec-8277-ff1ac66d9e86.png)](https://www.avax.network/)

**DEFI-CLI** supports multiple popular EVM Blockchain network.

![Network Selection](https://user-images.githubusercontent.com/94490774/151673335-6810f663-9cad-459f-9fe7-52eb444f4d8d.png)

## Features
### Fair Launch Sniping Tools
#### Availability
Uniswap SushiSwap PancakeSwap ApeSwap QuickSwap SpookySwap SpiritSwap KoffeeSwap KuSwap Trader Joe

#### Telegram Scanner
Listens and scans for new messages within the targeted Telegram group or channel for contract address, and automatically execute transaction as soon as a match is detected.
Our custom filtering and sensitivity system automatically determine if a message sent is a contract address; whether if it is sent as swap link, or the contract address itself.
The Telegram Scanner can also filter contract address sent hidden in media file, and sent separated in parts (e.g. A + C), both single or multiple message.
Messages from popular Telegram bots such as MissRose are automatically filtered out, so you don't have to worry that you buy from Scammers with CA in their names.

#### Manual Input Address

In scenarios where you already have the contract address, you can set pending orders with Manual Input Address, and as soon as the liquidity has been added, or trading has been enabled, DEFI-CLI will execute the transaction.

### CoinMarketCap/CoinGecko Sniper
#### Fastest Alerts Telegram

Snipe listings as soon as it is posted to the CoinMarketCap or CoinGecko Fastest Alerts Telegram channel.
This works as a continuous loop, and it will only snipe listings with Red Circled (received insider info) and with BNB as its primary liquidity.
You can also configure the minimum and maximum liquidity/tax for the snipe, so you won't be buying into something with already 1500 BNB in liquidity, and hoping for a 2x.
All the standard transactional configuration will be used, except for the RUG_PULL_CHECK and SELL_MANAGEMENT option.

### Prediction Bot

The Prediction of PancakeSwap and Candle Genie is a gambling ecosystem by predicting the price of BTC/USDT, BNB/USDT, or ETH/USDT will be bullish (up) or bearish (down) in the next 5 minutes.

There are 3 betting strategies available in Prediction Bot:

- Only Streak Bets - This will wait for a consecutive result of the previous 2 rounds, then continue betting the same result until the streak is broken.
- Standard + Streak Bets - This will use a methodology to calculate the mathematical expectation and bet strategically, combined with, and prioritizing the streak strategy.
- SS + Martingale Strategy - This will include martingale betting strategy with Standard + Streak Bets. This strategy will double up the bet amount on every lost bet, and only reset itself on a win.

### DxSale/PinkSale Presale Bot

Snipe listings on both DxSale and PinkSale.


## Settings

The settings.json file is located in the defi-cli-configs folder in your Documents.

`EVM_NODE`

This option configures the EVM node connection endpoint. Currently, you can use GA or specific a custom node as the option.

The GA option, stands for General Availability, this consists of common public nodes for all chains.

You can also use your own custom node here, but note that only secured (HTTPS or WSS) endpoint can be used.

`PRIVATE_KEY`

Enter the private key (64 characters, not the seed phrase) of your wallet that you wish to use DEFI-CLI with. 

## Configs

The configs.json file is located in the defi-cli-configs folder in your Documents.

`AMT_MODE`

Use USD, ETH, or TKN to configure the mode of the AMOUNT option. By setting USD will value in U.S. dollars, ETH will value in the native Blockchain token (e.g. ETH, BNB, etc.), and TKN will be in the amount of tokens itself.

When using TKN mode, please make sure you have more than enough native balance to prevent "insufficient funds" error, as DEFI-CLI is unable to estimate the native spending.

`AMOUNT`

Enter the amount for each of your transaction.

`SLIPPAGE`

Enter the BURN (not price movement) tolerance for your transaction.

E.g. If you were supposed to receive 1000 tokens from the swap, and have SLIPPAGE configured at 75, minimally you must receive 250 tokens back, otherwise it will be rejected by the exchange router.

It is highly recommended to keep this configured between 98 and 100.

`ITERATION`

Enter the number of iteration you wish to perform. Each iteration will weight the AMOUNT parameter. E.g. If you have 0.25 in AMOUNT, and 2 in ITERATION, DEFI-CLI will perform 0.25 ETH x 2, totaling 0.5 ETH.

`GAS_PRICE`

This is to configure the gas price of your transactions. You may also use 0 for DEFI-CLI to calculate the gas automatically; 2x of the current network gas.

`PRIORITY_GAS`

This is to configure the priority gas of your Ethereum Mainnet transactions.

`HONEYPOT_CHECK`

Use true or false to configure if DEFI-CLI should scan the contract address with RugDoc's Honeypot Checker before executing the swap transaction.

`BLOCK_SEVERE_FEE`

Use true or false to configure if DEFI-CLI should block severely high trading fee (over 50%) tokens. The HONEYPOT_CHECK option must be enabled for this to work.

`DELAY_EXECUTION`

This configures the number of block to skip before executing the swap transaction.

`DELAY_ITERATION`

This configures the delay in seconds between each iteration.

`RUG_PULL_CHECK`

Use true or false to configure if DEFI-CLI should listen to removeLiquidity() related transaction. If such a transaction is detected, DEFI-CLI will TRY to front-run the transaction. 

`SELL_MANAGEMENT`

Use true or false to configure if DEFI-CLI should monitor the live value and sell options after the swap transactions. 

## Telegram

The telegram.json file is located in the defi-cli-configs folder in your Documents.

In order for Telegram Scanner and CMC/CG Fastest Alerts Telegram to work, DEFI-CLI needs to log in to your Telegram account.

To do so, you would need to provide API parameters of your account. Follow these steps:

    Log in to Telegram Core https://my.telegram.org/auth

    Go to API Development Tools and fill in the form as follows:
        App title - deficli
        Short name - deficli
        URL -
        Platform - Other
        Description -

    Click on the "Create application" button, and you should see the app configuration.

    Telegram Core

    Copy the app_id and app_hash, and paste it to your telegram.json file.
