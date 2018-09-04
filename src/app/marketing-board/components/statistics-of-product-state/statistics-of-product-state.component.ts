import { Component, OnInit } from '@angular/core';

import { IbUtilsService } from '../../../services/ib-utils.service';
import { MarketingBoardService } from '../../../dto/marketingBoard.service';
import { UtilsService } from '../../../shared/services/utils.service';
import { SharedDataService } from "../../../services/shared-data.service";
import { StatisticsOfProductStateService } from "./statistics-of-product-state.service";

@Component({
  selector: 'app-statistics-of-product-state',
  templateUrl: './statistics-of-product-state.component.html',
  styleUrls: ['./statistics-of-product-state.component.scss']
})
export class StatisticsOfProductStateComponent implements OnInit {

  projects_array;
  masterPublication_array;
  publication_array = [];
  logLanguages;
  currentProject;
  masterPublication;
  logLanguageMap;
  masterPublicationMap;
  projectPublicationMap;
  loadingProjects: boolean;
  loadingPublications: boolean;
  statisticsProjectData;
  statisticsPublicationData;
  OnLoadData = true;
  emptyLanguageCount = 0;

  constructor(private statisticsOfProductStateService: StatisticsOfProductStateService, public sharedDataService: SharedDataService, private ibUtilsService: IbUtilsService, private utilsService: UtilsService, private marketingBoardService: MarketingBoardService) { }

  ngOnInit() {
    if (this.utilsService.isPresent(this.marketingBoardService.statisticsProjectPublication) && this.utilsService.isPresent(this.marketingBoardService.statisticsProject) && this.utilsService.isPresent(this.marketingBoardService.statisticsMasterPublication) && this.utilsService.isPresent(this.marketingBoardService.statisticsProjectPublication.get(this.marketingBoardService.statisticsProject).get(this.marketingBoardService.statisticsMasterPublication))) {
      this.onLoadSetData("");
    } else {
      this.getStatisticsContent();
    }
  }

  refreshProductStatistics() {
    this.OnLoadData = true;
    this.getStatisticsContent();
  }

  getStatisticsContent() {
    this.masterPublicationMap = new Map<string, any>();
    this.logLanguageMap = new Map<any, any>();
    this.projectPublicationMap = new Map<any, any>();
    this.masterPublication_array = [];
    this.publication_array = [];
    this.projects_array = [];

    this.loadingProjects = true;
    this.loadingPublications = false;
    if (this.statisticsProjectData) {
      this.statisticsProjectData.unsubscribe();
    }
    if (this.statisticsPublicationData) {
      this.statisticsPublicationData.unsubscribe();
    }
    this.statisticsProjectData = this.statisticsOfProductStateService.getStatisticsData().subscribe((response) => {
      if (response.code == 100) {
        this.loadingProjects = false;
        this.getProjectDetails(response.marketingBoardStatistics);
        if (this.OnLoadData) {
          this.OnLoadData = false;
          this.onLoadSetData(response.marketingBoardStatistics);
        }
      } else {        
        this.ibUtilsService.showIBErrors(response);
      }
    })
  }


  getProjectDetails(statisticsProjects) {
    for (let project of statisticsProjects.projects) {
      this.masterPublication_array = [];
      this.projects_array.push(project.name);
      this.logLanguages = project.logLanguageFlagList;
      for (let masterPublication of Object.keys(project.masterPublication)) {
        this.masterPublication_array.push(masterPublication);
      }
      for (let language of Object.keys(this.logLanguages)) {
        this.logLanguageMap.set(language, this.logLanguages[language]);
        this.marketingBoardService.setStatisticsLogLanguageMap(this.logLanguageMap);
      }
      this.masterPublicationMap.set(project.name, this.masterPublication_array);
      this.marketingBoardService.setStatisticsMasterPublicationMap(this.masterPublicationMap);
    }
    this.marketingBoardService.setStatisticsProjectArray(this.projects_array);
    this.masterPublication_array = [];
  }

