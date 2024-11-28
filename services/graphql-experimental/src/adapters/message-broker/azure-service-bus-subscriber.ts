// src/adapters/message-broker/azure-service-bus-subscriber.ts
import { ServiceBusClient, ServiceBusReceiver } from '@azure/service-bus';

export class AzureServiceBusSubscriber {
  private serviceBusClient: ServiceBusClient;
  private receiver: ServiceBusReceiver;

  constructor(connectionString: string, subscriptionName: string, topicName: string) {
    this.serviceBusClient = new ServiceBusClient(connectionString);
    this.receiver = this.serviceBusClient.createReceiver(topicName, subscriptionName);
  }

  async subscribe(messageHandler: (message: Record<string, any>) => Promise<void>): Promise<void> {
    this.receiver.subscribe({
      processMessage: async (receivedMessage) => {
        const messageBody = receivedMessage.body;
        console.log('Received message from Azure Service Bus:', messageBody);

        try {
          await messageHandler(messageBody);
          await this.receiver.completeMessage(receivedMessage);
        } catch (error) {
          console.error('Error processing message:', error);
          await this.receiver.abandonMessage(receivedMessage);
        }
      },
      processError: async (args) => {
        console.error('Error in Azure Service Bus subscription:', args.error);
      },
    });
  }

  async close(): Promise<void> {
    await this.receiver.close();
    await this.serviceBusClient.close();
  }
}
