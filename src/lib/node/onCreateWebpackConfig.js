const {
  getComponentId,
  getIsolatedQuery,
  getFragmentTypes,
} = require('./helpers');

exports.default = async (
  { store, actions, plugins },
  { fieldName, typeName, url, headers, credentials },
) => {
  const isolatedQueries = {};
  for (let [componentPath, { query }] of store.getState().components) {
    isolatedQueries[getComponentId(componentPath)] = query
      ? getIsolatedQuery(query, fieldName, typeName)
      : null;
  }

  const fragmentTypes = await getFragmentTypes({ url, headers, credentials });

  actions.setWebpackConfig({
    plugins: [
      plugins.define({
        GATSBY_PLUGIN_GRAPHQL_PREVIEW_ISOLATED_QUERIES: JSON.stringify(
          isolatedQueries,
        ),
        GATSBY_PLUGIN_GRAPHQL_PREVIEW_FRAGMENT_TYPES: JSON.stringify(
          fragmentTypes,
        ),
      }),
    ],
  });
};