  onLoadSetData(data) {
    if (!this.currentProject) {
      if (data) {
        this.currentProject = data.projects[0].name;
        this.masterPublication = this.masterPublicationMap.get(this.currentProject)[0];
      }
      else {
        if (this.utilsService.isPresent(this.marketingBoardService.statisticsProjectArray)) {
          this.projects_array = this.marketingBoardService.statisticsProjectArray;
        }
        if (this.utilsService.isPresent(this.marketingBoardService.statisticsProject)) {
          this.currentProject = this.marketingBoardService.statisticsProject;
        }
        if (this.utilsService.isPresent(this.marketingBoardService.statisticsMasterPublication)) {
          this.masterPublication = this.marketingBoardService.statisticsMasterPublication;
        }
        if (this.utilsService.isPresent(this.marketingBoardService.statisticsMasterPublicationMap)) {
          this.masterPublicationMap = this.marketingBoardService.statisticsMasterPublicationMap;
        }
        if (this.utilsService.isPresent(this.marketingBoardService.statisticsLogLanguageMap)) {
          this.logLanguageMap = this.marketingBoardService.statisticsLogLanguageMap;
        }
        if (this.utilsService.isPresent(this.marketingBoardService.statisticsProjectPublication)) {
          this.projectPublicationMap = this.marketingBoardService.statisticsProjectPublication;
        }
        if (this.utilsService.isPresent(this.marketingBoardService.statisticsProjectPublication)) {
          this.publication_array = this.marketingBoardService.statisticsProjectPublication.get(this.currentProject).get(this.masterPublication);
        }
      }
    }
    this.getPublications(this.masterPublication);
  }

  selectedProject(projectSelected) {
    this.marketingBoardService.setStatisticsProject(projectSelected);
    if (this.currentProject != projectSelected) {
      this.masterPublication = '';
      this.publication_array = [];
    }
    this.currentProject = projectSelected;
    if (this.statisticsPublicationData) {
      this.statisticsPublicationData.unsubscribe();
    }
    this.loadingPublications = false;
  }

  getPublications(masterPublication) {
    this.marketingBoardService.setStatisticsMasterPublication(masterPublication);
    this.publication_array = [];
    if (!this.projectPublicationMap || !this.projectPublicationMap.has(this.currentProject) || !this.projectPublicationMap.get(this.currentProject).get(masterPublication)) {
      this.loadingPublications = true;
      this.statisticsPublicationData = this.statisticsOfProductStateService.getStatisticsPublicationDetails(this.currentProject, masterPublication)
        .subscribe((response) => {
          if (response.code == 100) {
            this.loadingPublications = false;
            this.getPublicationDetails(masterPublication, response);
          } else {         
            this.ibUtilsService.showIBErrors(response);
          }
        })
      
    } else {
      this.loadPublicationsFromCache(masterPublication);
    }
  }

  loadPublicationsFromCache(masterPublication): boolean {
    if (this.marketingBoardService.statisticsProjectPublication) {
      this.publication_array = this.marketingBoardService.statisticsProjectPublication.get(this.currentProject).get(masterPublication);
      return true;
    }
    return false;
  }

  getPublicationDetails(masterPublication, publicationDetails) {
    let publicationMap;
    if (this.utilsService.isPresent(publicationDetails)) {
      for (let publication of Object.keys(publicationDetails.publicationMap)) {
        this.publication_array.push(publicationDetails.publicationMap[publication]);
      }
      publicationMap = this.projectPublicationMap.get(this.currentProject);
      if (!this.utilsService.isPresent(publicationMap)) {
        publicationMap = new Map<any, any>();
      }
      publicationMap.set(masterPublication, this.publication_array);
      this.projectPublicationMap.set(this.currentProject, publicationMap);
      this.marketingBoardService.setStatisticsProjectPublication(this.projectPublicationMap);
    }
  }

}
