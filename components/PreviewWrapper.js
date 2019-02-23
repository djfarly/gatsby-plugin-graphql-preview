const React = require('react');
const PropTypes = require('prop-types');

const { Fragment, useState } = React;

function PreviewWrapper({
  element,
  elementProps,
  fieldName,
  typeName,
  isolatedQuery,
  PreviewUIComponent
}) {
  const [pollInterval, setPollInterval] = useState(1e4);

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
        setPollInterval={newPollInterval => setPollInterval(newPollInterval)}
        pollInterval={pollInterval}
        refetch={() => refetch()}
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
