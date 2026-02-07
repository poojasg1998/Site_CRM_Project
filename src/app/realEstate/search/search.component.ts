import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MandateService } from '../mandate-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { SharedService } from '../shared.service';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  Subject,
  switchMap,
} from 'rxjs';
import { IonContent, MenuController } from '@ionic/angular';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  localStorage = localStorage;
  isAdmin = false;
  loginuser;
  showSpinner = false;
  filteredLeads: any[] = [];
  filteredData;
  crmtype = '';
  htype;
  isCP = false;
  lead: any;
  isOnCallDetailsPage: boolean;
  isRM = false;

  constructor(
    private sharedService: SharedService,
    private _location: Location,
    private menuCtrl: MenuController,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private activeRoute: ActivatedRoute,
    private mandateService: MandateService
  ) {}

  ngOnInit() {
    this.getPriceList();
    if (
      localStorage.getItem('Role') == '50001' ||
      localStorage.getItem('Role') == '50002'
    ) {
      this.crmtype = '1';
    } else if (
      localStorage.getItem('Role') == '50009' ||
      localStorage.getItem('Role') == '50010' ||
      localStorage.getItem('Role') == '50003' ||
      localStorage.getItem('Role') == '50004'
    ) {
      this.crmtype = '2';
    }

    if (localStorage.getItem('UserId') == '1') {
      this.loginuser = '';
    } else {
      this.loginuser = localStorage.getItem('UserId');
    }

    // this.handleInput();
    this.activeRoute.queryParams.subscribe((params) => {
      this.isRM =
        this.localStorage.getItem('Role') == '50001' ||
        this.localStorage.getItem('Role') == '50002' ||
        this.localStorage.getItem('Role') == '50009' ||
        this.localStorage.getItem('Role') == '50010';
      this.isCP = this.localStorage.getItem('cpId') === '1';
      if (params['htype']) {
        this.htype = params['htype'];
      }

      if (params['isOnCallDetailsPage'] == 'true') {
        this.isOnCallDetailsPage = true;
      } else {
        this.isOnCallDetailsPage = false;
      }
    });

    this.searchSubject.pipe(debounceTime(300)).subscribe((searchTerm) => {
      this.fetchData(searchTerm);
    });
  }

  searchSubject = new Subject<string>();
  filteredexecName;
  private searchTerms = new Subject<string>();
  public clients: any;
  searchClient(event): void {
    this.showSpinner = true;
    const query = event.target.value.trim();

    // check if query contains only digits
    const isNumber = /^\d+$/.test(query);

    if ((isNumber && query.length >= 5) || (!isNumber && query.length > 2)) {
      this.searchSubject.next(query);
    } else {
      this.filteredLeads = [];
      this.showSpinner = false;
    }
  }
  fetchData(query: string) {
    // Call your API here
    // this.sharedService.searchLeads(query, this.crmtype, this.loginuser).subscribe((response )=>{
    //   if(response['status'] =='True'){
    //     this.filteredLeads=response['Searchlist'];
    //     this.showSpinner = false;
    //   }else{
    //     this.filteredLeads=[];
    //     this.showSpinner = false;
    //   }
    // })
    let searchedData;
    if (/^[\d\s+]+$/.test(query)) {
      searchedData = query.replace(/\s+/g, '');
      searchedData = searchedData.slice(-10);
    } else {
      searchedData = query;
    }
    this.sharedService
      .searchLeads(
        searchedData,
        this.crmtype,
        this.localStorage.getItem('UserId'),
        ''
      )
      .subscribe({
        next: (response) => {
          if (response['status'] == 'True') {
            this.filteredLeads = response['Searchlist'];
            const groupedMap = new Map();

            response['Searchlist'].forEach((lead: any) => {
              const number = lead.customer_number ?? '';
              const name = lead.customer_name ?? '';
              const execname = lead.execname ?? '';
              const leadStage = lead.Lead_stage ?? '';
              const idpk = lead.customer_IDPK ?? '';
              const crmType = lead.crm_type ?? '';
              const propid = lead.propid ?? '';

              const key = number + '_' + leadStage + '_' + crmType;

              if (!groupedMap.has(key)) {
                groupedMap.set(key, {
                  customer_number: number,
                  customer_name: name,
                  Lead_stage: leadStage,
                  customer_IDPK: idpk,
                  crm_type: crmType,
                  propid: propid,

                  execnames: new Set(execname ? [execname] : []),
                  originalLeads: [lead],
                });
              } else {
                const existing = groupedMap.get(key);
                if (execname) {
                  existing.execnames.add(execname);
                }
                existing.originalLeads.push(lead);
              }
            });

            this.filteredLeads = Array.from(groupedMap.values()).map(
              (item) => ({
                ...item,
                execnames: Array.from(item.execnames),
              })
            );

            this.showSpinner = false;
          } else {
            this.filteredLeads = [];
            this.showSpinner = false;
          }
        },
        error: (error) => {
          this.filteredLeads = [];
          this.showSpinner = false;
        },
      });
  }

  // handleInput() {
  //   this.clients = this.searchTerms?.pipe(
  //     debounceTime(300),
  //     distinctUntilChanged(),
  //     switchMap(param =>
  //       param ? this.sharedService.searchLeads(param,this.crmtype,this.loginuser) : of<any[]>([])
  //     ),
  //     catchError(error => {
  //       return of<any[]>([]);
  //     }),
  //     map((results:any) => {

  //       if (results) {
  //         const map = new Map<number, any>();
  //         // Store the values based on number and propid which is not null into a map
  //         results['Searchlist']?.forEach(item => {
  //           if (item.crm_type !== null) {
  //             map.set(item.customer_number, item);
  //           }
  //         });
  //         // Filter the results
  //         return results['Searchlist']?.filter(item =>
  //           item.crm_type !== null || !map.has(item.customer_number)
  //         );
  //       }
  //       return [];
  //     })
  //   );

  //   this.clients.subscribe(filteredResults => {
  //     this.filteredLeads = filteredResults || [];
  //     this.cdr.detectChanges();
  //   });

  //   // this.clients.subscribe({
  //   //   next: (filteredResults) => {
  //   //     console.log('Filtered results from observable:', filteredResults);
  //   //   },
  //   //   error: (err) => console.error('Observable error:', err),
  //   // });
  //   // this.clients = of([
  //   //   { customer_name: 'John Doe' },
  //   //   { customer_name: 'Jane Smith' },
  //   // ]);
  //   this.cdr.detectChanges();
  // }

  // private filteredLeadsSubject = new BehaviorSubject<any[]>([]);
  // filteredLeads$
  // handleInput(){
  //   this.clients = this.searchTerms.pipe(
  //     debounceTime(300),
  //     distinctUntilChanged(),
  //     switchMap(param =>
  //       param
  //         ? this.sharedService.searchLeads(param, this.crmtype, this.loginuser)
  //         : of<any[]>([])
  //     ),
  //     catchError(error => {
  //       return of<any[]>([]);
  //     }),
  //     map((results: any) => {
  //       if (results) {
  //         const map = new Map<number, any>();
  //         results['Searchlist']?.forEach(item => {
  //           if (item.crm_type !== null) {
  //             map.set(item.customer_number, item);
  //           }
  //         });
  //         return results['Searchlist']?.filter(item =>
  //           item.crm_type !== null || !map.has(item.customer_number)
  //         );
  //       }
  //       return [];
  //     })
  //   );

  //   this.filteredLeads$ = this.filteredLeadsSubject.asObservable();
  //   this.clients.subscribe(filteredResults => {
  //     this.filteredLeadsSubject.next(filteredResults || []);
  //     this.showSpinner = false;
  //   });
  // }

  // go to details page of leads
  navigateToMandateCustomerPage(crmtype, leadsId, execid) {
    let existingData =
      JSON.parse(localStorage.getItem('FilteredleadsId')) || [];
    if (!existingData.includes(leadsId)) {
      existingData = existingData.concat(leadsId);
    }
    localStorage.setItem('FilteredleadsId', JSON.stringify(existingData));

    this.router.navigate(['/mandate-customers'], {
      queryParams: {
        allVisits: null,
        leadId: leadsId,
        htype: 'mandate',
        execid: execid['originalLeads'][0].execid,
        propid: execid['originalLeads'][0].propid,
      },
      queryParamsHandling: 'merge',
    });
  }

  onBackButton() {
    this._location.back();
  }

  onSwipe(event, lead: any) {
    if (event.detail.side == 'start') {
      window.open(`https://wa.me/+91 ${lead.number}`, '_system');
      // window.open(`https://wa.me/+91 ${lead.customer_number}`, '_system');
    } else {
      // window.open(`tel:${lead.customer_number}`, '_system');
      // if (lead && lead.customer_number) {
      //   // Trigger the call
      //   window.open(`tel:${lead.customer_number}`, '_system');
      // } else {
      //   console.error('Phone number not available for the selected lead.');
      // }

      this.outboundCall(lead);
    }
  }

  openEndMenu() {
    this.sharedService.isMenuOpen = true;
    this.menuCtrl.open('end');
  }

  propertyPriceList;
  grSitaraPropertyInfo;
  grSamskruthiProperyInfo;
  @ViewChild('propInfo') propInfo!: ElementRef;
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

  sharePropDetailsViaWhatsApp(lead, type) {
    let url;
    const phoneNumber = lead.customer_number;
    // const phoneNumber = '917090080306';
    if (lead.propid === '16793') {
      if (type == 'location') {
        url = 'https://maps.app.goo.gl/FzU4bXzB8SgXRgPT8';
      } else if (type == 'brochure') {
        url =
          'https://lead247.in/images/brochure/GR%20Sitara%20Actual%20photos%20.pdf';
      } else if ((type = 'info')) {
        const textContent = this.propInfo.nativeElement.innerText;
        url = textContent
          .split('\n')
          .map((line) => line.trim())
          .filter(
            (line, index, arr) =>
              line !== '' || (arr[index - 1] && arr[index - 1] !== '')
          )
          .join('\n');
      }
    } else if (lead.propid === '1830') {
      if (type == 'location') {
        url = 'https://maps.app.goo.gl/3dvi23Sd6PPqvM91A';
      } else if (type == 'brochure') {
        url =
          'https://lead247.in/images/brochure/GR%20Samskruthi%20Brochure%20New..pdf';
      } else if ((type = 'info')) {
        const textContent = this.propInfo.nativeElement.innerText;
        url = textContent
          .split('\n')
          .map((line) => line.trim())
          .filter(
            (line, index, arr) =>
              line !== '' || (arr[index - 1] && arr[index - 1] !== '')
          )
          .join('\n');
      }
    }

    const message = encodeURIComponent(`${url}`);
    const whatsappUrl = `https://wa.me/+91${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }
  @ViewChild('sliding') sliding;
  @ViewChild('callConfirmationModal') callConfirmationModal;
  @ViewChild('onCallDetailsPage') onCallDetailsPage;
  outboundCall(lead) {
    this.sliding.close();
    if (lead == true) {
      this.isOnCallDetailsPage = true;
      this.callConfirmationModal.dismiss();

      const cleanedNumber =
        this.lead?.customer_number.startsWith('91') &&
        this.lead?.customer_number.length > 10
          ? this.lead?.customer_number.slice(2)
          : this.lead?.customer_number;

      const param = {
        execid: this.localStorage.getItem('UserId'),
        callto: cleanedNumber,
        leadid: this.lead.customer_IDPK,
        starttime: this.getCurrentDateTime(),
        modeofcall: 'mobile-' + this.htype,
        leadtype: this.htype,
        assignee: this.lead.originalLeads[0].execid,
      };

      this.callConfirmationModal.dismiss();

      this.sharedService.outboundCall(param).subscribe(() => {
        //  this.callConfirmationModal.dismiss();
      });

      this.router.navigate([], {
        queryParams: {
          isOnCallDetailsPage: this.isOnCallDetailsPage,
          leadId: this.lead.customer_IDPK,
          execid: this.lead.originalLeads[0].execid,
          leadTabData: 'status',
          callStatus: 'Call Connected',
          direction: 'outboundCall',
          headerType: this.htype,
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

  toggleSearchFocus() {
    this.sharedService.isBottom = !this.sharedService.isBottom;
  }

  @ViewChild('mainscrollContainer', { static: false }) content: IonContent;
  canScroll;
  onScroll(event: CustomEvent) {
    const scrollTop = event.detail.scrollTop;
    this.content.getScrollElement().then((scrollEl) => {
      const scrollTop = scrollEl.scrollTop;
      const scrollHeight = scrollEl.scrollHeight;
      const clientHeight = scrollEl.offsetHeight;

      this.canScroll = scrollHeight > clientHeight + 10; // ADD A BUFFER of 10px

      if (!this.canScroll) {
        this.sharedService.isBottom = false;
      } else {
        this.sharedService.isBottom =
          scrollTop + clientHeight >= scrollHeight - 100;
      }
    });
  }
}
