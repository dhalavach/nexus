export class ExecuteQueryUseCase {
  constructor(private readonly neo4jRepository) {}

  async execute(query: string, params: Record<string, unknown> = {}) {
    return this.neo4jRepository.runQuery(query, params);
  }
}
