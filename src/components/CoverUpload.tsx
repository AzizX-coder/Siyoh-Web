'use client';
import { useRef, useState } from 'react';
import { CoverPlaceholder } from './CoverPlaceholder';
import { Icon } from './Icon';
import { tokens } from '@/lib/tokens';
import { useTheme } from './ThemeProvider';
import { useToast } from './Toast';
import { createClient, supabaseEnabled } from '@/lib/supabase/client';

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

type Props = {
  // Storage path prefix (user id, set by parent). If omitted, upload won't fire.
  userId?: string | null;
  bucket?: 'covers' | 'profile-covers';
  // Initial value (when editing).
  value?: string | null;
  // Local-only fallback when supabase isn't configured (preview only).
  fallbackSeed?: number;
  // Aspect for the preview area.
  aspect?: string;
  // Called with the public URL after a successful upload, or null when cleared.
  onChange: (url: string | null) => void;
};

export function CoverUpload({
  userId, bucket = 'covers', value, fallbackSeed = 0, aspect = '3 / 4', onChange,
}: Props) {
  const { dark } = useTheme();
  const { push } = useToast();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File) {
    if (!ACCEPTED.includes(file.type)) {
      push({ kind: 'error', title: 'Faqat JPG, PNG yoki WebP qabul qilinadi.' });
      return;
    }
    if (file.size > MAX_BYTES) {
      push({ kind: 'error', title: 'Fayl 4 MB dan kichik bo\'lsin.' });
      return;
    }
    // Show local preview instantly.
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    if (!supabaseEnabled || !userId) {
      // Demo / unauthenticated — keep the local preview and let parent know.
      onChange(localUrl);
      return;
    }

    setUploading(true);
    try {
      const sb = createClient()!;
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await sb.storage.from(bucket).upload(path, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });
      if (error) throw error;
      const { data } = sb.storage.from(bucket).getPublicUrl(path);
      setPreview(data.publicUrl);
      onChange(data.publicUrl);
      push({ kind: 'success', title: 'Muqova yuklandi' });
    } catch (e: any) {
      push({ kind: 'error', title: 'Yuklab bo\'lmadi', body: e.message });
      setPreview(value ?? null);
      onChange(value ?? null);
    } finally {
      setUploading(false);
    }
  }

  function clear() {
    setPreview(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 18, alignItems: 'flex-start' }}>
      {/* Preview area */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        style={{
          aspectRatio: aspect,
          borderRadius: 12,
          border: `1.5px dashed ${dragOver ? tokens.orange : line}`,
          background: dragOver ? 'rgba(255,87,34,0.06)' : 'transparent',
          cursor: 'pointer',
          overflow: 'hidden',
          position: 'relative',
          transition: 'all 0.2s',
        }}
      >
        {preview ? (
          // Use a plain <img> here: previewing a Blob URL or external Supabase URL
          // (we set the bucket public so no signed URL is needed).
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Cover preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0 }}>
            <CoverPlaceholder w="100%" h="100%" seed={fallbackSeed} label="Muqova" />
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 6, background: 'rgba(0,0,0,0.35)', color: '#fff',
              fontFamily: 'var(--font-geist)', fontSize: 12, fontWeight: 500,
            }}>
              <Icon.create s={20} c="#fff" />
              <span>Muqova qo&apos;shing</span>
            </div>
          </div>
        )}
        {uploading && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.45)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-geist)', fontSize: 12, fontWeight: 500,
          }}>Yuklanmoqda…</div>
        )}
      </div>

      {/* Right side: controls + helper text */}
      <div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="press"
            style={{
              height: 36, padding: '0 14px', borderRadius: 10,
              border: `1px solid ${line}`,
              background: 'transparent', color: ink, cursor: 'pointer',
              fontFamily: 'var(--font-geist)', fontSize: 13, fontWeight: 500,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            {preview ? 'Almashtirish' : 'Fayl tanlash'}
          </button>
          {preview && (
            <button
              type="button"
              onClick={clear}
              className="press"
              style={{
                height: 36, padding: '0 14px', borderRadius: 10,
                border: `1px solid ${line}`,
                background: 'transparent', color: tokens.orangeDeep, cursor: 'pointer',
                fontFamily: 'var(--font-geist)', fontSize: 13, fontWeight: 500,
              }}
            >
              O&apos;chirish
            </button>
          )}
        </div>
        <div style={{ fontFamily: 'var(--font-geist)', fontSize: 12.5, color: mute, lineHeight: 1.55 }}>
          JPG, PNG yoki WebP. 4 MB gacha. Yuklamasangiz, ranglar bilan avtomatik
          muqova chiziladi &mdash; keyinroq o&apos;zgartirishingiz mumkin.
        </div>
      </div>
    </div>
  );
}
