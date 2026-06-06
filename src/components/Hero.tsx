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
  galleryImagePaths: string[];
};

type StoredHeroSettings = {
  title?: string;
  subtitle?: string;
  images?: { path: string }[];
  galleryImagePaths?: string[];
};

type DragTarget = {
  type: 'library' | 'gallery';
  index: number;
} | null;

const HERO_SETTINGS_ROW_KEY = 'hero';
const HERO_SETTINGS_BUCKET = 'hero-images';
const DEFAULT_HERO_SETTINGS: HeroSettings = {
  title: 'マッチョ計画 💪',
  subtitle: 'ラグビー選手体型を目指す 1年計画',
  images: [],
  galleryImagePaths: [],
};

function getPublicHeroUrl(path: string) {
  const { data } = supabase.storage.from(HERO_SETTINGS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function normalizeHeroSettings(value: StoredHeroSettings | null | undefined): HeroSettings {
  const images = Array.isArray(value?.images)
    ? value.images
        .filter((image): image is { path: string } => Boolean(image?.path))
        .slice(0, 10)
        .map(image => ({ path: image.path, url: getPublicHeroUrl(image.path) }))
    : [];
  const imagePaths = new Set(images.map(image => image.path));
  const galleryImagePaths = Array.isArray(value?.galleryImagePaths)
    ? value.galleryImagePaths.filter(path => imagePaths.has(path)).slice(0, 3)
    : images.slice(0, 3).map(image => image.path);

  return {
    title: value?.title ?? DEFAULT_HERO_SETTINGS.title,
    subtitle: value?.subtitle ?? DEFAULT_HERO_SETTINGS.subtitle,
    images,
    galleryImagePaths,
  };
}

function toStoredHeroSettings(settings: HeroSettings): StoredHeroSettings {
  const imagePaths = new Set(settings.images.map(image => image.path));
  return {
    title: settings.title,
    subtitle: settings.subtitle,
    images: settings.images.map(image => ({ path: image.path })),
    galleryImagePaths: settings.galleryImagePaths.filter(path => imagePaths.has(path)).slice(0, 3),
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
  const [dragTarget, setDragTarget] = useState<DragTarget>(null);
  const [imageError, setImageError] = useState('');
  const [saveError, setSaveError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const images = settings.images;
  const imageMap = new Map(images.map(image => [image.path, image]));
  const galleryImages = settings.galleryImagePaths
    .map(path => imageMap.get(path))
    .filter((image): image is HeroImage => Boolean(image));
  const galleryPathSet = new Set(settings.galleryImagePaths);
  const hasImages = galleryImages.length > 0;
  const activeSlideIdx = hasImages ? Math.min(slideIdx, galleryImages.length - 1) : 0;

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
    if (galleryImages.length <= 1) return;
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % galleryImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [galleryImages.length]);

  const updateSettings = (patch: Partial<HeroSettings>) => {
    setSettings(prev => ({ ...prev, ...patch }));
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setImageError('');
    const remaining = 10 - images.length;
    const selected = Array.from(files).filter(file => file.type.startsWith('image/')).slice(0, remaining);
    if (selected.length === 0) {
      setImageError(images.length >= 10 ? '画像は10枚まで登録できます' : '画像ファイルを選択してください');
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
      const nextImages = [...images, ...uploaded].slice(0, 10);
      const nextGalleryPaths = images.length === 0 && settings.galleryImagePaths.length === 0
        ? nextImages.slice(0, 3).map(image => image.path)
        : settings.galleryImagePaths;
      updateSettings({ images: nextImages, galleryImagePaths: nextGalleryPaths });
    } catch (error) {
      setImageError(error instanceof Error ? error.message : '画像の追加に失敗しました');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = async (index: number) => {
    const image = images[index];
    updateSettings({
      images: images.filter((_, i) => i !== index),
      galleryImagePaths: image
        ? settings.galleryImagePaths.filter(path => path !== image.path)
        : settings.galleryImagePaths,
    });
    if (image) {
      await supabase.storage.from(HERO_SETTINGS_BUCKET).remove([image.path]);
    }
  };

  const confirmRemoveImage = (index: number) => {
    if (!window.confirm('この画像を消して良いですか？')) return;
    removeImage(index);
  };

  const moveImage = (from: number, to: number) => {
    if (from === to) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    updateSettings({ images: next });
  };

  const moveGalleryImage = (from: number, to: number) => {
    if (from === to) return;
    const next = [...settings.galleryImagePaths];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    updateSettings({ galleryImagePaths: next.slice(0, 3) });
    setSlideIdx(to);
  };

  const addGalleryImage = (path: string) => {
    if (galleryPathSet.has(path)) return;
    if (settings.galleryImagePaths.length >= 3) {
      setImageError('メインギャラリーに設定できる画像は3枚までです');
      return;
    }
    setImageError('');
    updateSettings({ galleryImagePaths: [...settings.galleryImagePaths, path] });
  };

  const toggleGalleryImage = (path: string) => {
    if (galleryPathSet.has(path)) {
      removeGalleryImage(path);
      return;
    }
    addGalleryImage(path);
  };

  const removeGalleryImage = (path: string) => {
    const nextPaths = settings.galleryImagePaths.filter(item => item !== path);
    updateSettings({ galleryImagePaths: nextPaths });
    setSlideIdx(prev => Math.min(prev, Math.max(nextPaths.length - 1, 0)));
  };

  return (
    <div className={`hero${hasImages ? '' : ' gradient'}`}>
      {hasImages && galleryImages.map((image, i) => (
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
      {galleryImages.length > 1 && (
        <div className="slide-dots">
          {galleryImages.map((_, i) => (
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
                <div className="settings-sub">タイトルと表示画像を編集</div>
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
                <div className="settings-section-label">メインギャラリー</div>
                <div className="settings-help">表示する画像を3枚まで選択。ドラッグで順番変更できます。</div>
              </div>
            </div>

            <div
              className="settings-gallery-grid"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}
            >
              {[0, 1, 2].map((slot) => {
                const image = galleryImages[slot];
                const canMovePrev = Boolean(image) && slot > 0;
                const canMoveNext = Boolean(image) && slot < galleryImages.length - 1;
                return (
                  <div
                    key={image?.path ?? `slot-${slot}`}
                    className={`settings-gallery-slot${image ? ' filled' : ''}`}
                    style={{
                      position: 'relative',
                      aspectRatio: '1.25',
                      borderRadius: 12,
                      border: image ? '2px solid #2563eb' : '1.5px dashed #cbd5e1',
                      background: image ? '#eff6ff' : '#f8fafc',
                      overflow: 'hidden',
                      cursor: image ? 'grab' : 'default',
                      boxShadow: image ? '0 8px 18px rgba(37,99,235,.12)' : 'none',
                    }}
                    draggable={Boolean(image)}
                    onDragStart={() => image && setDragTarget({ type: 'gallery', index: slot })}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => {
                      if (dragTarget?.type === 'gallery') moveGalleryImage(dragTarget.index, slot);
                      setDragTarget(null);
                    }}
                    onDragEnd={() => setDragTarget(null)}
                  >
                    <span
                      className="settings-rank-badge"
                      style={{
                        position: 'absolute',
                        top: 6,
                        left: 6,
                        zIndex: 2,
                        width: 22,
                        height: 22,
                        borderRadius: 999,
                        background: 'linear-gradient(135deg,#2563eb,#0ea5e9)',
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(15,23,42,.22)',
                      }}
                    >
                      {slot + 1}
                    </span>
                    {image ? (
                      <>
                        <div
                          className="settings-gallery-photo"
                          style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: `url('${image.url}')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                        <div
                          className="settings-gallery-controls"
                          style={{
                            position: 'absolute',
                            right: 6,
                            bottom: 6,
                            zIndex: 3,
                            display: 'flex',
                            gap: 4,
                          }}
                        >
                          <button
                            type="button"
                            className="settings-gallery-move"
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 999,
                              border: 'none',
                              background: canMovePrev ? 'rgba(15,23,42,.68)' : 'rgba(148,163,184,.45)',
                              color: '#fff',
                              fontSize: 14,
                              fontWeight: 900,
                              lineHeight: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: canMovePrev ? 'pointer' : 'not-allowed',
                              boxShadow: '0 4px 10px rgba(15,23,42,.22)',
                            }}
                            disabled={!canMovePrev}
                            aria-label={`${slot + 1}番目の画像を左へ移動`}
                            onClick={e => {
                              e.stopPropagation();
                              if (canMovePrev) moveGalleryImage(slot, slot - 1);
                            }}
                          >
                            ‹
                          </button>
                          <button
                            type="button"
                            className="settings-gallery-move"
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 999,
                              border: 'none',
                              background: canMoveNext ? 'rgba(15,23,42,.68)' : 'rgba(148,163,184,.45)',
                              color: '#fff',
                              fontSize: 14,
                              fontWeight: 900,
                              lineHeight: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: canMoveNext ? 'pointer' : 'not-allowed',
                              boxShadow: '0 4px 10px rgba(15,23,42,.22)',
                            }}
                            disabled={!canMoveNext}
                            aria-label={`${slot + 1}番目の画像を右へ移動`}
                            onClick={e => {
                              e.stopPropagation();
                              if (canMoveNext) moveGalleryImage(slot, slot + 1);
                            }}
                          >
                            ›
                          </button>
                        </div>
                      </>
                    ) : (
                      <div
                        className="settings-gallery-empty"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#94a3b8',
                          fontSize: 11,
                          fontWeight: 800,
                        }}
                      >
                        未選択
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="settings-image-head">
              <div>
                <div className="settings-section-label">登録画像</div>
                <div className="settings-help">最大10枚。画像をタップで表示/解除できます。</div>
              </div>
              <button
                className="settings-add-image"
                onClick={() => fileInputRef.current?.click()}
                disabled={images.length >= 10}
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

            <div
              className="settings-image-grid"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}
            >
              {images.map((image, i) => {
                const galleryIndex = settings.galleryImagePaths.indexOf(image.path);
                const isSelected = galleryIndex >= 0;
                return (
                  <div
                    key={image.path}
                    role="button"
                    tabIndex={0}
                    className={`settings-library-tile${isSelected ? ' selected' : ''}`}
                    style={{
                      position: 'relative',
                      aspectRatio: '1',
                      border: 'none',
                      borderRadius: 12,
                      background: '#f1f5f9',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      padding: 0,
                      boxShadow: isSelected ? 'inset 0 0 0 2px #2563eb' : 'inset 0 0 0 1px #e2e8f0',
                    }}
                    draggable
                    onClick={() => toggleGalleryImage(image.path)}
                    onKeyDown={e => {
                      if (e.key !== 'Enter' && e.key !== ' ') return;
                      e.preventDefault();
                      toggleGalleryImage(image.path);
                    }}
                    onDragStart={() => setDragTarget({ type: 'library', index: i })}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => {
                      if (dragTarget?.type === 'library') moveImage(dragTarget.index, i);
                      setDragTarget(null);
                    }}
                    onDragEnd={() => setDragTarget(null)}
                    aria-label={`画像 ${i + 1}`}
                  >
                    <span
                      className="settings-library-photo"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url('${image.url}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    {isSelected && (
                      <span
                        className="settings-rank-badge"
                        style={{
                          position: 'absolute',
                          top: 6,
                          left: 6,
                          zIndex: 2,
                          width: 22,
                          height: 22,
                          borderRadius: 999,
                          background: 'linear-gradient(135deg,#2563eb,#0ea5e9)',
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: 900,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 10px rgba(15,23,42,.22)',
                        }}
                      >
                        {galleryIndex + 1}
                      </span>
                    )}
                    <span
                      className="settings-library-delete"
                      style={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        zIndex: 3,
                        width: 22,
                        height: 22,
                        borderRadius: 999,
                        background: 'rgba(15,23,42,.62)',
                        color: '#fff',
                        fontSize: 16,
                        fontWeight: 800,
                        lineHeight: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(15,23,42,.24)',
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label="画像を削除"
                      onClick={e => {
                        e.stopPropagation();
                        confirmRemoveImage(i);
                      }}
                      onKeyDown={e => {
                        if (e.key !== 'Enter' && e.key !== ' ') return;
                        e.preventDefault();
                        e.stopPropagation();
                        confirmRemoveImage(i);
                      }}
                    >
                      ×
                    </span>
                  </div>
                );
              })}
              {images.length === 0 && (
                <div className="settings-empty-image">
                  画像未登録時は青から緑のグラデーションを表示します。
                </div>
              )}
            </div>

            <div className="settings-footer">
              <button className="settings-save" onClick={() => setSettingsOpen(false)}>完了</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
