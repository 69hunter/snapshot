import { useI18n } from 'vue-i18n';
import client from '@/helpers/client';
import { useWeb3 } from '@/composables/useWeb3';
import { useNotifications } from '@/composables/useNotifications';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';

export function useClient() {
  const { t } = useI18n();
  const { web3 } = useWeb3();
  const auth = getInstance();
  const { notify } = useNotifications();

  async function send(space, type, payload) {
    const isSafe = web3.value?.walletConnectType === 'Gnosis Safe Multisig';
    try {
      const fn = isSafe
        ? client.sign.bind(client)
        : client.broadcast.bind(client);
      const result = await fn(
        auth.web3,
        web3.value.account,
        space,
        type,
        payload
      );
      return result;
    } catch (e: any) {
      const errorMessage =
        e && e.error_description
          ? `Oops, ${e.error_description}`
          : t('notify.somethingWentWrong');
      notify(['red', errorMessage]);
      return;
    }
  }

  return { send };
}
