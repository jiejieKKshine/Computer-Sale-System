import { createApp } from 'vue'
import App from './App.vue'
import TDesign from 'tdesign-vue-next';
import 'tdesign-vue-next/es/style/index.css';

import router from './router/index.js'
const app = createApp(App);
app.use(TDesign).use(router).mount('#app');
