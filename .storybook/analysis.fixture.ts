import {
  analyzePrototypes,
  type PrototypeAnalysis,
} from '@/lib/utils/prototype-analysis';
import {
  anniversaryMinimalPrototype,
  fullfilledPrototype,
  minimalPrototype,
} from '@/.storybook/prototypes.fixture';

export const sampleAnalysis: PrototypeAnalysis = analyzePrototypes([
  fullfilledPrototype,
  minimalPrototype,
  anniversaryMinimalPrototype,
]);
