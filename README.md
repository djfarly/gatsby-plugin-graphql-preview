# Gatsby Plugin GraphQL Preview

> A plugin to automatically make the source-graphql parts of your application
> available as a live preview.

**_This is merely a proof of concept and not fully functional. Do not use it._**

Currently this works by doing the following:

- Everytime a page is created, this plugin makes a copy of it.
- It grabs the graphql query of the page, isoloates the parts that belong to
  your graphql source, and injects it into the pageContext.
- The duplicated pages do not render the static data but instead query your
  graphql source via apollo-client.
