import axios from 'axios';
import { Module, VuexModule, Mutation } from 'vuex-module-decorators';

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
    console.log(localStorage);
    if (
      localStorage.getItem('email') &&
      localStorage.getItem('userId') &&
      localStorage.getItem('token')
    ) {
      this.loggedIn = true;
      this.email = localStorage.getItem('email');
      this.userId = localStorage.getItem('userId');
      this.token = localStorage.getItem('token');
      console.log(this.loggedIn, this.email, this.userId, this.token);
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

  async files(): Promise<
    { fileId: string; filename: string; expire: Date }[] | null
  > {
    if (this.loggedIn) {
      const files = (
        await axios.get<{
          files: { hiberfileId: string; filename: string; expire: string }[];
        }>(`${process.env.HIBERAPI_URL}/accounts/${this.userId}/files`, {
          headers: { authorization: `Basic ${this.token}` }
        })
      ).data.files.map((file) => ({
        ...file,
        expire: new Date(file.expire),
        fileId: file.hiberfileId
      }));

      return files;
    } else {
      return null;
    }
  }
}
