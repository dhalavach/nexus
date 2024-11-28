export interface MessagePublisher {
  publish(topic: string, message: Record<string, any>): Promise<void>;
}
