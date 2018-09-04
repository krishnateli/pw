import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sync',
  template: `<ng-content></ng-content>`
})
export class SyncComponent implements OnInit {
  constructor(private router: Router) { }
  ngOnInit() {
    this.router.navigate(['/PublicationWizard/home']);
  }
}
