import {
  INITIAL_COMMUNITY_POSTS,
  FEED_CATEGORIES,
  FeedCategory,
  SharedExperienceItem,
} from '../mocks/community.mock';

describe('Community Filtering Logic', () => {
  test('debe contener todas las categorías principales definidas', () => {
    const categoryIds = FEED_CATEGORIES.map((c) => c.id);
    expect(categoryIds).toContain('ALL');
    expect(categoryIds).toContain('ROMANTIC');
    expect(categoryIds).toContain('OUTDOOR');
    expect(categoryIds).toContain('GASTRO');
    expect(categoryIds).toContain('CULTURE');
  });

  test('debe filtrar correctamente por categoría ROMANTIC', () => {
    const filterFn = (items: SharedExperienceItem[], cat: FeedCategory) => {
      if (cat === 'ALL') return items;
      return items.filter((item) => item.category === cat);
    };

    const romanticOnly = filterFn(INITIAL_COMMUNITY_POSTS, 'ROMANTIC');
    expect(romanticOnly.length).toBeGreaterThan(0);
    romanticOnly.forEach((item) => {
      expect(item.category).toBe('ROMANTIC');
    });

    const all = filterFn(INITIAL_COMMUNITY_POSTS, 'ALL');
    expect(all.length).toBe(INITIAL_COMMUNITY_POSTS.length);
  });
});
