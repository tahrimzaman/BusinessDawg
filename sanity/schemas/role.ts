import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'role',
  title: 'Open role',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'description', type: 'text' }),
    defineField({
      name: 'location',
      type: 'string',
      options: { list: ['remote', 'hybrid', 'onsite'] },
    }),
    defineField({ name: 'isOpen', type: 'boolean', initialValue: true }),
  ],
});
