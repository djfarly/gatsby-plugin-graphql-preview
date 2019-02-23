const React = require('react');
const PropTypes = require('prop-types');
const Draggable = require('react-draggable');

const style = {
  container: {
    position: 'fixed',
    zIndex: Number.MAX_SAFE_INTEGER,
    padding: '4px 6px',
    borderRadius: 5,
    top: 0,
    left: 0,
    border: '1px solid rgba(255, 255, 255, 1)',
    backgroundColor: 'rgba(240, 240, 240, 0.75)',
    boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.15)'
  },
  handle: {
    float: 'right',
    padding: '0 0.2em',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    color: 'rgba(128, 128, 128, .75)',
    borderRadius: 5,
    cursor: 'move'
  }
};

function PreviewUI({ setPollInterval, pollInterval, refetch, loading, error }) {
  return (
    <Draggable handle=".handle" defaultPosition={{ x: 10, y: 10 }}>
      <div style={style.container}>
        <div className="handle" style={style.handle}>
          ✛
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
              <option value={500}>0.5 seconds</option>
              <option value={2500}>2.5 seconds</option>
              <option value={10000}>10 seconds</option>
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
  error: PropTypes.object
};

exports.default = PreviewUI;
