import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  map,
  Observable,
  retry,
  Subject,
  Subscription,
  throwError,
} from 'rxjs';
import { AuthServiceService } from './auth-service.service';
import { MandateService } from './mandate-service.service';
import Swal from 'sweetalert2';
import {
  ActionSheetController,
  AlertController,
  isPlatform,
  ModalController,
  PopoverController,
} from '@ionic/angular';
import { App } from '@capacitor/app';
const CHECK_INTERVAL = 1000 * 60 * 60;
@Injectable({
  providedIn: 'root',
})
export class SharedService {
  enquiries: any[] = [];
  scrollTop = 0;
  page = 1;
  hasState = false;
  isBottom = false;
  allCallCounts = [];
  onCallLeadData = [];
  sharedcontroller: any;
  indiaestatesapi;
  isMenuOpen = localStorage.getItem('isLoggedIn') === 'true';
  hoverSubscription: Subscription;
  loginUrl;
  loginMethodname = 'login';
  private unReadTrigger$ = new Subject<void>();

  private selectedIndexSubject = new BehaviorSubject<number | null>(null);
  selectedIndex$ = this.selectedIndexSubject.asObservable();

  setSelectedIndex(index: number | null) {
    this.selectedIndexSubject.next(index);
  }

  getSelectedIndex(): number | null {
    return this.selectedIndexSubject.value;
  }

  isnewGroupCreation = false;
  chatUrl = '';
  checkInOutUrl;
  unReadChatCount;
  private mySubject = new Subject<string>();
  unReadChatCountObservable$ = this.mySubject.asObservable();

  // Call this method to emit values
  emitunReadChatCountValue(value: string) {
    this.mySubject.next(value);
  }

  constructor(
    private http: HttpClient,
    private authservice: AuthServiceService,
    private router: Router,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private popoverCtrl: PopoverController,
    private actionSheetCtrl: ActionSheetController
  ) {
    if (localStorage.getItem('RcontrllerName') == 'ranav_group') {
      this.sharedcontroller = `https://superadmin-azure.right2shout.in/${
        localStorage.getItem('RcontrllerName') === 'ranav_group'
          ? 'ranav_group' + '/'
          : ''
      }admincrm_test`;
    } else {
      this.hoverSubscription = this.authservice.adminControllerState$.subscribe(
        (isHovered) => {
          this.sharedcontroller = `https://superadmin-azure.right2shout.in/${
            localStorage.getItem('RcontrllerName')
              ? localStorage.getItem('contrllerName') + '/'
              : ''
          }admincrm_test`;
          this.indiaestatesapi = 'https://www.indiaestates.in';
        }
      );
    }
    setInterval(() => this.checkForUpdate(''), CHECK_INTERVAL);
    // this.chatUrl = 'https://chat.right2shout.in';
    this.chatUrl = 'https://test-chat.right2shout.in';
    this.checkInOutUrl = 'https://lead247-laravel-api.right2shout.in';

    this.unReadTrigger$
      .pipe(debounceTime(100))
      .subscribe(() => this.fetchUnreadChatCount());
  }

  triggerUnreadCheck() {
    this.unReadTrigger$.next();
  }

  private fetchUnreadChatCount() {
    this.unreadChatCount(localStorage.getItem('UserId')).subscribe(
      (response) => {
        this.unReadChatCount = response['details'][0].unreadmsgcount;
        this.unReadChatCount = this.unReadChatCount;
      }
    );
  }

  setloginState(login) {
    // if(login == 'ranav_group'){
    //   this.loginUrl = 'https://superadmin-azure.right2shout.in/ranav_group/admincrm_test_test/login'
    // }else{
    if (login == 'crm_cpclient_login') {
      this.loginMethodname = 'crm_cpclient_login';
    } else {
      this.loginMethodname = 'login';
    }
    this.loginUrl =
      'https://superadmin-azure.right2shout.in/admincrm_test/' +
      this.loginMethodname;
    // }
  }

  getVersionUrl(): string {
    const cpId = localStorage.getItem('cpId');
    const rController = localStorage.getItem('RcontrllerName');
    const base = 'https://superadmin-azure.right2shout.in/';
    const controllerPath =
      cpId === '1'
        ? rController + '/'
        : rController === 'ranav_group'
        ? 'ranav_group/'
        : '';
    return `${base}${controllerPath}admincrm_test/get_ionic_version`;
  }

  getallactiveexec() {
    return this.http.get(this.sharedcontroller + '/getallactiveexec');
  }

  getVersionCode(execid: string, session_id: string) {
    const body = new URLSearchParams();
    body.set('X-Session-Id', session_id);
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    const postUrl =
      this.getVersionUrl() + `?ExecId=${execid}&X-Session-Id=${session_id}`;
    return this.http.post(postUrl, body.toString(), {
      headers: headers,
    });
  }

