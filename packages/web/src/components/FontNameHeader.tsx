import '../scss/font-name-header.scss';
import React, { useContext } from 'react';
import classNames from 'classnames';
import FontContext from '../contexts/FontContext';

type FontNameHeaderProps = {
  style?: React.CSSProperties;
  className?: string;
};

const FontNameHeader = (props: FontNameHeaderProps): JSX.Element => {
  const { font, fileName } = useContext(FontContext);
  const name = font?.names?.fontFamily?.en || font?.names?.fullName?.en || fileName;

  return (
    <h1
      className={classNames('font-name-header', props.className)}
      style={props.style}
      title={name}
    >
      {name}
    </h1>
  );
};

export default FontNameHeader;
