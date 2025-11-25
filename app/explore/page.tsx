import Link from 'next/link';

export default function ExplorePage() {
  return (
    <main className="">
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Explore the ProtoPedia Universe
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
            href="/explore/hello-world"
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 hover:shadow-lg transition-all duration-300"
          >
            <div className="absolute inset-0 bg-linear-to-br from-blue-50 to-transparent dark:from-blue-900/20 dark:to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="p-6 relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                  🌐
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Hello World
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 flex-1">
                Witness the birth of new prototypes. A daily log of the latest
                creations joining the ProtoPedia universe.
              </p>
              <div className="mt-4 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                View Report &rarr;
              </div>
            </div>
          </Link>

          {/* Placeholder for future features */}
          <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 opacity-60 cursor-not-allowed">
            <div className="p-6 flex flex-col h-full items-center justify-center text-center">
              <div className="mb-3 text-3xl opacity-50">🏛️</div>
              <h2 className="text-lg font-medium text-gray-500 dark:text-gray-400">
                Hall of Fame
              </h2>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Coming soon...
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
