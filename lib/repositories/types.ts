import { NormalizedPrototype } from '../api/prototypes';

/**
 * Repository interface for Prototype entities.
 */
export interface PrototypeRepository {
  /**
   * Retrieve all prototypes as a single collection.
   */
  getAll(): Promise<NormalizedPrototype[]>;

  /**
   * List prototypes with pagination
   *
   * @param options Pagination options
   */
  list(options?: {
    limit?: number;
    offset?: number;
    prototypeId?: number;
  }): Promise<NormalizedPrototype[]>;

  /**
   * Get prototype by ID
   *
   * @param ids
   */
  getByPrototypeId(id: number): Promise<undefined | NormalizedPrototype>;

  /**
   * Get TSV data of prototypes
   *
   * @returns
   */
  getTsv(options?: { limit?: number; offset?: number }): Promise<string>;
}
