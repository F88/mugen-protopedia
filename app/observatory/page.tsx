import Link from 'next/link';

type ColorScheme = 'gray' | 'yellow';

interface ComingSoonCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color?: ColorScheme;
}

const colorStyles = {
  gray: {
    gradient: 'from-gray-50 dark:from-gray-800/20',
    iconBg: 'bg-gray-100 dark:bg-gray-800',
    iconText: 'text-gray-600 dark:text-gray-300',
  },
  yellow: {
    gradient: 'from-yellow-50 dark:from-yellow-900/20',
    iconBg: 'bg-yellow-100 dark:bg-yellow-800',
    iconText: 'text-yellow-600 dark:text-yellow-300',
  },
};

function ComingSoonCard({
  title,
  description,
  icon,
  color = 'gray',
}: ComingSoonCardProps) {
  const styles = colorStyles[color];

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 opacity-60 cursor-not-allowed">
      <div
        className={`absolute inset-0 bg-linear-to-br ${styles.gradient} to-transparent dark:to-transparent opacity-50`}
      />
      <div className="p-6 relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${styles.iconBg} ${styles.iconText}`}
          >
            {icon}
          </div>
          <h2 className="text-xl font-semibold text-gray-500 dark:text-gray-400">
            {title}
          </h2>
        </div>
        <p className="text-gray-500 dark:text-gray-500 flex-1">{description}</p>
        <div className="mt-4 flex items-center text-sm font-medium text-gray-400 dark:text-gray-500">
          Coming soon...
        </div>
      </div>
    </div>
  );
}

export default function ObservatoryPage() {
  return (
    <main className="">
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            ProtoPedia Observatory
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Dive into curated collections and unique insights from the infinite
            world of prototypes. All data in this section is analyzed based on
            Japan Standard Time (JST).
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Hello World Feature Card */}
          <Link
            href="/observatory/hello-world"
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 hover:shadow-lg transition-all duration-300"
          >
            <div className="absolute inset-0 bg-linear-to-br from-blue-50 to-transparent dark:from-blue-900/20 dark:to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="p-6 relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                  🎉
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Hello World
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 flex-1">
                The Origin. Witness the birth of light and vivid moments where
                new prototypes begin their journey.
              </p>
              <div className="mt-4 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                View Report &rarr;
              </div>
            </div>
          </Link>

          {/* Hall of Fame Feature Card (Coming Soon) */}
          <ComingSoonCard
            title="Hall of Fame"
            description="Celebrating the legends. A collection of the most impactful and memorable prototypes in history."
            icon="🏛️"
            color="yellow"
          />

          {/* The Memorial Park Feature Card (Coming Soon) */}
          <ComingSoonCard
            title="The Memorial Park"
            description="A place of respect and history. Honoring the prototypes that have completed their journey and the legacy they leave behind."
            icon="🪦"
            color="gray"
          />

          {/* The Sci-Fi Lab Feature Card */}
          <Link
            href="/observatory/sci-fi-lab"
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 hover:shadow-lg transition-all duration-300"
          >
            <div className="absolute inset-0 bg-linear-to-br from-purple-50 to-transparent dark:from-purple-900/20 dark:to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="p-6 relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                  🌌
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  The Sci-Fi Lab
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 flex-1">
                Exploring the unknown and the future. Where experimental
                narratives and futuristic concepts are analyzed.
              </p>
              <div className="mt-4 flex items-center text-sm font-medium text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
                View Report &rarr;
              </div>
            </div>
          </Link>

          {/* The Explorer's Guild Feature Card */}
          <Link
            href="/observatory/explorers-guild"
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 hover:shadow-lg transition-all duration-300"
          >
            <div className="absolute inset-0 bg-linear-to-br from-amber-50 to-transparent dark:from-amber-900/20 dark:to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="p-6 relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300">
                  🧭
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  The Explorer&apos;s Guild
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 flex-1">
                Adventure, strategy, and community. Discovering the tech roadmap
                and the unsung heroes of the ecosystem.
              </p>
              <div className="mt-4 flex items-center text-sm font-medium text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                View Report &rarr;
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
