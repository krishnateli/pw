import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicationWizardRoutingModule } from './publication-wizard-routing.module';

import { SharedModule } from '../shared/shared.module';
import { SplitPaneModule } from 'ng2-split-pane/lib/ng2-split-pane';

import { PublicationSelectionComponent } from './pages/publication-selection/publication-selection.component';
import { ElementSelectionComponent } from './pages/element-selection/element-selection.component';
import { BuilderComponent } from './pages/builder/builder.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { GenerateComponent } from './pages/generate/generate.component';
import { SyncComponent } from './pages/sync/sync.component';

import { SliderComponent } from './components/slider/slider.component';
import { FilterComponent } from './components/filter/filter.component';
import { TableComponent } from './components/table/table.component';
import { PreviewBoxComponent } from './components/preview-box/preview-box.component';

import { SelectedColumnPipe } from './pipes/selectedcolumn.pipe';
import { CheckboxfilterPipe } from './pipes/checkboxfilter.pipe';
import { SearchPipe } from './pipes/search.pipe';
import { GetFiltersPipe } from './pipes/get-filters.pipe';
import { ColumnPipe } from './pipes/column.pipe';
import { RowPipe } from './pipes/row.pipe';
import { CustomfilterPipe } from './pipes/customfilter.pipe';
import { SafeHTMLPipe } from './pipes/safe-html.pipe';
import { DisplaydataPipe } from './pipes/displaydata.pipe';
import { UniquePipe } from './pipes/unique.pipe';
import { FilterPipe } from './pipes/filter.pipe';
import { CustomdatePipe } from './pipes/customdate.pipe';
import { PreviewFilterPipe } from './pipes/preview-filter.pipe';
import { VariableTemplateComponent } from './components/variable-template/variable-template.component';
import { CoreComponent } from './core.component';
import { OpenPublicationComponent } from './components/open-publication/open-publication.component';
import { NewPublicationComponent } from './components/new-publication/new-publication.component';
import { DuplicatePublicationComponent } from './components/duplicate-publication/duplicate-publication.component';
import { LangStackFilterPipe } from './pipes/lang-stack-filter.pipe';



@NgModule({
  imports: [
    CommonModule,
    PublicationWizardRoutingModule,
    SharedModule,
    SplitPaneModule
  ],
  declarations: [
    SliderComponent,
    FilterComponent,
    SelectedColumnPipe,
    CheckboxfilterPipe,
    SearchPipe,
    GetFiltersPipe,
    ColumnPipe,
    RowPipe,
    CustomfilterPipe,
    SafeHTMLPipe,
    DisplaydataPipe,
    UniquePipe,
    FilterPipe,
    CustomdatePipe,
    PreviewFilterPipe,
    PreviewBoxComponent,
    PublicationSelectionComponent,
    ElementSelectionComponent,
    BuilderComponent,
    SettingsComponent,
    GenerateComponent,
    SyncComponent,
    TableComponent,
    VariableTemplateComponent,
    CoreComponent,
    OpenPublicationComponent,
    NewPublicationComponent,
    DuplicatePublicationComponent,
    LangStackFilterPipe
  ],
  providers: []
})
export class PublicationWizardModule { }
