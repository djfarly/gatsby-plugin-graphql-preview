const React = require('react');
const PropTypes = require('prop-types');
const { useQuery } = require('react-apollo-hooks');
const murmurhash = require('imurmurhash');
const { PreviewRenderer } = require('./PreviewRenderer').default;

const { useState, useRef } = React;

function PreviewFetcher({
  element,
  elementProps,
  fieldName,
  typeName,
  isolatedQuery,
  PreviewUIComponent,
  initalPollInterval
}) {
  const [pollInterval, setPollInterval] = useState(initalPollInterval);

  const { data: fetchedData, error, loading, refetch, ...rest } = useQuery(
    isolatedQuery,
    {
      pollInterval,
      notifyOnNetworkStatusChange: true,
      variables: elementProps.pageContext
    }
  );

  const mergedDataPropsRef = useRef({ data: null, key: null });

  if (fetchedData) {
    mergedDataPropsRef.current = {
      data: {
        ...elementProps.data,
        [fieldName]: prefixTypename(fetchedData, typeName)
      },
      key: murmurhash(fetchedData).result()
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
  initalPollInterval: PropTypes.number.isRequired
};

exports.default = PreviewFetcher;
