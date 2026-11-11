import { Facebook, Instagram, MessageCircle } from 'lucide-react'
import { contactInfo } from '@/lib/contact'

const socialLinks = [
  {
    href: 'https://www.instagram.com/etec.jales?exln=MXM5aWNxbHNrcDNwZw==',
    label: 'Instagram da ETEC Jales',
    Icon: Instagram,
    text: 'Instagram',
  },
  {
    href: 'https://www.facebook.com/share/1CGQstyeg5/',
    label: 'Facebook da ETEC Jales',
    Icon: Facebook,
    text: 'Facebook',
  },
  {
    href: contactInfo.whatsappHref,
    label: `Telefone/WhatsApp da ETEC Jales: ${contactInfo.phone}`,
    Icon: MessageCircle,
    text: contactInfo.phone,
  },
]

export default function Footer() {
  return (
    <footer className="mt-auto w-full bg-horta-dark text-white">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-5 px-4 py-7 text-center sm:px-6 sm:py-8 md:grid-cols-[1fr_auto] md:text-left lg:px-8">
        <div>
          <p className="text-sm font-semibold">
            FeiraEtec - Produtos da Unidade Rural - ETEC Jales
          </p>
          <p className="mt-1 text-xs text-white/60">
            © 2026 FeiraEtec - ETEC Jales. Todos os direitos reservados.
          </p>
        </div>

        <nav
          aria-label="Redes sociais e contato da ETEC Jales"
          className="flex flex-col items-center justify-center gap-3 md:flex-row md:justify-self-end"
        >
          {socialLinks.map(({ href, label, Icon, text }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex min-h-9 items-center justify-center gap-2 rounded-full bg-white/10 px-3 text-sm transition-colors hover:bg-white/20"
            >
              <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span>{text}</span>
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
