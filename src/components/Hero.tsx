'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

type HeroImage = {
  path: string;
  url: string;
};

type HeroSettings = {
  title: string;
  subtitle: string;
  images: HeroImage[];
};

type StoredHeroSettings = {
  title?: string;
  subtitle?: string;
  images?: { path: string }[];
};

const HERO_SETTINGS_ROW_KEY = 'hero';
const HERO_SETTINGS_BUCKET = 'hero-images';
const DEFAULT_HERO_SETTINGS: HeroSettings = {
  title: 'マッチョ計画 💪',
  subtitle: 'ラグビー選手体型を目指す 1年計画',
  images: [],
};

function getPublicHeroUrl(path: string) {
  const { data } = supabase.storage.from(HERO_SETTINGS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function normalizeHeroSettings(value: StoredHeroSettings | null | undefined): HeroSettings {
  return {
    title: value?.title ?? DEFAULT_HERO_SETTINGS.title,
    subtitle: value?.subtitle ?? DEFAULT_HERO_SETTINGS.subtitle,
    images: Array.isArray(value?.images)
      ? value.images
          .filter((image): image is { path: string } => Boolean(image?.path))
          .slice(0, 5)
          .map(image => ({ path: image.path, url: getPublicHeroUrl(image.path) }))
      : [],
  };
}

function toStoredHeroSettings(settings: HeroSettings): StoredHeroSettings {
  return {
    title: settings.title,
    subtitle: settings.subtitle,
    images: settings.images.map(image => ({ path: image.path })),
  };
}

function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('画像の読み込みに失敗しました'));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error('画像の変換に失敗しました'));
      img.onload = () => {
        const max = 1600;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('画像の変換に失敗しました'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          if (!blob) {
            reject(new Error('画像の変換に失敗しました'));
            return;
          }
          resolve(blob);
        }, 'image/jpeg', 0.82);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function createHeroImagePath() {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `hero/${id}.jpg`;
}

