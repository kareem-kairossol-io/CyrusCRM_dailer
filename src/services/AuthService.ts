import { DeviceEventEmitter, EmitterSubscription, NativeModules } from 'react-native';

export interface User {
  id: string;
  userName: string;
  fullName: string;
  email: string;
  roles: string[];
}

export interface AuthSession {
  token: string;
  expiration: string;
  user: User;
}

const { AuthModule } = NativeModules;

if (!AuthModule) {
  console.warn(
    'AuthModule is not available — ensure AuthPackage is added in MainApplication.kt'
  );
}

export const AuthService = {
  login(usernameOrEmail: string, password: string): Promise<AuthSession> {
    if (!AuthModule) return Promise.reject(new Error('AuthModule native extension not found.'));
    return AuthModule.login(usernameOrEmail, password);
  },

  getMe(): Promise<User> {
    if (!AuthModule) return Promise.reject(new Error('AuthModule native extension not found.'));
    return AuthModule.getMe();
  },

  getStoredSession(): Promise<AuthSession | null> {
    if (!AuthModule) return Promise.resolve(null);
    return AuthModule.getStoredSession();
  },

  logout(): Promise<boolean> {
    if (!AuthModule) return Promise.resolve(true);
    return AuthModule.logout();
  },

  hasToken(): Promise<boolean> {
    if (!AuthModule) return Promise.resolve(false);
    return AuthModule.hasToken();
  },

  onUnauthorized(callback: () => void): EmitterSubscription {
    return DeviceEventEmitter.addListener('onUnauthorized', callback);
  },
};
