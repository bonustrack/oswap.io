import store from '@/store';
import { mapState } from 'vuex';
import { explorerLink } from '@/helpers/utils';

// @ts-ignore
const modules = Object.entries(store.state).map(module => module[0]);

export default {
  computed: {
    ...mapState(modules)
  },
  methods: {
    _explorerLink(str: string): string {
      return explorerLink(str);
    }
  }
};
