'use client';
import Link from 'next/link';
import { SiyohLogo } from '@/components/Logo';
import { Avatar } from '@/components/Avatar';
import { CoverPlaceholder } from '@/components/CoverPlaceholder';
import { Icon } from '@/components/Icon';
import { Reveal } from '@/components/Reveal';
import { Illust } from '@/components/Illustrations';
import { tokens } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import type { Story, Profile } from '@/lib/types';

export function LandingPage({ stories, writers }: { stories: Story[]; writers: Profile[] }) {
  const { dark, toggle } = useTheme();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;

  const features = [
    { title: 'O‘qish', body: 'Esselar, hikoyalar va sekin jurnalistika.', illust: Illust.reading, ic: <Icon.text s={20} c="#fff" /> },
    { title: 'Tinglash', body: 'Audio yozuvlar, ovozli hikoyalar.', illust: Illust.listening, ic: <Icon.headphones s={20} c="#fff" /> },
    { title: 'Yozish', body: 'Sodda kompozitor. Bir bosishda nashr.', illust: Illust.writing, ic: <Icon.create s={20} c="#fff" /> },
  ];

  const steps = [
    { n: '01', title: 'Bepul ro‘yxatdan o‘ting', body: 'Hammasini o‘qing. Pulli devor yo‘q.' },
    { n: '02', title: 'Ovozlaringizni kuzating', body: 'O‘zingiz tanlagan yozuvchilardan tinch lenta.' },
    { n: '03', title: 'O‘zingiznikini chop eting', body: 'Yozing yoki yozib oling. Qolganini biz qilamiz.' },
  ];

  return (
    <div className="app-bg" style={{ position: 'relative' }}>
      {/* Subtle ambient blobs (lighter) */}
      <div className="anim-float-slow" style={{
        position: 'fixed', top: -200, right: -160, width: 480, height: 480,
        borderRadius: '50%', background: dark ? 'rgba(255,87,34,0.10)' : 'rgba(255,138,76,0.14)',
        filter: 'blur(120px)', pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: dark ? 'rgba(20,17,16,0.85)' : 'rgba(253,251,247,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${line}`,
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '14px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Link href="/" style={{ textDecoration: 'none' }}><SiyohLogo size={26} dark={dark} /></Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {[
              { label: 'Imkoniyatlar', href: '#features' },
              { label: 'Qanday ishlaydi', href: '#how' },
              { label: 'Hikoyalar', href: '/feed' },
            ].map(l => (
              <a key={l.label} href={l.href} style={{
                padding: '8px 14px', borderRadius: 999, color: ink,
                fontFamily: 'var(--font-geist)', fontSize: 14, fontWeight: 500,
                textDecoration: 'none',
              }}>{l.label}</a>
            ))}
            <button onClick={toggle} aria-label="Mavzu" className="press" style={{
              width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
              background: dark ? 'rgba(255,237,213,0.06)' : 'rgba(26,22,19,0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 6,
            }}>{dark ? <Icon.sun s={16} c={ink} /> : <Icon.moon s={16} c={ink} />}</button>
            <Link href="/auth/login" className="press" style={{
              marginLeft: 6, padding: '10px 16px', borderRadius: 10,
              background: 'transparent', color: ink,
              fontFamily: 'var(--font-geist)', fontSize: 14, fontWeight: 500,
              textDecoration: 'none',
            }}>Kirish</Link>
            <Link href="/auth/signup" className="press" style={{
              marginLeft: 4, padding: '10px 18px', borderRadius: 10,
              background: tokens.orangeGrad, color: '#fff',
              fontFamily: 'var(--font-geist)', fontSize: 14, fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 6px 16px rgba(255,87,34,0.25)',
            }}>Boshlash</Link>
          </nav>
        </div>
      </header>

      {/* Hero — simple, illustrated, clean */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '72px 32px 56px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 56, alignItems: 'center' }}>
          <div>
            <div className="anim-fade-up" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 12px', borderRadius: 999,
              background: dark ? 'rgba(255,87,34,0.14)' : 'rgba(255,87,34,0.10)',
              color: tokens.orangeDeep,
              fontFamily: 'var(--font-geist)', fontSize: 12, fontWeight: 600,
              marginBottom: 22,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: tokens.orange }} className="anim-pulse-ring" />
              Hozir beta
            </div>
            <h1 className="anim-fade-up delay-100" style={{
              fontFamily: 'var(--font-geist)', fontSize: 64, fontWeight: 700,
              letterSpacing: -1.6, lineHeight: 1.05, margin: '0 0 18px', color: ink,
            }}>
              <span className="word-rotator" style={{ minWidth: '4ch' }}>
                <span>Sekin</span>
                <span>Halol</span>
                <span>Sokin</span>
                <span>Chuqur</span>
              </span>{' '}
              <span className="grad-text">o&apos;qish</span>.<br/>
              Hayotni yozing.<span className="cursor" style={{ color: tokens.orange, fontWeight: 400 }}>|</span>
            </h1>
            <p className="anim-fade-up delay-200" style={{
              fontFamily: 'var(--font-geist)', fontSize: 18, color: mute,
              lineHeight: 1.55, maxWidth: 480, margin: '0 0 30px', fontWeight: 400,
            }}>
              Siyoh — yozuvchilar va kitobxonlar uchun zamonaviy ijodiy maydon.
              Uzun esselar, ovozli hikoyalar, va tinch lenta. Bepul, abadiy.
            </p>
            <div className="anim-fade-up delay-300" style={{ display: 'flex', gap: 10, marginBottom: 30 }}>
              <Link href="/auth/signup" className="press" style={{
                height: 50, padding: '0 24px', borderRadius: 12,
                background: tokens.orangeGrad, color: '#fff',
                fontFamily: 'var(--font-geist)', fontSize: 15, fontWeight: 600,
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
                boxShadow: '0 10px 24px rgba(255,87,34,0.3)',
              }}>
                Bepul boshlash <Icon.chev s={16} c="#fff" />
              </Link>
              <Link href="/feed" className="press" style={{
                height: 50, padding: '0 22px', borderRadius: 12,
                background: 'transparent', color: ink,
                border: `1px solid ${line}`,
                fontFamily: 'var(--font-geist)', fontSize: 15, fontWeight: 500,
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
              }}>
                Hikoyalar lentasi
              </Link>
            </div>
            <div className="anim-fade-up delay-400" style={{
              fontFamily: 'var(--font-geist)', fontSize: 13, color: mute,
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              <Icon.check s={14} c={tokens.orange} /> Reklama yo&apos;q
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: mute }} />
              <Icon.check s={14} c={tokens.orange} /> Pulli devor yo&apos;q
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: mute }} />
              <Icon.check s={14} c={tokens.orange} /> Cheksiz lenta yo&apos;q
            </div>
          </div>

          <div className="anim-scale-in delay-200" style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <div className="anim-float-illustration" style={{ width: '100%', maxWidth: 480 }}>
              <Illust.heroScene size={460} />
            </div>
            {/* floating badges */}
            <div className="anim-drift" style={{
              position: 'absolute', top: 12, right: 8, padding: '8px 12px',
              borderRadius: 999, background: '#fff',
              border: `1px solid ${line}`,
              fontFamily: 'var(--font-geist)', fontSize: 12, fontWeight: 600, color: ink,
              display: 'inline-flex', alignItems: 'center', gap: 6,
              boxShadow: '0 8px 20px rgba(26,22,19,0.06)',
            }}>
              <Icon.heart s={14} c={tokens.orange} filled /> +12
            </div>
            <div className="anim-drift" style={{
              animationDelay: '1s',
              position: 'absolute', bottom: 36, left: 0, padding: '8px 12px',
              borderRadius: 999, background: '#fff',
              border: `1px solid ${line}`,
              fontFamily: 'var(--font-geist)', fontSize: 12, fontWeight: 600, color: ink,
              display: 'inline-flex', alignItems: 'center', gap: 6,
              boxShadow: '0 8px 20px rgba(26,22,19,0.06)',
            }}>
              <Icon.bookmark s={14} c={tokens.orangeDeep} filled /> Saqlandi
            </div>
          </div>
        </div>
      </section>

      {/* Stat strip (illustrative, friendly) */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '0 32px 64px' }}>
        <Reveal>
          <div className="card" style={{
            padding: '24px 28px',
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, textAlign: 'center',
          }}>
            {[
              { n: 'Bepul', l: 'Abadiy' },
              { n: '0', l: 'Reklama' },
              { n: 'O‘zbek', l: 'Hamjamiyat' },
              { n: 'Ochiq', l: 'Manba ruhida' },
            ].map(s => (
              <div key={s.l}>
                <div style={{ fontFamily: 'var(--font-geist)', fontSize: 28, fontWeight: 700, color: ink,
                  letterSpacing: -0.5 }}>{s.n}</div>
                <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute, marginTop: 2,
                  letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 600 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Features — illustrated */}
      <section id="features" style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '40px 32px 80px' }}>
        <Reveal>
          <h2 style={{
            fontFamily: 'var(--font-geist)', fontSize: 40, fontWeight: 700, color: ink,
            letterSpacing: -1, margin: '0 0 14px', maxWidth: 640, lineHeight: 1.1,
          }}>
            Bir platforma. <span className="grad-text">Uchta marosim.</span>
          </h2>
          <p style={{
            fontFamily: 'var(--font-geist)', fontSize: 16, color: mute,
            maxWidth: 540, margin: '0 0 40px', lineHeight: 1.55,
          }}>O&apos;qing, yozing, tinglang &mdash; hammasi bitta sokin uyda.</p>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 100}>
              <div className="card" style={{ padding: 24, height: '100%' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: tokens.orangeGrad,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 6px 14px rgba(255,87,34,0.28)',
                  marginBottom: 18,
                }}>{f.ic}</div>
                <h3 style={{ fontFamily: 'var(--font-geist)', fontSize: 22, fontWeight: 600,
                  color: ink, letterSpacing: -0.4, margin: '0 0 8px' }}>{f.title}</h3>
                <p style={{ fontFamily: 'var(--font-geist)', fontSize: 14, color: mute,
                  lineHeight: 1.6, margin: '0 0 18px' }}>{f.body}</p>
                <div style={{ display: 'flex', justifyContent: 'center', opacity: 0.95 }}>
                  <f.illust size={180} />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Values band */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '20px 32px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {[
            { ic: <Icon.shield s={18} c={tokens.orangeDeep} />, t: 'Xavfsiz', b: 'Ma\'lumotlaringiz himoyada.' },
            { ic: <Icon.create s={18} c={tokens.orangeDeep} />, t: 'Ochiq', b: 'Hamma uchun bepul.' },
            { ic: <Icon.heart s={18} c={tokens.orangeDeep} />, t: 'Mehrli', b: 'O\'zbek hamjamiyat.' },
            { ic: <Icon.bookmark s={18} c={tokens.orangeDeep} />, t: 'Sodda', b: 'Reklama yo\'q. Hech qachon.' },
          ].map((v, i) => (
            <Reveal key={v.t} delay={i * 80}>
              <div className="card" style={{ padding: 18, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(255,87,34,0.10)', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{v.ic}</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-geist)', fontSize: 14, color: ink, fontWeight: 600 }}>{v.t}</div>
                  <div style={{ fontFamily: 'var(--font-geist)', fontSize: 12.5, color: mute, marginTop: 2 }}>{v.b}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works — clean */}
      <section id="how" style={{ position: 'relative', zIndex: 1, padding: '80px 32px',
        background: dark ? 'rgba(255,237,213,0.02)' : 'rgba(26,22,19,0.02)',
        borderTop: `1px solid ${line}`, borderBottom: `1px solid ${line}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Reveal>
            <h2 style={{
              fontFamily: 'var(--font-geist)', fontSize: 36, fontWeight: 700, color: ink,
              letterSpacing: -0.9, margin: '0 0 40px', maxWidth: 540, lineHeight: 1.1,
            }}>Uch qadam. <span style={{ color: mute }}>Ko&apos;rsatma kerak emas.</span></h2>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 120}>
                <div style={{ padding: '0 4px' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: dark ? 'rgba(255,87,34,0.15)' : 'rgba(255,87,34,0.10)',
                    color: tokens.orangeDeep,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-geist)', fontSize: 16, fontWeight: 700,
                    marginBottom: 16,
                  }}>{s.n}</div>
                  <h3 style={{ fontFamily: 'var(--font-geist)', fontSize: 20, fontWeight: 600,
                    color: ink, letterSpacing: -0.3, margin: '0 0 8px' }}>{s.title}</h3>
                  <p style={{ fontFamily: 'var(--font-geist)', fontSize: 14, color: mute,
                    lineHeight: 1.6, margin: 0 }}>{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Writers / stories preview — only if Supabase has data */}
      {writers.length > 0 && (
        <section style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '80px 32px 0' }}>
          <Reveal>
            <h2 style={{
              fontFamily: 'var(--font-geist)', fontSize: 32, fontWeight: 700, color: ink,
              letterSpacing: -0.7, margin: '0 0 28px',
            }}>Yozuvchilar</h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {writers.slice(0, 4).map((w, i) => (
              <Reveal key={w.username} delay={i * 80}>
                <Link href={`/profile/${w.username}`} className="card hover-lift" style={{
                  padding: 20, textAlign: 'center', textDecoration: 'none', display: 'block',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Avatar name={w.display_name[0]} size={56} seed={w.avatar_seed} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-geist)', fontSize: 15, color: ink,
                    fontWeight: 600, marginTop: 12 }}>{w.display_name}</div>
                  <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11.5, color: mute, marginTop: 2 }}>
                    @{w.username}
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {stories.length > 0 && (
        <section style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '60px 32px 80px' }}>
          <Reveal style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 style={{
              fontFamily: 'var(--font-geist)', fontSize: 32, fontWeight: 700, color: ink,
              letterSpacing: -0.7, margin: 0,
            }}>Yangi hikoyalar</h2>
            <Link href="/feed" style={{ color: tokens.orange, fontFamily: 'var(--font-geist)',
              fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>To&apos;liq lentaga &rarr;</Link>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            {stories.slice(0, 6).map((s, i) => (
              <Reveal key={s.id} delay={(i % 3) * 80}>
                <Link href={`/story/${s.slug}`} className="card hover-lift" style={{
                  textDecoration: 'none', color: 'inherit', display: 'block', padding: 16,
                }}>
                  <div style={{ position: 'relative' }}>
                    <CoverPlaceholder w="100%" h={200} seed={s.cover_seed}
                      label={s.title.split(' ').slice(0, 3).join(' ')} />
                    {s.type === 'audio' && (
                      <div style={{
                        position: 'absolute', top: 10, right: 10, width: 32, height: 32,
                        borderRadius: '50%', background: 'rgba(255,255,255,0.95)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}><Icon.headphones s={14} c={tokens.orangeDeep} /></div>
                    )}
                  </div>
                  <div style={{ fontFamily: 'var(--font-geist)', fontSize: 17,
                    fontWeight: 600, color: ink, marginTop: 14, letterSpacing: -0.2,
                    lineHeight: 1.25 }}>{s.title}</div>
                  <div style={{ fontFamily: 'var(--font-geist)', fontSize: 12.5,
                    color: mute, marginTop: 6 }}>{s.author?.display_name} &middot; {s.mins} daqiqa</div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* CTA — simple, friendly */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '40px 32px 80px' }}>
        <Reveal>
          <div style={{
            borderRadius: 24, padding: '48px 40px',
            background: tokens.orangeGrad, color: '#fff',
            boxShadow: '0 24px 60px rgba(255,87,34,0.3)',
            display: 'grid', gridTemplateColumns: '1fr auto', gap: 28, alignItems: 'center',
          }}>
            <div>
              <h2 style={{
                fontFamily: 'var(--font-geist)', fontSize: 36, fontWeight: 700,
                letterSpacing: -0.9, lineHeight: 1.1, margin: '0 0 10px',
              }}>Bugun bittasini yozing.</h2>
              <p style={{
                fontFamily: 'var(--font-geist)', fontSize: 16, opacity: 0.92,
                margin: 0, fontWeight: 400,
              }}>Bepul. Reklama yo&apos;q. Faqat sizning so&apos;zlaringiz.</p>
            </div>
            <Link href="/auth/signup" className="press" style={{
              height: 52, padding: '0 26px', borderRadius: 12,
              background: '#fff', color: tokens.orangeDeep,
              fontFamily: 'var(--font-geist)', fontSize: 15, fontWeight: 700,
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
              whiteSpace: 'nowrap',
              boxShadow: '0 10px 24px rgba(0,0,0,0.18)',
            }}>Hisob yarating <Icon.chev s={16} c={tokens.orangeDeep} /></Link>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: `1px solid ${line}`,
        padding: '32px 32px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid',
          gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 32 }}>
          <div>
            <SiyohLogo size={24} dark={dark} />
            <p style={{ fontFamily: 'var(--font-geist)', fontSize: 13, color: mute,
              lineHeight: 1.55, marginTop: 12, maxWidth: 280 }}>
              Yozuvchilar va kitobxonlar uchun zamonaviy ijodiy maydon.
            </p>
          </div>
          {[
            { h: 'O‘qish', items: [['Lenta', '/feed'], ['Kashf etish', '/explore'], ['Kitoblar', '/books']] as const },
            { h: 'Yozish', items: [['Kompozitor', '/create']] as const },
            { h: 'Hisob', items: [['Kirish', '/auth/login'], ['Ro‘yxatdan o‘tish', '/auth/signup'], ['Sozlamalar', '/settings']] as const },
          ].map(c => (
            <div key={c.h}>
              <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute,
                letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 700,
                marginBottom: 10 }}>{c.h}</div>
              {c.items.map(([label, href]) => (
                <Link key={label} href={href} style={{
                  display: 'block', padding: '4px 0',
                  fontFamily: 'var(--font-geist)', fontSize: 13.5, color: ink,
                  textDecoration: 'none',
                }}>{label}</Link>
              ))}
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 1200, margin: '32px auto 0', paddingTop: 18,
          borderTop: `1px solid ${line}`,
          display: 'flex', justifyContent: 'space-between',
          fontFamily: 'var(--font-geist)', fontSize: 12, color: mute }}>
          <span>&copy; {new Date().getFullYear()} Siyoh.</span>
          <span>Sekinlashishga arziydigan hikoyalar.</span>
        </div>
      </footer>
    </div>
  );
}
