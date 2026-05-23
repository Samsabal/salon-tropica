import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(scriptDir, '..');
const photosRoot = path.join(frontendRoot, 'public', 'photos');
const indexPath = path.join(photosRoot, 'index.json');
const sourceManifestPath = path.join(frontendRoot, 'src', 'data', 'photoManifest.ts');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const cloudinaryMapPath = path.join(photosRoot, 'cloudinary-map.json');

async function listImages(directoryPath) {
  try {
    const entries = await readdir(directoryPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
      .sort((left, right) => left.localeCompare(right));
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

async function listDirectories(directoryPath, pattern) {
  try {
    const entries = await readdir(directoryPath, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isDirectory() && pattern.test(entry.name))
      .map((entry) => entry.name)
      .sort((left, right) => right.localeCompare(left));
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

async function loadCloudinaryMap() {
  try {
    return JSON.parse(await readFile(cloudinaryMapPath, 'utf8'));
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}

const cloudinaryMap = await loadCloudinaryMap();

await mkdir(photosRoot, { recursive: true });
await mkdir(path.dirname(sourceManifestPath), { recursive: true });

function stripDatePrefix(fileName) {
  const match = fileName.match(/^\d{4}-\d{2}-\d{2}[_-](.+)$/);
  return match ? match[1] : fileName;
}

function resolveCloudinaryPublicId(year, imageName) {
  if (!cloudinaryMap?.items) {
    return null;
  }

  const baseName = path.basename(imageName, path.extname(imageName));
  const normalizedName = stripDatePrefix(baseName);
  const monthGuess = baseName.match(/^(\d{4})-(\d{2})-(\d{2})[_-]/);
  const month = monthGuess ? monthGuess[2] : null;

  if (month) {
    return (
      cloudinaryMap.items[`${year}/${month}/${normalizedName}`] ??
      cloudinaryMap.items[normalizedName] ??
      null
    );
  }

  return cloudinaryMap.items[normalizedName] ?? cloudinaryMap.items[baseName] ?? null;
}

const yearFolders = await listDirectories(photosRoot, /^\d{4}$/);

const galleries = await Promise.all(
  yearFolders.map(async (yearFolder) => {
    const images = await listImages(path.join(photosRoot, yearFolder));
    const imageEntries = images.map((imageName) => ({
      name: imageName,
      publicId: resolveCloudinaryPublicId(Number(yearFolder), imageName),
    }));

    return {
      year: Number(yearFolder),
      count: imageEntries.length,
      previewImage: imageEntries[0]?.name ?? null,
      images: imageEntries,
    };
  })
);

const normalizedManifest = {
  generatedAt: new Date().toISOString(),
  galleries,
};

await writeFile(
  indexPath,
  `${JSON.stringify(normalizedManifest, null, 2)}\n`,
  'utf8'
);

await writeFile(
  sourceManifestPath,
  `export const photoManifest = ${JSON.stringify(normalizedManifest, null, 2)} as const;\n`,
  'utf8'
);