  ngDestroy() {
    if (this.hoverSubscription) {
      this.hoverSubscription.unsubscribe();
    }
  }

  sourcelist() {
    return this.http.get(this.sharedcontroller + '/sources');
  }

  updateProfile(param) {
    let params = new HttpParams()
      .set('IDPK', param.leadid)
      .set('name', param.name)
      .set('number', param.number)
      .set('mail', param.mail)
      .set('preferdlocation', param.location)
      .set('preferedtype', param.proptype)
      .set('leadpossession', param.possession)
      .set('preferedvarient', param.size)
      .set('preferedbudget', param.budget)
      .set('leadpriority', param.priority)
      .set('leadaddress', param.address)
      .set('primaryname', param.primaryname)
      .set('primarynumber', param.primarynumber)
      .set('primarymail', param.primarymail);
    return this.http.post(this.sharedcontroller + '/updateshortdata', params);
  }

  addenquiry(params) {
    let param = new HttpParams()
      .set('Name', params.name)
      .set('Number', params.number)
      .set('Mail', params.mail)
      .set('Source', params.source)
      .set('PropertyType', params.propertytype)
      .set('Timeline', params.timeline)
      .set('Varient', params.size)
      .set('Budget', params.budget)
      .set('Address', params.address)
      .set('addedby', params.username)
      // .set('duplicate', params.duplicate)
      .set('leadpriority', params.priority)
      .set('preferdlocation', params.location)
      .set('localityid', params.locId);

    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.post(
      this.sharedcontroller + '/addenquiry',
      param.toString(),
      { headers: headers }
    );
  }

  getleadcounts(param) {
    let params = new HttpParams()
      .set('FromDate', param.FromDate)
      .set('ToDate', param.ToDate)
      .set('source', param.source)
      .set('propname', param.propname)
      .set('assignid', param.assignid)
      .set('cityid', param.cityid);
    return this.http.get(this.sharedcontroller + '/completeleadscounts', {
      params,
    });
  }

  getleads(param) {
    let params = new HttpParams()
      .set('limit', param.limitparam)
      .set('limitrows', param.limitrows)
      .set('FromDate', param.FromDate)
      .set('ToDate', param.ToDate)
      .set('source', param.source)
      .set('assignid', param.assignid)
      .set('propname', param.propname)
      .set('duplicates', param.duplicateValue)
      .set('cityid', param.cityid);
    return this.http.get(this.sharedcontroller + '/completeleads', { params });
  }

  propertylistForCompleteLeads(param) {
    let params = new HttpParams()
      .set('FromDate', param.FromDate)
      .set('ToDate', param.ToDate)
      .set('source', param.source);
    return this.http.get(this.sharedcontroller + '/getpropertybysource', {
      params,
    });
  }

  propertylistForEnquiry(leads, source) {
    let params = new HttpParams().set('leads', leads).set('source', source);
    return this.http.get(this.sharedcontroller + '/getpropertybysource', {
      params,
    });
  }

  searchLeads(searcheddata, crmtype, loginid, merge) {
    let params = new HttpParams()
      .set('crmtype', crmtype)
      .set('loginId', loginid)
      .set('merge', merge ?? '');
    return this.http
      .get<any>(this.sharedcontroller + '/searchlist/' + searcheddata, {
        params,
      })
      .pipe(map((response) => response));
  }

  getlogin(username, password, deviceid, browserid) {
    let params = new HttpParams()
      .set('username', username)
      .set('password', password)
      .set('deviceid', deviceid)
      .set('browser', browserid);
    return this.http.post(this.loginUrl, params);
  }

  //   handleError(error: HttpErrorResponse) {
  //  let errorMessage = 'Unknown error!';
  //  if (error.error instanceof ErrorEvent) {
  //  // Client-side errors
  //  errorMessage = Error: ${error.error.message};
  //  } else {
  //  // Server-side errors
  //  errorMessage = Error Code: ${error.status}\nMessage: ${error.message};
  //  }
  //  // window.alert(errorMessage);
  //  return throwError(errorMessage);
  // }

  private otp = 'https://lead247-laravel-api.right2shout.in/';

  // loginotpsend(number) {
  //   let params = new HttpParams()
  //   .set('number', number)
  //   return this.http.post(this.sharedcontroller + "/crmloginotpsending",params);
  // }

  loginotpsend(number): Observable<any> {
    const headers = new HttpHeaders({
      'Custom-Otp-Origin': 'hfdRVuy&Th#icarmAnOp^shdg',
    });
    const body = { number: number };
    return this.http
      .post(
        'https://lead247-laravel-api.right2shout.in/crmerotpdfgxsendingbbuyu',
        body,
        { headers }
      )
      .pipe(retry(0), catchError(this.handleError));
  }

