const React = require('react');
const { PREVIEW_CONTEXT } = require('../const');
const { ApolloProvider } = require('react-apollo-hooks');
const { IntrospectionFragmentMatcher } = require('apollo-cache-inmemory');
const ApolloClient = require('apollo-client').default;
const { InMemoryCache } = require('apollo-cache-inmemory');
const { HttpLink } = require('apollo-link-http');
const PreviewUIComponent = require('../components/PreviewUI').default;
const PreviewFetcher = require('../components/PreviewFetcher').default;
const queryString = require('query-string');

const isolatedQueries = GATSBY_PLUGIN_GRAPHQL_PREVIEW_ISOLATED_QUERIES;
const fragmentTypes = GATSBY_PLUGIN_GRAPHQL_PREVIEW_FRAGMENT_TYPES;

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData: fragmentTypes,
});
const cache = new InMemoryCache({ fragmentMatcher });

// eslint-disable-next-line react/prop-types,react/display-name
exports.default = ({ element, props }, options) => {
  const {
    previewQueryParam = 'preview',
    fieldName,
    typeName,
    url,
    headers,
    credentials,
  } = options;

  const queryParams = queryString.parse(props.location.search);
  if (!queryParams[previewQueryParam]) return element;

  const componentId = props.pageContext[PREVIEW_CONTEXT];
  const isolatedQuery = isolatedQueries[componentId];

  if (!isolatedQuery) return element;

  const client = new ApolloClient({
    cache,
    link: new HttpLink({
      uri: url,
      headers,
      credentials,
    }),
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
