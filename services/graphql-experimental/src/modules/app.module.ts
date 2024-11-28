import { Module, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ExecuteQueryUseCase } from '../core/use-cases/execute-query.usecase';
import { Neo4jRepository } from '../adapters/database/neo4j-repository';
import { GraphQLSchemaLoader } from '../adapters/graphql/schema-loader';
import { GraphQLServer } from '../adapters/graphql/graphql-server';
import { config } from '../config/config';
import { driver as _driver, auth } from 'neo4j-driver';
import { Neo4jGraphQL } from '@neo4j/graphql';
import { ApolloServer } from 'apollo-server';
import { KafkaMessagePublisher } from '../adapters/message-broker/kafka-message-publisher';
import { AzureServiceBusAdapter } from '../adapters/message-broker/azure-service-bus-adapter';
import { AzureServiceBusSubscriber } from '../adapters/message-broker/azure-service-bus-subscriber';
import { AzureMessageHandler } from '../core/handlers/azure-message-handler';

//const driver = _driver('bolt://localhost:7687', auth.basic('neo4j', 'Casablanca')); //temporary evil hack
//const messagePublisher = new KafkaMessagePublisher(); //same

@Module({
  providers: [
    {
      provide: 'DatabasePort',
      useFactory: () => new Neo4jRepository(config.neo4j.uri, config.neo4j.username, config.neo4j.password),
    },
    // {
    //   provide: 'MessageBrokerPort',
    //   useFactory: () => {
    //     return new KafkaMessagePublisher(config.kafka.brokers)
    //   }
    // },
    {
      provide: 'MessageBrokerPort',
      useFactory: () => {
        const connectionString =
          process.env.AZURE_SERVICE_BUS_CONNECTION_STRING! ||
          'Endpoint=sb://my-namespace.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=abcd1234yourkeyhere';

        const topicName = process.env.AZURE_SERVICE_BUS_TOPIC! || 'equipment_update';
        return new AzureServiceBusAdapter(connectionString, topicName);
      },
    },
    {
      provide: 'GraphQLSchemaLoader',
      useClass: GraphQLSchemaLoader,
    },
    ExecuteQueryUseCase,
    {
      provide: 'GraphQLServer',
      useFactory: async (
        schemaLoader: GraphQLSchemaLoader,
        useCase: ExecuteQueryUseCase,
        databasePort: Neo4jRepository,
        messageBroker: KafkaMessagePublisher
      ) => {
        const typeDefs = await schemaLoader.loadSchema(config.graphql.schemaPath);
        const neoSchema = new Neo4jGraphQL({
          typeDefs,
          driver: databasePort.getDriver(),
        });
        const schema = await neoSchema.getSchema();
        const resolvers = {
          Query: {
            // Map resolvers to use case
            execute: (_: any, { query, params }: any) => useCase.execute(query, params),
          },
        };
        return new ApolloServer({
          schema,
          context: async ({ req }) => ({
            driver: databasePort.getDriver(),
            messagePublisher: messageBroker,
          }),
          //middleware for message broker integration with auto-generated API
          plugins: [
            {
              requestDidStart(): any {
                return {
                  async willSendResponse({ response, context }: any) {
                    if (response?.data?.createSeparators) {
                      const equipmentUnit = JSON.stringify(response.data.createSeparators.info);
                      await context.messagePublisher.publish('equipment_updates', {
                        event: 'SEPARATOR_UNIT_CREATED',
                        payload: equipmentUnit,
                      });
                      console.log(
                        'Published SEPARATOR_UNIT_CREATED event with payload to the message broker',
                        equipmentUnit
                      );
                    }
                  },
                };
              },
            },
          ],
        });
      },
      inject: ['GraphQLSchemaLoader', ExecuteQueryUseCase, 'DatabasePort', 'MessageBrokerPort'],
    },
  ],
})
export class AppModule implements OnModuleInit, OnModuleDestroy {
  private serviceBusSubscriber: any;
  async onModuleInit(): Promise<void> {
    const connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING!;
    const subscriptionName = process.env.AZURE_SERVICE_BUS_SUBSCRIPTION!;
    const topicName = process.env.AZURE_SERVICE_BUS_TOPIC!;

    const graphqlEndpoint = config.graphql.endpoint;

    const messageHandler = new AzureMessageHandler(graphqlEndpoint);

    this.serviceBusSubscriber = new AzureServiceBusSubscriber(connectionString, subscriptionName, topicName);

    console.log('Starting Azure Service Bus subscription...');
    await this.serviceBusSubscriber.subscribe(async (message: any) => {
      await messageHandler.handleMessage(message);
    });
  }
  async onModuleDestroy(): Promise<void> {
    console.log('Closing Azure Service Bus subscription...');
    await this.serviceBusSubscriber.close();
  }
}
