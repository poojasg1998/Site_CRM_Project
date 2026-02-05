import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Subscription } from 'rxjs';
import { AuthServiceService } from './auth-service.service';
import { MandateService } from './mandate-service.service';

@Injectable({
  providedIn: 'root',
})
export class RetailServiceService {
  private hoverSubscription: Subscription;
  retailcrm: String;
  isCloseSuggModal = false;
  private hoverSubject = new BehaviorSubject<string>('');
  hoverState$ = this.hoverSubject.asObservable();
  isAdmin = false;
  // private adminControllerState = new BehaviorSubject<string>('');
  // adminControllerState$ = this.adminControllerState.asObservable();

  constructor(
    private http: HttpClient,
    private service: AuthServiceService,
    private mandateService: MandateService
  ) {
    this.hoverSubscription = this.service.hoverState$.subscribe((isHovered) => {
      this.isAdmin =
        localStorage.getItem('Role') === '1' &&
        localStorage.getItem('UserId') === '1';
      this.retailcrm = `https://superadmin-azure.right2shout.in/${
        localStorage.getItem('RcontrllerName')
          ? localStorage.getItem('RcontrllerName') + '/'
          : ''
      }retailcrm`;
    });
  }

  ngDestroy() {
    if (this.hoverSubscription) {
      this.hoverSubscription.unsubscribe();
    }
  }

  propertylistnew() {
    return this.http.get(this.retailcrm + '/propertynewlists');
  }

  // TO ASSIGN LEAD
  leadassign(param) {
    let params = new HttpParams()
      .set('RMID', param.rmID)
      .set('LeadID', param.LeadID)
      .set('random', param.random)
      .set('loginId', param.loginId);
    return this.http.post(this.retailcrm + '/leadassign', params);
  }

  // GET EXECUTIVE NAMES
  fetchRetail_executivesName(roleId, active) {
    let params = new HttpParams()
      .set('roleId', roleId)
      .set('activeStatus', active);
    return this.http.get(this.retailcrm + '/retail_executives', { params });
  }

