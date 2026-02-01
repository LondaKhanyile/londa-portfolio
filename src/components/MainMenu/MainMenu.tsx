import Link from "next/link";

const MENU_ITEMS = [
  { href: "#about", label: "About Me" },
  { href: "#projects", label: "Projects" },
  { href: "#writing", label: "Writing" },
  { href: "#contact", label: "Contact" },
] as const;

export default function MainMenu() {
  return (
    <section
      className="relative z-10 flex min-h-screen flex-col justify-center px-6 pt-12 sm:pl-12 sm:pt-16"
      aria-label="Main menu"
    >
      <nav
        className="flex flex-col gap-6 sm:gap-8"
        aria-label="Primary navigation"
      >
        {MENU_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group relative w-fit text-2xl font-extrabold tracking-[0.1em] text-neutral-300 transition-all duration-300 hover:scale-105 hover:text-neutral-100 hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.15)] sm:text-3xl md:text-4xl"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <p className="mt-16 text-xs tracking-widest text-neutral-500 sm:mt-20">
        Available for work
      </p>
    </section>
  );
}
