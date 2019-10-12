// source: https://github.com/webex/react-widgets/blob/master/packages/node_modules/%40ciscospark/react-component-video/src/index.js

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './Video.css';

const propTypes = {
  audioMuted: PropTypes.bool,
  srcObject: PropTypes.object.isRequired
};

const defaultProps = {
  audioMuted: true
};

function Video({srcObject, audioMuted}) {
  // Need autoPlay to start the video automagically

  if (!srcObject) {
    return null;
  }

  function getEl(el) {
    const element = el;

    if (element && srcObject) {
      element.srcObject = srcObject;
    }

    return element;
  }

  return (
    // eslint-disable-reason cannot provide caption for video stream yet
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video
      autoPlay
      playsInline
      className={classNames(styles.video)}
      muted={audioMuted}
      ref={getEl}
    />
  );
}

Video.propTypes = propTypes;
Video.defaultProps = defaultProps;

export default Video;