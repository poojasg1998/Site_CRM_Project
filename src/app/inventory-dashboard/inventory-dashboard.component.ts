import { Component, OnInit, ViewChild } from '@angular/core';
import { SharedService } from '../shared.service';
import { MenuController } from '@ionic/angular';
import { MandateService } from '../mandate-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { toLower } from 'ionicons/dist/types/components/icon/utils';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-inventory-dashboard',
  templateUrl: './inventory-dashboard.component.html',
  styleUrls: ['./inventory-dashboard.component.scss'],
})
export class InventoryDashboardComponent implements OnInit {
  filteredParams = {
    propid: '',
    towerid: '',
    size: '',
    bhk: '',
    status: '',
    viewtype: '',
  };
  properties;
  selectedProp;
  selectedTower;

  inventoryDashboardCounts;
  towerData: any;
  bhkData: any;
  selectedbhk: any;
  sizeData: any;
  selectedSize: any;
  statusData: any;
  selectedstatus: any;
  inventoryData: any;
  statusListingData: any;
  bhkListingData: any;
  unitListingData: any;
  fullInventoryData: any;
  doreFacingData: any;
  selectedExec: any;
  leadsBasedexecData: any;

  constructor(
    private sharedService: SharedService,
    private menuCtrl: MenuController,
    private mandateService: MandateService,
    private router: Router,
    private activeRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.activeRoute.queryParams.subscribe(() => {
      this.getQueryParams();
      this.getExecutivedata();
      this.getmandateprojects();
      this.getAllCountsOfInventory();
      this.getInventoryDetails();

      setTimeout(() => {
        this.getTowerDetails();
        this.getBHKDetails();
        this.getSizeDetails();
        this.getStatusDetails();
      }, 1000);

      this.getDoreFacingDetails();

      this.getBHKListing();
      this.getStatusListing();
      this.getUnitListing();
    });
  }

  getTowerDetails() {
    this.sharedService
      .getTowerDetails(this.filteredParams.propid)
      .subscribe((resp) => {
        this.towerData = resp['data'];
        this.selectedTower = resp['data']?.filter(
          (item) => item?.tower_IDPK == this.filteredParams.towerid
        );
        this.selectedTower = this.selectedTower[0];
      });
  }

  getBHKDetails() {
    const params = {
      propid: this.filteredParams.propid,
      towerid: this.filteredParams.towerid,
      size: this.filteredParams.size,
      status: this.filteredParams.status,
    };
    this.sharedService.getBHKDetails(params).subscribe((resp) => {
      this.bhkData = resp['data'];
      this.selectedbhk = resp['data']?.filter(
        (item) => item?.bhk_IDFK == this.filteredParams.bhk
      );
      this.selectedbhk = this.selectedbhk[0];
    });
  }

  getSizeDetails() {
    const params = {
      propid: this.filteredParams.propid,
      towerid: this.filteredParams.towerid,
      bhk: this.filteredParams.bhk,
      status: this.filteredParams.status,
    };
    this.sharedService.getSizeDetails(params).subscribe((resp) => {
      this.sizeData = resp['data'];
      this.selectedSize = resp['data']?.filter(
        (item) => item?.unit_size == this.filteredParams.size
      );
      this.selectedSize = this.selectedSize[0];
    });
  }

  getStatusDetails() {
    const params = {
      propid: this.filteredParams.propid,
      towerid: this.filteredParams.towerid,
      size: this.filteredParams.size,
      bhk: this.filteredParams.bhk,
    };
    this.sharedService.getStatusDetails(params).subscribe((resp) => {
      this.statusData = resp['data'];
      this.selectedstatus = resp['data'].filter(
        (item) => item.unitstatus_IDFK == this.filteredParams.status
      );
      this.selectedstatus = this.selectedstatus[0];
    });
  }

  getDoreFacingDetails() {
    this.sharedService.getDoreFacingDetails().subscribe((resp) => {
      this.doreFacingData = resp['data'];
    });
  }

  getBHKListing() {
    this.sharedService.getBHKListing().subscribe((resp) => {
      this.bhkListingData = resp;
    });
  }

  getStatusListing() {
    this.sharedService.getStatusListing().subscribe((resp) => {
      this.statusListingData = resp['data'];
    });
  }

  getUnitListing() {
    const param = {
      propid: this.filteredParams.propid,
      towerid: this.filteredParams.towerid,
      size: this.filteredParams.size,
      status: this.filteredParams.status,
      bhk: this.filteredParams.bhk,
    };
    this.sharedService.getUnitListing(param).subscribe((resp) => {
      this.unitListingData = resp['data'];
    });
  }

  getAllCountsOfInventory() {
    this.sharedService
      .getPropInventoryCount(this.filteredParams.propid)
      .subscribe((resp) => {
        this.inventoryDashboardCounts = resp['counts'];
      });
  }

