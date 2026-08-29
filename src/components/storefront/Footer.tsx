import Link from "next/link";
import { getFooterSettings } from "@/modules/storefront-cms/footer.service";

export async function Footer() {
  // Tarik data langsung dari database secara real-time
  const settings = await getFooterSettings();

  // Format nomor WA untuk link wa.me (buang karakter selain angka)
  const waLink = settings.contact_phone ? `https://wa.me/${settings.contact_phone.replace(/\D/g, "")}` : "#";

  return (
    <footer className="w-full border-t border-neutral-200 bg-white text-[#222]">
      <div className="w-full px-6 py-16 sm:px-12 md:px-16 lg:px-20 xl:px-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 lg:gap-20 xl:gap-28">
          
          {/* Kolom 1: About & Socials */}
          <div className="space-y-5">
            <h4 className="text-xs font-bold tracking-[0.25em] text-[#111] uppercase">
              ABOUT NORTHRE
            </h4>
            <div className="space-y-3 text-[12px] leading-relaxed text-[#555]">
              {settings.description && (
                <p>{settings.description}</p>
              )}
              {settings.trademark_text && (
                <p className="font-medium text-black/80">{settings.trademark_text}</p>
              )}
            </div>

            {/* Social Media Links (Hanya muncul jika URL diisi di CMS) */}
            <div className="flex items-center gap-4 pt-2">
              {settings.tiktok_url && (
                <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-[#333] transition-colors hover:text-black" aria-label="TikTok">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.77 0 2.89 2.89 0 0 1 2.53-2.85V10.2a6.34 6.34 0 0 0-5.83 6.94 6.34 6.34 0 0 0 6.9 5.86 6.34 6.34 0 0 0 5.83-6.94V7.27a8.55 8.55 0 0 0 4.14 1.13V6.69z"/></svg>
                </a>
              )}
              {settings.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="text-[#333] transition-colors hover:text-black" aria-label="Facebook">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                </a>
              )}
              {settings.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="text-[#333] transition-colors hover:text-black" aria-label="Instagram">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              )}
              {settings.youtube_url && (
                <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="text-[#333] transition-colors hover:text-black" aria-label="YouTube">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              )}
              {/* Tambahan opsional: Icon X / Twitter */}
              {settings.twitter_url && (
                <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" className="text-[#333] transition-colors hover:text-black" aria-label="X (Twitter)">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Kolom 2: Information Navigation Links (Render Otomatis dari Array JSON) */}
          <div className="space-y-5">
            <h4 className="text-xs font-bold tracking-[0.25em] text-[#111] uppercase">
              INFORMATION
            </h4>
            <ul className="space-y-2.5 text-[11px] font-semibold tracking-wider text-[#444] uppercase">
              {settings.information_links && settings.information_links.length > 0 ? (
                settings.information_links.map((link, idx) => (
                  <li key={idx}>
                    <Link href={link.url} className="transition-colors hover:text-black">
                      {link.label}
                    </Link>
                  </li>
                ))
              ) : (
                <li>No links available</li>
              )}
            </ul>
          </div>

          {/* Kolom 3: Contact Us & Newsletter */}
          <div className="space-y-5">
            <h4 className="text-xs font-bold tracking-[0.25em] text-[#111] uppercase">
              CONTACT US
            </h4>
            
            <div className="space-y-2 text-[12px] leading-relaxed text-[#555]">
              {settings.contact_phone && (
                <div className="flex flex-col">
                  <span className="font-semibold text-neutral-900">WhatsApp :</span>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-fit font-medium text-[#222] underline decoration-neutral-300 underline-offset-2 hover:text-black"
                  >
                    {settings.contact_phone}
                  </a>
                </div>
              )}

              {settings.contact_email && (
                <div className="flex flex-col">
                  <span className="font-semibold text-neutral-900">Email :</span>
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="w-fit font-medium text-[#222] underline decoration-neutral-300 underline-offset-2 hover:text-black"
                  >
                    {settings.contact_email}
                  </a>
                </div>
              )}

              {settings.contact_address && (
                <div className="flex flex-col pt-1">
                  <span className="font-semibold text-neutral-900">Office :</span>
                  <p className="text-[#555]">{settings.contact_address}</p>
                </div>
              )}

              {settings.operational_hours && (
                <div className="pt-1 text-[11px] font-medium text-[#777]">
                  {settings.operational_hours}
                </div>
              )}
            </div>

            {/* Newsletter Subscription (Visual Form) */}
            <form action="#" className="space-y-3 pt-2">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full border border-neutral-300 bg-white px-3.5 py-2.5 text-xs text-black placeholder:text-neutral-400 focus:border-black focus:outline-none"
                required
              />
              <button
                type="submit"
                className="w-full bg-black py-3 text-center text-[11px] font-bold tracking-[0.25em] text-white uppercase transition-colors hover:bg-[#222] cursor-pointer"
              >
                SUBSCRIBE
              </button>
            </form>
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-16 pt-8 text-[11px] font-semibold tracking-wider text-[#666] uppercase">
          {settings.copyright_text || "© NORTHRE.ID"}
        </div>
      </div>
    </footer>
  );
}