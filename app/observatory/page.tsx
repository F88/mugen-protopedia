import { ObservatoryCard } from '@/components/analysis/observatory-card';

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
          <ObservatoryCard
            title="Hello World"
            description="The Origin. Witness the birth of light and vivid moments where new prototypes begin their journey."
            icon="🎉"
            color="blue"
            href="/observatory/hello-world"
          />

          {/* Hall of Fame Feature Card (Coming Soon) */}
          <ObservatoryCard
            title="Hall of Fame"
            description="Celebrating the legends. A collection of the most impactful and memorable prototypes in history."
            icon="🏛️"
            color="yellow"
            href={undefined}
          />

          {/* The Memorial Park Feature Card (Coming Soon) */}
          <ObservatoryCard
            title="The Memorial Park"
            description="A place of respect and history. Honoring the prototypes that have completed their journey and the legacy they leave behind."
            icon="🪦"
            color="gray"
            href={undefined}
          />

          {/* The Sci-Fi Lab Feature Card */}
          <ObservatoryCard
            title="The Sci-Fi Lab"
            description="Exploring the unknown and the future. Where experimental narratives and futuristic concepts are analyzed."
            icon="🌌"
            color="purple"
            href={undefined}
          />

          {/* The Explorer's Guild Feature Card */}
          <ObservatoryCard
            title="The Explorer's Guild"
            description="Adventure, strategy, and community. Discovering the tech roadmap and the unsung heroes of the ecosystem."
            icon="🧭"
            color="amber"
            href={undefined}
          />
        </div>
      </div>
    </main>
  );
}
