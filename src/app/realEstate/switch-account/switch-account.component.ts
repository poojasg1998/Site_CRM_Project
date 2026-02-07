import { Component, OnInit, ViewChild } from '@angular/core';
import { MandateService } from '../mandate-service.service';
import { SharedService } from '../shared.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthServiceService } from '../auth-service.service';

@Component({
  selector: 'app-switch-account',
  templateUrl: './switch-account.component.html',
  styleUrls: ['./switch-account.component.scss'],
})
export class SwitchAccountComponent implements OnInit {
  @ViewChild('switchAccountModal') switchAccountModal;
  executiveNames;
  selectedAcc;
  showSpinner: any = false;
  constructor(
    private sharedService: SharedService,
    private router: Router,
    private authService: AuthServiceService
  ) {}

  ngOnInit() {
    // if (localStorage.getItem('mainAccount')) {
    //   Swal.fire({
    //     title: 'Switching back to Admin account',
    //     text: 'Do you want to proceed?',
    //     icon: 'warning',
    //     heightAuto: false,
    //     confirmButtonText: 'Ok',
    //   }).then(() => {
    //     this.selectedAcc = JSON.parse(localStorage.getItem('mainAccount'));
    //     this.onSwitch_acc();
    //   });
    // }
    this.showSpinner = true;
    this.fetchmandateexecutives();
  }

  fetchmandateexecutives() {
    this.sharedService.getallactiveexec().subscribe((response) => {
      this.executiveNames = response['Executives'];
      this.showSpinner = false;
    });
  }

  onSwitch_acc() {
    const mainAcc = this.executiveNames.filter((item) => {
      return (
        item.executives_FKID == localStorage.getItem('UserId') &&
        item.number == localStorage.getItem('Number')
      );
    });
    localStorage.setItem('mainAccount', JSON.stringify(mainAcc));
    localStorage.setItem('Name', this.selectedAcc.name);
    localStorage.setItem('UserId', this.selectedAcc.executives_FKID);
    localStorage.setItem('Password', this.selectedAcc.password);
    localStorage.setItem('Mail', this.selectedAcc.email);
    localStorage.setItem('Role', this.selectedAcc.role_IDFK);
    localStorage.setItem('Number', this.selectedAcc.number);
    localStorage.setItem('prop_suggestion', this.selectedAcc.prop_suggestion);
    localStorage.setItem('Department', this.selectedAcc.department_IDFK);
    localStorage.setItem('PropertyId', this.selectedAcc.mandate_propidfk);
    localStorage.setItem('RoleType', this.selectedAcc.role_type);
    localStorage.setItem('direct_inhouse', this.selectedAcc.direct_inhouse);

    if (this.selectedAcc.mandate_propidfk === '28773') {
      localStorage.setItem('ranavPropId', '28773');
    }
    setTimeout(() => {
      this.sharedService.notifyAccountChanged();
    }, 1000);

    this.showSpinner = true;
    this.switchAccountModal.dismiss();
    this.authService.login();
  }
}
