const React = require('react');
const PropTypes = require('prop-types');
const Draggable = require('react-draggable');

const style = {
  container: {
    position: 'fixed',
    zIndex: Number.MAX_SAFE_INTEGER,
    padding: '4px 6px',
    borderRadius: 5,
    border: '1px solid rgba(230, 230, 230, 0.5)',
    backgroundColor: 'rgba(240, 240, 240, 0.75)',
    boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.15)'
  },
  handle: {
    height: 10,
    width: 10,
    backgroundColor: 'green'
  }
};

function PreviewUI({ setPollInterval, pollInterval, refetch, loading, error }) {
  return (
    <Draggable handle=".handle" defaultPosition={{ x: 10, y: 10 }}>
      <div style={style.container}>
        <div className="handle" style={style.handle}>
          …
        </div>
        <div>
          <strong>
            Live preview {loading ? 'loading' : error ? 'errored' : 'active'}
          </strong>
        </div>
        <div>
          <label>
            Update every:{' '}
            <select
              onChange={e => {
                setPollInterval(e.target.value);
              }}
              value={pollInterval}
            >
              <option value={200}>200ms</option>
              <option value={1000}>1s</option>
              <option value={10000}>10s</option>
            </select>
          </label>
        </div>
        <div>
          <label>
            <input type="button" onClick={refetch} value="Update now" />
          </label>
        </div>
      </div>
    </Draggable>
  );
}

PreviewUI.propTypes = {
  setPollInterval: PropTypes.func.isRequired,
  pollInterval: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf([null])])
    .isRequired,
  refetch: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]).isRequired
};

exports.default = PreviewUI;
