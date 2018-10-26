import { BaseLoginProvider } from "../models/base.login.provider";
import { LoginProviderClassModel, SocialUserModel } from "../models";


declare let gapi: any;

export class GoogleLoginProvider extends BaseLoginProvider {

  public static readonly PROVIDER_ID = 'google';
  public loginProviderObj: LoginProviderClassModel = new LoginProviderClassModel();
  private auth2: any;

  constructor(private clientId: string) {
    super();
    this.loginProviderObj.id = clientId;
    this.loginProviderObj.name = 'google';
    this.loginProviderObj.url = 'https://apis.google.com/js/platform.js';
  }

  initialize(): Promise<SocialUserModel> {
    return new Promise((resolve, reject) => {
      this.loadScript(this.loginProviderObj, () => {
          gapi.load('auth2', () => {
            this.auth2 = gapi.auth2.init({
              client_id: this.clientId,
              scope: 'email'
            });

            this.auth2.then(() => {
              if (this.auth2.isSignedIn.get()) {
                resolve(this.drawUser());
              }
            });
          });
      });
    });
  }

  drawUser(): SocialUserModel {
    let user: SocialUserModel = new SocialUserModel();
    let profile = this.auth2.currentUser.get().getBasicProfile();
    let authResponseObj = this.auth2.currentUser.get().getAuthResponse(true);
    user.id = profile.getId();
    user.name = profile.getName();
    user.email = profile.getEmail();
    user.image = profile.getImageUrl();
    user.token = authResponseObj.access_token;
    user.idToken = authResponseObj.id_token;
    return user;
  }

  signIn(): Promise<SocialUserModel> {
    return new Promise((resolve, reject) => {
      let promise = this.auth2.signIn();
      promise.then(() => {
        resolve(this.drawUser());
      });
    });
  }

  signOut(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.auth2.signOut().then((err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

}
