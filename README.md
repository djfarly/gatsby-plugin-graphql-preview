# Gatsby Plugin GraphQL Preview

> A plugin to automatically make the source-graphql parts of your application
> available as a live updating preview.

_Even though this seems to work, it still needs some more testing to make sure,
that there a no edge cases. Use at your own risk._

This plugin works by doing the following:

- Everytime a page is created, this plugin makes a copy of it.
- It grabs the graphql query of the page, isoloates the parts that belong to
  your graphql source, and webpack defines it as a global variable.
- The duplicated pages do not render the static data but instead query your
  graphql source via apollo-client.

__Therefore it only works conjunction with `gatsby-source-graphql`.__

## Install

```
yarn add gatsby-plugin-graphql-preview
```  
or
```
npm install --save gatsby-plugin-graphql-preview
```

## How to use

Add the plugin to the plugins array in your `gatsby-config.js`. It requires the same configuration options as gatsby-source-graphql. I'd suggest extracting the configuration into a variable instead of copying in. 

_`gatsby-source-graphql`s `createLink` is not yet supported. The `url` field is required._

```javascript
// In your gatsby-config.js

const graphqlOptions = {
  typeName: "SWAPI",
  fieldName: "swapi",
  url: "https://api.graphcms.com/simple/v1/swapi",
};

module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-graphql",
      options: graphqlOptions,
    },
    {
      resolve: "gatsby-plugin-graphql-preview",
      options: graphqlOptions,
    },
  ],
}
```

## To do

- Configuration
  - Add option to set or transform path for preview pages
  - Add option for custom PreviewUI component
- Improve documentation and add examples
