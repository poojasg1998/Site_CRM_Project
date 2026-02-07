import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonModal } from '@ionic/angular';
import { MandateService } from '../mandate-service.service';
import { SharedService } from '../shared.service';
import { catchError, forkJoin, of } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-stage-dashboard',
  templateUrl: './stage-dashboard.component.html',
  styleUrls: ['./stage-dashboard.component.scss'],
})
export class StageDashboardComponent implements OnInit {
  @ViewChild('dashboard_custDate_modal') dashboard_custDate_modal: IonModal;
  @ViewChild('dashboard_fromDate_modal') dashboard_fromDate_modal: IonModal;
  @ViewChild('dashboard_toDate_modal') dashboard_toDate_modal: IonModal;
  @ViewChild('received_Date_modal') received_Date_modal: IonModal;
  @ViewChild('received_fromDate_modal') received_fromDate_modal: IonModal;
  @ViewChild('received_toDate_modal') received_toDate_modal: IonModal;
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  isProgrammaticScroll = false;
  propertyLists;
  showFromDateError = false;
  count = 0;
  filteredParams = {
    fromDate: '',
    toDate: '',
    stageHeader: '',
    roleId: '',
    team: '',
    teamlead: '',
    isDateFilter: '',
    executid: '',
    leads: '',
    source: '',
    status: '',
    stage: '',
    propid: '',
    stagestatus: '',
    activeCardKey: '',
    loginid: localStorage.getItem('UserId'),
    limit: 0,
    limitrows: 10,
  };
  dateRange = {
    fromdate: null as Date | null,
    todate: null as Date | null,
  };
  receiveddateRange = {
    fromdate: null as Date | null,
    todate: null as Date | null,
  };
  stageCounts = {
    usvFix: '',
    usvDone: '',
    usvOverdueFix: '',
    usvOverdueDone: '',
    usvjunkLeads: '',
    usvjunkVisits: '',
    rsvFix: '',
    rsvDone: '',
    rsvOverdueFix: '',
    rsvOverdueDone: '',
    rsvjunkLeads: '',
    rsvjunkVisits: '',
    fnFix: '',
    fnDone: '',
    fnOverdueFix: '',
    fnOverdueDone: '',
    fnjunkLeads: '',
    fnjunkVisits: '',
  };
  LeadDetails = [];
  showInfiniteScroll = true;
  showSpinner: boolean;
  roleid = '';
  roleType = '';
  userName = '';
  isRM = false;
  selectedExecu: any;
  executiveNames: any;
  sourceList;
  selectedSource;
  fromDateParam;
  toDateParam;
  todayISO = new Date().toISOString();
  userid: string;
  constructor(
    private activeRoute: ActivatedRoute,
    public router: Router,
    private mandateService: MandateService,
    private _sharedservice: SharedService
  ) {}

  ngOnInit() {
    this.activeRoute.queryParams.subscribe((params) => {
      if (params['isOnCallDetailsPage'] == 'true') {
        this.isOnCallDetailsPage = true;
      } else {
        this.isOnCallDetailsPage = false;
      }
      this.fromDateParam = params['fromDate'];
      this.toDateParam = params['fromDate'];
      this.roleid = localStorage.getItem('Role');
      this.roleType = localStorage.getItem('RoleType');
      this.userName = localStorage.getItem('Name');
      this.userid = localStorage.getItem('UserId');
      this.isRM =
        localStorage.getItem('Role') == '50001' ||
        localStorage.getItem('Role') == '50002' ||
        localStorage.getItem('Role') == '50009' ||
        localStorage.getItem('Role') == '50010';
      this.getqueryParam();
      this.getSource();
      this.fetchPropertyLists();
      this.fetchmandateexecutives();
      this.getLeadsCount();
    });
  }

