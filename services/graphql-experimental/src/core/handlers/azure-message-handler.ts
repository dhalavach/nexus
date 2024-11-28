// src/core/handlers/azure-message-handler.ts
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

export class AzureMessageHandler {
  private graphqlClient: ApolloClient<any>;

  constructor(graphqlEndpoint: string) {
    this.graphqlClient = new ApolloClient({
      uri: graphqlEndpoint,
      cache: new InMemoryCache(),
    });
  }

  async handleMessage(message: Record<string, any>): Promise<void> {
    console.log('Handling message:', message);

    // Example: Update the Neo4j database via the GraphQL API
    if (message.event === 'UPDATE_NODE') {
      const mutation = gql`
        mutation UpdateNode($id: ID!, $data: UpdateNodeInput!) {
          updateNode(id: $id, data: $data) {
            id
            name
            status
          }
        }
      `;

      const variables = {
        id: message.payload.id,
        data: message.payload.data,
      };

      try {
        const response = await this.graphqlClient.mutate({ mutation, variables });
        console.log('GraphQL mutation response:', response.data);
      } catch (error) {
        console.error('Error executing GraphQL mutation:', error);
      }
    }
  }
}
