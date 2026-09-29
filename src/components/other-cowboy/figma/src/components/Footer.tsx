export default function Footer() {
  return (
    <footer className="bg-[#4e332d] text-[#ebe8e0] py-10 px-5 md:px-10 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div>
          <img src="/assets/logo-light.svg" alt="Urban Cowboy" className="h-8" />
        </div>
        <div className="flex gap-8 text-xs opacity-60" style={{ fontFamily: 'var(--font-inter)' }}>
          <a href="#" className="hover:opacity-100 transition-opacity">Privacy</a>
          <a href="#" className="hover:opacity-100 transition-opacity">Terms</a>
          <a href="#" className="hover:opacity-100 transition-opacity">Contact</a>
        </div>
      </div>
    </footer>
  );
}