  getLeadsCount() {
    this.showSpinner = true;
    if (this.filteredParams.stage == 'USV') {
      const requests = [];
      const stagestatus = ['1', '3'];
      stagestatus.forEach((stagestatus) => {
        const params = {
          ...this.filteredParams,
          stagestatus: stagestatus,
          status: '',
        };
        requests.push(
          this.mandateService.getAssignedLeadsCounts(params).pipe(
            catchError((err) => {
              return of({ AssignedLeads: [{ Uniquee_counts: 0 }] });
            })
          )
        );
      });

      const overdueStageStatus = ['1', '3'];
      overdueStageStatus.forEach((stagestatus) => {
        const params = {
          ...this.filteredParams,
          stagestatus: stagestatus,
          status: 'overdues',
        };
        requests.push(
          this.mandateService.getAssignedLeadsCounts(params).pipe(
            catchError((err) => {
              return of({ AssignedLeads: [{ Uniquee_counts: 0 }] });
            })
          )
        );
      });

      const status = ['junkleads', 'junkvisits'];
      status.forEach((status) => {
        const params = {
          ...this.filteredParams,
          stagestatus: status == 'junkleads' ? '1' : '3',
          status: status,
          assignedfromdate:
            status == 'junkleads' ? this.filteredParams.fromDate : '',
          assignedtodate:
            status == 'junkleads' ? this.filteredParams.toDate : '',
          visitedfromdate:
            status == 'junkvisits' ? this.filteredParams.fromDate : '',
          visitedtodate:
            status == 'junkvisits' ? this.filteredParams.toDate : '',
          fromDate: '',
          toDate: '',
        };
        requests.push(
          this.mandateService.getAssignedLeadsCounts(params).pipe(
            catchError((err) => {
              return of({ AssignedLeads: [{ Uniquee_counts: 0 }] });
            })
          )
        );
      });

      forkJoin(requests).subscribe((results) => {
        results.forEach((assgnleads, index) => {
          switch (index) {
            case 0:
              this.stageCounts.usvFix =
                assgnleads?.AssignedLeads?.[0]?.Uniquee_counts ?? 0;
              break;

            case 1:
              this.stageCounts.usvDone =
                assgnleads?.AssignedLeads?.[0]?.Uniquee_counts ?? 0;
              break;

            case 2:
              this.stageCounts.usvOverdueFix =
                assgnleads?.AssignedLeads?.[0]?.Uniquee_counts ?? 0;
              break;
            case 3:
              this.stageCounts.usvOverdueDone =
                assgnleads?.AssignedLeads?.[0]?.Uniquee_counts ?? 0;
              break;

            case 4:
              this.stageCounts.usvjunkLeads =
                assgnleads?.AssignedLeads?.[0]?.Uniquee_counts ?? 0;
              break;

            case 5:
              this.stageCounts.usvjunkVisits =
                assgnleads?.AssignedLeads?.[0]?.Uniquee_counts ?? 0;
              break;
          }
        });

        this.getleadDetails(false);
      });
    } else if (this.filteredParams.stage == 'RSV') {
      const requests1 = [];
      const stagestatus = ['1', '3'];
      stagestatus.forEach((stagestatus) => {
        const params = {
          ...this.filteredParams,
          stagestatus: stagestatus,
          status: '',
        };
        requests1.push(
          this.mandateService.getAssignedLeadsCounts(params).pipe(
            catchError((err) => {
              return of({ AssignedLeads: [{ Uniquee_counts: 0 }] });
            })
          )
        );
      });

      const overdueStageStatus = ['1', '3'];
      overdueStageStatus.forEach((stagestatus) => {
        const params = {
          ...this.filteredParams,
          stagestatus: stagestatus,
          status: 'overdues',
        };
        requests1.push(
          this.mandateService.getAssignedLeadsCounts(params).pipe(
            catchError((err) => {
              return of({ AssignedLeads: [{ Uniquee_counts: 0 }] });
            })
          )
        );
      });

      const status = ['junkleads', 'junkvisits'];
      status.forEach((status) => {
        const params = {
          ...this.filteredParams,
          stagestatus: status == 'junkleads' ? '1' : '3',
          status: status,
          assignedfromdate:
            status == 'junkleads' ? this.filteredParams.fromDate : '',
          assignedtodate:
            status == 'junkleads' ? this.filteredParams.toDate : '',
          visitedfromdate:
            status == 'junkvisits' ? this.filteredParams.fromDate : '',
          visitedtodate:
            status == 'junkvisits' ? this.filteredParams.toDate : '',
          fromDate: '',
          toDate: '',
        };
        requests1.push(
          this.mandateService.getAssignedLeadsCounts(params).pipe(
            catchError((err) => {
              return of({ AssignedLeads: [{ Uniquee_counts: 0 }] });
            })
          )
        );
      });

      forkJoin(requests1).subscribe((results) => {
        results.forEach((assgnleads, index) => {
          switch (index) {
            case 0:
              this.stageCounts.rsvFix =
                assgnleads?.AssignedLeads?.[0]?.Uniquee_counts ?? 0;
              break;

            case 1:
              this.stageCounts.rsvDone =
                assgnleads?.AssignedLeads?.[0]?.Uniquee_counts ?? 0;
              break;

            case 2:
              this.stageCounts.rsvOverdueFix =
                assgnleads?.AssignedLeads?.[0]?.Uniquee_counts ?? 0;
              break;
            case 3:
              this.stageCounts.rsvOverdueDone =
                assgnleads?.AssignedLeads?.[0]?.Uniquee_counts ?? 0;
              break;

            case 4:
              this.stageCounts.rsvjunkLeads =
                assgnleads?.AssignedLeads?.[0]?.Uniquee_counts ?? 0;
              break;

            case 5:
              this.stageCounts.rsvjunkVisits =
                assgnleads?.AssignedLeads?.[0]?.Uniquee_counts ?? 0;
              break;
          }
        });

        this.getleadDetails(false);
      });
    } else if (this.filteredParams.stage == 'Final Negotiation') {
      const requests2 = [];
      const stagestatus = ['1', '3'];
      stagestatus.forEach((stagestatus) => {
        const params = {
          ...this.filteredParams,
          stagestatus: stagestatus,
          status: '',
        };
        requests2.push(
          this.mandateService.getAssignedLeadsCounts(params).pipe(
            catchError((err) => {
              return of({ AssignedLeads: [{ Uniquee_counts: 0 }] });
            })
          )
        );
      });

      const overdueStageStatus = ['1', '3'];
      overdueStageStatus.forEach((stagestatus) => {
        const params = {
          ...this.filteredParams,
          stagestatus: stagestatus,
          status: 'overdues',
        };
        requests2.push(
          this.mandateService.getAssignedLeadsCounts(params).pipe(
            catchError((err) => {
              return of({ AssignedLeads: [{ Uniquee_counts: 0 }] });
            })
          )
        );
      });

      const status = ['junkleads', 'junkvisits'];
      status.forEach((status) => {
        const params = {
          ...this.filteredParams,
          stagestatus: status == 'junkleads' ? '1' : '3',
          status: status,
          assignedfromdate:
            status == 'junkleads' ? this.filteredParams.fromDate : '',
          assignedtodate:
            status == 'junkleads' ? this.filteredParams.toDate : '',
          visitedfromdate:
            status == 'junkvisits' ? this.filteredParams.fromDate : '',
          visitedtodate:
            status == 'junkvisits' ? this.filteredParams.toDate : '',
          fromDate: '',
          toDate: '',
        };
        requests2.push(
          this.mandateService.getAssignedLeadsCounts(params).pipe(
            catchError((err) => {
              return of({ AssignedLeads: [{ Uniquee_counts: 0 }] });
            })
          )
        );
      });

      forkJoin(requests2).subscribe((results) => {
        results.forEach((assgnleads, index) => {
          switch (index) {
            case 0:
              this.stageCounts.fnFix =
                assgnleads?.AssignedLeads?.[0]?.Uniquee_counts ?? 0;
              break;

            case 1:
              this.stageCounts.fnDone =
                assgnleads?.AssignedLeads?.[0]?.Uniquee_counts ?? 0;
              break;

            case 2:
              this.stageCounts.fnOverdueFix =
                assgnleads?.AssignedLeads?.[0]?.Uniquee_counts ?? 0;
              break;
            case 3:
              this.stageCounts.fnOverdueDone =
                assgnleads?.AssignedLeads?.[0]?.Uniquee_counts ?? 0;
              break;

            case 4:
              this.stageCounts.fnjunkLeads =
                assgnleads?.AssignedLeads?.[0]?.Uniquee_counts ?? 0;
              break;

            case 5:
              this.stageCounts.fnjunkVisits =
                assgnleads?.AssignedLeads?.[0]?.Uniquee_counts ?? 0;
              break;
          }
        });

        this.getleadDetails(false);
      });
    }
  }

