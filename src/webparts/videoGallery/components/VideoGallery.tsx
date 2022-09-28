import * as React from 'react';
import styles from './VideoGallery.module.scss';
import { IVideoGalleryProps } from './IVideoGalleryProps';
import { escape } from '@microsoft/sp-lodash-subset';
import "react-image-gallery/styles/css/image-gallery.css";
import ImageGallery from 'react-image-gallery';
import { Web, sp, ISiteUsers, ISiteUserProps, IUserCustomAction, IClientsidePage, IApp, IWeb, IList, Item } from '@pnp/sp/presets/all';
import "@pnp/sp/user-custom-actions";
import "@pnp/sp/appcatalog";
import * as $ from 'jquery';
import * as moment from 'moment';

import ReactPlayer from 'react-player/lazy';
import { useRef, useState } from 'react';
import { Player } from 'video-react';
import soundcloud from 'react-player/soundcloud';
import { arraysEqual, IconButton, IIconProps, MessageBar, MessageBarType, Modal, PrimaryButton, Stack } from 'office-ui-fabric-react';
import commonMethods from "../../../Common/CommonMethods";
import dataService from "../../../Common/DataService";
import CONSTANTS from "../../../Common/Constants";

let g_selectedRegion: string = "";
let g_selectedProgramType: string = "";


export interface IVideoGalleryState {
  galleryVideos: string[];
  error: string;
  showIndex: boolean;
  showBullets: boolean;
  infinite: boolean;
  showThumbnails: boolean;
  showFullscreenButton: boolean;
  showGalleryFullscreenButton: boolean;
  showPlayButton: boolean;
  showGalleryPlayButton: boolean;
  showNav: boolean;
  isRTL: boolean;
  slideDuration: number;
  slideInterval: number;
  slideOnThumbnailOver: boolean;
  thumbnailPosition: string;
  useWindowKeyDown: boolean;
  showVideo: any;
  selectedRegionValue: any;
  selectedProgramTypeValue: any;
  seeAllURL: string;
  isWarningModalOpen: boolean;
  onPlayPausebutton: boolean;
  videoFilePath: any;
  setVideoFilePath: any;

  url: any;
  pip: boolean;
  playing: boolean;
  controls: boolean;
  light: boolean;

  muted: boolean;
  played: Number;
  loaded: Number;
  loop: boolean;

  total_Vdo_Duration: number;
  timecount: number;

  checkItems: any;
}
export interface IEventData {
  sharedRegion: any;
  sharedProgramType: any;
}

const cancelIcon: IIconProps = { iconName: 'Cancel' };
const commonService = new dataService();
const commonMethod = new commonMethods();
export default class VideoGallery extends React.Component<IVideoGalleryProps, IVideoGalleryState> {
  public player: React.RefObject<HTMLElement | null>;
  constructor(props: IVideoGalleryProps, state: IVideoGalleryState) {
    super(props);
    this.player = React.createRef();
    this.ref = this.ref.bind(this);
    this.state = ({
      galleryVideos: [],
      error: '',
      showIndex: false,
      showBullets: true,
      infinite: true,
      showThumbnails: true,
      showFullscreenButton: false,
      showGalleryFullscreenButton: true,
      showPlayButton: false,
      showGalleryPlayButton: true,
      showNav: true,
      isRTL: false,
      slideDuration: 450,
      slideInterval: 2000,
      slideOnThumbnailOver: false,
      thumbnailPosition: 'bottom',
      useWindowKeyDown: true,
      showVideo: {},
      selectedRegionValue: [],
      selectedProgramTypeValue: [],
      seeAllURL: "",
      isWarningModalOpen: false,
      onPlayPausebutton: true,
      setVideoFilePath: null,
      videoFilePath: null,


      url: null,
      pip: false,
      playing: true,
      controls: false,
      light: false,

      muted: false,
      played: 0,
      loaded: 0,

      loop: false,

      total_Vdo_Duration: null,
      timecount: null,

      checkItems: {}


    });
    this._renderVideo = this._renderVideo.bind(this);

  }

  public async componentDidMount() {

    this.dropDownValidation(this.props.listTitle);
    this.setState({
      seeAllURL: this.props.seeAllURL == "" ? this.props.siteURL + CONSTANTS.SYS_CONFIG.SITE_LISTS + this.props.listTitle + CONSTANTS.SYS_CONFIG.VIDEO_GALLERY_PAGE : this.props.seeAllURL
    });
  }

