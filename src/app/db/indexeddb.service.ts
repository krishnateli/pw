import { Injectable } from '@angular/core';
import { PublicationdtoService } from '../dto/publicationdto.service';
import { ProjectdtoService, Publication } from '../dto/projectdto.service';
import { AUTOCOMPLETE_OPTION_HEIGHT } from '@angular/material';

import { UtilsService } from '../shared/services/utils.service';

@Injectable({ providedIn: 'root' })
export class IndexedDBService {


  private INBETWEEN: string = "InBetween"; //DB name

  private PUBLICATIONS: string = "publications"; //object store

  /*Indexes of publications data store */
  private PUBLICATION_ID: string = "publicationID";
  private PUBLICATION_NAME: string = "publicationName";
  private PUBLICATION_OBJECT: string = "publicationObject";

  private PROJECTS: string = "projects"; //object store

  /*Indexes of projects data store */
  private PROJECT_NAME: string = "projectName";
  private PROJECT_OBJECT: string = "projectObject";

  /*DATABASE MODE */
  private READ_WRITE: string = "readwrite"
  private READ_ONLY: string = "readonly";

  db: any;

  public stacklistFromProject = new Map<string, any>();
  public projectMasterPages = new Map<string, Map<string, any>>();
  public projectStaticPages = new Map<string, Map<string, any>>();

  constructor(private utilsService: UtilsService) {
    // var self = this;
    if (!window.indexedDB) {
      window.alert("Your browser doesn't support a stable version of IndexedDB.")
    }
    this.initDatabase(function (db) {
    });
  }

  initDatabase(callback) {
    var self = this;
    if (this.db == undefined) {
      var request = window.indexedDB.open(this.INBETWEEN);
      request.onupgradeneeded = function () {
        // self.db = request.result;
        // var store1 = self.db.createObjectStore(self.PUBLICATIONS, { keyPath: self.PUBLICATION_ID });
        // var pubName = store1.createIndex(self.PUBLICATION_NAME, self.PUBLICATION_NAME); // { unique: true }
        // var pubObject = store1.createIndex(self.PUBLICATION_OBJECT, self.PUBLICATION_OBJECT);
        // var isActive = store1.createIndex(self.PROJECT_NAME, self.PROJECT_NAME);

        self.db = request.result;
        var store1 = self.db.createObjectStore(self.PUBLICATIONS, { keyPath: "ID" });
        store1.createIndex(self.PUBLICATION_ID, self.PUBLICATION_ID);
        store1.createIndex(self.PUBLICATION_NAME, self.PUBLICATION_NAME);
        store1.createIndex(self.PUBLICATION_OBJECT, self.PUBLICATION_OBJECT);
        store1.createIndex(self.PROJECT_NAME, self.PROJECT_NAME);


        self.db = request.result;
        var store2 = self.db.createObjectStore(self.PROJECTS, { keyPath: self.PROJECT_NAME });
        store2.createIndex(self.PROJECT_OBJECT, self.PROJECT_OBJECT);
      };
      request.onsuccess = function () {
        self.db = request.result;
        callback(self.db);
      };
    } else {
      callback(this.db);
    }
  }

  addPublication(publicationID, publicationName, publicationObject, projectName) {
    let PUB_ID: number = 1;
    let pubId = localStorage.getItem('PUB_ID');
    if (this.utilsService.isPresent(pubId)) {
      PUB_ID = parseInt(pubId);
      PUB_ID = PUB_ID + 1;
    }
    localStorage.setItem('PUB_ID', PUB_ID + '');
    var tx = this.db.transaction(this.PUBLICATIONS, this.READ_WRITE);
    var store = tx.objectStore(this.PUBLICATIONS);
    // publicationObject.showSettingsDataSourceLoader = false;
    store.put({ ID: PUB_ID, publicationID: publicationID, publicationName: publicationName, publicationObject: publicationObject, projectName: projectName });
    tx.oncomplete = function () {
    };
  }

