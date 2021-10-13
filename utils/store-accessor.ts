import { Store } from 'vuex';
import { getModule } from 'vuex-module-decorators';
import Account from '~/store/account';

let accountStore: Account;

function initializeStores(store: Store<any>): void {
	accountStore = getModule(Account, store);
}

export { initializeStores, accountStore };
