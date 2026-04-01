"use client";

export function Footer() {
  return (
    <footer className="bg-footer-bg text-footer-text no-print hidden lg:block">
      {/* Gov links */}
      <div className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-white/60">
          <a href="https://mincult.gov.ua" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            Мінкульт
          </a>
          <a href="https://zakon.rada.gov.ua" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            Законодавство України
          </a>
          <a href="https://www.iccrom.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            ICCROM
          </a>
          <a href="https://thedigital.gov.ua" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            Мінцифри
          </a>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4">
              Про систему
            </h3>
            <p className="text-sm text-white/70 leading-relaxed">
              MuseumAID — AI-система підтримки рішень для евакуації музейних
              предметів. Базується на нормативній базі України та міжнародних
              стандартах ICCROM.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4">
              Нормативна база
            </h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <a href="https://zakon.rada.gov.ua/laws/show/229-2026-%D0%BF" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  КМУ №229 від 18.02.2026
                </a>
              </li>
              <li>
                <a href="https://zakon.rada.gov.ua/laws/show/249/95-%D0%B2%D1%80" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  ЗУ &laquo;Про музеї та музейну справу&raquo;
                </a>
              </li>
              <li>МКІП №424 від 11.08.2023</li>
              <li>ICCROM First Aid to Cultural Heritage</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4">
              Контакти
            </h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>Мінкульт: +380 44 234 20 53</li>
              <li>
                <a href="mailto:info@mincult.gov.ua" className="hover:text-white transition-colors">
                  info@mincult.gov.ua
                </a>
              </li>
              <li className="text-xs text-white/40 pt-2">
                Останнє оновлення: 01.04.2026
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 text-xs text-white/40 text-center">
          &copy; 2026 MuseumAID &mdash; Інформація має довідковий характер та не
          замінює чинні нормативно-правові акти
        </div>
      </div>
    </footer>
  );
}
