import { PrototypeForMpp } from '../api/prototypes';

/**
 * Repository interface for Prototype entities.
 */
export interface PrototypeRepository {
  /**
   * Get prototype by ID
   *
   * @param ids
   */
  getByPrototypeId(id: number): Promise<undefined | PrototypeForMpp>;
}
