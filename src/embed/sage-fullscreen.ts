/**
 * Copyright (c) 2022
 *
 * Embed ThoughtSpot Sage fullscreen view
 *
 * @summary TS Sage embed
 * @author Mourya Balabhadra <mourya.balabhadra@thoughtspot.com>
 */

import {
    DataSourceVisualMode,
    DOMSelector,
    Param,
    Action,
    ViewConfig,
} from '../types';
import { getQueryParamString, checkReleaseVersionInBeta, getFilterQuery } from '../utils';
import { TsEmbed } from './ts-embed';
import { ERROR_MESSAGE } from '../errors';
import { getAuthPromise, getEmbedConfig } from './base';
import { getReleaseVersion } from '../auth';

// none of the below parameters are needed for sage fullscreen functionality
// keeping it similar to search data page

/**
 * The configuration attributes for the embedded Sage fullscreen view.
 *
 * @group Embed components
 */
export interface SageFullscreenConfig extends ViewConfig {
    /**
     * If set to true, the data sources panel is collapsed on load,
     * but can be expanded manually.
     */
    collapseDataSources?: boolean;
    /**
     * If set to true, hides the data sources panel.
     */
    hideDataSources?: boolean;
    /**
     * If set to true, hides the charts and tables in search answers.
     * This attribute can be used to create a custom visualization
     * using raw answer data.
     */
    hideResults?: boolean;
    /**
     * If set to true, the Search Assist feature is enabled.
     *
     */
    enableSearchAssist?: boolean;
    /**
     * If set to true, the tabular view is set as the default
     * format for presenting search data.
     */
    forceTable?: boolean;
    /**
     * The array of data source GUIDs to set on load.
     */
    dataSource?: string;

    /**
     * The answer session id of the answer to load.
     */
    answerSessionId?: string;
    /**
     * If set to true, Sage fullscreen view will render without the Search Bar
     * The chart/table should still be visible.
     */
    hideSearchBar?: boolean;
}

export const HiddenActionItemByDefaultForSageFullscreenEmbed = [
    Action.EditACopy,
    Action.SaveAsView,
    Action.UpdateTML,
    Action.EditTML,
    Action.AnswerDelete,
];

/**
 * Embed ThoughtSpot Sage
 *
 * @group Embed components
 */
export class SageFullscreenEmbed extends TsEmbed {
    /**
     * The view configuration for the embedded ThoughtSpot sage fullscreen.
     */
    protected viewConfig: SageFullscreenConfig;

    constructor(domSelector: DOMSelector, viewConfig: SageFullscreenConfig) {
        super(domSelector);
        this.viewConfig = viewConfig;
    }

    /**
     * Get the state of the data sources panel that the embedded
     * ThoughtSpot sage fullscreen will be initialized with.
     */
    private getDataSourceMode() {
        let dataSourceMode = DataSourceVisualMode.Expanded;
        if (this.viewConfig.collapseDataSources === true) {
            dataSourceMode = DataSourceVisualMode.Collapsed;
        }
        if (this.viewConfig.hideDataSources === true) {
            dataSourceMode = DataSourceVisualMode.Hidden;
        }

        return dataSourceMode;
    }

    protected getEmbedParams(): string {
        const {
            hideResults,
            enableSearchAssist,
            forceTable,
            runtimeFilters,
            dataSource,
        } = this.viewConfig;
        const queryParams = this.getBaseQueryParams();

        queryParams[Param.HideActions] = [
            ...(queryParams[Param.HideActions] ?? []),
            ...HiddenActionItemByDefaultForSageFullscreenEmbed,
        ];

        /* the below parameters are not needed but
        reusing the parameters we have for saved answer page */
        if (dataSource) {
            queryParams[Param.DataSources] = `["${dataSource}"]`;
        }
        if (enableSearchAssist) {
            queryParams[Param.EnableSearchAssist] = true;
        }
        if (hideResults) {
            queryParams[Param.HideResult] = true;
        }
        if (forceTable) {
            queryParams[Param.ForceTable] = true;
        }

        queryParams[Param.DataSourceMode] = this.getDataSourceMode();
        queryParams[Param.UseLastSelectedDataSource] = false;
        queryParams[Param.searchEmbed] = true;
        let query = '';
        const queryParamsString = getQueryParamString(queryParams, true);
        if (queryParamsString) {
            query = `?${queryParamsString}`;
        }
        const filterQuery = getFilterQuery(runtimeFilters || []);
        if (filterQuery) {
            query += `&${filterQuery}`;
        }
        return query;
    }

    /**
     * Construct the URL of the embedded ThoughtSpot sage fullscreen to be
     * loaded in the iframe
     *
     * @param answerSessionId The answer session id of the ad hoc answer
     * @returns iframe url
     */
    private getIFrameSrc(answerSessionId: string) {
        const answerPath = answerSessionId ? `ai-answer/${answerSessionId}` : 'answer';
        const tsPostHashParams = this.getThoughtSpotPostUrlParams();

        return `${this.getRootIframeSrc()}/embed/${answerPath}${tsPostHashParams}`;
    }

    /**
     * Render the embedded ThoughtSpot sage fullscreen
     */
    public render(): SageFullscreenEmbed {
        super.render();
        const { answerSessionId } = this.viewConfig;

        const src = this.getIFrameSrc(answerSessionId);
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
