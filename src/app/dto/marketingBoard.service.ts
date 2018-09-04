import { Injectable } from '@angular/core';
import { JoblistService } from './joblist.service';

@Injectable({   providedIn: 'root' })
export class MarketingBoardService {
    constructor() {
    }

    public setStatisticsProject(statisticsProject: any) {
        this._statisticsProject = statisticsProject;
    }

    public get statisticsProject(): any {
        return this._statisticsProject;
    }

    public setStatisticsMasterPublication(statisticsMasterPublication: any) {
        this._statisticsMasterPublication = statisticsMasterPublication;
    }

    public get statisticsMasterPublication(): any {
        return this._statisticsMasterPublication;
    }

    public setStatisticsMasterPublicationMap(statisticsMasterPublicationMap: any) {
        this._statisticsMasterPublicationMap = statisticsMasterPublicationMap;
    }

    public get statisticsMasterPublicationMap(): any {
        return this._statisticsMasterPublicationMap;
    }

    public setStatisticsProjectPublication(statisticsProjectPublication: any) {
        this._statisticsProjectPublication = statisticsProjectPublication;
    }

    public get statisticsProjectPublication(): any {
        return this._statisticsProjectPublication;
    }

    public setStatisticsLogLanguageMap(statisticsLogLanguageMap: any) {
        this._statisticsLogLanguageMap = statisticsLogLanguageMap;
    }

    public get statisticsLogLanguageMap(): any {
        return this._statisticsLogLanguageMap;
    }

    public setStatisticsProjectArray(statisticsProjectArray: any) {
        this._statisticsProjectArray = statisticsProjectArray;
    }

    public get statisticsProjectArray(): any {
        return this._statisticsProjectArray;
    }

    public _statisticsProject: string;
    public _statisticsMasterPublication: string;
    public _statisticsProjectPublication: object;
    public _statisticsMasterPublicationMap: object;
    public _statisticsLogLanguageMap: object;
    public _statisticsProjectArray: any;
}