  getAllPublications(callback) {
    let self = this;
    this.initDatabase(function (db) {
      let publications: PublicationdtoService[] = [];

      var tx = db.transaction(self.PUBLICATIONS, self.READ_ONLY);
      var store = tx.objectStore(self.PUBLICATIONS);
      // var request3 = store.getAll();
      // request3.onsuccess = function () {

      //   var cursor = request3.result;
      //   cursor.forEach(pub => {
      //     publications.push(pub.publicationObject);
      //   });
      //   callback(publications);
      // };

      var request = store.openCursor();
      request.onsuccess = function (event) {
        var cursor = event.target.result;
        if (cursor) {
          // cursor.value contains the current record being iterated through
          // this is where you'd do something with the result
          publications.push(cursor.value.publicationObject);
          cursor.continue();
        } else {
          // no more results
          callback(publications);
        }
      };


    })
  }

  deletePublication(publicationID) {
    var tx = this.db.transaction(this.PUBLICATIONS, this.READ_WRITE);
    var store = tx.objectStore(this.PUBLICATIONS);

    // var request2 = store.delete(publicationID);
    // request2.onsuccess = function () {
    //   var matching = request2.result;
    // };

    var index = store.index(this.PUBLICATION_ID);
    var request = index.openKeyCursor(IDBKeyRange.only(publicationID));

    request.onsuccess = function () {
      var cursor = request.result;
      if (cursor) {
        store.delete(cursor.primaryKey);
      }
    }
  }



  updatePublication(projectName, publicationId, publicationObj, callback) {
    let self = this;
    this.initDatabase(function (db) {
      var tx = self.db.transaction(self.PUBLICATIONS, self.READ_WRITE);
      var store = tx.objectStore(self.PUBLICATIONS);

      var index = store.index(self.PROJECT_NAME);

      var request3 = index.openCursor(IDBKeyRange.only(projectName));
      request3.onsuccess = function () {
        var cursor = request3.result;
        if (cursor) {
          let updateObject = cursor.value;
          if (updateObject.publicationID == publicationId) {
            updateObject.publicationObject = publicationObj;
            // Called for each matching record.
            cursor.update(updateObject);
          }
          cursor.continue();
        } else {
          callback(publicationId);
        }
      };
    });
  }

  /*update some params in publication object*/
  updatePublicationParams(projectName, publicationId, publicationObj, callback) {
    let self = this;
    this.initDatabase(function (db) {
      var tx = self.db.transaction(self.PUBLICATIONS, self.READ_WRITE);
      var store = tx.objectStore(self.PUBLICATIONS);

      var index = store.index(self.PROJECT_NAME);

      var request3 = index.openCursor(IDBKeyRange.only(projectName));
      request3.onsuccess = function () {
        var cursor = request3.result;
        if (cursor) {
          let updateObject = cursor.value;
          if (updateObject.publicationID == publicationId) {
            if (self.utilsService.isPresent(updateObject.publicationObject)) {
              updateObject.publicationObject.showSettingsDataSourceLoader = false;
              if ((publicationObj._currentDSFile != undefined) && (publicationObj._currentDSFile != null) && (publicationObj._currentDSFile.length > 0)) {
                updateObject.publicationObject._currentDSFile = publicationObj._currentDSFile;
              }
              if ((publicationObj._dataFiles != undefined) && (publicationObj._dataFiles != null) && (publicationObj._dataFiles.length > 0)) {
                updateObject.publicationObject._dataFiles = publicationObj._dataFiles;
              }
              if ((publicationObj._dataSourceFetchtime != undefined) && (publicationObj._dataSourceFetchtime != null) && (publicationObj._dataSourceFetchtime.length > 0)) {
                updateObject.publicationObject._dataSourceFetchtime = publicationObj._dataSourceFetchtime;
              }
            }
            // Called for each matching record.
            cursor.update(updateObject);
          }
          cursor.continue();
        } else {
          callback(publicationId);
        }
      };
    });
  }