  public dropDownValidation = async (listTitle: string) => {
    if (listTitle == undefined || listTitle == ' ') {
      this.setState({
        error: CONSTANTS.SYS_CONFIG.SELECT_LIST
      });
    }
    else {

      //Check all required fields available in selected list.
      let isValidListColumns = await commonMethod.isValidListColumns(listTitle, CONSTANTS.LIST_VALIDATION_COLUMNS.VIDEO);

      if (isValidListColumns) {
        this.LoadVideos();
      } else {
        this.setState({
          error: CONSTANTS.SYS_CONFIG.VIDEO_GALLERY_LIST_NOT_MATCH
        });
      }

    }
  }


  private LoadVideos = (): void => {
    let _galleryVideos = [];
    let thumbnailUrl: string = "";
    let videoURL: string = "";
    let videoURLArray: any;
    let filterCondition = this.getFilterString();

    commonService.GetVideos(this.props.listTitle, filterCondition, CONSTANTS.SELECTCOLUMNS.VIDEO_GALLERY, CONSTANTS.ORDERBY.VIDEO_GALLERY).then((Video: any) => {
      console.log("Video", Video);
      Video.forEach((VideoItem: any, index: number) => {
        thumbnailUrl = "";
        videoURL = "";
        console.log("VideoItem", VideoItem);
        if (VideoItem.VideoThumbnail != null) {
          thumbnailUrl = JSON.parse(VideoItem.VideoThumbnail).serverUrl + JSON.parse(VideoItem.VideoThumbnail).serverRelativeUrl;
        } else {
          thumbnailUrl = this.props.context.pageContext.site.absoluteUrl + "/" + CONSTANTS.ICONS.VIDEO_GALLERY_DEFAULT_IMAGE;
        }

        videoURL = VideoItem.VideoURL.Url;
        _galleryVideos.push({
          original: thumbnailUrl,
          thumbnail: thumbnailUrl,
          embedUrl: videoURL,
          renderItem: this._renderVideo.bind(this)
        });

      });
      if (_galleryVideos.length == 0) {
        _galleryVideos.push({
          original: require('../../../Common/Images/no_video_avilable.png'),
          thumbnail: require('../../../Common/Images/no_video_avilable.png')
        });
      }
      this.setState({
        galleryVideos: _galleryVideos
      });
    });
  }

  private getFilterString = (): string => {

    let filterString: string = "";
    let andCondition: string = " and ";
    if (g_selectedRegion != "" && g_selectedRegion != "Select") {
      filterString = "Region eq '" + g_selectedRegion + "'";
    }
    if (g_selectedProgramType != "" && g_selectedProgramType != "Select") {
      filterString += filterString != "" ? andCondition : "";
      filterString += "Program_x0020_Type eq '" + g_selectedProgramType + "'";
    }
    return filterString;
  }


  //function to render the video in image gallery
  private _renderVideo(item) {


    return (
      <div className={styles.videoGallery}>
        {
          this.state.showVideo[item.embedUrl] ?
            item.embedUrl.includes("microsoftstream") ?

              <div className='video-wrapper'>
                <a
                  className={styles['close-video']}
                  onClick={this._toggleShowVideo.bind(this, item.embedUrl)}
                >
                </a>
                <iframe
                  //width='350'
                  // height='315'
                  className="videogallerycontent"
                  src={item.embedUrl}
                  frameBorder='0'
                  allowFullScreen
                  allow="accelerometer; autoplay;  clipboard-write; encrypted-media; gyroscope; picture-in-picture"

                >
                </iframe>
              </div>
              :
              <div className={styles['player-wrapper']} >
                <a
                  className={styles['close-video']}
                  onClick={this._toggleShowVideo.bind(this, item.embedUrl)}
                >
                </a>
                <ReactPlayer width={"100%"} height={"100%"} className={styles['react-player']} controls={true} url={item.embedUrl} id={item.embedUrl} ref={this.ref} onDuration={(time) => console.log('duration', time)} playing={this.state.playing}
                  onPause={() => this._onPause(item.embedUrl)}
                />
              </div>
            :
            <a onClick={this._toggleShowVideo.bind(this, item.embedUrl)}>
              <div className={styles['play-button']}  ></div>
              <img className='image-gallery-image' src={item.original} />
              {
                item.description &&
                <span
                  className='image-gallery-description'
                  style={{ right: '0', left: 'initial' }}
                >
                  {item.description}
                </span>
              }
            </a>
        }
      </div>
    );
  }

