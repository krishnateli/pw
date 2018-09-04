import { Injectable } from '@angular/core';

@Injectable({   providedIn: 'root' })
export class ConstantsService {

  public STATICAREACOLOR: string = "#D31246";
  public FLOWAREACOLOR: string = "#67A2C0";
  public DYNAMICAREACOLOR: string = "#f9b256";
  public CONTINUEAREACOLOR: string = "#cecece";

  public PUBLICATION_WIZARD = "PublicationWizard";
  public MARKETING_BOARD = "MarketingBoard";

  public months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

  public IGNORE_PRODUCT_STATE: string = "IGNORE_PRODUCT_STATE";

  public IGNORE_PRODUCT_STATE_PARENT_ID: string = "IGNORE_PRODUCT_STATE";

  public SUCCESS: number = 100;
  public FAIL: number = 101;
  public EXCEPTION: number = 102;
  public MISSING_PARAMETER: number = 103;
  public USER_NOT_LOGGEDIN_EXCEPTION: number = 104;
  public CONNECTION_REFUSED: number = 105;

  public RIC_PIM_LIFECYCLE_STATUS: string = "PimLifecycleStatus";
  public RIC_LEGAL_VALIDATION_STATUS: string = "LegalValidationStatus";
  public RIC_TRANSLATION_STATUS: string = "TranslationStatus";

  public INBETWEEN: string = "InBetween";
  public INDESIGN: string = "InDesign";

  public KEY: string = "AgQIQAiBIgQABECRAiACAEiBECEABE";

  public BLANKIMAGE: string = "iVBORw0KGgoAAAANSUhEUgAAAI8AAADgCAIAAAC1o6JLAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAH0SURBVHhe7dEBDQAADMOg+ze96yApFrjF0ZakLUlbkrYkbUnakrQlaUvSlqQtSVuStiRtSdqStCVpS9KWpC1JW5K2JG1J2pK0JWlL0pakLUlbkrYkbUnakrQlaUvSlqQtSVuStiRtSdqStCVpS9KWpC1JW5K2JG1J2pK0JWlL0pakLUlbkrYkbUnakrQlaUvSlqQtSVuStiRtSdqStCVpS9KWpC1JW5K2JG1J2pK0JWlL0pakLUlbkrYkbUnakrQlaUvSlqQtSVuStiRtSdqStCVpS9KWpC1JW5K2JG1J2pK0JWlL0pakLUlbkrYkbUnakrQlaUvSlqQtSVuStiRtSdqStCVpS9KWpC1JW5K2JG1J2pK0JWlL0pakLUlbkrYkbUnakrQlaUvSlqQtSVuStiRtSdqStCVpS9KWpC1JW5K2JG1J2pK0JWlL0pakLUlbkrYkbUnakrQlaUvSlqQtSVuStiRtSdqStCVpS9KWpC1JW5K2JG1J2pK0JWlL0pakLUlbkrYkbUnakrQlaUvSlqQtSVuStiRtSdqStCVpS9KWpC1JW5K2JG1J2pK0JWlL0pakLUlbkrYkbUnakrQlaUvSlqQtSVuStiRtSdqStCVpS9KWpC1JW5K2JG1J2pK0JWlL0pakLUlbkrYkbUnakrTl2B6Rcv58H8T9OQAAAABJRU5ErkJggg==";

  public REFRESH_STATUS: string = "refreshStatus";

  public OPEN_PUBLICATION: string = "openPublication";

  public CREATE_PUBLICATION: string = "createPublication";

  public DUPLICATE_PUBLICATION: string = "duplicatePublication";

  public INDD: string = "INDD";

  public PUBLICATION_IDS: string = "publicationIds";

  public PUBLICATION_ID: string = "publicationId";

  public PROJECT_ID: string = "projectId";

  public CONTINUE_AREA: string = "ContinueArea";

  public STATIC_AREA: string = "StaticArea";

  public FLOW_AREA: string = "FlowArea";

  public DYNAMIC_AREA: string = "DynamicArea";

  public ERROR_OCCURED: string = "ERROR_OCCURED";

  public SAVE_ALL: string = "SAVEALL"

  /*servlet names */
  public AUTHENTICATION_SERVLET: string = "/AuthenticationServlet";
  public MIDDLEWARE_SERVLET: string = "/MiddlewareServlet";
  public MARKETING_BOARD_SERVLET: string = "/MarketingBoardServlet";
  public UPLOAD_SERVLET: string = "/upload";
  public ISLOGGEDIN: string = "isLoggedIn";

  /*Error messages */
  public STATIC_PAGE_ALREADY_EXISTS_ON_SERVER: string = "STATIC_PAGE_ALREADY_EXISTS_ON_SERVER"

  zoom = [
    {
      per: '10',
      zm: '0.5'
    },
    {
      per: '25',
      zm: '1'
    }, {
      per: '50',
      zm: '1.2625'
    }, {
      per: '75',
      zm: '1.525'
    }, {
      per: '100',
      zm: '1.7875'
    }, {
      per: '125',
      zm: '2.05'
    }, {
      per: '150',
      zm: '2.3125'
    }, {
      per: '175',
      zm: '2.575'
    }, {
      per: '200',
      zm: '2.8375'
    }, {
      per: '225',
      zm: '3.1'
    }, {
      per: '250',
      zm: '3.3625'
    }
  ];

  pageFilter = [
    {
      value: 'all',
      viewValue: 'All Pages'
    },
    {
      value: 'flow',
      viewValue: 'Flow Pages'
    },
    {
      value: 'single',
      viewValue: 'Single Pages'
    },
    {
      value: 'dynamic',
      viewValue: 'Dynamic Pages'
    }
  ];

}
