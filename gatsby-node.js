const { PREVIEW_CONTEXT } = require('./const');
const gql = require('graphql-tag');
const traverse = require('traverse');
const cloneDeep = require('lodash.clonedeep');
const MurmurHash3 = require('imurmurhash');

const getComponentId = componentPath => MurmurHash3(componentPath).result();

const getQuery = query => {
  if (typeof query === 'object' && query.definitions) {
    return query;
  } else if (typeof query === 'string') {
    return gql(query);
  } else if (typeof query === 'object' && query.source) {
    return gql(query.source);
  } else {
    throw new Error('Could not parse query: ' + query);
  }
};

const getIsolatedQuery = (querySource, fieldName, typeName) => {
  const query = getQuery(querySource);
  const updatedQuery = cloneDeep(query);

  const updatedRoot = updatedQuery.definitions[0].selectionSet.selections.find(
    selection =>
      selection.name &&
      selection.name.kind === 'Name' &&
      selection.name.value === fieldName
  );

  if (updatedRoot) {
    updatedQuery.definitions[0].selectionSet.selections =
      updatedRoot.selectionSet.selections;
  } else if (fieldName) {
    console.warn('Failed to update query root');
    return;
  }

  traverse(updatedQuery).forEach(function(x) {
    if (this.isLeaf && this.parent && this.parent.key === 'name') {
      if (this.parent.parent && this.parent.parent.node.kind === 'NamedType') {
        if (typeof x === 'string' && x.indexOf(`${typeName}_`) === 0) {
          this.update(x.substr(typeName.length + 1));
        }
      }
    }
  });

  return updatedQuery;
};

exports.onCreatePage = (
  { page, actions: { createPage }, store },
  { fieldName, typeName }
) => {
  createPage({
    ...page,
    path: `/_preview${page.path}`,
    context: {
      ...page.context,
      [PREVIEW_CONTEXT]: getComponentId(page.componentPath)
    }
  });
};

exports.onCreateWebpackConfig = (
  { store, actions, plugins },
  { fieldName, typeName }
) => {
  isolatedQueries = {};
  for (let [componentPath, { query }] of store.getState().components) {
    isolatedQueries[getComponentId(componentPath)] = query
      ? getIsolatedQuery(query, fieldName, typeName)
      : null;
  }

  actions.setWebpackConfig({
    plugins: [
      plugins.define({
        GATSBY_PLUGIN_GRAPHQL_PREVIEW_ISOLATED_QUERIES: JSON.stringify(
          isolatedQueries
        )
      })
    ]
  });
};