  //GET ASSIGNED LEADS COUNT
  getAssignedLeadsCount(param: any) {
    let params = new HttpParams();
    const paramMap = {
      fromDate: 'FromDate',
      toDate: 'ToDate',
      status: 'status',
      stage: 'stage',
      team: 'team',
      stagestatus: 'stagestatus',
      executid: 'rmid',
      propid: 'propid',
      loginid: 'loginid',
      visitedprop: 'visitedprop',
      enquiredProp: 'enquiredProp',
      suggestedprop: 'suggestedprop',
      closedprop: 'closedprop',
      receivedFromDate: 'receivedFromDate',
      visitedfromdate: 'visitedfromdate',
      visitedtodate: 'visitedtodate',
      assignedfromdate: 'assignedfromdate',
      assignedtodate: 'assignedtodate',
      fromTime: 'fromTime',
      toTime: 'toTime',
      followup: 'followup',
      limit: 'limit',
      limitrows: 'limitrows',
      priority: 'priority',
      visittype: 'visittype',
      visitassignedto: 'visitassignedto',
      source: 'source',
      remarks_search: 'remarks_search',
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
    return this.http.get<any>(this.retailcrm + '/assignedleads_count_retail?', {
      params,
    });

    // let params = new HttpParams()
    // .set('FromDate', param.fromDate)
    // .set('ToDate', param.toDate)
    // .set('status', param.status)
    // .set('stage', param.stage)
    // .set('team', param.team)
    // .set('stagestatus', param.stagestatus)
    // .set('rmid', param.executid)
    // .set('propid', param.propid)
    // .set('loginid', param.loginid)
    // .set('limit', param.limit)
    // .set('followup', param.followup)
    // .set('visitedprop', param.visitedprop)
    // .set('enquiredprop', param.enquiredProp)
    // .set('suggestedprop', param.suggestedprop)
    // .set('closedprop', param.closedprop)
    // .set('receivedfromdate', param.receivedFromDate)
    // .set('receivedtodate', param.receivedToDate)
    // .set('visitedfromdate', param.visitedfromdate)
    // .set('visitedtodate', param.visitedtodate)
    // .set('assignedfromdate', param.assignedfromdate)
    // .set('assignedtodate', param.assignedtodate)
    // .set('FromTime', param.fromTime??'')
    // .set('ToTime', param.toTime??'')
    // .set('limitrows', param.limitrows)
    // .set('priority', param.priority)
    // .set('source', param.source);
    // return this.http.get(this.retailcrm + "/assignedleads_count_retail",{params})
  }

  // GET TO ASSIGNED LEAD DETAILS
  getAssignedLeadsDetail(param) {
    let params = new HttpParams()
      .set('FromDate', param.fromDate)
      .set('ToDate', param.toDate)
      .set('status', param.status)
      .set('stage', param.stage)
      .set('team', param.team)
      .set('stagestatus', param.stagestatus)
      .set('rmid', param.executid)
      .set('propid', param.propid)
      .set('enquiredprop', param.enquiredProp)
      .set('suggestedprop', param.suggestedprop)
      .set('visitedprop', param.visitedprop)
      .set('closedprop', param.closedprop)
      .set('loginid', param.loginid)
      .set('limit', param.limit)
      .set('limitrows', param.limitrows)
      .set('priority', param.priority)
      .set('followup', param.followup)
      .set('receivedfromdate', param.receivedFromDate)
      .set('receivedtodate', param.receivedToDate)
      .set('visitedfromdate', param.visitedfromdate)
      .set('visitedtodate', param.visitedtodate)
      .set('assignedfromdate', param.assignedfromdate)
      .set('assignedtodate', param.assignedtodate)
      .set('FromTime', param.fromTime ?? '')
      .set('ToTime', param.toTime ?? '')
      .set('visittype', param.visittype ?? '')
      .set('source', param.source)
      .set('visitassignedto', param.visitassignedto ?? '')
      .set('remarks_search', param.remarks_search ?? '');
    return this.http.get(this.retailcrm + '/assignedleads', { params });
  }

  // Get retail Executives Name
  getRetailExecutives(roleId, active) {
    let params = new HttpParams()
      .set('roleId', roleId)
      .set('activeStatus', active);
    return this.http.get(this.retailcrm + '/retail_executives', { params });
  }

  // LEAD REASSIGNING
  leadreassign(param) {
    let params = new HttpParams()
      .set('RMID', param.rmID)
      .set('LeadID', param.LeadID)
      .set('random', param.random)
      .set('loginId', param.loginId)
      .set('FromExecids', param.fromExecids);
    return this.http.post(this.retailcrm + '/leadreassign_retail', params);
  }

  inactiveJunkLeadreassign(param) {
    let params = new HttpParams()
      .set('RMID', param.rmID)
      .set('LeadID', param.LeadID)
      .set('Stage', param.stage)
      .set('random', param.random)
      .set('loginId', param.loginId)
      .set('FromExecids', param.fromExecids);

    return this.http.post(this.retailcrm + '/junkreassign_retail', params);
    // headers.append('Content-Type', 'application/x-www-form-urlencoded');
    // return this.http.post(this.mandateUrl + "/junkreassign_mandate", body, { headers: headers })
    // .pipe(map(response => response.json()));
  }

  leadassignfeedback(param) {
    let params = new HttpParams()
      .set('RMID', param.rmID)
      .set('LeadID', param.LeadID)
      .set('random', param.random)
      .set('loginId', param.loginId)
      .set('FromExecids', param.fromExecids);
    return this.http.post(this.retailcrm + '/assignfeedback', params);
  }

  getcustomeredit(id) {
    return this.http.get(this.retailcrm + '/geteditcustomer/' + id);
  }

  getassignedrmretail(id, loginid, feedbackid) {
    let params = new HttpParams()
      .set('loginid', loginid)
      .set('feedback', feedbackid);
    return this.http.get(this.retailcrm + '/getassignedrmretail/' + id, {
      params,
    });
  }

  getactiveleadsstatus(leadid, userid, assignid, feedback) {
    let params = new HttpParams()
      .set('LeadID', leadid)
      .set('ExecID', userid)
      .set('assignID', assignid)
      .set('feedback', feedback);
    return this.http.post(this.retailcrm + '/getactiveleadsstatus', params);
  }

  propertylist(param) {
    let params = new HttpParams()
      .set('leadid', param.leadid)
      .set('Execid', param.execid);
    return this.http.get(this.retailcrm + '/propertylist', { params });
  }

  getretailhistory(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('RoleID', param.roleid)
      .set('UserID', param.userid)
      .set('execid', param.execid)
      .set('feedback', param.feedback);
    return this.http.post(this.retailcrm + '/leadhistory', params);
  }

  localitylist() {
    return this.http.get(this.retailcrm + '/localitylist');
  }

  addsuggestedproperties(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('PropertyID', param.suggestproperties)
      .set('Stage', param.stage)
      .set('Execid', param.execid)
      .set('assignID', param.assignid);
    return this.http.post(this.retailcrm + '/addsuggestproperties', params);
  }

  getfollowupsections() {
    return this.http.get(this.retailcrm + '/followupcatogs');
  }

  retailpropertyvisitupdate(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('Execid', param.execid)
      .set('PropertyID', param.propid)
      .set('ActionID', param.visitupdate)
      .set('Remarks', param.remarks)
      .set('Stage', param.stage)
      .set('Stagestatus', param.stagestatus)
      .set('Actiondate', param.closedate)
      .set('Actiontime', param.closetime)
      .set('accompaniedid', param.accompany)
      .set('assignID', param.assignid ?? '')
      .set('feedback', param.feedback);

    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post(this.retailcrm + '/propertyvisitupdate', params.toString(), {
        headers: headers,
      })
      .pipe(map((response) => response));
  }

  addleadhistoryretail(param) {
    let params = new HttpParams()
      // .set('LeadID', param.leadid)
      // .set('Leadstatus', param.leadstage)
      // .set('Actiondate', param.closedate)
      // .set('Actiontime', param.closetime)
      // .set('Stagestatus', param.stagestatus)
      // .set('remarks', param.textarearemarks)
      // .set('userid', param.userid)
      // .set('assignID', param.assignid)
      // .set('property', param.property)
      // .set('BHK', param.bhk)
      // .set('BhkUnit', param.bhkunit)
      // .set('dimension', param.dimension)
      // .set('weekplan', param.weekplan)
      // .set('ratepersft', param.ratepersft)
      // .set('autoremarks', param.autoremarks)

      .set('LeadID', param.leadid ?? '')
      .set('Leadstatus', param.leadstage ?? '')
      .set('Actiondate', param.closedate ?? '')
      .set('Actiontime', param.closetime ?? '')
      .set('Stagestatus', param.stagestatus ?? '')
      .set('remarks', param.textarearemarks ?? '')
      .set('userid', param.userid ?? '')
      .set('assignID', param.assignid ?? '')
      .set('property', param.property ?? '')
      .set('BHK', param.bhk ?? '')
      .set('BhkUnit', param.bhkunit ?? '')
      .set('dimension', param.dimension ?? '')
      .set('weekplan', param.weekplan ?? '')
      .set('ratepersft', param.ratepersft ?? '')
      .set('autoremarks', param.autoremarks ?? '')
      .set('feedback', param.feedback ?? '');
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post(this.retailcrm + '/addleadhistory', params.toString(), {
        headers: headers,
      })
      .pipe(map((response) => response));
  }

  addretailfollowup(followups) {
    let params = new HttpParams()
      .set('LeadID', followups.leadid)
      .set('Leadstatus', followups.leadstatus)
      .set('Stagestatus', followups.stagestatus)
      .set('FollowupSection', followups.followupsection)
      .set('Actiondate', followups.actiondate)
      .set('Actiontime', followups.actiontime)
      .set('remarks', followups.followupremarks)
      .set('userid', followups.userid)
      .set('assignID', followups.assignid)
      .set('autoremarks', followups.autoremarks)
      .set('property', followups.property)
      .set('feedback', followups.feedback);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post(this.retailcrm + '/retailaddfollowup', params.toString(), {
        headers: headers,
      })
      .pipe(map((response) => response));
  }

  addfollowuphistory(followups) {
    let params = new HttpParams()
      .set('LeadID', followups.leadid)
      .set('Leadstatus', followups.leadstatus)
      .set('Stagestatus', followups.stagestatus)
      .set('FollowupSection', followups.followupsection)
      .set('Actiondate', followups.actiondate)
      .set('Actiontime', followups.actiontime)
      .set('remarks', followups.followupremarks)
      .set('userid', followups.userid)
      .set('assignID', followups.assignid)
      .set('autoremarks', followups.autoremarks)
      .set('property', followups.property ?? '')
      .set('feedback', followups.feedback ?? '');
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post(this.retailcrm + '/addfollowupleadhistory', params.toString(), {
        headers: headers,
      })
      .pipe(map((response) => response));
  }

  getsuggestedproperties(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('Stage', param.stage)
      .set('Execid', param.execid)
      .set('assignID', param.assignid)
      .set('feedback', param.feedback);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post(this.retailcrm + '/suggestedproperties', params.toString(), {
        headers: headers,
      })
      .pipe(map((response) => response));
  }

  getnonselectedpropertiesretail(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('ExecID', param.execid)
      .set('assignID', param.assignid)
      .set('feedback', param.feedback);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post(this.retailcrm + '/getnonselectedproperties', params.toString(), {
        headers: headers,
      })
      .pipe(map((response) => response));
  }

  getselectedsuggestpropertiesretail(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('ExecID', param.execid)
      .set('assignID', param.assignid)
      .set('feedback', param.feedback);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post(
        this.retailcrm + '/getselectedsuggestproperties',
        params.toString(),
        { headers: headers }
      )
      .pipe(map((response) => response));
  }

  getvisitedsuggestpropertiesretail(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('ExecID', param.execid)
      .set('Stage', param.stage)
      .set('assignID', param.assignid)
      .set('feedback', param.feedback);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post(
        this.retailcrm + '/getsuggestvisitedpropertiesretail',
        params.toString(),
        { headers: headers }
      )
      .pipe(map((response) => response));
  }

  getcancelledsuggestpropertiesretail(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('Stage', param.stage)
      .set('ExecID', param.execid)
      .set('assignID', param.assignid)
      .set('feedback', param.feedback);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post(
        this.retailcrm + '/getsuggestcancelledproperties',
        params.toString(),
        { headers: headers }
      )
      .pipe(map((response) => response));
  }

  getvisitpropertyothers(leadid, loginid, assignid, feedback) {
    let params = new HttpParams()
      .set('LeadID', leadid)
      .set('Execid', loginid)
      .set('assignID', assignid)
      .set('feedback', feedback);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post(this.retailcrm + '/visitedwithothers', params.toString(), {
        headers: headers,
      })
      .pipe(map((response) => response));
  }

  removeselectedproperties(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('PropertyID', param.suggestproperties)
      .set('stage', param.stage)
      .set('Execid', param.execid);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post(this.retailcrm + '/removeselectedproperty', params.toString(), {
        headers: headers,
      })
      .pipe(map((response) => response));
  }

  addselectedsuggestedproperties(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('PropertyID', param.suggestproperties)
      .set('Nextdate', param.nextdate)
      .set('Nexttime', param.nexttime)
      .set('Execid', param.execid)
      .set('assignID', param.assignid)
      .set('feedback', param.feedback);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post(this.retailcrm + '/selectedsuggestproperty', params.toString(), {
        headers: headers,
      })
      .pipe(map((response) => response));
  }

  addselectedsuggestedpropertiesrefix(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('PropertyID', param.suggestproperties)
      .set('Nextdate', param.nextdate)
      .set('Nexttime', param.nexttime)
      .set('Execid', param.execid)
      .set('assignID', param.assignid);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post(
        this.retailcrm + '/selectedsuggestpropertyrefix',
        params.toString(),
        { headers: headers }
      )
      .pipe(map((response) => response));
  }

  svselectpropertiesretail(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('ExecID', param.execid)
      .set('assignID', param.assignid)
      .set('feedback', param.feedback);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post(this.retailcrm + '/getsvselectedproperties', params.toString(), {
        headers: headers,
      })
      .pipe(map((response) => response));
  }

  addsvselectedproperties(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('PropertyID', param.suggestproperties)
      .set('Nextdate', param.nextdate)
      .set('Nexttime', param.nexttime)
      .set('Execid', param.execid)
      .set('assignID', param.assignid)
      .set('feedback', param.feedback);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.post(
      this.retailcrm + '/svselectedproperties',
      params.toString(),
      { headers: headers }
    );
  }

  addsvselectedpropertiesrefix(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('PropertyID', param.suggestproperties)
      .set('Nextdate', param.nextdate)
      .set('Nexttime', param.nexttime)
      .set('Execid', param.execid)
      .set('assignID', param.assignid)
      .set('feedback', param.feedback);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.post(
      this.retailcrm + '/svselectedpropertiesrefix',
      params.toString(),
      { headers: headers }
    );
  }

  rsvselectproperties(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('Execid', param.execid)
      .set('assignID', param.assignid)
      .set('feedback', param.feedback);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.post(
      this.retailcrm + '/getrsvselectedproperties',
      params.toString(),
      { headers: headers }
    );
  }

  addrsvselectedproperties(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('PropertyID', param.suggestproperties)
      .set('Nextdate', param.nextdate)
      .set('Nexttime', param.nexttime)
      .set('Execid', param.execid)
      .set('assignID', param.assignid)
      .set('feedback', param.feedback);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.post(
      this.retailcrm + '/rsvselectedproperties',
      params.toString(),
      { headers: headers }
    );
  }

  addrsvselectedrefix(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('PropertyID', param.suggestproperties)
      .set('Nextdate', param.nextdate)
      .set('Nexttime', param.nexttime)
      .set('Execid', param.execid)
      .set('assignID', param.assignid)
      .set('feedback', param.feedback);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.post(
      this.retailcrm + '/rsvselectedpropertiesrefix',
      params.toString(),
      { headers: headers }
    );
  }

  negoselectproperties(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('Execid', param.execid)
      .set('assignID', param.assignid)
      .set('feedback', param.feedback);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.post(
      this.retailcrm + '/getnegotiationselectedproperties',
      params.toString(),
      { headers: headers }
    );
  }

  getvisitednegotiated(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('Stage', param.stage)
      .set('Execid', param.execid)
      .set('assignID', param.assignid)
      .set('feedback', param.feedback);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.post(
      this.retailcrm + '/getvisitednegotiated',
      params.toString(),
      { headers: headers }
    );
  }

  addnegoselectedproperties(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('PropertyID', param.suggestproperties)
      .set('Nextdate', param.nextdate)
      .set('Nexttime', param.nexttime)
      .set('Execid', param.execid)
      .set('assignID', param.assignid)
      .set('feedback', param.feedback);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.post(
      this.retailcrm + '/negotiationselectedproperties',
      params.toString(),
      { headers: headers }
    );
  }

  addnegoselectedrefix(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('PropertyID', param.suggestproperties)
      .set('Nextdate', param.nextdate)
      .set('Nexttime', param.nexttime)
      .set('Execid', param.execid)
      .set('assignID', param.assignid)
      .set('feedback', param.feedback);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.post(
      this.retailcrm + '/negotiationselectedpropertiesrefix',
      params.toString(),
      { headers: headers }
    );
  }

  public uploadFile(data) {
    return this.http.post(this.retailcrm + '/closurefileuploads', data);
  }

  closingrequestresponse(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('PropID', param.propid)
      .set('ExecID', param.execid)
      .set('statusid', param.statusid)
      .set('remarks', param.remarks)
      .set('assignID', param.assignid ?? '');
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.post(
      this.retailcrm + '/closerequestresponse',
      params.toString(),
      { headers: headers }
    );
  }

  getjunksections() {
    return this.http.get(this.retailcrm + '/junkcatogs');
  }

  fetchclientregistereddata(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('Propid', param.propid);
    return this.http.get(this.retailcrm + '/fetchleadregistered', {
      params: params,
    });
  }
  getfetchmail(propid) {
    return this.http.get(this.retailcrm + '/get_mailwithpropid/' + propid);
  }

  clientregistration(param) {
    let params = new HttpParams()
      .set('leadid', param.leadid)
      .set('propid', param.propid)
      .set('client', param.customer)
      .set('clientnum', param.customernum)
      .set('clientmail', param.customermail)
      .set('rmname', param.rmname)
      .set('rmmail', param.rmmail)
      .set('builder', param.builder)
      .set('property', param.property)
      .set('sendmail', param.sendto)
      .set('ccmail', param.sendcc)
      .set('sendnote', param.remarks)
      .set('assignID', param.execid);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.post(
      this.retailcrm + '/clientregistration',
      params.toString(),
      { headers: headers }
    );
  }

  fetchrequestedvalues(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('PropID', param.propid)
      .set('ExecID', param.execid);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.post(
      this.retailcrm + '/closerequestedvalues',
      params.toString(),
      { headers: headers }
    );
  }

  requestresubmition(param) {
    let params = new HttpParams()
      .set('LeadID', param.leadid)
      .set('PropID', param.propid)
      .set('ExecID', param.execid)
      .set('bhk', param.bhk)
      .set('bhkunit', param.bhkunit)
      .set('dimension', param.dimension)
      .set('ratepersqft', param.ratepersqft);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.post(
      this.retailcrm + '/closureresubmition',
      params.toString(),
      { headers: headers }
    );
  }

  assignedLeadsCount(param) {
    let params = new HttpParams();
    const paramMap = {
      fromDate: 'FromDate',
      toDate: 'ToDate',
      status: 'status',
      stage: 'stage',
      team: 'team',
      stagestatus: 'stagestatus',
      executid: 'rmid',
      propid: 'propid',
      loginid: 'loginid',
      visitedfromdate: 'visitedfromdate',
      visitedtodate: 'visitedtodate',
      limit: 'limit',
      limitrows: 'limitrows',
      priority: 'priority',
      source: 'source',
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

    return this.http.get<any>(this.retailcrm + '/assignedleads_count_retail?', {
      params,
    });

    // let params = new HttpParams()
    // .set('FromDate', param.fromDate)
    // .set('ToDate', param.toDate)
    // .set('status', param.status)
    // .set('stage', param.stage)
    // .set('team', param.team)
    // .set('stagestatus', param.stagestatus)
    // .set('rmid', param.executid)
    // .set('propid', param.propid)
    // .set('loginid', param.loginid)
    // .set('visitedfromdate', param.visitedfromdate)
    // .set('visitedtodate', param.visitedtodate)
    // .set('limit', param.limit)
    // .set('limitrows', param.limitrows)
    // .set('priority', param.priority)
    // .set('source', param.source)
    // let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    // return this.http.get(this.retailcrm + "/assignedleads_count_retail/", { params: params } );
  }

  getCountForDashBoard(param) {
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
      .set('limitrows', param.limitrows)
      .set('priority', param.priority);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.get(this.retailcrm + '/retail_visit_counts/', {
      params: params,
    });
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
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.get(this.retailcrm + '/retail_visits', { params: params });
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
      .set('priority', param.priority)
      .set('source', param.source)
      .set('followup', param.followup)
      .set('receivedfromdate', param.receivedfrom)
      .set('receivedtodate', param.receivedto)
      .set('limit', param.limit)
      .set('limitrows', param.limitrows);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.get(this.retailcrm + '/assignedleads', { params: params });
  }

  getExecutiveInfo(param) {
    let params = new HttpParams()
      .set('PropID', param.PropID)
      .set('FromDate', param.fromdate)
      .set('todate', param.todate)
      .set('team', param.team)
      .set('ExecId', param.executid)
      .set('active', param.active);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.get(this.retailcrm + '/execquickview', { params: params });
  }

  getExecutiveScheldueTodayInfo(param) {
    let params = new HttpParams()
      .set('PropID', param.PropID)
      .set('todate', param.todate)
      .set('FromDate', param.fromdate)
      .set('team', param.team)
      .set('ExecId', param.execId);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.get(this.retailcrm + '/scheduledtoday_execquickview', {
      params: params,
    });
  }

  revertBackToPreStage(param) {
    let params = new HttpParams()
      .set('LeadId', param.leadid)
      .set('ExecId', param.executid);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.post(
      this.retailcrm + '/revertjunktoprevious',
      params.toString(),
      { headers: headers }
    );
  }

  // assignedLeads(param) {
  //   let urlSearchParams = new URLSearchParams();
  //   urlSearchParams.set('FromDate', param.datefrom);
  //   urlSearchParams.set('ToDate', param.dateto);
  //   urlSearchParams.set('status', param.statuss);
  //   urlSearchParams.set('stage', param.stage);
  //   urlSearchParams.set('team', param.team);
  //   urlSearchParams.set('stagestatus', param.stagestatus);
  //   urlSearchParams.set('rmid', param.executid);
  //   urlSearchParams.set('propid', param.propid);
  //   urlSearchParams.set('loginid', param.loginuser);
  //   urlSearchParams.set('limit', param.limit);
  //   urlSearchParams.set('limitrows', param.limitrows);
  //   urlSearchParams.set('priority', param.priority);
  //   urlSearchParams.set('source', param.source);
  //   urlSearchParams.set('followup', param.followup);
  //   urlSearchParams.set('receivedfromdate', param.receivedfrom);
  //   urlSearchParams.set('receivedtodate', param.receivedto);
  //   let body = urlSearchParams.toString()

  //   var headers = new Headers();
  //   return this.http
  //       .get(this.webapi + "/assignedleads?", { search: urlSearchParams })
  //       .pipe(map(response => response.json()));
  // }

  getDashboardCount(param) {
    let params = new HttpParams()
      .set('rmid', param.executid)
      .set('propId', param.propid)
      .set('FromDate', param.fromDate)
      .set('ToDate', param.toDate)
      .set('team', param.team);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.get(this.retailcrm + '/retail_leads_count', {
      params: params,
    });
  }

  getActivityLeadsCounts(param) {
    let params = new HttpParams()
      .set('fromdate', param.fromDate)
      .set('todate', param.toDate)
      .set('stage', param.stage)
      .set('team', param.team)
      .set('status', param.status)
      .set('execid', param.executid)
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
      .set('FromTime', param.fromTime)
      .set('ToTime', param.toTime)
      .set('limit', param.limit)
      .set('limitrows', param.limitrows);
    let body = params.toString();
    var headers = new Headers();
    return this.http.get<any>(this.retailcrm + '/activity_report_count_byid?', {
      params,
    });
  }

  getActivitiesRecords(param) {
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
      .set('FromTime', param.fromTime)
      .set('ToTime', param.toTime)
      .set('limit', param.limit)
      .set('limitrows', param.limitrows);
    let body = params.toString();
    var headers = new Headers();
    return this.http.get<any>(this.retailcrm + '/activity_report_byid', {
      params,
    });
  }

  updatemyplan(params1) {
    // let urlSearchParams = new URLSearchParams();
    // urlSearchParams.set('ExecId',params.execid),
    // urlSearchParams.set('LeadId',params.leadid),
    // urlSearchParams.set('myplan',params.planid),
    // urlSearchParams.set('actiondate',params.plandate),
    // urlSearchParams.set('actiontime',params.plantime),
    // urlSearchParams.set('leadstage',params.stage),
    // urlSearchParams.set('stagestatus',params.stagestatus),
    // urlSearchParams.set('LoginId',params.loginid)
    // urlSearchParams.set('PropId',params.propid)

    // let body = urlSearchParams.toString();
    // var headers = new Headers();
    // headers.append('Content-Type', 'application/x-www-form-urlencoded');

    // return this._http.post(this.webapi + "/updatemyplan", body , {headers : headers }).
    //     pipe(map((response)=>response.json()));

    let params = new HttpParams()
      .set('ExecId', params1.execid)
      .set('LeadId', params1.leadid)
      .set('myplan', params1.planid)
      .set('actiondate', params1.plandate)
      .set('actiontime', params1.plantime)
      .set('leadstage', params1.stage)
      .set('stagestatus', params1.stagestatus)
      .set('LoginId', params1.loginid)
      .set('PropId', params1.propid);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.post(this.retailcrm + '/updatemyplan', params.toString(), {
      headers: headers,
    });
    //  return this.http.get(this.retailcrm + "/updatemyplan", { params: params } );
  }

  planLeadsCount(param) {
    let params = new HttpParams()
      .set('fromdate', param.datefrom)
      .set('todate', param.dateto)
      .set('status', param.statuss)
      .set('execid', param.executid)
      .set('propid', param.propid)
      .set('visits', param.visits)
      .set('stage', param.stage)
      .set('stagestatus', param.stagestatus)
      .set('loginid', param.loginid)
      .set('plan', param.plan);

    return this.http.get<any>(this.retailcrm + '/week_plans_counts', {
      params,
    });
  }

  planLeads(param) {
    let params = new HttpParams()
      .set('fromdate', param.datefrom)
      .set('todate', param.dateto)
      .set('status', param.statuss)
      .set('propid', param.propid)
      .set('execid', param.executid)
      .set('visits', param.visits)
      .set('source', param.source)
      .set('stage', param.stage)
      .set('stagestatus', param.stagestatus)
      .set('loginid', param.loginid)
      .set('plan', param.plan)
      .set('limit', param.limit)
      .set('limitrows', param.limitrows);
    return this.http.get<any>(this.retailcrm + '/week_plans', { params });
  }

  getInactiveLeadsDetail(param) {
    let params = new HttpParams()
      .set('status', param.status)
      .set('rmid', param.executid)
      .set('loginid', param.loginid)
      .set('enquiredprop', param.enquiredprop)
      .set('source', param.source)
      .set('counter', param.counter)
      .set('suggestedprop', param.suggestedprop)
      .set('visitedprop', param.visitedprop)
      .set('limit', param.limit)
      .set('limitrows', param.limitrows);
    return this.http.get(this.retailcrm + '/assignedleads', { params });
  }

  //GET ASSIGNED LEADS COUNT
  getInactiveLeadsCount(param: any) {
    let params = new HttpParams()
      .set('status', param.status)
      .set('rmid', param.executid)
      .set('loginid', param.loginid)
      .set('enquiredprop', param.enquiredprop)
      .set('source', param.source)
      .set('counter', param.counter)
      .set('suggestedprop', param.suggestedprop)
      .set('visitedprop', param.visitedprop)
      .set('limit', param.limit)
      .set('limitrows', param.limitrows);
    return this.http.get(this.retailcrm + '/assignedleads_count_retail', {
      params,
    });
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
    return this.http.get<any>(this.retailcrm + '/feedback_assign_countapi?', {
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
    return this.http.get<any>(this.retailcrm + '/feedback_assignapi?', {
      params,
    });
  }

  //retail assigned leads section leads reassign.
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
    return this.http.post(
      this.retailcrm + '/assignfeedback',
      params.toString(),
      { headers: headers }
    );
  }

  getPriceList() {
    return this.http.get(this.retailcrm + '/get_propertiesdetails_retail');
  }

  createPricingList(param) {
    return this.http
      .post(this.retailcrm + '/post_propertiesdetails_retail', param)
      .pipe(map((response: any) => response));
  }

  updateBrochure(param) {
    return this.http
      .post(this.retailcrm + '/update_propbrochure_retail', param)
      .pipe(map((response: any) => response));
  }

  postPriceSheetOnUpdate(param) {
    return this.http
      .post(this.retailcrm + '/update_pricesheet_only_retail', param)
      .pipe(map((response: any) => response));
  }

  updateVideo(param) {
    return this.http
      .post(this.retailcrm + '/update_propvideo_only_retail', param)
      .pipe(map((response: any) => response));
  }

  updatePropertyInfo(param) {
    return this.http
      .post(this.retailcrm + '/update_propinfo_retail', param)
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
      this.retailcrm + '/delete_proppricesheet_retail',
      params.toString(),
      { headers: headers }
    );
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
      this.retailcrm + '/delete_propvideo_retail',
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
      this.retailcrm + '/delete_floorplan_retail',
      params.toString(),
      { headers: headers }
    );
  }

  //GET ASSIGNED LEADS COUNT
  getfixedvisitsexecbasedproperty(param: any) {
    let params = new HttpParams()
      .set('LeadId', param.leadid)
      .set('ExecId', param.execid)
      .set('LoginId', param.loginid);
    return this.http.get(
      this.retailcrm + '/fixedvisitsexecbasedproperty_retail',
      { params }
    );
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
      this.retailcrm + '/assignfixedvisitlead_retail',
      params.toString(),
      { headers: headers }
    );
  }

  unlockleadtoretail(param) {
    let params = new HttpParams()
      .set('leadid', param.leadid)
      .set('execid', param.execid);
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.post(
      this.retailcrm + '/unlockleadtoretail',
      params.toString(),
      { headers: headers }
    );
  }
}
