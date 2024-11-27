import dotenv from 'dotenv';
dotenv.config();

export const config = {
  neo4j: {
    uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
    username: process.env.NEO4J_USERNAME || 'neo4j',
    password: process.env.NEO4J_PASSWORD || 'Casablanca',
  },
  graphql: {
    schemaPath: process.env.GRAPHQL_SCHEMA_PATH || './schema/schema.graphql',
  },
};
