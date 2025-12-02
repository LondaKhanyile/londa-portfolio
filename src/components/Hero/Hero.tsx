export default function Hero() {
  const projects = [
    {
      id: 1,
      title: "TutorFlow",
      description: "TutorFlow is an AI tutor that helps students learn faster, understand deeper, and ace exams.",
      link: "https://tutorflow.co.za",
    },
    {
      id: 2,
      title: "EthixFlow",
      description: "EthixFlow gives employees a safe, secure way to speak up, be heard, and drive positive change.",
      link: "https://gregarious-ganache-64ee20.netlify.app",
    },
    {
      id: 3,
      title: "Project Three",
      description: "Building something exciting — reveal coming soon.",
      link: "#",
      badge: "Coming soon",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      {/* About Section */}
      <div className="mb-20">
        <h1 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl">
          Hi, I&apos;m Londa
        </h1>
        <p className="max-w-2xl text-lg text-gray-600">
          I&apos;m a developer who builds clean, modern, and
          maintainable products using TypeScript, Next.js, Tailwind, shadcn,
          Node.js, and Supabase. I approach development with strategy and
          intention, leveraging AI to accelerate workflows and improve quality.
          Whether for clients or my own projects, I focus on creating work
          that&apos;s practical, high-quality, and built to last.
        </p>
      </div>

      {/* Projects Section */}
      <div>
        <h2 className="mb-12 text-3xl font-bold text-gray-900">Projects</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <a
              key={project.id}
              href={project.link}
              target={project.link.startsWith("http") ? "_blank" : undefined}
              rel={project.link.startsWith("http") ? "noopener noreferrer" : undefined}
              className="relative group rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-gray-300 hover:shadow-lg"
            >
              {project.badge && (
                <span className="absolute right-4 top-4 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                  {project.badge}
                </span>
              )}
              <h3 className="mb-2 text-xl font-semibold text-gray-900 group-hover:text-gray-600">
                {project.title}
              </h3>
              <p className="text-gray-600">{project.description}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
