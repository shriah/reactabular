import merge from 'lodash/merge';

function resolveHeaderRows(columns) {
  let resolvedChildren = [];

  const ret = columns.map(column => {
    const { children, ...col } = column;

    if (children && children.length) {
      resolvedChildren = resolvedChildren.concat(
        resolveHeaderRows(children)[0]
      );

      return {
        ...col,
        props: {
          ...col.props,
          colSpan: children.length
        }
      };
    }

    return {
      ...col,
      props: {
        ...col.props,
        rowSpan: countRowSpan(columns)
      }
    };
  });

  if (resolvedChildren.length) {
    return [ret].concat([resolvedChildren]);
  }

  return [ret];
}

function countRowSpan(columns) {
  let maximumCount = 0;

  columns.forEach(column => {
    if (column.children) {
      maximumCount = Math.max(
        maximumCount,
        countRowSpan(column.children)
      );
    }
  });

  return maximumCount + 1;
}

function resolveBodyColumns(columns) {
  let ret = [];

  columns.forEach(column => {
    // If a column has children, skip cell specific configuration
    if (column.children) {
      ret = ret.concat(resolveBodyColumns(column.children));
    } else {
      ret.push(column);
    }
  });

  return ret;
}

function evaluateTransforms(transforms, value, extraParameters = {}) {
  return transforms.reduceRight(
    (a, t) => {
      const result = t(value, extraParameters);
      const className = mergeClassNames(a && a.className, result && result.className);

      if (className) {
        return merge({}, a, result, { className });
      }

      return merge({}, a, result);
    },
    {}
  );
}

function mergeClassNames(a, b) {
  if (a && b) {
    return `${a} ${b}`;
  }

  // Either a or b at this point
  return (a || '') + (b || '');
}

export {
  resolveHeaderRows,
  countRowSpan,
  resolveBodyColumns,
  evaluateTransforms,
  mergeClassNames
};
