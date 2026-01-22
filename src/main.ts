import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.log(err));

import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyBAKy7vnEmTGKCk1rFnMgYYJNmctL2UGY0',
  authDomain: 'lead247-87071.firebaseapp.com',
  projectId: 'lead247-87071',
  storageBucket: 'lead247-87071.appspot.com',
  messagingSenderId: 'Y828642492545',
  appId: '1:828642492545:android:23e7b1757d39d3a13e8d80',
};

initializeApp(firebaseConfig);
