const React = require(`react`);
const { Fragment, cloneElement, useReducer, useEffect, useRef } = React;
const { PREVIEW_CONTEXT } = require('./const');
const { ApolloProvider, useQuery } = require('react-apollo-hooks');
const { IntrospectionFragmentMatcher } = require('apollo-cache-inmemory');
const ApolloClient = require('apollo-client').default;
const { InMemoryCache } = require('apollo-cache-inmemory');
const { HttpLink } = require('apollo-link-http');
const murmurhash = require('imurmurhash');

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
module.exports = ({ element, props }, options) => {
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
      />
    </ApolloProvider>
  );
};

const SET_POLL_INTERVAL = 'SET_POLL_INTERVAL';

function PreviewWrapper({
  element,
  elementProps,
  fieldName,
  typeName,
  isolatedQuery
}) {
  const [{ pollInterval }, dispatch] = useReducer(
    (state, { type, payload }) => {
      switch (type) {
        case SET_POLL_INTERVAL:
          return { ...state, pollInterval: payload };
        default:
          throw new Error(`Unknown action type ${type}`);
      }
    },
    {
      pollInterval: 10000
    }
  );

  const { data, error, loading, refetch, ...rest } = useQuery(isolatedQuery, {
    pollInterval,
    notifyOnNetworkStatusChange: true,
    variables: elementProps.pageContext
  });

  const lastData = useRef();

  let content;

  if (error || (!data && !lastData.current)) {
    content = <div>Error loading preview data.</div>;
    console.error(error);
  } else if (loading && !lastData.current) {
    content = <div>Fetching preview data…</div>;
  } else {
    if (data) {
      lastData.current = data;
    }
    content = cloneElement(element, {
      data: {
        ...elementProps.data,
        [fieldName]: prefixTypename(data || lastData.current, typeName)
      }
    });
  }

  return (
    <Fragment
      key={murmurhash(JSON.stringify(data || lastData.current)).result()}
    >
      {content}
      <PreviewUI
        onPollInterval={payload =>
          dispatch({ type: SET_POLL_INTERVAL, payload })
        }
        pollInterval={pollInterval}
        onRefetch={() => refetch()}
        loading={loading}
        error={error}
      />
    </Fragment>
  );
}

function PreviewUI({
  onPollInterval,
  pollInterval,
  onRefetch,
  loading,
  error
}) {
  return (
    <div
      style={{
        position: 'fixed',
        zIndex: Number.MAX_SAFE_INTEGER,
        top: 10,
        right: 10,
        padding: '4px 6px',
        borderRadius: 5,
        border: '1px solid rgba(230, 230, 230, 0.5)',
        backgroundColor: 'rgba(240, 240, 240, 0.75)',
        boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.15)'
      }}
    >
      <div>
        <strong>
          Live preview {loading ? 'loading' : error ? 'errored' : 'active'}
        </strong>
      </div>
      <div>
        <label>
          Update every:{' '}
          <select
            onChange={e => {
              onPollInterval(e.target.value);
            }}
            value={pollInterval}
          >
            <option value={200}>200ms</option>
            <option value={1000}>1s</option>
            <option value={10000}>10s</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          <input type="button" onClick={onRefetch} value="Update now" />
        </label>
      </div>
    </div>
  );
}
