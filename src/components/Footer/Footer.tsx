export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-600">
            &copy; {currentYear} Londa Sihe Khanyile. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="https://github.com/londakhanyile"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 transition-colors hover:text-gray-900"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/londakhanyile"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 transition-colors hover:text-gray-900"
            >
              LinkedIn
            </a>
            <a
              href="mailto:lskhanyile98@gmail.com"
              className="text-sm text-gray-600 transition-colors hover:text-gray-900"
            >
              Email
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
