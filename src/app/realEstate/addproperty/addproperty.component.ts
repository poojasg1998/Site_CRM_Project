import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { IonContent, MenuController, Platform } from '@ionic/angular';
import { Location } from '@angular/common';
import { SharedService } from '../shared.service';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-addproperty',
  templateUrl: './addproperty.component.html',
  styleUrls: ['./addproperty.component.scss'],
})
export class AddpropertyComponent implements OnInit {
  @ViewChild('addPropertyModal') addPropertyModal;
  @ViewChild('addPropertyModal1') addPropertyModal1;
  @ViewChild('addCpModal') addCpModal;
  showInfiniteScroll = true;
  addedpropertylists = [];
  builderlist;
  mandateRequestLists = [];
  selectedBuilder;
  propertiesbybuilder;
  selectedProperty = [];
  cpLists = [];
  showSpinner = false;
  type = '';
  isAdmin;
  cpListsCount;
  count = 0;
  param = {
    limit: 1,
    limitrows: 30,
  };
  isTL;
  isCP;
  dropdownSettings = {};
  dropdownSettings1 = {};
  isOnCallDetailsPage = false;

  constructor(
    private platform: Platform,
    private route: Router,
    private activeRoute: ActivatedRoute,
    private menuCtrl: MenuController,
    private _location: Location,
    public sharedService: SharedService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.addPropertyModal.dismiss();
      this.addCpModal.dismiss();
      Swal.close();
      this._location.back();
      // this.ionViewWillEnter();
    });
  }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe((params) => {
      if (params['isOnCallDetailsPage'] == 'true') {
        this.isOnCallDetailsPage = true;
      } else {
        this.isOnCallDetailsPage = false;
      }

      this.isAdmin =
        localStorage.getItem('cpId') !== '1' &&
        localStorage.getItem('Role') === '1';
      this.isTL = localStorage.getItem('RoleType') === '1';
      this.isCP = localStorage.getItem('cpId') === '1';
      this.type = params['type'];
      if (params['type'] == 'property') {
        this.getPropetyList();
        this.getbuilderlist();
      } else if (params['type'] == 'cp') {
        this.getCpList(false);
      } else if (params['type'] == 'builders') {
        this.getMandateRequets();
      }
    });

    this.dropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableCheckAll: false,
      allowSearchFilter: true,
      scrollable: true,
      scrollableHeight: '250px',
      closeDropDownOnSelection: true,
      container: 'body',
    };

    this.dropdownSettings1 = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableCheckAll: false,
      allowSearchFilter: true,
      scrollable: true,
      itemsShowLimit: 3,
      scrollableHeight: '250px',
      container: 'body',
    };
  }

  onSelectSuggProp(event) {
    console.log(event);
    console.log(this.selectedBuilder);
  }

  deSelectSuggProp(event) {
    console.log(event);
  }

  openEndMenu() {
    this.sharedService.isMenuOpen = true;
    this.menuCtrl.open('end');
  }

  onBackbutton() {
    this.resetInfiniteScroll();
    this._location.back();
  }

  resetInfiniteScroll() {
    this.showInfiniteScroll = false;
    setTimeout(() => {
      this.showInfiniteScroll = true;
    }, 10);
  }

  getPropetyList() {
    this.showSpinner = true;
    this.sharedService.propertylistnew().subscribe((response) => {
      if (response['status'] == 'True') {
        this.addedpropertylists = response['Properties'];
      } else {
        this.addedpropertylists = [];
      }
      this.showSpinner = false;
    });
  }

  getCpList(isLoadmore) {
    this.showSpinner = true;
    this.param.limit = isLoadmore ? (this.count += 30) : 1;
    return new Promise((resolve, reject) => {
      this.sharedService.getCPlist(this.param).subscribe((response) => {
        this.ngZone.run(() => {
          this.cpLists = isLoadmore
            ? this.cpLists.concat(response['CPlists'])
            : response['CPlists'];
          this.cpListsCount = response['CPcounts'][0]['counts'];
          this.showSpinner = false;
          resolve(true);
        });
      });
    });
  }

  getMandateRequets() {
    this.sharedService.mandaterequestlists().subscribe((response) => {
      this.mandateRequestLists = response['BuilderLists'];
    });
  }

  getpropertiesbybuilder() {
    this.selectedProperty = null;
    let params = {
      cityid: localStorage.getItem('cityId'),
      builderid: this.selectedBuilder[0].id,
    };
    this.sharedService.getpropertiesbybuilder(params).subscribe((response) => {
      this.propertiesbybuilder = response['Properties'];
    });
  }
  chunkSize = 150;
  filteredBuilderlist;
  getbuilderlist() {
    this.sharedService
      .builderlist(localStorage.getItem('cityId'))
      .subscribe((response) => {
        this.builderlist = response['Builders'];
        this.filteredBuilderlist = this.builderlist.slice(0, this.chunkSize);
      });
  }

  // Customise the primeng filter
  filterData(event: any) {
    const searchTerm = event.filter.toLowerCase();
    if (!searchTerm) {
      this.filteredBuilderlist = this.builderlist.slice(0, this.chunkSize); // Reset to first 50
      return;
    }
    // Search in full data and show all matching results
    this.filteredBuilderlist = this.builderlist.filter((item) =>
      item.name.toLowerCase().includes(searchTerm)
    );
    this.cdr.detectChanges();
  }

  dropdownPanel: HTMLElement | null = null;
  attachScrollListener() {
    setTimeout(() => {
      const dropdownPanel = document.querySelector('.p-dropdown-items-wrapper');
      if (dropdownPanel) {
        this.dropdownPanel = dropdownPanel as HTMLElement;
        this.dropdownPanel.addEventListener('scroll', this.loadMoreData);
      }
    }, 100);
  }

  loadMoreData = () => {
    if (!this.dropdownPanel) return;
    const { scrollTop, scrollHeight, clientHeight } = this.dropdownPanel;
    // Check if user scrolled near the bottom
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      const nextChunk = this.filteredBuilderlist.length + this.chunkSize;
      if (nextChunk <= this.builderlist.length) {
        this.filteredBuilderlist = this.builderlist.slice(0, nextChunk);
      }
    }
  };

  removeKeyboardFocus() {
    setTimeout(() => {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement.tagName === 'INPUT') {
        activeElement.blur(); // Removes focus from the input to prevent keyboard
      }
    }, 50);
  }

  // Remove listener when dropdown closes
  ngOnDestroy() {
    if (this.dropdownPanel) {
      this.dropdownPanel.removeEventListener('scroll', this.loadMoreData);
    }
    this.sharedService.dismissAllOverlays();
  }

  addproperties() {
    const ids = this.selectedProperty?.map((item) => item?.id);
    const comma_separated_data = ids?.join(', ');
    if (ids?.length == 0) {
      Swal.fire({
        title: 'Select Some Properties',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'ok',
      });
    } else {
      var param = {
        builderid: this.selectedBuilder[0].id,
        properties: comma_separated_data,
      };
      this.showSpinner = true;
      this.sharedService.addproperties(param).subscribe(
        (success) => {
          if (success['status'] == 'True') {
            this.showSpinner = false;
            Swal.fire({
              title: 'Successfully Addedd',
              icon: 'success',
              heightAuto: false,
              confirmButtonText: 'OK!',
            }).then((result) => {
              if (result.value) {
                location.reload();
              }
            });
          }
        },
        (err) => {
          console.log('Failed to Update');
        }
      );
    }
  }

  onProperty_CP_request(type) {
    this.count = 0;
    this.resetInfiniteScroll();
    this.route.navigate([], {
      queryParams: {
        type: type,
      },
    });
  }

  loadData(event) {
    if (this.type == 'cp' && this.cpLists.length < Number(this.cpListsCount)) {
      this.getCpList(true).then(() => {
        event.target.complete();
      });
    } else {
      event.target.disabled = true;
    }
  }

  onAddIcon() {
    if (this.type == 'cp') {
      this.addCpModal.present();
    } else if (this.type == 'property') {
      this.addPropertyModal.present();
    }
  }

  addnewcp() {
    if (($('#custname').val() as string).trim() === '') {
      $('#custname')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please Enter Name');
      return false;
    } else {
      $('#custname').removeAttr('style');
    }
    if (($('#contactperson').val() as string).trim() == '') {
      $('#contactperson')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please Enter Person Name');
      return false;
    } else {
      $('#contactperson').removeAttr('style');
    }

    if (($('#custnum').val() as string).trim() == '') {
      $('#custnum')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please Enter Phone Number');
      return false;
    } else {
      var mobilee = /^[0-9]{10}$/;
      if (mobilee.test(String($('#custnum').val()))) {
        $('#custnum').removeAttr('style');
      } else {
        $('#custnum')
          .focus()
          .css('border-color', 'red')
          .attr('placeholder', 'Please enter valid contact number')
          .val('');
        return false;
      }
    }

    if (($('#custmail').val() as string).trim() == '') {
      $('#custmail')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please Enter Email-id');
      return false;
    } else {
      var email = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/;
      if (email.test(String($('#custmail').val()))) {
        $('#custmail').removeAttr('style');
      } else {
        $('#custmail')
          .focus()
          .css('border-color', 'red')
          .attr('placeholder', 'Please enter valid email-id')
          .val('');
        return false;
      }
    }

    if (($('#gstno').val() as string).trim() == '') {
      $('#gstno')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please Enter GST');
      return false;
    } else {
      $('#gstno').removeAttr('style');
    }

    if (($('#rerano').val() as string).trim() == '') {
      $('#rerano')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please Enter Rera');
      return false;
    } else {
      $('#rerano').removeAttr('style');
    }
    var param = {
      cpname: $('#custname').val(),
      person: $('#contactperson').val(),
      cpnumber: $('#custnum').val(),
      cpmail: $('#custmail').val(),
      cpsecondmail: $('#custmailsecondary').val(),
      addeduser: localStorage.getItem('Name'),
      rera: $('#rerano').val(),
      gst: $('#gstno').val(),
    };
    this.showSpinner = true;
    this.sharedService.addcp(param).subscribe((success) => {
      if (success['status'] == 'True') {
        this.showSpinner = false;
        Swal.fire({
          title: 'Successfully Addedd',
          icon: 'success',
          heightAuto: false,
          confirmButtonText: 'OK!',
        }).then((result) => {
          location.reload();
        });
      }
    });
    return true;
  }
  @ViewChild('dropdown', { static: false }) dropdown;

  // loadMoreData = () => {
  //   if (!this.dropdown?.nativeElement) return; // Ensure nativeElement exists

  //   const dropdownElement = this.dropdown.nativeElement;
  //   const { scrollTop, scrollHeight, clientHeight } = dropdownElement;

  //   if (scrollTop + clientHeight >= scrollHeight - 10) {
  //     const nextChunk = this.filteredBuilderlist.length + this.chunkSize;

  //     if (nextChunk <= this.builderlist.length) {
  //       this.filteredBuilderlist = this.builderlist.slice(0, nextChunk);
  //     }
  //   }
  // };

  canScroll;
  @ViewChild('mainscrollContainer', { static: false }) content: IonContent;
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
