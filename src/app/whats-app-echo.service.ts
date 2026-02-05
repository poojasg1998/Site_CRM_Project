import { Injectable } from '@angular/core';
import Echo from 'laravel-echo';
import io from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class WhatsAppEchoService {
  echo: Echo<any>;
  socket: any;

  constructor() {
    (window as any).io = io;
    this.initEcho();
  }

  private initEcho() {
    this.echo = new Echo({
      broadcaster: 'socket.io',
      host: 'https://chat.right2shout.in:6001',
      // host: 'https://test-chat.right2shout.in:6002',
      transports: ['websocket'],
      forceTLS: true,
      wssPort: 6001,
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

  listenToChannel(
    channel: string,
    event: string,
    callback: (data: any) => void
  ) {
    this.echo.channel(channel).listen(event, (data: any) => {
      callback(data);
    });
  }
}
