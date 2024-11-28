export interface DatabasePort {
  runQuery(query: string, params: Record<string, unknown>): Promise<any>;
  getDriver(driver: string): Promise<any>;
}