  dateFilter(dateType) {
    this.resetInfiniteScroll();
    const today = new Date();
    const format = (d) => d.toISOString().split('T')[0];

    if (
      dateType != 'custom' &&
      dateType != 'customfromDate' &&
      dateType != 'customtoDate'
    ) {
      this.dateRange = {
        fromdate: null as Date | null,
        todate: null as Date | null,
      };
      this.filteredParams.isDateFilter = dateType;
    }

    if (dateType === 'today') {
      this.filteredParams.fromDate = format(today);
      this.filteredParams.toDate = format(today);
    } else if (dateType === 'yesterday') {
      const y = new Date(today);
      y.setDate(today.getDate() - 1);
      this.filteredParams.fromDate = format(y);
      this.filteredParams.toDate = format(y);
    } else if (dateType === 'lastsevenDay') {
      const from = new Date(today);
      from.setDate(from.getDate() - 6);
      this.filteredParams.fromDate = format(from);
      this.filteredParams.toDate = format(from);
    } else if (dateType === 'custom') {
      this.dashboard_custDate_modal.present();
      return;
    } else if (dateType == 'customfromDate') {
      this.filteredParams.isDateFilter = 'custom';
      if (this.dateRange.fromdate > this.dateRange.todate) {
        this.dateRange.todate = null;

        this.filteredParams.toDate = '';

        this.filteredParams.fromDate = ('' + this.dateRange.fromdate).split(
          'T'
        )[0];
        this.filteredParams.toDate = ('' + this.dateRange.todate).split('T')[0];
      } else {
        this.filteredParams.fromDate = ('' + this.dateRange.fromdate).split(
          'T'
        )[0];
        this.filteredParams.toDate = ('' + this.dateRange.todate).split('T')[0];
      }
      this.showFromDateError = false;
      this.dashboard_fromDate_modal?.dismiss();

      return;
    } else if (dateType == 'customtoDate') {
      this.filteredParams.isDateFilter = 'custom';
      this.filteredParams.fromDate = ('' + this.dateRange.todate).split('T')[0];
      this.filteredParams.toDate = ('' + this.dateRange.todate).split('T')[0];

      this.dashboard_toDate_modal?.dismiss();
      return;
    }
    this.addQueryParams();
  }
  // dateFilter(dateType) {
  //   const today = new Date();
  //   const format = (d) => d?.toISOString().split('T')[0] || '';
  //   const isVisit = this.filteredParams.status === 'junkvisits';
  //   const fromKey = isVisit ? 'visitedfromdate' : 'assignedfromdate';
  //   const toKey = isVisit ? 'visitedtodate' : 'assignedtodate';

