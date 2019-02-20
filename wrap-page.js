const React = require(`react`);
const { cloneElement, useReducer } = React;
const { PREVIEW_CONTEXT } = require('./const');
const ApolloClient = require('apollo-boost').default;
const { ApolloProvider, useQuery } = require('react-apollo-hooks');

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
  const _isolatedQuery = props.pageContext[PREVIEW_CONTEXT];
  const isolatedQuery = _isolatedQuery && JSON.parse(_isolatedQuery);

  if (!isolatedQuery) return element;

  const { fieldName, typeName, url, headers, credentials } = options;

  const client = new ApolloClient({
    uri: url,
    headers,
    credentials
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

  const { data, error, loading, refetch } = useQuery(isolatedQuery, {
    pollInterval
  });

  let content;

  if (error || !data) {
    content = <div>Error loading preview data.</div>;
  } else if (loading) {
    content = <div>Fetching preview data…</div>;
  } else {
    content = cloneElement(element, {
      data: {
        ...elementProps.data,
        [fieldName]: prefixTypename(data, typeName)
      }
    });
  }

  return (
    <>
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
    </>
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
