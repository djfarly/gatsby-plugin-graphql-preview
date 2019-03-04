const React = require(`react`);
const { PREVIEW_CONTEXT } = require('./const');
const PreviewUIComponent = require('./components/PreviewUI').default;
const PreviewFetcherSSR = require('./components/PreviewFetcherSSR').default;

// eslint-disable-next-line react/prop-types,react/display-name
exports.default = ({ element, props }) => {
  const componentId = props.pageContext[PREVIEW_CONTEXT];

  if (!componentId) return element;

  return (
    <PreviewFetcherSSR
      element={element}
      PreviewUIComponent={PreviewUIComponent}
      initialPollInterval={1e4}
    />
  );
};
