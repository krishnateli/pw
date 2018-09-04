import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedDataService } from '../../../services/shared-data.service';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit {

@Input() currentApp: string;
@Input() sideBarData: any;
@Input() publicationList = [];

  constructor(private router: Router, public sharedDataService: SharedDataService) {
 
  }

  ngOnInit() {
  }
  
}
