import { DatabasePort } from '../../core/ports/database.port';
import { driver as _driver, auth } from 'neo4j-driver';

export class Neo4jRepository implements DatabasePort {
  private driver;

  constructor(uri: string, username: string, password: string) {
    this.driver = _driver(uri, auth.basic(username, password));
  }

  async runQuery(query: string, params: Record<string, unknown> = {}) {
    const session = this.driver.session();
    try {
      const result = await session.run(query, params);
      return result.records.map(record => record.toObject());
    } finally {
      await session.close();
    }
  }
}
