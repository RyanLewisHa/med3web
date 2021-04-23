/*
 * Copyright 2021 EPAM Systems, Inc. (https://www.epam.com/)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { connect } from 'react-redux';


import StoreActionType from '../store/ActionTypes';
import Texture3D from '../engine/Texture3D';
import UiVolIcon from './UiVolIcon';
const NEED_TEXTURE_SIZE_4X = true;
class UiVolumeSel extends React.Component {
  constructor(props) {
    super(props);
    this.onClickRow = this.onClickRow.bind(this);
  }
  setVolumeIndex(indexSelected) {
    const store = this.props;
    const volumeSet = store.volumeSet;
    // volumes are already created from slices
    // loaderDicom.createVolumeFromSlices(volumeSet, indexSelected, hash);

    // finalize load
    const vol = volumeSet.getVolume(indexSelected);
    console.assert(vol !== null, "setVolumeIndex: vol should be non zero volume");

    if (vol.m_dataArray !== null) {
      // console.log(`success loaded volume from ${fileNameIn}`);
      if (NEED_TEXTURE_SIZE_4X) {
        vol.makeDimensions4x();
      }
      // invoke notification
    
      // send update (repaint) if was loaded prev model
      if (store.isLoaded) {
        store.dispatch({ type: StoreActionType.SET_IS_LOADED, isLoaded: false });  
      }

      store.dispatch({ type: StoreActionType.SET_VOLUME_SET, volumeSet: volumeSet });
      store.dispatch({ type: StoreActionType.SET_VOLUME_INDEX, volumeIndex: indexSelected });
      // store.dispatch({ type: StoreActionType.SET_FILENAME, fileName: fileNameIn });
      // store.dispatch({ type: StoreActionType.SET_ERR_ARRAY, arrErrors: [] });
      const tex3d = new Texture3D();
      tex3d.createFromRawVolume(vol);
      store.dispatch({ type: StoreActionType.SET_TEXTURE3D, texture3d: tex3d });
      // store.dispatch({ type: StoreActionType.SET_MODE_VIEW, modeView: ModeView.VIEW_2D });
      // store.dispatch({ type: StoreActionType.SET_MODE_3D, mode3d: Modes3d.RAYCAST });
      store.dispatch({ type: StoreActionType.SET_IS_LOADED, isLoaded: true });

      const gra = store.graphics2d;
      gra.clear();
      gra.forceUpdate(indexSelected);
      gra.forceRender();

    } // if vol data not null
  }
  onClickRow(ind) {
    console.assert(typeof(ind) == 'number');
    const store = this.props;
    if (ind !== store.volumeIndex) {
      // set global selected volume index
      store.dispatch({ type: StoreActionType.SET_VOLUME_INDEX, volumeIndex: ind });
      this.setVolumeIndex(ind);
    }
  }
  render() {
    const store = this.props;
    const volumeSet = store.volumeSet;
    const vols = volumeSet.m_volumes;
    const volumeIndex = store.volumeIndex;

    const strPatName = store.dicomInfo.m_patientName;
    const strStudyDescr = store.dicomInfo.m_studyDescr;
    const strTitle = `Volume select. [${strPatName}]: ${strStudyDescr}`;

    // const slices = store.dicomInfo.m_sliceInfo;

    const jsx = <div>
      {strTitle}
      {vols.map( (vol, i) => {
        const numSlices = vol.m_zDim;
        const strSer = vol.m_seriesDescr;
        const strVo = `vol ${strSer} [${numSlices}] slices`;
        let jsxListItem;
        if (i === volumeIndex) {
          jsxListItem = <p key={i} onClick={() => {this.onClickRow(i)} } active>{strVo} <UiVolIcon index={i} /> </p>;
        } else {
          jsxListItem = <p key={i} onClick={() => {this.onClickRow(i)} }>{strVo} <UiVolIcon index={i} /> </p>;
        }
        return jsxListItem;
      })}
    </div>
    return jsx;
  }
}

export default connect(store => store)(UiVolumeSel);