  public checkStreamVideoUrl = async (url) => {
    var condition: boolean;
    if (url.includes("microsoftstream")) {
      console.log("url", url);
      console.log("microsoftstream true");
      condition = true;
    }
    else {
      console.log("microsoftstream false");
      condition = true;
    }
    console.log("condition", condition);
    return false;
  }
  public _toggleShowVideo = (url) => {
    debugger;
    // alert("close");
    // if (url.includes("microsoftstream") == true) {
    //   this._submitDetails(url);
    // };
    this._submitDetails(url);
    this.state.showVideo[url] = !Boolean(this.state.showVideo[url]);
    this.setState({
      showVideo: this.state.showVideo
    });

    if (this.state.showVideo[url]) {
      if (this.state.showPlayButton) {
        this.setState({ showGalleryPlayButton: false });
      }

      if (this.state.showFullscreenButton) {
        this.setState({ showGalleryFullscreenButton: false });
      }
    }
  }

  public load = url => {
    this.setState({ url: url, played: 0, loaded: 0, pip: true });
  }

  private _onSlide(index) {
    this._resetVideo();
  }

  private _resetVideo() {
    this.setState({ showVideo: {} });

    if (this.state.showPlayButton) {
      this.setState({ showGalleryPlayButton: true });
    }

    if (this.state.showFullscreenButton) {
      this.setState({ showGalleryFullscreenButton: true });
    }
  }