  deleteAllPublication() {
    var tx = this.db.transaction(this.PUBLICATIONS, this.READ_WRITE);
    var store = tx.objectStore(this.PUBLICATIONS);
    var request2 = store.clear();
    request2.onsuccess = function () {
      return request2.result;
    };
  }

  addProject(projectName, projectObject) {
    var tx = this.db.transaction(this.PROJECTS, this.READ_WRITE);
    var store = tx.objectStore(this.PROJECTS);
    store.put({ projectName: projectName, projectObject: projectObject });
    tx.oncomplete = function () {
    };
  }

  deleteAllProjects() {
    var tx = this.db.transaction(this.PROJECTS, this.READ_WRITE);
    var store = tx.objectStore(this.PROJECTS);
    var request2 = store.clear();
    request2.onsuccess = function () {
      return request2.result;
    };
  }

  getProject(projectName, callback) {
    let self = this;
    this.initDatabase(function (db) {
      var tx = self.db.transaction(self.PROJECTS, self.READ_WRITE);
      var store = tx.objectStore(self.PROJECTS);
      var request3 = store.openCursor(IDBKeyRange.only(projectName));
      request3.onsuccess = function () {
        var cursor = request3.result;
        if (cursor) {
          let updateObject = cursor.value;
          callback(updateObject.projectObject);
        }
      };
    });
  }

  getAllProjects(callback) {
    let self = this;
    this.initDatabase(function (db) {
      let projects: ProjectdtoService[] = [];
      var tx = db.transaction(self.PROJECTS, self.READ_ONLY);
      var store = tx.objectStore(self.PROJECTS);
      var request = store.openCursor();
      request.onsuccess = function (event) {
        var cursor = event.target.result;
        if (cursor) {
          projects.push(cursor.value.projectObject);
          cursor.continue();
        } else {
          callback(projects);
        }
      };
    })
  }

  addUpdateProject(projectName, projectObject, callback) {
    let self = this;
    this.initDatabase(function (db) {
      var tx = self.db.transaction(self.PROJECTS, self.READ_WRITE);
      var store = tx.objectStore(self.PROJECTS);
      var request3 = store.openCursor(IDBKeyRange.only(projectName));
      request3.onsuccess = function () {
        var cursor = request3.result;
        if (cursor) {
          let updateObject = cursor.value;
          let dbProjectObject = updateObject.projectObject;
          if ((projectObject._selectedDataSouce != undefined) && (projectObject._selectedDataSouce != null) && (projectObject._selectedDataSouce.length > 0)) {
            dbProjectObject._selectedDataSouce = projectObject._selectedDataSouce;
          }
          if ((projectObject._currentDSFile != undefined) && (projectObject._currentDSFile != null) && (projectObject._currentDSFile.length > 0)) {
            dbProjectObject._currentDSFile = projectObject._currentDSFile;
          }
          if ((projectObject._dataFiles != undefined) && (projectObject._dataFiles != null) && (projectObject._dataFiles.length > 0)) {
            dbProjectObject._dataFiles = projectObject._dataFiles;
          }
          if ((projectObject._dataSourceFetchtime != undefined) && (projectObject._dataSourceFetchtime != null) && (projectObject._dataSourceFetchtime.length > 0)) {
            dbProjectObject._dataSourceFetchtime = projectObject._dataSourceFetchtime;
          }

          if ((projectObject._arrayLogLanguageFlagList != undefined) && (projectObject._arrayLogLanguageFlagList != null) && (Object.keys(projectObject._arrayLogLanguageFlagList).length > 0)) {
            dbProjectObject._arrayLogLanguageFlagList = projectObject._arrayLogLanguageFlagList;
          }
          if ((projectObject.masterPublications != undefined) && (projectObject.masterPublications != null) && (projectObject.masterPublications.length > 0)) {
            dbProjectObject.masterPublications = projectObject.masterPublications;
          }
          if ((projectObject.publications != undefined) && (projectObject.publications != null) && (projectObject.publications.length > 0)) {
            dbProjectObject.publications = projectObject.publications;
          }
          if ((projectObject._stackElementPreview != undefined) && (projectObject._stackElementPreview != null)) {
            dbProjectObject._stackElementPreview = projectObject._stackElementPreview;
          }
          if ((projectObject._masterPages != undefined) && (projectObject._masterPages.length > 0)) {
            for (let newMasterpage of projectObject._masterPages) {
              for (let i in dbProjectObject._masterPages) {
                if (newMasterpage.id == dbProjectObject._masterPages[i].id) {
                  dbProjectObject._masterPages.splice(i, 1);
                  break;
                }
              }
              dbProjectObject._masterPages.push(newMasterpage)
            }

            //updating localCache
            if (!self.utilsService.isPresent(self.projectMasterPages)) {
              self.projectMasterPages = new Map<string, Map<string, any>>();
            }
            if (!self.utilsService.isPresent(self.projectMasterPages.get(projectName))) {
              let masterPageMap = new Map<string, any>();
              self.projectMasterPages.set(projectName, masterPageMap);
            }
          }

          if ((projectObject._staticPages != undefined) && (projectObject._staticPages.length > 0)) {
            for (let newStaticPage of projectObject._staticPages) {
              let shared = false;
              for (let mainStaticPage of dbProjectObject._staticPages) {
                if (newStaticPage.id == mainStaticPage.id) {
                  shared = true;
                  break;
                }
              }
              if (!shared) {
                if (newStaticPage.type != "IBLoader") {
                  dbProjectObject._staticPages.push(newStaticPage);
                }
              }
            }

            // //updating localCache
            if (!self.utilsService.isPresent(self.projectStaticPages)) {
              self.projectStaticPages = new Map<string, Map<string, any>>();
            }
            if (!self.utilsService.isPresent(self.projectStaticPages.get(projectName))) {
              let staticPageMap = new Map<string, any>();
              self.projectStaticPages.set(projectName, staticPageMap);
            }

          }
          updateObject.projectObject = dbProjectObject;
          cursor.update(updateObject);

        } else {
          store.put({ projectName: projectName, projectObject: projectObject });
          tx.oncomplete = function () {
          };

        }
        callback();
      };
    });
  }

