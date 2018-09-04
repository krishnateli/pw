import { Injectable } from '@angular/core';
import { PublicationdtoService } from '../dto/publicationdto.service';
import { ProjectdtoService } from '../dto/projectdto.service';
import { isDevMode } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SharedDataService {
    constructor() {
        const username: any = localStorage.getItem('username');
        if (username) {
            this._username = username;
        }
        const isLoggedIn: any = localStorage.getItem("isLoggedIn");
        if (isLoggedIn) {
            this.isLoggedIn = isLoggedIn;
        }
    }

    public setUsername(username: any) {
        this._username = username;
    }

    public get username(): any {
        return this._username;
    }

    public setPort(port: string) {
        this._port = port;
    }

    public get port(): string {
        return this._port;
    }

    public setIp(ip: string) {
        this._ip = ip;
    }

    public get ip(): string {
        return this._ip;
    }

    public setTitle(title: string) {
        this._title = title;
    }

    public get title(): string {
        return this._title;
    }
    public setPublication(publication: PublicationdtoService) {
        this._publicationList.push(publication);
    }
    public setPublicationList(publication: PublicationdtoService[]) {
        this._publicationList = publication;
    }

    public get publicationList(): PublicationdtoService[] {
        return this._publicationList;
    }

    public setActivePublication(activePublication: PublicationdtoService) {
        this._activePublication = activePublication;
    }

    public get activePublication(): PublicationdtoService {
        return this._activePublication;
    }

    public setActivePublicationIndex(activePublicationIndex: number) {
        this._activePublicationIndex = activePublicationIndex;
    }

    public get activePublicationIndex(): number {
        return this._activePublicationIndex;
    }

    public setShowTabs(showTabs: boolean) {
        this._showTabs = showTabs;
    }

    public get showTabs(): boolean {
        return this._showTabs;
    }

    public setStyleNames(styleNames: string[]) {
        this._styleNames = styleNames;
    }

    public get styleNames(): string[] {
        return this._styleNames;
    }

    public setWorkflows(workflows: any) {
        this._workflows = workflows;
    }

    public get workflows(): any {
        return this._workflows;
    }

    public get nativeWindow(): any {
        return _window();
    }

    private _username: any = null;
    private _title: string = "null";
    private _port: string = "8080";
    private _ip: string = "localhost";
    private _publicationList: PublicationdtoService[] = [];
    private _activePublication: PublicationdtoService;
    private _activePublicationIndex: number = -1;

    private _showTabs: boolean = false;
    public _maskStatus: boolean = false;

    private _styleNames: string[] = [];
    public _workflows: any = [];
    public _Customization: any = {};
    public _routeData: any = [];
    public _isRendererOn: boolean = false;
    public _isCallfromSubmit: boolean = false;

    public isLoggedIn: any = null;

}
function _window(): any {
    // return the native window obj
    return window;
}
