export default function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200/60 bg-white/80 backdrop-blur-xs py-3 px-6 md:px-8 flex items-center justify-center text-xs text-neutral-500 shrink-0 text-center">
      <p>© {currentYear} NORTHRE® Admin Panel. All rights reserved.</p>
    </footer>
  );
}