  /*update static preview in project object*/
  updateProjectStaticPreview(projectName, masterPublication, mPage, language, callback) {
    let self = this;
    this.initDatabase(function (db) {
      var tx = self.db.transaction(self.PROJECTS, self.READ_WRITE);
      var store = tx.objectStore(self.PROJECTS);
      var request3 = store.openCursor(IDBKeyRange.only(projectName));
      request3.onsuccess = function () {
        var cursor = request3.result;
        if (cursor) {
          let changed = false;
          let updateObject = cursor.value;
          let dbProjectObject = updateObject.projectObject;
          for (let i in dbProjectObject._staticPages) {
            if (mPage.id == dbProjectObject._staticPages[i].id) {
              if (!self.utilsService.isPresent(dbProjectObject._staticPages[i]._staticPreview)) {
                dbProjectObject._staticPages[i]._staticPreview = {};
              }
              if (self.utilsService.isPresent(dbProjectObject._staticPages[i]._staticPreview[language])) {
                dbProjectObject._staticPages[i]._staticPreview[language] = [];
              }
              dbProjectObject._staticPages[i]._staticPreview[language] = mPage._staticPreview[language];
              changed = true;
              break;
            }
          }
          updateObject.projectObject = dbProjectObject;
          cursor.update(updateObject);
          if (changed) {
            //updating localCache
            if (!self.utilsService.isPresent(self.projectStaticPages)) {
              self.projectStaticPages = new Map<string, Map<string, any>>();
            }
            if (!self.utilsService.isPresent(self.projectStaticPages.get(projectName))) {
              let staticPageMap = new Map<string, any>();
              self.projectStaticPages.set(projectName, staticPageMap);
            } else {
              self.projectStaticPages.get(projectName).set(masterPublication, dbProjectObject._staticPages);
            }
          }
        }
        callback();
      };
    });
  }