  //   if (!['custom', 'customfromDate', 'customtoDate'].includes(dateType)) {
  //     this.dateRange = { fromdate: null, todate: null };
  //     this.filteredParams.isDateFilter = dateType;
  //   }

  //   switch (dateType) {
  //     case 'today':
  //       this.filteredParams[fromKey] = format(today);
  //       this.filteredParams[toKey] = format(today);
  //       break;

  //     case 'yesterday':
  //       const y = new Date(today);
  //       y.setDate(today.getDate() - 1);
  //       this.filteredParams[fromKey] = format(y);
  //       this.filteredParams[toKey] = format(y);
  //       break;

  //     case 'lastsevenDay':
  //       const from = new Date(today);
  //       from.setDate(today.getDate() - 6);
  //       this.filteredParams[fromKey] = format(from);
  //       this.filteredParams[toKey] = format(today);
  //       break;

  //     case 'custom':
  //       this.dashboard_custDate_modal.present();
  //       return;

  //     case 'customfromDate':
  //       this.filteredParams.isDateFilter = 'custom';

  //       if (this.dateRange.fromdate > this.dateRange.todate) {
  //         this.dateRange.todate = null;
  //         this.filteredParams[toKey] = '';
  //       }

  //       this.filteredParams[fromKey] = format(this.dateRange.fromdate);
  //       this.filteredParams[toKey] = format(this.dateRange.todate);