  getmandateprojects() {
    this.mandateService.getmandateprojects().subscribe((resp) => {
      this.properties = resp['Properties'];
      this.selectedProp = resp['Properties'].filter(
        (item) => item.property_idfk == this.filteredParams.propid
      );
      this.selectedProp = this.selectedProp[0];
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
    this.router
      .navigate([], { queryParams, queryParamsHandling: 'merge' })
      .then(() => {});
  }

  getQueryParams() {
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
  }

  openEndMenu() {
    this.sharedService.isMenuOpen = true;
    this.menuCtrl.open('end');
  }

  toggleTableBlockView(istable) {
    this.filteredParams.bhk = '';
    this.filteredParams.size = '';
    this.filteredParams.status = '';
    this.filteredParams.towerid = '';
    this.filteredParams.viewtype = istable;
    this.addQueryParams();
  }

  ondropdownFilter(data, event) {
    if (data == 'tower') {
      this.filteredParams.bhk = '';
      this.filteredParams.size = '';
      this.filteredParams.status = '';
      this.filteredParams.towerid = event.value.tower_IDPK;
    } else if (data == 'bhk') {
      this.filteredParams.bhk = event.value.bhk_IDFK;
    } else if (data == 'size') {
      this.filteredParams.size = event.value.unit_size;
    } else if (data == 'status') {
      this.filteredParams.status = event.value.unitstatus_IDFK;
    } else if (data == 'property') {
      this.filteredParams.bhk = '';
      this.filteredParams.size = '';
      this.filteredParams.status = '';
      this.filteredParams.towerid = '';
      this.filteredParams.propid = event.value.property_idfk;
    }
    this.addQueryParams();
  }

  getInventoryDetails() {
    const baseParams = {
      propid: this.filteredParams.propid,
      viewtype: this.filteredParams.viewtype,
      size: this.filteredParams.size,
      bhk: this.filteredParams.bhk,
      status: this.filteredParams.status,
    };

    forkJoin({
      withoutTower: this.sharedService.getInventoryDetails(baseParams),
      withTower: this.sharedService.getInventoryDetails({
        ...baseParams,
        towerid: this.filteredParams.towerid,
      }),
    }).subscribe(({ withoutTower, withTower }) => {
      this.fullInventoryData = withoutTower['data'];
      this.inventoryData = withTower['data'];

      if (
        this.filteredParams.towerid == '' &&
        this.filteredParams.viewtype == '2'
      ) {
        this.filteredParams.towerid = this.inventoryData?.[0].towerid; // initialy first block to highlight
      }
      this.selectedFloors = this.inventoryData?.[0]?.floors;
    });
  }

  selectedFloors = [];
  onBlock(data) {
    this.filteredParams.towerid = data.towerid;
    this.selectedFloors = data['floors'];
    this.addQueryParams();
  }

  editToSelectedUnit;
  @ViewChild('editUnitDetailsModal') editUnitDetailsModal;
  onEditInventoryUintDetails(data) {
    this.editToSelectedUnit = data;

    this.showesTheData();
    setTimeout(() => {
      this.getLeadsBasedexec();
      const param = {
        unitid: this.editToSelectedUnit.unit_IDPK,
        leadid: this.editToSelectedUnit.Lead_IDFK,
        execid: this.editToSelectedUnit.Exec_IDFK,
      };

      this.getunithistory(param);
    }, 1000);

    this.editUnitDetailsModal.present();
  }

  showesTheData() {
    this.selectedUnitForEdit = this.unitListingData.filter(
      (element) => element.unit_IDPK == this.editToSelectedUnit.unit_IDPK
    );
    this.selectedUnitForEdit = this.selectedUnitForEdit[0];

    this.selectedBHKForEdit = this.bhkData.filter(
      (element) => element.bhk_IDFK == this.editToSelectedUnit.bhk_IDFK
    );
    this.selectedBHKForEdit = this.selectedBHKForEdit[0];

    this.selectedDoreFacing = this.doreFacingData.filter(
      (element) =>
        element.doorfacing_IDPK === this.editToSelectedUnit.doorfacing_IDFK
    );
    this.selectedDoreFacing = this.selectedDoreFacing[0];

    this.selectedstatus = this.statusData.filter(
      (element) =>
        element.unitstatus_IDFK == this.editToSelectedUnit.unitstatus_IDFK
    );
    this.selectedstatus = this.selectedstatus[0];

    this.selectedExec = this.executiveList.filter(
      (element) => element.name == this.editToSelectedUnit.updated_by
    );

    this.selectedExec = this.selectedExec[0];
  }

  selectedBHKForEdit;
  selectedUnitForEdit;
  selectedDoreFacing;
  isEditUnitStatus = false;
  selectedLeadsBasedexec;
  getLeadsBasedexec() {
    const params = {
      execid: this.selectedExec.id,
      content: '',
    };
    this.sharedService.getLeadsBasedexec(params).subscribe((resp) => {
      this.leadsBasedexecData = resp['leads'];
      this.selectedLeadsBasedexec = this.leadsBasedexecData.filter(
        (element) => element.Lead_IDFK == this.editToSelectedUnit.Lead_IDFK
      );

      this.selectedLeadsBasedexec = this.selectedLeadsBasedexec[0];
    });
  }

  onExecutiveSelect(event) {
    this.getLeadsBasedexec();
  }
  updateUnit() {
    const updateVlues = {
      unitno: this.selectedUnitForEdit.unit_name,
      bhk: this.selectedbhk.bhk_IDFK,
      size: this.editToSelectedUnit.unit_size,
      builtuparea: this.editToSelectedUnit.unit_builtuparea,
      carpetarea: this.editToSelectedUnit.unit_carpetarea,
      sbs: this.editToSelectedUnit.unit_sba,
      uds: this.editToSelectedUnit.unit_uds,
      facing: this.selectedDoreFacing.doorfacing_IDFK,
      status: this.selectedstatus.unitstatus_IDFK,
      balcony: this.editToSelectedUnit.unit_balcony,
      garden: this.editToSelectedUnit.unit_garden,
    };

    const param = {
      propid: this.editToSelectedUnit.property_idfk,
      unitid: this.editToSelectedUnit.unit_IDPK,
      unitdetails: JSON.stringify(updateVlues),
    };

    this.sharedService.updateUnit(param).subscribe((resp) => {
      console.log(resp);
    });
  }

  onBalconyGardenEdit(event, data) {
    if (event.detail.checked == true) {
      this.editToSelectedUnit.unit_balcony =
        data == 'balcony' ? '1' : this.editToSelectedUnit.unit_balcony;
      this.editToSelectedUnit.unit_garden =
        data == 'gardern' ? '1' : this.editToSelectedUnit.unit_garden;
    } else {
      this.editToSelectedUnit.unit_balcony =
        data == 'balcony' ? '0' : this.editToSelectedUnit.unit_balcony;
      this.editToSelectedUnit.unit_garden =
        data == 'gardern' ? '0' : this.editToSelectedUnit.unit_garden;
    }
  }

  // .set('unitid', param.unitid)
  // .set('leadid', param.leadid)
  // .set('execid', param.execid);

  uintHistoryData = [];
  getunithistory(param) {
    this.sharedService.getunithistory(param).subscribe((resp) => {
      this.uintHistoryData = resp['data'];
    });
  }

  saveAndContinue() {
    const param = {
      unitid: '',
      assignid: '',
      userid: '',
      leadid: '',
      propid: '',
      unitstatus: '',
      remarks: '',
      actiondate: '',
      actiontime: '',
      booking_status: '',
    };
  }
  executiveList;
  getExecutivedata() {
    this.mandateService
      .fetchmandateexecutives(this.filteredParams.propid, '')
      .subscribe((resp) => {
        this.executiveList = resp['mandateexecutives'];
      });
  }
  login() {}
  setCustomValidity(event) {
    const input = event.target;

    const files = input.files;
    const maxSize = 1110000; // 1.11 MB
    if (input.validity.patternMismatch) {
      input.setCustomValidity('Only numbers are valid');
    } else if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        if (files[i].size > maxSize) {
          input.setCustomValidity(`File "${files[i].name}" exceeds 1.11MB`);
          return;
        }
      }
    } else {
      input.setCustomValidity('');
    }
  }
  selectedFileName = '';
  uploads = [];
  closurefiles = [];
  onFileSelected(event: any) {
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = file.name;
      this.selectedFileName = fileName;
      $('#customFile' + i)
        .siblings('.file-label-' + i)
        .addClass('selected')
        .html(fileName);
      // Push the file to closurefiles and read the file
      this.closurefiles.push(file);
      const reader = new FileReader();
      reader.onload = (event: any) => {
        this.uploads.push(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(i) {
    this.uploads.splice(i, 1);
    this.closurefiles.splice(i, 1);
    if (this.uploads.length == 0) {
      $('#customFile' + i).val('');
      $('.file-label-' + i).html('Choose file ');
      this.selectedFileName = '';
    } else {
    }
  }

  onUnitStatusEdit() {
    this.editToSelectedUnit = this.inventoryData.filter(
      (item) => item.unit_IDPK == this.selectedUnitForEdit.unitstatus_IDFK
    );

    this.editToSelectedUnit = this.editToSelectedUnit[0];

    setTimeout(() => {
      this.showesTheData();
    });

    this.sharedService
      .getSingleUnit(this.selectedUnitForEdit.unitstatus_IDFK)
      .subscribe((resp) => {
        console.log(resp);
      });
  }
}
