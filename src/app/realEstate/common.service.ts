import { Injectable } from '@angular/core';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  isLiveCall = true;

  constructor(private sharedService: SharedService) {}

  checkLiveCalls() {
    this.sharedService
      .fetchLiveCall(localStorage.getItem('UserId'))
      .subscribe((response) => {
        if (response['status'] == 'success') {
          this.isLiveCall = true;
        } else {
          this.isLiveCall = false;
        }
        return response['success'];
      });
  }
}