  //       this.showFromDateError = false;
  //       this.dashboard_fromDate_modal?.dismiss();
  //       return;

  //     case 'customtoDate':
  //       this.filteredParams.isDateFilter = 'custom';
  //       this.filteredParams[toKey] = format(this.dateRange.todate);
  //       this.dashboard_toDate_modal?.dismiss();
  //       return;
  //   }

  //   this.addQueryParams();
  // }

  addQueryParams() {
    const queryParams = {};
    let paramsChanged = false;
    for (const key in this.filteredParams) {
      if (this.filteredParams.hasOwnProperty(key)) {
        // Set the param if it's not empty, otherwise set to null
        const newParamValue =
          this.filteredParams[key] !== '' ? this.filteredParams[key] : null;
        // Check if query parameters have changed
        if (this.activeRoute.snapshot.queryParams[key] !== newParamValue) {
          paramsChanged = true;
        }
        queryParams[key] = newParamValue;
      }
    }
    this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }
  reset() {
    this.filteredParams = {
      fromDate: '',
      toDate: '',
      roleId: '',
      team: '',
      teamlead: '',
      isDateFilter: 'today',
      executid: '',
      status: this.filteredParams.status,
      leads: '1',
      source: '',
      stagestatus: this.filteredParams.status == 'junkleads' ? '' : '3',
      propid: '',
      loginid: localStorage.getItem('UserId'),
      stage: this.filteredParams.status == 'junkleads' ? 'Fresh' : 'USV',
      activeCardKey:
        this.filteredParams.status == 'junkleads'
          ? 'leads_card'
          : 'visits_card',
      stageHeader: 'USV',
      limit: 0,
      limitrows: 10,
    };
    this.dateRange = {
      fromdate: null as Date | null,
      todate: null as Date | null,
    };
    this.receiveddateRange = {
      fromdate: null as Date | null,
      todate: null as Date | null,
    };
    this.addQueryParams();
  }
  getqueryParam() {
    const queryString = window.location.search;
    const queryParams = {};
    new URLSearchParams(queryString).forEach((value, key) => {
      queryParams[key] = value;
    });
    Object.keys(this.filteredParams).forEach((key) => {
      if (queryParams.hasOwnProperty(key)) {
        this.filteredParams[key] = queryParams[key];
      } else if (key == 'propid' && 'ranavPropId' in localStorage) {
        this.filteredParams[key] = '28773';
      } else if (key !== 'loginid' && key !== 'limit' && key !== 'limitrows') {
        this.filteredParams[key] = '';
      }
    });
    this.filteredParams.teamlead = this.roleType == '1' ? this.userid : '';
    this.filteredParams.executid =
      localStorage.getItem('Role') === '1'
        ? this.filteredParams.executid
        : localStorage.getItem('UserId');
  }

