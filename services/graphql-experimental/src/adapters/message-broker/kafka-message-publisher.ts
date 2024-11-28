import { Kafka, Producer } from 'kafkajs';
import { MessagePublisher } from './message-publisher';

export class KafkaMessagePublisher implements MessagePublisher {
  private producer: Producer;

  constructor() {
    const kafka = new Kafka({
      clientId: 'graphql-api',
      brokers: ['localhost:9092'],
    });
    this.producer = kafka.producer();
  }

  async publish(topic: string, message: Record<string, any>): Promise<void> {
    await this.producer.connect();
    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    console.log(`Published message to topic ${topic}:`, message);
  }
}
