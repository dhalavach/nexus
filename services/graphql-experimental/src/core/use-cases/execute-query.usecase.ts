export class ExecuteQueryUseCase {
  constructor(private readonly neo4jRepository: { runQuery: (arg0: string, arg1: Record<string, unknown>) => any; }) {}

  async execute(query: string, params: Record<string, unknown> = {}) {
    return this.neo4jRepository.runQuery(query, params);
  }
}
