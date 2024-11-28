const { GraphQLScalarType, Kind, GraphQLError } = require('graphql');
//custom resolver 
const PercentType = new GraphQLScalarType({
  name: 'PercentType',
  description: 'Represents a percentage value as a float between 0 and 1 inclusive.',

  // Serialize output value for the client
  serialize(value) {
    if (typeof value !== 'number' || value < 0 || value > 1) {
      throw new GraphQLError(
        `Value ${value} is not a valid PercentType. It must be a number between 0 and 1 inclusive.`
      );
    }
    return value;
  },

  // Parse value from the client input
  parseValue(value) {
    if (typeof value !== 'number' || value < 0 || value > 1) {
      throw new GraphQLError(
        `Value ${value} is not a valid PercentType. It must be a number between 0 and 1 inclusive.`
      );
    }
    return value;
  },

  // Parse literal from the GraphQL query (e.g., hardcoded in the query)
  parseLiteral(ast) {
    if (ast.kind !== Kind.FLOAT && ast.kind !== Kind.INT) {
      throw new GraphQLError(`Value must be a float or integer, but got ${ast.kind}.`);
    }

    const value = parseFloat(ast.value);
    if (value < 0 || value > 1) {
      throw new GraphQLError(
        `Value ${value} is not a valid PercentType. It must be a number between 0 and 1 inclusive.`
      );
    }
    return value;
  },
});

module.exports = PercentType;
