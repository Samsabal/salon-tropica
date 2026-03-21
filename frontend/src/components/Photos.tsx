import { useState, useEffect } from 'react';

interface GalleryMonth {
  month: number;
  count: number;
  previewImage?: string;
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

  useEffect(() => {
    fetch('/photos/index.json')
      .then((res) => res.json())
      .then((data) => setGalleries(data.galleries));
  }, []);

  // Get recent galleries (most recent first)
  const recentGalleries = galleries
    .flatMap((g) =>
      g.months.map((m) => ({
        year: g.year,
        month: m.month,
        count: m.count,
        previewImage: m.previewImage,
      }))
    )
    .sort((a, b) => b.year - a.year || b.month - a.month)
    .slice(0, 6);

  const handleGalleryClick = async (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);

    const monthStr = String(month).padStart(2, '0');
    const basePath = `/photos/${year}/${monthStr}`;

    // Common photo sizes to try
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
        const url = `${basePath}/${photoName}-${size}.jpg`;
        photoUrls.push(url);
      }
      // Also try without size suffix (for some images)
      photoUrls.push(`${basePath}/${photoName}.jpg`);
      photoUrls.push(`${basePath}/${photoName}.png`);
    }

    setPhotos(photoUrls);
  };

  const monthName = (m: number) =>
    new Date(2000, m - 1).toLocaleString('nl-NL', { month: 'long' });

  const isDetailView = selectedYear !== null && selectedMonth !== null;

  return (
    <section id="fotos" className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-2">FOTO'S</h2>
      <p className="text-slate-300 mb-8">
        Bekijk de mooiste momenten van Salon Tropica.
      </p>

      {!isDetailView && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          {recentGalleries.map((gallery) => (
            <button
              key={`${gallery.year}-${gallery.month}`}
              onClick={() => gallery.count > 0 && handleGalleryClick(gallery.year, gallery.month)}
              disabled={gallery.count === 0}
              className={`group relative overflow-hidden rounded-lg h-64 transition transform ${
                gallery.count > 0 ? 'hover:scale-105 cursor-pointer' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <img
                src={`/photos/${gallery.year}/${String(gallery.month).padStart(2, '0')}/${gallery.previewImage || '00000354r-640x480.jpg'}`}
                alt={`${monthName(gallery.month)} ${gallery.year}`}
                className={`w-full h-full object-cover ${gallery.count > 0 ? 'group-hover:brightness-75' : ''} transition`}
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
      )}

      {isDetailView && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => {
                setSelectedYear(null);
                setSelectedMonth(null);
                setPhotos([]);
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
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
              {photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-auto rounded-lg object-cover mb-4 break-inside-avoid"
                  onError={(e) => {
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
