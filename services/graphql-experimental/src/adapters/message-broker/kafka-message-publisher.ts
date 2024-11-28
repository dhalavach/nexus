import { Kafka, Producer } from 'kafkajs';
import { MessagePublisher } from './message-publisher';
import { MessageBrokerPort } from '../../core/ports/message-broker.port';

export class KafkaMessagePublisher implements MessageBrokerPort {
  private readonly kafkaProducer: any;

  constructor(brokers: string[]) {
    const kafka = new Kafka({
      brokers,
    });
    this.kafkaProducer = kafka.producer();
  }

  async publish(topic: string, message: Record<string, any>): Promise<void> {
    await this.kafkaProducer.connect();
    await this.kafkaProducer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    console.log(`Published message to topic ${topic}:`, message);
  }
}
