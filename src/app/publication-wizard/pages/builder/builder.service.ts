import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { of, interval } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';

import { SharedDataService } from '../../../services/shared-data.service';
import { AppConfig } from '../../../app.config';
import { IbUtilsService } from '../../../services/ib-utils.service';
import { ConstantsService } from '../../../services/constants.service';
import { UtilsService } from '../../../shared/services//utils.service';
import { ProjectService } from '../../../services/project.service';


@Injectable({   providedIn: 'root' })
export class BuilderService {

  reqCount: number = 0;
  reqFlag: boolean = true;
  prevCount: number = 0;

  constructor(private http: HttpClient, private sharedDataService: SharedDataService, private appConfig: AppConfig, private ibUtilsService: IbUtilsService, private constantsService: ConstantsService, private utilsService: UtilsService, private projectService: ProjectService) { }

  isRendererStarted(rendererMedia: string) {
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, 'rendererMedia=' + encodeURIComponent(rendererMedia) + '&method=isRendererStarted')
      .pipe(catchError(this.ibUtilsService.handleError));
  }



  postStaticFile(event, project, masterPublication) {
    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      let file: File = fileList[0];
      let formData: FormData = new FormData();
      var contentType = 'application/octet-stream';
      if (file.name.toLowerCase().endsWith(".indd")) {
        contentType = 'application/x-indesign';
      }
      if (file.name.toLowerCase().endsWith(".pdf")) {
        contentType = 'application/pdf';
      }
      formData.append('Upload', new Blob([file], { type: contentType }), encodeURIComponent(file.name));
      formData.append('masterPublication', masterPublication);
      formData.append('project', project);
      return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.UPLOAD_SERVLET, formData)
        .pipe(catchError(this.ibUtilsService.handleError));
    }
  }

  getDefaultVariables(project: string, publication: string, pageid: string, areaid: string, dataelementindex: string, templateid: string, currentlink: string) {
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, 'project=' + encodeURIComponent(project) + '&publication=' + encodeURIComponent(publication) + '&pageid=' + pageid + '&areaid=' + areaid + '&dataelementindex=' + dataelementindex + '&templateid=' + templateid + '&currentlink=' + currentlink + '&method=getDefaultVariables')
      .pipe(catchError(this.ibUtilsService.handleError));
  }

  getVariables(project: string, publication: string, pagescopeid: string, pageid: string, areaid?: string, assigmentindex?: string, dataelementindex?: string) {
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, 'project=' + encodeURIComponent(project) + '&publication=' + encodeURIComponent(publication) + '&pagescopeid=' + encodeURIComponent(pagescopeid) + '&pageid=' + pageid + '&areaid=' + areaid + '&assigmentindex=' + assigmentindex + '&dataelementindex=' + dataelementindex + '&method=getVariables')
      .pipe(catchError(this.ibUtilsService.handleError));
  }

  getPagePreview(project: string, language: string, publication: string, pagescopeid: string) {
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, 'language=' + language + '&project=' + encodeURIComponent(project) + '&publication=' + encodeURIComponent(publication) + '&pagescopeid=' + encodeURIComponent(pagescopeid) + '&method=getPagePreview')
      .pipe(catchError(this.ibUtilsService.handleError));
  }

  convertIBPageScopeToStaticInDesign(project: string, language: string, publication: string, pagescopeid: string) {
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, 'language=' + language + '&project=' + encodeURIComponent(project) + '&publication=' + encodeURIComponent(publication) + '&pagescopeid=' + encodeURIComponent(pagescopeid) + '&method=convertIBPageScopeToStaticInDesign')
      .pipe(catchError(this.ibUtilsService.handleError));
  }

  getAlternativeTemplateList(project: string, publication: string, pagescopeid: string, areaid: string, pageid: string, clientonly: string) {
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, 'project=' + encodeURIComponent(project) + '&publication=' + encodeURIComponent(publication) + '&pagescopeid=' + encodeURIComponent(pagescopeid) + '&areaid=' + encodeURIComponent(areaid) + '&pageid=' + encodeURIComponent(pageid) + '&clientonly=' + encodeURIComponent(clientonly) + '&method=getAlternativeTemplateList')
      .pipe(catchError(this.ibUtilsService.handleError));
  }

  deleteStaticMasterPage(project: string, filename: string) {
    return this.http.post<any>(this.appConfig.getBaseURLWithContextPath() + this.constantsService.MIDDLEWARE_SERVLET, 'project=' + encodeURIComponent(project) + '&filename=' + encodeURIComponent(filename) + '&method=deleteStaticMasterPage')
      .pipe(catchError(this.ibUtilsService.handleError));
  }

  //functions related to builder page
  loadPages(currentPublicationObject, pages, masterPages) {
    let _pages = this.utilsService.deepCopy(pages)
    for (let page of _pages) {
      if (this.utilsService.isPresent(page)) {
        page._preview = false;
        page._mPreview = false;
        page._mPreviewUri = null;
        for (let mPage of masterPages) {
          if (page.pageDetails.pageId == mPage.id) {
            if (this.utilsService.isPresent(mPage.previewImage)) {
              page._mPreviewUri = mPage.previewImage;
              page._mPreview = true;
            }
          }
        }
        this.addToPlayArea(currentPublicationObject, page)
      }
    }
    this.ibUtilsService.updateMasterPageData(currentPublicationObject, currentPublicationObject._pubItems);
    this.ibUtilsService.updateMasterPageData(currentPublicationObject, currentPublicationObject._mainPubItems);
    this.checkOverFlowPages(currentPublicationObject, currentPublicationObject._pubItems);
    this.ibUtilsService.removeOverFlowPages(currentPublicationObject);
  }


  addToPlayArea(currentPublicationObject, data, _mainPubItemIndx?, _pubItemIndx?, callType?) {
    if (this.utilsService.isPresent(_mainPubItemIndx)) {
      currentPublicationObject._mainPubItems.splice(_mainPubItemIndx, 0, this.utilsService.deepCopy(data));
      currentPublicationObject._pubItems.splice(_pubItemIndx, 0, this.utilsService.deepCopy(data));
      if (data.type != 'InBetween') {
        currentPublicationObject._pubItems[_pubItemIndx]._preview = true;
        let pagesToPreview = [];
        pagesToPreview.push(data);
        return this.updateCachedPreview(currentPublicationObject, pagesToPreview, callType);
      }
    } else {
      currentPublicationObject._mainPubItems.push(this.utilsService.deepCopy(data));
      currentPublicationObject._pubItems.push(this.utilsService.deepCopy(data));
      if (data.type != 'InBetween') {
        currentPublicationObject._pubItems[currentPublicationObject._pubItems.length - 1]._preview = true;
        let pagesToPreview = [];
        pagesToPreview.push(data);
        return this.updateCachedPreview(currentPublicationObject, pagesToPreview, callType);
      }
    }
  }

  updateCachedPreview(currentPublication, pagesToPreview, callType?) {
    /* Check Renderer is on or not */
    this.isRendererStarted("INDD").subscribe((response) => {
      if (response.code == 100) {
        this.sharedDataService._isRendererOn = response.isRendererStarted;
        /* Updates cached preview pages if available or call getPreviwPages function if preview not available in cache. */
        if (!this.utilsService.isPresent(currentPublication._previewedPages[currentPublication._selectedBuilderLanguage])) {
          currentPublication._previewedPages[currentPublication._selectedBuilderLanguage] = [];
        }
        if (!this.utilsService.isPresent(currentPublication._httpQueue[currentPublication._selectedBuilderLanguage])) {
          currentPublication._httpQueue[currentPublication._selectedBuilderLanguage] = [];
        }

        let emptyPages = [];
        for (let p of pagesToPreview) {
          if (p.type == this.constantsService.INBETWEEN) {
            if (this.utilsService.isPresent(p.pagePlanItemAreaDetailsList)) {
              emptyPages[p.id] = "Empty";
              let allAreaStatic = p.pagePlanItemAreaDetailsList.every(this.isAreaStatic);
              if (allAreaStatic) {
                emptyPages[p.id] = "Not";
              }
              for (let areaDetails of p.pagePlanItemAreaDetailsList) {
                if (this.utilsService.isPresent(areaDetails.areaAssignment)) {
                  if (this.utilsService.isPresent(areaDetails.areaAssignment.assignedElements) && Object.keys(areaDetails.areaAssignment.assignedElements).length != 0) {
                    emptyPages[p.id] = "Not";
                  }
                }
              }
            }
          }
        }

        for (let ePage in emptyPages) {
          if (emptyPages[ePage] == "Empty") {
            let previewDummyObj = {
              pageId: "",
              previewImage: [],
              project: "",
              publication: "",
              _emptyPage: true
            }
            previewDummyObj.previewImage.push(this.constantsService.BLANKIMAGE);
            previewDummyObj.pageId = ePage;
            previewDummyObj.project = currentPublication._respondata.publication.project;
            previewDummyObj.publication = currentPublication._respondata.publication.id;
            if (currentPublication._previewedPages[currentPublication._selectedBuilderLanguage].map((el) => el.pageId).indexOf(ePage) == -1) {
              currentPublication._previewedPages[currentPublication._selectedBuilderLanguage].push(previewDummyObj);
            }
          }
        }

        if (Object.keys(currentPublication._previewedPages[currentPublication._selectedBuilderLanguage]).length == 0 && Object.keys(currentPublication._httpQueue[currentPublication._selectedBuilderLanguage]).length == 0) {
          for (let p of pagesToPreview) {
            currentPublication._httpQueue[currentPublication._selectedBuilderLanguage][p.id] = "Preview";
          }
        } else {
          let pIndex = [], rendererOn = false;
          let currPubNew = this.utilsService.deepCopy(pagesToPreview);
          let currPreviewedPages = this.utilsService.deepCopy(currentPublication._previewedPages[currentPublication._selectedBuilderLanguage]);

          for (let _i = 0; _i < currPubNew.length; _i++) {
            for (let _j = 0; _j < currPreviewedPages.length; _j++) {
              if (currPubNew[_i].id == currPreviewedPages[_j].pageId) {
                if ((currPubNew[_i].type != this.constantsService.INDESIGN) ||
                  (currPubNew[_i].type == this.constantsService.INDESIGN && !currPreviewedPages[_j].contentFromXMPParsing) ||
                  (currPubNew[_i].type == this.constantsService.INDESIGN && !currPreviewedPages[_j].contentFromXMPParsing && !this.sharedDataService._isRendererOn)) {
                  pIndex.push(currPubNew.map((el) => el.id).indexOf(currPreviewedPages[_j].pageId));
                  this.updateResponseData(currPreviewedPages[_j], null, null, callType);
                  break;
                }
              }
            }
          }
          if (pIndex.length != 0) {
            for (let k = pIndex.length - 1; k >= 0; k--) {
              currPubNew.splice(pIndex[k], 1);
            }
          }
          for (let p of currPubNew) {
            if (!this.utilsService.isPresent(currentPublication._httpQueue[currentPublication._selectedBuilderLanguage][p.id])) {
              if (this.utilsService.isPresent(currentPublication._requestObjectBuilder) && currentPublication._requestObjectBuilder.closed) {
                currentPublication._httpQueue[currentPublication._selectedBuilderLanguage] = [];
              }
              currentPublication._httpQueue[currentPublication._selectedBuilderLanguage][p.id] = "Preview";
            }
          }
        }
        if (!this.utilsService.isPresent(currentPublication._requestObjectBuilder) && Object.keys(currentPublication._httpQueue[currentPublication._selectedBuilderLanguage]).length != 0) {
          this.processQueue(currentPublication, callType);
        } else {
          if (this.utilsService.isPresent(currentPublication._requestObjectBuilder) && currentPublication._requestObjectBuilder.closed && Object.keys(currentPublication._httpQueue[currentPublication._selectedBuilderLanguage]).length != 0) {
            this.processQueue(currentPublication, callType);
          }
        }
      } else {
        this.ibUtilsService.showIBErrors(response);
      }
    });
  }

  checkOverFlowPages(currentPublicationObject, pages) {
    let groups = [];
    for (let i = 0; i < pages.length; i++) {
      let groupName = pages[i].parentId;
      if ((!groups[groupName]) && (groupName != "")) {
        groups[groupName] = [];
      }
      if ((groupName != "")) {
        groups[groupName].push(pages[i]);
      }
    }
    let _grp = [];
    for (let groupName in groups) {
      if (groups[groupName].length > 1) {
        _grp.push({ parentId: groupName, id: groups[groupName][0].id, data: groups[groupName] });
      }
    }
    for (let i = 0; i < pages.length; i++) {
      for (let j = 0; j < _grp.length; j++) {
        if (pages[i].parentId != "") {
          if (pages[i].parentId == _grp[j].parentId) {
            if (pages[i].id == _grp[j].id) {
              pages[i]._show = true;
            } else {
              pages[i]._hasGrp = true;
              pages[i]._show = false;
            }
          }
        }
      }
    }
    currentPublicationObject._mainPubItems = this.utilsService.deepCopy(currentPublicationObject._pubItems);
  }


  isAreaStatic(area) {
    return area.type == "StaticArea";
  }

  updateResponseData(response, startIndx?, lang?, callType?) {
    for (let pub of this.sharedDataService.publicationList) {
      if ((pub._respondata.publication.id == response.publication) && (pub._respondata.publication.project == response.project)) {
        if (this.utilsService.isPresent(lang)) {
          if (!this.utilsService.isPresent(pub._previewedPages[lang])) {
            pub._previewedPages[lang] = [];
          }
          if (pub._previewedPages[lang].map((el) => el.pageId).indexOf(response.pageId) != -1) {
            pub._previewedPages[lang].splice(pub._previewedPages[lang].map((el) => el.pageId).indexOf(response.pageId), 1);
          }
          pub._previewedPages[lang].push(this.utilsService.deepCopy(response));
          if (this.utilsService.isPresent(callType)) {
            this.updateStaticPagePreview(pub, response, lang);
          }
        }
        let pageIndex = pub._pubItems.map((el) => el.id).indexOf(response.pageId);
        let mainPubPageIndex = pub._mainPubItems.map((el) => el.id).indexOf(response.pageId);
        /* commented as preview pages not working */
        // if (this.utilsService.isPresent(pub._pubItems[pageIndex]._type) && pub._pubItems[pageIndex]._type == "preview") {
        //   return;
        // }
        if (startIndx == null) {
          pub._pubItems.splice(pageIndex, 1);
        }

        for (let k = pub._pubItems.length - 1; k >= 0; k--) {
          if (pub._pubItems[k]._type == "preview" && pub._pubItems[k].id == response.pageId) {
            pub._pubItems.splice(k, 1);
          }
        }
        if (!this.utilsService.isPresent(response._emptyPage)) {
          response._emptyPage = false;
        }
        for (let i = 0; i < response.previewImage.length; i++) {
          let _t = {};
          let uid = pageIndex + i;
          if ((i == 0) && (response.previewImage.length > 1)) {
            _t = { _type: "preview", imgdata: response.previewImage[i], _show: true, _length: response.previewImage.length, toggleOverFlowPage: true, id: response.pageId, parentId: pub._mainPubItems[mainPubPageIndex].parentId, uid: "preview." + uid, pageDetails: { pageId: pub._mainPubItems[mainPubPageIndex].pageDetails.pageId }, pageName: pub._mainPubItems[mainPubPageIndex].pageName, _preview: true, _previewLangChange: false, _emptyPage: response._emptyPage, type: pub._mainPubItems[mainPubPageIndex].type };
          } else {
            _t = { _type: "preview", imgdata: response.previewImage[i], _show: false, _length: response.previewImage.length, _hasGrp: true, id: response.pageId, parentId: pub._mainPubItems[mainPubPageIndex].parentId, uid: "preview." + uid, pageDetails: { pageId: pub._mainPubItems[mainPubPageIndex].pageDetails.pageId }, pageName: pub._mainPubItems[mainPubPageIndex].pageName, _preview: true, _previewLangChange: false, _emptyPage: response._emptyPage, type: pub._mainPubItems[mainPubPageIndex].type };
          }
          if (startIndx != null) {
            pub._pubItems.splice(startIndx + i, 0, _t);
          } else {
            pub._pubItems.splice(pageIndex + i, 0, _t);
          }
        }
      }
    }
    this.ibUtilsService.detectChangesInBuilderPage();
  }

  updateStaticPagePreview(currentPublication, response, lang) {
    if (currentPublication._mainPubItems.map((el) => el.id).indexOf(response.pageId) != -1) {
      if (currentPublication._mainPubItems[currentPublication._mainPubItems.map((el) => el.id).indexOf(response.pageId)].type == this.constantsService.INDESIGN) {
        this.ibUtilsService.getStaticPagesDB(this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex], (staticPages) => {
          for (let sPage of staticPages) {
            if (sPage.id == currentPublication._mainPubItems[currentPublication._mainPubItems.map((el) => el.id).indexOf(response.pageId)].pageDetails.pageId) {
              if (!this.utilsService.isPresent(sPage._staticPreview)) {
                sPage._staticPreview = {};
              }
              if (!this.utilsService.isPresent(sPage._staticPreview[lang])) {
                sPage._staticPreview[lang] = [];
              }
              sPage._staticPreview[lang] = response.previewImage;
            }
          }
        });
      }
    }
  }

  processQueue(currentPublication, callType?) {

    this.projectService.checkProjectSynchronization(currentPublication._respondata.publication.project).subscribe((response) => {
      if (response.code == 100) {
        if (!response.isSnchroInProgress) {
          currentPublication._requestObjectBuilder = interval(1000).pipe(tap(() => {
            if (this.reqFlag) {
              let tempPub: any, tempPreviewPages: any = [];
              tempPub = this.utilsService.deepCopy(currentPublication._respondata.publication);
              for (let page of currentPublication._mainPubItems) {
                for (let pageId in currentPublication._httpQueue[currentPublication._selectedBuilderLanguage]) {
                  if (page.id == pageId) {
                    tempPreviewPages.push(this.utilsService.deepCopy(page));
                  }
                }
              }

              this.ibUtilsService.removeTempElement(tempPreviewPages);
              let tempVariablesArray = this.utilsService.deepCopy(currentPublication._respondata.publication.variables);
              this.ibUtilsService.removeSelectedValueFromTempVariables(tempVariablesArray);

              tempPub.variables = this.utilsService.deepCopy(tempVariablesArray);
              tempPub.pages = this.utilsService.deepCopy(tempPreviewPages);

              for (let pageId in currentPublication._httpQueue[currentPublication._selectedBuilderLanguage]) {
                if (tempPub.pages[this.prevCount].id == pageId) {
                  if (currentPublication._httpQueue[currentPublication._selectedBuilderLanguage][pageId] == "Preview") {
                    this.getPreviewPages(tempPub, currentPublication, callType);
                  } else {
                    this.convertToInDesignPage(tempPub, currentPublication);
                  }
                }
              }

            }
          }),
            switchMap(() => this.intervalPreviewChecking(this.reqCount, currentPublication)))
            .subscribe((data) => {
            });
        } else {
          currentPublication._pubItems.map((page) => {
            page._preview = false;
          });
          this.utilsService.notificationWithTranslation("CODE_SYNCHRO_IN_PROGRESS", []);
        }
      } else {
        currentPublication._pubItems.map((page) => {
          page._preview = false;
        });
        this.utilsService.notificationWithTranslation("ERROR_PREVIEWING_IMAGE", []);
      }
    });

  }

  getPreviewPages(tempPublication, currentPublication, callType?) {

    if (this.utilsService.isPresent(tempPublication.pages[this.prevCount]) && (tempPublication.pages[this.prevCount].type != this.constantsService.INBETWEEN) && (!this.ibUtilsService.isStaticPageLicensed())) {
      let params = [];
      let previewDummyObj = {
        pageId: "",
        previewImage: [],
        project: "",
        publication: ""
      }
      previewDummyObj.previewImage.push(this.constantsService.BLANKIMAGE);
      previewDummyObj.pageId = tempPublication.pages[this.prevCount].id;
      previewDummyObj.project = currentPublication._respondata.publication.project;
      previewDummyObj.publication = currentPublication._respondata.publication.id;

      let languageSelected = currentPublication._selectedBuilderLanguage;
      if (this.utilsService.isPresent(languageSelected)) {
        if (!this.utilsService.isPresent(currentPublication._previewedPages[languageSelected])) {
          currentPublication._previewedPages[languageSelected] = [];
        }
        currentPublication._previewedPages[languageSelected].push(previewDummyObj);
      }
      if (!currentPublication._staticPageLicenseMessage) {
        currentPublication._staticPageLicenseMessage = true;
        this.utilsService.notificationWithTranslation("LICENSE_NOT_EXIST", params);
      }
      this.updateResponseData(previewDummyObj, null, languageSelected, callType);
    } else {
      if (this.utilsService.isPresent(tempPublication.pages[this.prevCount])) {
        let currPubPageId = tempPublication.pages[this.prevCount].id;

        this.reqCount++;
        if (currentPublication._selectedBuilderLanguage) {
          this.getPagePreview(currentPublication._respondata.publication.project, currentPublication._selectedBuilderLanguage, JSON.stringify(tempPublication), tempPublication.pages[this.prevCount].id).subscribe((response) => {
            this.reqCount--;
            if (this.utilsService.isPresent(currentPublication._httpQueue[currPubPageId])) {
              delete currentPublication._httpQueue[currPubPageId];
            }
            if (response.code == 100) {
              if (response.PreviewResultdataObject.previewImage.length == 0) {
                let pIndex = currentPublication._pubItems.map((el) => el.id).indexOf(response.PreviewResultdataObject.pageId);
                let params = [];
                params.push(currentPublication._pubItems[pIndex].pageDetails.pageId);
                if (response.PreviewResultdataObject.contentFromXMPParsing) {
                  this.utilsService.notificationWithTranslation("PREVIEW_NOT_AVAILABLE_PREVIEW_SETTING", params)
                } else {
                  this.utilsService.notificationWithTranslation("PREVIEW_NOT_AVAILABLE", params);
                }
                let previewDummyObj = {
                  pageId: "",
                  previewImage: [],
                  project: "",
                  publication: ""
                }
                previewDummyObj.previewImage.push(this.constantsService.BLANKIMAGE);

                previewDummyObj.pageId = response.PreviewResultdataObject.pageId;
                previewDummyObj.project = currentPublication._respondata.publication.project;
                previewDummyObj.publication = currentPublication._respondata.publication.id;

                currentPublication._previewedPages[response.language].push(previewDummyObj);
                response.PreviewResultdataObject = previewDummyObj;
              }
              this.updateResponseData(response.PreviewResultdataObject, null, response.language, callType);
            } else {
              let pIn = currentPublication._pubItems.map((el) => el.id).indexOf(currPubPageId);
              currentPublication._pubItems[pIn]._preview = false;
              if (response.code == this.constantsService.EXCEPTION) {
                if (response.message == "LICENSE_NOT_EXIST") {
                  if (!currentPublication._staticPageLicenseMessage) {
                    this.utilsService.notificationWithTranslation(response.message, []);
                    currentPublication._staticPageLicenseMessage = true;
                  }
                } else if (response.message == "CODE_SYNCHRO_IN_PROGRESS") {
                  this.utilsService.notificationWithTranslation(response.message, response.params);
                } else {
                  this.utilsService.notificationWithTranslation("ERROR_PREVIEWING_IMAGE", []);
                }
              } else {
                this.ibUtilsService.showIBErrors(response);
              }
            }
            this.ibUtilsService.detectChangesInBuilderPage();
          });
        } else {
          let pIn = currentPublication._pubItems.map((el) => el.id).indexOf(currPubPageId);
          currentPublication._pubItems[pIn]._preview = false;
          this.utilsService.notificationWithTranslation("NO_ALLOWED_LANGUAGE_FOR_PUBLICATION", []);
          this.ibUtilsService.detectChangesInBuilderPage();
        }
      }
    }

  }

  convertToInDesignPage(tempPublication, currentPublication) {
    if (this.utilsService.isPresent(tempPublication.pages[this.prevCount])) {
      let currPubPageId = tempPublication.pages[this.prevCount].id;
      this.reqCount++;
      this.convertIBPageScopeToStaticInDesign(currentPublication._respondata.publication.project, currentPublication._selectedBuilderLanguage, JSON.stringify(tempPublication), tempPublication.pages[this.prevCount].id).subscribe((response) => {
        this.reqCount--;
        if (this.utilsService.isPresent(currentPublication._httpQueue[currPubPageId])) {
          delete currentPublication._httpQueue[currPubPageId];
        }
        if (response.code == 100) {
          currentPublication._mainPubItems[currentPublication._mainPubItems.map((el) => el.id).indexOf(currPubPageId)].type = this.constantsService.INDESIGN;
          this.updateResponseData(response.PreviewResultdataObject, null, response.language);
          this.sharedDataService.publicationList[this.sharedDataService.activePublicationIndex]._isChange = true;
        } else {
          if (response.code == 102) {
            this.utilsService.notificationWithTranslation("CANNOT_CONVERT_TO_INDESIGN", '');
          } else {
            this.ibUtilsService.showIBErrors(response, 'ERROR_PREVIEWING_IMAGE');
          }
          currentPublication._pubItems[currentPublication._pubItems.map((el) => el.id).indexOf(currPubPageId)].type = this.constantsService.INBETWEEN;
          currentPublication._pubItems[currentPublication._pubItems.map((el) => el.id).indexOf(currPubPageId)]._preview = false;
        }
      });
      this.ibUtilsService.detectChangesInBuilderPage();
    }
  }

  intervalPreviewChecking(rCount, currentPublication) {
    let prevLenght = Object.keys(currentPublication._httpQueue[currentPublication._selectedBuilderLanguage]).length
    if (this.prevCount == (prevLenght - 1)) {
      currentPublication._httpQueue[currentPublication._selectedBuilderLanguage] = [];
      this.prevCount = 0;
      // this.reqCount = 0;
      this.reqFlag = true;
      currentPublication._requestObjectBuilder.unsubscribe();
      return of(currentPublication._requestObjectBuilder == null);
    }
    if (rCount < 5) {
      if (this.prevCount < (prevLenght - 1)) {
        this.prevCount++;
      }
      this.reqFlag = true;
      return of(true);
    }
    this.reqFlag = false;
    return of(false);
  }

}
