import React, { useState } from 'react';
import { Select, Button } from 'antd';

import useRepository from '../hooks/useRepository';
import { useStore } from '../store/';
import styled from 'styled-components';

type Props = {
  component: any;
  file: any;
  website: any;
};

const ComponentDetail: React.FC<Props> = ({ component, file, website }) => {
  const repo = useRepository();
  const set = useStore((store) => store.set);
  const tags = useStore((store) =>
    store.tags.allIds.map((id) => store.tags.byId[id]),
  );

  const options = tags.map((t) => (
    <Select.Option key={t.id} value={t.id}>
      {t.name}
    </Select.Option>
  ));

  const [selectedTags, setSelectedTags] = useState<string[]>(component.tagIds);

  const handleChange = (value: string[]) => {
    setSelectedTags(value);
  };

  const handleUpdateClick = () => {
    repo.componentTagsPost(component.id, selectedTags);
  };

  return (
    <div>
      <ImgWrapper>
        <DetailImg src={file.url} />
      </ImgWrapper>
      <div>
        <Select
          mode="multiple"
          allowClear
          style={{ width: '100%' }}
          placeholder="Please select"
          value={selectedTags}
          onChange={handleChange}
        >
          {options}
        </Select>
        <Button onClick={handleUpdateClick}>Update</Button>
      </div>
    </div>
  );
};

const ImgWrapper = styled.div``;

const DetailImg = styled.img``;

export default ComponentDetail;
