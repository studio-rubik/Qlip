import React from 'react';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faTags,
  faTag,
  faList,
  faGlobe,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

library.add(faTags, faTag, faList, faClock, faGlobe);

type StyledFC = React.FC<{ style?: React.CSSProperties }>;

const Tag: StyledFC = ({ style }) => (
  <FontAwesomeIcon icon="tag" style={style} />
);
const Tags: StyledFC = ({ style }) => (
  <FontAwesomeIcon icon="tags" style={style} />
);
const List: StyledFC = ({ style }) => (
  <FontAwesomeIcon icon="list" style={style} />
);
const Globe: StyledFC = ({ style }) => (
  <FontAwesomeIcon icon="globe" style={style} />
);
const Clock: StyledFC = ({ style }) => (
  <FontAwesomeIcon icon="clock" style={style} />
);

const Icons = {
  Tag,
  Tags,
  List,
  Globe,
  Clock,
};

export default Icons;
