import { PrototypeForMpp } from '../api/prototypes';

/**
 * Repository interface for Prototype entities.
 */
export interface PrototypeRepository {
  /**
   * Retrieve all prototypes as a single collection.
   */
  getAll(): Promise<PrototypeForMpp[]>;

  /**
   * List prototypes with pagination
   *
   * @param options Pagination options
   */
  list(options?: {
    limit?: number;
    offset?: number;
    prototypeId?: number;
  }): Promise<PrototypeForMpp[]>;

  /**
   * Get prototype by ID
   *
   * @param ids
   */
  getByPrototypeId(id: number): Promise<undefined | PrototypeForMpp>;
}
