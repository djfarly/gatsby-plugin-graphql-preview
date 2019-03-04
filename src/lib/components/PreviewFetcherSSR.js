const React = require('react');
const PropTypes = require('prop-types');
const PreviewRenderer = require('./PreviewRenderer').default;

const noop = () => {};

function PreviewFetcherSSR({
  element,
  PreviewUIComponent,
  initalPollInterval,
}) {
  return (
    <PreviewRenderer
      element={element}
      PreviewUIComponent={PreviewUIComponent}
      setPollInterval={noop}
      pollInterval={initalPollInterval}
      error={false}
      loading={false}
      refetch={noop}
      data={null}
    />
  );
}

PreviewFetcherSSR.propTypes = {
  element: PropTypes.element.isRequired,
  PreviewUIComponent: PropTypes.func.isRequired,
  initalPollInterval: PropTypes.number.isRequired,
};

exports.default = PreviewFetcherSSR;
