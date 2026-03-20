import { DishItem } from '../data/santinoCatalog';
import { SelectedDish } from './pricingEngine';

export interface ImportedMenuResult {
  importedItems: SelectedDish[];
  recognizedCount: number;
  unknownCount: number;
  unknownNames: string[];
  suggestedMenuName: string;
}

const normalize = (value: string) => {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const makeCustomId = (name: string) => {
  return `imported:${name}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9:]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

const collectStringsFromJson = (value: unknown, acc: string[]) => {
  if (typeof value === 'string') {
    acc.push(value);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectStringsFromJson(item, acc));
    return;
  }

  if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectStringsFromJson(item, acc));
  }
};

const parseRawEntries = (fileName: string, text: string): string[] => {
  const trimmed = text.trim();
  if (!trimmed) return [];

  if (fileName.toLowerCase().endsWith('.json')) {
    try {
      const parsed = JSON.parse(trimmed);
      const values: string[] = [];
      collectStringsFromJson(parsed, values);
      return values;
    } catch {
      return trimmed.split(/\r?\n|,|;/g);
    }
  }

  return trimmed.split(/\r?\n|,|;/g);
};

const matchCatalogItem = (entry: string, items: DishItem[]): DishItem | null => {
  const normalizedEntry = normalize(entry);
  if (!normalizedEntry) return null;

  let bestMatch: DishItem | null = null;
  let bestScore = 0;

  for (const item of items) {
    const itemName = normalize(item.name);
    if (itemName === normalizedEntry) return item;

    let score = 0;
    if (normalizedEntry.includes(itemName) || itemName.includes(normalizedEntry)) {
      score = itemName.length;
    } else {
      const matchingTags = item.tags.filter((tag) => normalizedEntry.includes(normalize(tag))).length;
      if (matchingTags > 0) {
        score = matchingTags * 10;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  return bestScore > 0 ? bestMatch : null;
};

export const importMenuFromText = (fileName: string, text: string, items: DishItem[]): ImportedMenuResult => {
  const rawEntries = parseRawEntries(fileName, text)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length >= 3);

  const dedupedEntries = Array.from(new Set(rawEntries));
  const importedItems: SelectedDish[] = [];
  const usedIds = new Set<string>();
  const unknownNames: string[] = [];

  for (const entry of dedupedEntries) {
    const matched = matchCatalogItem(entry, items);

    if (matched) {
      if (usedIds.has(matched.id)) continue;
      usedIds.add(matched.id);
      importedItems.push({
        id: matched.id,
        name: matched.name,
        pricePerPerson: matched.basePricePerPerson
      });
      continue;
    }

    const customId = makeCustomId(entry);
    if (usedIds.has(customId)) continue;
    usedIds.add(customId);
    importedItems.push({
      id: customId,
      name: entry,
      pricePerPerson: 0
    });
    unknownNames.push(entry);
  }

  const baseName = fileName.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();

  return {
    importedItems,
    recognizedCount: importedItems.length - unknownNames.length,
    unknownCount: unknownNames.length,
    unknownNames,
    suggestedMenuName: baseName || 'Menú importado'
  };
};

export const importMenuFromFile = async (file: File, items: DishItem[]): Promise<ImportedMenuResult> => {
  const text = await file.text();
  const rawEntries = parseRawEntries(file.name, text)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length >= 3);

  const dedupedEntries = Array.from(new Set(rawEntries));
  const importedItems: SelectedDish[] = [];
  const usedIds = new Set<string>();
  const unknownNames: string[] = [];

  for (const entry of dedupedEntries) {
    const matched = matchCatalogItem(entry, items);

    if (matched) {
      if (usedIds.has(matched.id)) continue;
      usedIds.add(matched.id);
      importedItems.push({
        id: matched.id,
        name: matched.name,
        pricePerPerson: matched.basePricePerPerson
      });
      continue;
    }

    const customId = makeCustomId(entry);
    if (usedIds.has(customId)) continue;
    usedIds.add(customId);
    importedItems.push({
      id: customId,
      name: entry,
      pricePerPerson: 0
    });
    unknownNames.push(entry);
  }

  const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();

  return {
    importedItems,
    recognizedCount: importedItems.length - unknownNames.length,
    unknownCount: unknownNames.length,
    unknownNames,
    suggestedMenuName: baseName || 'Menú importado'
  };
};