  deletStaticPageInProject(projectName, masterPublication, staticPageId, callback) {
    this.initDatabase((db) => {
      let tx = this.db.transaction(this.PROJECTS, this.READ_WRITE);
      let store = tx.objectStore(this.PROJECTS);
      let getProjectData = store.openCursor(IDBKeyRange.only(projectName));
      getProjectData.onsuccess = () => {
        let cursor = getProjectData.result;
        if (cursor) {
          let updateObject = cursor.value;
          let dbProjectObject = updateObject.projectObject;
          if (this.utilsService.isPresent(staticPageId)) {
            let staticPageIndex = dbProjectObject._staticPages.map((el) => el.id).indexOf(staticPageId);
            dbProjectObject._staticPages.splice(staticPageIndex, 1);
            if (!this.utilsService.isPresent(this.projectStaticPages)) {
              this.projectStaticPages = new Map<string, Map<string, any>>();
            }
            if (!this.utilsService.isPresent(this.projectStaticPages.get(projectName))) {
              let staticPageMap = new Map<string, any>();
              this.projectStaticPages.set(projectName, staticPageMap);
            } else {
              this.projectStaticPages.get(projectName).set(masterPublication, dbProjectObject._staticPages);
            }
          }
          updateObject.projectObject = dbProjectObject;
          cursor.update(updateObject);
        }
        callback();
      };
    });
  }

  addPublicationInProject(publicationResponse, projectName) {
    let self = this;
    let publication = new Publication();
    publication.id = publicationResponse.id;
    publication.name = publicationResponse.name;
    publication.redactionProperties = publicationResponse.redactionProperties;
    this.initDatabase(function (db) {
      var tx = self.db.transaction(self.PROJECTS, self.READ_WRITE);
      var store = tx.objectStore(self.PROJECTS);
      var request3 = store.openCursor(IDBKeyRange.only(projectName));
      request3.onsuccess = function () {
        var cursor = request3.result;
        if (cursor) {
          let updateObject = cursor.value;
          let dbProjectObject = updateObject.projectObject;
          if (self.utilsService.isPresent(dbProjectObject)) {
            if ((self.utilsService.isPresent(dbProjectObject.publications)) && (dbProjectObject.publications.length > 0)) {
              dbProjectObject.publications.push(publication);
            }
          }
          updateObject.projectObject = dbProjectObject;
          cursor.update(updateObject);
        }
      };
    });
  }

  updatePublicationInProject(publicationResponse, projectName) {
    let self = this;
    this.initDatabase(function (db) {
      var tx = self.db.transaction(self.PROJECTS, self.READ_WRITE);
      var store = tx.objectStore(self.PROJECTS);
      var request3 = store.openCursor(IDBKeyRange.only(projectName));
      request3.onsuccess = function () {
        var cursor = request3.result;
        if (cursor) {
          let updateObject = cursor.value;
          let dbProjectObject = updateObject.projectObject;
          if (self.utilsService.isPresent(dbProjectObject)) {
            for (let publication of dbProjectObject.publications) {
              if (publication.id == publicationResponse.id) {
                publication.name = publicationResponse.name;
                publication.redactionProperties = publicationResponse.redactionProperties;
                break;
              }
            }
          }
          updateObject.projectObject = dbProjectObject;
          cursor.update(updateObject);
        }
      };
    });
  }


  updateStacksInProject(stackList, projectName, callback) {
    let self = this;
    this.initDatabase(function (db) {
      var tx = self.db.transaction(self.PROJECTS, self.READ_WRITE);
      var store = tx.objectStore(self.PROJECTS);
      var request3 = store.openCursor(IDBKeyRange.only(projectName));
      request3.onsuccess = function () {
        var cursor = request3.result;
        if (cursor) {
          let updateObject = cursor.value;
          let dbProjectObject = updateObject.projectObject;
          if (self.utilsService.isPresent(stackList[0].activeFilter)) {
            for (let eachStackFilter of stackList[0].stackFilter) {
              if ((eachStackFilter.key == stackList[0].activeFilter)) {
                eachStackFilter['stackElements'] = self.utilsService.deepCopy(stackList[0].stackElements);
                stackList[0].stackElements = "";
                stackList[0]['isStackLoaded'] = false;
                break;
              }
            }
          }
          if (self.utilsService.isPresent(dbProjectObject)) {
            dbProjectObject._allStacks = stackList;
          }
          updateObject.projectObject = dbProjectObject;
          cursor.update(updateObject);
          self.stacklistFromProject.set(projectName, stackList);
        }
        callback();
      };
    });
  }

