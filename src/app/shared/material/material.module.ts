import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTooltipModule, MatSlideToggleModule, MatNativeDateModule, MatDatepickerModule, MatFormFieldModule, MatProgressSpinnerModule, MatProgressBarModule, MatListModule, MatDialogRef, MAT_DIALOG_DATA, MatAutocompleteModule, MatButtonModule, MatCheckboxModule, MatDialogModule, MatMenuModule, MatExpansionModule, MatInputModule, MatSelectModule, MatCardModule, MatChipsModule, MatIconModule, MatTabsModule, MatToolbarModule } from '@angular/material';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule } from '@angular/material/snack-bar';


@NgModule({

  imports: [
    CommonModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatListModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatDialogModule,
    MatExpansionModule,
    MatRadioModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatTabsModule,
    MatMenuModule,
    MatToolbarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatTooltipModule,
  ],
  declarations: [],
  exports: [
    CommonModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatListModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatDialogModule,
    MatExpansionModule,
    MatRadioModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatTabsModule,
    MatMenuModule,
    MatToolbarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatTooltipModule
  ],
  providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }, { provide: MatDialogRef, useValue: {} }]
})
export class MaterialModule { }
