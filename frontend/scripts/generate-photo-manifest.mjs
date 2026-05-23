import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(scriptDir, '..');
const photosRoot = path.join(frontendRoot, 'public', 'photos');
const indexPath = path.join(photosRoot, 'index.json');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

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
  const entries = await readdir(directoryPath, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory() && pattern.test(entry.name))
    .map((entry) => entry.name)
    .sort((left, right) => right.localeCompare(left));
}

async function loadBaseIndex() {
  try {
    return JSON.parse(await readFile(indexPath, 'utf8'));
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}

async function buildDefaultIndex() {
  const yearFolders = await listDirectories(photosRoot, /^\d{4}$/);

  return {
    generatedAt: new Date().toISOString(),
    galleries: await Promise.all(
      yearFolders.map(async (yearFolder) => {
        const monthFolders = await listDirectories(path.join(photosRoot, yearFolder), /^\d{2}$/);

        return {
          year: Number(yearFolder),
          months: monthFolders.map((monthFolder) => ({
            month: Number(monthFolder),
            count: 0,
            images: [],
          })),
        };
      })
    ),
  };
}

const baseIndex = (await loadBaseIndex()) ?? (await buildDefaultIndex());

const galleries = await Promise.all(
  baseIndex.galleries.map(async (gallery) => ({
    ...gallery,
    months: await Promise.all(
      gallery.months.map(async (month) => {
        const monthFolder = path.join(
          photosRoot,
          String(gallery.year),
          String(month.month).padStart(2, '0')
        );
        const images = await listImages(monthFolder);

        return {
          ...month,
          count: images.length,
          previewImage: images[0] ?? month.previewImage,
          images,
        };
      })
    ),
  }))
);

await writeFile(
  indexPath,
  `${JSON.stringify(
    {
      ...baseIndex,
      generatedAt: new Date().toISOString(),
      galleries,
    },
    null,
    2
  )}\n`,
  'utf8'
);
