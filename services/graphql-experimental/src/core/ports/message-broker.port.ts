export interface MessageBrokerPort {
  publish(topic: string, message: Record<string, any>): Promise<void>;
}
