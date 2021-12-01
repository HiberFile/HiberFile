import { Module, Mutation, VuexModule } from 'vuex-module-decorators';

@Module({
  name: 'account',
  stateFactory: true,
  namespaced: true
})
export default class Account extends VuexModule {
  loggedIn = false;
  email: string | null = null;
  userId: string | null = null;
  token: string | null = null;

  @Mutation
  logIn(options: { email: string; userId: string; token: string }) {
    this.loggedIn = true;
    this.email = options.email;
    this.userId = options.userId;
    this.token = options.token;

    localStorage.setItem('token', options.token);
    localStorage.setItem('userId', options.userId);
    localStorage.setItem('email', options.email);
  }

  @Mutation
  logInLocalStorage() {
    if (
      localStorage.getItem('email') &&
      localStorage.getItem('userId') &&
      localStorage.getItem('token')
    ) {
      this.loggedIn = true;
      this.email = localStorage.getItem('email');
      this.userId = localStorage.getItem('userId');
      this.token = localStorage.getItem('token');
    }
  }

  @Mutation
  logOut() {
    this.loggedIn = false;
    this.email = null;
    this.userId = null;
    this.token = null;

    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
  }
}
