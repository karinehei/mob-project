/**
 * JS entry registered with the native host. Keep thin; app shell lives in App.tsx.
 */
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
