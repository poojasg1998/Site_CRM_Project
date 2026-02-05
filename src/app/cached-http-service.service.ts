import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpHeaders } from '@capacitor/core';
import { firstValueFrom, map } from 'rxjs';
// import { Network } from '@capacitor/network';
import { Storage } from '@ionic/storage-angular';
@Injectable({
  providedIn: 'root'
})
export class CachedHttpServiceService {
  // constructor(private http: HttpClient, private storage: Storage) {
  //   this.init();
  // }

  // async init() {
  //   await this.storage.create();
  // }




// async getWithCache(
//   key: string,
//   url: string,
//   params?: any
// ): Promise<{ data: any; fromCache: boolean }> {
//   const status = await Network.getStatus();
//   const isPoor = await this.isPoorNetwork();
//     console.log('Network connected:', status.connected);
//     console.log('Is poor network:', isPoor);


//   // see if we have something in cache already
//   const cachedData = await this.storage.get(key);

//   // if offline/poor _and_ we have cache, use it
//   if ((!status.connected || isPoor) && cachedData != null) {
//     alert("offline")
//     console.warn(`Using cached data for ${key}`);
//     return { data: cachedData, fromCache: true };
//   }

//   //otherwise we attempt a live fetch
//   try {
//     alert("online")
//     const res = await firstValueFrom(this.http.get(url, { params }));
//     // on success, update our cache
//     await this.storage.set(key, res);
//     return { data: res, fromCache: false };
//   } catch (err) {
//     // if live fetch fails but we _do_ have cache, use it
//     if (cachedData != null) {
//       console.warn(`Fetch failed, falling back to cache for ${key}`);
//       return { data: cachedData, fromCache: true };
//     }
//     // last resort: nothing to show
//     console.error(`Fetch failed and no cache for ${key}`, err);
//     throw err;  // or return { data: null, fromCache: false } and handle it in the UI
//   }
// }

// async postWithCache(key: string,url: string, body: any, headers?: HttpHeaders): Promise<any> {
//   const status = await Network.getStatus(); // ✅ Check if device is online

//   if (!status.connected) {
//     // 🔌 Offline: return cached data
//     console.log(`[Offline] Returning cached POST data for key: ${key}`);
//     return await this.storage.get(key);
//   }

//   // 🌐 Online: Make POST request and cache result
//   return this.http.post(url, body, { headers }).toPromise().then(async (res: any) => {
//     await this.storage.set(key, res); // 💾 Save response in cache
//     return res;
//   }).catch(async (error) => {
//     console.warn(`[Error] POST failed for ${url}. Falling back to cache.`, error);
//     return await this.storage.get(key); // Optional: fallback
//   });
// }



// async isPoorNetwork(): Promise<boolean> {
//   const startTime = Date.now();

//   try {
//     // Ping a lightweight endpoint (or your backend with minimal payload)
//     // await fetch("https://www.google.com/favicon.ico", { method: 'HEAD', cache: "no-cache" });

//     const latency = Date.now() - startTime;

//     // If response time is more than 1000ms, treat as poor network
//     return latency > 1000;
//   } catch (error) {
//     // If request fails, assume poor network
//     return true;
//   }
// }

// async isPoorNetwork(): Promise<boolean> {
//   const conn = (navigator as any).connection;
//   if (conn && conn.effectiveType) {
//     console.log('Network effectiveType:', conn.effectiveType);
//     // treat anything less than “4g” as poor
//     return ['slow-2g', '2g', '3g'].includes(conn.effectiveType);
//   }

//   // Fallback if the API isn’t available: assume good network
//   return false;
// }
}