  onStage(activeCardKey, stage, stagestatus?, status?) {
    this.filteredParams.status = status ? status : '';
    this.filteredParams.activeCardKey = activeCardKey;
    this.filteredParams.stage = stage;
    this.filteredParams.stagestatus = stagestatus ? stagestatus : '';
    this.isProgrammaticScroll = true;
    setTimeout(() => {
      this.scrollToLeads();
    }, 1000);
    this.resetInfiniteScroll();
    this.addQueryParams();
  }

  @ViewChild('leadsSection') leadsSection!: any;
  scrollToLeads() {
    this.leadsSection.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
    setTimeout(() => {
      this.isProgrammaticScroll = false;
    }, 500);
  }
  loadMoreData(event) {
    if (this.isProgrammaticScroll) {
      event.target.complete();
      return;
    }

    this.getleadDetails(true).then((hasData) => {
      event.target.complete();
      if (!hasData) {
        event.target.disabled = true;
      }
    });
  }

  getleadDetails(isLoadMore: boolean) {
    this.count = isLoadMore ? (this.count += 10) : 0;
    this.filteredParams.limit = this.count;

    const filteredParams = {
      ...this.filteredParams,
      assignedfromdate:
        this.filteredParams.status == 'junkleads'
          ? this.filteredParams.fromDate
          : '',
      assignedtodate:
        this.filteredParams.status == 'junkleads'
          ? this.filteredParams.toDate
          : '',
      visitedfromdate:
        this.filteredParams.status == 'junkvisits'
          ? this.filteredParams.fromDate
          : '',
      visitedtodate:
        this.filteredParams.status == 'junkvisits'
          ? this.filteredParams.toDate
          : '',
      fromDate:
        this.filteredParams.status != 'junkvisits' &&
        this.filteredParams.status != 'junkleads'
          ? this.filteredParams.fromDate
          : '',
      toDate:
        this.filteredParams.status != 'junkvisits' &&
        this.filteredParams.status != 'junkleads'
          ? this.filteredParams.toDate
          : '',
    };

    return new Promise((resolve, reject) => {
      this.mandateService.assignedLeads(filteredParams).subscribe({
        next: (response: any) => {
          if (response['status'] == 'True') {
            this.LeadDetails = isLoadMore
              ? this.LeadDetails.concat(response['AssignedLeads'])
              : response['AssignedLeads'];
            resolve(true);
          } else {
            isLoadMore ? '' : (this.LeadDetails = []);
            resolve(false);
          }
          this.showSpinner = false;
        },
        error: (err) => {
          this.LeadDetails = [];
          this.showSpinner = false;
          resolve(false);
        },
      });
    });
  }

  canScroll;
  onScroll(event: CustomEvent) {
    const scrollTop = event.detail.scrollTop;
    this.content.getScrollElement().then((scrollEl) => {
      const scrollTop = scrollEl.scrollTop;
      const scrollHeight = scrollEl.scrollHeight;
      const clientHeight = scrollEl.offsetHeight;

      this.canScroll = scrollHeight > clientHeight + 10; // ADD A BUFFER of 10px

      if (!this.canScroll) {
        this._sharedservice.isBottom = false;
      } else {
        this._sharedservice.isBottom =
          scrollTop + clientHeight >= scrollHeight - 100;
      }
    });
  }
  lead;
  isOnCallDetailsPage = false;
  @ViewChild('sliding') sliding;
  @ViewChild('callConfirmationModal') callConfirmationModal;
  outboundCall(lead) {
    // this.sliding.close();
    if (lead == true) {
      this.isOnCallDetailsPage = true;
      this.callConfirmationModal.dismiss();
      const cleanedNumber =
        this.lead?.number.startsWith('91') && this.lead?.number.length > 10
          ? this.lead?.number.slice(2)
          : this.lead?.number;

      const param = {
        execid: localStorage.getItem('UserId'),
        callto: cleanedNumber,
        leadid: this.lead.LeadID,
        starttime: this.getCurrentDateTime(),
        modeofcall: 'mobile-mandate',
        leadtype: 'mandate',
        assignee: this.lead.ExecId,
      };

      this._sharedservice.outboundCall(param).subscribe(() => {
        this.callConfirmationModal.dismiss();
      });

      this.router.navigate([], {
        queryParams: {
          isOnCallDetailsPage: this.isOnCallDetailsPage,
          leadId: this.lead.LeadID,
          execid: this.lead.ExecId,
          leadTabData: 'status',
          callStatus: 'Call Connected',
          direction: 'outboundCall',
          headerType: 'mandate',
        },
        queryParamsHandling: 'merge',
      });
    } else {
      this.lead = lead;
      this.callConfirmationModal.present();
    }
  }

