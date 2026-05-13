import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'founder_venture',
  title: 'Founder venture',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'tagline', type: 'string' }),
    defineField({ name: 'ownerRole', type: 'string' }),
    defineField({ name: 'timeline', type: 'string' }),
    defineField({ name: 'stack', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'businessDescription', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'buildDescription', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'outcome', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'gallery', type: 'array', of: [{ type: 'image' }] }),
    defineField({ name: 'liveUrl', type: 'url' }),
  ],
});
