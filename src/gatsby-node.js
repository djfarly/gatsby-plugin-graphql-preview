const { PREVIEW_CONTEXT } = require('./lib/const');
const gql = require('graphql-tag');
const traverse = require('traverse');
const cloneDeep = require('lodash.clonedeep');
const murmurhash = require('imurmurhash');
const fetch = require('node-fetch');

const getComponentId = componentPath => murmurhash(componentPath).result();

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

function doesQueryUseFragment(query, fragment) {
  let queryUsesFragment = false;
  traverse(query).forEach(function(currentValue) {
    // We're looking for this kind of construct
    // {
    //   "kind": "FragmentSpread", // 1
    //   "name": {                 // 2
    //     "kind": "Name",
    //     "value": "<fragment>"   // 3, currentValue
    //   }
    // }
    if (
      this.isLeaf &&
      this.key === 'value' && // 3
      this.parent &&
      this.parent.key === 'name' && // 2
      this.parent.parent &&
      this.parent.parent.node.kind === 'FragmentSpread' // 1
    ) {
      if (currentValue === fragment) {
        queryUsesFragment = true;
      }
    }
  });

  return queryUsesFragment;
}

const getIsolatedQuery = (querySource, fieldName, typeName) => {
  const query = getQuery(querySource);
  const updatedQuery = cloneDeep(query);

  const updatedRoot = updatedQuery.definitions[0].selectionSet.selections.find(
    selection =>
      selection.name &&
      selection.name.kind === 'Name' &&
      selection.name.value === fieldName,
  );

  if (updatedRoot) {
    updatedQuery.definitions[0].selectionSet.selections =
      updatedRoot.selectionSet.selections;
  } else if (fieldName) {
    console.warn('Failed to update query root');
    return;
  }

  traverse(updatedQuery).forEach(function(currentValue) {
    if (this.isLeaf && this.parent && this.parent.key === 'name') {
      if (this.parent.parent && this.parent.parent.node.kind === 'NamedType') {
        if (
          typeof currentValue === 'string' &&
          currentValue.indexOf(`${typeName}_`) === 0
        ) {
          this.update(currentValue.substr(typeName.length + 1));
        }
      }
    }
  });

  let index = 0;
  do {
    const definition = updatedQuery.definitions[index];

    if (definition.kind === 'FragmentDefinition') {
      if (!doesQueryUseFragment(updatedQuery, definition.name.value)) {
        // delete fragment and start again, since other fragments possibly only
        // depended on the deleted one.
        updatedQuery.definitions.splice(index, 1);
        index = 0;
        continue;
      }
    }

    index += 1;
  } while (index < updatedQuery.definitions.length);

  return updatedQuery;
};

exports.onCreatePage = ({ page, actions: { createPage } }) => {
  createPage({
    ...page,
    path: `/_preview${page.path}`,
    context: {
      ...page.context,
      [PREVIEW_CONTEXT]: getComponentId(page.componentPath),
    },
  });
};

exports.onCreateWebpackConfig = async (
  { store, actions, plugins },
  { fieldName, typeName, url, headers, credentials },
) => {
  isolatedQueries = {};
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

async function getFragmentTypes({ url, headers, credentials }) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    credentials,
    body: JSON.stringify({
      variables: {},
      query: `
      {
        __schema {
          types {
            kind
            name
            possibleTypes {
              name
            }
          }
        }
      }
    `,
    }),
  });
  const result = await response.json();

  // here we're filtering out any type information unrelated to unions or interfaces
  const filteredData = result.data.__schema.types.filter(
    type => type.possibleTypes !== null,
  );
  result.data.__schema.types = filteredData;

  return result.data;
}
