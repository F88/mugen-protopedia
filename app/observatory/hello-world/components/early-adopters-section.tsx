import { cn } from '@/lib/utils';
import {
  buildPrototypeLink,
  buildUserLink,
  getUserDisplayName,
} from '@/lib/utils/prototype-utils';

import { IconTelescope } from '../../shared/icons';
import { helloWorldTheme } from '../theme';
import { ObservatorySection } from './observatory-section';

type EarlyAdoptersSectionProps = {
  adopters: {
    tag: string;
    prototypeId: number;
    prototypeTitle: string;
    releaseDate: string;
    teamNm: string;
    users: readonly string[];
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
      className="hover:text-blue-600 dark:hover:text-blue-400"
    >
      {name}
    </a>
  );
}

export function EarlyAdoptersSection({ adopters }: EarlyAdoptersSectionProps) {
  const titleClassName = cn(
    'font-bold',
    'text-gray-900',
    'dark:text-white',
    'break-words',
    'group-hover:text-blue-600',
    'dark:group-hover:text-blue-400',
    'transition-colors',
  );

  return (
    <ObservatorySection
      theme={helloWorldTheme.sections.earlyAdopters.theme}
      icon={<IconTelescope />}
      title="The Early Adopters"
      description="Who planted the first flag? Discover the pioneers who introduced new technologies to our world."
      sourceNote={
        <>
          <strong>Earliest Release Date</strong> for each of the most popular
          tags.
        </>
      }
      visualContent={
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-400/20 rounded-full animate-ping opacity-20 duration-3000"></div>
          <div className="absolute inset-2 bg-blue-400/20 rounded-full animate-pulse opacity-30"></div>
          <div className="text-6xl filter drop-shadow-lg">🔭</div>
        </div>
      }
      narrative={{
        title: (
          <>
            <span className="text-xl">🚩</span> The Legacy of First Steps
          </>
        ),
        content: (
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="mb-2 font-semibold text-gray-800 dark:text-gray-200">
                The First Penguin
              </p>
              <p>
                In a sea of uncertainty, someone has to be the first to dive in.
                These prototypes represent the brave souls who experimented with
                new tech before it was cool.
              </p>
            </div>
            <div>
              <p className="mb-2 font-semibold text-gray-800 dark:text-gray-200">
                Origin of Species
              </p>
              <p>
                Every standard tool we use today started as a risky experiment.
                By tracing back to the origin, we honor the curiosity that
                drives our evolution.
              </p>
            </div>
          </div>
        ),
      }}
      delay="delay-500"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adopters.slice(0, 6).map((adopter) => (
          <div
            key={adopter.tag}
            className="bg-white/80 dark:bg-gray-800/80 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                First #{adopter.tag}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {new Date(adopter.releaseDate).getFullYear()}
              </span>
            </div>
            <a
              href={buildPrototypeLink(adopter.prototypeId)}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <h3 className={titleClassName}>{adopter.prototypeTitle}</h3>
            </a>
            {/* Maker links live OUTSIDE the prototype anchor to avoid nesting
                <a> inside <a> (invalid HTML). */}
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {adopter.teamNm !== '' ? (
                <span className="block">🏛️ {adopter.teamNm}</span>
              ) : null}
              {adopter.users.length > 0 ? (
                <span className="block">
                  🥼{' '}
                  {adopter.users.map((user, idx) => (
                    <span key={`${user}-${idx}`}>
                      {idx > 0 ? ', ' : ''}
                      <MakerName user={user} />
                    </span>
                  ))}
                </span>
              ) : null}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {new Date(adopter.releaseDate).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </ObservatorySection>
  );
}
