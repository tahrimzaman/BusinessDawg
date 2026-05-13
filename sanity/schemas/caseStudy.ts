import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'case_study',
  title: 'Case study (client)',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'client', type: 'string' }),
    defineField({ name: 'role', type: 'string' }),
    defineField({ name: 'timeline', type: 'string' }),
    defineField({ name: 'isConcept', type: 'boolean', initialValue: true }),
    defineField({ name: 'problem', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'approach', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'outcome', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'gallery', type: 'array', of: [{ type: 'image' }] }),
    defineField({ name: 'liveUrl', type: 'url' }),
  ],
});
