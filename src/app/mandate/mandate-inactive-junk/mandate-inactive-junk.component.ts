import {
  Component,
  ElementRef,
  NgZone,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonCheckbox, IonContent, MenuController } from '@ionic/angular';
import { Location } from '@angular/common';
import { forkJoin } from 'rxjs';
import { MandateService } from 'src/app/mandate-service.service';
import Swal from 'sweetalert2';
import { RetailServiceService } from 'src/app/retail-service.service';
import { SharedService } from 'src/app/shared.service';

@Component({
  selector: 'app-mandate-inactive-junk',
  templateUrl: './mandate-inactive-junk.component.html',
  styleUrls: ['./mandate-inactive-junk.component.scss'],
})
export class MandateInactiveJunkComponent implements OnInit {
  @ViewChildren('freshleadsCheckboxes') checkboxes!: QueryList<IonCheckbox>;
  @ViewChild('viewAssignLeadDetail') viewAssignLeadDetail;
  @ViewChild('filterModal') filterModal;
  isAdmin = false;
  isCheckbox = false;
  showSpinner = false;
  selectedCount;
  selectedLeadCount;
  isManual = false;
  isLeftFilterActive = '';
  count;
  localStorage = localStorage;
  filteredParams = {
    status: '',
    team: '',
    executid:
      localStorage.getItem('Role') === '1'
        ? []
        : localStorage.getItem('UserId'),
    loginid: localStorage.getItem('UserId'),
    source: '',
    counter: '',
    enquiredprop: '',
    visitedprop: '',
    suggestedprop: '',
    visitedPropertyName: '',
    suggetsedPropertyName: '',
    htype: '',
    active: '1',
    propid: '',
    limit: 0,
    limitrows: 5,
  };
  tempFilteredValues;

  inactive_junkCount = {
    inactive: '',
    junkLeads: '',
    junkVisits: '',
    inactive_I: '',
    inactive_II: '',
    inactive_III: '',
    inactive_IV: '',
    finalInactive: '',
  };
  showInfiniteScroll = true;
  leads_detail = [];
  temporaryLeadIds = [];
  checkedLeadsDetail = [];
  fromExecids = [];

  selectedTeam;
  selectedProperty;
  isRetail = true;
  selectedExecTeam;
  randomId = '';
  selectedExecutiveName = [];
  reassignedResponseInfo;
  executives;
  mandateExecutives;
  team = [
    { name: 'Retail Team', code: 'Retail' },
    { name: 'Mandate Team', code: 'Mandate' },
  ];
  execTeam = [
    { name: 'Relationship Executives', code: '50002' },
    { name: 'Customersupport Executives', code: '50014' },
  ];
  isRM = false;
  isOnCallDetailsPage = false;

  constructor(
    private activeRoute: ActivatedRoute,
    private mandateService: MandateService,
    private ngZone: NgZone,
    private menuCtrl: MenuController,
    private _location: Location,
    private router: Router,
    private retailService: RetailServiceService,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    this.activeRoute.queryParams.subscribe((params) => {
      if (params['isOnCallDetailsPage'] == 'true') {
        this.isOnCallDetailsPage = true;
      } else {
        this.isOnCallDetailsPage = false;
      }

      this.isRM =
        this.localStorage.getItem('Role') == '50001' ||
        this.localStorage.getItem('Role') == '50002' ||
        this.localStorage.getItem('Role') == '50009' ||
        this.localStorage.getItem('Role') == '50010';
      this.isAdmin = localStorage.getItem('Role') === '1';
      this.leads_detail = [];
      this.getQueryParams();
      this.fetchMandateProperty();
      this.getExecutives('', '', '1');
      this.getsourcelist();

      this.getPriceList();

      if (this.sharedService.hasState) {
        this.showSpinner = false;
        this.leads_detail = this.sharedService.enquiries;
        this.page = this.sharedService.page;
        setTimeout(() => {
          this.content.scrollToPoint(0, this.sharedService.scrollTop, 0);
        }, 0);

        setTimeout(() => {
          this.sharedService.hasState = false;
        }, 5000);
      } else {
        this.getInactiveLeadsCount();
      }
    });
  }

