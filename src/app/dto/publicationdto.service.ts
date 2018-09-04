import { Injectable } from '@angular/core';
import { JoblistService } from './joblist.service';

@Injectable({   providedIn: 'root' })
export class PublicationdtoService {
  constructor() {
  }

  public setImage(image: string) {
    this._image = image;
  }

  public get image(): string {
    return this._image;
  }

  public setSelectedStack(selectedStack: any) {
    this._selectedStack = selectedStack;
  }

  public get selectedStack(): any {
    return this._selectedStack;
  }

  public setSelectedFilter(selectedFilter: any[]) {
    this._selectedFilter = selectedFilter;
  }

  public get selectedFilter(): any[] {
    return this._selectedFilter;
  }

  public setRespondata(respondata: any) {
    this._respondata = respondata;
  }

  public get respondata(): any {
    return this._respondata;
  }

  public setStacklist_table(stacklist_table: any[]) {
    this._stacklist_table = stacklist_table;
  }

  public get stacklist_table(): any[] {
    return this._stacklist_table;
  }

  public setElementlist_table(elementlist_table: any[]) {
    this._elementlist_table = elementlist_table;
  }

  public get elementlist_table(): any[] {
    return this._elementlist_table;
  }

  public setPubItem(pubItems: any[]) {
    this._pubItems = pubItems;
  }

  public get pubItems(): any[] {
    return this._pubItems;
  }

  public setSelectedStackFilter(selectedStackFilter: any) {
    this._selectedStackFilter = selectedStackFilter;
  }

  public get selectedStackFilter(): any {
    return this._selectedStackFilter;
  }

  public setAllSelectedStackFilters(allSelectedStackFilters: any[]) {
    this._allSelectedStackFilters = allSelectedStackFilters;
  }

  public get allSelectedStackFilters(): any[] {
    return this._allSelectedStackFilters;
  }

  public setStackListPageNumber(stackListPageNumber: number) {
    this._stackListPageNumber = stackListPageNumber;
  }

  public get stackListPageNumber(): number {
    return this._stackListPageNumber;
  }

  public setIsQuickPreview(isQuickPreview: boolean) {
    this._isQuickPreview = isQuickPreview;
  }

  public get isQuickPreview(): boolean {
    return this._isQuickPreview;
  }

  public setIsBuilderQuickPreview(isBuilderQuickPreview: boolean) {
    this._isBuilderQuickPreview = isBuilderQuickPreview;
  }

  public get isBuilderQuickPreview(): boolean {
    return this._isBuilderQuickPreview;
  }

  public setCheckMoreStackElementsAvailable(checkMoreStackElementsAvailable: boolean) {
    this._checkMoreStackElementsAvailable = checkMoreStackElementsAvailable;
  }

  public get checkMoreStackElementsAvailable(): boolean {
    return this._checkMoreStackElementsAvailable;
  }

  public setRowsOnPageSetLocalValues(rowsOnPageSetLocalValues: number[]) {
    this._rowsOnPageSetLocalValues = rowsOnPageSetLocalValues;
  }

  public get rowsOnPageSetLocalValues(): number[] {
    return this._rowsOnPageSetLocalValues;
  }

  public setTemplateList(templateList: any[]) {
    this._templateList = templateList;
  }

  public get templateList(): any[] {
    return this._templateList;
  }

  public setSelectedTemplate(selectedTemplate: string) {
    this._selectedTemplate = selectedTemplate;
  }

  public get selectedTemplate(): string {
    return this._selectedTemplate;
  }

  public setSelectedBuilderTemplate(selectedBuilderTemplate: string) {
    this._builderSelectedTemplate = selectedBuilderTemplate;
  }

  public get selectedBuilderTemplate(): string {
    return this._builderSelectedTemplate;
  }

  public setselectedDisplayValue(selectedDisplayValue: string) {
    this._selectedDisplayValue = selectedDisplayValue;
  }

  public get selectedDisplayValue(): string {
    return this._selectedDisplayValue;
  }
  public setIsChange(isChange: boolean) {
    this._isChange = isChange;
  }

