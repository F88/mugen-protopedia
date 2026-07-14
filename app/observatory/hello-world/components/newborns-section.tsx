import { IconSparkles } from '../../shared/icons';
import {
  buildPrototypeLink,
  buildUserLink,
  getUserDisplayName,
} from '@/lib/utils/prototype-utils';
import type { AnniversaryCandidatePrototype } from '@/lib/analysis/types';
import { helloWorldTheme } from '../theme';
import { ObservatorySection } from './observatory-section';

type NewbornsSectionProps = {
  count: number;
  prototypes: AnniversaryCandidatePrototype[];
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
      className="hover:text-sky-600 dark:hover:text-sky-400"
    >
      {name}
    </a>
  );
}

export function NewbornsSection({ count, prototypes }: NewbornsSectionProps) {
  return (
    <ObservatorySection
      theme={helloWorldTheme.sections.newborns.theme}
      icon={<IconSparkles />}
      title="The Newborn Stars"
      description="Witness the latest prototypes that have just materialized into our world."
      sourceNote={
        <>
          Prototypes released within the <strong>Last 24 Hours</strong>.
        </>
      }
      visualContent={
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-ping opacity-20 duration-3000"></div>
          <div className="absolute inset-2 bg-sky-400/20 rounded-full animate-pulse opacity-30"></div>
          <div className="text-6xl filter drop-shadow-lg">✨</div>
        </div>
      }
      narrative={{
        title: (
          <>
            <span className="text-xl">👶</span> The Beginning of Everything
          </>
        ),
        content: (
          <p>
            Every legendary project started as a single commit, a rough
            prototype, and a nervous release. These newborn stars are the future
            of our universe. Give them a warm welcome!
          </p>
        ),
      }}
      delay={helloWorldTheme.sections.newborns.delay}
    >
      {count === 0 ? (
        <div className="bg-white/60 dark:bg-black/20 rounded-2xl p-12 text-center border border-dashed border-sky-200 dark:border-sky-800/30">
          <div className="text-4xl mb-4 opacity-50">🔭</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            The sky is quiet today.
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            No new prototypes have been detected in the last 24 hours. The
            creators are likely deep in meditation (or coding).
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prototypes.map((proto) => (
            <div
              key={proto.id}
              className="group bg-white/80 dark:bg-gray-800/80 rounded-xl border border-sky-100 dark:border-sky-800/50 shadow-sm hover:shadow-md hover:border-sky-400 dark:hover:border-sky-500 transition-all duration-200 p-5"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  ID: {proto.id}
                </span>
                <span className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  NEW
                </span>
              </div>
              <a
                href={buildPrototypeLink(proto.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 line-clamp-2 transition-colors">
                  {proto.title}
                </h3>
              </a>
              {/* Maker links live OUTSIDE the prototype anchor to avoid nesting
                  <a> inside <a> (invalid HTML). */}
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {proto.teamNm !== '' ? (
                  <span className="block">🏛️ {proto.teamNm}</span>
                ) : null}
                {proto.users.length > 0 ? (
                  <span className="block">
                    🥼{' '}
                    {proto.users.map((user, idx) => (
                      <span key={`${user}-${idx}`}>
                        {idx > 0 ? ', ' : ''}
                        <MakerName user={user} />
                      </span>
                    ))}
                  </span>
                ) : null}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Materialized at{' '}
                {new Date(proto.releaseDate).toLocaleTimeString('ja-JP', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </ObservatorySection>
  );
}
