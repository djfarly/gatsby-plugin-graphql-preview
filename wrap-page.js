const React = require('react');
const { PREVIEW_CONTEXT } = require('./const');
const { ApolloProvider } = require('react-apollo-hooks');
const { IntrospectionFragmentMatcher } = require('apollo-cache-inmemory');
const ApolloClient = require('apollo-client').default;
const { InMemoryCache } = require('apollo-cache-inmemory');
const { HttpLink } = require('apollo-link-http');
const PreviewUIComponent = require('./components/PreviewUI').default;
const PreviewFetcher = require('./components/PreviewFetcher').default;

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
      <PreviewFetcher
        element={element}
        fieldName={fieldName}
        typeName={typeName}
        elementProps={props}
        isolatedQuery={isolatedQuery}
        PreviewUIComponent={PreviewUIComponent}
        initialPollInterval={1e4}
      />
    </ApolloProvider>
  );
};