  public get isChange(): boolean {
    return this._isChange;
  }

  public setSelectedRow(selectedRow: any) {
    this._selectedRow = selectedRow;
  }

  public get selectedRow(): any {
    return this._selectedRow;
  }

  public setSelectedStackRows(selectedStackRows: any[]) {
    this._selectedStackRows = selectedStackRows;
  }

  public get selectedStackRows(): any[] {
    return this._selectedStackRows;
  }

  public setSelectedBucketRows(selectedBucketRows: any[]) {
    this._selectedBucketRows = selectedBucketRows;
  }

  public get selectedBucketRows(): any[] {
    return this._selectedBucketRows;
  }

  public setStackflag(stackflag: number) {
    this._stackflag = stackflag;
  }

  public get stackflag(): number {
    return this._stackflag;
  }

  public setBucketflag(bucketflag: number) {
    this._bucketflag = bucketflag;
  }

  public get bucketflag(): number {
    return this._bucketflag;
  }

  public setDataSourceFetchtime(dataSourceFetchtime: any) {
    this._dataSourceFetchtime = dataSourceFetchtime;
  }

  public get dataSourceFetchtime(): any {
    return this._dataSourceFetchtime;
  }


  public setJob(job: JoblistService) {
    this._jobList.push(job);
  }
  public setJobList(jobList: JoblistService[]) {
    this._jobList = jobList;
  }

  public get jobList(): JoblistService[] {
    return this._jobList;
  }

  public setPreviewedPages(previewedPages: any) {
    this._previewedPages = previewedPages;
  }

  public get previewedPages(): any {
    return this._previewedPages;
  }

  public _displayImageArray: any = [];
  public _displayImageArrayStack: any = [];
  public _displayImageArrayBasket: any = [];
  public _imageArray: any = [];
  public selectedImage: any;
  public multipleFlag: boolean = false;
  public _elementImage: any = "";
  public _image: any = "";
  public _selectedStack: any = {}
  public _selectedFilter: any[] = [];
  public _selectedCheckFilter: any[] = [];
  public _respondata: any;
  public _stacklist_table = [];
  public _elementlist_table = []; //bucket Elements
  public _selectedStackFilter: any = "";
  public _allSelectedStackFilters: any[] = [];
  public _stackListPageNumber: number = 1;
  public _isQuickPreview: boolean = true;
  public _isBuilderQuickPreview: boolean = true;
  public _checkMoreStackElementsAvailable: boolean = false;
  public _rowsOnPageSetLocalValues: number[] = [20, 50, 100, 150];
  public _rowsOnPageSetBasketValues: number[] = [10, 20, 50, 150];
  public _templateList: any[] = [];
  public _selectedTemplate: string = "Quick_Preview";
  public _builderSelectedTemplate: string = "Quick_Preview";
  public _selectedDisplayValue: string = '';
  public _ElementSelectedDisplayValue: string = '';

  public _elementSelectedRow: any;
  public _selectedRow: any;
  public _selectedStackRows: any[] = [];
  public _selectedBucketRows: any[] = [];
  public _selectedBuilderStackRows: any[] = [];
  public _selectedBuilderBucketRows: any[] = [];

  public _stackflag: number = 0;
  public _bucketflag: number = 0;

  public _isChange: boolean = false;

  public _dataSourceFetchtime: any;
  public _dataSourceUploadStatus: boolean = false;
  // public _base64textString: string = "";
  public _uploadedFileName: string = "";
  public _logLanguageFlagList: any;
  public _currentDSFile: string = "";
  public _dataFiles: any = "";
  public _selectedDataSouce: any = "";
  public _arrayLogLanguageFlagList: any = [];
  public _defaultImageName = "default.jpg";
  public _defaultBuilderImageName = "default.jpg";


  public _previewedPages: any = {};
  public _pubItems: any = [];
  public _mainPubItems: any = [];
  public _selectedElem: any = [];
  public _previewAll = false;
  public _mPreviewAll = false;
  public _language = [];
  public _showProperties = "stackbasket";
  public _selectedBuilderLanguage = "";
  public _httpQueue: any = {};
  public _elemVariables: any = {};
  public _pageVariables = [];
  public reqImage: any;
  public _visitedBuilderPage: boolean = false;
  public _selectedElement = null;
  public _mainPubIndex: number = -1;


