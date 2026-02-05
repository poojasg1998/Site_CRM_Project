import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const sendPushOnMessage = onDocumentCreated(
  'messages/{messageId}',
  async (event) => {
    const message = event.data?.data();

    const receiverToken = message?.receiverToken;
    if (!receiverToken) {
      console.log('No receiver token, skipping push');
      return;
    }

    const payload: admin.messaging.MessagingPayload = {
      notification: {
        title: `New message from ${message.senderName}`,
        body: message.text,
      },
      data: {
        senderId: message.senderId,
        messageId: event.params.messageId,
      },
    };

    try {
      const response = await admin
        .messaging()
        .sendToDevice(receiverToken, payload);
      console.log('Push sent successfully:', response);
    } catch (error) {
      console.error('Error sending push:', error);
    }
  }
);
