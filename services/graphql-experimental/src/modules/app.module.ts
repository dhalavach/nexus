import { Module } from '@nestjs/common';
import { ExecuteQueryUseCase } from '../core/use-cases/execute-query.usecase';
import { Neo4jRepository } from '../adapters/database/neo4j-repository';
import { GraphQLSchemaLoader } from '../adapters/graphql/schema-loader';
import { GraphQLServer } from '../adapters/graphql/graphql-server';
import { config } from '../config/config';

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
        const resolvers = {
          Query: {
            // Map resolvers to use case
            execute: (_: any, { query, params }: any) => useCase.execute(query, params),
          },
        };
        return new GraphQLServer(typeDefs, resolvers, {});
      },
      inject: ['GraphQLSchemaLoader', ExecuteQueryUseCase],
    },
  ],
})
export class AppModule {}
