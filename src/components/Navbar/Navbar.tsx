import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-center">
          <Link href="/" className="text-xl font-semibold text-gray-900">
            Londa Sihe Khanyile
          </Link>
        </div>
      </div>
    </nav>
  );
}
