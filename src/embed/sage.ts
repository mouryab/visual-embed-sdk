/**
 * Copyright (c) 2022
 *
 * Embed ThoughtSpot Sage
 *
 * @summary TS Sage embed
 * @author Mourya Balabhadra <mourya.balabhadra@thoughtspot.com>
 * @author Kumar Animesh <animesh.kumar@thoughtspot.com>
 */

import {
    Action, DOMSelector, Param, ViewConfig,
} from '../types';
import { getQueryParamString, checkReleaseVersionInBeta } from '../utils';
import { TsEmbed } from './ts-embed';
import { ERROR_MESSAGE } from '../errors';
import { getAuthPromise, getEmbedConfig } from './base';
import { getReleaseVersion } from '../auth';

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
}
export const HiddenActionItemByDefaultForSageEmbed = [
    Action.Save,
    Action.Pin,
];
/**
 * Embed ThoughtSpot search
 *
 * @group Embed components
 */
export class SageEmbed extends TsEmbed {
    /**
     * The view configuration for the embedded ThoughtSpot sage.
     */
    protected viewConfig: SageViewConfig;

    constructor(domSelector: DOMSelector, viewConfig: SageViewConfig) {
        super(domSelector);
        this.viewConfig = viewConfig;
    }

    protected getEmbedParams(): string {
        const {
            hideEurekaResults, isSageEmbed, disableWorksheetChange, hideWorksheetSelector,
        } = this.viewConfig;
        const queryParams = this.getBaseQueryParams();

        queryParams[Param.HideActions] = [...(queryParams[Param.HideActions] ?? [])];
        queryParams[Param.HideActions] = [
            ...(queryParams[Param.HideActions] ?? []),
            ...HiddenActionItemByDefaultForSageEmbed,
        ];
        if (hideEurekaResults) {
            queryParams[Param.HideEurekaResults] = true;
        }
        if (isSageEmbed) {
            queryParams[Param.IsSageEmbed] = true;
        }
        if (disableWorksheetChange) {
            queryParams[Param.DisableWorksheetChange] = true;
        }
        if (hideWorksheetSelector) {
            queryParams[Param.HideWorksheetSelector] = true;
        }

        let query = '';
        const queryParamsString = getQueryParamString(queryParams, true);
        if (queryParamsString) {
            query = `?${queryParamsString}`;
        }
        return query;
    }

    /**
     * Construct the URL of the embedded ThoughtSpot sage to be
     * loaded in the iframe
     *
     * @returns iframe url - string
     */
    private getIFrameSrc() {
        const path = 'eureka';
        const tsPostHashParams = this.getThoughtSpotPostUrlParams();

        return `${this.getRootIframeSrc()}/embed/${path}${tsPostHashParams}`;
    }

    /**
     * Render the embedded ThoughtSpot Sage
     */
    public render(): SageEmbed {
        super.render();

        const src = this.getIFrameSrc();
        this.renderIFrame(src);
        getAuthPromise().then(() => {
            if (
                checkReleaseVersionInBeta(
                    getReleaseVersion(),
                    getEmbedConfig().suppressSageEmbedBetaWarning,
                )
            ) {
                alert(ERROR_MESSAGE.SAGE_EMBED_BETA_WARNING_MESSAGE);
            }
        });
        return this;
    }
}
