export default function Footer() {
  const links = [
    { text: "About WCS", href: "#" },
    { text: "What's On", href: "#" },
    { text: "Our Story", href: "#" },
    { text: "Meet the Team", href: "#" },
    { text: "Community", href: "#" },
    { text: "Code of Conduct", href: "#" },
    { text: "Contact", href: "#" },
  ];

  return (
    <footer className="bg-text-dark/[0.03] px-[5%] py-10 text-center">
      {/* Navigation Links */}
      <nav className="flex flex-wrap justify-center gap-[30px] mb-6 md:flex-row md:gap-[30px]">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.href}
            className={`text-text-dark transition-colors ${
              index % 2 === 0
                ? "hover:text-yellow-accent"
                : "hover:text-pink-accent"
            }`}
          >
            {link.text}
          </a>
        ))}
      </nav>

      {/* Copyright */}
      <p className="text-sm text-text-dark/70">
        West Coast Swing Cape Town © 2026
      </p>
    </footer>
  );
}
