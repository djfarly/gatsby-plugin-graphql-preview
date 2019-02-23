const React = require('react');
const PropTypes = require('prop-types');

const { Fragment, useReducer } = React;

const SET_POLL_INTERVAL = 'SET_POLL_INTERVAL';

function PreviewWrapper({
  element,
  elementProps,
  fieldName,
  typeName,
  isolatedQuery,
  PreviewUIComponent
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
      <PreviewUIComponent
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

PreviewUI.propTypes = {
  element: PropTypes.element.isRequired,
  elementProps: PropTypes.object.isRequired,
  fieldName: PropTypes.string.isRequired,
  typeName: PropTypes.string.isRequired,
  isolatedQuery: PropTypes.object.isRequired,
  PreviewUIComponent: PropTypes.func.isRequired
};
