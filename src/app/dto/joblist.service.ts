import { Injectable } from '@angular/core';

@Injectable({   providedIn: 'root' })
export class JoblistService {
  constructor() {
  }

  // public _id: number = 0;
  // public _name: string = "";
  // public _starttime: any = "";
  // public _downloadStatus: boolean = false;
  // public _downloadURL: string = "";
  // public _projectname:  string = "";
  // public _publicationId: string = "";


  public _jobId: string = "";
  public _fileName: string = "";
  public _starttime: any = "";
  public _downloadStatus: boolean = false;
  public _downloadURL: string = "";
  public _projectname: string = "";
  public _publicationId: string = "";
  public _html5Preview: boolean = false;

  public _progress: string = "0";
  public _step: string = "0";
  public _stepCount: string = "5"
  public _generationStatus: number = 100;
  public _outputmedium:string="";
  public _firstPreview : number =  0;

}
