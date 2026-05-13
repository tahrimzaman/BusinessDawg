import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'system',
  title: 'System',
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
    defineField({ name: 'description', type: 'text' }),
    defineField({ name: 'deliverables', type: 'array', of: [{ type: 'string' }] }),
    defineField({
      name: 'starterPack',
      type: 'object',
      fields: [
        { name: 'from', type: 'string' },
        { name: 'included', type: 'array', of: [{ type: 'string' }] },
        { name: 'hidden', type: 'boolean' },
      ],
    }),
    defineField({
      name: 'ctaType',
      type: 'string',
      options: { list: ['price', 'book'] },
    }),
    defineField({ name: 'order', type: 'number' }),
  ],
});
