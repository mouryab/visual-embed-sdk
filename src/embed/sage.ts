/**
 * Copyright (c) 2022
 *
 * Embed ThoughtSpot Sage
 *
 * @summary TS Sage embed
 * @author Mourya Balabhadra <mourya.balabhadra@thoughtspot.com>
 */

import {
    Action, DOMSelector, EmbedEvent, MessagePayload, Param, ViewConfig,
} from '../types';
import { getQueryParamString } from '../utils';
import { V1Embed } from './ts-embed';

/**
 * The configuration attributes for the embedded search view.
 *
 * @group Embed components
 */
export interface SageViewConfig extends ViewConfig {
    /**
     * If set to false, eureka results are hidden
     */
    hideEurekaResults?: boolean;
    /**
     * primary flag to enable eureka(/sage) page embedding.
     */
    isSageEmbed?: boolean,
    /**
     * flag to disable changing worksheet. default false.
     */
    disableWorksheetChange?: boolean,
    /**
     * flag to hide worksheet selector. default false.
     */
    hideWorksheetSelector?: boolean,
    /**
     * If true, the main navigation bar within the ThoughtSpot app
     * is displayed. By default, the navigation bar is hidden.
     */
    showPrimaryNavbar?: boolean;
    /**
     * If true, help and profile buttons will hide on NavBar. By default,
     * they are shown.
     */
    disableProfileAndHelp?: boolean;
    /**
     * If true, application switcher button will hide on NavBar. By default,
     * they are shown.
     */
    hideApplicationSwitcher?: boolean;
    /**
     * If true, org switcher button will hide on NavBar. By default,
     * they are shown.
     */
    hideOrgSwitcher?: boolean;
    /**
     * If set to true, the embedded object container dynamically resizes
     * according to the height of the pages which support fullHeight mode.
     *
     */
    fullHeight?:boolean;
    /**
     * If set to true, the eureka search suggestions are not shown
     *
     */
    hideEurekaSuggestions?: boolean;
}
export const HiddenActionItemByDefaultForSageEmbed = [
    Action.Save,
    Action.Pin,
    Action.EditACopy,
    Action.SaveAsView,
    Action.UpdateTML,
    Action.EditTML,
    Action.AnswerDelete,
    Action.Share,
];
/**
 * Embed ThoughtSpot search
 *
 * @group Embed components
 */
export class SageEmbed extends V1Embed {
    /**
     * The view configuration for the embedded ThoughtSpot sage.
     *
     */
    protected viewConfig: SageViewConfig;

    private defaultHeight = 500;

    // eslint-disable-next-line no-useless-constructor
    constructor(domSelector: DOMSelector, viewConfig: SageViewConfig) {
        super(domSelector, viewConfig);
        if (this.viewConfig.fullHeight === true) {
            this.on(EmbedEvent.RouteChange, this.setIframeHeightForNonEmbedLiveboard);
            this.on(EmbedEvent.EmbedHeight, this.updateIFrameHeight);
            this.on(EmbedEvent.EmbedIframeCenter, this.embedIframeCenter);
        }
    }

    /**
     * Constructs a map of parameters to be passed on to the
     * embedded Eureka or Sage search page.
     *
     * @returns {string} query string
     */
    protected getEmbedParams(): string {
        const {
            hideEurekaResults,
            isSageEmbed,
            disableWorksheetChange,
            hideWorksheetSelector,
            showPrimaryNavbar,
            disableProfileAndHelp,
            hideApplicationSwitcher,
            hideOrgSwitcher,
            fullHeight,
            hideEurekaSuggestions,
        } = this.viewConfig;

        const params = {};
        params[Param.EmbedApp] = true;
        params[Param.fullHeight] = !!fullHeight;
        params[Param.HideEurekaResults] = !!hideEurekaResults;
        params[Param.IsSageEmbed] = !!isSageEmbed;
        params[Param.DisableWorksheetChange] = !!disableWorksheetChange;
        params[Param.HideWorksheetSelector] = !!hideWorksheetSelector;
        params[Param.PrimaryNavHidden] = !showPrimaryNavbar;
        params[Param.HideProfleAndHelp] = !!disableProfileAndHelp;
        params[Param.HideApplicationSwitcher] = !!hideApplicationSwitcher;
        params[Param.HideOrgSwitcher] = !!hideOrgSwitcher;
        params[Param.HideEurekaSuggestions] = !!hideEurekaSuggestions;
        params[Param.HideActions] = [...(params[Param.HideActions] ?? [])];
        params[Param.HideActions] = [
            ...(params[Param.HideActions] ?? []),
            ...HiddenActionItemByDefaultForSageEmbed,
        ];

        return getQueryParamString(params, true);
    }

    /**
     * Set the iframe height as per the computed height received
     * from the ThoughtSpot app.
     *
     * @param {MessagePayload} data The event payload
     */
    private updateIFrameHeight = (data: MessagePayload) => {
        this.setIFrameHeight(Math.max(data.data, this.defaultHeight));
    };

    private embedIframeCenter = (data: MessagePayload, responder: any) => {
        const obj = this.getIframeCenter();
        responder({ type: EmbedEvent.EmbedIframeCenter, data: obj });
    };

    private setIframeHeightForNonEmbedLiveboard = (data: MessagePayload) => {
        if (!data.data.currentPath.startsWith('/embed/viz/')) {
            this.setIFrameHeight(this.defaultHeight);
        }
    };

    /**
     * Construct the URL of the embedded ThoughtSpot sage to be
     * loaded in the iframe
     *
     * @returns {string} iframe url
     */
    private getIFrameSrc() {
        const path = 'eureka';
        const tsPostHashParams = this.getThoughtSpotPostUrlParams();

        return `${this.getRootIframeSrc()}/embed/${path}${tsPostHashParams}`;
    }

    /**
     * Render the embedded ThoughtSpot Sage
     *
     * @returns {SageEmbed} Eureka/Sage embed
     */
    public render(): SageEmbed {
        super.render();

        const src = this.getIFrameSrc();
        this.renderV1Embed(src);

        return this;
    }
}
