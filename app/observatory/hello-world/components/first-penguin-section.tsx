import { IconPenguin } from '../../shared/icons';
import {
  buildPrototypeLink,
  buildUserLink,
  getUserDisplayName,
} from '@/lib/utils/prototype-utils';
import { helloWorldTheme } from '../theme';
import { ObservatorySection } from './observatory-section';

type FirstPenguinSectionProps = {
  penguins: {
    year: number;
    prototype: {
      id: number;
      title: string;
      releaseDate: string;
      teamNm: string;
      users: readonly string[];
    };
  }[];
};

/**
 * A maker's name linked to their ProtoPedia profile, falling back to plain text
 * when no profileId can be recovered. Mirrors the alchemists-table `MakerName`
 * so a person reads the same across Observatory pages.
 */
function MakerName({ user }: { user: string }) {
  const href = buildUserLink(user);
  const name = getUserDisplayName(user);
  if (href == null) return <span>{name}</span>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-cyan-600 dark:hover:text-cyan-400"
    >
      {name}
    </a>
  );
}

export function FirstPenguinSection({ penguins }: FirstPenguinSectionProps) {
  return (
    <ObservatorySection
      theme={helloWorldTheme.sections.firstPenguin.theme}
      icon={<IconPenguin />}
      title="The First Penguin"
      description="The brave souls who broke the silence of the New Year. Celebrating the very first prototype of each year."
      sourceNote={
        <>
          <strong>First Release</strong> of each year (JST).
        </>
      }
      visualContent={
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-bounce opacity-20 duration-3000"></div>
          <div className="text-6xl filter drop-shadow-lg">🐧</div>
        </div>
      }
      narrative={{
        title: (
          <>
            <span className="text-xl">🌊</span> First to Dive
          </>
        ),
        content: (
          <p>
            In the animal kingdom, the &quot;First Penguin&quot; is the
            courageous individual who dives into the unknown waters first,
            leading the flock. In ProtoPedia, these creators set the tone for
            the entire year.
          </p>
        ),
      }}
      delay="delay-700"
    >
      <div className="grid gap-6 md:grid-cols-2">
        {penguins.map((penguin) => (
          <div
            key={penguin.year}
            className="bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-cyan-100 dark:border-cyan-800/30 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
                {penguin.year}
              </span>
              <span className="px-2 py-1 bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 text-xs rounded-full font-bold">
                First Penguin
              </span>
            </div>
            <a
              href={buildPrototypeLink(penguin.prototype.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2">
                {penguin.prototype.title}
              </h3>
            </a>
            {/* Maker links live OUTSIDE the prototype anchor to avoid nesting
                <a> inside <a> (invalid HTML). */}
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {penguin.prototype.teamNm !== '' ? (
                <span className="block">🏛️ {penguin.prototype.teamNm}</span>
              ) : null}
              {penguin.prototype.users.length > 0 ? (
                <span className="block">
                  🥼{' '}
                  {penguin.prototype.users.map((user, idx) => (
                    <span key={`${user}-${idx}`}>
                      {idx > 0 ? ', ' : ''}
                      <MakerName user={user} />
                    </span>
                  ))}
                </span>
              ) : null}
            </div>
            <div className="text-xs font-mono text-cyan-600/70 dark:text-cyan-400/70">
              {new Date(penguin.prototype.releaseDate).toLocaleString('ja-JP', {
                timeZone: 'Asia/Tokyo',
              })}{' '}
              (JST)
            </div>
          </div>
        ))}
      </div>
    </ObservatorySection>
  );
}
