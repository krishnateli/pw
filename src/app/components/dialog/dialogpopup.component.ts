import { Component, OnInit } from '@angular/core';

import { MatDialogRef } from '@angular/material';

import { SharedDataService } from '../../services/shared-data.service';

@Component({
  selector: 'dialog-result-example-dialog',
  templateUrl: 'dialogpopup.component.html',
  styleUrls: ['./dialogpopup.component.scss']
})
export class DialogPopup implements OnInit {
  userQuery: string;
  dialogName: string;
  customFontStyle: string;
  constructor(public dialogRef: MatDialogRef<DialogPopup>, public sharedDataService: SharedDataService) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.customFontStyle = this.sharedDataService._Customization.font ? this.sharedDataService._Customization.font.style : "";
  }
}
