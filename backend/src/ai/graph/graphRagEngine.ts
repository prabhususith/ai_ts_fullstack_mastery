/**
 * @file graphRagEngine.ts
 * @description Pure TypeScript GraphRAG (Knowledge Graph Augmented Retrieval) Engine.
 * Extracts semantic entities, builds an adjacency graph, and conducts multi-hop causal
 * pathfinding to discover non-obvious entity relationships beyond raw vector similarity.
 * @see https://arxiv.org/abs/2404.16130
 */

export interface GraphEntity {
  id: string;
  name: string;
  type: string;
  properties?: Record<string, any>;
}

export interface GraphEdge {
  sourceId: string;
  targetId: string;
  predicate: string;
  weight: number;
}

export interface MultiHopPath {
  nodes: GraphEntity[];
  predicates: string[];
  totalWeight: number;
}

export class GraphRagEngine {
  private entities: Map<string, GraphEntity> = new Map();
  private adjacencyList: Map<string, GraphEdge[]> = new Map();

  /**
   * Adds an entity node to the knowledge graph.
   */
  public addEntity(entity: GraphEntity): void {
    this.entities.set(entity.id, entity);
    if (!this.adjacencyList.has(entity.id)) {
      this.adjacencyList.set(entity.id, []);
    }
  }

  /**
   * Adds a directed relational edge between two entities.
   */
  public addEdge(edge: GraphEdge): void {
    if (!this.entities.has(edge.sourceId) || !this.entities.has(edge.targetId)) {
      throw new Error(`Cannot add edge: Both source (${edge.sourceId}) and target (${edge.targetId}) must exist.`);
    }

    const edges = this.adjacencyList.get(edge.sourceId) ?? [];
    edges.push(edge);
    this.adjacencyList.set(edge.sourceId, edges);
  }

  /**
   * Extracts entities and relationships from raw text using rule-based and regex patterns.
   */
  public extractAndIngest(text: string): { entitiesCount: number; edgesCount: number } {
    // Pattern 1: Technology relationships (e.g., "X uses Y", "X connects to Y", "X defends Y")
    const techRegex = /\b(pgvector|PostgreSQL|Redis|Express|React|Vite|Argon2id|Jose|Docker|TypeScript|LangGraph|HNSW)\b/gi;
    const matches = Array.from(new Set(text.match(techRegex) || []));

    for (const match of matches) {
      const id = match.toLowerCase();
      this.addEntity({
        id,
        name: match,
        type: 'TECHNOLOGY',
      });
    }

    let edgesCount = 0;
    // Create associative edges for technologies co-occurring in the text
    for (let i = 0; i < matches.length; i++) {
      for (let j = i + 1; j < matches.length; j++) {
        const source = matches[i]!.toLowerCase();
        const target = matches[j]!.toLowerCase();
        this.addEdge({
          sourceId: source,
          targetId: target,
          predicate: 'INTEGRATES_WITH',
          weight: 0.85,
        });
        edgesCount++;
      }
    }

    return { entitiesCount: matches.length, edgesCount };
  }

  /**
   * Multi-hop breadth-first pathfinding to discover causal and associative chains.
   * @param startEntityId Starting entity ID
   * @param maxHops Maximum graph depth (default: 3)
   */
  public findMultiHopPaths(startEntityId: string, maxHops: number = 3): MultiHopPath[] {
    const paths: MultiHopPath[] = [];
    const startEntity = this.entities.get(startEntityId);
    if (!startEntity) return [];

    interface QueueItem {
      currentId: string;
      visited: Set<string>;
      pathEntities: GraphEntity[];
      predicates: string[];
      weight: number;
    }

    const queue: QueueItem[] = [
      {
        currentId: startEntityId,
        visited: new Set([startEntityId]),
        pathEntities: [startEntity],
        predicates: [],
        weight: 1.0,
      },
    ];

    while (queue.length > 0) {
      const item = queue.shift()!;
      if (item.pathEntities.length > 1) {
        paths.push({
          nodes: item.pathEntities,
          predicates: item.predicates,
          totalWeight: Number(item.weight.toFixed(3)),
        });
      }

      if (item.pathEntities.length >= maxHops + 1) {
        continue;
      }

      const neighbors = this.adjacencyList.get(item.currentId) ?? [];
      for (const edge of neighbors) {
        if (!item.visited.has(edge.targetId)) {
          const targetEntity = this.entities.get(edge.targetId);
          if (targetEntity) {
            const nextVisited = new Set(item.visited);
            nextVisited.add(edge.targetId);
            queue.push({
              currentId: edge.targetId,
              visited: nextVisited,
              pathEntities: [...item.pathEntities, targetEntity],
              predicates: [...item.predicates, edge.predicate],
              weight: item.weight * edge.weight,
            });
          }
        }
      }
    }

    return paths;
  }

  /**
   * Synthesizes graph paths into structured context for RAG injection.
   */
  public getGraphContextForQuery(query: string): string {
    const words = query.toLowerCase().split(/\s+/);
    const discoveredPaths: MultiHopPath[] = [];

    for (const word of words) {
      if (this.entities.has(word)) {
        const paths = this.findMultiHopPaths(word, 2);
        discoveredPaths.push(...paths);
      }
    }

    if (discoveredPaths.length === 0) return 'No graph connections discovered for this query.';

    return discoveredPaths
      .slice(0, 5)
      .map((p) => p.nodes.map((n) => n.name).join(` --[${p.predicates[0] || 'REL'}--> `))
      .join('\n');
  }

  public getStats(): { entities: number; edges: number } {
    let edgeCount = 0;
    for (const edges of this.adjacencyList.values()) {
      edgeCount += edges.length;
    }
    return {
      entities: this.entities.size,
      edges: edgeCount,
    };
  }
}

export const graphRag = new GraphRagEngine();
