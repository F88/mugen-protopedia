import { useKeySequences } from '@/lib/hooks/use-key-sequences';

export function useSpecialKeySequences(): void {
  useKeySequences({
    sequences: [
      {
        name: 'konami',
        keys: [
          'ArrowUp',
          'ArrowUp',
          'ArrowDown',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          'ArrowLeft',
          'ArrowRight',
          'b',
          'a',
        ],
        onMatch: () => {
          console.info('Konami code detected!');
        },
      },
      {
        name: 'accelerate-mode-ksk',
        keys: ['k', 's', 'k'],
        onMatch: () => {
          console.info('Acceleration mode (KSK) requested');
        },
      },
    ],
  });
}
