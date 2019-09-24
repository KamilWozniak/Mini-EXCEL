import Vue      from 'vue';
import Router   from 'vue-router';
import ExcelApp from './views/excel-app.view.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'excell-app',
      component: ExcelApp,
    },
  ],
});
