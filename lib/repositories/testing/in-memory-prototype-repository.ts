import type { NormalizedPrototype } from '@/lib/api/prototypes';
import type { PrototypeRepository } from '@/lib/repositories/types';

export type InMemoryPrototypeRepository = {
  repository: PrototypeRepository;
  setPrototypes: (prototypes: NormalizedPrototype[]) => void;
  addPrototype: (prototype: NormalizedPrototype) => void;
  setTsv: (next: string) => void;
};

export type InMemoryPrototypeRepositoryOptions = {
  prototypes?: NormalizedPrototype[];
  tsv?: string;
};

export function createInMemoryPrototypeRepository({
  prototypes: initialPrototypes = [],
  tsv: initialTsv = '',
}: InMemoryPrototypeRepositoryOptions = {}): InMemoryPrototypeRepository {
  let prototypes = [...initialPrototypes];
  let tsv = initialTsv;

  const repository: PrototypeRepository = {
    async getAll() {
      return [...prototypes];
    },

    async list({
      limit,
      offset,
      prototypeId,
    }: { limit?: number; offset?: number; prototypeId?: number } = {}) {
      const filtered =
        prototypeId !== undefined
          ? prototypes.filter((prototype) => prototype.id === prototypeId)
          : prototypes;

      const safeOffset = Math.max(0, offset ?? 0);
      const safeLimit = limit ?? filtered.length - safeOffset;
      if (safeLimit <= 0) {
        return [];
      }
      return filtered.slice(safeOffset, safeOffset + safeLimit);
    },

    async getByPrototypeId(id: number) {
      return prototypes.find((prototype) => prototype.id === id);
    },

    async getTsv({ limit, offset }: { limit?: number; offset?: number } = {}) {
      void limit;
      void offset;
      return tsv;
    },
  };

  const setPrototypes = (next: NormalizedPrototype[]) => {
    prototypes = [...next];
  };

  const addPrototype = (prototype: NormalizedPrototype) => {
    prototypes = [...prototypes, prototype];
  };

  const setTsv = (next: string) => {
    tsv = next;
  };

  return {
    repository,
    setPrototypes,
    addPrototype,
    setTsv,
  };
}
