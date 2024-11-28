import { Module } from '@nestjs/common';
import { ExecuteQueryUseCase } from '../core/use-cases/execute-query.usecase';
import { Neo4jRepository } from '../adapters/database/neo4j-repository';
import { GraphQLSchemaLoader } from '../adapters/graphql/schema-loader';
import { GraphQLServer } from '../adapters/graphql/graphql-server';
import { config } from '../config/config';
import { driver as _driver, auth } from 'neo4j-driver';
import { Neo4jGraphQL } from '@neo4j/graphql';
import { ApolloServer } from 'apollo-server';
import { KafkaMessagePublisher } from '../adapters/message-broker/kafka-message-publisher';

const driver = _driver('bolt://localhost:7687', auth.basic('neo4j', 'Casablanca')); //temporary evil hack
const messagePublisher = new KafkaMessagePublisher(); //same

@Module({
  providers: [
    {
      provide: 'DatabasePort',
      useFactory: () => new Neo4jRepository(config.neo4j.uri, config.neo4j.username, config.neo4j.password),
    },
    {
      provide: 'GraphQLSchemaLoader',
      useClass: GraphQLSchemaLoader,
    },
    ExecuteQueryUseCase,
    {
      provide: 'GraphQLServer',
      useFactory: async (schemaLoader: GraphQLSchemaLoader, useCase: ExecuteQueryUseCase) => {
        const typeDefs = await schemaLoader.loadSchema(config.graphql.schemaPath);
        const neoSchema = new Neo4jGraphQL({
          typeDefs,
          driver,
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
            driver,
            messagePublisher,
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
      inject: ['GraphQLSchemaLoader', ExecuteQueryUseCase],
    },
  ],
})
export class AppModule {}