  updateAStackInProject(projectName, selectedStack, newStackData, callback) {
    let self = this;
    this.initDatabase(function (db) {
      var tx = self.db.transaction(self.PROJECTS, self.READ_WRITE);
      var store = tx.objectStore(self.PROJECTS);
      var request3 = store.openCursor(IDBKeyRange.only(projectName));
      request3.onsuccess = function () {
        var cursor = request3.result;
        if (cursor) {
          let updateObject = cursor.value;
          let dbProjectObject = updateObject.projectObject;
          if (self.utilsService.isPresent(dbProjectObject)) {
            if (self.utilsService.isPresent(dbProjectObject._allStacks)) {
              for (let eachStack of dbProjectObject._allStacks) {
                if ((eachStack.id == selectedStack.id) && (eachStack.name == selectedStack.name)) {
                  eachStack.filters = newStackData.filters;
                  if (!self.utilsService.isPresent(eachStack.stackFilter)) {
                    eachStack.stackFilter = newStackData.stackFilter;
                  }
                  eachStack.userFilter = newStackData.userFilter;
                  if (self.utilsService.isPresent(newStackData.activeFilter)) {
                    for (let eachStackFilter of eachStack.stackFilter) {
                      if ((eachStackFilter.key == newStackData.activeFilter)) {
                        eachStackFilter['stackElements'] = self.utilsService.deepCopy(newStackData.stackElements);
                        eachStack.stackElements = "";
                        eachStack['isStackLoaded'] = false;
                        break;
                      }
                    }
                  } else {
                    eachStack.stackElements = newStackData.stackElements;
                    eachStack['isStackLoaded'] = true;
                  }
                  break;
                }
              }
              self.stacklistFromProject.set(projectName, dbProjectObject._allStacks);
            }
          }
          updateObject.projectObject = dbProjectObject;
          cursor.update(updateObject);
        }
        callback();
      };
    });
  }

  updateStackFilterInProject(projectName, selectedStack, selectedStackFilter, newStackData, callback) {
    let self = this;
    this.initDatabase(function (db) {
      var tx = self.db.transaction(self.PROJECTS, self.READ_WRITE);
      var store = tx.objectStore(self.PROJECTS);
      var request3 = store.openCursor(IDBKeyRange.only(projectName));
      request3.onsuccess = function () {
        var cursor = request3.result;
        if (cursor) {
          let updateObject = cursor.value;
          let dbProjectObject = updateObject.projectObject;
          if (self.utilsService.isPresent(dbProjectObject)) {
            if (self.utilsService.isPresent(dbProjectObject._allStacks)) {
              for (let eachStack of dbProjectObject._allStacks) {
                if ((eachStack.id == selectedStack.id) && (eachStack.name == selectedStack.name)) {
                  if (eachStack.stackFilter == null) {
                    eachStack.stackFilter = newStackData.stackFilter;
                  }
                  for (let eachStackFilter of eachStack.stackFilter) {
                    if ((eachStackFilter.key == selectedStackFilter)) {
                      eachStackFilter['stackElements'] = newStackData.stackElements;
                      break;
                    }
                  }
                  break;
                }
              }
              self.stacklistFromProject.set(projectName, dbProjectObject._allStacks);
            }
          }
          updateObject.projectObject = dbProjectObject;
          cursor.update(updateObject);
        }
        callback();
      };
    });
  }

}
