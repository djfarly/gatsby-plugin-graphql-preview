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

## To do

- Configuration
  - Add option to set or transform path for preview pages
  - Add option for custom PreviewUI component
  - Shall this steal graphql options from `gatsby-source-graphql`?
- Add documentation and examples
