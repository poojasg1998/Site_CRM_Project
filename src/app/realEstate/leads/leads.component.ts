import {
  Component,
  NgZone,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { SharedService } from '../shared.service';
import { formatDate, Location } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import Swal from 'sweetalert2';
import {
  IonCheckbox,
  IonContent,
  MenuController,
  Platform,
} from '@ionic/angular';
import { RetailServiceService } from '../retail-service.service';
import { MandateService } from '../mandate-service.service';

@Component({
  selector: 'app-leads',
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.scss'],
})
export class LeadsComponent {
  @ViewChild('filterModal') filterModal;
  @ViewChild('mainScrollContent', { static: false }) content: IonContent;
  currentdateforcompare = new Date();
  previousMonthDateForCompare: any;
  todaysdateforcompare: any;
  enquiries;
  showSpinner;
  showInfiniteScroll = true;
  isManual = false;
  isChecked = false;
  selectedCount;

  localStorage = localStorage;

  leadcounts;
  uniqueCounts;
  duplicateCounts;

  filteredParams = {
    source: '',
    FromDate: '',
    propname: '',
    ToDate: '',
    duplicateValue: '',
    cityid: '',
    assignid: '',
    limitparam: 0,
    limitrows: 50,
  };

  sourceList;
  sourceList1;
  sourceSearchTerm;

  propertyList;
  propertyList1;
  propertySearchedName;
  isCP;

  isSourceSection = false;
  isPropertySection = true;
  isdateSection = false;
  isStatusSection = false;

  constructor(
    private ngZone: NgZone,
    private menuCtrl: MenuController,
    private mandateService: MandateService,
    private retailService: RetailServiceService,
    private router: Router,
    private _sharedService: SharedService,
    private platform: Platform,
    private _location: Location,
    private activeRoute: ActivatedRoute
  ) {
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.viewAssignLeadDetail.dismiss();
      this.assignLeadsModal.dismiss();
      Swal.close();
      this._location.back();
      // this.ionViewWillEnter();
    });
  }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe(() => {
      Swal.close();
      this.isCP = this.localStorage.getItem('cpId') === '1';
      this.isRetail = this.isCP === true;

      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.viewAssignLeadDetail.dismiss();
          this.assignLeadsModal.dismiss();
          Swal.close();
        }
      });
      this.content?.scrollToTop(0);
      this.getRetailExecutive();
      this.getMandatePropertyList();
      this.getPreviousPresentmonthDate();
      this.getQueryParam();
      this.getsourcelist();
      this.getPropertyList();
      this.getleadsCount();
    });
  }

  getMandatePropertyList() {
    this.mandateService.getmandateprojects().subscribe(
      (proplist) => {
        this.projectNames = proplist['Properties'];
      },
      (error) => {
        console.error('Error fetching property list', error);
      }
    );
  }

  getPreviousPresentmonthDate() {
    // Todays Date
    var curmonth = this.currentdateforcompare.getMonth() + 1;
    var curmonthwithzero = curmonth.toString().padStart(2, '0');
    var curday = this.currentdateforcompare.getDate();
    var curdaywithzero = curday.toString().padStart(2, '0');
    this.todaysdateforcompare =
      this.currentdateforcompare.getFullYear() +
      '-' +
      curmonthwithzero +
      '-' +
      curdaywithzero;

    //to get the previous month date of the present day date
    var previousMonthDate = new Date(this.currentdateforcompare);
    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
    var prevMonth = (previousMonthDate.getMonth() + 1)
      .toString()
      .padStart(2, '0');
    var prevDay = previousMonthDate.getDate().toString().padStart(2, '0');
    this.previousMonthDateForCompare =
      previousMonthDate.getFullYear() + '-' + prevMonth + '-' + prevDay;
  }

  getleadsCount() {
    this.showSpinner = true;
    this.filteredParams.FromDate =
      this.filteredParams.FromDate != ''
        ? this.filteredParams.FromDate
        : this.previousMonthDateForCompare;
    this.filteredParams.ToDate =
      this.filteredParams.ToDate != ''
        ? this.filteredParams.ToDate
        : this.todaysdateforcompare;
    this.filteredParams.cityid =
      this.filteredParams.source == 'Homes247' ||
      this.filteredParams.source == 'Homes247-Campaign'
        ? '1'
        : '';

    this._sharedService
      .getleadcounts(this.filteredParams)
      .subscribe((enquiryscount) => {
        this.leadcounts = enquiryscount['Leads'][0].leadcounts;
        this.uniqueCounts = enquiryscount['Leads'][0].uniqueecounts;
        this.duplicateCounts = enquiryscount['Leads'][0].duplicatecounts;
      });
    this.getLeads(false, 0);
  }

  count = 0;
  getLeads(isLoadmore, selectedCount) {
    this.filteredParams.cityid =
      this.filteredParams.source == 'Homes247' ||
      this.filteredParams.source == 'Homes247-Campaign'
        ? '1'
        : '';

    if (selectedCount != 0 && !isLoadmore) {
      this.filteredParams.limitparam = 0;
      this.filteredParams.limitrows = selectedCount;
    } else {
      this.count = isLoadmore ? this.count + 50 : 0;
      this.filteredParams.limitparam = this.count;
    }

    this.filteredParams.FromDate =
      this.filteredParams.FromDate != ''
        ? this.filteredParams.FromDate
        : this.previousMonthDateForCompare;
    this.filteredParams.ToDate =
      this.filteredParams.ToDate != ''
        ? this.filteredParams.ToDate
        : this.todaysdateforcompare;

    return new Promise((resolve, reject) => {
      this._sharedService.getleads(this.filteredParams).subscribe(
        (response) => {
          this.ngZone.run(() => {
            if (response['status'] === 'True') {
              this.showSpinner = false;
              this.enquiries = isLoadmore
                ? this.enquiries.concat(response['Leads'])
                : response['Leads'];
              resolve(true);
            } else {
              this.enquiries = [];
              this.showSpinner = false;
              resolve(false);
            }
          });
        },
        (error) => {
          this.showSpinner = false;
          resolve(false);
        }
      );
    });
    // this._sharedService.getleads(this.filteredParams).subscribe(enquirys => {
    //   this.enquiries = isLoadmore ? this.enquiries.concat(enquirys['Leads']) : enquirys['Leads'];
    //   this.showSpinner = false;
    // })
  }

  getPropertyList() {
    this.filteredParams.FromDate =
      this.filteredParams.FromDate != ''
        ? this.filteredParams.FromDate
        : this.previousMonthDateForCompare;
    this.filteredParams.ToDate =
      this.filteredParams.ToDate != ''
        ? this.filteredParams.ToDate
        : this.todaysdateforcompare;
    const filteredParams = { ...this.filteredParams, source: '' };
    this._sharedService
      .propertylistForCompleteLeads(filteredParams)
      .subscribe((prop) => {
        this.propertyList = prop['Leads'];
        this.propertyList1 = prop['Leads'];
      });
  }

  // to add querry params
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

    // If params have changed or if you want to always trigger an API call
    if (paramsChanged) {
      this.router
        .navigate([], { queryParams, queryParamsHandling: 'merge' })
        .then(() => {
          this.getleadsCount();
          // window.location.reload();
        });
    } else {
      // Trigger API call even if no params changed
      this.getleadsCount();
    }
  }

  getQueryParam() {
    this.activeRoute.queryParamMap.subscribe(() => {
      const queryString = window.location.search;
      const queryParams = new URLSearchParams(queryString);
      Object.keys(this.filteredParams).forEach((key) => {
        if (queryParams.has(key)) {
          this.filteredParams[key] = queryParams.get(key);
        } else if (key == 'propname' && 'ranavPropId' in localStorage) {
          this.filteredParams[key] = 'Ranav Tranquil Haven';
        } else if (
          key !== 'loginid' &&
          key !== 'limit' &&
          key !== 'limitrows'
        ) {
          this.filteredParams[key] = '';
        }
      });
    });
  }

  reset_filter() {
    this.tempFilteredValues = {
      source: '',
      FromDate: this.previousMonthDateForCompare,
      propname: '',
      ToDate: this.todaysdateforcompare,
      duplicateValue: '',
      cityid: '',
      assignid: '',
      limitparam: 0,
      limitrows: 100,
    };
    // this.tempFilteredValues = { ...this.filteredParams };
    this.addQueryParams();
  }

  onBackButton() {
    this.resetInfiniteScroll();
    this._location.back();
    this.ngOnInit();
  }

  onUniqueDuplcate(value) {
    this.resetInfiniteScroll();
    this.filteredParams.duplicateValue = value;
    this.selectedLeadCount = 0;
    this.assignedLeadIds = [];
    this.assignedLeadDetails = [];
    this.addQueryParams();
  }

  navigateToFilter() {
    if (this.isCP) {
      this.isdateSection = true;
      this.isPropertySection = false;
      this.isSourceSection = false;
      this.isStatusSection = false;
    } else if ('ranavPropId' in localStorage) {
      this.isdateSection = false;
      this.isPropertySection = false;
      this.isSourceSection = true;
      this.isStatusSection = false;
    } else {
      this.isdateSection = false;
      this.isPropertySection = true;
      this.isSourceSection = false;
      this.isStatusSection = false;
    }
    this.tempFilteredValues = { ...this.filteredParams };

    if (this.filteredParams.FromDate && this.filteredParams.ToDate) {
      const fromDate = new Date(this.filteredParams.FromDate);
      const toDate = new Date(this.filteredParams.ToDate);

      this.dateRange = [fromDate, toDate]; // Bind to p-calendar range
    }
    this.scrollToSelectedProperty();
    this.filterModal.present();
  }

  @ViewChild('propScrollContent', { static: false })
  propScrollContent!: IonContent;
  async scrollToSelectedProperty(): Promise<void> {
    const propertyname = this.filteredParams.propname;
    if (!propertyname) {
      return;
    }
    const elementId = `${propertyname}`;
    setTimeout(() => {
      const selectedElement = document.getElementById(elementId);
      if (selectedElement) {
        this.propScrollContent.scrollToPoint(0, selectedElement.offsetTop, 500);
      } else {
        console.log('Element not found:', elementId);
      }
    }, 1000);
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
        console.log('Element not found:', elementId);
      }
    }, 1000);
  }

  //fetch sourcelist
  getsourcelist() {
    this._sharedService.sourcelist().subscribe((sources) => {
      this.sourceList = sources['Sources'];
      this.sourceList1 = this.sourceList;
    });
  }

  setFilteredSource() {
    this.sourceList1 = this.sourceList.filter((item) => {
      return item.source
        .toLowerCase()
        .includes(this.sourceSearchTerm.toLowerCase());
    });
  }

  onFilterSelection(data, value) {
    switch (data) {
      case 'property':
        this.tempFilteredValues.propname = value;

        break;
      case 'source':
        this.tempFilteredValues.source = value;
        break;
      case 'status':
        this.tempFilteredValues.assignid = value;
        break;
      case 'date':
        if (this.dateRange?.length === 2 && this.dateRange[1] != null) {
          const start = formatDate(this.dateRange[0], 'yyyy-MM-dd', 'en-US');
          const end = formatDate(this.dateRange[1], 'yyyy-MM-dd', 'en-US');
          this.tempFilteredValues.FromDate = start;
          this.tempFilteredValues.ToDate =
            end != '1970-01-01' ? end : this.tempFilteredValues.ToDate;
        }
        this.isenabled =
          this.tempFilteredValues.ToDate != '' &&
          this.tempFilteredValues.ToDate != '1970-01-01'
            ? true
            : false;
        //  this.isenabled = this.tempFilteredValues.toDate != ''? false: true;

        break;
      default:
        break;
    }
  }

  onFilterValues(data) {
    this.isPropertySection = data == 'property';
    this.isSourceSection = data == 'source';
    this.isdateSection = data == 'date';
    this.isStatusSection = data == 'status';

    if (this.isPropertySection) {
      this.scrollToSelectedProperty();
    } else if (this.isSourceSection) {
      this.scrollToSelectedSource();
    }
  }

  setFilteredProperty() {
    this.propertyList1 = this.propertyList.filter((item) => {
      return item?.propertyname
        ?.toLowerCase()
        .includes(this.propertySearchedName?.toLowerCase());
    });
  }

  isenabled = true;

  onFilterDateremove() {
    Swal.fire({
      title: 'Please Select the date range between 3 Months!',
      icon: 'info',
      showConfirmButton: false,
      heightAuto: false,
      timer: 2000,
    }).then(() => {
      this.isdateSection = true;
      this.isPropertySection = false;
      this.isSourceSection = false;
      this.isStatusSection = false;
      this.filterModal.present();
    });
    // this.filteredParams.FromDate = '';
    // this.filteredParams.ToDate;
    // this.addQueryParams()
  }
  selectedLeadCount = 0;
  assignedLeadIds = [];
  assignedLeadDetails;
  //called when click on  5,10 11 leads count button
  // onSelectLeadCount(count){
  //   this.assignedLeadIds = [];
  //   this.assignedLeadDetails = [];
  //   if(this.selectedLeadCount == count ){
  //     this.selectedLeadCount = 0;
  //     this.assignedLeadIds = [];
  //     this.assignedLeadDetails = [];
  //   }else{
  //     this.selectedLeadCount = count === 'all' ? this.enquiries.length : count ;
  //     this.assignedLeadIds = this.enquiries.filter((item, index) => index < this.selectedLeadCount).map(item =>
  //       item.customer_IDPK
  //     );
  //   }
  //   this.getSelectedLeadDetails();
  // }

  // when we click on checkbox
  checkedLeads(event) {
    this.checkedLeadsDetail = [];
    // this.temporaryLeadIds = []
    this.checkboxes.forEach((checkbox, index) => {
      if (checkbox.checked) {
        this.checkedLeadsDetail.push(this.enquiries[index]);
      }
    });
    this.temporaryLeadIds = this.checkedLeadsDetail.map(
      (lead) => lead.customer_IDPK
    );
  }
  // to store the selected id's detail
  getSelectedLeadDetails() {
    const uniqueLeadDetails = new Set<string>(
      (this.assignedLeadDetails || []).map((detail) => detail.customer_IDPK)
    );
    const newAssignedLeadDetails = this.enquiries.filter((record) => {
      if (
        this.assignedLeadIds.includes(record.customer_IDPK) &&
        !uniqueLeadDetails.has(record.customer_IDPK)
      ) {
        uniqueLeadDetails.add(record.customer_IDPK);
        return true;
      }
      return false;
    });
    this.assignedLeadDetails = [
      ...(this.assignedLeadDetails || []),
      ...newAssignedLeadDetails,
    ];
    this.assignedLeadDetails.forEach((element) => {
      this.fromExecids.push(element.RMID);
    });
  }
  temporaryLeadIds = [];
  checkedLeadsDetail = [];
  @ViewChildren('freshleadsCheckboxes') checkboxes!: QueryList<IonCheckbox>;
  onSelectLeadCount(count) {
    if (count != 'manual' && parseInt(count) > this.enquiries.length) {
      this.selectedLeadCount = parseInt(count);
      this.showSpinner = true;
      this.isManual = false;
      this.getLeads(false, parseInt(count)).then(() => {
        this.checkedLeadsDetail = this.enquiries.slice(0, parseInt(count));
        this.temporaryLeadIds = this.checkedLeadsDetail.map(
          (lead) => lead.customer_IDPK
        );
        // this.checkedLeadsDetail.forEach(element => {
        //   this.fromExecids.push(element.RMID)
        // });
      });
    } else {
      if (count == 'manual') {
        this.isManual = true;
        this.selectedCount = null;
        this.selectedLeadCount = 0;
        this.checkedLeadsDetail = [];
        this.temporaryLeadIds = [];
      } else {
        this.selectedLeadCount = parseInt(count);
        this.selectedCount = null;
        setTimeout(() => {
          this.selectedCount = count;
        });
        this.isManual = false;
        if (this.temporaryLeadIds.length == parseInt(count)) {
          this.checkedLeadsDetail = [];
          this.temporaryLeadIds = [];
        } else {
          this.checkedLeadsDetail = this.enquiries.slice(0, parseInt(count));
          this.temporaryLeadIds = this.checkedLeadsDetail.map(
            (lead) => lead.customer_IDPK
          );
          // this.checkedLeadsDetail.forEach(element => {
          //   this.fromExecids.push(element.RMID)
          // });
        }
      }
    }
  }

  onAssignLead() {
    this.isChecked = true;
    this.checkedLeadsDetail = [];
    this.temporaryLeadIds = [];
    this.isManual = false;
    this.selectedCount = null;
    this.selectedLeadCount = 0;
  }

  @ViewChild('assignLeadsModal') assignLeadsModal;
  @ViewChild('viewAssignLeadDetail') viewAssignLeadDetail;
  selectedExecutiveName;
  executives;
  selectedExecTeam;
  selectedTeam;
  selectedProperty;
  isRetail = false;
  projectNames;
  reassignedResponseInfo;
  team = [
    { name: 'Retail Team', code: 'Retail' },
    { name: 'Mandate Team', code: 'Mandate' },
  ];
  execTeam = [
    { name: 'All', code: '' },
    { name: 'Relationship Executives', code: '50010' },
    { name: 'Customersupport Executives', code: '50004' },
  ];
  randomId = '';
  toggle_random_assign(event) {
    event.detail.checked ? (this.randomId = '1') : (this.randomId = '');
  }
  reset() {
    this.selectedExecutiveName = [];
    this.executives = [];
    this.selectedExecTeam = '';
    this.selectedTeam = null;
    this.selectedProperty = '';
  }

  onAssignTeamSelect(event) {
    this.isRetail = event.value.code === 'Retail';
    this.executives = [];
    this.selectedExecutiveName = [];
  }

  getRetailExecutive() {
    this.retailService
      .fetchRetail_executivesName('', '')
      .subscribe((response) => {
        this.executives = response['DashboardCounts'];
      });
  }
  onExecTeamSelect(event) {
    this.showSpinner = true;
    this.selectedExecutiveName = [];
    this.retailService
      .fetchRetail_executivesName(event.value.code, '')
      .subscribe((response) => {
        this.showSpinner = false;
        this.executives = response['DashboardCounts'];
      });
  }

  onPropertySelect(event) {
    this.showSpinner = true;
    this.selectedExecutiveName = [];
    if (event.value.property_idfk === '28773') {
      this.mandateService.setHoverState('ranav_group');
    } else {
      this.mandateService.setHoverState('');
    }
    this.mandateService
      .fetchmandateexecutives(event.value.property_idfk, '')
      .subscribe((response) => {
        this.executives = response['mandateexecutives'];
        this.showSpinner = false;
      });
  }
  fromExecids = [];

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

  assignLead() {
    if (!this.selectedTeam && !this.isCP) {
      Swal.fire({
        title: 'Please select an team before proceeding.',
        icon: 'warning',
        heightAuto: false,
        confirmButtonText: 'OK',
      });
    } else if (!this.isRetail && !this.selectedProperty) {
      Swal.fire({
        title: 'Please select an property before proceeding.',
        icon: 'warning',
        heightAuto: false,
        confirmButtonText: 'OK',
      });
    } else if (this.isRetail && !this.selectedExecTeam && !this.isCP) {
      Swal.fire({
        title: 'Please select an Executive Team before proceeding.',
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
        this.isRetail
          ? selectedExecutiveIds.push(executive.ExecId)
          : selectedExecutiveIds.push(executive.id);
      });

      const param = {
        rmID: selectedExecutiveIds,
        LeadID: this.temporaryLeadIds,
        propID: this.isRetail ? '' : this.selectedProperty.property_idfk,
        random: this.randomId,
        fromExecids: this.fromExecids,
        loginId: localStorage.getItem('UserId'),
      };

      if (localStorage.getItem('Name') === 'demo') {
        Swal.fire({
          title: 'Lead assignment is not allowed for demo account',
          icon: 'error',
          heightAuto: false,
          allowOutsideClick: false,
          confirmButtonText: 'OK',
        }).then(() => {
          location.reload();
        });
      } else {
        if (this.isRetail) {
          this.retailService.leadreassign(param).subscribe((response) => {
            if (response['status'] == 'True') {
              this.reassignedResponseInfo = response['assignedleads'];
              Swal.fire({
                title: 'Assigned Successfully',
                icon: 'success',
                heightAuto: false,
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
        } else {
          this.mandateService.leadreassign(param).subscribe((response) => {
            if (response['status'] == 'True') {
              this.reassignedResponseInfo = response['assignedleads'];
              Swal.fire({
                title: 'Assigned Successfully',
                icon: 'success',
                heightAuto: false,
                allowOutsideClick: true,
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
  }

  onViewAssignLeadDetailClose() {
    this.viewAssignLeadDetail.dismiss();
    window.location.reload();
  }
  onWillDismiss(event) {
    location.reload();
  }

  loadData(event) {
    if (
      (this.filteredParams.duplicateValue === '1' &&
        this.enquiries.length < this.duplicateCounts) ||
      (this.filteredParams.duplicateValue === '' &&
        this.enquiries.length < this.uniqueCounts)
    ) {
      this.getLeads(true, 0).then(() => {
        event.target.complete();
      });
    } else {
      event.target.disabled = true;
    }
  }

  resetInfiniteScroll() {
    this.showInfiniteScroll = false;
    setTimeout(() => {
      this.showInfiniteScroll = true;
    }, 10);
  }

  ngOnDestroy() {
    Swal.close();
  }
  openEndMenu() {
    this._sharedService.isMenuOpen = true;
    this.menuCtrl.open('end');
  }

  isAtBottom = false;
  onScroll(event: CustomEvent) {
    const scrollTop = event.detail.scrollTop;
    this.content.getScrollElement().then((scrollEl) => {
      const scrollHeight = scrollEl.scrollHeight;
      const clientHeight = scrollEl.offsetHeight;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      this.isAtBottom = isNearBottom;
    });
  }
  dateRange;
  daterange() {
    const from = this.tempFilteredValues.FromDate;
    const to =
      this.tempFilteredValues.ToDate != '1970-01-01'
        ? this.tempFilteredValues.ToDate
        : '';
    if (from && to) {
      return `${from} to ${to}`;
    } else if (from) {
      return 'Select end date';
    } else {
      return 'Select date range';
    }
  }

  tempFilteredValues;
  confirmSelection() {
    this.filteredParams = { ...this.tempFilteredValues };
    this.filterModal.dismiss();
    this.addQueryParams();
  }
}
