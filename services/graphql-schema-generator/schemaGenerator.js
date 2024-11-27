const fs = require('fs');
const yaml = require('yaml');

// Map LinkML types to GraphQL types
const typeMapping = {
  string: 'String',
  integer: 'Int',
  boolean: 'Boolean',
  decimal: 'Float',
  datetime: 'String', // You can use a custom scalar for DateTime if needed
  FloatOrString: 'String',
  PercentType: 'Float',
  float: 'Float',
};

/**
 * Converts a LinkML class to a GraphQL type definition
 */
function generateGraphQLType(name, attributes) {
  const fields = Object.entries(attributes)
    .map(([key, value]) => {
      const type = typeMapping[value.range];
      if (!type) throw new Error(`Unsupported type: ${value.range}`);
      return `${key}: ${type}${value.required ? '!' : ''}`;
    })
    .join('\n  ');
  return `type ${name} {\n  ${fields}\n}`;
}

/**
 * Generates a complete GraphQL schema from a LinkML ontology
 */
function generateGraphQLSchema(linkml) {
  const classes = linkml.classes;
  const typeDefinitions = Object.entries(classes)
    .map(([name, details]) => generateGraphQLType(name, details.attributes))
    .join('\n\n');

  // Add a basic Query type
  const queryType = `
type Query {
  ${Object.keys(classes)
    .map((className) => `${className.toLowerCase()}s: [${className}]`)
    .join('\n  ')}
}
`;

  return `${typeDefinitions}\n\n${queryType}`;
}

/**
 * Load and parse the LinkML YAML ontology
 */
function loadLinkMLOntology(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return yaml.parse(content);
}

module.exports = { generateGraphQLSchema, loadLinkMLOntology };
