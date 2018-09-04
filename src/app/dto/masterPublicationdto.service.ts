import { Injectable } from '@angular/core';

@Injectable({   providedIn: 'root' })
export class MasterPublicationdtoService {
  constructor() {
  }

  public masterPublicationName : string = "";
  public masterPublicationId : string = "";
  public allowedMasterPages : any[];
  public isPagesLoaded : boolean = false;

}