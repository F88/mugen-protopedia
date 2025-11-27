import { IconTool } from '../../components/icons';
import { ObservatorySection } from './observatory-section';

type GatewayDrugSectionProps = {
  topMaterials: { material: string; count: number }[];
};

export function GatewayDrugSection({ topMaterials }: GatewayDrugSectionProps) {
  return (
    <ObservatorySection
      theme="lime"
      icon={<IconTool />}
      title="The Gateway Drug"
      description="Every addiction starts somewhere. These are the tools and materials that hooked us into the world of prototyping."
      sourceNote={
        <>
          <strong>Materials/Tools</strong> listed in all registered prototypes.
        </>
      }
      visualContent={
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-lime-400/20 rounded-full animate-pulse opacity-20 duration-3000"></div>
          <div className="text-6xl filter drop-shadow-lg">🛠️</div>
        </div>
      }
      narrative={{
        title: (
          <>
            <span className="text-xl">💊</span> Choose Your Poison
          </>
        ),
        content: (
          <p>
            Whether it&apos;s the click of a mechanical switch, the glow of an
            LED, or the infinite possibilities of a game engine, these are the
            common languages we speak.
          </p>
        ),
      }}
      delay="delay-400"
    >
      <div className="flex flex-wrap justify-center md:justify-start gap-3">
        {topMaterials.slice(0, 15).map(({ material, count }) => (
          <div
            key={material}
            className="flex items-center bg-white/80 dark:bg-black/20 rounded-lg px-4 py-2 border border-lime-100 dark:border-lime-800/50 hover:scale-105 transition-transform cursor-default"
          >
            <span className="text-base font-bold text-lime-800 dark:text-lime-200 mr-2">
              {material}
            </span>
            <span className="text-xs font-bold text-lime-600 dark:text-lime-400 bg-lime-100 dark:bg-lime-900/50 px-2 py-0.5 rounded-full">
              {count}
            </span>
          </div>
        ))}
      </div>
    </ObservatorySection>
  );
}
