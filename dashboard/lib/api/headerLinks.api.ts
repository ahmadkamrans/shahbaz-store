import {
  getDummyHeaderLinks,
  addDummyHeaderLink,
  updateDummyHeaderLink,
  removeDummyHeaderLink,
  reorderDummyHeaderLinks,
} from '../dummy/data';

export interface HeaderLink {
  id?: string;
  label: string;
  href: string;
  order: number;
}

export const headerLinksApi = {
  getAll: async (): Promise<HeaderLink[]> => {
    return getDummyHeaderLinks() as HeaderLink[];
  },

  create: async (data: Omit<HeaderLink, 'id' | 'order'>): Promise<HeaderLink> => {
    return addDummyHeaderLink(data) as HeaderLink;
  },

  update: async (id: string, data: Partial<HeaderLink>): Promise<HeaderLink> => {
    const updated = updateDummyHeaderLink(id, data);
    if (!updated) throw new Error('Header link not found');
    return updated as HeaderLink;
  },

  delete: async (id: string): Promise<void> => {
    removeDummyHeaderLink(id);
  },

  reorder: async (id: string, direction: 'up' | 'down'): Promise<void> => {
    reorderDummyHeaderLinks(id, direction);
  },
};
