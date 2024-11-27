const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { generateGraphQLSchema, loadLinkMLOntology } = require('./schemaGenerator');

// Load the ontology
const ontologyPath = './ontology.yaml';
const ontology = loadLinkMLOntology(ontologyPath);

// Generate GraphQL schema
const graphqlSchemaString = generateGraphQLSchema(ontology);

// Create an Apollo Server with the schema
const typeDefs = gql(graphqlSchemaString);
const resolvers = {}; // Define resolvers if needed
const server = new ApolloServer({ typeDefs, resolvers });

async function startServer() {
  const app = express();
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
