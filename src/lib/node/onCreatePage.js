const { getComponentId } = require('./helpers');
const { PREVIEW_CONTEXT } = require('../const');

/**
 * append our component id onto every page
 */
exports.default = ({ page, actions: { createPage, deletePage } }) => {
  deletePage({ ...page });
  createPage({
    ...page,
    context: {
      ...page.context,
      [PREVIEW_CONTEXT]: getComponentId(page.componentPath),
    },
  });
};
