const React = require(`react`);
const { Fragment, cloneElement, useReducer, useEffect, useRef } = React;
const { PREVIEW_CONTEXT } = require('./const');
const { ApolloProvider, useQuery } = require('react-apollo-hooks');
const { IntrospectionFragmentMatcher } = require('apollo-cache-inmemory');
const ApolloClient = require('apollo-client').default;
const { InMemoryCache } = require('apollo-cache-inmemory');
const { HttpLink } = require('apollo-link-http');
const murmurhash = require('imurmurhash');
const PreviewUIComponent = require('./components/PreviewUI').default;
const PreviewWrapper = require('./components/PreviewWrapper').default;

const isolatedQueries = GATSBY_PLUGIN_GRAPHQL_PREVIEW_ISOLATED_QUERIES;
const fragmentTypes = GATSBY_PLUGIN_GRAPHQL_PREVIEW_FRAGMENT_TYPES;

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData: fragmentTypes
});

const cache = new InMemoryCache({ fragmentMatcher });

function prefixTypename(data, prefix) {
  return transformObj(data, (key, value) => {
    if (key === '__typename') {
      return `${prefix}_${value}`;
    }

    return value;
  });
}

function transformObj(obj, fn) {
  return JSON.parse(JSON.stringify(obj), fn);
}

// eslint-disable-next-line react/prop-types,react/display-name
exports = ({ element, props }, options) => {
  const componentId = props.pageContext[PREVIEW_CONTEXT];
  const isolatedQuery = isolatedQueries[componentId];

  if (!isolatedQuery) return element;

  const { fieldName, typeName, url, headers, credentials } = options;

  const client = new ApolloClient({
    cache,
    link: new HttpLink({
      uri: url,
      headers,
      credentials
    })
  });

  return (
    <ApolloProvider client={client}>
      <PreviewWrapper
        element={element}
        fieldName={fieldName}
        typeName={typeName}
        elementProps={props}
        isolatedQuery={isolatedQuery}
        PreviewUIComponent={PreviewUIComponent}
      />
    </ApolloProvider>
  );
};
