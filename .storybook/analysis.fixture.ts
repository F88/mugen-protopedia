import { analyzePrototypesForServer } from '@/lib/analysis/entrypoints/server';
import type { PrototypeAnalysis } from '@/lib/analysis/types';
import { buildAnniversaries, buildAnniversarySlice } from '@/lib/analysis';
import type { NormalizedPrototype } from '@/lib/api/prototypes';
import {
  anniversaryMinimalPrototype,
  fullfilledPrototype,
  minimalPrototype,
} from '@/.storybook/prototypes.fixture';

// Helper function for fixture
function analyzePrototypes(
  prototypes: NormalizedPrototype[],
): PrototypeAnalysis {
  const serverAnalysis = analyzePrototypesForServer(prototypes);

  if (prototypes.length === 0) {
    return {
      ...serverAnalysis,
      anniversaries: {
        birthdayCount: 0,
        birthdayPrototypes: [],
        newbornCount: 0,
        newbornPrototypes: [],
      },
    };
  }

  const { birthdayPrototypes, newbornPrototypes } =
    buildAnniversaries(prototypes);
  const anniversaries = buildAnniversarySlice(
    birthdayPrototypes,
    newbornPrototypes,
  );

  return {
    ...serverAnalysis,
    anniversaries,
  };
}

export const sampleAnalysis: PrototypeAnalysis = analyzePrototypes([
  fullfilledPrototype,
  minimalPrototype,
  anniversaryMinimalPrototype,
]);
