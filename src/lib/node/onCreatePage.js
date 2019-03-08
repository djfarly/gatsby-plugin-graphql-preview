const { getComponentId } = require('./helpers');
const { PREVIEW_CONTEXT } = require('../const');

exports = ({ page, actions: { createPage } }) => {
  createPage({
    ...page,
    path: `/_preview${page.path}`,
    context: {
      ...page.context,
      [PREVIEW_CONTEXT]: getComponentId(page.componentPath),
    },
  });
};
