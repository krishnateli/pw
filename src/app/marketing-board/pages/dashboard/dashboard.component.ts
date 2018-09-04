import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef} from '@angular/material';
import { Title } from '@angular/platform-browser';

import { WidgetSettingComponent } from '../../components/widget-setting/widget-setting.component';
import { StatisticsOfProductStateComponent } from '../../components/statistics-of-product-state/statistics-of-product-state.component';

import { SharedDataService } from "../../../services/shared-data.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  @ViewChild(StatisticsOfProductStateComponent)
  private statisticsOfProducts: StatisticsOfProductStateComponent;

  constructor(private title: Title,private dialog: MatDialog, private dialModalRef: MatDialogRef<any>, private sharedDataService: SharedDataService) { }

  productState: boolean = true;
  activityStream: boolean = true;
  toDoList: boolean = true;

  ngOnInit() {
    sessionStorage.clear();
    this.title.setTitle("Marketing Board");
    this.sharedDataService.setTitle("Dashboard");
  }

  openDialog() {
    const dialogRef = this.dialog.open(WidgetSettingComponent, {
      panelClass: "widgetDialog",
      data: { productState: this.productState, activityStream: this.activityStream, toDoList: this.toDoList }
    });

    dialogRef.componentInstance._productState.subscribe((productStateValue) => {
      this.productState = productStateValue;
    });

    dialogRef.componentInstance._activityStream.subscribe((activityStreamValue) => {
      this.activityStream = activityStreamValue;
    });

    dialogRef.componentInstance._toDoList.subscribe((toDoListValue) => {
      this.toDoList = toDoListValue;
    });

    dialogRef.afterClosed().subscribe(() => {
      dialogRef.componentInstance._productState.unsubscribe();
      dialogRef.componentInstance._activityStream.unsubscribe();
      dialogRef.componentInstance._toDoList.unsubscribe();
    });
  }

  refreshProductStatistics(){
    this.statisticsOfProducts.refreshProductStatistics();
  }
  
}
