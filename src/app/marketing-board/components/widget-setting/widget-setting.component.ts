import { Component, OnInit, Output,EventEmitter,Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-widget-setting',
  templateUrl: './widget-setting.component.html',
  styleUrls: ['./widget-setting.component.scss']
})
export class WidgetSettingComponent implements OnInit  {

  constructor(public dialogRef: MatDialogRef<WidgetSettingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

    productState:boolean; 
    activityStream:boolean;
    toDoList:boolean;

    @Output() _productState: EventEmitter<boolean> = new EventEmitter();  
    @Output() _activityStream: EventEmitter<boolean> = new EventEmitter();  
    @Output() _toDoList: EventEmitter<boolean> = new EventEmitter();  


  ngOnInit() {
    this.dialogRef.updatePosition({ top: '50px', right: '50px' });
    this.productState = this.data.productState;
    this.activityStream = this.data.activityStream;
    this.toDoList = this.data.toDoList;
  }


  toggleProductState() {
    this.productState = !this.productState;
    this._productState.emit(this.productState);
  }

  toggleActivityStream() {
    this.activityStream = !this.activityStream;
    this._activityStream.emit(this.activityStream);
  }

  toggleToDoList() {
    this.toDoList = !this.toDoList;
    this._toDoList.emit(this.toDoList);
  }

}
