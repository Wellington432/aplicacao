import { Mail, MapPin, Phone } from 'lucide-react'
import AppShell from '@/components/AppShell'
import StaticPageHero from '@/components/StaticPageHero'
import { contactInfo } from '@/lib/contact'

const CONTACTS = [
  { icon: MapPin, label: contactInfo.address },
  { icon: Phone, label: contactInfo.phone, href: contactInfo.phoneHref },
  { icon: Mail, label: contactInfo.email, href: contactInfo.emailHref },
]

export default function ContatoPage() {
  return (
    <AppShell>
      <StaticPageHero icon={Phone} title="Contato">
        {CONTACTS.map(({ icon: Icon, label, href }) => (
          <div key={label} className="flex items-center gap-3 text-sm text-ink-600">
            <div className="w-9 h-9 rounded-full bg-horta-medium/10 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-horta-medium" />
            </div>
            {href ? <a href={href}>{label}</a> : label}
          </div>
        ))}
      </StaticPageHero>
    </AppShell>
  )
}
