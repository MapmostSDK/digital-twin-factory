import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import mapmost from '@mapmost/mapmost-webgl';
window.mapmost = mapmost;
window.THREE = mapmost.THREE;
createApp(App).mount('#app');
