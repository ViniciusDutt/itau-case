type SortOrder = 'asc' | 'desc';

interface SortConfig {
  field: string;
  order: SortOrder;
}

/**
 * Parse sort parameters from query string
 * Supports formats:
 * - sortBy=name&order=asc
 * - sort=name:asc,createdAt:desc
 */
export function parseSortParams(
  sortByParam?: string,
  orderParam?: string,
  sortParam?: string
): SortConfig[] {
  const sortConfigs: SortConfig[] = [];

  // Format 1: sort=name:asc,createdAt:desc
  if (sortParam) {
    const sorts = String(sortParam).split(',');
    sorts.forEach(sort => {
      const [field, order] = sort.trim().split(':');
      if (field) {
        sortConfigs.push({
          field: field.trim(),
          order: (order?.trim().toLowerCase() as SortOrder) || 'asc'
        });
      }
    });
  }

  // Format 2: sortBy=name,createdAt&order=asc,desc
  if (sortByParam) {
    const fields = String(sortByParam).split(',');
    const orders = orderParam ? String(orderParam).split(',') : [];

    fields.forEach((field, index) => {
      sortConfigs.push({
        field: field.trim(),
        order: (orders[index]?.trim().toLowerCase() as SortOrder) || 'asc'
      });
    });
  }

  return sortConfigs;
}

/**
 * Sort an array based on sort configurations
 */
export function sortArray<T extends Record<string, any>>(
  array: T[],
  sortConfigs: SortConfig[]
): T[] {
  if (sortConfigs.length === 0) {
    return array;
  }

  return [...array].sort((a, b) => {
    for (const config of sortConfigs) {
      const { field, order } = config;
      const valueA = getNestedValue(a, field);
      const valueB = getNestedValue(b, field);

      // Handle null/undefined
      if (valueA == null && valueB == null) continue;
      if (valueA == null) return order === 'asc' ? 1 : -1;
      if (valueB == null) return order === 'asc' ? -1 : 1;

      let comparison = 0;

      // Compare based on type
      if (valueA < valueB) comparison = -1;
      else if (valueA > valueB) comparison = 1;

      if (comparison !== 0) {
        return order === 'asc' ? comparison : -comparison;
      }
    }

    return 0;
  });
}

/**
 * Get nested value from object using dot notation (e.g., "user.profile.name")
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
}
