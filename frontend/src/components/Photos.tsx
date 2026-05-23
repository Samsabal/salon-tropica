import { useState, useEffect } from 'react';
import logoIcon from '../assets/logo-icon.png';
import {
  buildCloudinaryImageUrl,
  getCloudinaryPublicId,
  type CloudinaryMap,
} from '../config/cloudinary';

interface GalleryMonth {
  month: number;
  count: number;
  previewImage?: string;
  images?: string[];
}

interface Gallery {
  year: number;
  months: GalleryMonth[];
}

export function Photos() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photosLoaded, setPhotosLoaded] = useState(0);
  const [visibleCount, setVisibleCount] = useState(6);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [cloudinaryMap, setCloudinaryMap] = useState<CloudinaryMap | null>(null);
  const baseUrl = import.meta.env.BASE_URL;
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const assetPath = (relativePath: string) =>
    `${normalizedBaseUrl}${relativePath.replace(/^\/+/, '')}`;

  useEffect(() => {
    fetch(assetPath('photos/index.json'))
      .then((res) => res.json())
      .then((data) => setGalleries(data.galleries));
  }, [baseUrl]);

  useEffect(() => {
    fetch(assetPath('photos/cloudinary-map.json'))
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setCloudinaryMap(data))
      .catch(() => setCloudinaryMap(null));
  }, [baseUrl]);

  const resolvePhotoUrl = (year: number, month: number, imageName: string) => {
    const monthStr = String(month).padStart(2, '0');
    const localPath = assetPath(`photos/${year}/${monthStr}/${imageName}`);
    const publicId = getCloudinaryPublicId(cloudinaryMap, year, month, imageName);

    if (!publicId || !cloudinaryMap?.cloudName) {
      return localPath;
    }

    return buildCloudinaryImageUrl(
      cloudinaryMap.cloudName,
      publicId,
      cloudinaryMap.folderPrefix ?? ''
    );
  };

  const recentGalleries = galleries
    .flatMap((g) =>
      g.months.map((m) => ({
        year: g.year,
        month: m.month,
        count: m.count,
        previewImage: m.previewImage,
        images: m.images,
      }))
    )
    .filter((gallery) => gallery.count > 0)
    .sort((a, b) => b.year - a.year || b.month - a.month)
    .slice(0, visibleCount);

  const handleGalleryClick = async (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    setPhotos([]);
    setPhotosLoaded(0);
    setIsLoadingPhotos(true);

    const selectedGallery = galleries
      .flatMap((gallery) =>
        gallery.months.map((galleryMonth) => ({
          year: gallery.year,
          month: galleryMonth.month,
          images: galleryMonth.images,
        }))
      )
      .find((gallery) => gallery.year === year && gallery.month === month);

    if (selectedGallery?.images?.length) {
      const imageUrls = selectedGallery.images.map((image) =>
        resolvePhotoUrl(year, month, image)
      );
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setIsLoadingPhotos(imageUrls.length > 0);
      setPhotos(imageUrls);
      return;
    }

    const photoSizes = ['640x480', '1280x960', '326x245'];
    const basePhotoNames = [
      '00000354r', '00000357r', '00000360r', '00000365r', '00000367r', '00000370r',
      '00000235-BorderMaker', '00000240-BorderMaker', '00000245-BorderMaker',
      '00000250-BorderMaker', '00000257-BorderMaker', '00000260-BorderMaker',
      'cropped-tropica-web-2',
    ];

    const photoUrls: string[] = [];

    for (const photoName of basePhotoNames) {
      for (const size of photoSizes) {
        const url = resolvePhotoUrl(year, month, `${photoName}-${size}.jpg`);
        photoUrls.push(url);
      }
      photoUrls.push(resolvePhotoUrl(year, month, `${photoName}.jpg`));
      photoUrls.push(resolvePhotoUrl(year, month, `${photoName}.png`));
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsLoadingPhotos(photoUrls.length > 0);
    setPhotos(photoUrls);
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

  const monthName = (m: number) =>
    new Date(2000, m - 1).toLocaleString('nl-NL', { month: 'long' });

  const isDetailView = selectedYear !== null && selectedMonth !== null;

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
              key={`${gallery.year}-${gallery.month}`}
              onClick={() => handleGalleryClick(gallery.year, gallery.month)}
              className="group relative overflow-hidden rounded-lg h-64 transition transform hover:scale-105 cursor-pointer"
            >
              <img
                src={resolvePhotoUrl(
                  gallery.year,
                  gallery.month,
                  gallery.previewImage || '00000354r-640x480.jpg'
                )}
                alt={`${monthName(gallery.month)} ${gallery.year}`}
                className="w-full h-full object-cover group-hover:brightness-75 transition"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23333" width="400" height="300"/%3E%3C/svg%3E';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                <h3 className="text-white font-bold text-lg">
                  {monthName(gallery.month).charAt(0).toUpperCase() +
                    monthName(gallery.month).slice(1)}{' '}
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
                Meer
              </button>
            ) : (
              <button
                className="px-4 py-2 bg-secondary text-white rounded-md hover:opacity-90"
                onClick={() => setVisibleCount(6)}
              >
                Minder
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
                setSelectedMonth(null);
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
              {monthName(selectedMonth).charAt(0).toUpperCase() +
                monthName(selectedMonth).slice(1)}{' '}
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
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
              {photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-auto rounded-lg object-cover mb-4 break-inside-avoid"
                  onLoad={handlePhotoSettled}
                  onError={(e) => {
                    handlePhotoSettled();
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
