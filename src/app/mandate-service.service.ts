import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, map } from 'rxjs';
import { AuthServiceService } from './auth-service.service';

@Injectable({
  providedIn: 'root',
})
export class MandateService {
  cplistUrl: string;
  mandate: string;
  execMandate;

  private hoverSubscription: Subscription;
  private hoverSubject = new BehaviorSubject<string>('');
  hoverState$ = this.hoverSubject.asObservable();

  setHoverState(isHovered) {
    this.hoverSubject.next(isHovered);
  }

  ngDestroy() {
    if (this.hoverSubscription) {
      this.hoverSubscription.unsubscribe();
    }
  }

  constructor(private http: HttpClient, private service: AuthServiceService) {
    // this.hoverSubscription =  this.hoverState$.subscribe((isHovered) => {
    //   this.mandate =  `https://superadmin-azure.right2shout.in/${isHovered === 'ranav_group'?isHovered+'/': localStorage.getItem('RcontrllerName') === 'ranav_group'?'ranav_group'+'/': ''}mandatecrm_web`;
    // });

    this.hoverSubscription = this.service.hoverState$.subscribe((isHovered) => {
      this.mandate = `https://superadmin-azure.right2shout.in/${
        localStorage.getItem('RcontrllerName')
          ? localStorage.getItem('RcontrllerName') + '/'
          : ''
      }mandatecrm_test`;
    });
    // this.mandate = 'https://superadmin-azure.right2shout.in/mandatecrm_test';

    // this.execMandate = 'https://superadmin-azure.right2shout.in/mandatecrm_web';
    this.cplistUrl = 'https://www.indiaestates.in';
  }

  completeassignedRMLeads(param) {
    let params = new HttpParams()
      .set('FromDate', param.fromDate)
      .set('ToDate', param.toDate)
      .set('status', param.status)
      .set('stage', param.stage)
      .set('team', param.team)
      .set('stagestatus', param.stagestatus)
      .set('rmid', param.executid)
      .set('propid', param.propid)
      .set('loginid', param.loginid)
      .set('limit', param.limit)
      .set('limitrows', param.limitrows);
    let body = params.toString();
    var headers = new Headers();
    return this.http
      .get<any>(this.mandate + '/rmleads?', { params })
      .pipe(map((response) => response));
  }

  completeassignedRMLeads1(param) {
    let params = new HttpParams()
      .set('FromDate', param.fromDate)
      .set('ToDate', param.toDate)
      .set('status', param.status)
      .set('stage', param.stage)
      .set('team', param.team)
      .set('stagestatus', param.stagestatus)
      .set('rmid', param.executid)
      .set('propid', param.propid)
      .set('loginid', param.loginid)
      .set('limit', param.limit)
      .set('limitrows', param.limitrows);
    let body = params.toString();
    var headers = new Headers();
    return this.http
      .get<any>(this.mandate + '/rmc?', { params })
      .pipe(map((response) => response));
  }

