import { Injectable } from '@angular/core';
import { NativeBiometric } from 'capacitor-native-biometric';

@Injectable({
  providedIn: 'root',
})
export class BiometricService {
  private biometric: any = NativeBiometric;

  async isBiometricAvailable(): Promise<boolean> {
    try {
      const result = await this.biometric.isAvailable();
      return result.isAvailable;
    } catch (err) {
      return false;
    }
  }
  async saveCredentials(username: string, password: string) {
    await this.biometric.setCredentials({
      username: username,
      password: password,
      server: 'com.yourapp.server',
    });
  }

  async verifyBiometric(): Promise<boolean> {
    // await NativeBiometric.verifyIdentity({
    //   reason: 'Please authenticate to login',
    //   fallbackTitle: 'Use device passcode',
    // });

    try {
      const result = await this.biometric.verifyIdentity({
        reason: 'Please authenticate to login',
        fallbackTitle: 'Use device passcode',
      });
      return result;
    } catch (e) {
      return false;
    }
  }

  async getCredentials() {
    return await this.biometric.getCredentials({
      server: 'com.yourapp.server',
    });
  }

  constructor() {}
}
