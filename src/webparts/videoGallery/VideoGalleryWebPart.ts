import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  IPropertyPaneDropdownOption,
  PropertyPaneDropdown,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart, WebPartContext } from '@microsoft/sp-webpart-base';

import * as strings from 'VideoGalleryWebPartStrings';
import VideoGallery from './components/VideoGallery';
import { IVideoGalleryProps } from './components/IVideoGalleryProps';
import { sp } from '@pnp/sp/presets/all';

export interface IVideoGalleryWebPartProps {
  webpartTitle: string;
  webpartLabel: string;
  listTitle: string;
  context: WebPartContext;
  siteUrl: string;
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

export default class VideoGalleryWebPart extends BaseClientSideWebPart<IVideoGalleryWebPartProps> {
  private lists: IPropertyPaneDropdownOption[];
  private listsDropDownDisabled: boolean = false;
  protected onInit(): Promise<void> {
    return super.onInit().then(_ => {
      if (this.properties.webpartTitle == undefined) {
        this.properties.webpartTitle = "Video Gallery";
      }
      if (this.properties.webpartLabel == undefined) {
        this.properties.webpartLabel = "See All";
      }
      sp.setup({
        spfxContext: this.context
      });
    });
  }

  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void {
    super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);

    this.context.propertyPane.refresh();

    this.onDispose();
    this.render();

  }

  private loadLists(): Promise<IPropertyPaneDropdownOption[]> {
    return new Promise<IPropertyPaneDropdownOption[]>(
      (
        resolve: (options: IPropertyPaneDropdownOption[]) => void,
        reject: (error: any) => void
      ) => {
        sp.setup({
          sp: {
            baseUrl: this.context.pageContext.web.absoluteUrl
          }
        });
        sp.web.lists.get().then(listOptions => {
          let lists = [];
          listOptions.forEach(list => {
            if (!list.Hidden) {
              lists.push({
                key: list.Title,
                text: list.Title
              });
            }
          });
          resolve(lists);
        });

      });
  }
  protected onPropertyPaneConfigurationStart(): void {
    this.listsDropDownDisabled = !this.lists;
    if (this.lists) {
      return;
    }
    this.context.statusRenderer.displayLoadingIndicator(
      this.domElement,
      'lists'
    );
    this.loadLists().then(
      (listOptions: IPropertyPaneDropdownOption[]): void => {
        this.lists = listOptions;
        this.listsDropDownDisabled = false;
        this.context.propertyPane.refresh();
        this.context.statusRenderer.clearLoadingIndicator(this.domElement);
        this.render();
      }
    );
  }
  public render(): void {
    const element: React.ReactElement<IVideoGalleryProps> = React.createElement(
      VideoGallery,
      {
        webpartTitle: this.properties.webpartTitle,
        webpartLabel: this.properties.webpartLabel,
        listTitle: this.properties.listTitle,
        context: this.context,
        siteURL: this.context.pageContext.web.absoluteUrl,
        seeAllURL: this.properties.seeAllURL,
        showIndex: this.properties.showIndex,
        showBullets: this.properties.showBullets,
        infinite: this.properties.infinite,
        showThumbnails: this.properties.showThumbnails,
        showFullscreenButton: this.properties.showFullscreenButton,
        //showGalleryFullscreenButton: this.properties.showGalleryFullscreenButton,
        showPlayButton: this.properties.showPlayButton,
        //showGalleryPlayButton: this.properties.showGalleryPlayButton,
        showNav: this.properties.showNav,
        isRTL: this.properties.isRTL,
        slideDuration: this.properties.slideDuration,
        slideInterval: this.properties.slideInterval,
        slideOnThumbnailOver: this.properties.slideOnThumbnailOver,
        thumbnailPosition: this.properties.thumbnailPosition,
        useWindowKeyDown: this.properties.useWindowKeyDown
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {

          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [

                PropertyPaneTextField('webpartTitle', {
                  label: "Webpart Title",
                  multiline: false,
                  placeholder: "Enter webpart title",
                }),
                PropertyPaneTextField('webpartLabel', {
                  label: "See All Label",
                  multiline: false,
                  placeholder: "Enter label",
                }),
                PropertyPaneTextField('seeAllURL', {
                  label: "See All URL",
                  multiline: false,
                  placeholder: "Enter label",
                }),
                PropertyPaneDropdown('listTitle', {
                  label: "Select a List",
                  options: this.lists,
                  disabled: this.listsDropDownDisabled,
                  selectedKey: ' ',
                }),
                PropertyPaneToggle('infinite', {
                  label: 'Automatic Scrolling',
                  onText: 'On',
                  offText: 'Off'
                }),
                PropertyPaneToggle('showThumbnails', {
                  label: 'Image Thumbnails',
                  onText: 'On',
                  offText: 'Off'
                }), PropertyPaneTextField('slideInterval', {
                  label: "Play Slide Duration",
                  multiline: false,
                  placeholder: "Enter Play Slide Duration",
                }),
                PropertyPaneToggle('showGalleryPlayButton', {
                  label: 'Gallery Play Button',
                  onText: 'On',
                  offText: 'Off'
                }),
                PropertyPaneToggle('showNav', {
                  label: 'Navigation Buttons',
                  onText: 'On',
                  offText: 'Off'
                }),
                PropertyPaneTextField('slideDuration', {
                  label: "Navigation Slide Duration",
                  multiline: false,
                  placeholder: "Enter Navigation Slide Duration",
                }),
                PropertyPaneToggle('isRTL', {
                  label: 'Is Right To Left',
                  onText: 'On',
                  offText: 'Off'
                }),
                PropertyPaneToggle('slideOnThumbnailOver', {
                  label: 'Slide On Thumbnail Over',
                  onText: 'On',
                  offText: 'Off'
                }),

                PropertyPaneTextField('thumbnailPosition', {
                  label: "Thumbnail Position",
                  multiline: false,
                  placeholder: "Enter thumbnail position",
                }),
                PropertyPaneDropdown('thumbnailPosition', {
                  label: 'Thumbnail Position',
                  options: [

                    { key: 'top', text: 'top' },

                    { key: 'bottom', text: 'bottom' },

                    { key: 'left', text: 'left' },

                    { key: 'right', text: 'right' }

                  ]
                }),
              ]
            }
          ]
        }
      ]
    };
  }
}
