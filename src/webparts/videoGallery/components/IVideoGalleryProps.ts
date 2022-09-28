import { WebPartContext } from "@microsoft/sp-webpart-base";
import { ReactPropTypes } from "react";
import * as PropTypes from 'prop-types';

export interface IVideoGalleryProps {
  webpartTitle: string;
  webpartLabel: string;
  listTitle: string;
  context?: WebPartContext;
  siteURL: string;
  seeAllURL: string;
  showIndex: boolean;
  showBullets: boolean;
  infinite: boolean;
  showThumbnails: boolean;
  showFullscreenButton: boolean;
  //showGalleryFullscreenButton: boolean;
  showPlayButton: boolean;
  //showGalleryPlayButton: boolean;
  showNav: boolean;
  isRTL: boolean;
  slideDuration: number;
  slideInterval: number;
  slideOnThumbnailOver: boolean;
  thumbnailPosition: any;
  useWindowKeyDown: boolean;

}