  gethistory(param) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('LeadID', param.leadid);
    urlSearchParams.append('RoleID', param.roleid);
    urlSearchParams.append('UserID', param.userid);
    urlSearchParams.append('execid', param.execid);
    urlSearchParams.append('feedback', param.feedbackid);
    let body = urlSearchParams.toString();
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post<any>(this.mandate + '/leadhistory', body, { headers: headers })
      .pipe(map((response) => response));
  }

  getassignedrm(id, loginid, execid, feedback, teamlead?) {
    let params = new HttpParams()
      .set('loginid', loginid)
      // .set('id', id)
      .set('execid', execid)
      .set('feedback', feedback);
    // .set('teamlead', teamlead ?? '');
    return this.http
      .get<any>(`${this.mandate}/getassignedrm/${id}`, { params })
      .pipe(map((response) => response));
  }

  // getassignedrm1(id,loginid,execid,feedback) {
  //   let params = new HttpParams()
  //   .set('loginid', loginid)
  //   .set('id',id)
  //   .set('execid',execid)
  //   .set('feedback',feedback)
  //     const cacheKey = 'getassignedrm_' + JSON.stringify(params);
  //     console.log(cacheKey)
  //     return this.cachedHttp.getWithCache(cacheKey, this.mandate + `/getassignedrm/${id}`, params)
  // }

  //get mandateCustomer details
  getcustomeredit(id): Observable<any> {
    return this.http.get<any>(this.mandate + '/geteditcustomer/' + id);
  }

  //GET mandate project
  getmandateprojects() {
    return this.http
      .get<any>(this.mandate + '/mandateprojects')
      .pipe(map((response) => response));
  }

  checkdirectteamexist(propid) {
    let params = new HttpParams().set('PropID', propid);

    return this.http
      .get<any>(this.mandate + '/directteamexistchecker', { params })
      .pipe(map((response) => response));
  }

  fetchmandateexecutives(
    propid: string,
    team: string,
    roleId?: string,
    teamlead?: string
  ): Observable<any> {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('PropID', propid);
    urlSearchParams.append('team', team);
    urlSearchParams.append('roleId', roleId ?? '');
    urlSearchParams.append('teamlead', teamlead ?? '');
    let body = urlSearchParams.toString();
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post<any>(`${this.mandate}/mandateexecutives`, body, { headers })
      .pipe(map((response) => response));
  }
  getfollowupsections() {
    return this.http.get<any>(this.mandate + '/followupcatogs');
  }

  fetchrequestedvalues(param) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('LeadID', param.leadid);
    urlSearchParams.append('PropID', param.propid);
    urlSearchParams.append('ExecID', param.execid);
    let body = urlSearchParams.toString();
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post(this.mandate + '/closerequestedvalues', body, { headers: headers })
      .pipe(map((response) => response));
  }

  getactiveleadsstatus(leadid, userid, assignid, propid, feedback) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('LeadID', leadid);
    urlSearchParams.append('ExecID', userid);
    urlSearchParams.append('assignID', assignid);
    urlSearchParams.append('propId', propid);
    urlSearchParams.append('feedback', feedback);
    let body = urlSearchParams.toString();
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post(this.mandate + '/getactiveleadsstatus', body, { headers: headers })
      .pipe(map((response) => response));
  }

  getjunksections() {
    return this.http.get(this.mandate + '/junkcatogs');
  }

  public uploadFile(data) {
    return this.http
      .post(this.mandate + '/closurefileuploads', data)
      .pipe(map((response) => response));
  }

  rsvselectproperties(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('ExecId', param.execid)
      .set('assignedId', param.assignid)
      .set('feedback', param.feedbackid);
    return this.http.post(this.mandate + '/getrsvselectedproperties', params);
  }

  closingrequestresponse(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('PropID', param.propid)
      .set('ExecID', param.execid)
      .set('statusid', param.statusid)
      .set('remarks', param.remarks)
      .set('assignID', param.assignid);
    return this.http.post(this.mandate + '/closerequestresponse', params);
  }

  requestresubmition(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('PropID', param.propid)
      .set('ExecID', param.execid)
      .set('bhk', param.bhk)
      .set('bhkunit', param.bhkunit)
      .set('dimension', param.dimension)
      .set('ratepersqft', param.ratepersqft)
      .set('assignID', param.assignid);
    return this.http.post(this.mandate + '/closureresubmition', params);
  }

  getvisitedsuggestproperties(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('ExecId', param.userid)
      .set('Stage', param.stage)
      .set('assignID', param.executeid)
      .set('feedback', param.feedbackid);
    return this.http.post(
      this.mandate + '/getsuggestvisitedproperties',
      params
    );
  }

  getmandateselectedsuggestproperties(leadid, userid, executeid, feedbackid) {
    let params = new HttpParams()
      .set('LeadID', leadid)
      .set('Execid', userid)
      .set('assignID', executeid)
      .set('feedback', feedbackid);
    return this.http.post(
      this.mandate + '/mandategetselectedsuggestproperties',
      params
    );
  }

  addselectedsuggestedproperties(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('PropertyID', param.suggestproperties)
      .set('Nextdate', param.nextdate)
      .set('Nexttime', param.nexttime)
      .set('ExecId', param.execid)
      .set('assignedId', param.assignid);
    return this.http.post(this.mandate + '/selectedsuggestproperty', params);
  }

  addpropertyvisitupdate(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('execid', param.execid)
      .set('PropertyID', param.propid)
      .set('ActionID', param.visitupdate)
      .set('Remarks', param.remarks)
      .set('Stage', param.stage)
      .set('assignID', param.assignid)
      .set('feedback', param.feedbackid);

    return this.http.post(this.mandate + '/propertyvisitupdate', params);
  }

  addrsvselectedrefix(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('PropertyID', param.suggestproperties)
      .set('Nextdate', param.nextdate)
      .set('Nexttime', param.nexttime)
      .set('ExecId', param.execid)
      .set('assignedId', param.assignedId)
      .set('feedback', param.feedbackid);
    return this.http.post(this.mandate + '/rsvselectedpropertiesrefix', params);
  }

  addleadhistory(param) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('LeadID', param.leadid);
    urlSearchParams.append('Leadstatus', param.leadstage);
    urlSearchParams.append('Actiondate', param.closedate);
    urlSearchParams.append('Actiontime', param.closetime);
    urlSearchParams.append('Stagestatus', param.stagestatus);
    urlSearchParams.append('remarks', param.textarearemarks);
    urlSearchParams.append('userid', param.userid);
    urlSearchParams.append('assignID', param.assignid);
    urlSearchParams.append('property', param.property);
    urlSearchParams.append('BHK', param.bhk);
    urlSearchParams.append('BhkUnit', param.bhkunit);
    urlSearchParams.append('dimension', param.dimension);
    urlSearchParams.append('ratepersft', param.ratepersft);
    urlSearchParams.append('autoremarks', param.autoremarks);
    urlSearchParams.append('closedleadID', param.closedleadID ?? '');
    urlSearchParams.append('feedback', param.feedbackid);
    let body = urlSearchParams.toString();
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post(this.mandate + '/addleadhistory', body, { headers: headers })
      .pipe(map((response) => response));
  }

  addfollowuphistory(followups) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('LeadID', followups.leadid);
    urlSearchParams.append('Leadstatus', followups.leadstatus);
    urlSearchParams.append('Stagestatus', followups.stagestatus);
    urlSearchParams.append('FollowupSection', followups.followupsection);
    urlSearchParams.append('Actiondate', followups.actiondate);
    urlSearchParams.append('Actiontime', followups.actiontime);
    urlSearchParams.append('remarks', followups.followupremarks);
    urlSearchParams.append('userid', followups.userid);
    urlSearchParams.append('assignID', followups.assignid);
    urlSearchParams.append('autoremarks', followups.autoremarks);
    urlSearchParams.append('property', followups.property);
    urlSearchParams.set('feedback', followups.feedbackid);
    let body = urlSearchParams.toString();
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post(this.mandate + '/addfollowupleadhistory', body, {
        headers: headers,
      })
      .pipe(map((response) => response));
  }

  addrsvselected(param) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('LeadID', param.leadid);
    urlSearchParams.append('PropertyID', param.suggestproperties);
    urlSearchParams.append('Nextdate', param.nextdate);
    urlSearchParams.append('Nexttime', param.nexttime);
    urlSearchParams.append('ExecId', param.execid);
    urlSearchParams.append('assignedId', param.assignid);
    urlSearchParams.append('feedback', param.feedbackid);
    let body = urlSearchParams.toString();
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post(this.mandate + '/rsvselectedproperties', body, { headers: headers })
      .pipe(map((response) => response));
  }

  getsuggestedproperties(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('Stage', param.stage)
      .set('Execid', param.userid)
      .set('assignID', param.executeid)
      .set('feedback', param.feedbackid);
    return this.http.post(this.mandate + '/suggestedproperties', params);
  }

  getnonselectedproperties(leadid, userid, executeid, feedbackid) {
    let params = new HttpParams()
      .set('LeadID', leadid)
      .set('ExecId', userid)
      .set('assignID', executeid)
      .set('feedback', feedbackid);
    return this.http.post(this.mandate + '/getnonselectedproperties', params);
  }

  getcancelledsuggestproperties(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('Stage', param.stage)
      .set('ExecId', param.userid)
      .set('assignID', param.executeid)
      .set('feedback', param.feedbackid);
    return this.http.post(
      this.mandate + '/getsuggestcancelledproperties',
      params
    );
  }

  addselectedsuggestedpropertiesrefix(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('PropertyID', param.suggestproperties)
      .set('Nextdate', param.nextdate)
      .set('Nexttime', param.nexttime)
      .set('ExecId', param.execid)
      .set('assignedId', param.assignedId);
    return this.http.post(
      this.mandate + '/selectedsuggestpropertyrefix',
      params
    );
  }

  getselectedsuggestproperties(leadid, execid, assignedId) {
    let params = new HttpParams()
      .set('LeadID', leadid)
      .set('ExecId', execid)
      .set('assignedId', assignedId);
    return this.http.post(
      this.mandate + '/getselectedsuggestproperties',
      params
    );
  }

  getassignedcs(id) {
    return this.http.get(this.mandate + '/getassignedcs/' + id);
  }

  getnegotiatedproperties(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('Stage', param.stage)
      .set('ExecId', param.userid)
      .set('assignedId', param.executeid);
    return this.http.post(this.mandate + '/getvisitednegotiated', params);
  }

  addnegoselected(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('PropertyID', param.suggestproperties)
      .set('Nextdate', param.nextdate)
      .set('Nexttime', param.nexttime)
      .set('ExecId', param.execid)
      .set('assignedId', param.assignedId)
      .set('feedback', param.feedbackid);
    return this.http.post(
      this.mandate + '/negotiationselectedproperties',
      params
    );
  }

  addnegoselectedrefix(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('PropertyID', param.suggestproperties)
      .set('Nextdate', param.nextdate)
      .set('Nexttime', param.nexttime)
      .set('ExecId', param.execid)
      .set('assignedId', param.assignedId)
      .set('feedback', param.feedbackid);
    return this.http.post(
      this.mandate + '/negotiationselectedpropertiesrefix',
      params
    );
  }

  negoselectproperties(leadid, execid, assignedId, feedbackid) {
    let params = new HttpParams()
      .set('LeadID', leadid)
      .set('ExecId', execid)
      .set('assignedId', assignedId)
      .set('feedback', feedbackid);
    return this.http.post(
      this.mandate + '/getnegotiationselectedproperties',
      params
    );
  }

  propertylist(param) {
    let params = new HttpParams()
      .set('leadid', param.leadid)
      .set('execid', param.execid)
      .set('feedback', param.feedbackid);
    return this.http
      .get<any>(this.mandate + '/propertylist?', { params })
      .pipe(map((response) => response));
  }

  leadexistcheckertest(param) {
    let params = new HttpParams()
      .set('number', param.number)
      .set('propertyId', param.propertyId)
      .set('execId', param.executiveId);
    return this.http.post<any>(this.mandate + '/leadexistchecker', params);
    // return this.http.post<any>('http://192.168.0.115/superadmin/cpclientreg/leadexistcheckertest',params )
  }

  adminmailsend(param, controller) {
    let params = new HttpParams()
      .set('client', param.client)
      .set('clientnum', param.clientnum)
      .set('clientmail', param.clientmail)
      .set('leadid', param.leadid)
      .set('bhksize', param.bhksize)
      .set('budgetrange', param.budgetrange)
      .set('execname', param.execname)
      .set('execid', param.execid)
      .set('source', param.source)
      .set('cpname', param.cpname)
      .set('cpid', param.cpid)
      .set('cpmail', param.cpmail)
      .set('propertyId', param.propertyId)
      .set('remarks', param.remarks)
      .set('otpbased', param.otpbased)
      .set('priority', param.priority ?? '')
      .set('mergedMail', param.mergedMail ?? '')
      .set('mergedNumber', param.mergedNumber ?? '')
      .set('mergedName', param.mergedName ?? '');
    return this.http.post<any>(this.mandate + controller, params);
    // return this.http.post<any>(this.mandate + controller, params)
    // mailsendbuilderbased
    // rsvvisittrigger

    // return this.http.post<any>('http://192.168.0.12/noncdnsuperadmin/mandatecrm_web'+controller,params )
    // return this.http.post<any>('https://superadmin-azure.right2shout.in/mandatecrm_web'+controller,params)
  }

  // getAllcounts(param){
  //   let params = new HttpParams()
  //   .set('PropID',  param.PropID)
  //   .set('FromDate',  param.fromdate)
  //   .set('todate',  param.todate);
  //   return this.http
  //   // .get<any>('http://192.168.0.126/noncdnsuperadmin/crmbackend/execquickview', { params })
  //   .get<any>( this.mandate +'/execquickview', { params })
  // }

  getscheduledtoday_execquickview(param) {
    let params = new HttpParams()
      .set('PropID', param.PropID)
      .set('FromDate', param.fromdate)
      .set('todate', param.todate);
    return (
      this.http
        // .get<any>('http://192.168.0.126/noncdnsuperadmin/crmbackend/scheduledtoday_execquickview', { params })
        .get<any>(this.mandate + '/scheduledtoday_execquickview', { params })
    );
  }

  // fetch leads counts
  getAssignedLeadsCounts(param) {
    let params = new HttpParams();
    // Mapping object to define API parameter names
    const paramMap = {
      fromDate: 'FromDate',
      toDate: 'ToDate',
      stage: 'stage',
      team: 'team',
      status: 'status',
      executid: 'rmid',
      propid: 'propid',
      loginid: 'loginid',
      priority: 'priority',
      stagestatus: 'stagestatus',
      source: 'source',
      followup: 'followup',
      visits: 'visits',
      receivedFromDate: 'receivedfromdate',
      receivedToDate: 'receivedtodate',
      visitedfromdate: 'visitedfromdate',
      visitedtodate: 'visitedtodate',
      assignedfromdate: 'assignedfromdate',
      assignedtodate: 'assignedtodate',
      fromTime: 'FromTime',
      visittype: 'visittype',
      visitassignedto: 'visitassignedto',
      toTime: 'ToTime',
      roleId: 'roleId',
      counter: 'counter',
      teamlead: 'teamlead',
      visitsuntouched: 'visitsuntouched',

      remarks_search: 'remarks_search',
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
    return this.http.get<any>(this.mandate + '/assignedleads_count_mandate?', {
      params,
    });
  }

  // fetch leads counts
  getAssignedLeadsRecord(param) {
    let params = new HttpParams()
      .set('FromDate', param.fromDate ?? '')
      .set('ToDate', param.toDate ?? '')
      .set('stage', param.stage ?? '')
      .set('team', param.team ?? '')
      .set('status', param.status ?? '')
      .set('rmid', param.executid ?? '')
      .set('propid', param.propid ?? '')
      .set('loginid', param.loginid ?? '')
      .set('priority', param.priority ?? '')
      .set('stagestatus', param.stagestatus ?? '')
      .set('source', param.source ?? '')
      .set('followup', param.followup ?? '')
      .set('visits', param.visits ?? '')
      .set('receivedfromdate', param.receivedFromDate ?? '')
      .set('receivedtodate', param.receivedToDate ?? '')
      .set('visitedfromdate', param.visitedfromdate ?? '')
      .set('visitedtodate', param.visitedtodate ?? '')
      .set('teamlead', param.teamlead ?? '')
      .set('visittype', param.visittype ?? '')
      .set('limit', param.limit ?? '')
      .set('limitrows', param.limitrows ?? '');
    let body = params.toString();
    var headers = new Headers();
    return this.http.get<any>(this.mandate + '/assignedleads_mandate?', {
      params,
    });
  }

  getActivityLeadsCounts(param) {
    let params = new HttpParams()
      .set('fromdate', param.fromDate ?? '')
      .set('todate', param.toDate ?? '')
      .set('stage', param.stage ?? '')
      .set('team', param.team ?? '')
      .set('status', param.status ?? '')
      .set('execid', param.executid ?? '')
      .set('propid', param.propid ?? '')
      .set('loginid', param.loginid ?? '')
      .set('priority', param.priority ?? '')
      .set('stagestatus', param.stagestatus ?? '')
      .set('source', param.source ?? '')
      .set('followup', param.followup ?? '')
      .set('visits', param.visits ?? '')
      .set('actionfromdate', param.actionfromdate ?? '')
      .set('actiontodate', param.actiontodate ?? '')
      .set('visitedfromdate', param.visitedfromdate ?? '')
      .set('visitedtodate', param.visitedtodate ?? '')
      .set('FromTime', param.fromTime ?? '')
      .set('teamlead', param.teamlead ?? '')
      .set('ToTime', param.toTime ?? '')
      .set('limit', param.limit ?? '')
      .set('limitrows', param.limitrows ?? '');
    let body = params.toString();
    var headers = new Headers();
    return this.http.get<any>(this.mandate + '/activity_report_count_byid?', {
      params,
    });
  }

  assignedLeads(param) {
    let params = new HttpParams()
      .set('FromDate', param.fromDate ?? '')
      .set('ToDate', param.toDate ?? '')
      .set('stage', param.stage ?? '')
      .set('team', param.team ?? '')
      .set('status', param.status ?? '')
      .set('rmid', param.executid ?? '')
      .set('propid', param.propid ?? '')
      .set('loginid', param.loginid ?? '')
      .set('priority', param.priority ?? '')
      .set('visits', param.visits ?? '')
      .set('stagestatus', param.stagestatus ?? '')
      .set('source', param.source ?? '')
      .set('receivedfromdate', param.receivedFromDate ?? '')
      .set('receivedtodate', param.receivedToDate ?? '')
      .set('assignedfromdate', param.assignedfromdate ?? '')
      .set('assignedtodate', param.assignedtodate ?? '')
      .set('visitedfromdate', param.visitedfromdate ?? '')
      .set('visitedtodate', param.visitedtodate ?? '')
      .set('FromTime', param.fromTime ?? '')
      .set('ToTime', param.toTime ?? '')
      .set('visittype', param.visittype ?? '')
      .set('teamlead', param.teamlead ?? '')
      .set('limit', param.limit)
      .set('limitrows', param.limitrows);
    let body = params.toString();
    var headers = new Headers();
    return this.http.get<any>(this.mandate + '/assignedleads_mandate?', {
      params,
    });
  }

  assignedLeads1(param) {
    let params = new HttpParams()
      .set('fromdate', param.fromDate)
      .set('todate', param.toDate)
      .set('status', param.status)
      .set('execid', param.executid)
      .set('limit', param.limit)
      .set('limitrows', param.limitrows)
      .set('stage', param.stage)
      .set('team', param.team)
      .set('propid', param.propid)
      .set('loginid', param.loginid)
      .set('priority', param.priority)
      .set('stagestatus', param.stagestatus)
      .set('source', param.source)
      .set('followup', param.followup)
      .set('visits', param.visits)
      .set('actionfromdate', param.actionfromdate)
      .set('actiontodate', param.actiontodate)
      .set('visitedfromdate', param.visitedfromdate)
      .set('visitedtodate', param.visitedtodate)
      .set('FromTime', param.fromTime ?? '')
      .set('teamlead', param.teamlead ?? '')
      .set('ToTime', param.toTime ?? '')
      .set('limit', param.limit)
      .set('limitrows', param.limitrows);
    let body = params.toString();
    var headers = new Headers();
    return this.http.get<any>(this.mandate + '/activity_report_byid', {
      params,
    });
  }

  getAssignedLeadsDetail(param) {
    let params = new HttpParams()
      .set('FromDate', param.fromDate)
      .set('ToDate', param.toDate)
      .set('stage', param.stage)
      .set('team', param.team)
      .set('status', param.status)
      .set('stagestatus', param.stagestatus)
      .set('rmid', param.executid)
      .set('propid', param.propid)
      .set('loginid', param.loginid)
      .set('priority', param.priority)
      .set('followup', param.followup)
      .set('source', param.source)
      .set('visits', param.visits)
      .set('receivedfromdate', param.receivedFromDate)
      .set('receivedtodate', param.receivedToDate)
      .set('visitedfromdate', param.visitedfromdate)
      .set('visitedtodate', param.visitedtodate)
      .set('assignedfromdate', param.assignedfromdate)
      .set('assignedtodate', param.assignedtodate)
      .set('FromTime', param.fromTime ?? '')
      .set('ToTime', param.toTime ?? '')
      .set('visittype', param.visittype ?? '')
      .set('remarks_search', param.remarks_search ?? '')
      .set('visitassignedto', param.visitassignedto ?? '')
      .set('counter', param.counter ?? '')
      .set('teamlead', param.teamlead ?? '')
      .set('visitsuntouched', param.visitsuntouched ?? '')
      .set('limit', param.limit)
      .set('limitrows', param.limitrows);
    let body = params.toString();
    var headers = new Headers();
    return this.http.get<any>(this.mandate + '/assignedleads_mandate?', {
      params,
    });
  }

  // getAssignedLeadsDetail1(param) {
  //   let params = new HttpParams()
  //     .set('FromDate', param.fromDate)
  //     .set('ToDate', param.toDate)
  //     .set('stage', param.stage)
  //     .set('team', param.team)
  //     .set('status',param.status)
  //     .set('stagestatus',param.stagestatus)
  //     .set('rmid', param.executid)
  //     .set('propid', param.propid)
  //     .set('loginid', param.loginid)
  //     .set('priority', param.priority)
  //     .set('followup', param.followup)
  //     .set('source', param.source)
  //     .set('visits', param.visits)
  //     .set('receivedfromdate', param.receivedFromDate)
  //     .set('receivedtodate', param.receivedToDate)
  //     .set('visitedfromdate', param.visitedfromdate)
  //     .set('visitedtodate', param.visitedtodate)
  //     .set('assignedfromdate', param.assignedfromdate)
  //     .set('assignedtodate', param.assignedtodate)
  //     .set('FromTime', param.fromTime ??'')
  //     .set('ToTime', param.toTime ??'')
  //     .set('visittype', param.visittype ??'')
  //     .set('visitassignedto', param.visitassignedto ??'')
  //     .set('limit', param.limit)
  //     .set('limitrows', param.limitrows);
  //     const cacheKey = 'assignedleads_mandate' + JSON.stringify(params);
  //     console.log(cacheKey)
  //     return this.cachedHttp.getWithCache(cacheKey, this.mandate + '/assignedleads_mandate', params)
  // }

  getRMLeadsCounts(param) {
    let params = new HttpParams()
      .set('FromDate', param.fromDate)
      .set('ToDate', param.toDate)
      .set('stage', param.stage)
      .set('team', param.team)
      .set('status', param.status)
      .set('rmid', param.executid)
      .set('propid', param.propid)
      .set('loginid', param.loginid)
      .set('limit', param.limit)
      .set('limitrows', param.limitrows);
    let body = params.toString();
    var headers = new Headers();
    return this.http.get<any>(this.mandate + '/rmc?', { params });
  }

  //GET property names
  getmandateprojects1(loginid) {
    let params = new HttpParams().set('execid', loginid);
    let body = params.toString();
    var headers = new Headers();
    // return this.http
    //   .get<any>(this.mandate + '/mandateprojects')
    //   .pipe(map((response) => response));
    return this.http.get<any>(this.mandate + '/mandateprojects?', { params });
  }

  // Get Executives Name
  fetchmandateexecutives1(
    propid: string,
    team: string,
    active,
    roleId?,
    teamlead?
  ) {
    let params = new HttpParams()
      .set('PropID', propid)
      .set('team', team)
      .set('roleId', roleId ?? '')
      .set('activestatus', active ?? '')
      .set('teamlead', teamlead ?? '');
    return this.http.post(this.mandate + '/mandateexecutives', params);
  }

  // get All Executive Counts Information
  getAllExecutiveInfo(param) {
    let params = new HttpParams()
      .set('PropID', param.PropID)
      .set('FromDate', param.fromdate)
      .set('todate', param.todate)
      .set('active', param.active);
    return (
      this.http
        // .get<any>('http://192.168.0.126/noncdnsuperadmin/crmbackend/execquickview', { params })
        .get<any>(this.mandate + '/execquickview', { params })
    );
  }

  getexecutivesbasedid(id) {
    let params = new HttpParams().set('ID', id);
    return this.http.get(this.mandate + '/execbdondesigs', { params });
  }

  //to get the hot, warm and cold, active, inactive and total exective leads counts
  getHotWarmColdLeadsCount(count, propid, fromdate, todate) {
    let params = new HttpParams()
      .set('count', count)
      .set('PropID', propid)
      .set('FromDate', fromdate)
      .set('ToDate', todate);
    return this.http.get(this.mandate + '/hotwarmcold_leads', { params });
  }

  //to get assigned lead information
  getassignedlead(id, loginid) {
    return this.http
      .get<any>(`${this.mandate}/geteditcustomer/${id}`)
      .pipe(map((response) => response));
  }

  // to get suggested new property
  getsuggested_newProperty(id, loginid) {
    let params = new HttpParams().set('leadid', id).set('execid', loginid);
    return this.http.get(this.mandate + '/propertylist', { params });
  }

  postleadPriority(param) {
    let params = new HttpParams()
      .set('LeadId', param.leadid)
      .set('ExecId', param.execid)
      .set('Priority', param.priority);
    return this.http.post(this.mandate + '/addleadpriority', params);
  }

  getlocality() {
    return this.http.get(this.mandate + '/localitylist');
  }

  resetToUsv(leadid, execid) {
    let params = new HttpParams().set('LeadId', leadid).set('ExecId', execid);
    return this.http.post(this.mandate + '/resettousv', params);
  }

  removeUploadedImage(fileId, fileName, leadId) {
    let params = new HttpParams()
      .set('file_id', fileId)
      .set('file_name', fileName)
      .set('LeadId', leadId);
    return this.http.post(this.mandate + '/removeclosurefileuploads', params);
  }

  leadassign(param) {
    let params = new HttpParams()
      .set('RMID', param.rmID)
      .set('LeadID', param.LeadID)
      .set('propID', param.propID)
      .set('random', param.random)
      .set('loginId', param.loginId);
    return this.http.post(this.mandate + '/leadassign', params);
  }

  visitreassign(param) {
    let params = new HttpParams()
      .set('RMID', param.rmID)
      .set('FromExecids', param.fromExecid)
      .set('LeadID', param.leadid)
      .set('propID', param.propid)
      .set('loginId', param.loginid)
      .set('random', param.random)
      .set('Stage', param.stage);
    return this.http.post(this.mandate + '/visitsreassign_mandate', params);
  }

  leadreassign(param) {
    let params = new HttpParams()
      .set('RMID', param.rmID)
      .set('LeadID', param.LeadID)
      .set('propID', param.propID)
      .set('random', param.random)
      .set('loginId', param.loginId)
      .set('FromExecids', param.fromExecids);
    return this.http.post(this.mandate + '/leadreassign_mandate', params);
  }

  inactiveJunkLeadreassign(param) {
    let params = new HttpParams()
      .set('RMID', param.rmID)
      .set('LeadID', param.LeadID)
      .set('propID', param.propID)
      .set('Stage', param.stage)
      .set('random', param.random)
      .set('loginId', param.loginId)
      .set('FromExecids', param.fromExecids);
    return this.http.post(this.mandate + '/junkreassign_mandate', params);
  }

  leadassignfeedback(param) {
    let params = new HttpParams()
      .set('RMID', param.rmID)
      .set('LeadID', param.LeadID)
      .set('propID', param.propID)
      .set('random', param.random)
      .set('loginId', param.loginId)
      .set('FromExecids', param.fromExecids);
    return this.http.post(this.mandate + '/assignfeedback', params);
  }

  revertBackToPreStage(param) {
    let params = new HttpParams()
      .set('LeadId', param.leadid)
      .set('PropId', param.propid)
      .set('ExecId', param.executid);
    return this.http.post(this.mandate + '/revertjunktoprevious', params);
  }

  localitylist() {
    return this.http.get(this.mandate + '/localitylist');
  }

  planLeadsCount(param) {
    let params = new HttpParams()
      .set('fromdate', param.fromDate)
      .set('todate', param.toDate)
      .set('status', param.statuss)
      .set('execid', param.executid)
      .set('propid', param.propid)
      .set('visits', param.visits)
      .set('stage', param.stage)
      .set('stagestatus', param.stagestatus)
      .set('loginid', param.loginid)
      .set('teamlead', param.teamlead ?? '')
      .set('plan', param.plan);

    return this.http.get<any>(this.mandate + '/week_plans_counts', { params });
  }

  planLeads(param) {
    let params = new HttpParams()
      .set('fromdate', param.fromDate)
      .set('todate', param.toDate)
      .set('status', param.statuss ?? '')
      .set('propid', param.propid ?? '')
      .set('execid', param.executid ?? '')
      .set('visits', param.visits ?? '')
      .set('source', param.source ?? '')
      .set('stage', param.stage ?? '')
      .set('stagestatus', param.stagestatus ?? '')
      .set('loginid', param.loginid ?? '')
      .set('teamlead', param.teamlead ?? '')
      .set('leadvisit', param.leadvisit ?? '')
      .set('plan', param.plan ?? '')
      .set('limit', param.limit ?? '')
      .set('limitrows', param.limitrows ?? '');

    return this.http.get<any>(this.mandate + '/week_plans', { params });
  }

  updatemyplan(params) {
    let param = new HttpParams()
      .set('ExecId', params.execid)
      .set('LeadId', params.leadid)
      .set('myplan', params.planid)
      .set('actiondate', params.plandate)
      .set('actiontime', params.plantime)
      .set('leadstage', params.stage)
      .set('stagestatus', params.stagestatus)
      .set('LoginId', params.loginid)
      .set('PropId', params.propid);
    return this.http.post(this.mandate + '/updatemyplan', param);
  }

  //GET ASSIGNED LEADS COUNT
  getInactiveLeadsCount(param: any) {
    let params = new HttpParams()
      .set('status', param.status)
      .set('rmid', param.executid)
      .set('loginid', param.loginid)
      .set('source', param.source)
      .set('counter', param.counter)
      .set('propid', param.propid)
      .set('limit', param.limit)
      .set('limitrows', param.limitrows);
    return this.http.get(this.mandate + '/assignedleads_count_mandate', {
      params,
    });
  }
  getInactiveLeadsDetail(param) {
    let params = new HttpParams()
      .set('status', param.status)
      .set('rmid', param.executid)
      .set('loginid', param.loginid)
      .set('source', param.source)
      .set('propid', param.propid)
      .set('counter', param.counter)
      .set('limit', param.limit)
      .set('limitrows', param.limitrows);
    return this.http.get(this.mandate + '/assignedleads_mandate', { params });
  }

  getFeedbackLeadsCount(param) {
    let params = new HttpParams();
    // Mapping object to define API parameter names
    const paramMap = {
      fromDate: 'FromDate',
      toDate: 'ToDate',
      stage: 'stage',
      team: 'team',
      status: 'status',
      executid: 'rmid',
      propid: 'propid',
      loginid: 'loginid',
      priority: 'priority',
      stagestatus: 'stagestatus',
      source: 'source',
      followup: 'followup',
      suggestedprop: 'suggestedprop',
      visitedprop: 'visitedprop',
      receivedFromDate: 'receivedfromdate',
      receivedToDate: 'receivedtodate',
      visitedfromdate: 'visitedfromdate',
      visitedtodate: 'visitedtodate',
      assignedfromdate: 'assignedfromdate',
      assignedtodate: 'assignedtodate',
      fromTime: 'FromTime',
      toTime: 'ToTime',
      tcid: 'tcid',
      limit: 'limit',
      limitrows: 'limitrows',
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
    return this.http.get<any>(this.mandate + '/feedback_assign_countapi?', {
      params,
    });
  }

  getFeedbackLeadsDetail(param) {
    let params = new HttpParams();
    // Mapping object to define API parameter names
    const paramMap = {
      fromDate: 'FromDate',
      toDate: 'ToDate',
      status: 'status',
      stage: 'stage',
      stagestatus: 'stagestatus',
      rmid: 'rmid',
      tcid: 'tcid',
      loginid: 'loginid',
      limit: 'limit',
      limitrows: 'limitrows',
      source: 'source',
      receivedfromdate: 'receivedfromdate',
      receivedtodate: 'receivedtodate',
      visitedfromdate: 'visitedfromdate',
      visitedtodate: 'visitedtodate',
      activityfromdate: 'activityfromdate',
      activitytodate: 'activitytodate',
      suggestedprop: 'suggestedprop',
      visitedprop: 'visitedprop',
      counter: 'counter',
      assignedfromdate: 'assignedfromdate',
      assignedtodate: 'assignedtodate',
      FromTime: 'FromTime',
      ToTime: 'ToTime',
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
    return this.http.get<any>(this.mandate + '/feedback_assignapi?', {
      params,
    });
  }

  getPriceList() {
    return this.http.get(this.mandate + '/get_propertiesdetails_mandate');
  }
  getCPlist() {
    return this.http
      .get<any>(this.cplistUrl + '/cplists')
      .pipe(map((response) => response));
  }

  updateBrochure(param) {
    return this.http
      .post(this.mandate + '/update_propbrochure_mandate', param)
      .pipe(map((response: any) => response));
  }

  postPriceSheetOnUpdate(param) {
    return this.http
      .post(this.mandate + '/update_pricesheet_only_mandate', param)
      .pipe(map((response: any) => response));
  }

  deletepriceSheet(param) {
    let params = new HttpParams()
      .set('detailsId', param.detailid)
      .set('pricesheetId', param.psid)
      .set('pricesheetfilename', param.pricesheetname);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.post(
      this.mandate + '/delete_proppricesheet_mandate',
      params.toString(),
      { headers: headers }
    );
  }

  updateVideo(param) {
    return this.http
      .post(this.mandate + '/update_propvideo_only_mandate', param)
      .pipe(map((response: any) => response));
  }

  deleteVideo(param) {
    let params = new HttpParams()
      .set('detailsId', param.detailid)
      .set('videoId', param.videoId)
      .set('videofilename', param.videofilename);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.post(
      this.mandate + '/delete_propvideo_mandate',
      params.toString(),
      { headers: headers }
    );
  }

  deletefloorplan(param) {
    let params = new HttpParams()
      .set('detailsId', param.detailid)
      .set('floorplanId', param.pfid)
      .set('floorplanfilename', param.floorplanName);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.post(
      this.mandate + '/delete_floorplan_mandate',
      params.toString(),
      { headers: headers }
    );
  }

  updatePropertyInfo(param) {
    return this.http
      .post(this.mandate + '/update_propinfo_mandate', param)
      .pipe(map((response: any) => response));
  }

  createPricingList(param) {
    return this.http
      .post(this.mandate + '/post_propertiesdetails_mandate', param)
      .pipe(map((response: any) => response));
  }

  // LEAD REASSIGNING
  teamLeadreassign(param) {
    let params = new HttpParams()
      .set('PropId', param.propID)
      .set('LeadId', param.LeadID)
      .set('FromExecId', param.fromExecids)
      .set('LoginId', param.loginId)
      .set('ToExecId', param.toExecid);
    return this.http.post(this.mandate + '/changeleadaccess', params);
  }

  feedbackassign(param) {
    let params = new HttpParams()
      .set('RMID', param.rmID)
      .set('LeadID', param.LeadID)
      .set('random', param.random)
      .set('loginId', param.loginid)
      .set('FromExecids', param.fromExecids);

    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.post(this.mandate + '/assignfeedback', params.toString(), {
      headers: headers,
    });
  }

  assignfixedvisitlead(param) {
    let params = new HttpParams()
      .set('LeadId', param.leadid)
      .set('PropId', param.propid)
      .set('LoginId', param.loginid)
      .set('FromExecId', param.fromExecid)
      .set('ToExecId', param.toExecid)
      .set('CrmType', param.crmType)
      .set('DbClient', param.dbClient);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );

    return this.http.post(
      this.mandate + '/assignfixedvisitlead_mandate',
      params.toString(),
      { headers: headers }
    );
  }

  unlockleadtomandate(param) {
    let params = new HttpParams()
      .set('leadid', param.leadid)
      .set('propid', param.propid)
      .set('execid', param.execid);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.post(
      this.mandate + '/unlockleadtomandate',
      params.toString(),
      { headers: headers }
    );
  }

  getFixedMandateProperties(param) {
    let params = new HttpParams()
      .set('LeadId', param.leadid)
      .set('ExecId', param.execid)
      .set('LoginId', param.loginid)
      .set('PropId', param.PropId ?? '');
    return this.http.get<any>(
      this.mandate + '/fixedvisitsexecbasedproperty_mandate?',
      { params }
    );
  }

  visitAssign(param) {
    let params = new HttpParams()
      .set('LeadId', param.leadid)
      .set('PropId', param.propid)
      .set('LoginId', param.loginid)
      .set('FromExecId', param.fromexecutives)
      .set('ToExecId', param.toexecutives)
      .set('CrmType', param.crmtype)
      .set('DbClient', param.dbclinet ?? '');
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.post(
      this.mandate + '/assignfixedvisitlead_mandate',
      params.toString(),
      { headers: headers }
    );

    // let urlSearchParams = new URLSearchParams();
    // urlSearchParams.append('LeadId', param.leadid);
    // urlSearchParams.append('PropId', param.propid);
    // urlSearchParams.append('LoginId', param.loginid);
    // urlSearchParams.append('FromExecId', param.fromexecutives);
    // urlSearchParams.append('ToExecId', param.toexecutives);
    // urlSearchParams.append('CrmType', param.crmtype);
    // urlSearchParams.append('DbClient', param.dbclinet);
    // var body = urlSearchParams.toString();

    // var headers = new Headers();
    // headers.append('Content-Type', 'application/x-www-form-urlencoded');

    // return this._http.post(this.mandate + '/assignfixedvisitlead_mandate', body, { headers: headers })
    //     .pipe(map(resp => resp.json()))
  }

  addsuggestedproperties(param) {
    let params = new HttpParams()
      .set('LeadID', param.LeadID)
      .set('PropertyID', param.PropertyID)
      .set('Stage', param.Stage)
      .set('Execid', param.Execid)
      .set('assignID', param.assignID);
    return this.http.post(
      'https://superadmin-azure.right2shout.in/mandatecrm_cs' +
        '/addsuggestproperties',
      params
    );
  }

  getPropertylist(param) {
    let params = new HttpParams()
      .set('leadid', param.leadid)
      .set('Execid', param.execid)
      .set('feedback', param.feedbackid ?? '');
    return this.http
      .get<any>(
        'https://superadmin-azure.right2shout.in/mandatecrm_cs' +
          '/propertylist?',
        { params }
      )
      .pipe(map((response) => response));
  }

  assignWhatsAppVisits(param) {
    let params = new HttpParams()
      .set('leadId', param.leadId ?? '')
      .set('loginid', param.loginid)
      .set('propname', param.propname)
      .set('propid', param.propid)
      .set('toexecid', param.toexecid)
      .set('visitdate', param.visitdate)
      .set('visittime', param.visittime);
    return this.http.post(this.mandate + '/assignwhatsappvisits', params);
  }
  getfetchmail(propid) {
    return this.http.get(this.mandate + '/get_mailwithpropid/' + propid);
  }

  clientregistration(param) {
    let params = new HttpParams()
      .set('leadid', param.leadid)
      .set('propid', param.propid)
      .set('client', param.customer)
      .set('clientnum', param.customernum)
      .set('clientmail', param.customermail)
      .set('rmname', param.rmname)
      .set('rmid', param.rmid)
      .set('rmmail', param.rmmail)
      .set('assignID', param.execid)
      .set('builder', param.builder)
      .set('property', param.property)
      .set('sendmail', param.sendto)
      .set('ccmail', param.sendcc)
      .set('sendnote', param.remarks);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.post(
      this.mandate + '/clientregistration',
      params.toString(),
      { headers: headers }
    );
  }

  updatehotwarmcold(priority, leadid) {
    let params = new HttpParams()
      .set('priority', priority)
      .set('leadid', leadid);

    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.post(
      this.mandate + '/updatehotwarmcold',
      params.toString(),
      {
        headers: headers,
      }
    );
  }
  givevisitaccess(param) {
    let params = new HttpParams()
      .set('leadid', param.leadid)
      .set('execid', param.execid)
      .set('propid', param.propid);

    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.post(
      this.mandate + '/givevisitaccess',
      params.toString(),
      {
        headers: headers,
      }
    );
  }
}
