import { useState, useRef, useMemo, useEffect } from 'react';
import logoIcon from '../assets/logo-icon.png';
import { buildCloudinaryImageUrl } from '../config/cloudinary';
import { getCloudinaryPublicId } from '../config/cloudinary';
import { photoManifest } from '../data/photoManifest';

interface GalleryImage {
  name: string;
  publicId: string | null;
}

interface PhotoSource {
  src: string;
  fallbackSrc?: string;
}

interface Gallery {
  year: number;
  count: number;
  previewImage: string | null;
  images: GalleryImage[];
}

export function Photos() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [photos, setPhotos] = useState<PhotoSource[]>([]);
  const [photosLoaded, setPhotosLoaded] = useState(0);
  const [page, setPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(6);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const PAGE_SIZE = 40;
  const baseUrl = import.meta.env.BASE_URL;
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? 'dmdr29wlc';
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const assetPath = (relativePath: string) =>
    `${normalizedBaseUrl}${relativePath.replace(/^\/+/, '')}`;

  const [cloudinaryMap, setCloudinaryMap] = useState<any | null>(null);

  // Load cloudinary map from public files so we can resolve publicIds for images
  useEffect(() => {
    const url = assetPath('photos/cloudinary-map.json');
    fetch(url, { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        setCloudinaryMap(json);
      })
      .catch(() => setCloudinaryMap(null));
  }, []);

  const galleries = photoManifest.galleries as unknown as Gallery[];

  // Build Cloudinary-only URL for an image. Prefer explicit publicId from manifest,
  // otherwise try to resolve via the cloudinary map. If no publicId can be found,
  // return a small data-uri placeholder to avoid broken images.
  const resolvePhotoSource = (year: number, imageName: string, publicId?: string | null) => {
    // try manifest publicId first
    let id = publicId ?? null;

    // if no id, attempt to parse month from the filename and look up in map
    if (!id && cloudinaryMap) {
      try {
        const m = imageName.match(/^(\d{4})-(\d{2})/);
        const month = m ? parseInt(m[2], 10) : 1;
        const lookup = getCloudinaryPublicId(cloudinaryMap, year, month, imageName);
        if (lookup) id = lookup;
      } catch (e) {
        // ignore lookup errors
      }
    }

    if (id) {
      const folder = cloudinaryMap?.folderPrefix || '';
      const src = buildCloudinaryImageUrl(cloudName, id, folder);
      return { src };
    }

    // fallback tiny placeholder (data-uri SVG) so layout remains stable
    const placeholder =
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23333" width="400" height="300"/%3E%3C/svg%3E';

    return { src: placeholder };
  };

  const recentGalleries = galleries
    .filter((gallery) => gallery.count > 0)
    .sort((a, b) => b.year - a.year)
    .slice(0, visibleCount);

  // choose a random preview image for each gallery once per render (stable while component mounted or galleries change)
  const previewMap = useMemo(() => {
    const map = new Map<number, PhotoSource>();
    galleries.forEach((gallery) => {
      const imgs = (gallery.images || [])
        .map((img) => resolvePhotoSource(gallery.year, img.name, img.publicId))
        .filter(Boolean);

      if (imgs.length > 0) {
        const idx = Math.floor(Math.random() * imgs.length);
        map.set(gallery.year, imgs[idx]);
      } else if (gallery.previewImage) {
        map.set(gallery.year, resolvePhotoSource(gallery.year, gallery.previewImage || 'placeholder.jpg'));
      }
    });
    return map;
  }, [galleries]);

  const handleGalleryClick = async (year: number) => {
    setSelectedYear(year);
    setPhotos([]);
    setPhotosLoaded(0);
    setPage(1);
    setIsLoadingPhotos(true);
    const selectedGallery = galleries.find((gallery) => gallery.year === year);

    // cancel any previous preload
    if (preloadCancelRef.current) {
      preloadCancelRef.current.cancel = true;
    }
    preloadCancelRef.current = { cancel: false };

    if (!selectedGallery?.images?.length) {
      setIsLoadingPhotos(false);
      return;
    }

    const imageUrls = selectedGallery.images.map((image) =>
      resolvePhotoSource(year, image.name, image.publicId)
    );

    const preloadCount = Math.min(imageUrls.length, PAGE_SIZE);

    try {
      await preloadImages(imageUrls.slice(0, preloadCount).map((image) => image.src), (loaded) => {
        setPhotosLoaded(loaded);
      }, preloadCancelRef.current);

      if (preloadCancelRef.current?.cancel) return;

      // show all images (first page already cached)
      setPhotos(imageUrls);
      setIsLoadingPhotos(false);
      setPhotosLoaded(preloadCount);
    } catch (err) {
      setIsLoadingPhotos(false);
    }
  };

  const preloadCancelRef = useRef<{ cancel: boolean } | null>(null);

  const preloadImages = (
    urls: string[],
    onProgress: (loaded: number) => void,
    cancelRef?: { cancel: boolean } | null
  ) => {
    return new Promise<void>((resolve) => {
      let loaded = 0;
      if (!urls.length) return resolve();

      urls.forEach((src) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          loaded += 1;
          onProgress(loaded);
          if (cancelRef?.cancel) return resolve();
          if (loaded >= urls.length) resolve();
        };
        img.onerror = () => {
          loaded += 1;
          onProgress(loaded);
          if (cancelRef?.cancel) return resolve();
          if (loaded >= urls.length) resolve();
        };
      });
    });
  };

  const handlePhotoSettled = () => {
    setPhotosLoaded((current) => {
      const next = current + 1;
      if (next >= photos.length) {
        setIsLoadingPhotos(false);
      }
      return next;
    });
  };

  const handleShowMore = async () => {
    if (!photos.length) return;

    // cancel any previous preload
    if (preloadCancelRef.current) {
      preloadCancelRef.current.cancel = true;
    }
    preloadCancelRef.current = { cancel: false };

    const start = page * PAGE_SIZE;
    const end = Math.min((page + 1) * PAGE_SIZE, photos.length);
    const nextUrls = photos.slice(start, end).map((photo) => photo.src);
    if (!nextUrls.length) return;

    setIsLoadingPhotos(true);
    const alreadyLoaded = photosLoaded;

    try {
      await preloadImages(nextUrls, (loaded) => {
        setPhotosLoaded(alreadyLoaded + loaded);
      }, preloadCancelRef.current);

      if (preloadCancelRef.current?.cancel) return;

      setPage((p) => p + 1);
    } finally {
      setIsLoadingPhotos(false);
    }
  };

  const isDetailView = selectedYear !== null;

  return (
    <section id="fotos" className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-2">Foto's</h2>
      <p className="text-slate-300 mb-8">
        Bekijk de mooiste momenten van Salon Tropica.
      </p>

      {!isDetailView && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          {recentGalleries.map((gallery) => (
            <button
              key={`${gallery.year}`}
              onClick={() => handleGalleryClick(gallery.year)}
              className="group relative overflow-hidden rounded-lg h-64 transition transform hover:scale-105 cursor-pointer"
            >
              <img
                src={previewMap.get(gallery.year)?.src || resolvePhotoSource(gallery.year, gallery.previewImage || 'placeholder.jpg').src}
                alt={`${gallery.year}`}
                className="w-full h-full object-cover group-hover:brightness-75 transition"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const fallbackSrc = target.dataset.fallbackSrc;

                  if (fallbackSrc && target.src !== fallbackSrc) {
                    target.src = fallbackSrc;
                    return;
                  }

                  target.src =
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23333" width="400" height="300"/%3E%3C/svg%3E';
                }}
                data-fallback-src={previewMap.get(gallery.year)?.fallbackSrc}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                <h3 className="text-white font-bold text-lg">
                  {gallery.year}
                </h3>
                <p className="text-slate-200 text-sm">
                  {gallery.count === 0 ? 'Binnenkort' : `${gallery.count} foto's`}
                </p>
              </div>
            </button>
          ))}
        </div>

            {galleries.length > 6 && (
          <div className="mt-6 flex justify-center">
            {visibleCount < galleries.length ? (
              <button
                className="px-4 py-2 bg-primary text-white rounded-md hover:opacity-90"
                onClick={() => setVisibleCount((c) => Math.min(c + 6, galleries.length))}
              >
                Toon meer
              </button>
            ) : (
              <button
                className="px-4 py-2 bg-secondary text-white rounded-md hover:opacity-90"
                onClick={() => setVisibleCount(6)}
              >
                Toon minder
              </button>
            )}
          </div>
          )}
        </>
      )}

      {isDetailView && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => {
                setSelectedYear(null);
                setPhotos([]);
                setPhotosLoaded(0);
                setIsLoadingPhotos(false);
              }}
              className="text-slate-300 hover:text-white transition flex items-center gap-2"
            >
              <span aria-hidden>←</span>
              Terug
            </button>
            <h3 className="text-2xl font-bold text-right">
              {selectedYear}
            </h3>
          </div>
          <div className="flex justify-center">
            {isLoadingPhotos && (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-300">
                <img
                  src={logoIcon}
                  alt="Salon Tropica"
                  className="h-10 w-10 neon-glow drop-shadow-[0_0_6px_rgba(0,245,255,0.6)] drop-shadow-[0_0_10px_rgba(255,78,205,0.45)]"
                />
                <div className="text-sm uppercase tracking-[0.2em] mt-2 text-slate-300 text-center">
                  {"Foto's laden"}
                  {photos.length > 0 ? ` (${photosLoaded}/${photos.length})` : ''}
                </div>
              </div>
            )}
            <div>
              <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
                {photos.slice(0, page * PAGE_SIZE).map((photo, index) => (
                <img
                  key={index}
                  src={photo.src}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-auto rounded-lg object-cover mb-4 break-inside-avoid"
                  onLoad={handlePhotoSettled}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const fallbackSrc = target.dataset.fallbackSrc;

                    if (fallbackSrc && target.src !== fallbackSrc) {
                      target.src = fallbackSrc;
                      return;
                    }

                    handlePhotoSettled();
                    target.style.display = 'none';
                  }}
                  data-fallback-src={photo.fallbackSrc}
                />
                ))}
              </div>

              {photos.length > PAGE_SIZE && (
                <div className="mt-4 flex justify-center gap-3">
                  {page * PAGE_SIZE < photos.length ? (
                    <button
                      className="px-4 py-2 bg-primary text-white rounded-md hover:opacity-90"
                      onClick={handleShowMore}
                    >
                      Toon meer
                    </button>
                  ) : (
                    <button
                      className="px-4 py-2 bg-secondary text-white rounded-md hover:opacity-90"
                      onClick={() => setPage(1)}
                    >
                      Toon minder
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
