import type { NewsItem, NewsPriority, NewsStatus, NewsType } from './types'

export const newsTypes: Record<NewsType, string> = {
  BOUNTY_UPDATE: 'Recompensas', BATTLE: 'Batallas', MARINE_OPERATION: 'Marina',
  WORLD_GOVERNMENT: 'Gobierno mundial', DISCOVERY: 'Descubrimientos',
}
export const newsPriorities: Record<NewsPriority, string> = {
  LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta', CRITICAL: 'Crítica',
}
export const newsStatuses: Record<NewsStatus, string> = {
  RUMOR: 'Rumor', CONFIRMED: 'Confirmada', DEBUNKED: 'Desmentida',
}
export const newsStatusTones: Record<NewsStatus, 'warning' | 'success' | 'danger'> = {
  RUMOR: 'warning', CONFIRMED: 'success', DEBUNKED: 'danger',
}

export function parseNewsFilters(search: URLSearchParams) {
  const filters: Record<string, string> = {}
  const allowed = { type: newsTypes, priority: newsPriorities, status: newsStatuses }
  for (const [key, values] of Object.entries(allowed)) {
    const value = search.get(key)
    if (value && Object.hasOwn(values, value)) filters[key] = value
  }
  return filters
}

export function matchesNews(item: NewsItem, filters: Record<string, string>): boolean {
  return (!filters.type || item.type === filters.type)
    && (!filters.priority || item.priority === filters.priority)
    && (!filters.status || item.status === filters.status)
}
