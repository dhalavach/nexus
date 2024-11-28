// src/adapters/message-broker/azure-service-bus-adapter.ts
import { ServiceBusClient, ServiceBusMessage } from '@azure/service-bus';
import { MessageBrokerPort } from '../../core/ports/message-broker.port';

export class AzureServiceBusAdapter implements MessageBrokerPort {
  private serviceBusClient: ServiceBusClient;
  private topicName: string;

  constructor(connectionString: string, topicName: string) {
    this.serviceBusClient = new ServiceBusClient(connectionString);
    this.topicName = topicName;
  }

  async publish(topic: string, message: Record<string, any>): Promise<void> {
    const sender = this.serviceBusClient.createSender(this.topicName);

    const serviceBusMessage: ServiceBusMessage = {
      body: message,
      contentType: 'application/json',
    };

    await sender.sendMessages(serviceBusMessage);
    console.log(`Published message to Azure Service Bus topic ${topic}:`, message);

    await sender.close();
  }

  async close(): Promise<void> {
    await this.serviceBusClient.close();
  }
}