  getCurrentDateTime(): string {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  onplayButton(lead) {
    this.router.navigate(['./all-and-live-call-details'], {
      queryParams: {
        execid: lead.ExecId,
        isAllCallLogs: false,
        callRecord: true,
        clientnum: lead.number,
        lastUpdate: lead.lastupdated,
        leadName: lead.CustomerName,
      },
    });
  }

  onSwipe(event, lead: any) {
    if (event.detail.side == 'start') {
      window.open(`https://wa.me/+91 ${lead.number}`, '_system');
      this.sliding.close();
    } else {
      this.outboundCall(lead);
    }
  }

  navigateToMandateCustomerPage(leadId, execid, lead) {
    let propid;
    lead.suggestedprop.forEach((prop) => {
      if (lead.propertyname == prop.name) {
        propid = prop.propid;
      }
    });
    this.router.navigate(['../mandate-customers'], {
      queryParams: {
        leadId: leadId,
        execid: execid,
        status: 'info',
        propid: propid,
        teamlead:
          localStorage.getItem('RoleType') == '1'
            ? localStorage.getItem('UserId')
            : null,
        htype: 'mandate',
      },
      queryParamsHandling: 'merge',
    });
  }

  //To get the property lists
  fetchPropertyLists() {
    return new Promise((resolve, reject) => {
      this.mandateService
        .getmandateprojects1(localStorage.getItem('UserId'))
        .subscribe(
          (response) => {
            if (response['status'] === 'True') {
              this.propertyLists = response['Properties'];
              resolve(true);
            } else {
              reject('Failed to fetch project names');
            }
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  onFilterSelection(data, value) {
    this.resetInfiniteScroll();
    switch (data) {
      case 'property':
        this.filteredParams.propid = value.property_idfk;
        break;
      case 'exec':
        this.filteredParams.executid = value.id;
        break;
      case 'source':
        this.filteredParams.source = value.source;
        break;
      default:
        break;
    }
    this.addQueryParams();
  }

  // method to get the executive names
  fetchmandateexecutives() {
    return new Promise((resolve, reject) => {
      this.mandateService
        .fetchmandateexecutives1(
          localStorage.getItem('PropertyId'),
          this.roleType == '1' ? '2' : '',
          '',
          this.filteredParams.roleId,
          this.roleType == '1' ? localStorage.getItem('UserId') : ''
        )
        .subscribe((response) => {
          this.executiveNames = response['mandateexecutives'];
          this.executiveNames = [
            { name: 'All', executid: '' },
            ...(response['mandateexecutives'] || []).filter(
              (x) => x.name !== 'Test RM' && x.name !== 'Test CS'
            ),
          ];

          if (
            localStorage.getItem('RoleType') == '1' &&
            this.filteredParams.executid == ''
          ) {
            this.selectedExecu = this.executiveNames?.filter((exec, i) => {
              if (exec.id == localStorage.getItem('UserId')) {
                return exec;
              }
            });
          } else {
            this.selectedExecu = this.executiveNames?.filter((exec, i) => {
              if (exec.id == this.filteredParams.executid) {
                return exec;
              }
            });
          }
          this.selectedExecu = this.selectedExecu?.[0];
          resolve(true);
        });
    });
  }

  getSource() {
    this._sharedservice.sourcelist().subscribe((resp) => {
      this.sourceList = resp['Sources'];

      this.selectedSource = resp['Sources']?.filter((source, i) => {
        if (source.source == this.filteredParams.source) {
          return source;
        }
      });
      this.selectedSource = this.selectedSource?.[0];
    });
  }
  onmodaldismiss() {
    this.dashboard_fromDate_modal?.dismiss();
    this.dashboard_toDate_modal?.dismiss();
  }
  handleToDateClick() {
    if (!this.dateRange.fromdate) {
      this.showFromDateError = true;
      return;
    }

    this.showFromDateError = false;
    this.openToDate();
  }
  // To open to date modal
  async openToDate() {
    await this.dashboard_fromDate_modal?.dismiss();
    await this.dashboard_toDate_modal.present();
  }

  // To open from date modal
  async openFromDate() {
    await this.dashboard_toDate_modal?.dismiss();
    await this.dashboard_fromDate_modal.present();
  }
  onCustomDateModalDismiss(event) {
    this.showFromDateError = false;
    // if (
    //   !(this.dateRange.fromdate && this.dateRange.todate) ||
    //   (this.dateRange.fromdate && !this.dateRange.todate)
    // ) {
    //   this.dateRange = {
    //     fromdate: null as Date | null,
    //     todate: null as Date | null,
    //   };
    //   this.removeDateFilter();
    //   this.addQueryParams();
    // }
  }

  removeDateFilter() {
    this.dateRange = {
      fromdate: null as Date | null,
      todate: null as Date | null,
    };
    this.filteredParams.isDateFilter = 'today';
    this.filteredParams.fromDate = new Date().toLocaleDateString('en-CA');

    this.filteredParams.toDate = new Date().toLocaleDateString('en-CA');

    this.addQueryParams();
  }

  formattedFromDate(date): string {
    if (!this.dateRange?.fromdate) return '';
    return new Date(date).toLocaleDateString('en-CA');
  }

  resetInfiniteScroll() {
    this.showInfiniteScroll = false;
    setTimeout(() => {
      this.showInfiniteScroll = true;
    }, 10);
  }

  // To open to date modal
  async openreceivedToDate() {
    await this.received_fromDate_modal?.dismiss();
    await this.received_toDate_modal.present();
  }

  // To open from date modal
  async openreceivedFromDate() {
    await this.received_toDate_modal?.dismiss();
    await this.received_fromDate_modal.present();
  }

  handleReceivedToDateClick() {
    if (!this.receiveddateRange.fromdate) {
      this.showFromDateError = true;
      return;
    }

    this.showFromDateError = false;
    this.openreceivedToDate();
  }

  onStageChange(stage) {
    this.filteredParams.stage = stage;
    this.filteredParams.stagestatus = '1';
    this.addQueryParams();
  }

  addCounts(num1, num2) {
    return Number(num1) + Number(num2);
  }

  @ViewChild('addPriorityModal') addPriorityModal;
  priorityUpdateLead;
  onSetPriority(lead) {
    this.priorityUpdateLead = lead;
    this.priority_id = '';
    this.addPriorityModal.present();
  }
  priority_id = '';
  onUpdatePriority() {
    this.mandateService
      .updatehotwarmcold(this.priority_id, this.priorityUpdateLead.LeadID)
      .subscribe((resp) => {
        Swal.fire({
          title: 'Updated Successfully',
          text: 'Priority type Successfully updated',
          icon: 'success',
          heightAuto: false,
          confirmButtonText: 'OK',
        }).then(() => {
          this.addPriorityModal.dismiss();
          location.reload();
        });
      });
  }
}
