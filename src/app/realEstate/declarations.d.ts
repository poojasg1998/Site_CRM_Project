import { Socket } from 'socket.io-client';

declare global {
    interface Window {
        io: Socket;
        Echo: any;
    }
}