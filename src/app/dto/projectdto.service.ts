import { Injectable } from '@angular/core';

import { MasterPublicationdtoService } from './masterPublicationdto.service';

@Injectable({   providedIn: 'root' })
export class ProjectdtoService {
  constructor() {
  }

  public _dataSourceFetchtime: any;
  public _currentDSFile: string = "";
  public _dataFiles: any = "";
  public name: string = "";
  public _selectedDataSouce: any = "";
  public _arrayLogLanguageFlagList: any = [];
  public masterPublications: MasterPublicationdtoService[] = [];
  public publications: Publication[] = [];
  
  public _allStacks: any[] = [];

  public _stackElementPreview: any = {};

  public _masterPages: any = [];
  public _staticPages: any = [];

  public setDataSourceFetchtime(dataSourceFetchtime: any) {
    this._dataSourceFetchtime = dataSourceFetchtime;
  }

  public get dataSourceFetchtime(): any {
    return this._dataSourceFetchtime;
  }
}


/*Separate Publication Object */
export class Publication {
  constructor() {
  }

  public id: string = "";
  public name: string = "";
  public redactionProperties: Object = {};
  public masterPublicationId: string = "";

}
