import '../scss/chip.scss';
import React from 'react';
import classNames from 'classnames';

type ChipProps = {
  title: string;
  onClick?: () => void;
  className?: string;
  selected?: boolean;
};

const Chip = (props: ChipProps): JSX.Element => (
  <button
    type="button"
    className={classNames('chip', { 'chip--selected': props.selected }, props.className)}
    onClick={props.onClick}
  >
    {props.title}
  </button>
);

export default Chip;
