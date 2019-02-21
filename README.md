# Gatsby Plugin GraphQL Preview

> A plugin to automatically make the source-graphql parts of your application
> available as a live preview.

**_This is merely a proof of concept and not fully functional. Do not use it._**

Currently this works by doing the following:

- Everytime a page is created, this plugin makes a copy of it.
- It grabs the graphql query of the page, isoloates the parts that belong to
  your graphql source, and webpack defines it as a global variable.
- The duplicated pages do not render the static data but instead query your
  graphql source via apollo-client.

## Stuff to figure out

- warp-page needs a specific ssr behaviour where it does not attempt to load any
  data. Currently it complains about not usind node-fetch.
