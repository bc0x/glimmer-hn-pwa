import Component, { tracked } from '@glimmer/component';
import Navigo from 'navigo';
import fetchItems from '../../../utils/fetch';
import { API }  from '../../../utils/constant/api';
import { News } from '../../../utils/model/news';
import { Comments, Comment } from '../../../utils/model/comment';
import { User } from '../../../utils/model/user';

const router = new Navigo(null, true);

export default class GlimmerHnPwa extends Component {
  appShell = document.getElementById('app-shell');
  @tracked page: number = 1;
  @tracked results: News[];
  @tracked comments: Comment[];
  @tracked post: Comments;
  @tracked userInfo: User;
  @tracked routeMode: string = 'news';
  @tracked loading: boolean = true;

  didInsertElement() {
    router
      .on({
        '/': (page) => this.getDataAndLoad('news', page),
        '/:page': (page) => this.getDataAndLoad('news', page),
        '/newest/:page': (page) => this.getDataAndLoad('newest', page),
        '/show/:page': (page) => this.getDataAndLoad('show', page),
        '/ask/:page': (page) => this.getDataAndLoad('ask', page),
        '/jobs/:page': (page) => this.getDataAndLoad('jobs', page),
        '/user/:username': (username) => this.getDataAndLoad('user', { page: this.page }, username),
        '/item/:id': (id) => this.getDataAndLoad('item', { page: this.page }, id),
      })
      .resolve();
    this.removeAppShell();
    this.page = 1;
  }

  private getEndpoint(model, page = this.page, param?) {
    return param ? `${API}/${model}/${param}` : `${API}/${model}?page=${page}`;
  }

  private getDataAndLoad(model, { page }, params?) {
    let param;
    switch (model) {
      case 'user':
        param = params.username;
        break;
      case 'item':
        param = params.id;
        break;
    }
    this.routeMode = model;
    return this.loadModel(this.getEndpoint(model, page, param));
  }

  private loadModel(endpoint: string) {
    this.loading = true;
    fetchItems(endpoint)
      .then((res) => {
        this.loading = false;
        switch (this.routeMode) {
          case 'user':
            this.userInfo = { ...res };
            break;
          case 'item':
            this.comments = [...res.comments];
            this.post = { ...res };
            break;
          default:
            this.results = res;
        }
      });
  }

  removeAppShell() {
    if (this.appShell) {
      this.appShell.remove();
    }
  }

}
