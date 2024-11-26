import { readFile } from 'fs/promises';
import path from 'path';

export class GraphQLSchemaLoader {
  async loadSchema(filePath: string): Promise<string> {
    return readFile(filePath, { encoding: 'utf-8' });
  }
}
