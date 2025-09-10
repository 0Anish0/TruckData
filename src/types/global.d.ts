import { GlobalParamList } from './navigation';

// Global navigation type for useNavigation hook
declare global {
  namespace ReactNavigation {
    interface RootParamList extends GlobalParamList {}
  }
}