  public _selectedPages = [];
  public _currentSelectedPagesNumber = "";

  //generate
  public _selectedOutpuFormat: string = "";
  public _selectedLanguage: string = "";

  public _jobList: JoblistService[] = [];
  public _joblistId: number = -1;
  public _filterNames: any = [];
  public _dataStatus: boolean = false;
  public _filterListObject: any = [];
  public _filterBasketListObject: any = [];
  public _isGenerateSelectedPageSelected: boolean = false;
  public _basketSelectedFilters: any = [];
  public _stackSelectedFilters: any = [];
  public _elementSelectedFilters: any = [];
  public _isAppendMode: boolean = false;
  public _selectedAppendMode: string = 'APPEND_PAGES';
  public _appendFileName: string = "";
  public _clearAllFilter: boolean = false;
  public _serverAppendFilePath: string = "";
  public _styleNameCtrl: string = "";
  public _showRequiredVariables: boolean = false;
  public _incorrectImageQualityError: boolean = false;
  public _imageJPEGQualitySetting: number = 150;
  public _imagePNGQualitySetting: number = 150;
  public _isIncludeUpdateInformation: boolean = false;
  public _isIncludeBidirectionalUpdate: boolean = false;
  public _isIncludeUpdateVariables: boolean = false;
  public _isCreateIndesignPackage: boolean = false;
  public _isIncludeFonts: boolean = false;
  public _isIncludeGraphics: boolean = false;
  public _isIncludeProfiles: boolean = false;
  public _isUpdateGraphicslinks: boolean = false;
  public _isIncludeHiddenLayers: boolean = false;
  public _isSingleFileMode: boolean = false;
  public _isCopyImages: boolean = false;
  public _isPreview: boolean = false;

  public _isFlippingEffect: boolean = true;

  public previewStatus: boolean;
  public loaderStatus: boolean;
  public _loaderStatus: boolean;

  public dataStatus: boolean;
  public pagePreview: boolean;
  public previewBuilderStatus: boolean;
  public showSettingsDataSourceLoader: boolean;
  public generateDataStatus: boolean;
  public pageHeight: number;
  public pageWidth: number;
  public searchQuery: any;
  public searchQueryBasket: any;
  public searchQueryBuilderBasket: any;
  public searchQueryStack: any;
  public _staticPageLicenseMessage: boolean = false;

  public _dataSourceFile: any;
  public _dataRefreshFlag: boolean = false;
  public _dataRefreshMessege: any;
  public _messageClass: any;
  public _shiftStack: any;
  public _checkPointClick: any;
  public _eBasketCheckPointClick: any;
  public _eStacklistCheckPointClick: any;
  public _bBasketCheckPointClick: any;
  public _bStacklistCheckPointClick: any;

  public _params: any = [];
  public _columnWidth: number;
  public _ElementcolumnWidth: number;
  public _BuilderColumnWidth: number;
  public _ElementcolumnBasketWidth: number;
  public _BuildercolumnBasketWidth: number;

  public _ignoreProductStateLang;
  public _ignoreProductStateText;
  public _ignoreProductStateTextVariable;

  public _ignoreProductStateFlag: boolean = false;
  public _ignoreProductStateData: string;
  public _ignoreProductStateEnable = false;

  public _variableDate: string;
  public _variableMonth: string;
  public _variableYear: number;
  public _previewSubscribe: any;
  public _selectedArea: any = {};
  public _reloadBasketLoader: boolean = false;

  public _requestObjectBuilder : any;
  public showLoaderInSlider: boolean = false;
  public showPreviewLoaderInSlider: boolean = false;

  public _bucketToggle:boolean = true;
  public _toggleStaticMasterPages: boolean = true;
  public activePageIdForStaticPagePreview: any;
  public pagePreviewLoaderStatus = [];
  public firstSelectedPageIndex : any;
  public selectedPubPage : any;
  public selectedPubPages = [];
}
