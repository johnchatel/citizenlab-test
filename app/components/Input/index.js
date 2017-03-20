/**
*
* Input
*
*/

import React, { PropTypes } from 'react';
import { Control } from 'react-redux-form';
// import styled from 'styled-components';

function Input(props) {
  const model = '.'.concat(props.id);

  return (
    <div className={props.className}>
      <Control.text
        name={props.id}
        model={model}
      />
    </div>
  );
}

Input.propTypes = {
  id: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default Input;
