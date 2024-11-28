// import dotenv from 'dotenv';
// dotenv.config();
export const config = {
  neo4j: {
    uri: 'bolt://localhost:7687',
    username: 'neo4j',
    password: 'Casablanca',
  },
  graphql: {
    schemaPath: './src/schema/schema.graphql',
    endpoint: 'http://localhost:4000'
  },
  kafka: {
    clientId: 'graphql-api',
    brokers: ['localhost:9092'],
  },
};
