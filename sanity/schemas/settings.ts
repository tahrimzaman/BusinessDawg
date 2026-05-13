import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'settings',
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({ name: 'tagline', type: 'string' }),
    defineField({ name: 'footerCopy', type: 'string' }),
    defineField({
      name: 'socials',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'platform', type: 'string' },
            { name: 'url', type: 'url' },
          ],
        },
      ],
    }),
  ],
});