  //_submitDetails function to update and insert details
  public _submitDetails = async (url) => {
    // debugger

    const VideoViewers = await sp.web.lists.getByTitle("VideoViewers").items.get();
    console.log("VideoViewers", VideoViewers);
    console.log("this.player.current", this.player.current);

    // alert("_submitDetails");
    this.load(url);

    const urlArr = [];
    // console.log("url", url)
    urlArr.push(url);

    const items2 = await sp.web.lists.getByTitle(this.props.listTitle).items.get();
    // console.log("items2", items2)
    let user: ISiteUsers = await sp.web.currentUser();
    console.log("user", user);


    //get user object by Email
    const useremail = await sp.web.siteUsers.getByEmail(user["UserPrincipalName"]);
    console.log("LoginName", useremail);

    const uservalue: number = user["Id"];
    const user2: ISiteUserProps = await sp.web.getUserById(uservalue).get();
    console.log("uservalue", uservalue);

    //sp sites tenant url
    var tenantUri = window.location.protocol + "//" + window.location.host;
    //you can replace window.location.protocol with https: as in case of SPO it will always be https 
    // console.log("tenantUri", tenantUri);

    //current sp site page url
    var currentPageUrl = await this.props.context.pageContext.site.serverRequestPath;
    // console.log("currentPageUrl", currentPageUrl)



    // our page instance
    const page: IClientsidePage = await sp.web.loadClientsidePage(currentPageUrl);

    const cusers = await sp.web.siteUsers();
    console.log("cusers", cusers);

    let groups = await sp.web.currentUser.groups();

    console.log("groups", groups);

    const perms2 = await sp.web.getCurrentUserEffectivePermissions();
    console.log("perms2", perms2);

    let dummyString = "10032001d355646b";
    let finalString = dummyString.replace(/["]+/g, '');
    console.log("finalString", finalString);


    //for get play video Duration time

    if (url.includes("microsoftstream") == false) {
      //for get current time
      const node: any = this.player;
      console.log("myref", node);
      console.log("node", node.getCurrentTime());
      const tymcount = (node.getCurrentTime());
      const timecount = (tymcount / 60);
      console.log("timecount", timecount);
      const duration = (node.getDuration());
      let total_Vdo_Duration = (duration / 60);
      this.setState({ timecount: timecount });
      this.setState({ total_Vdo_Duration: total_Vdo_Duration });
    }
    else {
      this.setState({ timecount: null });
      this.setState({ total_Vdo_Duration: null });

    }
    //end for get play video Duration time


    //for matching records
    var ViewerId = null;
    var VideoURL = null;
    var date1 = null;

    var rowId = null;
    let today = moment(new Date()).format("DD-MM-YYYY");
    console.log("today", today);



    VideoViewers.map(async (row: any) => {

      let date = moment(row.Modified).format("DD-MM-YYYY");
      console.log("date", date);

      if (row.ViewerId == uservalue && row.VideoURL.match(url) && date == today) {
        console.log("in mam if");

        ViewerId = row.ViewerId;
        VideoURL = row.VideoURL;
        date1 = date;
        rowId = row.ID;
      }


    });


    console.log("user email", user["UserPrincipalName"]);


    const items3 = {
      VideoURL: url,
      ViewerId: uservalue,
      PageURL: tenantUri + currentPageUrl,
      Video_Play_Duration: this.state.timecount,
      Video_Total_Duration: this.state.total_Vdo_Duration,
      ViewerEmail: user["UserPrincipalName"],

    };
    console.log("items3", items3);
    // for update and instert viewer details in list
    if (this.state.checkItems == items3) {
      console.log("condition True");
    }

    if (ViewerId == uservalue && VideoURL.match(url) && date1 == today) {
      // console.log("successfull");

      const itemUpdate = await sp.web.lists.getByTitle("VideoViewers").items.getById(rowId).update({
        Title: "Title",
        VideoURL: url,
        ViewerId: uservalue,
        PageURL: tenantUri + currentPageUrl,
        Video_Play_Duration: this.state.timecount,
        Video_Total_Duration: this.state.total_Vdo_Duration,
        ViewerEmail: user["UserPrincipalName"]
      }).then((dt) => console.log("update items", dt));

    }
    else {
      // console.log("unnsuccessfull");
      if (this.state.checkItems.VideoURL == items3.VideoURL && this.state.checkItems.ViewerId == items3.ViewerId && this.state.checkItems.VideoURL == items3.VideoURL) {

      }
      else {
        console.log('CONDITON TRUE');
        const items2 = {
          VideoURL: url,
          ViewerId: uservalue,
          PageURL: tenantUri + currentPageUrl,
          Video_Play_Duration: this.state.timecount,
          Video_Total_Duration: this.state.total_Vdo_Duration,
          ViewerEmail: user["UserPrincipalName"],

        };
        console.log("it2", items2);
        this.setState({ checkItems: items2 });

        const items = await sp.web.lists.getByTitle("VideoViewers").items.add({
          Title: "Title",
          VideoURL: url,
          ViewerId: uservalue,
          PageURL: tenantUri + currentPageUrl,
          Video_Play_Duration: this.state.timecount,
          Video_Total_Duration: this.state.total_Vdo_Duration,
          ViewerEmail: user["UserPrincipalName"]
        });

        console.log("items", items);
      }



    }


    console.log("this.state.checkItems", this.state.checkItems);
  }



  public _onPause = async (url) => {

    // alert("Puse function");
    const VideoViewers = await sp.web.lists.getByTitle("VideoViewers").items.get();
    console.log("VideoViewers", VideoViewers);
    console.log("this.player.current", this.player.current);


    this.load(url);

    const urlArr = [];
    // console.log("url", url)
    urlArr.push(url);

    const items2 = await sp.web.lists.getByTitle(this.props.listTitle).items.get();
    // console.log("items2", items2)
    let user: ISiteUsers = await sp.web.currentUser();
    console.log("user", user);


    //get user object by Email
    const useremail = await sp.web.siteUsers.getByEmail(user["UserPrincipalName"]);
    console.log("LoginName", useremail);

    const uservalue: number = user["Id"];
    const user2: ISiteUserProps = await sp.web.getUserById(uservalue).get();
    console.log("uservalue", uservalue);

    //sp sites tenant url
    var tenantUri = window.location.protocol + "//" + window.location.host;
    //you can replace window.location.protocol with https: as in case of SPO it will always be https 
    // console.log("tenantUri", tenantUri);

    //current sp site page url
    var currentPageUrl = await this.props.context.pageContext.site.serverRequestPath;
    // console.log("currentPageUrl", currentPageUrl)



    // our page instance
    const page: IClientsidePage = await sp.web.loadClientsidePage(currentPageUrl);

    const cusers = await sp.web.siteUsers();
    console.log("cusers", cusers);

    let groups = await sp.web.currentUser.groups();

    console.log("groups", groups);

    const perms2 = await sp.web.getCurrentUserEffectivePermissions();
    console.log("perms2", perms2);

    let dummyString = "10032001d355646b";
    let finalString = dummyString.replace(/["]+/g, '');
    console.log("finalString", finalString);


    //for get play video Duration time

    if (url.includes("microsoftstream") == false) {
      //for get current time
      const node: any = this.player;
      console.log("myref", node);
      console.log("node", node.getCurrentTime());
      const tymcount = (node.getCurrentTime());
      const timecount = (tymcount / 60);
      console.log("timecount", timecount);
      const duration = (node.getDuration());
      let total_Vdo_Duration = (duration / 60);
      this.setState({ timecount: timecount });
      this.setState({ total_Vdo_Duration: total_Vdo_Duration });
    }
    else {
      this.setState({ timecount: null });
      this.setState({ total_Vdo_Duration: null });

    }
    //end for get play video Duration time


    //for matching records
    var ViewerId = null;
    var VideoURL = null;
    var date1 = null;

    var rowId = null;
    let today = moment(new Date()).format("DD-MM-YYYY");
    console.log("today", today);

    // if (VideoViewers.length == 0) {
    //   console.log("VideoViewers", VideoViewers)
    //   const items = await sp.web.lists.getByTitle("VideoViewers").items.add({
    //     Title: "Title",
    //     VideoURL: url,
    //     ViewerId: uservalue,
    //     PageURL: tenantUri + currentPageUrl,
    //     Video_Play_Duration: this.state.timecount,
    //     Video_Total_Duration: this.state.total_Vdo_Duration
    //   });
    // }
    // debugger
    VideoViewers.map(async (row: any) => {

      let date = moment(row.Modified).format("DD-MM-YYYY");
      console.log("date", date);

      if (row.ViewerId == uservalue && row.VideoURL.match(url) && date == today) {
        console.log("in mam if");

        ViewerId = row.ViewerId;
        VideoURL = row.VideoURL;
        date1 = date;
        rowId = row.ID;
      }


    });


    console.log("user email", user["UserPrincipalName"]);

    // for update and instert viewer details in list
    if (ViewerId == uservalue && VideoURL.match(url) && date1 == today) {
      // console.log("successfull");

      const itemUpdate = await sp.web.lists.getByTitle("VideoViewers").items.getById(rowId).update({
        Title: "Title",
        VideoURL: url,
        ViewerId: uservalue,
        PageURL: tenantUri + currentPageUrl,
        Video_Play_Duration: this.state.timecount,
        Video_Total_Duration: this.state.total_Vdo_Duration,
        ViewerEmail: user["UserPrincipalName"]
      }).then((dt) => console.log("update items", dt));

    }
    else {
      // console.log("unnsuccessfull");
      // const items = await sp.web.lists.getByTitle("VideoViewers").items.add({
      //   Title: "Title",
      //   VideoURL: url,
      //   ViewerId: uservalue,
      //   PageURL: tenantUri + currentPageUrl,
      //   Video_Play_Duration: this.state.timecount,
      //   Video_Total_Duration: this.state.total_Vdo_Duration,
      //   ViewerEmail: user["UserPrincipalName"]
      // });

      // console.log("items", items);
    }


  }

  public handleVideoUpload = (event) => {
    const [file] = event.target.files;
    this.setState({ setVideoFilePath: URL.createObjectURL(file) });

  }
  public ref = (player: any) => {
    this.player = player;
    // this.player.current.focus();
    console.log("this.player", this.player);
  }
  public render(): React.ReactElement<IVideoGalleryProps> {


    return (
      <div className={styles.videoGallery} >
        <div>
          <h1 className={styles.videoGalleryHeader}>{this.props.webpartTitle}</h1>
        </div>
        {
          this.state.error == "" ?
            <div className={styles.container}>
              <Stack>
                {this.state.error}


                <div className={styles.videoGalleryDiv}>
                  <ImageGallery
                    items={this.state.galleryVideos}
                    showNav={this.props.showNav}
                    thumbnailPosition={this.props.thumbnailPosition}
                    lazyLoad={false}
                    onSlide={this._onSlide.bind(this)}
                    infinite={this.props.infinite}
                    showBullets={this.props.showBullets}
                    showFullscreenButton={false}
                    showPlayButton={false}
                    showThumbnails={this.props.showThumbnails}
                    showIndex={this.props.showIndex}
                    isRTL={this.state.isRTL}
                    slideDuration={(this.props.slideDuration)}
                    slideInterval={(this.props.slideInterval)}
                    slideOnThumbnailOver={this.props.slideOnThumbnailOver}
                    additionalClass="app-image-gallery"
                    useWindowKeyDown={this.props.useWindowKeyDown}
                  />
                </div>
              </Stack>
            </div>
            : <div className={styles.errorDiv}>
              <MessageBar messageBarType={MessageBarType.error}>
                {this.state.error}
              </MessageBar></div>
        }


      </div >
    );
  }
}
