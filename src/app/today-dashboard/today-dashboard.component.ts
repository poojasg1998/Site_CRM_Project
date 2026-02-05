import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, scheduled } from 'rxjs';
import { MandateService } from '../mandate-service.service';
import { SharedService } from '../shared.service';
import { IonContent, IonModal } from '@ionic/angular';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-today-dashboard',
  templateUrl: './today-dashboard.component.html',
  styleUrls: ['./today-dashboard.component.scss'],
})
export class TodayDashboardComponent implements OnInit {
  @ViewChild('dashboard_custDate_modal') dashboard_custDate_modal: IonModal;
  @ViewChild('dashboard_fromDate_modal') dashboard_fromDate_modal: IonModal;
  @ViewChild('dashboard_toDate_modal') dashboard_toDate_modal: IonModal;
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  isProgrammaticScroll = false;
  propertyLists;
  showFromDateError = false;
  count = 0;
  filteredParams = {
    roleId: '',
    team: '',
    teamlead: '',
    fromDate: '',
    toDate: '',
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
  today_Counts = {
    scheduledVisits: '',
    scheduledVisits_USV: '',
    scheduledVisits_RSV: '',
    scheduledVisits_FN: '',
    todayVisits: '',
    todayVisits_USV: '',
    todayVisits_RSV: '',
    todayVisits_FN: '',
    upcomingVisits: '',
    upcomingVisits_USV: '',
    upcomingVisits_RSV: '',
    upcomingVisits_FN: '',
  };
  LeadDetails = [];
  showInfiniteScroll = true;
  showSpinner: boolean;
  roleid = '';
  userName = '';
  isRM = false;
  selectedExecu: any;
  executiveNames: any;
  sourceList;
  selectedSource;
  fromDateParam;
  toDateParam;
  roletype;
  userid: string;
  page = 1;
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
      this.showSpinner = true;
      this.fromDateParam = params['fromDate'];
      this.toDateParam = params['fromDate'];
      this.roleid = localStorage.getItem('Role');
      this.roletype = localStorage.getItem('RoleType');
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
      // this.getLeadsCount();

      if (this._sharedservice.hasState) {
        this.showSpinner = false;
        this.LeadDetails = this._sharedservice.enquiries;
        this.page = this._sharedservice.page;
        setTimeout(() => {
          this.content.scrollToPoint(0, this._sharedservice.scrollTop, 0);
        }, 0);

        setTimeout(() => {
          this._sharedservice.hasState = false;
        }, 5000);
      } else {
        this.content?.scrollToTop(300);
        this.getLeadsCount();
      }
    });
  }

  getLeadsCount() {
    const requests = [];
    const stage = ['', 'USV', 'RSV', 'Final Negotiation'];
    stage.forEach((stage) => {
      const params = {
        ...this.filteredParams,
        status: 'scheduledtoday',
        stage: stage,
        fromDate: new Date().toLocaleDateString('en-CA'),
        toDate: new Date().toLocaleDateString('en-CA'),
      };
      requests.push(this.mandateService.getAssignedLeadsCounts(params));
    });

    const stage1 = ['', 'USV', 'RSV', 'Final Negotiation'];
    stage1.forEach((stage) => {
      const params = {
        ...this.filteredParams,
        status: 'allvisits',
        stage: stage,
        stagestatus: '3',
        visitedfromdate: new Date().toLocaleDateString('en-CA'),
        visitedtodate: new Date().toLocaleDateString('en-CA'),
      };
      requests.push(this.mandateService.getAssignedLeadsCounts(params));
    });

    const stage2 = ['', 'USV', 'RSV', 'Final Negotiation'];
    stage2.forEach((stage) => {
      const params = {
        ...this.filteredParams,
        status: 'upcomingvisit',
        stage: stage,
      };
      requests.push(this.mandateService.getAssignedLeadsCounts(params));
    });

    forkJoin(requests).subscribe((results) => {
      // Process results
      results.forEach((assgnleads, index) => {
        switch (index) {
          case 0:
            this.today_Counts.scheduledVisits =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 1:
            this.today_Counts.scheduledVisits_USV =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 2:
            this.today_Counts.scheduledVisits_RSV =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;

          case 3:
            this.today_Counts.scheduledVisits_FN =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 4:
            this.today_Counts.todayVisits =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 5:
            this.today_Counts.todayVisits_USV =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 6:
            this.today_Counts.todayVisits_RSV =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 7:
            this.today_Counts.todayVisits_FN =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 8:
            this.today_Counts.upcomingVisits =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 9:
            this.today_Counts.upcomingVisits_USV =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 10:
            this.today_Counts.upcomingVisits_RSV =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 11:
            this.today_Counts.upcomingVisits_FN =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          default:
            break;
        }
      });
      this.getleadDetails(false);
    });
  }

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
      roleId: '',
      team: '',
      teamlead: '',
      fromDate: new Date().toLocaleDateString('en-CA'),
      toDate: new Date().toLocaleDateString('en-CA'),
      executid: '',
      status: 'scheduledtoday',
      leads: '',
      source: '',
      stagestatus: '',
      propid: '',
      loginid: localStorage.getItem('UserId'),
      stage: '',
      activeCardKey: 'scheduledVisits_card',
      limit: 0,
      limitrows: 10,
    };
    this.dateRange = {
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

    this.filteredParams.teamlead = this.roletype == '1' ? this.userid : '';
  }

  onStage(activeCardKey, stage, status?) {
    this.filteredParams.activeCardKey = activeCardKey;
    this.filteredParams.stage = stage;
    this.filteredParams.status = status;
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
      fromDate:
        this.filteredParams.activeCardKey == 'scheduledVisits_card'
          ? new Date().toLocaleDateString('en-CA')
          : '',
      toDate:
        this.filteredParams.activeCardKey == 'scheduledVisits_card'
          ? new Date().toLocaleDateString('en-CA')
          : '',
      visitedfromdate:
        this.filteredParams.activeCardKey == 'todayVisited_card'
          ? new Date().toLocaleDateString('en-CA')
          : '',
      visitedtodate:
        this.filteredParams.activeCardKey == 'todayVisited_card'
          ? new Date().toLocaleDateString('en-CA')
          : '',
      stagestatus:
        this.filteredParams.activeCardKey == 'todayVisited_card' ? '3' : '',
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
    this._sharedservice.scrollTop = event.detail.scrollTop;
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
    this._sharedservice.enquiries = this.LeadDetails;
    this._sharedservice.page = this.page;
    this._sharedservice.hasState = true;
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
            console.error('Error fetching project names:', error);
            reject(error);
          }
        );
    });
  }

  onFilterSelection(data, value) {
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
          this.roletype == '1' ? '2' : '',
          '',
          this.filteredParams.roleId,
          this.roletype == '1' ? localStorage.getItem('UserId') : ''
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

  resetInfiniteScroll() {
    this.showInfiniteScroll = false;
    setTimeout(() => {
      this.showInfiniteScroll = true;
    }, 10);
  }

  leadHeader() {
    if (this.filteredParams.activeCardKey == 'scheduledVisits_card') {
      if (this.filteredParams.stage == 'USV') {
        return 'Scheduled USV Visits';
      } else if (this.filteredParams.stage == 'RSV') {
        return 'Scheduled RSV Visits';
      } else if (this.filteredParams.stage == 'Final Negotiation') {
        return 'Scheduled FN Visits';
      } else {
        if (this.filteredParams.status == 'scheduledtoday') {
          return 'Scheduled Visits';
        }
      }
    } else if (this.filteredParams.activeCardKey == 'todayVisited_card') {
      if (this.filteredParams.stage == 'USV') {
        return 'Today USV Visited';
      } else if (this.filteredParams.stage == 'RSV') {
        return 'Today RSV Visited';
      } else if (this.filteredParams.stage == 'Final Negotiation') {
        return 'Today FN Visited';
      } else if (this.filteredParams.status == 'allvisits') {
        return 'Today Visited';
      }
    } else {
      if (this.filteredParams.stage == 'USV') {
        return 'Upcoming USV Visits';
      } else if (this.filteredParams.stage == 'RSV') {
        return 'Upcoming RSV Visits';
      } else if (this.filteredParams.stage == 'Final Negotiation') {
        return 'Upcoming FN Visits';
      } else if (this.filteredParams.status == 'upcomingvisit') {
        return 'Upcoming Visits';
      }
    }
    return '';
  }

  @ViewChild('addPriorityModal') addPriorityModal;
  priorityUpdateLead;
  priority_id = '';
  onSetPriority(lead, isEdit) {
    this.priorityUpdateLead = lead;
    if (!isEdit) {
      this.priority_id = '';
    }
    this.addPriorityModal.present();
  }
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
  propertyPriceList;
  grSitaraPropertyInfo;
  grSamskruthiProperyInfo;
  @ViewChild('propInfo') propInfo: ElementRef;
  sendWhatsApp(lead, type) {
    let url;
    const phoneNumber = lead.number;
    // const phoneNumber = '917090080306';
    if (lead.suggestedprop[0].propid === '16793') {
      if (type == 'location') {
        url = 'https://maps.app.goo.gl/FzU4bXzB8SgXRgPT8';
      } else if (type == 'brochure') {
        url =
          'https://lead247.in/images/brochure/GR%20Sitara%20Actual%20photos%20.pdf';
      } else if (type == 'info') {
        const textContent = this.propInfo.nativeElement.innerText; // Get plain text (no HTML tags)
        url = textContent
          .split('\n') // Split by new lines
          .map((line) => line.trim()) // Trim spaces from each line
          .filter(
            (line, index, arr) =>
              line !== '' || (arr[index - 1] && arr[index - 1] !== '')
          ) // Remove consecutive empty lines
          .join('\n'); // Join back with a single newline
      }
    } else if (lead.suggestedprop[0].propid === '1830') {
      if (type == 'location') {
        url = 'https://maps.app.goo.gl/3dvi23Sd6PPqvM91A';
      } else if (type == 'brochure') {
        url =
          'https://lead247.in/images/brochure/GR%20Samskruthi%20Brochure%20New..pdf';
      } else if (type == 'info') {
        const textContent = this.propInfo.nativeElement.innerText; // Get plain text (no HTML tags)
        url = textContent
          .split('\n') // Split by new lines
          .map((line) => line.trim()) // Trim spaces from each line
          .filter(
            (line, index, arr) =>
              line !== '' || (arr[index - 1] && arr[index - 1] !== '')
          ) // Remove consecutive empty lines
          .join('\n'); // Join back with a single newline
      }
    }

    const message = encodeURIComponent(`${url}`);
    const whatsappUrl = `https://wa.me/+91${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }
  async ngOnDestroy() {
    this._sharedservice.dismissAllOverlays();
  }
}
