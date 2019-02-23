const React = require('react');
const PropTypes = require('prop-types');

const { cloneElement } = React;

function PreviewRenderer({
  element,
  PreviewUIComponent,
  setPollInterval,
  pollInterval,
  error,
  loading,
  refetch,
  data
}) {
  return (
    <>
      {data ? cloneElement(element, { data }) : <div>Preparing preview…</div>}
      <PreviewUIComponent
        setPollInterval={setPollInterval}
        pollInterval={pollInterval}
        refetch={refetch}
        loading={loading}
        error={error}
      />
    </>
  );
}

PreviewRenderer.propTypes = {
  element: PropTypes.element.isRequired,
  PreviewUIComponent: PropTypes.func.isRequired,
  setPollInterval: PropTypes.func.isRequired,
  pollInterval: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf([null])])
    .isRequired,
  refetch: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]).isRequired,
  data: PropTypes.oneOfType([PropTypes.object, PropTypes.oneOf([null])])
};

exports.default = PreviewRenderer;