export default function Hero() {
  const [slideIdx, setSlideIdx] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [settings, setSettings] = useState<HeroSettings>(DEFAULT_HERO_SETTINGS);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [imageError, setImageError] = useState('');
  const [saveError, setSaveError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const images = settings.images;
  const hasImages = images.length > 0;
  const activeSlideIdx = hasImages ? Math.min(slideIdx, images.length - 1) : 0;

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 700);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', HERO_SETTINGS_ROW_KEY)
        .maybeSingle();

      if (cancelled) return;
      if (error) {
        setSaveError(`設定の読み込みに失敗しました: ${error.message}`);
      } else {
        setSettings(normalizeHeroSettings(data?.value as StoredHeroSettings | null));
      }
      setSettingsLoaded(true);
    }

    loadSettings();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!settingsLoaded) return;
    const timer = window.setTimeout(async () => {
      const { error } = await supabase
        .from('app_settings')
        .upsert(
          { key: HERO_SETTINGS_ROW_KEY, value: toStoredHeroSettings(settings), updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );

      if (error) {
        setSaveError(`設定の保存に失敗しました: ${error.message}`);
      } else {
        setSaveError('');
      }
    }, 600);
    return () => window.clearTimeout(timer);
  }, [settings, settingsLoaded]);

  const goSlide = useCallback((n: number) => {
    setSlideIdx(n);
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  const updateSettings = (patch: Partial<HeroSettings>) => {
    setSettings(prev => ({ ...prev, ...patch }));
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setImageError('');
    const remaining = 5 - images.length;
    const selected = Array.from(files).filter(file => file.type.startsWith('image/')).slice(0, remaining);
    if (selected.length === 0) {
      setImageError(images.length >= 5 ? '画像は5枚まで登録できます' : '画像ファイルを選択してください');
      return;
    }

    try {
      const uploaded = await Promise.all(selected.map(async file => {
        const resized = await resizeImage(file);
        const path = createHeroImagePath();
        const { error } = await supabase.storage
          .from(HERO_SETTINGS_BUCKET)
          .upload(path, resized, { contentType: 'image/jpeg', upsert: false });

        if (error) throw error;
        return { path, url: getPublicHeroUrl(path) };
      }));
      updateSettings({ images: [...images, ...uploaded].slice(0, 5) });
    } catch (error) {
      setImageError(error instanceof Error ? error.message : '画像の追加に失敗しました');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = async (index: number) => {
    const image = images[index];
    updateSettings({ images: images.filter((_, i) => i !== index) });
    if (image) {
      await supabase.storage.from(HERO_SETTINGS_BUCKET).remove([image.path]);
    }
  };

  const moveImage = (from: number, to: number) => {
    if (from === to) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    updateSettings({ images: next });
    setSlideIdx(to);
  };

  return (
    <div className={`hero${hasImages ? '' : ' gradient'}`}>
      {hasImages && images.map((image, i) => (
        <div key={image.path} className={`slide${i === activeSlideIdx ? ' active' : ''}`}>
          {isDesktop ? (
            <>
              <div className="slide-blur" style={{ backgroundImage: `url('${image.url}')` }} />
              <div className="slide-clear" style={{ backgroundImage: `url('${image.url}')` }} />
            </>
          ) : (
            <div className="slide-mobile" style={{ backgroundImage: `url('${image.url}')` }} />
          )}
        </div>
      ))}
      <div className="hero-overlay">
        {settings.title.trim() && <div className="hero-title">{settings.title}</div>}
        {settings.subtitle.trim() && <div className="hero-sub">{settings.subtitle}</div>}
      </div>
      <button
        type="button"
        className="hero-settings-btn"
        onClick={() => setSettingsOpen(true)}
        aria-label="設定を開く"
        style={{
          position: 'absolute',
          top: '14px',
          right: isDesktop ? 'calc(50% - 226px)' : '14px',
          zIndex: 20,
          width: '42px',
          height: '42px',
          borderRadius: 0,
          border: 'none',
          background: 'transparent',
          backdropFilter: 'none',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'none',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: '22px',
            height: '22px',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '4px',
          }}
        >
          {[0, 1, 2, 3].map(i => (
            <span
              key={i}
              style={{
                display: 'block',
                width: '9px',
                height: '9px',
                border: '2px solid #fff',
                borderRadius: '2px',
                background: 'transparent',
                boxShadow: '0 1px 2px rgba(0,0,0,.28)',
              }}
            />
          ))}
        </span>
      </button>
      {images.length > 1 && (
        <div className="slide-dots">
          {images.map((_, i) => (
            <div
              key={i}
              className={`dot${i === activeSlideIdx ? ' active' : ''}`}
              onClick={() => goSlide(i)}
            />
          ))}
        </div>
      )}

      {settingsOpen && (
        <div className="settings-modal-backdrop" onClick={() => setSettingsOpen(false)}>
          <div className="settings-modal" onClick={e => e.stopPropagation()}>
            <div className="settings-header">
              <div>
                <div className="settings-title">メインビジュアル設定</div>
                <div className="settings-sub">タイトルと画像を編集</div>
              </div>
              <button className="settings-close" onClick={() => setSettingsOpen(false)}>×</button>
            </div>
            {saveError && <div className="settings-error">{saveError}</div>}

            <div className="input-group" style={{ marginBottom: '10px' }}>
              <label>タイトル</label>
              <input
                type="text"
                value={settings.title}
                onChange={e => updateSettings({ title: e.target.value })}
                placeholder="未入力なら非表示"
              />
            </div>
            <div className="input-group" style={{ marginBottom: '14px' }}>
              <label>サブタイトル</label>
              <input
                type="text"
                value={settings.subtitle}
                onChange={e => updateSettings({ subtitle: e.target.value })}
                placeholder="未入力なら非表示"
              />
            </div>

            <div className="settings-image-head">
              <div>
                <div className="settings-section-label">メイン画像</div>
                <div className="settings-help">最大5枚。ドラッグで順番変更できます。</div>
              </div>
              <button
                className="settings-add-image"
                onClick={() => fileInputRef.current?.click()}
                disabled={images.length >= 5}
              >
                追加
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={e => handleFiles(e.target.files)}
              />
            </div>
            {imageError && <div className="settings-error">{imageError}</div>}

            <div className="settings-image-list">
              {images.map((image, i) => (
                <div
                  key={image.path}
                  className="settings-image-item"
                  draggable
                  onDragStart={() => setDragIndex(i)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => {
                    if (dragIndex != null) moveImage(dragIndex, i);
                    setDragIndex(null);
                  }}
                  onDragEnd={() => setDragIndex(null)}
                >
                  <div className="settings-image-thumb" style={{ backgroundImage: `url('${image.url}')` }} />
                  <div className="settings-image-meta">
                    <div className="settings-image-name">画像 {i + 1}</div>
                    <div className="settings-help">ドラッグして並び替え</div>
                  </div>
                  <button className="settings-remove-image" onClick={() => removeImage(i)}>削除</button>
                </div>
              ))}
              {images.length === 0 && (
                <div className="settings-empty-image">
                  画像未登録時は青から緑のグラデーションを表示します。
                </div>
              )}
            </div>

            <div className="settings-footer">
              <button
                className="settings-reset"
                onClick={async () => {
                  const paths = settings.images.map(image => image.path);
                  setSettings(DEFAULT_HERO_SETTINGS);
                  if (paths.length > 0) {
                    await supabase.storage.from(HERO_SETTINGS_BUCKET).remove(paths);
                  }
                }}
              >
                初期化
              </button>
              <button className="settings-save" onClick={() => setSettingsOpen(false)}>完了</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