  // To fetach Inactive leads count
  getInactiveLeadsCount() {
    this.showSpinner = true;
    const requests = [];
    const status = ['inactive', 'junkleads', 'junkvisits'];
    status.forEach((status) => {
      const params = { ...this.filteredParams, status: status, counter: '' };
      requests.push(this.mandateService.getInactiveLeadsCount(params));
    });

    const counter = ['1', '2', '3', '4', 'final'];
    counter.forEach((counter) => {
      const params = { ...this.filteredParams, counter: counter };
      requests.push(this.mandateService.getInactiveLeadsCount(params));
    });

    forkJoin(requests).subscribe((results) => {
      results.forEach((inactiveLeads, index) => {
        switch (index) {
          case 0:
            this.inactive_junkCount.inactive =
              inactiveLeads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 1:
            this.inactive_junkCount.junkLeads =
              inactiveLeads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 2:
            this.inactive_junkCount.junkVisits =
              inactiveLeads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 3:
            this.inactive_junkCount.inactive_I =
              inactiveLeads['AssignedLeads'][0]['counts'];
            break;
          case 4:
            this.inactive_junkCount.inactive_II =
              inactiveLeads['AssignedLeads'][0]['counts'];
            break;
          case 5:
            this.inactive_junkCount.inactive_III =
              inactiveLeads['AssignedLeads'][0]['counts'];
            break;
          case 6:
            this.inactive_junkCount.inactive_IV =
              inactiveLeads['AssignedLeads'][0]['counts'];
            break;
          case 7:
            this.inactive_junkCount.finalInactive =
              inactiveLeads['AssignedLeads'][0]['counts'];
            break;
          default:
            break;
        }
      });
      this.getInactiveLeadsDetail(false, 0);
    });
  }

  getInactiveLeadsDetail(isLoadmore, selectedCount) {
    // this.count = isLoadmore ? this.count + 5 : 0;
    // this.filteredParams.limit = this.count;

    if (selectedCount != 0 && !isLoadmore) {
      this.filteredParams.limit = 0;
      this.filteredParams.limitrows = selectedCount;
    } else {
      this.count = isLoadmore ? (this.count += 5) : 0;
      this.filteredParams.limit = this.count;
    }

    return new Promise((resolve, reject) => {
      this.mandateService.getInactiveLeadsDetail(this.filteredParams).subscribe(
        (response) => {
          this.ngZone.run(() => {
            if (response['status'] === 'True') {
              // this.enquiredProperty = response['EnquiredPropertyLists'];
              // this.enquiredProperty1 = this.enquiredProperty;
              // this.suggestVisitedProperty = response['SuggestedPropertyLists'];
              // this.suggestVisitedProperty1 =  this.suggestVisitedProperty;
              // this.closedProperty = response['ClosedPropertyLists'];
              // this.closedProperty1 = this.closedProperty
              this.leads_detail = isLoadmore
                ? this.leads_detail.concat(response['AssignedLeads'])
                : response['AssignedLeads'];
              resolve(true);
            } else {
              resolve(false);
            }
            this.showSpinner = false;
          });
        },
        (error) => {
          this.showSpinner = false;
          resolve(false);
        }
      );
    });
  }

  // get the querryParam values
  getQueryParams() {
    const queryString = window.location.search;
    const queryParams: any = {};

    // ✅ Handle multiple query params (like executid=40119&executid=40200)
    const urlParams = new URLSearchParams(queryString);
    urlParams.forEach((value, key) => {
      if (queryParams[key]) {
        // If already present, make it an array
        if (Array.isArray(queryParams[key])) {
          queryParams[key].push(value);
        } else {
          queryParams[key] = [queryParams[key], value];
        }
      } else {
        queryParams[key] = value;
      }
    });

    Object.keys(this.filteredParams).forEach((key) => {
      if (queryParams.hasOwnProperty(key)) {
        if (key === 'executid') {
          const val = queryParams[key];
          if (Array.isArray(val)) {
            this.filteredParams[key] = val;
          } else if (typeof val === 'string' && val.includes(',')) {
            this.filteredParams[key] = val.split(',');
          } else {
            this.filteredParams[key] = [val];
          }
        } else {
          this.filteredParams[key] = queryParams[key];
        }
      } else if (key == 'propid' && 'ranavPropId' in localStorage) {
        this.filteredParams[key] = '28773';
      } else if (key !== 'loginid' && key !== 'limit' && key !== 'limitrows') {
        this.filteredParams[key] = '';
      }
    });

    this.filteredParams.executid =
      localStorage.getItem('Role') === '1'
        ? this.filteredParams.executid
        : localStorage.getItem('UserId');
  }

