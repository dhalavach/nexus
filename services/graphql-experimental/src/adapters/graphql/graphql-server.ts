import { ApolloServer } from 'apollo-server';
import { makeExecutableSchema } from '@graphql-tools/schema';

export class GraphQLServer {
  private server;

  constructor(typeDefs: string, resolvers: any, context: any) {
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    this.server = new ApolloServer({ schema, context });
  }

  async start(port: number) {
    const { url } = await this.server.listen(port);
    console.log(`GraphQL server running at ${url}`);
  }
}
