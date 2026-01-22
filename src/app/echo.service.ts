import { Injectable } from '@angular/core';
import Echo from 'laravel-echo';
import io from 'socket.io-client';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications, Token } from '@capacitor/push-notifications';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { MenuController } from '@ionic/angular';
@Injectable({ providedIn: 'root' })
export class EchoService {
  echo: Echo<any>;
  userid;
  socket: any;
  private apiUrl = 'https://onesignal.com/api/v1/notifications';
  private apiKey =
    'os_v2_app_wmo6uo5ypzcdngebcatf4asdcbyfrmx4esseqrur4jhe5fcddqkxakdff5n4hpikaz5v5gowy2khrxkgqasnyy5bww3z3lgt5lpl3oa';

  constructor(private http: HttpClient, private menuCtrl: MenuController) {
    (window as any).io = io;
    this.userid = localStorage.getItem('UserId');
    this.initEcho();
  }

  private initEcho() {
    this.echo = new Echo({
      broadcaster: 'socket.io',
      // host: 'https://chat.right2shout.in:6001',
      host: 'https://test-chat.right2shout.in:6002',
      transports: ['websocket'],
      forceTLS: true,
      // reconnectionAttempts: 5,
      // reconnectionDelay: 1000,
      wssPort: 6002,
    });
    this.socket = this.echo.connector.socket;

    this.socket.on('connect', () => {
      console.log('%c[Socket.IO] Connected', 'color: green');
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('%c[Socket.IO] Disconnected:', 'color: red', reason);
    });

    this.socket.on('reconnect_attempt', () => {
      console.log('%c[Socket.IO] Attempting to reconnect...', 'color: orange');
    });

    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log(
        '%c[Socket.IO] Reconnected after attempts:',
        'color: green',
        attemptNumber
      );
    });

    this.socket.on('reconnect_error', (error: any) => {
      console.log('%c[Socket.IO] Reconnect error:', 'color: red', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.log('%c[Socket.IO] Reconnect failed', 'color: darkred');
    });
  }

  notifiedMessages = new Set<String>();

  stopListening(channelName: string, eventName: string) {
    this.echo.channel(channelName).stopListening(eventName);
  }
  private isListening = false;
  listenToChannel(
    channel: string,
    event: string,
    callback: (data: any) => void
  ) {
    this.echo.channel(channel).listen(event, (data: any) => {
      const userid = localStorage.getItem('UserId');
      console.log(data);
      if (
        userid == data.Executive &&
        (data.Call_status_new == 'Executive Busy' ||
          data.Call_status_new == 'BUSY' ||
          data.Call_status == 'Call Disconnected' ||
          data.Call_status_new == 'Answered' ||
          data.Call_status_new == 'Call Connected' ||
          data.Call_status_new == 'Ringing' ||
          data.Call_status_new == 'Answered by agent' ||
          data.Call_status_new == 'Answered by customer')
      ) {
        console.log(data);
        if (
          data.Call_status_new == 'Executive Busy' ||
          data.Call_status_new == 'BUSY' ||
          data.Call_status == 'Call Disconnected'
        ) {
          localStorage.removeItem('isOnCall');
          this.menuCtrl.close();
        } else if (
          data.Call_status_new == 'Answered' ||
          data.Call_status_new == 'Call Connected'
        ) {
          localStorage.setItem('isOnCall', 'true');
        }
        // if (
        //   data.Call_status_new == 'Call Disconnected' &&
        //   data.direction == 'inbound'
        // ) {
        //   location.reload();
        // }

        callback(data);
        return;
      }
      //Call
      // if (
      //   userid == data.Executive &&
      //   (data.Call_status == 'Call Disconnected' ||
      //     data.Call_status == 'Call Connected')
      // ) {
      //   if (data.Call_status == 'Call Disconnected') {
      //     localStorage.removeItem('isOnCall');
      //     this.menuCtrl.close();
      //   } else if (data.Call_status == 'Call Connected') {
      //     localStorage.setItem('isOnCall', 'true');
      //   }
      //   callback(data);
      //   return;
      // }

      const messageList = data[1];
      let lastMessage = messageList?.[messageList?.length - 1];

      //Internal Chat
      if (userid == data?.['0']?.['Receiver']) {
        if (lastMessage) {
          const uniqueId = `${lastMessage.item_id}`;
          if (!this.notifiedMessages.has(uniqueId)) {
            this.notifiedMessages.add(uniqueId);
            console.log('triggered once 1');
            this.sendNotification(
              data['0']['Receiver'],
              data['0']['Message'],
              data['0']['Sender'],
              data['1']['0']['sender_name']
            );
          }
        }
        callback(data);
      } else if (userid == data?.['0']?.['Sender']) {
        console.log('Echo Service Sender - ', data['1']['0']['sender_name']);
        callback(data);
      }

      this.isListening = true;
    });
  }

  sendNotification(receiverId, message, senderId, sendername) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Basic ${this.apiKey}`,
    });
    const body = {
      app_id: 'b31dea3b-b87e-4436-9881-10265e024310', // Replace with your actual app ID
      // include_player_ids: [recipientUser],
      include_aliases: {
        external_id: [receiverId],
      },
      contents: {
        en: message,
      },
      target_channel: 'push',
      headings: {
        en: `New Message from ${sendername}`,
        // en: `New Message from Test user`
      },
      data: {
        type: 'chat_message',
        sender_id: senderId,
        receiver_id: receiverId,
      },
    };
    console.log('Sending OneSignal API request body:', body); // Debug log
    // return this.http.post(this.apiUrl, body, { headers }).toPromise();
    return this.http
      .post(this.apiUrl, body, { headers })
      .toPromise()
      .then((response) => {
        console.log('OneSignal API Response:', response);
        return response;
      })
      .catch((error) => {
        console.error('OneSignal API Error:', error);
        throw error; // Re-throw to propagate error
      });
  }
}