  // To add querryParam
  addQueryParams() {
    this.resetInfiniteScroll();
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
    this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  openEndMenu() {
    this.sharedService.isMenuOpen = true;
    this.menuCtrl.open('end');
  }

  onBackbutton() {
    this.resetInfiniteScroll();
    this._location.back();
  }
  onBackicon() {
    this.resetInfiniteScroll();
    this.isCheckbox = false;
    this.isManual = false;
    this.showSpinner = false;
  }

  resetInfiniteScroll() {
    this.showInfiniteScroll = false;
    setTimeout(() => {
      this.showInfiniteScroll = true;
    }, 10);
  }

  onHtype(htype) {
    this.reset_filter();
    this.filteredParams = { ...this.tempFilteredValues };
    const queryParams = {};
    for (const key in this.filteredParams) {
      if (
        this.filteredParams.hasOwnProperty(key) &&
        this.filteredParams[key] !== ''
      ) {
        queryParams[key] = this.filteredParams[key];
      } else {
        queryParams[key] = null;
      }
    }
    if (htype == 'mandate') {
      this.router.navigate(['mandate-inactive-junk'], {
        queryParams,
        queryParamsHandling: 'merge',
      });
    } else {
      this.router.navigate(['retail-inactive-junk'], {
        queryParams,
        queryParamsHandling: 'merge',
      });
    }
  }

  onInactiveJunkTab(data) {
    this.filteredParams.status = data;
    this.filteredParams.counter = '1';
    this.resetInfiniteScroll();
    this.addQueryParams();
  }

  //when we click on inactiveI,II,III,IV and final buttons
  onInactiveButtonClick(data) {
    this.filteredParams.counter = data;
    this.addQueryParams();
  }

  onReassign() {
    this.temporaryLeadIds = [];
    this.isCheckbox = true;
  }

  //called when we swip the card
  onSwipe(event, lead: any) {
    if (event.detail.side == 'start') {
      window.open(`https://wa.me/+91 ${lead.number}`, '_system');
      // this.navigateToWhatsApp(lead.number);
    } else {
      window.open(`tel:${lead.number}`, '_system');
      if (lead && lead.number) {
        // Trigger the call
        window.open(`tel:${lead.number}`, '_system');
      } else {
        console.error('Phone number not available for the selected lead.');
      }
    }
  }

  checkedLeads(event) {
    this.checkedLeadsDetail = [];
    this.checkboxes.forEach((checkbox, index) => {
      if (checkbox.checked) {
        this.checkedLeadsDetail.push(this.leads_detail[index]);
      }
    });
    this.temporaryLeadIds = this.checkedLeadsDetail.map((lead) => lead.LeadID);
    this.checkedLeadsDetail.forEach((element) => {
      this.fromExecids.push(element.ExecId);
    });
  }

  loadData(event) {
    // if (
    //   (this.filteredParams.status === 'inactive' &&
    //     ((this.filteredParams.counter == '1' &&
    //       this.leads_detail.length <
    //         Number(this.inactive_junkCount.inactive_I)) ||
    //       (this.filteredParams.counter == '2' &&
    //         this.leads_detail.length <
    //           Number(this.inactive_junkCount.inactive_II)) ||
    //       (this.filteredParams.counter == '3' &&
    //         this.leads_detail.length <
    //           Number(this.inactive_junkCount.inactive_III)) ||
    //       (this.filteredParams.counter == '4' &&
    //         this.leads_detail.length <
    //           Number(this.inactive_junkCount.inactive_IV)) ||
    //       (this.filteredParams.counter == 'final' &&
    //         this.leads_detail.length <
    //           Number(this.inactive_junkCount.finalInactive)))) ||
    //   (this.filteredParams.status === 'junkleads' &&
    //     ((this.filteredParams.counter == '1' &&
    //       this.leads_detail.length <
    //         Number(this.inactive_junkCount.inactive_I)) ||
    //       (this.filteredParams.counter == '2' &&
    //         this.leads_detail.length <
    //           Number(this.inactive_junkCount.inactive_II)) ||
    //       (this.filteredParams.counter == '3' &&
    //         this.leads_detail.length <
    //           Number(this.inactive_junkCount.inactive_III)) ||
    //       (this.filteredParams.counter == '4' &&
    //         this.leads_detail.length <
    //           Number(this.inactive_junkCount.inactive_IV)) ||
    //       (this.filteredParams.counter == 'final' &&
    //         this.leads_detail.length <
    //           Number(this.inactive_junkCount.finalInactive)))) ||
    //   (this.filteredParams.status === 'junkvisits' &&
    //     ((this.filteredParams.counter == '1' &&
    //       this.leads_detail.length <
    //         Number(this.inactive_junkCount.inactive_I)) ||
    //       (this.filteredParams.counter == '2' &&
    //         this.leads_detail.length <
    //           Number(this.inactive_junkCount.inactive_II)) ||
    //       (this.filteredParams.counter == '3' &&
    //         this.leads_detail.length <
    //           Number(this.inactive_junkCount.inactive_III)) ||
    //       (this.filteredParams.counter == '4' &&
    //         this.leads_detail.length <
    //           Number(this.inactive_junkCount.inactive_IV)) ||
    //       (this.filteredParams.counter == 'final' &&
    //         this.leads_detail.length <
    //           Number(this.inactive_junkCount.finalInactive))))
    // ) {
    //   this.getInactiveLeadsDetail(true, 0).then(() => {
    //     event.target.complete();
    //   });
    // } else {
    //   event.target.disabled = true;
    // }

    this.getInactiveLeadsDetail(true, 0).then((hasData) => {
      event.target.complete();
      if (!hasData) {
        event.target.disabled = true;
      }
    });
  }

  onSelectLeadCount(count) {
    if (count != 'manual' && parseInt(count) > this.leads_detail.length) {
      this.selectedLeadCount = parseInt(count);
      this.showSpinner = true;
      this.isManual = false;
      this.getInactiveLeadsDetail(false, parseInt(count)).then(() => {
        this.checkedLeadsDetail = this.leads_detail.slice(0, parseInt(count));
        this.temporaryLeadIds = this.checkedLeadsDetail.map(
          (lead) => lead.LeadID
        );
        this.checkedLeadsDetail.forEach((element) => {
          this.fromExecids.push(element.ExecId);
        });
      });
    } else {
      if (count == 'manual') {
        this.isManual = true;
        this.selectedCount = null;
        this.selectedLeadCount = 0;
        this.checkedLeadsDetail = [];
        this.temporaryLeadIds = [];
        this.fromExecids = [];
      } else {
        this.selectedLeadCount = parseInt(count);
        this.isManual = false;
        if (this.temporaryLeadIds.length == parseInt(count)) {
          this.checkedLeadsDetail = [];
          this.temporaryLeadIds = [];
        } else {
          this.checkedLeadsDetail = this.leads_detail.slice(0, parseInt(count));
          this.temporaryLeadIds = this.checkedLeadsDetail.map(
            (lead) => lead.LeadID
          );
          this.checkedLeadsDetail.forEach((element) => {
            this.fromExecids.push(element.ExecId);
          });
        }
      }
    }
  }

  @ViewChild('assignLeadsModal') assignLeadsModal;
  openAssignLeadsModal() {
    if (this.temporaryLeadIds.length) {
      this.assignLeadsModal.present();
    } else {
      Swal.fire({
        title: 'Please select a lead to proceed',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'OK',
      });
    }
  }

  // toggle the randam button
  toggle_random_assign(event) {
    event.detail.checked ? (this.randomId = '1') : (this.randomId = '');
  }
  assignLead() {
    if (!this.selectedProperty) {
      Swal.fire({
        title: 'Please select an property before proceeding.',
        icon: 'warning',
        heightAuto: false,
        confirmButtonText: 'OK',
      });
    } else if (
      this.selectedExecutiveName?.length === 0 ||
      this.selectedExecutiveName === undefined
    ) {
      Swal.fire({
        title: 'Please select an executive before proceeding.',
        icon: 'warning',
        heightAuto: false,
        confirmButtonText: 'OK',
      });
    } else {
      const selectedExecutiveIds = [];
      this.selectedExecutiveName.forEach((executive) => {
        selectedExecutiveIds.push(executive.id);
      });

      const param = {
        rmID: selectedExecutiveIds,
        LeadID: this.temporaryLeadIds,
        propID: this.selectedProperty.property_idfk,
        stage:
          this.filteredParams.status == 'inactive'
            ? '1'
            : this.filteredParams.status == 'junkleads'
            ? '2'
            : this.filteredParams.status == 'junkvisits'
            ? '3'
            : '',
        random: this.randomId,
        fromExecids: this.fromExecids,
        loginId: localStorage.getItem('UserId'),
      };

      if (localStorage.getItem('Name') == 'demo') {
        Swal.fire({
          title: 'Lead assignment is not allowed for demo account.',
          icon: 'error',
          allowOutsideClick: false,
          heightAuto: false,
          confirmButtonText: 'OK',
        }).then((result) => {
          this.showSpinner = false;
        });
      } else {
        this.showSpinner = true;
        this.mandateService
          .inactiveJunkLeadreassign(param)
          .subscribe((response) => {
            this.reassignedResponseInfo = response['assignedleads'];
            if (response['status'] == 'True') {
              Swal.fire({
                title: 'Assigned Successfully',
                icon: 'success',
                heightAuto: false,
                allowOutsideClick: false,
                confirmButtonText: 'Show Details',
              }).then((result) => {
                this.showSpinner = true;
                if (result.isConfirmed) {
                  this.assignLeadsModal.dismiss();
                  this.viewAssignLeadDetail.present();
                } else if (result.dismiss === Swal.DismissReason.backdrop) {
                  this.assignLeadsModal.dismiss();
                  this.viewAssignLeadDetail.present();
                }
              });
            }
          });
      }
    }
  }

  onPropertySelect(event) {
    this.showSpinner = true;
    this.selectedExecutiveName = [];

    let selectedExecTeam;
    if (this.selectedExecTeam != undefined || this.selectedExecTeam != '') {
      selectedExecTeam = this.selectedExecTeam;
    }
    this.mandateService
      .fetchmandateexecutives(
        this.selectedProperty.property_idfk,
        this.filteredParams.team,
        selectedExecTeam?.code
      )
      .subscribe((response) => {
        this.executives = response['mandateexecutives'];
        this.showSpinner = false;
      });
  }

  onExecTeamSelect(event) {
    this.showSpinner = true;
    this.selectedExecutiveName = [];
    this.mandateService
      .fetchmandateexecutives(
        this.selectedProperty?.property_idfk,
        '',
        event.value.code
      )
      .subscribe((response) => {
        this.executives = response['mandateexecutives'];
        this.showSpinner = false;
      });
  }

  onAssignTeamSelect(event) {
    this.isRetail = event.value.code === 'Retail';
    this.executives = [];
    this.selectedExecutiveName = [];
  }
  page = 1;
  navigateToDetailsPage(leadId, execid, lead) {
    this.sharedService.enquiries = this.leads_detail;
    this.sharedService.page = this.page;
    this.sharedService.hasState = true;
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
        htype: this.filteredParams.htype,
        teamlead:
          localStorage.getItem('RoleType') == '1'
            ? localStorage.getItem('UserId')
            : null,
        propid: propid,
      },
    });
  }

  fetchMandateProperty() {
    this.mandateService.getmandateprojects().subscribe((mandates) => {
      if (mandates['status'] == 'True') {
        this.propertyList = mandates['Properties'];
        this.propertyList1 = this.propertyList;
      } else {
      }
    });
  }

  getExecutives(propid, team, active) {
    this.mandateService
      .fetchmandateexecutives1(propid, team, active)
      .subscribe((executives) => {
        if (executives['status'] == 'True') {
          this.mandateExecutives = executives['mandateexecutives'];

          this.mandateExecutives = [
            ...(executives['mandateexecutives'] || []).filter(
              (x) => x.name !== 'Test RM' && x.name !== 'Test CS'
            ),
          ];
          this.mandateExecutives1 = this.mandateExecutives;

          // this.showSpinner = false;
        } else {
          // this.showSpinner = false;
        }
      });
  }

  onWillDismiss(event) {
    location.reload();
  }

  onViewAssignLeadDetailClose() {
    this.viewAssignLeadDetail.dismiss();
    window.location.reload();
  }

  reset_filter() {
    this.isLeftFilterActive = 'property';
    this.tempFilteredValues = {
      status: this.filteredParams.status,
      team: '',
      executid:
        localStorage.getItem('Role') === '1'
          ? ''
          : localStorage.getItem('UserId'),
      loginid: localStorage.getItem('UserId'),
      source: '',
      counter: this.filteredParams.counter,
      enquiredprop: '',
      visitedprop: '',
      suggestedprop: '',
      visitedPropertyName: '',
      suggetsedPropertyName: '',
      propid: '',
      htype: this.filteredParams.htype,
      active: '1',
      limit: 0,
      limitrows: 5,
    };
    // this.initializeStartEndDate();
  }

  navigateToFilter() {
    this.tempFilteredValues = { ...this.filteredParams };
    if ('ranavPropId' in localStorage) {
      this.isLeftFilterActive = 'source';
    } else {
      this.isLeftFilterActive = 'property';
    }
    this.filterModal.present();
  }

  sourceSearchTerm;
  sourceList;
  sourceList1;
  setFilteredSource() {
    this.sourceList1 = this.sourceList.filter((item) => {
      return item.source
        .toLowerCase()
        .includes(this.sourceSearchTerm.toLowerCase());
    });
  }
  getsourcelist() {
    this.sharedService.sourcelist().subscribe((response) => {
      this.sourceList = response['Sources'];
      this.sourceList1 = this.sourceList;
    });
  }

  @ViewChild('sourceScrollContent', { static: false })
  sourceScrollContent!: IonContent;
  async scrollToSelectedSource(): Promise<void> {
    const source = this.filteredParams.source;
    if (!source) {
      return;
    }
    const elementId = `${source}`;
    setTimeout(() => {
      const selectedElement = document.getElementById(elementId);
      if (selectedElement) {
        this.sourceScrollContent.scrollToPoint(
          0,
          selectedElement.offsetTop,
          500
        );
      } else {
        console.log('Element not found2:', elementId);
      }
    }, 1000);
  }

  propertySearchTerm;
  propertyList1;
  propertyList;
  setFilteredProperty() {
    this.propertyList1 = this.propertyList.filter((item) => {
      return item.property_info_name
        .toLowerCase()
        .includes(this.propertySearchTerm.toLowerCase());
    });
  }

  executiveSearchTerm;
  mandateExecutives1;
  setFilteredExecutive() {
    this.mandateExecutives1 = this.mandateExecutives.filter((item) => {
      return item.name
        .toLowerCase()
        .includes(this.executiveSearchTerm.toLowerCase());
    });
  }

  @ViewChild('executiveScrollContent', { static: false })
  executiveScrollContent!: IonContent;
  async scrollToExecutive(): Promise<void> {
    const executid = this.filteredParams.executid;
    if (!executid) {
      return;
    }
    const elementId = `${executid}`;
    setTimeout(() => {
      const selectedElement = document.getElementById(elementId);
      if (selectedElement) {
        this.executiveScrollContent.scrollToPoint(
          0,
          selectedElement.offsetTop,
          500
        );
      } else {
        console.log('Element not found2:', elementId);
      }
    }, 1000);
  }

  onFilterSelection(value, data) {
    switch (value) {
      case 'property':
        this.tempFilteredValues.propid = data == 'all' ? '' : data;
        this.getExecutives(
          this.tempFilteredValues.propid,
          this.tempFilteredValues.team,
          '1'
        );
        break;
      case 'source':
        this.tempFilteredValues.source = data == 'all' ? '' : data;
        break;
      case 'executive':
        if (!Array.isArray(this.tempFilteredValues.executid)) {
          this.tempFilteredValues.executid = [];
        }

        if (value === 'all') {
          this.tempFilteredValues.executid = [];
        } else {
          const index = this.tempFilteredValues.executid.indexOf(data);
          if (index > -1) {
            // already selected → remove it
            this.tempFilteredValues.executid.splice(index, 1);
          } else {
            // not selected → add it
            this.tempFilteredValues.executid.push(data);
          }
        }
        this.tempFilteredValues.executid.join(',');
        break;
      default:
        break;
    }
  }
  confirmSelection() {
    this.filteredParams = { ...this.tempFilteredValues };
    this.filterModal.dismiss();
    this.addQueryParams();
  }

  onFilterValues(value) {
    this.isLeftFilterActive = value;
    if (value === 'source') {
      this.scrollToSelectedSource();
    } else if (value == 'executive') {
      this.scrollToExecutive();
    }
  }

  propertyPriceList;
  getPriceList() {
    this.mandateService.getPriceList().subscribe((resp) => {
      if (resp['status'] == 'True') {
        this.propertyPriceList = resp['result'];
        this.propertyPriceList.forEach((element) => {
          if (element.PropId === '16793') {
            this.grSitaraPropertyInfo = element.PropInfo;
          } else if (element.PropId === '1830') {
            this.grSamskruthiProperyInfo = element.PropInfo;
          }
        });
      } else {
        this.propertyPriceList = [];
      }
    });
  }

  grSitaraPropertyInfo;
  grSamskruthiProperyInfo;
  @ViewChild('propInfo') propInfo!: ElementRef;
  sendWhatsApp(lead, type) {
    let url;
    const phoneNumber = lead.number;
    // const phoneNumber = '917090080306';
    if (lead.suggestedprop?.[0]?.propid === '16793') {
      if (type == 'location') {
        url = 'https://maps.app.goo.gl/FzU4bXzB8SgXRgPT8';
      } else if (type == 'brochure') {
        url =
          'https://lead247.in/images/brochure/GR%20Sitara%20Actual%20photos%20.pdf';
      } else if ((type = 'info')) {
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
      } else if ((type = 'info')) {
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

  navigateToWhatsApp(number) {
    this.router.navigate(['./clients-chats'], {
      queryParams: {
        chatListSearch: number,
        selectedChat: 'all',
        htype: this.filteredParams.htype,
      },
    });
  }

  onassignleadModaldismiss() {
    this.selectedExecutiveName = null;
    this.selectedExecTeam = null;
    this.assignLeadsModal.dismiss();
    this.showSpinner = false;
    this.selectedTeam = null;
    this.selectedProperty = null;
  }

  removeExecutive(execId: string | number) {
    if (Array.isArray(this.filteredParams.executid)) {
      // Remove that particular executive id
      this.filteredParams.executid = this.filteredParams.executid.filter(
        (id) => id != execId
      );
    } else if (this.filteredParams.executid == execId) {
      // If only one id was selected
      this.filteredParams.executid = [];
    }

    // Update query params
    this.addQueryParams();
  }

  canScroll;
  @ViewChild('mainscrollContainer', { static: false }) content: IonContent;
  onScroll(event: CustomEvent) {
    this.sharedService.scrollTop = event.detail.scrollTop;
    const scrollTop = event.detail.scrollTop;
    this.content.getScrollElement().then((scrollEl) => {
      const scrollTop = scrollEl.scrollTop;
      const scrollHeight = scrollEl.scrollHeight;
      const clientHeight = scrollEl.offsetHeight;

      this.canScroll = scrollHeight > clientHeight + 10;
      if (!this.canScroll) {
        this.sharedService.isBottom = false;
      } else {
        this.sharedService.isBottom =
          scrollTop + clientHeight >= scrollHeight - 100;
      }
    });
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

  async ngOnDestroy() {
    this.sharedService.dismissAllOverlays();
  }
}
