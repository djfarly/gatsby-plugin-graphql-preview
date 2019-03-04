const React = require('react');
const PropTypes = require('prop-types');
const { useQuery } = require('react-apollo-hooks');
const murmurhash = require('imurmurhash');
const PreviewRenderer = require('./PreviewRenderer').default;

const { useState, useRef } = React;

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

function PreviewFetcher({
  element,
  elementProps,
  fieldName,
  typeName,
  isolatedQuery,
  PreviewUIComponent,
  initialPollInterval,
}) {
  const [pollInterval, setPollInterval] = useState(initialPollInterval);

  const { data: fetchedData, error, loading, refetch, ...rest } = useQuery(
    isolatedQuery,
    {
      pollInterval,
      notifyOnNetworkStatusChange: true,
      variables: elementProps.pageContext,
    },
  );

  const mergedDataPropsRef = useRef({ data: null, key: null });

  if (fetchedData && Object.keys(fetchedData).length !== 0) {
    mergedDataPropsRef.current = {
      data: {
        ...elementProps.data,
        [fieldName]: prefixTypename(fetchedData, typeName),
      },
      key: murmurhash(JSON.stringify(fetchedData)).result(),
    };
  }

  return (
    <PreviewRenderer
      element={element}
      PreviewUIComponent={PreviewUIComponent}
      setPollInterval={setPollInterval}
      pollInterval={pollInterval}
      error={error}
      loading={loading}
      refetch={refetch}
      data={mergedDataPropsRef.current.data}
      key={mergedDataPropsRef.current.key}
    />
  );
}

PreviewFetcher.propTypes = {
  element: PropTypes.element.isRequired,
  elementProps: PropTypes.object.isRequired,
  fieldName: PropTypes.string.isRequired,
  typeName: PropTypes.string.isRequired,
  isolatedQuery: PropTypes.object.isRequired,
  PreviewUIComponent: PropTypes.func.isRequired,
  initialPollInterval: PropTypes.number.isRequired,
};

exports.default = PreviewFetcher;
