import React, { useState } from 'react';
import { RoomType, RateOption, SearchCriteria } from '../types';
import { RateSelectionView as RateSelectionViewV1 } from './v1/RateSelectionView';
import { RateSelectionView as RateSelectionViewV2 } from './v2/RateSelectionView';

export interface RateSelectionViewProps {
  room: RoomType;
  criteria: SearchCriteria;
  selectedRate: RateOption | null;
  onSelectRate: (rate: RateOption) => void;
  onChangeRoom: () => void;
  onOpenRoomDetails: (room: RoomType) => void;
  activeVersion?: 'v1' | 'v2';
  onSelectVersion?: (version: 'v1' | 'v2') => void;
}

export const RateSelectionView: React.FC<RateSelectionViewProps> = (props) => {
  const [internalVersion, setInternalVersion] = useState<'v1' | 'v2'>('v2');
  const activeVersion = props.activeVersion ?? internalVersion;

  const handleSelectVersion = (version: 'v1' | 'v2') => {
    setInternalVersion(version);
    if (props.onSelectVersion) {
      props.onSelectVersion(version);
    }
  };

  if (activeVersion === 'v1') {
    return (
      <RateSelectionViewV1
        {...props}
        activeVersion={activeVersion}
        onSelectVersion={handleSelectVersion}
      />
    );
  }

  return (
    <RateSelectionViewV2
      {...props}
      activeVersion={activeVersion}
      onSelectVersion={handleSelectVersion}
    />
  );
};