  loginotpsend1(number): Observable<any> {
    const headers = new HttpHeaders({
      'Custom-Otp-Origin': 'hfdRVuy&Th#hgnmf^shesgbvc',
    });
    const body = { number: number };
    return this.http
      .post(
        'https://lead247-laravel-api.right2shout.in/test/crmerotpbnmghyrtdedslj',
        body,
        { headers }
      )
      .pipe(retry(0), catchError(this.handleError));
  }

  // loginotpsend(number): Observable<any> {
  //   const headers = new HttpHeaders({
  //     'Custom-Otp-Origin': 'hfdRVuy&Th#icarmAnOp^shdg',
  //   });

  //   const params = { number: number };

  //   return this.http.get(
  //     'https://lead247-laravel-api.right2shout.in/crmerotpdfgxsendingbbuyu',
  //     {
  //       headers: headers,
  //       params: params
  //     }
  //   ).pipe(
  //     retry(0),
  //     catchError(this.handleError)
  //   );
  // }

  handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }

  // private otp = 'https://lead247-laravel-api.right2shout.in/';

  otpvalidate(otp, number) {
    let params = new HttpParams().set('otp', otp).set('number', number);
    return this.http.post(
      'https://api.right2shout.in/backend/' + 'otpvalidate',
      params
    );
  }

  login_otp_validate(otp, number) {
    let params = new HttpParams().set('otp', otp).set('number', number);
    return this.http.post(this.sharedcontroller + '/otpvalidate', params);
  }

  // otpsend(param){
  //   let params = new HttpParams()
  //   .set('number',param.number)
  //   return this.http.post<any>(this.sharedcontroller+"/andriodotpsendingnew",params )
  // }

  otpsend(param) {
    let params = new HttpParams().set('number', param.number);
    return this.http.post<any>(
      'https://api.right2shout.in/backend/' + 'asdthyujdllkhjsjkkjhs',
      params
    );
  }

  fetchbuilderleads(param) {
    let params = new HttpParams()
      .set('property', param.property)
      .set('limit', param.limit)
      .set('limitrows', param.limitrows);
    return this.http.get<any>(this.sharedcontroller + '/builderleadsfetch?', {
      params,
    });
  }

  // to get fresh leads
  getenquirylist(param) {
    let params = new HttpParams()
      .set('limit', param.limit)
      .set('limitrows', param.limitrows)
      .set('fromdate', param.fromDate)
      .set('todate', param.toDate)
      .set('source', param.source)
      .set('cityid', param.cityid)
      .set('leads', param.leads)
      .set('propname', param.propname);
    return this.http.get(this.sharedcontroller + '/enquirylistnewC', {
      params,
    });
  }

  getenquirylistCounts(param) {
    let params = new HttpParams()
      .set('source', param.source)
      .set('fromdate', param.fromDate)
      .set('todate', param.toDate)
      .set('cityid', param.cityid)
      .set('propname', param.propname)
      .set('count', param.count);
    return this.http.get(this.sharedcontroller + '/enquirylistnewC', {
      params,
    });
  }

  getCity() {
    return this.http.get(this.sharedcontroller + '/getcity');
  }

  propertylistnew() {
    return this.http.get(this.sharedcontroller + '/propertynewlists');
  }

  builderlist(param) {
    let params = new HttpParams().set('cityid', param);
    return this.http.get(this.sharedcontroller + '/getbuilders', { params });
  }

  builderlist1() {
    return this.http.get(this.sharedcontroller + '/getbuilders');
  }

  getpropertiesbybuilder(param) {
    let params = new HttpParams()
      .set('cityid', param.cityid)
      .set('BuilderID', param.builderid);

    //   let params = new HttpParams();
    //   const paramMap = {
    //     builderid: 'BuilderID',
    //     cityid: 'cityid'
    //   };

    //   Object.keys(paramMap).forEach(key => {
    //     if (param[key] !== undefined && param[key] !== null && param[key] !== '') {
    //         params = params.set(paramMap[key], param[key]);
    //   }
    // });

    return this.http.post(
      this.sharedcontroller + '/getpropertybybuilder',
      params
    );
  }

  addproperties(param) {
    let params = new HttpParams()
      .set('BuildID', param.builderid)
      .set('PropertyID', param.properties);
    return this.http.post(this.sharedcontroller + '/addproperties', params);
  }

  getCPlist(param) {
    let params = new HttpParams()
      .set('limitrows', param.limitrows)
      .set('limit', param.limit);
    return this.http.get(this.indiaestatesapi + '/cplists', { params });
  }

  addcp(param) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('name', param.cpname);
    urlSearchParams.append('person', param.person);
    urlSearchParams.append('number', param.cpnumber);
    urlSearchParams.append('mail', param.cpmail);
    urlSearchParams.append('secondarymail', param.cpsecondmail);
    urlSearchParams.append('addedby', param.addeduser);
    urlSearchParams.append('rerano', param.rera);
    urlSearchParams.append('gstno', param.gst);
    let body = urlSearchParams.toString();
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post<any>(this.indiaestatesapi + '/addcp', body, { headers: headers })
      .pipe(map((response) => response));
  }

  mandaterequestlists() {
    return this.http.get(this.indiaestatesapi + '/builderlists');
  }

  postMergeLeads(param) {
    let params = new HttpParams()
      .set('primarylead', param.leadId)
      .set('mergedlead', param.mergeLeadId)
      .set('relationship', param.relation);
    return this.http.post(this.sharedcontroller + '/mergeleads', params);

    // let urlSearchParams = new URLSearchParams();

    // urlSearchParams.append('primarylead',param.leadId);
    // urlSearchParams.append('mergedlead',param.mergeLeadId);
    // urlSearchParams.append('relationship',param.relation);

    // let body = urlSearchParams.toString();
    // var headers = new Headers();
    // headers.append('Content-Type','application/x-www-form-urlencoded');

    // return this._http.post(this.sharedcontroller + '/mergeleads',body,{headers:headers}).pipe(map((resp)=>{
    //     resp.json();
    // }))
  }

  getAdminHourlyReport(param) {
    let params = new HttpParams();
    // Mapping object to define API parameter names
    const paramMap = {
      fromdate: 'activityfromdate',
      todate: 'activitytodate',
      status: 'activity',
      pageid: 'pageid',
      tcid: 'tcid',
      loginid: 'loginid',
      execid: 'execid',
      fromtime: 'activityfromtime',
      totime: 'activitytotime',
      teamlead: 'teamlead',
      dbClient: 'DbClient',
    };

    Object.keys(paramMap).forEach((key) => {
      if (
        param[key] !== undefined &&
        param[key] !== null &&
        param[key] !== ''
      ) {
        params = params.set(paramMap[key], param[key]);
      }
    });
    return this.http.get(this.sharedcontroller + '/hourly_report_executives', {
      params,
    });
  }

  getHourlyReportListing(param) {
    let params = new HttpParams();
    const paramMap = {
      fromdate: 'activityfromdate',
      todate: 'activitytodate',
      status: 'activity',
      source: 'source',
      tcid: 'tcid',
      loginid: 'loginid',
      execid: 'execid',
      fromtime: 'activityfromtime',
      totime: 'activitytotime',
    };

    Object.keys(paramMap).forEach((key) => {
      if (
        param[key] !== undefined &&
        param[key] !== null &&
        param[key] !== ''
      ) {
        params = params.set(paramMap[key], param[key]);
      }
    });
    return this.http.get(
      this.sharedcontroller + '/hourly_report_executives_listing',
      { params }
    );
  }

  getexecutiveslist() {
    return this.http.get(this.sharedcontroller + '/getexecutiveslist');
  }

  deleteLead(leadid) {
    let params = new HttpParams().set('LeadId', leadid);
    return this.http.post(this.sharedcontroller + '/deletelead', params);
  }

  getWhatsappVisitsLead(param) {
    let params = new HttpParams();
    const paramMap = {
      fromdate: 'fromdate',
      todate: 'todate',
      count: 'count',
      limit: 'limit',
      propname: 'propname',
      leads: 'leads',
      limitrows: 'limitrows',
    };
    Object.keys(paramMap).forEach((key) => {
      if (
        param[key] !== undefined &&
        param[key] !== null &&
        param[key] !== ''
      ) {
        params = params.set(paramMap[key], param[key]);
      }
    });

    return this.http.get(this.sharedcontroller + '/enquirylistvisitsfixed', {
      params,
    });
  }

  logOut(sessionid, userid) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('X-Session-Id', sessionid);
    urlSearchParams.append('User_Id', userid);
    let body = urlSearchParams.toString();
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post<any>(this.sharedcontroller + '/logout', body, { headers: headers })
      .pipe(map((response) => response));
  }

  versionCode;
  // version check
  async checkForUpdate(id) {
    if (isPlatform('hybrid')) {
      // AppUpdate.getAppUpdateInfo().then((result) => {
      //   alert(result.updateAvailability);
      //   if (result.updateAvailability === 2) {
      //     // UPDATE_AVAILABLE
      //     AppUpdate.performImmediateUpdate();
      //     alert('inside updation');
      //   }
      // });

      const info = await App.getInfo();
      this.versionCode = info.version;
      const session_id = localStorage.getItem('session_id');

      this.getVersionCode(id, session_id).subscribe((response) => {
        if (
          response['Executives'].length != 0 &&
          response['Executives'][0]['active_status'] != '0' &&
          localStorage.getItem('Role') != '1'
        ) {
          Swal.fire({
            title: 'Blocked',
            text: 'Your account has been blocked',
            confirmButtonText: 'OK',
            heightAuto: false,
            allowOutsideClick: false,
          }).then((result) => {
            // localStorage.clear();
            Object.keys(localStorage).forEach((key) => {
              if (
                key !== 'Mail' &&
                key !== 'Password' &&
                key !== 'useBiometric'
              ) {
                localStorage.removeItem(key);
              }
            });
            this.authservice.logout();
          });
        }

        if (
          this.isNewVersionAvailable(
            info.version,
            response['versioncode'][0].version_code
          )
        ) {
          Swal.fire({
            title: 'Time to Catch Up',
            text: 'Update to the latest version & enjoy a seamless experience',
            confirmButtonText: 'Update Now',
            heightAuto: false,
            allowOutsideClick: false,
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.href =
                'https://play.google.com/store/apps/details?id=io.lead247';
            }
          });
        }
      });
    } else {
    }
  }

  isNewVersionAvailable(local: string, server: string): boolean {
    const localParts = local.split('.').map((n) => parseInt(n));
    const serverParts = server.split('.').map((n) => parseInt(n));
    const maxLength = Math.max(localParts.length, serverParts.length);

    for (let i = 0; i < maxLength; i++) {
      const localVal = localParts[i] || 0;
      const serverVal = serverParts[i] || 0;

      if (serverVal > localVal) return true;
      if (serverVal < localVal) return false;
    }
    return false;
  }

  // CHAT API
  fetchAllChats(param) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('loginid', param.loginid);
    urlSearchParams.append('logintype', param.logintype);
    urlSearchParams.append('propId', param.propId ?? '');
    let body = urlSearchParams.toString();
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post<any>(this.chatUrl + '/fetchallchats', body, { headers: headers })
      .pipe(map((response) => response));
  }

  oneToOneAndGroupChat(param) {
    const urlSearchParams = new URLSearchParams();
    for (const key in param) {
      const value = param[key];
      if (value !== undefined && value !== null && value !== '') {
        urlSearchParams.append(key, value);
      }
    }

    const body = urlSearchParams.toString();
    const headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );

    return this.http
      .post<any>(this.chatUrl + '/one2onefetch', body, { headers })
      .pipe(map((response) => response));
  }

  oneToOneAndGroupChatCheck(param) {
    const urlSearchParams = new URLSearchParams();
    for (const key in param) {
      const value = param[key];
      if (value !== undefined && value !== null && value !== '') {
        urlSearchParams.append(key, value);
      }
    }

    const body = urlSearchParams.toString();
    const headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );

    return this.http
      .post<any>(this.chatUrl + '/chatcheck', body, { headers })
      .pipe(map((response) => response));
  }

  createNewGroupChat(param) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('senderid', param.loginid);
    urlSearchParams.append('chattype', param.chattype);
    urlSearchParams.append('members', param.members ?? '');
    urlSearchParams.append('groupname', param.groupname);
    urlSearchParams.append('groupid', param.groupid ?? '');
    urlSearchParams.append('edit_gn', param.edit_gn ?? '');
    let body = urlSearchParams.toString();
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post<any>(this.chatUrl + '/chatcheck', body, { headers: headers })
      .pipe(map((response) => response));
  }

  sendAttachment(param) {
    return this.http
      .post(this.chatUrl + '/api/chats/messages/attachment', param)
      .pipe(map((response) => response));
  }

  deleteGroupMember(param) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('senderid', param.senderid);
    urlSearchParams.append('memberid', param.memberid);
    urlSearchParams.append('groupid', param.groupid);
    urlSearchParams.append('actiontype', param.actiontype);
    let body = urlSearchParams.toString();
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post<any>(this.chatUrl + '/removemember', body, { headers: headers })
      .pipe(map((response) => response));
  }

  getGroupMembers(param) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('senderid', param.senderid);
    urlSearchParams.append('groupid', param.groupid);
    urlSearchParams.append('req', param.req);
    let body = urlSearchParams.toString();
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post<any>(this.chatUrl + '/groupmembers', body, { headers: headers })
      .pipe(map((response) => response));
  }

  convertMessageToRead(param) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('loginid', param.loginid);
    urlSearchParams.append('chatid', param.chatid);
    let body = urlSearchParams.toString();
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post<any>(this.chatUrl + '/msgsts', body, { headers: headers })
      .pipe(map((response) => response));
  }

  unreadChatCount(loginid) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('loginid', loginid);
    let body = urlSearchParams.toString();
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post<any>(this.chatUrl + '/unreadcount', body, { headers: headers })
      .pipe(map((response) => response));
  }

  deleteMessage(messageid) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('messageid', messageid);
    let body = urlSearchParams.toString();
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post<any>(this.chatUrl + '/msgdlt', body, { headers: headers })
      .pipe(map((response) => response));
  }

  onesignalpush(param) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('user_id', param.userid);
    urlSearchParams.append('onesignal_player_id', param.subscriberid);
    let body = urlSearchParams.toString();
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post(this.chatUrl + '/save-onesignal-id', body, { headers: headers })
      .pipe(map((resp) => resp));
  }

  searchCats(param) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('searchTerm', param.searchTerm);
    urlSearchParams.append('loginid', param.loginid);
    urlSearchParams.append('chat_id', param.chat_id ?? '');
    let body = urlSearchParams.toString();
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post(this.chatUrl + '/search', body, { headers: headers })
      .pipe(map((resp) => resp));
  }

  fetchMessageInfo(param) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('sender_id', param.sender_id);
    urlSearchParams.append('messageid', param.messageid);
    let body = urlSearchParams.toString();
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post(this.chatUrl + '/msginfo', body, { headers: headers })
      .pipe(map((resp) => resp));
  }

  //CHAT API END

  //CHECK IN AND CHECK OUT SECTION API'S
  //CHECK IN POST API

  getPunchData(param) {
    let params = new HttpParams()
      .set('execid', param.execid)
      .set('from', param.from)
      .set('to', param.to)
      .set('loginid', param.loginid)
      .set('limit', param.limit)
      .set('limitrows', param.limitrows);

    return this.http.get(this.checkInOutUrl + '/get_breakdata', {
      params,
    });
  }

  postlocationapi(param) {
    return this.http.post(this.checkInOutUrl + '/store_livelocation', param);
  }

  // http://192.168.0.177/lead247_laravel_api/public/test/get_breakdata?execid=40039&from=2025-12-26&to=2025-12-26&limit=0&limitrows=30&loginid=40039

  getCheck_inStatus(param) {
    let params = new HttpParams();
    // Mapping object to define API parameter names
    const paramMap = {
      execid: 'execid',
      from: 'from',
      to: 'to',
      limit: 'limit',
      logintype: 'logintype',
      propid: 'propid',
      limitrows: 'limitrows',
      loginid: 'loginid',
    };
    // Loop through the mapping and add only non-empty values
    Object.keys(paramMap).forEach((key) => {
      if (
        param[key] !== undefined &&
        param[key] !== null &&
        param[key] !== ''
      ) {
        params = params.set(paramMap[key], param[key]);
      }
    });
    return this.http.get(this.checkInOutUrl + '/datelocation_get', { params });
  }

  //WHATS APP CHATS
  fetchAllWhatsAppChats(param) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('loginid', param.loginid);
    urlSearchParams.append('execid', param.execid ?? '');
    // urlSearchParams.append('propId', param.propId);
    let body = urlSearchParams.toString();
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post<any>(this.chatUrl + '/whatsapp/fetchallchats', body, {
        headers: headers,
      })
      .pipe(map((response) => response));
  }

  fetchWhatsAppOne2OneChats(param) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('loginid', param.loginid);
    urlSearchParams.append('recieverid', param.recieverid);
    // urlSearchParams.append('propId', param.propId);
    let body = urlSearchParams.toString();
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post<any>(this.chatUrl + '/whatsapp/one2onefetch', body, {
        headers: headers,
      })
      .pipe(map((response) => response));
  }

  whatsAppNumberCheck(param) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('number', param.number);
    // urlSearchParams.append('propId', param.propId);
    let body = urlSearchParams.toString();
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post<any>(this.chatUrl + '/whatsapp/numbercheck', body, {
        headers: headers,
      })
      .pipe(map((response) => response));
  }

  oneToOneChatCheck(param) {
    const urlSearchParams = new URLSearchParams();
    for (const key in param) {
      const value = param[key];
      if (value !== undefined && value !== null && value !== '') {
        urlSearchParams.append(key, value);
      }
    }

    const body = urlSearchParams.toString();
    const headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );

    return this.http
      .post<any>(this.chatUrl + '/whatsapp/chatcheck', body, { headers })
      .pipe(map((response) => response));
  }

  sendWhatsAppAttachment(param) {
    return this.http
      .post(this.chatUrl + '/api/whatsapp_chats/messages/attachment', param)
      .pipe(map((response) => response));
  }

  //CALLS TRIGGER API
  outboundCall(param) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('execid', param.execid);
    urlSearchParams.append('callto', param.callto);
    urlSearchParams.append('leadid', param.leadid);
    urlSearchParams.append('starttime', param.starttime);
    urlSearchParams.append('modeofcall', param.modeofcall);
    urlSearchParams.append('leadtype', param.leadtype);
    urlSearchParams.append('assignee', param.assignee);
    let body = urlSearchParams.toString();
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post<any>(this.chatUrl + '/calls/trgrcls', body, { headers: headers })
      .pipe(map((response) => response));
  }

  fetchLiveCall(loginid) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('loginid', loginid);
    let body = urlSearchParams.toString();
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post<any>(this.chatUrl + '/calls/lvecls', body, { headers: headers })
      .pipe(map((response) => response));
  }

  fetchAllCallLogs(param) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('loginid', param.loginid);
    urlSearchParams.append('fromcalldatetime', param.fromcalldatetime ?? '');
    urlSearchParams.append('tocalldatetime', param.tocalldatetime ?? '');
    urlSearchParams.append('execid', param.execid ?? '');
    urlSearchParams.append('clientnum', param.clientnum ?? '');
    urlSearchParams.append('callstage', param.callstage ?? '');
    urlSearchParams.append('limit', param.limit ?? '');
    urlSearchParams.append('limitrows', param.limitrows ?? '');
    let body = urlSearchParams.toString();
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post<any>(this.chatUrl + '/calls/alcls', body, { headers: headers })
      .pipe(map((response) => response));
  }

  onCallDisconnected(number) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('emp_phone', number);

    var body = urlSearchParams.toString();
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );

    return this.http
      .post<any>(this.chatUrl + '/calls/mnltrgr', body, { headers: headers })
      .pipe(map((response) => response));
  }

  getCallCounts(params) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('loginid', params.loginid);
    urlSearchParams.append('fromcalldatetime', params.fromcalldatetime ?? '');
    urlSearchParams.append('tocalldatetime', params.tocalldatetime ?? '');
    urlSearchParams.append('execid', params.execid ?? '');
    urlSearchParams.append('clientnum', params.clientnum ?? '');

    let body = urlSearchParams.toString();
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post<any>(this.chatUrl + '/calls/alclcnts', body, { headers: headers })
      .pipe(map((response) => response));
  }

  //INVENTORY API
  inventoryurl =
    '//192.168.0.116/noncdnsuperadmin-live/admincrm_test/count_propertyinventory';

  getPropInventoryCount(propid) {
    let params = new HttpParams().set('propid', propid);
    return this.http.get(
      'http://192.168.0.116/noncdnsuperadmin-live/admincrm_test/count_propertyinventory',
      {
        params,
      }
    );
  }

  getTowerDetails(propid) {
    let params = new HttpParams().set('propid', propid);
    return this.http.get(
      'http://192.168.0.116/noncdnsuperadmin-live/admincrm_test/get_towerdetails',
      {
        params,
      }
    );
  }

  getBHKDetails(param) {
    let params = new HttpParams()
      .set('propid', param.propid)
      .set('towerid', param.towerid ?? '')
      .set('size', param.size ?? '')
      .set('status', param.status ?? '');
    return this.http.get(
      'http://192.168.0.116/noncdnsuperadmin-live/admincrm_test/get_bhkdetails',
      {
        params,
      }
    );
  }

  getSizeDetails(param) {
    let params = new HttpParams()
      .set('propid', param.propid)
      .set('towerid', param.towerid ?? '')
      .set('size', param.size ?? '')
      .set('status', param.status ?? '')
      .set('bhk', param.bhk ?? '');
    return this.http.get(
      'http://192.168.0.116/noncdnsuperadmin-live/admincrm_test/get_sizedetails',
      {
        params,
      }
    );
  }

  getStatusDetails(param) {
    let params = new HttpParams()
      .set('propid', param.propid)
      .set('towerid', param.towerid ?? '')
      .set('size', param.size ?? '')
      .set('status', param.status ?? '')
      .set('bhk', param.bhk ?? '');
    return this.http.get(
      'http://192.168.0.116/noncdnsuperadmin-live/admincrm_test/get_statusdetails',
      {
        params,
      }
    );
  }

  getStatusListing() {
    return this.http.get(
      'http://192.168.0.116/noncdnsuperadmin-live/admincrm_test/status_listing'
    );
  }

  getUnitListing(param) {
    let params = new HttpParams()
      .set('propid', param.propid)
      .set('towerid', param.towerid ?? '')
      .set('size', param.size ?? '')
      .set('status', param.status ?? '')
      .set('bhk', param.bhk ?? '');
    return this.http.get(
      'http://192.168.0.116/noncdnsuperadmin-live/admincrm_test/get_unitlisting',
      {
        params,
      }
    );
  }

  getBHKListing() {
    return this.http.get(
      'http://192.168.0.116/noncdnsuperadmin-live/admincrm_test/bhk_listing'
    );
  }

  getDoreFacingDetails() {
    return this.http.get(
      'http://192.168.0.116/noncdnsuperadmin-live/admincrm_test/get_doorfacingdetails'
    );
  }

  getInventoryDetails(param) {
    let params = new HttpParams()
      .set('propid', param.propid)
      .set('viewtype', param.viewtype ?? '')
      .set('towerid', param.towerid ?? '')
      .set('size', param.size ?? '')
      .set('status', param.status ?? '')
      .set('bhk', param.bhk ?? '');
    return this.http.get(
      'http://192.168.0.116/noncdnsuperadmin-live/admincrm_test/getpropertyinventory',
      {
        params,
      }
    );
  }

  saveUnit(param) {
    const urlSearchParams = new URLSearchParams();
    for (const key in param) {
      const value = param[key];
      if (value !== undefined && value !== null && value !== '') {
        urlSearchParams.append(key, value);
      }
    }

    const body = urlSearchParams.toString();
    const headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );

    return this.http
      .post<any>(
        'http://192.168.0.116/noncdnsuperadmin-live/admincrm_test/addunithistory',
        body,
        { headers }
      )
      .pipe(map((response) => response));
  }

  updateUnit(param) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('propid', param.propid);
    urlSearchParams.append('unitid', param.unitid);
    urlSearchParams.append('unitdetails', param.unitdetails);
    let body = urlSearchParams.toString();
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post<any>(
        'http://192.168.0.116/noncdnsuperadmin-live/admincrm_test/updatepropertyunit',
        body,
        { headers: headers }
      )
      .pipe(map((response) => response));
  }

  getunithistory(param) {
    let params = new HttpParams()
      .set('unitid', param.unitid)
      .set('leadid', param.leadid)
      .set('execid', param.execid);
    return this.http.get(
      'http://192.168.0.116/noncdnsuperadmin-live/admincrm_test/getunithistory',
      {
        params,
      }
    );
  }

  getLeadsBasedexec(param) {
    let params = new HttpParams()
      .set('execid', param.execid)
      .set('content', param.content);
    return this.http.get(
      'http://192.168.0.116/noncdnsuperadmin-live/admincrm_test/leads_basedexec',
      {
        params,
      }
    );
  }

  getSingleUnit(unitNumber) {
    return this.http.get(
      'http://192.168.0.116/noncdnsuperadmin-live/admincrm_test/get_singleunit/' +
        unitNumber
    );
  }

  isActiveRoute(url) {
    return this.router.url.indexOf(url) == 1;
  }

  disappear24Message(param) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('groupid', param.groupid);
    urlSearchParams.append('actionid', param.encryptid);

    let body = urlSearchParams.toString();
    var headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );

    return this.http
      .post<any>(this.chatUrl + '/msg-encrypt', body, { headers })
      .pipe(map((response) => response));
  }

  getSourcebasedleadscount(param) {
    let params = new HttpParams()
      .set('fromdate', param.fromDate)
      .set('todate', param.toDate)
      .set('source', param.source);
    return this.http.get(this.sharedcontroller + '/sourcebasedleadscounts', {
      params,
    });
  }

  getSourcebasedleadscounts2(param) {
    let params = new HttpParams()
      .set('fromdate', param.fromDate)
      .set('todate', param.toDate)
      .set('source', param.source);
    return this.http.get(this.sharedcontroller + '/sourcebasedleadscounts2', {
      params,
    });
  }

  sourcebsedleadsListing(param) {
    let params = new HttpParams()
      .set('limit', param.limit)
      .set('limitrows', param.limitrows)
      .set('fromdate', param.fromDate)
      .set('todate', param.toDate)
      .set('source', param.source)
      .set('leads', param.leads)
      .set('status', param.status);

    return this.http.get(this.sharedcontroller + '/sourcebasedleadslisting', {
      params,
    });
  }
  getCompleteleadscounts(param) {
    let params = new HttpParams()
      .set('FromDate', param.fromdate)
      .set('ToDate', param.todate)
      .set('source', param.source)
      .set('propname', param.propname)
      .set('cityid', param.cityid)
      .set('assignid', param.assignid);
    return this.http.get(this.sharedcontroller + '/completeleadscounts', {
      params,
    });
  }

  sourcebsedleadsDetails(leadid) {
    let params = new HttpParams().set('leadid', leadid);

    return this.http.get(
      this.sharedcontroller + '/viewsourcebasedleaddetails',
      {
        params,
      }
    );
  }

  async dismissAllOverlays() {
    await this.modalCtrl.dismiss().catch(() => {});
    await this.alertCtrl.dismiss().catch(() => {});
    await this.popoverCtrl.dismiss().catch(() => {});
    await this.actionSheetCtrl.dismiss().catch(() => {});
    Swal.close();
  }

  private accountChangedSubject = new BehaviorSubject<void>(undefined);
  accountChanged$ = this.accountChangedSubject.asObservable();

  // Call this whenever account changes
  notifyAccountChanged() {
    this.accountChangedSubject.next();
  }
}
