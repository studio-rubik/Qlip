import React, { useState } from 'react';
import { Select, Button, notification } from 'antd';

import useRepository from '../hooks/useRepository';
import { useStore } from '../store/';
import styled from 'styled-components';

type Props = {
  component: any;
  file: any;
  website: any;
  onSubmitSuccess?: () => void;
};

const ComponentDetail: React.FC<Props> = ({
  component,
  file,
  website,
  onSubmitSuccess,
}) => {
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
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (value: string[]) => {
    setSelectedTags(value);
  };

  const handleUpdateClick = async () => {
    try {
      setSubmitting(true);
      await repo.componentTagsPost(component.id, selectedTags);
      set((store) => {
        component.tagIds = selectedTags;
        store.components.byId[component.id] = component;
      });
      notification.success({ message: 'Your component updated' });
      if (onSubmitSuccess != null) onSubmitSuccess();
    } catch (e) {
      console.log(e);
      notification.error({ message: 'Sorry, something went wrong' });
    } finally {
      setSubmitting(false);
    }
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
        <Button loading={submitting} onClick={handleUpdateClick}>
          Update
        </Button>
      </div>
    </div>
  );
};

const ImgWrapper = styled.div``;

const DetailImg = styled.img``;

export default ComponentDetail;
