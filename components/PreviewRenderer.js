const React = require('react');
const PropTypes = require('prop-types');

const { cloneElement, Children } = React;

function deepClonePageElement(element, props) {
  return cloneElement(element, {
    ...props,
    ...(element.props.children
      ? {
          children: deepClonePageElement(
            Children.only(element.props.children),
            props
          )
        }
      : undefined)
  });
}

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
      {data ? (
        deepClonePageElement(element, { data })
      ) : (
        <div>Preparing preview…</div>
      )}
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
  error: PropTypes.object,
  data: PropTypes.oneOfType([PropTypes.object, PropTypes.oneOf([null])])
};

exports.default = PreviewRenderer;
