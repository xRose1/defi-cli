import MTProto from "@mtproto/core";
import {
    sleep
} from '@mtproto/core/src/utils/common/index.js';
import {
    getCoreLocation
} from '../../utilities/index.js';

export class MTProtoAPI {
    ['class'];

    constructor(G) {
        this.class = new MTProto({
            'api_id': G.API_ID,
            'api_hash': G.API_HASH,
            'storageOptions': {
                'path': getCoreLocation('session.json')
            }
        });
    }

    async ['call'](G, D = {}, J = {}) {
        try {
            return await this.class.call(G, D, J);
        } catch (l) {
            const {
                error_code: X,
                error_message: u
            } = l;

            if (X === 303) {
                const [E, s] = u.split('_MIGRATE_');
                const j = Number(s);

                E === 'PHONE' ? await this.class.setDefaultDc(j) : Object.assign(J, {
                    'dcId': j
                });

                return this.call(G, D, J);
            }

            if (X === 420) return await sleep(Number(u.split('FLOOD_WAIT_')[1]) * 1000), this.call(G, D, J);
            throw l;
        }
    }

    ['startListenToUpdates'](G) {
        this.class.updates.on('updates', G);
        this.class.updates.on('updateShortChatMessage', G);
        this.class.updates.on('updateShortMessage', G);
        this.class.updates.on('updateShortSentMessage', G);
    }

    ['stopListenToUpdate']() {
        this.class.updates.removeAllListeners('updates');
        this.class.updates.removeAllListeners('updateShortChatMessage');
        this.class.updates.removeAllListeners('updateShortMessage');
        this.class.updates.removeAllListeners('updateShortSentMessage');
    }

}