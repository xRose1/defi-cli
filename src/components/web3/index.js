import Web3 from 'web3';

export const initializeWeb3 = (chain, evmNode) => {
    return new Promise((nodeList, l) => {
        let primaryNode;
        let secondaryNode;

        const wsConfig = {
            'clientConfig': {
                'keepalive': true,
                'keepaliveInterval': 30000
            },
            'reconnect': {
                'auto': true,
                'delay': 500,
                'maxAttempts': 5,
                'onTimeout': true
            }
        };

        const rpcConfig = {
            'keepAlive': true
        };

        switch (chain) {
            case 1:
                if (evmNode.toUpperCase() === 'GA') primaryNode = new Web3(new Web3.providers.WebsocketProvider('wss://mainnet.infura.io/ws/v3/9aa3d95b3bc440fa88ea12eaa4456161', wsConfig));
                else evmNode.toUpperCase() === 'SG' ? primaryNode = new Web3(new Web3.providers.WebsocketProvider('wss://mainnet.infura.io/ws/v3/9aa3d95b3bc440fa88ea12eaa4456161', wsConfig)) : primaryNode = buildWeb3Connection(evmNode, wsConfig, rpcConfig);
                secondaryNode = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161', rpcConfig));
                break;

            case 4:
                evmNode.toUpperCase() === 'GA' ? primaryNode = new Web3(new Web3.providers.WebsocketProvider('wss://rinkeby.infura.io/ws/v3/9aa3d95b3bc440fa88ea12eaa4456161', wsConfig)) : primaryNode = buildWeb3Connection(evmNode, wsConfig, rpcConfig);
                secondaryNode = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161', rpcConfig));
                break;

            case 56:
                evmNode.toUpperCase() === 'GA' || evmNode.toUpperCase() === 'SG' ? primaryNode = new Web3(new Web3.providers.WebsocketProvider('wss://bsc-ws-node.nariox.org:443', wsConfig)) : primaryNode = buildWeb3Connection(evmNode, wsConfig, rpcConfig);
                secondaryNode = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed.binance.org/', rpcConfig));
                break;

            case 137:
                evmNode.toUpperCase() === 'GA' ? primaryNode = new Web3(new Web3.providers.WebsocketProvider('wss://ws-matic-mainnet.chainstacklabs.com/', wsConfig)) : primaryNode = buildWeb3Connection(evmNode, wsConfig, rpcConfig);
                secondaryNode = new Web3(new Web3.providers.HttpProvider('https://polygon-rpc.com/', rpcConfig));
                break;

            case 250:
                evmNode.toUpperCase() === 'GA' ? primaryNode = new Web3(new Web3.providers.WebsocketProvider('wss://wsapi.fantom.network/', wsConfig)) : primaryNode = buildWeb3Connection(evmNode, wsConfig, rpcConfig);
                secondaryNode = new Web3(new Web3.providers.HttpProvider('https://rpc.ftm.tools/', rpcConfig));
                break;

            case 321:
                evmNode.toUpperCase() === 'GA' ? primaryNode = new Web3(new Web3.providers.WebsocketProvider('wss://rpc-ws-mainnet.kcc.network/', wsConfig)) : primaryNode = buildWeb3Connection(evmNode, wsConfig, rpcConfig);
                secondaryNode = new Web3(new Web3.providers.HttpProvider('https://rpc-mainnet.kcc.network/', rpcConfig));
                break;

            case 43114:
                if (evmNode.toUpperCase() === 'GA') primaryNode = new Web3(new Web3.providers.WebsocketProvider('wss://api.avax.network/ext/bc/C/ws', wsConfig));
                else evmNode.toUpperCase() === 'SG' ? primaryNode = new Web3(new Web3.providers.WebsocketProvider('wss://api.avax.network/ext/bc/C/ws', wsConfig)) : primaryNode = buildWeb3Connection(evmNode, wsConfig, rpcConfig);
                secondaryNode = new Web3(new Web3.providers.HttpProvider('https://api.avax.network/ext/bc/C/rpc', rpcConfig));
                break;

            default:
                return l('Unsupported EVM Chain');
        }

        if (!Object.prototype.hasOwnProperty.call(primaryNode, 'eth')) return l(connectFailedString('primary'));
        if (!Object.prototype.hasOwnProperty.call(secondaryNode, 'eth')) return l(connectFailedString('secondary'));
        primaryNode.eth.net.isListening().then(() => {
            secondaryNode.eth.net.isListening().then(() => {
                return nodeList({
                    'primary': primaryNode,
                    'secondary': secondaryNode
                });
            }).catch(() => {
                return l(connectFailedString('secondary'));
            });
        }).catch(() => {
            return l(connectFailedString('primary'));
        });
    });
};

const buildWeb3Connection = (evmNode, wsConfig, rpcConfig) => {
    if (evmNode.toLowerCase().startsWith('https')) return new Web3(new Web3.providers.HttpProvider(evmNode, rpcConfig));
    else {
        if (evmNode.toLowerCase().startsWith('wss')) return new Web3(new Web3.providers.WebsocketProvider(evmNode, wsConfig));
        else throw 'EOFError';
    }
};

const connectFailedString = G => 'Failed to connect to ' + G.toUpperCase() + ' node.';